import React from "react";
import { View, StyleSheet, Text, ScrollView, Image } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Globals } from "@/app/constants/Globals";
import Header from "@/components/Header";

const placeholderImage = require("../assets/images/ServicesPlaceholder.png");

const OpeningHoursDisplay = ({ hours }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  const days = [
    t("Days_Sunday"),
    t("Days_Monday"),
    t("Days_Tuesday"),
    t("Days_Wednesday"),
    t("Days_Thursday"),
    t("Days_Friday"),
    t("Days_Saturday"),
  ];

  const hoursByDay = (hours || []).reduce((acc, hour) => {
    const dayIndex = hour.dayOfWeek - 1;
    if (dayIndex >= 0 && dayIndex < 7) {
      if (!acc[dayIndex]) acc[dayIndex] = [];
      acc[dayIndex].push(`${hour.openTime} - ${hour.closeTime}`);
    }
    return acc;
  }, {});

  if (!hours || hours.length === 0) {
    return (
      <Text style={[styles.hoursText, isRtl && styles.rtlText]}>
        {t("PublicServicesFocus_NoHours")}
      </Text>
    );
  }

  return (
    <View style={styles.hoursContainer}>
      {days.map((dayName, index) => {
        const daySlots = hoursByDay[index];
        if (!daySlots) return null;

        const dayLabelComponent = (
          <Text style={[styles.dayLabel, isRtl && styles.rtlText]}>
            {dayName}:
          </Text>
        );
        const slotsComponent = (
          <View>
            {daySlots.map((slot, slotIndex) => (
              <Text
                key={slotIndex}
                style={[styles.hoursText, isRtl && styles.rtlText]}
              >
                {slot}
              </Text>
            ))}
          </View>
        );

        return (
          <View key={index} style={styles.dayRow}>
            {isRtl ? (
              <>
                {slotsComponent}
                {dayLabelComponent}
              </>
            ) : (
              <>
                {dayLabelComponent}
                {slotsComponent}
              </>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default function PublicServicesFocus() {
  const { t, i18n } = useTranslation();
  const route = useRoute();
  const { serviceData } = route.params || {};

  if (!serviceData) {
    return (
      <View style={styles.wrapper}>
        <Header />
        <View style={styles.centeredError}>
          <Text style={styles.errorText}>{t("Errors_Service_Display")}</Text>
        </View>
      </View>
    );
  }

  const isRtl = i18n.dir() === "rtl";

  const mainName = isRtl ? serviceData.hebrewName : serviceData.englishName;
  const mainDescription = isRtl
    ? serviceData.hebrewDescription
    : serviceData.englishDescription;
  const mainAddendum = isRtl
    ? serviceData.hebrewAddendum
    : serviceData.englishAddendum;

  const getImageUrl = (service) => {
    if (service?.picturePath) {
      return { uri: `${Globals.API_BASE_URL}${service.picturePath}` };
    }
    return placeholderImage;
  };

  return (
    <View style={styles.wrapper}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={getImageUrl(serviceData)} style={styles.mainImage} />
        <Text style={[styles.mainTitle, isRtl && styles.rtlText]}>
          {mainName}
        </Text>

        {mainDescription && (
          <Text style={[styles.description, isRtl && styles.rtlText]}>
            {mainDescription}
          </Text>
        )}

        <Text style={styles.sectionHeader}>
          {t("PublicServicesFocus_Opening_Hours")}
        </Text>
        <OpeningHoursDisplay hours={serviceData.openingHours} />

        {mainAddendum && (
          <View style={styles.addendumBox}>
            <Text style={[styles.addendumText, isRtl && styles.rtlText]}>
              {mainAddendum}
            </Text>
          </View>
        )}

        {serviceData.subServices && serviceData.subServices.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>
              {t("PublicServicesFocus_Sub_Services")}
            </Text>
            {serviceData.subServices.map((subService) => {
              if (!subService) return null;
              const subName = isRtl
                ? subService.hebrewName
                : subService.englishName;
              const subDescription = isRtl
                ? subService.hebrewDescription
                : subService.englishDescription;
              const subAddendum = isRtl
                ? subService.hebrewAddendum
                : subService.englishAddendum;

              return (
                <View key={subService.serviceID} style={styles.subServiceCard}>
                  <Text
                    style={[styles.subServiceTitle, isRtl && styles.rtlText]}
                  >
                    {subName}
                  </Text>
                  {subDescription && (
                    <Text style={[styles.description, isRtl && styles.rtlText]}>
                      {subDescription}
                    </Text>
                  )}
                  <OpeningHoursDisplay hours={subService.openingHours} />
                  {subAddendum && (
                    <View style={[styles.addendumBox, styles.subAddendumBox]}>
                      <Text
                        style={[styles.addendumText, isRtl && styles.rtlText]}
                      >
                        {subAddendum}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#fef1e6",
  },
  scrollContainer: {
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  centeredError: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
  mainImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: "700",
    color: "#444",
    marginTop: 20,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderColor: "#e0c4a2",
    width: "100%",
    textAlign: "center",
    paddingBottom: 4,
  },
  addendumBox: {
    width: "100%",
    backgroundColor: "#fff8f0",
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
  },
  addendumText: {
    fontSize: 15,
    fontStyle: "bold",
    color: "#5c4b33",
  },
  subServiceCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  subServiceTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  subAddendumBox: {
    marginTop: 10,
    backgroundColor: "#f9f9f9",
  },
  hoursContainer: {
    width: "100%",
    marginTop: 5,
  },
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  hoursText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 4,
  },
  rtlText: {
    writingDirection: "rtl",
    textAlign: "right",
  },
});
