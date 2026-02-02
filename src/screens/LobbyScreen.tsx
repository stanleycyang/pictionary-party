import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Share,
} from 'react-native';
import { Player, Room } from '../types/multiplayer';

interface LobbyScreenProps {
  room: Room;
  players: Player[];
  currentPlayer: Player | null;
  onJoinTeam: (team: 1 | 2) => void;
  onToggleReady: () => void;
  onStartGame: () => void;
  onLeave: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  room,
  players,
  currentPlayer,
  onJoinTeam,
  onToggleReady,
  onStartGame,
  onLeave,
}) => {
  const team1Players = players.filter(p => p.team === 1);
  const team2Players = players.filter(p => p.team === 2);
  const unassignedPlayers = players.filter(p => p.team === null);
  const allReady = players.length >= 2 && players.every(p => p.is_ready);
  const canStart = currentPlayer?.is_host && allReady && team1Players.length >= 1 && team2Players.length >= 1;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my Pictionary Party! 🎨\n\nRoom Code: ${room.code}\n\nDownload the app and enter this code to play!`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderPlayer = (player: Player) => (
    <View 
      key={player.id} 
      style={[
        styles.playerCard,
        player.id === currentPlayer?.id && styles.currentPlayerCard,
      ]}
    >
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>
          {player.name}
          {player.is_host && ' 👑'}
        </Text>
        {player.id === currentPlayer?.id && (
          <Text style={styles.youLabel}>(You)</Text>
        )}
      </View>
      <View style={[
        styles.readyBadge,
        player.is_ready ? styles.readyBadgeActive : styles.readyBadgeInactive,
      ]}>
        <Text style={styles.readyText}>
          {player.is_ready ? '✓ Ready' : 'Waiting'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.leaveButton} onPress={onLeave}>
          <Text style={styles.leaveText}>← Leave</Text>
        </TouchableOpacity>
        <View style={styles.roomInfo}>
          <Text style={styles.roomCode}>{room.code}</Text>
          <TouchableOpacity onPress={handleShare}>
            <Text style={styles.shareButton}>📤 Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Unassigned Players */}
        {unassignedPlayers.length > 0 && (
          <View style={styles.unassignedSection}>
            <Text style={styles.sectionTitle}>👋 Waiting to join team</Text>
            {unassignedPlayers.map(renderPlayer)}
          </View>
        )}

        {/* Teams */}
        <View style={styles.teamsContainer}>
          {/* Team 1 */}
          <View style={styles.teamSection}>
            <TouchableOpacity
              style={[
                styles.teamHeader,
                styles.team1Header,
                currentPlayer?.team === 1 && styles.activeTeamHeader,
              ]}
              onPress={() => onJoinTeam(1)}
              disabled={currentPlayer?.team === 1}
            >
              <Text style={styles.teamTitle}>🔵 Team 1</Text>
              <Text style={styles.teamCount}>{team1Players.length} players</Text>
            </TouchableOpacity>
            <View style={styles.teamPlayers}>
              {team1Players.length === 0 ? (
                <Text style={styles.emptyTeam}>Tap to join!</Text>
              ) : (
                team1Players.map(renderPlayer)
              )}
            </View>
          </View>

          {/* VS */}
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          {/* Team 2 */}
          <View style={styles.teamSection}>
            <TouchableOpacity
              style={[
                styles.teamHeader,
                styles.team2Header,
                currentPlayer?.team === 2 && styles.activeTeamHeader,
              ]}
              onPress={() => onJoinTeam(2)}
              disabled={currentPlayer?.team === 2}
            >
              <Text style={styles.teamTitle}>🔴 Team 2</Text>
              <Text style={styles.teamCount}>{team2Players.length} players</Text>
            </TouchableOpacity>
            <View style={styles.teamPlayers}>
              {team2Players.length === 0 ? (
                <Text style={styles.emptyTeam}>Tap to join!</Text>
              ) : (
                team2Players.map(renderPlayer)
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.actions}>
        {currentPlayer?.team ? (
          <>
            <TouchableOpacity
              style={[
                styles.readyButton,
                currentPlayer?.is_ready && styles.readyButtonActive,
              ]}
              onPress={onToggleReady}
            >
              <Text style={styles.readyButtonText}>
                {currentPlayer?.is_ready ? '✓ Ready!' : 'Ready Up'}
              </Text>
            </TouchableOpacity>

            {currentPlayer?.is_host && (
              <TouchableOpacity
                style={[
                  styles.startButton,
                  !canStart && styles.startButtonDisabled,
                ]}
                onPress={onStartGame}
                disabled={!canStart}
              >
                <Text style={styles.startButtonText}>
                  {canStart ? 'Start Game! 🎮' : 'Waiting for players...'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.joinTeamPrompt}>
            <Text style={styles.joinTeamText}>👆 Tap a team to join!</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6B4EE6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  leaveButton: {
    padding: 8,
  },
  leaveText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roomCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFE66D',
    letterSpacing: 2,
  },
  shareButton: {
    fontSize: 14,
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  unassignedSection: {
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  teamsContainer: {
    gap: 16,
  },
  teamSection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  teamHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  team1Header: {
    backgroundColor: 'rgba(78, 205, 196, 0.4)',
  },
  team2Header: {
    backgroundColor: 'rgba(255, 107, 107, 0.4)',
  },
  activeTeamHeader: {
    borderWidth: 3,
    borderColor: '#FFE66D',
  },
  teamTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  teamCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  teamPlayers: {
    padding: 12,
    gap: 8,
    minHeight: 80,
  },
  emptyTeam: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  playerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 12,
    borderRadius: 10,
  },
  currentPlayerCard: {
    backgroundColor: 'rgba(255,230,109,0.3)',
    borderWidth: 2,
    borderColor: '#FFE66D',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  youLabel: {
    fontSize: 12,
    color: '#FFE66D',
    fontWeight: '600',
  },
  readyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  readyBadgeActive: {
    backgroundColor: '#4ECDC4',
  },
  readyBadgeInactive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  readyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  vsContainer: {
    alignItems: 'center',
    marginVertical: -8,
    zIndex: 1,
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFE66D',
    backgroundColor: '#6B4EE6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actions: {
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  readyButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  readyButtonActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  readyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  startButton: {
    backgroundColor: '#FF6B6B',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonDisabled: {
    backgroundColor: 'rgba(255,107,107,0.4)',
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  joinTeamPrompt: {
    padding: 20,
    alignItems: 'center',
  },
  joinTeamText: {
    fontSize: 18,
    color: '#FFE66D',
    fontWeight: '600',
  },
});

export default LobbyScreen;
