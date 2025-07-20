import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  FlatList,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "@/context/SettingsContext";

import { Globals } from "./constants/Globals";
import Header from "../components/Header";
import FlipButton from "../components/FlipButton";
import StyledText from "@/components/StyledText";

// --- Locale Configuration ---
LocaleConfig.locales["he"] = {
  monthNames: [
    "ינואר",
    "פברואר",
    "מרץ",
    "אפריל",
    "מאי",
    "יוני",
    "יולי",
    "אוגוסט",
    "ספטמבר",
    "אוקטובר",
    "נובמבר",
    "דצמבר",
  ],
  monthNamesShort: [
    "ינו׳",
    "פבר׳",
    "מרץ",
    "אפר׳",
    "מאי",
    "יוני",
    "יולי",
    "אוג׳",
    "ספט׳",
    "אוק׳",
    "נוב׳",
    "דצמ׳",
  ],
  dayNames: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
  dayNamesShort: ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"],
  today: "היום",
};
LocaleConfig.defaultLocale = "he";

// --- Helper Functions ---
const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const getWeekDays = (date) => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day; // Sunday is 0
  startOfWeek.setDate(diff);

  const week = [];
  for (let i = 0; i < 7; i++) {
    const weekDay = new Date(startOfWeek);
    weekDay.setDate(startOfWeek.getDate() + i);
    week.push(weekDay);
  }
  return week;
};

// --- Layout Algorithm for Daily View ---
const layoutEvents = (events) => {
  if (!events || events.length === 0) {
    return [];
  }

  const processedEvents = events.map((e) => {
    const start = new Date(e.startTime);
    let end = new Date(e.endTime);
    // FIX: Explicitly check for invalid or zero-duration dates
    if (isNaN(end.getTime()) || end <= start) {
      end = new Date(start.getTime() + 60 * 60 * 1000); // Default to 1 hour long
    }
    return { ...e, startTime: start, endTime: end };
  });

  const sortedEvents = processedEvents.sort(
    (a, b) => a.startTime - b.startTime
  );

  const layouted = [];
  let lastEndTime = null;
  let currentCluster = [];

  const processCluster = (cluster) => {
    const columns = [];
    cluster.sort((a, b) => a.startTime - b.startTime);

    cluster.forEach((event) => {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        if (columns[i][columns[i].length - 1].endTime <= event.startTime) {
          columns[i].push(event);
          event.colIndex = i;
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([event]);
        event.colIndex = columns.length - 1;
      }
    });

    const numColumns = columns.length;
    cluster.forEach((event) => {
      event.width = 100 / numColumns;
      event.left = event.colIndex * event.width;
      layouted.push(event);
    });
  };

  sortedEvents.forEach((event) => {
    if (lastEndTime !== null && event.startTime >= lastEndTime) {
      processCluster(currentCluster);
      currentCluster = [];
      lastEndTime = null;
    }

    currentCluster.push(event);
    if (lastEndTime === null || event.endTime > lastEndTime) {
      lastEndTime = event.endTime;
    }
  });

  if (currentCluster.length > 0) {
    processCluster(currentCluster);
  }

  return layouted;
};

// --- Child Components ---

