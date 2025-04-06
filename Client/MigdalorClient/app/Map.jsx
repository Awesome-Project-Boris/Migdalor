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

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;

const INITIAL_LATITUDE_DELTA = 0.0055; 
const INITIAL_LONGITUDE_DELTA = INITIAL_LATITUDE_DELTA * ASPECT_RATIO; // horizonal zoom

const MAP_CENTER_LATITUDE = 32.310441;
const MAP_CENTER_LONGITUDE = 34.895219;


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
    const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

    const mapRef = useRef(null); // To potentially control the map view programmatically
    const watchId = useRef(null); // To store the location watch ID

    const requestLocationPermission = async () => {
        console.log("[Permissions] Requesting location permission...");
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
                console.log("[Permissions] Android Permission Status:", granted);
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('[Permissions] Android Location permission granted');
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
        // <<< LOG: Component Mount >>>
        console.log("[Effect] Map component mounted. Requesting permission...");

        const startLocationTracking = () => {
            // <<< LOG: Start Watcher >>>
            console.log("[Effect] Starting location watcher (watchPosition)...");
            // Clear any previous watcher just in case
            if (watchId.current !== null) {
                 Geolocation.clearWatch(watchId.current);
            }
            watchId.current = Geolocation.watchPosition(
                (position) => {
                    // <<< LOG: Watcher Success >>>
                    console.log("[Effect] watchPosition SUCCESS:", JSON.stringify(position, null, 2)); // Log entire position object
                    const { latitude, longitude } = position.coords;
                    const currentPos = { latitude, longitude };
                    setCurrentUserLocation(currentPos); // <-- State updated here

                    const userCoordsForCheck = [longitude, latitude];
                    const isInside = pointInPolygon(userCoordsForCheck, boundaryPolygonForCheck);
                    setIsInsideBoundary(isInside);
                },
                (error) => {
                    // <<< LOG: Watcher Error >>>
                    console.error('[Effect] watchPosition ERROR:', { code: error.code, message: error.message });
                    setCurrentUserLocation(null);
                    // Keep error alerts
                    if (error.code === 1) { Alert.alert("Permission Denied", "Location permission was denied.");}
                    else if (error.code === 2) { Alert.alert("Location Unavailable", "Could not get current location. Ensure GPS is enabled.");}
                    else if (error.code === 3) { Alert.alert("Timeout", "Location request timed out."); }
                    else { Alert.alert("Location Error", `An unknown error occurred (${error.code}): ${error.message}`);}
                },
                { // Options
                    enableHighAccuracy: true,
                    distanceFilter: 10, // Meters
                    interval: 5000, // Milliseconds
                    fastestInterval: 2000, // Milliseconds
                    // showLocationDialog: true // Optional: On Android, show a dialog if location is disabled (can be intrusive)
                }
            );
             // <<< LOG: Watcher ID >>>
             console.log("[Effect] watchPosition started with watchId:", watchId.current);
        };

        requestLocationPermission().then(granted => {
             // <<< LOG: Permission Result in Effect >>>
             console.log("[Effect] Permission request finished. Granted:", granted);
            if (granted) {
                // <<< LOG: Attempting Initial Position >>>
                console.log("[Effect] Permission granted. Getting initial position (getCurrentPosition)...");
                Geolocation.getCurrentPosition(
                    (position) => {
                        // <<< LOG: Initial Position Success >>>
                        console.log("[Effect] getCurrentPosition SUCCESS:", JSON.stringify(position, null, 2)); // Log entire position object
                        const { latitude, longitude } = position.coords;
                        const initialPos = { latitude, longitude };
                        setCurrentUserLocation(initialPos); // <-- State updated here

                        const userCoordsForCheck = [longitude, latitude];
                        const isInside = pointInPolygon(userCoordsForCheck, boundaryPolygonForCheck);
                        setIsInsideBoundary(isInside);
                    },
                    (error) => {
                        // <<< LOG: Initial Position Error >>>
                        console.error('[Effect] getCurrentPosition ERROR:', { code: error.code, message: error.message });
                        // Keep alerts, maybe log instead/additionally if alerts are annoying
                        if (error.code === 1) { console.error("Initial Pos Error: Permission Denied"); Alert.alert(/*...*/)}
                        else if (error.code === 2) { console.error("Initial Pos Error: Unavailable"); Alert.alert(/*...*/)}
                        else if (error.code === 3) { console.error("Initial Pos Error: Timeout"); Alert.alert(/*...*/)}
                        else { console.error("Initial Pos Error: Unknown"); Alert.alert(/*...*/)}
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
                );
                // Start watching for continuous updates
                startLocationTracking();
            } else {
                 // <<< LOG: Permission Denied Flow >>>
                 console.log("[Effect] Permission denied by user. Location tracking not started.");
            }
        });

        // Cleanup function
        return () => {
            if (watchId.current !== null) {
                 // <<< LOG: Cleanup >>>
                 console.log("[Effect] Map component unmounting. Clearing watchId:", watchId.current);
                Geolocation.clearWatch(watchId.current);
                watchId.current = null; // Clear ref
            }
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    const handleBuildingPress = (building) => {
        setSelectedBuilding(building);
        setIsModalVisible(true);
    };

    const onRegionChangeComplete = (newRegion) => {
        // console.log("Region Change Complete:", newRegion); // Optional: Log region changes
        setMapRegion(newRegion);
    };

    return (
        <View style={styles.container}>
            <MapView
                 ref={mapRef}
                 provider={PROVIDER_GOOGLE}
                 style={styles.map}
                 mapType="satellite"
                 // *** Use controlled `region` prop ***
                 region={mapRegion}
                 // *** Use `onRegionChangeComplete` ***
                 onRegionChangeComplete={onRegionChangeComplete}
                 // *** Add `onMapReady` log ***
                 onMapReady={() => console.log("Map is ready!")}
                 showsUserLocation={locationPermissionGranted}
                 showsMyLocationButton={locationPermissionGranted}
                 followsUserLocation={false}
                 onError={(error) => console.error("MapView Error:", error)}
            >
                {/* Keep original Polygons (colors from your old code) */}
                <Polygon
                    coordinates={MapBoundsCoordinations}
                    strokeColor="rgba(255, 0, 0, 0.8)"
                    strokeWidth={3}
                    fillColor={isInsideBoundary ? "rgba(0, 255, 0, 0.2)" : "rgba(255, 0, 0, 0.2)"}
                />
                {buildingsCoordinations.map(building => (
                    <Polygon
                        key={building.id}
                        coordinates={building.coordinates}
                        fillColor="rgba(0, 0, 255, 0.5)"
                        strokeColor="rgba(0, 0, 255, 0.8)"
                        strokeWidth={2}
                        tappable={true}
                        onPress={() => handleBuildingPress(building)}
                    />
                ))}
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