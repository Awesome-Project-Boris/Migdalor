import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { useMainMenuEdit } from '../context/MainMenuEditProvider';

interface MenuItem {
  key: string;
  name: string;
  destination: string; // e.g. "MarketScreen"
}

const initialData: MenuItem[] = [
  { key: 'menu1', name: 'פרופיל', destination: "" },
  { key: 'menu2', name: 'חוגים ופעילויות', destination: "" },
  { key: 'menu3', name: 'שוק', destination: "" },
  { key: 'menu4', name: 'וועד', destination: "" },
  { key: 'menu5', name: 'Menu 5', destination: "" },
  { key: 'menu6', name: 'Menu 6', destination: "" },
  { key: 'menu7', name: 'Menu 7', destination: "" },
  { key: 'menu8', name: 'Menu 8', destination: "" },
  { key: 'menu9', name: 'Menu 9', destination: "" },
];

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function MainMenuButtons() {
  const [data, setData] = useState<MenuItem[]>(initialData);
  // Get editing state from context
  const { editing } = useMainMenuEdit();
  const jiggleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (editing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(jiggleAnim, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(jiggleAnim, {
            toValue: -1,
            duration: 160,
            useNativeDriver: true,
          }),
          Animated.timing(jiggleAnim, {
            toValue: 0,
            duration: 80,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      jiggleAnim.stopAnimation();
      jiggleAnim.setValue(0);
    }
  }, [editing, jiggleAnim]);

  const rotation = jiggleAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-2deg', '2deg'],
  });

  const renderItem = ({ item, drag, isActive }: RenderItemParams<MenuItem>) => {
    const handleLongPress = editing ? drag : undefined;
    const handlePress = () => {
      if (!editing) {
        console.log('Navigating to:', item.destination);
      }
    };

    return (
      <Animated.View
        style={[
          styles.item,
          { transform: [{ rotate: editing ? rotation : '0deg' }] },
          isActive && styles.activeItem,
        ]}
      >
        <TouchableOpacity
          onLongPress={handleLongPress}
          delayLongPress={300}
          disabled={isActive}
          onPress={handlePress}
          style={styles.touchable}
        >
          <Text style={styles.itemText}>{item.name}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <DraggableFlatList
        data={data}
        onDragEnd={({ data }) => setData(data)}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    width: SCREEN_WIDTH * 0.9,
    height: 120,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    marginVertical: 8,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  touchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 24,
    color: '#fff',
  },
  activeItem: {
    opacity: 0.7,
    backgroundColor: '#388E3C',
  },
});

