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
  Animated,
  Easing,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Player, Room, DrawingEvent, ChatMessage, DrawingPath } from '../types/multiplayer';

// Word Reveal Modal for Multiplayer
interface WordRevealModalProps {
  visible: boolean;
  word: string;
  countdown: number;
  teamEmoji: string;
  teamName: string;
  teamBgColor: string;
}

const WordRevealModal: React.FC<WordRevealModalProps> = ({
  visible,
  word,
  countdown,
  teamEmoji,
  teamName,
  teamBgColor,
}) => {
  const cardScale = useRef(new Animated.Value(0.8)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const countdownScale = useRef(new Animated.Value(1)).current;
  const wordBounce = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (visible) {
      cardScale.setValue(0.8);
      cardOpacity.setValue(0);
      
      Animated.parallel([
        Animated.spring(cardScale, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(wordBounce, { toValue: -8, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(wordBounce, { toValue: 0, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [visible]);

  useEffect(() => {
    if (countdown > 0) {
      countdownScale.setValue(1.5);
      Animated.spring(countdownScale, { toValue: 1, friction: 4, tension: 150, useNativeDriver: true }).start();
    }
  }, [countdown]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <Animated.View style={[modalStyles.bgGlow, { opacity: glowAnim }]} />
        
        <Animated.View style={[
          modalStyles.card,
          { transform: [{ scale: cardScale }], opacity: cardOpacity }
        ]}>
          <View style={[modalStyles.topAccent, { backgroundColor: teamBgColor }]} />
          
          <View style={[modalStyles.teamBadge, { backgroundColor: teamBgColor }]}>
            <Text style={modalStyles.teamBadgeText}>{teamEmoji} Team {teamName}</Text>
          </View>
          
          <View style={modalStyles.wordSection}>
            <Text style={modalStyles.labelText}>Your word to draw is</Text>
            <Animated.View style={[modalStyles.wordContainer, { transform: [{ translateY: wordBounce }] }]}>
              <Text style={modalStyles.wordText}>{word?.toUpperCase() || '???'}</Text>
            </Animated.View>
          </View>
          
          <View style={modalStyles.divider} />
          
          <View style={modalStyles.countdownSection}>
            <Text style={modalStyles.hintText}>🤫 Don't say it out loud!</Text>
            
            <View style={modalStyles.countdownWrapper}>
              <Animated.View style={[
                modalStyles.countdownCircle,
                { transform: [{ scale: countdownScale }] }
              ]}>
                <Text style={modalStyles.countdownNumber}>{countdown}</Text>
              </Animated.View>
            </View>
            
            <Text style={modalStyles.readyText}>
              {countdown > 1 ? 'Get ready to draw...' : 'Starting now!'}
            </Text>
          </View>
          
          <View style={modalStyles.progressDots}>
            {[3, 2, 1].map((n) => (
              <View
                key={n}
                style={[
                  modalStyles.dot,
                  countdown <= n && countdown > 0 && modalStyles.dotActive,
                  countdown === n && modalStyles.dotCurrent,
                ]}
              />
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgGlow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#6B4EE6',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    width: '88%',
    maxWidth: 360,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 24,
  },
  topAccent: {
    height: 6,
    width: '100%',
  },
  teamBadge: {
    alignSelf: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  teamBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  wordSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  labelText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 8,
  },
  wordContainer: {
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#FFE0E0',
  },
  wordText: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#FF6B6B',
    textAlign: 'center',
    letterSpacing: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 24,
  },
  countdownSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  hintText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
  },
  countdownWrapper: {
    marginBottom: 16,
  },
  countdownCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#6B4EE6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6B4EE6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  countdownNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  readyText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
  },
  dotActive: {
    backgroundColor: '#4ECDC4',
  },
  dotCurrent: {
    backgroundColor: '#6B4EE6',
    transform: [{ scale: 1.3 }],
  },
});

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_SIZE = SCREEN_WIDTH - 32;

interface Point {
  x: number;
  y: number;
}

interface LocalPath {
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
  drawings: DrawingPath[]; // From store - remote drawings
  word: string | null;
  timeRemaining: number;
  onSendDrawing: (event: Omit<DrawingEvent, 'player_id'>) => void;
  onSendChat: (text: string) => void;
  onTagTeam: (playerId: string) => void;
  onLeave: () => void;
}

const COLORS = [
  '#000000', '#FF0000', '#00AA00', '#0000FF',
  '#FFA500', '#800080', '#00CED1', '#A52A2A',
  '#FFFFFF', '#FFD700',
];
const BRUSH_SIZES = [4, 8, 12, 20];

export const MultiplayerGameScreen: React.FC<MultiplayerGameScreenProps> = ({
  room,
  players,
  currentPlayer,
  messages,
  drawings,
  word,
  timeRemaining,
  onSendDrawing,
  onSendChat,
  onTagTeam,
  onLeave,
}) => {
  // Local drawing state (for the current path being drawn)
  const [localPaths, setLocalPaths] = useState<LocalPath[]>([]);
  const [currentPath, setCurrentPath] = useState<LocalPath | null>(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1]);
  const [chatInput, setChatInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  
  // Word reveal state
  const [showWordReveal, setShowWordReveal] = useState(false);
  const [wordCountdown, setWordCountdown] = useState(3);
  const wordRevealTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRoundRef = useRef<number>(0);
  const lastWordRef = useRef<string | null>(null);

  // Animations
  const timerPulse = useRef(new Animated.Value(1)).current;
  const correctGuessAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(1)).current;
  const [showCorrect, setShowCorrect] = useState(false);

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

  // Cleanup word reveal timer on unmount and reset refs
  useEffect(() => {
    // Reset refs when component mounts (new game)
    lastRoundRef.current = 0;
    lastWordRef.current = null;
    
    return () => {
      if (wordRevealTimerRef.current) {
        clearTimeout(wordRevealTimerRef.current);
      }
    };
  }, []);

  // Show word reveal modal when round starts and player is the drawer
  useEffect(() => {
    const currentRound = room.current_round;
    const currentWord = word;
    
    // Only show modal when:
    // 1. Player is the drawer
    // 2. There's a word to draw
    // 3. Either the round changed OR we got a new word (for the same round)
    const isNewRound = currentRound > lastRoundRef.current;
    const isNewWord = currentWord && currentWord !== lastWordRef.current;
    
    if (isDrawing && currentWord && (isNewRound || isNewWord)) {
      lastRoundRef.current = currentRound;
      lastWordRef.current = currentWord;
      
      // Clear any existing timer
      if (wordRevealTimerRef.current) {
        clearTimeout(wordRevealTimerRef.current);
      }
      
      // Show the modal
      setShowWordReveal(true);
      setWordCountdown(3);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Sequential countdown using timeouts
      wordRevealTimerRef.current = setTimeout(() => {
        setWordCountdown(2);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        wordRevealTimerRef.current = setTimeout(() => {
          setWordCountdown(1);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          
          wordRevealTimerRef.current = setTimeout(() => {
            setShowWordReveal(false);
            setWordCountdown(0);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }, 1000);
        }, 1000);
      }, 1000);
    }
    
    // Reset refs when player stops drawing or word clears
    if (!isDrawing || !currentWord) {
      lastWordRef.current = null;
    }
  }, [isDrawing, word, room.current_round]);

  // Timer pulse animation when low
  useEffect(() => {
    if (timeRemaining <= 10 && timeRemaining > 0) {
      Animated.sequence([
        Animated.timing(timerPulse, {
          toValue: 1.3,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(timerPulse, {
          toValue: 1,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [timeRemaining]);

  // Celebrate correct guess
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.is_correct_guess) {
      setShowCorrect(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Animated.sequence([
        Animated.timing(correctGuessAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(correctGuessAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowCorrect(false));
      
      // Bounce score
      Animated.sequence([
        Animated.timing(scoreAnim, { toValue: 1.4, duration: 150, useNativeDriver: true }),
        Animated.timing(scoreAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [messages]);

  // Handle touch start
  const handleTouchStart = useCallback((event: any) => {
    if (!isDrawing) return;

    const touch = event.nativeEvent;
    const x = touch.locationX;
    const y = touch.locationY;

    const newPath: LocalPath = {
      id: `local_${Date.now()}`,
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
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

    setLocalPaths(prev => [...prev, currentPath]);
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
    setLocalPaths([]);
    setCurrentPath(null);
    onSendDrawing({
      type: 'clear',
      color: selectedColor,
      brushSize,
      timestamp: Date.now(),
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [onSendDrawing, selectedColor, brushSize]);

  // Undo last stroke
  const handleUndo = useCallback(() => {
    setLocalPaths(prev => prev.slice(0, -1));
    onSendDrawing({
      type: 'undo',
      color: selectedColor,
      brushSize,
      timestamp: Date.now(),
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [onSendDrawing, selectedColor, brushSize]);

  // Send chat message
  const handleSendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    onSendChat(chatInput.trim());
    setChatInput('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  // Create word hint (blanks with some letters shown)
  const getWordHint = (w: string | null): string => {
    if (!w) return '???';
    // Show first letter and blanks
    return w.split('').map((c, i) => i === 0 ? c.toUpperCase() : ' _').join('');
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Get team colors for the drawer
  const getTeamInfo = () => {
    const drawerTeam = currentDrawer?.team;
    if (drawerTeam === 1) {
      return { emoji: '🔵', name: 'Blue', bgColor: '#4ECDC4' };
    }
    return { emoji: '🔴', name: 'Red', bgColor: '#FF6B6B' };
  };

  const teamInfo = getTeamInfo();

  return (
    <SafeAreaView style={styles.container}>
      {/* Word Reveal Modal for Drawer */}
      <WordRevealModal
        visible={showWordReveal}
        word={word || ''}
        countdown={wordCountdown}
        teamEmoji={teamInfo.emoji}
        teamName={teamInfo.name}
        teamBgColor={teamInfo.bgColor}
      />

      <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
        {/* Correct Guess Overlay */}
        {showCorrect && (
          <Animated.View style={[
            styles.correctOverlay,
            { opacity: correctGuessAnim }
          ]}>
            <Animated.Text style={[
              styles.correctText,
              { transform: [{ scale: correctGuessAnim }] }
            ]}>
              🎉 CORRECT! 🎉
            </Animated.Text>
          </Animated.View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <Animated.View style={[styles.teamScores, { transform: [{ scale: scoreAnim }] }]}>
            <Text style={[styles.score, styles.team1Score]}>
              🔵 {team1Players.reduce((sum, p) => sum + p.score, 0)}
            </Text>
            <Text style={styles.vs}>vs</Text>
            <Text style={[styles.score, styles.team2Score]}>
              {team2Players.reduce((sum, p) => sum + p.score, 0)} 🔴
            </Text>
          </Animated.View>
          <Animated.View style={[
            styles.timer,
            timeRemaining <= 10 && styles.timerDanger,
            { transform: [{ scale: timerPulse }] }
          ]}>
            <Text style={[
              styles.timerText,
              timeRemaining <= 10 && styles.timerWarning,
            ]}>
              ⏱️ {formatTime(timeRemaining)}
            </Text>
          </Animated.View>
        </View>

        {/* Word/Status Bar */}
        <View style={styles.statusBar}>
          {isDrawing ? (
            <View style={styles.wordContainer}>
              <Text style={styles.wordLabel}>Draw:</Text>
              <Text style={styles.word}>{word?.toUpperCase() || '???'}</Text>
            </View>
          ) : isGuessingTeam ? (
            <View style={styles.wordContainer}>
              <Text style={styles.wordLabel}>Guess:</Text>
              <Text style={styles.wordHint}>{getWordHint(word)}</Text>
            </View>
          ) : (
            <Text style={styles.statusText}>
              {currentDrawer?.name || 'Someone'} is drawing... 
              {!isGuessingTeam && ' (Watch your teammate!)'}
            </Text>
          )}
        </View>

        {/* Canvas - shows both local and remote drawings */}
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
              {/* Remote drawings from other players */}
              {drawings.map(path => (
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
              {/* Local completed paths */}
              {localPaths.map(path => (
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
              {/* Current path being drawn */}
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
          <Animated.View style={styles.tools}>
            <View style={styles.colorPicker}>
              {COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    color === '#FFFFFF' && styles.whiteColor,
                    selectedColor === color && styles.selectedColor,
                  ]}
                  onPress={() => {
                    setSelectedColor(color);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
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
                  onPress={() => {
                    setBrushSize(size);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <View style={[styles.brushPreview, { width: size, height: size, backgroundColor: selectedColor }]} />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleUndo}>
                <Text style={styles.actionText}>↩️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={handleClear}>
                <Text style={styles.actionText}>🗑️</Text>
              </TouchableOpacity>
            </View>

            {/* Tag Team Button */}
            {room.settings.allow_tag_team && teammates.length > 0 && (
              <View style={styles.tagTeam}>
                <Text style={styles.tagTeamLabel}>🏷️ Tag teammate:</Text>
                <View style={styles.tagTeamButtons}>
                  {teammates.map(teammate => (
                    <TouchableOpacity
                      key={teammate.id}
                      style={styles.tagTeamButton}
                      onPress={() => {
                        onTagTeam(teammate.id);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }}
                    >
                      <Text style={styles.tagTeamName}>{teammate.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </Animated.View>
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
                    msg.player_id === currentPlayer?.id && styles.myMessage,
                  ]}
                >
                  <Text style={[
                    styles.messageAuthor,
                    msg.is_correct_guess && styles.correctMessageAuthor,
                  ]}>
                    {msg.player_name}:
                  </Text>
                  <Text style={[
                    styles.messageText,
                    msg.is_correct_guess && styles.correctMessageText,
                  ]}>
                    {msg.text}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.input}
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Type your guess..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                returnKeyType="send"
                onSubmitEditing={handleSendChat}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                style={[styles.sendButton, !chatInput.trim() && styles.sendButtonDisabled]} 
                onPress={handleSendChat}
                disabled={!chatInput.trim()}
              >
                <Text style={styles.sendText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Watching your team draw */}
        {!isDrawing && !isGuessingTeam && (
          <View style={styles.watchingContainer}>
            <Text style={styles.watchingText}>
              👀 Watch your teammate draw!
            </Text>
            <Text style={styles.watchingHint}>
              The other team is guessing...
            </Text>
          </View>
        )}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
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
  correctOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(78, 205, 196, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  correctText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
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
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerDanger: {
    backgroundColor: 'rgba(255,107,107,0.5)',
  },
  timerText: {
    fontSize: 20,
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
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wordLabel: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  word: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFE66D',
    letterSpacing: 2,
  },
  wordHint: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFE66D',
    letterSpacing: 4,
  },
  statusText: {
    fontSize: 16,
    color: '#fff',
  },
  canvasContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tools: {
    padding: 12,
    gap: 10,
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  whiteColor: {
    borderColor: 'rgba(255,255,255,0.5)',
  },
  selectedColor: {
    borderColor: '#FFE66D',
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
  },
  brushPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  brushButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBrush: {
    backgroundColor: 'rgba(255,230,109,0.4)',
    borderWidth: 2,
    borderColor: '#FFE66D',
  },
  brushPreview: {
    borderRadius: 100,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  actionButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: 'rgba(255,107,107,0.4)',
  },
  actionText: {
    fontSize: 26,
  },
  tagTeam: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  tagTeamLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  tagTeamButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  tagTeamButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tagTeamName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  chatMessages: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    marginBottom: 8,
  },
  chatContent: {
    padding: 12,
  },
  message: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
    padding: 6,
    borderRadius: 8,
  },
  myMessage: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  correctMessage: {
    backgroundColor: '#4ECDC4',
    padding: 10,
  },
  messageAuthor: {
    fontWeight: 'bold',
    color: '#FFE66D',
  },
  correctMessageAuthor: {
    color: '#fff',
  },
  messageText: {
    color: '#fff',
    flex: 1,
  },
  correctMessageText: {
    fontWeight: 'bold',
  },
  chatInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sendButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  watchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  watchingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  watchingHint: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
});

export default MultiplayerGameScreen;
