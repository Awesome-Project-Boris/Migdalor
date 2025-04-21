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
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

import NoticeCard from "../components/NoticeCard"; //
import Header from "@/components/Header"; //
import FlipButton from "../components/FlipButton"; //
import FilterModal from "../components/NoticeFilterModal"; //
import PaginatedListDisplay from "@/components/PaginatedListDisplay"; // The reusable component
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Globals } from "../app/constants/Globals"; //

const ITEMS_PER_PAGE = 10; // Consistent items per page

// Fetches notices
const fetchNotices = async () => {
  console.log("Fetching notices from API...");
  const response = await fetch(`${Globals.API_BASE_URL}/api/Notices`);
  if (!response.ok) { throw new Error(`Failed to load notices: HTTP ${response.status}`); }
  const notices = await response.json();
  return notices || [];
};

// Fetches categories
const fetchCategories = async () => {
  console.log("Fetching categories from API...");
  const response = await fetch(`${Globals.API_BASE_URL}/api/Categories`);
  if (!response.ok) { throw new Error(`Failed to load categories: HTTP ${response.status}`); }
  const rawCategories = await response.json();
  // WILL NEED TO CHANGE WHEN WE SORT LANGUAGES
  const availableCategories = rawCategories.map(c =>
      Globals.userSelectedLanguage === 'he'
        ? (c.categoryHebName || c.categoryName) 
        : (c.categoryEngName || c.categoryName) // Fallbacks
  );
  return availableCategories || [];
};

// --- End Fetch Functions ---

