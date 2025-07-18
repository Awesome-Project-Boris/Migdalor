import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Globals } from "@/app/constants/Globals";
import Header from "@/components/Header";
import ServiceCard from "@/components/ServiceCard";
import StyledText from "@/components/StyledText"; // Import StyledText

export default function PublicServices() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadServices = async () => {
        setLoading(true);
        setError(null);
        try {
          const storedToken = await AsyncStorage.getItem("jwt");
          if (!storedToken) {
            throw new Error("Authentication token not found.");
          }

          const apiUrl = `${Globals.API_BASE_URL}/api/Services/GetAllServices`;
          const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${storedToken}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(
              `Failed to fetch services: HTTP ${response.status}`
            );
          }

          const data = await response.json();
          if (isActive) {
            setServices(data);
          }
        } catch (err) {
          console.error("Failed to load services:", err);
          if (isActive) {
            setError(t("Errors_Service_Fetch", "Could not fetch services."));
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      loadServices();

      return () => {
        isActive = false;
      };
    }, [t])
  );

  const handleCardPress = (service) => {
    if (!service) {
      console.error("Attempted to navigate with undefined service data.");
      return;
    }
    navigation.navigate("PublicServicesFocus", { serviceData: service });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <StyledText>{t("Common_Loading", "Loading...")}</StyledText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.centered}>
          <StyledText style={styles.errorText}>{error}</StyledText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <FlatList
        data={services}
        ListHeaderComponent={
          <View style={styles.headerPlaque}>
            <StyledText style={styles.mainTitle}>
              {t("Services_Title", "Services")}
            </StyledText>
          </View>
        }
        renderItem={({ item }) =>
          item ? (
            <ServiceCard service={item} onPress={() => handleCardPress(item)} />
          ) : null
        }
        keyExtractor={(item, index) =>
          item?.serviceID?.toString() || index.toString()
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <StyledText>
              {t(
                "Services_No_Services_Available",
                "No services available at the moment."
              )}
            </StyledText>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerPlaque: {
    width: "100%",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#dee2e6",
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  container: {
    flex: 1,
    backgroundColor: "#f7e7ce", // Champagne background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7e7ce",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 50, // Add margin to push content down from header
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
  listContainer: {
    paddingTop: 80,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
});
