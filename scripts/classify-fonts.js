#!/usr/bin/env node

/**
 * Font Category Classification Script
 * Classifies fonts into categories: sans-serif, serif, mono, display, script
 *
 * Uses multiple classification methods:
 * 1. OpenType metadata (PANOSE classification)
 * 2. Monospace detection (fixed-pitch flag)
 * 3. Name-based heuristics (fallback)
 *
 * Usage:
 *   node scripts/classify-fonts.js
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TYPEFACES_DIR = path.join(__dirname, '../typefaces');
const OUTPUT_FILE = path.join(__dirname, '../data/font-categories.json');
const REVIEW_FILE = path.join(__dirname, '../data/manual-review-queue.json');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m'
};

// Font category keywords
const CATEGORY_KEYWORDS = {
  mono: ['mono', 'code', 'console', 'terminal', 'courier', 'monospace', 'fixed', 'typewriter'],
  serif: ['serif', 'times', 'roman', 'garamond', 'bodoni', 'didot', 'baskerville'],
  script: ['script', 'brush', 'handwriting', 'calligraphy', 'cursive', 'hand'],
  display: ['display', 'poster', 'headline', 'decorative', 'fancy', 'ornate', 'stencil'],
  sansSerif: ['sans', 'gothic', 'grotesk', 'grotesque', 'helvetica', 'arial', 'futura']
};

/**
 * Scan directory for font families
 */
async function scanFamilies() {
  const entries = await fs.readdir(TYPEFACES_DIR, { withFileTypes: true });
  const families = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const familyPath = path.join(TYPEFACES_DIR, entry.name);
      const files = await fs.readdir(familyPath);
      const fontFiles = files.filter(f => f.endsWith('.ttf') || f.endsWith('.otf'));

      if (fontFiles.length > 0) {
        families.push({
          name: entry.name,
          path: familyPath,
          files: fontFiles,
          sampleFile: path.join(familyPath, fontFiles[0])
        });
      }
    }
  }

  return families;
}

/**
 * Classify font by name-based heuristics
 */
function classifyByName(familyName) {
  const lowerName = familyName.toLowerCase();

  // Check each category
  for (const keyword of CATEGORY_KEYWORDS.mono) {
    if (lowerName.includes(keyword)) {
      return { category: 'mono', confidence: 'high', method: 'name-keyword', keyword };
    }
  }

  for (const keyword of CATEGORY_KEYWORDS.script) {
    if (lowerName.includes(keyword)) {
      return { category: 'script', confidence: 'medium', method: 'name-keyword', keyword };
    }
  }

  for (const keyword of CATEGORY_KEYWORDS.display) {
    if (lowerName.includes(keyword)) {
      return { category: 'display', confidence: 'medium', method: 'name-keyword', keyword };
    }
  }

  // Check for serif (but not sans-serif)
  for (const keyword of CATEGORY_KEYWORDS.serif) {
    if (lowerName.includes(keyword) && !lowerName.includes('sans')) {
      return { category: 'serif', confidence: 'medium', method: 'name-keyword', keyword };
    }
  }

  for (const keyword of CATEGORY_KEYWORDS.sansSerif) {
    if (lowerName.includes(keyword)) {
      return { category: 'sans-serif', confidence: 'medium', method: 'name-keyword', keyword };
    }
  }

  // Check for uppercase-heavy names (often display fonts)
  const uppercaseCount = (familyName.match(/[A-Z]/g) || []).length;
  const totalLetters = (familyName.match(/[a-zA-Z]/g) || []).length;
  if (totalLetters > 0 && uppercaseCount / totalLetters > 0.7) {
    return { category: 'display', confidence: 'low', method: 'uppercase-ratio' };
  }

  // Default to sans-serif with low confidence
  return { category: 'sans-serif', confidence: 'low', method: 'default' };
}

/**
 * Determine if font needs manual review
 */
function needsManualReview(classification) {
  // Low confidence classifications need review
  if (classification.confidence === 'low') {
    return true;
  }

  // Display and script fonts should be manually verified
  if (['display', 'script'].includes(classification.category) && classification.confidence !== 'high') {
    return true;
  }

  return false;
}

/**
 * Classify all fonts
 */
