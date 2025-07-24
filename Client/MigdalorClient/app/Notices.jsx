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
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

// --- All Original and New Component Imports ---
import Header from "@/components/Header";
import NoticeCard from "../components/NoticeCard";
import FlipButton from "../components/FlipButton";
import PaginatedListDisplay from "@/components/PaginatedListDisplay";
import StyledText from "@/components/StyledText";
import InterestChip from "@/components/InterestChip"; // ✅ Using your InterestChip component
import NoticeCategorySheet from "@/components/NoticeCategorySheet"; // ✅ The new BottomSheet
import { useSettings } from "@/context/SettingsContext";
import { useNotifications } from "@/context/NotificationsContext";
import { ReadNoticeTracker } from "@/utils/ReadNoticeTracker"; // ✅ Using the correct path
import { Globals } from "../app/constants/Globals";

const ITEMS_PER_PAGE = 10;

export default function NoticesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const flatListRef = useRef(null);
  const bottomSheetRef = useRef(null); // ✅ Ref for the new BottomSheet
  const { settings } = useSettings();
  const useColumnLayout = settings.fontSizeMultiplier >= 2;
  const { updateLastVisited, isItemNew } = useNotifications();

  // --- All of your original state is preserved ---
  const [allNotices, setAllNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  // --- New state for our new features ---
  const [subscribedCategories, setSubscribedCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [sortOrder, setSortOrder] = useState("recent"); // ✅ Changed to match your "recent" / "oldest" convention
  const [readNoticeIds, setReadNoticeIds] = useState(new Set());

  // ✅ This new, unified fetchData function replaces your separate fetch functions.
  // It's designed to be called whenever filters change or the screen comes into focus.
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // ✅ START: THE FIX IS HERE
      // We now get the residentId directly, just like in your original isAdmin check.
      const residentId = await AsyncStorage.getItem("userID");
      if (!residentId) {
        throw new Error("User not found for fetching subscriptions.");
      }

      const [categoriesRes, readIds] = await Promise.all([
        fetch(
          `${Globals.API_BASE_URL}/api/Resident/subscriptions/${residentId}`
        ),
        ReadNoticeTracker.getReadNoticeIds(),
      ]);
      if (!categoriesRes.ok)
        throw new Error("Failed to fetch user subscriptions.");
      const categoriesData = await categoriesRes.json();
      const userSubscribed = categoriesData.filter((c) => c.isSubscribed);

      console.log("This is residents categories: ", categoriesData);
      console.log(
        "This is the residents categories after the filter: ",
        userSubscribed
      );

      setSubscribedCategories(userSubscribed);
      setReadNoticeIds(readIds);

      let currentSelection = selectedCategories;
      if (selectedCategories.size === 0 && userSubscribed.length > 0) {
        const initialSelected = new Set(
          userSubscribed.map((c) => c.categoryHebName)
        );
        setSelectedCategories(initialSelected);
        currentSelection = initialSelected;
      }

      const categoriesToFetch = Array.from(currentSelection);

      if (categoriesToFetch.length > 0) {
        const response = await fetch(
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
        if (!response.ok) throw new Error("Failed to fetch notices");
        const noticesData = await response.json();

        console.log("Filtered notices: ", noticesData);

        setAllNotices(noticesData || []);
      } else {
        setAllNotices([]);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err.message || "An unknown error occurred");
    } finally {
      setIsLoading(false);
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

  // ✅ This complex client-side filtering logic is now obsolete and has been removed.
  // The server handles all filtering and sorting, making the app much more efficient.

  // ✅ Your original pagination logic is preserved and now works on the server-filtered data.
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

  // ✅ New helper function to get unread counts for the chips.
  const getUnreadCountForCategory = (categoryName) => {
    // This still runs on the client, but on a much smaller, pre-filtered list of notices.
    return allNotices.filter(
      (n) =>
        n.categoryHebName === categoryName && !readNoticeIds.has(n.noticeId)
    ).length;
  };

  // ✅ Your original renderItem is preserved and enhanced with the `isRead` prop.
  const renderNoticeItem = useCallback(
    ({ item }) => (
      <View style={styles.cardContainer}>
        <NoticeCard
          data={item}
          isNew={isItemNew("notices", item.creationDate)} // Preserved
          isRead={readNoticeIds.has(item.noticeId)} // New
          onPress={() =>
            router.push({
              pathname: "/NoticeFocus",
              params: { notice: JSON.stringify(item) }, // Simplified params to pass the whole object
            })
          }
        />
      </View>
    ),
    [router, isItemNew, readNoticeIds]
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

  // --- JSX Structure ---
  // The JSX below preserves your original layout (`pageWrapper`, `contentPlaque`, etc.)
  // while integrating the new UI controls (Filter/Sort buttons and Chips).
  return (
    <>
      <Header />
      <View style={styles.pageWrapper}>
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

        {/* ✅ START: New Controls Section */}
        <View style={styles.controlsContainer}>
          <FlipButton
            style={styles.fullWidthButton}
            onPress={() => bottomSheetRef.current?.expand()}
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
          <View style={styles.sortContainer}>
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
        </View>
        {/* ✅ END: New Controls Section */}

        {/* ✅ START: New Dynamic Chips Section */}
        <View style={styles.chipsOuterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScrollContainer}
          >
            {[...selectedCategories].map((categoryName) => (
              <InterestChip
                key={categoryName}
                label={`${categoryName} (${getUnreadCountForCategory(
                  categoryName
                )})`}
                mode="display" // Using the display mode of your chip
              />
            ))}
          </ScrollView>
        </View>
        {/* ✅ END: New Dynamic Chips Section */}

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
        />
      </View>

      {/* ✅ The new BottomSheet is added here, replacing your old FilterModal */}
      <NoticeCategorySheet
        ref={bottomSheetRef}
        subscribedCategories={subscribedCategories}
        selectedCategories={selectedCategories}
        onSelectionChange={setSelectedCategories}
        onApply={() => {
          setCurrentPage(1); // Reset page when applying filters
          bottomSheetRef.current?.close();
        }}
      />
    </>
  );
}

// ✅ I have merged the new styles with your existing stylesheet.
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
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e5e5ea",
  },
  chipsScrollContainer: {
    paddingHorizontal: 15,
    gap: 8,
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
});
