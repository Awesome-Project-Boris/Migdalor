
import { Dimensions } from "react-native";


export let Globals= {
  API_BASE_URL: 'https://api.myserver.com',
  APP_NAME: 'MyCoolApp',
  DEFAULT_TIMEOUT: 5000,
  THEME: 'light', // Default theme
  LANGUAGE: 'en', // Default language
  userSelectedDirection: "rtl",
  userSelectedFontSize: 1,
  SCREEN_WIDTH : Dimensions.get("window").width
};
