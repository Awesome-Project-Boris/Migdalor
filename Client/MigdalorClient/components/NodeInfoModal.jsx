import React from "react";
import { Modal, View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import StyledText from "@/components/StyledText";
import FlipButtonSizeless from "@/components/FlipButtonSizeless"; // Import the new button

const NodeInfoModal = ({ visible, node, onClose }) => {
  const { t } = useTranslation();
  if (!visible || !node) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <StyledText style={styles.modalText}>
            {t(node.description, { defaultValue: node.description })}
          </StyledText>
          <View style={styles.buttonContainer}>
            <FlipButtonSizeless onPress={onClose} style={styles.closeButton}>
              <StyledText style={styles.closeButtonText}>
                {t("MapScreen_backToMapButton")}
              </StyledText>
            </FlipButtonSizeless>
          </View>
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
    paddingBottom: 20, // Add padding at the bottom
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 25, // Increased bottom margin
    textAlign: "center",
    fontSize: 20, // 2. Made text bigger
    lineHeight: 28,
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    alignSelf: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  buttonContainer: {
    width: "100%",
    paddingTop: 10,
    marginTop: "auto",
  },
});

export default NodeInfoModal;
