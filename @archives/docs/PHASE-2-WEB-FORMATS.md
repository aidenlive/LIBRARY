# Phase 2: Web Format Generation

**Status:** In Progress
**Started:** December 24, 2025
**Target Completion:** January 21, 2026

---

## Overview

Phase 2 converts the typography collection from desktop formats (TTF/OTF) to web-optimized formats (WOFF2/WOFF) for public API deployment.

### Goals

- Convert 1,279 font files to WOFF2 and WOFF formats
- Achieve ~30% file size reduction with WOFF2
- Create versioned directory structure for CDN deployment
- Generate font subsetting for different character sets

### Current Status

✅ **Preparation Complete:**
- Directory structure created (441 family directories)
- Conversion queue generated (1,279 fonts)
- Size analysis completed
- Scripts and tooling ready

⏸️ **Blocked:**
- Python fonttools installation (proxy restrictions)
- Awaiting workaround or environment configuration

---

## Size Analysis

### Original Collection
- **Files:** 1,279 (TTF/OTF)
- **Size:** 131.84 MB
- **Formats:** 798 TTF (62%), 481 OTF (38%)

### Projected Web Fonts

#### WOFF2 (Primary)
- **Files:** 1,279
- **Estimated Size:** 92.29 MB
- **Savings:** 30.0% (~39.55 MB)
- **Browser Support:** Chrome 36+, Firefox 39+, Safari 12+, Edge 14+

#### WOFF (Fallback)
- **Files:** 1,279
- **Estimated Size:** 105.47 MB
- **Savings:** 20.0% (~26.37 MB)
- **Browser Support:** Chrome 6+, Firefox 3.6+, Safari 5.1+, IE 9+

### Total Storage
- **All Formats Combined:** 3,837 files, 329.61 MB
- **Within CDN Budget:** ✅ Yes (Cloudflare free tier: 10TB/mo)

---

## Conversion Pipeline

### Tools Required

1. **Python 3.x**
   - Version: 3.11+ (installed ✅)

2. **fonttools**
   - Python library for font manipulation
   - Install: `pip3 install --user fonttools`
   - Status: ⏸️ Blocked (proxy restrictions)

3. **brotli**
   - WOFF2 compression library
   - Install: `pip3 install --user brotli`
   - Status: ⏸️ Blocked (proxy restrictions)

### Scripts Created

#### 1. `prepare-web-fonts.js` ✅
- **Purpose:** Preparation and analysis
- **Features:**
  - Scans all font families
  - Creates directory structure
  - Generates conversion queue
  - Estimates file sizes
  - Creates README

**Usage:**
```bash
node scripts/prepare-web-fonts.js
```

**Output:**
- `data/conversion-queue.json` - Full conversion queue
- `data/web-fonts-analysis.json` - Size analysis
- `typefaces-web/` - Directory structure (441 folders)
- `typefaces-web/README.md` - Documentation

#### 2. `convert-to-web-formats.sh` ✅
- **Purpose:** Batch conversion to WOFF2/WOFF
- **Features:**
  - Dependency checking
  - Dry-run mode
  - Sample mode (5 families)
  - Progress reporting
  - Error handling
  - Backup functionality

**Usage:**
```bash
# Preview conversion (dry-run)
./scripts/convert-to-web-formats.sh --dry-run

# Convert sample (5 families)
./scripts/convert-to-web-formats.sh --sample

# Convert specific family
./scripts/convert-to-web-formats.sh --family Aeonik

# Convert all fonts
./scripts/convert-to-web-formats.sh

# Force overwrite existing
./scripts/convert-to-web-formats.sh --force
```

---

## Directory Structure

### Input (Original Fonts)
```
typefaces/
├── Aeonik/
│   ├── Aeonik-Regular.otf
│   ├── Aeonik-Bold.otf
│   └── ...
├── Certia/
│   └── ...
└── ... (441 families)
```

### Output (Web Fonts)
```
typefaces-web/
├── Aeonik/
│   ├── Aeonik-Regular.woff2
│   ├── Aeonik-Regular.woff
│   ├── Aeonik-Bold.woff2
│   ├── Aeonik-Bold.woff
│   └── ...
├── Certia/
│   └── ...
└── ... (441 families)
```

