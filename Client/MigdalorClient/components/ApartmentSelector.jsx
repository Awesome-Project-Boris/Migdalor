import React, { useEffect, useState, useRef } from "react";
import { View } from "react-native";
import FloatingLabelInput from "./FloatingLabelInput";
import StyledText from "./StyledText";
import { useTranslation } from "react-i18next";
import { Globals } from "@/app/constants/Globals";

const ApartmentSelector = ({ value, onApartmentChange, error }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(value ? String(value) : "");
  const [status, setStatus] = useState({ message: "", color: "grey" });
  const [existingApartments, setExistingApartments] = useState(new Set());

  // --- FIX: Add a loading state ---
  const [isLoading, setIsLoading] = useState(true);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    const newInputValue = value ? String(value) : "";
    if (newInputValue !== inputValue) {
      setInputValue(newInputValue);
      validateApartment(Number(newInputValue));
    }
  }, [value]);

  useEffect(() => {
    const fetchExistingApartments = async () => {
      try {
        const response = await fetch(
          `${Globals.API_BASE_URL}/api/Apartments/existing-numbers`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const numericData = data.map(Number);
        const newApartmentSet = new Set(numericData);
        setExistingApartments(newApartmentSet);

        // --- FIX: Re-validate the initial value now that data is loaded ---
        if (inputValue) {
          validateApartment(Number(inputValue), false, newApartmentSet);
        }
      } catch (e) {
        console.error("Failed to fetch existing apartments:", e);
      } finally {
        // --- FIX: Mark loading as complete ---
        setIsLoading(false);
      }
    };
    fetchExistingApartments();
  }, []); // This effect should only run once on mount

  // --- FIX: Add guard clauses to prevent running with incomplete data ---
  const validateApartment = (
    num,
    isDebounced = true,
    apartmentSet = existingApartments
  ) => {
    // Don't run validation until the fetch is complete
    if (isLoading && isDebounced) {
      return;
    }

    if (isNaN(num) || num <= 0) {
      setStatus({ message: "", color: "grey" });
      return;
    }

    if (apartmentSet.has(num)) {
      setStatus({ message: t("ApartmentSelector_Exists"), color: "green" });
    } else if (
      (num >= 101 && num <= 120) ||
      (num >= 201 && num <= 220) ||
      (num >= 301 && num <= 332) ||
      (num >= 401 && num <= 432) ||
      (num >= 131 && num <= 149) ||
      (num >= 231 && num <= 249) ||
      (num >= 331 && num <= 349) ||
      (num >= 431 && num <= 449)
    ) {
      setStatus({ message: t("ApartmentSelector_Exists"), color: "green" });
    } else {
      setStatus({ message: t("ApartmentSelector_Invalid"), color: "red" });
    }
  };

  const handleInputChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, "");
    setInputValue(numericText);
    onApartmentChange(numericText);

    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      validateApartment(Number(numericText));
    }, 500);
  };

  const textAlignStyle = {
    textAlign: Globals.userSelectedDirection === "rtl" ? "right" : "left",
  };

  return (
    <View style={{ width: "85%", alignSelf: "center", marginBottom: 30 }}>
      <FloatingLabelInput
        label={t("ProfileScreen_apartmentNumber")}
        value={inputValue}
        onChangeText={handleInputChange}
        keyboardType="numeric"
        alignRight={Globals.userSelectedDirection === "rtl"}
      />
      {status.message && (
        <StyledText
          style={{
            fontSize: 20,
            color: status.color,
            marginTop: 4,
            ...textAlignStyle,
          }}
        >
          {status.message}
        </StyledText>
      )}
      {error && (
        <StyledText
          style={{
            fontSize: 20,
            color: "red",
            marginTop: 4,
            ...textAlignStyle,
          }}
        >
          {error}
        </StyledText>
      )}
    </View>
  );
};

export default ApartmentSelector;
