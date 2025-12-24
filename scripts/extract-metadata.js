#!/usr/bin/env node

/**
 * Font Metadata Extraction Script
 * Extracts comprehensive metadata from all font files in the typefaces directory
 * Generates fonts-metadata.json database
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import opentype from 'opentype.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TYPEFACES_DIR = path.join(__dirname, '../typefaces');
const OUTPUT_FILE = path.join(__dirname, '../data/fonts-metadata.json');
const SUPPORTED_EXTENSIONS = ['.ttf', '.otf'];

// Weight mapping to CSS values
const WEIGHT_MAP = {
  'Thin': 100,
  'ExtraLight': 200,
  'Light': 300,
  'Regular': 400,
  'Normal': 400,
  'Medium': 500,
  'SemiBold': 600,
  'Bold': 700,
  'ExtraBold': 800,
  'Black': 900,
  'Heavy': 900,
  // Non-standard mappings
  'Air': 100,
  'Semi': 600,
  'Huge': 800,
  'Ultra': 900
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

/**
 * Extract metadata from a single font file
 */
async function extractFontMetadata(fontPath) {
  try {
    const buffer = await fs.readFile(fontPath);
    const font = opentype.parse(buffer.buffer);

    // Extract basic metadata
    const familyName = font.names.fontFamily?.en || font.names.preferredFamily?.en || 'Unknown';
    const subfamilyName = font.names.fontSubfamily?.en || font.names.preferredSubfamily?.en || 'Regular';
    const fullName = font.names.fullName?.en || familyName;
    const postScriptName = font.names.postScriptName?.en || familyName.replace(/\s/g, '');

    // Extract weight and style from OS/2 table
    const weight = font.tables.os2?.usWeightClass || 400;
    const isItalic = font.tables.head?.macStyle?.italic || false;
    const isOblique = subfamilyName.toLowerCase().includes('oblique');

    // Determine style
    let style = 'normal';
    if (isItalic || isOblique) {
      style = 'italic';
    }

    // Extract font metrics
    const unitsPerEm = font.unitsPerEm || 1000;
    const ascender = font.tables.hhea?.ascender || 0;
    const descender = font.tables.hhea?.descender || 0;
    const xHeight = font.tables.os2?.sxHeight || 0;
    const capHeight = font.tables.os2?.sCapHeight || 0;

    // Get file stats
    const stats = await fs.stat(fontPath);
    const fileSize = stats.size;
    const extension = path.extname(fontPath).toLowerCase();
    const format = extension === '.ttf' ? 'truetype' : 'opentype';

    // Extract OpenType features
    const features = [];
    if (font.tables.gsub) {
      const gsub = font.tables.gsub;
      if (gsub.features) {
        for (const feature of gsub.features) {
          if (feature.tag && !features.includes(feature.tag)) {
            features.push(feature.tag);
          }
        }
      }
    }

    // Character count
    const glyphCount = font.numGlyphs || 0;

    // Extract unicode ranges
    const unicodeRanges = extractUnicodeRanges(font);

    // Detect category from metadata
    const category = detectCategory(font, familyName, subfamilyName);

    return {
      // File information
      fileName: path.basename(fontPath),
      filePath: fontPath,
      fileSize,
      format,
      extension,

      // Font metadata
      familyName,
      subfamilyName,
      fullName,
      postScriptName,
      version: font.names.version?.en || 'Unknown',
      copyright: font.names.copyright?.en || null,
      designer: font.names.designer?.en || null,
      manufacturer: font.names.manufacturer?.en || null,
      license: font.names.license?.en || null,
      licenseURL: font.names.licenseURL?.en || null,

      // Style information
      weight,
      style,
      isItalic,
      isOblique,

      // Metrics
      unitsPerEm,
      ascender,
      descender,
      xHeight,
      capHeight,

      // Character coverage
      glyphCount,
      unicodeRanges,

      // OpenType features
      features,

      // Category
      category,

      // Extracted timestamp
      extractedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(`${colors.red}✗ Error processing ${fontPath}:${colors.reset}`, error.message);
    return null;
  }
}

/**
 * Extract unicode ranges from font
 */
function extractUnicodeRanges(font) {
  const ranges = {
    latin: false,
    latinExt: false,
    cyrillic: false,
    greek: false,
    vietnamese: false
  };

  // Check if font has cmap table
  if (!font.tables.cmap) return ranges;

  const glyphs = font.glyphs;
  if (!glyphs || !glyphs.glyphs) return ranges;

  // Sample characters to check for each range
  const checks = {
    latin: [0x0041, 0x0061, 0x0030], // A, a, 0
    latinExt: [0x0100, 0x0152], // Ā, Œ
    cyrillic: [0x0410, 0x0430], // А, а
    greek: [0x0391, 0x03B1], // Α, α
    vietnamese: [0x1EA0, 0x1EA1] // Ạ, ạ
  };

  for (const [range, codepoints] of Object.entries(checks)) {
    let hasAll = true;
    for (const cp of codepoints) {
      const glyph = font.charToGlyph(String.fromCharCode(cp));
      if (!glyph || glyph.index === 0) {
        hasAll = false;
        break;
      }
    }
    ranges[range] = hasAll;
  }

  return ranges;
}

/**
 * Detect font category
 */
function detectCategory(font, familyName, subfamilyName) {
  const lowerName = familyName.toLowerCase();
  const lowerSubfamily = subfamilyName.toLowerCase();

  // Check PANOSE classification if available
  if (font.tables.os2?.panose) {
    const familyType = font.tables.os2.panose[0];
    if (familyType === 2) return 'serif';
    if (familyType === 3) return 'sans-serif';
    if (familyType === 4) return 'script';
    if (familyType === 5) return 'display';
  }

  // Check if monospace
  if (font.tables.post?.isFixedPitch === 1) return 'mono';

  // Name-based heuristics
  if (lowerName.includes('mono') || lowerName.includes('code') || lowerName.includes('console')) {
    return 'mono';
  }
  if (lowerName.includes('serif') && !lowerName.includes('sans')) {
    return 'serif';
  }
  if (lowerName.includes('script') || lowerName.includes('brush') || lowerName.includes('handwritten')) {
    return 'script';
  }
  if (lowerName.includes('display') || lowerName.includes('headline')) {
    return 'display';
  }

  // Check for all-caps names (often display fonts)
  if (/^[A-Z\s]+$/.test(familyName)) {
    return 'display';
  }

  // Default to sans-serif
  return 'sans-serif';
}

/**
 * Scan directory recursively for font files
 */
async function scanDirectory(dir) {
  const fonts = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recursively scan subdirectories
      const subFonts = await scanDirectory(fullPath);
      fonts.push(...subFonts);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (SUPPORTED_EXTENSIONS.includes(ext)) {
        fonts.push(fullPath);
      }
    }
  }

  return fonts;
}

