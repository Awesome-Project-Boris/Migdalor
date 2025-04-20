import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useTransition,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

import NoticeCard from "../components/NoticeCard";
import Header from "@/components/Header";
import FlipButton from "../components/FlipButton";
import FilterModal from "../components/NoticeFilterModal";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { Globals } from "../app/constants/Globals";

const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEMS_PER_PAGE = 10;

const fetchNoticesAPI = async () => {
  console.log("Fetching notices from API...", Globals.API_BASE_URL, Date.now());
  const [noticesRes, categoriesRes] = await Promise.all([
    fetch(`${Globals.API_BASE_URL}/api/Notices`, { method: "GET" }),
    fetch(`${Globals.API_BASE_URL}/api/Categories`, { method: "GET" }),
  ]);

  if (!noticesRes.ok)
    throw new Error(`Failed to load notices: HTTP ${noticesRes.status}`);
  if (!categoriesRes.ok)
    throw new Error(`Failed to load categories: HTTP ${categoriesRes.status}`);

  // const rawNotices = await noticesRes.json();
  const notices = await noticesRes.json();
  const rawCategories = await categoriesRes.json();

  // const notices = rawNotices.map((n) => ({
  //   noticeId: n.noticeId,
  //   senderId: n.senderId,
  //   creationDate: n.creationDate,
  //   noticeTitle: n.noticeTitle,
  //   noticeMessage: n.noticeMessage,
  //   noticeCategory: n.noticeCategory,
  //   noticeSubCategory: n.noticeSubCategory || null,
  // }));

  const availableCategories = rawCategories.map((c) => c.categoryName);

  return { notices, totalCount: notices.length, availableCategories };
};

