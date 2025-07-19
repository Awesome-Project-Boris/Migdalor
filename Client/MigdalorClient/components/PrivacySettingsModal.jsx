import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, StyleSheet, ScrollView, Switch, Dimensions, Animated, Easing } from 'react-native';
import { useTranslation } from 'react-i18next';
import FlipButton from './FlipButton';
import { Globals } from '@/app/constants/Globals';
import StyledText from '@/components/StyledText';
import { useSettings } from '@/context/SettingsContext';
import { Ionicons } from "@expo/vector-icons";

const PrivacySettingsModal = ({ visible, onClose, initialSettings, onSave }) => {
  const { t } = useTranslation();
  const { settings: appSettings } = useSettings();
  const [settings, setSettings] = useState(initialSettings);

  const useColumnLayout = appSettings.fontSizeMultiplier >= 2;

  // --- START: Added for scroll indicator ---
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const bounceValue = useRef(new Animated.Value(0)).current;
  const indicatorOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // This creates a looping bouncing animation
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: 10,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(bounceValue, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
      ])
    );
    // Only start animation if the modal is visible
    if (visible) {
        bounceAnimation.start();
    }
    return () => bounceAnimation.stop(); // Clean up the animation
  }, [bounceValue, visible]);

  const handleScroll = (event) => {
    // When the user scrolls down more than 20 pixels
    if (event.nativeEvent.contentOffset.y > 20 && showScrollIndicator) {
      // Fade out the indicator and then remove it from the screen
      Animated.timing(indicatorOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowScrollIndicator(false));
    }
  };
  // --- END: Added for scroll indicator ---

  useEffect(() => {
    if (visible) {
      setSettings(initialSettings);
      // Reset scroll indicator visibility when modal opens
      setShowScrollIndicator(true);
      indicatorOpacity.setValue(1);
    }
  }, [initialSettings, visible]);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveChanges = () => {
    onSave(settings);
    onClose();
  };

  const privacyOptions = [
    { key: 'showProfilePicture', label: t('ProfileScreen_profileImage') },
    { key: 'showAdditionalPictures', label: t('ProfileScreen_extraImages') },
    { key: 'showPartner', label: t('ProfileScreen_partner') },
    { key: 'showApartmentNumber', label: t('ProfileScreen_apartmentNumber') },
    { key: 'showMobilePhone', label: t('ProfileScreen_mobilePhone') },
    { key: 'showEmail', label: t('ProfileScreen_email') },
    { key: 'showArrivalYear', label: t('ProfileScreen_arrivalYear') },
    { key: 'showOrigin', label: t('ProfileScreen_origin') },
    { key: 'showProfession', label: t('ProfileScreen_profession') },
    { key: 'showInterests', label: t('ProfileScreen_interests') },
    { key: 'showAboutMe', label: t('ProfileScreen_aboutMe') },
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <StyledText style={styles.modalTitle}>{t('PrivacySettings_title')}</StyledText>
            <StyledText style={styles.modalSubTitle}>{t('PrivacySettings_SubTitle')}</StyledText>
            
            {privacyOptions.map(option => {
              const isSingleWord = !option.label.trim().includes(' ');
              return (
                <View key={option.key} style={styles.optionRow}>
                  <View style={styles.labelContainer}>
                    <StyledText 
                      style={styles.optionLabel}
                      numberOfLines={isSingleWord ? 1 : 0}
                      adjustsFontSizeToFit={isSingleWord}
                    >
                      {option.label}
                    </StyledText>
                  </View>
                  <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={settings[option.key] ? "#005eff" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => handleToggle(option.key)}
                    value={settings[option.key]}
                    style={styles.switch}
                  />
                </View>
              );
            })}

            <View style={[styles.buttonRow, useColumnLayout && styles.buttonColumn]}>
              <FlipButton 
                onPress={handleSaveChanges} 
                style={[styles.button, useColumnLayout && styles.largeButton]}
              >
                <StyledText style={styles.buttonText}>{t('EditProfileScreen_saveButton')}</StyledText>
              </FlipButton>
              <FlipButton 
                onPress={onClose} 
                style={[styles.button, styles.cancelButton, useColumnLayout && styles.largeButton]}
              >
                <StyledText style={styles.buttonText}>{t('EditProfileScreen_cancelButton')}</StyledText>
              </FlipButton>
            </View>
          </ScrollView>
          {showScrollIndicator && (
            <Animated.View
              style={[
                styles.scrollIndicator,
                {
                  opacity: indicatorOpacity,
                  transform: [{ translateY: bounceValue }],
                },
              ]}
              pointerEvents="none"
            >
              <Ionicons name="chevron-down" size={40} color="#FFFFFF" />
            </Animated.View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: Dimensions.get('window').width * 0.9,
    maxHeight: Dimensions.get('window').height * 0.8,
    overflow: 'hidden', 
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    paddingTop: 25,
  },
  modalSubTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollContent: {
    width: '100%',
    paddingHorizontal: 25,
    paddingBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center', 
    width: '100%',
    paddingVertical: 12, 
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  labelContainer: {
    flex: 1, 
    marginRight: 10, 
  },
  optionLabel: {
    fontSize: 18,
    textAlign: Globals.userSelectedDirection === 'rtl' ? 'right' : 'left',
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  buttonRow: {
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 30,
  },
  button: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 2,
    backgroundColor: '#2196F3',
    width: '45%',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  buttonColumn: {
    flexDirection: 'column',
    alignItems: 'center', 
    gap: 15, 
  },
  largeButton: {
    width: '90%', 
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    zIndex: 10,
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
});

export default PrivacySettingsModal;
