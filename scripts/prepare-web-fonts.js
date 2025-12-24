#!/usr/bin/env node

/**
 * Web Font Preparation Script
 * Prepares font metadata and directory structure for web format conversion
 *
 * This script prepares the groundwork for Phase 2, generating:
 * - Directory structure for web fonts
 * - Conversion queue with file mappings
 * - Size analysis and compression estimates
 *
 * Actual WOFF2/WOFF conversion requires fonttools (Python)
 * See: scripts/convert-to-web-formats.sh
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TYPEFACES_DIR = path.join(__dirname, '../typefaces');
const WEB_DIR = path.join(__dirname, '../typefaces-web');
const QUEUE_FILE = path.join(__dirname, '../data/conversion-queue.json');
const ANALYSIS_FILE = path.join(__dirname, '../data/web-fonts-analysis.json');

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
 * Get file size in bytes
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
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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
        const fileDetails = [];
        let totalSize = 0;

        for (const file of fontFiles) {
          const filePath = path.join(familyPath, file);
          const size = await getFileSize(filePath);
          totalSize += size;

          fileDetails.push({
            filename: file,
            path: filePath,
            size,
            format: file.endsWith('.ttf') ? 'ttf' : 'otf'
          });
        }

        families.push({
          name: entry.name,
          path: familyPath,
          files: fileDetails,
          totalSize,
          fileCount: fontFiles.length
        });
      }
    }
  }

  return families;
}

/**
 * Generate conversion queue
 */
function generateConversionQueue(families) {
  const queue = [];

  for (const family of families) {
    for (const file of family.files) {
      const basename = path.basename(file.filename, path.extname(file.filename));

      queue.push({
        family: family.name,
        source: {
          path: file.path,
          filename: file.filename,
          format: file.format,
          size: file.size
        },
        targets: [
          {
            format: 'woff2',
            filename: `${basename}.woff2`,
            path: path.join(WEB_DIR, family.name, `${basename}.woff2`),
            estimatedSize: Math.round(file.size * 0.7), // WOFF2 typically 30% smaller
            priority: 'high'
          },
          {
            format: 'woff',
            filename: `${basename}.woff`,
            path: path.join(WEB_DIR, family.name, `${basename}.woff`),
            estimatedSize: Math.round(file.size * 0.8), // WOFF typically 20% smaller
            priority: 'medium'
          }
        ]
      });
    }
  }

  return queue;
}

/**
 * Analyze size impact
 */
function analyzeSizeImpact(families, queue) {
  const totalOriginalSize = families.reduce((sum, f) => sum + f.totalSize, 0);
  const totalWoff2Size = queue.reduce((sum, item) => sum + item.targets[0].estimatedSize, 0);
  const totalWoffSize = queue.reduce((sum, item) => sum + item.targets[1].estimatedSize, 0);

  return {
    original: {
      size: totalOriginalSize,
      formatted: formatBytes(totalOriginalSize),
      files: queue.length
    },
    woff2: {
      size: totalWoff2Size,
      formatted: formatBytes(totalWoff2Size),
      files: queue.length,
      savingsVsOriginal: ((totalOriginalSize - totalWoff2Size) / totalOriginalSize * 100).toFixed(1) + '%'
    },
    woff: {
      size: totalWoffSize,
      formatted: formatBytes(totalWoffSize),
      files: queue.length,
      savingsVsOriginal: ((totalOriginalSize - totalWoffSize) / totalOriginalSize * 100).toFixed(1) + '%'
    },
    combined: {
      size: totalWoff2Size + totalWoffSize,
      formatted: formatBytes(totalWoff2Size + totalWoffSize),
      files: queue.length * 2
    },
    total: {
      size: totalOriginalSize + totalWoff2Size + totalWoffSize,
      formatted: formatBytes(totalOriginalSize + totalWoff2Size + totalWoffSize),
      files: queue.length * 3
    }
  };
}

/**
 * Create directory structure
 */
async function createDirectoryStructure(families) {
  console.log(`${colors.yellow}Creating directory structure...${colors.reset}`);

  await fs.mkdir(WEB_DIR, { recursive: true });

  for (const family of families) {
    const familyWebDir = path.join(WEB_DIR, family.name);
    await fs.mkdir(familyWebDir, { recursive: true });
  }

  console.log(`${colors.green}✓ Created ${families.length} family directories${colors.reset}\n`);
}

/**
 * Generate README for web fonts
 */
