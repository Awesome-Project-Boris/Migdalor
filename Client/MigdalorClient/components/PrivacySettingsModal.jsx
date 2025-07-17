import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, ScrollView, Switch, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import FlipButton from './FlipButton';
import { Globals } from '@/app/constants/Globals';
import StyledText from '@/components/StyledText';
import { useSettings } from '@/context/SettingsContext';

const PrivacySettingsModal = ({ visible, onClose, initialSettings, onSave }) => {
  const { t } = useTranslation();
  const { settings: appSettings } = useSettings();
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    if (visible) {
      setSettings(initialSettings);
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
          <ScrollView style={styles.scrollView}>
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
          </ScrollView>

          <View style={styles.buttonRow}>
            <FlipButton onPress={handleSaveChanges} style={styles.button}>
              <StyledText style={styles.buttonText}>{t('EditProfileScreen_saveButton')}</StyledText>
            </FlipButton>
            <FlipButton onPress={onClose} style={[styles.button, styles.cancelButton]}>
              <StyledText style={styles.buttonText}>{t('EditProfileScreen_cancelButton')}</StyledText>
            </FlipButton>
          </View>
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
    flexDirection: 'column',
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
  scrollView: {
    width: '100%',
    paddingHorizontal: 25,
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 20, 
    borderTopWidth: 1,
    borderTopColor: '#eee',
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
});

export default PrivacySettingsModal;