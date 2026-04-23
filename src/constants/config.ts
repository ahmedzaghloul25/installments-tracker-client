/**
 * API base URL.
 *
 * Points at the production Render-hosted backend by default. Override via
 * `EXPO_PUBLIC_API_URL` (EAS build, CI, or local `.env`) when targeting a
 * different environment (e.g. a LAN dev server on `http://<host>:3000/api/v1`).
 */
const DEFAULT_BASE_URL = 'https://installments-tracker-server.onrender.com/api/v1';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_BASE_URL;
