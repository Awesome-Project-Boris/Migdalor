import { Dimensions } from "react-native";

export let Globals = {
  // API_BASE_URL: "https://jhgjwm5v-44315.euw.devtunnels.ms", // Dev Tunnel
  // API_BASE_URL: "https://proj.ruppin.ac.il/cgroup87/prod", // Ruppin's server
  // API_BASE_URL: "http://192.168.0.160:44315", // Lior's local server
  // API_BASE_URL: 'http://192.168.1.234:44315', // Tom's
  API_BASE_URL: "http://192.168.7.16:44315", // Roi's

  userSelectedDirection: "ltr",
  userSelectedFontSize: 1,
  userNotificationsSetting: "both", // "both", "none"
  userSelectedLanguage: "en", // "en", "he"
  SCREEN_WIDTH: Dimensions.get("window").width,
};
