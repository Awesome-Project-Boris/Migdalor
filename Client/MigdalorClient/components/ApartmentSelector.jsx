import React from "react";
import { View } from "react-native";
import FloatingLabelInput from "./FloatingLabelInput";
import StyledText from "./StyledText";
import { useTranslation } from "react-i18next";
import { Globals } from "@/app/constants/Globals";

const ApartmentSelector = ({ value, onApartmentChange, error }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = React.useState(
    value ? String(value) : ""
  );
  const [status, setStatus] = React.useState({ message: "", color: "grey" });
  const [existingApartments, setExistingApartments] = React.useState(new Set());
  const debounceTimeout = React.useRef(null);

  React.useEffect(() => {
    const fetchExistingApartments = async () => {
      try {
        const response = await fetch(
          `${Globals.API_BASE_URL}/api/Apartments/existing-numbers`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setExistingApartments(new Set(data));
      } catch (e) {
        console.error("Failed to fetch existing apartments:", e);
      }
    };
    fetchExistingApartments();
  }, []);

  const validateApartment = (num) => {
    if (isNaN(num) || num <= 0) {
      setStatus({ message: "", color: "grey" });
      return;
    }

    if (existingApartments.has(num)) {
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
      setStatus({ message: t("ApartmentSelector_Potential"), color: "blue" });
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

  // Determine text alignment based on global settings
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
        // 1. Apply RTL alignment to the input field
        alignRight={Globals.userSelectedDirection === "rtl"}
      />
      {status.message && (
        <StyledText
          // 2. Apply RTL alignment to the status message
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
        // 3. Apply RTL alignment to the error message
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
