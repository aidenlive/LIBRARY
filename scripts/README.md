# Typography API Scripts

Automation scripts for the Typography Public API project.

## Prerequisites

```bash
# Install Node.js dependencies
npm install
```

## Scripts

### 1. Font Metadata Extraction

Extracts comprehensive metadata from all font files in the `typefaces/` directory.

```bash
npm run extract-metadata
# or
node scripts/extract-metadata.js
```

**Output:**
- `data/fonts-metadata.json` - Complete metadata database

**Extracted Information:**
- Font family and subfamily names
- Weight and style information
- OpenType features
- Character coverage (Latin, Cyrillic, Greek, etc.)
- File size and format
- Designer and license information (when available)
- Font metrics (ascender, descender, x-height, etc.)

### 2. Naming Analysis

Analyzes naming patterns and generates standardization mapping.

```bash
npm run analyze-naming
# or
node scripts/analyze-naming.js
```

**Output:**
- `data/naming-analysis.json` - Detailed issue report
- `data/corrections-mapping.json` - Standardization mapping

**Detects:**
- Directory/file name mismatches
- Non-standard weight names (Semi, Huge, Heavy, etc.)
- Inconsistent naming patterns (hyphenated vs CamelCase)
- Spaces in filenames
- Oblique vs Italic inconsistencies

### 3. Font Normalization (TODO)

Renames font files according to standardization mapping.

```bash
npm run normalize-names -- --dry-run  # Preview changes
npm run normalize-names                # Execute renaming
```

**NOT YET IMPLEMENTED** - Will be created after review of analysis results.

### 4. Web Format Conversion (TODO)

Converts TTF/OTF fonts to WOFF2 and WOFF formats.

```bash
npm run convert-formats
```

**NOT YET IMPLEMENTED** - Requires Python fonttools installation.

## Output Files

All generated files are saved to the `data/` directory:

```
data/
├── fonts-metadata.json        # Complete font metadata database
├── naming-analysis.json       # Naming issues report
└── corrections-mapping.json   # Standardization corrections
```

## Development Workflow

1. **Extract metadata** - Get comprehensive font information
2. **Analyze naming** - Identify naming inconsistencies
3. **Review reports** - Manual review of generated files
4. **Normalize names** - Apply standardization (after approval)
5. **Convert formats** - Generate WOFF2/WOFF versions

## Notes

- Scripts use `opentype.js` for font parsing
- All scripts are non-destructive (read-only) except normalization
- Normalization script will create backups before renaming
- Progress is displayed in the terminal with color-coded output
