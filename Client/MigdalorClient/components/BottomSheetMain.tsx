import React, { forwardRef, useMemo, useRef, useImperativeHandle } from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FlipButton from "./FlipButton";
import { useMainMenuEdit } from "@/context/MainMenuEditProvider";
import { usePathname, useRouter } from "expo-router";

const SCREEN_WIDTH = Dimensions.get("window").width;

const BottomSheetComponent = forwardRef((props, ref) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { editing, setEditing } = useMainMenuEdit();
  const pathname = usePathname();
  const router = useRouter();

  const snapPoints = useMemo(() => ["40%"], []);

  useImperativeHandle(ref, () => ({
    openSheet: () => bottomSheetRef.current?.snapToIndex(0),
    closeSheet: () => bottomSheetRef.current?.close(),
  }));

  console.log("Current pathname:", pathname);

  return (
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
            onPress={() => console.log("Menu 1 pressed")}
            bgColor="#4CAF50"
            textColor="#ffffff"
          >
            <Ionicons name="home" size={32} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>בית</Text>
          </FlipButton>

          <FlipButton
            style={styles.button}
            // onPress={() => router.navigate("./GeneralSettings")}
            onPress={() => router.navigate("./GeneralSettings")}
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
          { pathname === "/" && (
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
              name="settings"
              size={32}
              color="#fff"
              style={styles.icon}
            />
            <Text style={styles.buttonText}>הגדרות</Text>
          </FlipButton>
          )}
        </View>

        {/* Row 2 */}
        <View style={styles.row}>
          <FlipButton
            style={styles.button}
            onPress={() => {
              console.log("Menu 3 pressed");
              router.replace("../LoginScreen");
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
              <MaterialCommunityIcons
                name="menu-swap-outline"
                size={32}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>שנה סדר תפריט</Text>
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
    textAlign: "center",
  },
});

export default BottomSheetComponent;
