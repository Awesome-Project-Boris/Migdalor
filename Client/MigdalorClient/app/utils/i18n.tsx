import { transform } from '@babel/core';
import i18next from 'i18next';
import { initReactI18next } from "react-i18next";
import {Globals} from '../constants/Globals';
import Profile from '../Profile';
import SettingsLayout from '../(settings)/_layout';

const resources = {
  en: { // English translations
    translation: {
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
      MainMenuScreen_NoticeBoardButton: "Notice Board",
      MainMenuScreen_ResidentListButton: "Resident List",


      SettingsPopup_SettingsButton: 'Settings',
      SettingsPopup_HomeButton: 'Home',
      SettingsPopup_ProfileButton: 'Profile',
      SettingsPopup_ChangeLayoutButton: 'Change Menu Layout',

      MarketplaceScreen_SearchButton: "Search",
      MarketplaceScreen_NewItemButton: "New Item",
      MarketplaceScreen_NextButton: "Next",
      MarketplaceScreen_PreviousButton: "Prev",
      MarketplaceScreen_MoreDetailsButton: "Tap to learn more",
      MarketplaceScreen_ShowingResultsFor: "Showing results for:",
      MarketplaceScreen_ClearSearchButton: "Clear Search",
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
      MarketplaceItemScreen_ExtraImage: "Extra Image", MarketplaceItemScreen_DescriptionTitle: "Description", MarketplaceItemScreen_SellerTitle: "Seller", MarketplaceItemScreen_ContactEmail: "Email", MarketplaceItemScreen_ContactPhone: "Phone", MarketplaceItemScreen_ContactWhatsApp: "WhatsApp", 
      MarketplaceItemScreen_Loading: "Loading item...",

      MarketplaceItemCard_Untitled: "Untitled",
      MarketplaceItemCard_UnknownSeller: "Unknown Seller",

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
      MarketplaceNewItemScreen_missingInfoTitle: "Missing Info", MarketplaceNewItemScreen_missingInfoMessage: "Please enter an item name.", MarketplaceNewItemScreen_authErrorTitle: "Authentication Error", MarketplaceNewItemScreen_authErrorMessage: "User not identified. Please log in again.", MarketplaceNewItemScreen_errorTitle: "Error", MarketplaceNewItemScreen_userInfoRetrievalError: "Could not retrieve user information.",
      MarketplaceNewItemScreen_imageUploadFailedTitle: "Image Upload Failed",
      MarketplaceNewItemScreen_listingCreationFailedTitle: "Listing Creation Failed",
      MarketplaceNewItemScreen_listingCreatedTitle: "Listing Created!",
      MarketplaceNewItemScreen_listingCreatedSuccessMsg: "Your listing has been created successfully!",
      MarketplaceNewItemScreen_errorTitleRequired: "Item name is required.",
      MarketplaceNewItemScreen_errorTitleTooLong: "Item name is too long.",
      MarketplaceNewItemScreen_errorDescriptionTooLong: "Item description is too long.",
      MarketplaceNewItemScreen_errorDescriptionTooManySpecialChars: "Description contains too many special characters.",



      MainMenuNameplate_greetingGoodMorning: "Good Morning",
      MainMenuNameplate_greetingGoodAfternoon: "Good Afternoon",
      MainMenuNameplate_greetingGoodEvening: "Good Evening",
      MainMenuNameplate_greetingGoodNight: "Good Night",
      MainMenuNameplate_greetingPunctuation: "!",



      MainMenuScreen_DoneButton: "Done",
      MainMenuScreen_saveOrderSuccess: "Menu order saved!", MainMenuScreen_saveOrderFailure: "Failed to save order",MainMenuScreen_loadingMenu: "Loading menu…",


      LoginScreen_loginSuccess: "Logged in successfully",
      LoginScreen_loginErrorTitle: "Error!",
      LoginScreen_loginErrorMessage: "Incorrect username or password!",
      LoginScreen_phoneNumberLabel: "Phone Number", LoginScreen_passwordLabel: "Password",
      LoginScreen_loginButton: "Login",


      MapScreen_building1Name: "Building One", MapScreen_building1Info: "This is the first building we defined – the entrance building",Permissions_locationPermissionMessage: "Location permission is needed to show position.", Permissions_okButton: "OK.", Permissions_openSettingsButton: "Open Settings.", Permissions_permissionDeniedTitle: "Permission denied.",
      LocationScreen_locationPermissionLabel: "Location Permission:", LocationScreen_insideBoundaryLabel: "Inside Boundary:", LocationScreen_userLocationLabel: "User Location:",MapScreen_backToMapButton: "Back to Map", 
    
    
      ImagePicker_selectSourceTitle: "Select Image Source", ImagePicker_selectSourceMessage: "Choose how to select the image", ImagePicker_takePhotoButton: "Take Photo", ImagePicker_chooseFromLibraryButton: "Choose From Library", ImagePicker_cancelButton: "Cancel", ImagePicker_permissionDeniedTitle: "Permission Denied", ImagePicker_libraryPermissionDeniedMessage: "Permission to access photos is required!", ImagePicker_cameraPermissionDeniedMessage: "Camera permission is required!", ImagePicker_errorTitle: "Error", ImagePicker_saveCameraImageFailure: "Could not save camera image.", ImagePicker_saveLibraryImageFailure: "Could not save library image.", ImagePicker_openLibraryFailure: "Could not open image library.",
      ImageViewScreen_ErrorNoImage: "No image available",
      MarketplaceScreen_NoItems: "No items found",


      NoticeDetailsScreen_loadingDetails: "Loading notice details...",
      NoticeDetailsScreen_categoryLabel: "Category:",
      NoticeDetailsScreen_dateLabel: "Date:",
      Common_backButton: "Go back",
      Common_BackButtonShort: "Back",
      NoticeBoardScreen_boardTitle: "Notice Board", 
      NoticeBoardScreen_filterButton: "Filter", NoticeBoardScreen_all: "All",

      NoticeBoardScreen_filterLabel: "Filter:",
      NoticeBoardScreen_sortOldest: "Oldest",
      NoticeBoardScreen_sortNewest: "Newest",
      NoticeBoardScreen_noMatchMessage: "No notices match selected filters.", NoticeBoardScreen_noNoticesMessage: "No notices found.",


      NoticeFilterModal_modalTitle: "Filter by categories", NoticeFilterModal_selectAll: "Select All", NoticeFilterModal_deselectAll: "Deselect All", NoticeFilterModal_cancelButton: "Cancel", NoticeFilterModal_applyFilter: "Apply Filter",




      ResidentSearchScreen_searchByLabel: "Search by:", ResidentSearchScreen_searchByName: "Name", ResidentSearchScreen_searchByHobby: "Hobby",
      ResidentSearchScreen_enterNamePlaceholder: "Enter name...", ResidentSearchScreen_enterHobbyPlaceholder: "Enter hobby...",
      ResidentSearchScreen_noMatchMessage: "No users match your search.", ResidentSearchScreen_noUsersMessage: "No users found.",


      
      
      ResidentsCommitte_nameUnavailable: "Name Unavailable", ResidentsCommitte_titleUnavailable: "Title Unavailable",
      ResidentsCommittePage_title: "The Committee",
      ResidentsCommittePage_contact: "Contact the Committee",
      ResidentsCommittePage_committeeNotFound: "No committee members found.",

      

      UserProfileCard_unnamedUser: "Unnamed User",



      Common_viewAllDataButton: "View All Data",
      Common_clearAllDataButton: "Clear All Data",


      LoginScreen_rememberMe: "Remember Me", 

    },
  },
  he: { // Hebrew translations
    translation: {
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
      MainMenuScreen_NoticeBoardButton: "לוח מודעות",
       MainMenuScreen_ResidentListButton: "רשימת הדיירים",



      SettingsPopup_SettingsButton: 'הגדרות',
      SettingsPopup_HomeButton: 'בית',
      SettingsPopup_ProfileButton: 'פרופיל',
      SettingsPopup_ChangeLayoutButton: 'שנה סדר תפריט',


      MarketplaceScreen_SearchButton: "חפש",
      MarketplaceScreen_NewItemButton: "פריט חדש",
      MarketplaceScreen_NextButton: "הבא",
      MarketplaceScreen_PreviousButton: "הקודם",
      MarketplaceScreen_MoreDetailsButton: "לחצו לפרטים נוספים",
      MarketplaceScreen_ShowingResultsFor: "מראה תוצאות עבור:",
      MarketplaceScreen_ClearSearchButton: "לביטול החיפוש",
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
      MarketplaceItemScreen_ExtraImage: "תמונה נוספת", MarketplaceItemScreen_DescriptionTitle: "תיאור", MarketplaceItemScreen_SellerTitle: "מוכר", MarketplaceItemScreen_ContactEmail: "דוא״ל", MarketplaceItemScreen_ContactPhone: "טלפון", MarketplaceItemScreen_ContactWhatsApp: "וואטסאפ",
      MarketplaceItemScreen_Loading: "טוען פריט...",


      MarketplaceItemCard_Untitled: "ללא כותרת",
      MarketplaceItemCard_UnknownSeller: "מוכר לא ידוע",


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
      MarketplaceNewItemScreen_missingInfoTitle: "מידע חסר", MarketplaceNewItemScreen_missingInfoMessage: "אנא הזן שם פריט.", MarketplaceNewItemScreen_authErrorTitle: "שגיאת אימות", MarketplaceNewItemScreen_authErrorMessage: "המשתמש לא זוהה. אנא התחבר מחדש.", MarketplaceNewItemScreen_errorTitle: "שגיאה", MarketplaceNewItemScreen_userInfoRetrievalError: "לא ניתן לאחזר פרטי משתמש.",
      MarketplaceNewItemScreen_imageUploadFailedTitle: "העלאת התמונה נכשלה",
      MarketplaceNewItemScreen_listingCreationFailedTitle: "יצירת ההצעה נכשלה",
      MarketplaceNewItemScreen_listingCreatedTitle: "ההצעה נוצרה!",

      MarketplaceNewItemScreen_listingCreatedSuccessMsg: "ההצעה שלך נוצרה בהצלחה!",
      MarketplaceNewItemScreen_errorTitleRequired: "חובה להזין שם הפריט.",
      MarketplaceNewItemScreen_errorTitleTooLong: "שם הפריט ארוך מדי.",
      MarketplaceNewItemScreen_errorDescriptionTooLong: "תיאור הפריט ארוך מדי.",
      MarketplaceNewItemScreen_errorDescriptionTooManySpecialChars: "התיאור מכיל יותר מדי תווים מיוחדים.",


      MainMenuNameplate_greetingGoodMorning: "בוקר טוב",
      MainMenuNameplate_greetingGoodAfternoon: "אחר הצהריים טובים",
      MainMenuNameplate_greetingGoodEvening: "ערב טוב",
      MainMenuNameplate_greetingGoodNight: "לילה טוב",
      MainMenuNameplate_greetingPunctuation: "!",


      MainMenuScreen_DoneButton: "סיימתי",
      MainMenuScreen_saveOrderSuccess: "סדר התפריט נשמר!", MainMenuScreen_saveOrderFailure: "שמירת הסדר נכשלה", MainMenuScreen_loadingMenu: "טוען תפריט…",


      LoginScreen_loginSuccess: "התחברת בהצלחה",
      LoginScreen_loginErrorTitle: "שגיאה!",
      LoginScreen_loginErrorMessage: "שם משתמש או סיסמה שגויים!",
      LoginScreen_phoneNumberLabel: "מספר טלפון", LoginScreen_passwordLabel: "סיסמה",
      LoginScreen_loginButton: "כניסה",


      MapScreen_building1Name: "בניין מספר אחת", MapScreen_building1Info: "זהו הבניין הראשון שהגדרנו - בניין הכניסה",Permissions_locationPermissionMessage: "נדרשת הרשאת מיקום להצגת המיקום.", Permissions_okButton: "אישור.", Permissions_openSettingsButton: "פתח הגדרות.", Permissions_permissionDeniedTitle: "ההרשאה נדחתה.",
      LocationScreen_locationPermissionLabel: "הרשאת מיקום:", LocationScreen_insideBoundaryLabel: "בתוך הגבול:", LocationScreen_userLocationLabel: "מיקום משתמש:",MapScreen_backToMapButton: "חזרה למפה",
    
    
    
    
    
      ImagePicker_selectSourceTitle: "בחר מקור תמונה", ImagePicker_selectSourceMessage: "בחר כיצד לבחור את התמונה", ImagePicker_takePhotoButton: "צלם תמונה", ImagePicker_chooseFromLibraryButton: "בחר מהספרייה", ImagePicker_cancelButton: "ביטול", ImagePicker_permissionDeniedTitle: "ההרשאה נדחתה", ImagePicker_libraryPermissionDeniedMessage: "נדרשת הרשאה לגישה לתמונות!", ImagePicker_cameraPermissionDeniedMessage: "נדרשת הרשאת מצלמה!", ImagePicker_errorTitle: "שגיאה", ImagePicker_saveCameraImageFailure: "לא ניתן לשמור את תמונת המצלמה.", ImagePicker_saveLibraryImageFailure: "לא ניתן לשמור את תמונת הספרייה.", ImagePicker_openLibraryFailure: "לא ניתן לפתוח את ספריית התמונות.",
      ImageViewScreen_ErrorNoImage: "אין תמונה זמינה",



      MarketplaceScreen_NoItems: "לא נמצאו פריטים",



    
    
      NoticeDetailsScreen_loadingDetails: "טוען פרטי הודעה...",
      NoticeDetailsScreen_categoryLabel: "קטגוריה:",
      NoticeDetailsScreen_dateLabel: "תאריך:",
      Common_backButton: "חזרה לאחור",
      NoticeBoardScreen_boardTitle: "לוח המודעות",
      NoticeBoardScreen_filterButton: "סינון", NoticeBoardScreen_all: "הכל",
      NoticeBoardScreen_filterLabel: "סינון:",
      NoticeBoardScreen_sortOldest: "הישן ביותר",
      NoticeBoardScreen_sortNewest: "החדש ביותר",
      NoticeBoardScreen_noMatchMessage: "אין הודעות שתואמות את המסננים שנבחרו.", NoticeBoardScreen_noNoticesMessage: "לא נמצאו הודעות.",


      NoticeFilterModal_modalTitle: "סנן לפי קטגוריות", NoticeFilterModal_selectAll: "בחר הכל", NoticeFilterModal_deselectAll: "בטל את כל הבחירות", NoticeFilterModal_cancelButton: "ביטול", NoticeFilterModal_applyFilter: "בצע סינון",


      ResidentSearchScreen_searchByLabel: "חפש לפי:", ResidentSearchScreen_searchByName: "שם", ResidentSearchScreen_searchByHobby: "תחביב",
      ResidentSearchScreen_enterNamePlaceholder: "הכנס שם...", ResidentSearchScreen_enterHobbyPlaceholder: "הכנס תחביב...",
      ResidentSearchScreen_noMatchMessage: "אין משתמשים התואמים לחיפוש שלך.", ResidentSearchScreen_noUsersMessage: "לא נמצאו משתמשים.",



      ResidentsCommitte_nameUnavailable: "שם לא זמין", ResidentsCommitte_titleUnavailable: "תואר לא זמין",
      ResidentsCommittePage_title: "וועד דיירים",
      ResidentsCommittePage_contact: "צור קשר עם הוועד",
      ResidentsCommittePage_committeeNotFound: "לא נמצאו חברי ועד.",




      UserProfileCard_unnamedUser: "משתמש ללא שם",



      Common_viewAllDataButton: "הצג את כל הנתונים",
      Common_clearAllDataButton: "נקה את כל הנתונים",
      Common_BackButtonShort: "חזרה",


      LoginScreen_rememberMe: "זכור אותי",


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