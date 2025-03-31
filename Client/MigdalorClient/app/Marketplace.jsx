import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import { MarketplaceContext } from '../context/MarketplaceProvider';
import MarketplaceItemCard from '../components/MarketplaceItemCard';
import MarketplaceItemModal from '../components/MarketplaceItemModal';
import MarketplaceSearchModal from '../components/MarketplaceSearchModal';
import FlipButton from '../components/FlipButton';
import Header from '@/components/Header';
import AddNewItemModal from '../components/MarketplaceNewItemModal';  // New modal for adding items
import NoSearchMatchCard from '../components/NoSearchMatchCard';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function MarketplaceScreen() {
  const {
    filteredItems,
    currentPage,
    totalPages,
    isLoading,
    fetchItems,
    selectedItem,
    setSelectedItem,
    searchQuery,
    setSearchQuery,
    pagesToShow,
  } = useContext(MarketplaceContext);

  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [isAddNewItemModalVisible, setIsAddNewItemModalVisible] = useState(false);

  const renderItem = ({ item }) => (
    <MarketplaceItemCard
      data={item}
      onPress={() => setSelectedItem(item)}
    />
  );

  // Modify handleListYourItem to open the "Add New Item" modal.
  const handleListYourItem = () => {
    console.log("List Your Own Item button pressed");
    setIsAddNewItemModalVisible(true);
  };

  const openSearchModal = () => {
    setIsSearchModalVisible(true);
  };

  const handleSearchSubmit = (query) => {
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
  }, [setSearchQuery]);

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
      {filteredItems.length === 0 && !isLoading && (
        <NoSearchMatchCard/>
      )}
      <FlatList
        data={filteredItems.slice(0, 10)}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListFooterComponent={isLoading ? <Text style={styles.loadingText}>Loading...</Text> : null}
        contentContainerStyle={styles.listContainer}
      />
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
          onPress={() => currentPage > 1 && fetchItems(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Text style={styles.paginationButtonText}>Prev</Text>
        </TouchableOpacity>
        {pagesToShow.map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.paginationButton,
              p === currentPage && styles.activePaginationButton,
            ]}
            onPress={() => fetchItems(p)}
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
          onPress={() => currentPage < totalPages && fetchItems(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Text style={styles.paginationButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
      <MarketplaceSearchModal
        visible={isSearchModalVisible}
        onSearch={handleSearchSubmit}
        onCancel={handleSearchCancel}
      />
      <MarketplaceItemModal
        visible={!!selectedItem}
        item={selectedItem}
        onClose={() => setSelectedItem(undefined)}
      />
      <AddNewItemModal
        visible={isAddNewItemModalVisible}
        onClose={() => setIsAddNewItemModalVisible(false)}
        onSubmit={(newItemData) => {
          console.log('Submitting new item:', newItemData);
          setIsAddNewItemModalVisible(false);
          // TODO: Launch submission sequence to DB.
        }}
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
    width: SCREEN_WIDTH,
    marginVertical: 20,
  },
  paginationButton: {
    backgroundColor: '#ddd',
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  paginationButtonText: {
    fontSize: 24,
    color: '#333',
  },
  activePaginationButton: {
    backgroundColor: '#347af0',
  },
  activePaginationButtonText: {
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.5,
  },
  inSearch: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    height: 150,
  },
  searchFocus: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
});

