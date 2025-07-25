import React, { useState } from "react";
import {
  Modal,
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import FlipButtonSizeless from "@/components/FlipButtonSizeless";
import { Globals } from "../app/constants/Globals";

const ResidentItem = ({ resident, onNavigateToApartment }) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const residentName =
    i18n.language === "he" ? resident.fullNameHe : resident.fullNameEn;

  return (
    <View style={styles.residentRow}>
      <Text style={styles.residentName}>{residentName}</Text>
      <View style={styles.residentActions}>
        <FlipButtonSizeless
          style={styles.actionButton}
          onPress={() =>
            router.push({
              pathname: "/Profile",
              params: { userId: resident.residentId },
            })
          }
        >
          <Text style={styles.actionButtonText}>{t("Modal_Profile")}</Text>
        </FlipButtonSizeless>
        <FlipButtonSizeless
          style={styles.actionButton}
          onPress={onNavigateToApartment}
        >
          <Text style={styles.actionButtonText}>{t("Modal_Navigate")}</Text>
        </FlipButtonSizeless>
      </View>
    </View>
  );
};

const ApartmentAccordion = ({ apartment, building, onNavigate }) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(apartment.residents.length > 0);

  const handleNavigateToApartment = () => {
    const apartmentTarget = {
      type: "apartment",
      ...apartment,
      physicalBuildingID: building.buildingID,
      entranceNodeIds: building.entranceNodeIds,
      displayName: `${t("Common_Apartment")} ${apartment.displayNumber}`,
    };
    onNavigate(apartmentTarget);
  };

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.apartmentTitle}>
          {t(apartment.apartmentName, {
            defaultValue: apartment.apartmentName,
          })}{" "}
          {apartment.displayNumber}
        </Text>
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
              <ResidentItem
                key={res.residentId}
                resident={res}
                onNavigateToApartment={handleNavigateToApartment}
              />
            ))
          ) : (
            <Text style={[styles.noResidentsText, { textAlign: Globals.userSelectedDirection === "rtl" ? "right" : "left" }]}>
              {t("MapScreen_NoResidentsListed")}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const BuildingInfoModal = ({ visible, building, onClose, onNavigate }) => {
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
          <Text style={styles.modalTitle}>{modalTitle}</Text>
          <ScrollView style={styles.scrollView}>
            {hasApartments ? (
              building.apartments.map((apt) => (
                <ApartmentAccordion
                  key={apt.apartmentNumber}
                  apartment={apt}
                  building={building}
                  onNavigate={onNavigate}
                />
              ))
            ) : (
              <Text style={styles.noApartmentsText}>
                {t("MapScreen_NoApartmentsListed")}
              </Text>
            )}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <FlipButtonSizeless onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>
                {t("MapScreen_backToMapButton")}
              </Text>
            </FlipButtonSizeless>

            <FlipButtonSizeless
              onPress={() => onNavigate(building)}
              style={styles.navigateButton}
            >
              <Text style={styles.navigateButtonText}>
                {t("Map_NavButton")}
              </Text>
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
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    height: "75%",
    width: "100%",
    justifyContent: "space-between",
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

  // --- MODIFIED: Styles for the button area ---
  buttonContainer: {
    paddingTop: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around", // To place buttons side-by-side
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 30, // Adjusted padding
    backgroundColor: "#6c757d", // Grey color
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  // --- ADDED: Styles for the new button ---
  navigateButton: {
    paddingVertical: 12,
    paddingHorizontal: 30, // Adjusted padding
    backgroundColor: "#007bff", // Blue color
    borderRadius: 8,
  },
  navigateButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default BuildingInfoModal;
