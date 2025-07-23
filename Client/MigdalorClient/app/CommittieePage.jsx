import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Linking,
  Alert,
} from "react-native";
import Header from "@/components/Header";
import FlipButton from "../components/FlipButton";
import CommitteeMemberCard from "../components/CommitteeMemberCard";
import { useTranslation } from "react-i18next";
import StyledText from "@/components/StyledText";
import { Globals } from "@/app/constants/Globals";
import { useFocusEffect } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Separator component for the list
const Separator = () => <View style={styles.separator} />;

export default function CommitteePage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [committeeMembers, setCommitteeMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from the new API endpoint
  const fetchCommitteeMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${Globals.API_BASE_URL}/api/Resident/CommitteeMembers`
      );
      if (!response.ok) {
        throw new Error(
          t(
            "ResidentsCommittePage_fetchError",
            "Failed to load committee members."
          )
        );
      }
      const data = await response.json();

      // Map the DTO to the format the card component expects
      const formattedMembers = data.map((member) => ({
        memberId: member.userId,
        name: isRtl ? member.hebName : member.engName,
        title: isRtl ? member.hebCommitteeTitle : member.engCommitteeTitle,
        photoUrl: member.photoUrl
          ? `${Globals.API_BASE_URL}${member.photoUrl}`
          : null,
      }));
      setCommitteeMembers(formattedMembers);
    } catch (err) {
      setError(err.message);
      setCommitteeMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, [t, isRtl]);

  useFocusEffect(
    useCallback(() => {
      fetchCommitteeMembers();
    }, [fetchCommitteeMembers])
  );

  const handleContactPress = () => {
    const contactEmail = "awesomeprojectboris@gmail.com";
    const url = `mailto:${contactEmail}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert(
            t("MarketplaceItemScreen_CannotHandleContactTitle"),
            t("MarketplaceItemScreen_CannotHandleContactMsg", { type: "email" })
          );
        } else {
          Linking.openURL(url);
        }
      })
      .catch((err) => {
        console.error("Error opening mail link:", err);
        Alert.alert(
          t("Common_Error"),
          t("MarketplaceItemScreen_ErrorOpeningLink")
        );
      });
  };

  const renderMemberCard = ({ item }) => <CommitteeMemberCard data={item} />;

  const ListHeader = () => (
    <>
      <View style={styles.headerPlaque}>
        <StyledText style={styles.mainTitle}>
          {t("ResidentsCommittePage_title")}
        </StyledText>
      </View>
      <StyledText style={styles.introParagraph}>
        {t("ResidentsCommittePage_introText")}
      </StyledText>
      <View style={styles.buttonWrapper}>
        <FlipButton
          onPress={handleContactPress}
          style={styles.contactButton}
          bgColor="#ffffff"
          textColor="#000000"
        >
          <StyledText style={styles.contactButtonText}>
            {t("ResidentsCommittePage_contact")}
          </StyledText>
        </FlipButton>
      </View>
    </>
  );

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <StyledText style={styles.emptyListText}>
        {t("ResidentsCommittePage_committeeNotFound")}
      </StyledText>
    </View>
  );

  return (
    <>
      <Header />
      <View style={styles.pageContainer}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#007bff"
            style={styles.loadingIndicator}
          />
        ) : error ? (
          <StyledText style={styles.errorText}>{error}</StyledText>
        ) : (
          <FlatList
            ListHeaderComponent={ListHeader}
            data={committeeMembers}
            renderItem={renderMemberCard}
            keyExtractor={(item) => item.memberId.toString()}
            contentContainerStyle={styles.listContentContainer}
            ItemSeparatorComponent={Separator}
            ListEmptyComponent={EmptyListComponent}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#fef1e6",
    paddingTop: 60,
  },
  headerPlaque: {
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#dee2e6",
    padding: 20,
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111",
  },
  introParagraph: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginHorizontal: 25,
    marginBottom: 25,
    lineHeight: 24,
  },
  buttonWrapper: {
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  contactButton: {
    width: "100%",
    maxWidth: 350,
    paddingVertical: 15,
    borderWidth: 1.5,
    borderColor: "#333",
  },
  contactButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    width: "90%",
    alignSelf: "center",
    marginVertical: 10,
  },
  emptyContainer: {
    marginTop: 40,
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  emptyListText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    textAlign: "center",
    color: "red",
    fontSize: 16,
    padding: 20,
  },
});
