import React, { createContext, useContext, useRef, useMemo } from "react";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FlipButton from "./FlipButton"; // Assuming FlipButton exists and is compatible
import { useMainMenuEdit } from "@/context/MainMenuEditProvider"; // Assuming this context exists
import { Link, usePathname, useRouter } from "expo-router";

const SCREEN_WIDTH = Dimensions.get("window").width;

// Context without TypeScript types
const BottomSheetContext = createContext(undefined);

export const useBottomSheet = () => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error("useBottomSheet must be used within a BottomSheetProvider");
  }
  return context;
};

// Component definition as a standard JavaScript function
export const BottomSheetProvider = ({ children }) => {
  const bottomSheetRef = useRef(null); // useRef without generic type
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
        index={-1} // Start closed
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
                closeSheet(); // Close sheet after navigation
                console.log("Menu 1 pressed");
              }}
              bgColor="#4CAF50"
              textColor="#ffffff"
            >
              <Ionicons
                name="home"
                size={32}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>בית</Text>
            </FlipButton>

            <FlipButton
              style={styles.button}
              onPress={() => {
                router.navigate("./FontSettings");
                setEditing(false);
                closeSheet(); // Close sheet after navigation
              }}
              bgColor="#4CAF50"
              textColor="#ffffff"
            >
              <Ionicons
                name="settings"
                size={32}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>הגדרות</Text>
            </FlipButton>
          </View>

          {/* Row 2 */}
          <View style={styles.row}>
            <FlipButton
              style={styles.button}
              onPress={() => {
                console.log("Menu 3 pressed");
                setEditing(false);
                router.navigate("LoginScreen"); // Removed 'as any'
                closeSheet(); // Close sheet after navigation
              }}
              bgColor="#4CAF50"
              textColor="#ffffff"
            >
              <Ionicons
                name="person"
                size={32}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>פרופיל</Text>
            </FlipButton>

            {pathname === "/" && (
              <FlipButton
                style={styles.button}
                onPress={() => {
                  setEditing(true);
                  closeSheet(); // Close sheet when activating edit mode
                }}
                bgColor="#4CAF50"
                textColor="#ffffff"
              >
                <MaterialCommunityIcons
                  name="menu-swap-outline"
                  size={32}
                  color="#fff"
                  style={styles.icon}
                />
                <Text style={styles.buttonText}>שנה סדר תפריט</Text>
              </FlipButton>
            )}
            {/* {true && (
              <FlipButton
                style={styles.button}
                onPress={() => {
                  setEditing(true);
                  bottomSheetRef.current?.close();
                }}
                bgColor="#000000"
                textColor="#ffffff"
              >
                <MaterialCommunityIcons
                  name="account-tie"
                  size={32}
                  color="#fff"
                  style={styles.icon}
                />
                <Text style={styles.buttonText}>תפריט ניהול</Text>
              </FlipButton>
            )} */}
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
    backgroundColor: "#4CAF50", // Default color, overridden by prop
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
    // Default color, overridden by prop
  },
});

export default BottomSheetProvider;