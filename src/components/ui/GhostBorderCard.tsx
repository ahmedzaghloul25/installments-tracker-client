import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../constants/theme';
import { Radius, Shadow } from '../../constants/spacing';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'lowest' | 'low' | 'container';
}

export function GhostBorderCard({ children, style, variant = 'lowest' }: Props) {
  const theme = useTheme();
  const bgMap = {
    lowest: theme.surfaceContainerLowest,
    low: theme.surfaceContainerLow,
    container: theme.surfaceContainer,
  };
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: bgMap[variant], borderColor: theme.outlineVariant + '26' },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    ...Shadow.card,
  },
});
