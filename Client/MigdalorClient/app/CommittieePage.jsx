import React, { useState, useEffect } from "react";
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
import StyledText from "@/components/StyledText"; // Import StyledText

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const fetchCommitteeMembersAPI = async () => {
  console.log(`Fetching committee members...`);
  await new Promise((resolve) => setTimeout(resolve, 600));
  const mockMembers = [
    {
      memberId: "c1",
      name: "Alice Chairman",
      title: "Committee Chair",
      photoUrl: "https://i.pravatar.cc/300?u=com1",
    },
    {
      memberId: "c2",
      name: "Bob Treasurer",
      title: "Treasurer",
      photoUrl: "https://i.pravatar.cc/300?u=com2",
    },
    {
      memberId: "c3",
      name: "Charlie Secretary",
      title: "Secretary",
      photoUrl: "https://i.pravatar.cc/300?u=com3",
    },
    {
      memberId: "c4",
      name: "Diana Member",
      title: "Member at Large",
      photoUrl: "https://i.pravatar.cc/300?u=com4",
    },
    {
      memberId: "c5",
      name: "Ethan Representative",
      title: "Community Rep",
      photoUrl: "https://i.pravatar.cc/300?u=com5",
    },
  ];
  return mockMembers;
};

const Separator = () => <View style={styles.separator} />;

export default function CommitteePage() {
  const { t } = useTranslation();
  const [committeeMembers, setCommitteeMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      setIsLoading(true);
      try {
        const members = await fetchCommitteeMembersAPI();
        setCommitteeMembers(members || []);
      } catch (error) {
        console.error("Failed to fetch committee members:", error);
        setCommitteeMembers([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadMembers();
  }, []);

  const handleContactPress = () => {
    let url = "";

    let contactValue = "awesomeprojectboris@gmail.com";
    url = `mailto:${contactValue}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          console.warn(`Cannot handle URL type MAIL with URL: ${url}`);
          Alert.alert(
            t("MarketplaceItemScreen_CannotHandleContactTitle"),
            t("MarketplaceItemScreen_CannotHandleContactMsg", { type: "mail" })
          );
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => {
        console.error(
          `An error occurred trying to open mail link: ${url}`,
          err
        );
        Alert.alert(
          t("Common_Error"),
          t("MarketplaceItemScreen_ErrorOpeningLink")
        );
      });
  };

  const renderMemberCard = ({ item }) => <CommitteeMemberCard data={item} />;

  const introText =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

  return (
    <>
      <Header />
      <View style={styles.pageContainer}>
        <FlatList
          ListHeaderComponent={
            <>
              <StyledText style={styles.mainTitle}>
                {t("ResidentsCommittePage_title")}
              </StyledText>

              <StyledText style={styles.introParagraph}>{introText}</StyledText>

              <View style={styles.buttonContainer}>
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

              {isLoading && committeeMembers.length === 0 && (
                <ActivityIndicator
                  size="large"
                  color="#0000ff"
                  style={styles.loadingIndicator}
                />
              )}

              {!isLoading && committeeMembers.length > 0 && (
                <View style={styles.listStartSeparator} />
              )}
            </>
          }
          data={committeeMembers}
          renderItem={renderMemberCard}
          keyExtractor={(item) => item.memberId.toString()}
          contentContainerStyle={styles.listContentContainer}
          ItemSeparatorComponent={Separator}
          ListEmptyComponent={
            !isLoading ? (
              <StyledText style={styles.emptyListText}>
                {t("ResidentsCommittePage_committeeNotFound")}
              </StyledText>
            ) : null
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    marginTop: 60,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 15,
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
  buttonContainer: {
    maxWidth: SCREEN_WIDTH * 0.95,
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "#ffffff",
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    elevation: 1,
  },
  contactButton: {
    width: SCREEN_WIDTH * 0.6,
    maxWidth: 300,
    paddingVertical: 15,
  },
  contactButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000", // Changed to black to be visible on white button BG
    textAlign: "center",
  },
  loadingIndicator: {
    marginTop: 30,
    marginBottom: 20,
  },
  listStartSeparator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    width: "90%",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 20,
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
  emptyListText: {
    marginTop: 40,
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
});