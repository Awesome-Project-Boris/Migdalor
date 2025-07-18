import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
  SafeAreaView,
  LayoutAnimation,
  UIManager,
  Platform,
} from "react-native";

// Component Imports
import UserProfileCard from "../components/UserProfileCard";
import Header from "@/components/Header";
import FlipButton from "../components/FlipButton";
import FloatingLabelInput from "../components/FloatingLabelInput";
import PaginatedListDisplay from "@/components/PaginatedListDisplay";
import InterestModal from "@/components/InterestSelectionModal";
import InterestChip from "@/components/InterestChip";
import StyledText from "@/components/StyledText";

// Icon and Translation Imports
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

// Constants and Globals
import { Globals } from "./constants/Globals";

// Enable LayoutAnimation on Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- Constants ---
const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEMS_PER_PAGE = 10;

// --- Main Component ---
export default function ResidentList() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const flatListRef = useRef(null);

  // --- State Management ---

  // Data & Loading States
  const [sourceUsers, setSourceUsers] = useState([]); // Master list from the last DB fetch
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Accordion & Search Type States
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [searchType, setSearchType] = useState("name"); // 'name' or 'hobby'

  // Filter States
  const [hobbyFilter, setHobbyFilter] = useState([]); // Selected hobby names for DB query
  const [nameFilter, setNameFilter] = useState(""); // Text for client-side name search

  // Modal & Interest Data States
  const [isInterestModalVisible, setInterestModalVisible] = useState(false);
  const [allInterests, setAllInterests] = useState([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // --- Data Fetching ---

  // Fetches the full, unfiltered list of all active residents.
  const fetchAllUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${Globals.API_BASE_URL}/api/People/ActiveDigests`
      );
      if (!response.ok) throw new Error("Failed to fetch residents.");
      const data = await response.json();
      setSourceUsers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetches a list of residents filtered by selected hobbies from the database.
  const fetchUsersByHobbies = useCallback(async () => {
    if (hobbyFilter.length === 0) {
      fetchAllUsers(); // If no hobbies, fetch everyone
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${Globals.API_BASE_URL}/api/People/SearchByInterests`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(hobbyFilter),
        }
      );
      if (!response.ok) throw new Error("Failed to search by hobbies.");
      const data = await response.json();
      setSourceUsers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [hobbyFilter, fetchAllUsers]);

  // Initial data load on component mount.
  useEffect(() => {
    fetchAllUsers();
    const fetchAllInterestsFromDB = async () => {
      try {
        const response = await fetch(`${Globals.API_BASE_URL}/api/Interests`);
        const data = await response.json();
        setAllInterests(data ? data.map((name) => ({ name })) : []);
      } catch (err) {
        console.error("Failed to fetch all interests:", err);
      }
    };
    fetchAllInterestsFromDB();
  }, []);

  // --- Filtering & Pagination Logic ---

  // This is the core logic: it takes the source data and applies the client-side name filter.
  const displayedUsers = useMemo(() => {
    if (!nameFilter.trim()) {
      return sourceUsers; // No name filter applied
    }
    const lowerCaseQuery = nameFilter.trim().toLowerCase();
    return sourceUsers.filter((user) => {
      const hebFirstName = user.hebFirstName?.toLowerCase() || "";
      const hebLastName = user.hebLastName?.toLowerCase() || "";
      const fullName = `${hebFirstName} ${hebLastName}`;
      return fullName.includes(lowerCaseQuery);
    });
  }, [sourceUsers, nameFilter]);

  // Pagination is calculated based on the final, displayed list.
  const totalItems = displayedUsers.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const itemsForCurrentPage = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayedUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [displayedUsers, currentPage]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [nameFilter, hobbyFilter]);

  // --- Event Handlers ---

  const toggleAccordion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsAccordionOpen(!isAccordionOpen);
  };

  const handleApplyHobbyFilter = (selectedHobbies) => {
    setHobbyFilter(selectedHobbies.selectedNames);
    setInterestModalVisible(false);
    fetchUsersByHobbies(); // Trigger the API call
  };

  const clearHobbyFilter = () => {
    setHobbyFilter([]);
    fetchAllUsers(); // Fetch all users again
  };

  const clearNameFilter = () => {
    setNameFilter("");
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // --- Render Functions ---

  const renderUserItem = useCallback(
    ({ item }) => (
      <UserProfileCard
        data={item}
        onPress={() =>
          router.push({ pathname: "/Profile", params: { userId: item.userId } })
        }
      />
    ),
    [router]
  );

  // This is the new, integrated search component that will be used as the list header.
  const ListHeaderComponent = () => (
    <>
      <View style={styles.headerPlaque}>
        <StyledText style={styles.mainTitle}>
          {t("ResidentsSearchScreen_title")}
        </StyledText>
      </View>

      {/* Active Filter Indicators */}
      <View style={styles.activeFiltersContainer}>
        {hobbyFilter.length > 0 && (
          <View style={styles.filterChip}>
            <StyledText style={styles.filterChipText}>
              {t("ResidentSearchScreen_filteringByLabel")}{" "}
              {hobbyFilter.join(", ")}
            </StyledText>
            <TouchableOpacity onPress={clearHobbyFilter}>
              <Ionicons name="close-circle" size={20} color="#6c757d" />
            </TouchableOpacity>
          </View>
        )}
        {nameFilter.trim().length > 0 && (
          <View style={styles.filterChip}>
            <StyledText style={styles.filterChipText}>
              {t("ResidentSearchScreen_searchByName")}: {nameFilter}
            </StyledText>
            <TouchableOpacity onPress={clearNameFilter}>
              <Ionicons name="close-circle" size={20} color="#6c757d" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* The Accordion Logic */}
      <View style={styles.accordionContainer}>
        <TouchableOpacity style={styles.header} onPress={toggleAccordion}>
          <StyledText style={styles.headerText}>
            {isAccordionOpen
              ? t("ResidentSearchScreen_accordionOpen")
              : t("ResidentSearchScreen_accordionClose")}
          </StyledText>
          <Ionicons
            name={isAccordionOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color="#333"
          />
        </TouchableOpacity>

        {isAccordionOpen && (
          <View style={styles.content}>
            <TouchableOpacity
              onPress={() =>
                setSearchType(searchType === "name" ? "hobby" : "name")
              }
              style={styles.searchTypeButton}
            >
              <StyledText style={styles.searchTypeText}>
                {t("ResidentSearchScreen_searchByLabel")}
                <StyledText style={{ fontWeight: "bold" }}>
                  {searchType === "name"
                    ? t("ResidentSearchScreen_searchByName")
                    : t("ResidentSearchScreen_searchByHobby")}
                </StyledText>
              </StyledText>
            </TouchableOpacity>

            {searchType === "name" ? (
              <FloatingLabelInput
                label={t("ResidentSearchScreen_enterNamePlaceholder")}
                value={nameFilter}
                onChangeText={setNameFilter}
                style={styles.searchInputContainer}
              />
            ) : (
              <>
                <FlipButton
                  onPress={() => setInterestModalVisible(true)}
                  style={styles.selectButton}
                >
                  <StyledText style={styles.selectButtonText}>
                    {t("ResidentSearchScreen_selectInterestsButton")}
                  </StyledText>
                </FlipButton>
                <View style={styles.chipDisplayArea}>
                  {hobbyFilter.length > 0 ? (
                    hobbyFilter.map((name) => (
                      <InterestChip key={name} mode="display" label={name} />
                    ))
                  ) : (
                    <StyledText style={styles.noFilterText}>
                      {t("ResidentSearchScreen_noInterestsSelected")}
                    </StyledText>
                  )}
                </View>
              </>
            )}

            {searchType === "hobby" && (
              <FlipButton
                onPress={fetchUsersByHobbies}
                style={styles.searchSubmitButton}
              >
                <View style={styles.buttonContent}>
                  <Ionicons
                    name="search"
                    size={20}
                    color="white"
                    style={styles.buttonIcon}
                  />
                  <StyledText style={styles.searchButtonText}>
                    {t("MarketplaceScreen_SearchButton")}
                  </StyledText>
                </View>
              </FlipButton>
            )}
          </View>
        )}
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <PaginatedListDisplay
        flatListRef={flatListRef}
        items={itemsForCurrentPage}
        renderItem={renderUserItem}
        itemKeyExtractor={(item) => item.userId.toString()}
        isLoading={isLoading}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={
          !isLoading && (
            <StyledText style={styles.infoText}>
              {t("ResidentSearchScreen_noMatchMessage")}
            </StyledText>
          )
        }
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      <InterestModal
        visible={isInterestModalVisible}
        mode="filter"
        allInterests={allInterests}
        initialSelectedNames={hobbyFilter}
        onClose={() => setInterestModalVisible(false)}
        onConfirm={handleApplyHobbyFilter}
      />
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7e7ce",
  },
  headerPlaque: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#dee2e6",
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
    marginTop: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111",
  },
  accordionContainer: {
    width: SCREEN_WIDTH * 0.9,
    alignSelf: "center",
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  content: {
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  searchTypeButton: {
    paddingVertical: 10,
    marginBottom: 15,
    alignItems: "center",
    backgroundColor: "#e7e7e7",
    borderRadius: 6,
  },
  searchTypeText: {
    fontSize: 16,
    color: "#333",
  },
  searchInputContainer: {
    marginBottom: 10,
  },
  selectButton: {
    paddingVertical: 12,
  },
  selectButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  chipDisplayArea: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginTop: 10,
    padding: 5,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    minHeight: 50,
  },
  noFilterText: {
    color: "#999",
    fontStyle: "italic",
    padding: 10,
  },
  searchSubmitButton: {
    paddingVertical: 12,
    marginTop: 15,
    backgroundColor: "#007bff",
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
  infoText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 50,
    paddingHorizontal: 20,
  },
  activeFiltersContainer: {
    width: "90%",
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e9ecef",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 8,
  },
  filterChipText: {
    fontSize: 14,
    color: "#495057",
  },
});
