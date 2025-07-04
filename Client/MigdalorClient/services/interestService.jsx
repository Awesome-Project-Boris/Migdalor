// This service mocks an API call to fetch a flat list of interests.
// The data now contains only the Hebrew names, as specified.

const interests = [
  { interestID: 1, name: "צילום" },
  { interestID: 2, name: "צילום אנלוגי" },
  { interestID: 3, name: "נגינה בגיטרה" },
  { interestID: 4, name: "נגינה בפסנתר" },
  { interestID: 5, name: "ביקור במוזיאונים" },
  { interestID: 6, name: "הליכה לתיאטרון" },
  { interestID: 7, name: "ריקודים סלוניים" },
  { interestID: 8, name: "איסוף בולים" },
  { interestID: 9, name: "איסוף מטבעות" },
  { interestID: 10, name: "נגרות" },
  { interestID: 11, name: "סריגה" },
  { interestID: 12, name: "תפירה" },
  { interestID: 13, name: "ציור" },
  { interestID: 14, name: "קדרות" },
  { interestID: 15, name: "טעימות יין" },
  { interestID: 16, name: "בישול גורמה" },
  { interestID: 17, name: "שחמט" },
  { interestID: 18, name: "ברידג'" },
  { interestID: 19, name: "מה ג'ונג" },
  { interestID: 20, name: "פאזלים" },
  { interestID: 21, name: "הליכה" },
  { interestID: 22, name: "דיג" },
  { interestID: 23, name: "צפרות" },
  { interestID: 24, name: "יוגה מתונה" },
  { interestID: 25, name: "שחייה" },
  { interestID: 26, name: "רקמה" },
  // ... 
];

/**
 * Fetches the flat list of all interests.
 * @returns {Promise<Array<{interestID: number, name: string}>>}
 */

export const fetchAllInterests = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(interests);
    }, 300);
  });
};