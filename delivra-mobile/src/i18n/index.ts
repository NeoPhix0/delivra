import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "./ar.json";
import en from "./en.json";
import fr from "./fr.json";

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  fr: { translation: fr },
};

const initI18n = async () => {
  let savedLanguage = "en";
  
  // Only use AsyncStorage if available (not during build)
  try {
    if (typeof window !== 'undefined' || typeof global !== 'undefined') {
      savedLanguage = await AsyncStorage.getItem("user-language") || savedLanguage;
    }
  } catch {
    // AsyncStorage not available during build
    console.warn('AsyncStorage not available during build, using default language');
  }

  if (!savedLanguage || savedLanguage === "en") {
    savedLanguage = Localization.getLocales()[0]?.languageCode || "en";
    if (
      savedLanguage !== "en" &&
      savedLanguage !== "ar" &&
      savedLanguage !== "fr"
    ) {
      savedLanguage = "en";
    }
  }

  i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage,
    fallbackLng: "en",
    compatibilityJSON: "v4",
    interpolation: {
      escapeValue: false,
    },
  });
};

export const useI18n = () => i18n;

initI18n();

export const changeLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem("user-language", language);
  } catch {
    console.warn('AsyncStorage not available');
  }
  i18n.changeLanguage(language);
};

export const getCurrentLanguage = () => {
  return i18n.language;
};

export default i18n;
