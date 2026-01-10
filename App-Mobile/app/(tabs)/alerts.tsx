import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, shadows, spacing } from '../../constants/theme';
import { useSensors } from '../../contexts/SensorContext';

interface Alert {
  id: string;
  type: 'microphone' | 'distance' | 'motion';
  severity: 'low' | 'medium' | 'high';
  message: string;
  value: number | boolean;
  timestamp: string;
  deviceId: string;
  acknowledged: boolean;
}

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const { sensorData, loading, refreshData } = useSensors();
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    generateAlerts();
    setRefreshing(false);
  };

  const generateAlerts = () => {
    const newAlerts: Alert[] = [];

    // Microphone alerts
    sensorData.microphone.forEach((mic, index) => {
      if (mic.value > 80) {
        newAlerts.push({
          id: `mic-${index}`,
          type: 'microphone',
          severity: mic.value > 100 ? 'high' : 'medium',
          message: `Niveau sonore élevé détecté: ${mic.value.toFixed(1)} dB`,
          value: mic.value,
          timestamp: mic.recordedAt,
          deviceId: 'ESP_001',
          acknowledged: false,
        });
      }
    });

    // Distance alerts
    sensorData.distance.forEach((dist, index) => {
      if (dist.value < 30) {
        newAlerts.push({
          id: `dist-${index}`,
          type: 'distance',
          severity: dist.value < 10 ? 'high' : 'medium',
          message: `Obstacle très proche: ${dist.value.toFixed(1)} cm`,
          value: dist.value,
          timestamp: dist.recordedAt,
          deviceId: 'ESP_002',
          acknowledged: false,
        });
      }
    });

    // Motion alerts
    sensorData.motion.forEach((motion, index) => {
      if (motion.value) {
        newAlerts.push({
          id: `motion-${index}`,
          type: 'motion',
          severity: 'high',
          message: 'Mouvement détecté',
          value: motion.value,
          timestamp: motion.recordedAt,
          deviceId: 'ESP_004',
          acknowledged: false,
        });
      }
    });

    setAlerts(newAlerts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  };

  React.useEffect(() => {
    generateAlerts();
  }, [sensorData]);

  const acknowledgeAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.info;
      default: return colors.text.tertiary;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'microphone': return 'mic';
      case 'distance': return 'expand';
      case 'motion': return 'walk';
      default: return 'alert-circle';
    }
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
      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Résumé des alertes</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: colors.error }]}>
              {alerts.filter(a => a.severity === 'high').length}
            </Text>
            <Text style={styles.summaryLabel}>Critiques</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: colors.warning }]}>
              {alerts.filter(a => a.severity === 'medium').length}
            </Text>
            <Text style={styles.summaryLabel}>Moyennes</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: colors.info }]}>
              {alerts.filter(a => a.severity === 'low').length}
            </Text>
            <Text style={styles.summaryLabel}>Faibles</Text>
          </View>
        </View>
      </View>

      {/* Alerts List */}
      <Text style={styles.sectionTitle}>
        Alertes ({alerts.filter(a => !a.acknowledged).length} non traitées)
      </Text>

      {alerts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle-outline" size={64} color={colors.success} />
          <Text style={styles.emptyText}>Aucune alerte active</Text>
          <Text style={styles.emptySubtext}>Tous vos capteurs fonctionnent normalement</Text>
        </View>
      ) : (
        alerts.map((alert) => (
          <Pressable
            key={alert.id}
            style={({ pressed }) => [
              styles.alertCard,
              alert.acknowledged && styles.alertAcknowledged,
              pressed && styles.alertPressed,
            ]}
            onPress={() => acknowledgeAlert(alert.id)}
          >
            <View style={[styles.alertIndicator, { backgroundColor: getSeverityColor(alert.severity) }]} />
            
            <View style={styles.alertIcon}>
              <Ionicons 
                name={getTypeIcon(alert.type)} 
                size={24} 
                color={getSeverityColor(alert.severity)} 
              />
            </View>

            <View style={styles.alertContent}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                {!alert.acknowledged && (
                  <View style={[styles.badge, { backgroundColor: getSeverityColor(alert.severity) + '20' }]}>
                    <Text style={[styles.badgeText, { color: getSeverityColor(alert.severity) }]}>
                      Nouveau
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.alertMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="hardware-chip-outline" size={12} color={colors.text.tertiary} />
                  <Text style={styles.metaText}>{alert.deviceId}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={12} color={colors.text.tertiary} />
                  <Text style={styles.metaText}>
                    {new Date(alert.timestamp).toLocaleString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: 'short',
                    })}
                  </Text>
                </View>
              </View>

              {alert.acknowledged && (
                <View style={styles.acknowledgedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                  <Text style={styles.acknowledgedText}>Traitée</Text>
                </View>
              )}
            </View>
          </Pressable>
        ))
      )}
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
    gap: spacing.md,
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
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  alertCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    ...shadows.sm,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  alertAcknowledged: {
    opacity: 0.6,
  },
  alertPressed: {
    opacity: 0.8,
  },
  alertIndicator: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    borderTopLeftRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.lg,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  alertMessage: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 20,
  },
  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.xs,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  alertMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
  acknowledgedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  acknowledgedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});