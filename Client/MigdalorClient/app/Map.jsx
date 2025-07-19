import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  Modal,
  Button,
  Platform,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";

import { getDistance } from "geolib";

import MapView, {
  PROVIDER_GOOGLE,
  Polygon,
  Marker,
  Polyline,
} from "react-native-maps";

import { useIsFocused } from "@react-navigation/native";

import * as Location from "expo-location";
import pointInPolygon from "point-in-polygon";
import FlipButtonSizeless from "@/components/FlipButtonSizeless";
import NodeInfoModal from "@/components/NodeInfoModal";
import BuildingInfoModal from "@/components/BuildingInfoModal";
import Header from "@/components/Header";
import NavigationModal from "@/components/NavigationModal";
import NavigationInfoPanel from "@/components/NavigationInfoPanel";
import ArrivalModal from "@/components/ArrivalModal";

import {
  createGraph,
  dijkstra,
  getPath,
  findClosestWalkableNode,
} from "../utils/navigationUtils";

import { Globals } from "./constants/Globals";
import {
  polylines,
  roadPolylines,
  arrowPolylines,
} from "../utils/mapStaticData";

import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;

const INITIAL_LATITUDE_DELTA = 0.0049;
const INITIAL_LONGITUDE_DELTA = INITIAL_LATITUDE_DELTA * ASPECT_RATIO;
const MAP_CENTER_LATITUDE = 32.310441;
const MAP_CENTER_LONGITUDE = 34.895219;

const normalizedLines = polylines.map((seg) => ({
  ...seg,
  coordinates: seg.path || seg.coordinates, // Use seg.path if it exists, otherwise use seg.coordinates
}));

const allSegments = [
  ...roadPolylines, // roads beneath everything
  ...normalizedLines, // walkable #838319 + underground
  ...arrowPolylines, // arrows on top
];

// 2) Style lookup based on flags:
const styleFor = (seg) => {
  if (seg.isRoad) {
    return {
      strokeColor: "rgba(0,100,0,0.5)", // pale dark‑green
      strokeWidth: 6,
      zIndex: 0,
    };
  }
  if (seg.isArrow) {
    return {
      strokeColor: "red",
      strokeWidth: 4,
      zIndex: 2,
    };
  }
  if (seg.isUnderground) {
    return {
      strokeColor: "#5b5be8",
      strokeWidth: 4,
      lineDashPattern: [4, 8],
      zIndex: 1,
    };
  }
  // default: walkable path (yellow)
  return {
    strokeColor: "#ffef77",
    strokeWidth: 5,
    zIndex: 1,
  };
};

const MapBoundsCoordinations = [
  {
    latitude: 32.312541,
    longitude: 34.894063,
  },
  {
    latitude: 32.31192,
    longitude: 34.896611,
  },
  {
    latitude: 32.308411,
    longitude: 34.896262,
  },
  {
    latitude: 32.308432,
    longitude: 34.894108,
  },

  { latitude: 32.312541, longitude: 34.894063 },
];

const boundaryPolygonForCheck = MapBoundsCoordinations.map((p) => [
  p.longitude,
  p.latitude,
]);

