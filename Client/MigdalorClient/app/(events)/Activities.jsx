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
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Globals } from "../../app/constants/Globals";
import EventCard from "@/components/EventCard";
import PaginatedListDisplay from "@/components/PaginatedListDisplay";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import Header from "@/components/Header";
import FlipButton from "@/components/FlipButton";
import StyledText from "@/components/StyledText";

const ITEMS_PER_PAGE = 5;

export default function ActivitiesScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const flatListRef = useRef(null);
  const isRtl = i18n.dir() === "rtl";

  const [allActivities, setAllActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [canInitiate, setCanInitiate] = useState(false);
  const [isPermissionLoading, setIsPermissionLoading] = useState(true);

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
          console;
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

  const ListHeader = () => (
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
            bgColor="#ffffff"
            textColor="#000000"
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
              {t("NewActivity_Title", "Add a new activity")}
            </Text>
          </FlipButton>

          <FlipButton
            onPress={() => router.push("/MyActivities")}
            style={styles.newActivityButton}
            bgColor="#ffffff"
            textColor="#000000"
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
              {t("Activities_MyCreatedActivities")}
            </Text>
          </FlipButton>
        </>
      )}

      <FloatingLabelInput
        label={t("Common_SearchPlaceholder", "Search by name...")}
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={styles.searchContainer}
        alignRight={i18n.dir() === "rtl"}
      />
    </>
  );

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
    backgroundColor: "#fef1e6", // Added background color
  },
  content: {
    flex: 1,
    marginTop: 5,
    paddingHorizontal: 16,
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
    marginBottom: 20,
  },
  listContentContainer: {
    alignItems: "center",
  },
  listContainer: {
    paddingTop: 75, // Top padding to account for the Header
    paddingHorizontal: 16,
    paddingBottom: 40,
    alignSelf: "center",
    width: "95%",
  },
  newActivityButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    marginTop: 60, // Added requested margin
  },
});
