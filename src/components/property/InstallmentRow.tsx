import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Installment, PaymentType } from '../../types/models';
import { useTheme } from '../../constants/theme';
import { FontFamily, FontSize } from '../../constants/typography';
import { Radius, Spacing } from '../../constants/spacing';
import { StatusBadge } from '../ui/StatusBadge';
import { useTranslation } from '../../hooks/useTranslation';

interface Props {
  installment: Installment;
  onMarkPaid?: (id: string) => void | Promise<void>;
}

export function InstallmentRow({ installment, onMarkPaid }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [isMarking, setIsMarking] = useState(false);

  const handleMarkPaid = async () => {
    if (!onMarkPaid || isMarking) return;
    try {
      setIsMarking(true);
      await onMarkPaid(installment.id);
    } catch {
      // error is surfaced via store; just release the loader
    } finally {
      setIsMarking(false);
    }
  };
  const type: PaymentType = installment.paymentType ?? 'installment';
  const isUpcoming = installment.status === 'upcoming';
  const isPending = installment.status === 'pending';
  const isReceipt = type === 'receipt';

  const typeColors: Record<PaymentType, string> = {
    installment: theme.primary,
    maintenance: '#d97706',
    // Receipts are the final handover payment — same weight as a regular installment.
    receipt: theme.primary,
  };

  const markLabel = t('installment.markPaid');

  const subLabel =
    type === 'maintenance'
      ? t('installment.label.maintenance')
      : type === 'receipt'
      ? t('installment.label.receipt')
      : t('installment.label.installment', { n: installment.installmentNumber ?? '' });

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surfaceContainerLowest },
        isUpcoming && { borderWidth: 2, borderColor: theme.primaryContainer + '30' },
        isPending && styles.pendingCard,
        isReceipt && { borderLeftWidth: 3, borderLeftColor: theme.tertiaryFixedDim + '60' },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.dateCol}>
          <Text style={[styles.date, { color: theme.primary }]}>{installment.dueDate}</Text>
          <Text style={[styles.subLabel, { color: typeColors[type] }]}>{subLabel}</Text>
        </View>

        <View style={styles.amountCol}>
          <Text style={[styles.amount, { color: theme.primary }, isUpcoming && styles.amountLarge]}>
            {installment.amount.toLocaleString()}
          </Text>
        </View>

        <View style={styles.statusCol}>
          {installment.status === 'paid' ? (
            <View style={styles.paidBadge}>
              <Text style={[styles.paidIcon, { color: theme.tertiaryFixedDim }]}>✓</Text>
              <Text style={[styles.paidText, { color: theme.tertiaryFixedDim }]}>{t('installment.status.paid')}</Text>
            </View>
          ) : (
            <StatusBadge status={installment.status} />
          )}
        </View>
      </View>

      {isUpcoming && onMarkPaid && (
        <TouchableOpacity
          style={[styles.markPaidBtn, { backgroundColor: theme.primary }, isMarking && styles.markPaidBtnDisabled]}
          onPress={handleMarkPaid}
          disabled={isMarking}
          activeOpacity={0.85}
        >
          {isMarking ? (
            <ActivityIndicator color={theme.onPrimary} size="small" />
          ) : (
            <Text style={[styles.markPaidText, { color: theme.onPrimary }]}>{markLabel}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  pendingCard: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateCol: {
    flex: 1,
  },
  date: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.base,
  },
  subLabel: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  amountCol: {
    flex: 1,
    alignItems: 'center',
  },
  amount: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.base,
  },
  amountLarge: {
    fontSize: FontSize.md,
  },
  statusCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paidIcon: {
    fontSize: 14,
  },
  paidText: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.xxs,
    letterSpacing: 0.6,
  },
  markPaidBtn: {
    marginTop: Spacing.md,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  markPaidBtnDisabled: {
    opacity: 0.7,
  },
  markPaidText: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.sm,
  },
});
