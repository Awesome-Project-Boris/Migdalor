import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MainMenuButtons from '@/components/MainMenuButtons';
import { MainMenuEditProvider, useMainMenuEdit } from '../context/MainMenuEditProvider';
import FlipButton from "../../MigdalorClient/components/FlipButton";

function EditToggleButton() {
  const { editing, setEditing } = useMainMenuEdit();
  return (
    <FlipButton
    text="כניסה"
    bgColor="#FF7F50"
    textColor="#013220"
    onPress={() => setEditing(prev => !prev)} style={styles.toggleButton}>
      <Text style={styles.toggleButtonText}>{editing ? 'Done' : 'Edit'}</Text>
    </FlipButton>
  );
} 



export default function Index() {
  return (
    <MainMenuEditProvider>
      <View style={styles.container}>
        {/* Edit button above the list */}
        <EditToggleButton />
        <MainMenuButtons />
      </View>
    </MainMenuEditProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50,
  },
  toggleButton: {
    width: 100,
    height: 40,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'gray',
    borderRadius: 8,
    alignSelf: 'center',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
