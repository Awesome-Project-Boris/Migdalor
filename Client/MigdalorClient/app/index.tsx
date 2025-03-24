import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MainMenuButtons from '@/components/MainMenuButtons';
import { MainMenuEditProvider, useMainMenuEdit } from '../context/MainMenuEditProvider';
import FlipButton from "../../MigdalorClient/components/FlipButton";
import BottomSheetComponent from '../components/BottomSheetMain';

import Greeting from "../components/MainMenuHelloNameplate";

function EditToggleButton() {
  const { editing, setEditing } = useMainMenuEdit();
  return (
    <FlipButton
    text="כניסה"
    bgColor="#f0f0f0"
    textColor="#000000"
    
    onPress={() => setEditing(prev => !prev)} style={styles.toggleButton}>
      <Text style={styles.toggleButtonText}>{editing ? 'Done' : 'Edit'}</Text>
    </FlipButton>
  );
} 


export default function Index() {
  return (
    
    <MainMenuEditProvider>
      <View style={styles.container}>
        <Greeting />
        <EditToggleButton />
        <MainMenuButtons />
      </View>
      <BottomSheetComponent />
    </MainMenuEditProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 50,
    backgroundColor: "#fbe6d0"
  },
  toggleButton: {
    width: 100,
    height: 40,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  toggleButtonText: {
    color: '#000000',
    fontSize: 16,
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