/**
 * Organize fonts by family
 */
function organizeFontsByFamily(fontsMetadata) {
  const families = {};

  for (const font of fontsMetadata) {
    if (!font) continue;

    const familyKey = font.familyName.toLowerCase().replace(/\s/g, '-');

    if (!families[familyKey]) {
      families[familyKey] = {
        family: font.familyName,
        displayName: font.familyName,
        category: font.category,
        variants: [],
        subsets: [],
        version: font.version,
        designer: font.designer,
        license: font.license,
        licenseURL: font.licenseURL
      };
    }

    // Add variant
    families[familyKey].variants.push({
      weight: font.weight,
      style: font.style,
      subfamilyName: font.subfamilyName,
      fileName: font.fileName,
      filePath: font.filePath,
      fileSize: font.fileSize,
      format: font.format,
      extension: font.extension,
      isItalic: font.isItalic,
      isOblique: font.isOblique,
      features: font.features,
      glyphCount: font.glyphCount,
      unicodeRanges: font.unicodeRanges
    });

    // Update subsets
    const subsets = Object.entries(font.unicodeRanges)
      .filter(([_, supported]) => supported)
      .map(([range, _]) => range);

    for (const subset of subsets) {
      if (!families[familyKey].subsets.includes(subset)) {
        families[familyKey].subsets.push(subset);
      }
    }
  }

  // Sort variants by weight and style
  for (const family of Object.values(families)) {
    family.variants.sort((a, b) => {
      if (a.weight !== b.weight) return a.weight - b.weight;
      if (a.style === 'normal' && b.style === 'italic') return -1;
      if (a.style === 'italic' && b.style === 'normal') return 1;
      return 0;
    });
  }

  return families;
}

/**
 * Generate statistics
 */
