import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
  FlatList, // Ensure FlatList is imported if PaginatedListDisplay doesn't handle it internally
} from "react-native";

// Component Imports (ensure paths are correct)
import UserProfileCard from "../components/UserProfileCard";
import Header from "@/components/Header"; // Assuming path is correct
import FlipButton from "../components/FlipButton";
import FloatingLabelInput from "../components/FloatingLabelInput";
import SearchAccordion from "@/components/SearchAccordion"; // Assuming path is correct
import PaginatedListDisplay from "@/components/PaginatedListDisplay"; // Assuming path is correct
import InterestModal from "@/components/InterestSelectionModal";

// Icon and Translation Imports
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

// Constants and Globals (ensure path is correct)
import { Globals } from "./constants/Globals";

// Constants
const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEMS_PER_PAGE = 10;
const API_BASE_URL = Globals.API_BASE_URL; // Ensure Globals.API_BASE_URL is defined

// --- Component Definition ---
export default function ResidentList() {
  const { t } = useTranslation();
  const router = useRouter();

  // --- State Variables ---
  const [allUsers, setAllUsers] = useState([]); // Holds ALL fetched users from API
  const [isLoading, setIsLoading] = useState(true); // For initial data load
  const [error, setError] = useState(null); // For API fetch errors
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const [searchInput, setSearchInput] = useState(""); // User's current text in search input
  const [searchType, setSearchType] = useState("name"); // 'name' or 'hobby' for search type

  // Interest based search states
  const [isInterestModalVisible, setInterestModalVisible] = useState(false);
  const [allInterests, setAllInterests] = useState([]); // To hold all possible interests
  const [filterByInterests, setFilterByInterests] = useState([]); // To hold the selected names for filtering

  // --- Refs ---
  const flatListRef = useRef(null); // For scrolling FlatList to top

  // --- Callbacks for Data Fetching ---
  const fetchAllUsersCallback = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAllUsers([]); // Clear previous users before fetching
    try {
      const apiUrl = `${API_BASE_URL}/api/People/ActiveDigests`;
      console.log(`Fetching users from: ${apiUrl}`);
      const response = await fetch(apiUrl);
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `HTTP error ${response.status}: ${response.statusText}. ${errorBody}`
        );
      }
      const data = await response.json();
      console.log(`API returned ${data?.length ?? 0} users.`);
      setAllUsers(data || []); // Set fetched users, ensuring it's an array
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err.message || "Failed to load users.");
      // Keep allUsers as empty array on error
    } finally {
      setIsLoading(false); // Loading finished
    }
  }, []); // No dependencies, API_BASE_URL is from constant

  // --- Effects ---
  // Fetch users on initial mount
  useEffect(() => {
    fetchAllUsersCallback();
  }, [fetchAllUsersCallback]);

  const initialSelectedNamesForModal = useMemo(
    () => filterByInterests,
    [filterByInterests]
  );

  // Pulling all the interests !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  //   useEffect(() => {
  //   const fetchAllInterestsFromDB = async () => {
  //     try {
  //       const response = await fetch(`${Globals.API_BASE_URL}/api/Interests`); // EDIT ENDPOINT
  //       const data = await response.json();
  //       setAllInterests(data);
  //     } catch (err) {
  //       console.error("Failed to fetch all interests:", err);
  //     }
  //   };

  //   fetchAllInterestsFromDB();
  // }, []);

  const handleApplyInterestFilter = ({ selectedNames }) => {
    setFilterByInterests(selectedNames);
    setInterestModalVisible(false);
  };

  // --- Filtering Logic (Memoized) ---
  const filteredUsers = useMemo(() => {
    const query = searchInput.trim(); // Use live search input
    const type = searchType;

    if (!query) {
      return allUsers; // Return all if no search query
    }

    const lowerCaseQuery = query.toLowerCase();

    return allUsers.filter((user) => {
      if (type === "name") {
        const hebFirstName = user.hebFirstName?.toLowerCase() || "";
        const hebLastName = user.hebLastName?.toLowerCase() || "";
        const engFirstName = user.engFirstName?.toLowerCase() || "";
        const engLastName = user.engLastName?.toLowerCase() || "";
        // Check individual names and combined full names
        return (
          hebFirstName.includes(lowerCaseQuery) ||
          hebLastName.includes(lowerCaseQuery) ||
          engFirstName.includes(lowerCaseQuery) ||
          engLastName.includes(lowerCaseQuery) ||
          `${hebFirstName} ${hebLastName}`.trim().includes(lowerCaseQuery) ||
          `${engFirstName} ${engLastName}`.trim().includes(lowerCaseQuery)
        );
      } else if (type === "hobby") {
        // WARNING: Hobby filtering still requires backend data for `user.hobbies`
        return (
          Array.isArray(user.hobbies) &&
          user.hobbies.some((hobby) =>
            hobby?.toLowerCase().includes(lowerCaseQuery)
          )
        );
      }
      return false;
    });
  }, [allUsers, searchInput, searchType]); // Re-filter when master list, input, or type changes

  // --- Pagination Calculation ---
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Effect to reset page if filters make current page invalid
  useEffect(() => {
    const safeTotalPages = Math.max(1, totalPages);
    if (currentPage > safeTotalPages) {
      setCurrentPage(safeTotalPages); // Go to last valid page
    }
    // No need to reset to 1 if currentPage is 0, as it starts at 1
  }, [currentPage, totalPages]); // Run when page or total pages change

  // Calculate items for the current page (Memoized)
  const itemsForCurrentPage = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]); // Recalculate when filtered list or page changes

  // --- Callback for Page Changes ---
  const handlePageChange = useCallback(
    (newPage) => {
      const safeTotalPages = Math.max(1, totalPages);
      if (newPage >= 1 && newPage <= safeTotalPages) {
        setCurrentPage(newPage);
        // Scroll to top when page changes
        flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
      }
    },
    [totalPages] // Dependency: totalPages needed for boundary check
  );

  // --- Callbacks for Rendering List Items ---
  const renderUserItem = useCallback(
    ({ item }) => (
      <UserProfileCard
        data={item}
        onPress={() => {
          router.push({
            // Example pathname, adjust to your actual route
            pathname: "/Profile", // Or maybe './ProfileScreen', etc.
            params: { userId: item.userId }, // Pass userId as a parameter
          });
          console.log(`Navigating to profile for user ID: ${item.userId}`);
        }}
      />
    ),
    [router] // Add router as a dependency
  );

  const keyExtractor = useCallback((item) => item.userId.toString(), []);

  // --- Callbacks for UI Interactions ---
  const toggleSearchType = useCallback(() => {
    setSearchType((prevType) => (prevType === "name" ? "hobby" : "name"));
    setCurrentPage(1); // Reset page when search type changes
  }, []); // No dependencies

  const handleSearchPress = useCallback(() => {
    Keyboard.dismiss();

    if (searchType === "hobby") {
      // If searching by hobby, call our new dedicated function
      searchByInterests();
    } else {
      // If searching by name, the client-side filter handles it automatically.
      // We don't need to do anything extra here.
      setCurrentPage(1);
    }
  }, [searchType, filterByInterests]);

  // Search by interests ///////////////////////////////////////////////////////////////

  // const searchByInterests = async () => {
  //   if (filterByInterests.length === 0) {
  //     // Fetches the default list if no interests are selected for filtering
  //     fetchAllUsersCallback();
  //     return;
  //   }

  //   setIsLoading(true);
  //   setError(null);

  //   const apiUrl = `${Globals.API_BASE_URL}/api/People/SearchByInterests`;

  //   try {
  //     const response = await fetch(apiUrl, {
  //       method: 'POST', // 1. Specify the method is POST
  //       headers: {
  //         'Content-Type': 'application/json', // 2. Set the content type header
  //       },
  //       // 3. Send the array in the request body as a JSON string
  //       body: JSON.stringify(filterByInterests),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error ${response.status}`);
  //     }
  //     const data = await response.json();
  //     setAllUsers(data || []); // Update the user list with the filtered results
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  ///////////////////////////////////////////////////////////////////////////////////////////////////

  const handleSearchInputChange = useCallback((text) => {
    setSearchInput(text); // Update the search input state
    setCurrentPage(1); // Reset to page 1 on every keystroke for live filtering
  }, []); // No dependencies

  // --- Component for Empty List State (Memoized) ---
  const CustomEmptyComponent = useMemo(() => {
    // Show loading indicator only on initial load
    if (isLoading && allUsers.length === 0) {
      return (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={styles.centeredMessage}
        />
      );
    }
    // Show error if fetching failed
    if (error) {
      return (
        <Text style={[styles.infoText, styles.errorText]}>Error: {error}</Text>
      );
    }
    // Show 'no match' if there's a query but results are empty
    if (searchInput.trim() && filteredUsers.length === 0) {
      return (
        <Text style={styles.infoText}>
          {t("ResidentSearchScreen_noMatchMessage")}
        </Text>
      );
    }
    // Show 'no users' if not loading, no query, and master list is empty
    if (!searchInput.trim() && !isLoading && allUsers.length === 0) {
      return (
        <Text style={styles.infoText}>
          {t("ResidentSearchScreen_noUsersMessage")}
        </Text>
      );
    }
    // Otherwise, render nothing (FlatList will be empty or show items)
    return null;
  }, [isLoading, error, searchInput, allUsers, filteredUsers, t]); // Dependencies for empty state

  // --- Render Component JSX ---
  return (
    <View style={styles.container}>
      <Header />
      <Text style={styles.mainTitle}>{t("ResidentsSearchScreen_title")}</Text>
      <SearchAccordion
        headerOpenTextKey="ResidentSearchScreen_accordionOpen"
        headerClosedTextKey="ResidentSearchScreen_accordionClose"
        containerStyle={styles.accordionContainer}
        headerStyle={{
          justifyContent:
            Globals.userSelectedDirection === "rtl"
              ? "flex-end"
              : "space-between",
          gap: 10,
        }}
      >
        {/* This button to toggle search type remains the same */}
        <TouchableOpacity
          onPress={toggleSearchType}
          style={styles.searchTypeButton}
        >
          <Text style={styles.searchTypeText}>
            {t("ResidentSearchScreen_searchByLabel")}
            <Text style={{ fontWeight: "bold" }}>
              {searchType === "name"
                ? t("ResidentSearchScreen_searchByName")
                : t("ResidentSearchScreen_searchByHobby")}
            </Text>
          </Text>
        </TouchableOpacity>

        {searchType === "name" ? (
          // UI for searching by name
          <FloatingLabelInput
            label={t("ResidentSearchScreen_enterNamePlaceholder")}
            value={searchInput}
            onChangeText={handleSearchInputChange}
            returnKeyType="search"
            onSubmitEditing={handleSearchPress}
            style={styles.searchInputContainer}
            inputStyle={styles.searchInput}
            alignRight={Globals.userSelectedDirection === "rtl"}
          />
        ) : (
          // UI for filtering by interest
          // This is the UI for filtering by interest
          <View style={styles.filterContainer}>
            {/* 1. Button to summon the modal */}
            <FlipButton
              onPress={() => setInterestModalVisible(true)}
              style={styles.selectButton}
            >
              <Text style={styles.selectButtonText}>
                {t("ResidentSearchScreen_selectInterestsButton")}
              </Text>
            </FlipButton>

            {/* 2. A small area declaring what we're filtering by */}
            <Text style={styles.filterLabel}>
              {t("ResidentSearchScreen_filteringByLabel")}
            </Text>
            <View style={styles.chipDisplayArea}>
              {filterByInterests.length > 0 ? (
                filterByInterests.map((name) => (
                  <InterestChip key={name} mode="display" label={name} />
                ))
              ) : (
                <Text style={styles.noFilterText}>
                  {t("ResidentSearchScreen_noInterestsSelected")}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* This main search button remains, to submit the search */}
        <FlipButton
          onPress={handleSearchPress}
          style={styles.searchSubmitButton}
          bgColor="#007bff"
          textColor="#fff"
        >
          <View style={styles.buttonContent}>
            <Ionicons
              name="search"
              size={20}
              color="white"
              style={styles.buttonIcon}
            />
            <Text style={styles.searchButtonText}>
              {t("MarketplaceScreen_SearchButton")}
            </Text>
          </View>
        </FlipButton>
      </SearchAccordion>
      {/* The PaginatedListDisplay component remains unchanged */}
      <PaginatedListDisplay
        items={itemsForCurrentPage}
        renderItem={renderUserItem}
        itemKeyExtractor={keyExtractor}
        isLoading={isLoading && allUsers.length === 0}
        ListEmptyComponent={CustomEmptyComponent}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        listContainerStyle={styles.listContainerStyle}
        flatListRef={flatListRef}
      />

      <InterestModal
        visible={isInterestModalVisible}
        mode="filter"
        allInterests={allInterests}
        initialSelectedNames={initialSelectedNamesForModal} // <-- Ensure it uses this stable variable
        onClose={() => setInterestModalVisible(false)}
        onConfirm={handleApplyInterestFilter}
      />
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    width: "100%",
    alignItems: "center",
    paddingBottom: 10,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 70,
    marginBottom: 10,
    color: "#111",
  },
  accordionContainer: {
    width: SCREEN_WIDTH * 0.9,
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  searchTypeButton: {
    paddingVertical: 10,
    marginBottom: 15,
    alignItems: "center",
    backgroundColor: "#e7e7e7",
    borderRadius: 6,
    marginHorizontal: 15,
    marginTop: 15,
  },
  searchTypeText: {
    fontSize: 16,
    color: "#333",
  },
  searchInputContainer: {
    marginHorizontal: 15,
    marginBottom: 10,
  },
  searchInput: {
    fontSize: 16,
    color: "#333",
  },
  searchSubmitButton: {
    paddingVertical: 12,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  listContainerStyle: {
    paddingHorizontal: 0,
    width: "100%",
    alignItems: "center",
  },
  centeredMessage: {
    // Style for loading indicator container
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 50, // Adjust as needed
  },
  infoText: {
    // Style for 'no results'/'no users' text
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 50,
    paddingHorizontal: 20,
  },
  errorText: {
    // Style for error text
    fontSize: 18,
    color: "red", // Make errors stand out
    textAlign: "center",
    marginTop: 50,
    paddingHorizontal: 20,
  },
});
