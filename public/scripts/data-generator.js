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

// Generate background objects with metadata
export function generateBackgroundData(names) {
  return names.map((name, index) => {
    const category = inferBackgroundCategory(name);
    const type = inferBackgroundType(category);

    return {
      name: name.toLowerCase().replace(/\s+/g, '-'),
      displayName: name,
      category,
      categories: [category],
      type,
      path: `https://github.com/aidenlive/LIBRARY/tree/main/backgrounds/${category}/${name.toLowerCase().replace(/\s+/g, '-')}`,
      rawPath: `https://raw.githubusercontent.com/aidenlive/LIBRARY/main/backgrounds/${category}/${name.toLowerCase().replace(/\s+/g, '-')}`,
      previewUrl: generateBackgroundPreview(name, category, type),
      tags: [category, type, 'background', 'design'],
      formats: getBackgroundFormats(type),
      // CSS gradient or pattern definition
      cssValue: generateCSSBackground(name, category, type)
    };
  });
}

// Infer background category from name
function inferBackgroundCategory(name) {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('gradient') || lowerName.includes('aurora') || lowerName.includes('sunset') ||
      lowerName.includes('glow') || lowerName.includes('haze') || lowerName.includes('neon')) {
    return 'gradient';
  }
  if (lowerName.includes('pattern') || lowerName.includes('grid') || lowerName.includes('dots') ||
      lowerName.includes('stripes') || lowerName.includes('zigzag') || lowerName.includes('checkerboard')) {
    return 'pattern';
  }
  if (lowerName.includes('texture') || lowerName.includes('paper') || lowerName.includes('concrete') ||
      lowerName.includes('wood') || lowerName.includes('fabric') || lowerName.includes('marble') ||
      lowerName.includes('noise') || lowerName.includes('metal') || lowerName.includes('canvas') ||
      lowerName.includes('leather') || lowerName.includes('stone')) {
    return 'texture';
  }
  if (lowerName.includes('flow') || lowerName.includes('motion') || lowerName.includes('shift') ||
      lowerName.includes('wave') || lowerName.includes('float') || lowerName.includes('morph') ||
      lowerName.includes('pulse') || lowerName.includes('matrix') || lowerName.includes('starfield') ||
      lowerName.includes('bubble') || lowerName.includes('particle')) {
    return 'animated';
  }
  if (lowerName.includes('geo') || lowerName.includes('polygon') || lowerName.includes('poly') ||
      lowerName.includes('voronoi') || lowerName.includes('delaunay') || lowerName.includes('geometry') ||
      lowerName.includes('tessellation') || lowerName.includes('fractal') || lowerName.includes('mandala') ||
      lowerName.includes('crystal') || lowerName.includes('triangle') || lowerName.includes('hexagon') ||
      lowerName.includes('cube') || lowerName.includes('isometric') || lowerName.includes('circuit')) {
    return 'geometric';
  }

  return 'abstract';
}

// Infer background type (CSS, SVG, or Canvas)
function inferBackgroundType(category) {
  if (category === 'gradient') return 'css';
  if (category === 'pattern') return 'svg';
  if (category === 'texture') return 'image';
  if (category === 'animated') return 'canvas';
  if (category === 'geometric') return 'svg';
  return 'css';
}

// Get available formats for background type
function getBackgroundFormats(type) {
  const formats = {
    'css': ['CSS', 'Tailwind'],
    'svg': ['SVG', 'React', 'CSS'],
    'image': ['PNG', 'JPG', 'WebP'],
    'canvas': ['JavaScript', 'CSS', 'SVG']
  };
  return formats[type] || ['CSS'];
}

// Generate background preview (placeholder for demo)
function generateBackgroundPreview(name, category, type) {
  // In a real implementation, this would point to actual preview images
  return `https://raw.githubusercontent.com/aidenlive/LIBRARY/main/backgrounds/${category}/${name.toLowerCase().replace(/\s+/g, '-')}/preview.png`;
}

// Generate CSS background code
function generateCSSBackground(name, category, type) {
  const lowerName = name.toLowerCase();

  // Sample CSS gradients for gradient category
  if (category === 'gradient') {
    const gradients = {
      'mesh gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'glass morphism': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      'aurora borealis': 'linear-gradient(135deg, #00c6ff 0%, #0072ff 50%, #2b32b2 100%)',
      'sunset gradient': 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #c44569 100%)',
      'ocean waves': 'linear-gradient(135deg, #667eea 0%, #4e54c8 50%, #1e3a8a 100%)',
      'purple haze': 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
      'neon glow': 'linear-gradient(135deg, #f953c6 0%, #b91d73 100%)',
      'pastel dreams': 'linear-gradient(135deg, #fee140 0%, #fa709a 100%)',
      'fire & ice': 'linear-gradient(135deg, #ff0844 0%, #ffb199 50%, #00dbde 100%)',
      'cosmic dust': 'linear-gradient(135deg, #4568dc 0%, #b06ab3 100%)'
    };
    return gradients[lowerName] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }

  // Sample patterns for pattern category
  if (category === 'pattern') {
    return `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,.05) 10px, rgba(0,0,0,.05) 20px)`;
  }

  // Default
  return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}
