# Typography Public API Proposal

**Date:** December 24, 2025
**Status:** Draft for Review
**Goal:** Transform the typography category into a free, publicly accessible API similar to Google Fonts

---

## Executive Summary

This proposal outlines a comprehensive plan to transform the LIBRARY typography collection (442 font families, 1,279 files, 134MB) into a production-ready, public API comparable to Google Fonts. The current collection exhibits significant inconsistencies in naming conventions, format availability, metadata structure, and lacks web-optimized formats—all critical barriers to public consumption.

The proposed system will standardize the collection, generate web-ready formats (WOFF2, WOFF), provide REST and CDN APIs, automate CSS generation, and implement proper versioning, caching, and licensing frameworks.

---

## Current State Analysis

### Inventory Statistics

| Metric | Count |
|--------|-------|
| **Total Font Families** | 442 |
| **Total Font Files** | 1,279 |
| **TTF Files** | 798 (62%) |
| **OTF Files** | 481 (38%) |
| **Variable Fonts** | 1 (AOT Serial Mono-VF) |
| **Web Formats (WOFF/WOFF2)** | 0 |
| **Total Storage** | 134MB |
| **Variants per Family** | 1-48 (avg ~3) |

### Critical Issues Identified

#### 1. **Naming Pattern Inconsistencies**

The collection exhibits multiple competing naming conventions:

**Pattern A: Hyphenated Compound Styles**
```
Aeonik-Bold-Italic.otf
Aeonik-Regular-Italic.otf
Certia-Heavy-Italic.otf
```

**Pattern B: CamelCase Compound Styles**
```
Ageo-BoldItalic.otf
Ageo-SemiBoldItalic.otf
Ageo-ThinItalic.otf
```

**Pattern C: Space-Delimited (Problematic)**
```
George-Bold Italic.ttf  // (if any exist - causes filesystem issues)
```

**Pattern D: Oblique Suffixes (Instead of Italic)**
```
Font-BoldOblique.otf
Font-ThinOblique.otf
Font-MediumOblique.otf
```

**Pattern E: Directory/File Mismatches**
```
Directory: typefaces/Gregory/
Files: George-Bold.ttf, George-Regular.ttf, George-Semi-Italic.ttf
```

**Standardization Requirement:** Adopt **Pattern A** (Hyphenated) for consistency:
```
FamilyName-Weight-Style.extension
Example: Aeonik-Bold-Italic.otf
```

#### 2. **Weight Naming Discrepancies**

Analysis of 1,279 files reveals inconsistent weight terminology:

| Non-Standard | Standard Equivalent | Frequency |
|--------------|---------------------|-----------|
| `Semi` | `SemiBold` | 22 TTF, 10 OTF |
| `Huge` | `ExtraBold` or `Black` | 2 |
| `Heavy` | `ExtraBold` or `Black` | 5 |
| `Air` | `Thin` or `ExtraLight` | Varies |
| `Ultra` | `Black` | 28 |

**OpenType Weight Standards (CSS font-weight mapping):**
```
Thin         → 100
ExtraLight   → 200
Light        → 300
Regular      → 400
Medium       → 500
SemiBold     → 600
Bold         → 700
ExtraBold    → 800
Black        → 900
```

**Action Required:** Map all non-standard weight names to OpenType standards while preserving original filenames via metadata.

#### 3. **Style Naming: Italic vs Oblique**

- **Italic:** Slanted with letterform design changes (true italics)
- **Oblique:** Mechanically slanted without design changes

**Current State:**
- Mixed usage of both terms without consistency
- Some fonts use `Oblique` suffix incorrectly for true italics

**Standardization:** Default to `Italic` unless font is mechanically slanted (verify via OpenType metadata).

#### 4. **Format Availability Gaps**

**Current Formats:**
- ✅ TTF (TrueType Font) - 798 files
- ✅ OTF (OpenType Font) - 481 files
- ❌ WOFF (Web Open Font Format) - 0 files
- ❌ WOFF2 (Compressed WOFF) - 0 files
- ❌ EOT (Legacy IE support) - 0 files (not needed for modern API)

**Web Performance Impact:**
- WOFF2 provides 30% better compression than WOFF
- WOFF2 is 50%+ smaller than TTF/OTF
- Google Fonts serves primarily WOFF2 with WOFF fallback

