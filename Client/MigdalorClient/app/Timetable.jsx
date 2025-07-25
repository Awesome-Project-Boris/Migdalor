import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
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
import { useRouter, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "@/context/SettingsContext";

import { Globals } from "./constants/Globals";
import Header from "../components/Header";
import FlipButton from "../components/FlipButton";

// --- Locale Configuration (No Changes) ---
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

// --- Helper Functions (No Changes) ---
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
  const diff = startOfWeek.getDate() - day;
  startOfWeek.setDate(diff);

  const week = [];
  for (let i = 0; i < 7; i++) {
    const weekDay = new Date(startOfWeek);
    weekDay.setDate(startOfWeek.getDate() + i);
    week.push(weekDay);
  }
  return week;
};

// --- Layout Algorithm (No Changes) ---
const layoutEvents = (events) => {
  if (!events || events.length === 0) return [];

  const processedEvents = events.map((e) => {
    const start = new Date(e.startTime);
    let end = new Date(e.endTime);
    if (isNaN(end.getTime()) || end <= start) {
      end = new Date(start.getTime() + 60 * 60 * 1000);
    }
    // Return original event data alongside processed times for layout
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

  if (currentCluster.length > 0) processCluster(currentCluster);
  return layouted;
};

// --- Child Components (No Changes) ---
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

const DailyView = ({ events, handleItemPress, t, isRtl, selectedDate }) => {
  const hourHeight = 80;
  const hours = Array.from({ length: 19 }, (_, i) => i + 5);
  const viewStartHour = 5;

  // FIX: Process events to filter and cap them according to the view window (05:00-24:00)
  const laidOutEvents = useMemo(() => {
    if (!events || !selectedDate) return [];

    const viewStartDate = new Date(selectedDate);
    viewStartDate.setUTCHours(viewStartHour, 0, 0, 0);

    const viewEndDate = new Date(selectedDate);
    viewEndDate.setUTCHours(24, 0, 0, 0);

    const processedEvents = events
      .filter((e) => {
        const start = new Date(e.startTime);
        const end = new Date(e.endTime);
        return start < viewEndDate && end > viewStartDate;
      })
      .map((e) => {
        const originalStartTime = new Date(e.startTime);
        // Cap the start time for any event that begins before the view window
        const startTimeForLayout = new Date(
          Math.max(originalStartTime.getTime(), viewStartDate.getTime())
        );

        return {
          ...e,
          startTime: startTimeForLayout, // For layout calculation
          originalStartTime: originalStartTime, // For display
          endTime: new Date(e.endTime),
        };
      });

    return layoutEvents(processedEvents);
  }, [events, selectedDate]);

  return (
    <View style={styles.timelineContainer}>
      <View style={styles.hoursColumn}>
        {hours.map((hour) => (
          <Text
            key={hour}
            style={[styles.hourText, { top: (hour - 5) * hourHeight - 10 }]}
          >{`${String(hour).padStart(2, "0")}:00`}</Text>
        ))}
      </View>
      <View style={styles.eventsColumn}>
        {hours.map((hour) => (
          <View
            key={`line-${hour}`}
            style={[styles.hourLine, { top: (hour - 5) * hourHeight }]}
          />
        ))}
        {laidOutEvents.map((event, index) => {
          const start = event.startTime; // This is now the capped start time
          const end = event.endTime;
          const timelineEnd = new Date(start);
          timelineEnd.setHours(23, 59, 59, 999);
          const cappedEnd = new Date(
            Math.min(end.getTime(), timelineEnd.getTime())
          );

          // Calculate top based on the capped start time
          const top =
            (start.getUTCHours() - viewStartHour) * hourHeight +
            (start.getUTCMinutes() / 60) * hourHeight;

          // Calculate height based on the duration from the capped start
          const cappedDurationMillis = cappedEnd.getTime() - start.getTime();
          const height = Math.max(
            30,
            (cappedDurationMillis / (1000 * 60 * 60)) * hourHeight - 2
          );

          const isCancelled = event.status === "Cancelled";
          const isRescheduled = event.status === "Rescheduled";
          const isAltered = isCancelled || isRescheduled;

          const eventBlockStyle = [
            styles.eventBlock,
            isCancelled && styles.cancelledEventBlock,
            isRescheduled && styles.rescheduledEventBlock,
            { top, height, left: `${event.left}%`, width: `${event.width}%` },
          ];

          const textStyle = [
            isRescheduled ? styles.rescheduledEventText : styles.eventBlockText,
            isCancelled && styles.cancelledText,
          ];

          return (
            <TouchableOpacity
              key={`${event.id}-${event.sourceTable}-${index}`}
              style={eventBlockStyle}
              onPress={() => handleItemPress(event)}
            >
              <Text
                style={[
                  styles.eventBlockTitle,
                  ...textStyle,
                  { textAlign: isRtl ? "right" : "left" },
                ]}
                numberOfLines={1}
              >
                {event.title}
              </Text>
              {isAltered && (
                <Text
                  style={[
                    styles.eventBlockStatus,
                    ...textStyle,
                    { textAlign: isRtl ? "right" : "left" },
                  ]}
                >
                  {t(`Timetable_${event.status}`, event.status)}
                </Text>
              )}
              <Text
                style={[
                  styles.eventBlockTime,
                  ...textStyle,
                  { textAlign: isRtl ? "right" : "left" },
                ]}
              >
                {/* FIX: Display the original, non-capped start time */}
                {`${formatTime(event.originalStartTime)} - ${formatTime(
                  event.endTime
                )}`}
              </Text>
              {event.location && (
                <Text
                  style={[
                    styles.eventBlockLocation,
                    ...textStyle,
                    { textAlign: isRtl ? "right" : "left" },
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
    </View>
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
      <ScrollView contentContainerStyle={styles.modalScrollContainer}>
        <View style={styles.modalHeader}>
          <FlipButton
            onPress={onClose}
            isFlipped={true}
            style={styles.modalCloseButton}
          >
            <Ionicons name="close-outline" size={25} color="white" />
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
                label={t("TimeTable_Time")}
                value={`${formatTime(item.startTime)} - ${formatTime(
                  item.endTime
                )}`}
                isRtl={isRtl}
              />
              {item.location && (
                <DetailRow
                  icon="location-outline"
                  label={t("TimeTable_Location")}
                  value={item.location}
                  isRtl={isRtl}
                />
              )}
              {item.type && !item.status && (
                <DetailRow
                  icon="information-circle-outline"
                  label={t("Type", "סוג")}
                  value={t(item.type, item.type)}
                  isRtl={isRtl}
                />
              )}
              {item.status && item.status !== "Scheduled" && (
                <DetailRow
                  icon="alert-circle-outline"
                  label={t("TimeTable_Status")}
                  value={t(`Timetable_${item.status}`, item.status)}
                  isRtl={isRtl}
                />
              )}
              {item.notes && (
                <DetailRow
                  icon="document-text-outline"
                  label={t("TimeTable_Notes")}
                  value={item.notes}
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
  const loadedMonths = useRef(new Set());
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().split("T")[0]
  );

  const loadItemsForMonth = useCallback(async (dateString) => {
    const month = dateString.substring(0, 7);
    if (loadedMonths.current.has(month)) return;

    setLoading(true);
    loadedMonths.current.add(month);

    const dateObj = new Date(dateString);
    const startDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
    const endDate = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);

    try {
      const response = await fetch(
        `${
          Globals.API_BASE_URL
        }/api/events/timetable?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch timetable data.");
      const data = await response.json();

      setItems((prevItems) => {
        const newItemsForMonth = {};
        data.forEach((event) => {
          const eventDate = event.startTime.split("T")[0];
          if (!newItemsForMonth[eventDate]) {
            newItemsForMonth[eventDate] = [];
          }
          newItemsForMonth[eventDate].push(event);
        });

        for (const date in newItemsForMonth) {
          newItemsForMonth[date].sort(
            (a, b) => new Date(a.startTime) - new Date(b.startTime)
          );
        }

        return { ...prevItems, ...newItemsForMonth };
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentMonth) {
      loadItemsForMonth(currentMonth);
    }
  }, [currentMonth, loadItemsForMonth]);

  // --- FIX: This effect now handles both initial load and refreshing on focus ---
  useFocusEffect(
    useCallback(() => {
      const todayStr = new Date().toISOString().split("T")[0];

      // On initial focus, reset to today. On subsequent focuses, this will refresh the data.
      if (!loadedMonths.current.has(todayStr.substring(0, 7))) {
        setItems({});
        loadedMonths.current.clear();
        setSelectedDate(todayStr);
        setCurrentMonth(todayStr);
      } else {
        // If we have data, just refresh the current month silently
        const monthToRefresh = currentMonth.substring(0, 7);
        loadedMonths.current.delete(monthToRefresh);
        loadItemsForMonth(currentMonth);
      }
    }, [currentMonth, loadItemsForMonth])
  );

  const handleItemPress = (item) => {
    const isAlteredStatus =
      item.status === "Cancelled" || item.status === "Rescheduled";
    if (item.sourceTable === "OH_TimeTableAdditions" || isAlteredStatus) {
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
    setCurrentMonth(todayStr);
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

  const formatDuration = (start, end) => {
    const diffMinutes = Math.round((new Date(end) - new Date(start)) / 60000);
    if (diffMinutes >= 60) {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      const hourText = t(hours > 1 ? "hours" : "hour");
      if (minutes === 0) {
        return `${hours} ${hourText}`;
      }
      return `${hours} ${hourText} ${minutes} ${t("minutes")}`;
    }
    return `${diffMinutes} ${t("minutes")}`;
  };

  const renderItem = ({ item }) => {
    const isCancelled = item.status === "Cancelled";
    const isRescheduled = item.status === "Rescheduled";
    const isAltered = isCancelled || isRescheduled;

    const containerStyle = [
      styles.itemContainer,
      isCancelled && styles.cancelledItemContainer,
      isRescheduled && styles.rescheduledItemContainer,
      { flexDirection: isRtl ? "row-reverse" : "row" },
    ];

    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={() => handleItemPress(item)}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.itemTextName, isRtl && styles.rtlText]}>
            {item.title}
          </Text>
          <Text
            style={[styles.itemTextTime, isRtl && styles.rtlText]}
          >{`${formatTime(item.startTime)} - ${formatTime(
            item.endTime
          )}`}</Text>
          {item.location && (
            <Text style={[styles.itemTextLocation, isRtl && styles.rtlText]}>
              {item.location}
            </Text>
          )}
          {isAltered && (
            <View
              style={[
                styles.statusBadge,
                isCancelled ? styles.cancelledBadge : styles.rescheduledBadge,
                { alignSelf: isRtl ? "flex-end" : "flex-start" },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {t(`Timetable_${item.status}`, item.status)}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.itemDurationContainer}>
          <Ionicons name="time-outline" size={16} color="#5c4b33" />
          <Text style={styles.itemDurationText}>
            {formatDuration(item.startTime, item.endTime)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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

  const HeaderPlaque = () => (
    <View style={styles.headerPlaque}>
      <Text style={styles.pageTitle}>{t("Timetable_Title")}</Text>
      <Text style={styles.pageSubTitle}>{t("Timetable_SubTitle")}</Text>
      <Text style={styles.mainTitle}>{getCurrentTitle()}</Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading && (
          <ActivityIndicator style={{ marginLeft: 10 }} color="#005D8F" />
        )}
      </View>
      <ViewSwitcher
        viewMode={viewMode}
        setViewMode={setViewMode}
        t={t}
        onGoToToday={goToToday}
      />
      {viewMode === "monthly" && (
        <Calendar
          onDayPress={(day) => {
            setSelectedDate(day.dateString);
            setCurrentMonth(day.dateString);
          }}
          onMonthChange={(month) => {
            setCurrentMonth(month.dateString);
            loadItemsForMonth(month);
          }}
          markedDates={markedDates}
          current={currentMonth}
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
    </View>
  );

  return (
    <View style={styles.container}>
      <Header />

      {viewMode === "daily" ? (
        <ScrollView
          style={{ flex: 1 }}
          stickyHeaderIndices={[1]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerPlaque}>
            <Text style={styles.pageTitle}>{t("Timetable_Title")}</Text>
            <Text style={styles.pageSubTitle}>{t("Timetable_SubTitle")}</Text>
            <Text style={styles.mainTitle}>{getCurrentTitle()}</Text>
          </View>
          <ViewSwitcher
            viewMode={viewMode}
            setViewMode={setViewMode}
            t={t}
            onGoToToday={goToToday}
          />
          <DailyView
            events={items[selectedDate] || []}
            handleItemPress={handleItemPress}
            t={t}
            isRtl={isRtl}
            selectedDate={selectedDate}
          />
        </ScrollView>
      ) : (
        <FlatList
          data={items[selectedDate] || []}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            `${item.id}-${item.sourceTable}-${index}`
          }
          ListHeaderComponent={() => (
            <>
              <HeaderPlaque />
              <ViewSwitcher
                viewMode={viewMode}
                setViewMode={setViewMode}
                t={t}
                onGoToToday={goToToday}
              />
              {viewMode === "monthly" && (
                <Calendar
                  onDayPress={(day) => {
                    setSelectedDate(day.dateString);
                    setCurrentMonth(day.dateString);
                  }}
                  onMonthChange={(month) => {
                    setCurrentMonth(month.dateString);
                  }}
                  markedDates={markedDates}
                  current={currentMonth}
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
          )}
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

// --- Styles (No Changes) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fef1e6", paddingTop: 60 },
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
    justifyContent: "center",
    flexWrap: "wrap",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff8f0",
    borderBottomColor: "#e0c4a2",
    borderBottomWidth: 1,
    marginBottom: 10,
    gap: 10,
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
  listContainer: { paddingBottom: 20, flexGrow: 1 },
  itemContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginTop: 12,
    marginHorizontal: 10,
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
  cancelledItemContainer: {
    borderLeftColor: "#dc3545",
    backgroundColor: "#fff5f5",
  },
  rescheduledItemContainer: {
    borderLeftColor: "#ffc107",
    backgroundColor: "#fffcf2",
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
    minHeight: 1600,
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
    justifyContent: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    backgroundColor: "#005D8F",
    paddingRight: 4,
    overflow: "hidden",
  },
  cancelledEventBlock: { backgroundColor: "#dc3545", borderColor: "#b02a37" },
  rescheduledEventBlock: { backgroundColor: "#ffc107", borderColor: "#d39e00" },
  eventBlockText: { color: "white" },
  rescheduledEventText: { color: "black" },
  eventBlockTitle: { fontWeight: "bold", fontSize: 18 },
  eventBlockTime: { fontSize: 14, marginTop: 2, opacity: 0.9 },
  eventBlockLocation: {
    fontSize: 14,
    marginTop: 2,
    fontStyle: "italic",
    opacity: 0.9,
  },
  eventBlockStatus: { fontSize: 14, fontWeight: "bold", marginTop: 4 },
  cancelledText: { textDecorationLine: "line-through", opacity: 0.7 },
  statusBadge: {
    marginTop: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  cancelledBadge: { backgroundColor: "#dc3545" },
  rescheduledBadge: { backgroundColor: "#ffc107" },
  statusBadgeText: { fontSize: 14, fontWeight: "bold", color: "white" },
  weekSelectorContainer: {
    flexDirection: "column",
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    elevation: 2,
    width: "95%",
    alignSelf: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0c4a2",
  },
  weekRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0c4a2",
  },
  weekDayButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRightWidth: 1,
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
  modalCloseButton: {
    paddingHorizontal: 10,
  },
});

export default TimetableScreen;
