#!/usr/bin/env node

/**
 * Font Metadata Database Generator
 * Generates comprehensive metadata database from font files
 *
 * This creates the fonts.json database needed for the API
 * without requiring OpenType parsing (which needs external libraries)
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TYPEFACES_DIR = path.join(__dirname, '../typefaces');
const CATEGORIES_FILE = path.join(__dirname, '../data/font-categories.json');
const OUTPUT_FILE = path.join(__dirname, '../data/fonts-metadata.json');
const API_DB_FILE = path.join(__dirname, '../data/fonts-api-db.json');

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
 * Parse font filename to extract metadata
 */
function parseFontFile(filename, familyName) {
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);

  // Remove family name prefix
  let variant = basename;
  if (basename.startsWith(familyName + '-')) {
    variant = basename.substring(familyName.length + 1);
  } else if (basename.startsWith(familyName)) {
    variant = basename.substring(familyName.length);
  }

  // Parse weight and style
  const parts = variant.split('-').filter(p => p);

  let weight = 'Regular';
  let style = 'normal';
  let weightValue = 400;

  // Weight mapping
  const weightMap = {
    'Thin': 100,
    'ExtraLight': 200,
    'Light': 300,
    'Regular': 400,
    'Medium': 500,
    'SemiBold': 600,
    'Bold': 700,
    'ExtraBold': 800,
    'Black': 900
  };

  // Parse parts
  for (const part of parts) {
    const partLower = part.toLowerCase();

    // Check for weight
    if (weightMap[part]) {
      weight = part;
      weightValue = weightMap[part];
    }
    // Check for style
    else if (partLower === 'italic' || partLower === 'oblique') {
      style = 'italic';
    }
  }

  // Generate variant key (Google Fonts format)
  let variantKey = '';
  if (style === 'italic') {
    variantKey = weightValue === 400 ? 'italic' : `${weightValue}italic`;
  } else {
    variantKey = weightValue === 400 ? 'regular' : `${weightValue}`;
  }

  return {
    filename,
    basename,
    weight,
    weightValue,
    style,
    variantKey,
    format: ext.substring(1).toLowerCase() // ttf or otf
  };
}

/**
 * Get file size
 */
async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

/**
 * Scan all font families
 */
async function scanFonts() {
  const entries = await fs.readdir(TYPEFACES_DIR, { withFileTypes: true });
  const families = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const familyPath = path.join(TYPEFACES_DIR, entry.name);
      const files = await fs.readdir(familyPath);
      const fontFiles = files.filter(f => f.endsWith('.ttf') || f.endsWith('.otf'));

      if (fontFiles.length > 0) {
        const variants = {};

        for (const file of fontFiles) {
          const filePath = path.join(familyPath, file);
          const parsed = parseFontFile(file, entry.name);
          const size = await getFileSize(filePath);

          variants[parsed.variantKey] = {
            weight: parsed.weightValue,
            style: parsed.style,
            fileName: parsed.basename,
            format: parsed.format,
            fileSize: size,
            filePath: `typefaces/${entry.name}/${file}`
          };
        }

        families.push({
          name: entry.name,
          family: entry.name,
          variants,
          fileCount: fontFiles.length
        });
      }
    }
  }

  return families;
}

/**
 * Load category classifications
 */
async function loadCategories() {
  try {
    const data = await fs.readFile(CATEGORIES_FILE, 'utf-8');
    const json = JSON.parse(data);
    return json.classifications || {};
  } catch {
    return {};
  }
}

/**
 * Generate API-compatible database
 */
