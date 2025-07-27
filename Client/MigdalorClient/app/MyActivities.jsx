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
import FlipButton from "@/components/FlipButton";

import { useSettings } from "../context/SettingsContext";

const ITEMS_PER_PAGE = 5;

const FILTER_TYPES = {
  ALL: "all",
  CHECKED: "checked",
  NOT_CHECKED: "not_checked",
  NO_PARTICIPATION: "no_participation",
};

export default function MyActivitiesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const flatListRef = useRef(null);
  const { settings } = useSettings();

  const [allActivities, setAllActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState(FILTER_TYPES.ALL);

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
    }, []) // The empty dependency array is crucial and correct here.
  );

  useEffect(() => {
    console.log(
      "Filtering activities. Data:",
      JSON.stringify(allActivities, null, 2)
    );

    let newFilteredList = [];
    if (activeFilter === FILTER_TYPES.CHECKED) {
      // Only show events explicitly marked as checked
      newFilteredList = allActivities.filter(
        (event) => event.participationChecked
      );
    } else if (activeFilter === FILTER_TYPES.NOT_CHECKED) {
      // Only show events not checked AND that had potential participants
      newFilteredList = allActivities.filter(
        (event) => !event.participationChecked && event.participantsCount > 0
      );
    } else if (activeFilter === FILTER_TYPES.NO_PARTICIPATION) {
      newFilteredList = allActivities.filter(
        (event) => Number(event.participantsCount) === 0
      );
    } else {
      // Default case: show all activities
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

  const buttonContainerStyle = useMemo(
    () => ({
      flexDirection: "column",
      gap: settings.textSizeMultiplier >= 2 ? 15 : 20,
      justifyContent: "space-around",
      width: "100%",
      marginBottom: 20,
    }),
    [settings.textSizeMultiplier]
  );

  const handleCardPress = useCallback(
    (eventId) => {
      router.push({
        pathname: "/EventFocus",
        params: { eventId },
      });
    },
    [router]
  );

  const handleFilterChange = useCallback((filterType) => {
    setActiveFilter(filterType);
  }, []);

  // In MyActivities.jsx

  // In MyActivities.jsx, inside the MyActivitiesScreen component

  const ListHeaderComponent = useCallback(() => {
    const isCheckedActive = activeFilter === FILTER_TYPES.CHECKED;
    const isNotCheckedActive = activeFilter === FILTER_TYPES.NOT_CHECKED;
    const isNoParticipationActive =
      activeFilter === FILTER_TYPES.NO_PARTICIPATION;

    return (
      <View style={styles.plaqueContainer}>
        <StyledText style={styles.mainTitle}>
          {t("Activities_MyCreatedActivities")}
        </StyledText>

        <View style={buttonContainerStyle}>
          {/* Button 1: Checked */}
          <FlipButton
            style={styles.filterButton}
            onPress={() => handleFilterChange(FILTER_TYPES.CHECKED)}
            bgColor={isCheckedActive ? "#007bff" : "#e9ecef"}
            textColor={isCheckedActive ? "#fff" : "#495057"}
          >
            <Text style={{ fontWeight: "600", textAlign: "center" }}>
              {t("MyActivities_ParticipationChecked")}
            </Text>
          </FlipButton>

          {/* Button 2: Not Checked */}
          <FlipButton
            style={styles.filterButton}
            onPress={() => handleFilterChange(FILTER_TYPES.NOT_CHECKED)}
            bgColor={isNotCheckedActive ? "#007bff" : "#e9ecef"}
            textColor={isNotCheckedActive ? "#fff" : "#495057"}
          >
            <Text style={{ fontWeight: "600", textAlign: "center" }}>
              {t("MyActivities_ParticipationNotChecked")}
            </Text>
          </FlipButton>

          {/* ✅ Button 3: No Participation (New) */}
          <FlipButton
            style={styles.filterButton}
            onPress={() => handleFilterChange(FILTER_TYPES.NO_PARTICIPATION)}
            bgColor={isNoParticipationActive ? "#007bff" : "#e9ecef"}
            textColor={isNoParticipationActive ? "#fff" : "#495057"}
          >
            <Text style={{ fontWeight: "600", textAlign: "center" }}>
              {t("MyActivities_NoParticipation", "No Participation")}
            </Text>
          </FlipButton>
        </View>

        {activeFilter !== FILTER_TYPES.ALL && (
          <FlipButton
            onPress={() => handleFilterChange(FILTER_TYPES.ALL)}
            style={styles.clearFilterButton} // Uses new style below
            bgColor="#f8f9fa"
            textColor="#dc3545"
            // We now want the border to be visible and flip
          >
            <Text style={{ fontWeight: "bold", textAlign: "center" }}>
              {t("MyActivities_ClearFilter")}
            </Text>
          </FlipButton>
        )}
      </View>
    );
  }, [activeFilter, buttonContainerStyle, t, handleFilterChange]);

  return (
    <View style={styles.container}>
      <Header />
      <PaginatedListDisplay
        flatListRef={flatListRef}
        items={itemsForCurrentPage}
        // ✅ CHANGE: Pass the memoized component here
        ListHeaderComponent={ListHeaderComponent}
        listContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() => handleCardPress(item.eventId)}
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

// Your existing styles remain the same
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
    marginHorizontal: 5,
    borderRadius: 20,
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
  clearFilterButton: {
    marginTop: 15,
    paddingVertical: 10, // Increased padding
    paddingHorizontal: 20, // Increased padding
    borderWidth: 2, // Add a clear border
    borderColor: "#dc3545", // Use the text color for the border
    borderRadius: 20,
    width: "90%", // Make it wider
  },
});
