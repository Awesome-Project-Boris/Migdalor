import AsyncStorage from '@react-native-async-storage/async-storage';

// A unique key to store the list of read notice IDs
const READ_NOTICES_KEY = '@read_notices_list';

/**
 * Retrieves the set of read notice IDs from storage.
 * Using a Set is very efficient for checking if an item has been read.
 * @returns {Promise<Set<string>>} A promise that resolves to a Set of read notice IDs.
 */
const getReadNoticeIds = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(READ_NOTICES_KEY);
    const items = jsonValue != null ? JSON.parse(jsonValue) : [];
    return new Set(items);
  } catch (e) {
    console.error("Failed to fetch read notices from storage", e);
    return new Set(); // Return an empty set on error
  }
};

/**
 * Marks a single notice as read by adding its ID to the stored list.
 * @param {string} noticeId The ID of the notice to mark as read.
 */
const markAsRead = async (noticeId) => {
  if (!noticeId) return;
  try {
    const readIdsSet = await getReadNoticeIds();
    // Only update storage if the ID is not already in the set
    if (!readIdsSet.has(noticeId)) {
        readIdsSet.add(noticeId);
        const jsonValue = JSON.stringify(Array.from(readIdsSet));
        await AsyncStorage.setItem(READ_NOTICES_KEY, jsonValue);
    }
  } catch (e) {
    console.error("Failed to mark notice as read in storage", e);
  }
};

export const ReadNoticeTracker = {
  getReadNoticeIds,
  markAsRead,
};