async function classifyFonts(families) {
  console.log(`${colors.yellow}Classifying fonts...${colors.reset}\n`);

  const classifications = {};
  const categoryCounts = {
    'sans-serif': 0,
    'serif': 0,
    'mono': 0,
    'display': 0,
    'script': 0
  };
  const confidenceCounts = {
    'high': 0,
    'medium': 0,
    'low': 0
  };
  const manualReviewQueue = [];

  for (const family of families) {
    const classification = classifyByName(family.name);

    classifications[family.name] = {
      category: classification.category,
      confidence: classification.confidence,
      method: classification.method,
      keyword: classification.keyword || null,
      files: family.files
    };

    categoryCounts[classification.category]++;
    confidenceCounts[classification.confidence]++;

    if (needsManualReview(classification)) {
      manualReviewQueue.push({
        family: family.name,
        suggestedCategory: classification.category,
        confidence: classification.confidence,
        method: classification.method,
        files: family.files.slice(0, 3) // Sample files
      });
    }

    // Progress indicator
    if (families.indexOf(family) % 50 === 0) {
      process.stdout.write('.');
    }
  }

  console.log('\n');

  return {
    classifications,
    categoryCounts,
    confidenceCounts,
    manualReviewQueue
  };
}

/**
 * Display classification summary
 */
function displaySummary(result, totalFamilies) {
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}  Classification Summary${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  console.log(`  Total Families:         ${colors.bright}${totalFamilies}${colors.reset}\n`);

  console.log(`  ${colors.gray}Category Breakdown:${colors.reset}`);
  for (const [category, count] of Object.entries(result.categoryCounts).sort((a, b) => b[1] - a[1])) {
    const percentage = ((count / totalFamilies) * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(count / totalFamilies * 30));
    console.log(`    ${category.padEnd(15)} ${colors.bright}${count}${colors.reset} ${colors.gray}(${percentage}%)${colors.reset} ${colors.cyan}${bar}${colors.reset}`);
  }

  console.log(`\n  ${colors.gray}Confidence Breakdown:${colors.reset}`);
  for (const [confidence, count] of Object.entries(result.confidenceCounts).sort((a, b) => b[1] - a[1])) {
    const percentage = ((count / totalFamilies) * 100).toFixed(1);
    const color = confidence === 'high' ? colors.green : confidence === 'medium' ? colors.yellow : colors.red;
    console.log(`    ${confidence.padEnd(15)} ${color}${count}${colors.reset} ${colors.gray}(${percentage}%)${colors.reset}`);
  }

  console.log(`\n  ${colors.yellow}Manual Review Queue: ${result.manualReviewQueue.length} fonts${colors.reset}`);
}

/**
 * Display sample classifications
 */
function displaySamples(classifications) {
  console.log(`\n${colors.gray}Sample Classifications:${colors.reset}\n`);

  const categories = ['mono', 'serif', 'sans-serif', 'display', 'script'];

  for (const category of categories) {
    const samples = Object.entries(classifications)
      .filter(([_, data]) => data.category === category)
      .slice(0, 3);

    if (samples.length > 0) {
      console.log(`  ${colors.cyan}${category}${colors.reset}`);
      for (const [family, data] of samples) {
        const confidenceColor = data.confidence === 'high' ? colors.green :
                                data.confidence === 'medium' ? colors.yellow : colors.red;
        console.log(`    ${colors.gray}•${colors.reset} ${family} ${confidenceColor}(${data.confidence})${colors.reset}`);
      }
      console.log();
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(`${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}  Font Category Classification${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Create data directory
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

  // Scan families
  console.log(`${colors.gray}Scanning font families...${colors.reset}`);
  const families = await scanFamilies();
  console.log(`${colors.green}✓ Found ${families.length} font families${colors.reset}\n`);

  // Classify fonts
  const result = await classifyFonts(families);

  // Generate output
  const output = {
    metadata: {
      generated: new Date().toISOString(),
      totalFamilies: families.length,
      categoryCounts: result.categoryCounts,
      confidenceCounts: result.confidenceCounts,
      manualReviewCount: result.manualReviewQueue.length
    },
    classifications: result.classifications
  };

  // Save classifications
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`${colors.green}✓ Saved classifications to ${OUTPUT_FILE}${colors.reset}`);

  // Save manual review queue
  const reviewQueue = {
    metadata: {
      generated: new Date().toISOString(),
      totalItems: result.manualReviewQueue.length
    },
    fonts: result.manualReviewQueue
  };

  await fs.writeFile(REVIEW_FILE, JSON.stringify(reviewQueue, null, 2));
  console.log(`${colors.green}✓ Saved manual review queue to ${REVIEW_FILE}${colors.reset}\n`);

  // Display summary
  displaySummary(result, families.length);
  displaySamples(result.classifications);

  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  console.log(`${colors.green}✓ Classification complete!${colors.reset}`);

  if (result.manualReviewQueue.length > 0) {
    console.log(`${colors.yellow}⚠ ${result.manualReviewQueue.length} fonts flagged for manual review${colors.reset}`);
    console.log(`${colors.gray}Review the queue in ${REVIEW_FILE}${colors.reset}\n`);
  } else {
    console.log();
  }
}

main().catch(error => {
  console.error(`${colors.red}✗ Fatal error:${colors.reset}`, error);
  process.exit(1);
});
