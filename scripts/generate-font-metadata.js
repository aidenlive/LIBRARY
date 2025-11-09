#!/usr/bin/env node

/**
 * Font Metadata Generator
 *
 * Scans the typefaces directory and generates comprehensive metadata
 * for all font files including weights, styles, and categories.
 *
 * Usage:
 *   node scripts/generate-font-metadata.js
 *
 * Output:
 *   public/data/fonts-metadata.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TYPEFACES_DIR = path.join(__dirname, '..', 'typefaces');
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'data', 'fonts-metadata.json');
const REPO_BASE = 'https://raw.githubusercontent.com/aidenlive/LIBRARY/main';

// Font weight keywords and their numeric values
const WEIGHT_MAP = {
  'thin': 100,
  'hairline': 100,
  'ultralight': 200,
  'extralight': 200,
  'light': 300,
  'normal': 400,
  'regular': 400,
  'book': 400,
  'medium': 500,
  'semibold': 600,
  'demibold': 600,
  'bold': 700,
  'extrabold': 800,
  'ultrabold': 800,
  'heavy': 800,
  'black': 900,
  'ultra': 900,
  'fat': 900
};

// Weight value to name mapping
const WEIGHT_NAME_MAP = {
  100: 'Thin',
  200: 'ExtraLight',
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'SemiBold',
  700: 'Bold',
  800: 'ExtraBold',
  900: 'Black'
};

// Style keywords
const STYLE_KEYWORDS = {
  italic: ['italic', 'italics', 'ital'],
  oblique: ['oblique', 'obli', 'slanted']
};

/**
 * Extract weight from filename
 */
function extractWeight(filename) {
  const normalized = filename.toLowerCase().replace(/[_-]/g, '');

  // Check for weight keywords
  for (const [keyword, value] of Object.entries(WEIGHT_MAP)) {
    if (normalized.includes(keyword)) {
      return value;
    }
  }

  // Default to Regular if no weight found
  return 400;
}

/**
 * Extract style from filename
 */
function extractStyle(filename) {
  const normalized = filename.toLowerCase();

  for (const [style, keywords] of Object.entries(STYLE_KEYWORDS)) {
    if (keywords.some(kw => normalized.includes(kw))) {
      return style.charAt(0).toUpperCase() + style.slice(1);
    }
  }

  return 'Normal';
}

/**
 * Get weight name from numeric value
 */
function getWeightName(value) {
  return WEIGHT_NAME_MAP[value] || 'Regular';
}

/**
 * Infer font category from family name and filenames
 */
function inferCategory(familyName, filenames) {
  const allText = `${familyName.toLowerCase()} ${filenames.join(' ').toLowerCase()}`;

  // Monospace fonts
  const monoKeywords = ['mono', 'code', 'console', 'terminal', 'courier', 'source', 'fira code', 'jetbrains'];
  if (monoKeywords.some(kw => allText.includes(kw))) {
    return 'mono';
  }

  // Serif fonts
  const serifKeywords = [
    'serif', 'times', 'garamond', 'bodoni', 'didot', 'baskerville',
    'georgia', 'palatino', 'bookman', 'caslon', 'clarendon'
  ];
  if (serifKeywords.some(kw => allText.includes(kw))) {
    return 'serif';
  }

  // Script fonts
  const scriptKeywords = [
    'script', 'brush', 'handwriting', 'cursive', 'calligraph',
    'signature', 'handwritten', 'casual', 'dancing'
  ];
  if (scriptKeywords.some(kw => allText.includes(kw))) {
    return 'script';
  }

  // Display fonts
  const displayKeywords = [
    'display', 'headline', 'poster', 'decorative', 'fancy',
    'ornament', 'titling', 'banner'
  ];
  if (displayKeywords.some(kw => allText.includes(kw))) {
    return 'display';
  }

  // Check for all caps (likely display font)
  if (/^[A-Z\s]+$/.test(familyName)) {
    return 'display';
  }

  // Default to sans-serif
  return 'sans-serif';
}

/**
 * Analyze a font file and extract metadata
 */
function analyzeFontFile(filepath, familyName) {
  const filename = path.basename(filepath);
  const ext = path.extname(filepath).toLowerCase().slice(1);

  // Skip non-font files
  if (!['ttf', 'otf', 'woff', 'woff2'].includes(ext)) {
    return null;
  }

  const stats = fs.statSync(filepath);
  const weightValue = extractWeight(filename);
  const style = extractStyle(filename);
  const weight = getWeightName(weightValue);

  // Create relative URL path
  const relativePath = path.relative(
    path.join(__dirname, '..'),
    filepath
  ).replace(/\\/g, '/');

  return {
    filename,
    weight,
    weightValue,
    style,
    format: ext,
    url: `${REPO_BASE}/${relativePath}`,
    size: stats.size,
    path: relativePath
  };
}

