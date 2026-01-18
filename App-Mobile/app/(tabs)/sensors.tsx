import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, shadows, spacing } from '../../constants/theme';
import { useSensors } from '../../contexts/SensorContext';

const screenWidth = Dimensions.get('window').width;

export default function SensorsScreen() {
  const insets = useSafeAreaInsets();
  const { sensorData, loading, refreshData } = useSensors();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
    style: {
      borderRadius: borderRadius.lg,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.accent[500],
    },
  };

  const getMicrophoneChartData = () => {
    const data = sensorData.microphone.slice(0, 10).reverse();
    return {
      labels: data.map((_, i) => `${i + 1}`),
      datasets: [{
        data: data.length > 0 ? data.map(d => d.decibels) : [0],
      }],
    };
  };

  const getDistanceChartData = () => {
    const data = sensorData.distance.slice(0, 10).reverse();
    return {
      labels: data.map((_, i) => `${i + 1}`),
      datasets: [{
        data: data.length > 0 ? data.map(d => d.distanceCm) : [0],
      }],
    };
  };

  const getDecibelStatus = (db: number) => {
    if (db < 60) return { label: 'Calme', color: colors.success };
    if (db < 80) return { label: 'Normal', color: colors.warning };
    if (db < 100) return { label: 'Bruyant', color: colors.error };
    return { label: 'Très bruyant', color: colors.error };
  };

  const getDistanceStatus = (cm: number) => {
    if (cm > 100) return { label: 'Loin', color: colors.success };
    if (cm > 50) return { label: 'Proche', color: colors.warning };
    return { label: 'Très proche', color: colors.error };
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.accent[300]} />
        <Text style={styles.loadingText}>Chargement des capteurs...</Text>
      </View>
    );
  }

  const latestMic = sensorData.microphone[0]?.decibels || 0;
  const latestDist = sensorData.distance[0]?.distanceCm || 0;
  const micStatus = getDecibelStatus(latestMic);
  const distStatus = getDistanceStatus(latestDist);

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
        {/* Microphone Section */}
        <View style={[styles.sensorSection, shadows.md]}>
          <View style={styles.sensorHeader}>
            <View style={[styles.sensorIcon, { backgroundColor: colors.info + '20' }]}>
              <Ionicons name="mic" size={24} color={colors.info} />
            </View>
            <View style={styles.sensorHeaderText}>
              <Text style={styles.sensorTitle}>Microphone</Text>
              <Text style={styles.sensorSubtitle}>ESP_MIC_001</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: micStatus.color + '20' }]}>
              <Text style={[styles.statusText, { color: micStatus.color }]}>
                {micStatus.label}
              </Text>
            </View>
          </View>

          <View style={styles.currentValue}>
            <Text style={styles.valueNumber}>{latestMic.toFixed(1)}</Text>
            <Text style={styles.valueUnit}>dB</Text>
          </View>

          {sensorData.microphone.length > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Historique (10 dernières valeurs)</Text>
              <LineChart
                data={getMicrophoneChartData()}
                width={screenWidth - 2 * spacing.lg - 2 * spacing.lg}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withInnerLines={false}
                withOuterLines={true}
                withVerticalLabels={true}
                withHorizontalLabels={true}
              />
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Moyenne</Text>
              <Text style={styles.statValue}>
                {(sensorData.microphone.reduce((a, b) => a + b.decibels, 0) /
                  sensorData.microphone.length || 0).toFixed(1)} dB
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Maximum</Text>
              <Text style={styles.statValue}>
                {Math.max(...sensorData.microphone.map(d => d.decibels), 0).toFixed(1)} dB
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Échantillons</Text>
              <Text style={styles.statValue}>{sensorData.microphone.length}</Text>
            </View>
          </View>
        </View>

        {/* Distance Section */}
        <View style={[styles.sensorSection, shadows.md]}>
          <View style={styles.sensorHeader}>
            <View style={[styles.sensorIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="resize" size={24} color={colors.success} />
            </View>
            <View style={styles.sensorHeaderText}>
              <Text style={styles.sensorTitle}>Distance</Text>
              <Text style={styles.sensorSubtitle}>ESP_DIST_001</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: distStatus.color + '20' }]}>
              <Text style={[styles.statusText, { color: distStatus.color }]}>
                {distStatus.label}
              </Text>
            </View>
          </View>

          <View style={styles.currentValue}>
            <Text style={styles.valueNumber}>{latestDist.toFixed(1)}</Text>
            <Text style={styles.valueUnit}>cm</Text>
          </View>

          {sensorData.distance.length > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Historique (10 dernières valeurs)</Text>
              <LineChart
                data={getDistanceChartData()}
                width={screenWidth - 2 * spacing.lg - 2 * spacing.lg}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: colors.success,
                  },
                }}
                bezier
                style={styles.chart}
                withInnerLines={false}
                withOuterLines={true}
                withVerticalLabels={true}
                withHorizontalLabels={true}
              />
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Moyenne</Text>
              <Text style={styles.statValue}>
                {(sensorData.distance.reduce((a, b) => a + b.distanceCm, 0) /
                  sensorData.distance.length || 0).toFixed(1)} cm
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Minimum</Text>
              <Text style={styles.statValue}>
                {Math.min(...sensorData.distance.map(d => d.distanceCm), Infinity).toFixed(1)} cm
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Échantillons</Text>
              <Text style={styles.statValue}>{sensorData.distance.length}</Text>
            </View>
          </View>
        </View>

        {/* Motion Section */}
        <View style={[styles.sensorSection, shadows.md]}>
          <View style={styles.sensorHeader}>
            <View style={[styles.sensorIcon, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="walk" size={24} color={colors.warning} />
            </View>
            <View style={styles.sensorHeaderText}>
              <Text style={styles.sensorTitle}>Détection de mouvement</Text>
              <Text style={styles.sensorSubtitle}>ESP_MOT_001</Text>
            </View>
          </View>

          <View style={styles.motionStats}>
            <View style={styles.motionStatItem}>
              <Text style={styles.motionStatLabel}>Total Détections</Text>
              <Text style={styles.motionStatValue}>
                {sensorData.motion.filter(m => m.motionDetected).length}
              </Text>
            </View>
            <View style={styles.motionStatItem}>
              <Text style={styles.motionStatLabel}>Total Échantillons</Text>
              <Text style={styles.motionStatValue}>{sensorData.motion.length}</Text>
            </View>
          </View>

          <View style={styles.motionHistory}>
            <Text style={styles.historyTitle}>Dernières détections</Text>
            {sensorData.motion.filter(m => m.motionDetected).slice(0, 5).length > 0 ? (
              sensorData.motion.filter(m => m.motionDetected).slice(0, 5).map((motion, index) => (
                <View key={index} style={styles.historyItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.warning} />
                  <Text style={styles.historyTime}>
                    {new Date(motion.recordedAt).toLocaleString('fr-FR')}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noHistory}>Aucune détection récente</Text>
            )}
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
  sensorSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sensorIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sensorHeaderText: {
    flex: 1,
  },
  sensorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  sensorSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
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
  currentValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.lg,
  },
  valueNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  valueUnit: {
    fontSize: 24,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  chartContainer: {
    marginBottom: spacing.lg,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  chart: {
    borderRadius: borderRadius.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent[500],
  },
  motionStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  motionStatItem: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  motionStatLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  motionStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent[500],
  },
  motionHistory: {
    marginTop: spacing.md,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  historyTime: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  noHistory: {
    fontSize: 13,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});