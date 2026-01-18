import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
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

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const { alerts, loading, refreshData, acknowledgeAlert, resolveAlert } = useSensors();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const acknowledgedAlerts = alerts.filter(a => a.status === 'acknowledged');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.info;
      default:
        return colors.text.secondary;
    }
  };

  const getTypeIcon = (type: 'microphone' | 'distance' | 'motion') => {
    switch (type) {
      case 'microphone':
        return 'mic';
      case 'distance':
        return 'resize';
      case 'motion':
        return 'walk';
    }
  };

  const getTypeLabel = (type: 'microphone' | 'distance' | 'motion') => {
    switch (type) {
      case 'microphone':
        return 'Microphone';
      case 'distance':
        return 'Distance';
      case 'motion':
        return 'Mouvement';
    }
  };

  const AlertCard = ({ alert }: { alert: any }) => {
    const severityColor = getSeverityColor(alert.severity);
    
    return (
      <View style={[styles.alertCard, shadows.md]}>
        <View style={styles.alertLeft}>
          <View style={[styles.severityIndicator, { backgroundColor: severityColor }]} />
          <View style={styles.alertContent}>
            <View style={styles.alertHeader}>
              <View style={styles.alertTypeRow}>
                <View style={[styles.alertIconContainer, { backgroundColor: severityColor + '15' }]}>
                  <Ionicons name={getTypeIcon(alert.type)} size={16} color={severityColor} />
                </View>
                <Text style={styles.alertType}>{getTypeLabel(alert.type)}</Text>
              </View>
              <View style={styles.deviceBadge}>
                <Text style={styles.deviceText}>{alert.deviceId}</Text>
              </View>
            </View>
            
            <Text style={styles.alertMessage}>{alert.message}</Text>
            
            <View style={styles.alertFooter}>
              <View style={styles.alertTime}>
                <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
                <Text style={styles.alertTimeText}>
                  {new Date(alert.timestamp).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>

            {alert.status === 'active' && (
              <View style={styles.alertActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.acknowledgeButton,
                    pressed && styles.actionButtonPressed,
                  ]}
                  onPress={() => acknowledgeAlert(alert.id, alert.type)}
                >
                  <Ionicons name="checkmark" size={16} color={colors.surface} />
                  <Text style={styles.actionButtonText}>Traiter</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.resolveButton,
                    pressed && styles.actionButtonPressed,
                  ]}
                  onPress={() => resolveAlert(alert.id, alert.type)}
                >
                  <Ionicons name="close" size={16} color={colors.surface} />
                  <Text style={styles.actionButtonText}>Résoudre</Text>
                </Pressable>
              </View>
            )}

            {alert.status === 'acknowledged' && (
              <View style={styles.alertActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.resolveButton,
                    pressed && styles.actionButtonPressed,
                  ]}
                  onPress={() => resolveAlert(alert.id, alert.type)}
                >
                  <Ionicons name="checkmark-done" size={16} color={colors.surface} />
                  <Text style={styles.actionButtonText}>Résoudre</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.accent[300]} />
        <Text style={styles.loadingText}>Chargement des alertes...</Text>
      </View>
    );
  }

  if (alerts.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, styles.centered]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent[300]}
              colors={[colors.accent[300]]}
            />
          }
        >
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="notifications-off-outline" size={64} color={colors.text.tertiary} />
            </View>
            <Text style={styles.emptyText}>Aucune alerte</Text>
            <Text style={styles.emptySubtext}>Tout va bien ! 👍</Text>
          </View>
        </ScrollView>
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
        {/* Stats Header */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { borderLeftColor: colors.error }]}>
            <Text style={styles.statNumber}>{activeAlerts.length}</Text>
            <Text style={styles.statLabel}>Actives</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: colors.warning }]}>
            <Text style={styles.statNumber}>{acknowledgedAlerts.length}</Text>
            <Text style={styles.statLabel}>Traitées</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: colors.success }]}>
            <Text style={styles.statNumber}>{resolvedAlerts.length}</Text>
            <Text style={styles.statLabel}>Résolues</Text>
          </View>
        </View>

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionDot, { backgroundColor: colors.error }]} />
                <Text style={styles.sectionTitle}>Alertes actives</Text>
              </View>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{activeAlerts.length}</Text>
              </View>
            </View>
            {activeAlerts.map((alert) => (
              <AlertCard key={`${alert.type}-${alert.id}`} alert={alert} />
            ))}
          </View>
        )}

        {/* Acknowledged Alerts */}
        {acknowledgedAlerts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionDot, { backgroundColor: colors.warning }]} />
                <Text style={styles.sectionTitle}>Alertes traitées</Text>
              </View>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{acknowledgedAlerts.length}</Text>
              </View>
            </View>
            {acknowledgedAlerts.map((alert) => (
              <AlertCard key={`${alert.type}-${alert.id}`} alert={alert} />
            ))}
          </View>
        )}

        {/* Resolved Alerts */}
        {resolvedAlerts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionDot, { backgroundColor: colors.success }]} />
                <Text style={styles.sectionTitle}>Alertes résolues</Text>
              </View>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{resolvedAlerts.length}</Text>
              </View>
            </View>
            {resolvedAlerts.map((alert) => (
              <AlertCard key={`${alert.type}-${alert.id}`} alert={alert} />
            ))}
          </View>
        )}
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
    flex: 1,
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
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  sectionBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.text.tertiary,
  },
  alertCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  alertLeft: {
    flexDirection: 'row',
  },
  severityIndicator: {
    width: 4,
  },
  alertContent: {
    flex: 1,
    padding: spacing.lg,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  alertTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  alertIconContainer: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertType: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  deviceBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
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
  alertMessage: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  alertFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  alertTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  alertTimeText: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  alertActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  acknowledgeButton: {
    backgroundColor: colors.warning,
  },
  resolveButton: {
    backgroundColor: colors.success,
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  actionButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
});