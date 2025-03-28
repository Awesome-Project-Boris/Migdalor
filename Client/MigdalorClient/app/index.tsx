import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';


import MainMenuButtons from '@/components/MainMenuButtons';
import { MainMenuEditProvider, useMainMenuEdit } from '../context/MainMenuEditProvider';
import FlipButton from "../../MigdalorClient/components/FlipButton";
import BottomSheetComponent from '../components/BottomSheetMain';
import Greeting from "../components/MainMenuHelloNameplate";
import Header from "../components/Header";

function EditToggleButton() {
  const { editing, setEditing } = useMainMenuEdit();
  
  if (!editing)
  {
    return null;
  }

  return (
    <FlipButton 
    text="כניסה"
    bgColor="#f0f0f0"
    textColor="#000000"
    
    onPress={() => setEditing(prev => !prev)} style={styles.toggleButton}>
      <Text style={styles.toggleButtonText}> סיימתי להזיז את הכפתורים</Text>
    </FlipButton>
  );
} 


export default function Index() {

  const bottomSheetRef = useRef<any>(null);

  const openSheet = () => {
    console.log('Opening sheet...');
    bottomSheetRef.current?.openSheet();
  };

  return (
    <MainMenuEditProvider>
      <View style={styles.container}>
        <Header onOpenSheet={openSheet} />
        <Greeting />
        <EditToggleButton />
        <MainMenuButtons />
        <BottomSheetComponent ref={bottomSheetRef} />
      </View>
    </MainMenuEditProvider>
  );
}


const styles = StyleSheet.create({
  container: {
    flex:1 ,
    alignItems: 'center',
    paddingTop: 50,
    backgroundColor: "#fbe6d0"
  },
  toggleButton: {
    width: 300,
    height: 70,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
  },
  toggleButtonText: {
    color: '#000000',
    fontSize: 24,
  },
  openButton: {
    width: 150,
    height: 50,
    backgroundColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  openButtonText: {
    fontSize: 18,
    color: '#000',
  },
});
