// App.tsx
import React, { useRef, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function App() {
  // Create a ref to control the BottomSheet
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Define snap points for the BottomSheet (here 25% and 50% of screen height)
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  // Function to open the BottomSheet
  const openSheet = () => {
    console.log('Opening sheet...');
    bottomSheetRef.current?.expand();
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Main page content */}
      <View style={styles.content}>
        <TouchableOpacity style={styles.button} onPress={openSheet}>
          <Text style={styles.buttonText}>Open Bottom Sheet</Text>
        </TouchableOpacity>
      </View>

      {/* The BottomSheet component */}
      <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={snapPoints}>
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetText}>Hello from the Bottom Sheet!</Text>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007aff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  sheetContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sheetText: {
    fontSize: 16,
    color: '#333',
  },
});
