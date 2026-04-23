import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../constants/theme';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../hooks/useTranslation';

interface Props {
  showBack?: boolean;
  onBack?: () => void;
  showAvatar?: boolean;
}

export function AppHeader({ showBack, onBack, showAvatar = true }: Props) {
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      <View style={[styles.container, { paddingTop: insets.top + Spacing.sm, backgroundColor: theme.surface }]}>
        <View style={styles.inner}>
          {/* Left side */}
          {showBack ? (
            <TouchableOpacity style={styles.backBtn} onPress={onBack}>
              <Text style={[styles.backIcon, { color: theme.primary }]}>←</Text>
              <Text style={[styles.backText, { color: theme.onSurfaceVariant }]}>{t('header.backToPortfolio')}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.brand}>
              <View style={[styles.logoIcon, { backgroundColor: theme.primary }]}>
                <Text style={styles.logoText}>⬡</Text>
              </View>
              <Text style={[styles.brandName, { color: theme.primary }]}>{user?.name ?? t('header.brand')}</Text>
            </View>
          )}

          {/* Right side — avatar only */}
          {showAvatar && (
            <View style={[styles.avatar, { backgroundColor: theme.primaryContainer }]}>
              <Text style={[styles.avatarText, { color: theme.onPrimary }]}>{user?.initials ?? '?'}</Text>
            </View>
          )}
        </View>
        <View style={[styles.divider, { backgroundColor: theme.surfaceContainer }]} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontSize: 16,
  },
  brandName: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.md,
    letterSpacing: -0.5,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  backIcon: {
    fontSize: 25,
    marginBottom: 6,
  },
  backText: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.xs,
  },
  divider: {
    height: 1,
    marginTop: Spacing.sm,
  },
});
