//import { transform } from '@babel/core';

import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import Events from "../Events";
// import {Globals} from '../constants/Globals'; // No longer needed for initialization

const resources = {
  en: {
    // English translations
    translation: {
      SettingsLayoutTabs_FontSettings: "Font Settings",
      SettingsLayoutTabs_notificationSettings: "Notification Settings",
      SettingsLayoutTabs_languageSettings: "User Settings",
      SettingsLayoutTabs_SaveChanges: "Save Changes",

      FontSettingsPage_header: "Font Settings:",
      FontSettingsPage_exampleHeader: "Sample Text:",
      FontSettingsPage_example:
        'The Wizard of Oz: Dorothy and her little dog Toto lived in a small village in America.\nDorothy loved Toto very much, and they played with each other all the time. One day there was a terrible tornado. "We have to get to the basement, Toto!" Dorothy shouted. But it was too late. The strong and fierce wind lifted the farmhouse into the air and took Dorothy and Toto to the distant Land of Oz.',

      NotificationSettingsPage_header: "Notification Settings:",
      NotificationSettingsPage_normal: "Normal",
      NotificationSettingsPage_silent: "Silent",

      LanguageSettingsPage_header: "Language Settings:",
      LanguageSettingsPage_LogoutHeader: "Account Settings:",
      LanguageSettingsPage_Logout: "Logout",
      LanguageSettingsPage_LogoutToast: "Logged out successfully!",
      LanguageSettingsPage_he: "Hebrew",
      LanguageSettingsPage_en: "English",

      ProfileScreen_header: "Profile",
      ProfileScreen_partner: "Partner",
      ProfileScreen_apartmentNumber: "Apartment Number",
      ProfileScreen_mobilePhone: "Mobile Phone",
      ProfileScreen_email: "Email",
      ProfileScreen_arrivalYear: "Date of Arrival to Nordia",
      ProfileScreen_origin: "Originally From",
      ProfileScreen_profession: "Profession",
      ProfileScreen_interests: "Hobbies",
      ProfileScreen_aboutMe: "About Me",
      ProfileScreen_extraImages: "Extra Images",
      ProfileScreen_editButton: "Edit Profile",
      ProfileScreen_emptyDataField: "No information",
      ProfileScreen_privateProfile: "This profile is private",
      ProfileScreen_profileImage: "Profile Image",

      Common_Loading: "Loading...",

      interestModal_newlyAdded: "Newly Added Hobbies",

      PrivacySettings_savedLocally: "Privacy settings saved locally",
      PrivacySettings_title: "Privacy Settings",
      PrivacySettings_SubTitle: "Choose what information to share with others",

      EditProfileScreen_saveButton: "Save Changes",
      EditProfileScreen_cancelButton: "Cancel",
      Validation_FieldIsRequired: "This field is required",
      EditProfileScreen_errorMessagePartner:
        "Partner name must contain only Hebrew and English letters",
      EditProfileScreen_errorMessageApartmentNumber:
        "Apartment number must be numeric",
      EditProfileScreen_errorMessageMobilePhone:
        "Enter a valid Israeli mobile number",
      EditProfileScreen_errorMessageEmail: "Enter a valid email address",
      EditProfileScreen_errorMessageArrivalYear:
        "Arrival year must have 4 digits",
      EditProfileScreen_errorMessageOrigin:
        "Origin field must contain only Hebrew and English letters or numbers",
      EditProfileScreen_errorMessageProfession:
        "Profession field must contain only Hebrew and English letters or numbers",
      EditProfileScreen_errorMessageInterests:
        "Hobbies field must contain only Hebrew and English letters or numbers",
      EditProfileScreen_errorMessageAboutMe:
        "About Me field must contain only Hebrew and English letters or numbers",
      EditProfileScreen_ProfileUpdated: "Profile Updated Successfully!",
      EditProfileScreen_ProfileUpdateCancelled: "Profile Update Cancelled",
      //EditProfileScreen_errorMessageExtraImages: "Please fill in the 'Extra Images' field",
      //EditProfileScreen_errorMessageImage: "Please fill in the 'Image' field",

      EditProfileScreen_noInterests: "No Hobbies to display",
      EditProfileScreen_editInterestsButton: "Select Hobbies",

      ApartmentSelector_Exists: "This apartment is already in our system.",
      ApartmentSelector_Potential:
        "This is a valid apartment. It will be added to our system upon saving.",
      ApartmentSelector_Invalid:
        "This apartment number is not within the valid range.",

      interestModal_title: "Edit Hobbies",
      interestModal_searchPlaceholder: "Search for an Hobbies...",
      interestModal_selectExisting: "Select from existing",
      interestModal_noResults: "No Hobbies found.",
      interestModal_addNew: "Or add a new one",
      interestModal_addPlaceholder: "Type a new Hobbie ( Hebrew )",
      interestModal_addButton: "Add",
      interestModal_acceptButton: "Accept",
      interestModa_newlyAdded: "Newly added Hobbies",

      interestModal_yourSelections: "Your Selections",
      interestModal_existsTitle: "Hobby Exists",
      interestModal_existsMsg:
        "This hobby is already in the list and has been selected.",
      interestModal_similarTitle: "Similar Hobby Found",
      interestModal_similarMsg:
        "This is very similar to '{{existingName}}'. Add '{{newName}}' anyway?",
      interestModal_addAnyway: "Add Anyway",
      interestModal_didYouMean: "Did you mean:",
      interestModal_deselectDisclaimer:
        "Clicking a selected hobby will de-select it.",
      interestModal_suggestionAcceptedTitle: "Suggestion Accepted",
      interestModal_suggestionAcceptedMsg:
        "The hobby has been added to your selections",

      MainMenuScreen_ProfileButton: "Profile",
      MainMenuScreen_ActivitiesAndClassesButton: "Activities and Classes",
      MainMenuScreen_MarketplaceButton: "Marketplace",
      MainMenuScreen_ResidentsCommitteeButton: "Residents' Committee",
      MainMenuScreen_ActivityHoursButton: "Activity Hours",
      MainMenuScreen_MapButton: "Map",
      MainMenuScreen_NoticeBoardButton: "Notice Board",
      MainMenuScreen_ResidentListButton: "Resident List",
      MainMenuScreen_Timetable: "Time Table",

      InstructorMainMenu_EventsButton: "Events",

      Events_Title: "Events",
      Events_NoEvents: "You have no events to manage at this time.",
      Events_Loading: "Loading Your Events...",
      Events_Selct: "Select an Event",
      Events_Choose: "-- Choose an Event --",
      Events_ChooseDate: "-- Choose a Date --",
      Events_SelectMeeting: "Select a Meeting",
      Events_NoMeetings: "No upcoming meetings",
      Events_MissingInformation: "Missing Information",
      Events_MissingInformationMessage:
        "Please select a meeting and provide a reason.",
      Events_InvalidDate: "Invalid Date",
      Events_InvalidDateMessage:
        "Cannot reschedule a meeting to a time that has already passed.",
      Events_MoveMeeting: "Move meeting to another time",
      Events_NewMeeting: "New Meeting Date & Time",
      Events_Reason_for_Move: "Reason for Move",
      Events_Reason_for_Cancellation: "Reason for Cancellation",
      Events_Confirm_Cancellation: "Confirm Cancellation",
      Events_Confirm_Move: "Confirm Move",
      Events_DescriptionPlaceholder: "e.g., Personal emergency, etc.",

      SettingsPopup_SettingsButton: "Settings",
      SettingsPopup_HomeButton: "Home",
      SettingsPopup_ProfileButton: "Profile",
      SettingsPopup_ChangeLayoutButton: "Change Menu Layout",

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
      MarketplaceItemScreen_ExtraImage: "Extra Image",
      MarketplaceItemScreen_DescriptionTitle: "Description",
      MarketplaceItemScreen_SellerTitle: "Seller",
      MarketplaceItemScreen_ContactEmail: "Email",
      MarketplaceItemScreen_ContactPhone: "Phone",
      MarketplaceItemScreen_ContactWhatsApp: "WhatsApp",
      MarketplaceItemScreen_Loading: "Loading item...",
      MarketplaceItemScreen_EditButton: "Edit Listing",
      MarketplaceItemScreen_DeleteButton: "Delete Listing",
      MarketplaceItemScreen_DeleteConfirmTitle: "Confirm Deletion",
      MarketplaceItemScreen_DeleteConfirmMsg:
        "Are you sure you want to delete this listing? This cannot be undone.",
      MarketplaceItemScreen_DeleteSuccessMsg: "Listing deleted successfully!",
      MarketplaceItemScreen_DeleteErrorMsg: "Failed to delete listing.",
      MarketplaceItemScreen_PicDeleteErrorTitle: "Picture Deletion Issue",

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
      MarketplaceNewItemScreen_missingInfoTitle: "Missing Info",
      MarketplaceNewItemScreen_missingInfoMessage: "Please enter an item name.",
      MarketplaceNewItemScreen_authErrorTitle: "Authentication Error",
      MarketplaceNewItemScreen_authErrorMessage:
        "User not identified. Please log in again.",
      MarketplaceNewItemScreen_errorTitle: "Error",
      MarketplaceNewItemScreen_userInfoRetrievalError:
        "Could not retrieve user information.",
      MarketplaceNewItemScreen_imageUploadFailedTitle: "Image Upload Failed",
      MarketplaceNewItemScreen_listingCreationFailedTitle:
        "Listing Creation Failed",
      MarketplaceNewItemScreen_listingCreatedTitle: "Listing Created!",
      MarketplaceNewItemScreen_listingCreatedSuccessMsg:
        "Your listing has been created successfully!",
      MarketplaceNewItemScreen_errorTitleRequired: "Item name is required.",
      MarketplaceNewItemScreen_errorTitleTooLong: "Item name is too long.",
      MarketplaceNewItemScreen_errorDescriptionTooLong:
        "Item description is too long.",
      MarketplaceNewItemScreen_errorDescriptionTooManySpecialChars:
        "Description contains too many special characters.",
      MarketplaceEditItemScreen_Header: "Edit an existing item",

      MarketplaceEditItemScreen_UpdateSuccess: "Listing updated successfully!",
      MarketplaceEditItemScreen_UpdateFailedTitle: "Update Failed",
      MarketplaceNewItemScreen_listingCreatedSuccessTitle:
        "Listing Created Successfully",

      MainMenuNameplate_greetingGoodMorning: "Good Morning",
      MainMenuNameplate_greetingGoodAfternoon: "Good Afternoon",
      MainMenuNameplate_greetingGoodEvening: "Good Evening",
      MainMenuNameplate_greetingGoodNight: "Good Night",
      MainMenuNameplate_greetingPunctuation: "!",

      MainMenuScreen_DoneButton: "Done",
      MainMenuScreen_saveOrderSuccess: "Menu order saved!",
      MainMenuScreen_saveOrderFailure: "Failed to save order",
      MainMenuScreen_loadingMenu: "Loading menu…",

      LoginScreen_loginSuccess: "Logged in successfully",
      LoginScreen_loginErrorTitle: "Error!",
      LoginScreen_loginErrorMessage: "Incorrect username or password!",
      LoginScreen_phoneNumberLabel: "Phone Number",
      LoginScreen_passwordLabel: "Password",
      LoginScreen_loginButton: "Login",

      MapScreen_building1Name: "Building One",
      MapScreen_building1Info:
        "This is the first building we defined – the entrance building",
      Permissions_locationPermissionMessage:
        "Location permission is needed to show position.",
      Permissions_okButton: "OK.",
      Permissions_openSettingsButton: "Open Settings.",
      Permissions_permissionDeniedTitle: "Permission denied.",
      LocationScreen_locationPermissionLabel: "Location Permission:",
      LocationScreen_insideBoundaryLabel: "Inside Boundary:",
      LocationScreen_userLocationLabel: "User Location:",
      MapScreen_backToMapButton: "Back to Map",
      MapScreen_Apartment: "Apartment no. ",

      ImagePicker_selectSourceTitle: "Select Image Source",
      ImagePicker_selectSourceMessage: "Choose how to select the image",
      ImagePicker_takePhotoButton: "Take Photo",
      ImagePicker_chooseFromLibraryButton: "Choose From Library",
      ImagePicker_cancelButton: "Cancel",
      ImagePicker_permissionDeniedTitle: "Permission Denied",
      ImagePicker_libraryPermissionDeniedMessage:
        "Permission to access photos is required!",
      ImagePicker_cameraPermissionDeniedMessage:
        "Camera permission is required!",
      ImagePicker_errorTitle: "Error",
      ImagePicker_saveCameraImageFailure: "Could not save camera image.",
      ImagePicker_saveLibraryImageFailure: "Could not save library image.",
      ImagePicker_openLibraryFailure: "Could not open image library.",
      ImagePicker_chooseFromHistoryButton: "History",

      ImageViewScreen_ErrorNoImage: "No image available",
      MarketplaceScreen_NoItems: "No items found",
      MarketplaceScreen_accordionClose: "Press to close search",
      MarketplaceScreen_accordionOpen: "Press to open search options",
      MarketplaceScreen_title: "Marketplace",

      NoticeDetailsScreen_loadingDetails: "Loading notice details...",
      NoticeDetailsScreen_categoryLabel: "Category:",
      NoticeDetailsScreen_dateLabel: "Date: ",
      NoticeDetailsScreen_messageTitle: "Message title: ",
      Common_backButton: "Go back",
      Common_BackButtonShort: "Back",
      NoticeBoardScreen_boardTitle: "Notice Board",
      NoticeBoardScreen_filterButton: "Filter",
      NoticeBoardScreen_all: "All",

      NoticeBoardScreen_filterLabel: "Filter:",
      NoticeBoardScreen_filterCategories: "categoryEngName",
      NoticeBoardScreen_sortOldest: "Oldest",
      NoticeBoardScreen_sortNewest: "Newest",
      NoticeBoardScreen_noMatchMessage: "No notices match selected filters.",
      NoticeBoardScreen_noNoticesMessage: "No notices found.",

      NoticeFilterModal_modalTitle: "Filter by categories",
      NoticeFilterModal_selectAll: "Select All",
      NoticeFilterModal_deselectAll: "Deselect All",
      NoticeFilterModal_cancelButton: "Cancel",
      NoticeFilterModal_applyFilter: "Apply Filter",
      NoticeCard_dateLabel: "Notice date: ",
      NoticeCard_categoryLabel: "Category: ",

      NewNoticeScreen_errorAllFieldsRequired:
        "Please fill in title, message, and category.",
      NewNoticeScreen_errorUserInfoMissing:
        "User information could not be found. Cannot post notice.",
      NewNoticeScreen_successTitle: "Notice Published!",
      NewNoticeScreen_successMessage:
        "Your notice has been successfully published.",
      NewNoticeScreen_broadcastWarnTitle: "Broadcast Warning",
      NewNoticeScreen_broadcastSuccessTitle: "Broadcast Sent",
      NewNoticeScreen_broadcastSuccessMessage:
        "Notification sent to {{count}} recipients.", // Note the interpolation
      NewNoticeScreen_broadcastErrorTitle: "Broadcast Error",
      NewNoticeScreen_errorSubmitFailed: "Failed to submit the notice.",
      NewNoticeScreen_title: "Publish New Notice",
      NewNoticeScreen_noticeTitleLabel: "Notice Title",
      NewNoticeScreen_noticeMessageLabel: "Notice Message",
      NewNoticeScreen_categoryLabel: "Category",
      NewNoticeScreen_publishButton: "Publish Notice",

      NoticesScreen_NewNoticeButton: "New Notice",

      ResidentsSearchScreen_title: "Resident list",
      ResidentSearchScreen_searchByLabel: "Search by:",
      ResidentSearchScreen_searchByName: "Name",
      ResidentSearchScreen_searchByHobby: "Hobby",
      ResidentSearchScreen_enterNamePlaceholder: "Enter name...",
      ResidentSearchScreen_enterHobbyPlaceholder: "Enter hobby...",
      ResidentSearchScreen_noMatchMessage: "No users match your search.",
      ResidentSearchScreen_noUsersMessage: "No users found.",
      ResidentSearchScreen_accordionClose: "Press to open search options",
      ResidentSearchScreen_accordionOpen: "Press to close search field",

      ResidentSearchScreen_selectInterestsButton: "Choose Hobbies to search",
      ResidentSearchScreen_filteringByLabel: "Filtering by...",
      ResidentSearchScreen_noInterestsSelected: "No Hobbies selected",
      ResidentList_searchingByHobbies: "Searching by Hobbies: ",
      ResidentList_searchingByName: "Searching by Name: ",

      ResidentsCommitte_nameUnavailable: "Name Unavailable",
      ResidentsCommitte_titleUnavailable: "Title Unavailable",
      ResidentsCommittePage_title: "The Committee",
      ResidentsCommittePage_contact: "Contact the Committee",
      ResidentsCommittePage_committeeNotFound: "No committee members found.",

      UserProfileCard_unnamedUser: "Unnamed User",

      Common_viewAllDataButton: "View All Data",
      Common_clearAllDataButton: "Clear All Data",
      Common_noResultsFound: "No results found",

      Common_ValidationErrorTitle: "Error",
      Common_ValidationErrorMsg: "Please fill all required fields",

      Common_UpdateButton: "Update",
      Common_DeleteButton: "Delete",
      Common_CancelButton: "Cancel",
      Common_Error: "Error",
      PaginatedList_PreviousButton: "Previous",
      PaginatedList_NextButton: "Next",

      LoginScreen_rememberMe: "Remember Me",

      MainMenuScreen_GoodMorningButton: "Good Morning Procedure",
      GoodMorning_title: "Good Morning!",
      GoodMorning_signInMe: "Sign In For Me",
      GoodMorning_signInBoth: "Sign In For Me and My Spouse",
      GoodMorning_signInSuccessTitle: "Signed In",
      GoodMorning_signInSuccessMessage:
        "Your attendance has been recorded. Have a great day!",

      Services_Title: "Services and Opening Hours",
      services_clickForDetails: "Click for details",
      Errors_Service_Fetch: "Could not fetch services.",
      Services_Click_For_Details: "Click for details",
      Services_No_Services_Available: "No services available at the moment.",
      PublicServicesFocus_Opening_Hours: "Opening Hours",
      PublicServicesFocus_Sub_Services: "Related Services",
      PublicServicesFocus_NoHours: "Opening hours not available.",
      Days_Sunday: "Sunday",
      Days_Monday: "Monday",
      Days_Tuesday: "Tuesday",
      Days_Wednesday: "Wednesday",
      Days_Thursday: "Thursday",
      Days_Friday: "Friday",
      Days_Saturday: "Saturday",

      // Events

      Activities_MyCreatedActivities: "My created activities",
      Activities_AddNew: "Suggest a new acitivity",
      Events_ClassesTitle: "Classes",
      Events_ActivitiesTitle: "Activities",
      Common_SearchPlaceholder: "Search by name...",
      Common_Cancel: "Cancel",
      Common_Register: "Register",
      Common_Attended: "Attended",
      Common_Absent: "Absent",
      Common_Success: "Success",
      Common_NotFound: "Not found.",
      Errors_Event_Fetch: "Could not fetch events.",
      Errors_Participant_Fetch: "Could not fetch participants.",
      Errors_Auth_NoUser:
        "Could not identify the current user. Please log in again.",
      EventCard_Registered: " Registered",
      EventCard_MoreDetails: "Click for more details",
      Classes_NoClasses: "No classes available at the moment.",
      Activities_NoActivities: "No activities available at the moment.",
      EventFocus_Date: "Date",
      EventFocus_Time: "Time",
      EventFocus_Location: "Location",
      EventFocus_Host: "Host",
      EventFocus_Capacity: "Capacity",
      EventFocus_MarkAttendance: "Click to Mark Attendance",
      EventFocus_MarkingNotAvailable:
        "Attendance marking can only occur on the day of the event or later.",
      EventFocus_NoParticipants: "No one has registered yet.",
      EventFocus_YouAreRegistered: "You are registered!",
      EventFocus_ActivityFull: "This activity is full.",
      EventFocus_ConfirmRegistrationTitle: "Confirm Registration",
      EventFocus_ConfirmRegistrationMsg:
        "Do you want to register for this activity?",
      EventFocus_RegistrationSuccess: "You have been registered!",
      EventCard_SpacesAvailable:
        "There are {{count}} empty spaces - registration inside!",
      EventFocus_SpacesAvailable:
        "There are {{count}} empty spaces - registration below!",

      EventFocus_ThanksForMarking: "Thank you for marking attendance.",
      EventFocus_WantToChange: "Would you like to make a change?",
      EventFocus_ReEditButton: "Re-edit Participation",
      Common_Edit: "Edit",
      EventFocus_FinalizeDisclaimer: "Click once you've marked all attendants",
      EventFocus_FinalizeButton: "Finalize Marking",

      // New Activity

      NewActivity_Title: "Create a New Activity",
      NewActivity_Name: "Activity Name",
      NewActivity_Name_Error_Required: "Activity name is required.",
      NewActivity_Name_Error_TooLong: "Name cannot exceed 100 characters.",
      NewActivity_Description: "Description",
      NewActivity_Description_Error_TooLong:
        "Description cannot exceed 500 characters.",
      NewActivity_Location: "Location",
      NewActivity_Capacity: "Capacity (Number of participants)",
      NewActivity_Capacity_Error_Required: "Capacity is required.",
      NewActivity_Capacity_Error_Invalid: "Please enter a valid number.",
      NewActivity_Image: "Activity Image",
      NewActivity_Image_Optional: "Optional",
      NewActivity_Image_TapToChoose: "Tap to choose",
      NewActivity_SelectDate: "Select Date",
      NewActivity_SelectStartTime: "Start Time",
      NewActivity_SelectEndTime: "End Time",
      NewActivity_CreateButton: "Create Activity",
      NewActivity_CancelButton: "Cancel",
      NewActivity_SuccessTitle: "Activity Created!",
      NewActivity_SuccessMessage:
        "Your new activity has been successfully created.",
      NewActivity_CancelPromptTitle: "Discard Changes?",
      NewActivity_CancelPromptMessage:
        "Are you sure you want to discard this new activity?",
      NewActivity_ConfirmDiscard: "Yes, Discard",
      NewActivity_KeepEditing: "Keep Editing",
      NewActivity_Capacity_Optional:
        "Capacity (optional, leave blank for unlimited)",
      NewActivity_GenAI_Button: "Create AI Image for activity",

      EventFocus_Unlimited: "Unlimited",

      // Timetable

      Timetable_Title: "Timetable",
      Timetable_SubTitle: "Timetable shows planned activities and classes",
      Timetable_NoActivities: "No activities planned for today.",
      Today: "Today",
      Timetable_daily: "Daily",
      Timetable_weekly: "Weekly",
      Timetable_monthly: "Monthly",
      minutes: "minutes",
      Time: "Time",
      Location: "Location",
      Type: "Type",
    },
  },
  he: {
    // Hebrew translations
    translation: {
      SettingsLayoutTabs_FontSettings: "הגדרות גופן",
      SettingsLayoutTabs_notificationSettings: "הגדרות התראות",
      SettingsLayoutTabs_languageSettings: "הגדרות משתמש",
      SettingsLayoutTabs_SaveChanges: "שמור שינויים",

      FontSettingsPage_header: "גודל טקסט:",
      FontSettingsPage_exampleHeader: "טקסט לדוגמה:",
      FontSettingsPage_example:
        'הקוסם מארץ עוץ: דורותי והכלב הקטן שלה טוטו גרו בכפר קטן באמריקה,\nדורותי אהבה מאוד את טוטו, והם היו משחקים אחד עם השניה כל הזמן. יום אחד היה סופת טורנדו נוראית. "אנחנו חייבים להגיע למרתף, טוטו!" קראה דורותי. אבל זה היה מאוחר מדי. הרוח החזקה והסוערת הרימה את בית החווה לאוויר ולקחה את דורותי וטוטו לארץ עוץ הנידחת.',

      NotificationSettingsPage_header: "הגדרות התראות:",
      NotificationSettingsPage_normal: "רגיל",
      NotificationSettingsPage_silent: "מושתק",

      LanguageSettingsPage_header: "הגדרות שפה:",
      LanguageSettingsPage_LogoutHeader: "הגדרות חשבון:",
      LanguageSettingsPage_Logout: "התנתקות",
      LanguageSettingsPage_LogoutToast: "התנתקת בהצלחה!",
      LanguageSettingsPage_he: "עברית",
      LanguageSettingsPage_en: "אנגלית",

      ProfileScreen_header: "פרופיל",
      ProfileScreen_partner: "בן/בת זוג",
      ProfileScreen_apartmentNumber: "מספר דירה",
      ProfileScreen_mobilePhone: "טלפון נייד",
      ProfileScreen_email: "דואר אלקטרוני",
      ProfileScreen_arrivalYear: "תאריך הגעה לנורדיה",
      ProfileScreen_origin: "מקום מוצא",
      ProfileScreen_profession: "מקצוע",
      ProfileScreen_interests: "תחביבים",
      ProfileScreen_aboutMe: "קצת על עצמי",
      ProfileScreen_extraImages: "תמונות נוספות",
      ProfileScreen_editButton: "עריכת פרופיל",
      ProfileScreen_emptyDataField: "אין מידע",
      ProfileScreen_privateProfile: "פרופיל זה פרטי",
      ProfileScreen_profileImage: "תמונת פרופיל",

      Common_Loading: "טוען...",

      interestModal_newlyAdded: "תחביבים חדשים",

      PrivacySettings_savedLocally: "הגדרות פרטיות נשמרו במכשיר",
      PrivacySettings_title: "הגדרות פרטיות",
      PrivacySettings_SubTitle: "בחר אילו פרטים לשתף עם אחרים",

      EditProfileScreen_saveButton: "שמור שינויים",
      EditProfileScreen_cancelButton: "ביטול",
      Validation_FieldIsRequired: "שדה זה הוא חובה",
      EditProfileScreen_errorMessagePartner:
        "שדה 'בן/בת זוג' חייב להכיל רק אותיות בעברית ובאנגלית",
      EditProfileScreen_errorMessageApartmentNumber:
        "מספר הדירה חייב להיות מספרי",
      EditProfileScreen_errorMessageMobilePhone:
        "הכנס מספר טלפון נייד ישראלי תקין",
      EditProfileScreen_errorMessageEmail: "הכנס כתובת דואר אלקטרוני תקינה",
      EditProfileScreen_errorMessageArrivalYear:
        "שנת הגעה חייבת להיות בת 4 ספרות",
      EditProfileScreen_errorMessageOrigin:
        "שדה 'מקום מוצא' חייב להכיל רק אותיות בעברית ובאנגלית או מספרים",
      EditProfileScreen_errorMessageProfession:
        "שדה 'מקצוע' חייב להכיל רק אותיות בעברית ובאנגלית או מספרים",
      EditProfileScreen_errorMessageInterests:
        "שדה 'תחביבים' חייב להכיל רק אותיות בעברית ובאנגלית או מספרים",
      EditProfileScreen_errorMessageAboutMe:
        "שדה 'קצת על עצמי' חייב להכיל רק אותיות בעברית ובאנגלית או מספרים",
      EditProfileScreen_ProfileUpdated: "פרופיל עודכן בהצלחה!",
      EditProfileScreen_ProfileUpdateCancelled: "עדכון פרופיל בוטל",
      //EditProfileScreen_errorMessageExtraImages: "אנא מלא את שדה 'תמונות נוספות'",
      //EditProfileScreen_errorMessageImage: "אנא מלא את שדה 'תמונה'",

      EditProfileScreen_noInterests: "אין תחביבים להציג",
      EditProfileScreen_editInterestsButton: "לבחירת תחביבים",

      ApartmentSelector_Exists: "דירה זו כבר קיימת במערכת",
      ApartmentSelector_Potential:
        "זוהי דירה חוקית, היא תתווסף למערכת במהלך השמירה",
      ApartmentSelector_Invalid: "מספר דירה זה אינו בטווח החוקי",

      interestModal_title: "עריכת תחביבים",
      interestModal_searchPlaceholder: "חיפוש תחביב...",
      interestModal_selectExisting: "בחירה מתחביבים קיימים",
      interestModal_noResults: "לא נמצא תחביב",
      interestModal_addNew: "או שניתן להוסיף חדשים!",
      interestModal_addPlaceholder: " הכניסו תחביב חדש ( עברית )",
      interestModal_addButton: "הוספה",
      interestModal_acceptButton: "אישור",
      interestModa_newlyAdded: "תחביבים חדשים",

      interestModal_yourSelections: "הבחירות שלך",
      interestModal_existsTitle: "תחביב קיים",
      interestModal_existsMsg: "תחביב זה כבר קיים ברשימה והוא נבחר עבורך.",
      interestModal_similarTitle: "נמצא תחביב דומה",
      interestModal_similarMsg:
        "ערך זה דומה מאוד ל-'{{existingName}}'. האם להוסיף את '{{newName}}' בכל זאת?",
      interestModal_addAnyway: "הוסף בכל זאת",
      interestModal_didYouMean: ":האם התכוונת ל",
      interestModal_deselectDisclaimer: "לחיצה על תחביב מסומן תבטל את בחירתו",
      interestModal_suggestionAcceptedTitle: "ההצעה התקבלה",
      interestModal_suggestionAcceptedMsg: "התחביב נוסף לבחירות שלך",

      MainMenuScreen_ProfileButton: "פרופיל",
      MainMenuScreen_ActivitiesAndClassesButton: "חוגים ופעילויות",
      MainMenuScreen_MarketplaceButton: "שוק",
      MainMenuScreen_ResidentsCommitteeButton: "וועד דיירים",
      MainMenuScreen_ActivityHoursButton: "שעות פעילות",
      MainMenuScreen_MapButton: "מפה",
      MainMenuScreen_NoticeBoardButton: "לוח מודעות",
      MainMenuScreen_ResidentListButton: "רשימת הדיירים",
      MainMenuScreen_Timetable: "מידעון",

      InstructorMainMenu_EventsButton: "אירועים",

      Events_Title: "אירועים",
      Events_NoEvents: "אין לך אירועים לנהל כרגע.",
      Events_Loading: "טוען את האירועים שלך...",
      Events_Selct: "בחר אירוע",
      Events_Choose: "-- בחר אירוע --",
      Events_ChooseDate: "-- בחר תאריך --",
      Events_SelectMeeting: "בחר מפגש",
      Events_NoMeetings: "אין מפגשים קרובים",
      Events_MissingInformation: "חסר מידע",
      Events_MissingInformationMessage: "אנא בחר מפגש וספק סיבה.",
      Events_InvalidDate: "תאריך לא תקין",
      Events_InvalidDateMessage: "לא ניתן לשנות מפגש לזמן שכבר עבר.",
      Events_MoveMeeting: "העבר מפגש לזמן אחר",
      Events_NewMeeting: "תאריך ושעה חדשים למפגש",
      Events_Reason_for_Move: "סיבה להעברה",
      Events_Reason_for_Cancellation: "סיבה לביטול",
      Events_Confirm_Cancellation: "אשר ביטול",
      Events_Confirm_Move: "אשר העברה",
      Events_DescriptionPlaceholder: "לדוגמה, מקרה חירום אישי וכו'.",

      SettingsPopup_SettingsButton: "הגדרות",
      SettingsPopup_HomeButton: "בית",
      SettingsPopup_ProfileButton: "פרופיל",
      SettingsPopup_ChangeLayoutButton: "שנה סדר תפריט",

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
      MarketplaceScreen_accordionClose: "לחיצה לסגירת החיפוש",
      MarketplaceScreen_accordionOpen: "לחיצה לחיפוש פריטים",
      MarketplaceScreen_title: "שוק",

      MarketplaceItemScreen_Seller: "מוכר:",
      MarketplaceItemScreen_Description: "תיאור:",
      MarketplaceItemScreen_ContactDetails: "פרטי יצירת קשר",
      MarketplaceItemScreen_CallButton: "התקשר",
      MarketplaceItemScreen_MessageButton: "שלח הודעה בוואטסאפ",
      MarketplaceItemScreen_EmailButton: "שלח מייל",
      MarketplaceItemScreen_PublishedDate: "פורסם בתאריך:",
      MarketplaceItemScreen_ExtraImage: "תמונה נוספת",
      MarketplaceItemScreen_DescriptionTitle: "תיאור",
      MarketplaceItemScreen_SellerTitle: "מוכר",
      MarketplaceItemScreen_ContactEmail: "דוא״ל",
      MarketplaceItemScreen_ContactPhone: "טלפון",
      MarketplaceItemScreen_ContactWhatsApp: "וואטסאפ",
      MarketplaceItemScreen_Loading: "טוען פריט...",
      MarketplaceItemScreen_EditButton: "ערוך מודעה",
      MarketplaceItemScreen_DeleteButton: "מחק מודעה",
      MarketplaceItemScreen_DeleteConfirmTitle: "אישור מחיקה",
      MarketplaceItemScreen_DeleteConfirmMsg:
        "האם אתה בטוח שברצונך למחוק מודעה זו? לא ניתן לשחזר פעולה זו.",
      MarketplaceItemScreen_DeleteSuccessMsg: "המודעה נמחקה בהצלחה!",
      MarketplaceItemScreen_DeleteErrorMsg: "מחיקת המודעה נכשלה.",
      MarketplaceItemScreen_PicDeleteErrorTitle: "בעיה במחיקת תמונה",

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
      MarketplaceNewItemScreen_missingInfoTitle: "מידע חסר",
      MarketplaceNewItemScreen_missingInfoMessage: "אנא הזן שם פריט.",
      MarketplaceNewItemScreen_authErrorTitle: "שגיאת אימות",
      MarketplaceNewItemScreen_authErrorMessage:
        "המשתמש לא זוהה. אנא התחבר מחדש.",
      MarketplaceNewItemScreen_errorTitle: "שגיאה",
      MarketplaceNewItemScreen_userInfoRetrievalError:
        "לא ניתן לאחזר פרטי משתמש.",
      MarketplaceNewItemScreen_imageUploadFailedTitle: "העלאת התמונה נכשלה",
      MarketplaceNewItemScreen_listingCreationFailedTitle: "יצירת ההצעה נכשלה",
      MarketplaceNewItemScreen_listingCreatedTitle: "ההצעה נוצרה!",
      MarketplaceEditItemScreen_Header: "עריכת פריט קיים",
      MarketplaceEditItemScreen_UpdateSuccess: "ההצעה עודכנה בהצלחה!",
      MarketplaceEditItemScreen_UpdateFailedTitle: "העדכון נכשל", // אם תוסיף חזרה את הודעת השגיאה
      MarketplaceNewItemScreen_listingCreatedSuccessTitle: "ההצעה נוצרה בהצלחה",

      MarketplaceNewItemScreen_listingCreatedSuccessMsg:
        "ההצעה שלך נוצרה בהצלחה!",
      MarketplaceNewItemScreen_errorTitleRequired: "חובה להזין שם הפריט.",
      MarketplaceNewItemScreen_errorTitleTooLong: "שם הפריט ארוך מדי.",
      MarketplaceNewItemScreen_errorDescriptionTooLong: "תיאור הפריט ארוך מדי.",
      MarketplaceNewItemScreen_errorDescriptionTooManySpecialChars:
        "התיאור מכיל יותר מדי תווים מיוחדים.",

      MainMenuNameplate_greetingGoodMorning: "בוקר טוב",
      MainMenuNameplate_greetingGoodAfternoon: "אחר הצהריים טובים",
      MainMenuNameplate_greetingGoodEvening: "ערב טוב",
      MainMenuNameplate_greetingGoodNight: "לילה טוב",
      MainMenuNameplate_greetingPunctuation: "!",

      MainMenuScreen_DoneButton: "סיימתי",
      MainMenuScreen_saveOrderSuccess: "סדר התפריט נשמר!",
      MainMenuScreen_saveOrderFailure: "שמירת הסדר נכשלה",
      MainMenuScreen_loadingMenu: "טוען תפריט…",

      LoginScreen_loginSuccess: "התחברת בהצלחה",
      LoginScreen_loginErrorTitle: "שגיאה!",
      LoginScreen_loginErrorMessage: "שם משתמש או סיסמה שגויים!",
      LoginScreen_phoneNumberLabel: "מספר טלפון",
      LoginScreen_passwordLabel: "סיסמה",
      LoginScreen_loginButton: "כניסה",

      MapScreen_Apartment: "דירה מספר ",
      MapScreen_building1Name: "בניין מספר אחת",
      MapScreen_building1Info: "זהו הבניין הראשון שהגדרנו - בניין הכניסה",
      Permissions_locationPermissionMessage: "נדרשת הרשאת מיקום להצגת המיקום.",
      Permissions_okButton: "אישור.",
      Permissions_openSettingsButton: "פתח הגדרות.",
      Permissions_permissionDeniedTitle: "ההרשאה נדחתה.",
      LocationScreen_locationPermissionLabel: "הרשאת מיקום:",
      LocationScreen_insideBoundaryLabel: "בתוך הגבול:",
      LocationScreen_userLocationLabel: "מיקום משתמש:",
      MapScreen_backToMapButton: "חזרה למפה",

      ImagePicker_selectSourceTitle: "בחר מקור תמונה",
      ImagePicker_selectSourceMessage: "בחר כיצד לבחור את התמונה",
      ImagePicker_takePhotoButton: "צלם תמונה",
      ImagePicker_chooseFromLibraryButton: "בחר מהספרייה",
      ImagePicker_cancelButton: "ביטול",
      ImagePicker_permissionDeniedTitle: "ההרשאה נדחתה",
      ImagePicker_libraryPermissionDeniedMessage: "נדרשת הרשאה לגישה לתמונות!",
      ImagePicker_cameraPermissionDeniedMessage: "נדרשת הרשאת מצלמה!",
      ImagePicker_errorTitle: "שגיאה",
      ImagePicker_saveCameraImageFailure: "לא ניתן לשמור את תמונת המצלמה.",
      ImagePicker_saveLibraryImageFailure: "לא ניתן לשמור את תמונת הספרייה.",
      ImagePicker_openLibraryFailure: "לא ניתן לפתוח את ספריית התמונות.",
      ImageViewScreen_ErrorNoImage: "אין תמונה זמינה",
      ImagePicker_chooseFromHistoryButton: "היסטוריה",

      MarketplaceScreen_NoItems: "לא נמצאו פריטים",

      NoticeDetailsScreen_loadingDetails: "טוען פרטי הודעה...",
      NoticeDetailsScreen_categoryLabel: "קטגוריה:",
      NoticeDetailsScreen_dateLabel: "תאריך:",
      NoticeDetailsScreen_messageTitle: "כותרת ההודעה: ",
      Common_backButton: "חזרה לאחור",
      NoticeBoardScreen_boardTitle: "לוח המודעות",
      NoticeBoardScreen_filterButton: "סינון",
      NoticeBoardScreen_all: "הכל",
      NoticeBoardScreen_filterLabel: "סינון:",
      NoticeBoardScreen_filterCategories: "categoryHebName",
      NoticeBoardScreen_sortOldest: "הישן ביותר",
      NoticeBoardScreen_sortNewest: "החדש ביותר",
      NoticeBoardScreen_noMatchMessage: "אין הודעות שתואמות את המסננים שנבחרו.",
      NoticeBoardScreen_noNoticesMessage: "לא נמצאו הודעות.",

      NoticeCard_dateLabel: "תאריך המודעה: ",
      NoticeCard_categoryLabel: "קטגוריה: ",

      NoticeFilterModal_modalTitle: "סנן לפי קטגוריות",
      NoticeFilterModal_selectAll: "בחר הכל",
      NoticeFilterModal_deselectAll: "בטל את כל הבחירות",
      NoticeFilterModal_cancelButton: "ביטול",
      NoticeFilterModal_applyFilter: "בצע סינון",

      NewNoticeScreen_errorAllFieldsRequired: "אנא מלא כותרת, הודעה וקטגוריה.",
      NewNoticeScreen_errorUserInfoMissing:
        "לא ניתן למצוא פרטי משתמש. לא ניתן לפרסם הודעה.",
      NewNoticeScreen_successTitle: "הודעה פורסמה!",
      NewNoticeScreen_successMessage: "ההודעה שלך פורסמה בהצלחה.",
      NewNoticeScreen_broadcastWarnTitle: "אזהרת שידור",
      NewNoticeScreen_broadcastSuccessTitle: "שידור נשלח",
      NewNoticeScreen_broadcastSuccessMessage:
        "התראה נשלחה ל-{{count}} נמענים.",
      NewNoticeScreen_broadcastErrorTitle: "שגיאת שידור",
      NewNoticeScreen_errorSubmitFailed: "שליחת ההודעה נכשלה.",
      NewNoticeScreen_title: "פרסם הודעה חדשה",
      NewNoticeScreen_noticeTitleLabel: "כותרת ההודעה",
      NewNoticeScreen_noticeMessageLabel: "תוכן ההודעה",
      NewNoticeScreen_categoryLabel: "קטגוריה",
      NewNoticeScreen_publishButton: "פרסם הודעה",

      NoticesScreen_NewNoticeButton: "הודעה חדשה",

      ResidentsSearchScreen_title: "רשימת הדיירים",
      ResidentSearchScreen_searchByLabel: "חפש לפי:",
      ResidentSearchScreen_searchByName: "שם",
      ResidentSearchScreen_searchByHobby: "תחביב",
      ResidentSearchScreen_enterNamePlaceholder: "רשום שם...",
      ResidentSearchScreen_enterHobbyPlaceholder: "רשום תחביב...",
      ResidentSearchScreen_noMatchMessage: "אין משתמשים התואמים לחיפוש שלך.",
      ResidentSearchScreen_noUsersMessage: "לא נמצאו משתמשים.",
      ResidentSearchScreen_accordionClose: "לחיצה לחיפוש",
      ResidentSearchScreen_accordionOpen: "לחיצה לסגירת החיפוש",

      ResidentSearchScreen_selectInterestsButton: "הזינו תחביבים לחיפוש",
      ResidentSearchScreen_filteringByLabel: "מסנן לפי...",
      ResidentSearchScreen_noInterestsSelected: "לא נבחרו תחביבים",

      ResidentList_searchingByHobbies: "חיפוש לפי תחביבים: ",
      ResidentList_searchingByName: "חיפוש לפי שם: ",

      ResidentsCommitte_nameUnavailable: "שם לא זמין",
      ResidentsCommitte_titleUnavailable: "תואר לא זמין",
      ResidentsCommittePage_title: "וועד דיירים",
      ResidentsCommittePage_contact: "צור קשר עם הוועד",
      ResidentsCommittePage_committeeNotFound: "לא נמצאו חברי ועד.",

      UserProfileCard_unnamedUser: "משתמש ללא שם",

      Common_viewAllDataButton: "הצג את כל הנתונים",
      Common_clearAllDataButton: "נקה את כל הנתונים",
      Common_BackButtonShort: "חזרה",
      Common_UpdateButton: "עדכן",
      Common_DeleteButton: "מחק",
      Common_CancelButton: "ביטול",
      Common_Error: "שגיאה",
      Common_noResultsFound: "לא נמצאו תוצאות",

      Common_ValidationErrorTitle: "שגיאה",
      Common_ValidationErrorMsg: "אנא מלאו את כל השדות הדרושים",

      PaginatedList_PreviousButton: "הקודם",
      PaginatedList_NextButton: "הבא",

      LoginScreen_rememberMe: "זכור אותי",

      MainMenuScreen_GoodMorningButton: "נוהל בוקר טוב",
      GoodMorning_title: "בוקר טוב!",
      GoodMorning_signInMe: "דיווח נוכחות עבורי",
      GoodMorning_signInBoth: "דיווח נוכחות עבורי ועבור בן/בת הזוג",
      GoodMorning_signInSuccessTitle: "דיווח בוצע",
      GoodMorning_signInSuccessMessage: "הנוכחות שלך נרשמה. שיהיה לך יום נהדר!",

      Services_Title: "שירותים ושעות פתיחה",
      services_clickForDetails: "יש ללחוץ לפרטים",
      Errors_Service_Fetch: "לא ניתן היה לטעון את השירותים.",
      Services_Click_For_Details: "יש ללחוץ לפרטים",
      Services_No_Services_Available: "אין שירותים זמינים כרגע.",
      PublicServicesFocus_Opening_Hours: "שעות פתיחה",
      PublicServicesFocus_Sub_Services: "שירותים קשורים",
      PublicServicesFocus_NoHours: "שעות הפתיחה אינן זמינות.",
      Days_Sunday: "יום ראשון",
      Days_Monday: "יום שני",
      Days_Tuesday: "יום שלישי",
      Days_Wednesday: "יום רביעי",
      Days_Thursday: "יום חמישי",
      Days_Friday: "יום שישי",
      Days_Saturday: "יום שבת",

      // Events

      Activities_MyCreatedActivities: "פעילויות שיצרתי",
      Activities_AddNew: "להצעת פעילות חדשה",
      Events_ClassesTitle: "חוגים",
      Events_ActivitiesTitle: "פעילויות",
      Common_SearchPlaceholder: "חיפוש לפי שם...",
      Common_Cancel: "ביטול",
      Common_Register: "הירשם",
      Common_Attended: "נכח/ה",
      Common_Absent: "נעדר/ה",
      Common_Success: "הצלחה",
      Common_NotFound: "לא נמצא.",
      Errors_Event_Fetch: "לא ניתן היה לטעון את האירועים.",
      Errors_Participant_Fetch: "לא ניתן היה לטעון את המשתתפים.",
      Errors_Auth_NoUser: "לא ניתן היה לזהות את המשתמש. יש להתחבר מחדש.",
      EventCard_Registered: " רשומים",
      EventCard_MoreDetails: "לחץ לפרטים נוספים",
      Classes_NoClasses: "אין חוגים זמינים כרגע.",
      Activities_NoActivities: "אין פעילויות זמינות כרגע.",
      EventFocus_Date: "תאריך",
      EventFocus_Time: "שעה",
      EventFocus_Location: "מיקום",
      EventFocus_Host: "יזם/ית",
      EventFocus_Capacity: "קיבולת",
      EventFocus_MarkAttendance: "לחץ לסימון נוכחות",
      EventFocus_MarkingNotAvailable:
        "סימון נוכחות אפשרי רק ביום האירוע או לאחריו.",
      EventFocus_NoParticipants: "אף אחד עדיין לא נרשם.",
      EventFocus_YouAreRegistered: "נרשמת לפעילות!",
      EventFocus_ActivityFull: "הפעילות מלאה.",
      EventFocus_ConfirmRegistrationTitle: "אישור הרשמה",
      EventFocus_ConfirmRegistrationMsg: "האם ברצונך להירשם לפעילות זו?",
      EventFocus_RegistrationSuccess: "נרשמת בהצלחה!",
      EventCard_SpacesAvailable:
        "נותרו {{count}} מקומות פנויים - ההרשמה בפנים!",
      EventFocus_SpacesAvailable:
        "נותרו {{count}} מקומות פנויים - להרשמה למטה!",

      EventFocus_ThanksForMarking: "תודה שסימנת נוכחות.",
      EventFocus_WantToChange: "האם ברצונך לבצע שינוי?",
      EventFocus_ReEditButton: "עריכה מחדש",
      Common_Edit: "עריכה",
      EventFocus_FinalizeDisclaimer: "יש ללחוץ לאחר סימון כל הנוכחים.",
      EventFocus_FinalizeButton: "סיום סימון",

      // New Activity

      NewActivity_Title: "יצירת פעילות חדשה",
      NewActivity_Name: "שם הפעילות",
      NewActivity_Name_Error_Required: "שם הפעילות הוא שדה חובה.",
      NewActivity_Name_Error_TooLong: "השם לא יכול לעלות על 100 תווים.",
      NewActivity_Description: "תיאור",
      NewActivity_Description_Error_TooLong:
        "התיאור לא יכול לעלות על 500 תווים.",
      NewActivity_Location: "מיקום",
      NewActivity_Capacity: "כמות משתתפים",
      NewActivity_Capacity_Error_Required: "כמות המשתתפים היא שדה חובה.",
      NewActivity_Capacity_Error_Invalid: "יש להזין מספר תקין.",
      NewActivity_Image: "תמונת הפעילות",
      NewActivity_Image_Optional: "אופציונלי",
      NewActivity_Image_TapToChoose: "לחץ לבחירה",
      NewActivity_SelectDate: "בחר תאריך",
      NewActivity_SelectStartTime: "שעת התחלה",
      NewActivity_SelectEndTime: "שעת סיום",
      NewActivity_CreateButton: "צור פעילות",
      NewActivity_CancelButton: "ביטול",
      NewActivity_SuccessTitle: "הפעילות נוצרה!",
      NewActivity_SuccessMessage: "הפעילות החדשה שלך נוצרה בהצלחה.",
      NewActivity_CancelPromptTitle: "לבטל שינויים?",
      NewActivity_CancelPromptMessage: "האם ברצונך לבטל את יצירת הפעילות?",
      NewActivity_ConfirmDiscard: "כן, בטל",
      NewActivity_KeepEditing: "המשך לערוך",
      NewActivity_Capacity_Optional:
        "כמות משתתפים (אופציונלי, השאר ריק ללא הגבלה)",
      NewActivity_GenAI_Button: "יצירת תמונת AI לפעילות",

      EventFocus_Unlimited: "ללא הגבלה",

      // Timetable

      Timetable_Title: "תוכניה",
      Timetable_SubTitle: "תוכניה זו מציגה את הפעילויות והחוגים המתוכננים",
      Timetable_NoActivities: "אין פעילות מתוכננת להיום",
      Today: "היום",
      Timetable_daily: "יומי",
      Timetable_weekly: "שבועי",
      Timetable_monthly: "חודשי",
      minutes: "דקות",
      Time: "שעה",
      Location: "מיקום",
      Type: "סוג",
    },
  },
};

i18next.use(initReactI18next).init({
  resources,
  lng: "en", // Set a default language synchronously
  fallbackLng: "en", // Fallback to English if translation is missing
  debug: true,
  interpolation: {
    escapeValue: false, // React already does escaping
  },
  react: {
    useSuspense: false, // Important for controlling splash screen
  },
});

export default i18next;