**Action Required:** Generate WOFF2 and WOFF formats for all fonts.

#### 5. **Variant Distribution Imbalance**

**Top 5 Families by Variant Count:**
1. Mollen - 48 variants (includes Condensed, Narrow, ExtraBold combinations)
2. Walsheim - 30 variants
3. Evolve - 24 variants
4. Magdeline - 20 variants
5. HandoSoft - 20 variants

**Bottom Tier (149 families with single variant):**
- Examples: Aboca, After, Almonde, Arcade, Atlantic, etc.
- Only Regular weight, no Italic/Bold variants

**Implications for API:**
- Single-variant fonts limit typographic flexibility
- Need clear documentation of available weights per family
- Consider grouping or categorizing by variant availability

#### 6. **Missing Metadata**

**No Standardized Metadata Found:**
- ❌ Font designer/foundry attribution
- ❌ License information (critical for public API)
- ❌ Version numbers
- ❌ Character set coverage (Latin, Cyrillic, Greek, etc.)
- ❌ OpenType feature support (ligatures, kerning, alternates)
- ❌ Category classification (Sans-Serif, Serif, Monospace, Display, Script)
- ❌ Font metrics (x-height, ascenders, descenders)

**Current Category Inference (app.js:1043-1057):**
```javascript
// Brittle heuristic-based categorization
if (lowerName.includes('mono') || lowerName.includes('code')) return 'mono';
if (lowerName.includes('serif')) return 'serif';
if (/[A-Z][A-Z]/.test(name)) return 'display';
return 'sans-serif';
```

**Action Required:** Extract metadata programmatically using font parsing libraries (e.g., `fontkit`, `opentype.js`).

#### 7. **Variable Font Support**

**Current State:**
- Only 1 variable font found: `AOT Serial Mono-VF.ttf`
- Represents 0.08% of collection

**Variable Font Benefits:**
- Single file contains multiple weights/widths
- Reduced HTTP requests
- Smaller combined file size
- Smooth interpolation between weights

**Long-term Goal:** Encourage/generate variable font versions where technically feasible.

---

## Proposed Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Public Typography API                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   REST API    │  │   CDN/Edge   │  │   CSS Service   │  │
│  │   Endpoints   │  │   Network    │  │   Generator     │  │
│  └───────────────┘  └──────────────┘  └─────────────────┘  │
│         │                  │                    │            │
│         └──────────────────┴────────────────────┘            │
│                            │                                 │
│                  ┌─────────▼─────────┐                       │
│                  │   Font Metadata   │                       │
│                  │   Database (JSON) │                       │
│                  └─────────┬─────────┘                       │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐              │
│         │                  │                  │              │
│  ┌──────▼──────┐  ┌────────▼────────┐  ┌─────▼──────┐      │
│  │  Original   │  │  WOFF2 Fonts    │  │ WOFF Fonts │      │
│  │  TTF/OTF    │  │  (Primary)      │  │ (Fallback) │      │
│  │  (Source)   │  │                 │  │            │      │
│  └─────────────┘  └─────────────────┘  └────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### API Endpoints (Google Fonts Parity)

#### 1. **Font Catalog API**
```
GET /api/v1/fonts
```

**Response:**
```json
{
  "items": [
    {
      "family": "Aeonik",
      "category": "sans-serif",
      "variants": [
        "100",
        "100italic",
        "300",
        "300italic",
        "regular",
        "italic",
        "500",
        "500italic",
        "700",
        "700italic",
        "900",
        "900italic"
      ],
      "subsets": ["latin", "latin-ext"],
      "version": "v1.0.0",
      "lastModified": "2025-12-01",
      "files": {
        "100": "https://cdn.library.dev/fonts/aeonik/v1/Aeonik-Thin.woff2",
        "100italic": "https://cdn.library.dev/fonts/aeonik/v1/Aeonik-Thin-Italic.woff2",
        "regular": "https://cdn.library.dev/fonts/aeonik/v1/Aeonik-Regular.woff2",
        "italic": "https://cdn.library.dev/fonts/aeonik/v1/Aeonik-Regular-Italic.woff2",
        "700": "https://cdn.library.dev/fonts/aeonik/v1/Aeonik-Bold.woff2",
        "900": "https://cdn.library.dev/fonts/aeonik/v1/Aeonik-Black.woff2"
      }
    }
  ]
}
```

