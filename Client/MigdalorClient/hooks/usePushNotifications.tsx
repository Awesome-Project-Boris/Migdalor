import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Globals } from "@/app/constants/Globals";

export interface PushNotificationState {
  expoPushToken?: Notifications.ExpoPushToken;
  notification?: Notifications.Notification;
}

const NOTIFICATION_SETTING_KEY = "user_notification_setting";

async function postPushToken(expoPushToken: string) {
  const userID = await AsyncStorage.getItem("userID");
  if (!userID) {
    return;
  }
  const payload = {
    personId: userID,
    pushToken: expoPushToken,
  };

  try {
    const resp = await fetch(
      `${Globals.API_BASE_URL}/api/Notifications/registerToken`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!resp.ok) {
      console.error("Failed to register push token", await resp.text());
    } else {
      console.log("Push token registered successfully");
    }
  } catch (error) {
    console.error("Error posting push token:", error);
  }
}

export const usePushNotifications = (): PushNotificationState => {
  Notifications.setNotificationHandler({
    handleNotification: async () => {
      try {
        const setting =
          (await AsyncStorage.getItem(NOTIFICATION_SETTING_KEY)) || "both";

        const shouldPlaySound = setting === "both" || setting === "sound";
        // Note: There isn't a direct `shouldVibrate` property for the handler.
        // On iOS, vibration is linked to sound.
        // On Android, vibration for foreground notifications is handled by the channel's importance.
        // This logic correctly sets sound, which implicitly handles vibration on iOS.
        const shouldVibrate = setting === "both" || setting === "vibration";

        return {
          shouldShowAlert: true,
          shouldPlaySound: shouldPlaySound,
          shouldSetBadge: true,
        };
      } catch (error) {
        console.error("Failed to get notification setting", error);
        // Fallback to default behavior
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        };
      }
    },
  });

  const [expoPushToken, setExpoPushToken] = useState<
    Notifications.ExpoPushToken | undefined
  >();

  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();

  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification");
        return;
      }

      token = await Notifications.getExpoPushTokenAsync({
        projectId:
          Constants?.expoConfig?.extra?.eas?.projectId ??
          Constants?.easConfig?.projectId,
      });
    } else {
      // It's helpful to inform the user, but `alert` can be intrusive.
      // console.log("Must be using a physical device for Push notifications");
    }

    if (Platform.OS === "android") {
      // Get the user's preference for vibration from storage
      const setting =
        (await AsyncStorage.getItem(NOTIFICATION_SETTING_KEY)) || "both";
      const shouldVibrate = setting === "both" || setting === "vibration";

      // Set up the notification channel with or without a vibration pattern.
      // This controls notifications when the app is in the background or killed on Android.
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: shouldVibrate ? [0, 250, 250, 250] : null,
        lightColor: "#FF231F7C",
      });
    }

    return token;
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        postPushToken(token.data);
      }
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
};