const Map = () => {
  const { t } = useTranslation();

  const isFocused = useIsFocused();

  const mapRef = useRef(null);
  const watchId = useRef(null);

  const [mapRegion, setMapRegion] = useState({
    latitude: MAP_CENTER_LATITUDE,
    longitude: MAP_CENTER_LONGITUDE,
    latitudeDelta: INITIAL_LATITUDE_DELTA,
    longitudeDelta: INITIAL_LONGITUDE_DELTA,
  });

  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState({ buildings: [], mapNodes: [] });
  const [error, setError] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [currentUserLocation, setCurrentUserLocation] = useState(null);
  const [isInsideBoundary, setIsInsideBoundary] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [showPins, setShowPins] = useState(false);

  // Navigation states -

  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationPath, setNavigationPath] = useState([]);
  const [navigationModalVisible, setNavigationModalVisible] = useState(false);
  const [destination, setDestination] = useState(null);
  const [arrivalModalVisible, setArrivalModalVisible] = useState(false);

  const walkableNodes = useMemo(
    () => mapData.mapNodes.filter((n) => n.nodeID <= 95),
    [mapData.mapNodes]
  );

  const navigationGraph = useMemo(
    () => createGraph(mapData.mapNodes, polylines),
    [mapData.mapNodes, polylines]
  );

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

      const alertMessage = t("Permissions_locationPermissionMessage");
      const alertButtons = [{ text: t("Permissions_okButton") }];
      if (!canAskAgain) {
        alertButtons.push({
          text: t("Permissions_openSettingsButton"),
          onPress: () => Linking.openSettings(),
        });
      }
      Alert.alert(
        t("Permissions_permissionDeniedTitle"),
        alertMessage,
        alertButtons
      );
      return false;
    }
    console.log("[Permissions] Expo Location permission granted");
    setLocationPermissionGranted(true);
    return true;
  };

  useEffect(() => {
    if (!isFocused) {
      setSelectedBuilding(null);
      setSelectedNode(null);
    }
  }, [isFocused]);

  const onRegionChangeComplete = (region) => {
    // Roughly calculate the visible vertical distance in meters
    const verticalMeters = region.latitudeDelta * 111320; // Approx meters per degree of latitude
    setShowPins(verticalMeters < 500); // Show pins if view is less than 500 meters high
  };
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const response = await fetch(
          `${Globals.API_BASE_URL}/api/Map/initial-data`
        );
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();

        // Parse building coordinates from JSON string to object array
        const buildingsWithParsedCoords = data.buildings.map((building) => ({
          ...building,
          coordinates: JSON.parse(building.coordinates || "[]").map(
            (coordString) => {
              // --- FIX: More robust splitting ---
              const parts = coordString.split(/,\s*/); // Splits by comma and optional space
              const lat = parseFloat(parts[0]);
              const lon = parseFloat(parts[1]);
              return { latitude: lat, longitude: lon };
            }
          ),
        }));

        setMapData({
          buildings: buildingsWithParsedCoords,
          mapNodes: data.mapNodes,
        });
      } catch (err) {
        // --- IMPROVED ERROR LOGGING ---
        console.error("Error in fetchMapData:", err);
        setError("Failed to load map data.");
        Toast.show({
          type: "error",
          text1: "Data Loading Error",
          text2: err.message,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);

  // could still need this useEffect

  useEffect(() => {
    console.log("[Effect] Map component mounted. Requesting permission...");

    let locationSubscription = null;

    const activateLocation = async () => {
      const granted = await requestLocationPermission();
      console.log("[Effect] Permission request finished. Granted:", granted);

      if (granted) {
        console.log(
          "[Effect] Permission granted. Getting initial position (expo-location)..."
        );

        watchId.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          }, // Check every 10 meters now
          (location) => {
            setCurrentUserLocation(location.coords);
            const checkCoords = [
              location.coords.longitude,
              location.coords.latitude,
            ];
            setIsInsideBoundary(
              pointInPolygon(checkCoords, boundaryPolygonForCheck)
            );

            if (isNavigating && destination && navigationPath.length > 1) {
              // Re-calculate route from new position
              startNavigation(destination, location.coords);

              // Check for arrival
              const destinationCoords =
                navigationPath[navigationPath.length - 1];
              const distanceToTarget = getDistance(
                location.coords,
                destinationCoords
              );
              if (distanceToTarget < 15) {
                // Arrived if within 15 meters
                setArrivalModalVisible(true);
                stopNavigation();
              }
            }
          }
        );

        try {
          let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          console.log(
            "[Effect] getCurrentPositionAsync SUCCESS:",
            JSON.stringify(location.coords, null, 2)
          );
          setCurrentUserLocation(location.coords);

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

        console.log("[Effect] Starting location watcher (expo-location)...");
        try {
          if (watchId.current) {
            console.log("[Effect] Removing previous location subscription.");
            watchId.current.remove();
            watchId.current = null;
          }

          locationSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 5000,
              distanceInterval: 10,
            },
            (location) => {
              setCurrentUserLocation(location.coords);

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
          watchId.current = locationSubscription;
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

    return () => {
      if (watchId.current) {
        console.log(
          "[Effect] Map component unmounting. Removing location subscription."
        );
        watchId.current.remove();
        watchId.current = null;
      }
    };
  }, [isNavigating, destination, navigationGraph]);

  const startNavigation = (target, userLocationOverride = null) => {
    const userLoc = userLocationOverride || currentUserLocation;
    if (!userLoc || !isInsideBoundary) {
      Toast.show({
        type: "error",
        text1: t("Navigation_Error", "Navigation Error"),
        text2: t(
          "Navigation_MustBeInside",
          "You must be inside the area to navigate."
        ),
      });
      return;
    }

    const startNode = findClosestWalkableNode(userLoc, walkableNodes);
    let targetNodeId = null;

    // Determine the target node ID based on what was selected
    if (target.type === "building") {
      targetNodeId = target.entranceNodeIds[0]; // Navigate to the first entrance
    } else if (target.type === "apartment") {
      // The building info is already attached to the apartment object from the search modal
      targetNodeId = target.entranceNodeIds[0];
    }

    if (startNode && targetNodeId) {
      const { prev } = dijkstra(navigationGraph, startNode.nodeID);
      const pathNodeIds = getPath(prev, startNode.nodeID, targetNodeId);

      if (pathNodeIds.length > 0) {
        const pathCoords = pathNodeIds.map((id) => {
          const node = mapData.mapNodes.find((n) => n.nodeID == id);
          return { latitude: node.latitude, longitude: node.longitude };
        });

        // Add the user's actual current location as the very first point of the line
        pathCoords.unshift({
          latitude: userLoc.latitude,
          longitude: userLoc.longitude,
        });

        setNavigationPath(pathCoords);
        setDestination(target);
        setIsNavigating(true);
        setNavigationModalVisible(false);
      } else {
        Toast.show({
          type: "error",
          text1: t("Navigation_Error", "Navigation Error"),
          text2: t(
            "Navigation_NoRoute",
            "Could not calculate a route to the destination."
          ),
        });
      }
    } else {
      Toast.show({
        type: "error",
        text1: t("Navigation_Error", "Navigation Error"),
        text2: t(
          "Navigation_NoRoute",
          "Could not find a starting or ending point for navigation."
        ),
      });
    }
  };

  // const onRegionChangeComplete = (newRegion) => {
  //   setMapRegion(newRegion);
  // };

  const clickableNodes = useMemo(
    () => mapData.mapNodes.filter((node) => node.description),
    [mapData.mapNodes]
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading Map...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: MAP_CENTER_LATITUDE,
          longitude: MAP_CENTER_LONGITUDE,
          latitudeDelta: INITIAL_LATITUDE_DELTA,
          longitudeDelta: INITIAL_LONGITUDE_DELTA,
        }}
        showsUserLocation={locationPermissionGranted}
        showsMyLocationButton={locationPermissionGranted}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {/* 1. Render Polylines for paths, roads, and arrows */}
        {allSegments.map((seg, index) => (
          <Polyline
            key={`segment-${index}`}
            coordinates={seg.coordinates}
            {...styleFor(seg)}
          />
        ))}

        {/* 2. Render Building Polygons from API data */}
        {mapData.buildings.map((building) => (
          <Polygon
            key={building.buildingID}
            coordinates={building.coordinates}
            fillColor="rgba(0, 122, 255, 0.2)"
            strokeColor="rgba(0, 122, 255, 0.8)"
            strokeWidth={2}
            tappable={true}
            onPress={() => setSelectedBuilding(building)}
          />
        ))}

        {/* 3. Render Clickable Map Nodes from API data */}
        {showPins &&
          clickableNodes.map((node) => (
            <Marker
              key={`node-${node.nodeID}`}
              coordinate={{
                latitude: node.latitude,
                longitude: node.longitude,
              }}
              onPress={() => setSelectedNode(node)}
              pinColor="#988200"
              // Optional: prevent pins from becoming huge on zoom
              flat={true}
            />
          ))}
        {isNavigating && navigationPath.length > 1 && (
          <Polyline
            coordinates={navigationPath}
            strokeColor="#3B82F6" // A distinct blue color
            strokeWidth={6}
            zIndex={3} // Ensure it's drawn on top
          />
        )}
      </MapView>

      {/* --- NAVIGATION UI --- */}
      {isNavigating && (
        <>
          <NavigationInfoPanel
            navigationPath={navigationPath}
            destination={destination}
          />
          <View style={styles.bottomBar}>
            <FlipButtonSizeless
              style={styles.cancelNavButton}
              onPress={stopNavigation}
            >
              <StyledText style={styles.buttonText}>
                {t("Navigation_Cancel", "Cancel Navigation")}
              </StyledText>
            </FlipButtonSizeless>
          </View>
        </>
      )}

      {/* --- DEFAULT UI --- */}
      {!isNavigating && (
        <View style={styles.bottomBar}>
          <FlipButtonSizeless style={styles.legendButton}>
            <StyledText style={styles.buttonText}>{t("Legend")}</StyledText>
          </FlipButtonSizeless>
          <FlipButtonSizeless
            style={styles.navButton}
            onPress={() => setNavigationModalVisible(true)}
          >
            <StyledText style={styles.buttonText}>{t("Navigation")}</StyledText>
          </FlipButtonSizeless>
        </View>
      )}

      {/* 4. Render the new, clean modals */}
      <NodeInfoModal
        visible={!!selectedNode}
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
      <BuildingInfoModal
        visible={!!selectedBuilding}
        building={selectedBuilding}
        onClose={() => setSelectedBuilding(null)}
      />
      <NavigationModal
        visible={navigationModalVisible}
        mapData={mapData}
        onClose={() => setNavigationModalVisible(false)}
        onStartNavigation={startNavigation}
      />
      <ArrivalModal
        visible={arrivalModalVisible}
        destination={destination}
        onClose={() => {
          setArrivalModalVisible(false);
          stopNavigation(); // Also clear destination after closing arrival modal
        }}
      />

      <View style={styles.bottomBar}>
        <FlipButtonSizeless style={styles.legendButton}>
          <StyledText style={styles.buttonText}>{t("Legend")}</StyledText>
        </FlipButtonSizeless>
        <FlipButtonSizeless
          style={styles.navButton}
          onPress={() => setNavigationModalVisible(true)}
        >
          <StyledText style={styles.buttonText}>{t("Navigation")}</StyledText>
        </FlipButtonSizeless>
      </View>
    </View>
  );
};

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
    top: 40,
    left: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 8,
    borderRadius: 5,
    zIndex: 1,
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
  bottomBar: {
    position: "absolute",
    bottom: 30, // Added some margin from the bottom
    left: 20,
    right: 20,
    flexDirection: "row",
    gap: 10,
  },
  legendButton: {
    flex: 1, // 1/3 width
    backgroundColor: "#6c757d", // Grey color
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  navButton: {
    flex: 2, // 2/3 width
    backgroundColor: "#007bff", // Blue color
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelNavButton: {
    // New style for the cancel button
    flex: 1,
    backgroundColor: "#dc3545", // Red color
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Map;
