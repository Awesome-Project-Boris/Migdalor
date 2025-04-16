import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'; // Added useCallback
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, ActivityIndicator} from 'react-native';
import { useRouter } from "expo-router";
import NoticeCard from '../components/NoticeCard';
import Header from '@/components/Header';
import FlipButton from '../components/FlipButton'; 
import FilterModal from '../components/NoticeFilterModal'; 
import { Ionicons } from '@expo/vector-icons'; 

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEMS_PER_PAGE = 10;

// --- Mock Fetch Function (Now includes categories) ---
const fetchNoticesAPI = async () => { // Removed page/query args assuming fetch all for client-side filter/sort
  console.log(`Workspaceing all notices...`);
  await new Promise(resolve => setTimeout(resolve, 500));
  const allMockNotices = Array.from({ length: 35 }, (_, i) => ({
    noticeId: i + 1,
    senderId: `guid_${i}`,
    // Generate dates for sorting demo: recent first by default
    creationDate: `2025-04-${String(14 - Math.floor(i / 2)).padStart(2, '0')}`,
    noticeTitle: `Notice #${i + 1}${i % 3 === 0 ? ' Urgent!' : ''}`,
    noticeMessage: `Message for notice ${i + 1}.`,
    noticeCategory: i % 3 === 0 ? 'Urgent' : (i % 3 === 1 ? 'General' : 'Events'),
    noticeSubCategory: i % 5 === 0 ? 'Sub Cat A' : null,
  }));
  // Derive categories from fetched data (or better: get from API)
  const categories = [...new Set(allMockNotices.map(n => n.noticeCategory).filter(Boolean))];

  return {
      notices: allMockNotices,
      totalCount: allMockNotices.length,
      availableCategories: categories, 
  };
};


