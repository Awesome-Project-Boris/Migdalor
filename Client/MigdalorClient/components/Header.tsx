import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname, Href } from "expo-router";
import { useBottomSheet } from "./BottomSheetMain";
import { useNotifications } from "@/context/NotificationsContext";
import { useTranslation } from "react-i18next";
import StyledText from "@/components/StyledText";
import { useAuth } from "@/context/AuthProvider";

// 1. Define the expected structure of the user object for this file
interface User {
  personRole: string;
}

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { openSheet } = useBottomSheet();
  const { t } = useTranslation();
  const { notificationStatus } = useNotifications();
  // 2. Tell TypeScript to treat the 'user' from useAuth as our defined User type
  const { user } = useAuth() as { user: User | null };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const settingsPaths = [
    "/FontSettings",
    "/LanguageSettings",
    "/NotificationSettings",
  ];
  const showBackButton =
    router.canGoBack() && !settingsPaths.includes(pathname);

  const handleBellPress = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleNavigation = (
    key: "listings" | "notices" | "events",
    path: Href
  ) => {
    router.push(path);
    setIsDrawerOpen(false);
  };

  return (
    <>
      <View style={styles.container}>
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
              onPress={() => router.replace("/MainMenu")}
              style={styles.border}
            >
              <Ionicons name="home" size={32} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.rightContainer}>
            {/* 3. This check now works without error */}
            {user && user.personRole !== "Instructor" && (
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
            )}
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
              <View
                style={[styles.notificationItem, styles.noNotificationItem]}
              >
                <StyledText style={styles.notificationText}>
                  {t("Notifications_NoNew")}
                </StyledText>
              </View>
            )}
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
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
    // top: 60 is no longer needed, it will appear below the header naturally
    left: 0,
    right: 0,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
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
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 10,
  },
});

export default Header;
