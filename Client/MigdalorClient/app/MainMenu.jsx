import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { Stack } from "expo-router";

import MainMenuButtons from "@/components/MainMenuButtons";
import { useMainMenuEdit } from "../context/MainMenuEditProvider";
import FlipButton from "../components/FlipButton";
import Greeting from "../components/MainMenuHelloNameplate";
import Header from "../components/Header";
import { EditToggleButton } from "../components/MainMenuFinishEditButton";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "toastify-react-native";
import { useTranslation } from "react-i18next";

const ASYNC_STORAGE_KEY = "mainMenuOrder";

const showDevButton = true;

const viewAllData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const result = await AsyncStorage.multiGet(keys);
    if (result.length === 0) {
      console.log("No data found in AsyncStorage.");
      return;
    }
    result.forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });

    return result;
  } catch (error) {
    console.error("Error viewing AsyncStorage data:", error);
  }
};

const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    console.log("AsyncStorage cleared successfully.");
  } catch (error) {
    console.error("Error clearing AsyncStorage:", error);
  }
};

export default function Index() {
  const { t } = useTranslation();
  const [buttonData, setButtonData] = useState([]);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const { editing, setEditing } = useMainMenuEdit();

  const latestButtonDataRef = useRef(initialDataStructure);
  const prevEditingRef = useRef(editing);

  const initialDataStructure = [
    {
      key: "menu1",
      name: t("MainMenuScreen_GoodMorningButton"),
      destination: "GoodMorningProcedure",
    },
    {
      key: "menu2",
      name: t("MainMenuScreen_ProfileButton"),
      destination: "Profile",
    },
    {
      key: "menu3",
      name: t("MainMenuScreen_ActivitiesAndClassesButton"),
      destination: "",
    },
    {
      key: "menu4",
      name: t("MainMenuScreen_MarketplaceButton"),
      destination: "Marketplace",
    },
    {
      key: "menu5",
      name: t("MainMenuScreen_ResidentsCommitteeButton"),
      destination: "CommittieePage",
    },
    {
      key: "menu6",
      name: t("MainMenuScreen_ActivityHoursButton"),
      destination: "OpeningHours",
    },
    { key: "menu7", name: t("MainMenuScreen_MapButton"), destination: "Map" },
    {
      key: "menu8",
      name: t("MainMenuScreen_NoticeBoardButton"),
      destination: "Notices",
    },
    {
      key: "menu9",
      name: t("MainMenuScreen_ResidentListButton"),
      destination: "ResidentList",
    },
  ];

  useEffect(() => {
    const loadOrder = async () => {
      console.log("Loading menu order...");
      setIsLoadingOrder(true);
      let finalData = initialDataStructure;
      try {
        const savedOrderJson = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
        if (savedOrderJson !== null) {
          const savedKeys = JSON.parse(savedOrderJson);
          const orderedData = savedKeys
            .map((key) => initialDataStructure.find((item) => item.key === key))
            .filter((item) => item !== undefined);
          const currentKeys = new Set(orderedData.map((item) => item.key));
          const newItems = initialDataStructure.filter(
            (item) => !currentKeys.has(item.key)
          );
          finalData = [...orderedData, ...newItems];
        } else {
          console.log("No saved menu order found.");
        }
      } catch (error) {
        console.error("Failed to load menu order:", error);
      } finally {
        setButtonData(finalData);
        latestButtonDataRef.current = finalData;
        setIsLoadingOrder(false);
        console.log("Finished loading menu order.");
      }
    };
    loadOrder();
  }, []);

  useEffect(() => {
    return () => {
      setEditing(false);
    };
  }, [setEditing]);

  const handleDragEnd = useCallback(({ data: reorderedData }) => {
    setButtonData(reorderedData);
    latestButtonDataRef.current = reorderedData;
  }, []);

  const saveOrder = async () => {
    if (isLoadingOrder) return;
    const currentOrderToSave = latestButtonDataRef.current;
    const orderKeysToSave = currentOrderToSave.map((item) => item.key);
    console.log("Saving menu order keys:", orderKeysToSave);
    try {
      await AsyncStorage.setItem(
        ASYNC_STORAGE_KEY,
        JSON.stringify(orderKeysToSave)
      );
      Toast.show({
        type: "success",
        text1: t("MainMenuScreen_saveOrderSuccess"),
        position: "bottom",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Failed to save menu order:", error);
      Toast.show({
        type: "error",
        text1: t("MainMenuScreen_saveOrderFailure"),
        position: "bottom",
      });
    }
  };

  useEffect(() => {
    if (prevEditingRef.current === true && editing === false) {
      saveOrder();
    }
    prevEditingRef.current = editing;
  }, [editing]);

  if (isLoadingOrder) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#006aab" />
        <Text>{t("MainMenuScreen_loadingMenu")}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Header />
        <Greeting />
        {showDevButton && (
          <>
            <FlipButton
              text={t("Common_viewAllDataButton")}
              bgColor="#fbbf24"
              textColor="black"
              style={styles.toggleButton}
              flipborderwidth={5}
              onPress={viewAllData}
            />
            <FlipButton
              text={t("Common_clearAllDataButton")}
              bgColor="#fbbf24"
              textColor="black"
              style={styles.toggleButton}
              flipborderwidth={5}
              onPress={clearAllData}
            />
          </>
        )}
        <EditToggleButton onSave={saveOrder} />
        <MainMenuButtons data={buttonData} onDragEnd={handleDragEnd} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 50,
    backgroundColor: "#fbe6d0",
  },
  toggleButton: {
    width: 300,
    height: 70,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
  },
  toggleButtonText: {
    color: "#000000",
    fontSize: 24,
  },
  openButton: {
    width: 150,
    height: 50,
    backgroundColor: "#ccc",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  openButtonText: {
    fontSize: 18,
    color: "#000",
  },
});