**Query Parameters:**
- `?sort=alpha|trending|popularity` - Sort order
- `?category=sans-serif|serif|mono|display|script` - Filter by category
- `?subset=latin|cyrillic|greek` - Filter by character set

#### 2. **CSS API (Dynamic @font-face Generation)**
```
GET /css?family=Aeonik:wght@400;700&display=swap
```

**Response:**
```css
/* Aeonik - Regular */
@font-face {
  font-family: 'Aeonik';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(https://cdn.library.dev/fonts/aeonik/v1/Aeonik-Regular.woff2) format('woff2'),
       url(https://cdn.library.dev/fonts/aeonik/v1/Aeonik-Regular.woff) format('woff');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Aeonik - Bold */
@font-face {
  font-family: 'Aeonik';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(https://cdn.library.dev/fonts/aeonik/v1/Aeonik-Bold.woff2) format('woff2'),
       url(https://cdn.library.dev/fonts/aeonik/v1/Aeonik-Bold.woff) format('woff');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
```

**Parameters:**
- `family` - Font family name with weights (e.g., `Aeonik:wght@400;700`)
- `display` - Font-display value (swap, block, fallback, optional)
- `subset` - Character subset (latin, latin-ext, cyrillic)
- `text` - Subset font to specific characters (for optimization)

#### 3. **Font Detail API**
```
GET /api/v1/fonts/aeonik
```

**Response:**
```json
{
  "family": "Aeonik",
  "category": "sans-serif",
  "designer": "Unknown",
  "license": "To Be Determined",
  "version": "v1.0.0",
  "variants": {
    "100": {
      "weight": 100,
      "style": "normal",
      "fileName": "Aeonik-Thin.otf",
      "formats": ["woff2", "woff", "otf"],
      "fileSize": {
        "otf": "42KB",
        "woff2": "28KB",
        "woff": "35KB"
      }
    },
    "100italic": {
      "weight": 100,
      "style": "italic",
      "fileName": "Aeonik-Thin-Italic.otf",
      "formats": ["woff2", "woff", "otf"],
      "fileSize": {
        "otf": "43KB",
        "woff2": "29KB",
        "woff": "36KB"
      }
    }
  },
  "subsets": ["latin"],
  "features": {
    "liga": true,
    "kern": true,
    "calt": false,
    "ss01": false
  },
  "metrics": {
    "unitsPerEm": 1000,
    "ascender": 750,
    "descender": -250,
    "xHeight": 500,
    "capHeight": 700
  }
}
```

---

## Standardization Roadmap

### Phase 1: Audit & Normalization (Weeks 1-2)

#### 1.1 Automated Font Analysis
**Tool:** Create font metadata extraction script

```javascript
// Pseudocode for font metadata extraction
import { parse } from 'fontkit';
import { promises as fs } from 'fs';

async function extractFontMetadata(fontPath) {
  const buffer = await fs.readFile(fontPath);
  const font = parse(buffer);

  return {
    familyName: font.familyName,
    subfamilyName: font.subfamilyName,
    fullName: font.fullName,
    postScriptName: font.postscriptName,
    version: font.version,
    copyright: font.copyright,
    designer: extractDesigner(font),
    license: font.license,

    // OpenType metadata
    weight: font['OS/2'].usWeightClass,
    width: font['OS/2'].usWidthClass,
    isItalic: font.head.macStyle.italic,
    isOblique: font.post.isFixedPitch === 0 && font.head.macStyle.italic,

    // Metrics
    unitsPerEm: font.head.unitsPerEm,
    ascender: font.hhea.ascender,
    descender: font.hhea.descender,
    xHeight: font['OS/2'].sxHeight,
    capHeight: font['OS/2'].sCapHeight,

    // Character coverage
    glyphCount: font.numGlyphs,
    characterSet: analyzeCharacterSet(font.characterSet),
    unicodeRanges: extractUnicodeRanges(font),

    // OpenType features
    features: extractOpenTypeFeatures(font),

    // File metadata
    format: detectFormat(fontPath),
    fileSize: (await fs.stat(fontPath)).size,
    checksum: await generateChecksum(buffer)
  };
}
```

