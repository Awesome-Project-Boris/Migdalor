import React, {
  useContext,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

// Custom Components & Contexts
import { MarketplaceContext } from "../context/MarketplaceProvider";
import MarketplaceItemCard from "../components/MarketplaceItemCard";
import FlipButton from "../components/FlipButton";
import Header from "@/components/Header";
import NoSearchMatchCard from "../components/NoSearchMatchCard";
import SearchAccordion from "@/components/SearchAccordion";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import PaginatedListDisplay from "@/components/PaginatedListDisplay";
import StyledText from "@/components/StyledText";

// Constants
import { Globals } from "@/app/constants/Globals";
const ITEMS_PER_PAGE = 10;

export default function MarketplaceScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const { searchQuery, setSearchQuery } = useContext(MarketplaceContext) || {
    searchQuery: "",
    setSearchQuery: () => {},
  };

  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [marketplaceQuery, setMarketplaceQuery] = useState(searchQuery);

  const flatListRef = useRef(null);

  // Data fetching and logic hooks remain unchanged
  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${Globals.API_BASE_URL}/api/Listings/ActiveSummaries`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setListings(data || []);
    } catch (err) {
      setError(err.message || "Failed to load listings.");
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setCurrentPage(1);
      fetchListings();
    }, [fetchListings])
  );

  const handleMarketplaceSearch = () => {
    Keyboard.dismiss();
    setCurrentPage(1);
    setSearchQuery(marketplaceQuery);
  };

  const handleClearSearch = () => {
    setCurrentPage(1);
    setSearchQuery("");
    setMarketplaceQuery("");
  };

  const filteredListings = useMemo(() => {
    if (!searchQuery) return listings;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return listings.filter((listing) =>
      listing.title?.toLowerCase().includes(lowerCaseQuery)
    );
  }, [listings, searchQuery]);

  const totalItems = filteredListings.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const itemsForCurrentPage = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredListings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredListings, currentPage]);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
      }
    },
    [totalPages]
  );

  const renderMarketplaceItem = useCallback(
    ({ item }) => (
      <View style={styles.cardWrapper}>
        <MarketplaceItemCard
          data={item}
          onPress={() => {
            router.push({
              pathname: "./MarketplaceItem",
              params: { listingId: item.listingId },
            });
          }}
        />
      </View>
    ),
    [router]
  );

  const keyExtractor = useCallback((item) => item.listingId.toString(), []);

  const handleListYourItem = () => {
    router.push("/MarketplaceNewItem");
  };

  const CustomEmptyComponent = useMemo(() => {
    if (isLoading) return <ActivityIndicator size="large" color="#007bff" />;
    if (error)
      return <StyledText style={styles.errorText}>Error: {error}</StyledText>;
    if (searchQuery && filteredListings.length === 0)
      return <NoSearchMatchCard />;
    if (!searchQuery && listings.length === 0)
      return (
        <StyledText style={styles.infoText}>
          {t("MarketplaceScreen_NoItems")}
        </StyledText>
      );
    return null;
  }, [isLoading, error, searchQuery, listings, filteredListings, t]);

  // This component bundles everything that should appear above the list
  const ListHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.plaqueContainer}>
        <StyledText style={styles.mainTitle}>
          {t("MarketplaceScreen_title")}
        </StyledText>
      </View>

      <FlipButton
        onPress={handleListYourItem}
        style={styles.newItemButton}
        bgColor="#FFFFFF"
        textColor="#000000"
        disabled={isLoading}
      >
        <StyledText>{t("MarketplaceScreen_NewItemButton")}</StyledText>
      </FlipButton>

      <View>
        <SearchAccordion
          headerOpenTextKey="MarketplaceScreen_accordionClose"
          headerClosedTextKey="MarketplaceScreen_accordionOpen"
        >
          <FloatingLabelInput
            label={t("MarketplaceSearchItem_Header")}
            value={marketplaceQuery}
            onChangeText={setMarketplaceQuery}
            returnKeyType="search"
            onSubmitEditing={handleMarketplaceSearch}
            style={styles.searchInputContainer}
            inputStyle={styles.searchInput}
            alignRight={i18n.dir() === "rtl"}
          />
          <FlipButton
            onPress={handleMarketplaceSearch}
            style={styles.searchSubmitButton}
            bgColor="#007bff"
            textColor="#fff"
            disabled={isLoading}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="search" size={20} color="white" />
              <StyledText style={styles.searchButtonText}>
                {t("MarketplaceScreen_SearchButton")}
              </StyledText>
            </View>
          </FlipButton>
        </SearchAccordion>
      </View>

      {searchQuery !== "" && !isLoading && (
        <View style={styles.inSearch}>
          <StyledText
            style={styles.searchFocus}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {t("MarketplaceScreen_ShowingResultsFor")} "{searchQuery}"
          </StyledText>
          <TouchableOpacity
            style={styles.clearSearchButton}
            onPress={handleClearSearch}
          >
            <Ionicons name="close-circle" size={24} color="#6c757d" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header />
      <PaginatedListDisplay
        flatListRef={flatListRef}
        items={itemsForCurrentPage}
        renderItem={renderMarketplaceItem}
        itemKeyExtractor={keyExtractor}
        isLoading={isLoading && itemsForCurrentPage.length === 0}
        ListEmptyComponent={CustomEmptyComponent}
        ListHeaderComponent={ListHeader}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fef1e6",
  },
  headerContainer: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
    width: "100%",
  },
  plaqueContainer: {
    width: "90%",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#dee2e6",
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 60, // Added requested margin
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    lineHeight: 40,
  },
  newItemButton: {
    width: "90%",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#000000",
    marginBottom: 20,
  },
  searchInputContainer: {
    marginBottom: 15,
  },
  searchInput: {
    fontSize: 16,
  },
  searchSubmitButton: {
    paddingVertical: 14,
    borderRadius: 8,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  inSearch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: "90%",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 20,
  },
  searchFocus: {
    flex: 1,
    fontSize: 16,
    color: "#555",
    marginRight: 10,
  },
  clearSearchButton: {
    padding: 5,
  },
  cardWrapper: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: "5%",
    marginBottom: 16,
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
    marginVertical: 20,
    color: "red",
    lineHeight: 22,
  },
  infoText: {
    textAlign: "center",
    fontSize: 16,
    marginVertical: 20,
    color: "#666",
    lineHeight: 22,
  },
});
