import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { View, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import NoticeCard from "../components/NoticeCard";
import Header from "@/components/Header";
import FlipButton from "../components/FlipButton";
import FilterModal from "../components/NoticeFilterModal";
import PaginatedListDisplay from "@/components/PaginatedListDisplay";
import StyledText from "@/components/StyledText";
import { useSettings } from "@/context/SettingsContext";
import { useNotifications } from "@/context/NotificationsContext";

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

const fetchCategories = async () => {
  const response = await fetch(`${Globals.API_BASE_URL}/api/Categories`);
  if (!response.ok) {
    throw new Error(`Failed to load categories: HTTP ${response.status}`);
  }
  const rawCategories = await response.json();
  return rawCategories || [];
};

export default function NoticesScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const flatListRef = useRef(null);
  const { settings } = useSettings();
  const useColumnLayout = settings.fontSizeMultiplier >= 2;
  const { updateLastVisited, isItemNew } = useNotifications();

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

  useFocusEffect(
    useCallback(() => {
      return () => {
        console.log("Notices unfocused, updating last visited time.");
        updateLastVisited("notices");
      };
    }, [updateLastVisited])
  );

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

  useEffect(() => {
    setCurrentPage(1);
    fetchNoticesCallback();
    fetchCategoriesCallback();
  }, [fetchNoticesCallback, fetchCategoriesCallback]);

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

  useFocusEffect(
    useCallback(() => {
      const intervalId = setInterval(() => {
        fetchNoticesCallback();
      }, 3000);
      return () => clearInterval(intervalId);
    }, [fetchNoticesCallback])
  );

  const processedNotices = useMemo(() => {
    if (!Array.isArray(allNotices)) {
      return [];
    }
    let filtered = [...allNotices];

    if (selectedCategories.length > 0) {
      const isRTL = i18n.dir() === "rtl";
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
      const aIsNew = isItemNew("notices", a.creationDate);
      const bIsNew = isItemNew("notices", b.creationDate);

      if (aIsNew && !bIsNew) return -1;
      if (!aIsNew && bIsNew) return 1;

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
      <View style={styles.cardContainer}>
        <NoticeCard
          data={item}
          isNew={isItemNew("notices", item.creationDate)} // Pass the isNew prop
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
      </View>
    ),
    [router, isItemNew]
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
    if (error)
      return (
        <StyledText style={styles.errorText}>{`Error: ${error}`}</StyledText>
      );
    if (selectedCategories.length > 0 && processedNotices.length === 0)
      return (
        <StyledText style={styles.infoText}>
          {t("NoticeBoardScreen_noMatchMessage")}
        </StyledText>
      );
    if (!isLoading && !error && allNotices.length === 0)
      return (
        <StyledText style={styles.infoText}>
          {t("NoticeBoardScreen_noNoticesMessage")}
        </StyledText>
      );
    return null;
  }, [isLoading, error, selectedCategories, allNotices, processedNotices, t]);

  const categoryNamesForFilter = useMemo(() => {
    const isRTL = i18n.dir() === "rtl";
    return allCategories.map((c) =>
      isRTL ? c.categoryHebName : c.categoryEngName
    );
  }, [allCategories, i18n.language]);

  const renderListHeader = () => (
    <View style={styles.headerFooterContainer}>
      <View style={styles.headerPlaque}>
        <StyledText style={styles.pageTitle}>
          {t("NoticeBoardScreen_boardTitle")}
        </StyledText>
      </View>

      {!isAdminLoading && isAdmin && (
        <View style={styles.newNoticeButtonContainer}>
          <FlipButton
            onPress={() => router.push("/NewNotice")}
            style={styles.newNoticeButton}
            bgColor="#007bff"
            textColor="#ffffff"
          >
            <Ionicons
              name="add-circle-outline"
              size={22}
              color="white"
              style={styles.buttonIcon}
            />
            <StyledText style={styles.newNoticeButtonText}>
              {t("NoticesScreen_NewNoticeButton")}
            </StyledText>
          </FlipButton>
        </View>
      )}

      <View style={styles.contentPlaque}>
        <View
          style={[
            styles.controlsContainer,
            useColumnLayout && styles.controlsColumn,
          ]}
        >
          <FlipButton
            onPress={() => setIsFilterModalVisible(true)}
            style={[
              styles.controlButton,
              useColumnLayout && styles.fullWidthButton,
            ]}
            disabled={isCategoryLoading}
          >
            <View style={styles.buttonContent}>
              <Ionicons
                name="filter"
                size={20}
                color="black"
                style={styles.buttonIcon}
              />
              <StyledText style={styles.buttonText}>
                {t("NoticeBoardScreen_filterButton")} (
                {selectedCategories.length > 0
                  ? selectedCategories.length
                  : t("NoticeBoardScreen_all")}
                )
              </StyledText>
            </View>
          </FlipButton>
          <FlipButton
            onPress={toggleSortOrder}
            style={[
              styles.controlButton,
              useColumnLayout && styles.fullWidthButton,
            ]}
          >
            <View style={styles.buttonContent}>
              <Ionicons
                name={sortOrder === "recent" ? "arrow-down" : "arrow-up"}
                size={20}
                color="black"
                style={styles.buttonIcon}
              />
              <StyledText style={styles.buttonText}>
                {t("NoticeBoardScreen_filterLabel")}{" "}
                {sortOrder === "recent"
                  ? t("NoticeBoardScreen_sortNewest")
                  : t("NoticeBoardScreen_sortOldest")}
              </StyledText>
            </View>
          </FlipButton>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <Header />
      <View style={styles.pageWrapper}>
        <PaginatedListDisplay
          items={itemsForCurrentPage}
          renderItem={renderNoticeItem}
          itemKeyExtractor={keyExtractor}
          isLoading={isLoading && allNotices.length === 0}
          ListEmptyComponent={CustomEmptyComponent}
          ListHeaderComponent={renderListHeader}
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
  pageWrapper: {
    flex: 1,
    backgroundColor: "#f7e7ce",
    alignItems: "center",
    paddingTop: 60,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa", // Light background for the list area
    paddingTop: 60,
  },
  headerFooterContainer: {
    paddingTop: 20,
  },
  headerPlaque: {
    width: "100%",
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
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  newNoticeButtonContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  newNoticeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "100%",
    maxWidth: 400,
  },
  newNoticeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  contentPlaque: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 10,
  },
  controlsContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  controlsColumn: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  controlButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    flexGrow: 1,
  },
  fullWidthButton: {
    width: "100%",
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
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  listContainerStyle: {
    paddingHorizontal: 10, // Reduced padding for wider content
    paddingBottom: 20,
  },
  cardContainer: {
    width: "100%",
    marginBottom: 15,
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