### CDN Structure (Future)
```
cdn.library.dev/fonts/
├── aeonik/
│   └── v1/
│       ├── Aeonik-Regular.woff2
│       ├── Aeonik-Regular.woff
│       └── ...
├── certia/
│   └── v1/
│       └── ...
└── ...
```

---

## Conversion Process

### Step 1: Install Dependencies ⏸️

**Standard Method:**
```bash
pip3 install --user fonttools brotli
```

**Alternative Methods:**

1. **Use `--no-index` with local packages:**
   ```bash
   # Download packages separately
   wget https://files.pythonhosted.org/packages/.../fonttools-4.x.tar.gz
   pip3 install --user --no-index fonttools-4.x.tar.gz
   ```

2. **Use conda (if available):**
   ```bash
   conda install -c conda-forge fonttools brotli
   ```

3. **Manual installation from source:**
   ```bash
   git clone https://github.com/fonttools/fonttools.git
   cd fonttools
   python3 setup.py install --user
   ```

### Step 2: Validate Installation

```bash
python3 -c "import fontTools; print(fontTools.__version__)"
python3 -c "import brotli; print(brotli.__version__)"
```

### Step 3: Test Conversion (Sample)

```bash
./scripts/convert-to-web-formats.sh --sample
```

**Expected Output:**
- 5 families converted
- ~30-50 WOFF2 files created
- ~30-50 WOFF files created
- Conversion summary with timings

### Step 4: Full Conversion

```bash
./scripts/convert-to-web-formats.sh
```

**Estimated Time:**
- ~2-5 seconds per font
- Total: ~2-3 hours for 1,279 fonts

### Step 5: Validation

```bash
# Check file counts
find typefaces-web -name "*.woff2" | wc -l  # Should be 1279
find typefaces-web -name "*.woff" | wc -l   # Should be 1279

# Check total size
du -sh typefaces-web/

# Validate random fonts
file typefaces-web/Aeonik/*.woff2
file typefaces-web/Aeonik/*.woff
```

---

## Optimization Strategies

### Font Subsetting

**Purpose:** Reduce file size by including only needed characters

**Subsets to Generate:**
1. **Latin** (U+0000-00FF) - Primary
2. **Latin Extended** (U+0100-024F) - European languages
3. **Cyrillic** (U+0400-04FF) - Russian, Ukrainian, etc.
4. **Greek** (U+0370-03FF) - Greek language

**Implementation:**
```bash
# Generate Latin subset
pyftsubset input.ttf \
  --unicodes="U+0000-00FF" \
  --output-file=output-latin.woff2 \
  --flavor=woff2
```

**Expected Savings:**
- Latin subset: 40-60% smaller than full font
- Ideal for single-language sites

### Hinting Optimization

**Purpose:** Improve rendering at small sizes

**Options:**
- **Autohinting:** `ttfautohint` tool
- **Keep existing hints:** Default behavior
- **Remove hints:** Reduce file size (5-10%)

**Implementation:**
```bash
ttfautohint input.ttf output.ttf
```

### Compression Tuning

**WOFF2 Compression Levels:**
- Default: Level 11 (best compression)
- Fast: Level 5-7 (faster conversion)
- Max: Level 11 (slowest, smallest)

---

## Quality Assurance

### Validation Checklist

- [ ] All 1,279 fonts converted to WOFF2
- [ ] All 1,279 fonts converted to WOFF
- [ ] No conversion errors logged
- [ ] File sizes reduced by ~30% (WOFF2)
- [ ] File sizes reduced by ~20% (WOFF)
- [ ] Random sample renders correctly in browsers
- [ ] Character coverage matches original
- [ ] OpenType features preserved

### Testing Matrix

| Browser | WOFF2 | WOFF | Notes |
|---------|-------|------|-------|
| Chrome 120+ | ✅ | ✅ | Primary target |
| Firefox 121+ | ✅ | ✅ | Primary target |
| Safari 17+ | ✅ | ✅ | Primary target |
| Edge 120+ | ✅ | ✅ | Primary target |
| Chrome 36-119 | ✅ | ✅ | WOFF2 supported |
| IE 11 | ❌ | ✅ | WOFF only |
| IE 9-10 | ❌ | ✅ | WOFF only |

