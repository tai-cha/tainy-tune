import ja from '../../i18n/locales/ja.json';

// Type for the distortion map structure
type DistortionMap = Record<string, string>;

// Register available locales here. 
// Function can be expanded to support 'en', 'es', etc.
const LOCALES: Record<string, { distortions: DistortionMap }> = {
  ja: ja as { distortions: DistortionMap },
  // en: en // Future support
};

/**
 * Searches all configured locales for distortion terms that match the search query.
 * Returns an array of unique distortion keys (e.g., 'all_or_nothing').
 */
export const findDistortionKeys = (search: string): string[] => {
  const matchedKeys = new Set<string>();

  Object.values(LOCALES).forEach(locale => {
    Object.entries(locale.distortions).forEach(([key, translation]) => {
      // Check if the search term matches the translation (e.g. "白黒" matches "白黒思考")
      if (translation.includes(search) || search.includes(translation)) {
        matchedKeys.add(key);
      }
    });
  });

  return Array.from(matchedKeys);
};
