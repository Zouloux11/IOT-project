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

  const latestMic = sensorData.microphone[0]?.decibels || 0;
  const latestDist = sensorData.distance[0]?.distanceCm || 0;
  const latestMotion = sensorData.motion[0]?.motionDetected || false;

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
    return latestMotion ? colors.warning : colors.success;
  };

  const getStatusText = (type: 'mic' | 'dist' | 'motion') => {
    if (type === 'mic') {
      if (latestMic < 60) return 'Calme';
      if (latestMic < 80) return 'Normal';
      return 'Bruyant';
    }
    if (type === 'dist') {
      if (latestDist > 100) return 'Loin';
      if (latestDist > 50) return 'Proche';
      return 'Très proche';
    }
    return latestMotion ? 'Détecté' : 'Aucun';
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.accent[300]} />
        <Text style={styles.loadingText}>Chargement des données...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent[300]}
            colors={[colors.accent[300]]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Bienvenue</Text>
          <Text style={styles.titleText}>IoT Dashboard</Text>
        </View>

        {/* Bouton test notification */}
        <Pressable
          style={({ pressed }) => [
            styles.testButton,
            pressed && styles.testButtonPressed,
          ]}
          onPress={testNotification}
        >
          <Ionicons name="notifications" size={20} color={colors.surface} />
          <Text style={styles.testButtonText}>Test Notification</Text>
        </Pressable>

        {/* Cards de capteurs */}
        <View style={styles.cardsContainer}>
          {/* Card Microphone */}
          <View style={[styles.card, shadows.md]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.info + '20' }]}>
                <Ionicons name="mic" size={24} color={colors.info} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Microphone</Text>
                <Text style={styles.cardSubtitle}>ESP_MIC_001</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.mainValue}>{latestMic.toFixed(1)}</Text>
              <Text style={styles.unit}>dB</Text>
            </View>
            <View style={styles.cardFooter}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor('mic') + '20' },
                ]}
              >
                <Text style={[styles.statusText, { color: getStatusColor('mic') }]}>
                  {getStatusText('mic')}
                </Text>
              </View>
              <Text style={styles.sampleCount}>
                {sensorData.microphone.length} échantillons
              </Text>
            </View>
          </View>

          {/* Card Distance */}
          <View style={[styles.card, shadows.md]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="resize" size={24} color={colors.success} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Distance</Text>
                <Text style={styles.cardSubtitle}>ESP_DIST_001</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.mainValue}>{latestDist.toFixed(1)}</Text>
              <Text style={styles.unit}>cm</Text>
            </View>
            <View style={styles.cardFooter}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor('dist') + '20' },
                ]}
              >
                <Text style={[styles.statusText, { color: getStatusColor('dist') }]}>
                  {getStatusText('dist')}
                </Text>
              </View>
              <Text style={styles.sampleCount}>
                {sensorData.distance.length} échantillons
              </Text>
            </View>
          </View>

          {/* Card Motion */}
          <View style={[styles.card, shadows.md]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.warning + '20' }]}>
                <Ionicons name="walk" size={24} color={colors.warning} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Mouvement</Text>
                <Text style={styles.cardSubtitle}>ESP_MOT_001</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.motionIndicator}>
                <Ionicons
                  name={latestMotion ? 'checkmark-circle' : 'close-circle'}
                  size={48}
                  color={latestMotion ? colors.warning : colors.success}
                />
              </View>
            </View>
            <View style={styles.cardFooter}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor('motion') + '20' },
                ]}
              >
                <Text style={[styles.statusText, { color: getStatusColor('motion') }]}>
                  {getStatusText('motion')}
                </Text>
              </View>
              <Text style={styles.sampleCount}>
                {sensorData.motion.filter(m => m.motionDetected).length} détections
              </Text>
            </View>
          </View>
        </View>

        {/* Stats rapides */}
        <View style={[styles.statsCard, shadows.sm]}>
          <Text style={styles.statsTitle}>Statistiques rapides</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Moy. Mic</Text>
              <Text style={styles.statValue}>
                {(sensorData.microphone.reduce((a, b) => a + b.decibels, 0) /
                  sensorData.microphone.length || 0).toFixed(1)} dB
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Moy. Dist</Text>
              <Text style={styles.statValue}>
                {(sensorData.distance.reduce((a, b) => a + b.distanceCm, 0) /
                  sensorData.distance.length || 0).toFixed(1)} cm
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Mouvements</Text>
              <Text style={styles.statValue}>
                {sensorData.motion.filter(m => m.motionDetected).length}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.text.secondary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent[500],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    ...shadows.sm,
  },
  testButtonPressed: {
    opacity: 0.8,
  },
  testButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  cardsContainer: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  mainValue: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  unit: {
    fontSize: 20,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  motionIndicator: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sampleCount: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accent[500],
  },
});