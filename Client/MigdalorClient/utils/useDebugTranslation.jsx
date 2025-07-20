import { useTranslation } from "react-i18next";
import { useCallback } from "react";

/**
 * This is a wrapper around the original `useTranslation` hook.
 * It replaces the `t` function with a version that logs a detailed
 * error with a stack trace whenever it's called with an invalid key.
 */
export const useDebugTranslation = () => {
  // Get the original hook's properties
  const { t, i18n } = useTranslation();

  // Create a new, debug-enabled version of the 't' function.
  // We use useCallback to ensure it has a stable identity.
  const debugT = useCallback(
    (key, options) => {
      // If the key is falsy (null, undefined, ""), log an error.
      if (!key) {
        console.error(
          "--- i18next DEBUG: t() was called with an invalid key ---",
          new Error().stack // This creates a stack trace to find the source
        );
        // Return a placeholder to avoid further app crashes.
        return "Invalid Key";
      }
      // If the key is valid, call the original 't' function.
      return t(key, options);
    },
    [t] // The dependency is the original 't' function
  );

  // Return all original properties, but with our wrapped 't' function.
  return { t: debugT, i18n };
};