import AsyncStorage from "@react-native-async-storage/async-storage";

// Using a unique key for this specific data
const READ_NOTICES_KEY = "@read_notice_ids";

/**
 * Retrieves the set of read notice IDs from storage.
 * If storage is empty or an error occurs, it correctly returns an empty Set.
 * @returns {Promise<Set<string>>} A promise that resolves to a Set of read notice IDs.
 */
const getReadNoticeIds = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(READ_NOTICES_KEY);
    // If jsonValue is null (meaning nothing is stored), we default to an empty array.
    const items = jsonValue != null ? JSON.parse(jsonValue) : [];
    return new Set(items);
  } catch (e) {
    console.error("Failed to fetch read notices from storage", e);
    // On any error, return a new empty Set to prevent crashes.
    return new Set();
  }
};

/**
 * Marks a single notice as read and saves it to storage.
 * @param {string} noticeId The ID of the notice to mark as read.
 */
const markAsRead = async (noticeId) => {
  // Defensive check: do nothing if noticeId is invalid.
  if (!noticeId) return;

  try {
    const readIdsSet = await getReadNoticeIds();

    if (!readIdsSet.has(noticeId)) {
  readIdsSet.add(noticeId); // Add the number directly
  const jsonValue = JSON.stringify(Array.from(readIdsSet));
  await AsyncStorage.setItem(READ_NOTICES_KEY, jsonValue);
}
  } catch (e)
  {
    console.error("Failed to mark notice as read in storage", e);
  }
};

const markMultipleAsRead = async (noticeIds) => {
  if (!noticeIds || noticeIds.length === 0) return;
  try {
    const readIdsSet = await getReadNoticeIds();
    // Add all new IDs to the existing set
    noticeIds.forEach(id => readIdsSet.add(id));
    const jsonValue = JSON.stringify(Array.from(readIdsSet));
    await AsyncStorage.setItem(READ_NOTICES_KEY, jsonValue);
  } catch (e) {
    console.error("Failed to mark multiple notices as read in storage", e);
  }
};

export const ReadNoticeTracker = {
  getReadNoticeIds,
  markAsRead,
  markMultipleAsRead, // ✅ Export the new function
};