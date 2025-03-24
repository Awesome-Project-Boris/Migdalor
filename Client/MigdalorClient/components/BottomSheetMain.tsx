import React, {
    forwardRef,
    useMemo,
    useRef,
    useImperativeHandle,
  } from 'react';
  import {
    View,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Text,
  } from 'react-native';
  import BottomSheet, {
    BottomSheetView,
    BottomSheetBackdrop,
  } from '@gorhom/bottom-sheet';
  import { Ionicons } from '@expo/vector-icons';
  
  const SCREEN_WIDTH = Dimensions.get('window').width;
  
  const BottomSheetComponent = forwardRef((props, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
  
    // Snap point: 40% of screen height (adjust as needed)
    const snapPoints = useMemo(() => ['40%'], []);
  
    // Expose open/close methods
    useImperativeHandle(ref, () => ({
      openSheet: () => bottomSheetRef.current?.snapToIndex(0),
      closeSheet: () => bottomSheetRef.current?.close(),
    }));
  
    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1} // start hidden
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={(backdropProps) => (
          <BottomSheetBackdrop
            {...backdropProps}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close" // close when tapping outside
          />
        )}
      >
        <BottomSheetView style={styles.sheetContent}>
          {/* 2x2 grid of buttons */}
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => console.log('Menu 1 pressed')}
              activeOpacity={0.6}
            >
              <Ionicons name="home" size={32} color="#fff" style={styles.icon} />
              <Text style={styles.buttonText}>Home/בית</Text>
            </TouchableOpacity>
  
            <TouchableOpacity
              style={styles.button}
              onPress={() => console.log('Menu 2 pressed')}
              activeOpacity={0.6}
            >
              <Ionicons name="settings" size={32} color="#fff" style={styles.icon} />
              <Text style={styles.buttonText}>Options/הגדרות</Text>
            </TouchableOpacity>
          </View>
  
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => console.log('Menu 3 pressed')}
              activeOpacity={0.6}
            >
              <Ionicons name="person" size={32} color="#fff" style={styles.icon} />
              <Text style={styles.buttonText}>Profile/פרופיל</Text>
            </TouchableOpacity>
  
            <TouchableOpacity
              style={styles.button}
              onPress={() => console.log('Menu 4 pressed')}
              activeOpacity={0.6}
            >
              <Ionicons
                name="information-circle"
                size={32}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>Rearrange/סדר כפתורים מחדש</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  });
  
  const styles = StyleSheet.create({
    sheetContent: {
      flex: 1,
      padding: 16,
      // We don't center here so the rows can space themselves
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      marginBottom: 16,
    },
    button: {
      width: SCREEN_WIDTH * 0.35, // Adjust as needed
      height: 100,
      backgroundColor: '#4CAF50',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    icon: {
      marginBottom: 8,
    },
    buttonText: {
      fontSize: 18,
      color: '#fff',
    },
  });
  
  export default BottomSheetComponent;
  