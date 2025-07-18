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

// --- Setup for Layout Animation on Android ---
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Constants ---
const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEMS_PER_PAGE = 10;

// --- Memoized Header Component ---
const ListHeader = React.memo(
  ({
    isAccordionOpen,
    toggleAccordion,
    searchType,
    setSearchType,
    nameInput, // ✅ Now correctly receives the instant input value
    setNameInput, // ✅ Now correctly receives the instant setter
    hobbyFilter,
    clearHobbyFilter,
    clearNameFilter,
    setInterestModalVisible,
    handleSearch,
  }) => {
    const { t } = useTranslation();

    return (
      <>
        <View style={styles.headerPlaque}>
          <StyledText style={styles.mainTitle}>
            {t("ResidentsSearchScreen_title")}
          </StyledText>
        </View>

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
                  value={nameInput} // ✅ Use the instant value
                  onChangeText={setNameInput} // ✅ Use the instant setter
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
              <FlipButton
                onPress={handleSearch}
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
            </View>
          )}
        </View>

        <View style={styles.activeFiltersContainer}>
          {hobbyFilter.length > 0 && (
            <View style={styles.filterChip}>
              <StyledText style={styles.filterChipText}>
                <StyledText style={{ fontWeight: "bold", fontSize: 20 }}>
                  {t("ResidentList_searchingByHobbies")}
                </StyledText>
                {hobbyFilter.join(", ")}
              </StyledText>
              <TouchableOpacity
                onPress={clearHobbyFilter}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={22} color="#6c757d" />
              </TouchableOpacity>
            </View>
          )}
          {/* ✅ Show the chip based on instant input to feel responsive */}
          {nameInput.trim().length > 0 && (
            <View style={styles.filterChip}>
              <StyledText style={styles.filterChipText}>
                <StyledText style={{ fontWeight: "bold", fontSize: 20 }}>
                  {t("ResidentList_searchingByName")}
                </StyledText>
                {nameInput}
              </StyledText>
              <TouchableOpacity
                onPress={clearNameFilter}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={22} color="#6c757d" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </>
    );
  }
);

// --- Main Component Definition ---
export default function ResidentList() {
  const { t } = useTranslation();
  const router = useRouter();
  const flatListRef = useRef(null);

  const [sourceUsers, setSourceUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [searchType, setSearchType] = useState("name");
  const [hobbyFilter, setHobbyFilter] = useState([]);
  const [nameInput, setNameInput] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [isInterestModalVisible, setInterestModalVisible] = useState(false);
  const [allInterests, setAllInterests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNameFilter(nameInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [nameInput]);

  const fetchUsers = useCallback(
    async (hobbies = []) => {
      setIsLoading(true);
      setError(null);
      let apiUrl = `${Globals.API_BASE_URL}/api/People/ActiveDigests`;
      let options = { method: "GET" };

      if (hobbies.length > 0) {
        apiUrl = `${Globals.API_BASE_URL}/api/People/SearchByInterests`;
        options = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(hobbies),
        };
      }
      try {
        const response = await fetch(apiUrl, options);
        if (!response.ok) throw new Error(t("ResidentSearchScreen_fetchError"));
        const data = await response.json();
        setSourceUsers(data || []);
      } catch (err) {
        setError(err.message);
        setSourceUsers([]);
      } finally {
        setIsLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    fetchUsers();
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
  }, [fetchUsers]);

  const displayedUsers = useMemo(() => {
    if (!nameFilter.trim()) return sourceUsers;
    const lowerCaseQuery = nameFilter.trim().toLowerCase();
    return sourceUsers.filter((user) =>
      `${user.hebFirstName?.toLowerCase() || ""} ${
        user.hebLastName?.toLowerCase() || ""
      }`.includes(lowerCaseQuery)
    );
  }, [sourceUsers, nameFilter]);

  const totalPages = Math.ceil(displayedUsers.length / ITEMS_PER_PAGE);
  const itemsForCurrentPage = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayedUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [displayedUsers, currentPage]);

  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [nameFilter, hobbyFilter]);

  const toggleAccordion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsAccordionOpen((prev) => !prev);
  };

  const handleSelectHobbies = ({ selectedNames }) => {
    setHobbyFilter(selectedNames);
    setInterestModalVisible(false);
  };

  const handleSearch = () => {
    fetchUsers(hobbyFilter);
  };

  const clearHobbyFilter = () => {
    setHobbyFilter([]);
    fetchUsers([]);
  };

  const clearNameFilter = () => {
    setNameInput("");
    setNameFilter("");
  };

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

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.centerPagination}>
        <PaginatedListDisplay
          flatListRef={flatListRef}
          items={itemsForCurrentPage}
          renderItem={renderUserItem}
          itemKeyExtractor={(item) => item.userId.toString()}
          isLoading={isLoading}
          ListHeaderComponent={
            <ListHeader
              isAccordionOpen={isAccordionOpen}
              toggleAccordion={toggleAccordion}
              searchType={searchType}
              setSearchType={setSearchType}
              nameInput={nameInput} // ✅ Pass the instant state
              setNameInput={setNameInput} // ✅ Pass the instant setter
              hobbyFilter={hobbyFilter}
              clearHobbyFilter={clearHobbyFilter}
              clearNameFilter={clearNameFilter}
              setInterestModalVisible={setInterestModalVisible}
              handleSearch={handleSearch}
            />
          }
          contentContainerStyle={styles.listContentContainer}
          ListEmptyComponent={
            !isLoading && (
              <StyledText style={styles.infoText}>
                {t("ResidentSearchScreen_noMatchMessage")}
              </StyledText>
            )
          }
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </View>
      <InterestModal
        visible={isInterestModalVisible}
        mode="filter"
        allInterests={allInterests}
        initialSelectedNames={hobbyFilter}
        onClose={() => setInterestModalVisible(false)}
        onConfirm={handleSelectHobbies}
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
  centerPagination: {
    alignItems: "center",
    alignSelf: "center",
    marginTop: 20,
    // paddingBottom: 50,
  },
  headerPlaque: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#dee2e6",
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 70,
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
    marginVertical: 15,
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
    flexDirection: "column",
    gap: 10,
    marginTop: 15,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#e9ecef",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  filterChipText: {
    fontSize: 22,
    color: "#495057",
    flexShrink: 1,
    marginRight: 10,
  },
});
