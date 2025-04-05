// 32.310652, 34.895735 entrance 

// Map.jsx
import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'; 

const { width, height } = Dimensions.get('window');


const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922; 
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO; // horizonal zoom

// Coordinates for Hadera, Israel (as an example starting point based on context)
const INITIAL_POSITION = {
  latitude: 32.310652,
  longitude: 34.895735,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

const Map = () => {
  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE} 
        style={styles.map}
        mapType="satellite" 
        initialRegion={INITIAL_POSITION} 
        showsUserLocation={true} // Show the user's blue dot (requires permission)
        showsMyLocationButton={true} // Show button to jump to user's location (requires permission)
      >
        {/* We will add Polygons, Markers, etc. here later */}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject, // Make the container fill the screen
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject, // Make the map fill the container
  },
});

export default Map;