export default function NoticesScreen() {
  const { t } = useTranslation(); // Initialize translation hook
  const [allNotices, setAllNotices] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortOrder, setSortOrder] = useState("recent");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const router = useRouter();
  const flatListRef = useRef(null);

  useEffect(() => {
    const loadNotices = async () => {
      setIsLoading(true);
      try {
        const { notices, availableCategories } = await fetchNoticesAPI();
        setAllNotices(notices);
        setAllCategories(availableCategories);
        setCurrentPage(1);
        setSelectedCategories([]);
        setSortOrder("recent");
      } catch (error) {
        console.error("Failed to fetch notices:", error);
        setAllNotices([]);
        setAllCategories([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadNotices();
  }, []);

  ///////////////////////////////// LIVE REFRESH /////////////////////////////////

  // useEffect(() => {
  //   const intervalId = setInterval(async () => {
  //     try {
  //       const { notices } = await fetchNoticesAPI();
  //       setAllNotices(notices);
  //     } catch (err) {
  //       console.error("Polling notices failed:", err);
  //     }
  //   }, 3000);
  //   return () => clearInterval(intervalId);
  // }, []);

  ///////////////////////////////// LIVE REFRESH /////////////////////////////////

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const { notices, availableCategories } = await fetchNoticesAPI();
      setAllNotices(notices);
      setAllCategories(availableCategories);
      setCurrentPage(1);
      setSelectedCategories([]);
      setSortOrder("recent");
    } catch (err) {
      console.error("Failed to refresh notices:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const processedNotices = useMemo(() => {
    let filtered = [...allNotices];
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((n) =>
        selectedCategories.includes(n.noticeCategory)
      );
    }
    filtered.sort((a, b) => {
      const dateA = new Date(a.creationDate);
      const dateB = new Date(b.creationDate);
      if (sortOrder === "recent") {
        return dateB - dateA; // Newer dates first
      } else {
        return dateA - dateB; // Older dates first
      }
    });
    return filtered;
  }, [allNotices, selectedCategories, sortOrder]);

  const totalFilteredItems = processedNotices.length;
  const totalPages = Math.ceil(totalFilteredItems / ITEMS_PER_PAGE);

  const itemsForCurrentPage = useMemo(() => {
    const newTotal = Math.ceil(processedNotices.length / ITEMS_PER_PAGE);
    if (currentPage > newTotal && newTotal > 0)
      setTimeout(() => setCurrentPage(newTotal), 0);
    else if (currentPage === 0 && newTotal > 0)
      setTimeout(() => setCurrentPage(1), 0);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedNotices.slice(start, start + ITEMS_PER_PAGE);
  }, [processedNotices, currentPage]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === "recent" ? "oldest" : "recent"));
    setCurrentPage(1);
    flatListRef.current?.scrollToOffset({ animated: false, offset: 0 });
  }, []);

  const handleApplyFilter = useCallback((cats) => {
    setSelectedCategories(cats);
    setCurrentPage(1);
    setIsFilterModalVisible(false);
    flatListRef.current?.scrollToOffset({ animated: false, offset: 0 });
  }, []);

  const pagesToShow = useMemo(() => {
    const safeTotal = Math.max(1, totalPages);
    const maxPages = 3;
    const pages = [];
    if (safeTotal <= maxPages) {
      for (let i = 1; i <= safeTotal; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - Math.floor(maxPages / 2));
      let end = Math.min(safeTotal, start + maxPages - 1);
      if (end - start + 1 < maxPages) start = Math.max(1, end - maxPages + 1);
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  const goToPage = (pageNumber) => {
    const safeTotalPages = Math.max(1, totalPages);
    if (pageNumber >= 1 && pageNumber <= safeTotalPages) {
      setCurrentPage(pageNumber);
      flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    }
  };

  const renderItem = ({ item }) => (
    <NoticeCard
      data={item}
      onPress={() =>
        router.push({
          pathname: "/NoticeFocus",
          params: { noticeId: item.noticeId },
        })
      }
    />
  );

  return (
    <>
      <Header />

      <View style={styles.Head}>
        <Text style={styles.H1}>{t("NoticeBoardScreen_boardTitle")}</Text>
      </View>
      <View style={styles.container}>
        <View style={styles.controlsContainer}>
          <FlipButton
            onPress={() => setIsFilterModalVisible(true)}
            style={styles.controlButton}
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
              </Text>{" "}
            </View>
          </FlipButton>

          <FlipButton onPress={toggleSortOrder} style={styles.controlButton}>
            <View style={styles.buttonContent}>
              <Ionicons
                name={sortOrder === "recent" ? "arrow-down" : "arrow-up"} // Icon indicates direction data flows to
                size={20}
                color="black"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>
                {t("NoticeBoardScreen_filterLabel")}{" "}
                {sortOrder === "recent"
                  ? t("NoticeBoardScreen_sortOldest")
                  : t("NoticeBoardScreen_sortNewest")}
              </Text>
            </View>
          </FlipButton>
        </View>

        {isLoading && totalFilteredItems === 0 && (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.loadingIndicator}
          />
        )}
        {!isLoading && totalFilteredItems === 0 && (
          <View style={styles.centeredMessage}>
            <Text style={styles.noDataText}>
              {selectedCategories.length > 0
                ? t("NoticeBoardScreen_noMatchMessage")
                : t("NoticeBoardScreen_noNoticesMessage")}
            </Text>
          </View>
        )}

        {/* --- Notices List --- */}
        {totalFilteredItems > 0 && (
          <FlatList
            ref={flatListRef}
            data={itemsForCurrentPage}
            renderItem={renderItem}
            keyExtractor={(item) => item.noticeId.toString()}
            contentContainerStyle={styles.listContainer}
            refreshing={isRefreshing}
            onRefresh={onRefresh}
          />
        )}

        {!isLoading && totalPages > 1 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[
                styles.paginationButton,
                currentPage === 1 && styles.disabledButton,
              ]}
              onPress={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <Text style={styles.paginationButtonText}>
                {t("MarketplaceScreen_PreviousButton")}
              </Text>
            </TouchableOpacity>
            {pagesToShow.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.paginationButton,
                  p === currentPage && styles.activePaginationButton,
                ]}
                onPress={() => goToPage(p)}
                disabled={p === currentPage}
              >
                <Text
                  style={[
                    styles.paginationButtonText,
                    p === currentPage && styles.activePaginationButtonText,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.paginationButton,
                currentPage === totalPages && styles.disabledButton,
              ]}
              onPress={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <Text style={styles.paginationButtonText}>
                {t("MarketplaceScreen_NextButton")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

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
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    width: "100%",
    alignItems: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  controlButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
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
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignSelf: "center",
    width: SCREEN_WIDTH,
    maxWidth: SCREEN_WIDTH * 0.95,
    alignItems: "center"
  },
  loadingIndicator: { marginTop: 50 },
  centeredMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noDataText: { fontSize: 18, color: "#666", textAlign: "center" },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#f7f7f7",
    width: "100%",
  },
  paginationButton: {
    backgroundColor: "#ddd",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 4,
    borderRadius: 6,
    minWidth: 40,
    alignItems: "center",
  },
  paginationButtonText: { fontSize: 16, color: "#333" },
  activePaginationButton: { backgroundColor: "#007bff" },
  activePaginationButtonText: { color: "#fff", fontWeight: "bold" },
  disabledButton: { opacity: 0.5, backgroundColor: "#e9ecef" },
  H1: {
    width: "70%",
    marginTop: 70,
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 10,
  },
  Head: { alignItems: "center" },
});
