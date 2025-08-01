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
      LanguageSettingsPage_LogoutHeader: "Account Settings",
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

      No_Image_Available: "No Image Available",
      Add_Image: "Add Image",
      Remove_Image: "Remove",
      Return_Image: "Return",
      Your_Profile_Pictures: "Your Profile Pictures",
      Your_Extra_Pictures: "Your Extra Pictures",
      Manage_Pictures_Subtitle: "You can manage up to {{maxSlots}} pictures.",
      Add_a_New_Photo: "Add a New Photo",
      Choose_a_source_for_your_new_picture:
        "Choose a source for your new picture.",
      Camera: "Camera",
      Gallery: "Gallery",
      Cancel: "Cancel",
      Delete: "Delete",
      Confirm: "Confirm",
      Confirm_Deletion: "Confirm Deletion",
      Confirm_Deletion_Message:
        "Are you sure you want to permanently delete this picture?",
      Picture_Deleted: "Picture Deleted",
      Deletion_Failed: "Deletion Failed",
      PictureIsInUse: "The picture is currently in use",
      Permission_denied: "Permission denied",
      Camera_access_is_required: "Camera access is required.",
      Gallery_access_is_required: "Gallery access is required.",
      Upload_Successful: "Upload Successful!",
      Upload_Failed: "Upload Failed",

      Activities: "Activities",
      Classes: "Classes",

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

      ApartmentSelector_Exists: "This apartment number is legal.",
      ApartmentSelector_Potential:
        "This is a valid apartment. It will be added to our system upon saving.",
      ApartmentSelector_Invalid:
        "This apartment number is not within the valid range.",

      interestModal_title: "Edit Hobbies",
      interestModal_searchPlaceholder: "Search for Hobbies...",
      interestModal_selectExisting: "Select from existing",
      interestModal_noResults: "No Hobbies found.",
      interestModal_addNew: "Or add a new one",
      interestModal_addPlaceholder: "Type a new Hobby ( Hebrew )",
      interestModal_addButton: "Add",
      interestModal_acceptButton: "Accept",

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
      MainMenuScreen_InfoSheetButton: "Info Sheet",
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
      Events_ClassesTab: "Classes",
      Events_ActivitiesTab: "Activities",

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
      MarketplaceItemScreen_CannotHandleContactTitle:
        "Cannot Handle Contact Information",
      MarketplaceItemScreen_CannotHandleContactMsg:
        "Cannot handle contact information for this item.",

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
      MarketplaceNewItemScreen_ExpiryNotice:
        "Note: Your listing will be automatically deleted after two weeks.",

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

      MapScreen_Loading: "Loading Map...",
      MapScreen_ApartmentPlural: "Apartments",
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
      MapScreen_HaAlon: "HaAlon",
      MapScreen_HaHadas: "HaHadas",
      MapScreen_HaGeffen: "HaGeffen",
      MapScreen_HaTamar: "HaTamar",
      MapScreen_HaYasmin: "HaYasmin",
      MapScreen_HaRakefet: "HaRakefet",
      MapScreen_HaHadarim: "HaHadarim",
      MapScreen_HaNarkis: "HaNarkis",
      MapScreen_DataLoadingError: "Data Loading Error",
      MapScreen_NoApartmentsListed: "No apartments found for this building.",
      MapScreen_NoResidentsListed: "No residents listed",

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
      NoticeDetailsScreen_senderLabel: "Posted by: ",
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
      NoticeFilterModal_modalSubtitle:
        "Here you can choose which types of messages to see on this screen. Note: This will only hide messages here. To choose which topics you get notifications for, please go to your user settings and find the 'Manage Categories' button.",
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
      ResidentList_ExplainationHeader: "How to Find a Resident",
      ResidentList_Explaination:
        "You can search in two ways, together or on their own: \n\n<bold>By Name:</bold> Simply begin typing a person's name in the search box. The list will update automatically as you type.\n\n<bold>By Hobby:</bold> Choose one or more interests from the list and then press the 'Search' button.",

      ResidentsCommitte_nameUnavailable: "Name Unavailable",
      ResidentsCommitte_titleUnavailable: "Title Unavailable",
      ResidentsCommittePage_title: "The Committee",
      ResidentsCommittePage_contact: "Contact the Committee",
      ResidentsCommittePage_committeeNotFound: "No committee members found.",
      ResidentsCommittePage_introText:
        "Here you can find the details of the dedicated members of the residents' committee. Feel free to reach out to them with any questions or suggestions.",

      ResidentsCommittePage_fetchError: "Failed to load committee members.",

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

      OurServices: "Our Services",

      MainMenuScreen_GoodMorningButton: "Good Morning Procedure",
      GoodMorning_title: "Good Morning!",
      GoodMorning_signInMe: "Sign In For Me",
      GoodMorning_signInBoth: "Sign In For Me and My Spouse",
      GoodMorning_signInSuccessTitle: "Signed In",
      GoodMorning_signInSuccessMessage:
        "Your attendance has been recorded. Have a great day!",
      GoodMorning_IdError:
        "An error has occurred, try again or verify with administration",

      services_overrides_title: "Schedule Changes",
      services_overrides_intro:
        "Please note! Schedule changes are planned for the following services this week:",
      services_overrides_footer:
        "For more details, please check the notices or the service page.",
      service_override_unavailable_date:
        "On {{date}}, the service will be unavailable.",
      service_override_unavailable_datetime:
        "On {{date}} from {{startTime}} to {{endTime}}, the service will be unavailable.",
      service_override_available_date:
        "On {{date}}, the service will operate at different hours.",
      service_override_available_datetime:
        "On {{date}}, the service will be open from {{startTime}} to {{endTime}}.",
      service_override_notes: "Reason: {{notes}}",

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
      Activities_SortByClosest: "Sort by Closest",
      Activities_SortByNewest: "Sort by Newest",
      Activities_NoActivitiesFound: "No activities found.",

      MyActivities_ParticipationChecked: "Events with checked participation",
      MyActivities_ParticipationNotChecked:
        "Events with unchecked participation",
      MyActivities_ClearFilter: "Clear button choice",
      MyActivities_NoParticipation: "Events with no participants",

      Events_ClassesTitle: "Classes",
      Events_ActivitiesTitle: "Activities",
      Events_MeetingRescheduled: "Meeting Rescheduled",
      Events_MeetingCancelled: "Meeting Cancelled",
      Events_ParticipantsHaveBeenNotified: "Participants have been notified.",
      Update_Failed: "Update Failed",
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
      EventCard_Registered: "{{count}} / {{capacity}} Registered",
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
      EventFocus_AttendanceMarkedSuccess: "Attendance marked. Thank you.",

      EventFocus_RecurrenceDay: "Day(s)",

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
      Timetable_SubTitle:
        "This timetable shows all planned classes and activities. To make things clear, cancelled events are marked in red, rescheduled events are in yellow, and events happening as planned are in blue. In the Daily View, you can scroll down to see the full schedule for today. In the Weekly and Monthly views, simply tap on any day to see its planned activities.",
      Timetable_NoActivities: "No activities planned for today.",
      Today: "Today",
      Timetable_daily: "Daily",
      Timetable_weekly: "Weekly",
      Timetable_monthly: "Monthly",
      minutes: "minutes",
      Time: "Time",
      Location: "Location",
      Type: "Type",
      TimeTable_Time: "Time",
      Timetable_Cancelled: "Cancelled",
      Timetable_Rescheduled: "Rescheduled",
      hour: "hour",
      hours: "hours",
      TimeTable_Location: "Location",
      TimeTable_Status: "Status",
      TimeTable_Notes: "Notes",

      // Navigation

      Navigation_Error: "Navigation Error",
      Navigation_MustBeInside: "You must be inside the area to navigate.",
      Navigation_NoRoute: "Could not calculate a route to the destination.",
      Navigation_Cancel: "Cancel Navigation",
      Map_LegendButton: "Legend",
      Map_NavButton: "Navigation",
      Navigation_ArrivedTitle: "You Have Arrived",
      Navigation_ArrivedMessage: "You have arrived at {{destination}}.",
      Common_OK: "OK",
      Common_Apartment: "Apartment",
      Common_Meters: "meters",
      Navigation_Title: "Navigate To",
      Navigation_SearchPlaceholder: "Search for an apartment or building...",
      Navigation_DistanceTo: "Distance to {{destination}}:",
      MapScreen_Legend: "Legend",
      MapScreen_Navigation: "Navigation",
      Common_Apartpment: "Apartment ",
      Navigation_Cancelled: "Navigation cancelled",

      // Buildings

      MapScreen_B1: "Building A",
      MapScreen_B2: "Building B",
      MapScreen_Pool: "Swimming Pool",
      MapScreen_GrasslandsAndFountain: "Main Lawn and Fountain",
      MapScreen_OakComplexAndPetanque: "Petanque court and oak tree complex",

      MapScreen_Tavor: "Tavor Building",
      MapScreen_Carmel: "Carmel Building",
      MapScreen_Gilboa: "Gilboa Building",

      Map_Pin1:
        "1st Floor: Reception, Resident Services, Lobby, Cafeteria, and passage to apartments. Exit to main lawn.",
      Map_Pin2:
        "Ground Floor (0): Restaurant, Events Hall, Barber Shop, Laundry Room, Art Classrooms, and exit to the Gym and Swimming Pool.",
      Map_Pin3:
        "Building A - Apartments 101-120, 201-220, 301-332, and 401-432.",
      Map_Pin4:
        "Building B - Apartments 131-149, 231-249, 331-349, and 431-449.",
      Map_Pin5: "Ground Floor (0): Health Clinic and Multipurpose Hall.",
      Map_Pin6: "2nd Floor: Studio, Synagogue, and a small lecture room.",
      Map_Pin7: "Gym",
      Map_Pin8: "Swimming pool",
      Map_Pin9:
        "Stairs - Passage between the main lawn and the swimming pool, gym, and events hall.",
      Map_Pin10: "Fountain and main lawn.",
      Map_Pin11:
        "Entrance to Building B - Descent to the Gallery and underground passages to the Tavor, Carmel, and Gilboa buildings.",
      Map_Pin12: "Tavor Building - Apartments 1151-1354.",

      Map_Pin13: "Carmel Building - Apartments 2151-2354.",

      Map_Pin14: "Gilboa Building - Apartments 3151-3354.",

      Map_Pin15: "Oak Compound and Petanque Court.",

      Map_Pin16:
        "Passage between buildings A and B - on Floors 0, 1, and 2 only.",
      Map_Pin17: "The Grocery Store.",
      Map_Pin18: "Entrance to Building B",
      Map_Pin19: "Gated and guarded entrance",
      MapScreen_LegendText:
        "Red Arrows - Mark the direction of traffic on the road.\nGreen Route - Symbolizes the roads within the compound.\nYellow Paths - Symbolize the pedestrian walkways.\nYellow Pins - Mark points of interest that you can click on to get more information.",

      Modal_Profile: "Profile",
      Modal_Navigate: "Navigate",

      // Notification Drawer and symbols

      Item_New: "New",
      Notifications_NewListing: "New item in the Marketplace - click to view",
      Notifications_NewNotice: "New notice published - click to read",
      Notifications_NewEvent: "New activity or class added - click to see",
      Notifications_NoNew: "No new notifications",

      // Category choice

      CategorySettings_Title: "Manage Notice Categories",
      CategorySettings_Subtitle:
        "Choose which types of notices you want to receive. Note - messages from unmarked categories will not be sent to you at all!",
      CategorySettings_Done: "Done",
      CategorySettings_ErrorLoading: "Could not load category settings.",
      CategorySettings_ErrorLoading_AlertTitle: "Error",
      CategorySettings_ErrorUpdating:
        "Could not save your change. Please try again.",
      CategorySettings_ErrorUpdating_AlertTitle: "Update Failed",

      // For: LanguageSettings.tsx
      LanguageSettingsPage_LanguageHeader: "Application Language",
      SettingsPage_NoticePreferences: "Notice Preferences",
      SettingsPage_ManageCategories: "Manage Categories",

      // For: Notices.jsx
      Notices_FilterButton: "Filter by Category",
      Notices_SortNewest: "Newest to Oldest",
      Notices_SortOldest: "Oldest to Newest",
      Notices_ApplyingFilters: "Applying filters...",
      Notices_ChipsHeaderTitle: "Categories shown (Number of unread messages)",
      Notices_NoCategoriesSelected:
        "No categories selected, select categories by using the button above to show messages.",
      Notices_ListHeaderTitle: "Notices",
      Notices_MarkAllRead: "Mark All as Read",
      Notices_MarkAllReadSuccess: "All visible notices marked as read",

      // For: CategorySettingsModal.jsx (on the Settings page)
      CategorySettings_UpdateSuccess: "Preference Saved",

      // For: NoticesCategoryFilterModal.jsx (the new filter modal)
      Common_Done: "Done",
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
      LanguageSettingsPage_LogoutHeader: "הגדרות חשבון",
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

      No_Image_Available: "אין תמונה זמינה",
      Add_Image: "הוסף תמונה",
      Remove_Image: "הסר",
      Return_Image: "חזור",
      Your_Profile_Pictures: "תמונות הפרופיל שלך",
      Your_Extra_Pictures: "תמונות נוספות שלך",
      Manage_Pictures_Subtitle: "ניתן לנהל עד {{maxSlots}} תמונות.",
      Add_a_New_Photo: "הוסף תמונה חדשה",
      Choose_a_source_for_your_new_picture: "בחר מקור לתמונה החדשה שלך.",
      Camera: "מצלמה",
      Gallery: "גלריה",
      Cancel: "ביטול",
      Delete: "מחק",
      Confirm: "אישור",
      Confirm_Deletion: "אשר מחיקה",
      Confirm_Deletion_Message: "האם אתה בטוח שברצונך למחוק תמונה זו לצמיתות?",
      Picture_Deleted: "התמונה נמחקה",
      Deletion_Failed: "המחיקה נכשלה",
      PictureIsInUse: "התמונה כעת נמצאת בשימוש",
      Permission_denied: "הרשאה נדחתה",
      Camera_access_is_required: "דרושה גישה למצלמה.",
      Gallery_access_is_required: "דרושה גישה לגלריה.",
      Upload_Successful: "העלאה הצליחה!",
      Upload_Failed: "העלאה נכשלה",

      Activities: "פעילויות",
      Classes: "חוגים",

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

      ApartmentSelector_Exists: "מספר הדירה חוקי וניתן לשימוש",
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
      MainMenuScreen_NoticeBoardButton: "לוח הודעות",
      MainMenuScreen_ResidentListButton: "רשימת הדיירים",
      MainMenuScreen_InfoSheetButton: "מידעון",
      MainMenuScreen_Timetable: "תוכניה",

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
      Events_ClassesTab: "חוגים",
      Events_ActivitiesTab: "פעילויות",

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
      MarketplaceItemScreen_CannotHandleContactTitle:
        "לא ניתן לטפל בפרטי יצירת קשר",
      MarketplaceItemScreen_CannotHandleContactMsg:
        "לא ניתן לטפל בפרטי יצירת קשר עבור פריט זה.",

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
      MarketplaceNewItemScreen_ExpiryNotice:
        "שימו לב: המודעה שלכם תימחק באופן אוטומטי לאחר שבועיים.",

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
      MapScreen_Loading: "טוען מפה...",
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
      MapScreen_HaAlon: "האלון",
      MapScreen_HaHadas: "ההדס",
      MapScreen_HaGeffen: "הגפן",
      MapScreen_HaTamar: "התמר",
      MapScreen_HaYasmin: "היסמין",
      MapScreen_HaRakefet: "הרקפת",
      MapScreen_HaHadarim: "האלון",
      MapScreen_HaNarkis: "הנרקיס",
      MapScreen_DataLoadingError: "שגיאה בטעינת הנתונים",
      MapScreen_NoApartmentsListed: "לא נמצאו דירות עבור בניין זה.",
      MapScreen_NoResidentsListed: "לא נמצאו דיירים",

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
      NoticeDetailsScreen_senderLabel: "פורסם על ידי:",
      Common_backButton: "חזרה לאחור",
      NoticeBoardScreen_boardTitle: "לוח ההודעות",
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
      NoticeFilterModal_modalSubtitle:
        "כאן ניתן לסנן מאילו קטגוריות הודעות יראו. שימו לב! על מנת לבחור עבור אילו קטגוריות לקבל הודעות מלכתחילה - יש לבחור בהגדרות המשתמש בכפתור ניהול קטגוריות.",

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
      ResidentList_ExplainationHeader: "איך לחפש דיירים?",
      ResidentList_Explaination:
        "אפשר לחפש בשתי דרכים ביחד או לחוד:\n\n<bold>לפי שם:</bold> פשוט התחילו להקליד את שם הדייר/ת בתיבת החיפוש, והרשימה תתעדכן באופן אוטומטי.\n\n<bold>לפי תחומי עניין:</bold> בחרו תחום עניין אחד או יותר מהרשימה, ולאחר מכן לחצו על כפתור ה'חיפוש'.",

      ResidentsCommitte_nameUnavailable: "שם לא זמין",
      ResidentsCommitte_titleUnavailable: "תואר לא זמין",
      ResidentsCommittePage_title: "וועד דיירים",
      ResidentsCommittePage_contact: "צור קשר עם הוועד",
      ResidentsCommittePage_committeeNotFound: "לא נמצאו חברי ועד.",

      ResidentsCommittePage_introText:
        "כאן תוכלו למצוא את פרטי חברי ועד הדיירים המסורים. אתם מוזמנים לפנות אליהם בכל שאלה או הצעה.",

      ResidentsCommittePage_fetchError: "תקלה בהבאת פרטי חברי הוועד",

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

      OurServices: "השירותים שלנו",

      MainMenuScreen_GoodMorningButton: "נוהל בוקר טוב",
      GoodMorning_title: "בוקר טוב!",
      GoodMorning_signInMe: "דיווח נוכחות עבורי",
      GoodMorning_signInBoth: "דיווח נוכחות עבורי ועבור בן/בת הזוג",
      GoodMorning_signInSuccessTitle: "דיווח בוצע",
      GoodMorning_signInSuccessMessage: "הנוכחות שלך נרשמה. שיהיה לך יום נהדר!",
      GoodMorning_IdError:
        "התרחשה שגיאה, נסו שוב או וודאו נוהל בוקר טוב עם ההנהלה",

      services_overrides_title: "שינויים בלוח הזמנים",
      services_overrides_intro:
        "שימו לב! במהלך השבוע הקרוב צפויים שינויים בלוח הזמנים של השירותים הבאים:",
      services_overrides_footer:
        "לפרטים נוספים, אנא עיינו בלוח ההודעות או בדף השירות.",
      service_override_unavailable_date:
        "בתאריך {{date}}, השירות לא יהיה זמין.",
      service_override_unavailable_datetime:
        "בתאריך {{date}} בין השעות {{startTime}} ל-{{endTime}}, השירות לא יהיה זמין.",
      service_override_available_date:
        "בתאריך {{date}}, השירות יפעל בשעות שונות.",
      service_override_available_datetime:
        "בתאריך {{date}}, השירות יהיה פתוח בין השעות {{startTime}} ל-{{endTime}}.",
      service_override_notes: "סיבה: {{notes}}",

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
      Events_MeetingRescheduled: "פגישה נדחתה",
      Events_MeetingCancelled: "פגישה בוטלה",
      Events_ParticipantsHaveBeenNotified: "המשתתפים עודכנו",
      Update_Failed: "עדכון נכשל",
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
      EventCard_MoreDetails: "לחץ לפרטים נוספים",
      Classes_NoClasses: "אין חוגים זמינים כרגע.",
      Activities_NoActivities: "אין פעילויות זמינות כרגע.",

      MyActivities_ParticipationChecked: "פעילויות שנוכחותן נבדקו",
      MyActivities_ParticipationNotChecked: "פעילויות שנוכחותן לא נבדקו",
      MyActivities_ClearFilter: "ניקוי בחירת כפתורים",
      MyActivities_NoParticipation: "ללא משתתפים",
      Activities_SortByClosest: "סינון לפי הקרובים ביותר",
      Activities_SortByNewest: "סינון לפי החדשים ביותר",
      Activities_NoActivitiesFound: "לא נמצאו פעילויות",

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
      EventCard_Registered: "נרשמו  {{capacity}} / {{count}} ",

      EventFocus_ThanksForMarking: "תודה שסימנת נוכחות.",
      EventFocus_WantToChange: "האם ברצונך לבצע שינוי?",
      EventFocus_ReEditButton: "עריכה מחדש",
      Common_Edit: "עריכה",
      EventFocus_FinalizeDisclaimer: "יש ללחוץ לאחר סימון כל הנוכחים.",
      EventFocus_FinalizeButton: "סיום סימון",
      EventFocus_RecurrenceDay: "ביום ( ימים )",
      EventFocus_AttendanceMarkedSuccess: "נוכחות נרשמה. תודה!",

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
      Timetable_SubTitle:
        "תוכניה זו מציגה את החוגים והפעילויות המתוכננים - פעילויות וחוגים מבוטלים באדום, כאלה שנדחו בצהוב, ומתבצעים כמתוכנן בכחול. יש לגלול מטה במבט היומי על מנת לראות את לוח הזמנים של היום. בלוח השבועי הניתן לבחור יום ולראות את פעילותיו, וכך גם בלוח החודשי.",
      Timetable_NoActivities: "אין פעילות מתוכננת להיום",
      Today: "היום",
      Timetable_daily: "יומי",
      Timetable_weekly: "שבועי",
      Timetable_monthly: "חודשי",
      TimeTable_Minutes: "דקות",
      TimeTable_Location: "מיקום",
      TimeTable_Type: "סוג",
      Timetable_Cancelled: "בוטל",
      Timetable_Rescheduled: "נדחה",
      hour: "שעה",
      hours: "שעות",
      minutes: "דקות",
      TimeTable_Time: "זמן",
      TimeTable_Status: "סטטוס",
      TimeTable_Notes: "הערות",

      // Navigation
      Navigation_Error: "שגיאת ניווט",
      Navigation_MustBeInside: "עליך להיות בתוך המתחם כדי לנווט.",
      Navigation_NoRoute: "לא ניתן לחשב מסלול ליעד.",
      Navigation_Cancel: "בטל ניווט",
      Map_LegendButton: "מקרא",
      Map_NavButton: "ניווט",
      Navigation_ArrivedTitle: "הגעת ליעד",
      Navigation_ArrivedMessage: "הגעת אל {{destination}}.",
      Common_OK: "אישור",
      Common_Apartment: "דירה",
      Common_Meters: "מטרים",
      Navigation_Title: "נווט אל",
      Navigation_SearchPlaceholder: "חפש דירה או בניין...",
      Navigation_DistanceTo: "מרחק אל {{destination}}:",
      MapScreen_Legend: "מקרא",
      MapScreen_Navigation: "ניווט",
      Navigation_Cancelled: "הניווט בוטל",
      MapScreen_ApartmentPlural: "דירות",

      // Buildings

      MapScreen_B1: "בניין שלב א'",
      MapScreen_B2: "בניין שלב ב'",
      MapScreen_Pool: "הבריכה",
      MapScreen_GrasslandsAndFountain: "מדשאה ומזרקה",
      MapScreen_OakComplexAndPetanque: "מגרש פטאנק ומתחם עץ האלון",
      Common_Apartpment: "דירה ",

      MapScreen_Tavor: "בניין תבור",
      MapScreen_Carmel: "בניין כרמל",
      MapScreen_Gilboa: "בניין גלבוע",

      Map_Pin1:
        "קומה 1: קבלה, שירותי דיירים, לובי, קפיטריה ומעבר לדירות. יציאה למדשאה המרכזית.",
      Map_Pin2:
        "קומת קרקע (0): מסעדה, אולם אירועים, מספרה, מכבסה, חדרי אומנות ויציאה לחדר הכושר ולבריכת השחייה.",
      Map_Pin3: "בניין א' - דירות 101-120, 201-220, 301-332, ו-401-432.",
      Map_Pin4: "בניין ב' - דירות 131-149, 231-249, 331-349, ו-431-449.",
      Map_Pin5: "קומת קרקע (0): מרפאה ואולם רב-תכליתי.",
      Map_Pin6: "קומה 2: סטודיו, בית כנסת וחדר הרצאות קטן.",
      Map_Pin7: "חדר כושר",
      Map_Pin8: "בריכת שחייה",
      Map_Pin9:
        "מדרגות - מעבר בין המדשאה המרכזית לבין בריכת השחייה, חדר הכושר ואולם האירועים.",
      Map_Pin10: "המזרקה והמדשאה המרכזית.",
      Map_Pin11:
        "כניסה לבניין ב' - ירידה לגלריה ולמעברים התת-קרקעיים לבנייני תבור, כרמל וגלבוע.",
      Map_Pin12: "בניין תבור - דירות 1151-1354.",

      Map_Pin13: "בניין כרמל - דירות 2151-2354.",

      Map_Pin14: "בניין גלבוע - דירות 3151-3354.",

      Map_Pin15: "מתחם עץ האלון ומגרש הפטאנק.",

      Map_Pin16: "מעבר בין בניין א' לבניין ב' - בקומות 0, 1 ו-2 בלבד.",
      Map_Pin17: "מיני מרקט המכולת",
      Map_Pin18: "כניסה לבניין שלב ב'",
      Map_Pin19: "שער כניסה ושומר",
      MapScreen_LegendText:
        "החיצים האדומים - מסמנים את כיוון התנועה בכביש.\nהמסלול הירוק - מסמל את כבישי המתחם.\nהשבילים הצהובים - מסמלים את המדרכות הרגליות.\nהסיכות הצהובות - מסמנות נקודות עניין שאפשר ללחוץ עליהן על מנת לקבל עוד מידע.",

      Modal_Profile: "לפרופיל",
      Modal_Navigate: "ניווט",
      // Notification Drawer and symbols

      Item_New: "חדש",
      Notifications_NewListing: "פריט חדש בשוק - לחץ/י לצפייה",
      Notifications_NewNotice: "מודעה חדשה פורסמה - לחץ/י לקריאה",
      Notifications_NewEvent: "פעילות או חוג חדשים - לחץ/י לצפייה",
      Notifications_NoNew: "אין התראות חדשות",

      // Residents Committee

      // Category choice

      CategorySettings_Title: "ניהול קטגוריות",
      CategorySettings_Subtitle:
        "בחרו אילו סוגי הודעות לקבל. שימו לב - הודעות מקטגוריות שלא יסומנו לא יישלחו אליכם כלל!",
      CategorySettings_Done: "סיום",
      CategorySettings_ErrorLoading: "לא ניתן היה לטעון את הגדרות הקטגוריה.",
      CategorySettings_ErrorLoading_AlertTitle: "שגיאה",
      CategorySettings_ErrorUpdating: "לא ניתן היה לשמור את השינוי. נסה שוב.",
      CategorySettings_ErrorUpdating_AlertTitle: "שגיאת עדכון",

      // For: LanguageSettings.tsx
      LanguageSettingsPage_LanguageHeader: "שפת האפליקציה",
      SettingsPage_NoticePreferences: "העדפות הודעות",
      SettingsPage_ManageCategories: "ניהול קטגוריות",

      // For: Notices.jsx
      Notices_FilterButton: "סינון לפי קטגוריה",
      Notices_SortNewest: "מהחדש לישן",
      Notices_SortOldest: "מהישן לחדש",
      Notices_ApplyingFilters: "מחיל מסננים...",
      Notices_ChipsHeaderTitle: "קטגוריות מוצגות (ומספר ההודעות שלא נקראו)",
      Notices_NoCategoriesSelected:
        " לא נבחרה קטגוריה, יש לבחור קטגוריות מהכפתור למעלה על מנת להציג הודעות.",
      Notices_ListHeaderTitle: "הודעות",
      Notices_MarkAllRead: "סמן הכל כנקרא",
      Notices_MarkAllReadSuccess: "כל ההודעות הנראות סומנו כנקראו",

      // For: CategorySettingsModal.jsx (on the Settings page)
      CategorySettings_UpdateSuccess: "העדפה נשמרה",

      // For: NoticesCategoryFilterModal.jsx (the new filter modal)
      Common_Done: "סיום",
    },
  },
};

// i18next.use(initReactI18next).init({
//   resources,
//   lng: "en", // Set a default language synchronously
//   fallbackLng: "en", // Fallback to English if translation is missing
//   debug: true,
//   interpolation: {
//     escapeValue: false, // React already does escaping
//   },
//   react: {
//     useSuspense: false, // Important for controlling splash screen
//   },
// });

export const initializeI18n = async () => {
  await i18next.init({
    resources,
    lng: "he", // Set a default language
    fallbackLng: "en", // Fallback to English if translation is missing",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Important for controlling splash screen
    },
  });
};

export default i18next;