**Deliverables:**
- Complete metadata JSON database (`fonts-metadata.json`)
- Inventory report of inconsistencies
- Automated test suite for metadata validation

#### 1.2 Naming Standardization

**Create Mapping File:**
```json
{
  "corrections": [
    {
      "directory": "Gregory",
      "expected": "Gregory",
      "actual": "George",
      "action": "rename_files",
      "pattern": "George-*.ttf → Gregory-*.ttf"
    }
  ],
  "weightMappings": {
    "Semi": "SemiBold",
    "Huge": "ExtraBold",
    "Heavy": "Black",
    "Air": "Thin",
    "Ultra": "Black"
  },
  "styleMappings": {
    "Oblique": "Italic"  // Validate case-by-case
  }
}
```

**Normalization Script:**
1. Rename files following `FamilyName-Weight-Style.ext` pattern
2. Create symlinks from old names to new (temporary backward compatibility)
3. Update internal references in web app (`data-generator.js`)
4. Generate migration documentation

#### 1.3 Category Classification

**Automated Classification Logic:**
```javascript
function classifyFont(metadata) {
  // Check OpenType metadata first
  if (metadata.panose) {
    const familyType = metadata.panose[0];
    if (familyType === 2) return 'serif';
    if (familyType === 3) return 'sans-serif';
    if (familyType === 4) return 'script';
    if (familyType === 5) return 'display';
  }

  // Check monospace flag
  if (metadata.post.isFixedPitch === 1) return 'mono';

  // Fallback to name-based heuristics
  const name = metadata.familyName.toLowerCase();
  if (name.includes('mono') || name.includes('code')) return 'mono';
  if (name.includes('serif') && !name.includes('sans')) return 'serif';
  if (name.includes('script') || name.includes('brush')) return 'script';

  // Default to sans-serif
  return 'sans-serif';
}
```

**Manual Review Required:**
- Display fonts (often misclassified)
- Decorative fonts
- Fonts with ambiguous names

### Phase 2: Web Format Generation (Weeks 3-4)

#### 2.1 WOFF2 Conversion Pipeline

