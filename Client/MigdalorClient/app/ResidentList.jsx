// app/UserProfiles.jsx (or your chosen path)
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, Dimensions, ActivityIndicator,
  TouchableOpacity, Platform, Keyboard 
} from 'react-native';

import UserProfileCard from '../components/UserProfileCard';
import Header from '@/components/Header';
import FlipButton from '../components/FlipButton';
import FloatingLabelInput from '../components/FloatingLabelInput'; 
import { Ionicons } from '@expo/vector-icons';


const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEMS_PER_PAGE = 12;

// --- Mock API Function (Simulates Server-Side Pagination & Typed Search) ---
// Replace with your actual API call logic
const fetchUsersAPI = async (page = 1, limit = ITEMS_PER_PAGE, query = '', searchType = 'name') => {
  console.log(`Workspaceing users - Page: ${page}, Limit: ${limit}, Query: "${query}", Type: ${searchType}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  const allMockUsers = Array.from({ length: 150 }, (_, i) => ({ userId: `user_${i + 1}`, name: `User ${String.fromCharCode(65 + (i % 26))}${i}`, photoUrl: `https://i.pravatar.cc/150?u=user${i + 1}`, _hobbies_server_only: ['hobby ' + (i % 5 + 1), 'activity ' + (i % 3 + 1), i % 4 === 0 ? 'reading' : 'music'] }));
  let filteredUsers = allMockUsers;
  if (query) { const lowerCaseQuery = query.toLowerCase(); if (searchType === 'name') { filteredUsers = allMockUsers.filter(user => user.name.toLowerCase().includes(lowerCaseQuery)); } else if (searchType === 'hobby') { filteredUsers = allMockUsers.filter(user => user._hobbies_server_only.some(hobby => hobby.toLowerCase().includes(lowerCaseQuery))); } }
  const totalCount = filteredUsers.length; const startIndex = (page - 1) * limit; const endIndex = startIndex + limit; const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  console.log(`API returning ${paginatedUsers.length} users, Total Count: ${totalCount}`);
  return { users: paginatedUsers, totalCount: totalCount };
};
// --- End Mock API ---

export default function UserProfilesScreen() {
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [activeSearchType, setActiveSearchType] = useState('name');

  const flatListRef = useRef(null);


  const executeSearch = useCallback(async (page = 1, query = activeSearchQuery, type = activeSearchType) => {
    const isNewSearch = (page === 1 && (query !== activeSearchQuery || type !== activeSearchType)); const isPageChange = page > 1;
    console.log(`Executing search: page=${page}, query=${query}, type=${type}, isNewSearch=${isNewSearch}, isPageChange=${isPageChange}`);
    if (isNewSearch) { setIsLoading(true); setDisplayedUsers([]); setActiveSearchQuery(query); setActiveSearchType(type); } else if (isPageChange) { setIsLoadingMore(true); } else { setIsLoading(true); }
    try { const response = await fetchUsersAPI(page, ITEMS_PER_PAGE, query, type); setDisplayedUsers(response.users || []); setTotalItems(response.totalCount || 0); if (isNewSearch || page === 1) { flatListRef.current?.scrollToOffset({ animated: false, offset: 0 }); } } catch (error) { console.error("Failed to fetch users:", error); setDisplayedUsers([]); setTotalItems(0); } finally { setIsLoading(false); setIsLoadingMore(false); }
  }, [activeSearchQuery, activeSearchType]); // Include active params

  // Initial Load
  useEffect(() => {
     executeSearch(1, '', 'name');
  }, [executeSearch]);

  // Fetch more data when currentPage changes - maybe not needed
  useEffect(() => {
    if (currentPage > 1) {
       console.log("Fetching next page:", currentPage);
       executeSearch(currentPage, activeSearchQuery, activeSearchType);
    }
  }, [currentPage, executeSearch, activeSearchQuery, activeSearchType]);


  // --- UI Handlers ---
  const toggleSearchType = () => {
     setSearchType(prev => (prev === 'name' ? 'hobby' : 'name'));
     // Clear search query when type changes
     // setSearchQuery('');
  };

  const handleSearchPress = () => {
     Keyboard.dismiss();
     setCurrentPage(1);
     executeSearch(1, searchQuery, searchType); // Trigger search with current input
  };

  // --- Pagination Calculation --- 
  const totalPages = useMemo(() => Math.ceil(totalItems / ITEMS_PER_PAGE), [totalItems]);
  const pagesToShow = useMemo(() => {
    const safeTotalPages = Math.max(1, totalPages); 
    const maxPagesToShow = 3; const pages = []; 
    if (safeTotalPages <= maxPagesToShow) 
        { for (let i = 1; i <= safeTotalPages; i++) pages.push(i); } 
    else 
    { let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
     let endPage = Math.min(safeTotalPages, startPage + maxPagesToShow - 1); 
     if (endPage - startPage + 1 < maxPagesToShow) 
        { startPage = Math.max(1, endPage - maxPagesToShow + 1); } 
     for (let i = startPage; i <= endPage; i++) pages.push(i); } 
     return pages;
  }, [currentPage, totalPages]);

  const goToPage = (pageNumber) => {
      const safeTotalPages = Math.max(1, totalPages); if (pageNumber >= 1 && pageNumber <= safeTotalPages && pageNumber !== currentPage) { setCurrentPage(pageNumber); }
  };

  // Render item function
  const renderItem = ({ item }) => ( <UserProfileCard data={item} /> );

  return (
    <View style={styles.container}>
      <Header title="User Profiles" />

      {/* --- Search Controls --- */}
      <View style={styles.searchControlsContainer}>
         {/* Search Type Toggle Button */}
         <TouchableOpacity onPress={toggleSearchType} style={styles.searchTypeButton}>
            <Text style={styles.searchTypeText}>
               Search by: <Text style={{fontWeight: 'bold'}}>{searchType === 'name' ? 'Name' : 'Hobby'}</Text>
            </Text>
         </TouchableOpacity>

         <FloatingLabelInput
             label={searchType === 'name' ? 'Enter name...' : 'Enter hobby...'}
             value={searchQuery}
             onChangeText={setSearchQuery}
             
             returnKeyType="search"
             onSubmitEditing={handleSearchPress}
             style={styles.searchInputContainer} // Apply container styles if needed
             inputStyle={styles.searchInput} // Apply specific input styles
             // Adjust size/alignment if needed (defaults: size=30, alignRight=true)
             // size={25}
             // alignRight={false}
         />

         <FlipButton
             onPress={handleSearchPress}
             style={styles.searchSubmitButton}
             bgColor="#007bff"
             textColor="#fff"
             disabled={isLoading}
         >
             <View style={styles.buttonContent}>
                <Ionicons name="search" size={20} color="white" style={styles.buttonIcon} />
                <Text style={styles.searchButtonText}>Search</Text>
             </View>
         </FlipButton>
      </View>

      {/* --- Loading / No Results / List / Pagination --- */}
      {isLoading && displayedUsers.length === 0 && ( <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} /> )}
      {!isLoading && totalItems === 0 && ( <View style={styles.centeredMessage}><Text style={styles.noDataText}>{activeSearchQuery ? 'No users match your search.' : 'No users found.'}</Text></View> )}
      <FlatList ref={flatListRef} data={displayedUsers} renderItem={renderItem} keyExtractor={(item) => item.userId.toString()} contentContainerStyle={styles.listContainer} ListFooterComponent={isLoadingMore ? <ActivityIndicator size="small" color="#888" style={{ marginVertical: 10 }} /> : null} />
      {!isLoading && !isLoadingMore && totalPages > 1 && ( <View style={styles.paginationContainer}>{/* Pagination buttons */}<TouchableOpacity style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]} onPress={() => goToPage(currentPage - 1)} disabled={currentPage === 1 || isLoading || isLoadingMore}><Text style={styles.paginationButtonText}>Prev</Text></TouchableOpacity>{pagesToShow.map((p) => ( <TouchableOpacity key={p} style={[ styles.paginationButton, p === currentPage && styles.activePaginationButton ]} onPress={() => goToPage(p)} disabled={p === currentPage || isLoading || isLoadingMore}><Text style={[ styles.paginationButtonText, p === currentPage && styles.activePaginationButtonText ]}>{p}</Text></TouchableOpacity> ))}<TouchableOpacity style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]} onPress={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || isLoading || isLoadingMore}><Text style={styles.paginationButtonText}>Next</Text></TouchableOpacity></View> )}

    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7', width: '100%', alignItems: 'center' },
  searchControlsContainer: { marginTop: 70, width: '90%', maxWidth: 600, backgroundColor: '#fff', borderRadius: 8, padding: 15, marginVertical: 10, borderWidth: 1, borderColor: '#ddd' },
  searchTypeButton: { marginBottom: 20, paddingVertical: 10, marginBottom: 15, alignItems: 'center', backgroundColor: '#e7e7e7', borderRadius: 6 }, // Increased marginBottom
  searchTypeText: { fontSize: 16, color: '#333' },

  searchInputContainer: {
      marginTop: 30 
  },

  searchInput: {
  fontSize: 20,
  color: '#333',
  textAlign: 'left',
  },
  searchSubmitButton: { paddingVertical: 12 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  buttonIcon: { marginRight: 8 },
  searchButtonText: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  listContainer: { paddingHorizontal: 16, paddingBottom: 16, alignSelf: 'center', width: '100%', maxWidth: SCREEN_WIDTH * 0.95 },
  loadingIndicator: { marginTop: 50 },
  centeredMessage: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  noDataText: { fontSize: 18, color: '#666', textAlign: 'center' },
  paginationContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#f7f7f7', width: '100%' },
  paginationButton: { backgroundColor: '#ddd', paddingVertical: 10, paddingHorizontal: 15, marginHorizontal: 4, borderRadius: 6, minWidth: 40, alignItems: 'center' },
  paginationButtonText: { fontSize: 16, color: '#333' },
  activePaginationButton: { backgroundColor: '#007bff' },
  activePaginationButtonText: { color: '#fff', fontWeight: 'bold' },
  disabledButton: { opacity: 0.5, backgroundColor: '#e9ecef' },
});