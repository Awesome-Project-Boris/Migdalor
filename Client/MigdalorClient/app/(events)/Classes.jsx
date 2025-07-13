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

const ITEMS_PER_PAGE = 5;

export default function ClassesScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const flatListRef = useRef(null);
  const isRtl = i18n.dir() === "rtl";

  const [allClasses, setAllClasses] = useState([]);
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
          setAllClasses(data.classes || []);
          console.log("All data on classes: ", data);
          console.log("Classes focus: ", data.classes);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchEvents();
    }, [t])
  );

  const filteredClasses = useMemo(() => {
    if (!searchTerm) {
      return allClasses;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return allClasses.filter((c) =>
      c.eventName.toLowerCase().includes(lowercasedTerm)
    );
  }, [allClasses, searchTerm]);

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

  const ListHeader = () => (
    <>
      <Text style={styles.mainTitle}>
        {t("Events_ClassesTitle", "Classes")}
      </Text>
      <FloatingLabelInput
        label={t("Common_SearchPlaceholder", "Search by name...")}
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={styles.searchContainer}
        alignRight={isRtl}
      />
    </>
  );

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
    backgroundColor: "#fef1e6", // Added background color
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
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
  },
  listContainer: {
    paddingTop: 75,
    paddingHorizontal: 16,
    paddingBottom: 40,
    alignSelf: "center",
    width: "95%",
  },
});
