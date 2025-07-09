// /src/pages/LoginScreen.jsx

import React, { useState } from "react";
import { Shield } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

/**
 * The login screen for administrators. It provides a form for entering
 * a phone number and password to access the admin panel.
 */
const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();

  /**
   * Handles changes to the phone number input, allowing only digits
   * and enforcing a max length.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove all non-digit characters
    if (value.length <= 10) {
      setPhoneNumber(value);
    }
  };

  /**
   * Handles the form submission, calls the login function from AuthContext,
   * and manages loading and error states.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);
    try {
      await login(phoneNumber, password);
      // On success, the AuthProvider will handle navigation automatically.
    } catch (err) {
      console.error("Login attempt failed:", err);
      setError("ההתחברות נכשלה. אנא בדוק את פרטיך וודא שאתה מנהל מערכת.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="mb-8">
        <img
          src="https://placehold.co/320x100/003366/FFFFFF?text=Migdalor+Logo"
          alt="Migdalor Logo"
          className="rounded-lg max-w-80 h-auto"
        />
      </div>
      <div className="relative w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            פאנל ניהול מגדלור
          </h2>
          <p className="mt-2 text-sm text-gray-600">התחבר לחשבון המנהל שלך</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <input
              id="phone-number"
              type="tel"
              autoComplete="tel"
              required
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-right"
              placeholder="מספר טלפון"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              maxLength="10"
            />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-right"
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md group hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isLoggingIn ? "מתחבר..." : "התחבר"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
