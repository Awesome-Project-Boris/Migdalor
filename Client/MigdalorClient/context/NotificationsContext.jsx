import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Globals } from '@/app/constants/Globals';

const NotificationsContext = createContext();

const ASYNC_STORAGE_KEY = 'lastVisitedTimestamps';
const POLLING_INTERVAL = 2 * 60 * 1000; // 2 minutes

export const NotificationsProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [latestTimestamps, setLatestTimestamps] = useState({ listings: null, notices: null, events: null });
    const [lastVisited, setLastVisited] = useState({ listings: null, notices: null, events: null });
    const [notificationStatus, setNotificationStatus] = useState({ listings: false, notices: false, events: false, total: 0 });

    const appState = useRef(AppState.currentState);

    const fetchLatestTimestamps = useCallback(async () => {
        try {
            const endpoints = {
                listings: `${Globals.API_BASE_URL}/api/Listings/latest-timestamp`,
                notices: `${Globals.API_BASE_URL}/api/Notices/latest-timestamp`,
                events: `${Globals.API_BASE_URL}/api/Events/latest-timestamp`,
            };
            const responses = await Promise.all([
                fetch(endpoints.listings),
                fetch(endpoints.notices),
                fetch(endpoints.events),
            ]);
            const data = await Promise.all(responses.map(res => res.ok ? res.json() : null));
            setLatestTimestamps({
                listings: data[0] ? new Date(data[0]) : null,
                notices: data[1] ? new Date(data[1]) : null,
                events: data[2] ? new Date(data[2]) : null,
            });
        } catch (error) {
        console.log("🔍 [Notifications] Failed to fetch latest timestamps (server may be offline):", error.message);
    }
    }, []);

    const updateLastVisited = useCallback(async (key) => {
        const now = new Date();
        
        // Use the functional form of setState to avoid depending on 'lastVisited'
        setLastVisited(currentVisited => {
            const updatedVisited = { ...currentVisited, [key]: now };
            // Save to AsyncStorage inside the updater to ensure it uses the latest state
            AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(updatedVisited));
            return updatedVisited;
        });
    }, []); 

    const isItemNew = useCallback((key, itemDate) => {

        // TEMP: Disable "New" tag for events until backend provides a proper creation date.
    if (key === 'events') {
        return false;
    }

        if (!key || !itemDate || !lastVisited[key]) {
            return false;
        }
        return new Date(itemDate) > lastVisited[key];
    }, [lastVisited]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const storedValue = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
                const now = new Date();
                let initialVisited = { listings: now, notices: now, events: now };
                if (storedValue) {
                    const parsed = JSON.parse(storedValue);
                    initialVisited = {
                        listings: parsed.listings ? new Date(parsed.listings) : now,
                        notices: parsed.notices ? new Date(parsed.notices) : now,
                        events: parsed.events ? new Date(parsed.events) : now,
                    };
                }
                setLastVisited(initialVisited);
            } catch (error) {
                console.error("Failed to load last visited timestamps:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
        fetchLatestTimestamps();
        const intervalId = setInterval(fetchLatestTimestamps, POLLING_INTERVAL);
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                fetchLatestTimestamps();
            }
            appState.current = nextAppState;
        });
        return () => {
            clearInterval(intervalId);
            subscription.remove();
        };
    }, [fetchLatestTimestamps]);

    useEffect(() => {
        if (isLoading) return;
        const hasNew = (latest, visited) => latest && visited && latest > visited;
        const newListings = hasNew(latestTimestamps.listings, lastVisited.listings);
        const newNotices = hasNew(latestTimestamps.notices, lastVisited.notices);
        const newEvents = hasNew(latestTimestamps.events, lastVisited.events);
        setNotificationStatus({
            listings: newListings,
            notices: newNotices,
            events: newEvents,
            total: [newListings, newNotices, newEvents].filter(Boolean).length,
        });
    }, [latestTimestamps, lastVisited, isLoading]);

    const value = { notificationStatus, updateLastVisited, isItemNew };

    return (
        <NotificationsContext.Provider value={value}>
            {children}
        </NotificationsContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationsContext);