export { Colors, DarkColors } from './colors';
export { FontFamily, FontSize } from './typography';
export { Spacing, Radius, Shadow } from './spacing';

import { useAppStore } from '../store/useAppStore';
import { Colors, DarkColors } from './colors';

export function useTheme() {
  const mode = useAppStore((s) => s.themeMode);
  return mode === 'dark' ? DarkColors : Colors;
}
