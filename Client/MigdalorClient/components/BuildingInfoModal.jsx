import React, { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import StyledText from "@/components/StyledText";
import FlipButton from "@/components/FlipButton";
import FlipButtonSizeless from "@/components/FlipButtonSizeless";

const ResidentItem = ({ resident }) => {
  const { i18n } = useTranslation();
  const router = useRouter();
  const residentName =
    i18n.language === "he" ? resident.fullNameHe : resident.fullNameEn;

  return (
    <View style={styles.residentRow}>
      <StyledText style={styles.residentName}>{residentName}</StyledText>
      <View style={styles.residentActions}>
        <FlipButton
          style={styles.actionButton}
          onPress={() =>
            router.push({
              pathname: "/Profile",
              params: { userId: resident.residentId },
            })
          }
        >
          <StyledText style={styles.actionButtonText}>Profile</StyledText>
        </FlipButton>
        <FlipButton
          style={styles.actionButton}
          onPress={() => {
            /* Navigation logic comes later */
          }}
        >
          <StyledText style={styles.actionButtonText}>Navigate</StyledText>
        </FlipButton>
      </View>
    </View>
  );
};

const ApartmentAccordion = ({ apartment }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={() => setIsOpen(!isOpen)}
      >
        <StyledText style={styles.apartmentTitle}>
          {t(apartment.apartmentName, {
            defaultValue: apartment.apartmentName,
          })}{" "}
          {apartment.displayNumber}
        </StyledText>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={24}
          color="#333"
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.accordionContent}>
          {apartment.residents.length > 0 ? (
            apartment.residents.map((res) => (
              <ResidentItem key={res.residentId} resident={res} />
            ))
          ) : (
            <StyledText style={styles.noResidentsText}>
              No residents listed
            </StyledText>
          )}
        </View>
      )}
    </View>
  );
};

const BuildingInfoModal = ({ visible, building, onClose }) => {
  const { t } = useTranslation();

  if (!visible || !building) return null;

  const hasApartments = building.apartments && building.apartments.length > 0;
  let modalTitle = t(building.buildingName, {
    defaultValue: "Unknown Building",
  });

  if (hasApartments && building.apartments.length <= 2) {
    const apartmentNumbers = building.apartments
      .map((a) => a.displayNumber)
      .join(", ");
    modalTitle = `${t(
      building.apartments[0].apartmentName
    )} ${apartmentNumbers}`;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <StyledText style={styles.modalTitle}>{modalTitle}</StyledText>
          <ScrollView style={styles.scrollView}>
            {/* The ScrollView correctly handles your 3rd point: yes, it will scroll with 30 apartments. */}
            {hasApartments ? (
              building.apartments.map((apt) => (
                <ApartmentAccordion key={apt.apartmentNumber} apartment={apt} />
              ))
            ) : (
              <StyledText style={styles.noApartmentsText}>
                No apartments listed for this building.
              </StyledText>
            )}
          </ScrollView>
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
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 10, // Adjust padding
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    height: "75%",
    width: "100%",
    justifyContent: "space-between", // Key change for layout
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    alignSelf: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  scrollView: { flex: 1, width: "100%" },
  accordionContainer: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f9f9f9",
  },
  apartmentTitle: { fontSize: 18, fontWeight: "600" },
  accordionContent: { padding: 15 },
  residentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  residentName: { fontSize: 16 },
  residentActions: { flexDirection: "row", gap: 10 },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: "#007bff",
  },
  actionButtonText: { color: "#fff", fontSize: 14 },
  noResidentsText: { fontStyle: "italic", color: "#888" },
  noApartmentsText: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 16,
    color: "#888",
  },
  buttonContainer: {
    paddingTop: 10, // Space between scroll view and button
    width: "100%",
  },
});

export default BuildingInfoModal;
