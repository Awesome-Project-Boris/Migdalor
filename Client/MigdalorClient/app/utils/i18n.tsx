import { transform } from '@babel/core';
import i18next from 'i18next';
import { initReactI18next } from "react-i18next";
import {Globals} from '../constants/Globals';
import Profile from '../Profile';

const resources = {
  en: { // English translations
    translation: {
      namespace1: 'hello from namespace 1',

      SettingsLayoutTabs_FontSettings: 'Font Settings',
      SettingsLayoutTabs_notificationSettings: 'Notification Settings',
      SettingsLayoutTabs_languageSettings: 'Language Settings',

      FontSettingsPage_header: 'Font Settings:',
      FontSettingsPage_exampleHeader: 'Sample Text:',
      FontSettingsPage_example: "The Wizard of Oz: Dorothy and her little dog Toto lived in a small village in America.\nDorothy loved Toto very much, and they played with each other all the time. One day there was a terrible tornado. \"We have to get to the basement, Toto!\" Dorothy shouted. But it was too late. The strong and fierce wind lifted the farmhouse into the air and took Dorothy and Toto to the distant Land of Oz.",


      NotificationSettingsPage_header: 'Notification Settings:',
      NotificationSettingsPage_both: 'Sound and Vibration',
      NotificationSettingsPage_sound: 'Sound',
      NotificationSettingsPage_vibrate: 'Vibration',
      NotificationSettingsPage_silent: 'Silent',
      NotificationSettingsPage_on: 'On',
      NotificationSettingsPage_off: 'Off',

      LanguageSettingsPage_header: 'Language Settings:',
      LanguageSettingsPage_he: "Hebrew",
      LanguageSettingsPage_en: "English",

      ProfileScreen_header: 'Profile',
      ProfileScreen_partner: "Partner",
      ProfileScreen_apartmentNumber: "Apartment Number",
      ProfileScreen_mobilePhone: "Mobile Phone",
      ProfileScreen_email: "Email",
      ProfileScreen_arrivalYear: "Year of Arrival to Nordia",
      ProfileScreen_origin: "Originally From",
      ProfileScreen_profession: "Profession",
      ProfileScreen_interests: "Interests",
      ProfileScreen_aboutMe: "About Me",
      ProfileScreen_extraImages: "Extra Images",

      EditProfileScreen_saveButton: "Save Changes",
      EditProfileScreen_cancelButton: "Cancel",
      //EditProfileScreen_errorMessagePartner: "Please fill in the 'Partner' section",
      EditProfileScreen_errorMessageApartmentNumber: "Apartment number must be numeric",
      EditProfileScreen_errorMessageMobilePhone: "Enter a valid Israeli mobile number",
      EditProfileScreen_errorMessageEmail: "Enter a valid email address",
      EditProfileScreen_errorMessageArrivalYear: "Arrival year must have 4 digits",
      //EditProfileScreen_errorMessageOrigin: "Please fill in the 'Originally From' section",
      //EditProfileScreen_errorMessageProfession: "Please fill in the 'Profession' section",
      EditProfileScreen_errorMessageInterests: "Interests section must be under 200 characters",
      EditProfileScreen_errorMessageAboutMe: "About Me section must be under 300 characters",
      //EditProfileScreen_errorMessageExtraImages: "Please fill in the 'Extra Images' section",
      //EditProfileScreen_errorMessageImage: "Please fill in the 'Image' section",



    },
  },
  he: { // Hebrew translations
    translation: {
      namespace1: 'שלום ממרחב השמות 1',

      SettingsLayoutTabs_FontSettings: 'הגדרות גופן',
      SettingsLayoutTabs_notificationSettings: 'הגדרות התראות',
      SettingsLayoutTabs_languageSettings: 'הגדרות שפה',

      FontSettingsPage_header: 'גודל טקסט:',
      FontSettingsPage_exampleHeader: 'טקסט לדוגמה:',
      FontSettingsPage_example: "הקוסם מארץ עוץ: דורותי והכלב הקטן שלה טוטו גרו בכפר קטן באמריקה,\nדורותי אהבה מאוד את טוטו, והם היו משחקים אחד עם השניה כל הזמן. יום אחד היה סופת טורנדו נוראית. \"אנחנו חייבים להגיע למרתף, טוטו!\" קראה דורותי. אבל זה היה מאוחר מדי. הרוח החזקה והסוערת הרימה את בית החווה לאוויר ולקחה את דורותי וטוטו לארץ עוץ הנידחת.",


      NotificationSettingsPage_header: 'הגדרות התראות:',
      NotificationSettingsPage_both: 'קול ורטט',
      NotificationSettingsPage_sound: 'קול',
      NotificationSettingsPage_vibrate: 'רטט',
      NotificationSettingsPage_silent: 'מושתק',

      LanguageSettingsPage_header: 'הגדרות שפה:',
      LanguageSettingsPage_he: "עברית",
      LanguageSettingsPage_en: "אנגלית",

      ProfileScreen_header: 'פרופיל',
      ProfileScreen_partner: "בן/בת זוג",
      ProfileScreen_apartmentNumber: "מספר דירה",
      ProfileScreen_mobilePhone: "טלפון נייד",
      ProfileScreen_email: "דואר אלקטרוני",
      ProfileScreen_arrivalYear: "שנת הגעה לנורדיה",
      ProfileScreen_origin: "מקום מוצא",
      ProfileScreen_profession: "מקצוע",
      ProfileScreen_interests: "תחומי עניין",
      ProfileScreen_aboutMe: "קצת על עצמי",
      ProfileScreen_extraImages: "תמונות נוספות",

      EditProfileScreen_saveButton: "שמור שינויים",
      EditProfileScreen_cancelButton: "ביטול",
      //EditProfileScreen_errorMessagePartner: "אנא מלא את שדה 'בן/בת זוג'",
      EditProfileScreen_errorMessageApartmentNumber: "מספר הדירה חייב להיות מספרי",
      EditProfileScreen_errorMessageMobilePhone: "הכנס מספר טלפון נייד ישראלי תקין",
      EditProfileScreen_errorMessageEmail: "הכנס כתובת דואר אלקטרוני תקינה",
      EditProfileScreen_errorMessageArrivalYear: "שנת הגעה חייבת להיות בת 4 ספרות",
      //EditProfileScreen_errorMessageOrigin: "אנא מלא את שדה 'מקום מוצא'",
      //EditProfileScreen_errorMessageProfession: "אנא מלא את שדה 'מקצוע'",
      EditProfileScreen_errorMessageInterests: "שדה תחומי עניין חייב להיות מתחת ל 200 תווים",
      EditProfileScreen_errorMessageAboutMe: "שדה 'קצת על עצמי' חייב להיות מתחת ל 300 תווים",
      //EditProfileScreen_errorMessageExtraImages: "אנא מלא את שדה 'תמונות נוספות'",
      //EditProfileScreen_errorMessageImage: "אנא מלא את שדה 'תמונה'",



    },
  }
};


i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: Globals.userSelectedLanguage, // Set the language based on user selection
    fallbackLng: 'en', // Fallback to English if translation is missing
    debug: true,
    interpolation: {
      escapeValue: false, // React already does escaping
    },
  })

export default i18next;