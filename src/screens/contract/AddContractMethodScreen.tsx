import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PropertiesStackParamList } from '../../types/navigation';
import { useTheme } from '../../constants/theme';
import { FontFamily, FontSize } from '../../constants/typography';
import { Radius, Shadow, Spacing } from '../../constants/spacing';
import { AppHeader } from '../../components/layout/AppHeader';
import { useTranslation } from '../../hooks/useTranslation';

type Nav = NativeStackNavigationProp<PropertiesStackParamList>;

export function AddContractMethodScreen() {
  const navigation = useNavigation<Nav>();
  const tabBarHeight = useBottomTabBarHeight();
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.root, { backgroundColor: theme.surface }]}>
      <AppHeader showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + Spacing.xl }]}>
        <Text style={[styles.title, { color: theme.primary }]}>{t('contractMethod.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.onSurfaceVariant }]}>
          {t('contractMethod.subtitle')}
        </Text>

        {/* AI Quick Extract */}
        <View style={[styles.card, styles.aiCard, { backgroundColor: theme.surfaceContainerLowest, borderColor: theme.outlineVariant + '26' }]}>
          <View style={[styles.recommendedBadge, { backgroundColor: theme.tertiaryFixed }]}>
            <Text style={[styles.recommendedText, { color: theme.onTertiaryFixedVariant }]}>{t('contractMethod.recommended')}</Text>
          </View>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>{t('contractMethod.aiTitle')}</Text>
          <Text style={[styles.cardDesc, { color: theme.onSurfaceVariant }]}>
            {t('contractMethod.aiDesc')}
          </Text>
          <View style={styles.subBtns}>
            <TouchableOpacity
              style={[styles.subBtn, { backgroundColor: theme.surfaceContainerLow, borderColor: theme.outlineVariant + '50' }]}
              onPress={() => Alert.alert(t('contractMethod.comingSoon'), t('contractMethod.comingSoonPdf'))}
            >
              <View style={[styles.subBtnIcon, { backgroundColor: theme.primaryFixed }]}>
                <Text>📄</Text>
              </View>
              <Text style={[styles.subBtnText, { color: theme.onSurface }]}>{t('contractMethod.uploadPdf')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.subBtn, { backgroundColor: theme.surfaceContainerLow, borderColor: theme.outlineVariant + '50' }]}
              onPress={() => Alert.alert(t('contractMethod.comingSoon'), t('contractMethod.comingSoonCamera'))}
            >
              <View style={[styles.subBtnIcon, { backgroundColor: theme.secondaryFixed }]}>
                <Text>📷</Text>
              </View>
              <Text style={[styles.subBtnText, { color: theme.onSurface }]}>{t('contractMethod.scanCamera')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Manual Entry */}
        <View style={[styles.card, styles.manualCard, { backgroundColor: theme.surfaceContainer, borderColor: theme.outlineVariant + '26' }]}>
          <View style={[styles.manualIconWrapper, { backgroundColor: theme.surfaceContainerLowest }]}>
            <Text style={styles.manualIcon}>✏️</Text>
          </View>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>{t('contractMethod.manualTitle')}</Text>
          <Text style={[styles.cardDesc, { color: theme.onSurfaceVariant }]}>
            {t('contractMethod.manualDesc')}
          </Text>
          <TouchableOpacity
            style={[styles.openFormBtn, { backgroundColor: theme.surfaceContainerLowest, borderColor: theme.outlineVariant + '50' }]}
            onPress={() => navigation.navigate('AddNewContract')}
          >
            <Text style={[styles.openFormText, { color: theme.primary }]}>{t('contractMethod.openForm')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  title: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.hero,
    letterSpacing: -1,
    paddingTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.base,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.xxxl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    ...Shadow.card,
  },
  aiCard: {},
  manualCard: {},
  recommendedBadge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    marginBottom: Spacing.md,
  },
  recommendedText: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.xxs,
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.lg,
    marginBottom: Spacing.sm,
  },
  cardDesc: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  subBtns: { flexDirection: 'row', gap: Spacing.md },
  subBtn: {
    flex: 1,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  subBtnIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subBtnText: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
  manualIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadow.card,
  },
  manualIcon: { fontSize: 24 },
  openFormBtn: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  openFormText: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.sm,
  },
});
