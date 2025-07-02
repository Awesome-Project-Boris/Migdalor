import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  // useContext, // No longer needed if not using useAuth
} from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";


import NoticeCard from "../components/NoticeCard";
import Header from "@/components/Header";
import FlipButton from "../components/FlipButton";
import FilterModal from "../components/NoticeFilterModal";
import PaginatedListDisplay from "@/components/PaginatedListDisplay";


import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Globals } from "../app/constants/Globals";

const ITEMS_PER_PAGE = 10;

// --- Fetch Functions (remain the same) ---
const fetchNotices = async () => {
  // console.log("Fetching notices from API...");
  const response = await fetch(`${Globals.API_BASE_URL}/api/Notices`);
  if (!response.ok) {
    throw new Error(`Failed to load notices: HTTP ${response.status}`);
  }
  const notices = await response.json();
  return notices || [];
};

const fetchCategories = async () => {
  // console.log("Fetching categories from API...");
  const response = await fetch(`${Globals.API_BASE_URL}/api/Categories`);
  if (!response.ok) {
    throw new Error(`Failed to load categories: HTTP ${response.status}`);
  }
  const rawCategories = await response.json();
  const availableCategories = rawCategories.map((c) => c.categoryHebName);
  return availableCategories || [];
};

export default function NoticesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const flatListRef = useRef(null);

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

  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true);


  const fetchNoticesCallback = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchNotices();
      setAllNotices(data);
    } catch (err) {
      console.error("Failed to fetch notices:", err);
      setError(err.message || "Failed to load notices.");
      setAllNotices([]);
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

  // Initial data load
  useEffect(() => {
    setCurrentPage(1);
    fetchNoticesCallback();
    fetchCategoriesCallback();
  }, [fetchNoticesCallback, fetchCategoriesCallback]);

  // Effect to Check Admin Status ---
  useEffect(() => {
    const checkAdminStatus = async () => {
      let currentUserId = null; 
      try {
        currentUserId = await AsyncStorage.getItem("userID"); // Get ID here
        if (!currentUserId) {
          console.log("Admin Check: No user ID found in storage.");
          setIsAdmin(false);
          setIsAdminLoading(false);
          return;
        }
      } catch (storageError) {
          console.error("Admin Check: Error reading userID from AsyncStorage", storageError);
          setIsAdmin(false);
          setIsAdminLoading(false);
          return;
      }

      console.log(`Admin Check: Checking status for user ID: ${currentUserId}`);
      setIsAdminLoading(true);
      try {
        const response = await fetch(`${Globals.API_BASE_URL}/api/People/isadmin/?userId=${currentUserId}`); // Use fetched ID
        if (!response.ok) {
          console.error(`Admin Check Failed: HTTP ${response.status}`);
          throw new Error('Failed to verify admin status');
        }
        const isAdminResult = await response.json();
        console.log("Admin Check Result:", isAdminResult);

        if (typeof isAdminResult === 'boolean') {
             setIsAdmin(isAdminResult);
        } else if (typeof isAdminResult === 'object' && typeof isAdminResult.isAdmin === 'boolean') {
             setIsAdmin(isAdminResult.isAdmin);
        } else {
             console.warn("Admin Check: Unexpected response format.");
             setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error during admin check API call:", err);
        setIsAdmin(false);
      } finally {
        setIsAdminLoading(false);
      }
    };

    checkAdminStatus();
  }, []); 

  // Live refresh while screen is focused
  useFocusEffect(
    useCallback(() => {
      const intervalId = setInterval(() => {
        fetchNoticesCallback();
      }, 3000);
      return () => clearInterval(intervalId);
    }, [fetchNoticesCallback])
  );

  // Filtering & sorting
  const processedNotices = useMemo(() => {
    if (!Array.isArray(allNotices)) {
        console.warn("processedNotices: allNotices is not an array!", allNotices);
        return []; 
    }
    let filtered = [...allNotices]; 

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(
        (n) => n.noticeCategory && selectedCategories.includes(n.noticeCategory)
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.creationDate);
      const dateB = new Date(b.creationDate);
      if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
    });
    return filtered;
  }, [allNotices, selectedCategories, sortOrder]);


  const totalItems = processedNotices.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const itemsForCurrentPage = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedNotices.slice(start, start + ITEMS_PER_PAGE);
  }, [processedNotices, currentPage]);


  useEffect(() => {
    const newTotalPages = Math.max(1, Math.ceil(processedNotices.length / ITEMS_PER_PAGE)); // Ensure at least 1 page
    if (currentPage > newTotalPages) { 
      setCurrentPage(newTotalPages);
    }
  }, [processedNotices, currentPage]);


  const handlePageChange = useCallback((newPage) => {
      const safeTotalPages = Math.max(1, totalPages);
      if (newPage >= 1 && newPage <= safeTotalPages) {
          setCurrentPage(newPage);
          flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
      }
  }, [totalPages]);

  const toggleSortOrder = useCallback(() => {
    setCurrentPage(1);
    setSortOrder((prev) => (prev === "recent" ? "oldest" : "recent"));
  }, []);

  const handleApplyFilter = useCallback((cats) => {
    setCurrentPage(1);
    setSelectedCategories(cats);
    setIsFilterModalVisible(false);
  }, []);

  // Render Item Function
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

  // Key Extractor 
  const keyExtractor = useCallback((item) => item.noticeId.toString(), []);

  //  Custom Empty Component Logic 
   const CustomEmptyComponent = useMemo(() => {
    if(isLoading && allNotices.length === 0) return <ActivityIndicator size="large" color="#0000ff" style={{marginTop: 50}}/>;
    if(error) return <Text style={styles.errorText}>{`Error loading notices: ${error}`}</Text>;
    if (selectedCategories.length > 0 && processedNotices.length === 0) return <Text style={styles.infoText}>{t("NoticeBoardScreen_noMatchMessage")}</Text>;
    if (!isLoading && !error && allNotices.length === 0) return <Text style={styles.infoText}>{t("NoticeBoardScreen_noNoticesMessage")}</Text>;

    if (processedNotices.length === 0) return <Text style={styles.infoText}>{t("NoticeBoardScreen_noNoticesMessage")}</Text>;

    return null;
   }, [isLoading, error, selectedCategories, allNotices, processedNotices, t]);


  return (
    <>
      <Header />
      <View style={styles.pageContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.pageTitle}>
            {t("NoticeBoardScreen_boardTitle")}
          </Text>
        </View>
        {!isAdminLoading && isAdmin && (
            <View style={styles.newNoticeButtonContainer}>
                <FlipButton
                    onPress={() => router.push('/NewNotice')}
                    style={styles.newNoticeButton}
                    bgColor="#ffffff"
                    textColor="#000000"
                >
                        <Ionicons name="add-circle-outline" size={20} color="white" style={styles.buttonIcon}/>
                        <Text style={[styles.buttonText, styles.newNoticeButtonText]}>{t("NoticesScreen_NewNoticeButton")}</Text>
                </FlipButton>
              </View>
            )}
        <View style={styles.controlsContainer}>
            <FlipButton onPress={() => setIsFilterModalVisible(true)} style={styles.controlButton} disabled={isCategoryLoading}>
                <View style={styles.buttonContent}>
                    <Ionicons name="filter" size={20} color="black" style={styles.buttonIcon}/>
                    <Text style={styles.buttonText}>{t("NoticeBoardScreen_filterButton")} ({selectedCategories.length > 0 ? selectedCategories.length : t("NoticeBoardScreen_all")})</Text>
                </View>
            </FlipButton>
            <FlipButton onPress={toggleSortOrder} style={styles.controlButton}>
                <View style={styles.buttonContent}>
                    <Ionicons name={sortOrder === "recent" ? "arrow-down" : "arrow-up" } size={20} color="black" style={styles.buttonIcon}/>
                    <Text style={styles.buttonText}>{t("NoticeBoardScreen_filterLabel")} { sortOrder === "recent" ?  t("NoticeBoardScreen_sortNewest") : t("NoticeBoardScreen_sortOldest") }</Text>
                </View>
            </FlipButton>
             {isAdminLoading && <View style={styles.adminButtonPlaceholder} />}
        </View>

        <PaginatedListDisplay
          items={itemsForCurrentPage}
          renderItem={renderNoticeItem}
          itemKeyExtractor={keyExtractor}
          isLoading={isLoading && allNotices.length === 0} // Indicate loading on initial fetch
          ListEmptyComponent={CustomEmptyComponent}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          flatListRef={flatListRef}
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
    pageContainer: { flex: 1, backgroundColor: "#f7f7f7", alignItems: 'center' },
    headerContainer: { alignItems: 'center', width: "80%", marginTop: 70 }, 
    pageTitle: { width: "80%", fontSize: 26, fontWeight: "bold", color: "#333", textAlign: "center", marginBottom: 20, borderWidth: 1, borderColor: '#ddd', borderRadius: 25, paddingVertical: 12, backgroundColor: '#fff' },
    controlsContainer: { flexDirection: "row", gap: 15, justifyContent: "center", alignItems: "center", width: '90%', paddingVertical: 10, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: "#eee", backgroundColor: "#fff", marginBottom: 5 },
    controlButton: { paddingVertical: 8, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", borderRadius: 6, flexShrink: 1,  },
    newNoticeButton: { paddingVertical: 16, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", borderRadius: 6, flexShrink: 1, width: 300, marginBottom: 15 },
    newNoticeButtonText: { color: '#ffffff' },
    newNoticeButtonContainer: {width: "100%", alignItems: 'center'},
    buttonContent: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
    buttonIcon: { marginRight: 5 },
    buttonText: { fontSize: 14, fontWeight: "600", textAlign: 'center' },
    listContainerStyle: { paddingHorizontal: 16, paddingBottom: 16, width: '100%', alignItems: 'center' },
    errorText: { textAlign: "center", fontSize: 16, marginVertical: 20, color: "red", paddingHorizontal: 20 },
    infoText: { textAlign: "center", fontSize: 16, marginVertical: 20, color: "#666", paddingHorizontal: 20 },

    adminButtonPlaceholder: {
      paddingVertical: 8,
      paddingHorizontal: 10,
      opacity: 0,

    }
});
