# API Log — Aeon Wealth (The Private Vault)

> **No HTTP backend.** This app is mock-data-only. All "APIs" below are in-process contracts: the Zustand store, hooks, and typed data shapes that screens consume. When a backend is introduced, these are the surfaces that should be replaced by real network calls.

---

## 1. App Store API — `src/store/useAppStore.ts`

Single Zustand store exposing auth, domain data, and user preferences.

### State

| Key | Type | Description |
|---|---|---|
| `isAuthenticated` | `boolean` | Drives navigator swap in `RootNavigator`. |
| `user` | `User` | Current user profile (from `MOCK_USER`). |
| `properties` | `Property[]` | User's property portfolio. |
| `language` | `'en' \| 'ar'` | Active UI language. |
| `themeMode` | `'light' \| 'dark'` | Active color palette. |

### Actions

| Action | Signature | Effect |
|---|---|---|
| `login` | `() => void` | Sets `isAuthenticated = true`. No credentials — stub. |
| `logout` | `() => void` | Sets `isAuthenticated = false`. |
| `addProperty` | `(p: Property) => void` | Appends a new property to the portfolio. Called from `AddNewContractScreen` after form submit. |
| `markInstallmentPaid` | `(propertyId: string, installmentId: string) => void` | Flips one installment to `status: 'paid'` and stamps `paidDate` (ISO date). |
| `setLanguage` | `(lang: 'en' \| 'ar') => void` | Switches UI locale. Caller must separately invoke `I18nManager.forceRTL()` for Arabic. |
| `setThemeMode` | `(mode: 'light' \| 'dark') => void` | Switches `useTheme()` palette. |

### Usage pattern

```ts
const login = useAppStore((s) => s.login);
const properties = useAppStore((s) => s.properties);
```

### Future backend mapping

| Action | Probable HTTP equivalent |
|---|---|
| `login` | `POST /auth/login` → JWT |
| `logout` | `POST /auth/logout` |
| `addProperty` | `POST /properties` |
| `markInstallmentPaid` | `PATCH /properties/:pid/installments/:iid` |
| property fetch (currently seeded) | `GET /properties` |

---

## 2. Translation API — `src/hooks/useTranslation.ts`

```ts
const { t, language } = useTranslation();
t('properties.totalCommitments');                // "TOTAL COMMITMENTS"
t('contract.scheduleN', { n: 2 });               // "SCHEDULE 2"
t('installment.label.installment', { n: 3 });    // "Installment #3"
```

- **`t(key, params?)`** — resolves a key against `strings[language]`; replaces `{token}` placeholders with values from `params`.
- **Key type:** `StringKey = keyof typeof strings.en`. Adding a key to `en` without an `ar` entry is a runtime gap; adding to `ar` without `en` is a type error.
- **Adding strings:** edit `src/i18n/strings.ts`, add matching entries to both `en` and `ar`.

---

## 3. Theme API — `src/constants/theme.ts`

```ts
const theme = useTheme();           // returns Colors | DarkColors
<View style={[styles.card, { backgroundColor: theme.surfaceContainerLowest }]} />
```

- Reactive to `themeMode` in the store — flipping the toggle re-renders every subscriber.
- Palette keys (Material-3-inspired): `primary`, `onPrimary`, `primaryContainer`, `primaryFixed`, `surface`, `surfaceContainer`, `surfaceContainerLow`, `surfaceContainerLowest`, `surfaceContainerHigh`, `surfaceContainerHighest`, `onSurface`, `onSurfaceVariant`, `outlineVariant`, `tertiaryFixed`, `tertiaryFixedDim`, `onTertiaryFixedVariant`, `error`.
- **Do not theme:** chart bars, progress-fill, brand gradient (see Design System Rules in `CLAUDE.md`).

---

## 4. Biometrics API — `src/hooks/useBiometrics.ts`

Thin wrapper around `expo-local-authentication`.

```ts
const { authenticate, isAvailable } = useBiometrics();
const ok = await authenticate();   // boolean
```

Used by `LoginScreen` to allow biometric sign-in. On success, caller invokes `login()` from the store.

---

## 5. Data Models — `src/types/models.ts`

### Enums

```ts
type PaymentStatus   = 'paid' | 'upcoming' | 'pending' | 'scheduled' | 'approved';
type FrequencyType   = 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
type PropertyCategory = 'primary-residence' | 'vacation-home' | 'investment';
type PaymentType     = 'installment' | 'maintenance' | 'receipt';
```

### `Installment`

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Unique across app. |
| `installmentNumber` | `number` | 1-based sequence within its schedule. |
| `dueDate` | `string` | `YYYY-MM-DD`. |
| `amount` | `number` | EGP. |
| `status` | `PaymentStatus` | See enum. |
| `paidDate?` | `string` | Set by `markInstallmentPaid`. |
| `paymentType?` | `PaymentType` | Defaults to `installment` when unset. |
| `scheduleId?` | `string` | FK back to `PaymentSchedule.id`. |

### `PaymentSchedule`

A contract can have multiple schedules (e.g., installments + maintenance + rental receipts).

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | |
| `label` | `string` | Display name, e.g. "Monthly Installments". |
| `paymentType` | `PaymentType` | |
| `frequency` | `FrequencyType` | |
| `startDate` | `string` | `YYYY-MM-DD`. |
| `count` | `number` | Total installments in the schedule. |
| `amount` | `number` | Per-installment amount. |
| `installments` | `Installment[]` | Generated from `startDate` + `frequency` + `count`. |

