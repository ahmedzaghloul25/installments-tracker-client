# Plan — Reports (Forecast) Screen Refresh

## Context

The Reports tab (`ForecastScreen`) currently shows four sections after the header:
1. A MetricCard ("Total Expected for Period" — forecast sub-metrics).
2. A **Vault Intelligence** gradient card (decorative advisory text + download button).
3. A **Liquidity Timeline** stacked bar chart.
4. An **Upcoming Major Installments** table.

It also has a top time-filter with three options: `Next 6 Months / 12 Months / Custom Range`.

The user wants the screen simplified and re-focused on actual portfolio data:
- Change the time filter options to **Next 3 Months / 6 Months / 1 Year**.
- Remove the Vault Intelligence card and the Liquidity Timeline chart.
- In their place, add a single **Portfolio Totals** card showing: total value of all properties, total paid installments, total remaining.
- Keep the Upcoming Installments table.
- Leave the existing "Total Expected for Period" MetricCard untouched (the user scoped the replacement to "vault intelligence card and the lower graph" only).

Net effect: less decorative content, more real numbers aggregated from the Zustand store.

---

## Scope & Key Files

### A. `src/screens/forecast/ForecastScreen.tsx` (primary edit)

1. **Time filter update**
   - Replace current `TIME_FILTER_KEYS` array with `['forecast.filter.3m', 'forecast.filter.6m', 'forecast.filter.1y']`.
   - No logic changes — the filter is visual only (no current filtering of forecast data by range).

2. **Remove the Vault Intelligence card**
   - Delete the `LinearGradient` block (`vaultCard`, `vaultTitle`, `vaultText`, `vaultBtn`, `vaultBtnText` JSX) and its styles.
   - Remove the `LinearGradient` import if no other use remains in this file.

3. **Remove the Liquidity Timeline chart section**
   - Delete the `chartSection` `View` containing `<StackedBarChart ... />`.
   - Remove imports: `StackedBarChart` and `MOCK_FORECAST_MONTHS`.
   - Remove the now-unused `chartSection`, `chartTitle` styles.

4. **Add Portfolio Totals card** (in place of vault + chart)
   - Read `properties` from `useAppStore`.
   - Derive three aggregates via `useMemo`:
     - `totalValue = sum(property.totalPrice)`
     - `totalPaid = sum(property.paidAmount)`
     - `totalRemaining = totalValue - totalPaid`
   - Render a card styled to match the existing `tableSection` look (use `theme.surfaceContainerLowest`, `Radius.lg`, `Shadow.card`, same padding).
   - Layout: card title at top, then three stacked rows (label left, formatted EGP value right) — mirrors the `subMetric` / `subMetricHeader` pattern already present in this file so we stay consistent with the MetricCard sub-rows.
   - Use compact currency formatting (e.g. `EGP 12.45M`) — mirror the `formatCurrency` helper already in `src/components/property/PropertyCard.tsx`; inline a local copy in ForecastScreen to avoid cross-module coupling.
   - Each row: label in `theme.onSurfaceVariant`, value in `theme.primary`, bold Manrope. No mini progress bars — keep it clean.

5. **Keep** Upcoming Major Installments section as-is.

### B. `src/i18n/strings.ts`

Add keys, remove unused ones. Keep EN and AR in sync.

- **Add**:
  - `forecast.filter.3m` → EN: `Next 3 Months`, AR: `الأشهر الـ 3 القادمة`
  - `forecast.filter.1y` → EN: `1 Year`, AR: `سنة واحدة`
  - `forecast.portfolioTotals` → EN: `Portfolio Totals`, AR: `إجمالي المحفظة`
  - `forecast.totalPropertyValue` → EN: `Total Property Value`, AR: `إجمالي قيمة العقارات`
  - `forecast.totalPaid` → EN: `Total Paid`, AR: `إجمالي المدفوع`
  - `forecast.totalRemaining` → EN: `Total Remaining`, AR: `إجمالي المتبقي`

- **Update** (value change; keep key name):
  - `forecast.filter.6m` → EN: `6 Months` (was `Next 6 Months`), AR: `6 أشهر`

- **Remove** (no longer rendered):
  - `forecast.filter.12m`
  - `forecast.filter.custom`
  - `forecast.vaultTitle`
  - `forecast.vaultBody`
  - `forecast.downloadPdf`
  - `forecast.liquidityTimeline`
  - `forecast.legend.fixed`
  - `forecast.legend.variable`

  Note: `StringKey` is derived from `keyof typeof strings.en`, so removing a key immediately breaks any stale `t('...')` call at the type level — safe cleanup.

### C. No other files need edits

- `StackedBarChart` component file and `MOCK_FORECAST_MONTHS` mock can stay untouched — leaving them in place is cheap and keeps the option open for a future revival. Dead-code sweep is a follow-up.
- `MetricCard`, `StatusBadge`, `useTheme`, `useTranslation` — reused as-is.

---

## Reuse Checklist

- `useAppStore((s) => s.properties)` — canonical source of truth for totals.
- `useTheme()` from `src/constants/theme.ts`.
- `useTranslation()` from `src/hooks/useTranslation.ts`.
- `Radius`, `Shadow`, `Spacing` from `src/constants/spacing.ts`.
- `formatCurrency` pattern from `src/components/property/PropertyCard.tsx` — mirror inline.

---

## Verification

1. `npx expo start --clear`. App launches without TypeScript errors.
2. Open **Reports** tab. Confirm:
   - Time filter shows **Next 3 Months / 6 Months / 1 Year**; tapping each still toggles the active highlight.
   - The "Total Expected for Period" MetricCard is still present.
   - The Vault Intelligence gradient card is gone.
   - The bar chart section is gone.
   - A new **Portfolio Totals** card sits where vault + chart used to be, showing three rows with numeric totals derived from the store. Values should match:
     - Total Property Value ≈ sum of all `totalPrice` in `MOCK_PROPERTIES`.
     - Total Paid ≈ sum of all `paidAmount`.
     - Total Remaining = the difference.
   - Upcoming Major Installments table still renders with the same rows.
3. **Dynamic data check**: open a property detail, mark an upcoming installment as paid, return to Reports. Note: `markInstallmentPaid` currently only flips `status`/`paidDate` — it does **not** recompute the property's `paidAmount`. So expect Total Paid / Total Remaining to stay constant on mark-paid. Flag this as a follow-up during implementation if the user expects live updates; do not widen scope here.
4. **Theme / i18n check**: flip Dark Mode and Arabic on Profile, return to Reports — card surfaces darken correctly, labels render in Arabic including the three new filter labels and the four new totals/title labels.
5. No stale translation calls remain. TypeScript will flag any `t('forecast.filter.12m' | 'forecast.filter.custom' | 'forecast.vault…' | 'forecast.liquidityTimeline' | 'forecast.legend.*' | 'forecast.downloadPdf')` usage after key removal.

---

## Out of Scope

- Making the time filter actually filter data (currently decorative — unchanged behavior).
- Propagating `markInstallmentPaid` back into `property.paidAmount` (separate concern).
- Deleting the now-unreferenced `StackedBarChart` component or `MOCK_FORECAST_MONTHS` mock data.
- Extracting a shared currency-formatting util.