### Browser Testing

**Test Fonts:**
- Aeonik (sans-serif, multiple weights)
- Romantica (serif)
- GopherMono (monospace)
- CasualBrush (script)
- Headline (display)

**Test Cases:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    @font-face {
      font-family: 'Aeonik';
      src: url('typefaces-web/Aeonik/Aeonik-Regular.woff2') format('woff2'),
           url('typefaces-web/Aeonik/Aeonik-Regular.woff') format('woff');
      font-weight: 400;
      font-style: normal;
    }

    body {
      font-family: 'Aeonik', sans-serif;
      font-size: 16px;
    }

    .test {
      font-size: 12px; /* Test hinting */
    }
  </style>
</head>
<body>
  <h1>Typography Test</h1>
  <p>The quick brown fox jumps over the lazy dog.</p>
  <p class="test">Small text hinting test (12px)</p>
  <p>Ligatures: ff fi fl ffi ffl</p>
  <p>Numbers: 0123456789</p>
  <p>Special: @#$%^&*()_+-=[]{}|;':\",./<>?</p>
</body>
</html>
```

---

## Troubleshooting

### Issue: Proxy Restrictions

**Symptoms:**
- `pip install` fails with 403 Forbidden
- Cannot download Python packages

**Solutions:**

1. **Configure proxy (if available):**
   ```bash
   export HTTP_PROXY=http://proxy:port
   export HTTPS_PROXY=http://proxy:port
   pip3 install --user fonttools brotli
   ```

2. **Download packages manually:**
   - Visit https://pypi.org/project/fonttools/
   - Download `.whl` or `.tar.gz`
   - Install: `pip3 install --user fonttools-*.whl`

3. **Use alternative environment:**
   - Docker container with fonttools pre-installed
   - Virtual machine with internet access
   - GitHub Actions workflow

### Issue: Conversion Errors

**Symptoms:**
- Script fails with Python errors
- Output files corrupted or missing

**Solutions:**

1. **Check font file integrity:**
   ```bash
   ttx -l typefaces/Family/Font.ttf
   ```

2. **Test single file:**
   ```bash
   python3 -m fontTools.ttLib.woff2 compress -o test.woff2 input.ttf
   ```

3. **Check fonttools version:**
   ```bash
   python3 -c "import fontTools; print(fontTools.__version__)"
   # Should be 4.43+ for best WOFF2 support
   ```

---

## Next Steps

### Immediate (Once Dependencies Available)

1. ✅ Install fonttools + brotli
2. ✅ Run sample conversion (5 families)
3. ✅ Validate output quality
4. ✅ Run full conversion (1,279 fonts)
5. ✅ Verify file counts and sizes

### Phase 2.3: Font Subsetting

1. Create subset generation script
2. Define character set ranges
3. Generate Latin subsets for all fonts
4. Test subset completeness
5. Measure additional size savings

### Phase 3 Preparation

1. Organize fonts by version (v1/)
2. Generate checksums (MD5/SHA256)
3. Create fonts metadata database
4. Plan CDN deployment strategy

---

## Resources

### Documentation
- [FontTools Documentation](https://fonttools.readthedocs.io/)
- [WOFF2 Specification](https://www.w3.org/TR/WOFF2/)
- [WOFF Specification](https://www.w3.org/TR/WOFF/)
- [Google Fonts Technical Guide](https://fonts.google.com/knowledge)

### Tools
- [pyftsubset](https://fonttools.readthedocs.io/en/latest/subset/) - Font subsetting
- [ttfautohint](https://www.freetype.org/ttfautohint/) - Autohinting
- [woff2](https://github.com/google/woff2) - Reference implementation

### Browser Support
- [Can I Use: WOFF2](https://caniuse.com/woff2)
- [Can I Use: WOFF](https://caniuse.com/woff)

---

**Last Updated:** December 24, 2025
**Next Review:** January 1, 2026
