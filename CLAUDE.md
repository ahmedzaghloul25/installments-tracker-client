# CLAUDE.md — Aeon Wealth (The Private Vault)

## Project Overview

React Native / Expo (managed workflow, TypeScript) mobile app for tracking real estate installments and liquidity forecasting. Brand: **Aeon Wealth — The Private Vault**. High-end private banking aesthetic.

Design source: Stitch project `2432838723795456214` (6 screens).

## Tech Stack

- **Framework:** React Native + Expo (blank-typescript template)
- **Navigation:** `@react-navigation/native` + `native-stack` + `bottom-tabs`
- **State:** Zustand (`src/store/useAppStore.ts`)
- **Charts:** `react-native-gifted-charts` (stacked bar + donut pie chart)
- **Animations:** `react-native-reanimated` (progress bars)
- **Fonts:** `@expo-google-fonts/manrope` + `@expo-google-fonts/inter` (loaded in `App.tsx`)
- **Gradient:** `expo-linear-gradient`
- **Biometrics:** `expo-local-authentication`
- **Dates:** `date-fns` + `@react-native-community/datetimepicker`

## Project Structure

```
App.tsx                          ← Entry point: font loading, splash, providers
src/
  constants/                     ← Design tokens (colors, typography, spacing, shadows, theme)
  types/                         ← TypeScript interfaces (models.ts, navigation.ts)
  data/mockData.ts               ← All mock data (no backend)
  store/useAppStore.ts           ← Zustand store (auth, properties, language, themeMode)
  hooks/
    useBiometrics.ts             ← Biometric auth wrapper
    useTranslation.ts            ← i18n hook with {n} interpolation
  i18n/strings.ts                ← EN/AR string dictionary (~100 keys per locale)
  components/
    ui/                          ← ProgressBar, StatusBadge, GradientButton, SectionHeader, GhostBorderCard, DateField, SettingRow
    layout/                      ← AppHeader, ScreenWrapper
    property/                    ← PropertyCard, InstallmentRow
    forecast/                    ← MetricCard, StackedBarChart
  navigation/
    AuthNavigator.tsx            ← Login stack
    TabNavigator.tsx             ← 3 tabs (Properties/Reports/Profile) + nested PropertiesStack
    RootNavigator.tsx            ← Conditional swap: AuthNavigator vs TabNavigator
  screens/
    auth/LoginScreen.tsx
    properties/PropertiesScreen.tsx, PropertyDetailScreen.tsx
    contract/AddContractMethodScreen.tsx, AddNewContractScreen.tsx
    forecast/ForecastScreen.tsx
    profile/ProfileScreen.tsx    ← Language toggle (EN/AR) + Dark mode toggle + Sign out
```

## Design System Rules

- **No-border rule:** Section boundaries use background color shifts, never 1px solid lines. Exception: "ghost borders" at 10-20% opacity for card edges.
- **Colors:** `src/constants/colors.ts` exports `Colors` (light) and `DarkColors` (dark). Brand primary: `#00113a`. Light surface: `#f7f9fb`. Progress fill: `#4edea3` (fixed across themes).
- **Typography:** Headlines use Manrope (400-800). Body uses Inter (400-600). Names: `Manrope_700Bold`, `Inter_400Regular` etc.
- **Border radius:** sm=4, md=8 (inputs), lg=12 (cards), xl=16 (buttons), pill=9999 (badges).
- **"Add New"** is a FAB on PropertiesScreen, NOT a tab.
- **Fixed-across-theme colors:** chart bar colors (`#00113a` fixed + `#758dd5` variable), progress-fill green (`#4edea3`), brand gradient (`#00113a → #002366`), pie chart slices (`#4edea3` paid + `#00113a` remaining). These do NOT swap in dark mode.

## Key Patterns

- **Auth flow:** `isAuthenticated` in Zustand drives conditional navigator swap in `RootNavigator`. No manual `navigate('Login')`.
- **Font loading:** Fonts come from `@expo-google-fonts/*` npm packages, not `assets/fonts/`. Loaded via `useFonts` in `App.tsx`.
- **Theming:** Components call `useTheme()` from `src/constants/theme.ts` and apply theme values via inline style arrays (`style={[styles.x, { backgroundColor: theme.surface }]}`). Static layout/spacing stays in `StyleSheet.create`.
- **i18n:** Components call `useTranslation()` and replace string literals with `t('key')`. Dictionary lives in `src/i18n/strings.ts`. Language toggle on Profile flips `language` + calls `I18nManager.forceRTL()` for Arabic.
- **Charts:** Two chart components in use:
  - `StackedBarChart` (component wrapper) — stacked bar with exactly 2 colors: Fixed (`#00113a`) + Variable (`#758dd5`). Never 3.
  - `PieChart` (direct from `react-native-gifted-charts`) — donut in `ForecastScreen` Portfolio Totals card. Slices: Paid (`#4edea3`) + Remaining (`#00113a`). Always pass `innerCircleColor={theme.surfaceContainerLowest}` — the default is hardcoded white and will break dark mode.
- **ForecastScreen Portfolio Totals:** Three aggregates derived via `useMemo` over `useAppStore((s) => s.properties)` — `totalValue` (sum of `totalPrice`), `totalPaid` (sum of `paidAmount`), `totalRemaining`. Note: `markInstallmentPaid` does not update `paidAmount`, so totals stay static after marking paid.
- **Mock data only** — no backend. All data in `src/data/mockData.ts`. See `apiLog.md` for the in-app store API contract.

## Commands

```bash
npx expo start          # Start dev server
npx expo start --clear  # Start with cache clear
```

## Common Gotchas

- `babel.config.js` must have `react-native-reanimated/plugin` as the LAST plugin.
- Font family strings use underscore format: `'Manrope_700Bold'` not `'Manrope-Bold'`.
- `PaymentStatus` has 5 values: `paid | upcoming | pending | scheduled | approved`.
- `PaymentType` has 3 values: `installment | maintenance | receipt`.
- Full RTL layout mirroring requires app restart after `I18nManager.forceRTL()` — Profile screen shows a note instructing this.
- Language + themeMode are NOT persisted across app restarts (no AsyncStorage). Reset on cold start.
- When adding new user-facing strings, add both `en` and `ar` entries in `src/i18n/strings.ts` — the `StringKey` type is derived from `keyof typeof strings.en` so omissions break TypeScript.
- `PieChart` from `react-native-gifted-charts`: `innerCircleColor` defaults to white — always pass `theme.surfaceContainerLowest` (the card background) or the donut hole will appear white in dark mode.
- `expo-linear-gradient` is no longer used in `ForecastScreen` (vault card removed). It still lives in `GradientButton` and the login logo — do not remove the package.