async function generateReadme(analysis) {
  const readme = `# Web Fonts Directory

This directory contains web-optimized font files (WOFF2 and WOFF formats).

## Overview

- **Total Families:** ${analysis.families}
- **Original Fonts:** ${analysis.sizeAnalysis.original.files} files (${analysis.sizeAnalysis.original.formatted})
- **WOFF2 Fonts:** ${analysis.sizeAnalysis.woff2.files} files (${analysis.sizeAnalysis.woff2.formatted})
- **WOFF Fonts:** ${analysis.sizeAnalysis.woff.files} files (${analysis.sizeAnalysis.woff.formatted})

## Format Support

### WOFF2 (Web Open Font Format 2)
- **Browser Support:** Chrome 36+, Firefox 39+, Safari 12+, Edge 14+
- **Compression:** ~30% better than WOFF, ~50% better than TTF/OTF
- **Priority:** Primary web format (serve first)

### WOFF (Web Open Font Format)
- **Browser Support:** Chrome 6+, Firefox 3.6+, Safari 5.1+, IE 9+
- **Compression:** ~20% better than TTF/OTF
- **Priority:** Fallback for older browsers

## Directory Structure

\`\`\`
typefaces-web/
├── Aeonik/
│   ├── Aeonik-Regular.woff2
│   ├── Aeonik-Regular.woff
│   ├── Aeonik-Bold.woff2
│   ├── Aeonik-Bold.woff
│   └── ...
├── Certia/
│   └── ...
└── ...
\`\`\`

## Conversion

Web fonts generated using:
- \`fonttools\` (Python) - Font manipulation
- \`brotli\` - WOFF2 compression

See \`scripts/convert-to-web-formats.sh\` for conversion script.

## Usage in CSS

\`\`\`css
@font-face {
  font-family: 'Aeonik';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('typefaces-web/Aeonik/Aeonik-Regular.woff2') format('woff2'),
       url('typefaces-web/Aeonik/Aeonik-Regular.woff') format('woff');
}
\`\`\`

## CDN Deployment

Once converted, these files will be deployed to:
- **CDN:** \`cdn.library.dev/fonts/\`
- **Cache:** 1 year (immutable)
- **Compression:** Brotli + Gzip

---

**Generated:** ${new Date().toISOString()}
**Status:** ${analysis.sizeAnalysis.woff2.files > 0 ? 'Converted' : 'Pending Conversion'}
`;

  await fs.writeFile(path.join(WEB_DIR, 'README.md'), readme);
}

/**
 * Main execution
 */
async function main() {
  console.log(`${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}  Web Font Preparation${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Scan fonts
  console.log(`${colors.gray}Scanning font families...${colors.reset}`);
  const families = await scanFonts();
  console.log(`${colors.green}✓ Found ${families.length} families with ${families.reduce((sum, f) => sum + f.fileCount, 0)} fonts${colors.reset}\n`);

  // Generate conversion queue
  console.log(`${colors.gray}Generating conversion queue...${colors.reset}`);
  const queue = generateConversionQueue(families);
  console.log(`${colors.green}✓ Queued ${queue.length} fonts for conversion${colors.reset}\n`);

  // Analyze size impact
  console.log(`${colors.gray}Analyzing size impact...${colors.reset}`);
  const sizeAnalysis = analyzeSizeImpact(families, queue);
  console.log(`${colors.green}✓ Size analysis complete${colors.reset}\n`);

  // Create directory structure
  await createDirectoryStructure(families);

  // Save conversion queue
  const queueData = {
    metadata: {
      generated: new Date().toISOString(),
      totalFamilies: families.length,
      totalFiles: queue.length,
      status: 'pending'
    },
    queue
  };

  await fs.mkdir(path.dirname(QUEUE_FILE), { recursive: true });
  await fs.writeFile(QUEUE_FILE, JSON.stringify(queueData, null, 2));
  console.log(`${colors.green}✓ Saved conversion queue to ${QUEUE_FILE}${colors.reset}`);

  // Save analysis
  const analysisData = {
    metadata: {
      generated: new Date().toISOString(),
      totalFamilies: families.length
    },
    families: families.map(f => ({
      name: f.name,
      fileCount: f.fileCount,
      totalSize: f.totalSize,
      totalSizeFormatted: formatBytes(f.totalSize)
    })),
    sizeAnalysis
  };

  await fs.writeFile(ANALYSIS_FILE, JSON.stringify(analysisData, null, 2));
  console.log(`${colors.green}✓ Saved analysis to ${ANALYSIS_FILE}${colors.reset}\n`);

  // Generate README
  await generateReadme(analysisData);
  console.log(`${colors.green}✓ Generated README for web fonts${colors.reset}\n`);

  // Display summary
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}  Size Analysis${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  console.log(`  ${colors.gray}Original Fonts:${colors.reset}`);
  console.log(`    Files:    ${colors.bright}${sizeAnalysis.original.files}${colors.reset}`);
  console.log(`    Size:     ${colors.bright}${sizeAnalysis.original.formatted}${colors.reset}\n`);

  console.log(`  ${colors.gray}WOFF2 (estimated):${colors.reset}`);
  console.log(`    Files:    ${colors.bright}${sizeAnalysis.woff2.files}${colors.reset}`);
  console.log(`    Size:     ${colors.bright}${sizeAnalysis.woff2.formatted}${colors.reset}`);
  console.log(`    Savings:  ${colors.green}${sizeAnalysis.woff2.savingsVsOriginal}${colors.reset}\n`);

  console.log(`  ${colors.gray}WOFF (estimated):${colors.reset}`);
  console.log(`    Files:    ${colors.bright}${sizeAnalysis.woff.files}${colors.reset}`);
  console.log(`    Size:     ${colors.bright}${sizeAnalysis.woff.formatted}${colors.reset}`);
  console.log(`    Savings:  ${colors.green}${sizeAnalysis.woff.savingsVsOriginal}${colors.reset}\n`);

  console.log(`  ${colors.gray}Total (all formats):${colors.reset}`);
  console.log(`    Files:    ${colors.bright}${sizeAnalysis.total.files}${colors.reset}`);
  console.log(`    Size:     ${colors.bright}${sizeAnalysis.total.formatted}${colors.reset}\n`);

  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  console.log(`${colors.green}✓ Preparation complete!${colors.reset}`);
  console.log(`${colors.yellow}⚠ Next step: Install fonttools and run conversion${colors.reset}`);
  console.log(`${colors.gray}  pip3 install --user fonttools brotli${colors.reset}`);
  console.log(`${colors.gray}  ./scripts/convert-to-web-formats.sh --sample${colors.reset}\n`);
}

main().catch(error => {
  console.error(`${colors.red}✗ Fatal error:${colors.reset}`, error);
  process.exit(1);
});
