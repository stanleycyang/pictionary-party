import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Animated, Easing, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { HomeScreen } from './screens/HomeScreen';
import { CreateRoomScreen } from './screens/CreateRoomScreen';
import { JoinRoomScreen } from './screens/JoinRoomScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { MultiplayerGameScreen } from './screens/MultiplayerGameScreen';
import { useMultiplayer, getSavedSession, clearSession } from './hooks/useMultiplayer';
import { isSupabaseConfigured } from './lib/supabase';

type Screen = 'home' | 'create' | 'join' | 'lobby' | 'game';

interface MultiplayerAppProps {
  onPlayLocal: () => void;
}

export const MultiplayerApp: React.FC<MultiplayerAppProps> = ({ onPlayLocal }) => {
  const [screen, setScreen] = useState<Screen>('home');
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isRestoring, setIsRestoring] = useState(true);
  const [joinTimeout, setJoinTimeout] = useState<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Screen transition animation
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const {
    room,
    players,
    currentPlayer,
    isConnected,
    error,
    drawings,
    messages,
    createRoom,
    joinRoom,
    leaveRoom,
    toggleReady,
    joinTeam,
    startGame,
    tagTeam,
    endRound,
    sendEvent,
    sendDrawing,
    sendChat,
  } = useMultiplayer();

  // Check for saved session on mount and offer to rejoin
  useEffect(() => {
    const checkSavedSession = async () => {
      try {
        const savedSession = await getSavedSession();
        
        if (savedSession && isSupabaseConfigured()) {
          // Found a saved session - ask if they want to rejoin
          Alert.alert(
            'Rejoin Game?',
            `You were in a game with room code: ${savedSession.roomCode}\n\nWould you like to rejoin?`,
            [
              {
                text: 'No, Start Fresh',
                style: 'cancel',
                onPress: async () => {
                  await clearSession();
                  setIsRestoring(false);
                },
              },
              {
                text: 'Rejoin',
                onPress: async () => {
                  const success = await joinRoom(savedSession.roomCode, savedSession.playerName);
                  if (success) {
                    setScreen('lobby');
                  } else {
                    // Room no longer exists
                    Alert.alert(
                      'Room Not Found',
                      'The game session has ended. Starting fresh.',
                      [{ text: 'OK' }]
                    );
                    await clearSession();
                  }
                  setIsRestoring(false);
                },
              },
            ]
          );
        } else {
          setIsRestoring(false);
        }
      } catch (e) {
        console.error('Failed to check saved session:', e);
        setIsRestoring(false);
      }
    };
    
    checkSavedSession();
  }, [joinRoom]);

  // Animate screen transitions
  const transitionTo = useCallback((newScreen: Screen) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setScreen(newScreen);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [fadeAnim]);

  // Timer effect - synced with room state
  useEffect(() => {
    if (room?.status !== 'playing') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Calculate time from round start
    if (room.round_start_time) {
      const startTime = new Date(room.round_start_time).getTime();
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, room.settings.timer_seconds - elapsed);
      setTimeRemaining(remaining);
    } else {
      setTimeRemaining(room.settings.timer_seconds);
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Round ended - host handles transition
          if (currentPlayer?.is_host) {
            endRound();
          }
          return room.settings.timer_seconds; // Reset for next round
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [room?.status, room?.round_start_time, room?.current_round, currentPlayer?.is_host, endRound]);

  // Show error
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  // Auto-navigate based on room state
  useEffect(() => {
    if (room?.status === 'playing' && screen === 'lobby') {
      transitionTo('game');
    }
    // Note: Don't auto-navigate to home when room is null - 
    // the lobby screen now shows a loading state while waiting for room sync
  }, [room?.status, screen, transitionTo]);
  
  // Timeout for joining room - if no response from host after 15 seconds
  useEffect(() => {
    if (screen === 'lobby' && !room) {
      const timeout = setTimeout(() => {
        Alert.alert(
          'Connection Timeout',
          'Could not connect to the room. The room may no longer exist.',
          [{
            text: 'OK',
            onPress: () => {
              leaveRoom();
              transitionTo('home');
            }
          }]
        );
      }, 15000); // 15 second timeout
      
      setJoinTimeout(timeout);
      
      return () => clearTimeout(timeout);
    } else if (joinTimeout && room) {
      // Room received, clear timeout
      clearTimeout(joinTimeout);
      setJoinTimeout(null);
    }
  }, [screen, room, leaveRoom, transitionTo]);

  // Handle room creation
  const handleCreateRoom = useCallback(async (playerName: string) => {
    if (!isSupabaseConfigured()) {
      Alert.alert(
        'Setup Required',
        'Multiplayer requires Supabase configuration. Please add your Supabase URL and anon key to the environment.',
        [{ text: 'OK' }]
      );
      return null;
    }
    return await createRoom(playerName);
  }, [createRoom]);

  // Handle room join
  const handleJoinRoom = useCallback(async (code: string, playerName: string) => {
    if (!isSupabaseConfigured()) {
      Alert.alert(
        'Setup Required', 
        'Multiplayer requires Supabase configuration.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return await joinRoom(code, playerName);
  }, [joinRoom]);

  // Handle leave with confirmation
  const handleLeave = useCallback(() => {
    Alert.alert(
      'Leave Game',
      'Are you sure you want to leave?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: () => {
            leaveRoom();
            transitionTo('home');
          }
        },
      ]
    );
  }, [leaveRoom, transitionTo]);

  // Handle start game (host only)
  const handleStartGame = useCallback(() => {
    startGame();
    transitionTo('game');
  }, [startGame, transitionTo]);

  // Render current screen
  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return (
          <HomeScreen
            onCreateRoom={() => transitionTo('create')}
            onJoinRoom={() => transitionTo('join')}
            onLocalPlay={onPlayLocal}
          />
        );

      case 'create':
        return (
          <CreateRoomScreen
            onCreateRoom={handleCreateRoom}
            onBack={() => transitionTo('home')}
            onRoomCreated={() => transitionTo('lobby')}
          />
        );

      case 'join':
        return (
          <JoinRoomScreen
            onJoinRoom={handleJoinRoom}
            onBack={() => transitionTo('home')}
            onJoined={() => transitionTo('lobby')}
          />
        );

      case 'lobby':
        // Show loading while waiting for room state from host
        if (!room || !currentPlayer) {
          return (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFE66D" />
              <Text style={styles.loadingText}>Joining room...</Text>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  leaveRoom();
                  transitionTo('home');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          );
        }
        return (
          <LobbyScreen
            room={room}
            players={players}
            currentPlayer={currentPlayer}
            onJoinTeam={joinTeam}
            onToggleReady={toggleReady}
            onStartGame={handleStartGame}
            onLeave={handleLeave}
          />
        );

      case 'game':
        if (!room || !currentPlayer) {
          transitionTo('home');
          return null;
        }
        return (
          <MultiplayerGameScreen
            room={room}
            players={players}
            currentPlayer={currentPlayer}
            messages={messages}
            drawings={drawings}
            word={room.current_word}
            timeRemaining={timeRemaining}
            onSendDrawing={sendDrawing}
            onSendChat={sendChat}
            onTagTeam={tagTeam}
            onLeave={handleLeave}
          />
        );

      default:
        return null;
    }
  };

  // Show loading while checking for saved session
  if (isRestoring) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFE66D" />
        <Text style={styles.loadingText}>Checking for saved game...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {renderScreen()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#6B4EE6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MultiplayerApp;
