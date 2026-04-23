import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  ViewStyle,
  View,
} from 'react-native';
import { useTheme } from '../../constants/theme';

interface Props {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export function ScreenWrapper({ children, scrollable = false, style, contentStyle }: Props) {
  const theme = useTheme();
  if (scrollable) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.surface }, style]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.surface }, style]}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
