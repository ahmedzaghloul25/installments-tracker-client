import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, I18nManager } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../constants/theme';
import { FontFamily, FontSize } from '../../constants/typography';
import { Radius, Shadow, Spacing } from '../../constants/spacing';
import { AppHeader } from '../../components/layout/AppHeader';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { GhostBorderCard } from '../../components/ui/GhostBorderCard';
import { SettingRow } from '../../components/ui/SettingRow';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../hooks/useTranslation';

export function ProfileScreen() {
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const language = useAppStore((s) => s.language);
  const themeMode = useAppStore((s) => s.themeMode);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const tabBarHeight = useBottomTabBarHeight();
  const theme = useTheme();
  const { t } = useTranslation();

  function handleLanguageChange(lang: 'en' | 'ar') {
    setLanguage(lang);
    const shouldBeRTL = lang === 'ar';
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.forceRTL(shouldBeRTL);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.surface }]}>
      <AppHeader showAvatar={false} />
      <View style={[styles.content, { paddingBottom: tabBarHeight }]}>
        {/* Avatar + identity */}
        <View style={[styles.avatarCircle, { backgroundColor: theme.primary }]}>
          <Text style={[styles.avatarText, { color: theme.onPrimary }]}>{user?.initials ?? '?'}</Text>
        </View>
        <Text style={[styles.name, { color: theme.primary }]}>{user?.name ?? ''}</Text>
        <Text style={[styles.email, { color: theme.onSurfaceVariant }]}>{user?.email ?? ''}</Text>

        {/* Settings section */}
        <View style={styles.settingsBlock}>
          <SectionHeader title={t('profile.settings')} />
          <GhostBorderCard style={styles.settingsCard}>
            {/* Language toggle */}
            <SettingRow label={t('profile.language')}>
              <View style={[styles.segmented, { backgroundColor: theme.surfaceContainer }]}>
                <TouchableOpacity
                  style={[
                    styles.segmentBtn,
                    language === 'en' && { backgroundColor: theme.surfaceContainerLowest, ...Shadow.card },
                  ]}
                  onPress={() => handleLanguageChange('en')}
                >
                  <Text style={[
                    styles.segmentText,
                    { color: language === 'en' ? theme.primary : theme.onSurfaceVariant },
                    language === 'en' && styles.segmentTextActive,
                  ]}>
                    {t('common.english')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.segmentBtn,
                    language === 'ar' && { backgroundColor: theme.surfaceContainerLowest, ...Shadow.card },
                  ]}
                  onPress={() => handleLanguageChange('ar')}
                >
                  <Text style={[
                    styles.segmentText,
                    { color: language === 'ar' ? theme.primary : theme.onSurfaceVariant },
                    language === 'ar' && styles.segmentTextActive,
                  ]}>
                    {t('common.arabic')}
                  </Text>
                </TouchableOpacity>
              </View>
            </SettingRow>

            {/* Dark mode toggle */}
            <SettingRow label={t('profile.darkMode')}>
              <Switch
                value={themeMode === 'dark'}
                onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
                trackColor={{ false: theme.surfaceContainerHighest, true: theme.primary }}
                thumbColor={theme.onPrimary}
              />
            </SettingRow>
          </GhostBorderCard>

          <Text style={[styles.rtlNote, { color: theme.outline }]}>
            {t('profile.rtlNote')}
          </Text>
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: theme.outlineVariant + '50' }]}
          onPress={logout}
        >
          <Text style={[styles.logoutText, { color: theme.primary }]}>{t('profile.signOut')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.xxxl,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    ...Shadow.button,
  },
  avatarText: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.xl,
  },
  name: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.xxl,
    marginBottom: Spacing.xs,
  },
  email: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.base,
    marginBottom: Spacing.sm,
  },
  settingsBlock: {
    width: '100%',
    marginBottom: Spacing.xxxl,
  },
  settingsCard: {
    overflow: 'hidden',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  segmented: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: 3,
    gap: 2,
  },
  segmentBtn: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  segmentText: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.sm,
  },
  segmentTextActive: {
    fontFamily: FontFamily.interSemiBold,
  },
  rtlNote: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    marginTop: Spacing.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    lineHeight: 18,
  },
  logoutBtn: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxxl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginTop: 'auto',
  },
  logoutText: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.base,
  },
});
