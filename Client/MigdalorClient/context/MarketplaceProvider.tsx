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
  isLoading: boolean;
  goToPage: (page: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  getItemById: (id: string) => ItemData | undefined;
  mainImage: string | null;
  setMainImage: React.Dispatch<React.SetStateAction<string | null>>;
  extraImage: string | null;
  setExtraImage: React.Dispatch<React.SetStateAction<string | null>>;
}

export const MarketplaceContext = createContext<MarketplaceContextType>(null!);

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [extraImage, setExtraImage] = useState<string | null>(null);

  // Example: fetch 50 items at a time
  const fetchItems = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      // MOCK DATA to replace with API
      const mockData: ItemData[] = new Array(50).fill(null).map((_, i) => ({
        id: `item-${i + 1}`,
        itemImage1: `../assets/images/tempItem.jpg`,
        itemImage2: `../assets/images/tempItem.jpg`,
        itemName: `Item ${i + 1}`,
        itemDescription: `Description ${i + 1}`,
        sellerName: `Seller ${i % 5 + 1}`,
        sellerId: `seller-${i % 5 + 1}`,
        sellerEmail: `roishm83@gmail.com`,
        sellerPhoneNumber: `054-5701606`,
        publishDate: new Date().toISOString(),
      }));
      setItems(mockData);
      // For example purposes, let's say there are 3 pages available:
    } catch (err) {
      console.warn('Error fetching items: ', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
}, []);

  useEffect(() => {
    fetchItems(1);
  }, [fetchItems]);


  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const lowerQuery = searchQuery.toLowerCase();
    return items.filter(item =>
      item.itemName.toLowerCase().includes(lowerQuery)
    );
  }, [items, searchQuery]);

  const getItemById = useCallback(( id: string): ItemData | undefined => {
    console.log("Getting item by ID from provider: " + id );
    const foundItem = items.find(item => item.id === id);
    return foundItem
  }, [items]);


  return (
    <MarketplaceContext.Provider
      value={{
        items,
        filteredItems,
        currentPage,
        goToPage,
        isLoading,
        searchQuery,
        setSearchQuery,
        getItemById,
        mainImage,
        setMainImage,
        extraImage,
        setExtraImage
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}
