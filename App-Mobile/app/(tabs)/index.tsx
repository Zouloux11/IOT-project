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
      r: '2',
      strokeWidth: '1',
      stroke: colors.accent[500],
    },
  };

  const getMicrophoneChartData = () => {
    const data = [...sensorData.microphone].reverse();
    return {
      labels: data.map((_, i) => (i % 20 === 0 ? i.toString() : '')),
      datasets: [{
        data: data.length > 0 ? data.map(d => d.decibels) : [0],
      }],
    };
  };

  const getDistanceChartData = () => {
    const data = [...sensorData.distance].reverse();
    return {
      labels: data.map((_, i) => (i % 20 === 0 ? i.toString() : '')),
      datasets: [{
        data: data.length > 0 ? data.map(d => d.distanceCm) : [0],
      }],
    };
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.accent[300]} />
      </View>
    );
  }

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
        {/* Microphone */}
        <View style={[styles.card, shadows.sm]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Microphone</Text>
            <View style={styles.deviceBadge}>
              <Text style={styles.deviceText}>ESP_001</Text>
            </View>
          </View>

          {sensorData.microphone.length > 0 && (
            <View style={styles.chartContainer}>
              <LineChart
                data={getMicrophoneChartData()}
                width={screenWidth - 2 * spacing.lg - 2 * spacing.lg}
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

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {sensorData.microphone.length} échantillons
            </Text>
            <Text style={styles.footerText}>
              {sensorData.microphone[0]
                ? new Date(sensorData.microphone[0].recordedAt).toLocaleTimeString('fr-FR')
                : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Distance */}
        <View style={[styles.card, shadows.sm]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Distance</Text>
            <View style={styles.deviceBadge}>
              <Text style={styles.deviceText}>ESP_002</Text>
            </View>
          </View>

          {sensorData.distance.length > 0 && (
            <View style={styles.chartContainer}>
              <LineChart
                data={getDistanceChartData()}
                width={screenWidth - 2 * spacing.lg - 2 * spacing.lg}
                height={180}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                  propsForDots: {
                    r: '2',
                    strokeWidth: '1',
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

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {sensorData.distance.length} échantillons
            </Text>
            <Text style={styles.footerText}>
              {sensorData.distance[0]
                ? new Date(sensorData.distance[0].recordedAt).toLocaleTimeString('fr-FR')
                : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Motion */}
        <View style={[styles.card, shadows.sm]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Détection de mouvement</Text>
            <View style={styles.deviceBadge}>
              <Text style={styles.deviceText}>ESP_004</Text>
            </View>
          </View>

          <View style={styles.motionStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Détections</Text>
              <Text style={styles.statValue}>{totalMotionDetections}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Échantillons</Text>
              <Text style={styles.statValue}>{sensorData.motion.length}</Text>
            </View>
          </View>

          <View style={styles.motionList}>
            {sensorData.motion.filter(m => m.motionDetected).slice(0, 5).length > 0 ? (
              sensorData.motion
                .filter(m => m.motionDetected)
                .slice(0, 5)
                .map((motion, index) => (
                  <View key={index} style={styles.motionItem}>
                    <View style={styles.motionDot} />
                    <Text style={styles.motionTime}>
                      {new Date(motion.recordedAt).toLocaleString('fr-FR')}
                    </Text>
                  </View>
                ))
            ) : (
              <Text style={styles.emptyText}>Aucune détection</Text>
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  deviceBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  deviceText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.text.secondary,
    fontWeight: '500',
  },
  chartContainer: {
    marginBottom: spacing.md,
  },
  chart: {
    borderRadius: borderRadius.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.primary[100],
  },
  footerText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  motionStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
  },
  motionList: {
    gap: spacing.sm,
  },
  motionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  motionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent[500],
  },
  motionTime: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  emptyText: {
    fontSize: 13,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});