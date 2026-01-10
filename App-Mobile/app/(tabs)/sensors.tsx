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
        data: data.map(d => d.value),
      }],
    };
  };

  const getDistanceChartData = () => {
    const data = sensorData.distance.slice(0, 10).reverse();
    return {
      labels: data.map((_, i) => `${i + 1}`),
      datasets: [{
        data: data.map(d => d.value),
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
    if (cm > 100) return { label: 'Dégagé', color: colors.success };
    if (cm > 50) return { label: 'Approche', color: colors.warning };
    if (cm > 20) return { label: 'Proche', color: colors.error };
    return { label: 'Très proche', color: colors.error };
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.accent[300]} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const latestMic = sensorData.microphone[0]?.value || 0;
  const latestDist = sensorData.distance[0]?.value || 0;
  const latestMotion = sensorData.motion[0]?.value || false;
  const micStatus = getDecibelStatus(latestMic);
  const distStatus = getDistanceStatus(latestDist);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent[300]} />
      }
    >
      {/* Microphone Sensor */}
      <View style={styles.sensorCard}>
        <View style={styles.sensorHeader}>
          <View style={styles.sensorIcon}>
            <Ionicons name="mic" size={24} color={colors.accent[500]} />
          </View>
          <View style={styles.sensorInfo}>
            <Text style={styles.sensorTitle}>Microphone</Text>
            <Text style={styles.sensorDevice}>ESP_001</Text>
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

        {sensorData.microphone.length >= 2 && (
          <View style={styles.chartContainer}>
            <LineChart
              data={getMicrophoneChartData()}
              width={screenWidth - spacing.lg * 4}
              height={180}
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

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Moyenne</Text>
            <Text style={styles.statValue}>
              {(sensorData.microphone.reduce((a, b) => a + b.value, 0) / sensorData.microphone.length || 0).toFixed(1)} dB
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Maximum</Text>
            <Text style={styles.statValue}>
              {Math.max(...sensorData.microphone.map(d => d.value), 0).toFixed(1)} dB
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Mesures</Text>
            <Text style={styles.statValue}>{sensorData.microphone.length}</Text>
          </View>
        </View>
      </View>

      {/* Distance Sensor */}
      <View style={styles.sensorCard}>
        <View style={styles.sensorHeader}>
          <View style={styles.sensorIcon}>
            <Ionicons name="expand" size={24} color={colors.accent[500]} />
          </View>
          <View style={styles.sensorInfo}>
            <Text style={styles.sensorTitle}>Capteur de distance</Text>
            <Text style={styles.sensorDevice}>ESP_002</Text>
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

        {sensorData.distance.length >= 2 && (
          <View style={styles.chartContainer}>
            <LineChart
              data={getDistanceChartData()}
              width={screenWidth - spacing.lg * 4}
              height={180}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
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

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Moyenne</Text>
            <Text style={styles.statValue}>
              {(sensorData.distance.reduce((a, b) => a + b.value, 0) / sensorData.distance.length || 0).toFixed(1)} cm
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Minimum</Text>
            <Text style={styles.statValue}>
              {Math.min(...sensorData.distance.map(d => d.value), 0).toFixed(1)} cm
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Mesures</Text>
            <Text style={styles.statValue}>{sensorData.distance.length}</Text>
          </View>
        </View>
      </View>

      {/* Motion Sensor */}
      <View style={styles.sensorCard}>
        <View style={styles.sensorHeader}>
          <View style={styles.sensorIcon}>
            <Ionicons name="walk" size={24} color={colors.accent[500]} />
          </View>
          <View style={styles.sensorInfo}>
            <Text style={styles.sensorTitle}>Détecteur de mouvement</Text>
            <Text style={styles.sensorDevice}>ESP_004</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: latestMotion ? colors.error + '20' : colors.success + '20' }]}>
            <Text style={[styles.statusText, { color: latestMotion ? colors.error : colors.success }]}>
              {latestMotion ? 'Mouvement' : 'Aucun'}
            </Text>
          </View>
        </View>

        <View style={styles.motionStatus}>
          <View style={[
            styles.motionIndicator,
            { backgroundColor: latestMotion ? colors.error : colors.success }
          ]}>
            <Ionicons name={latestMotion ? "warning" : "checkmark-circle"} size={48} color={colors.surface} />
          </View>
          <Text style={styles.motionText}>
            {latestMotion ? 'Mouvement détecté !' : 'Aucun mouvement'}
          </Text>
        </View>

        <View style={styles.motionHistory}>
          <Text style={styles.historyTitle}>Détections récentes</Text>
          {sensorData.motion.filter(m => m.value).slice(0, 5).map((motion, index) => (
            <View key={index} style={styles.historyItem}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.historyTime}>
                {new Date(motion.recordedAt).toLocaleString('fr-FR')}
              </Text>
            </View>
          ))}
          {sensorData.motion.filter(m => m.value).length === 0 && (
            <Text style={styles.noHistory}>Aucune détection récente</Text>
          )}
        </View>
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
  sensorCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sensorIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensorInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  sensorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  sensorDevice: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  currentValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  valueNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text.primary,
  },
  valueUnit: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  chart: {
    borderRadius: borderRadius.md,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.primary[100],
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  motionStatus: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  motionIndicator: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  motionText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  motionHistory: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.primary[100],
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