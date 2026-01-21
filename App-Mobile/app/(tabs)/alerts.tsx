import React, { useState } from 'react';
import {
  ActivityIndicator,
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
  const { alerts, loading, refreshData } = useSensors();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.error;
      case 'acknowledged':
        return colors.warning;
      case 'resolved':
        return colors.success;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'acknowledged':
        return 'Traité';
      case 'resolved':
        return 'Résolu';
      default:
        return status;
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

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.accent[300]} />
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
          <Text style={styles.emptyTitle}>Aucune alerte</Text>
          <Text style={styles.emptySubtext}>Tout est normal</Text>
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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Alertes</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{alerts.length}</Text>
          </View>
        </View>

        {alerts.map((alert) => (
          <View key={`${alert.type}-${alert.id}`} style={[styles.alertCard, shadows.sm]}>
            <View style={styles.alertHeader}>
              <View style={styles.alertInfo}>
                <Text style={styles.alertType}>{getTypeLabel(alert.type)}</Text>
                <View style={styles.deviceBadge}>
                  <Text style={styles.deviceText}>{alert.deviceId}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(alert.status) },
                ]}
              >
                <Text style={styles.statusText}>{getStatusLabel(alert.status)}</Text>
              </View>
            </View>

            <Text style={styles.alertMessage}>{alert.message}</Text>

            <Text style={styles.alertTime}>
              {new Date(alert.timestamp).toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ))}
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  countBadge: {
    backgroundColor: colors.accent[500],
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  countText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyTitle: {
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
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  alertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  alertType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  deviceBadge: {
    backgroundColor: colors.background,
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
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  alertMessage: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  alertTime: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
});