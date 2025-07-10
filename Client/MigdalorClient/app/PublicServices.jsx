import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Globals } from "@/app/constants/Globals";
import Header from "@/components/Header";
import ServiceCard from "@/components/ServiceCard"; // Correctly import the component

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
          console.log("This is services data: ", data);
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
        <Text>{t("Common_Loading", "Loading...")}</Text>
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
      <FlatList
        data={services}
        ListHeaderComponent={
          <Text style={styles.mainTitle}>
            {t("Services_Title", "Services")}
          </Text>
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
            <Text>
              {t(
                "Services_No_Services_Available",
                "No services available at the moment."
              )}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainTitle: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111",
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    backgroundColor: "#fef1e6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fef1e6",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
