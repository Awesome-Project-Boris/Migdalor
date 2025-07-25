import React, { useMemo } from "react";
import { View, StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { getDistance } from "geolib";
import { Ionicons } from "@expo/vector-icons";

const NavigationInfoPanel = ({ navigationPath, destination }) => {
  const { t } = useTranslation();

  // ✅ All translation and display name logic is now self-contained here.
  const destinationName = useMemo(() => {
    if (!destination) return "";

    // ✅ FIX: If a displayName is already provided, use it immediately.
    if (destination.displayName) return destination.displayName;

    // --- Fallback logic if no displayName exists ---

    // Handle buildings with 1-2 apartments
    if (destination.type === "building") {
      const hasApartments =
        destination.apartments && destination.apartments.length > 0;
      if (hasApartments && destination.apartments.length <= 2) {
        const apartmentNumbers = destination.apartments
          .map((a) => a.displayNumber)
          .join(", ");
        return `${t(
          destination.apartments[0].apartmentName
        )} ${apartmentNumbers}`;
      }
      return t(destination.buildingName, {
        defaultValue: destination.buildingName,
      });
    }

    // Handle apartments
    if (destination.type === "apartment") {
      return `${t("Common_Apartment")} ${destination.displayNumber}`;
    }

    return ""; // Should not be reached
  }, [destination, t]);

  const totalDistance = useMemo(() => {
    if (navigationPath.length < 2) return 0;
    let distance = 0;
    for (let i = 0; i < navigationPath.length - 1; i++) {
      distance += getDistance(navigationPath[i], navigationPath[i + 1]);
    }
    return Math.round(distance);
  }, [navigationPath]);

  if (!destination) return null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Ionicons name="walk-outline" size={24} color="#333" />
        <Text style={styles.text}>
          {t("Navigation_DistanceTo", { destination: destinationName })}
        </Text>
      </View>
      <Text style={styles.distanceText}>
        {totalDistance} {t("Common_Meters")}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  distanceText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#007bff",
  },
});

export default NavigationInfoPanel;
