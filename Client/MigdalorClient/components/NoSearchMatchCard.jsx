import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { SCREEN_WIDTH } from "../app/constants/Globals";
import { useTranslation } from "react-i18next";

function NoSearchMatchCard() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.itemName}>{t("Common_noResultsFound")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.9,
    height: 150,
    borderRadius: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginVertical: 8,
  },
  itemName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
});

export default NoSearchMatchCard;
