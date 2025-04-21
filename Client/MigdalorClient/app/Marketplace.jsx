import React, {
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator, Keyboard 
} from "react-native"; 
import { MarketplaceContext } from "../context/MarketplaceProvider"; 
import MarketplaceItemCard from "../components/MarketplaceItemCard";
import FlipButton from "../components/FlipButton";
import Header from "@/components/Header";
import NoSearchMatchCard from "../components/NoSearchMatchCard";
import SearchAccordion from "@/components/SearchAccordion";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import PaginatedListDisplay from "@/components/PaginatedListDisplay";

import { Ionicons } from "@expo/vector-icons";

import { useRouter, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { Globals } from "@/app/constants/Globals";
import { AlignRight } from "@tamagui/lucide-icons";

const SCREEN_WIDTH = Globals.SCREEN_WIDTH;
const ITEMS_PER_PAGE = 10;

export default function MarketplaceScreen() {
  const { t } = useTranslation();

  const { searchQuery, setSearchQuery } = useContext(MarketplaceContext) || {
    searchQuery: "",
    setSearchQuery: () => {},
  };

  console.log("MarketplaceScreen Render - Context searchQuery:", searchQuery);

  const [listings, setListings] = useState([]); // Holds raw data from API
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Local pagination state
  const [marketplaceQuery, setMarketplaceQuery] = useState(searchQuery);


  const router = useRouter();

  const fetchListings = useCallback(async () => {
    setError(null);
    console.log("Fetching active listings summary..."); 
    try {
      const response = await fetch(
        `${Globals.API_BASE_URL}/api/Listings/ActiveSummaries`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Refreshed listings:", data ? data.length : 0); 
      setListings(data || []); 
    } catch (err) {
      console.error("Failed to fetch listings:", err);
      setError(err.message || "Failed to load listings.");
      setListings([]);
    } finally {
      setIsLoading(false); 
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("MarketplaceScreen focused, fetching listings and resetting page...");
      setIsLoading(true); 
      setCurrentPage(1); 
      fetchListings(); 
    }, [fetchListings]) 
  );

  const handleMarketplaceSearch = () => {
    Keyboard.dismiss();
    setCurrentPage(1); 
    setSearchQuery(marketplaceQuery);
  };

// Modified clear search handler
const handleClearSearch = () => {
  setCurrentPage(1); // Reset page
  setSearchQuery("");
  setMarketplaceQuery("");
};

  // --- Filtering Logic ---
  const filteredListings = useMemo(() => {
    if (!searchQuery) {
      return listings;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return listings.filter((listing) =>
      listing.title?.toLowerCase().includes(lowerCaseQuery)
    );
  }, [listings, searchQuery]);

  // --- Pagination Logic ---
  const totalItems = filteredListings.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const itemsForCurrentPage = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredListings.slice(startIndex, endIndex);
  }, [filteredListings, currentPage]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        // Optional: scroll to top
    }
}, [totalPages]);

const renderMarketplaceItem = useCallback(({ item }) => (
  <MarketplaceItemCard
    data={item}
    onPress={() => {
      router.push({
        pathname: "./MarketplaceItem",
        params: { listingId: item.listingId },
      });
    }}
  />
), [router]);