export default function NoticesScreen() {
  const { t } = useTranslation();


  const [allNotices, setAllNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null);      
  const [currentPage, setCurrentPage] = useState(1);
  const [allCategories, setAllCategories] = useState([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true); 
  const [categoryError, setCategoryError] = useState(null); 
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortOrder, setSortOrder] = useState("recent");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const router = useRouter();
  const flatListRef = useRef(null);

  // --- Data Fetching Callbacks ---
  const fetchNoticesCallback = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchNotices();
      setAllNotices(data);
    } catch (err) {
      console.error("Failed to fetch notices:", err);
      setError(err.message || "Failed to load notices.");
      setAllNotices([]); // Ensure empty array on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategoriesCallback = useCallback(async () => {
    setIsCategoryLoading(true);
    setCategoryError(null);
    try {
      const cats = await fetchCategories();
      setAllCategories(cats);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setCategoryError(err.message || "Failed to load categories.");
      setAllCategories([]);
    } finally {
      setIsCategoryLoading(false);
    }
  }, []);

  // --- Initial Data Load Effect ---
  useEffect(() => {
    setCurrentPage(1); // Reset page on initial load
    fetchNoticesCallback();
    fetchCategoriesCallback();
  }, [fetchNoticesCallback, fetchCategoriesCallback]); // Run once on mount

  // --- Filtering and Sorting ---
  const processedNotices = useMemo(() => {
    console.log(`Processing ${allNotices.length} notices. Filter: [${selectedCategories.join(', ')}], Sort: ${sortOrder}`);
    let filtered = [...allNotices];

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((n) => n.noticeCategory && selectedCategories.includes(n.noticeCategory));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.creationDate);
      const dateB = new Date(b.creationDate);
      if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
    });

    console.log(`Processed down to ${filtered.length} notices.`);
    return filtered;
  }, [allNotices, selectedCategories, sortOrder]);

  // --- Pagination Calculations ---
  const totalItems = processedNotices.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const itemsForCurrentPage = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return processedNotices.slice(startIndex, endIndex);
  }, [processedNotices, currentPage]);

  // --- Effect to Reset Page When Filters/Sort Change Make Current Page Invalid ---
  useEffect(() => {
    const newTotalPages = Math.ceil(processedNotices.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
     // Reset to 1 if current page is 0 or less (can happen if list becomes empty)
     else if (currentPage <= 0 && newTotalPages > 0) {
        console.log(`Filter/Sort caused page reset from ${currentPage} to 1`);
        setCurrentPage(1);
     }
     // If newTotalPages becomes 0, currentPage should ideally be 1 or 0
     else if (newTotalPages === 0 && currentPage !== 1) {
         // setCurrentPage(1); // Or keep current page, PaginatedListDisplay will show empty
     }
  }, [processedNotices, currentPage]); // Runs when filtered/sorted data changes

  // --- Event Handlers ---
  const handlePageChange = useCallback((newPage) => {
      const safeTotalPages = Math.max(1, totalPages);
      if (newPage >= 1 && newPage <= safeTotalPages) {;
          setCurrentPage(newPage);
          flatListRef.current?.scrollToOffset({ animated: true, offset: 0 }); // Scroll to top
      }
  }, [totalPages]); // Dependency on totalPages

  const toggleSortOrder = useCallback(() => {
    setCurrentPage(1); // Reset page 
    setSortOrder((prev) => (prev === "recent" ? "oldest" : "recent"));
  }, []);

  const handleApplyFilter = useCallback((cats) => {
    setCurrentPage(1); // Reset page
    setSelectedCategories(cats);
    setIsFilterModalVisible(false);
  }, []);

  // --- Render Item Function ---
  const renderNoticeItem = useCallback(({ item }) => (
    <NoticeCard
      data={item}
      onPress={() =>
        router.push({
          pathname: "/NoticeFocus",
          params: { noticeId: item.noticeId },
        })
      }
    />
  ), [router]);

  // --- Key Extractor ---
  const keyExtractor = useCallback((item) => item.noticeId.toString(), []);

  // --- Custom Empty Component Logic ---
   const CustomEmptyComponent = useMemo(() => {
    if(isLoading && allNotices.length === 0) return <ActivityIndicator size="large" color="#0000ff" style={{marginTop: 50}}/>;
    if(error) return <Text style={styles.errorText}>{`Error loading notices: ${error}`}</Text>; // Show notice error
    // No matching results *after* filtering (and not loading/error)
    if (selectedCategories.length > 0 && processedNotices.length === 0) return <Text style={styles.infoText}>{t("NoticeBoardScreen_noMatchMessage")}</Text>;
    if (allNotices.length === 0) return <Text style={styles.infoText}>{t("NoticeBoardScreen_noNoticesMessage")}</Text>;
    if (processedNotices.length === 0) return <Text style={styles.infoText}>{t("NoticeBoardScreen_noNoticesMessage")}</Text>;

    return null; // List has items
   }, [isLoading, error, selectedCategories, allNotices, processedNotices, t]);


  return (
    <>
      <Header />
      <View style={styles.pageContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.pageTitle}>{t("NoticeBoardScreen_boardTitle")}</Text>
        </View>

        <View style={styles.controlsContainer}>
            <FlipButton onPress={() => setIsFilterModalVisible(true)} style={styles.controlButton} disabled={isCategoryLoading}>
                <View style={styles.buttonContent}>
                    <Ionicons name="filter" size={20} color="black" style={styles.buttonIcon}/>
                    <Text style={styles.buttonText}>{t("NoticeBoardScreen_filterButton")} ({selectedCategories.length > 0 ? selectedCategories.length : t("NoticeBoardScreen_all")})</Text>
                </View>
            </FlipButton>
            <FlipButton onPress={toggleSortOrder} style={styles.controlButton}>
                <View style={styles.buttonContent}>
                    <Ionicons name={sortOrder === "recent" ? "arrow-down" : "arrow-up"} size={20} color="black" style={styles.buttonIcon}/>
                    <Text style={styles.buttonText}>{t("NoticeBoardScreen_filterLabel")} {sortOrder === "recent" ? t("NoticeBoardScreen_sortOldest") : t("NoticeBoardScreen_sortNewest")}</Text>
                </View>
            </FlipButton>
        </View>

        <PaginatedListDisplay
          items={itemsForCurrentPage}
          renderItem={renderNoticeItem}
          itemKeyExtractor={keyExtractor}
          isLoading={isLoading && allNotices.length === 0}
          ListEmptyComponent={CustomEmptyComponent}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          flatListRef={flatListRef} // Passing ref
          listContainerStyle={styles.listContainerStyle}
        />

        <FilterModal
          visible={isFilterModalVisible}
          onClose={() => setIsFilterModalVisible(false)}
          allCategories={allCategories} 
          initialSelectedCategories={selectedCategories}
          onApply={handleApplyFilter}
        />
      </View>
    </>
  );
}


const styles = StyleSheet.create({
    pageContainer: {
        flex: 1, 
        backgroundColor: "#f7f7f7",
    },
    headerContainer: {
        alignItems: 'center',
        marginTop: 70,
    },
    pageTitle: {
        width: "80%",
        fontSize: 26,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 25,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    controlsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        width: '100%',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#fff",
        marginBottom: 5,
    },
    controlButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 6,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        fontSize: 15,
        fontWeight: "600",
    },
    listContainerStyle: {
        paddingHorizontal: 16,
        paddingBottom: 16, // Padding at the bottom of the list content
        width: '100%', // List takes full width
        alignItems: 'center', // Center cards within the list area
    },
    errorText: {
      textAlign: "center",
      fontSize: 16,
      marginVertical: 20,
      color: "red",
      paddingHorizontal: 20,
    },
    infoText: {
      textAlign: "center",
      fontSize: 16,
      marginVertical: 20,
      color: "#666",
      paddingHorizontal: 20,
    },
});