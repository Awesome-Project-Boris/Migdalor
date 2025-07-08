import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, Switch, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import FlipButton from './FlipButton';
import { Globals } from '@/app/constants/Globals';

const PrivacySettingsModal = ({ visible, onClose, initialSettings, onSave }) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(initialSettings);

  // When the modal becomes visible, sync its internal state with the latest props from the parent.
  // This ensures that if the parent's state changes, the modal reflects it when reopened.
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

  // Define the fields that the user can control.
  // The 'key' must match the column names in your OH_PrivacySettings table.
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
          <Text style={styles.modalTitle}>{t('PrivacySettings_title')}</Text>
          <ScrollView style={styles.scrollView}>
            {privacyOptions.map(option => (
              <View key={option.key} style={styles.optionRow}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  thumbColor={settings[option.key] ? "#f5dd4b" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => handleToggle(option.key)}
                  value={settings[option.key]}
                  style={styles.switch}
                />
              </View>
            ))}
          </ScrollView>
          <View style={styles.buttonRow}>
            <FlipButton onPress={handleSaveChanges} style={styles.button}>
              <Text style={styles.buttonText}>{t('EditProfileScreen_saveButton')}</Text>
            </FlipButton>
            <FlipButton onPress={onClose} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.buttonText}>{t('EditProfileScreen_cancelButton')}</Text>
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
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: Dimensions.get('window').width * 0.9,
    maxHeight: Dimensions.get('window').height * 0.8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scrollView: {
    width: '100%',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionLabel: {
    fontSize: 18,
    flex: 1,
    textAlign: Globals.userSelectedDirection === 'rtl' ? 'right' : 'left',
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
    marginLeft: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
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
