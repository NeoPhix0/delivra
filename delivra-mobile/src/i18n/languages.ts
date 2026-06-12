import AsyncStorage from "@react-native-async-storage/async-storage";

export type Language = "en" | "ar" | "fr";

export const translations = {
  en: {
    settings: {
      title: "Settings",
      preferences: "Preferences",
      pushNotifications: "Push Notifications",
      sound: "Sound",
      vibration: "Vibration",
      darkMode: "Dark Mode",
      language: "Language",
      support: "Support",
      helpCenter: "Help Center",
      contactSupport: "Contact Support",
      terms: "Terms & Conditions",
      privacy: "Privacy Policy",
      account: "Account",
      syncData: "Sync Data",
      backupData: "Backup Data",
      deleteAccount: "Delete Account",
    },
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      success: "Success",
    },
    driver: {
      home: "Home",
      requests: "Requests",
      earnings: "Earnings",
      profile: "Profile",
    },
  },
  ar: {
    settings: {
      title: "الإعدادات",
      preferences: "التفضيلات",
      pushNotifications: "الإشعارات",
      sound: "الصوت",
      vibration: "الاهتزاز",
      darkMode: "الوضع الداكن",
      language: "اللغة",
      support: "الدعم",
      helpCenter: "مركز المساعدة",
      contactSupport: "اتصل بالدعم",
      terms: "الشروط والأحكام",
      privacy: "سياسة الخصوصية",
      account: "الحساب",
      syncData: "مزامنة البيانات",
      backupData: "نسخ احتياطي",
      deleteAccount: "حذف الحساب",
    },
    common: {
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      success: "نجاح",
    },
    driver: {
      home: "الرئيسية",
      requests: "الطلبات",
      earnings: "الأرباح",
      profile: "الملف الشخصي",
    },
  },
  fr: {
    settings: {
      title: "Paramètres",
      preferences: "Préférences",
      pushNotifications: "Notifications",
      sound: "Son",
      vibration: "Vibration",
      darkMode: "Mode sombre",
      language: "Langue",
      support: "Support",
      helpCenter: "Centre d'aide",
      contactSupport: "Contacter le support",
      terms: "Conditions générales",
      privacy: "Politique de confidentialité",
      account: "Compte",
      syncData: "Synchroniser",
      backupData: "Sauvegarder",
      deleteAccount: "Supprimer le compte",
    },
    common: {
      save: "Enregistrer",
      cancel: "Annuler",
      delete: "Supprimer",
      success: "Succès",
    },
    driver: {
      home: "Accueil",
      requests: "Demandes",
      earnings: "Gains",
      profile: "Profil",
    },
  },
};

let currentLanguage: Language = "en";

export const getCurrentLanguage = (): Language => {
  return currentLanguage;
};

export const setLanguage = async (lang: Language) => {
  currentLanguage = lang;
  await AsyncStorage.setItem("user-language", lang);
};

export const t = (key: string): string => {
  const keys = key.split(".");
  let result: any = translations[currentLanguage];
  for (const k of keys) {
    if (result && result[k] !== undefined) {
      result = result[k];
    } else {
      return key;
    }
  }
  return result || key;
};

export const initLanguage = async () => {
  const saved = (await AsyncStorage.getItem("user-language")) as Language;
  if (saved && (saved === "en" || saved === "ar" || saved === "fr")) {
    currentLanguage = saved;
  }
};
