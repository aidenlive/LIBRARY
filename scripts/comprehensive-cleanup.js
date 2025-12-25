#!/usr/bin/env node

/**
 * Comprehensive Font Repository Cleanup Script
 *
 * Fixes ALL naming issues in one pass:
 * 1. Remove spaces from filenames
 * 2. Convert Oblique → Italic
 * 3. Standardize weight names (Heavy/Huge/Ultra → Black/ExtraBold)
 * 4. Fix directory names with spaces
 * 5. Ensure FamilyName-Weight-Style pattern
 *
 * Usage:
 *   node scripts/comprehensive-cleanup.js --dry-run   # Preview changes
 *   node scripts/comprehensive-cleanup.js --execute   # Apply changes with backup
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TYPEFACES_DIR = path.join(__dirname, '../typefaces');
const BACKUP_DIR = path.join(__dirname, '../typefaces-backup');
const LOG_FILE = path.join(__dirname, '../data/cleanup-log.json');

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

// Weight mappings
const WEIGHT_MAP = {
  'Semi': 'SemiBold',
  'Huge': 'ExtraBold',
  'Heavy': 'Black',
  'Ultra': 'Black',
  'Air': 'Thin'
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    execute: args.includes('--execute'),
    force: args.includes('--force')
  };
}

/**
 * Standardize filename
 */
function standardizeName(filename, familyName) {
  let name = filename;

  // Replace spaces with hyphens
  name = name.replace(/\s+/g, '-');

  // Replace Oblique with Italic
  name = name.replace(/Oblique/g, 'Italic');

  // Fix weight names
  for (const [oldWeight, newWeight] of Object.entries(WEIGHT_MAP)) {
    const regex = new RegExp(`-${oldWeight}(-|\\.)`, 'g');
    name = name.replace(regex, `-${newWeight}$1`);
  }

  // Ensure it starts with family name
  const ext = path.extname(name);
  const basename = path.basename(name, ext);

  if (!basename.startsWith(familyName)) {
    // File doesn't start with family name, add it
    name = `${familyName}-${basename}${ext}`;
  }

  return name;
}

/**
 * Standardize directory name
 */
function standardizeDirName(dirname) {
  return dirname.replace(/\s+/g, '').trim();
}

/**
 * Recursively copy directory
 */
