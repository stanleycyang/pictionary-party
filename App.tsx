import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Modal,
  Animated,
  GestureResponderEvent,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { MultiplayerApp } from './src/App.multiplayer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_SIZE = Math.min(SCREEN_WIDTH - 40, 400);

// App mode: 'select' | 'multiplayer' | 'local'
type AppMode = 'select' | 'multiplayer' | 'local';

// Word categories for different party types
const WORD_CATEGORIES = {
  easy: ['cat', 'dog', 'sun', 'tree', 'house', 'car', 'ball', 'star', 'fish', 'bird', 'hat', 'book', 'phone', 'cup', 'bed'],
  animals: ['elephant', 'giraffe', 'penguin', 'dolphin', 'butterfly', 'kangaroo', 'octopus', 'peacock', 'turtle', 'zebra', 'lion', 'monkey'],
  food: ['pizza', 'ice cream', 'hamburger', 'spaghetti', 'cupcake', 'taco', 'sushi', 'popcorn', 'sandwich', 'donut', 'cookie', 'banana'],
  actions: ['dancing', 'sleeping', 'running', 'jumping', 'swimming', 'flying', 'cooking', 'singing', 'laughing', 'crying', 'reading', 'painting'],
  objects: ['umbrella', 'guitar', 'camera', 'bicycle', 'airplane', 'rocket', 'balloon', 'present', 'candle', 'crown', 'glasses', 'watch'],
  places: ['beach', 'mountain', 'castle', 'jungle', 'space', 'desert', 'city', 'farm', 'hospital', 'school', 'restaurant', 'park'],
  hard: ['electricity', 'jealousy', 'democracy', 'imagination', 'confusion', 'celebration', 'adventure', 'nightmare', 'freedom', 'mystery'],
};

const DIFFICULTY_WORDS = {
  easy: [...WORD_CATEGORIES.easy, ...WORD_CATEGORIES.animals, ...WORD_CATEGORIES.food],
  medium: [...WORD_CATEGORIES.actions, ...WORD_CATEGORIES.objects, ...WORD_CATEGORIES.places],
  hard: [...WORD_CATEGORIES.hard, ...WORD_CATEGORIES.actions],
};

const COLORS = ['#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF69B4', '#FFA500', '#8B4513'];
const BRUSH_SIZES = [2, 4, 8, 12];

const TIME_OPTIONS = [30, 60, 90, 120];

type GameState = 'menu' | 'settings' | 'drawing' | 'reveal';
type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';

interface PathData {
  d: string;
  color: string;
  strokeWidth: number;
}

interface TeamScore {
  team1: number;
  team2: number;
}

interface GameSettings {
  timeLimit: number;
  difficulty: Difficulty;
  teamCount: 2 | 3 | 4;
}

// Wrapper component to handle mode selection
export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('select');

  if (appMode === 'select') {
    return <ModeSelectScreen onSelectMultiplayer={() => setAppMode('multiplayer')} onSelectLocal={() => setAppMode('local')} />;
  }

  if (appMode === 'multiplayer') {
    return <MultiplayerApp onPlayLocal={() => setAppMode('local')} />;
  }

  return <LocalGameApp onBack={() => setAppMode('select')} />;
}

// Mode selection screen
function ModeSelectScreen({ onSelectMultiplayer, onSelectLocal }: { onSelectMultiplayer: () => void; onSelectLocal: () => void }) {
  return (
    <SafeAreaView style={modeStyles.container}>
      <View style={modeStyles.content}>
        <Text style={modeStyles.emoji}>🎨</Text>
        <Text style={modeStyles.title}>Pictionary</Text>
        <Text style={modeStyles.subtitle}>Party</Text>

        <View style={modeStyles.buttons}>
          <TouchableOpacity style={[modeStyles.button, modeStyles.multiplayerButton]} onPress={onSelectMultiplayer}>
            <Text style={modeStyles.buttonIcon}>🌐</Text>
            <View>
              <Text style={modeStyles.buttonTitle}>Online Multiplayer</Text>
              <Text style={modeStyles.buttonDesc}>Play with friends anywhere</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[modeStyles.button, modeStyles.localButton]} onPress={onSelectLocal}>
            <Text style={modeStyles.buttonIcon}>📱</Text>
            <View>
              <Text style={modeStyles.buttonTitle}>Local Party</Text>
              <Text style={modeStyles.buttonDesc}>Same device, pass & play</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={modeStyles.tagline}>Draw. Guess. Win!</Text>
      </View>
    </SafeAreaView>
  );
}

const modeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6B4EE6',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 8,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 36,
    fontWeight: '600',
    color: '#FFB347',
    marginBottom: 48,
  },
  buttons: {
    width: '100%',
    gap: 16,
    marginBottom: 48,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  multiplayerButton: {
    backgroundColor: '#FF6B6B',
  },
  localButton: {
    backgroundColor: '#4ECDC4',
  },
  buttonIcon: {
    fontSize: 36,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
  },
});

// Local game component (existing code)
function LocalGameApp({ onBack }: { onBack: () => void }) {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [currentWord, setCurrentWord] = useState('');
  const [scores, setScores] = useState<number[]>([0, 0]);
  const [currentTeam, setCurrentTeam] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [paths, setPaths] = useState<PathData[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const [showWord, setShowWord] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    timeLimit: 60,
    difficulty: 'mixed',
    teamCount: 2,
  });
  const [roundNumber, setRoundNumber] = useState(1);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const getRandomWord = useCallback(() => {
    let wordPool: string[];
    if (settings.difficulty === 'mixed') {
      wordPool = [...DIFFICULTY_WORDS.easy, ...DIFFICULTY_WORDS.medium, ...DIFFICULTY_WORDS.hard];
    } else {
      wordPool = DIFFICULTY_WORDS[settings.difficulty];
    }
    const randomIndex = Math.floor(Math.random() * wordPool.length);
    return wordPool[randomIndex];
  }, [settings.difficulty]);

  const teamColors = ['🔵', '🔴', '🟢', '🟡'];
  const teamNames = ['Blue', 'Red', 'Green', 'Yellow'];

  const startRound = useCallback(() => {
    const word = getRandomWord();
    setCurrentWord(word);
    setPaths([]);
    setCurrentPath('');
    setTimeLeft(settings.timeLimit);
    setShowWord(true);
    setGameState('drawing');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setTimeout(() => {
      setShowWord(false);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setGameState('reveal');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            return 0;
          }
          if (prev <= 10) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          return prev - 1;
        });
      }, 1000);
    }, 3000);
  }, [getRandomWord, settings.timeLimit]);

  const handleGuessCorrect = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();

    setScores((prev) => {
      const newScores = [...prev];
      newScores[currentTeam] += 1;
      return newScores;
    });
    setCurrentTeam((prev) => (prev + 1) % settings.teamCount);
    setRoundNumber((prev) => prev + 1);
    setGameState('menu');
  }, [currentTeam, scaleAnim, settings.teamCount]);

  const handleSkip = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentTeam((prev) => (prev + 1) % settings.teamCount);
    setRoundNumber((prev) => prev + 1);
    setGameState('menu');
  }, [settings.teamCount]);

  const clearCanvas = useCallback(() => {
    setPaths([]);
    setCurrentPath('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const undoLast = useCallback(() => {
    setPaths((prev) => prev.slice(0, -1));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const resetGame = useCallback(() => {
    setScores(Array(settings.teamCount).fill(0));
    setCurrentTeam(0);
    setRoundNumber(1);
  }, [settings.teamCount]);

  const handleTouchStart = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    setCurrentPath(`M${locationX.toFixed(0)},${locationY.toFixed(0)}`);
  };

  const handleTouchMove = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    setCurrentPath((prev) => `${prev} L${locationX.toFixed(0)},${locationY.toFixed(0)}`);
  };

  const handleTouchEnd = () => {
    if (currentPath) {
      setPaths((prev) => [...prev, { d: currentPath, color: selectedColor, strokeWidth: brushSize }]);
      setCurrentPath('');
    }
  };

  const renderMenu = () => (
    <ScrollView contentContainerStyle={styles.menuContainer}>
      <Text style={styles.title}>🎨 Pictionary</Text>
      <Text style={styles.subtitle}>Draw, Guess, Win!</Text>
      
      <View style={styles.scoreBoard}>
        {scores.slice(0, settings.teamCount).map((score, index) => (
          <Animated.View 
            key={index}
            style={[
              styles.teamScore, 
              { transform: [{ scale: currentTeam === index ? scaleAnim : 1 }] },
              currentTeam === index && styles.activeTeam
            ]}
          >
            <Text style={styles.teamLabel}>{teamColors[index]} {teamNames[index]}</Text>
            <Text style={styles.scoreText}>{score}</Text>
          </Animated.View>
        ))}
      </View>

      <Text style={styles.roundText}>Round {roundNumber}</Text>
      <Text style={styles.turnText}>
        {teamColors[currentTeam]} {teamNames[currentTeam]} Team's Turn to Draw!
      </Text>

      <TouchableOpacity style={styles.startButton} onPress={startRound}>
        <Text style={styles.startButtonText}>🎯 Start Round</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingsButton} onPress={() => setGameState('settings')}>
        <Text style={styles.settingsButtonText}>⚙️ Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
        <Text style={styles.resetButtonText}>🔄 New Game</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backToModeButton} onPress={onBack}>
        <Text style={styles.backToModeText}>← Back to Menu</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderSettings = () => (
    <ScrollView contentContainerStyle={styles.settingsContainer}>
      <Text style={styles.settingsTitle}>⚙️ Game Settings</Text>

      <View style={styles.settingGroup}>
        <Text style={styles.settingLabel}>⏱️ Time Limit</Text>
        <View style={styles.optionRow}>
          {TIME_OPTIONS.map((time) => (
            <TouchableOpacity
              key={time}
              style={[styles.optionButton, settings.timeLimit === time && styles.optionSelected]}
              onPress={() => setSettings((s) => ({ ...s, timeLimit: time }))}
            >
              <Text style={[styles.optionText, settings.timeLimit === time && styles.optionTextSelected]}>
                {time}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.settingGroup}>
        <Text style={styles.settingLabel}>📊 Difficulty</Text>
        <View style={styles.optionRow}>
          {(['easy', 'medium', 'hard', 'mixed'] as Difficulty[]).map((diff) => (
            <TouchableOpacity
              key={diff}
              style={[styles.optionButton, settings.difficulty === diff && styles.optionSelected]}
              onPress={() => setSettings((s) => ({ ...s, difficulty: diff }))}
            >
              <Text style={[styles.optionText, settings.difficulty === diff && styles.optionTextSelected]}>
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.settingGroup}>
        <Text style={styles.settingLabel}>👥 Teams</Text>
        <View style={styles.optionRow}>
          {([2, 3, 4] as const).map((count) => (
            <TouchableOpacity
              key={count}
              style={[styles.optionButton, settings.teamCount === count && styles.optionSelected]}
              onPress={() => {
                setSettings((s) => ({ ...s, teamCount: count }));
                setScores(Array(count).fill(0));
              }}
            >
              <Text style={[styles.optionText, settings.teamCount === count && styles.optionTextSelected]}>
                {count} Teams
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => setGameState('menu')}>
        <Text style={styles.backButtonText}>← Back to Game</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderDrawing = () => (
    <View style={styles.drawingContainer}>
      <Modal visible={showWord} transparent animationType="fade">
        <View style={styles.wordModal}>
          <View style={styles.wordCard}>
            <Text style={styles.wordLabel}>Your word is:</Text>
            <Text style={styles.wordText}>{currentWord.toUpperCase()}</Text>
            <Text style={styles.wordHint}>Memorize it! Starting in 3 seconds...</Text>
          </View>
        </View>
      </Modal>

      <View style={styles.timerContainer}>
        <Text style={[styles.timerText, timeLeft <= 10 && styles.timerWarning]}>
          ⏱️ {timeLeft}s
        </Text>
      </View>

      <View 
        style={styles.canvasContainer}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouchStart}
        onResponderMove={handleTouchMove}
        onResponderRelease={handleTouchEnd}
      >
        <Svg width={CANVAS_SIZE} height={CANVAS_SIZE} style={styles.canvas}>
          {paths.map((path, index) => (
            <Path
              key={index}
              d={path.d}
              stroke={path.color}
              strokeWidth={path.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}
          {currentPath && (
            <Path
              d={currentPath}
              stroke={selectedColor}
              strokeWidth={brushSize}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}
        </Svg>
      </View>

      <View style={styles.colorPalette}>
        {COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorButton,
              { backgroundColor: color },
              selectedColor === color && styles.colorButtonSelected,
            ]}
            onPress={() => {
              setSelectedColor(color);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          />
        ))}
      </View>

      <View style={styles.brushSizes}>
        {BRUSH_SIZES.map((size) => (
          <TouchableOpacity
            key={size}
            style={[styles.brushButton, brushSize === size && styles.brushButtonSelected]}
            onPress={() => {
              setBrushSize(size);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <View style={[styles.brushPreview, { width: size * 2, height: size * 2, backgroundColor: selectedColor }]} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.undoButton} onPress={undoLast}>
          <Text style={styles.undoButtonText}>↩️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={clearCanvas}>
          <Text style={styles.clearButtonText}>🗑️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.correctButton} onPress={handleGuessCorrect}>
          <Text style={styles.correctButtonText}>✅ Got It!</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>⏭️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReveal = () => (
    <View style={styles.revealContainer}>
      <Text style={styles.timesUpText}>⏰ Time's Up!</Text>
      <Text style={styles.revealLabel}>The word was:</Text>
      <Text style={styles.revealWord}>{currentWord.toUpperCase()}</Text>
      
      <View style={styles.revealButtons}>
        <TouchableOpacity style={styles.gotItButton} onPress={handleGuessCorrect}>
          <Text style={styles.gotItButtonText}>They got it! ✅</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nopeButton} onPress={handleSkip}>
          <Text style={styles.nopeButtonText}>Nope ❌</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {gameState === 'menu' && renderMenu()}
      {gameState === 'settings' && renderSettings()}
      {gameState === 'drawing' && renderDrawing()}
      {gameState === 'reveal' && renderReveal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5E6',
  },
  menuContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#4ECDC4',
    marginBottom: 30,
  },
  scoreBoard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  teamScore: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 16,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeTeam: {
    borderWidth: 3,
    borderColor: '#4ECDC4',
  },
  teamLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  roundText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 5,
  },
  turnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 25,
  },
  startButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 30,
    marginBottom: 12,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  settingsButton: {
    backgroundColor: '#45B7D1',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 10,
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    padding: 12,
  },
  resetButtonText: {
    color: '#999',
    fontSize: 14,
  },
  backToModeButton: {
    marginTop: 20,
    padding: 12,
  },
  backToModeText: {
    color: '#6B4EE6',
    fontSize: 16,
    fontWeight: '600',
  },
  // Settings styles
  settingsContainer: {
    flexGrow: 1,
    padding: 20,
  },
  settingsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  settingGroup: {
    marginBottom: 25,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#EEE',
  },
  optionSelected: {
    backgroundColor: '#4ECDC4',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  optionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  // Drawing styles
  drawingContainer: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  timerContainer: {
    marginBottom: 8,
  },
  timerText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  timerWarning: {
    color: '#FF6B6B',
  },
  canvasContainer: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  canvas: {
    flex: 1,
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: '#333',
    transform: [{ scale: 1.15 }],
  },
  brushSizes: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 15,
  },
  brushButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brushButtonSelected: {
    backgroundColor: '#DDD',
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  brushPreview: {
    borderRadius: 50,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    gap: 10,
  },
  undoButton: {
    backgroundColor: '#DDD',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  undoButtonText: {
    fontSize: 20,
  },
  clearButton: {
    backgroundColor: '#DDD',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 20,
  },
  correctButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 25,
  },
  correctButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: '#FF6B6B',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 20,
  },
  // Word modal
  wordModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordCard: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 30,
    alignItems: 'center',
    margin: 20,
  },
  wordLabel: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  wordText: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 20,
    textAlign: 'center',
  },
  wordHint: {
    fontSize: 14,
    color: '#999',
  },
  // Reveal styles
  revealContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  timesUpText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 20,
  },
  revealLabel: {
    fontSize: 20,
    color: '#666',
    marginBottom: 10,
  },
  revealWord: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 40,
    textAlign: 'center',
  },
  revealButtons: {
    gap: 15,
  },
  gotItButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  gotItButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  nopeButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  nopeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
