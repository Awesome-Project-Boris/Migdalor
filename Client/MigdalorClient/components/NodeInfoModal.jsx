import React from "react";
import { Modal, View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import FlipButtonSizeless from "@/components/FlipButtonSizeless"; // Ensure this path is correct

const NodeInfoModal = ({ visible, node, onClose }) => {
  const { t } = useTranslation();

  // If there's no node data, don't render anything
  if (!node) {
    return null;
  }

  // Directly use node.description, as it is already translated from the API
  const descriptionText = node.description;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>{descriptionText}</Text>
          <FlipButtonSizeless style={styles.buttonClose} onPress={onClose}>
            <Text style={styles.textStyle}>
              {t("Common_BackButtonShort", "Back")}
            </Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "85%",
  },
  modalText: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
  buttonClose: {
    backgroundColor: "#2196F3",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});

export default NodeInfoModal;
