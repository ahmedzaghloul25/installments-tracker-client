import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useTheme } from '../../constants/theme';
import { FontFamily, FontSize } from '../../constants/typography';
import { Radius, Spacing } from '../../constants/spacing';
import { useTranslation } from '../../hooks/useTranslation';

interface Props {
  label: string;
  value: Date;
  onChange: (d: Date) => void;
  error?: string;
}

export function DateField({ label, value, onChange, error }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState(value);

  const handlePress = () => {
    setTempDate(value);
    setShow(true);
  };

  return (
    <View style={styles.group}>
      <Text style={[styles.label, { color: theme.onSurfaceVariant }]}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.inputRow,
          { backgroundColor: theme.surfaceContainer },
          error ? { borderWidth: 1, borderColor: theme.error + '80' } : undefined,
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={[styles.dateText, { color: theme.onSurface }]}>{format(value, 'MMM d, yyyy')}</Text>
        <Text style={styles.calIcon}>📅</Text>
      </TouchableOpacity>
      {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}

      {Platform.OS === 'android' && show && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onChange={(_: unknown, date?: Date) => {
            setShow(false);
            if (date) onChange(date);
          }}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal visible={show} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { backgroundColor: theme.surfaceContainerLowest }]}>
              <View style={[styles.sheetActions, { borderBottomColor: theme.outlineVariant + '30' }]}>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={[styles.cancelText, { color: theme.onSurfaceVariant }]}>{t('date.cancel')}</Text>
                </TouchableOpacity>
                <Text style={[styles.sheetTitle, { color: theme.primary }]}>{t('date.selectDate')}</Text>
                <TouchableOpacity
                  onPress={() => {
                    onChange(tempDate);
                    setShow(false);
                  }}
                >
                  <Text style={[styles.doneText, { color: theme.primary }]}>{t('date.done')}</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={(_: unknown, date?: Date) => {
                  if (date) setTempDate(date);
                }}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    marginBottom: Spacing.xl,
  },
  label: {
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
    paddingVertical: Spacing.lg,
  },
  dateText: {
    flex: 1,
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.base,
  },
  calIcon: {
    fontSize: 16,
  },
  errorText: {
    fontFamily: FontFamily.interRegular,
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingBottom: Spacing.xxxl,
  },
  sheetActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
    borderBottomWidth: 1,
  },
  sheetTitle: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.base,
  },
  cancelText: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.base,
  },
  doneText: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.base,
  },
  picker: {
    width: '100%',
  },
});
