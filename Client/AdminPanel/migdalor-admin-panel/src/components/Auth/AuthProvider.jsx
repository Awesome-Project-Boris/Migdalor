import React, { useState, useCallback, useEffect } from "react";
import AuthContext from "./AuthContext";
import api from "../../api/api";

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("migdalor_admin_token")
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const verifyAdminStatus = useCallback(async (currentToken) => {
    if (!currentToken) {
      setIsAdmin(false);
      setIsLoading(false);
      setUser(null);
      return;
    }
    try {
      const adminStatus = await api.get("/People/IsAdmin", currentToken);
      if (adminStatus) {
        setIsAdmin(true);
        // const userDetails = await api.get("/People/details", currentToken);
        // setUser(userDetails);
      } else {
        throw new Error("User is not an admin.");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      localStorage.removeItem("migdalor_admin_token");
      setToken(null);
      setIsAdmin(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyAdminStatus(token);
  }, [token, verifyAdminStatus]);

  const login = async (phoneNumber, password) => {
    try {
      setIsLoading(true);
      const response = await api.post("/People/login", {
        PhoneNumber: phoneNumber,
        Password: password,
      });
      const newToken = response;
      localStorage.setItem("migdalor_admin_token", newToken);
      setToken(newToken);
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("migdalor_admin_token");
    setToken(null);
    setIsAdmin(false);
    setUser(null);
  };

  const value = { token, isAdmin, user, isLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
