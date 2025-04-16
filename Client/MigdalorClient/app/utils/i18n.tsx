import { transform } from '@babel/core';
import i18next from 'i18next';
import { initReactI18next } from "react-i18next";
import {Globals} from '../constants/Globals';
import Profile from '../Profile';
import SettingsLayout from '../(settings)/_layout';

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
      ProfileScreen_editButton: "Edit Profile",
      ProfileScreen_emptyDataField: "No information",

      EditProfileScreen_saveButton: "Save Changes",
      EditProfileScreen_cancelButton: "Cancel",
      EditProfileScreen_errorMessagePartner: "Partner name must contain only Hebrew and English letters",
      EditProfileScreen_errorMessageApartmentNumber: "Apartment number must be numeric",
      EditProfileScreen_errorMessageMobilePhone: "Enter a valid Israeli mobile number",
      EditProfileScreen_errorMessageEmail: "Enter a valid email address",
      EditProfileScreen_errorMessageArrivalYear: "Arrival year must have 4 digits",
      EditProfileScreen_errorMessageOrigin: "Origin field must contain only Hebrew and English letters or numbers",
      EditProfileScreen_errorMessageProfession: "Profession field must contain only Hebrew and English letters or numbers",
      EditProfileScreen_errorMessageInterests: "Interests field must contain only Hebrew and English letters or numbers",
      EditProfileScreen_errorMessageAboutMe: "About Me field must contain only Hebrew and English letters or numbers",
      EditProfileScreen_ProfileUpdated: "Profile Updated Successfully!",
      EditProfileScreen_ProfileUpdateCancelled: "Profile Update Cancelled",
      //EditProfileScreen_errorMessageExtraImages: "Please fill in the 'Extra Images' field",
      //EditProfileScreen_errorMessageImage: "Please fill in the 'Image' field",


      MainMenuScreen_ProfileButton: 'Profile',
      MainMenuScreen_ActivitiesAndClassesButton: 'Activities and Classes',
      MainMenuScreen_MarketplaceButton: 'Marketplace',
      MainMenuScreen_ResidentsCommitteeButton: "Residents' Committee",
      MainMenuScreen_ActivityHoursButton: 'Activity Hours',
      MainMenuScreen_MapButton: 'Map',


      SettingsPopup_SettingsButton: 'Settings',
      SettingsPopup_HomeButton: 'Home',
      SettingsPopup_ProfileButton: 'Profile',
      SettingsPopup_ChangeLayoutButton: 'Change Menu Layout',

      MarketplaceScreen_SearchButton: "Search",
      MarketplaceScreen_NewItemButton: "New Item",
      MarketplaceScreen_NextButton: "Next",
      MarketplaceScreen_PreviousButton: "Prev",
      MarketplaceScreen_MoreDetailsButton: "Tap to learn more",
      MarketplaceSearchItem_Header: "Search Item",
      MarketplaceSearchItem_SearchButton: "Search",
      MarketplaceSearchItem_CancelButton: "Cancel",
      MarketplaceSearchItem_SubmitButton: "Sumbit",





      MarketplaceItemScreen_Seller: "Seller:",
      MarketplaceItemScreen_Description: "Description:",
      MarketplaceItemScreen_ContactDetails: "Contact Details",
      MarketplaceItemScreen_CallButton: "Call",
      MarketplaceItemScreen_MessageButton: "Message on WhatsApp",
      MarketplaceItemScreen_EmailButton: "Email",
      MarketplaceItemScreen_PublishedDate: "Published on:",


      MarketplaceNewItemScreen_Header: "New Item Listing",
      MarketplaceNewItemScreen_NewItem: "New Item",
      MarketplaceNewItemScreen_ItemName: "Item Name",
      MarketplaceNewItemScreen_ItemDescription: "Item Description",
      MarketplaceNewItemScreen_CancelDiscardHeader: "Discard Unsaved Changes?",
      MarketplaceNewItemScreen_CancelDiscard: "No, Stay",
      MarketplaceNewItemScreen_CancelConfirmation: "Yes, Discard",
      MarketplaceNewItemScreen_MainImage: "Main Image",
      MarketplaceNewItemScreen_ExtraImage: "Extra Image",
      MarketplaceNewItemScreen_ImageOptional: "(Optional)",
      MarketplaceNewItemScreen_ImageTapToChoose: "Tap to choose",


      


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
      ProfileScreen_editButton: "עריכת פרופיל",
      ProfileScreen_emptyDataField: "אין מידע",

      EditProfileScreen_saveButton: "שמור שינויים",
      EditProfileScreen_cancelButton: "ביטול",
      EditProfileScreen_errorMessagePartner: "שדה 'בן/בת זוג' חייב להכיל רק אותיות בעברית ובאנגלית",
      EditProfileScreen_errorMessageApartmentNumber: "מספר הדירה חייב להיות מספרי",
      EditProfileScreen_errorMessageMobilePhone: "הכנס מספר טלפון נייד ישראלי תקין",
      EditProfileScreen_errorMessageEmail: "הכנס כתובת דואר אלקטרוני תקינה",
      EditProfileScreen_errorMessageArrivalYear: "שנת הגעה חייבת להיות בת 4 ספרות",
      EditProfileScreen_errorMessageOrigin: "שדה 'מקום מוצא' חייב להכיל רק אותיות בעברית ובאנגלית או מספרים",
      EditProfileScreen_errorMessageProfession: "שדה 'מקצוע' חייב להכיל רק אותיות בעברית ובאנגלית או מספרים",
      EditProfileScreen_errorMessageInterests: "שדה 'תחומי עניין' חייב להכיל רק אותיות בעברית ובאנגלית או מספרים",
      EditProfileScreen_errorMessageAboutMe: "שדה 'קצת על עצמי' חייב להכיל רק אותיות בעברית ובאנגלית או מספרים",
      EditProfileScreen_ProfileUpdated: "פרופיל עודכן בהצלחה!",
      EditProfileScreen_ProfileUpdateCancelled: "עדכון פרופיל בוטל",
      //EditProfileScreen_errorMessageExtraImages: "אנא מלא את שדה 'תמונות נוספות'",
      //EditProfileScreen_errorMessageImage: "אנא מלא את שדה 'תמונה'",

      
      MainMenuScreen_ProfileButton: 'פרופיל',
      MainMenuScreen_ActivitiesAndClassesButton: 'חוגים ופעילויות',
      MainMenuScreen_MarketplaceButton: 'שוק',
      MainMenuScreen_ResidentsCommitteeButton: "וועד דיירים",
      MainMenuScreen_ActivityHoursButton: 'שעות פעילות',
      MainMenuScreen_MapButton: 'מפה',


      SettingsPopup_SettingsButton: 'הגדרות',
      SettingsPopup_HomeButton: 'בית',
      SettingsPopup_ProfileButton: 'פרופיל',
      SettingsPopup_ChangeLayoutButton: 'שנה סדר תפריט',


      MarketplaceScreen_SearchButton: "חפש",
      MarketplaceScreen_NewItemButton: "פריט חדש",
      MarketplaceScreen_NextButton: "הבא",
      MarketplaceScreen_PreviousButton: "הקודם",
      MarketplaceScreen_MoreDetailsButton: "לחצו לפרטים נוספים",
      MarketplaceSearchItem_Header: "חפש פריט",
      MarketplaceSearchItem_SearchButton: "חפש",  
      MarketplaceSearchItem_CancelButton: "ביטול",
      MarketplaceSearchItem_SubmitButton: "שלח",
      

      MarketplaceItemScreen_Seller:  "מוכר:",
      MarketplaceItemScreen_Description: "תיאור:",
      MarketplaceItemScreen_ContactDetails: "פרטי יצירת קשר",
      MarketplaceItemScreen_CallButton: "התקשר",
      MarketplaceItemScreen_MessageButton: "שלח הודעה בוואטסאפ",
      MarketplaceItemScreen_EmailButton: "שלח מייל",
      MarketplaceItemScreen_PublishedDate: "פורסם בתאריך:",


      MarketplaceNewItemScreen_Header: "רשימת פריט חדש",
      MarketplaceNewItemScreen_NewItem: "פריט חדש",
      MarketplaceNewItemScreen_ItemName: "שם הפריט",
      MarketplaceNewItemScreen_ItemDescription: "תיאור הפריט",
      MarketplaceNewItemScreen_CancelDiscardHeader: "למחוק שינויים שנעשו?",
      MarketplaceNewItemScreen_CancelDiscard: "לא, השאר",
      MarketplaceNewItemScreen_CancelConfirmation: "כן, מחק",
      MarketplaceNewItemScreen_MainImage: "תמונה ראשית",
      MarketplaceNewItemScreen_ExtraImage: "תמונה נוספת",
      MarketplaceNewItemScreen_ImageOptional: "(אופציונלי)",
      MarketplaceNewItemScreen_ImageTapToChoose: "לחץ לבחירה",
      



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