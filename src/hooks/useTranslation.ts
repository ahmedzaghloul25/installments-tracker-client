import { useAppStore } from '../store/useAppStore';
import { strings, StringKey } from '../i18n/strings';

export function useTranslation() {
  const language = useAppStore((s) => s.language);
  const t = (key: StringKey, params?: Record<string, string | number>): string => {
    let str: string = strings[language][key];
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
    }
    return str;
  };
  return { t, language };
}
