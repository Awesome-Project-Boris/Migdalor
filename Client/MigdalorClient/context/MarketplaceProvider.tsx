import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';

interface ItemData {
  id: string;
  itemImage1: string;
  itemImage2: string;
  itemName: string;
  itemDescription: string;
  sellerName: string;
  sellerId: string;
  sellerEmail: string;
  sellerPhoneNumber: string;
  publishDate: string;
}

interface MarketplaceContextType {
  items: ItemData[];
  filteredItems: ItemData[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  fetchItems: (page?: number) => void;
  selectedItem?: ItemData;
  setSelectedItem: (item?: ItemData) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  pagesToShow: number[]; // NEW: array of page numbers to show (always 3 if possible)
}

export const MarketplaceContext = createContext<MarketplaceContextType>(null!);

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemData | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  // Example: fetch 50 items at a time
  const fetchItems = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      // Replace with your actual API call...
      const mockData: ItemData[] = new Array(50).fill(null).map((_, i) => ({
        id: `item-${(page - 1) * 50 + i + 1}`,
        itemImage1: `../assets/images/tempItem.jpg`,
        itemImage2: `../assets/images/tempItem.jpg`,
        itemName: `Item ${(page - 1) * 50 + i + 1}`,
        itemDescription: `Description ${(page - 1) * 50 + i + 1}`,
        sellerName: `Seller ${(page - 1) * 50 + i + 1}`,
        sellerId: `seller-${(page - 1) * 50 + i + 1}`,
        sellerEmail: `byeah@gmail.com`,
        sellerPhoneNumber: `059-8765432`,
        publishDate: new Date().toISOString(),
      }));
      setItems(mockData);
      // For example purposes, let's say there are 3 pages available:
      setTotalPages(3);
      setCurrentPage(page);
    } catch (err) {
      console.warn('Error fetching items', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(1);
  }, [fetchItems]);

  // Compute filtered items based on search query.
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    return items.filter(item =>
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  // Compute pagesToShow: always 3 pages if possible, clamped between 1 and totalPages.
  const pagesToShow = useMemo(() => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      let start = currentPage - 1;
      let end = currentPage + 1;
      if (start < 1) {
        start = 1;
        end = 3;
      } else if (end > totalPages) {
        end = totalPages;
        start = totalPages - 2;
      }
      return [start, start + 1, end];
    }
  }, [currentPage, totalPages]);

  return (
    <MarketplaceContext.Provider
      value={{
        items,
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
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}
