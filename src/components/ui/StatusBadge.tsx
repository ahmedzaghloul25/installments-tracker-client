import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PaymentStatus } from '../../types/models';
import { useTheme } from '../../constants/theme';
import { FontFamily, FontSize } from '../../constants/typography';
import { Radius, Spacing } from '../../constants/spacing';
import { useTranslation } from '../../hooks/useTranslation';

interface Props {
  status: PaymentStatus;
}

export function StatusBadge({ status }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();

  const config: Record<PaymentStatus, { bg?: string; text: string; labelKey: Parameters<typeof t>[0] }> = {
    paid: {
      bg: theme.tertiaryFixedDim + '20',
      text: theme.tertiaryFixedDim,
      labelKey: 'status.paid',
    },
    upcoming: {
      bg: theme.primaryFixed,
      text: theme.primary,
      labelKey: 'status.upcoming',
    },
    pending: {
      bg: undefined,
      text: theme.onSurfaceVariant,
      labelKey: 'status.pending',
    },
  };

  const c = config[status];
  return (
    <View style={[styles.badge, c.bg ? { backgroundColor: c.bg } : undefined]}>
      <Text style={[styles.label, { color: c.text }]}>{t(c.labelKey)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-end',
  },
  label: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.xxs,
    letterSpacing: 0.8,
  },
});
