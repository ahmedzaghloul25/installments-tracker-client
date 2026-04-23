import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../constants/theme';
import { FontFamily, FontSize } from '../../constants/typography';
import { Radius, Shadow, Spacing } from '../../constants/spacing';

interface Props {
  label: string;
  value: number;
  trend?: string;
  children?: React.ReactNode;
}

export function MetricCard({ label, value, trend, children }: Props) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.surfaceContainerLowest }]}>
      <Text style={[styles.watermark, { color: theme.primary }]}>⬡</Text>

      <Text style={[styles.label, { color: theme.onSurfaceVariant }]}>{label.toUpperCase()}</Text>
      <Text style={[styles.value, { color: theme.primary }]}>EGP {value.toLocaleString()}</Text>
      {trend && (
        <View style={styles.trendRow}>
          <Text style={[styles.trendIcon, { color: theme.tertiaryFixedDim }]}>↑</Text>
          <Text style={[styles.trendText, { color: theme.tertiaryFixedDim }]}>{trend}</Text>
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.xxxl,
    ...Shadow.card,
    overflow: 'hidden',
    position: 'relative',
  },
  watermark: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    fontSize: 60,
    opacity: 0.06,
  },
  label: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.xxs,
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
  },
  value: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.xxl,
    letterSpacing: -1,
    marginBottom: Spacing.sm,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendIcon: {
    fontSize: 14,
  },
  trendText: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.sm,
  },
});