function generateAPIDatabase(families, categories) {
  const fonts = {};

  for (const family of families) {
    const familyKey = family.name.toLowerCase();
    const category = categories[family.name]?.category || 'sans-serif';

    // Get all variant keys
    const variantKeys = Object.keys(family.variants).sort();

    // Determine available subsets (default to latin for now)
    const subsets = ['latin'];

    // Get version (default to v1.0.0)
    const version = 'v1.0.0';

    fonts[familyKey] = {
      family: family.name,
      displayName: family.name,
      category,
      variants: variantKeys,
      subsets,
      version,
      lastModified: new Date().toISOString().split('T')[0],
      files: {}
    };

    // Add file paths for each variant
    for (const [variantKey, variantData] of Object.entries(family.variants)) {
      const baseUrl = 'https://cdn.library.dev/fonts';
      const familyPath = familyKey;
      const fileName = variantData.fileName;

      fonts[familyKey].files[variantKey] = {
        woff2: `${baseUrl}/${familyPath}/v1/${fileName}.woff2`,
        woff: `${baseUrl}/${familyPath}/v1/${fileName}.woff`,
        [variantData.format]: `${baseUrl}/${familyPath}/v1/${fileName}.${variantData.format}`
      };
    }
  }

  return {
    fonts,
    metadata: {
      version: '1.0.0',
      generated: new Date().toISOString(),
      totalFamilies: Object.keys(fonts).length,
      totalVariants: Object.values(fonts).reduce((sum, f) => sum + f.variants.length, 0)
    }
  };
}

/**
 * Main execution
 */
async function main() {
  console.log(`${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}  Font Metadata Database Generator${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Load categories
  console.log(`${colors.gray}Loading category classifications...${colors.reset}`);
  const categories = await loadCategories();
  console.log(`${colors.green}✓ Loaded ${Object.keys(categories).length} category classifications${colors.reset}\n`);

  // Scan fonts
  console.log(`${colors.gray}Scanning font families...${colors.reset}`);
  const families = await scanFonts();
  console.log(`${colors.green}✓ Found ${families.length} families with ${families.reduce((sum, f) => sum + f.fileCount, 0)} variants${colors.reset}\n`);

  // Generate metadata
  console.log(`${colors.gray}Generating metadata database...${colors.reset}`);

  const detailedMetadata = {
    metadata: {
      generated: new Date().toISOString(),
      totalFamilies: families.length,
      totalVariants: families.reduce((sum, f) => sum + f.fileCount, 0)
    },
    families: families.map(f => ({
      name: f.name,
      category: categories[f.name]?.category || 'sans-serif',
      variants: f.variants,
      fileCount: f.fileCount
    }))
  };

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(detailedMetadata, null, 2));
  console.log(`${colors.green}✓ Saved detailed metadata to ${OUTPUT_FILE}${colors.reset}`);

  // Generate API database
  console.log(`${colors.gray}Generating API database...${colors.reset}`);
  const apiDb = generateAPIDatabase(families, categories);

  await fs.writeFile(API_DB_FILE, JSON.stringify(apiDb, null, 2));
  console.log(`${colors.green}✓ Saved API database to ${API_DB_FILE}${colors.reset}\n`);

  // Summary
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}  Summary${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  console.log(`  Total Families:    ${colors.bright}${apiDb.metadata.totalFamilies}${colors.reset}`);
  console.log(`  Total Variants:    ${colors.bright}${apiDb.metadata.totalVariants}${colors.reset}\n`);

  // Category breakdown
  const categoryCount = {};
  for (const font of Object.values(apiDb.fonts)) {
    categoryCount[font.category] = (categoryCount[font.category] || 0) + 1;
  }

  console.log(`  ${colors.gray}Category Distribution:${colors.reset}`);
  for (const [category, count] of Object.entries(categoryCount).sort((a, b) => b[1] - a[1])) {
    const percentage = ((count / apiDb.metadata.totalFamilies) * 100).toFixed(1);
    console.log(`    ${category.padEnd(15)} ${colors.bright}${count}${colors.reset} ${colors.gray}(${percentage}%)${colors.reset}`);
  }

  // Sample API entry
  const sampleFamily = Object.values(apiDb.fonts)[0];
  console.log(`\n  ${colors.gray}Sample API Entry:${colors.reset}`);
  console.log(`    Family: ${colors.cyan}${sampleFamily.family}${colors.reset}`);
  console.log(`    Category: ${sampleFamily.category}`);
  console.log(`    Variants: ${sampleFamily.variants.join(', ')}`);
  console.log(`    Files: ${Object.keys(sampleFamily.files).length} variant(s)`);

  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  console.log(`${colors.green}✓ Metadata generation complete!${colors.reset}`);
  console.log(`${colors.gray}API database ready for Phase 3 development${colors.reset}\n`);
}

main().catch(error => {
  console.error(`${colors.red}✗ Fatal error:${colors.reset}`, error);
  process.exit(1);
});
