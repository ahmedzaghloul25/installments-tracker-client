import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';
import type { PropertiesStackParamList } from '../../types/navigation';
import type { PaymentType } from '../../types/models';
import { useTheme } from '../../constants/theme';
import { FontFamily, FontSize } from '../../constants/typography';
import { Radius, Shadow, Spacing } from '../../constants/spacing';
import { AppHeader } from '../../components/layout/AppHeader';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { InstallmentRow } from '../../components/property/InstallmentRow';
import { GradientButton } from '../../components/ui/GradientButton';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../hooks/useTranslation';
import type { StringKey } from '../../i18n/strings';

type RouteType = RouteProp<PropertiesStackParamList, 'PropertyDetail'>;

const PAYMENT_TYPE_ORDER: PaymentType[] = ['installment', 'maintenance', 'receipt'];

const TYPE_SECTION_LABEL_KEYS: Record<PaymentType, StringKey> = {
  installment: 'propertyDetail.section.installments',
  maintenance: 'propertyDetail.section.maintenance',
  receipt: 'propertyDetail.section.receipts',
};

export function PropertyDetailScreen() {
  const route = useRoute<RouteType>();
  const navigation = useNavigation();
  const { propertyId } = route.params;
  const property = useAppStore((s) => s.properties.find((p) => p.id === propertyId));
  const markPaid = useAppStore((s) => s.markInstallmentPaid);
  const tabBarHeight = useBottomTabBarHeight();
  const theme = useTheme();
  const { t } = useTranslation();

  if (!property) return null;

  const receiptTotal = property.installments
    .filter((i) => i.paymentType === 'receipt')
    .reduce((sum, i) => sum + i.amount, 0);

  const displayedTotal = property.totalPrice + receiptTotal;
  const remaining = displayedTotal - property.paidAmount;
  const paidPercentage = displayedTotal > 0 ? property.paidAmount / displayedTotal : 0;

  const TYPE_SECTION_COLORS: Record<PaymentType, string> = {
    installment: theme.primary,
    maintenance: '#d97706',
    receipt: theme.tertiaryFixedDim,
  };

  const grouped = PAYMENT_TYPE_ORDER
    .map((type) => ({
      type,
      items: property.installments.filter(
        (i) => (i.paymentType ?? 'installment') === type
      ),
    }))
    .filter((g) => g.items.length > 0);

  const hasMultipleTypes = grouped.length > 1;

  return (
    <View style={[styles.root, { backgroundColor: theme.surface }]}>
      <AppHeader showBack onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + Spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header area */}
        <View style={styles.headerArea}>
          <View style={[styles.activeBadge, { backgroundColor: theme.tertiaryFixed }]}>
            <View style={[styles.greenDot, { backgroundColor: theme.onTertiaryFixedVariant }]} />
            <Text style={[styles.activeBadgeText, { color: theme.onTertiaryFixedVariant }]}>{t('propertyDetail.active')}</Text>
          </View>
          <Text style={[styles.propertyName, { color: theme.primary }]}>{property.name}</Text>
          <Text style={[styles.location, { color: theme.onSurfaceVariant }]}>📍 {property.location}</Text>

          <View style={styles.actionRow}>
            <GradientButton
              title={t('propertyDetail.viewContract')}
              onPress={() => Alert.alert(t('propertyDetail.comingSoon'))}
              outlined
              style={styles.halfBtn}
            />
          </View>
        </View>

        {/* Summary card */}
        <View style={[styles.summaryCard, { backgroundColor: theme.surfaceContainerLowest }]}>
          <Text style={styles.watermark}>🏦</Text>
          <Text style={[styles.summaryLabel, { color: theme.onSurfaceVariant }]}>{t('propertyDetail.totalValue')}</Text>
          <Text style={[styles.summaryValue, { color: theme.primary }]}>EGP {displayedTotal.toLocaleString()}</Text>

          <View style={styles.paidRow}>
            <View style={[styles.dot, { backgroundColor: theme.tertiaryFixedDim }]} />
            <Text style={[styles.metaLabel, { color: theme.onSurfaceVariant }]}>{t('propertyDetail.paidAmount')}</Text>
            <Text style={[styles.metaValue, { color: theme.primary }]}>EGP {property.paidAmount.toLocaleString()}</Text>
          </View>

          <View style={styles.progressWrapper}>
            <ProgressBar progress={paidPercentage} height={8} showGlow />
          </View>

          <View style={styles.remainRow}>
            <View style={[styles.dot, { backgroundColor: theme.outlineVariant }]} />
            <Text style={[styles.metaLabel, { color: theme.onSurfaceVariant }]}>{t('propertyDetail.remaining')}</Text>
            <Text style={[styles.metaValue, { color: theme.primary }]}>EGP {remaining.toLocaleString()}</Text>
          </View>
        </View>

        {/* Installment schedule */}
        <View style={[styles.scheduleSection, { backgroundColor: theme.surfaceContainerLow }]}>
          <Text style={[styles.scheduleTitle, { color: theme.primary }]}>{t('propertyDetail.paymentSchedule')}</Text>
          <View style={styles.columnHeaders}>
            <Text style={[styles.colHeader, { color: theme.onSurfaceVariant }]}>{t('propertyDetail.col.dueDate')}</Text>
            <Text style={[styles.colHeader, { color: theme.onSurfaceVariant }]}>{t('propertyDetail.col.amount')}</Text>
            <Text style={[styles.colHeader, { color: theme.onSurfaceVariant }]}>{t('propertyDetail.col.status')}</Text>
          </View>

          {grouped.map(({ type, items }) => (
            <View key={type}>
              {hasMultipleTypes && (
                <View style={styles.typeHeaderRow}>
                  <View style={[styles.typeHeaderDot, { backgroundColor: TYPE_SECTION_COLORS[type] }]} />
                  <Text style={[styles.typeHeaderText, { color: TYPE_SECTION_COLORS[type] }]}>
                    {t(TYPE_SECTION_LABEL_KEYS[type])}
                  </Text>
                </View>
              )}
              {items.map((inst) => (
                <InstallmentRow
                  key={inst.id}
                  installment={inst}
                  onMarkPaid={(id) => markPaid(property.id, id)}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  headerArea: { paddingVertical: Spacing.xl },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  greenDot: { width: 6, height: 6, borderRadius: 3 },
  activeBadgeText: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.xxs,
    letterSpacing: 0.8,
  },
  propertyName: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.lg,
    letterSpacing: -1,
    marginBottom: Spacing.xs,
  },
  location: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    marginBottom: Spacing.xl,
  },
  actionRow: { flexDirection: 'row', gap: Spacing.md },
  halfBtn: { flex: 1 },
  summaryCard: {
    borderRadius: Radius.lg,
    padding: Spacing.xxxl,
    marginBottom: Spacing.xl,
    ...Shadow.card,
    position: 'relative',
    overflow: 'hidden',
  },
  watermark: {
    position: 'absolute',
    top: Spacing.xl,
    right: Spacing.xl,
    fontSize: 60,
    opacity: 0.06,
  },
  summaryLabel: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.xs,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  summaryValue: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.xl,
    letterSpacing: -1,
    marginBottom: Spacing.lg,
  },
  paidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  remainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  metaLabel: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    flex: 1,
  },
  metaValue: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.sm,
  },
  progressWrapper: { marginVertical: Spacing.sm },
  scheduleSection: {
    borderRadius: Radius.lg,
    padding: Spacing.xl,
  },
  scheduleTitle: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.xl,
    marginBottom: Spacing.lg,
  },
  columnHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  colHeader: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.xxs,
    letterSpacing: 0.8,
    flex: 1,
    textAlign: 'center',
  },
  typeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  typeHeaderDot: { width: 8, height: 8, borderRadius: 4 },
  typeHeaderText: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.xs,
    letterSpacing: 0.6,
  },
});
