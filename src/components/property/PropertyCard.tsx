import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Property } from '../../types/models';
import { useTheme } from '../../constants/theme';
import { FontFamily, FontSize } from '../../constants/typography';
import { Radius, Shadow, Spacing } from '../../constants/spacing';
import { ProgressBar } from '../ui/ProgressBar';
import { useTranslation } from '../../hooks/useTranslation';

interface Props {
  property: Property;
  onPress: () => void;
}


function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `EGP ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `EGP ${(n / 1_000).toFixed(1)}K`;
  return `EGP ${n.toLocaleString()}`;
}

export function PropertyCard({ property, onPress }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();

  const nextDue = useMemo(() => {
    return property.installments
      .filter((i) => i.status !== 'paid')
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0] ?? null;
  }, [property.installments]);

  const nextDueDate = nextDue?.dueDate ?? '—';
  const nextDueAmount = nextDue?.amount ?? 0;
  const isFullyPaid = !nextDue;

  const isDueThisMonth = useMemo(() => {
    if (!nextDue) return false;
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return nextDue.dueDate.startsWith(prefix);
  }, [nextDue]);

  const alertColor = '#d97706';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surfaceContainerLowest },
        isDueThisMonth && { borderLeftWidth: 3, borderLeftColor: alertColor },
      ]}
    >
      <View style={[styles.imageContainer, { backgroundColor: theme.surfaceContainer }]}>
        <View style={[styles.imagePlaceholder, { backgroundColor: theme.surfaceContainerHigh }]}>
          <Text style={styles.imagePlaceholderText}>🏢</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.name, { color: theme.primary }]} numberOfLines={1}>{property.name}</Text>
          <View style={styles.dueDateCol}>
            <View style={styles.dueDateLabelRow}>
              {isDueThisMonth && (
                <View style={[styles.alertPill, { backgroundColor: alertColor + '1F' }]}>
                  <Text style={[styles.alertPillText, { color: alertColor }]}>
                    {t('properties.dueThisMonth')}
                  </Text>
                </View>
              )}
              <Text style={[styles.dueDateLabel, { color: theme.onSurfaceVariant }]}>{t('properties.nextDue')}</Text>
            </View>
            <Text style={[styles.dueDateValue, { color: isDueThisMonth ? alertColor : theme.primary }]}>
              {isFullyPaid ? t('properties.allPaid') : nextDueDate}
            </Text>
          </View>
        </View>

        <Text style={[styles.location, { color: theme.onSurfaceVariant }]}>📍 {property.location}</Text>
        <Text style={[styles.developer, { color: theme.onSurfaceVariant }]}>{property.developer}</Text>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: theme.onSurfaceVariant }]}>{t('properties.paymentProgress')}</Text>
            <Text style={[styles.progressPercent, { color: theme.tertiaryFixedDim }]}>
              {Math.round(property.paidPercentage * 100)}%
            </Text>
          </View>
          <Text style={[styles.progressAmount, { color: theme.primary }]}>
            {formatCurrency(property.paidAmount)} / {formatCurrency(property.totalPrice)}
          </Text>
          <View style={styles.progressBarWrapper}>
            <ProgressBar progress={property.paidPercentage} height={8} showGlow />
          </View>
        </View>

        <TouchableOpacity style={[styles.installmentBox, { backgroundColor: theme.surfaceContainerLow }]} onPress={onPress} activeOpacity={0.85}>
          <View>
            <Text style={[styles.installmentLabel, { color: theme.onSurfaceVariant }]}>{t('properties.installments')}</Text>
            {isFullyPaid ? (
              <Text style={[styles.installmentAmount, { color: theme.tertiaryFixedDim }]}>{t('properties.allPaid')}</Text>
            ) : (
              <Text style={[styles.installmentAmount, { color: theme.primary }]}>EGP {nextDueAmount.toLocaleString()}</Text>
            )}
          </View>
          <View style={[styles.chevronBtn, { backgroundColor: theme.primary }]}>
            <Text style={[styles.chevron, { color: theme.onPrimary }]}>›</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
    ...Shadow.card,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 80,
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 48,
  },
  content: {
    padding: Spacing.xl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  name: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.md,
    flex: 1,
    marginRight: Spacing.sm,
  },
  dueDateCol: {
    alignItems: 'flex-end',
  },
  dueDateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  alertPill: {
    borderRadius: Radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  alertPillText: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: 9,
    letterSpacing: 0.6,
  },
  dueDateLabel: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.xxs,
    letterSpacing: 0.6,
  },
  dueDateValue: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.xs,
  },
  location: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    marginBottom: 2,
  },
  developer: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
  },
  progressSection: {
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.xs,
  },
  progressPercent: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.xs,
  },
  progressAmount: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.md,
    marginBottom: Spacing.sm,
  },
  progressBarWrapper: {
    marginTop: 4,
  },
  installmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  installmentLabel: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.xxs,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  installmentAmount: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.md,
  },
  chevronBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: 22,
    marginTop: -2,
  },
});
