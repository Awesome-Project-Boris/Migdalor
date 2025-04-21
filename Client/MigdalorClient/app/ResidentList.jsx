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
} from "react-native";

import UserProfileCard from "../components/UserProfileCard";
import Header from "@/components/Header";
import FlipButton from "../components/FlipButton";
import FloatingLabelInput from "../components/FloatingLabelInput";
import SearchAccordion from "@/components/SearchAccordion";
import PaginatedListDisplay from "@/components/PaginatedListDisplay";

import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Globals } from "./constants/Globals";

const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEMS_PER_PAGE = 10;

// --- Mock Data Function (Modified to return ALL users) ---

const fetchAllUsersAPI = async () => {
  console.log(`Workspaceing ALL mock users...`);
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
  const allMockUsers = Array.from({ length: 150 }, (_, i) => ({
    userId: `user_${i + 1}`,
    name: `User ${String.fromCharCode(65 + (i % 26))}${i}`,
    photoUrl: `https://i.pravatar.cc/150?u=user${i + 1}`,
    // Keep hobby data for filtering example
    _hobbies_server_only: [
      "hobby " + ((i % 5) + 1),
      "activity " + ((i % 3) + 1),
      i % 4 === 0 ? "reading" : "music",
    ],
  }));
  console.log(`API returning ${allMockUsers.length} mock users total.`);
  return allMockUsers; // Return the full list
};
// --- End Mock API ---

export default function ResidentList() {
  const { t } = useTranslation();

  const [allUsers, setAllUsers] = useState([]); // Holds ALL fetched users
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState(""); // Local search input state
  const [searchType, setSearchType] = useState("name"); // 'name' or 'hobby'
  const [activeSearchCriteria, setActiveSearchCriteria] = useState({
    query: "",
    type: "name",
  }); // Active filter criteria

  const flatListRef = useRef(null); // Keep if scroll-to-top needed

  const fetchAllUsersCallback = useCallback(async () => {
    // Renamed for clarity
    setIsLoading(true);
    setError(null);
    try {
      // Replace with actual API
      const data = await fetchAllUsersAPI();
      setAllUsers(data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err.message || "Failed to load users.");
      setAllUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllUsersCallback();
  }, [fetchAllUsersCallback]);

  // --- Filtering Logic ---
  const filteredUsers = useMemo(() => {
    const { query, type } = activeSearchCriteria;
    if (!query) {
      return allUsers;
    }
    const lowerCaseQuery = query.toLowerCase();
    const filtered = allUsers.filter((user) => {
      if (type === "name") {
        return user.name?.toLowerCase().includes(lowerCaseQuery);
      } else if (type === "hobby") {
        return (
          Array.isArray(user._hobbies_server_only) &&
          user._hobbies_server_only.some((hobby) =>
            hobby?.toLowerCase().includes(lowerCaseQuery)
          )
        );
      }
      return true;
    });
    // Reset page if filter changes make current page invalid
    const newTotalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setTimeout(() => setCurrentPage(newTotalPages), 0);
    } else if (currentPage === 0 && newTotalPages > 0) {
      setTimeout(() => setCurrentPage(1), 0);
    }
    return filtered;
  }, [allUsers, activeSearchCriteria, currentPage]);

  // --- Pagination Calculation ---
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const itemsForCurrentPage = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]);

  // --- Page Change Handler ---
  const handlePageChange = useCallback(
    (newPage) => {
      const safeTotalPages = Math.max(1, totalPages); // Use calculated totalPages
      if (newPage >= 1 && newPage <= safeTotalPages) {
        setCurrentPage(newPage);
        flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
      }
    },
    [totalPages]
  ); // Dependency on totalPages

  const renderUserItem = useCallback(
    ({ item }) => <UserProfileCard data={item} />,
    []
  );

  const keyExtractor = useCallback((item) => item.userId.toString(), []);

  // --- Other UI Handlers ---
  const toggleSearchType = () => {
    setSearchType((prev) => (prev === "name" ? "hobby" : "name"));
  };

  const handleSearchPress = () => {
    Keyboard.dismiss();
    setCurrentPage(1); // Reset page on new search
    // Update the *active* search criteria passed to PaginatedListDisplay
    setActiveSearchCriteria({ query: searchInput, type: searchType });
  };

  const CustomEmptyComponent = useMemo(() => {
    if (isLoading && allUsers.length === 0)
      return (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={{ marginTop: 50 }}
        />
      );
    if (error) return <Text style={styles.errorText}>Error: {error}</Text>;
    if (activeSearchCriteria.query && filteredUsers.length === 0)
      return (
        <Text style={styles.infoText}>
          {t("ResidentSearchScreen_noMatchMessage")}
        </Text>
      );
    if (!activeSearchCriteria.query && allUsers.length === 0)
      return (
        <Text style={styles.infoText}>
          {t("ResidentSearchScreen_noUsersMessage")}
        </Text>
      );
    return null; // List has items
  }, [
    isLoading,
    error,
    activeSearchCriteria.query,
    allUsers,
    filteredUsers,
    t,
  ]);

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
        headerTextStyle={{}}
      >
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
        <FloatingLabelInput
          label={
            searchType === "name"
              ? t("ResidentSearchScreen_enterNamePlaceholder")
              : t("ResidentSearchScreen_enterHobbyPlaceholder")
          }
          value={searchInput} // Bind to local searchInput state
          onChangeText={setSearchInput}
          returnKeyType="search"
          onSubmitEditing={handleSearchPress}
          style={styles.searchInputContainer}
          inputStyle={styles.searchInput}
          alignRight={Globals.userSelectedDirection === "rtl"}
        />
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

      <PaginatedListDisplay
        items={itemsForCurrentPage}
        renderItem={renderUserItem}
        itemKeyExtractor={keyExtractor}
        isLoading={isLoading && itemsForCurrentPage.length === 0} // Correct loading condition
        ListEmptyComponent={CustomEmptyComponent}
        currentPage={currentPage}
        totalPages={totalPages} // Pass calculated totalPages
        onPageChange={handlePageChange}
        listContainerStyle={styles.listContainerStyle}
        flatListRef={flatListRef}
      />
    </View>
  );
}

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
  },
  searchTypeText: { fontSize: 16, color: "#333" },
  searchInputContainer: { marginHorizontal: 15, marginBottom: 10 },
  searchInput: { fontSize: 16, color: "#333" },
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
  buttonIcon: { marginRight: 8 },
  searchButtonText: { fontSize: 16, fontWeight: "bold", color: "white" },
  listContainerStyle: {
    paddingHorizontal: 0,
    width: "100%",
    alignItems: "center",
  }, // Let PaginatedListDisplay handle internal list width/padding maybe
  infoText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 50,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 50,
    paddingHorizontal: 20,
  },
});
