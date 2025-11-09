/**
 * Data Generator
 * Loads font metadata from pre-generated JSON file
 * Metadata is generated at build time by scripts/generate-font-metadata.js
 */

// Font metadata loaded from JSON
let FONT_METADATA = null;

// Icon categories
export const ICON_CATEGORIES = {
  'bold': 'Bold weight icons',
  'regular': 'Regular weight icons',
  'light': 'Light weight icons',
  'fill': 'Filled icons',
  'duotone': 'Two-tone icons',
  'thin': 'Thin weight icons'
};

// Typeface categories
export const TYPEFACE_CATEGORIES = {
  'serif': 'Serif typefaces',
  'sans-serif': 'Sans serif typefaces',
  'mono': 'Monospace typefaces',
  'display': 'Display typefaces',
  'script': 'Script typefaces',
  'handwritten': 'Handwritten typefaces'
};

/**
 * Load font metadata from JSON file
 */
export async function loadFontMetadata() {
  if (FONT_METADATA) {
    return FONT_METADATA;
  }

  try {
    const response = await fetch('data/fonts-metadata.json');
    if (!response.ok) {
      throw new Error(`Failed to load font metadata: ${response.status}`);
    }
    FONT_METADATA = await response.json();
    console.log(`✅ Loaded metadata for ${FONT_METADATA.totalFonts} fonts (${FONT_METADATA.totalFiles} files)`);
    return FONT_METADATA;
  } catch (error) {
    console.error('Failed to load font metadata:', error);
    throw error;
  }
}

/**
 * Get all typefaces with metadata
 * This replaces the old generateTypefaceData function
 */
export async function getTypefaceData() {
  const metadata = await loadFontMetadata();

  // Transform metadata into format expected by the app
  return metadata.fonts.map(font => ({
    name: font.name,
    category: font.category,
    categories: font.categories,
    path: font.path,
    weights: font.weights,
    variants: font.variants,
    files: font.files,
    defaultFile: font.defaultFile,
    preview: font.preview,
    alphabet: font.alphabet,
    tags: font.tags,
    // Use the default file for font preview (usually Regular weight)
    fontUrl: font.defaultFile
  }));
}

/**
 * Get typeface by name
 */
export async function getTypefaceByName(name) {
  const metadata = await loadFontMetadata();
  return metadata.fonts.find(f => f.name === name);
}

/**
 * Get typefaces by category
 */
export async function getTypefacesByCategory(category) {
  const metadata = await loadFontMetadata();
  return metadata.fonts.filter(f => f.category === category);
}

/**
 * Get metadata stats
 */
export async function getMetadataStats() {
  const metadata = await loadFontMetadata();
  return {
    totalFonts: metadata.totalFonts,
    totalFiles: metadata.totalFiles,
    categories: metadata.categories,
    generated: metadata.generated
  };
}

/**
 * Legacy export for backward compatibility
 * This is deprecated - use getTypefaceData() instead
 */
export function generateTypefaceData() {
  console.warn('generateTypefaceData() is deprecated. Use getTypefaceData() instead.');
  return getTypefaceData();
}

/**
 * Get the old TYPEFACES array for backward compatibility
 * This is deprecated - metadata now loaded from JSON
 */
export async function getTypefaceNames() {
  const metadata = await loadFontMetadata();
  return metadata.fonts.map(f => f.name);
}
