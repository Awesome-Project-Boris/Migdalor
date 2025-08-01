import React, { createContext, useContext, useRef, useMemo } from "react";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FlipButtonSizeless from "./FlipButtonSizeless";
import { useMainMenuEdit } from "@/context/MainMenuEditProvider";
import { usePathname, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthProvider";
import { Globals } from "@/app/constants/Globals";


const SCREEN_WIDTH = Dimensions.get("window").width;

const BottomSheetContext = createContext(undefined);

export const useBottomSheet = () => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error("useBottomSheet must be used within a BottomSheetProvider");
  }
  return context;
};

export const BottomSheetProvider = ({ children }) => {
  const { t } = useTranslation();
  const isRTL = Globals.userSelectedDirection === "rtl"; 

  const bottomSheetRef = useRef(null);
  const { editing, setEditing } = useMainMenuEdit();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const snapPoints = useMemo(() => ["50%"], []);

  const openSheet = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };

  const closeSheet = () => {
    bottomSheetRef.current?.close();
  };

  const handleProfileNavigation = () => {
    if (user?.personRole === "Instructor") {
      router.navigate("InstructorProfile");
    } else {
      router.navigate("Profile");
    }
    bottomSheetRef.current?.close();
  };

  return (
    <BottomSheetContext.Provider value={{ openSheet, closeSheet }}>
      {children}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={(backdropProps) => (
          <BottomSheetBackdrop
            {...backdropProps}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close"
          />
        )}
      >
        <BottomSheetView style={styles.sheetContent}>
          {/* Row 1: Apply dynamic flexDirection */}
          <View style={[styles.row, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            {pathname !== "/MainMenu" && user?.personRole !== "Instructor" && (
              <FlipButtonSizeless
                style={styles.button}
                onPress={() => {
                  router.navigate("/");
                  bottomSheetRef.current?.close();
                }}
                bgColor={styles.button.backgroundColor}
                textColor={styles.button.color}
                flipborderwidth={3}
              >
                <Ionicons
                  name="home"
                  size={45}
                  color="#fff"
                  style={styles.icon}
                />
                <Text style={styles.buttonText}>
                  {t("SettingsPopup_HomeButton")}
                </Text>
              </FlipButtonSizeless>
            )}

            <FlipButtonSizeless
              style={styles.button}
              onPress={() => {
                router.replace("/FontSettings");
                setEditing(false);
                bottomSheetRef.current?.close();
              }}
              bgColor={styles.button.backgroundColor}
              textColor={styles.button.color}
              flipborderwidth={3}
            >
              <Ionicons
                name="settings"
                size={45}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>
                {t("SettingsPopup_SettingsButton")}
              </Text>
            </FlipButtonSizeless>
          </View>

          {/* Row 2: Apply dynamic flexDirection */}
          <View style={[styles.row, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <FlipButtonSizeless
              style={styles.button}
              onPress={handleProfileNavigation}
              bgColor={styles.button.backgroundColor}
              textColor={styles.button.color}
              flipborderwidth={3}
            >
              <Ionicons
                name="person"
                size={45}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>
                {t("SettingsPopup_ProfileButton")}
              </Text>
            </FlipButtonSizeless>

            {pathname === "/MainMenu" && user?.personRole !== "Instructor" && (
              <FlipButtonSizeless
                style={styles.button}
                onPress={() => {
                  setEditing(true);
                  bottomSheetRef.current?.close();
                }}
                bgColor={styles.button.backgroundColor}
                textColor={styles.button.color}
                flipborderwidth={3}
              >
                <MaterialCommunityIcons
                  name="menu-swap-outline"
                  size={45}
                  color="#fff"
                  style={styles.icon}
                />
                <Text style={styles.buttonText}>
                  {t("SettingsPopup_ChangeLayoutButton")}
                </Text>
              </FlipButtonSizeless>
            )}
          </View>
        </BottomSheetView>
      </BottomSheet>
    </BottomSheetContext.Provider>
  );
};

const styles = StyleSheet.create({
  sheetContent: {
    flex: 1,
    padding: 10,
  },
  row: {
    // The base direction is now set dynamically inline
    justifyContent: "space-evenly",
    alignItems: "center",
    marginBottom: 16,
  },
  button: {
    width: SCREEN_WIDTH * 0.42,
    height: 145,
    backgroundColor: "#00b5d9",
    color: "#fff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 18,
    textAlign: "center",
  },
});

export default BottomSheetProvider;
