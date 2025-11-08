# Phosphor Icons Scripts

Scripts for generating and managing Phosphor Icons across all platforms (Web, React, Swift/iOS).

## Overview

This directory contains automation scripts for:
- **React**: Generate TypeScript React components from SVG files
- **Swift/iOS**: Convert SVG files to PDF format for Xcode Asset Catalogs
- **Web**: Optimize SVG files for web use

## Scripts

### React Scripts

#### `generate-react-components.js`
Generates TypeScript React components from SVG files.

**Usage:**
```bash
node generate-react-components.js
```

**What it does:**
- Reads SVG files from `../../phosphor/svg/`
- Generates React components in `../../phosphor/react/`
- Creates components with proper TypeScript types
- Supports all variants (regular, bold, fill, duotone, thin, light)

**Output:**
- Individual component files: `IconNameVariant.tsx`
- Components use `React.forwardRef` for ref forwarding
- All components accept standard SVG props

#### `generate-react-index.js`
Generates barrel export index files for React components.

**Usage:**
```bash
node generate-react-index.js
```

**What it does:**
- Creates `index.ts` files for each variant directory
- Creates main `index.ts` file for all variants
- Enables clean imports like `import { Regular, Bold } from '@library/icons/phosphor/react'`

**Output:**
- `react/<variant>/index.ts` - Variant-specific exports
- `react/index.ts` - Main barrel export

### Swift/iOS Scripts

#### `generate-swift-assets.js`
Converts SVG files to PDF format for Xcode Asset Catalogs.

**Usage:**
```bash
# Process all variants
node generate-swift-assets.js

# Process specific variant
node generate-swift-assets.js --variant regular

# Custom output directory
node generate-swift-assets.js --output ./custom/path
```

**Requirements:**
- ImageMagick (install via `brew install imagemagick`)
- Or use manual conversion tools

**What it does:**
- Converts SVG files to PDF format
- Organizes by variant in output directory
- Creates assets ready for Xcode Asset Catalogs

**Output:**
- PDF files in `../../phosphor/swift/assets/<variant>/`
- Files named: `icon-name.pdf`

**Next Steps:**
1. Open Xcode project
2. Drag PDF files into Assets.xcassets
3. Enable "Preserve Vector Data" for each asset
4. Use: `UIImage(named: "icon-name")`

### Web Scripts

#### `optimize-svg.js`
Optimizes SVG files for web use by removing unnecessary whitespace and ensuring consistency.

**Usage:**
```bash
# Optimize all variants
node optimize-svg.js

# Optimize specific variant
node optimize-svg.js --variant regular

# Create backups before optimizing
node optimize-svg.js --backup
```

**What it does:**
- Removes unnecessary whitespace
- Ensures consistent formatting
- Validates SVG structure
- Preserves essential attributes

**Options:**
- `--variant <name>` - Process specific variant only
- `--backup` - Create `.backup` files before optimizing

## Workflow

### Complete Setup (First Time)
```bash
cd icons/scripts/phosphor

# 1. Generate React components
node generate-react-components.js

# 2. Generate React index files
node generate-react-index.js

# 3. (Optional) Optimize SVGs for web
node optimize-svg.js

# 4. (Optional) Generate Swift assets
node generate-swift-assets.js
```

### Adding New Icons
```bash
cd icons/scripts/phosphor

# 1. Add new SVG files to ../../phosphor/svg/<variant>/

# 2. Regenerate React components
node generate-react-components.js
node generate-react-index.js

# 3. (Optional) Regenerate Swift assets
node generate-swift-assets.js --variant <variant-name>
```

### Updating Existing Icons
```bash
cd icons/scripts/phosphor

# 1. Update SVG files in ../../phosphor/svg/<variant>/

# 2. Regenerate affected platform outputs
node generate-react-components.js
node generate-react-index.js
```

## Directory Structure

```
scripts/phosphor/
├── README.md                      # This file
├── generate-react-components.js   # React component generator
├── generate-react-index.js        # React index generator
├── generate-swift-assets.js       # Swift/iOS asset generator
└── optimize-svg.js                # SVG optimizer for web
```

## Path References

All scripts use relative paths to reference the Phosphor icons directory:
- SVG source: `../../phosphor/svg/`
- React output: `../../phosphor/react/`
- Swift output: `../../phosphor/swift/assets/`

## Requirements

- **Node.js**: All scripts require Node.js
- **ImageMagick**: Required for `generate-swift-assets.js` (optional, can use manual conversion)
- **File system access**: Scripts need read/write permissions

## Platform Coverage

| Platform | Script | Status |
|----------|--------|--------|
| **Web** | `optimize-svg.js` | ✅ SVG optimization |
| **React** | `generate-react-components.js`<br>`generate-react-index.js` | ✅ Full support |
| **Swift/iOS** | `generate-swift-assets.js` | ✅ PDF conversion |

## Notes

- All scripts are idempotent (safe to run multiple times)
- Scripts preserve existing files unless regenerating
- React components include proper TypeScript types
- SVG optimization is non-destructive (use `--backup` for safety)
- Swift conversion requires ImageMagick or manual tools

## Troubleshooting

### React Components Not Generating
- Check that SVG files exist in `../../phosphor/svg/<variant>/`
- Verify file permissions
- Check Node.js version (requires Node.js 12+)

### Swift Assets Not Converting
- Install ImageMagick: `brew install imagemagick`
- Or use manual conversion tools
- Check that SVG files are valid

### SVG Optimization Issues
- Use `--backup` flag to create backups
- Check SVG file validity before optimizing
- Restore from backup if needed: `mv file.svg.backup file.svg`

