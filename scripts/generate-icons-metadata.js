#!/usr/bin/env node

/**
 * Generate Icons API Database
 *
 * Creates a structured JSON database for icon collections, similar to fonts-api-db.json
 * Scans icon directories and generates metadata for API consumption.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONS_DIR = path.join(__dirname, '../icons');
const OUTPUT_FILE = path.join(__dirname, '../data/icons-api-db.json');

// Icon provider configurations
const PROVIDERS = {
  phosphor: {
    name: 'Phosphor',
    displayName: 'Phosphor Icons',
    description: 'A flexible icon family for interfaces, diagrams, presentations',
    license: 'MIT',
    website: 'https://phosphoricons.com',
    author: 'Phosphor Icons',
    variants: ['regular', 'bold', 'fill', 'duotone', 'thin', 'light'],
    formats: {
      svg: true,
      react: true,
      swift: true
    },
    categories: [
      'arrows', 'brand', 'communication', 'commerce', 'design', 'development',
      'editor', 'finance', 'games', 'health', 'maps', 'media', 'nature',
      'objects', 'people', 'system', 'weather'
    ]
  }
};

/**
 * Get all icon names from a variant directory
 */
function getIconNames(providerDir, variant) {
  const variantDir = path.join(providerDir, 'svg', variant);

  if (!fs.existsSync(variantDir)) {
    return [];
  }

  const files = fs.readdirSync(variantDir);
  return files
    .filter(file => file.endsWith('.svg'))
    .map(file => file.replace('.svg', ''));
}

/**
 * Check which variants exist for an icon
 */
function getIconVariants(providerDir, iconName, availableVariants) {
  const variants = [];

  for (const variant of availableVariants) {
    const iconPath = path.join(providerDir, 'svg', variant, `${iconName}.svg`);
    if (fs.existsSync(iconPath)) {
      variants.push(variant);
    }
  }

  return variants;
}

/**
 * Check which formats exist for an icon variant
 */
function getIconFiles(providerKey, iconName, variant) {
  const files = {};
  const providerDir = path.join(ICONS_DIR, providerKey);

  // SVG file
  const svgPath = path.join(providerDir, 'svg', variant, `${iconName}.svg`);
  if (fs.existsSync(svgPath)) {
    files.svg = `https://cdn.library.dev/icons/${providerKey}/v1/svg/${variant}/${iconName}.svg`;
  }

  // React component
  const reactDir = path.join(providerDir, 'react', variant);
  if (fs.existsSync(reactDir)) {
    // Convert kebab-case to PascalCase for component name
    const componentName = iconName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('') + variant.charAt(0).toUpperCase() + variant.slice(1);

    files.react = `@library/icons/${providerKey}/react/${variant}/${componentName}`;
  }

  return files;
}

/**
 * Generate display name from kebab-case
 */
function generateDisplayName(iconName) {
  return iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Categorize icon based on name patterns (simple heuristic)
 */
function categorizeIcon(iconName) {
  const categories = {
    arrows: ['arrow', 'caret', 'chevron', 'corner', 'line-segment'],
    brand: ['github', 'twitter', 'facebook', 'linkedin', 'instagram', 'youtube'],
    communication: ['chat', 'message', 'mail', 'envelope', 'phone', 'bell', 'notification'],
    commerce: ['shopping', 'cart', 'tag', 'receipt', 'currency', 'coin', 'bank', 'credit-card'],
    design: ['palette', 'paint', 'brush', 'eyedropper', 'selection', 'crop', 'layout'],
    development: ['code', 'terminal', 'bug', 'git', 'package', 'brackets', 'function'],
    editor: ['text', 'paragraph', 'list', 'align', 'indent', 'bold', 'italic', 'underline'],
    finance: ['chart', 'graph', 'trend', 'currency', 'percent', 'calculator'],
    games: ['game', 'dice', 'card', 'puzzle', 'trophy', 'medal'],
    health: ['heart', 'pulse', 'medical', 'hospital', 'pill', 'syringe'],
    maps: ['map', 'location', 'pin', 'marker', 'navigation', 'compass', 'globe'],
    media: ['play', 'pause', 'stop', 'record', 'music', 'video', 'camera', 'image', 'film'],
    nature: ['tree', 'leaf', 'flower', 'plant', 'sun', 'moon', 'cloud', 'drop'],
    objects: ['book', 'key', 'lock', 'battery', 'lightbulb', 'clock', 'calendar'],
    people: ['user', 'person', 'profile', 'avatar', 'team', 'users'],
    system: ['file', 'folder', 'trash', 'download', 'upload', 'settings', 'gear', 'warning'],
    weather: ['sun', 'moon', 'cloud', 'rain', 'snow', 'wind', 'lightning', 'thermometer']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      if (iconName.includes(keyword)) {
        return category;
      }
    }
  }

  return 'objects'; // default category
}

