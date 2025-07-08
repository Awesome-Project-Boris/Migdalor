import React from "react";

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="flex flex-col items-center">
      {/* You can import and use your Shield icon here if needed */}
      <span className="w-128 h-128 text-blue-500 animate-pulse">🛡️</span>
      <p className="mt-4 text-lg text-gray-600">טוען פאנל ניהול...</p>
    </div>
  </div>
);

export default LoadingScreen;
