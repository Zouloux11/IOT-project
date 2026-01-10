import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, shadows, spacing } from '../../constants/theme';
import { useSensors } from '../../contexts/SensorContext';
import { schedulePushNotification } from '../../services/notifications';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { sensorData, loading, refreshData } = useSensors();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const testNotification = async () => {
    await schedulePushNotification(
      '🧪 Test Notification',
      'Ceci est une notification de test !',
      { test: true }
    );
  };

  const latestMic = sensorData.microphone[0]?.value || 0;
  const latestDist = sensorData.distance[0]?.value || 0;
  const latestMotion = sensorData.motion[0]?.value || false;

  const getStatusColor = (type: 'mic' | 'dist' | 'motion') => {
    if (type === 'mic') {
      if (latestMic < 60) return colors.success;
      if (latestMic < 80) return colors.warning;
      return colors.error;
    }
    if (type === 'dist') {
      if (latestDist > 100) return colors.success;
      if (latestDist > 50) return colors.warning;
      return colors.error;
    }
    return latestMotion ? colors.error : colors.success;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.accent[300]} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent[300]} />
      }
    >
      {/* Test Notification Button */}
      <Pressable style={styles.testButton} onPress={testNotification}>
        <Ionicons name="notifications" size={20} color={colors.surface} />
        <Text style={styles.testButtonText}>Tester les notifications</Text>
      </Pressable>

      {/* Status Cards */}
      <View style={styles.grid}>
        <View style={[styles.statusCard, { borderLeftColor: getStatusColor('mic'), borderLeftWidth: 4 }]}>
          <Ionicons name="mic" size={32} color={getStatusColor('mic')} />
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>Microphone</Text>
            <Text style={styles.statusValue}>{latestMic.toFixed(1)} dB</Text>
            <Text style={styles.deviceId}>ESP_001</Text>
          </View>
        </View>

        <View style={[styles.statusCard, { borderLeftColor: getStatusColor('dist'), borderLeftWidth: 4 }]}>
          <Ionicons name="expand" size={32} color={getStatusColor('dist')} />
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>Distance</Text>
            <Text style={styles.statusValue}>{latestDist.toFixed(1)} cm</Text>
            <Text style={styles.deviceId}>ESP_002</Text>
          </View>
        </View>

        <View style={[styles.statusCard, { borderLeftColor: getStatusColor('motion'), borderLeftWidth: 4 }]}>
          <Ionicons name="walk" size={32} color={getStatusColor('motion')} />
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>Mouvement</Text>
            <Text style={styles.statusValue}>{latestMotion ? 'Détecté' : 'Aucun'}</Text>
            <Text style={styles.deviceId}>ESP_004</Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistiques rapides</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{sensorData.microphone.length}</Text>
            <Text style={styles.statLabel}>Mesures Micro</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{sensorData.distance.length}</Text>
            <Text style={styles.statLabel}>Mesures Distance</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{sensorData.motion.filter(m => m.value).length}</Text>
            <Text style={styles.statLabel}>Mouvements</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activité récente</Text>
        {sensorData.motion.slice(0, 5).map((motion, index) => (
          <View key={index} style={styles.activityItem}>
            <Ionicons
              name={motion.value ? 'warning' : 'checkmark-circle'}
              size={24}
              color={motion.value ? colors.error : colors.success}
            />
            <View style={styles.activityInfo}>
              <Text style={styles.activityText}>
                {motion.value ? 'Mouvement détecté' : 'Aucun mouvement'}
              </Text>
              <Text style={styles.activityTime}>
                {new Date(motion.recordedAt).toLocaleString('fr-FR')}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.text.secondary,
  },
  testButton: {
    backgroundColor: colors.accent[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  testButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  grid: {
    gap: spacing.md,
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.sm,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accent[500],
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[100],
  },
  activityInfo: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  activityTime: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
});