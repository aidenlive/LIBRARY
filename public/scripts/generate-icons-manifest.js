/**
 * Generate Icons Manifest
 * Scans Phosphor icons directory and generates icons.json manifest
 */

const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '../../icons/phosphor/svg');
const OUTPUT_FILE = path.join(__dirname, '../data/icons.json');

const VARIANTS = ['regular', 'bold', 'fill', 'duotone', 'thin', 'light'];

/**
 * Extract icon name from filename
 */
function extractIconName(filename) {
  return path.basename(filename, '.svg');
}

/**
 * Get display name from icon name
 */
function getDisplayName(iconName) {
  return iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Scan variant directory for icons
 */
function scanVariant(variantDir, variant) {
  if (!fs.existsSync(variantDir)) {
    return [];
  }

  const files = fs.readdirSync(variantDir);
  return files
    .filter(file => file.endsWith('.svg'))
    .map(file => extractIconName(file));
}

/**
 * Generate icons manifest
 */
function generateManifest() {
  console.log('Generating icons manifest...');
  console.log(`Scanning: ${ICONS_DIR}`);

  if (!fs.existsSync(ICONS_DIR)) {
    console.error(`Icons directory not found: ${ICONS_DIR}`);
    process.exit(1);
  }

  // Get all unique icon names from regular variant
  const regularDir = path.join(ICONS_DIR, 'regular');
  if (!fs.existsSync(regularDir)) {
    console.error(`Regular variant directory not found: ${regularDir}`);
    process.exit(1);
  }

  const allIconNames = scanVariant(regularDir, 'regular');
  console.log(`Found ${allIconNames.length} unique icons`);

  // Build icon data
  const icons = allIconNames.map(iconName => {
    const availableVariants = [];

    // Check which variants exist for this icon
    VARIANTS.forEach(variant => {
      const variantDir = path.join(ICONS_DIR, variant);
      const iconPath = path.join(variantDir, `${iconName}.svg`);
      if (fs.existsSync(iconPath)) {
        availableVariants.push(variant);
      }
    });

    return {
      name: iconName,
      displayName: getDisplayName(iconName),
      variants: availableVariants,
      path: {
        regular: availableVariants.includes('regular') ? `../../icons/phosphor/svg/regular/${iconName}.svg` : null,
        bold: availableVariants.includes('bold') ? `../../icons/phosphor/svg/bold/${iconName}.svg` : null,
        fill: availableVariants.includes('fill') ? `../../icons/phosphor/svg/fill/${iconName}.svg` : null,
        duotone: availableVariants.includes('duotone') ? `../../icons/phosphor/svg/duotone/${iconName}.svg` : null,
        thin: availableVariants.includes('thin') ? `../../icons/phosphor/svg/thin/${iconName}.svg` : null,
        light: availableVariants.includes('light') ? `../../icons/phosphor/svg/light/${iconName}.svg` : null
      }
    };
  });

  // Sort icons by name
  icons.sort((a, b) => a.name.localeCompare(b.name));

  const manifest = {
    generated: new Date().toISOString(),
    totalIcons: icons.length,
    variants: VARIANTS,
    icons: icons
  };

  // Ensure data directory exists
  const dataDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write manifest
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
  
  console.log(`✓ Generated manifest: ${OUTPUT_FILE}`);
  console.log(`  - ${manifest.totalIcons} icons`);
  console.log(`  - ${VARIANTS.length} variants: ${VARIANTS.join(', ')}`);
}

// Run if executed directly
if (require.main === module) {
  generateManifest();
}

module.exports = { generateManifest };

