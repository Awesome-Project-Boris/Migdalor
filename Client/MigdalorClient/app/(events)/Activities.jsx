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
import { Globals } from "@/app/constants/Globals";
import EventCard from "@/components/EventCard";
import PaginatedListDisplay from "@/components/PaginatedListDisplay";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import Header from "@/components/Header";
import { i18n } from "i18next";

const ITEMS_PER_PAGE = 5;

export default function ActivitiesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const flatListRef = useRef(null);

  const [allActivities, setAllActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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
    }, [t])
  );

  const filteredActivities = useMemo(() => {
    if (!searchTerm) {
      return allActivities;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return allActivities.filter((c) =>
      c.eventName.toLowerCase().includes(lowercasedTerm)
    );
  }, [allActivities, searchTerm]);

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
      <Text style={styles.mainTitle}>
        {t("Events_ActivitiesTitle", "Activities")}
      </Text>
      <View style={styles.content}>
        <FloatingLabelInput
          label={t("Common_SearchPlaceholder", "Search by name...")}
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.searchContainer}
          alignRight={Globals.userSelectedDirection === "rtl"}
        />
        <PaginatedListDisplay
          flatListRef={flatListRef}
          items={itemsForCurrentPage}
          contentContainerStyle={styles.listContentContainer}
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
              <Text>
                {t(
                  "Activities_NoActivities",
                  "No activities available at the moment."
                )}
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    marginTop: 5,
    paddingHorizontal: 16,
  },
  searchContainer: {
    marginBottom: 16,
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
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111",
    marginTop: 60,
  },
  listContentContainer: {
    alignItems: "center",
  },
  listContainer: {
    alignSelf: "center", // Center the list container itself
    width: "95%", // Set a width to be slightly less than the screen
  },
});
