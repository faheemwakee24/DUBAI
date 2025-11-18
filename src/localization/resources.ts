import en from './translations/en';
import es from './translations/es';
import fr from './translations/fr';
import ja from './translations/ja';
import zh from './translations/zh';

export type LanguageCode = 'en' | 'es' | 'fr' | 'ja' | 'zh';

export type LanguageOption = {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
};

export const supportedLanguages: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文' },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  ja: { translation: ja },
  zh: { translation: zh },
};

export type AppResources = typeof resources;

