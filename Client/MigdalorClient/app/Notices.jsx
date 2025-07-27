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
  ActivityIndicator,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Toast } from "toastify-react-native";

// --- All Original and New Component Imports ---
import Header from "@/components/Header";
import NoticeCard from "../components/NoticeCard";
import FlipButton from "../components/FlipButton";
import PaginatedListDisplay from "@/components/PaginatedListDisplay";
import StyledText from "@/components/StyledText";
import InterestChip from "@/components/InterestChip";
import NoticeCategorySheet from "@/components/NoticeCategorySheet";
import NoticesCategoryFilterModal from "@/components/NoticesCategoryFilterModal";

import { useSettings } from "@/context/SettingsContext";
import { useNotifications } from "@/context/NotificationsContext";
import { ReadNoticeTracker } from "@/utils/ReadNoticeTracker";
import { Globals } from "../app/constants/Globals";

const ITEMS_PER_PAGE = 10;

export default function NoticesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const flatListRef = useRef(null);
  const bottomSheetRef = useRef(null);
  const { settings } = useSettings();

  const hasSetInitialCategories = useRef(false);

  const useColumnLayout = settings.fontSizeMultiplier >= 2;
  const { updateLastVisited, isItemNew } = useNotifications();

  // --- All of your original state is preserved ---
  const [allNotices, setAllNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const [allCategories, setAllCategories] = useState([]);

  // --- New state for our new features ---
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [subscribedCategories, setSubscribedCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [sortOrder, setSortOrder] = useState("recent");
  const [readNoticeIds, setReadNoticeIds] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState(new Map());

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const residentId = await AsyncStorage.getItem("userID");
      if (!residentId) {
        throw new Error("User not found for fetching subscriptions.");
      }

      const [categoriesRes, allCategoriesRes, readIds] = await Promise.all([
        fetch(
          `${Globals.API_BASE_URL}/api/Resident/subscriptions/${residentId}`
        ),
        fetch(`${Globals.API_BASE_URL}/api/Categories`),
        ReadNoticeTracker.getReadNoticeIds(),
      ]);

      if (!categoriesRes.ok)
        throw new Error("Failed to fetch user subscriptions.");
      const categoriesData = await categoriesRes.json();
      const userSubscribed = categoriesData.filter((c) => c.isSubscribed);

      if (!allCategoriesRes.ok)
        throw new Error("Failed to fetch categories list.");
      const allCategoriesData = await allCategoriesRes.json();
      setAllCategories(allCategoriesData);

      let categoriesToFetch = Array.from(selectedCategories);

      // ✅ THE FIX: This block now uses the ref to ensure it only runs ONCE.
      if (
        !hasSetInitialCategories.current &&
        selectedCategories.size === 0 &&
        userSubscribed.length > 0
      ) {
        const initialSelection = new Set(
          userSubscribed.map((c) => c.categoryHebName)
        );
        setSelectedCategories(initialSelection);
        categoriesToFetch = Array.from(initialSelection); // Use the new selection for the current fetch
        hasSetInitialCategories.current = true; // Set the flag so this never runs again
      }

      let noticesData = [];
      if (categoriesToFetch.length > 0) {
        const noticesResponse = await fetch(
          `${Globals.API_BASE_URL}/api/Notices/filtered`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              categories: categoriesToFetch,
              sortOrder: sortOrder,
            }),
          }
        );
        if (!noticesResponse.ok) throw new Error("Failed to fetch notices");
        noticesData = await noticesResponse.json();
      }

      const newUnreadCounts = new Map();
      for (const notice of noticesData) {
        if (!readIds.has(notice.noticeId)) {
          const currentCount = newUnreadCounts.get(notice.noticeCategory) || 0;
          newUnreadCounts.set(notice.noticeCategory, currentCount + 1);
        }
      }

      setSubscribedCategories(userSubscribed);
      setAllNotices(noticesData || []);
      setReadNoticeIds(readIds);
      setUnreadCounts(newUnreadCounts);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err.message || "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategories, sortOrder]); // ✅ The dependency array is correct now

  const isInitialMount = useRef(true);

  const getTranslatedCategoryName = useCallback(
    (hebName) => {
      if (allCategories.length === 0) return hebName;
      const category = allCategories.find((c) => c.categoryHebName === hebName);
      if (!category) return hebName;

      // ✅ Use settings.language for the check
      return settings.language === "en"
        ? category.categoryEngName
        : category.categoryHebName;
    },
    [allCategories, settings.language] // ✅ Update the dependency array
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      // Any subsequent change to filters will trigger a refetch
      fetchData();
    }
  }, [selectedCategories, sortOrder]);

  // ✅ This hook now correctly calls our new, powerful fetchData function every time the screen is focused.
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // ✅ Your original admin check logic is preserved entirely.
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
          `${Globals.API_BASE_URL}/api/People/isadmin/${currentUserId}` // Corrected URL based on your original
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

  // ✅ Your original logic for updating last visited time is preserved.
  useFocusEffect(
    useCallback(() => {
      return () => {
        updateLastVisited("notices");
      };
    }, [updateLastVisited])
  );

  const handleMarkAllRead = async () => {
    // Get the IDs of all notices currently being displayed
    const idsToMark = allNotices.map((n) => n.noticeId);
    if (idsToMark.length === 0) return;

    // Call the function in the tracker to save the data
    await ReadNoticeTracker.markMultipleAsRead(idsToMark);

    // --- Start UI Refresh Logic ---

    // 1. Create the new, complete set of read IDs for immediate use
    const newReadIds = new Set([...readNoticeIds, ...idsToMark]);
    setReadNoticeIds(newReadIds);

    // 2. Recalculate the unread counts using the fresh data
    const newUnreadCounts = new Map();
    for (const notice of allNotices) {
      // We check against the NEW set of read IDs. Since we just marked all
      // visible notices as read, this check will always be false for them.
      if (!newReadIds.has(notice.noticeId)) {
        const currentCount = newUnreadCounts.get(notice.noticeCategory) || 0;
        newUnreadCounts.set(notice.noticeCategory, currentCount + 1);
      }
    }
    setUnreadCounts(newUnreadCounts);

    Toast.show({
      type: "success",
      text1: t(
        "Notices_MarkAllReadSuccess",
        "All visible notices marked as read"
      ),
      position: "bottom",
    });
  };

  const ListHeader = useMemo(() => {
    return (
      <>
        <View style={styles.contentPlaque}>
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

        <View style={styles.controlsContainer}>
          <FlipButton
            style={styles.fullWidthButton}
            onPress={handleMarkAllRead}
            bgColor="#3d3d3d" // A neutral secondary color
            textColor="#fdfdfd"
          >
            <Ionicons
              name="checkmark-done"
              size={22}
              color="#FFFFFF"
              style={styles.buttonIcon}
            />
            <StyledText style={styles.filterButtonText}>
              {t("Notices_MarkAllRead", "Mark All as Read")}
            </StyledText>
          </FlipButton>

          <FlipButton
            style={styles.fullWidthButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons
              name="filter"
              size={22}
              color="#FFFFFF"
              style={styles.buttonIcon}
            />
            <StyledText style={styles.filterButtonText}>
              {t("Notices_FilterButton", "סינון לפי קטגוריה")}
            </StyledText>
          </FlipButton>
          <View
            style={[
              styles.sortContainer,
              useColumnLayout && styles.sortContainerColumn,
            ]}
          >
            <FlipButton
              style={styles.sortButton}
              bgColor={sortOrder === "recent" ? "#007AFF" : "#e5e5ea"}
              onPress={() => {
                setSortOrder("recent");
                setCurrentPage(1);
              }}
            >
              <StyledText
                style={{
                  color: sortOrder === "recent" ? "#FFFFFF" : "#000000",
                  fontWeight: "600",
                }}
              >
                {t("Notices_SortNewest", "מהחדש לישן")}
              </StyledText>
            </FlipButton>
            <FlipButton
              style={styles.sortButton}
              bgColor={sortOrder === "oldest" ? "#007AFF" : "#e5e5ea"}
              onPress={() => {
                setSortOrder("oldest");
                setCurrentPage(1);
              }}
            >
              <StyledText
                style={{
                  color: sortOrder === "oldest" ? "#FFFFFF" : "#000000",
                  fontWeight: "600",
                }}
              >
                {t("Notices_SortOldest", "מהישן לחדש")}
              </StyledText>
            </FlipButton>
          </View>

          <View style={styles.subHeaderPlaque}>
            <StyledText style={styles.chipsHeaderTitle}>
              {t(
                "Notices_ChipsHeaderTitle",
                "Categories shown (unread messages)"
              )}
            </StyledText>
          </View>

          <View style={styles.chipsOuterContainer}>
            {/* ✅ Conditional Rendering */}
            {selectedCategories.size > 0 ? (
              <View style={styles.chipsInnerContainer}>
                {[...selectedCategories].map((categoryName) => (
                  <InterestChip
                    key={categoryName}
                    label={`${getTranslatedCategoryName(categoryName)} (${
                      unreadCounts.get(categoryName) || 0
                    })`}
                    mode="display"
                  />
                ))}
              </View>
            ) : (
              <StyledText style={styles.noSelectionText}>
                {t(
                  "Notices_NoCategoriesSelected",
                  "Select categories from the button above to show messages."
                )}
              </StyledText>
            )}
          </View>

          <View style={styles.subHeaderPlaque}>
            <StyledText style={styles.listHeaderTitle}>
              {t("Notices_ListHeaderTitle", "Notices")}
            </StyledText>
          </View>
        </View>
      </>
    );
  }, [
    isAdmin,
    isAdminLoading,
    sortOrder,
    t,
    router,
    useColumnLayout,
    selectedCategories,
    unreadCounts,
  ]);

  const itemsForCurrentPage = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return allNotices.slice(start, start + ITEMS_PER_PAGE);
  }, [allNotices, currentPage]);

  useEffect(() => {
    const newTotalPages = Math.max(
      1,
      Math.ceil(allNotices.length / ITEMS_PER_PAGE)
    );
    if (currentPage > newTotalPages) {
      setCurrentPage(1);
    }
  }, [allNotices, currentPage]);

  const handlePageChange = useCallback(
    (newPage) => {
      const totalPages = Math.max(
        1,
        Math.ceil(allNotices.length / ITEMS_PER_PAGE)
      );
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
      }
    },
    [allNotices.length]
  );

  // In Notices.jsx, replace the renderNoticeItem function

  const renderNoticeItem = useCallback(
    ({ item }) => {
      // Create a new notice object with the translated category name
      const itemWithTranslatedCategory = {
        ...item,
        noticeCategory: getTranslatedCategoryName(item.noticeCategory),
      };

      return (
        <View style={styles.cardContainer}>
          <NoticeCard
            data={itemWithTranslatedCategory}
            isNew={isItemNew("notices", item.creationDate)}
            isRead={readNoticeIds.has(item.noticeId)}
            onPress={() =>
              router.push({
                pathname: "/NoticeFocus",
                params: {
                  notice: JSON.stringify(item),
                  allCategories: JSON.stringify(allCategories),
                },
              })
            }
          />
        </View>
      );
    },
    [router, isItemNew, readNoticeIds, allCategories, getTranslatedCategoryName]
  );

  // ✅ Your original empty component logic is preserved.
  const CustomEmptyComponent = useMemo(() => {
    if (isLoading)
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
    if (allNotices.length === 0)
      return (
        <StyledText style={styles.infoText}>
          {t("NoticeBoardScreen_noMatchMessage")}
        </StyledText>
      );
    return null;
  }, [isLoading, error, allNotices, t]);

  return (
    <>
      <Header />
      <View style={styles.pageWrapper}>
        <PaginatedListDisplay
          items={itemsForCurrentPage}
          renderItem={renderNoticeItem}
          itemKeyExtractor={(item) => item.noticeId.toString()}
          isLoading={isLoading}
          ListEmptyComponent={CustomEmptyComponent}
          currentPage={currentPage}
          totalPages={Math.ceil(allNotices.length / ITEMS_PER_PAGE)}
          onPageChange={handlePageChange}
          flatListRef={flatListRef}
          listContainerStyle={styles.listContainerStyle}
          // 👇 This is the crucial step that adds your new header
          ListHeaderComponent={ListHeader}
        />
      </View>
      {/* <NoticeCategorySheet
        ref={bottomSheetRef}
        subscribedCategories={subscribedCategories}
        selectedCategories={selectedCategories}
        onSelectionChange={setSelectedCategories}
        onApply={() => {
          setCurrentPage(1);
          bottomSheetRef.current?.close();
        }}
      /> */}
      <NoticesCategoryFilterModal
        visible={isFilterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        subscribedCategories={subscribedCategories}
        selectedCategories={selectedCategories}
        onSelectionChange={setSelectedCategories}
        allCategories={allCategories}
      />
    </>
  );
}

