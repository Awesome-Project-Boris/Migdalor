import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Easing,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { Globals } from './constants/Globals';
import FlipButton from '../components/FlipButton';
import Header from '@/components/Header';

// Assuming sun.png is in assets/images
const sunImage = require('../assets/images/sun.png');

export default function GoodMorningProcedure() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasSpouse, setHasSpouse] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSpouseSignedIn, setIsSpouseSignedIn] = useState(false);

  // Animation value
  const sunAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start the sun rising animation
    Animated.timing(sunAnimation, {
      toValue: 1,
      duration: 3000, // 3 seconds for the animation
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Fetch spouse information
    const fetchSpouseData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userID');
        if (!userId) {
          throw new Error('User ID not found');
        }

        // --- API Call to check for a spouse ---
        const response = await fetch(
          `${Globals.API_BASE_URL}/api/People/GetPersonByIDForProfile/${userId}`
        );
        const userData = await response.json();

        // Check if spouseId exists and is not null
        if (userData && userData.spouseId) {
          setHasSpouse(true);
        }
      } catch (error) {
        console.error('Failed to fetch spouse data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpouseData();
  }, [sunAnimation]);

  const handleSignIn = async (includeSpouse) => {
    setIsLoading(true);
    try {
        const userId = await AsyncStorage.getItem('userID');
        // --- API Call to sign in ---
        const response = await fetch(`${Globals.API_BASE_URL}/api/Attendance/SignIn`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                residentId: userId,
                includeSpouse: includeSpouse,
            }),
        });

        if (!response.ok) {
            throw new Error('Sign-in failed');
        }

        setIsSignedIn(true);
        if (includeSpouse) {
            setIsSpouseSignedIn(true);
        }

        Alert.alert(t('GoodMorning_signInSuccessTitle'), t('GoodMorning_signInSuccessMessage'));

    } catch (error) {
        console.error('Sign-in error:', error);
        Alert.alert(t('Common_Error'), error.message);
    } finally {
        setIsLoading(false);
    }
  };

  const sunTranslateY = sunAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [200, 0],
  });

  const sunOpacity = sunAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  return (
    <>
      <Header />
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.sunContainer,
            {
              transform: [{ translateY: sunTranslateY }],
              opacity: sunOpacity,
            },
          ]}
        >
          <Image source={sunImage} style={styles.sun} />
        </Animated.View>

        <View style={styles.titleContainer}>
            <Text style={styles.title}>{t('GoodMorning_title')}</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#fbbf24" />
        ) : (
          <View style={styles.buttonContainer}>
            <FlipButton
              onPress={() => handleSignIn(false)}
              disabled={isSignedIn || isLoading}
              style={styles.button}
              bgColor="#fbbf24"
              textColor="black"
            >
              <Text style={styles.buttonText}>{t('GoodMorning_signInMe')}</Text>
            </FlipButton>

            {hasSpouse && (
              <FlipButton
                onPress={() => handleSignIn(true)}
                disabled={isSignedIn || isSpouseSignedIn || isLoading}
                style={styles.button}
                bgColor="#fca5a5"
                textColor="black"
              >
                <Text style={styles.buttonText}>{t('GoodMorning_signInBoth')}</Text>
              </FlipButton>
            )}
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  sunContainer: {
    position: 'absolute',
    top: '20%',
  },
  sun: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  titleContainer: {
    position: 'absolute',
    top: '50%',
    alignItems: 'center',
  },
  title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: 'white',
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  button: {
    width: '80%',
    paddingVertical: 20,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});