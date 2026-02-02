import { useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, generateRoomCode, generatePlayerId, isSupabaseConfigured } from '../lib/supabase';
import { useGameStore } from '../lib/gameStore';
import { Player, Room, RoomSettings, DrawingEvent, RoomEvent, ChatMessage } from '../types/multiplayer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_SETTINGS: RoomSettings = {
  timer_seconds: 60,
  difficulty: 'medium',
  max_players: 8,
  allow_tag_team: true,
};

export const useMultiplayer = () => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const playerIdRef = useRef<string | null>(null);
  
  const {
    room,
    players,
    currentPlayer,
    isConnected,
    error,
    setRoom,
    setPlayers,
    addPlayer,
    removePlayer,
    updatePlayer,
    setCurrentPlayer,
    addDrawing,
    clearDrawings,
    undoLastDrawing,
    addMessage,
    setConnected,
    setError,
    reset,
  } = useGameStore();

  // Initialize player ID on mount
  useEffect(() => {
    const initPlayerId = async () => {
      let playerId = await AsyncStorage.getItem('playerId');
      if (!playerId) {
        playerId = generatePlayerId();
        await AsyncStorage.setItem('playerId', playerId);
      }
      playerIdRef.current = playerId;
    };
    initPlayerId();
  }, []);

  // Clean up channel on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  // Create a new room
  const createRoom = useCallback(async (playerName: string): Promise<string | null> => {
    if (!isSupabaseConfigured()) {
      setError('Supabase not configured. Please add credentials.');
      return null;
    }

    try {
      const code = generateRoomCode();
      const playerId = playerIdRef.current || generatePlayerId();
      
      const newRoom: Room = {
        id: `room_${Date.now()}`,
        code,
        host_id: playerId,
        status: 'lobby',
        settings: DEFAULT_SETTINGS,
        current_round: 0,
        total_rounds: 10,
        current_word: null,
        drawing_team: 1,
        round_start_time: null,
        created_at: new Date().toISOString(),
      };

      const hostPlayer: Player = {
        id: playerId,
        name: playerName,
        room_id: newRoom.id,
        team: null,
        is_drawing: false,
        score: 0,
        is_ready: false,
        is_host: true,
        connected_at: new Date().toISOString(),
      };

      setRoom(newRoom);
      setCurrentPlayer(hostPlayer);
      setPlayers([hostPlayer]);
      
      // Join realtime channel
      await joinChannel(code, hostPlayer);
      
      return code;
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
      return null;
    }
  }, [setRoom, setCurrentPlayer, setPlayers, setError]);

  // Join an existing room
  const joinRoom = useCallback(async (code: string, playerName: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      setError('Supabase not configured. Please add credentials.');
      return false;
    }

    try {
      const playerId = playerIdRef.current || generatePlayerId();
      
      const newPlayer: Player = {
        id: playerId,
        name: playerName,
        room_id: null, // Will be set when we receive room state
        team: null,
        is_drawing: false,
        score: 0,
        is_ready: false,
        is_host: false,
        connected_at: new Date().toISOString(),
      };

      setCurrentPlayer(newPlayer);
      
      // Join realtime channel
      const success = await joinChannel(code.toUpperCase(), newPlayer);
      return success;
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
      return false;
    }
  }, [setCurrentPlayer, setError]);

  // Join realtime channel
  const joinChannel = useCallback(async (roomCode: string, player: Player): Promise<boolean> => {
    try {
      // Clean up existing channel
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
      }

      const channel = supabase.channel(`room:${roomCode}`, {
        config: {
          presence: { key: player.id },
          broadcast: { self: true },
        },
      });

      // Handle presence sync (who's online)
      channel.on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const onlinePlayers: Player[] = [];
        
        Object.entries(presenceState).forEach(([key, value]) => {
          const presence = value[0] as any;
          if (presence?.player) {
            onlinePlayers.push(presence.player);
          }
        });
        
        setPlayers(onlinePlayers);
      });

      // Handle player join
      channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const presence = newPresences[0] as any;
        if (presence?.player) {
          addPlayer(presence.player);
        }
      });

      // Handle player leave
      channel.on('presence', { event: 'leave' }, ({ key }) => {
        removePlayer(key);
      });

      // Handle broadcast events
      channel.on('broadcast', { event: 'room_event' }, ({ payload }) => {
        handleRoomEvent(payload as RoomEvent);
      });

      // Handle drawing events (high frequency)
      channel.on('broadcast', { event: 'drawing' }, ({ payload }) => {
        handleDrawingEvent(payload as DrawingEvent);
      });

      // Subscribe to channel
      const status = await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track presence
          await channel.track({ player });
          setConnected(true);
          
          // If joining, request current room state
          if (!player.is_host) {
            channel.send({
              type: 'broadcast',
              event: 'room_event',
              payload: { type: 'request_state', player_id: player.id },
            });
          }
        }
      });

      channelRef.current = channel;
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to connect');
      return false;
    }
  }, [setPlayers, addPlayer, removePlayer, setConnected, setError]);

  // Handle room events
  const handleRoomEvent = useCallback((event: RoomEvent) => {
    switch (event.type) {
      case 'player_joined':
        addPlayer(event.player);
        break;
      case 'player_left':
        removePlayer(event.player_id);
        break;
      case 'player_ready':
        updatePlayer(event.player_id, { is_ready: event.is_ready });
        break;
      case 'game_started':
        useGameStore.getState().startGame();
        break;
      case 'round_started':
        setRoom(room ? { 
          ...room, 
          current_round: event.round, 
          drawing_team: event.drawing_team,
          current_word: event.word || null,
          round_start_time: new Date().toISOString(),
        } : null);
        clearDrawings();
        break;
      case 'tag_team':
        players.forEach(p => {
          updatePlayer(p.id, { is_drawing: p.id === event.new_drawer_id });
        });
        break;
      case 'correct_guess':
        // Update score
        const guesser = players.find(p => p.id === event.player_id);
        if (guesser) {
          updatePlayer(guesser.id, { score: guesser.score + event.points });
        }
        break;
      case 'round_ended':
        // Handle round end
        break;
      case 'game_ended':
        useGameStore.getState().endGame();
        break;
      case 'chat':
        addMessage(event.message);
        break;
    }
  }, [room, players, addPlayer, removePlayer, updatePlayer, setRoom, clearDrawings, addMessage]);

  // Handle drawing events
  const handleDrawingEvent = useCallback((event: DrawingEvent) => {
    // Don't process own events
    if (event.player_id === currentPlayer?.id) return;
    
    switch (event.type) {
      case 'clear':
        clearDrawings();
        break;
      case 'undo':
        undoLastDrawing();
        break;
      // For start/move/end, the drawing component handles reconstruction
    }
  }, [currentPlayer, clearDrawings, undoLastDrawing]);

  // Send a room event
  const sendEvent = useCallback((event: Record<string, any>) => {
    if (!channelRef.current) return;
    
    channelRef.current.send({
      type: 'broadcast',
      event: 'room_event',
      payload: event,
    });
  }, []);

  // Send drawing data
  const sendDrawing = useCallback((event: Omit<DrawingEvent, 'player_id'>) => {
    if (!channelRef.current || !currentPlayer) return;
    
    channelRef.current.send({
      type: 'broadcast',
      event: 'drawing',
      payload: { ...event, player_id: currentPlayer.id },
    });
  }, [currentPlayer]);

  // Send chat message
  const sendChat = useCallback((text: string) => {
    if (!channelRef.current || !currentPlayer || !room) return;
    
    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      room_id: room.id,
      player_id: currentPlayer.id,
      player_name: currentPlayer.name,
      text,
      is_correct_guess: false,
      timestamp: new Date().toISOString(),
    };
    
    sendEvent({ type: 'chat', message });
    addMessage(message);
  }, [currentPlayer, room, sendEvent, addMessage]);

  // Toggle ready state
  const toggleReady = useCallback(() => {
    if (!currentPlayer) return;
    
    const newReady = !currentPlayer.is_ready;
    updatePlayer(currentPlayer.id, { is_ready: newReady });
    setCurrentPlayer({ ...currentPlayer, is_ready: newReady });
    sendEvent({ type: 'player_ready', player_id: currentPlayer.id, is_ready: newReady });
  }, [currentPlayer, updatePlayer, setCurrentPlayer, sendEvent]);

  // Join a team
  const joinTeam = useCallback((team: 1 | 2) => {
    if (!currentPlayer) return;
    
    updatePlayer(currentPlayer.id, { team });
    setCurrentPlayer({ ...currentPlayer, team });
    
    // Update presence
    if (channelRef.current) {
      channelRef.current.track({ player: { ...currentPlayer, team } });
    }
  }, [currentPlayer, updatePlayer, setCurrentPlayer]);

  // Start game (host only)
  const startGame = useCallback(() => {
    if (!currentPlayer?.is_host || !room) return;
    
    sendEvent({ type: 'game_started' });
    useGameStore.getState().startGame();
  }, [currentPlayer, room, sendEvent]);

  // Tag team (pass drawing to teammate)
  const tagTeam = useCallback((newDrawerId: string) => {
    if (!currentPlayer?.is_drawing) return;
    
    sendEvent({ type: 'tag_team', new_drawer_id: newDrawerId });
    updatePlayer(currentPlayer.id, { is_drawing: false });
    updatePlayer(newDrawerId, { is_drawing: true });
  }, [currentPlayer, sendEvent, updatePlayer]);

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    reset();
  }, [reset]);

  return {
    // State
    room,
    players,
    currentPlayer,
    isConnected,
    error,
    
    // Room actions
    createRoom,
    joinRoom,
    leaveRoom,
    
    // Player actions
    toggleReady,
    joinTeam,
    
    // Game actions
    startGame,
    tagTeam,
    
    // Communication
    sendEvent,
    sendDrawing,
    sendChat,
  };
};

export default useMultiplayer;
