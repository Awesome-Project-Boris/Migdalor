import React, { createContext, useEffect, useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator } from "react-native";
import { Globals } from "../app/constants/Globals";

// Create the AuthContext with a default value
const AuthContext = createContext({
  user: null,
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
  const [loading, setLoading] = useState(true);

  // On mount, try to load the user data from AsyncStorage.
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUserID = await AsyncStorage.getItem("userID");
        if (storedUserID) {
          // Optionally, you could retrieve more information from storage.
          AsyncStorage.multiGet([
            "userHebFirstName",
            "userHebLastName",
            "userEngFirstName",
            "userEngLastName",
          ]).then((values) => {
            const userHebFirstName = values[0][1];
            const userHebLastName = values[1][1];
            const userEngFirstName = values[2][1];
            const userEngLastName = values[3][1];
            setUser({
              userID: storedUserID,
              userHebFirstName,
              userHebLastName,
              userEngFirstName,
              userEngLastName,
            });
          });
        }
      } catch (error) {
        console.error("Error loading user data from storage", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // login function that mirrors your current logic:
  const login = async (phoneNumber, password) => {
    try {
      // Build your API URL (adjust Globals.API_BASE_URL accordingly).
      const apiurl = `${Globals.API_BASE_URL}/api/People/login`;
      const response = await fetch(apiurl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, password }),
      });

      if (!response.ok) {
        // You can throw an error or handle it with an error message.
        throw new Error(`Login failed: HTTP ${response.status}`);
      }

      const data = await response.json();

      // Save the necessary user data to AsyncStorage.
      await AsyncStorage.multiSet([
        ["userID", data.personId],
        ["userHebFirstName", data.hebFirstName],
        ["userHebLastName", data.hebLastName],
        ["userEngFirstName", data.engFirstName],
        ["userEngLastName", data.engLastName],
      ]);

      // Set the user information in state.
      setUser(data);
      return data;
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  };

  // logout function that clears the stored authentication info.
  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "userID",
        "userHebFirstName",
        "userHebLastName",
        "userEngFirstName",
        "userEngLastName",
      ]);
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // While checking AsyncStorage, optionally render a loader or nothing.
  if (loading) {
    return null; // or a splash screen / ActivityIndicator
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
