import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PropertiesStackParamList } from '../../types/navigation';
import { useTheme } from '../../constants/theme';
import { FontFamily, FontSize } from '../../constants/typography';
import { Radius, Spacing } from '../../constants/spacing';
import { AppHeader } from '../../components/layout/AppHeader';
import { GradientButton } from '../../components/ui/GradientButton';
import { DateField } from '../../components/ui/DateField';
import { useAppStore } from '../../store/useAppStore';
import {
  FrequencyType,
  PaymentType,
} from '../../types/models';
import type { CreatePropertyDto, ExtraScheduleDto } from '../../api/types';
import { format } from 'date-fns';
import { useTranslation } from '../../hooks/useTranslation';
import type { StringKey } from '../../i18n/strings';

type Nav = NativeStackNavigationProp<PropertiesStackParamList>;

interface ScheduleFormData {
  id: string;
  label: string;
  paymentType: PaymentType;
  frequency: FrequencyType;
  startDate: Date;
  amount: string;
  count: string;
}

const FREQUENCIES: FrequencyType[] = ['monthly', 'quarterly', 'semi-annual', 'annual'];
const PAYMENT_TYPES: PaymentType[] = ['installment', 'maintenance', 'receipt'];

const TYPE_ICONS: Record<PaymentType, string> = {
  installment: '🏦',
  maintenance: '🔧',
  receipt: '💰',
};

const TYPE_LABEL_KEYS: Record<PaymentType, StringKey> = {
  installment: 'contract.paymentType.installment',
  maintenance: 'contract.paymentType.maintenance',
  receipt: 'contract.paymentType.receipt',
};

const FREQ_LABEL_KEYS: Record<FrequencyType, StringKey> = {
  monthly: 'contract.frequency.monthly',
  quarterly: 'contract.frequency.quarterly',
  'semi-annual': 'contract.frequency.semiAnnual',
  annual: 'contract.frequency.annual',
};

const DEFAULT_LABEL_KEYS: Record<PaymentType, StringKey> = {
  installment: 'contract.defaultLabel.installment',
  maintenance: 'contract.defaultLabel.maintenance',
  receipt: 'contract.defaultLabel.receipt',
};

let scheduleCounter = 0;
function makeSchedule(type: PaymentType, defaultLabel: string): ScheduleFormData {
  scheduleCounter += 1;
  return {
    id: `sch-${Date.now()}-${scheduleCounter}`,
    label: defaultLabel,
    paymentType: type,
    frequency: 'monthly',
    startDate: new Date(),
    amount: '',
    count: '12',
  };
}

