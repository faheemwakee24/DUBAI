import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';

import i18n from './i18n';
import {
  DEFAULT_LANGUAGE,
  LanguageCode,
  LanguageOption,
  supportedLanguages,
} from './resources';

const STORAGE_KEY = '@dubai_language';

const supportedCodes = supportedLanguages.map(language => language.code);

export const isSupportedLanguage = (code?: string): code is LanguageCode =>
  Boolean(code && supportedCodes.includes(code as LanguageCode));

export const normalizeLanguageCode = (value?: string): LanguageCode => {
  if (!value) {
    return DEFAULT_LANGUAGE;
  }

  const [base] = value.split('-');
  return isSupportedLanguage(base) ? (base as LanguageCode) : DEFAULT_LANGUAGE;
};

export const initLocalization = async (): Promise<LanguageCode> => {
  try {
    const storedLanguageRaw = await AsyncStorage.getItem(STORAGE_KEY);
    const storedLanguage: string | undefined = storedLanguageRaw ?? undefined;

    if (isSupportedLanguage(storedLanguage)) {
      await i18n.changeLanguage(storedLanguage);
      return storedLanguage;
    }

    const locales = RNLocalize.getLocales();
    const deviceLanguage = normalizeLanguageCode(locales[0]?.languageCode);

    await i18n.changeLanguage(deviceLanguage);
    await AsyncStorage.setItem(STORAGE_KEY, deviceLanguage);

    return deviceLanguage;
  } catch (error) {
    console.warn('Failed to initialize localization', error);
    await i18n.changeLanguage(DEFAULT_LANGUAGE);
    return DEFAULT_LANGUAGE;
  }
};

export const setAppLanguage = async (language: LanguageCode) => {
  await i18n.changeLanguage(language);
  await AsyncStorage.setItem(STORAGE_KEY, language);
};

export { supportedLanguages };
export type { LanguageCode, LanguageOption };
export { default as i18n } from './i18n';

