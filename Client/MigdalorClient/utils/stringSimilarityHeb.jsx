const hebrewTypoCost = {
  'תט': 0.4, 'טת': 0.4, // Tet and Tav
  'כק': 0.4, 'קכ': 0.4, // Kaf and Kof
  'אע': 0.4, 'עא': 0.4, // Aleph and Ayin
  'סש': 0.5, 'שס': 0.5, // Samekh and Shin
  // Final letters vs. regular letters have a very low cost
  'כך': 0.1, 'ךכ': 0.1,
  'מם': 0.1, 'םמ': 0.1,
  'נן': 0.1, 'ןנ': 0.1,
  'פף': 0.1, 'ףפ': 0.1,
  'צץ': 0.1, 'ץצ': 0.1,
};

/**
 * Calculates a Hebrew-aware Levenshtein distance between two strings.
 * @param {string} s1 The first string.
 * @param {string} s2 The second string.
 * @returns {number} The weighted edit distance. A number below 1.5 is likely a typo.
 */
export const hebrewLevenshtein = (s1, s2) => {
  // The rest of the function remains exactly the same
  if (!s1 || !s2) return 99;

  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            const typoKey = s1.charAt(i - 1) + s2.charAt(j - 1);
            const substitutionCost = hebrewTypoCost[typoKey] || 1;
            
            newValue = Math.min(
              newValue + 1,
              lastValue + 1,
              costs[j - 1] + substitutionCost
            );
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) {
      costs[s2.length] = lastValue;
    }
  }
  return costs[s2.length];
};