### `Property`

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | |
| `name`, `developer`, `location` | `string` | |
| `category` | `PropertyCategory` | |
| `imageUrl?` | `string` | Currently unused — emoji placeholder renders instead. |
| `totalPrice`, `downPayment` | `number` | EGP. |
| `startDate` | `string` | `YYYY-MM-DD` of first primary installment. |
| `frequency` | `FrequencyType` | Of the primary installment schedule. |
| `numberOfInstallments` | `number` | |
| `installments` | `Installment[]` | Flattened + sorted across all schedules. |
| `schedules?` | `PaymentSchedule[]` | Full breakdown per schedule. |
| `paidAmount` | `number` | Running total (down + paid installments). |
| `paidPercentage` | `number` | `0..1`. |
| `nextDueDate`, `nextDueAmount` | `string`, `number` | Next upcoming primary installment. |
| `installmentAmount` | `number` | Primary schedule per-period amount. |

### `ForecastMonth` / `ForecastInstallment`

- `ForecastMonth` — previously used by `ForecastScreen` for the stacked-bar chart. The chart was removed; `MOCK_FORECAST_MONTHS` is no longer imported anywhere. Type and mock data remain in place for a future revival.
- `ForecastInstallment` — still active. Consumed by `ForecastScreen` for the Upcoming Major Installments table via `MOCK_FORECAST_INSTALLMENTS`.

### `User`

| Field | Type |
|---|---|
| `id`, `name`, `initials`, `email` | `string` |
| `biometricEnabled` | `boolean` |

---

## 6. Mock Data Surface — `src/data/mockData.ts`

Seed data consumed by the store at initialization. Export list:

| Export | Type | Used by |
|---|---|---|
| `MOCK_USER` | `User` | `useAppStore` initial state. |
| `MOCK_PROPERTIES` | `Property[]` | `useAppStore` initial state. |
| `TOTAL_PORTFOLIO_COMMITMENT` | `number` | `PropertiesScreen` hero value. |
| `MOCK_FORECAST_MONTHS` | `ForecastMonth[]` | Unused — chart removed from `ForecastScreen`. Kept for future revival. |
| `MOCK_FORECAST_INSTALLMENTS` | `ForecastInstallment[]` | `ForecastScreen` Upcoming Major Installments table. |

When wiring a backend, every consumer of these constants should move to a fetched-data hook (e.g., React Query `useQuery`) while preserving the existing types.

---

## 7. Derived Portfolio Aggregates — `ForecastScreen`

`ForecastScreen` reads `properties` from the store and derives three aggregates via `useMemo`. These are **not persisted** — they recompute on every render cycle when `properties` changes.

```ts
const properties = useAppStore((s) => s.properties);
const totalValue     = useMemo(() => properties.reduce((s, p) => s + p.totalPrice,  0), [properties]);
const totalPaid      = useMemo(() => properties.reduce((s, p) => s + p.paidAmount,  0), [properties]);
const totalRemaining = totalValue - totalPaid;
const paidPct        = totalValue > 0 ? Math.round((totalPaid / totalValue) * 100) : 0;
```

| Aggregate | Source field | Notes |
|---|---|---|
| `totalValue` | `Property.totalPrice` | Gross contract value across all properties. |
| `totalPaid` | `Property.paidAmount` | Down payment + paid installments per property. Static until `paidAmount` is recomputed on `markInstallmentPaid`. |
| `totalRemaining` | `totalValue - totalPaid` | Simple subtraction; not stored. |
| `paidPct` | derived | Drives donut chart center label. Clamped to 0 when `totalValue === 0`. |

**Known limitation:** `markInstallmentPaid` flips installment status but does not update `Property.paidAmount`. The totals will not reflect newly-marked payments until `paidAmount` propagation is implemented (tracked as a follow-up).

**Future backend mapping:** Replace the `useMemo` block with a `GET /portfolio/summary` call returning `{ totalValue, totalPaid, totalRemaining }` pre-aggregated server-side.

---

## 8. Navigation Contract — `src/types/navigation.ts`

Param-list types used by React Navigation. Relevant for typed `navigation.navigate(...)` calls.

- `AuthStackParamList` — `Login`.
- `TabParamList` — `PropertiesTab | ReportsTab | ProfileTab`.
- `PropertiesStackParamList` — `PropertiesList | PropertyDetail | AddContractMethod | AddNewContract`.
  - `PropertyDetail` param: `{ propertyId: string }`.

---

## 9. External SDK Surface

Not authored here, but worth listing since screens depend on them:

| Package | Usage |
|---|---|
| `expo-local-authentication` | Biometric prompt in `useBiometrics`. |
| `expo-linear-gradient` | Brand gradient on `GradientButton` and login logo. (Removed from `ForecastScreen` — vault card deleted.) |
| `@react-native-community/datetimepicker` | Date input in `DateField`. |
| `react-native-gifted-charts` | Stacked-bar in `StackedBarChart` (unused since chart removed from `ForecastScreen`); donut `PieChart` in `ForecastScreen` Portfolio Totals card. |
| `react-native-reanimated` | Animated width on `ProgressBar`. |
| `react-native-safe-area-context` | Insets consumed by `AppHeader` and `TabNavigator`. |