const keyExtractor = useCallback((item) => item.listingId.toString(), []);


  const handleListYourItem = () => {
    router.push("/MarketplaceNewItem");
  };

  // --- Render Logic ---
  const CustomEmptyComponent = useMemo(() => {
    if(isLoading) return <ActivityIndicator size="large" color="#0000ff" />; // Show loader if loading
    if(error) return <Text style={styles.errorText}>Error: {error}</Text>; // Show error
    if (searchQuery && filteredListings.length === 0) return <NoSearchMatchCard />; // No search results
    if (!searchQuery && listings.length === 0) return <Text style={styles.infoText}>{t("MarketplaceScreen_NoItems")}</Text>; // No items at all
    return null; // Default case
}, [isLoading, error, searchQuery, listings, filteredListings, t]);


  return (
    <View style={styles.container}>
      <Header />
      <Text style={styles.mainTitle}>{t("MarketplaceScreen_title")}</Text>
      <View style={styles.topButtonContainer}>
        <FlipButton
          text={t("MarketplaceScreen_NewItemButton")}
          onPress={handleListYourItem}
          style={styles.newItemButton}
          disabled={isLoading}
        />
        <SearchAccordion
          headerOpenTextKey="MarketplaceScreen_accordionClose" // Need new translation keys
          headerClosedTextKey="MarketplaceScreen_accordionOpen"
          containerStyle={styles.accordionContainer} // Apply specific styles
          //headerStyle={styles.accordionHeader} // Header styles
          headerStyle={{
            justifyContent:
              Globals.userSelectedDirection === "rtl"
                ? "flex-end"
                : "space-between",
            gap: 10,
          }}
          headerTextStyle={{}}
        >
          {/* Content for Marketplace Search */}
          <FloatingLabelInput
            label={t("MarketplaceSearchItem_Header")} // Placeholder/Label text
            value={marketplaceQuery}
            onChangeText={setMarketplaceQuery}
            returnKeyType="search"
            onSubmitEditing={handleMarketplaceSearch}
            style={styles.searchInputContainer}
            inputStyle={styles.searchInput}
            // alignRight={Globals.userSelectedDirection === "rtl"} // Add if needed
          />
          <FlipButton
            onPress={handleMarketplaceSearch}
            style={styles.searchSubmitButton}
            bgColor="#007bff"
            textColor="#fff"
            disabled={isLoading}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="search" size={25} color="white" />
              <Text style={styles.searchButtonText}>
                {t("MarketplaceScreen_SearchButton")}
              </Text>
            </View>
          </FlipButton>
           {/* End Content for Marketplace Search */}
       </SearchAccordion>

       {searchQuery !== "" && !isLoading && (
         <View style={styles.inSearch}>
             {/* Ensure styles.searchFocus exists and is appropriate */}
             <Text style={styles.searchFocus} numberOfLines={1} ellipsizeMode='tail'>
                {t("MarketplaceScreen_ShowingResultsFor")} "{searchQuery}"
             </Text>
             {/* Ensure styles.clearSearchButton exists and is appropriate */}
             <FlipButton
                text={t("MarketplaceScreen_ClearSearchButton")}
                onPress={handleClearSearch} // Correct handler attached
                style={styles.clearSearchButton} // Use specific style
                // Optional: Add specific styling via bgColor, textColor if needed
                bgColor="#e0e0e0"
                textColor="#333"
                flipborderwidth={1} // Example: subtle border
             />
         </View>
       )}

      </View>
      <PaginatedListDisplay
        items={itemsForCurrentPage} // Pass only items for the current page
        renderItem={renderMarketplaceItem}
        itemKeyExtractor={keyExtractor}
        isLoading={isLoading && itemsForCurrentPage.length === 0} // Pass loading only if list is empty? Or pass isLoading directly
        ListEmptyComponent={CustomEmptyComponent}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange} // Pass the handler function
        listContainerStyle={styles.listContainerStyle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    paddingTop: 16,
    width: "100%",
    alignItems: "center",
  },
  topButtonContainer: {
    flexDirection: "column",
    justifyContent: "space-evenly",
    marginTop: 20,
    marginBottom: 20,
    width: SCREEN_WIDTH * 0.9,
  },
  newItemButton: {
    backgroundColor: "#347af0",
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  searchButton: {
    backgroundColor: "#28a745",
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 20,
    marginVertical: 30, // More spacing for loader
    color: "#555",
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
    marginVertical: 20,
    color: "red",
    paddingHorizontal: 20,
  },
  infoText: {
    textAlign: "center",
    fontSize: 16,
    marginVertical: 20,
    color: "#666",
    paddingHorizontal: 20,
  },
  paginationButtonText: {
    fontSize: 20,
    color: "#333",
  },
  activePaginationButton: {
    backgroundColor: "#002ec5",
  },
  activePaginationButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: "#eee",
  },
  inSearch: {
    width: SCREEN_WIDTH * 0.9,
    minHeight: 130,
    padding: 15,
    marginBottom: 15, // Added margin below
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 5,
    flexDirection: "column", // Arrange items horizontally
    justifyContent: "space-between", // Space out text and button
  },
  searchFocus: {
    fontSize: 18, // Slightly smaller font
    textAlign: "right", // Align text to the right (for RTL)
    flex: 1,
    marginRight: 10,
  },
  button: {
    width: SCREEN_WIDTH * 0.8,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60, 
    color: '#111',
  },
  buttonContent:
  {
    flexDirection: "row"
  },
  inSearch: {
    width: SCREEN_WIDTH * 0.9,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15, // Space below this section
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row", // Text and button side-by-side
    justifyContent: "space-between", // Push them apart
  },
  searchFocus: {
    fontSize: 16, // Adjusted font size
    color: '#555',
    flex: 1, // Allow text to take available space but shrink if needed
    marginRight: 10, // Space between text and button
  },
  clearSearchButton: { // Specific style for the clear button
      paddingVertical: 6, // Reduced padding for a smaller button
      paddingHorizontal: 12,
      borderRadius: 6,
      // Background/text colors set via props on FlipButton now
  }
});
