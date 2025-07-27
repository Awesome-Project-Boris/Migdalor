import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { api } from "../api/apiService";

// Helper function to decode a JWT payload
const decodeJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

// Create the context with a default null value.
const AuthContext = createContext(null);

/**
 * Provides authentication state and functions to its children components.
 * Manages user token, admin status, user details, and loading state.
 */
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("migdalor_admin_token")
  );
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // This effect runs when the component mounts or the token changes.
  // It decodes the token to set the user state.
  useEffect(() => {
    if (token) {
      const decoded = decodeJwt(token);
      // Check if the token is valid and not expired
      if (decoded && decoded.exp * 1000 > Date.now()) {
        const userRole =
          decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];

        setUser({
          id: decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ],
          hebFirstName:
            decoded[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"
            ],
          hebLastName:
            decoded[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"
            ],
          role: userRole,
        });
      } else {
        // If token is expired or invalid, log out
        logout();
      }
    }
    setIsLoading(false);
  }, [token]);

  /**
   * Logs in the user by calling the dedicated login API service
   * and storing the received token.
   * @param {string} phoneNumber
   * @param {string} password
   */
  const login = async (phoneNumber, password) => {
    try {
      setIsLoading(true);
      // UPDATED: Use the new, dedicated postLogin function from the api service
      const newToken = await api.login(phoneNumber, password);
      localStorage.setItem("migdalor_admin_token", newToken);
      setToken(newToken);
      // Verification and user state update will be triggered by the useEffect hook.
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false); // Stop loading on failure.
      throw error; // Re-throw to be caught by the UI.
    }
  };

  /**
   * Logs out the user by clearing the token from state and localStorage.
   */
  const logout = () => {
    localStorage.removeItem("migdalor_admin_token");
    setToken(null);
    setUser(null);
  };

  // The value provided to consuming components.
  // isAdmin is now derived directly from the user object.
  const value = {
    token,
    isAuthenticated: !!user,
    user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * A custom hook to easily consume the AuthContext.
 * // @returns {object} The authentication context value.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
