import ja from '~/i18n/locales/ja.json';

// Type for the distortion map structure
type DistortionMap = Record<string, string>;

// Register available locales here. 
// Function can be expanded to support 'en', 'es', etc.
const LOCALES: Record<string, { distortions: DistortionMap }> = {
  ja: ja as { distortions: DistortionMap },
  // en: en // Future support
};

/**
 * Returns all valid distortion keys.
 * If locale is provided, tries to use it first, then falls back to the master locale (ja).
 * Throws an error if neither the requested locale nor the master locale is available.
 * 
 * @param locale - Optional locale code (e.g., 'en', 'ja'). Defaults to master locale 'ja'.
 */
export const getValidDistortionKeys = (locale?: string): string[] => {
  const masterLocale = 'ja';
  const targetLocale = locale || masterLocale;
  
  // Try the requested locale first
  if (targetLocale !== masterLocale && LOCALES[targetLocale]?.distortions) {
    return Object.keys(LOCALES[targetLocale].distortions);
  }
  
  // Fall back to master locale (ja)
  if (LOCALES[masterLocale]?.distortions) {
    return Object.keys(LOCALES[masterLocale].distortions);
  }
  
  // If neither exists, throw error
  throw new Error('Critical configuration error: Master locale (ja) distortions not found');
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
