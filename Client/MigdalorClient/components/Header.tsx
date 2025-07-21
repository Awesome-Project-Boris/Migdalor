import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname, Href } from "expo-router";
import { useBottomSheet } from "./BottomSheetMain";
import { useNotifications } from "@/context/NotificationsContext";
import { useTranslation } from "react-i18next";
import StyledText from "@/components/StyledText";

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { openSheet } = useBottomSheet();
  const { t } = useTranslation();
  const { notificationStatus, updateLastVisited } = useNotifications();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const showBackButton = router.canGoBack();

  // --- MODIFIED: This function now ONLY toggles the drawer ---
  const handleBellPress = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  // This function correctly handles dismissing a single category on navigation
  const handleNavigation = (
    key: "listings" | "notices" | "events",
    path: Href
  ) => {
    router.push(path);
    // updateLastVisited(key); // This is now handled in page
    setIsDrawerOpen(false); // Closes the drawer
  };

  return (
    <>
      <View style={styles.header}>
        <View style={styles.leftContainer}>
          {showBackButton && (
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.backButton, styles.border]}
            >
              <Ionicons name="arrow-back" size={32} color="#000" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => router.navigate("/MainMenu")}
            style={styles.border}
          >
            <Ionicons name="home" size={32} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.rightContainer}>
          <TouchableOpacity onPress={handleBellPress} style={styles.border}>
            <Ionicons
              name={
                notificationStatus.total > 0
                  ? "notifications"
                  : "notifications-outline"
              }
              size={32}
              color="#000"
            />
            {notificationStatus.total > 0 && (
              <View style={styles.notificationBadge} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={openSheet}
            style={[styles.border, styles.menuButton]}
          >
            <Ionicons name="menu" size={32} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {isDrawerOpen && (
        <View style={styles.drawer}>
          {notificationStatus.total > 0 ? (
            <>
              {notificationStatus.listings && (
                <TouchableOpacity
                  style={styles.notificationItem}
                  onPress={() => handleNavigation("listings", "/Marketplace")}
                >
                  <StyledText style={styles.notificationText}>
                    {t("Notifications_NewListing")}
                  </StyledText>
                </TouchableOpacity>
              )}
              {notificationStatus.notices && (
                <TouchableOpacity
                  style={styles.notificationItem}
                  onPress={() => handleNavigation("notices", "/Notices")}
                >
                  <StyledText style={styles.notificationText}>
                    {t("Notifications_NewNotice")}
                  </StyledText>
                </TouchableOpacity>
              )}
              {notificationStatus.events && (
                <TouchableOpacity
                  style={styles.notificationItem}
                  onPress={() => handleNavigation("events", "/Activities")}
                >
                  <StyledText style={styles.notificationText}>
                    {t("Notifications_NewEvent")}
                  </StyledText>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={[styles.notificationItem, styles.noNotificationItem]}>
              {/* --- MODIFIED --- */}
              <StyledText style={styles.notificationText}>
                {t("Notifications_NoNew")}
              </StyledText>
            </View>
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 1000,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 20,
  },
  border: {
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    marginLeft: 15,
  },
  notificationBadge: {
    position: "absolute",
    right: 5,
    top: 5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "red",
    borderWidth: 1,
    borderColor: "#fff",
  },
  drawer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    zIndex: 999,
    padding: 5,
  },
  notificationItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  noNotificationItem: {
    alignItems: "center",
  },
  notificationText: {
    fontSize: 16,
  },
});

export default Header;
