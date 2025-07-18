// migdalor/src/context/SettingsContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { Globals } from '@/app/constants/Globals'; // For initial defaults

// Keys for AsyncStorage
const FONT_SIZE_KEY = '@userSelectedFontSize';
const LANGUAGE_KEY = '@userSelectedLanguage';
const NOTIFICATION_KEY = '@userNotificationsSetting';

// Create the context
const SettingsContext = createContext();

// Create the provider component
export const SettingsProvider = ({ children }) => {
  const { i18n } = useTranslation();

  const [settings, setSettings] = useState({
    fontSizeMultiplier: Globals.userSelectedFontSize,
    language: Globals.userSelectedLanguage,
    notificationSetting: Globals.userNotificationsSetting,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSize = await AsyncStorage.getItem(FONT_SIZE_KEY);
        const storedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
        const storedNotification = await AsyncStorage.getItem(NOTIFICATION_KEY);

        const loadedSettings = {
          fontSizeMultiplier: storedSize ? JSON.parse(storedSize) : Globals.userSelectedFontSize,
          language: storedLang || Globals.userSelectedLanguage,
          notificationSetting: storedNotification || Globals.userNotificationsSetting,
        };

        setSettings(loadedSettings);

        // Apply the loaded language immediately
        if (loadedSettings.language) {
            await i18n.changeLanguage(loadedSettings.language);
            Globals.userSelectedLanguage = loadedSettings.language;
            Globals.userSelectedDirection = loadedSettings.language === "he" ? 'rtl' : 'ltr';
        }

      } catch (e) {
        console.error("Failed to load settings from storage", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [i18n]);

  // Generic function to update a setting
  const updateSetting = async (key, value) => {
    try {
      setSettings(prev => ({ ...prev, [key]: value }));

      // Persist to AsyncStorage and update globals
      switch (key) {
        case 'fontSizeMultiplier':
          await AsyncStorage.setItem(FONT_SIZE_KEY, JSON.stringify(value));
          break;
        case 'language':
          await AsyncStorage.setItem(LANGUAGE_KEY, value);
          await i18n.changeLanguage(value);
          Globals.userSelectedLanguage = value;
          Globals.userSelectedDirection = value === "he" ? 'rtl' : 'ltr';
          break;
        case 'notificationSetting':
          await AsyncStorage.setItem(NOTIFICATION_KEY, value);
          break;
        default:
          throw new Error("Invalid setting key");
      }
    } catch (e) {
      console.error(`Failed to save setting ${key} to storage`, e);
    }
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook for easy consumption
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};