const styles = StyleSheet.create({
  pageWrapper: {
    flex: 1,
    backgroundColor: "#f7e7ce",
  },
  contentPlaque: {
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#dee2e6",
    padding: 20,
    marginHorizontal: 15,
    marginTop: 15,
    alignItems: "center",
    marginTop: 80,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
  },
  newNoticeButtonContainer: {
    alignItems: "center",
    marginHorizontal: 15,
    marginTop: 15,
  },
  newNoticeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    width: "100%",
  },
  newNoticeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  controlsContainer: {
    padding: 15,
    gap: 15,
    backgroundColor: "#f7e7ce",
  },
  fullWidthButton: {
    width: "100%",
    flexDirection: "row",
  },
  filterButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  buttonIcon: {
    marginRight: 8,
  },
  sortContainer: {
    flexDirection: "row",
    gap: 10,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 14,
  },
  chipsOuterContainer: {
    paddingVertical: 12,
    paddingHorizontal: 15, // Padding is moved to the outer container
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e5e5ea",
  },
  chipsInnerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    // Reduced from 8 to make them tighter
  },
  listContainerStyle: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  cardContainer: {
    width: "100%",
    marginBottom: 15,
    alignItems: "center",
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
    marginVertical: 20,
    color: "red",
  },
  infoText: {
    textAlign: "center",
    fontSize: 16,
    marginVertical: 20,
    color: "#666",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  sortContainerColumn: {
    flexDirection: "column",
  },
  noSelectionText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
    padding: 10,
  },
  // In Notices.jsx styles

  subHeaderPlaque: {
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#dee2e6",
    padding: 15, // Slightly less padding than the main title
    marginHorizontal: 15,
    marginTop: 15,
    alignItems: "center",
  },
  chipsHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center", // ✅ Center the text
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center", // ✅ Center the text
  },
});
