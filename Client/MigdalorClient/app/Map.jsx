// Map.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  Modal,
  Button,
  // PermissionsAndroid, // No longer needed
  Platform, // Still needed for Platform.OS check potentially, but not in current location logic
  Alert,
  Linking, // Still needed for linking to settings
} from "react-native";

import MapView, { PROVIDER_GOOGLE, Polygon, Marker } from "react-native-maps";

import * as Location from "expo-location"; // Use expo-location
import pointInPolygon from "point-in-polygon";
import FlipButton from "@/components/FlipButton";

// --- Constants ---
const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
// Use the delta that worked for zoom control, adjust if needed
const INITIAL_LATITUDE_DELTA = 0.0049; // Start with a working delta
const INITIAL_LONGITUDE_DELTA = INITIAL_LATITUDE_DELTA * ASPECT_RATIO;
const MAP_CENTER_LATITUDE = 32.310441;
const MAP_CENTER_LONGITUDE = 34.895219;

// Your coordinate variables
const MapBoundsCoordinations = [
  {
    latitude: 32.312541, // top left
    longitude: 34.894063,
  },
  {
    latitude: 32.31192, // top right
    longitude: 34.896611,
  },
  {
    latitude: 32.308411, // bottom right
    longitude: 34.896262,
  },
  {
    latitude: 32.308432, // bottom left
    longitude: 34.894108,
  },
  // Make sure polygon is closed if needed
  { latitude: 32.312541, longitude: 34.894063 },
];

const boundaryPolygonForCheck = MapBoundsCoordinations.map((p) => [
  p.longitude,
  p.latitude,
]);

const buildingsCoordinations = [
  {
    id: "1",
    name: "בניין מספר אחת",
    info: "זהו הבניין הראשון שהגדרנו - בניין הכניסה",
    coordinates: [
      { latitude: 32.310919, longitude: 34.895532 },
      { latitude: 32.310909, longitude: 34.895903 },
      { latitude: 32.310824, longitude: 34.895906 },
      { latitude: 32.310824, longitude: 34.895655 },
      { latitude: 32.310532, longitude: 34.895652 },
      { latitude: 32.310533, longitude: 34.895527 },
      // Make sure polygon is closed
      { latitude: 32.310919, longitude: 34.895532 },
    ],
  },
];
// -----------------

