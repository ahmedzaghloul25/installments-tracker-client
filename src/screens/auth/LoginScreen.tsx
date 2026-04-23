import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../constants/theme';
import { FontFamily, FontSize } from '../../constants/typography';
import { Radius, Shadow, Spacing } from '../../constants/spacing';
import { GradientButton } from '../../components/ui/GradientButton';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../hooks/useTranslation';

export function LoginScreen() {
  const login = useAppStore((s) => s.login);
  const error = useAppStore((s) => s.error);
  const clearError = useAppStore((s) => s.clearError);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();

  const handleLogin = async () => {
    if (!email || !password) return;
    clearError();
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch {
      // error surfaced via store
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.surface }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Brand section */}
          <View style={styles.brandSection}>
            <LinearGradient
              colors={['#00113a', '#002366']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoCircle}
            >
              <Text style={styles.logoIcon}>⬡</Text>
            </LinearGradient>
            <Text style={[styles.brandName, { color: theme.primary }]}>{t('login.brand')}</Text>
            <Text style={[styles.brandTagline, { color: theme.onSurfaceVariant }]}>{t('login.tagline')}</Text>
          </View>

          {/* Form card */}
          <View style={[styles.card, { backgroundColor: theme.surfaceContainerLowest, borderColor: theme.outlineVariant + '1A' }]}>
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.onSurfaceVariant }]}>{t('login.email')}</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.surfaceContainer }]}>
                <TextInput
                  style={[styles.input, { color: theme.onSurface }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('login.emailPlaceholder')}
                  placeholderTextColor={theme.outlineVariant}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text style={styles.inputIcon}>✉</Text>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.passwordHeader}>
                <Text style={[styles.fieldLabel, { color: theme.onSurfaceVariant }]}>{t('login.password')}</Text>
                <TouchableOpacity>
                  <Text style={[styles.forgotLink, { color: theme.primary }]}>{t('login.forgot')}</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.inputWrapper, { backgroundColor: theme.surfaceContainer }]}>
                <TextInput
                  style={[styles.input, { color: theme.onSurface }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t('login.passwordPlaceholder')}
                  placeholderTextColor={theme.outlineVariant}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.inputIcon}>{showPassword ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <GradientButton
              title={loading ? t('login.authenticating') : t('login.submit')}
              onPress={handleLogin}
              loading={loading}
              style={styles.loginBtn}
            />

            {error ? (
              <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.section + 20,
    paddingBottom: Spacing.xxxl,
    alignItems: 'center',
  },
  brandSection: { alignItems: 'center', marginBottom: Spacing.xxxl },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.button,
  },
  logoIcon: { fontSize: 28, color: '#ffffff' },
  brandName: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.xxl,
    letterSpacing: -1,
  },
  brandTagline: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.sm,
    marginTop: 4,
  },
  card: {
    width: '100%',
    borderRadius: Radius.lg,
    padding: Spacing.xxxl,
    borderWidth: 1,
    ...Shadow.card,
  },
  fieldGroup: { marginBottom: Spacing.xl },
  fieldLabel: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.xxs,
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  forgotLink: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.lg,
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.base,
  },
  inputIcon: { fontSize: 16, opacity: 0.5 },
  loginBtn: { marginBottom: Spacing.xl },
  errorText: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginTop: -Spacing.md,
    marginBottom: Spacing.md,
  },
});
