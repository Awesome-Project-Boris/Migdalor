import React from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Globals } from "@/app/constants/Globals";
import Header from "@/components/Header";
import StyledText from "@/components/StyledText";
import { useSettings } from "@/context/SettingsContext";

const placeholderImage = require("../assets/images/ServicesPlaceholder.png");

const ScheduleOverridesDisplay = ({ overrides }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  if (!overrides || overrides.length === 0) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneWeekFromNow = new Date(today);
  oneWeekFromNow.setDate(today.getDate() + 7);

  const filteredOverrides = overrides.filter((override) => {
    const overrideDate = new Date(override.overrideDate.split("T")[0]);
    return overrideDate >= today && overrideDate <= oneWeekFromNow;
  });

  if (filteredOverrides.length === 0) {
    return null;
  }

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

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
      {filteredOverrides.map((override) => {
        const date = getDisplayDate(override.overrideDate);
        const startTime = formatTime(override.openTime);
        const endTime = formatTime(override.closeTime);

        let message;
        if (!override.isOpen) {
          message =
            startTime && endTime
              ? t("service_override_unavailable_datetime", {
                  date,
                  startTime,
                  endTime,
                })
              : t("service_override_unavailable_date", { date });
        } else {
          message =
            startTime && endTime
              ? t("service_override_available_datetime", {
                  date,
                  startTime,
                  endTime,
                })
              : t("service_override_available_date", { date });
        }

        const notes = override.notes;

        return (
          <View key={override.overrideId} style={styles.overrideItem}>
            <StyledText style={[styles.overrideText, isRtl && styles.rtlText]}>
              {message}
            </StyledText>
            {notes && (
              <StyledText
                style={[styles.overrideNotes, isRtl && styles.rtlText]}
              >
                {t("service_override_notes", { notes: notes })}
              </StyledText>
            )}
          </View>
        );
      })}
    </View>
  );
};

const OpeningHoursDisplay = ({ hours, useColumnLayout }) => {
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
      const openTime = hour.openTime ? hour.openTime.substring(0, 5) : "";
      const closeTime = hour.closeTime ? hour.closeTime.substring(0, 5) : "";
      acc[dayIndex].push(`${openTime} - ${closeTime}`);
    }
    return acc;
  }, {});

  if (!hours || hours.length === 0) {
    return (
      <StyledText style={[styles.hoursText, isRtl && styles.rtlText]}>
        {t("PublicServicesFocus_NoHours")}
      </StyledText>
    );
  }

  return (
    <View style={styles.hoursContainer}>
      {days.map((dayName, index) => {
        const daySlots = hoursByDay[index];
        if (!daySlots || daySlots.length === 0) return null;

        const dayLabelComponent = (
          <StyledText style={[styles.dayLabel, isRtl && styles.rtlText]}>
            {dayName}:
          </StyledText>
        );
        const slotsComponent = (
          <View>
            {daySlots.map((slot, slotIndex) => (
              <StyledText
                key={slotIndex}
                style={[styles.hoursText, isRtl && styles.rtlText]}
              >
                {slot}
              </StyledText>
            ))}
          </View>
        );

        return (
          <View
            key={index}
            style={[styles.dayRow, useColumnLayout && styles.dayColumn]}
          >
            {isRtl && !useColumnLayout ? (
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
  const { settings } = useSettings();

  const { service: serviceData } = route.params || {};

  const useColumnLayout = settings.fontSizeMultiplier >= 2;

  if (!serviceData) {
    return (
      <View style={styles.wrapper}>
        <Header />
        <View style={styles.centeredFeedback}>
          <StyledText style={styles.errorText}>
            {t("Errors_Service_Display", "Could not load service data.")}
          </StyledText>
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
        <View style={styles.headerPlaque}>
          <Image source={getImageUrl(serviceData)} style={styles.mainImage} />
          <StyledText style={[styles.mainTitle, isRtl && styles.rtlText]}>
            {mainName}
          </StyledText>
        </View>

        <View style={styles.contentPlaque}>
          {mainDescription && (
            <StyledText style={[styles.description, isRtl && styles.rtlText]}>
              {mainDescription}
            </StyledText>
          )}

          <ScheduleOverridesDisplay overrides={serviceData.scheduleOverrides} />

          <StyledText style={styles.sectionHeader}>
            {t("PublicServicesFocus_Opening_Hours")}
          </StyledText>
          <OpeningHoursDisplay
            hours={serviceData.openingHours}
            useColumnLayout={useColumnLayout}
          />

          {mainAddendum && (
            <View style={styles.addendumBox}>
              <StyledText
                style={[styles.addendumText, isRtl && styles.rtlText]}
              >
                {mainAddendum}
              </StyledText>
            </View>
          )}

          {serviceData.subServices && serviceData.subServices.length > 0 && (
            <>
              <StyledText style={styles.sectionHeader}>
                {t("PublicServicesFocus_Sub_Services")}
              </StyledText>
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
                  <View
                    key={subService.serviceID}
                    style={styles.subServiceCard}
                  >
                    <StyledText
                      style={[styles.subServiceTitle, isRtl && styles.rtlText]}
                    >
                      {subName}
                    </StyledText>
                    {subDescription && (
                      <StyledText
                        style={[styles.description, isRtl && styles.rtlText]}
                      >
                        {subDescription}
                      </StyledText>
                    )}

                    <ScheduleOverridesDisplay
                      overrides={subService.scheduleOverrides}
                    />

                    <OpeningHoursDisplay
                      hours={subService.openingHours}
                      useColumnLayout={useColumnLayout}
                    />
                    {subAddendum && (
                      <View style={[styles.addendumBox, styles.subAddendumBox]}>
                        <StyledText
                          style={[styles.addendumText, isRtl && styles.rtlText]}
                        >
                          {subAddendum}
                        </StyledText>
                      </View>
                    )}
                  </View>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f7e7ce",
  },
  scrollContainer: {
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: "center",
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  headerPlaque: {
    width: "100%",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#dee2e6",
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  contentPlaque: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 40,
  },
  centeredFeedback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  feedbackText: {
    marginTop: 10,
    fontSize: 18,
    color: "#5c4b33",
  },
  errorText: {
    fontSize: 18,
    color: "#d9534f",
    textAlign: "center",
    fontWeight: "bold",
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
    fontWeight: "bold",
    color: "#5c4b33",
  },
  subServiceCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
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
  dayColumn: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 5,
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
  overridesContainer: {
    backgroundColor: "#fff3cd",
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ffeeba",
  },
  overridesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#856404",
    textAlign: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ffeeba",
  },
  overrideItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "rgba(133, 100, 4, 0.1)",
  },
  overrideText: {
    fontSize: 18,
    color: "#856404",
    lineHeight: 24,
    fontWeight: "500",
  },
  overrideNotes: {
    fontSize: 16,
    color: "#856404",
    lineHeight: 22,
    marginTop: 4,
  },
});
