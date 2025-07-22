import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Globals } from "../../app/constants/Globals";
import EventCard from "@/components/EventCard";
import PaginatedListDisplay from "@/components/PaginatedListDisplay";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import Header from "@/components/Header";
import FlipButton from "@/components/FlipButton";
import StyledText from "@/components/StyledText";
import { useNotifications } from "@/context/NotificationsContext";

const ITEMS_PER_PAGE = 5;

// Defined outside the main component to prevent re-rendering on every state change
const ActivitiesListHeader = ({
  t,
  isRtl,
  searchTerm,
  setSearchTerm,
  isPermissionLoading,
  canInitiate,
  router,
  sortMode,
  handleToggleSort,
}) => (
  <>
    <View style={styles.plaqueContainer}>
      <StyledText style={styles.mainTitle}>
        {t("Events_ActivitiesTitle")}
      </StyledText>
    </View>

    {!isPermissionLoading && canInitiate && (
      <>
        <FlipButton
          onPress={() => router.push("/NewActivity")}
          style={styles.newActivityButton}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
            {t("Activities_AddNew")}
          </Text>
        </FlipButton>
        <FlipButton
          onPress={() => router.push("/(events)/MyActivities")}
          style={styles.myActivitiesButton}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
            {t("Activities_MyCreatedActivities")}
          </Text>
        </FlipButton>
      </>
    )}

    <FlipButton onPress={handleToggleSort} style={styles.sortButton}>
      <StyledText style={styles.sortButtonText}>
        {sortMode === "closest"
          ? t("Activities_SortByNewest", "Sort by Newest")
          : t("Activities_SortByClosest", "Sort by Closest")}
      </StyledText>
    </FlipButton>

    <FloatingLabelInput
      label={t("Common_SearchPlaceholder", "Search by name...")}
      value={searchTerm}
      onChangeText={setSearchTerm}
      style={styles.searchContainer}
      alignRight={isRtl}
    />
  </>
);

export default function ActivitiesScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const flatListRef = useRef(null);
  const isRtl = i18n.dir() === "rtl";

  const { updateLastVisited, isItemNew } = useNotifications();
  const [allActivities, setAllActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [canInitiate, setCanInitiate] = useState(false);
  const [isPermissionLoading, setIsPermissionLoading] = useState(true);

  const [sortMode, setSortMode] = useState("closest");

  const handleToggleSort = () => {
    setSortMode((prev) => (prev === "closest" ? "newest" : "closest"));
    setCurrentPage(1);
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        console.log("Events page unfocused, updating last visited time.");
        updateLastVisited("events");
      };
    }, [updateLastVisited])
  );

  const checkInitiatePermission = useCallback(async () => {
    setIsPermissionLoading(true);
    try {
      const storedToken = await AsyncStorage.getItem("jwt");
      const storedUserId = await AsyncStorage.getItem("userID");

      if (!storedToken || !storedUserId) {
        setCanInitiate(false);
        return;
      }

      const response = await fetch(
        `${
          Globals.API_BASE_URL
        }/api/Resident/CanInitiateActivity/${storedUserId.replace(/"/g, "")}`,
        {
          headers: { Authorization: `Bearer ${storedToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCanInitiate(data.canInitiate);
      } else {
        setCanInitiate(false);
      }
    } catch (err) {
      console.error("Failed to check activity initiation permission:", err);
      setCanInitiate(false);
    } finally {
      setIsPermissionLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchEvents = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`${Globals.API_BASE_URL}/api/events`);
          if (!response.ok)
            throw new Error(t("Errors_Event_Fetch", "Could not fetch events."));
          const data = await response.json();
          setAllActivities(data.activities || []);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchEvents();
      checkInitiatePermission();
    }, [t, checkInitiatePermission])
  );

  const filteredActivities = useMemo(() => {
    const sourceArray = allActivities;

    let filtered = sourceArray;
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = sourceArray.filter((c) =>
        c.eventName.toLowerCase().includes(lowercasedTerm)
      );
    }

    // ✅ Create a new array with the spread (...) operator before sorting
    return [...filtered].sort((a, b) => {
      const aIsNew = isItemNew("events", a.startDate);
      const bIsNew = isItemNew("events", b.startDate);
      if (aIsNew && !bIsNew) return -1;
      if (!aIsNew && bIsNew) return 1;

      if (sortMode === "closest") {
        return new Date(a.startDate) - new Date(b.startDate);
      } else {
        return new Date(b.startDate) - new Date(a.startDate);
      }
    });
  }, [allActivities, searchTerm, isItemNew, sortMode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
  const itemsForCurrentPage = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredActivities.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredActivities, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    }
  };

  if (isLoading && !allActivities.length) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <PaginatedListDisplay
        flatListRef={flatListRef}
        items={itemsForCurrentPage}
        ListHeaderComponent={
          <ActivitiesListHeader
            t={t}
            isRtl={isRtl}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isPermissionLoading={isPermissionLoading}
            canInitiate={canInitiate}
            router={router}
            sortMode={sortMode}
            handleToggleSort={handleToggleSort}
          />
        }
        listContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            isNew={isItemNew("events", item.startDate)}
            onPress={() =>
              router.push({
                pathname: "/EventFocus",
                params: { eventId: item.eventId },
              })
            }
          />
        )}
        itemKeyExtractor={(item) => item.eventId.toString()}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Text>
              {t("Activities_NoActivities", "No activities available.")}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fef1e6",
  },
  searchContainer: {
    marginBottom: 20,
  },
  sortButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  sortButtonText: {
    fontWeight: "bold",
    textAlign: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  listContainer: {
    paddingTop: 75,
    paddingHorizontal: 16,
    paddingBottom: 40,
    alignSelf: "center",
    width: "95%",
  },
  newActivityButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  myActivitiesButton: {
    backgroundColor: "#17a2b8",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  plaqueContainer: {
    width: "100%",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#dee2e6",
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
