import React, { useContext, useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import { MarketplaceContext } from '../context/MarketplaceProvider';
import MarketplaceItemCard from '../components/MarketplaceItemCard';
import MarketplaceSearchModal from '../components/MarketplaceSearchModal';
import FlipButton from '../components/FlipButton';
import Header from '@/components/Header';
import NoSearchMatchCard from '../components/NoSearchMatchCard';
import { useRouter } from "expo-router";



const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEMS_PER_PAGE = 10;

export default function MarketplaceScreen() {
  const {
    filteredItems,
    currentPage,
    isLoading,
    goToPage,
    searchQuery,
    setSearchQuery,
  } = useContext(MarketplaceContext);

  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const router = useRouter();

  const itemsForCurrentPage = useMemo(() => {
    const startIndex = ( currentPage - 1 ) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage])

  const pagesToShow = useMemo(() => {
    const calculatedTotalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const safeTotalPages = Math.max(1, calculatedTotalPages); // Ensure at least 1 page

    const maxPagesToShow = 3;
    const pages = [];

    if (safeTotalPages <= maxPagesToShow) {
      // If total pages is 3 or less, show all pages
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      // If total pages is more than 3, calculate sliding window
      let startPage = currentPage - 1;
      let endPage = currentPage + 1;

      // Adjust window if it goes out of bounds
      if (startPage < 1) { // If window starts before page 1
        startPage = 1;
        endPage = 3;
      } else if (endPage > safeTotalPages) { // If window ends after last page
        endPage = safeTotalPages;
        startPage = safeTotalPages - 2;
      }
      // Ensure start is at least 1 (safety check)
      startPage = Math.max(1, startPage);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    console.log(
        `Pagination Debug: currentPage=${currentPage}, totalItems=${filteredItems.length}, safeTotalPages=${safeTotalPages}, pagesToShow=`,
         pages
    );

    return pages;

  }, [currentPage, totalPages, filteredItems.length]); // Keep dependencies


  const renderItem = ({ item }) => (
    <MarketplaceItemCard
      data={item}
      onPress={() => 
      {
        console.log("Item pressed", item.id);
        router.push({ pathname: '/MarketplaceItem', params: { itemId: item.id}});
      }}
    />
  );


  const handleListYourItem = () => {
    console.log("List Your Own Item button pressed");
    router.push('/MarketplaceNewItem');
  };

  const openSearchModal = () => {
    setIsSearchModalVisible(true);
  };

  const handleSearchSubmit = (query) => {
    goToPage(1);
    setSearchQuery(query);
    setIsSearchModalVisible(false);
  };

  const handleSearchCancel = () => {
    setIsSearchModalVisible(false);
  };

  useEffect(() => {
    return () => {
      setSearchQuery("");
    };
  }, []);

  useEffect(() => {
    goToPage(1);
  }, [searchQuery])

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.topButtonContainer}>
        <FlipButton
          text="מוצר חדש"
          onPress={handleListYourItem}
          style={styles.newItemButton}
        />
        <FlipButton
          text="חיפוש"
          onPress={openSearchModal}
          style={styles.searchButton}
        />
      </View>
      {searchQuery !== '' && !isLoading && (
        <View style={styles.inSearch}>
          <Text style={styles.searchFocus}>
            {searchQuery} :מראה תוצאות עבור
          </Text>
          <FlipButton text="לביטול החיפוש" onPress={() => setSearchQuery("")} />
        </View>
      )}
      
      {filteredItems.length === 0 && !isLoading && !searchQuery && ( // Show only if no items AND not searching
             <Text>No items available currently. An error might have occured.</Text> // SWITCH with empty/error card !!!
         )}
         {filteredItems.length === 0 && !isLoading && searchQuery && ( // Show specific message for no search results
             <NoSearchMatchCard />
         )}

      <FlatList
        data={itemsForCurrentPage}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListFooterComponent={isLoading ? <Text style={styles.loadingText}>Loading...</Text> : null}
        contentContainerStyle={styles.listContainer}
      />

      {totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
            onPress={() => {
              const prevPage = currentPage - 1;
              if (prevPage >= 1) { // Check lower bound
                  goToPage(prevPage);
              }
          }}
            disabled={currentPage === 1}
          >
            <Text style={styles.paginationButtonText}>Prev</Text>
          </TouchableOpacity>

          {console.log('Rendering pagination buttons, totalPages:', totalPages, 'pagesToShow:', pagesToShow)}

          {pagesToShow.map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.paginationButton,
                p === currentPage && styles.activePaginationButton,
              ]}
              onPress={() => goToPage(p)} // <-- Use goToPage
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
            onPress={() => {
              const nextPage = currentPage + 1;
              if (nextPage <= totalPages) { // Check upper bound using calculated totalPages
                  goToPage(nextPage);
              }
          }}
            disabled={currentPage === totalPages}
          >
            <Text style={styles.paginationButtonText}>Next</Text>
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
    width: SCREEN_WIDTH * 0.95
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 20,
    marginVertical: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    width: SCREEN_WIDTH,
    marginVertical: 20,
  },
  paginationButton: {
    backgroundColor: '#ddd',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    borderRadius: 8,
    minwidth: 44,
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
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: '#eee'
  },
  inSearch: {
    width: '90%', 
    maxWidth: 500,
    padding: 15,
    paddingBottom: 15,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 5
  },
  searchFocus: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
  },
});