export default function NoticesScreen() {
  const [allNotices, setAllNotices] = useState([]);
  const [allCategories, setAllCategories] = useState([]); // State for all categories
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState('recent'); // 'recent' or 'oldest'
  const [selectedCategories, setSelectedCategories] = useState([]); // Array of category names/IDs to filter by
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const router = useRouter();
  const flatListRef = useRef(null);

  // Fetch notices and categories on mount
  useEffect(() => {
    const loadNotices = async () => {
      setIsLoading(true);
      try {
        const response = await fetchNoticesAPI(); // Fetch all data
        setAllNotices(response.notices);
        setAllCategories(response.availableCategories || []); // Store categories
        // Reset state on initial load
        setCurrentPage(1);
        setSelectedCategories([]);
        setSortOrder('recent');
      } catch (error) {
        console.error("Failed to fetch notices:", error);
        setAllNotices([]);
        setAllCategories([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadNotices();
  }, []); // Runs once on mount

  // Filter and Sort Logic (using useMemo for performance)
  const processedNotices = useMemo(() => {
    let filtered = [...allNotices];

    // 1. Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(notice =>
        selectedCategories.includes(notice.noticeCategory)
      );
    }

    // 2. Sort based on sortOrder
    // Assuming creationDate is 'YYYY-MM-DD' string
    filtered.sort((a, b) => {
       const dateA = new Date(a.creationDate);
       const dateB = new Date(b.creationDate);
       if (sortOrder === 'recent') {
         return dateB - dateA; // Newer dates first
       } else {
         return dateA - dateB; // Older dates first
       }
    });

    return filtered;
  }, [allNotices, selectedCategories, sortOrder]); // Recalculate when these change

  const totalFilteredItems = processedNotices.length;
  const totalPages = Math.ceil(totalFilteredItems / ITEMS_PER_PAGE);

  // Calculate items for the current page slice *after* filtering/sorting
  const itemsForCurrentPage = useMemo(() => {
    // Reset page if filters/sort make current page invalid
    const newTotalPages = Math.ceil(processedNotices.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
        // Use a slight delay to allow state update before pagination calculation
        setTimeout(() => setCurrentPage(newTotalPages), 0);
    } else if (currentPage === 0 && newTotalPages > 0) {
        setTimeout(() => setCurrentPage(1), 0);
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return processedNotices.slice(startIndex, endIndex);
  }, [processedNotices, currentPage]);


  // Handlers
  const toggleSortOrder = useCallback(() => {
     setSortOrder(prev => (prev === 'recent' ? 'oldest' : 'recent'));
     setCurrentPage(1); // Reset to page 1 when sorting changes
     flatListRef.current?.scrollToOffset({ animated: false, offset: 0 });
  }, []);

  const handleApplyFilter = useCallback((newSelectedCategories) => {
     setSelectedCategories(newSelectedCategories);
     setCurrentPage(1); // Reset to page 1 when filter changes
     setIsFilterModalVisible(false); 
     flatListRef.current?.scrollToOffset({ animated: false, offset: 0 });
  }, []);

  const handleOpenFilterModal = () => setIsFilterModalVisible(true);
  const handleCloseFilterModal = () => setIsFilterModalVisible(false);

  // --- Pagination Logic ---
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
          flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
      }
  };

  // Render item function
  const renderItem = ({ item }) => (
    <NoticeCard
      data={item}
      onPress={() => router.push({ pathname: '/NoticeFocus', params: { noticeId: item.noticeId } })}
    />
  );

  return (
    <>
    <Header />

    <View style={styles.Head}>
        <Text style={styles.H1}> לוח המודעות</Text>
    </View>
    <View style={styles.container}>

      <View style={styles.controlsContainer}>
          <FlipButton onPress={handleOpenFilterModal} style={styles.controlButton}>

             <View style={styles.buttonContent}>
                 <Ionicons name="filter" size={20} color="black" style={styles.buttonIcon} />
                 <Text style={styles.buttonText}> סינון ({selectedCategories.length > 0 ? selectedCategories.length : 'הכל'})</Text>
             </View>
          </FlipButton>

          <FlipButton onPress={toggleSortOrder} style={styles.controlButton}>
              <View style={styles.buttonContent}>
                   <Ionicons
                       name={sortOrder === 'recent' ? "arrow-down" : "arrow-up"} // Icon indicates direction data flows to
                       size={20}
                       color="black"
                       style={styles.buttonIcon}
                   />
                  <Text style={styles.buttonText}>
                     סינון: {sortOrder === 'recent' ? 'הישן ביותר' : 'החדש ביותר'}
                  </Text>
              </View>
          </FlipButton>
      </View>


      {isLoading && totalFilteredItems === 0 && ( 
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
      )}
      {!isLoading && totalFilteredItems === 0 && (
         <View style={styles.centeredMessage}>
             <Text style={styles.noDataText}>
                 {selectedCategories.length > 0 ? 'No notices match selected filters.' : 'No notices found.'}
             </Text>
         </View>
      )}

      {/* --- Notices List --- */}
      {totalFilteredItems > 0 && (
          <FlatList
            ref={flatListRef}
            data={itemsForCurrentPage}
            renderItem={renderItem}
            keyExtractor={(item) => item.noticeId.toString()}
            contentContainerStyle={styles.listContainer}
          />
      )}

      {!isLoading && totalPages > 1 && (
        <View style={styles.paginationContainer}>
           <TouchableOpacity style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]} onPress={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
             <Text style={styles.paginationButtonText}>Prev</Text>
           </TouchableOpacity>
           {pagesToShow.map((p) => (
             <TouchableOpacity key={p} style={[ styles.paginationButton, p === currentPage && styles.activePaginationButton ]} onPress={() => goToPage(p)} disabled={p === currentPage}>
               <Text style={[ styles.paginationButtonText, p === currentPage && styles.activePaginationButtonText ]}>{p}</Text>
             </TouchableOpacity>
           ))}
           <TouchableOpacity style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]} onPress={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
             <Text style={styles.paginationButtonText}>Next</Text>
           </TouchableOpacity>
        </View>
      )}


       <FilterModal
           visible={isFilterModalVisible}
           onClose={handleCloseFilterModal}
           allCategories={allCategories}
           initialSelectedCategories={selectedCategories} // Pass current selection
           onApply={handleApplyFilter}
       />

    </View>
    </>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7', width: '100%', alignItems: 'center' },
  controlsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      width: '100%',
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      backgroundColor: '#fff', 
  },
  controlButton: {
      paddingVertical: 10, 
      paddingHorizontal: 15,
      flexDirection: 'row', 
      alignItems: 'center',
  },
   buttonContent: { 
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
   },
   buttonIcon: {
      marginRight: 8, 
   },
   buttonText: {
      fontSize: 16, 
      fontWeight: 'bold',

   },
  listContainer: { paddingHorizontal: 16, paddingBottom: 16, alignSelf: 'center', width: SCREEN_WIDTH, maxWidth: SCREEN_WIDTH * 0.95, },
  loadingIndicator: { marginTop: 50 },
  centeredMessage: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  noDataText: { fontSize: 18, color: '#666', textAlign: 'center' },
  paginationContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#f7f7f7', width: '100%' },
  paginationButton: { backgroundColor: '#ddd', paddingVertical: 10, paddingHorizontal: 15, marginHorizontal: 4, borderRadius: 6, minWidth: 40, alignItems: 'center' },
  paginationButtonText: { fontSize: 16, color: '#333' },
  activePaginationButton: { backgroundColor: '#007bff' },
  activePaginationButtonText: { color: '#fff', fontWeight: 'bold' },
  disabledButton: { opacity: 0.5, backgroundColor: '#e9ecef' },
  H1: { width: '70%' ,marginTop: 70, fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 20, borderWidth: 1, borderRadius: 20, paddingVertical: 10},
  Head: { alignItems: 'center'}
});