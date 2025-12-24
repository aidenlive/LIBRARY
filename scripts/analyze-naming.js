#!/usr/bin/env node

/**
 * Font Naming Analysis Script
 * Analyzes naming patterns and generates standardization mapping
 * Does NOT rename files - only generates a report and mapping
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TYPEFACES_DIR = path.join(__dirname, '../typefaces');
const OUTPUT_FILE = path.join(__dirname, '../data/naming-analysis.json');
const CORRECTIONS_FILE = path.join(__dirname, '../data/corrections-mapping.json');

// Standard weight names
const STANDARD_WEIGHTS = [
  'Thin',
  'ExtraLight',
  'Light',
  'Regular',
  'Medium',
  'SemiBold',
  'Bold',
  'ExtraBold',
  'Black'
];

// Non-standard weight mappings
const WEIGHT_CORRECTIONS = {
  'Semi': 'SemiBold',
  'Huge': 'ExtraBold',
  'Heavy': 'Black',
  'Air': 'Thin',
  'Ultra': 'Black'
};

// Style names
const STANDARD_STYLES = ['Italic', 'Oblique'];

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

      families.push({
        directory: entry.name,
        path: familyPath,
        files: fontFiles
      });
    }
  }

  return families;
}

/**
 * Parse font filename to extract components
 */
function parseFilename(filename) {
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);

  // Split by hyphen or space
  const parts = basename.split(/[-\s]+/);

  // First part is typically the family name
  const familyName = parts[0];

  // Rest are weight and style
  const weightAndStyle = parts.slice(1);

  return {
    original: filename,
    basename,
    extension: ext,
    familyName,
    weightAndStyle,
    parts
  };
}

/**
 * Detect naming pattern
 */
function detectNamingPattern(filename) {
  const parsed = parseFilename(filename);

  // Check for various patterns
  if (filename.includes('-') && !filename.includes(' ')) {
    // Check if style is hyphenated or CamelCase
    const stylePattern = parsed.weightAndStyle.join('-');
    if (stylePattern.match(/[A-Z][a-z]+-[A-Z][a-z]+/)) {
      return 'hyphenated'; // e.g., Bold-Italic
    } else if (stylePattern.match(/[A-Z][a-z]+[A-Z][a-z]+/)) {
      return 'camelCase'; // e.g., BoldItalic
    }
    return 'hyphenated';
  }

  if (filename.includes(' ')) {
    return 'spaces'; // Problematic!
  }

  return 'single'; // Single variant, no weight/style
}

/**
 * Check for naming issues
 */
function checkNamingIssues(family) {
  const issues = [];

  // Check if directory name matches file prefix
  const filesPrefixes = family.files.map(f => parseFilename(f).familyName);
  const uniquePrefixes = [...new Set(filesPrefixes)];

  if (uniquePrefixes.length > 1) {
    issues.push({
      type: 'prefix_mismatch',
      severity: 'high',
      description: `Directory "${family.directory}" contains files with different prefixes: ${uniquePrefixes.join(', ')}`,
      files: family.files
    });
  } else if (uniquePrefixes.length === 1 && uniquePrefixes[0] !== family.directory) {
    issues.push({
      type: 'directory_file_mismatch',
      severity: 'high',
      description: `Directory "${family.directory}" does not match file prefix "${uniquePrefixes[0]}"`,
      files: family.files
    });
  }

  // Check for spaces in filenames
  const filesWithSpaces = family.files.filter(f => f.includes(' '));
  if (filesWithSpaces.length > 0) {
    issues.push({
      type: 'spaces_in_filename',
      severity: 'high',
      description: 'Filenames contain spaces (problematic for URLs)',
      files: filesWithSpaces
    });
  }

  // Check for non-standard weights
  for (const file of family.files) {
    const parsed = parseFilename(file);
    for (const part of parsed.weightAndStyle) {
      if (WEIGHT_CORRECTIONS[part]) {
        issues.push({
          type: 'non_standard_weight',
          severity: 'medium',
          description: `Non-standard weight "${part}" should be "${WEIGHT_CORRECTIONS[part]}"`,
          file,
          suggestion: file.replace(part, WEIGHT_CORRECTIONS[part])
        });
      }
    }
  }

  // Check naming pattern consistency within family
  const patterns = family.files.map(f => detectNamingPattern(f));
  const uniquePatterns = [...new Set(patterns)];
  if (uniquePatterns.length > 1) {
    issues.push({
      type: 'inconsistent_pattern',
      severity: 'medium',
      description: `Inconsistent naming patterns: ${uniquePatterns.join(', ')}`,
      files: family.files
    });
  }

  return issues;
}

/**
 * Generate standardized filename
 */
function generateStandardFilename(filename, familyName) {
  const parsed = parseFilename(filename);
  const ext = parsed.extension;

  // If single file, assume Regular
  if (parsed.weightAndStyle.length === 0) {
    return `${familyName}-Regular${ext}`;
  }

  // Build standardized name
  let weight = 'Regular';
  let style = '';

  for (const part of parsed.weightAndStyle) {
    // Check if it's a weight
    if (STANDARD_WEIGHTS.includes(part)) {
      weight = part;
    } else if (WEIGHT_CORRECTIONS[part]) {
      weight = WEIGHT_CORRECTIONS[part];
    } else if (STANDARD_STYLES.includes(part)) {
      style = part;
    } else if (part.toLowerCase() === 'italic' || part.toLowerCase() === 'oblique') {
      style = 'Italic'; // Normalize to Italic
    }
  }

  // Build filename
  let standardName = `${familyName}-${weight}`;
  if (style) {
    standardName += `-${style}`;
  }
  standardName += ext;

  return standardName;
}

