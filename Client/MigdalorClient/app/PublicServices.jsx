import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Globals } from "./constants/Globals";
import { useSettings } from "@/context/SettingsContext";

import Header from "@/components/Header";
import ServiceCard from "@/components/ServiceCard";
import StyledText from "@/components/StyledText";

const UpcomingOverridesDisplay = ({ overrides }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "he";

  if (!overrides || overrides.length === 0) {
    return null;
  }

  const textAlignStyle = { textAlign: isRtl ? "right" : "left" };

  const getDisplayDate = (dateString) => {
    // FIX: Manually parse the date string as UTC to prevent timezone shifts.
    const [year, month, day] = dateString.split("T")[0].split("-").map(Number);
    const correctDate = new Date(Date.UTC(year, month - 1, day));
    return correctDate.toLocaleDateString(i18n.language, {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <View style={styles.overridesContainer}>
      <StyledText style={styles.overridesTitle}>
        {t("services_overrides_title", "Schedule Changes")}
      </StyledText>
      <StyledText style={[styles.overridesText, textAlignStyle]}>
        {t(
          "services_overrides_intro",
          "Please note! Schedule changes are planned for the following services this week:"
        )}
      </StyledText>
      <View style={styles.overridesList}>
        {overrides.map((override) => (
          <StyledText
            key={override.overrideId}
            style={[styles.overridesItem, textAlignStyle]}
          >
            {`\u2022 ${override.serviceName}: ${getDisplayDate(
              override.overrideDate
            )}`}
          </StyledText>
        ))}
      </View>
      <StyledText style={[styles.overridesFooter, textAlignStyle]}>
        {t(
          "services_overrides_footer",
          "For more details, please check the notices or the service page."
        )}
      </StyledText>
    </View>
  );
};

export default function PublicServices() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upcomingOverrides, setUpcomingOverrides] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
          const storedToken = await AsyncStorage.getItem("jwt");
          if (!storedToken) {
            throw new Error("Authentication token not found.");
          }

          const headers = {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "application/json",
          };

          const servicesUrl = `${Globals.API_BASE_URL}/api/Services/GetAllServices`;
          const overridesUrl = `${Globals.API_BASE_URL}/api/OpeningHours/overrides`;

          const [servicesResponse, overridesResponse] = await Promise.all([
            fetch(servicesUrl, { method: "GET", headers }),
            fetch(overridesUrl, { method: "GET", headers }),
          ]);

          if (!servicesResponse.ok) {
            throw new Error(
              `Failed to fetch services: ${servicesResponse.status}`
            );
          }
          if (!overridesResponse.ok) {
            throw new Error(
              `Failed to fetch overrides: ${overridesResponse.status}`
            );
          }

          const servicesData = await servicesResponse.json();
          const overridesData = await overridesResponse.json();

          if (isActive) {
            const validServices = Array.isArray(servicesData)
              ? servicesData.filter(Boolean)
              : [];
            const validOverrides = Array.isArray(overridesData)
              ? overridesData.filter(Boolean)
              : [];

            const overridesByServiceId = validOverrides.reduce(
              (acc, override) => {
                const serviceId = override.serviceId;
                if (!acc[serviceId]) {
                  acc[serviceId] = [];
                }
                acc[serviceId].push(override);
                return acc;
              },
              {}
            );

            const servicesWithOverrides = validServices.map((service) => ({
              ...service,
              scheduleOverrides: overridesByServiceId[service.serviceID] || [],
            }));

            setServices(servicesWithOverrides);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const oneWeekFromNow = new Date(today);
            oneWeekFromNow.setDate(today.getDate() + 7);

            const allUpcoming = servicesWithOverrides
              .flatMap((service) =>
                (service.scheduleOverrides || []).map((override) => ({
                  ...override,
                  serviceName:
                    i18n.language === "he"
                      ? service.hebrewName
                      : service.englishName,
                }))
              )
              .filter((override) => {
                const overrideDate = new Date(
                  override.overrideDate.split("T")[0]
                );
                return overrideDate >= today && overrideDate <= oneWeekFromNow;
              });

            const uniqueUpcoming = Array.from(
              new Map(
                allUpcoming.map((item) => [
                  `${item.serviceId}-${item.overrideDate}`,
                  item,
                ])
              ).values()
            );

            setUpcomingOverrides(uniqueUpcoming);
          }
        } catch (e) {
          if (isActive) {
            setError(e.message);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      loadData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const renderItem = ({ item }) => (
    <ServiceCard
      service={item}
      onPress={() =>
        navigation.navigate("PublicServicesFocus", { service: item })
      }
    />
  );

  const listHeader = () => (
    <>
      <View style={styles.headerPlaque}>
        <StyledText style={styles.mainTitle}>
          {t("OurServices", "השירותים שלנו")}
        </StyledText>
      </View>
      <UpcomingOverridesDisplay overrides={upcomingOverrides} />
    </>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333333" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <StyledText>Error: {error}</StyledText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={t("Services", "Public Services")} />
      <FlatList
        data={services}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item?.serviceID?.toString() ?? index.toString()
        }
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={listHeader}
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
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    margin: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 70,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    backgroundColor: "#F7E7CE",
  },
  listContainer: {},
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7E7CE",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  overridesContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ffeeba",
  },
  overridesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#856404",
    textAlign: "center",
    marginBottom: 10,
  },
  overridesText: {
    fontSize: 16,
    color: "#000000",
    lineHeight: 24,
    marginBottom: 5,
    fontWeight: "bold",
  },
  overridesList: {
    marginVertical: 5,
  },
  overridesItem: {
    fontSize: 16,
    color: "#856404",
    lineHeight: 24,
  },
  overridesFooter: {
    fontSize: 15,
    color: "#856404",
    lineHeight: 22,
    marginTop: 5,
  },
});
