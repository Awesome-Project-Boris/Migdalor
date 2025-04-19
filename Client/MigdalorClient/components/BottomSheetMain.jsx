import React, { createContext, useContext, useRef, useMemo } from "react";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FlipButton from "./FlipButton";
import { useMainMenuEdit } from "@/context/MainMenuEditProvider";
import { Link, usePathname, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

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
  const bottomSheetRef = useRef(null);
  const { editing, setEditing } = useMainMenuEdit();
  const pathname = usePathname();
  const router = useRouter();

  const snapPoints = useMemo(() => ["50%"], []);

  const openSheet = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };

  const closeSheet = () => {
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
          {/* Row 1 */}
          <View style={styles.row}>
            <FlipButton
              style={styles.button}
              onPress={() => {
                router.navigate("/");
                bottomSheetRef.current?.close();
                console.log("Menu 1 pressed");
              }}
              bgColor="#4CAF50"
              textColor="#ffffff"
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
            </FlipButton>

            <FlipButton
              style={styles.button}
              onPress={() => {
                router.navigate("./FontSettings");
                setEditing(false);
                bottomSheetRef.current?.close();
              }}
              bgColor="#4CAF50"
              textColor="#ffffff"
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
            </FlipButton>
          </View>

          {/* Row 2 */}
          <View style={styles.row}>
            <FlipButton
              style={styles.button}
              onPress={() => {
                console.log("Menu 3 pressed");
                setEditing(false);
                router.navigate("Profile");
                bottomSheetRef.current?.close();
              }}
              bgColor="#4CAF50"
              textColor="#ffffff"
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
            </FlipButton>

            {pathname === "/MainMenu" && (
              <FlipButton
                style={styles.button}
                onPress={() => {
                  setEditing(true);
                  bottomSheetRef.current?.close();
                }}
                bgColor="#4CAF50"
                textColor="#ffffff"
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
              </FlipButton>
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
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 16,
  },
  button: {
    width: SCREEN_WIDTH * 0.42,
    height: 145,
    backgroundColor: "#4CAF50",
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