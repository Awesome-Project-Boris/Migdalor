import React, { useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useTranslation } from 'react-i18next';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Props:
// - items: Array of items for the CURRENT page. REQUIRED.
// - renderItem: Function to render a single item. REQUIRED.
// - itemKeyExtractor: Function for item key. REQUIRED.
// - isLoading: Boolean to show loading state (optional, parent might handle overall loading).
// - ListEmptyComponent: Component when `items` is empty (and not loading).
// - currentPage: The current active page number. REQUIRED.
// - totalPages: The total number of pages. REQUIRED.
// - onPageChange: Function(newPageNumber) => void, called when pagination buttons clicked. REQUIRED.
// - listContainerStyle: Style object for FlatList content container. Optional.
// - paginationContainerStyle: Style object for pagination controls container. Optional.
// - flatListRef: Optional ref object to forward to the FlatList.

export default function PaginatedListDisplay({
  items,
  renderItem,
  itemKeyExtractor,
  isLoading = false, // Default to false, assuming parent handles main load state
  ListEmptyComponent = null,
  currentPage,
  totalPages,
  onPageChange,
  listContainerStyle = {},
  paginationContainerStyle = {},
  flatListRef = null, // Accept optional ref
}) {
  const { t } = useTranslation();

  // Calculate visible page numbers (same logic as before)
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

  const DefaultListEmptyComponent = () => (
     <View style={styles.centeredMessage}>
        {isLoading ? (
             <ActivityIndicator size="large" color="#0000ff" />
        ) : (
             <Text style={styles.infoText}>{t("PaginatedList_noItems")}</Text>
        )}
     </View>
  );

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={flatListRef} // Use forwarded ref or internal one
        data={items}
        renderItem={renderItem}
        keyExtractor={itemKeyExtractor}
        ListEmptyComponent={ListEmptyComponent || DefaultListEmptyComponent}
        contentContainerStyle={[styles.listContainer, listContainerStyle]}
        // Optional: Show footer loading only if isLoading prop is true
        ListFooterComponent={isLoading && items?.length > 0 ? <ActivityIndicator size="small" color="#888" /> : null}
      />

      {/* Pagination Controls - Render only if totalPages > 1 */}
      {totalPages > 1 && (
        <View style={[styles.paginationContainer, paginationContainerStyle]}>
          <TouchableOpacity
            style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
            onPress={() => onPageChange(currentPage - 1)} // Call prop handler
            disabled={currentPage === 1 || isLoading} // Disable if loading
          >
            <Text style={styles.paginationButtonText}>{t("PaginatedList_PreviousButton")}</Text>
          </TouchableOpacity>

          {pagesToShow.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.paginationButton, p === currentPage && styles.activePaginationButton]}
              onPress={() => onPageChange(p)} // Call prop handler
              disabled={p === currentPage || isLoading} // Disable if loading
            >
              <Text style={[styles.paginationButtonText, p === currentPage && styles.activePaginationButtonText]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
            onPress={() => onPageChange(currentPage + 1)} // Call prop handler
            disabled={currentPage === totalPages || isLoading} // Disable if loading
          >
            <Text style={styles.paginationButtonText}>{t("PaginatedList_NextButton")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// Styles are the same as the previous PaginatedList component
const styles = StyleSheet.create({
  wrapper: {
      flex: 1, // Allow the component to fill space
  },
  listContainer: {
    paddingBottom: 16,
    width: SCREEN_WIDTH * 0.95
  },
  centeredMessage: {
    flex: 1, // Make it take space if list is empty
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 150, // Ensure it has some height
  },
  infoText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#f8f9fa", // Default background
  },
  paginationButton: {
    backgroundColor: "#e9ecef", // Default button color
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 4,
    borderRadius: 6,
    minWidth: 40,
    alignItems: "center",
  },
  paginationButtonText: {
    fontSize: 16,
    color: "#495057", // Default text color
  },
  activePaginationButton: {
    backgroundColor: "#007bff", // Active color
  },
  activePaginationButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
    backgroundColor: "#e9ecef",
  },
});