#!/usr/bin/env node

/**
 * Font Naming Normalization Script
 * Applies standardized naming to font files based on corrections mapping
 *
 * Usage:
 *   node scripts/normalize-names.js --dry-run    # Preview changes without applying
 *   node scripts/normalize-names.js --execute    # Apply changes (with backup)
 *   node scripts/normalize-names.js --backup     # Create backup only
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TYPEFACES_DIR = path.join(__dirname, '../typefaces');
const CORRECTIONS_FILE = path.join(__dirname, '../data/corrections-mapping.json');
const BACKUP_DIR = path.join(__dirname, '../typefaces-backup');
const LOG_FILE = path.join(__dirname, '../data/normalization-log.json');

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

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    execute: args.includes('--execute'),
    backup: args.includes('--backup'),
    force: args.includes('--force')
  };
}

/**
 * Load corrections mapping
 */
async function loadCorrections() {
  try {
    const data = await fs.readFile(CORRECTIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Failed to load corrections mapping: ${error.message}`);
  }
}

/**
 * Create backup of typefaces directory
 */
async function createBackup() {
  console.log(`\n${colors.yellow}Creating backup...${colors.reset}`);

  try {
    // Check if backup already exists
    try {
      await fs.access(BACKUP_DIR);
      console.log(`${colors.yellow}⚠ Backup directory already exists: ${BACKUP_DIR}${colors.reset}`);

      const args = parseArgs();
      if (!args.force) {
        console.log(`${colors.gray}Use --force to overwrite existing backup${colors.reset}`);
        return false;
      }

      console.log(`${colors.yellow}Removing existing backup...${colors.reset}`);
      await fs.rm(BACKUP_DIR, { recursive: true });
    } catch {
      // Backup doesn't exist, continue
    }

    // Copy typefaces to backup
    await copyDirectory(TYPEFACES_DIR, BACKUP_DIR);
    console.log(`${colors.green}✓ Backup created at ${BACKUP_DIR}${colors.reset}\n`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Backup failed: ${error.message}${colors.reset}`);
    return false;
  }
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
 * Validate that original files exist
 */
async function validateCorrections(corrections) {
  console.log(`${colors.yellow}Validating corrections...${colors.reset}`);

  const errors = [];
  let validCount = 0;

  for (const familyCorrection of corrections.familyCorrections) {
    const familyPath = path.join(TYPEFACES_DIR, familyCorrection.directory);

    // Check if directory exists
    try {
      await fs.access(familyPath);
    } catch {
      errors.push({
        family: familyCorrection.family,
        error: `Directory not found: ${familyPath}`
      });
      continue;
    }

    // Check if files exist
    for (const correction of familyCorrection.corrections) {
      const originalPath = path.join(familyPath, correction.original);
      try {
        await fs.access(originalPath);
        validCount++;
      } catch {
        errors.push({
          family: familyCorrection.family,
          file: correction.original,
          error: 'File not found'
        });
      }
    }
  }

  if (errors.length > 0) {
    console.log(`${colors.red}✗ Validation found ${errors.length} errors${colors.reset}\n`);
    for (const error of errors.slice(0, 10)) {
      console.log(`  ${colors.red}•${colors.reset} ${error.family}: ${error.error}`);
    }
    if (errors.length > 10) {
      console.log(`  ${colors.gray}... and ${errors.length - 10} more${colors.reset}`);
    }
    return false;
  }

  console.log(`${colors.green}✓ Validated ${validCount} files${colors.reset}\n`);
  return true;
}

/**
 * Preview changes
 */
async function previewChanges(corrections) {
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}  Preview Changes (Dry Run)${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  let totalChanges = 0;

  for (const familyCorrection of corrections.familyCorrections.slice(0, 10)) {
    console.log(`${colors.yellow}${familyCorrection.family}${colors.reset} (${familyCorrection.corrections.length} changes)`);

    for (const correction of familyCorrection.corrections.slice(0, 3)) {
      console.log(`  ${colors.gray}${correction.original}${colors.reset}`);
      console.log(`  ${colors.green}→ ${correction.standardized}${colors.reset}\n`);
      totalChanges++;
    }

    if (familyCorrection.corrections.length > 3) {
      console.log(`  ${colors.gray}... and ${familyCorrection.corrections.length - 3} more${colors.reset}\n`);
      totalChanges += familyCorrection.corrections.length - 3;
    }
  }

  const totalFamilies = corrections.familyCorrections.length;
  const totalFiles = corrections.familyCorrections.reduce((sum, f) => sum + f.corrections.length, 0);

  if (totalFamilies > 10) {
    console.log(`${colors.gray}... and ${totalFamilies - 10} more families${colors.reset}\n`);
  }

  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}  Summary${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  console.log(`  Total Families:         ${colors.bright}${totalFamilies}${colors.reset}`);
  console.log(`  Total Files to Rename:  ${colors.bright}${totalFiles}${colors.reset}`);
  console.log(`\n${colors.gray}Run with --execute to apply changes${colors.reset}\n`);
}

/**
 * Apply normalization
 */
async function applyNormalization(corrections) {
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}  Applying Normalization${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  const log = {
    timestamp: new Date().toISOString(),
    totalFamilies: corrections.familyCorrections.length,
    totalFiles: 0,
    successful: [],
    failed: []
  };

  let successCount = 0;
  let failureCount = 0;

  for (const familyCorrection of corrections.familyCorrections) {
    const familyPath = path.join(TYPEFACES_DIR, familyCorrection.directory);

    console.log(`${colors.yellow}Processing ${familyCorrection.family}...${colors.reset}`);

    for (const correction of familyCorrection.corrections) {
      const originalPath = path.join(familyPath, correction.original);
      const newPath = path.join(familyPath, correction.standardized);

      try {
        // Check if target already exists
        try {
          await fs.access(newPath);
          console.log(`  ${colors.red}✗ Target exists: ${correction.standardized}${colors.reset}`);
          log.failed.push({
            family: familyCorrection.family,
            original: correction.original,
            target: correction.standardized,
            error: 'Target file already exists'
          });
          failureCount++;
          continue;
        } catch {
          // Target doesn't exist, good to proceed
        }

        // Rename file
        await fs.rename(originalPath, newPath);
        console.log(`  ${colors.green}✓ ${correction.original} → ${correction.standardized}${colors.reset}`);

        log.successful.push({
          family: familyCorrection.family,
          original: correction.original,
          standardized: correction.standardized
        });
        successCount++;
        log.totalFiles++;
      } catch (error) {
        console.log(`  ${colors.red}✗ Failed: ${correction.original} - ${error.message}${colors.reset}`);
        log.failed.push({
          family: familyCorrection.family,
          original: correction.original,
          target: correction.standardized,
          error: error.message
        });
        failureCount++;
      }
    }

    console.log();
  }

  // Save log
  await fs.writeFile(LOG_FILE, JSON.stringify(log, null, 2));

  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}  Results${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  console.log(`  ${colors.green}Successful: ${successCount}${colors.reset}`);
  console.log(`  ${colors.red}Failed:     ${failureCount}${colors.reset}`);
  console.log(`\n${colors.gray}Log saved to ${LOG_FILE}${colors.reset}\n`);

  if (failureCount > 0) {
    console.log(`${colors.yellow}⚠ Some operations failed. Review the log for details.${colors.reset}\n`);
  } else {
    console.log(`${colors.green}✓ All files renamed successfully!${colors.reset}\n`);
  }

  return log;
}

/**
 * Main execution
 */
async function main() {
  const args = parseArgs();

  console.log(`${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}  Font Naming Normalization${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Load corrections
  console.log(`${colors.gray}Loading corrections mapping...${colors.reset}`);
  const corrections = await loadCorrections();
  console.log(`${colors.green}✓ Loaded corrections for ${corrections.familyCorrections.length} families${colors.reset}\n`);

  // Validate
  const isValid = await validateCorrections(corrections);
  if (!isValid) {
    console.log(`${colors.red}✗ Validation failed. Aborting.${colors.reset}\n`);
    process.exit(1);
  }

  // Handle different modes
  if (args.backup) {
    await createBackup();
    return;
  }

  if (args.dryRun || (!args.execute && !args.backup)) {
    await previewChanges(corrections);
    return;
  }

  if (args.execute) {
    // Create backup before executing
    console.log(`${colors.yellow}⚠ About to rename ${corrections.familyCorrections.reduce((sum, f) => sum + f.corrections.length, 0)} files${colors.reset}`);
    console.log(`${colors.gray}Creating backup first...${colors.reset}`);

    const backupSuccess = await createBackup();
    if (!backupSuccess) {
      console.log(`${colors.red}✗ Cannot proceed without backup. Aborting.${colors.reset}\n`);
      process.exit(1);
    }

    // Apply normalization
    await applyNormalization(corrections);
  }
}

main().catch(error => {
  console.error(`${colors.red}✗ Fatal error:${colors.reset}`, error);
  process.exit(1);
});