async function copyDirectory(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Create backup
 */
async function createBackup(force = false) {
  console.log(`\n${colors.yellow}Creating backup...${colors.reset}`);

  try {
    // Check if backup exists
    try {
      await fs.access(BACKUP_DIR);
      if (!force) {
        console.log(`${colors.yellow}⚠ Backup already exists. Use --force to overwrite${colors.reset}`);
        return false;
      }
      console.log(`${colors.yellow}Removing existing backup...${colors.reset}`);
      await fs.rm(BACKUP_DIR, { recursive: true });
    } catch {
      // No existing backup
    }

    await copyDirectory(TYPEFACES_DIR, BACKUP_DIR);
    const stats = await fs.stat(BACKUP_DIR);
    console.log(`${colors.green}✓ Backup created at ${BACKUP_DIR}${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Backup failed: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Scan for issues
 */
async function scanIssues() {
  const issues = {
    directoriesWithSpaces: [],
    filesWithSpaces: [],
    filesWithOblique: [],
    filesWithNonStandardWeights: [],
    total: 0
  };

  const families = await fs.readdir(TYPEFACES_DIR, { withFileTypes: true });

  for (const family of families) {
    if (!family.isDirectory()) continue;

    const familyName = family.name;
    const familyPath = path.join(TYPEFACES_DIR, familyName);

    // Check directory name
    if (familyName.includes(' ') || familyName !== familyName.trim()) {
      issues.directoriesWithSpaces.push(familyName);
    }

    // Check files
    const files = await fs.readdir(familyPath);
    const fontFiles = files.filter(f => f.endsWith('.ttf') || f.endsWith('.otf'));

    for (const file of fontFiles) {
      const needsChange = [];

      if (file.includes(' ')) {
        needsChange.push('spaces');
        issues.filesWithSpaces.push({ family: familyName, file });
      }

      if (file.includes('Oblique')) {
        needsChange.push('oblique');
        issues.filesWithOblique.push({ family: familyName, file });
      }

      for (const oldWeight of Object.keys(WEIGHT_MAP)) {
        if (file.includes(`-${oldWeight}-`) || file.includes(`-${oldWeight}.`)) {
          needsChange.push('weight');
          issues.filesWithNonStandardWeights.push({ family: familyName, file, weight: oldWeight });
          break;
        }
      }

      if (needsChange.length > 0) {
        issues.total++;
      }
    }
  }

  return issues;
}

/**
 * Apply cleanup
 */
async function applyCleanup() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}  Applying Comprehensive Cleanup${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  const log = {
    timestamp: new Date().toISOString(),
    directoriesRenamed: [],
    filesRenamed: [],
    errors: []
  };

  const families = await fs.readdir(TYPEFACES_DIR, { withFileTypes: true });

  // Step 1: Rename directories with spaces
  console.log(`${colors.yellow}Step 1: Cleaning directory names...${colors.reset}`);
  for (const family of families) {
    if (!family.isDirectory()) continue;

    const oldName = family.name;
    const newName = standardizeDirName(oldName);

    if (oldName !== newName) {
      const oldPath = path.join(TYPEFACES_DIR, oldName);
      const newPath = path.join(TYPEFACES_DIR, newName);

      try {
        await fs.rename(oldPath, newPath);
        console.log(`  ${colors.green}✓ ${oldName} → ${newName}${colors.reset}`);
        log.directoriesRenamed.push({ old: oldName, new: newName });
      } catch (error) {
        console.log(`  ${colors.red}✗ Failed: ${oldName} - ${error.message}${colors.reset}`);
        log.errors.push({ type: 'directory', name: oldName, error: error.message });
      }
    }
  }

  // Step 2: Rename files
  console.log(`\n${colors.yellow}Step 2: Cleaning filenames...${colors.reset}`);
  const updatedFamilies = await fs.readdir(TYPEFACES_DIR, { withFileTypes: true });

  for (const family of updatedFamilies) {
    if (!family.isDirectory()) continue;

    const familyName = family.name;
    const familyPath = path.join(TYPEFACES_DIR, familyName);
    const files = await fs.readdir(familyPath);
    const fontFiles = files.filter(f => f.endsWith('.ttf') || f.endsWith('.otf'));

    for (const oldFile of fontFiles) {
      const newFile = standardizeName(oldFile, familyName);

      if (oldFile !== newFile) {
        const oldPath = path.join(familyPath, oldFile);
        const newPath = path.join(familyPath, newFile);

        try {
          // Check if target exists
          try {
            await fs.access(newPath);
            console.log(`  ${colors.red}✗ Target exists: ${familyName}/${newFile}${colors.reset}`);
            log.errors.push({ type: 'file', family: familyName, file: oldFile, error: 'Target exists' });
            continue;
          } catch {
            // Target doesn't exist, proceed
          }

          await fs.rename(oldPath, newPath);
          console.log(`  ${colors.green}✓ ${familyName}/${oldFile}${colors.reset}`);
          console.log(`    ${colors.gray}→ ${newFile}${colors.reset}`);
          log.filesRenamed.push({ family: familyName, old: oldFile, new: newFile });
        } catch (error) {
          console.log(`  ${colors.red}✗ Failed: ${familyName}/${oldFile} - ${error.message}${colors.reset}`);
          log.errors.push({ type: 'file', family: familyName, file: oldFile, error: error.message });
        }
      }
    }
  }

  // Save log
  await fs.writeFile(LOG_FILE, JSON.stringify(log, null, 2));

  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}  Results${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  console.log(`  ${colors.green}Directories renamed: ${log.directoriesRenamed.length}${colors.reset}`);
  console.log(`  ${colors.green}Files renamed:       ${log.filesRenamed.length}${colors.reset}`);
  console.log(`  ${colors.red}Errors:              ${log.errors.length}${colors.reset}`);
  console.log(`\n${colors.gray}Log saved to ${LOG_FILE}${colors.reset}\n`);

  return log;
}

/**
 * Preview changes
 */
async function previewChanges(issues) {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}  Preview: Comprehensive Cleanup${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  console.log(`${colors.yellow}Directories with spaces (${issues.directoriesWithSpaces.length}):${colors.reset}`);
  for (const dir of issues.directoriesWithSpaces.slice(0, 5)) {
    console.log(`  "${dir}" → "${standardizeDirName(dir)}"`);
  }
  if (issues.directoriesWithSpaces.length > 5) {
    console.log(`  ${colors.gray}... and ${issues.directoriesWithSpaces.length - 5} more${colors.reset}`);
  }

  console.log(`\n${colors.yellow}Files with spaces (${issues.filesWithSpaces.length}):${colors.reset}`);
  for (const item of issues.filesWithSpaces.slice(0, 5)) {
    console.log(`  ${item.family}/${item.file}`);
    console.log(`  ${colors.gray}→ ${standardizeName(item.file, item.family)}${colors.reset}\n`);
  }
  if (issues.filesWithSpaces.length > 5) {
    console.log(`  ${colors.gray}... and ${issues.filesWithSpaces.length - 5} more${colors.reset}`);
  }

  console.log(`\n${colors.yellow}Files with Oblique (${issues.filesWithOblique.length}):${colors.reset}`);
  for (const item of issues.filesWithOblique.slice(0, 5)) {
    console.log(`  ${item.family}/${item.file}`);
    console.log(`  ${colors.gray}→ ${standardizeName(item.file, item.family)}${colors.reset}\n`);
  }
  if (issues.filesWithOblique.length > 5) {
    console.log(`  ${colors.gray}... and ${issues.filesWithOblique.length - 5} more${colors.reset}`);
  }

  console.log(`\n${colors.yellow}Files with non-standard weights (${issues.filesWithNonStandardWeights.length}):${colors.reset}`);
  for (const item of issues.filesWithNonStandardWeights.slice(0, 5)) {
    console.log(`  ${item.family}/${item.file} (${item.weight})`);
    console.log(`  ${colors.gray}→ ${standardizeName(item.file, item.family)}${colors.reset}\n`);
  }
  if (issues.filesWithNonStandardWeights.length > 5) {
    console.log(`  ${colors.gray}... and ${issues.filesWithNonStandardWeights.length - 5} more${colors.reset}`);
  }

  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}  Summary${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  console.log(`  Total items to fix: ${colors.bright}${issues.total}${colors.reset}`);
  console.log(`\n${colors.gray}Run with --execute to apply changes${colors.reset}\n`);
}

/**
 * Main execution
 */
async function main() {
  const args = parseArgs();

  console.log(`${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}  Comprehensive Font Repository Cleanup${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Scan for issues
  console.log(`${colors.gray}Scanning for naming issues...${colors.reset}`);
  const issues = await scanIssues();
  console.log(`${colors.green}✓ Found ${issues.total} items requiring cleanup${colors.reset}\n`);

  if (args.execute) {
    // Create backup
    const backupSuccess = await createBackup(args.force);
    if (!backupSuccess && !args.force) {
      console.log(`${colors.red}✗ Cannot proceed without backup${colors.reset}\n`);
      process.exit(1);
    }

    // Apply cleanup
    await applyCleanup();
  } else {
    // Preview only
    await previewChanges(issues);
  }
}

main().catch(error => {
  console.error(`${colors.red}✗ Fatal error:${colors.reset}`, error);
  process.exit(1);
});
