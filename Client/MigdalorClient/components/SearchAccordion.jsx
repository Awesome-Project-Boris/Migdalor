// components/SearchAccordion.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Globals } from '@/app/constants/Globals';

const SCREEN_WIDTH = Globals.SCREEN_WIDTH;

// --- Default Styles --- (Can be overridden by props if needed)
const defaultStyles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.90,
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1, //
    marginRight: 10, 
  },
  content: {
    padding: 15,
  },
  active: {
    
  },
  inactive: {
   
  },
});

export default function SearchAccordion({
  children, // The content to render inside (e.g., search inputs/buttons)
  headerOpenTextKey = 'Common_Accordion_Close', 
  headerClosedTextKey = 'Common_Accordion_Open', 
  containerStyle, 
  headerStyle, 
  contentStyle, 
  initialCollapsed = true, 
}) {
  const { t } = useTranslation();
  const [activeSections, setActiveSections] = useState(initialCollapsed ? [] : [0]); // Control open/closed

  // Accordion requires a 'sections' array, even if only one section
  const SECTIONS = [{ id: 'content' }]; // Simple structure

  const renderHeader = (section, index, isActive) => {
    return (
      <Animatable.View
        duration={300}
        transition="backgroundColor"
        style={[defaultStyles.header, headerStyle, isActive ? defaultStyles.active : defaultStyles.inactive]}
      >
        <Text style={defaultStyles.headerText}>
          {isActive ? t(headerOpenTextKey) : t(headerClosedTextKey)}
        </Text>
        <Ionicons
          name={isActive ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#333"
        />
      </Animatable.View>
    );
  };

  const renderContent = (section, index, isActive) => {
    // Render the children passed into the component
    return (
      <Animatable.View
        duration={300}
        transition="opacity"
        style={[defaultStyles.content, contentStyle]}
      >
        {children}
      </Animatable.View>
    );
  };

  const updateSections = (activeSectionsIndexes) => {
    setActiveSections(activeSectionsIndexes);
  };

  return (
    <View style={[defaultStyles.container, containerStyle]}>
      <Accordion
        sections={SECTIONS}
        activeSections={activeSections}
        renderHeader={renderHeader}
        renderContent={renderContent}
        onChange={updateSections}
        touchableComponent={TouchableOpacity}
        expandMultiple={false}
        underlayColor="transparent"
      />
    </View>
  );
}