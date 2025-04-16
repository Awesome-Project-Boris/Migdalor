import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useBottomSheet } from './BottomSheetMain'; // adjust the path if needed

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { openSheet } = useBottomSheet(); // Get the openSheet function from context

  // Show the back button only if we're not on the home page
  const showBackButton = pathname !== "/MainMenu";

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
      {showBackButton && (
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, styles.border]}>
            <Ionicons name="arrow-back" size={32} color="#000" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => router.navigate("/MainMenu")} style= {styles.border}>
          <Ionicons name="home" size={32} color="#000" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={openSheet} style= {styles.border}>
        <Ionicons name="menu" size={32} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 1000,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginLeft: 5,
    marginRight: 20,
  },
  border:
  {
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5
  
  }
});

export default Header;