/**
 * Generate tags for an icon based on its name
 */
function generateTags(iconName) {
  // Split by hyphens and filter out common words
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at'];
  const tags = iconName
    .split('-')
    .filter(word => !commonWords.includes(word) && word.length > 2);

  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Generate icons database for a provider
 */
function generateProviderData(providerKey, providerConfig) {
  console.log(`\nProcessing provider: ${providerConfig.displayName}`);

  const providerDir = path.join(ICONS_DIR, providerKey);

  if (!fs.existsSync(providerDir)) {
    console.log(`  ⚠️  Provider directory not found: ${providerDir}`);
    return null;
  }

  // Get all unique icon names from the regular variant (baseline)
  const iconNames = getIconNames(providerDir, 'regular');
  console.log(`  Found ${iconNames.length} icons`);

  const icons = {};
  let processedCount = 0;

  for (const iconName of iconNames) {
    const variants = getIconVariants(providerDir, iconName, providerConfig.variants);

    // Build files object for each variant
    const files = {};
    for (const variant of variants) {
      files[variant] = getIconFiles(providerKey, iconName, variant);
    }

    icons[iconName] = {
      name: iconName,
      displayName: generateDisplayName(iconName),
      category: categorizeIcon(iconName),
      tags: generateTags(iconName),
      variants: variants,
      files: files
    };

    processedCount++;

    if (processedCount % 100 === 0) {
      console.log(`  Processed ${processedCount}/${iconNames.length} icons...`);
    }
  }

  console.log(`  ✓ Completed processing ${processedCount} icons`);

  return {
    provider: providerConfig.name,
    displayName: providerConfig.displayName,
    description: providerConfig.description,
    license: providerConfig.license,
    website: providerConfig.website,
    author: providerConfig.author,
    variants: providerConfig.variants,
    formats: providerConfig.formats,
    categories: providerConfig.categories,
    count: iconNames.length,
    version: 'v2.1.1', // Phosphor version
    lastModified: new Date().toISOString().split('T')[0],
    icons: icons
  };
}

/**
 * Main execution
 */
function main() {
  console.log('='.repeat(60));
  console.log('Icons API Database Generator');
  console.log('='.repeat(60));

  const database = {
    providers: {}
  };

  // Process each provider
  for (const [providerKey, providerConfig] of Object.entries(PROVIDERS)) {
    const providerData = generateProviderData(providerKey, providerConfig);

    if (providerData) {
      database.providers[providerKey] = providerData;
    }
  }

  // Calculate total statistics
  const totalProviders = Object.keys(database.providers).length;
  const totalIcons = Object.values(database.providers)
    .reduce((sum, provider) => sum + provider.count, 0);

  database.metadata = {
    totalProviders: totalProviders,
    totalIcons: totalIcons,
    generatedAt: new Date().toISOString(),
    generatedBy: 'generate-icons-metadata.js'
  };

  // Write to file
  console.log(`\nWriting database to: ${OUTPUT_FILE}`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(database, null, 2));

  const fileSize = (fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2);

  console.log('\n' + '='.repeat(60));
  console.log('Generation Complete!');
  console.log('='.repeat(60));
  console.log(`Total Providers: ${totalProviders}`);
  console.log(`Total Icons: ${totalIcons}`);
  console.log(`Output File: ${OUTPUT_FILE}`);
  console.log(`File Size: ${fileSize} MB`);
  console.log('='.repeat(60));
}

// Run the script
main();
