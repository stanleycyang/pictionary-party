import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';

interface HomeScreenProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onLocalPlay: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onCreateRoom,
  onJoinRoom,
  onLocalPlay,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Title */}
        <View style={styles.header}>
          <Text style={styles.title}>🎨</Text>
          <Text style={styles.titleText}>Pictionary</Text>
          <Text style={styles.subtitleText}>Party</Text>
        </View>

        {/* Menu Buttons */}
        <View style={styles.menu}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={onCreateRoom}
          >
            <Text style={styles.buttonIcon}>🎮</Text>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonText}>Create Game</Text>
              <Text style={styles.buttonSubtext}>Host a new room</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={onJoinRoom}
          >
            <Text style={styles.buttonIcon}>🔗</Text>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonText}>Join Game</Text>
              <Text style={styles.buttonSubtext}>Enter room code</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.tertiaryButton]}
            onPress={onLocalPlay}
          >
            <Text style={styles.buttonIcon}>📱</Text>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonText}>Local Play</Text>
              <Text style={styles.buttonSubtext}>Same device</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Draw. Guess. Win!</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6B4EE6',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 80,
    marginBottom: 8,
  },
  titleText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitleText: {
    fontSize: 36,
    fontWeight: '600',
    color: '#FFB347',
    marginTop: -8,
  },
  menu: {
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#FF6B6B',
  },
  secondaryButton: {
    backgroundColor: '#4ECDC4',
  },
  tertiaryButton: {
    backgroundColor: '#FFE66D',
  },
  buttonIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
  },
});

export default HomeScreen;
