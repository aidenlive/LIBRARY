# Typography API Scripts

Automation scripts for the Typography Public API project.

## Prerequisites

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies (for web font conversion)
pip3 install fonttools brotli zopfli
```

## Scripts Overview

| Script | Purpose | Status |
|--------|---------|--------|
| `batch-convert-web.py` | Convert TTF/OTF to WOFF2/WOFF | Complete |
| `generate-metadata.js` | Generate API database | Complete |
| `extract-metadata.js` | Extract font metadata | Complete |
| `analyze-naming.js` | Analyze naming patterns | Complete |
| `normalize-names.js` | Standardize file names | Complete |
| `classify-fonts.js` | Categorize fonts | Complete |
| `prepare-web-fonts.js` | Prepare web conversion | Complete |
| `comprehensive-cleanup.js` | Full repository cleanup | Complete |
| `convert-to-web-formats.sh` | Shell conversion script | Complete |

## Main Scripts

### 1. Web Font Conversion (Python)

Converts all TTF/OTF fonts to web formats (WOFF2 and WOFF).

```bash
python3 scripts/batch-convert-web.py
```

**Output:**
- `typefaces-web/` - WOFF2 and WOFF files organized by family
- Converts 1,279 fonts in ~5 minutes

### 2. Metadata Generation

Generates the API database from font files.

```bash
node scripts/generate-metadata.js
```

**Output:**
- `data/fonts-api-db.json` - API database (441 families, 996 variants)
- `data/fonts-metadata.json` - Complete metadata

### 3. Font Analysis

Analyzes naming patterns and identifies inconsistencies.

```bash
node scripts/analyze-naming.js
```

**Output:**
- `@archives/data/naming-analysis.json` - Issue report
- `@archives/data/corrections-mapping.json` - Standardization mapping

### 4. Name Normalization

Renames font files to standardized format.

```bash
# Preview changes (safe)
node scripts/normalize-names.js --dry-run

# Execute changes (creates backup)
node scripts/normalize-names.js --execute
```

**Features:**
- Creates backup before renaming
- Standardizes weights (Semi → SemiBold, Heavy → Black, etc.)
- Converts Oblique → Italic
- Removes spaces from filenames

### 5. Font Classification

Categorizes fonts (sans-serif, serif, mono, script, display).

```bash
node scripts/classify-fonts.js
```

**Output:**
- `data/font-categories.json` - Category assignments

## Output Files

### Active (in `data/`)

```
data/
├── fonts-api-db.json      # API database (active)
├── fonts-metadata.json    # Font metadata (active)
└── font-categories.json   # Category data (active)
```

### Archived (in `@archives/data/`)

```
@archives/data/
├── cleanup-log.json       # Normalization log
├── corrections-mapping.json
├── naming-analysis.json
├── conversion-queue.json
├── web-fonts-analysis.json
└── manual-review-queue.json
```

## Development Workflow

The complete workflow has been executed:

1. **Extract metadata** - Get font information
2. **Analyze naming** - Identify inconsistencies
3. **Normalize names** - Standardize filenames (547 files renamed)
4. **Classify fonts** - Assign categories
5. **Convert formats** - Generate WOFF2/WOFF (2,558 files)
6. **Generate API DB** - Create fonts-api-db.json

## Notes

- All scripts use `opentype.js` for font parsing (Node.js)
- Web conversion uses `fonttools` (Python)
- Normalization creates backups in `typefaces-backup/`
- Original intermediate files archived in `@archives/data/`

---

**Last Updated:** December 25, 2025
