import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'lightgreen' }}>
      <Tabs.Screen
        name="GeneralSettings"
        options={{
          title: 'General Settings',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="NotificationSettings"
        options={{
          title: 'Notification Settings',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="LanguageSettings"
        options={{
          title: 'Language Settings',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
    </Tabs>
  );
}
