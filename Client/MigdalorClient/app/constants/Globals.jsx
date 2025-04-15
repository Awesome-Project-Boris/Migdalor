import { Dimensions } from "react-native";


export let Globals= {
  API_BASE_URL: 'http://192.168.7.16:5293',
  APP_NAME: 'MyCoolApp',
  DEFAULT_TIMEOUT: 5000,
  THEME: "light", // Default theme
  userSelectedDirection: "ltr",
  userSelectedFontSize: 1,
  userVolumeSetting: 5,
  userNotificationsSetting: "both", // "vibration", "sound", "both", "none"
  userSelectedLanguage: "en", // "en", "he"
  SCREEN_WIDTH: Dimensions.get("window").width,
};
