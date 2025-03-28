import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

interface HeaderProps {
  onOpenSheet: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSheet }) => {
  const router = useRouter();
  const pathname = usePathname();

  // We'll display both a Home and a Back button on the left.
  // The Home button always navigates to "/", and the Back button navigates back only once.
  const showBackButton = pathname !== "/";

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {/* Home Button */}
        <TouchableOpacity onPress={() => router.push("/")}>
          <Ionicons name="home" size={32} color="#000" />
        </TouchableOpacity>
        {/* Back Button: Only visible if the current pathname isn't "/" */}
        {showBackButton && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={32} color="#000" />
          </TouchableOpacity>
        )}
      </View>
      {/* Burger (menu) Button */}
      <TouchableOpacity onPress={onOpenSheet}>
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
    height: 60, // Adjust as needed
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
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
    marginLeft: 8,
  },
});

export default Header;