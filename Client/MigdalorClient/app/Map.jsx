// 32.310652, 34.895735 entrance 

// Map.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    Text,
    Modal,
    Button,
    PermissionsAndroid,
    Platform,
    Alert,
    Linking, // To open app settings
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polygon, Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import pointInPolygon from 'point-in-polygon'; 
import config from '../config.json';

const { width, height } = Dimensions.get('window');

const APIkey = config.googleMapsApiKeyAndroid;
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.005; 
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO; // horizonal zoom

// Coordinates for Nordiya
const INITIAL_POSITION = {
  latitude: 32.310652,
  longitude: 34.895735,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

const MAP_CENTER = {
    latitude: 32.310632,
    longitude: 34.895801,
}

const MapBoundsCoordinations = [{
    latitude: 32.312541, // top left
    longitude: 34.894063,
},{
    latitude: 32.311920, // top right
    longitude: 34.896611,
},{
    latitude: 32.308411, // bottom right
    longitude: 34.896262,
},{
    latitude: 32.308432, // bottom left
    longitude: 34.894108,
}, ]

const boundaryPolygonForCheck = MapBoundsCoordinations.map(p => [p.longitude, p.latitude]);


// We should probably deport this big ass JSON to an external file
const buildingsCoordinations = [
    {
        id: '1',
        name: 'Test Admin building',
        info: 'This is the big main building',
        coordinates: [
            { latitude: 32.310919, longitude: 34.895532}, // Top left |--
            { latitude: 32.310909, longitude: 34.895903}, // Top right  --|
            { latitude: 32.310824, longitude: 34.895906 }, // Right closing _|
            { latitude: 32.310824, longitude: 34.895655}, // Mid closing |--
            { latitude: 32.310532, longitude: 34.895652}, // Bottom right _|
            { latitude: 32.310533, longitude: 34.895527}, // Bottom left |_
        ],
    },
]

const Map = () => {

    const [currentUserLocation, setCurrentUserLocation] = useState(null);
    const [isInsideBoundary, setIsInsideBoundary] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

    const mapRef = useRef(null); // To potentially control the map view programmatically
    const watchId = useRef(null); // To store the location watch ID

    const requestLocationPermission = async () => {
        if (Platform.OS === 'ios') {
            // On iOS, permissions are requested when Geolocation methods are called
            // Ensure Info.plist has NSLocationWhenInUseUsageDescription or NSLocationAlwaysUsageDescription
             const auth = await Geolocation.requestAuthorization('whenInUse');
             if(auth === 'granted') {
                 setLocationPermissionGranted(true);
                 return true;
             } else {
                 setLocationPermissionGranted(false);
                 Alert.alert(
                    "Location Permission Denied",
                    "This feature requires location access. Please enable it in Settings.",
                    [{ text: "Open Settings", onPress: () => Linking.openSettings() }, { text: "Cancel" }]
                 );
                 return false;
             }
        } else { // Android
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Access Required',
                        message: 'This app needs to access your location for the map feature.',
                        buttonPositive: 'OK',
                        buttonNegative: 'Cancel',
                    },
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('Location permission granted');
                    setLocationPermissionGranted(true);
                    return true;
                } else {
                    console.log('Location permission denied');
                    setLocationPermissionGranted(false);
                    Alert.alert("Location Permission Denied", "Cannot track location without permission.");
                    return false;
                }
            } catch (err) {
                console.warn(err);
                setLocationPermissionGranted(false);
                return false;
            }
        }
    };

    useEffect(() => {
        const startLocationTracking = () => {
            watchId.current = Geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const currentPos = { latitude, longitude };
                    setCurrentUserLocation(currentPos);

                    // Check if inside boundary
                    const userCoordsForCheck = [longitude, latitude]; // Needs [lon, lat]
                    const isInside = pointInPolygon(userCoordsForCheck, boundaryPolygonForCheck);
                    setIsInsideBoundary(isInside);

                    // console.log('Location Updated:', currentPos, 'Inside Boundary:', isInside);
                },
                (error) => {
                    console.log('Geolocation Error:', error.code, error.message);
                    setCurrentUserLocation(null); // Clear location on error
                    // Consider more robust error handling (e.g., location services disabled)
                     if (error.code === 2 || error.code === 3) { // POSITION_UNAVAILABLE or TIMEOUT
                        Alert.alert("Location Error", "Could not get current location. Please ensure location services are enabled and try again.");
                    }
                },
                {
                    enableHighAccuracy: true, // Use GPS for best accuracy
                    distanceFilter: 10, // Update only when moved 10 meters
                    interval: 5000, // Check roughly every 5 seconds
                    fastestInterval: 2000, // Max update rate 2 seconds
                }
            );
        };

        requestLocationPermission().then(granted => {
            if (granted) {
                // Get initial position once
                Geolocation.getCurrentPosition(
                    (position) => {
                         const { latitude, longitude } = position.coords;
                         const initialPos = { latitude, longitude };
                         setCurrentUserLocation(initialPos);
                         const userCoordsForCheck = [longitude, latitude];
                         const isInside = pointInPolygon(userCoordsForCheck, boundaryPolygonForCheck);
                         setIsInsideBoundary(isInside);
                         // Optionally move map to user's initial location
                         // mapRef.current?.animateToRegion({ ...initialPos, latitudeDelta: LATITUDE_DELTA, longitudeDelta: LONGITUDE_DELTA });
                    },
                    (error) => console.log('Initial Geolocation Error:', error.code, error.message),
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
                );
                // Start watching for continuous updates
                startLocationTracking();
            }
        });


        // Cleanup function: Stop watching location when component unmounts
        return () => {
            if (watchId.current !== null) {
                Geolocation.clearWatch(watchId.current);
                // console.log('Stopped location watch');
            }
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    const handleBuildingPress = (building) => {
        setSelectedBuilding(building);
        setIsModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE} // Use Google Maps
                style={styles.map}
                mapType="satellite" // Use satellite view
                initialRegion={{ // Center map initially
                    ...MAP_CENTER,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                }}
                showsUserLocation={locationPermissionGranted} // Show blue dot only if permission granted
                showsMyLocationButton={locationPermissionGranted} // Show button only if permission granted
                followsUserLocation={false} // Set to true if you want the map to follow the user
            >
                {/* 1. Draw the main boundary */}
                <Polygon
                    coordinates={MapBoundsCoordinations}
                    strokeColor="rgba(255, 0, 0, 0.8)" // Red border
                    strokeWidth={3}
                    fillColor={isInsideBoundary ? "rgba(0, 255, 0, 0.2)" : "rgba(255, 0, 0, 0.2)"} // Green fill if inside, red if outside
                />

                {/* 2. Draw clickable buildings */}
                {buildingsCoordinations.map(building => (
                    <Polygon
                        key={building.id}
                        coordinates={building.coordinates}
                        fillColor="rgba(0, 0, 255, 0.5)" // #0000ff fill for buildings
                        strokeColor="rgba(0, 0, 255, 0.8)"
                        strokeWidth={2}
                        tappable={true} // IMPORTANT: Make it clickable
                        onPress={() => handleBuildingPress(building)}
                    />
                ))}

                 {/* 3. Show user's current location marker (optional, showsUserLocation does this too) */}
                 {/* {currentUserLocation && (
                    <Marker
                        coordinate={currentUserLocation}
                        title="Your Location"
                        pinColor={isInsideBoundary ? 'green' : 'red'} // Marker color based on boundary status
                    />
                 )} */}

            </MapView>

            {/* Status Text Overlay (Example) */}
            <View style={styles.statusOverlay}>
                 <Text style={styles.statusText}>
                    Location Permission: {locationPermissionGranted ? 'Granted' : 'Not Granted'}
                </Text>
                {locationPermissionGranted && (
                     <Text style={styles.statusText}>
                        User Location: {currentUserLocation ? `${currentUserLocation.latitude.toFixed(4)}, ${currentUserLocation.longitude.toFixed(4)}` : 'Tracking...'}
                    </Text>
                )}
                {locationPermissionGranted && currentUserLocation && (
                    <Text style={[styles.statusText, { color: isInsideBoundary ? 'lime' : 'red', fontWeight: 'bold' }]}>
                        Inside Boundary: {isInsideBoundary ? 'Yes' : 'No'}
                    </Text>
                )}
            </View>

            {/* Building Info Modal */}
            <Modal
                animationType="slide"
                transparent={true} // Makes background transparent
                visible={isModalVisible}
                onRequestClose={() => { // For Android back button
                    setIsModalVisible(!isModalVisible);
                    setSelectedBuilding(null);
                }}
            >
                <View style={styles.modalContainer}>
                    {/* Semi-transparent background */}
                    <View style={styles.modalBackground} />
                    <View style={styles.modalView}>
                        {selectedBuilding && (
                            <>
                                <Text style={styles.modalTitle}>{selectedBuilding.name}</Text>
                                <Text style={styles.modalText}>{selectedBuilding.info}</Text>
                            </>
                        )}
                        <Button title="Close" onPress={() => {
                            setIsModalVisible(false);
                            setSelectedBuilding(null);
                        }} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    statusOverlay: {
        position: 'absolute',
        top: 10, // Or use SafeAreaView for better positioning
        left: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 8,
        borderRadius: 5,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        justifyContent: 'center', // Center vertically
        alignItems: 'center', // Center horizontally
    },
     modalBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%', // Adjust width as needed
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 20,
        textAlign: 'center',
    },
});

export default Map;

// Maps Platform API Key
// Android: AIzaSyA5rojT27ZC1ttmkiOWB1Nsc4vIGbi1rQc
// iOs: 