import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../constants/theme';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';

interface Props {
  label: string;
  children: React.ReactNode;
}

export function SettingRow({ label, children }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.row, { borderBottomColor: theme.outlineVariant + '40' }]}>
      <Text style={[styles.label, { color: theme.onSurface }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
  },
  label: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.base,
  },
});
