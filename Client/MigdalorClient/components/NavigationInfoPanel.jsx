import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import StyledText from "@/components/StyledText";
import { useTranslation } from "react-i18next";
import { getDistance } from "geolib";
import { Ionicons } from "@expo/vector-icons";

const NavigationInfoPanel = ({ navigationPath, destination }) => {
  const { t } = useTranslation();

  // useMemo will prevent re-calculating the distance on every render unless the path changes.
  const totalDistance = useMemo(() => {
    if (navigationPath.length < 2) return 0;
    let distance = 0;
    for (let i = 0; i < navigationPath.length - 1; i++) {
      distance += getDistance(navigationPath[i], navigationPath[i + 1]);
    }
    return Math.round(distance);
  }, [navigationPath]);

  const destinationName = useMemo(() => {
    if (!destination) return "";
    if (destination.type === "building") {
      return t(destination.buildingName, {
        defaultValue: destination.buildingName,
      });
    }
    if (destination.type === "apartment") {
      return `${t("Apartment", "Apartment")} ${destination.displayNumber}`;
    }
    return "";
  }, [destination, t]);

  if (!destination) return null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Ionicons name="walk-outline" size={24} color="#333" />
        <StyledText style={styles.text}>
          {t("Navigation_DistanceTo", "Distance to {{destination}}:", {
            destination: destinationName,
          })}
        </StyledText>
      </View>
      <StyledText style={styles.distanceText}>
        {totalDistance} {t("Meters", "meters")}
      </StyledText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 100, // Adjust to be below your header
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
