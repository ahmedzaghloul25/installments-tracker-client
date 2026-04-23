import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PropertiesStackParamList } from '../../types/navigation';
import { useTheme } from '../../constants/theme';
import { FontFamily, FontSize } from '../../constants/typography';
import { Radius, Shadow, Spacing } from '../../constants/spacing';
import { AppHeader } from '../../components/layout/AppHeader';
import { PropertyCard } from '../../components/property/PropertyCard';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../hooks/useTranslation';

type Nav = NativeStackNavigationProp<PropertiesStackParamList>;

export function PropertiesScreen() {
  const navigation = useNavigation<Nav>();
  const properties = useAppStore((s) => s.properties);
  const isLoading = useAppStore((s) => s.isLoading);
  const error = useAppStore((s) => s.error);
  const portfolioSummary = useAppStore((s) => s.portfolioSummary);
  const fetchPortfolioSummary = useAppStore((s) => s.fetchPortfolioSummary);
  const tabBarHeight = useBottomTabBarHeight();
  const theme = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    fetchPortfolioSummary();
  }, [fetchPortfolioSummary]);

  const totalCommitment = useMemo(() => {
    if (portfolioSummary?.totalValue != null) return portfolioSummary.totalValue;
    return properties.reduce((sum, p) => sum + p.totalPrice, 0);
  }, [portfolioSummary, properties]);

  const [query, setQuery] = useState('');

  const visibleProperties = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter((p) => p.name.toLowerCase().includes(q));
  }, [properties, query]);

  const expectedThisMonth = useMemo(() => {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return properties.reduce((sum, p) => {
      for (const inst of p.installments) {
        if (inst.status !== 'paid' && inst.dueDate.startsWith(prefix)) {
          sum += inst.amount;
        }
      }
      return sum;
    }, 0);
  }, [properties]);

  return (
    <View style={[styles.root, { backgroundColor: theme.surface }]}>
      <AppHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero section */}
        <View style={styles.hero}>
          <Text style={[styles.heroLabel, { color: theme.onSurfaceVariant }]}>{t('properties.totalCommitments')}</Text>
          <View style={styles.heroAmountRow}>
            <Text style={[styles.heroAmount, { color: theme.primary }]}>EGP {totalCommitment.toLocaleString()}</Text>
          </View>
            <Text style={[styles.heroLabel, { color: theme.onSurfaceVariant }]}>
              {t('properties.expectedThisMonth')}
            </Text>
            <Text style={[styles.heroAmount, { color: theme.primary }]}>
              EGP {expectedThisMonth.toLocaleString()}
            </Text>
        </View>

        {/* Properties list */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>{t('properties.myProperties')}</Text>

          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: theme.surfaceContainerLow,
                color: theme.primary,
              },
            ]}
            placeholder={t('properties.searchPlaceholder')}
            placeholderTextColor={theme.onSurfaceVariant}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />

          {isLoading && properties.length === 0 ? (
            <ActivityIndicator color={theme.primary} style={{ marginVertical: Spacing.xl }} />
          ) : error && properties.length === 0 ? (
            <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
          ) : visibleProperties.length === 0 && query.trim() !== '' ? (
            <Text style={[styles.errorText, { color: theme.onSurfaceVariant }]}>
              {t('properties.noMatches')}
            </Text>
          ) : (
            visibleProperties.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                onPress={() => navigation.navigate('PropertyDetail', { propertyId: p.id })}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('AddContractMethod')}
        activeOpacity={0.85}
      >
        <Text style={[styles.fabIcon, { color: theme.onPrimary }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.xl },
  hero: { paddingVertical: Spacing.lg },
  heroLabel: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.xxs,
    letterSpacing: 1.2,
  },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  heroAmount: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.xxl,
    letterSpacing: -1.5,
  },
  section: { paddingTop: Spacing.lg },
  searchInput: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.lg,
    marginBottom: Spacing.lg,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.button,
  },
  fabIcon: {
    fontFamily: FontFamily.manropeBold,
    fontSize: 28,
    marginTop: -2,
  },
  errorText: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginVertical: Spacing.xl,
  },
});