/**
 * Generate corrections mapping
 */
function generateCorrectionsMapping(families, allIssues) {
  const corrections = {
    metadata: {
      generated: new Date().toISOString(),
      totalFamilies: families.length,
      familiesWithIssues: allIssues.filter(i => i.issues.length > 0).length
    },
    weightMappings: WEIGHT_CORRECTIONS,
    styleMappings: {
      'Oblique': 'Italic' // Note: Should be verified case-by-case
    },
    familyCorrections: []
  };

  for (const issueSet of allIssues) {
    if (issueSet.issues.length === 0) continue;

    const family = families.find(f => f.directory === issueSet.family);
    const fileCorrections = [];

    for (const file of family.files) {
      const standardName = generateStandardFilename(file, issueSet.family);
      if (file !== standardName) {
        fileCorrections.push({
          original: file,
          standardized: standardName,
          action: 'rename'
        });
      }
    }

    if (fileCorrections.length > 0) {
      corrections.familyCorrections.push({
        family: issueSet.family,
        directory: family.directory,
        issues: issueSet.issues,
        corrections: fileCorrections
      });
    }
  }

  return corrections;
}

/**
 * Main execution
 */
async function main() {
  console.log(`${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}  Font Naming Analysis${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Create data directory
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

  // Scan families
  console.log(`${colors.gray}Scanning font families...${colors.reset}`);
  const families = await scanFamilies();
  console.log(`${colors.green}✓ Found ${families.length} font families${colors.reset}\n`);

  // Analyze naming issues
  console.log(`${colors.yellow}Analyzing naming patterns...${colors.reset}\n`);
  const allIssues = [];
  let totalIssues = 0;

  for (const family of families) {
    const issues = checkNamingIssues(family);
    if (issues.length > 0) {
      allIssues.push({
        family: family.directory,
        issues
      });
      totalIssues += issues.length;
    }
  }

  console.log(`${colors.green}✓ Analysis complete${colors.reset}\n`);

  // Generate corrections mapping
  console.log(`${colors.yellow}Generating corrections mapping...${colors.reset}`);
  const correctionsMapping = generateCorrectionsMapping(families, allIssues);
  console.log(`${colors.green}✓ Generated corrections for ${correctionsMapping.familyCorrections.length} families${colors.reset}\n`);

  // Write analysis report
  const analysisReport = {
    metadata: {
      generated: new Date().toISOString(),
      totalFamilies: families.length,
      familiesWithIssues: allIssues.length,
      totalIssues
    },
    issues: allIssues
  };

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(analysisReport, null, 2));
  console.log(`${colors.green}✓ Saved analysis to ${OUTPUT_FILE}${colors.reset}`);

  // Write corrections mapping
  await fs.writeFile(CORRECTIONS_FILE, JSON.stringify(correctionsMapping, null, 2));
  console.log(`${colors.green}✓ Saved corrections mapping to ${CORRECTIONS_FILE}${colors.reset}\n`);

  // Display summary
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}  Summary${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  console.log(`  Total Families:         ${colors.bright}${families.length}${colors.reset}`);
  console.log(`  Families with Issues:   ${colors.bright}${allIssues.length}${colors.reset}`);
  console.log(`  Total Issues Found:     ${colors.bright}${totalIssues}${colors.reset}`);
  console.log(`  Files to Rename:        ${colors.bright}${correctionsMapping.familyCorrections.reduce((sum, f) => sum + f.corrections.length, 0)}${colors.reset}`);

  // Issue breakdown
  const issueTypes = {};
  for (const issueSet of allIssues) {
    for (const issue of issueSet.issues) {
      issueTypes[issue.type] = (issueTypes[issue.type] || 0) + 1;
    }
  }

  console.log(`\n  ${colors.gray}Issue Breakdown:${colors.reset}`);
  for (const [type, count] of Object.entries(issueTypes).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${type.padEnd(30)} ${count}`);
  }

  // Show sample issues
  if (allIssues.length > 0) {
    console.log(`\n  ${colors.gray}Sample Issues:${colors.reset}\n`);
    for (const issueSet of allIssues.slice(0, 5)) {
      console.log(`  ${colors.yellow}${issueSet.family}${colors.reset}`);
      for (const issue of issueSet.issues.slice(0, 2)) {
        console.log(`    ${colors.red}•${colors.reset} ${issue.description}`);
        if (issue.suggestion) {
          console.log(`      ${colors.gray}→ ${issue.suggestion}${colors.reset}`);
        }
      }
      console.log();
    }
  }

  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  console.log(`${colors.green}✓ Analysis complete!${colors.reset}`);
  console.log(`${colors.gray}Review the reports in the data/ directory${colors.reset}\n`);
}

main().catch(error => {
  console.error(`${colors.red}✗ Fatal error:${colors.reset}`, error);
  process.exit(1);
});
