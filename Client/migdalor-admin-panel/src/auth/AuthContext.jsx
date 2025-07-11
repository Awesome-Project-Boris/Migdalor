// /src/auth/AuthContext.js

import React, {
    useState,
    useEffect,
    createContext,
    useContext,
    useCallback,
} from "react";
import { api } from "../api/apiService";

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
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    /**
     * Verifies the current user's token to check if they are an administrator.
     * Fetches user details if verification is successful.
     */
    const verifyAdminStatus = useCallback(async (currentToken) => {
        if (!currentToken) {
            setIsAdmin(false);
            setIsLoading(false);
            setUser(null);
            return;
        }

        try {
            // Check if the user has admin privileges.
            const adminStatus = await api.get("/People/IsAdmin", currentToken);
            if (adminStatus) {
                setIsAdmin(true);
                // If they are an admin, fetch their details.
                const userDetails = await api.get("/People/AdminDetails", currentToken);
                setUser(userDetails);
            } else {
                // If not an admin, treat as an error to force logout.
                throw new Error("User is not an admin.");
            }
        } catch (error) {
            console.error("Admin verification failed:", error.message);
            // Clear out stale/invalid token and user state.
            localStorage.removeItem("migdalor_admin_token");
            setToken(null);
            setIsAdmin(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Effect to run verification whenever the component mounts or the token changes.
    useEffect(() => {
        verifyAdminStatus(token);
    }, [token, verifyAdminStatus]);

    /**
     * Logs in the user by calling the API and storing the received token.
     * @param {string} phoneNumber
     * @param {string} password
     */
    const login = async (phoneNumber, password) => {
        try {
            setIsLoading(true);
            const response = await api.post("/People/login", {
                PhoneNumber: phoneNumber,
                Password: password,
            });
            const newToken = response; // Assuming the response is the token string.
            localStorage.setItem("migdalor_admin_token", newToken);
            setToken(newToken);
            // Verification will be triggered automatically by the useEffect hook.
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
        setIsAdmin(false);
        setUser(null);
    };

    // The value provided to consuming components.
    const value = { token, isAdmin, user, isLoading, login, logout };

    return  <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
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
  