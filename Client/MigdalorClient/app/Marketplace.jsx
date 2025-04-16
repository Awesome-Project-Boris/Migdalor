import React, { useContext, useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, ActivityIndicator } from 'react-native'; // Added ActivityIndicator
import { MarketplaceContext } from '../context/MarketplaceProvider'; // Still needed for search query potentially
import MarketplaceItemCard from '../components/MarketplaceItemCard';
import MarketplaceSearchModal from '../components/MarketplaceSearchModal';
import FlipButton from '../components/FlipButton';
import Header from '@/components/Header';
import NoSearchMatchCard from '../components/NoSearchMatchCard';
import { useRouter } from "expo-router";
import { useTranslation } from 'react-i18next';
import { Globals } from "@/app/constants/Globals"; // Import Globals for API URL

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEMS_PER_PAGE = 10;

export default function MarketplaceScreen() {
  const { t } = useTranslation();
  // Get search query state management from context (if needed)
  const { searchQuery, setSearchQuery } = useContext(MarketplaceContext) || { searchQuery: '', setSearchQuery: () => {} }; // Default if context undefined

  // --- Local State for this screen's data ---
  const [listings, setListings] = useState([]); // Holds raw data from API
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Local pagination state
  // -------------------------------------------

  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const router = useRouter();

  // --- Fetch Data ---
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      setError(null);
      setCurrentPage(1); 
      console.log("Fetching active listings summary...");
      try {
        const response = await fetch(`${Globals.API_BASE_URL}/api/Listings/ActiveSummaries`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched listings:", data.length);
        setListings(data || []);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
        setError(err.message || "Failed to load listings.");
        setListings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();

    // Clear search when navigating away (optional)
    // return () => {
    //  if (setSearchQuery) setSearchQuery("");
    // };
  }, []); // Fetch only on mount

  // --- Filtering Logic ---
  const filteredListings = useMemo(() => {
    if (!searchQuery) {
      return listings;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return listings.filter(listing =>
      listing.title?.toLowerCase().includes(lowerCaseQuery) ||
      listing.description?.toLowerCase().includes(lowerCaseQuery) ||
      listing.sellerName?.toLowerCase().includes(lowerCaseQuery)
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

  const pagesToShow = useMemo(() => {
    const safeTotalPages = Math.max(1, totalPages);
    const maxPagesToShow = 3;
    const pages = [];
    if (safeTotalPages <= maxPagesToShow) {
      for (let i = 1; i <= safeTotalPages; i++) pages.push(i);
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(safeTotalPages, startPage + maxPagesToShow - 1);
      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      for (let i = startPage; i <= endPage; i++) pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  const goToPage = (pageNumber) => {
    const safeTotalPages = Math.max(1, totalPages);
    if (pageNumber >= 1 && pageNumber <= safeTotalPages) {
      setCurrentPage(pageNumber);
      // Optional: Scroll to top
      // flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    }
  };

  // --- Handlers ---
  const renderItem = ({ item }) => (
    <MarketplaceItemCard
      data={item} // Pass the whole DTO item
      onPress={() => {
        console.log("Item pressed", item.listingId);
        router.push({ pathname: './MarketplaceItem', params: { listingId: item.listingId }});
      }}
    />
  );

  const handleListYourItem = () => {
    console.log("List Your Own Item button pressed");
    router.push('/MarketplaceNewItem');
  };

  const openSearchModal = () => setIsSearchModalVisible(true);

  const handleSearchSubmit = (query) => {
     if (setSearchQuery) setSearchQuery(query); // Use context setter for search query
     setCurrentPage(1); // Reset local page state
     setIsSearchModalVisible(false);
  };

  const handleSearchCancel = () => setIsSearchModalVisible(false);

  const handleClearSearch = () => {
     if (setSearchQuery) setSearchQuery("");
     setCurrentPage(1); // Reset local page state
  };

  // --- Render Logic ---
    const ListEmptyComponent = () => {
     if (isLoading) return null; // Don't show if loading initially
     if (error) return <Text style={styles.errorText}>Error: {error}</Text>;
     // Use translation for user-facing text
     if (searchQuery && filteredListings.length === 0) return <NoSearchMatchCard />; // Keep using the specific card
     if (!searchQuery && listings.length === 0) return <Text style={styles.infoText}>{t('MarketplaceScreen_NoItems')}</Text>;
     return null;
  }

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.topButtonContainer}>
        <FlipButton
          text={t('MarketplaceScreen_NewItemButton')} // Preserved t() call
          onPress={handleListYourItem}
          style={styles.newItemButton}
          disabled={isLoading}
        />
        <FlipButton
          text={t('MarketplaceScreen_SearchButton')} // Preserved t() call
          onPress={openSearchModal}
          style={styles.searchButton}
          disabled={isLoading}
        />
      </View>
      {searchQuery !== '' && !isLoading && (
        <View style={styles.inSearch}>
          <Text style={styles.searchFocus}>
             {t('MarketplaceScreen_ShowingResultsFor', { query: searchQuery })}
          </Text>
          <FlipButton text={t('MarketplaceScreen_ClearSearchButton')} onPress={handleClearSearch} />
        </View>
      )}

      {isLoading && listings.length === 0 && (
         <ActivityIndicator size="large" color="#0000ff" style={styles.loadingText} />
      )}

      <FlatList
        data={itemsForCurrentPage}
        renderItem={renderItem}
        keyExtractor={(item) => item.listingId.toString()} // Use listingId from fetched data
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={isLoading && listings.length > 0 ? <ActivityIndicator size="small" color="#888"/> : null} // Show small loader when loading more pages
        contentContainerStyle={styles.listContainer}
      />

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
            onPress={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <Text style={styles.paginationButtonText}>{t("MarketplaceScreen_PreviousButton")}</Text> {/* Preserved */}
          </TouchableOpacity>

          {pagesToShow.map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.paginationButton,
                p === currentPage && styles.activePaginationButton,
              ]}
              onPress={() => goToPage(p)}
              disabled={p === currentPage}
            >
              <Text
                style={[
                  styles.paginationButtonText,
                  p === currentPage && styles.activePaginationButtonText,
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
            onPress={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <Text style={styles.paginationButtonText}>{t("MarketplaceScreen_NextButton")}</Text> 
          </TouchableOpacity>
        </View>
      )}

      <MarketplaceSearchModal
        visible={isSearchModalVisible}
        onSearch={handleSearchSubmit}
        onCancel={handleSearchCancel}
      />
    </View>
  );
}


const styles = StyleSheet.create({
   container: {
     flex: 1,
     backgroundColor: '#f7f7f7',
     paddingTop: 16,
     width: '100%',
     alignItems: 'center',
   },
   topButtonContainer: {
     flexDirection: 'row',
     justifyContent: 'space-evenly',
     marginTop: 70,
     marginBottom: 20,
     width: SCREEN_WIDTH,
   },
   newItemButton: {
     backgroundColor: '#347af0',
     paddingVertical: 20,
     paddingHorizontal: 30,
     borderRadius: 8,
   },
   searchButton: {
     backgroundColor: '#28a745',
     paddingVertical: 20,
     paddingHorizontal: 30,
     borderRadius: 8,
   },
   listContainer: {
     paddingHorizontal: 16,
     paddingBottom: 16,
     alignSelf: 'center',
     width: SCREEN_WIDTH * 0.95,
     flexGrow: 1 // Ensure FlatList takes available space
   },
   loadingText: {
     textAlign: 'center',
     fontSize: 20,
     marginVertical: 30, // More spacing for loader
     color: '#555'
   },
   errorText: {
      textAlign: 'center',
      fontSize: 16,
      marginVertical: 20,
      color: 'red',
      paddingHorizontal: 20,
   },
    infoText: {
      textAlign: 'center',
      fontSize: 16,
      marginVertical: 20,
      color: '#666',
      paddingHorizontal: 20,
   },
   paginationContainer: {
     flexDirection: 'row',
     justifyContent: 'center',
     alignItems: 'center',
     paddingHorizontal: 10,
     width: SCREEN_WIDTH,
     marginVertical: 20,
     borderTopWidth: 1, // Add visual separation
     borderTopColor: '#eee'
   },
   paginationButton: {
     backgroundColor: '#ddd',
     paddingVertical: 12,
     paddingHorizontal: 16,
     marginHorizontal: 5,
     borderRadius: 8,
     minWidth: 44,
     alignItems: 'center'
   },
   paginationButtonText: {
     fontSize: 20,
     color: '#333',
   },
   activePaginationButton: {
     backgroundColor: '#002ec5',
   },
   activePaginationButtonText: {
     color: '#fff',
     fontWeight: 'bold'
   },
   disabledButton: {
     opacity: 0.5,
     backgroundColor: '#eee'
   },
   inSearch: {
     width: '90%',
     maxWidth: 500,
     padding: 15,
     marginBottom: 15, // Added margin below
     alignItems: 'center',
     backgroundColor: '#fff',
     borderRadius: 8,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 1 },
     shadowOpacity: 0.1,
     shadowRadius: 4,
     elevation: 2,
     zIndex: 5,
     flexDirection: 'row', // Arrange items horizontally
     justifyContent: 'space-between' // Space out text and button
   },
   searchFocus: {
     fontSize: 16, // Slightly smaller font
     textAlign: 'right', // Align text to the right (for RTL)
     flex: 1, // Allow text to take available space
     marginRight: 10 // Add space between text and button
   },
 });