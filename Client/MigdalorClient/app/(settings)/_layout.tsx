import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useTranslation } from "react-i18next";

export default function SettingsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'lightgreen' }}>
      <Tabs.Screen
        name="FontSettings"
        options={{
          title: t("SettingsLayoutTabs_FontSettings"),
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="font" color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="NotificationSettings"
        options={{
          title: t("SettingsLayoutTabs_notificationSettings"),
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="bell" color={color} />,
        }}
      />
      <Tabs.Screen
        name="LanguageSettings"
        options={{
          title: t("SettingsLayoutTabs_languageSettings"),
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="language" color={color} />,
        }}
      />
    </Tabs>
  );
}
