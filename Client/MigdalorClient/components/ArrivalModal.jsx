import React from "react";
import { Modal, View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import StyledText from "@/components/StyledText";
import FlipButtonSizeless from "@/components/FlipButtonSizeless";
import { Ionicons } from "@expo/vector-icons";

const ArrivalModal = ({ visible, destination, onClose }) => {
  const { t } = useTranslation();

  const destinationName = React.useMemo(() => {
    if (!destination) return "";
    if (destination.type === "building") {
      return t(destination.buildingName, {
        defaultValue: destination.buildingName,
      });
    }
    if (destination.type === "apartment") {
      return `${t("Apartment", "Apartment")} ${destination.displayNumber}`;
    }
    return "";
  }, [destination, t]);

  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Ionicons
            name="flag-outline"
            size={40}
            color="green"
            style={{ marginBottom: 15 }}
          />
          <StyledText style={styles.modalTitle}>
            {t("Navigation_ArrivedTitle", "You Have Arrived")}
          </StyledText>
          <StyledText style={styles.modalText}>
            {t(
              "Navigation_ArrivedMessage",
              "You have arrived at {{destination}}.",
              { destination: destinationName }
            )}
          </StyledText>
          <FlipButtonSizeless onPress={onClose} style={styles.closeButton}>
            <StyledText style={styles.closeButtonText}>{t("OK")}</StyledText>
          </FlipButtonSizeless>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: "85%",
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    marginBottom: 25,
    textAlign: "center",
    fontSize: 18,
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 50,
    backgroundColor: "#007bff",
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default ArrivalModal;