function generateStatistics(families) {
  const stats = {
    totalFamilies: Object.keys(families).length,
    totalVariants: 0,
    formatBreakdown: { ttf: 0, otf: 0 },
    categoryBreakdown: {},
    weightBreakdown: {},
    averageVariantsPerFamily: 0,
    totalFileSize: 0
  };

  for (const family of Object.values(families)) {
    stats.totalVariants += family.variants.length;

    // Category breakdown
    stats.categoryBreakdown[family.category] = (stats.categoryBreakdown[family.category] || 0) + 1;

    for (const variant of family.variants) {
      // Format breakdown
      if (variant.extension === '.ttf') stats.formatBreakdown.ttf++;
      if (variant.extension === '.otf') stats.formatBreakdown.otf++;

      // Weight breakdown
      const weightKey = `${variant.weight}`;
      stats.weightBreakdown[weightKey] = (stats.weightBreakdown[weightKey] || 0) + 1;

      // Total file size
      stats.totalFileSize += variant.fileSize;
    }
  }

  stats.averageVariantsPerFamily = (stats.totalVariants / stats.totalFamilies).toFixed(2);

  return stats;
}

/**
 * Main execution
 */
async function main() {
  console.log(`${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}  Font Metadata Extraction${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Create data directory if it doesn't exist
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

  console.log(`${colors.gray}Scanning directory:${colors.reset} ${TYPEFACES_DIR}\n`);

  // Scan for font files
  const fontPaths = await scanDirectory(TYPEFACES_DIR);
  console.log(`${colors.green}✓ Found ${fontPaths.length} font files${colors.reset}\n`);

  // Extract metadata
  console.log(`${colors.yellow}Extracting metadata...${colors.reset}\n`);
  const fontsMetadata = [];
  let processed = 0;

  for (const fontPath of fontPaths) {
    const metadata = await extractFontMetadata(fontPath);
    if (metadata) {
      fontsMetadata.push(metadata);
    }
    processed++;

    // Progress indicator
    if (processed % 50 === 0 || processed === fontPaths.length) {
      const percent = ((processed / fontPaths.length) * 100).toFixed(1);
      process.stdout.write(`\r${colors.gray}Progress: ${processed}/${fontPaths.length} (${percent}%)${colors.reset}`);
    }
  }

  console.log(`\n\n${colors.green}✓ Extracted metadata from ${fontsMetadata.length} fonts${colors.reset}\n`);

  // Organize by family
  console.log(`${colors.yellow}Organizing fonts by family...${colors.reset}`);
  const families = organizeFontsByFamily(fontsMetadata);
  console.log(`${colors.green}✓ Organized into ${Object.keys(families).length} font families${colors.reset}\n`);

  // Generate statistics
  const statistics = generateStatistics(families);

  // Create output data
  const output = {
    metadata: {
      version: '1.0.0',
      generated: new Date().toISOString(),
      ...statistics
    },
    fonts: families
  };

  // Write to file
  console.log(`${colors.yellow}Writing to file...${colors.reset}`);
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`${colors.green}✓ Saved to ${OUTPUT_FILE}${colors.reset}\n`);

  // Display summary
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}  Summary${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  console.log(`  Font Families:          ${colors.bright}${statistics.totalFamilies}${colors.reset}`);
  console.log(`  Total Variants:         ${colors.bright}${statistics.totalVariants}${colors.reset}`);
  console.log(`  Avg Variants/Family:    ${colors.bright}${statistics.averageVariantsPerFamily}${colors.reset}`);
  console.log(`  Total Size:             ${colors.bright}${(statistics.totalFileSize / 1024 / 1024).toFixed(2)} MB${colors.reset}`);
  console.log(`\n  ${colors.gray}Formats:${colors.reset}`);
  console.log(`    TTF:                  ${statistics.formatBreakdown.ttf}`);
  console.log(`    OTF:                  ${statistics.formatBreakdown.otf}`);
  console.log(`\n  ${colors.gray}Categories:${colors.reset}`);
  for (const [category, count] of Object.entries(statistics.categoryBreakdown).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${category.padEnd(20)} ${count}`);
  }
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  console.log(`${colors.green}✓ Metadata extraction complete!${colors.reset}\n`);
}

// Run the script
main().catch(error => {
  console.error(`${colors.red}✗ Fatal error:${colors.reset}`, error);
  process.exit(1);
});
