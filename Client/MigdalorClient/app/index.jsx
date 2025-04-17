import React, { useRef, useEffect, useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";

import MainMenuButtons from "@/components/MainMenuButtons";
import { useMainMenuEdit } from "../context/MainMenuEditProvider";
import FlipButton from "../components/FlipButton";
import Greeting from "../components/MainMenuHelloNameplate";
import Header from "../components/Header";
import { EditToggleButton } from "../components/MainMenuFinishEditButton";
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from 'toastify-react-native';

const initialDataStructure = [
  { key: 'menu0', name: 'עריכת פרופיל', destination: 'EditProfile' },
  { key: 'menu1', name: 'פרופיל', destination: 'Profile' },
  { key: 'menu2', name: 'חוגים ופעילויות', destination: '' },
  { key: 'menu3', name: 'שוק', destination: 'Marketplace' },
  { key: 'menu4', name: 'וועד', destination: 'CommittieePage' },
  { key: 'menu5', name: 'שעות פעילות', destination: '' },
  { key: 'menu6', name: 'מפה', destination: 'Map' },
  { key: 'menu7', name: 'לוח מודעות', destination: 'Notices' },
  { key: 'menu8', name: 'רשימת הדיירים', destination: 'ResidentList' },
  { key: 'menu9', name: 'Menu 9', destination: '' }, 
];

const ASYNC_STORAGE_KEY = 'mainMenuOrder';

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

export default function Index() {

  const [buttonData, setButtonData] = useState([]);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const { editing, setEditing } = useMainMenuEdit();

  const latestButtonDataRef = useRef(initialDataStructure); // ref for latest buttons order

  const prevEditingRef = useRef(editing); // prev ref for DEBUG

  useEffect(() => {
    const loadOrder = async () => {
      console.log("[LOAD ORDER] Running loadOrder effect...");
      setIsLoadingOrder(true);
      let finalData = initialDataStructure; // Default to initial
      try {
        const savedOrderJson = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
        console.log("[LOAD ORDER] Raw data from AsyncStorage:", savedOrderJson);
        if (savedOrderJson !== null) {
          const savedKeys = JSON.parse(savedOrderJson);
          console.log("[LOAD ORDER] Parsed saved keys:", savedKeys);
          const orderedData = savedKeys.map(key =>
            initialDataStructure.find(item => item.key === key)
          ).filter(item => item !== undefined);
          console.log("[LOAD ORDER] Reordered data based on keys:", orderedData.map(i => i.key));
          const currentKeys = new Set(orderedData.map(item => item.key));
          const newItems = initialDataStructure.filter(item => !currentKeys.has(item.key));
          if (newItems.length > 0) {
             console.log("[LOAD ORDER] Found new items:", newItems.map(i => i.key));
          }
          finalData = [...orderedData, ...newItems]; // Update finalData if loaded
        } else {
          console.log("[LOAD ORDER] No saved order found, using initial structure.");
        }
      } catch (error) {
        console.error("[LOAD ORDER] Failed to load/parse menu order:", error);
        // Keep finalData as initialDataStructure
      } finally {
         console.log("[LOAD ORDER] Setting state and ref with keys:", finalData.map(i => i.key));
         setButtonData(finalData); // Set state for rendering
         latestButtonDataRef.current = finalData; // *** ALSO UPDATE THE REF ***
         setIsLoadingOrder(false);
         console.log("[LOAD ORDER] Finished loading.");
      }
    };
    loadOrder();
  }, []);

  useEffect(() => {
    return () => {
      console.log("Index unmounting, ensuring editing is false.");
      setEditing(false);
    };
  }, [setEditing]);

  // --- Callback for DraggableFlatList ---
  const handleDragEnd = useCallback(({ data: reorderedData }) => {
    console.log("Order changed via drag. Received keys:", reorderedData.map(i => i.key)); // Log received data
    setButtonData(reorderedData); // Update state for next render
    latestButtonDataRef.current = reorderedData; // Update ref
    console.log("Ref updated immediately. Ref keys:", latestButtonDataRef.current.map(i => i.key));
  }, []);

  // --- Function to Save Order ---
  const saveOrder = async () => {
    if (isLoadingOrder) { console.warn("Attempted save while loading."); return; }
    const currentOrderToSave = latestButtonDataRef.current;
    const orderKeysToSave = currentOrderToSave.map(item => item.key);
    console.log("Saving menu order (from ref):", orderKeysToSave);
    try {
       await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(orderKeysToSave));
       Toast.show({ type: 'success', text1: 'Menu order saved!', position: 'bottom', visibilityTime: 2000});
    } catch (error) {
       console.error("Failed to save menu order:", error);
       Toast.show({ type: 'error', text1: 'Failed to save order', position: 'bottom'});
    }
 };

 useEffect(() => {
  // Check if editing has just changed from true to false
  if (prevEditingRef.current === true && editing === false) {
     console.log("Detected end of editing, calling saveOrder...");
     saveOrder();
  }
  // Update previous value ref for the next render cycle
  prevEditingRef.current = editing;
}, [editing]);

  if (isLoadingOrder) {
    return (
       <View style={[styles.container, { justifyContent: 'center' }]}>
           <ActivityIndicator size="large" color="#006aab" />
           <Text>Loading menu...</Text>
       </View>
    )
 }

  return (
    <View style={styles.container}>
      <Header />
      <Greeting />
      {showDevButton && (
        <FlipButton
          text="View All Data"
          bgColor="#fbbf24"
          textColor="black"
          style={styles.toggleButton}
          flipborderwidth={5}
          onPress={viewAllData}
        ></FlipButton>
      )}
      <EditToggleButton onSave={saveOrder} />
      <MainMenuButtons data={buttonData} onDragEnd={handleDragEnd} />
    </View>
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