**Tools:**
- `fonttools` (Python) with `woff2` extension
- `woff2_compress` (Google's reference implementation)

**Conversion Script:**
```bash
#!/bin/bash
# Convert all TTF/OTF to WOFF2 and WOFF

TYPEFACE_DIR="typefaces"
OUTPUT_DIR="typefaces-web"

find "$TYPEFACE_DIR" -type f \( -name "*.ttf" -o -name "*.otf" \) | while read font; do
  family=$(basename "$(dirname "$font")")
  filename=$(basename "$font" | sed 's/\.[^.]*$//')

  # Create family directory
  mkdir -p "$OUTPUT_DIR/$family"

  # Convert to WOFF2 (primary web format)
  woff2_compress "$font"
  mv "${font%.???}.woff2" "$OUTPUT_DIR/$family/$filename.woff2"

  # Convert to WOFF (fallback)
  fonttools ttLib.woff2 compress -o "$OUTPUT_DIR/$family/$filename.woff" "$font"

  echo "✓ Converted $family/$filename"
done
```

**Optimization:**
- **Subsetting:** Generate Latin, Latin-Extended, Cyrillic variants separately
- **Hinting:** Apply autohinting for better rendering at small sizes
- **Compression:** Optimize WOFF2 compression level

#### 2.2 Font Subsetting (Advanced)

**Character Set Subsets:**
```javascript
const SUBSETS = {
  'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  'latin-ext': 'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
  'cyrillic': 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
  'greek': 'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
  'vietnamese': 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB'
};

// Generate subset variants
for (const [subset, range] of Object.entries(SUBSETS)) {
  exec(`pyftsubset ${fontPath} --unicodes="${range}" --output-file=${outputPath}-${subset}.woff2 --flavor=woff2`);
}
```

**Benefits:**
- 40-60% file size reduction for single-language sites
- Faster font loading
- Reduced bandwidth costs

### Phase 3: API Development (Weeks 5-8)

#### 3.1 Metadata Database Schema

**JSON Structure (`fonts.json`):**
```json
{
  "fonts": {
    "aeonik": {
      "family": "Aeonik",
      "displayName": "Aeonik",
      "category": "sans-serif",
      "subsets": ["latin"],
      "variants": {
        "100": {
          "weight": 100,
          "style": "normal",
          "fileName": "Aeonik-Thin",
          "fileSize": {
            "woff2": 28672,
            "woff": 35840,
            "otf": 43008
          },
          "unicodeRange": "U+0000-00FF"
        },
        "100italic": { /* ... */ },
        "regular": { /* ... */ },
        "700": { /* ... */ }
      },
      "version": "1.0.0",
      "lastModified": "2025-12-01T00:00:00Z",
      "designer": "Unknown",
      "license": "TBD",
      "features": ["kern", "liga"],
      "axes": null  // For variable fonts
    }
  },
  "metadata": {
    "version": "1.0.0",
    "generated": "2025-12-24T00:00:00Z",
    "totalFamilies": 442,
    "totalVariants": 1279
  }
}
```

#### 3.2 REST API Implementation

**Technology Stack:**
- **Runtime:** Node.js (Express) or Deno (Oak)
- **Hosting:** Cloudflare Workers / Vercel Edge Functions
- **Storage:** GitHub Raw (fonts) + CDN
- **Caching:** Cloudflare CDN with 1-year cache headers

**Express.js Example:**
```javascript
import express from 'express';
import fonts from './fonts.json' assert { type: 'json' };

const app = express();

// GET /api/v1/fonts - List all fonts
app.get('/api/v1/fonts', (req, res) => {
  const { sort, category, subset } = req.query;

  let results = Object.values(fonts.fonts);

  // Filter by category
  if (category) {
    results = results.filter(f => f.category === category);
  }

  // Filter by subset
  if (subset) {
    results = results.filter(f => f.subsets.includes(subset));
  }

  // Sort
  if (sort === 'alpha') {
    results.sort((a, b) => a.family.localeCompare(b.family));
  }

  res.json({ items: results });
});

// GET /api/v1/fonts/:family - Get single font
app.get('/api/v1/fonts/:family', (req, res) => {
  const family = req.params.family.toLowerCase();
  const font = fonts.fonts[family];

  if (!font) {
    return res.status(404).json({ error: 'Font not found' });
  }

  res.json(font);
});
```

#### 3.3 CSS Generator Service

**Dynamic @font-face Generation:**
```javascript
// GET /css?family=Aeonik:wght@400;700&display=swap
app.get('/css', (req, res) => {
  const { family, display = 'swap', subset = 'latin' } = req.query;

  // Parse family parameter: "Aeonik:wght@400;700;900italic"
  const [fontFamily, variantsParam] = family.split(':');
  const variants = parseVariants(variantsParam); // ['400', '700', '900italic']

  const font = fonts.fonts[fontFamily.toLowerCase()];
  if (!font) {
    return res.status(404).send('/* Font not found */');
  }

  const css = variants.map(variant => {
    const variantData = font.variants[variant];
    if (!variantData) return '';

    const weight = variantData.weight;
    const style = variantData.style;
    const fileName = variantData.fileName;

    return `
@font-face {
  font-family: '${font.family}';
  font-style: ${style};
  font-weight: ${weight};
  font-display: ${display};
  src: url(https://cdn.library.dev/fonts/${fontFamily.toLowerCase()}/v${font.version}/${fileName}.woff2) format('woff2'),
       url(https://cdn.library.dev/fonts/${fontFamily.toLowerCase()}/v${font.version}/${fileName}.woff) format('woff');
  unicode-range: ${UNICODE_RANGES[subset]};
}`.trim();
  }).join('\n\n');

  res.setHeader('Content-Type', 'text/css');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(css);
});
```

### Phase 4: CDN & Hosting (Weeks 9-10)

#### 4.1 CDN Configuration

**Cloudflare CDN Setup:**
```
Bucket Structure:
cdn.library.dev/fonts/
  ├── aeonik/
  │   └── v1/
  │       ├── Aeonik-Thin.woff2
  │       ├── Aeonik-Thin.woff
  │       ├── Aeonik-Regular.woff2
  │       └── ...
  ├── certia/
  │   └── v1/
  │       └── ...
  └── ...
```

**Cache Headers:**
```
Cache-Control: public, max-age=31536000, immutable
Access-Control-Allow-Origin: *
X-Content-Type-Options: nosniff
```

**Compression:**
- Brotli compression enabled
- Gzip fallback

#### 4.2 GitHub Raw as Origin

**Current Setup:**
```
https://raw.githubusercontent.com/aidenlive/LIBRARY/main/typefaces/Aeonik/Aeonik-Regular.otf
```

**CDN Proxying:**
```
Origin: GitHub Raw (free hosting)
↓
Cloudflare CDN (caching + compression)
↓
cdn.library.dev/fonts/aeonik/v1/Aeonik-Regular.woff2
```

**Benefits:**
- Free origin hosting via GitHub
- 280+ edge locations via Cloudflare
- Automatic SSL/TLS
- DDoS protection

### Phase 5: Documentation & Developer Experience (Weeks 11-12)

#### 5.1 API Documentation

**OpenAPI 3.0 Spec:**
```yaml
openapi: 3.0.0
info:
  title: Typography Public API
  version: 1.0.0
  description: Free, open-source typography API with 442 font families

servers:
  - url: https://api.library.dev/v1
    description: Production API

paths:
  /fonts:
    get:
      summary: List all fonts
      parameters:
        - name: sort
          in: query
          schema:
            type: string
            enum: [alpha, trending, popularity]
        - name: category
          in: query
          schema:
            type: string
            enum: [sans-serif, serif, mono, display, script]
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      $ref: '#/components/schemas/Font'
```

#### 5.2 Usage Examples

**HTML:**
```html
<!-- Single weight -->
<link href="https://api.library.dev/css?family=Aeonik" rel="stylesheet">

<!-- Multiple weights -->
<link href="https://api.library.dev/css?family=Aeonik:wght@400;700&display=swap" rel="stylesheet">

<!-- Italics -->
<link href="https://api.library.dev/css?family=Aeonik:ital,wght@0,400;0,700;1,400;1,700" rel="stylesheet">

<style>
  body {
    font-family: 'Aeonik', sans-serif;
  }
</style>
```

**React/Next.js:**
```jsx
import Head from 'next/head';

export default function Page() {
  return (
    <>
      <Head>
        <link
          href="https://api.library.dev/css?family=Aeonik:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div style={{ fontFamily: 'Aeonik, sans-serif' }}>
        Hello World
      </div>
    </>
  );
}
```

**CSS @import:**
```css
@import url('https://api.library.dev/css?family=Aeonik:wght@400;700');

body {
  font-family: 'Aeonik', sans-serif;
}
```

**NPM Package (Future):**
```bash
npm install @library/fonts
```

```javascript
import { Aeonik } from '@library/fonts/aeonik';

export default function App() {
  return (
    <div className={Aeonik.className}>
      Hello World
    </div>
  );
}
```

---

## Licensing Framework

### Critical Requirement

**Current State:** No license information found in repository.

**Action Required:** Establish clear licensing for public API:

1. **Font License Audit:**
   - Identify original font sources
   - Verify redistribution rights
   - Document designer/foundry attribution
   - Classify fonts by license type:
     - Open Source (SIL OFL, Apache, MIT)
     - Custom Free License
     - Commercial (remove from public API)

2. **Recommended License for API:**
   - **SIL Open Font License (OFL) 1.1** for font files
   - **MIT License** for API code and tooling
   - Clear attribution requirements

3. **Legal Documentation:**
   - `LICENSE.md` in repository root
   - Per-font `OFL.txt` or `LICENSE.txt` files
   - API Terms of Service

**Example Attribution Requirement:**
```
Font Name: Aeonik
Designer: Unknown (To be determined)
License: SIL Open Font License 1.1
Source: https://github.com/aidenlive/LIBRARY
```

---

## Performance Optimization

### 1. Font Subsetting Strategy

**Dynamic Subsetting (Advanced):**
```javascript
// Generate font subset for specific text
// GET /css?family=Aeonik&text=HelloWorld
// Only includes glyphs: H, e, l, o, W, r, d

app.get('/css', async (req, res) => {
  const { family, text } = req.query;

  if (text) {
    // Generate custom subset on-the-fly
    const subset = await generateSubset(family, text);
    const dataUri = `data:font/woff2;base64,${subset.toString('base64')}`;

    const css = `
@font-face {
  font-family: '${family}';
  src: url('${dataUri}') format('woff2');
}`;

    res.setHeader('Content-Type', 'text/css');
    res.send(css);
  }
});
```

**Benefits:**
- 90%+ file size reduction for small text snippets
- Ideal for logos, headings with limited character sets

### 2. Preload Optimization

**Critical Font Preloading:**
```html
<!-- Preload critical fonts in <head> -->
<link
  rel="preload"
  as="font"
  type="font/woff2"
  href="https://cdn.library.dev/fonts/aeonik/v1/Aeonik-Regular.woff2"
  crossorigin
>
```

### 3. Variable Font Conversion (Long-term)

**Convert static fonts to variable fonts:**
- Combine Regular, Medium, Bold, Black into single variable font
- Reduce HTTP requests from 4 to 1
- Enable smooth weight interpolation

**Example:**
```css
@font-face {
  font-family: 'Aeonik';
  src: url('Aeonik-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-style: normal;
}

h1 {
  font-weight: 450; /* Custom intermediate weight */
}
```

---

## Monitoring & Analytics

### Metrics to Track

1. **API Usage:**
   - Requests per day/month
   - Most popular fonts
   - Geographic distribution
   - Error rates

2. **Performance:**
   - CDN cache hit ratio
   - Average response time
   - Font file download speed
   - Time to First Byte (TTFB)

3. **Quality:**
   - Font rendering issues
   - Browser compatibility
   - Missing glyphs reports

**Analytics Stack:**
```
Cloudflare Analytics (CDN metrics)
├── Request volume
├── Bandwidth usage
├── Cache hit ratio
└── Geographic distribution

Custom Analytics API
├── Popular fonts ranking
├── Variant usage statistics
└── API endpoint performance
```

---

## Migration Path for Existing Users

### Backward Compatibility

**Current raw GitHub URLs:**
```
https://raw.githubusercontent.com/aidenlive/LIBRARY/main/typefaces/Aeonik/Aeonik-Regular.otf
```

**New API URLs:**
```
https://cdn.library.dev/fonts/aeonik/v1/Aeonik-Regular.woff2
```

**Deprecation Timeline:**
1. **Month 1-3:** Both URLs active, documentation updated
2. **Month 4-6:** Add deprecation headers to raw URLs
3. **Month 7+:** Redirect raw URLs to CDN (with notice)

**Migration Guide:**
```markdown
# Migration from GitHub Raw to Typography API

## Before
<link rel="stylesheet" href="fonts/Aeonik/Aeonik-Regular.otf">

## After
<link href="https://api.library.dev/css?family=Aeonik" rel="stylesheet">
```

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Licensing issues** | 🔴 Critical | Audit all fonts, remove unclear licenses |
| **CDN bandwidth costs** | 🟡 Medium | Cloudflare free tier (10TB/mo), monitor usage |
| **Font quality issues** | 🟡 Medium | Automated testing, metadata validation |
| **API downtime** | 🟡 Medium | Multi-region deployment, monitoring |
| **Name collisions** | 🟢 Low | Namespace fonts under `@library/*` |
| **Browser compatibility** | 🟢 Low | Provide WOFF + WOFF2, test suite |

---

## Success Metrics

### Launch Criteria (MVP)

- ✅ All 442 fonts converted to WOFF2/WOFF
- ✅ Standardized naming conventions (95%+ compliance)
- ✅ Metadata database with 100% coverage
- ✅ REST API with `/fonts` and `/css` endpoints
- ✅ CDN deployment with global edge caching
- ✅ License documentation for 100% of fonts
- ✅ API documentation with code examples
- ✅ Automated tests (API, CSS generation, font loading)

### 6-Month Goals

- 📊 1,000+ websites using the API
- 📊 10,000+ CSS API requests/day
- 📊 99.9% uptime
- 📊 <100ms average API response time
- 📊 Documentation site with search + previews

### 12-Month Goals

- 📊 10,000+ websites using the API
- 📊 100,000+ CSS API requests/day
- 📊 50+ variable fonts added
- 📊 NPM package with Next.js/React integration
- 📊 Font pairing recommendations API
- 📊 Community contributions (new fonts, improvements)

---

## Open Questions for Stakeholder Review

1. **Licensing:** What is the provenance of these 442 font families? Can we legally redistribute them?

2. **Domain:** Should we use `fonts.library.dev`, `cdn.library.dev`, or purchase a dedicated domain like `libraryfonts.com`?

3. **Branding:** Should this be called "Library Fonts", "Typography API", or something else?

4. **Monetization:** Keep 100% free (like Google Fonts), or offer premium features (custom subsetting, analytics)?

5. **Font Acquisition:** Should we actively seek new fonts, or focus on stabilizing current collection?

6. **Variable Fonts:** Invest in converting static fonts to variable fonts, or wait for foundries to provide them?

7. **NPM Package:** Priority for NPM package with framework integrations (React, Vue, Svelte)?

8. **Self-Hosting Support:** Provide downloadable archives for developers who want to self-host?

---

## Appendix

### A. Weight Standardization Mapping

| Current Name | Standard Weight | CSS Value | Notes |
|--------------|-----------------|-----------|-------|
| Thin | Thin | 100 | ✅ Standard |
| ExtraLight | ExtraLight | 200 | ✅ Standard |
| Air | Thin or ExtraLight | 100/200 | ⚠️ Verify per-font |
| Light | Light | 300 | ✅ Standard |
| Regular | Regular | 400 | ✅ Standard |
| Medium | Medium | 500 | ✅ Standard |
| Semi | SemiBold | 600 | ⚠️ Rename |
| SemiBold | SemiBold | 600 | ✅ Standard |
| Bold | Bold | 700 | ✅ Standard |
| ExtraBold | ExtraBold | 800 | ✅ Standard |
| Heavy | ExtraBold or Black | 800/900 | ⚠️ Verify per-font |
| Huge | ExtraBold or Black | 800/900 | ⚠️ Non-standard, rename |
| Ultra | Black | 900 | ⚠️ Rename |
| Black | Black | 900 | ✅ Standard |

### B. File Size Analysis

**Average File Sizes by Format:**
- OTF: ~42KB (range: 8.9KB - 426KB)
- TTF: ~40KB (similar range)
- WOFF (projected): ~32KB (20% smaller than OTF)
- WOFF2 (projected): ~28KB (30% smaller than OTF)

**Total Storage Estimates:**
- Current (TTF/OTF): 134MB
- With WOFF: +107MB → 241MB total
- With WOFF2: +94MB → 335MB total
- **With all formats + subsets:** ~500MB (within Cloudflare free tier)

### C. Technology Stack Recommendations

**Backend:**
- **Node.js 20+ with Express** (simplicity, ecosystem)
- **Alternative:** Deno with Oak (better TypeScript support)

**Hosting:**
- **API:** Cloudflare Workers (free tier: 100k requests/day)
- **CDN:** Cloudflare CDN (free tier: 10TB/mo bandwidth)
- **Origin:** GitHub Raw (free, unlimited bandwidth for public repos)

**Font Processing:**
- **fonttools** (Python) - Industry standard
- **fontkit** (Node.js) - Metadata extraction
- **woff2** (C++) - Google's reference compressor

**Database:**
- **JSON files** (simple, version-controlled)
- **Alternative:** SQLite (better querying for large datasets)

---

## Next Steps

### Immediate Actions (Week 1)

1. ✅ **License Audit:** Investigate font sources and legal rights
2. ✅ **Stakeholder Approval:** Review and approve this proposal
3. ✅ **Tool Setup:** Install fonttools, fontkit, woff2 compressor
4. ✅ **Test Conversion:** Convert 10 sample fonts to validate pipeline

### Follow-up Tasks

1. Create GitHub issues for each phase
2. Set up project board (Kanban)
3. Assign owners to each workstream
4. Schedule weekly sync meetings

---

**Proposal Author:** Claude Code
**Date:** December 24, 2025
**Version:** 1.0 (Draft)
**Status:** Awaiting Stakeholder Review
