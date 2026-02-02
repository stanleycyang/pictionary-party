import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { HomeScreen } from './screens/HomeScreen';
import { CreateRoomScreen } from './screens/CreateRoomScreen';
import { JoinRoomScreen } from './screens/JoinRoomScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { MultiplayerGameScreen } from './screens/MultiplayerGameScreen';
import { useMultiplayer } from './hooks/useMultiplayer';
import { isSupabaseConfigured } from './lib/supabase';

// Word list for the game
const WORDS = [
  'cat', 'dog', 'house', 'tree', 'car', 'sun', 'moon', 'star', 'fish', 'bird',
  'elephant', 'giraffe', 'pizza', 'guitar', 'rocket', 'beach', 'castle', 'robot',
  'dragon', 'unicorn', 'ninja', 'pirate', 'dinosaur', 'butterfly', 'rainbow',
  'volcano', 'submarine', 'helicopter', 'telescope', 'skateboard', 'snowman',
];

type Screen = 'home' | 'create' | 'join' | 'lobby' | 'game';

interface MultiplayerAppProps {
  onPlayLocal: () => void;
}

export const MultiplayerApp: React.FC<MultiplayerAppProps> = ({ onPlayLocal }) => {
  const [screen, setScreen] = useState<Screen>('home');
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [currentWord, setCurrentWord] = useState<string | null>(null);

  const {
    room,
    players,
    currentPlayer,
    isConnected,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    toggleReady,
    joinTeam,
    startGame,
    tagTeam,
    sendEvent,
    sendDrawing,
    sendChat,
  } = useMultiplayer();

  // Timer effect
  useEffect(() => {
    if (room?.status !== 'playing') return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Round ended
          sendEvent({ type: 'round_ended', result: {
            round: room.current_round,
            word: currentWord || '',
            drawing_team: room.drawing_team,
            guessing_team: room.drawing_team === 1 ? 2 : 1,
            guessed_by: null,
            time_taken: null,
            points_awarded: 0,
          }});
          return 60; // Reset for next round
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [room?.status, room?.current_round]);

  // Handle game start
  useEffect(() => {
    if (room?.status === 'playing' && currentPlayer?.is_drawing) {
      // Pick a random word for the drawer
      const word = WORDS[Math.floor(Math.random() * WORDS.length)];
      setCurrentWord(word);
      setTimeRemaining(room.settings.timer_seconds);
    }
  }, [room?.status, room?.current_round, currentPlayer?.is_drawing]);

  // Show error
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  // Navigate to home when leaving room
  useEffect(() => {
    if (!room && screen !== 'home' && screen !== 'create' && screen !== 'join') {
      setScreen('home');
    }
  }, [room, screen]);

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
            setScreen('home');
          }
        },
      ]
    );
  }, [leaveRoom]);

  // Handle start game (host only)
  const handleStartGame = useCallback(() => {
    // Assign first drawer for each team
    const team1Players = players.filter(p => p.team === 1);
    const team2Players = players.filter(p => p.team === 2);
    
    if (team1Players.length > 0) {
      sendEvent({ type: 'tag_team', new_drawer_id: team1Players[0].id });
    }
    
    startGame();
    setScreen('game');
  }, [players, sendEvent, startGame]);

  // Render current screen
  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return (
          <HomeScreen
            onCreateRoom={() => setScreen('create')}
            onJoinRoom={() => setScreen('join')}
            onLocalPlay={onPlayLocal}
          />
        );

      case 'create':
        return (
          <CreateRoomScreen
            onCreateRoom={handleCreateRoom}
            onBack={() => setScreen('home')}
            onRoomCreated={() => setScreen('lobby')}
          />
        );

      case 'join':
        return (
          <JoinRoomScreen
            onJoinRoom={handleJoinRoom}
            onBack={() => setScreen('home')}
            onJoined={() => setScreen('lobby')}
          />
        );

      case 'lobby':
        if (!room || !currentPlayer) {
          setScreen('home');
          return null;
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
          setScreen('home');
          return null;
        }
        return (
          <MultiplayerGameScreen
            room={room}
            players={players}
            currentPlayer={currentPlayer}
            messages={[]} // TODO: Connect to game store messages
            word={currentWord}
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

  return <View style={styles.container}>{renderScreen()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MultiplayerApp;
