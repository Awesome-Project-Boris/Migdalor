import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Globals } from "../app/constants/Globals";
import { usePushNotifications } from "@/hooks/usePushNotifications";

// Create the AuthContext with a default value
const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async (phoneNumber, password) => {},
  logout: async () => {},
  setUser: () => {},
  refreshToken: async () => {},
  loadUserSession: async () => {},
});

// Export a custom hook for easy access to the context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const { expoPushToken } = usePushNotifications();

  const logout = useCallback(async () => {
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
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem("jwt");
      if (!storedToken) {
        console.log("No token found to refresh.");
        return;
      }

      const response = await fetch(
        `${Globals.API_BASE_URL}/api/People/refresh-token`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const newToken = await response.text();
        await AsyncStorage.setItem("jwt", newToken);
        setToken(newToken);
        console.log("JWT token was updated.");
      } else {
        console.log(
          "Failed to refresh token. The existing token might be invalid."
        );
        // We will proceed, and loadUserSession will likely fail and trigger a logout.
      }
    } catch (error) {
      console.error("An error occurred while refreshing token:", error);
    }
  }, []);

  const loadUserSession = useCallback(async () => {
    try {
      const sessionToken = await AsyncStorage.getItem("jwt");
      if (!sessionToken) {
        // If there's no token, we're done loading. The user is not logged in.
        setLoading(false);
        return;
      }

      setToken(sessionToken);

      const userDetailsResponse = await fetch(
        `${Globals.API_BASE_URL}/api/People/details`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (userDetailsResponse.ok) {
        const userData = await userDetailsResponse.json();
        const formattedUser = {
          personId: userData.id,
          hebFirstName: userData.hebName?.split(" ")[0] || "",
          hebLastName: userData.hebName?.split(" ").slice(1).join(" ") || "",
          engFirstName: userData.engName?.split(" ")[0] || "",
          engLastName: userData.engName?.split(" ").slice(1).join(" ") || "",
          ...userData,
        };
        setUser(formattedUser);
      } else {
        await logout();
      }
    } catch (error) {
      console.error("Error loading user session:", error);
      await logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const login = useCallback(
    async (phoneNumber, password) => {
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

        const receivedToken = await response.text();
        await AsyncStorage.setItem("jwt", receivedToken);

        // After successful login, load the user session
        await loadUserSession();

        // Post push token to server after user session is loaded
        if (expoPushToken?.data && user?.personId) {
          const registerTokenUrl = `${Globals.API_BASE_URL}/api/Notifications/registerToken`;
          await fetch(registerTokenUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${receivedToken}`,
            },
            body: JSON.stringify({
              personId: user.personId,
              pushToken: expoPushToken.data,
            }),
          });
        }
      } catch (error) {
        console.error("Authentication error:", error);
        await logout();
        throw error;
      }
    },
    [logout, expoPushToken, loadUserSession, user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        setUser,
        refreshToken,
        loadUserSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
