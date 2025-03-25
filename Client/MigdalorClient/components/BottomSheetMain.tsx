import React, { forwardRef, useMemo, useRef, useImperativeHandle } from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";
 

import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import FlipButton from "./FlipButton"; // your custom button
import { useMainMenuEdit } from "@/context/MainMenuEditProvider";
import { usePathname } from "expo-router";


const SCREEN_WIDTH = Dimensions.get("window").width;

const BottomSheetComponent = forwardRef((props, ref) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { editing, setEditing } = useMainMenuEdit();
  const pathname = usePathname();

  // Define one snap point for full open (40% of screen height)
  const snapPoints = useMemo(() => ["40%"], []);

  // Expose methods via the ref:
  useImperativeHandle(ref, () => ({
    openSheet: () => bottomSheetRef.current?.snapToIndex(0),
    closeSheet: () => bottomSheetRef.current?.close(),
  }));

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1} // hidden initially
      snapPoints={snapPoints}
      enablePanDownToClose
      // Use the default backdrop; set appearsOnIndex so it shows as soon as sheet opens (index 0)
      backdropComponent={(backdropProps) => (
        <BottomSheetBackdrop
          {...backdropProps}
          appearsOnIndex={0}    // Show backdrop as soon as sheet is open
          disappearsOnIndex={-1} // Hide when sheet is closed
          pressBehavior="close"
        />
      )}
    >
      <BottomSheetView style={styles.sheetContent}>
        {/* 2x2 grid of buttons */}
        <View style={styles.row}>
          <FlipButton
            style={styles.button}
            onPress={() => console.log("Menu 1 pressed")}
            bgColor="#4CAF50"
            textColor="#ffffff"
          >
            <Ionicons name="home" size={32} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Home/בית</Text>
          </FlipButton>

          <FlipButton
            style={styles.button}
            onPress={() => console.log("Menu 2 pressed")}
            bgColor="#4CAF50"
            textColor="#ffffff"
          >
            <Ionicons name="settings" size={32} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Options/הגדרות</Text>
          </FlipButton>
        </View>

        <View style={styles.row}>
          <FlipButton
            style={styles.button}
            onPress={() => console.log("Menu 3 pressed")}
            bgColor="#4CAF50"
            textColor="#ffffff"
          >
            <Ionicons name="person" size={32} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Profile/פרופיל</Text>
          </FlipButton>
          {pathname === "/index" && (
          <FlipButton
            style={styles.button}
            onPress={() => {
            setEditing(true);
            bottomSheetRef.current?.close();
           }}
          bgColor="#4CAF50"
          textColor="#ffffff"
          >
            <Ionicons
              name="information-circle"
              size={32}
              color="#fff"
              style={styles.icon}
            />
          <Text style={styles.buttonText}>Rearrange/סדר כפתורים מחדש</Text>
        </FlipButton>
        )}
      </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  sheetContent: {
    flex: 1,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 16,
  },
  button: {
    width: SCREEN_WIDTH * 0.35,
    height: 100,
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
    color: "#fff",
  },
});

export default BottomSheetComponent;
