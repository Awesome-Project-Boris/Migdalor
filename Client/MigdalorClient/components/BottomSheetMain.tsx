import React, { useRef, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function BottomSheetComponent() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  const openSheet = () => {
    console.log('Opening sheet...');
    bottomSheetRef.current?.expand();
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Button to open the bottom sheet */}
        <TouchableOpacity style={styles.openButton} onPress={openSheet}>
          <Text style={styles.openButtonText}>Open Bottom Sheet</Text>
        </TouchableOpacity>
        {/* Bottom Sheet */}
        <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={snapPoints}>
          <View style={styles.sheetContent}>
            <Text style={styles.sheetText}>Hello from the Bottom Sheet!</Text>
          </View>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  openButton: {
    backgroundColor: '#007aff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 20,
  },
  openButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  sheetContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sheetText: {
    fontSize: 16,
    color: '#333',
  },
});
