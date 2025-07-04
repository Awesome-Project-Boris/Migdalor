import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
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

// --- Fetch Functions ---
const fetchNotices = async () => {
  const response = await fetch(`${Globals.API_BASE_URL}/api/Notices`);
  if (!response.ok) {
    throw new Error(`Failed to load notices: HTTP ${response.status}`);
  }
  const notices = await response.json();
  return notices || [];
};

/**
 * Fetches the full list of category objects from the server.
 * Each object contains both Hebrew and English names.
 */
const fetchCategories = async () => {
  const response = await fetch(`${Globals.API_BASE_URL}/api/Categories`);
  if (!response.ok) {
    throw new Error(`Failed to load categories: HTTP ${response.status}`);
  }
  // Returns the full array of category objects, e.g., [{ categoryHebName, categoryEngName, ... }]
  const rawCategories = await response.json();
  return rawCategories || [];
};

export default function NoticesScreen() {
  const { t, i18n } = useTranslation(); // Get i18n for language detection
  const router = useRouter();
  const flatListRef = useRef(null);

  const [allNotices, setAllNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  // allCategories will now store the full category objects
  const [allCategories, setAllCategories] = useState([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState(null);
  // selectedCategories will store the names in the currently displayed language
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

  // Effect to Check Admin Status
  useEffect(() => {
    const checkAdminStatus = async () => {
      let currentUserId = null;
      try {
        currentUserId = await AsyncStorage.getItem("userID");
        if (!currentUserId) {
          setIsAdmin(false);
          setIsAdminLoading(false);
          return;
        }
      } catch (storageError) {
        setIsAdmin(false);
        setIsAdminLoading(false);
        return;
      }

      setIsAdminLoading(true);
      try {
        const response = await fetch(
          `${Globals.API_BASE_URL}/api/People/isadmin/${currentUserId}`
        );
        if (!response.ok) {
          throw new Error("Failed to verify admin status");
        }
        const isAdminResult = await response.json();
        setIsAdmin(
          typeof isAdminResult.isAdmin === "boolean"
            ? isAdminResult.isAdmin
            : false
        );
      } catch (err) {
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

  // Filtering & sorting logic
  const processedNotices = useMemo(() => {
    if (!Array.isArray(allNotices)) {
      return [];
    }
    let filtered = [...allNotices];

    if (selectedCategories.length > 0) {
      const isRTL = i18n.dir() === "rtl";
      // The notice data (`n.noticeCategory`) uses the Hebrew name as the key.
      // If the user selected English names, we must convert them to their Hebrew equivalents to filter correctly.
      const selectedHebrewNames = isRTL
        ? selectedCategories
        : selectedCategories
            .map((engName) => {
              const cat = allCategories.find(
                (c) => c.categoryEngName === engName
              );
              return cat ? cat.categoryHebName : null;
            })
            .filter(Boolean);

      filtered = filtered.filter(
        (n) =>
          n.noticeCategory && selectedHebrewNames.includes(n.noticeCategory)
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
  }, [allNotices, selectedCategories, sortOrder, allCategories, i18n.language]);

  const totalItems = processedNotices.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const itemsForCurrentPage = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedNotices.slice(start, start + ITEMS_PER_PAGE);
  }, [processedNotices, currentPage]);

  useEffect(() => {
    const newTotalPages = Math.max(
      1,
      Math.ceil(processedNotices.length / ITEMS_PER_PAGE)
    );
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  }, [processedNotices, currentPage]);

  const handlePageChange = useCallback(
    (newPage) => {
      const safeTotalPages = Math.max(1, totalPages);
      if (newPage >= 1 && newPage <= safeTotalPages) {
        setCurrentPage(newPage);
        flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
      }
    },
    [totalPages]
  );

  const toggleSortOrder = useCallback(() => {
    setCurrentPage(1);
    setSortOrder((prev) => (prev === "recent" ? "oldest" : "recent"));
  }, []);

  const handleApplyFilter = useCallback((cats) => {
    setCurrentPage(1);
    setSelectedCategories(cats);
    setIsFilterModalVisible(false);
  }, []);

  const renderNoticeItem = useCallback(
    ({ item }) => (
      <NoticeCard
        data={item}
        onPress={() =>
          router.push({
            pathname: "/NoticeFocus",
            params: {
              noticeId: item.noticeId,
              senderNameHeb: item.senderNameHeb,
              senderNameEng: item.senderNameEng,
            },
          })
        }
      />
    ),
    [router]
  );

  const keyExtractor = useCallback((item) => item.noticeId.toString(), []);

  const CustomEmptyComponent = useMemo(() => {
    if (isLoading && allNotices.length === 0)
      return (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={{ marginTop: 50 }}
        />
      );
    if (error) return <Text style={styles.errorText}>{`Error: ${error}`}</Text>;
    if (selectedCategories.length > 0 && processedNotices.length === 0)
      return (
        <Text style={styles.infoText}>
          {t("NoticeBoardScreen_noMatchMessage")}
        </Text>
      );
    if (!isLoading && !error && allNotices.length === 0)
      return (
        <Text style={styles.infoText}>
          {t("NoticeBoardScreen_noNoticesMessage")}
        </Text>
      );
    return null;
  }, [isLoading, error, selectedCategories, allNotices, processedNotices, t]);

  // Create a list of category names (string[]) for the filter modal based on language
  const categoryNamesForFilter = useMemo(() => {
    const isRTL = i18n.dir() === "rtl";
    return allCategories.map((c) =>
      isRTL ? c.categoryHebName : c.categoryEngName
    );
  }, [allCategories, i18n.language]);

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
              onPress={() => router.push("/NewNotice")}
              style={styles.newNoticeButton}
              bgColor="#ffffff"
              textColor="#000000"
            >
              <Ionicons
                name="add-circle-outline"
                size={20}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, styles.newNoticeButtonText]}>
                {t("NoticesScreen_NewNoticeButton")}
              </Text>
            </FlipButton>
          </View>
        )}
        <View style={styles.controlsContainer}>
          <FlipButton
            onPress={() => setIsFilterModalVisible(true)}
            style={styles.controlButton}
            disabled={isCategoryLoading}
          >
            <View style={styles.buttonContent}>
              <Ionicons
                name="filter"
                size={20}
                color="black"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>
                {t("NoticeBoardScreen_filterButton")} (
                {selectedCategories.length > 0
                  ? selectedCategories.length
                  : t("NoticeBoardScreen_all")}
                )
              </Text>
            </View>
          </FlipButton>
          <FlipButton onPress={toggleSortOrder} style={styles.controlButton}>
            <View style={styles.buttonContent}>
              <Ionicons
                name={sortOrder === "recent" ? "arrow-down" : "arrow-up"}
                size={20}
                color="black"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>
                {t("NoticeBoardScreen_filterLabel")}{" "}
                {sortOrder === "recent"
                  ? t("NoticeBoardScreen_sortNewest")
                  : t("NoticeBoardScreen_sortOldest")}
              </Text>
            </View>
          </FlipButton>
          {isAdminLoading && <View style={styles.adminButtonPlaceholder} />}
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
          flatListRef={flatListRef}
          listContainerStyle={styles.listContainerStyle}
        />

        <FilterModal
          visible={isFilterModalVisible}
          onClose={() => setIsFilterModalVisible(false)}
          allCategories={categoryNamesForFilter}
          initialSelectedCategories={selectedCategories}
          onApply={handleApplyFilter}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  pageContainer: { flex: 1, backgroundColor: "#f7f7f7", alignItems: "center" },
  headerContainer: { alignItems: "center", width: "80%", marginTop: 70 },
  pageTitle: {
    width: "80%",
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  controlsContainer: {
    flexDirection: "row",
    gap: 15,
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
    marginBottom: 5,
  },
  controlButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
    flexShrink: 1,
  },
  newNoticeButton: {
    paddingVertical: 16,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
    flexShrink: 1,
    width: 300,
    marginBottom: 15,
  },
  newNoticeButtonText: { color: "#ffffff" },
  newNoticeButtonContainer: { width: "100%", alignItems: "center" },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: { marginRight: 5 },
  buttonText: { fontSize: 14, fontWeight: "600", textAlign: "center" },
  listContainerStyle: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    width: "100%",
    alignItems: "center",
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

  adminButtonPlaceholder: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    opacity: 0,
  },
});
