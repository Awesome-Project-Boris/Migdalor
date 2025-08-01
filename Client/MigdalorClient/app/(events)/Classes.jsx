import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect, useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Globals } from "@/app/constants/Globals";
import EventCard from "@/components/EventCard";
import PaginatedListDisplay from "@/components/PaginatedListDisplay";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import Header from "@/components/Header";
import StyledText from "@/components/StyledText";
import { useNotifications } from "@/context/NotificationsContext";

const ITEMS_PER_PAGE = 5;

const dayOrder = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
const getDayValue = (recurrenceRule) => {
  if (!recurrenceRule) return 7;
  const byDayPart = recurrenceRule
    .split(";")
    .find((part) => part.startsWith("BYDAY="));
  if (!byDayPart) return 7;

  const dayCode = byDayPart.split("=")[1].substring(0, 2);
  return dayOrder[dayCode] ?? 7;
};

const ClassesListHeader = ({ t, isRtl, searchTerm, setSearchTerm }) => (
  <>
    <View style={styles.plaqueContainer}>
      <StyledText style={styles.mainTitle}>
        {t("Events_ClassesTitle")}
      </StyledText>
    </View>
    <FloatingLabelInput
      label={t("Common_SearchPlaceholder", "Search by name...")}
      value={searchTerm}
      onChangeText={setSearchTerm}
      style={styles.searchContainer}
      alignRight={isRtl}
    />
  </>
);

export default function ClassesScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const flatListRef = useRef(null);
  const isRtl = i18n.dir() === "rtl";
  const { updateLastVisited, isItemNew } = useNotifications();

  const [allClasses, setAllClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useFocusEffect(
    useCallback(() => {
      return () => {
        console.log("Events page unfocused, updating last visited time.");
        updateLastVisited("events");
      };
    }, [updateLastVisited])
  );

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${Globals.API_BASE_URL}/api/events`);
      if (!response.ok)
        throw new Error(t("Errors_Event_Fetch", "Could not fetch events."));
      const data = await response.json();

      console.log("Those are all the events: ", data);

      setAllClasses(data.classes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [fetchEvents])
  );

  useEffect(() => {
    if (params.refresh) {
      console.log("Refresh signal received, fetching new classes...");
      fetchEvents();
    }
  }, [params.refresh, fetchEvents]);

  const filteredClasses = useMemo(() => {
    const sourceArray = allClasses;

    let filtered = sourceArray;
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = sourceArray.filter((c) =>
        c.eventName.toLowerCase().includes(lowercasedTerm)
      );
    }

    return [...filtered].sort((a, b) => {
      const aIsNew = isItemNew("events", a.dateCreated);
      const bIsNew = isItemNew("events", b.dateCreated);
      if (aIsNew && !bIsNew) return -1;
      if (!bIsNew && bIsNew) return 1;

      const dayA = getDayValue(a.recurrenceRule);
      const dayB = getDayValue(b.recurrenceRule);
      if (dayA !== dayB) return dayA - dayB;

      return new Date(b.startDate) - new Date(a.startDate);
    });
  }, [allClasses, searchTerm, isItemNew]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredClasses.length / ITEMS_PER_PAGE);
  const itemsForCurrentPage = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredClasses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredClasses, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    }
  };

  if (isLoading && !allClasses.length) {
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
          <ClassesListHeader
            t={t}
            isRtl={isRtl}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        }
        listContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            isNew={isItemNew("events", item.dateCreated)}
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
            <Text>{t("Classes_NoClasses", "No classes available.")}</Text>
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
  content: {
    flex: 1,
    marginTop: 5,
    paddingHorizontal: 16,
  },
  listContentContainer: {
    alignItems: "center",
  },
  searchContainer: {
    marginBottom: 20,
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