const ViewSwitcher = ({ viewMode, setViewMode, onGoToToday, t }) => (
  <View style={styles.viewSwitcherContainer}>
    <TouchableOpacity style={styles.todayButton} onPress={onGoToToday}>
      <Text style={styles.todayButtonText}>{t(`Today`, "Today")}</Text>
    </TouchableOpacity>
    <View style={styles.modeButtonsContainer}>
      {["daily", "weekly", "monthly"].map((mode) => (
        <TouchableOpacity
          key={mode}
          style={[
            styles.viewSwitcherButton,
            viewMode === mode && styles.viewSwitcherButtonActive,
          ]}
          onPress={() => setViewMode(mode)}
        >
          <Text
            style={[
              styles.viewSwitcherText,
              viewMode === mode && styles.viewSwitcherTextActive,
            ]}
          >
            {t(
              `Timetable_${mode}`,
              mode.charAt(0).toUpperCase() + mode.slice(1)
            )}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const DailyView = ({ events, handleItemPress, t }) => {
  const hourHeight = 80;
  // UPDATED: Start at 5:00 for 19 hours to end at 24:00 (11 PM slot)
  const hours = Array.from({ length: 19 }, (_, i) => i + 5);

  const laidOutEvents = useMemo(() => layoutEvents(events), [events]);

  return (
    <ScrollView contentContainerStyle={styles.timelineContainer}>
      <View style={styles.hoursColumn}>
        {hours.map((hour) => (
          // UPDATED: Offset by 5
          <Text
            key={hour}
            style={[styles.hourText, { top: (hour - 5) * hourHeight - 10 }]}
          >{`${String(hour).padStart(2, "0")}:00`}</Text>
        ))}
      </View>
      <View style={styles.eventsColumn}>
        {hours.map((hour) => (
          // UPDATED: Offset by 5
          <View
            key={`line-${hour}`}
            style={[styles.hourLine, { top: (hour - 5) * hourHeight }]}
          />
        ))}
        {laidOutEvents.map((event, index) => {
          const start = event.startTime;
          const end = event.endTime;
          const timelineEnd = new Date(start);
          timelineEnd.setHours(23, 59, 59, 999);

          const cappedEnd = new Date(
            Math.min(end.getTime(), timelineEnd.getTime())
          );
          const cappedDurationMillis = cappedEnd.getTime() - start.getTime();

          // UPDATED: Offset by 5
          const top =
            (start.getHours() - 5) * hourHeight +
            (start.getMinutes() / 60) * hourHeight;
          const height = Math.max(
            30,
            (cappedDurationMillis / (1000 * 60 * 60)) * hourHeight - 2
          );

          const isCancelled =
            event.status === "Cancelled" || event.status === "Postponed";

          return (
            <TouchableOpacity
              key={`${event.id}-${event.sourceTable}-${index}`}
              style={[
                styles.eventBlock,
                isCancelled && styles.cancelledEventBlock,
                {
                  top,
                  height,
                  left: `${event.left}%`,
                  width: `${event.width}%`,
                },
              ]}
              onPress={() => handleItemPress(event)}
            >
              <Text
                style={[
                  styles.eventBlockTitle,
                  isCancelled && styles.cancelledText,
                ]}
                numberOfLines={1}
              >
                {event.title}
              </Text>
              {isCancelled && (
                <Text
                  style={[
                    styles.eventBlockStatus,
                    isRtl && { textAlign: "right" },
                  ]}
                >
                  {t(event.status, event.status)}
                </Text>
              )}
              <Text
                style={[
                  styles.eventBlockTime,
                  isCancelled && styles.cancelledText,
                ]}
              >{`${formatTime(event.startTime)} - ${formatTime(
                event.endTime
              )}`}</Text>
              {event.location && (
                <Text
                  style={[
                    styles.eventBlockLocation,
                    isCancelled && styles.cancelledText,
                  ]}
                  numberOfLines={1}
                >
                  {event.location}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const WeeklySelector = ({ selectedDate, setSelectedDate, items }) => {
  const weekDays = getWeekDays(new Date(selectedDate));
  return (
    <View style={styles.weekSelectorContainer}>
      {weekDays.map((day) => {
        const dayString = day.toISOString().split("T")[0];
        const isSelected = dayString === selectedDate;
        return (
          <TouchableOpacity
            key={dayString}
            style={[
              styles.weekDayButton,
              isSelected && styles.weekDayButtonSelected,
            ]}
            onPress={() => setSelectedDate(dayString)}
          >
            <Text
              style={[
                styles.weekDayText,
                isSelected && styles.weekDayTextSelected,
              ]}
            >
              {LocaleConfig.locales["he"].dayNamesShort[day.getDay()]}
            </Text>
            <Text
              style={[
                styles.weekDateText,
                isSelected && styles.weekDayTextSelected,
              ]}
            >
              {day.getDate()}
            </Text>
            {items[dayString] && items[dayString].length > 0 && (
              <View
                style={[styles.dot, isSelected && { backgroundColor: "white" }]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const ManualAdditionModal = ({ visible, onClose, item, isRtl, t }) => (
  <Modal
    animationType="slide"
    transparent={false}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalContainer}>
      <Header />
      <ScrollView contentContainerStyle={styles.modalScrollContainer}>
        <View style={styles.modalHeader}>
          <FlipButton onPress={onClose} isFlipped={true}>
            <Ionicons name="close-outline" size={30} color="white" />
          </FlipButton>
        </View>

        {item && (
          <>
            <Text style={[styles.modalTitle, isRtl && styles.rtlText]}>
              {item.title}
            </Text>
            {item.description && (
              <Text style={[styles.modalDescription, isRtl && styles.rtlText]}>
                {item.description}
              </Text>
            )}

            <View style={styles.detailsContainer}>
              <DetailRow
                icon="time-outline"
                label={t("Time", "שעה")}
                value={`${formatTime(item.startTime)} - ${formatTime(
                  item.endTime
                )}`}
                isRtl={isRtl}
              />
              {item.location && (
                <DetailRow
                  icon="location-outline"
                  label={t("Location", "מיקום")}
                  value={item.location}
                  isRtl={isRtl}
                />
              )}
              {item.type && (
                <DetailRow
                  icon="information-circle-outline"
                  label={t("Type", "סוג")}
                  value={item.type}
                  isRtl={isRtl}
                  isLast={true}
                />
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  </Modal>
);

const DetailRow = ({ icon, label, value, isRtl, isLast = false }) => (
  <View
    style={[
      styles.detailRow,
      { flexDirection: isRtl ? "row-reverse" : "row" },
      isLast && { borderBottomWidth: 0 },
    ]}
  >
    <Ionicons
      name={icon}
      size={24}
      color="#5c4b33"
      style={isRtl ? styles.iconRtl : styles.iconLtr}
    />
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={[styles.detailValue, { textAlign: isRtl ? "left" : "right" }]}>
      {value}
    </Text>
  </View>
);

// --- Main Component ---
const TimetableScreen = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRtl = i18n.dir() === "rtl";

  const [viewMode, setViewMode] = useState("daily");
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [calendarKey, setCalendarKey] = useState(Date.now());

  const loadedMonths = useMemo(() => new Set(), []);

  const loadItemsForMonth = useCallback(
    async (dateObj) => {
      const month = dateObj.dateString.substring(0, 7);
      if (loadedMonths.has(month)) return;

      setLoading(true);
      loadedMonths.add(month);

      const startDate = new Date(dateObj.year, dateObj.month - 1, 1);
      const endDate = new Date(dateObj.year, dateObj.month, 0);

      try {
        const response = await fetch(
          `${
            Globals.API_BASE_URL
          }/api/events/timetable?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );
        if (!response.ok) throw new Error("Failed to fetch timetable data.");

        const data = await response.json();
        setItems((prevItems) => {
          const newItems = { ...prevItems };
          data.forEach((event) => {
            const eventDate = event.startTime.split("T")[0];
            if (!newItems[eventDate]) newItems[eventDate] = [];
            newItems[eventDate].push(event);
          });
          for (const date in newItems) {
            newItems[date].sort(
              (a, b) => new Date(a.startTime) - new Date(b.startTime)
            );
          }
          return newItems;
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [loadedMonths]
  );

  useEffect(() => {
    const today = new Date();
    loadItemsForMonth({
      dateString: selectedDate,
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    });
  }, []);

  const handleItemPress = (item) => {
    if (item.sourceTable === "OH_TimeTableAdditions") {
      setSelectedItem(item);
      setModalVisible(true);
    } else if (item.navigationEventId) {
      router.push({
        pathname: "/EventFocus",
        params: { eventId: item.navigationEventId },
      });
    }
  };

  const goToToday = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    setSelectedDate(todayStr);
    setCalendarKey(Date.now()); // Force calendar to re-render and jump to the new date
  };

  const getCurrentTitle = () => {
    const date = new Date(selectedDate);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());

    if (viewMode === "daily") {
      return date.toLocaleDateString(i18n.language, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    if (viewMode === "weekly") {
      const week = getWeekDays(date);
      const startDate = week[0];
      const endDate = week[6];
      return `${startDate.toLocaleDateString(i18n.language, {
        day: "numeric",
        month: "short",
      })} - ${endDate.toLocaleDateString(i18n.language, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`;
    }
    return date.toLocaleDateString(i18n.language, {
      month: "long",
      year: "numeric",
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleItemPress(item)}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemTextName, isRtl && styles.rtlText]}>
          {item.title}
        </Text>
        <Text
          style={[styles.itemTextTime, isRtl && styles.rtlText]}
        >{`${formatTime(item.startTime)} - ${formatTime(item.endTime)}`}</Text>
        {item.location && (
          <Text style={[styles.itemTextLocation, isRtl && styles.rtlText]}>
            {item.location}
          </Text>
        )}
      </View>
      <View style={styles.itemDurationContainer}>
        <Ionicons name="time-outline" size={16} color="#5c4b33" />
        <Text style={styles.itemDurationText}>
          {Math.round(
            (new Date(item.endTime) - new Date(item.startTime)) / 60000
          )}{" "}
          {t("minutes", "דקות")}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const markedDates = useMemo(() => {
    const marked = {};
    Object.keys(items).forEach((date) => {
      if (items[date] && items[date].length > 0)
        marked[date] = { marked: true, dotColor: "#005D8F" };
    });
    if (selectedDate)
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: "#005D8F",
        selectedTextColor: "#ffffff",
      };
    return marked;
  }, [items, selectedDate]);

  const ListHeader = () => (
    <>
      <View style={styles.headerPlaque}>
        <Text style={styles.pageTitle}>
          {t("Timetable_Title", "לוח זמנים")}
        </Text>
        <Text style={styles.pageSubTitle}>
          {t("Timetable_SubTitle", "לוח זמנים")}
        </Text>
        <Text style={styles.mainTitle}>{getCurrentTitle()}</Text>
      </View>
      <ViewSwitcher
        viewMode={viewMode}
        setViewMode={setViewMode}
        t={t}
        onGoToToday={goToToday}
      />
      {viewMode === "monthly" && (
        <Calendar
          key={calendarKey}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          onMonthChange={(month) => loadItemsForMonth(month)}
          markedDates={markedDates}
          current={selectedDate}
          style={styles.calendar}
          theme={{
            calendarBackground: "#ffffff",
            textSectionTitleColor: "#3D2B1F",
            selectedDayBackgroundColor: "#005D8F",
            selectedDayTextColor: "#ffffff",
            todayTextColor: "#005D8F",
            dayTextColor: "#3D2B1F",
            arrowColor: "#005D8F",
            monthTextColor: "#3D2B1F",
            textDayFontWeight: "500",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "300",
          }}
        />
      )}
      {viewMode === "weekly" && (
        <WeeklySelector
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          items={items}
        />
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <Header />

      {viewMode === "daily" ? (
        <View style={{ flex: 1 }}>
          <ListHeader />
          <DailyView
            events={items[selectedDate] || []}
            handleItemPress={handleItemPress}
            t={t}
          />
        </View>
      ) : (
        <FlatList
          data={items[selectedDate] || []}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={() => (
            <View style={styles.emptyDateContainer}>
              <Text style={styles.emptyDateText}>
                {t("Timetable_NoActivities", "אין פעילויות מתוכננות")}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#005D8F" />
        </View>
      )}

      <ManualAdditionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        item={selectedItem}
        isRtl={isRtl}
        t={t}
      />
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fef1e6",
    paddingTop: 60,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#3D2B1F",
    marginTop: 15,
  },
  pageSubTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#3D2B1F",
    marginTop: 15,
    marginBottom: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    color: "#3D2B1F",
    marginVertical: 10,
    opacity: 0.8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(254, 241, 230, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  viewSwitcherContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff8f0",
    borderBottomColor: "#e0c4a2",
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  modeButtonsContainer: { flexDirection: "row" },
  viewSwitcherButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: "#fff",
    elevation: 1,
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  viewSwitcherButtonActive: { backgroundColor: "#005D8F", elevation: 3 },
  viewSwitcherText: { fontSize: 20, color: "#3D2B1F", fontWeight: "500" },
  viewSwitcherTextActive: { color: "white", fontWeight: "bold" },
  todayButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: "#f0f4f7",
  },
  todayButtonText: { fontSize: 20, color: "#005D8F", fontWeight: "bold" },
  calendar: {
    marginHorizontal: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  listContainer: { paddingHorizontal: 10, paddingBottom: 20, flexGrow: 1 },
  itemContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 6,
    borderLeftColor: "#005D8F",
  },
  itemTextName: { fontSize: 22, fontWeight: "bold", color: "#3D2B1F" },
  itemTextTime: { fontSize: 18, color: "#444", marginTop: 4 },
  itemTextLocation: {
    fontSize: 18,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
  },
  itemDurationContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#f0f4f7",
    borderRadius: 8,
  },
  itemDurationText: {
    fontSize: 18,
    color: "#005D8F",
    fontWeight: "600",
    marginLeft: 5,
  },
  emptyDateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyDateText: { fontSize: 22, color: "#777" },
  rtlText: { writingDirection: "rtl", textAlign: "right" },
  timelineContainer: {
    flexDirection: "row",
    padding: 10,
    flexGrow: 1,
    minHeight: 1440, // Adjusted for new time range
  },
  hoursColumn: { width: 60, paddingTop: 10 },
  hourText: { position: "absolute", right: 0, fontSize: 16, color: "#666" },
  eventsColumn: { flex: 1, marginLeft: 10 },
  hourLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#e0c4a2",
  },
  eventBlock: {
    position: "absolute",
    borderRadius: 8,
    padding: 8,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    backgroundColor: "#005D8F",
    paddingRight: 4,
  },
  cancelledEventBlock: {
    backgroundColor: "#6c757d", // A neutral grey for cancelled events
    borderColor: "#5a6268",
  },
  eventBlockTitle: { color: "white", fontWeight: "bold", fontSize: 18 },
  eventBlockTime: { color: "white", fontSize: 14, marginTop: 2, opacity: 0.9 },
  eventBlockLocation: {
    color: "white",
    fontSize: 14,
    marginTop: 2,
    fontStyle: "italic",
    opacity: 0.9,
  },
  eventBlockStatus: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
  },
  cancelledText: {
    textDecorationLine: "line-through",
    opacity: 0.7,
  },
  weekSelectorContainer: {
    flexDirection: "column", // Stack the rows vertically
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    elevation: 2,
    width: "95%",
    alignSelf: "center",
    overflow: "hidden", // Ensures the inner border radius is clipped correctly
    borderWidth: 1, // Optional: A border around the whole container
    borderColor: "#e0c4a2", // Optional: A border around the whole container
  },
  weekRow: {
    flexDirection: "row",
    borderBottomWidth: 1, // A line between the two rows
    borderBottomColor: "#e0c4a2",
  },
  weekDayButton: {
    flex: 1, // Each button takes up equal space in its row
    alignItems: "center",
    paddingVertical: 10,
    borderRightWidth: 1, // A line between the days
    borderRightColor: "#e0c4a2",
  },
  weekDayButtonSelected: { backgroundColor: "#005D8F" },
  weekDayText: { fontSize: 14, color: "#3D2B1F" },
  weekDateText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#3D2B1F",
    marginTop: 2,
  },
  weekDayTextSelected: { color: "white" },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#005D8F",
    marginTop: 4,
  },
  modalContainer: { flex: 1, backgroundColor: "#fef1e6" },
  modalScrollContainer: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  modalHeader: { position: "absolute", top: 25, right: 5, zIndex: 10 },
  modalTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#3D2B1F",
    marginBottom: 12,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 18,
    lineHeight: 26,
    color: "#444",
    textAlign: "center",
    marginBottom: 24,
  },
  detailsContainer: {
    width: "100%",
    backgroundColor: "#fff8f0",
    borderRadius: 10,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e0c4a2",
  },
  detailRow: {
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5eadd",
  },
  iconLtr: { marginRight: 15, color: "#5c4b33" },
  iconRtl: { marginLeft: 15, color: "#5c4b33" },
  detailLabel: { fontSize: 18, fontWeight: "600", color: "#3D2B1F" },
  detailValue: { fontSize: 18, color: "#3D2B1F", flex: 1 },
  headerPlaque: {
    width: "90%",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#dee2e6",
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
    marginTop: 20,
    alignSelf: "center",
  },
});

export default TimetableScreen;
