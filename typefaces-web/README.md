# Web Fonts Directory

Web-optimized font files in WOFF2 and WOFF formats.

## Overview

| Metric | Value |
|--------|-------|
| Total Families | 442 |
| WOFF2 Files | 1,279 |
| WOFF Files | 1,279 |
| Total Size | 130.6 MB |

## Format Support

### WOFF2 (Web Open Font Format 2) - Primary
- **Browser Support:** Chrome 36+, Firefox 39+, Safari 12+, Edge 14+
- **Compression:** ~30% better than WOFF, ~50% better than TTF/OTF
- **Use:** Serve first for modern browsers

### WOFF (Web Open Font Format) - Fallback
- **Browser Support:** Chrome 6+, Firefox 3.6+, Safari 5.1+, IE 9+
- **Compression:** ~20% better than TTF/OTF
- **Use:** Fallback for older browsers

## Directory Structure

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
└── [440 more families...]
```

## Usage in CSS

### Basic Usage

```css
@font-face {
  font-family: 'Aeonik';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('typefaces-web/Aeonik/Aeonik-Regular.woff2') format('woff2'),
       url('typefaces-web/Aeonik/Aeonik-Regular.woff') format('woff');
}
```

### Using the API

For automatic CSS generation, use the Typography API:

```html
<link href="http://localhost:3000/css?family=Aeonik:wght@400;700&display=swap" rel="stylesheet">
```

## Conversion

Web fonts generated using:
- `fonttools` (Python) - Font manipulation
- `brotli` - WOFF2 compression

See `scripts/batch-convert-web.py` for the conversion script.

## CDN Deployment

When deployed, files will be available at:
- **CDN URL:** `https://cdn.library.dev/fonts/{family}/v1/{file}`
- **Cache:** 1 year (immutable)
- **Compression:** Brotli + Gzip

---

**Generated:** December 25, 2025
**Status:** Complete (1,279 WOFF2 + 1,279 WOFF files)
