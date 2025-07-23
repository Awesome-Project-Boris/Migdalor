import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Globals } from "@/app/constants/Globals";
import EventCard from "@/components/EventCard";
import PaginatedListDisplay from "@/components/PaginatedListDisplay";
import Header from "@/components/Header";
import StyledText from "@/components/StyledText";
import { useSettings } from "../context/SettingsContext"; // Import useSettings

const ITEMS_PER_PAGE = 5;

// Define filter types
const FILTER_TYPES = {
  ALL: "all",
  CHECKED: "checked",
  NOT_CHECKED: "not_checked",
};

export default function MyActivitiesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const flatListRef = useRef(null);
  const { settings } = useSettings(); // Get settings from context

  const [allActivities, setAllActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState(FILTER_TYPES.ALL);

  // Fetch data on screen focus
  useFocusEffect(
    useCallback(() => {
      const fetchInitialData = async () => {
        setIsLoading(true);
        try {
          const userId = (await AsyncStorage.getItem("userID"))?.replace(
            /"/g,
            ""
          );
          if (!userId) throw new Error("User ID not found.");

          const response = await fetch(
            `${Globals.API_BASE_URL}/api/events/creator/${userId}`
          );
          if (!response.ok) throw new Error("Could not fetch your activities.");

          const data = await response.json();
          setAllActivities(data || []);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchInitialData();
    }, [])
  );

  // Apply filters when activities or filter type change
  useEffect(() => {
    let newFilteredList = [];
    if (activeFilter === FILTER_TYPES.CHECKED) {
      newFilteredList = allActivities.filter(
        (event) => event.participationChecked
      );
    } else if (activeFilter === FILTER_TYPES.NOT_CHECKED) {
      newFilteredList = allActivities.filter(
        (event) => !event.participationChecked
      );
    } else {
      newFilteredList = allActivities;
    }
    setFilteredActivities(newFilteredList);
    setCurrentPage(1); // Reset to first page on filter change
  }, [allActivities, activeFilter]);

  // Pagination logic based on the filtered list
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

  // Responsive button container style
  const buttonContainerStyle = {
    flexDirection: settings.textSizeMultiplier >= 2 ? "column" : "row",
    gap: settings.textSizeMultiplier >= 2 ? 10 : 0,
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  };

  const ListHeader = () => (
    <View style={styles.plaqueContainer}>
      <StyledText style={styles.mainTitle}>
        {t("Activities_MyCreatedActivities")}
      </StyledText>

      {/* Filter Buttons */}
      <View style={buttonContainerStyle}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === FILTER_TYPES.CHECKED && styles.activeButton,
          ]}
          onPress={() => setActiveFilter(FILTER_TYPES.CHECKED)}
        >
          <Text style={styles.buttonText}>
            {t("MyActivities_ParticipationChecked")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === FILTER_TYPES.NOT_CHECKED && styles.activeButton,
          ]}
          onPress={() => setActiveFilter(FILTER_TYPES.NOT_CHECKED)}
        >
          <Text style={styles.buttonText}>
            {t("MyActivities_ParticipationNotChecked")}
          </Text>
        </TouchableOpacity>
      </View>
      {activeFilter !== FILTER_TYPES.ALL && (
        <TouchableOpacity onPress={() => setActiveFilter(FILTER_TYPES.ALL)}>
          <Text style={styles.clearFilterText}>
            {t("MyActivities_ClearFilter")}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header />
      <PaginatedListDisplay
        flatListRef={flatListRef}
        items={itemsForCurrentPage}
        ListHeaderComponent={ListHeader}
        listContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <EventCard
            event={item}
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
            <Text>{t("Activities_NoActivitiesFound")}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fef1e6" },
  listContainer: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 40,
    width: "100%",
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
    marginTop: 60,
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#e9ecef",
    borderWidth: 1,
    borderColor: "#ced4da",
  },
  activeButton: {
    backgroundColor: "#007bff",
    borderColor: "#0056b3",
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#495057",
  },
  clearFilterText: {
    color: "#dc3545",
    marginTop: 10,
    fontWeight: "bold",
  },
});