/**
 * Scan a typeface directory and extract all font files
 */
function scanTypefaceDirectory(dirPath, familyName) {
  try {
    const files = fs.readdirSync(dirPath);
    const fontFiles = files
      .map(file => {
        const filepath = path.join(dirPath, file);
        const stats = fs.statSync(filepath);

        // Skip directories
        if (stats.isDirectory()) {
          return null;
        }

        return analyzeFontFile(filepath, familyName);
      })
      .filter(file => file !== null);

    return fontFiles;
  } catch (error) {
    console.error(`Error scanning ${familyName}:`, error.message);
    return [];
  }
}

/**
 * Get unique weights from font files
 */
function getUniqueWeights(files) {
  const weights = files.map(f => f.weight);
  return [...new Set(weights)].sort((a, b) => {
    const aVal = files.find(f => f.weight === a).weightValue;
    const bVal = files.find(f => f.weight === b).weightValue;
    return aVal - bVal;
  });
}

/**
 * Get variant count (weight × style combinations)
 */
function getVariantCount(files) {
  const variants = new Set();
  files.forEach(file => {
    variants.add(`${file.weight}-${file.style}`);
  });
  return variants.size;
}

/**
 * Main function to generate font metadata
 */
async function generateMetadata() {
  console.log('🚀 Font Metadata Generator');
  console.log('==========================\n');

  // Check if typefaces directory exists
  if (!fs.existsSync(TYPEFACES_DIR)) {
    console.error(`❌ Error: Typefaces directory not found at ${TYPEFACES_DIR}`);
    process.exit(1);
  }

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Get all typeface directories
  const directories = fs.readdirSync(TYPEFACES_DIR)
    .filter(item => {
      const itemPath = path.join(TYPEFACES_DIR, item);
      return fs.statSync(itemPath).isDirectory();
    })
    .sort();

  console.log(`📂 Found ${directories.length} typeface directories\n`);

  // Process each typeface
  const fonts = [];
  let totalFiles = 0;
  let errorCount = 0;

  for (let i = 0; i < directories.length; i++) {
    const dir = directories[i];
    const dirPath = path.join(TYPEFACES_DIR, dir);

    process.stdout.write(`[${i + 1}/${directories.length}] Processing ${dir}...`);

    try {
      const files = scanTypefaceDirectory(dirPath, dir);

      if (files.length === 0) {
        console.log(' ⚠️  No font files found');
        errorCount++;
        continue;
      }

      const weights = getUniqueWeights(files);
      const variants = getVariantCount(files);
      const category = inferCategory(dir, files.map(f => f.filename));

      // Find the best default font file (Regular Normal, or first file)
      let defaultFile = files.find(f => f.weight === 'Regular' && f.style === 'Normal');
      if (!defaultFile) {
        defaultFile = files.find(f => f.weight === 'Regular');
      }
      if (!defaultFile) {
        defaultFile = files[0];
      }

      fonts.push({
        name: dir,
        category,
        categories: [category],
        weights,
        variants,
        files,
        defaultFile: defaultFile.url,
        preview: 'The quick brown fox jumps over the lazy dog',
        alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789',
        tags: [category, 'font', 'typeface', 'typography'],
        path: `https://github.com/aidenlive/LIBRARY/tree/main/typefaces/${dir}`
      });

      totalFiles += files.length;
      console.log(` ✅ ${files.length} files, ${variants} variants`);

    } catch (error) {
      console.log(` ❌ Error: ${error.message}`);
      errorCount++;
    }
  }

  // Generate metadata object
  const metadata = {
    fonts,
    generated: new Date().toISOString(),
    totalFonts: fonts.length,
    totalFiles,
    version: '1.0.0',
    categories: {
      'serif': fonts.filter(f => f.category === 'serif').length,
      'sans-serif': fonts.filter(f => f.category === 'sans-serif').length,
      'mono': fonts.filter(f => f.category === 'mono').length,
      'display': fonts.filter(f => f.category === 'display').length,
      'script': fonts.filter(f => f.category === 'script').length
    }
  };

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(metadata, null, 2));

  // Print summary
  console.log('\n==========================');
  console.log('📊 Summary');
  console.log('==========================');
  console.log(`Total Typefaces: ${metadata.totalFonts}`);
  console.log(`Total Font Files: ${metadata.totalFiles}`);
  console.log(`Errors: ${errorCount}`);
  console.log('\n📁 Categories:');
  Object.entries(metadata.categories).forEach(([cat, count]) => {
    const percentage = ((count / metadata.totalFonts) * 100).toFixed(1);
    console.log(`  ${cat.padEnd(12)} ${count.toString().padStart(3)} (${percentage}%)`);
  });
  console.log(`\n✅ Metadata saved to: ${OUTPUT_FILE}`);
  console.log(`📦 File size: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2)} KB\n`);
}

// Run the generator
generateMetadata().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
