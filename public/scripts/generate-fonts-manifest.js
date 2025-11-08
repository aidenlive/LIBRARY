/**
 * Generate Fonts Manifest
 * Scans typefaces directory and generates fonts.json manifest
 */

const fs = require('fs');
const path = require('path');

const TYPEFACES_DIR = path.join(__dirname, '../../typefaces');
const OUTPUT_FILE = path.join(__dirname, '../data/fonts.json');

/**
 * Extract font weight from filename
 */
function extractWeight(filename) {
  const lower = filename.toLowerCase();
  if (lower.includes('thin')) return '100';
  if (lower.includes('extralight') || lower.includes('extra-light')) return '200';
  if (lower.includes('light')) return '300';
  if (lower.includes('regular') || lower.includes('normal')) return '400';
  if (lower.includes('medium')) return '500';
  if (lower.includes('semibold') || lower.includes('semi-bold')) return '600';
  if (lower.includes('bold')) return '700';
  if (lower.includes('extrabold') || lower.includes('extra-bold')) return '800';
  if (lower.includes('black')) return '900';
  return '400'; // default
}

/**
 * Extract font style from filename
 */
function extractStyle(filename) {
  const lower = filename.toLowerCase();
  if (lower.includes('italic') || lower.includes('oblique')) {
    return 'italic';
  }
  return 'normal';
}

/**
 * Get font format from extension
 */
function getFormat(ext) {
  const extMap = {
    '.ttf': 'truetype',
    '.otf': 'opentype',
    '.woff': 'woff',
    '.woff2': 'woff2'
  };
  return extMap[ext.toLowerCase()] || 'truetype';
}

/**
 * Scan font family directory
 */
function scanFontFamily(familyDir, familyName) {
  const files = fs.readdirSync(familyDir);
  const fontFiles = [];

  files.forEach(file => {
    const filePath = path.join(familyDir, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile()) {
      const ext = path.extname(file);
      if (['.ttf', '.otf', '.woff', '.woff2'].includes(ext)) {
        const baseName = path.basename(file, ext);
        const weight = extractWeight(baseName);
        const style = extractStyle(baseName);
        const format = getFormat(ext);

        fontFiles.push({
          name: file,
          baseName: baseName,
          weight: weight,
          style: style,
          format: format,
          path: `../../typefaces/${familyName}/${file}`,
          size: stat.size
        });
      }
    }
  });

  return fontFiles;
}

/**
 * Generate fonts manifest
 */
function generateManifest() {
  console.log('Generating fonts manifest...');
  console.log(`Scanning: ${TYPEFACES_DIR}`);

  if (!fs.existsSync(TYPEFACES_DIR)) {
    console.error(`Typefaces directory not found: ${TYPEFACES_DIR}`);
    process.exit(1);
  }

  const families = [];
  const entries = fs.readdirSync(TYPEFACES_DIR, { withFileTypes: true });

  entries.forEach(entry => {
    if (entry.isDirectory()) {
      const familyName = entry.name;
      const familyDir = path.join(TYPEFACES_DIR, familyName);
      
      try {
        const files = scanFontFamily(familyDir, familyName);
        
        if (files.length > 0) {
          families.push({
            name: familyName,
            slug: familyName.toLowerCase().replace(/\s+/g, '-'),
            directory: familyName,
            files: files,
            fileCount: files.length
          });
        }
      } catch (err) {
        console.warn(`Error scanning ${familyName}:`, err.message);
      }
    }
  });

  // Sort families by name
  families.sort((a, b) => a.name.localeCompare(b.name));

  const manifest = {
    generated: new Date().toISOString(),
    totalFamilies: families.length,
    totalFiles: families.reduce((sum, f) => sum + f.fileCount, 0),
    families: families
  };

  // Ensure data directory exists
  const dataDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write manifest
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
  
  console.log(`✓ Generated manifest: ${OUTPUT_FILE}`);
  console.log(`  - ${manifest.totalFamilies} font families`);
  console.log(`  - ${manifest.totalFiles} font files`);
}

// Run if executed directly
if (require.main === module) {
  generateManifest();
}

module.exports = { generateManifest };