export function AddNewContractScreen() {
  const navigation = useNavigation<Nav>();
  const addProperty = useAppStore((s) => s.addProperty);
  const tabBarHeight = useBottomTabBarHeight();
  const theme = useTheme();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [developer, setDeveloper] = useState('');
  const [location, setLocation] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [schedules, setSchedules] = useState<ScheduleFormData[]>(() => [makeSchedule('installment', t(DEFAULT_LABEL_KEYS.installment))]);
  const [activeFreqId, setActiveFreqId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const TYPE_COLORS: Record<PaymentType, string> = {
    installment: theme.primary,
    maintenance: '#d97706',
    receipt: theme.tertiaryFixedDim,
  };

  const updateSchedule = (id: string, patch: Partial<ScheduleFormData>) => {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const addSchedule = () => {
    setSchedules((prev) => [...prev, makeSchedule('installment', t(DEFAULT_LABEL_KEYS.installment))]);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = t('contract.error.name');
    if (!developer.trim()) e.developer = t('contract.error.developer');
    if (!totalPrice || isNaN(Number(totalPrice))) e.totalPrice = t('contract.error.price');
    if (!downPayment || isNaN(Number(downPayment))) e.downPayment = t('contract.error.down');
    schedules.forEach((s) => {
      if (!s.amount || isNaN(Number(s.amount))) e[`${s.id}_amount`] = t('contract.error.required');
      if (!s.count || isNaN(Number(s.count)) || Number(s.count) < 1) e[`${s.id}_count`] = t('contract.error.required');
    });

    // Sum check: schedules (amount × count) + down payment should equal totalPrice.
    const totalNum = Number(totalPrice);
    const downNum = Number(downPayment);
    if (
      Number.isFinite(totalNum) &&
      Number.isFinite(downNum) &&
      !e.totalPrice &&
      !e.downPayment
    ) {
      const scheduledSum = schedules.reduce((sum, s) => {
        const amt = Number(s.amount);
        const cnt = Number(s.count);
        if (!Number.isFinite(amt) || !Number.isFinite(cnt)) return sum;
        return sum + amt * cnt;
      }, 0);
      const expected = totalNum - downNum;
      if (Math.abs(scheduledSum - expected) > 1) {
        e.schedulesTotal = t('contract.error.sumMismatch', {
          expected: expected.toLocaleString(),
          actual: scheduledSum.toLocaleString(),
        });
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const total = Number(totalPrice);
    const down = Number(downPayment);

    // Primary schedule = first installment-type schedule (or fallback to the first one).
    const primaryIdx = Math.max(0, schedules.findIndex((s) => s.paymentType === 'installment'));
    const primary = schedules[primaryIdx] ?? schedules[0];
    const extras: ExtraScheduleDto[] = schedules
      .filter((_, i) => i !== primaryIdx)
      .map((s) => ({
        label: s.label.trim(),
        paymentType: s.paymentType,
        frequency: s.frequency,
        startDate: format(s.startDate, 'yyyy-MM-dd'),
        count: Number(s.count),
        amount: Number(s.amount),
      }));

    const dto: CreatePropertyDto = {
      name: name.trim(),
      developer: developer.trim(),
      location: location.trim() || 'New Property',
      totalPrice: total,
      downPayment: down,
      startDate: format(primary.startDate, 'yyyy-MM-dd'),
      frequency: primary.frequency,
      numberOfInstallments: Number(primary.count),
      installmentAmount: Number(primary.amount),
      primaryScheduleLabel: primary.label.trim() || undefined,
      extraSchedules: extras.length ? extras : undefined,
    };

    setSubmitting(true);
    try {
      await addProperty(dto);
      Alert.alert(t('contract.success.title'), t('contract.success.body'), [
        { text: 'OK', onPress: () => navigation.navigate('PropertiesList') },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to save contract';
      Alert.alert(t('contract.success.title'), msg);
    } finally {
      setSubmitting(false);
    }
  };

  const activeSchedule = schedules.find((s) => s.id === activeFreqId);

  return (
    <View style={[styles.root, { backgroundColor: theme.surface }]}>
      <AppHeader showBack onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: theme.primary }]}>{t('contract.title')}</Text>

        <Text style={[styles.sectionHeader, { color: theme.onSurfaceVariant }]}>{t('contract.propertyDetails')}</Text>
        <View style={[styles.formCard, { backgroundColor: theme.surfaceContainerLowest, borderColor: theme.outlineVariant + '26' }]}>
          <FormField label={t('contract.field.name')} value={name} onChange={setName} placeholder={t('contract.placeholder.name')} error={errors.name} theme={theme} />
          <FormField label={t('contract.field.developer')} value={developer} onChange={setDeveloper} placeholder={t('contract.placeholder.developer')} error={errors.developer} theme={theme} />
          <FormField label={t('contract.field.location')} value={location} onChange={setLocation} placeholder={t('contract.placeholder.location')} theme={theme} />
          <FormField label={t('contract.field.totalPrice')} value={totalPrice} onChange={setTotalPrice} placeholder="0" keyboardType="numeric" prefix="EGP" error={errors.totalPrice} theme={theme} />
          <FormField label={t('contract.field.downPayment')} value={downPayment} onChange={setDownPayment} placeholder="0" keyboardType="numeric" prefix="EGP" error={errors.downPayment} last theme={theme} />
        </View>

        <Text style={[styles.sectionHeader, { color: theme.onSurfaceVariant }]}>{t('contract.paymentSchedules')}</Text>

        {schedules.map((s, idx) => (
          <View key={s.id} style={[styles.scheduleCard, { backgroundColor: theme.surfaceContainerLowest, borderColor: theme.outlineVariant + '26' }]}>
            <View style={[styles.scheduleCardHeader, { borderBottomColor: theme.outlineVariant + '20' }]}>
              <Text style={[styles.scheduleCardTitle, { color: theme.primary }]}>{t('contract.scheduleN', { n: idx + 1 })}</Text>
              {schedules.length > 1 && (
                <TouchableOpacity onPress={() => removeSchedule(s.id)} style={styles.removeBtn}>
                  <Text style={[styles.removeBtnText, { color: theme.error }]}>{t('contract.remove')}</Text>
                </TouchableOpacity>
              )}
            </View>

            <FormField label={t('contract.field.scheduleLabel')} value={s.label} onChange={(v) => updateSchedule(s.id, { label: v })} placeholder={t('contract.placeholder.scheduleLabel')} theme={theme} />

            <View style={styles.typeGroup}>
              <Text style={[styles.fieldLabel, { color: theme.onSurfaceVariant }]}>{t('contract.field.paymentType')}</Text>
              <View style={styles.typeRow}>
                {PAYMENT_TYPES.map((type) => {
                  const active = s.paymentType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeBtn,
                        { borderColor: theme.outlineVariant + '50', backgroundColor: theme.surfaceContainer },
                        active && { backgroundColor: TYPE_COLORS[type] + '18', borderColor: TYPE_COLORS[type] },
                      ]}
                      onPress={() => updateSchedule(s.id, { paymentType: type })}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.typeIcon}>{TYPE_ICONS[type]}</Text>
                      <Text style={[styles.typeBtnText, { color: active ? TYPE_COLORS[type] : theme.onSurfaceVariant }, active && styles.typeBtnTextActive]}>
                        {t(TYPE_LABEL_KEYS[type])}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <DateField label={t('contract.field.startDate')} value={s.startDate} onChange={(d) => updateSchedule(s.id, { startDate: d })} />

            <View style={styles.typeGroup}>
              <Text style={[styles.fieldLabel, { color: theme.onSurfaceVariant }]}>{t('contract.field.frequency')}</Text>
              <TouchableOpacity style={[styles.inputRow, { backgroundColor: theme.surfaceContainer }]} onPress={() => setActiveFreqId(s.id)} activeOpacity={0.7}>
                <Text style={[styles.inputText, { color: theme.onSurface }]}>{t(FREQ_LABEL_KEYS[s.frequency])}</Text>
                <Text style={[styles.chevron, { color: theme.onSurfaceVariant }]}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.halfRow}>
              <View style={styles.halfLeft}>
                <Text style={[styles.fieldLabel, { color: theme.onSurfaceVariant }]}>{s.paymentType === 'receipt' ? t('contract.field.amountReceived') : t('contract.field.amount')}</Text>
                <View style={[styles.inputRow, { backgroundColor: theme.surfaceContainer }, errors[`${s.id}_amount`] ? { borderWidth: 1, borderColor: theme.error + '80' } : undefined]}>
                  <Text style={[styles.prefix, { color: theme.onSurfaceVariant }]}>EGP</Text>
                  <TextInput style={[styles.input, { color: theme.onSurface }]} value={s.amount} onChangeText={(v) => updateSchedule(s.id, { amount: v })} placeholder="0" placeholderTextColor={theme.outlineVariant} keyboardType="numeric" />
                </View>
                {errors[`${s.id}_amount`] ? <Text style={[styles.errorText, { color: theme.error }]}>{errors[`${s.id}_amount`]}</Text> : null}
              </View>
              <View style={styles.halfRight}>
                <Text style={[styles.fieldLabel, { color: theme.onSurfaceVariant }]}>{t('contract.field.count')}</Text>
                <View style={[styles.inputRow, { backgroundColor: theme.surfaceContainer }, errors[`${s.id}_count`] ? { borderWidth: 1, borderColor: theme.error + '80' } : undefined]}>
                  <TextInput style={[styles.input, { color: theme.onSurface }]} value={s.count} onChangeText={(v) => updateSchedule(s.id, { count: v })} placeholder="12" placeholderTextColor={theme.outlineVariant} keyboardType="numeric" />
                </View>
                {errors[`${s.id}_count`] ? <Text style={[styles.errorText, { color: theme.error }]}>{errors[`${s.id}_count`]}</Text> : null}
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={[styles.addScheduleBtn, { borderColor: theme.primaryContainer + '40' }]} onPress={addSchedule} activeOpacity={0.7}>
          <Text style={[styles.addScheduleText, { color: theme.primaryContainer }]}>{t('contract.addSchedule')}</Text>
        </TouchableOpacity>

        {errors.schedulesTotal ? (
          <Text style={[styles.errorText, { color: theme.error, marginBottom: Spacing.md, textAlign: 'center' }]}>
            {errors.schedulesTotal}
          </Text>
        ) : null}

        <GradientButton title={t('contract.save')} onPress={handleSubmit} loading={submitting} style={styles.submitBtn} />
        <Text style={[styles.helperText, { color: theme.outlineVariant }]}>
          {t('contract.helper')}
        </Text>
      </ScrollView>

      <Modal visible={activeFreqId !== null} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setActiveFreqId(null)} activeOpacity={1}>
          <View style={[styles.modalBox, { backgroundColor: theme.surfaceContainerLowest }]}>
            <Text style={[styles.modalTitle, { color: theme.primary }]}>{t('contract.selectFrequency')}</Text>
            {FREQUENCIES.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.modalOption, activeSchedule?.frequency === f && { backgroundColor: theme.primaryFixed }]}
                onPress={() => { if (activeFreqId) updateSchedule(activeFreqId, { frequency: f }); setActiveFreqId(null); }}
              >
                <Text style={[styles.modalOptionText, { color: theme.onSurface }, activeSchedule?.frequency === f && { color: theme.primary, fontFamily: FontFamily.interSemiBold }]}>
                  {t(FREQ_LABEL_KEYS[f])}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  prefix?: string;
  error?: string;
  last?: boolean;
  theme: ReturnType<typeof useTheme>;
}

function FormField({ label, value, onChange, placeholder, keyboardType, prefix, error, last, theme }: FormFieldProps) {
  return (
    <View style={[styles.fieldGroup, last && { marginBottom: 0 }]}>
      <Text style={[styles.fieldLabel, { color: theme.onSurfaceVariant }]}>{label}</Text>
      <View style={[styles.inputRow, { backgroundColor: theme.surfaceContainer }, error ? { borderWidth: 1, borderColor: theme.error + '80' } : undefined]}>
        {prefix ? <Text style={[styles.prefix, { color: theme.onSurfaceVariant }]}>{prefix}</Text> : null}
        <TextInput
          style={[styles.input, { color: theme.onSurface }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={theme.outlineVariant}
          keyboardType={keyboardType}
        />
      </View>
      {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl },
  title: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.hero,
    letterSpacing: -1,
    paddingTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  sectionHeader: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.xxs,
    letterSpacing: 1.4,
    marginBottom: Spacing.md,
    marginTop: Spacing.xl,
  },
  formCard: {
    borderRadius: Radius.lg,
    padding: Spacing.xxxl,
    borderWidth: 1,
  },
  scheduleCard: {
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  scheduleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  scheduleCardTitle: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.xs,
    letterSpacing: 1,
  },
  removeBtn: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  removeBtnText: { fontFamily: FontFamily.interMedium, fontSize: FontSize.xs },
  fieldGroup: { marginBottom: Spacing.xl },
  fieldLabel: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.xxs,
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
  },
  inputText: {
    flex: 1,
    paddingVertical: Spacing.lg,
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.base,
    textTransform: 'capitalize',
  },
  chevron: { fontSize: 12 },
  prefix: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.sm,
    marginRight: Spacing.xs,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.lg,
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.base,
  },
  errorText: {
    fontFamily: FontFamily.interRegular,
    fontSize: 12,
    marginTop: 4,
  },
  typeGroup: { marginBottom: Spacing.xl },
  typeRow: { flexDirection: 'row', gap: Spacing.sm },
  typeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 4,
  },
  typeIcon: { fontSize: 16 },
  typeBtnText: { fontFamily: FontFamily.interMedium, fontSize: 11, textAlign: 'center' },
  typeBtnTextActive: { fontFamily: FontFamily.interSemiBold },
  halfRow: { flexDirection: 'row', gap: Spacing.md },
  halfLeft: { flex: 1, marginBottom: Spacing.xl },
  halfRight: { flex: 1, marginBottom: Spacing.xl },
  addScheduleBtn: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    borderStyle: 'dashed',
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.xs,
  },
  addScheduleText: { fontFamily: FontFamily.manropeBold, fontSize: FontSize.base },
  submitBtn: { marginBottom: Spacing.md },
  helperText: {
    fontFamily: FontFamily.interRegular,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: Spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    borderRadius: Radius.lg,
    padding: Spacing.xxxl,
    width: '80%',
  },
  modalTitle: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.lg,
    marginBottom: Spacing.lg,
  },
  modalOption: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    marginBottom: Spacing.xs,
  },
  modalOptionText: { fontFamily: FontFamily.interMedium, fontSize: FontSize.base },
});
