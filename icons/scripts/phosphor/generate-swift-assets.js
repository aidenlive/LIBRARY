#!/usr/bin/env node

/**
 * Generate Swift/iOS assets from SVG files
 * Converts SVG files to PDF format for Xcode Asset Catalogs
 * 
 * Usage: node generate-swift-assets.js [options]
 * 
 * Options:
 *   --variant <name>  Process specific variant (regular, bold, fill, etc.)
 *   --all             Process all variants (default)
 *   --output <path>   Output directory (default: ../../phosphor/swift/assets)
 * 
 * Requirements:
 *   - ImageMagick (convert command) or similar SVG to PDF converter
 *   - Or use online conversion tools for manual conversion
 * 
 * Note: This script provides a framework. You may need to install
 * ImageMagick or use alternative conversion methods.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const variants = ['regular', 'bold', 'fill', 'duotone', 'thin', 'light'];
const phosphorDir = path.join(__dirname, '../../phosphor');
const svgDir = path.join(phosphorDir, 'svg');
const outputDir = path.join(phosphorDir, 'swift', 'assets');

// Parse command line arguments
const args = process.argv.slice(2);
const variantArg = args.indexOf('--variant');
const allArg = args.indexOf('--all') !== -1;
const outputArg = args.indexOf('--output');

let selectedVariants = variants;
if (variantArg !== -1 && args[variantArg + 1]) {
  selectedVariants = [args[variantArg + 1]];
}

let customOutputDir = outputDir;
if (outputArg !== -1 && args[outputArg + 1]) {
  customOutputDir = path.resolve(args[outputArg + 1]);
}

// Check if ImageMagick is available
function checkImageMagick() {
  try {
    execSync('which convert', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert SVG to PDF using ImageMagick
 */
function convertSvgToPdf(svgPath, pdfPath) {
  try {
    execSync(`convert "${svgPath}" "${pdfPath}"`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error converting ${svgPath}:`, error.message);
    return false;
  }
}

/**
 * Process a single variant
 */
function processVariant(variant) {
  const variantSvgDir = path.join(svgDir, variant);
  const variantOutputDir = path.join(customOutputDir, variant);

  if (!fs.existsSync(variantSvgDir)) {
    console.log(`Skipping ${variant} - SVG directory not found`);
    return;
  }

  // Create output directory
  if (!fs.existsSync(variantOutputDir)) {
    fs.mkdirSync(variantOutputDir, { recursive: true });
  }

  const files = fs.readdirSync(variantSvgDir).filter(file => file.endsWith('.svg'));
  console.log(`\nProcessing ${files.length} icons for ${variant} variant...`);

  if (!checkImageMagick()) {
    console.log('\n⚠️  ImageMagick not found. Cannot convert SVGs to PDFs automatically.');
    console.log('Please install ImageMagick: brew install imagemagick');
    console.log('Or use manual conversion tools.');
    console.log(`\nSVG files are located at: ${variantSvgDir}`);
    console.log(`Output directory created at: ${variantOutputDir}`);
    return;
  }

  let successCount = 0;
  let failCount = 0;

  files.forEach(file => {
    const svgPath = path.join(variantSvgDir, file);
    const pdfName = file.replace('.svg', '.pdf');
    const pdfPath = path.join(variantOutputDir, pdfName);

    if (convertSvgToPdf(svgPath, pdfPath)) {
      successCount++;
    } else {
      failCount++;
    }
  });

  console.log(`✓ Converted ${successCount} icons to PDF`);
  if (failCount > 0) {
    console.log(`⚠️  Failed to convert ${failCount} icons`);
  }
}

// Main execution
console.log('Generating Swift/iOS assets from SVG files...\n');
console.log(`Output directory: ${customOutputDir}\n`);

if (!fs.existsSync(customOutputDir)) {
  fs.mkdirSync(customOutputDir, { recursive: true });
}

selectedVariants.forEach(processVariant);

console.log('\n✓ Swift asset generation complete!');
console.log('\nNext steps:');
console.log('1. Open your Xcode project');
console.log('2. Drag PDF files into Assets.xcassets');
console.log('3. Enable "Preserve Vector Data" for each asset');
console.log('4. Use in code: UIImage(named: "icon-name")');

