import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Player, Room, DrawingEvent, ChatMessage } from '../types/multiplayer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_SIZE = SCREEN_WIDTH - 32;

interface Point {
  x: number;
  y: number;
}

interface DrawingPath {
  id: string;
  points: Point[];
  color: string;
  brushSize: number;
}

interface MultiplayerGameScreenProps {
  room: Room;
  players: Player[];
  currentPlayer: Player | null;
  messages: ChatMessage[];
  word: string | null; // Only shown to drawer
  timeRemaining: number;
  onSendDrawing: (event: Omit<DrawingEvent, 'player_id'>) => void;
  onSendChat: (text: string) => void;
  onTagTeam: (playerId: string) => void;
  onLeave: () => void;
}

const COLORS = [
  '#000000', '#FF0000', '#00AA00', '#0000FF',
  '#FFA500', '#800080', '#00CED1', '#A52A2A',
];
const BRUSH_SIZES = [4, 8, 12, 20];

export const MultiplayerGameScreen: React.FC<MultiplayerGameScreenProps> = ({
  room,
  players,
  currentPlayer,
  messages,
  word,
  timeRemaining,
  onSendDrawing,
  onSendChat,
  onTagTeam,
  onLeave,
}) => {
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1]);
  const [chatInput, setChatInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const isDrawing = currentPlayer?.is_drawing;
  const drawingTeam = room.drawing_team;
  const myTeam = currentPlayer?.team;
  const isGuessingTeam = myTeam && myTeam !== drawingTeam;

  const team1Players = players.filter(p => p.team === 1);
  const team2Players = players.filter(p => p.team === 2);
  const currentDrawer = players.find(p => p.is_drawing);
  const teammates = players.filter(
    p => p.team === currentPlayer?.team && p.id !== currentPlayer?.id
  );

  // Handle touch start
  const handleTouchStart = useCallback((event: any) => {
    if (!isDrawing) return;

    const touch = event.nativeEvent;
    const x = touch.locationX;
    const y = touch.locationY;

    const newPath: DrawingPath = {
      id: `path_${Date.now()}`,
      points: [{ x, y }],
      color: selectedColor,
      brushSize,
    };

    setCurrentPath(newPath);
    onSendDrawing({
      type: 'start',
      x,
      y,
      color: selectedColor,
      brushSize,
      timestamp: Date.now(),
    });
  }, [isDrawing, selectedColor, brushSize, onSendDrawing]);

  // Handle touch move
  const handleTouchMove = useCallback((event: any) => {
    if (!isDrawing || !currentPath) return;

    const touch = event.nativeEvent;
    const x = touch.locationX;
    const y = touch.locationY;

    setCurrentPath(prev => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, { x, y }],
      };
    });

    onSendDrawing({
      type: 'move',
      x,
      y,
      color: selectedColor,
      brushSize,
      timestamp: Date.now(),
    });
  }, [isDrawing, currentPath, selectedColor, brushSize, onSendDrawing]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!isDrawing || !currentPath) return;

    setPaths(prev => [...prev, currentPath]);
    setCurrentPath(null);

    onSendDrawing({
      type: 'end',
      color: selectedColor,
      brushSize,
      timestamp: Date.now(),
    });
  }, [isDrawing, currentPath, selectedColor, brushSize, onSendDrawing]);

  // Clear canvas
  const handleClear = useCallback(() => {
    setPaths([]);
    setCurrentPath(null);
    onSendDrawing({
      type: 'clear',
      color: selectedColor,
      brushSize,
      timestamp: Date.now(),
    });
  }, [onSendDrawing, selectedColor, brushSize]);

  // Undo last stroke
  const handleUndo = useCallback(() => {
    setPaths(prev => prev.slice(0, -1));
    onSendDrawing({
      type: 'undo',
      color: selectedColor,
      brushSize,
      timestamp: Date.now(),
    });
  }, [onSendDrawing, selectedColor, brushSize]);

  // Send chat message
  const handleSendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    onSendChat(chatInput.trim());
    setChatInput('');
  }, [chatInput, onSendChat]);

  // Auto-scroll chat
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Convert points to SVG path
  const pointsToPath = (points: Point[]): string => {
    if (points.length === 0) return '';
    const [first, ...rest] = points;
    let d = `M ${first.x} ${first.y}`;
    for (const point of rest) {
      d += ` L ${point.x} ${point.y}`;
    }
    return d;
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.teamScores}>
            <Text style={[styles.score, styles.team1Score]}>
              🔵 {team1Players.reduce((sum, p) => sum + p.score, 0)}
            </Text>
            <Text style={styles.vs}>vs</Text>
            <Text style={[styles.score, styles.team2Score]}>
              {team2Players.reduce((sum, p) => sum + p.score, 0)} 🔴
            </Text>
          </View>
          <View style={styles.timer}>
            <Text style={[
              styles.timerText,
              timeRemaining <= 10 && styles.timerWarning,
            ]}>
              ⏱️ {formatTime(timeRemaining)}
            </Text>
          </View>
        </View>

        {/* Word/Status Bar */}
        <View style={styles.statusBar}>
          {isDrawing ? (
            <View style={styles.wordContainer}>
              <Text style={styles.wordLabel}>Draw:</Text>
              <Text style={styles.word}>{word || '???'}</Text>
            </View>
          ) : (
            <Text style={styles.statusText}>
              {currentDrawer?.name || 'Someone'} is drawing...
              {isGuessingTeam && ' 🎯 Guess!'}
            </Text>
          )}
        </View>

        {/* Canvas */}
        <View style={styles.canvasContainer}>
          <View
            style={styles.canvas}
            onStartShouldSetResponder={() => !!isDrawing}
            onMoveShouldSetResponder={() => !!isDrawing}
            onResponderGrant={handleTouchStart}
            onResponderMove={handleTouchMove}
            onResponderRelease={handleTouchEnd}
          >
            <Svg width={CANVAS_SIZE} height={CANVAS_SIZE}>
              {paths.map(path => (
                <Path
                  key={path.id}
                  d={pointsToPath(path.points)}
                  stroke={path.color}
                  strokeWidth={path.brushSize}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {currentPath && (
                <Path
                  d={pointsToPath(currentPath.points)}
                  stroke={currentPath.color}
                  strokeWidth={currentPath.brushSize}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </Svg>
          </View>
        </View>

        {/* Drawing Tools (only for drawer) */}
        {isDrawing && (
          <View style={styles.tools}>
            <View style={styles.colorPicker}>
              {COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColor,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
            <View style={styles.brushPicker}>
              {BRUSH_SIZES.map(size => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.brushButton,
                    brushSize === size && styles.selectedBrush,
                  ]}
                  onPress={() => setBrushSize(size)}
                >
                  <View style={[styles.brushPreview, { width: size, height: size }]} />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleUndo}>
                <Text style={styles.actionText}>↩️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleClear}>
                <Text style={styles.actionText}>🗑️</Text>
              </TouchableOpacity>
            </View>

            {/* Tag Team Button */}
            {room.settings.allow_tag_team && teammates.length > 0 && (
              <View style={styles.tagTeam}>
                <Text style={styles.tagTeamLabel}>Tag teammate:</Text>
                <View style={styles.tagTeamButtons}>
                  {teammates.map(teammate => (
                    <TouchableOpacity
                      key={teammate.id}
                      style={styles.tagTeamButton}
                      onPress={() => onTagTeam(teammate.id)}
                    >
                      <Text style={styles.tagTeamName}>{teammate.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Chat (for guessing team) */}
        {isGuessingTeam && (
          <View style={styles.chatContainer}>
            <ScrollView
              ref={scrollRef}
              style={styles.chatMessages}
              contentContainerStyle={styles.chatContent}
            >
              {messages.map(msg => (
                <View
                  key={msg.id}
                  style={[
                    styles.message,
                    msg.is_correct_guess && styles.correctMessage,
                  ]}
                >
                  <Text style={styles.messageAuthor}>{msg.player_name}:</Text>
                  <Text style={styles.messageText}>{msg.text}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.chatInput}>
              <TextInput
                style={styles.input}
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Type your guess..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                returnKeyType="send"
                onSubmitEditing={handleSendChat}
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSendChat}>
                <Text style={styles.sendText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6B4EE6',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  teamScores: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  team1Score: {
    color: '#4ECDC4',
  },
  team2Score: {
    color: '#FF6B6B',
  },
  vs: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  timer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  timerWarning: {
    color: '#FF6B6B',
  },
  statusBar: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 12,
    alignItems: 'center',
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  word: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFE66D',
  },
  statusText: {
    fontSize: 16,
    color: '#fff',
  },
  canvasContainer: {
    padding: 16,
    alignItems: 'center',
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tools: {
    padding: 12,
    gap: 12,
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#FFE66D',
    transform: [{ scale: 1.2 }],
  },
  brushPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  brushButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBrush: {
    backgroundColor: '#FFE66D',
  },
  brushPreview: {
    backgroundColor: '#000',
    borderRadius: 100,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 24,
  },
  tagTeam: {
    alignItems: 'center',
    gap: 8,
  },
  tagTeamLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  tagTeamButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  tagTeamButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  tagTeamName: {
    color: '#fff',
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
    padding: 12,
  },
  chatMessages: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    marginBottom: 8,
  },
  chatContent: {
    padding: 8,
  },
  message: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  correctMessage: {
    backgroundColor: '#4ECDC4',
    padding: 4,
    borderRadius: 4,
  },
  messageAuthor: {
    fontWeight: 'bold',
    color: '#FFE66D',
  },
  messageText: {
    color: '#fff',
  },
  chatInput: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#fff',
  },
  sendButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MultiplayerGameScreen;
