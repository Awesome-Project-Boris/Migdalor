import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { NavigationContainer , NavigationIndependentTree} from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import GeneralSettings from './GeneralSettings';
import NotificationSettings from './NotificationSettings';
import SoundSettings from './SoundSettings';

const Tab = createBottomTabNavigator();

export default function SettingsTabs() {
  return (
      <Tab.Navigator
        initialRouteName="General"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: 'lightgreen',
        }}
      >
        <Tab.Screen
          name="General"
          component={GeneralSettings}
          options={{
            headerShown: false,
            title: 'General Settings',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="home" size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Notifications"
          component={NotificationSettings}
          options={{
            headerShown: false,
            title: 'Notification Settings',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="bell" size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Sound"
          component={SoundSettings}
          options={{
            headerShown: false,
            title: 'Sound Settings',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="volume-up" size={24} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
  );
}
