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

export default function DashboardScreen() {
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
      r: '3',
      strokeWidth: '2',
      stroke: colors.accent[500],
    },
  };

  const getMicrophoneChartData = () => {
    const data = [...sensorData.microphone].reverse();
    return {
      labels: data.map((_, i) => (i % 10 === 0 ? i.toString() : '')),
      datasets: [{
        data: data.length > 0 ? data.map(d => d.decibels) : [0],
      }],
    };
  };

  const getDistanceChartData = () => {
    const data = [...sensorData.distance].reverse();
    return {
      labels: data.map((_, i) => (i % 10 === 0 ? i.toString() : '')),
      datasets: [{
        data: data.length > 0 ? data.map(d => d.distanceCm) : [0],
      }],
    };
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
  const avgMic = sensorData.microphone.length > 0
    ? sensorData.microphone.reduce((sum, d) => sum + d.decibels, 0) / sensorData.microphone.length
    : 0;
  const maxMic = sensorData.microphone.length > 0
    ? Math.max(...sensorData.microphone.map(d => d.decibels))
    : 0;
  const minMic = sensorData.microphone.length > 0
    ? Math.min(...sensorData.microphone.map(d => d.decibels))
    : 0;

  const avgDist = sensorData.distance.length > 0
    ? sensorData.distance.reduce((sum, d) => sum + d.distanceCm, 0) / sensorData.distance.length
    : 0;
  const maxDist = sensorData.distance.length > 0
    ? Math.max(...sensorData.distance.map(d => d.distanceCm))
    : 0;
  const minDist = sensorData.distance.length > 0
    ? Math.min(...sensorData.distance.map(d => d.distanceCm))
    : 0;

  const totalMotionDetections = sensorData.motion.filter(m => m.motionDetected).length;

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
        <View style={[styles.card, shadows.md]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.cardTitle}>Microphone</Text>
              <View style={styles.deviceBadge}>
                <Text style={styles.deviceText}>ESP_001</Text>
              </View>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Actuel</Text>
              <Text style={[styles.metricValue, styles.metricValueLarge]}>
                {latestMic.toFixed(1)}
              </Text>
              <Text style={styles.metricUnit}>dB</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Moyenne</Text>
              <Text style={styles.metricValue}>{avgMic.toFixed(1)}</Text>
              <Text style={styles.metricUnit}>dB</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Max</Text>
              <Text style={styles.metricValue}>{maxMic.toFixed(1)}</Text>
              <Text style={styles.metricUnit}>dB</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Min</Text>
              <Text style={styles.metricValue}>{minMic.toFixed(1)}</Text>
              <Text style={styles.metricUnit}>dB</Text>
            </View>
          </View>

          {sensorData.microphone.length > 0 && (
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>
                Dernières {sensorData.microphone.length} mesures
              </Text>
              <LineChart
                data={getMicrophoneChartData()}
                width={screenWidth - 2 * spacing.lg - 2 * spacing.lg}
                height={200}
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

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Échantillons</Text>
              <Text style={styles.infoValue}>{sensorData.microphone.length}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Dernière mise à jour</Text>
              <Text style={styles.infoValue}>
                {sensorData.microphone[0]
                  ? new Date(sensorData.microphone[0].recordedAt).toLocaleTimeString('fr-FR')
                  : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Distance Section */}
        <View style={[styles.card, shadows.md]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.cardTitle}>Distance</Text>
              <View style={styles.deviceBadge}>
                <Text style={styles.deviceText}>ESP_002</Text>
              </View>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Actuel</Text>
              <Text style={[styles.metricValue, styles.metricValueLarge]}>
                {latestDist.toFixed(1)}
              </Text>
              <Text style={styles.metricUnit}>cm</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Moyenne</Text>
              <Text style={styles.metricValue}>{avgDist.toFixed(1)}</Text>
              <Text style={styles.metricUnit}>cm</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Max</Text>
              <Text style={styles.metricValue}>{maxDist.toFixed(1)}</Text>
              <Text style={styles.metricUnit}>cm</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Min</Text>
              <Text style={styles.metricValue}>{minDist.toFixed(1)}</Text>
              <Text style={styles.metricUnit}>cm</Text>
            </View>
          </View>

          {sensorData.distance.length > 0 && (
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>
                Dernières {sensorData.distance.length} mesures
              </Text>
              <LineChart
                data={getDistanceChartData()}
                width={screenWidth - 2 * spacing.lg - 2 * spacing.lg}
                height={200}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                  propsForDots: {
                    r: '3',
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

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Échantillons</Text>
              <Text style={styles.infoValue}>{sensorData.distance.length}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Dernière mise à jour</Text>
              <Text style={styles.infoValue}>
                {sensorData.distance[0]
                  ? new Date(sensorData.distance[0].recordedAt).toLocaleTimeString('fr-FR')
                  : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Motion Section */}
        <View style={[styles.card, shadows.md]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.cardTitle}>Détection de mouvement</Text>
              <View style={styles.deviceBadge}>
                <Text style={styles.deviceText}>ESP_004</Text>
              </View>
            </View>
          </View>

          <View style={styles.motionStats}>
            <View style={styles.motionStatBox}>
              <Text style={styles.motionStatLabel}>Total Détections</Text>
              <Text style={styles.motionStatValue}>{totalMotionDetections}</Text>
            </View>
            <View style={styles.motionStatBox}>
              <Text style={styles.motionStatLabel}>Total Échantillons</Text>
              <Text style={styles.motionStatValue}>{sensorData.motion.length}</Text>
            </View>
          </View>

          <View style={styles.motionHistory}>
            <Text style={styles.chartTitle}>Dernières détections</Text>
            {sensorData.motion.filter(m => m.motionDetected).slice(0, 10).length > 0 ? (
              sensorData.motion
                .filter(m => m.motionDetected)
                .slice(0, 10)
                .map((motion, index) => (
                  <View key={index} style={styles.historyItem}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.warning} />
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    marginBottom: spacing.lg,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  deviceBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  deviceText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.text.secondary,
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  metricLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  metricValueLarge: {
    fontSize: 24,
  },
  metricUnit: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  chartSection: {
    marginBottom: spacing.lg,
  },
  chartTitle: {
    fontSize: 12,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  chart: {
    borderRadius: borderRadius.md,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  infoItem: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  infoLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
  },
  motionStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  motionStatBox: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  motionStatLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  motionStatValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.accent[500],
  },
  motionHistory: {
    gap: spacing.xs,
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
    paddingVertical: spacing.lg,
  },
});