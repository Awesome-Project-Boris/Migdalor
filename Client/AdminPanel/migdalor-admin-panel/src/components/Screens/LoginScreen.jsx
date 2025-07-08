import React, { useState, useContext } from "react";
import AuthContext from "../Auth/AuthContext";

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useContext(AuthContext);

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setPhoneNumber(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);
    try {
      await login(phoneNumber, password);
    } catch (err) {
      setError("ההתחברות נכשלה. אנא בדוק את פרטיך וודא שאתה מנהל מערכת.");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="mb-8">
        <img
          src="./src/assets/migdalei.png"
          alt="Migdalor Logo"
          className="rounded-lg max-w-80 h-auto"
        />
      </div>
      <div className="relative w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <span className="w-128 h-128 mx-auto text-blue-600">🛡️</span>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            פאנל ניהול מגדלור
          </h2>
          <p className="mt-2 text-sm text-gray-600">התחבר לחשבון המנהל שלך</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <input
                id="phone-number"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-right"
                placeholder="מספר טלפון"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                maxLength="10"
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-right"
                placeholder="סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md group hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isLoggingIn ? "מתחבר..." : "התחבר"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
