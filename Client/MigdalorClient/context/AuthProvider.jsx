import React, { createContext, useEffect, useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Globals } from "../app/constants/Globals";
import { usePushNotifications } from "@/hooks/usePushNotifications";

// Create the AuthContext with a default value
const AuthContext = createContext({
  user: null,
  token: null, // Add token to the context
  login: async (phoneNumber, password) => {},
  logout: async () => {},
  setUser: () => {},
});

// Export a custom hook for easy access to the context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // State to hold the JWT
  const [loading, setLoading] = useState(true);
  const { expoPushToken } = usePushNotifications();

  // On mount, try to load the token and validate it.
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("jwt");
        if (storedToken) {
          setToken(storedToken);
          // Fetch user details using the stored token to validate it
          const userDetailsResponse = await fetch(
            `${Globals.API_BASE_URL}/api/People/details`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${storedToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (userDetailsResponse.ok) {
            const userData = await userDetailsResponse.json();
            // The server returns a dynamic object, let's map it to a consistent user object
            const formattedUser = {
              personId: userData.id,
              hebFirstName: userData.hebName?.split(" ")[0] || "",
              hebLastName:
                userData.hebName?.split(" ").slice(1).join(" ") || "",
              engFirstName: userData.engName?.split(" ")[0] || "",
              engLastName:
                userData.engName?.split(" ").slice(1).join(" ") || "",
              ...userData, // include other fields from the response
            };
            setUser(formattedUser);
          } else {
            // Token is invalid or expired, clear it
            await logout();
          }
        }
      } catch (error) {
        console.error("Error loading user data from storage", error);
        // In case of network error on startup, don't log the user out
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  const login = async (phoneNumber, password) => {
    try {
      const apiUrl = `${Globals.API_BASE_URL}/api/People/login`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, password }),
      });

      if (!response.ok) {
        throw new Error(`Login failed: HTTP ${response.status}`);
      }

      // The response body is the raw JWT string
      const receivedToken = await response.text();

      // Store the token
      await AsyncStorage.setItem("jwt", receivedToken);
      setToken(receivedToken);

      // Fetch user details with the new token
      const userDetailsResponse = await fetch(
        `${Globals.API_BASE_URL}/api/People/details`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${receivedToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!userDetailsResponse.ok) {
        throw new Error("Failed to fetch user details after login.");
      }

      const userData = await userDetailsResponse.json();
      const formattedUser = {
        personId: userData.id,
        hebFirstName: userData.hebName?.split(" ")[0] || "",
        hebLastName: userData.hebName?.split(" ").slice(1).join(" ") || "",
        engFirstName: userData.engName?.split(" ")[0] || "",
        engLastName: userData.engName?.split(" ").slice(1).join(" ") || "",
        ...userData,
      };

      // Save the necessary user data to AsyncStorage.
      await AsyncStorage.multiSet([
        ["userID", formattedUser.personId],
        ["userHebFirstName", formattedUser.hebFirstName],
        ["userHebLastName", formattedUser.hebLastName],
        ["userEngFirstName", formattedUser.engFirstName],
        ["userEngLastName", formattedUser.engLastName],
      ]);

      // Set the user information in state
      setUser(formattedUser);

      // Post push token to server
      if (expoPushToken?.data) {
        const registerTokenUrl = `${Globals.API_BASE_URL}/api/Notifications/registerToken`;
        await fetch(registerTokenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${receivedToken}`, // Use token for this request too if secured
          },
          body: JSON.stringify({
            personId: formattedUser.personId,
            pushToken: expoPushToken.data,
          }),
        });
      }

      return formattedUser;
    } catch (error) {
      console.error("Authentication error:", error);
      // Clear potentially bad token
      await logout();
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Remove the JWT and any other user data
      await AsyncStorage.multiRemove([
        "jwt",
        "userID",
        "userHebFirstName",
        "userHebLastName",
        "userEngFirstName",
        "userEngLastName",
      ]);
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // While checking AsyncStorage, optionally render a loader or nothing.
  if (loading) {
    return null; // or a splash screen / ActivityIndicator
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
