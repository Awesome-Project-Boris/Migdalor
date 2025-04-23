import { Dimensions } from "react-native";

export let Globals = {
  // API_BASE_URL: "https://jhgjwm5v-44315.euw.devtunnels.ms", // Dev Tunnel
  // API_BASE_URL: "http://192.168.0.160:5293", // Lior's local server
   API_BASE_URL: 'http://192.168.68.107:5293', // Tom's
  // API_BASE_URL: 'http://192.168.7.16:5293', // Roi's

  userSelectedDirection: "ltr",
  userSelectedFontSize: 1,
  userNotificationsSetting: "both", // "vibration", "sound", "both", "none"
  userSelectedLanguage: "en", // "en", "he"
  SCREEN_WIDTH: Dimensions.get("window").width,
};
