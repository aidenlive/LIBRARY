#!/usr/bin/env node

/**
 * Optimize SVG files for web use
 * Removes unnecessary attributes, minifies, and ensures consistency
 * 
 * Usage: node optimize-svg.js [options]
 * 
 * Options:
 *   --variant <name>  Process specific variant (regular, bold, fill, etc.)
 *   --all             Process all variants (default)
 *   --backup          Create backup before optimizing
 * 
 * This script optimizes SVG files by:
 * - Removing unnecessary whitespace
 * - Ensuring consistent formatting
 * - Validating SVG structure
 */

const fs = require('fs');
const path = require('path');

const variants = ['regular', 'bold', 'fill', 'duotone', 'thin', 'light'];
const phosphorDir = path.join(__dirname, '../../phosphor');
const svgDir = path.join(phosphorDir, 'svg');

// Parse command line arguments
const args = process.argv.slice(2);
const variantArg = args.indexOf('--variant');
const backupArg = args.indexOf('--backup') !== -1;

let selectedVariants = variants;
if (variantArg !== -1 && args[variantArg + 1]) {
  selectedVariants = [args[variantArg + 1]];
}

/**
 * Optimize SVG content
 */
function optimizeSvg(svgContent) {
  // Remove unnecessary whitespace
  let optimized = svgContent
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();

  // Ensure proper SVG structure
  if (!optimized.includes('xmlns="http://www.w3.org/2000/svg"')) {
    optimized = optimized.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  // Ensure viewBox is present
  if (!optimized.includes('viewBox') && optimized.includes('width') {
    const widthMatch = optimized.match(/width="(\d+)"/);
    const heightMatch = optimized.match(/height="(\d+)"/);
    if (widthMatch && heightMatch) {
      optimized = optimized.replace(
        /<svg[^>]*>/,
        `$& viewBox="0 0 ${widthMatch[1]} ${heightMatch[1]}"`
      );
    }
  }

  return optimized;
}

/**
 * Process a single variant
 */
function processVariant(variant) {
  const variantDir = path.join(svgDir, variant);

  if (!fs.existsSync(variantDir)) {
    console.log(`Skipping ${variant} - directory not found`);
    return;
  }

  const files = fs.readdirSync(variantDir).filter(file => file.endsWith('.svg'));
  console.log(`\nProcessing ${files.length} icons for ${variant} variant...`);

  let optimizedCount = 0;
  let skippedCount = 0;

  files.forEach(file => {
    const filePath = path.join(variantDir, file);
    const originalContent = fs.readFileSync(filePath, 'utf-8');
    
    // Create backup if requested
    if (backupArg) {
      const backupPath = filePath + '.backup';
      if (!fs.existsSync(backupPath)) {
        fs.writeFileSync(backupPath, originalContent);
      }
    }

    const optimizedContent = optimizeSvg(originalContent);
    
    // Only write if content changed
    if (optimizedContent !== originalContent) {
      fs.writeFileSync(filePath, optimizedContent);
      optimizedCount++;
    } else {
      skippedCount++;
    }
  });

  console.log(`✓ Optimized ${optimizedCount} icons`);
  if (skippedCount > 0) {
    console.log(`  (${skippedCount} already optimized)`);
  }
}

// Main execution
console.log('Optimizing SVG files for web use...\n');

if (backupArg) {
  console.log('⚠️  Backup mode enabled - .backup files will be created\n');
}

selectedVariants.forEach(processVariant);

console.log('\n✓ SVG optimization complete!');

