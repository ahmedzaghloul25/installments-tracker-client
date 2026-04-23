import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../constants/theme';
import { FontFamily, FontSize } from '../../constants/typography';
import { Radius, Shadow, Spacing } from '../../constants/spacing';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  style?: ViewStyle;
  outlined?: boolean;
}

const BRAND_GRADIENT_START = '#00113a';
const BRAND_GRADIENT_END = '#002366';
const BRAND_ON_PRIMARY = '#ffffff';

export function GradientButton({ title, onPress, loading, style, outlined }: Props) {
  const theme = useTheme();

  if (outlined) {
    return (
      <TouchableOpacity
        style={[
          styles.outlined,
          {
            borderColor: theme.outlineVariant + '50',
            backgroundColor: theme.surfaceContainerLowest,
          },
          style,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.outlinedText, { color: theme.primary }]}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[Shadow.button, style]}>
      <LinearGradient
        colors={[BRAND_GRADIENT_START, BRAND_GRADIENT_END]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={BRAND_ON_PRIMARY} />
        ) : (
          <Text style={[styles.text, { color: BRAND_ON_PRIMARY }]}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.base,
    letterSpacing: 0.5,
  },
  outlined: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  outlinedText: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.base,
  },
});
