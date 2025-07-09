// /src/components/common/LoadingScreen.jsx

import React from "react";
import { Shield } from "lucide-react";

/**
 * A full-screen loading indicator displayed while the application is initializing
 * or fetching essential data.
 */
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="flex flex-col items-center">
      <Shield className="w-16 h-16 text-blue-500 animate-pulse" />
      <p className="mt-4 text-lg text-gray-600">טוען פאנל ניהול...</p>
    </div>
  </div>
);

export default LoadingScreen;
