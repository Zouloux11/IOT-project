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

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const { alerts, loading, refreshData, acknowledgeAlert, resolveAlert } = useSensors();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleAcknowledge = async (id: number, type: 'microphone' | 'distance' | 'motion') => {
    await acknowledgeAlert(id, type);
  };

  const handleResolve = async (id: number, type: 'microphone' | 'distance' | 'motion') => {
    await resolveAlert(id, type);
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

  // Filtrer pour n'afficher que les alertes non résolues
  const activeAlerts = alerts.filter(a => a.status !== 'resolved');

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
              {activeAlerts.filter(a => a.severity === 'high').length}
            </Text>
            <Text style={styles.summaryLabel}>Critiques</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: colors.warning }]}>
              {activeAlerts.filter(a => a.severity === 'medium').length}
            </Text>
            <Text style={styles.summaryLabel}>Moyennes</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: colors.success }]}>
              {activeAlerts.filter(a => a.status === 'acknowledged').length}
            </Text>
            <Text style={styles.summaryLabel}>Traitées</Text>
          </View>
        </View>
      </View>

      {/* Alerts List */}
      <Text style={styles.sectionTitle}>
        Alertes ({activeAlerts.filter(a => a.status === 'active').length} actives)
      </Text>

      {activeAlerts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle-outline" size={64} color={colors.success} />
          <Text style={styles.emptyText}>Aucune alerte active</Text>
          <Text style={styles.emptySubtext}>Tous vos capteurs fonctionnent normalement</Text>
        </View>
      ) : (
        activeAlerts.map((alert) => (
          <View
            key={`${alert.type}-${alert.id}`}
            style={[
              styles.alertCard,
              alert.status !== 'active' && styles.alertAcknowledged,
            ]}
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
                {alert.status === 'active' && (
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

              <View style={styles.alertActions}>
                {alert.status === 'active' && (
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => handleAcknowledge(alert.id, alert.type)}
                  >
                    <Ionicons name="checkmark-circle-outline" size={16} color={colors.accent[500]} />
                    <Text style={styles.actionText}>Traiter</Text>
                  </Pressable>
                )}
                {alert.status === 'acknowledged' && (
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => handleResolve(alert.id, alert.type)}
                  >
                    <Ionicons name="close-circle-outline" size={16} color={colors.success} />
                    <Text style={styles.actionText}>Résoudre</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
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
    marginBottom: spacing.sm,
  },
  alertAcknowledged: {
    opacity: 0.7,
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
    marginBottom: spacing.sm,
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
  alertActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.sm,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent[500],
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