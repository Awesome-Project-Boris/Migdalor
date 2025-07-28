import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
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

import { Toast } from "toastify-react-native";

import { useIsFocused, useFocusEffect } from "@react-navigation/native";
import i18next from "i18next";
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

const REROUTE_THRESHOLD = 50;

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
    latitude: 32.312438,
    longitude: 34.893807,
  },
  {
    latitude: 32.3124,
    longitude: 34.896995,
  },
  {
    latitude: 32.307971,
    longitude: 34.896743,
  },
  {
    latitude: 32.307935,
    longitude: 34.893604,
  },

  { latitude: 32.312438, longitude: 34.893807 },
];

// const MapBoundsTesting = [
//   { latitude: 32.312641, longitude: 34.893963 }, // Pushed up and left
//   { latitude: 32.31202, longitude: 34.896711 }, // Pushed up and right
//   { latitude: 32.308311, longitude: 34.896362 }, // Pushed down and right
//   { latitude: 32.308332, longitude: 34.893908 }, // Pushed down and left
//   { latitude: 32.312641, longitude: 34.893963 }, // Close the loop
// ];

const boundaryPolygonForCheck = MapBoundsCoordinations.map((p) => [
  p.longitude,
  p.latitude,
]);

const Map = () => {
  const { t, i18n } = useTranslation();

  const isFocused = useIsFocused();

  const mapRef = useRef(null);
  // const watchId = useRef(null);

  // const [mapRegion, setMapRegion] = useState({
  //   latitude: MAP_CENTER_LATITUDE,
  //   longitude: MAP_CENTER_LONGITUDE,
  //   latitudeDelta: INITIAL_LATITUDE_DELTA,
  //   longitudeDelta: INITIAL_LONGITUDE_DELTA,
  // });

  const INITIAL_REGION = {
    latitude: 32.310441,
    longitude: 34.895219,
    latitudeDelta: 0.0049,
    longitudeDelta: 0.0024,
  };

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

  const [isLegendVisible, setIsLegendVisible] = useState(false);
  const [isI18nReady, setIsI18nReady] = useState(false);


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

  const navigationStateRef = useRef({
    isNavigating,
    navigationPath,
    destination,
  });
  useEffect(() => {
    navigationStateRef.current = { isNavigating, navigationPath, destination };
  }, [isNavigating, navigationPath, destination]);

  const navigationGraph = useMemo(
    () => createGraph(mapData.mapNodes, polylines),
    [mapData.mapNodes, polylines]
  );

  useFocusEffect(
    useCallback(() => {
      // This handles returning to the map after navigating away.
      const timeoutId = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.animateToRegion(INITIAL_REGION, 500);
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }, [])
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

  const stopNavigation = () => {
    setIsNavigating(false);
    setNavigationPath([]);
    setDestination(null);
    Toast.show({
      type: "info",
      text1: t("Navigation_Cancelled"),
    });
  };

  const handleStartNavigationFromModal = (buildingToNavigate) => {
    setSelectedBuilding(null); // Close the modal
    const navigationTarget = { ...buildingToNavigate, type: "building" };
    startNavigation(navigationTarget); // Start navigation with the corrected object
  };

  useEffect(() => {
    if (!isFocused) {
      setSelectedBuilding(null);
      setSelectedNode(null);
    }
  }, [isFocused]);

  useEffect(() => {
    // This function sets the state when the language is ready
    const setReady = () => setIsI18nReady(true);

    // If the language is already loaded, set the state immediately
    if (i18next.isInitialized && i18next.language) {
      setReady();
    } else {
      // Otherwise, listen for the 'languageChanged' event
      i18next.on("languageChanged", setReady);
    }

    // Cleanup: remove the event listener when the component unmounts
    return () => {
      i18next.off("languageChanged", setReady);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

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
        console.error("Error in fetchMapData:", err);
        setError("Failed to load map data.");
        Toast.show({
          type: "error",
          text1: t("MapScreen_DataLoadingError"),
          text2: err.message,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);

  // NEW TO TEST

  useEffect(() => {
    let locationWatcher = null;

    const startWatching = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      locationWatcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 10,
        },
        (location) => {
          if (!location) return;

          const userLocation = location.coords;
          setCurrentUserLocation(userLocation);

          const isInside = pointInPolygon(
            [userLocation.longitude, userLocation.latitude],
            boundaryPolygonForCheck
          );
          setIsInsideBoundary(isInside);

          const { isNavigating, navigationPath, destination } =
            navigationStateRef.current;

          if (isNavigating && navigationPath.length > 1 && destination) {
            const nextWaypoint = navigationPath[1];
            const distanceToNextWaypoint = getDistance(
              userLocation,
              nextWaypoint
            );

            if (distanceToNextWaypoint > REROUTE_THRESHOLD) {
              console.log("User is off-route. Recalculating path...");
              startNavigation(destination, userLocation);
            } else {
              setNavigationPath((currentPath) => {
                let remainingWaypoints = currentPath.slice(1);
                if (
                  remainingWaypoints.length > 0 &&
                  distanceToNextWaypoint < 12
                ) {
                  remainingWaypoints = remainingWaypoints.slice(1);
                }
                return [userLocation, ...remainingWaypoints];
              });
            }

            if (navigationPath.length <= 2 && distanceToNextWaypoint < 15) {
              setArrivalModalVisible(true);
            }
          }
        }
      );
    };

    startWatching();

    return () => {
      if (locationWatcher) {
        locationWatcher.remove();
      }
    };
  }, []);

  const startNavigation = (target, userLocationOverride = null) => {
    const userLoc = userLocationOverride || currentUserLocation;

    // COMMENTED OUT FOR TESTING!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Teleport protection
    // if (!userLoc || !isInsideBoundary) {
    //   Toast.show({
    //     type: "error",
    //     text1: t("Navigation_Error"),
    //     text2: t("Navigation_MustBeInside"),
    //   });
    //   return;
    // }

    const startNode = findClosestWalkableNode(userLoc, walkableNodes);
    let targetNodeId = null;

    if (target.type === "building" || target.type === "apartment") {
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

        pathCoords.unshift({
          latitude: userLoc.latitude,
          longitude: userLoc.longitude,
        });

        setDestination(target);
        setNavigationPath(pathCoords);
        setIsNavigating(true);
        setNavigationModalVisible(false);
      } else {
        Toast.show({
          type: "error",
          text1: t("Navigation_Error"),
          text2: t("Navigation_NoRoute"),
        });
      }
    } else {
      Toast.show({
        type: "error",
        text1: t("Navigation_Error"),
        text2: t("Navigation_NoRoute"),
      });
    }
  };

  const clickableNodes = useMemo(
    () => mapData.mapNodes.filter((node) => node.description),
    [mapData.mapNodes]
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>{t("MapScreen_Loading")}</Text>
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
    <View style={styles.container} key={i18n.language}>
      <Header />
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        onMapReady={() => {
          if (mapRef.current) {
            mapRef.current.animateToRegion(INITIAL_REGION, 50);
          }
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
        {mapData.buildings.map((building) => {
          const isTargetBuilding =
            isNavigating &&
            destination &&
            destination.buildingID === building.buildingID;

          return (
            <Polygon
              key={building.buildingID}
              coordinates={building.coordinates}
              // Apply colors conditionally
              fillColor={
                isTargetBuilding
                  ? "rgba(255, 0, 0, 0.3)"
                  : "rgba(0, 122, 255, 0.2)"
              }
              strokeColor={
                isTargetBuilding
                  ? "rgba(255, 0, 0, 0.9)"
                  : "rgba(0, 122, 255, 0.8)"
              }
              strokeWidth={isTargetBuilding ? 3 : 2}
              tappable={true}
              onPress={() => setSelectedBuilding(building)}
            />
          );
        })}

        {/* 3. Render Clickable Map Nodes from API data */}
        {showPins &&
          clickableNodes.map((node) => (
            <Marker
              key={`node-${node.nodeID}`}
              coordinate={{
                latitude: node.latitude,
                longitude: node.longitude,
              }}
              onPress={() =>
                setSelectedNode({ ...node, description: t(node.description) })
              }
              pinColor="#8e9800"
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
              <Text style={styles.buttonText}>
                {t("Navigation_Cancel", "Cancel Navigation")}
              </Text>
            </FlipButtonSizeless>
          </View>
        </>
      )}

      {/* --- DEFAULT UI --- */}
      {!isNavigating && (
        <View style={styles.bottomBar}>
          <FlipButtonSizeless
            style={styles.legendButton}
            onPress={() => setIsLegendVisible(true)}
          >
            <Text style={styles.buttonText}>{t("MapScreen_Legend")}</Text>
          </FlipButtonSizeless>
          <FlipButtonSizeless
            style={styles.navButton}
            onPress={() => setNavigationModalVisible(true)}
          >
            <Text style={styles.buttonText}>{t("MapScreen_Navigation")}</Text>
          </FlipButtonSizeless>
        </View>
      )}

      <NodeInfoModal
        visible={isLegendVisible}
        node={{ description: "MapScreen_LegendText" }}
        onClose={() => setIsLegendVisible(false)}
      />

      <NodeInfoModal
        visible={!!selectedNode}
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
      <BuildingInfoModal
        visible={!!selectedBuilding}
        building={selectedBuilding}
        onClose={() => setSelectedBuilding(null)}
        onNavigate={handleStartNavigationFromModal}
      />
      {mapData.buildings.length > 0 && isI18nReady && (
        <NavigationModal
          visible={navigationModalVisible}
          mapData={mapData}
          onClose={() => setNavigationModalVisible(false)}
          onStartNavigation={startNavigation}
        />
      )}
      <ArrivalModal
        visible={arrivalModalVisible}
        destination={destination}
        onClose={() => {
          setArrivalModalVisible(false);
          stopNavigation(); // Also clear destination after closing arrival modal
        }}
      />
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
