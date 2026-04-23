import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { PieChart } from 'react-native-gifted-charts';
import { useTheme } from '../../constants/theme';
import { FontFamily, FontSize } from '../../constants/typography';
import { Radius, Shadow, Spacing } from '../../constants/spacing';
import { AppHeader } from '../../components/layout/AppHeader';
import { MetricCard } from '../../components/forecast/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppStore } from '../../store/useAppStore';
import type { StringKey } from '../../i18n/strings';

const TIME_FILTER_KEYS: StringKey[] = ['forecast.filter.3m', 'forecast.filter.6m', 'forecast.filter.1y'];

// Fixed design colors — do not swap with theme (same rule as chart bar colors)
const PIE_PAID = '#4edea3';
const PIE_REMAINING = '#00113a';

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `EGP ${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `EGP ${(value / 1_000).toFixed(1)}K`;
  return `EGP ${value.toLocaleString()}`;
}

export function ForecastScreen() {
  const [activeFilter, setActiveFilter] = useState(0);
  const tabBarHeight = useBottomTabBarHeight();
  const theme = useTheme();
  const { t } = useTranslation();
  const properties = useAppStore((s) => s.properties);
  const portfolioSummary = useAppStore((s) => s.portfolioSummary);
  const fetchPortfolioSummary = useAppStore((s) => s.fetchPortfolioSummary);

  useEffect(() => {
    fetchPortfolioSummary();
  }, [fetchPortfolioSummary]);

  const localTotalValue = useMemo(() => properties.reduce((sum, p) => sum + p.totalPrice, 0), [properties]);
  const localTotalPaid = useMemo(() => properties.reduce((sum, p) => sum + p.paidAmount, 0), [properties]);

  const totalValue = portfolioSummary?.totalValue ?? localTotalValue;
  const totalPaid = portfolioSummary?.totalPaid ?? localTotalPaid;
  const totalRemaining = portfolioSummary?.totalRemaining ?? Math.max(totalValue - totalPaid, 0);
  // Server returns paidPct as an already-rounded integer percentage (0–100).
  const paidPct = portfolioSummary
    ? portfolioSummary.paidPct
    : totalValue > 0
    ? Math.round((totalPaid / totalValue) * 100)
    : 0;

  // Total expected obligations within the active filter window (3/6/12 months).
  const totalExpected = useMemo(() => {
    const monthsAhead = [3, 6, 12][activeFilter] ?? 3;
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth() + monthsAhead, now.getDate());
    const endIso = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
    const nowIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return properties.reduce((sum, p) => {
      for (const inst of p.installments) {
        if (inst.status !== 'paid' && inst.dueDate >= nowIso && inst.dueDate <= endIso) {
          sum += inst.amount;
        }
      }
      return sum;
    }, 0);
  }, [properties, activeFilter]);

  const upcomingInstallments = useMemo(() => {
    return properties
      .flatMap((p) =>
        p.installments.map((i) => ({
          id: `${p.id}-${i.id}`,
          assetName: p.name,
          description: i.paymentType === 'maintenance'
            ? t('installment.label.maintenance')
            : i.paymentType === 'receipt'
            ? t('installment.label.receipt')
            : t('installment.label.installment', { n: i.installmentNumber }),
          amount: i.amount,
          dueDate: i.dueDate,
          status: i.status,
        }))
      )
      .filter((i) => i.status === 'upcoming')
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5);
  }, [properties, t]);

  const pieData = useMemo(() => [
    { value: totalPaid, color: PIE_PAID },
    { value: Math.max(totalRemaining, 0), color: PIE_REMAINING },
  ], [totalPaid, totalRemaining]);

  const totalsRows = [
    { label: t('forecast.totalPropertyValue'), value: formatCurrency(totalValue), dot: null },
    { label: t('forecast.totalPaid'), value: formatCurrency(totalPaid), dot: PIE_PAID },
    { label: t('forecast.totalRemaining'), value: formatCurrency(totalRemaining), dot: PIE_REMAINING },
  ];

  return (
    <View style={[styles.root, { backgroundColor: theme.surface }]}>
      <AppHeader />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.primary }]}>{t('forecast.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.onSurfaceVariant }]}>
          {t('forecast.subtitle')}
        </Text>

        {/* Time filter */}
        <View style={[styles.filterRow, { backgroundColor: theme.surfaceContainerLow }]}>
          {TIME_FILTER_KEYS.map((f, i) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterBtn,
                i === activeFilter && [styles.filterBtnActive, { backgroundColor: theme.surfaceContainerLowest }],
              ]}
              onPress={() => setActiveFilter(i)}
            >
              <Text style={[
                styles.filterText,
                { color: theme.onSurfaceVariant },
                i === activeFilter && [styles.filterTextActive, { color: theme.primary }],
              ]}>
                {t(f)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Total Expected card */}
        <MetricCard label={t('forecast.totalExpected')} value={totalExpected} />

        {/* Portfolio Totals card */}
        <View style={[styles.totalsCard, { backgroundColor: theme.surfaceContainerLowest }]}>
          <View style={styles.totalsInner}>
            {/* Donut chart */}
            <View style={styles.donutWrapper}>
              <PieChart
                donut
                data={pieData}
                radius={60}
                innerRadius={44}
                innerCircleColor={theme.surfaceContainerLowest}
                strokeWidth={0}
                centerLabelComponent={() => (
                  <Text style={[styles.donutLabel, { color: theme.primary }]}>{paidPct}%</Text>
                )}
              />
            </View>

            {/* Rows */}
            <View style={styles.totalsRows}>
              <Text style={[styles.totalsTitle, { color: theme.primary }]}>
                {t('forecast.portfolioTotals')}
              </Text>
              {totalsRows.map((row) => (
                <View key={row.label} style={styles.totalsRow}>
                  <View style={styles.totalsLabelRow}>
                    {row.dot !== null && (
                      <View style={[styles.totalsDot, { backgroundColor: row.dot }]} />
                    )}
                    <Text style={[styles.totalsLabel, { color: theme.onSurfaceVariant }]}>
                      {row.label}
                    </Text>
                  </View>
                  <Text style={[styles.totalsValue, { color: theme.primary }]}>{row.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Upcoming installments */}
        <View style={[styles.tableSection, { backgroundColor: theme.surfaceContainerLowest }]}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableTitle, { color: theme.primary }]}>{t('forecast.upcomingMajor')}</Text>
          </View>
          {upcomingInstallments.map((item) => (
            <View key={item.id} style={[styles.tableRow, { borderTopColor: theme.surfaceContainerLow }]}>
              <View style={[styles.tableThumb, { backgroundColor: theme.surfaceContainerLow }]}>
                <Text style={styles.tableThumbText}>🏢</Text>
              </View>
              <View style={styles.tableInfo}>
                <Text style={[styles.tableAsset, { color: theme.primary }]}>{item.assetName}</Text>
                <Text style={[styles.tableDesc, { color: theme.onSurfaceVariant }]}>{item.description}</Text>
              </View>
              <View style={styles.tableRight}>
                <Text style={[styles.tableAmount, { color: theme.primary }]}>EGP {item.amount.toLocaleString()}</Text>
                <Text style={[styles.tableDate, { color: theme.onSurfaceVariant }]}>{item.dueDate}</Text>
                <StatusBadge status={item.status} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: Spacing.xl },
  title: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.xl,
    letterSpacing: -1,
    paddingTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  filterRow: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: 4,
    marginBottom: Spacing.xl,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  filterBtnActive: { ...Shadow.card },
  filterText: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.xs,
  },
  filterTextActive: { fontFamily: FontFamily.interSemiBold },
  subMetrics: { marginTop: Spacing.lg },
  subMetric: { marginBottom: Spacing.md },
  subMetricHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  subMetricLabel: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
  },
  subMetricValue: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.sm,
  },
  miniBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    backgroundColor: '#4edea3',
    borderRadius: 2,
  },
  // Portfolio Totals card
  totalsCard: {
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadow.card,
  },
  totalsInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  donutWrapper: {
    width: 124,
    height: 124,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutLabel: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.base,
  },
  totalsRows: {
    flex: 1,
  },
  totalsTitle: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.md,
    marginBottom: Spacing.md,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  totalsLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: Spacing.sm,
  },
  totalsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  totalsLabel: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    flex: 1,
  },
  totalsValue: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.xs,
  },
  // Upcoming installments table
  tableSection: {
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    ...Shadow.card,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  tableTitle: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.md,
  },
  viewAll: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.sm,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  tableThumb: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  tableThumbText: { fontSize: 18 },
  tableInfo: { flex: 1 },
  tableAsset: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.sm,
  },
  tableDesc: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
  },
  tableRight: { alignItems: 'flex-end' },
  tableAmount: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.base,
  },
  tableDate: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xxs,
    marginBottom: 4,
  },
});