const Map = () => {
  // --- State & Refs ---
  const [mapRegion, setMapRegion] = useState({
    latitude: MAP_CENTER_LATITUDE,
    longitude: MAP_CENTER_LONGITUDE,
    latitudeDelta: INITIAL_LATITUDE_DELTA,
    longitudeDelta: INITIAL_LONGITUDE_DELTA,
  });
  const [currentUserLocation, setCurrentUserLocation] = useState(null);
  const [isInsideBoundary, setIsInsideBoundary] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const mapRef = useRef(null);
  // watchId will now store the subscription object from watchPositionAsync
  const watchId = useRef(null);
  // --------------------

  // --- Permission Request (Using expo-location) ---
  const requestLocationPermission = async () => {
    console.log(
      "[Permissions] Requesting location permission (expo-location)..."
    );
    let { status, canAskAgain } =
      await Location.requestForegroundPermissionsAsync();
    console.log("[Permissions] Expo Location Status:", status);
    if (status !== "granted") {
      console.log("[Permissions] Expo Location permission denied");
      setLocationPermissionGranted(false);
      // Suggest opening settings only if permission was denied permanently
      const alertMessage = "Location permission is needed to show position.";
      const alertButtons = [{ text: "OK" }];
      if (!canAskAgain) {
        alertButtons.push({
          text: "Open Settings",
          onPress: () => Linking.openSettings(),
        });
      }
      Alert.alert("Permission denied", alertMessage, alertButtons);
      return false;
    }
    console.log("[Permissions] Expo Location permission granted");
    setLocationPermissionGranted(true);
    return true;
  };
  // -------------------------------------------------

  // --- useEffect Hook (Using expo-location) ---
  useEffect(() => {
    console.log("[Effect] Map component mounted. Requesting permission...");

    let locationSubscription = null; // Variable to hold the subscription

    // --- Define Async Function for Location Logic ---
    const activateLocation = async () => {
      const granted = await requestLocationPermission();
      console.log("[Effect] Permission request finished. Granted:", granted);

      if (granted) {
        // --- Get Initial Position ---
        console.log(
          "[Effect] Permission granted. Getting initial position (expo-location)..."
        );
        try {
          let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High, // Request high accuracy
          });
          console.log(
            "[Effect] getCurrentPositionAsync SUCCESS:",
            JSON.stringify(location.coords, null, 2)
          );
          setCurrentUserLocation(location.coords); // Update state with coords object
          // Initial boundary check
          const userCoordsForCheck = [
            location.coords.longitude,
            location.coords.latitude,
          ];
          const isInside = pointInPolygon(
            userCoordsForCheck,
            boundaryPolygonForCheck
          );
          setIsInsideBoundary(isInside);
        } catch (error) {
          console.error("[Effect] getCurrentPositionAsync ERROR:", error);
          Alert.alert(
            "Error Getting Location",
            `Could not fetch initial location: ${error.message}`
          );
        }

        // --- Start Watching Position ---
        console.log("[Effect] Starting location watcher (expo-location)...");
        try {
          // Clear previous watcher if exists by removing the subscription
          if (watchId.current) {
            console.log("[Effect] Removing previous location subscription.");
            watchId.current.remove();
            watchId.current = null;
          }

          locationSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 5000, // milliseconds
              distanceInterval: 10, // meters
            },
            (location) => {
              // This callback receives location updates
              setCurrentUserLocation(location.coords); // Update state with coords object
              // Continuous boundary check
              const userCoordsForCheck = [
                location.coords.longitude,
                location.coords.latitude,
              ];
              const isInside = pointInPolygon(
                userCoordsForCheck,
                boundaryPolygonForCheck
              );
              setIsInsideBoundary(isInside);
            }
          );
          watchId.current = locationSubscription; // Store subscription in ref
          console.log("[Effect] watchPositionAsync started.");
        } catch (error) {
          console.error("[Effect] watchPositionAsync ERROR:", error);
          Alert.alert(
            "Error Watching Location",
            `Could not start location updates: ${error.message}`
          );
        }
      } else {
        console.log(
          "[Effect] Permission denied by user. Location tracking not started."
        );
      }
    };

    activateLocation();

    // --- Cleanup Function ---
    return () => {
      if (watchId.current) {
        // Check if subscription exists
        console.log(
          "[Effect] Map component unmounting. Removing location subscription."
        );
        watchId.current.remove(); // Call remove() on the subscription object
        watchId.current = null;
      }
    };
  }, []);

  // --- Other Functions ---
  const handleBuildingPress = (building) => {
    setSelectedBuilding(building);
    setIsModalVisible(true);
  };

  const onRegionChangeComplete = (newRegion) => {
    setMapRegion(newRegion);
  };
  // ---------------------

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        mapType="satellite"
        region={mapRegion} // Use controlled region
        onRegionChangeComplete={onRegionChangeComplete}
        onMapReady={() => console.log("Map is ready!")}
        showsUserLocation={locationPermissionGranted}
        showsMyLocationButton={locationPermissionGranted}
        followsUserLocation={false}
        onError={(error) => console.error("MapView Error:", error)}
        // Add zoom/pan limits here if they work with expo-location
        // minZoomLevel={15}
        // mapBoundary={mapBoundary} // If you defined mapBoundary constant earlier
      >
        {/* Polygons */}
        <Polygon
          coordinates={MapBoundsCoordinations}
          strokeColor="rgba(255, 0, 0, 0.4)" // Original colors
          strokeWidth={2}
          fillColor={"rgba(55, 180, 0, 0.15)"}
        />
        {buildingsCoordinations.map((building) => (
          <Polygon
            key={building.id}
            coordinates={building.coordinates}
            fillColor="rgba(0, 0, 255, 0.1)" // Original colors
            strokeColor="rgba(0, 0, 255, 1)"
            strokeWidth={1.5}
            tappable={true}
            onPress={() => handleBuildingPress(building)}
          />
        ))}
      </MapView>

      {/*/ For dev purposes mainly/*/}
      <View style={styles.statusOverlay}>
        <Text style={styles.statusText}>
          Location Permission:{" "}
          {locationPermissionGranted ? "Granted" : "Not Granted"}
        </Text>
        {locationPermissionGranted && (
          <Text style={styles.statusText}>
            User Location:{" "}
            {currentUserLocation
              ? `${currentUserLocation.latitude.toFixed(
                  4
                )}, ${currentUserLocation.longitude.toFixed(4)}`
              : "Tracking..."}
          </Text>
        )}
        {locationPermissionGranted && currentUserLocation && (
          <Text
            style={[
              styles.statusText,
              { color: isInsideBoundary ? "lime" : "red", fontWeight: "bold" },
            ]}
          >
            Inside Boundary: {isInsideBoundary ? "Yes" : "No"}
          </Text>
        )}
      </View>

      {/* Building Info Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(!isModalVisible);
          setSelectedBuilding(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBackground} />
          <View style={styles.modalView}>
            {selectedBuilding && (
              <>
                <Text style={styles.modalTitle}>{selectedBuilding.name}</Text>
                <Text style={styles.modalText}>{selectedBuilding.info}</Text>
              </>
            )}
            <FlipButton
              style={styles.modalButton}
              onPress={() => {
                setIsModalVisible(false);
                setSelectedBuilding(null);
              }}
            >
              <Text>חזרה למפה</Text>
            </FlipButton>
          </View>
        </View>
      </Modal>
    </View>
  );
  // -------------------------------------------------
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  statusOverlay: {
    position: "absolute",
    top: 40, // Adjusted slightly for potential safe area
    left: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 8,
    borderRadius: 5,
    zIndex: 1, // Make sure it's above the map
  },
  statusText: {
    color: "white",
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalText: {
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    width: "70%",
    alignItems: "center",
    justifyContent: "center",
  },
});
// ---------------------------

export default Map;
