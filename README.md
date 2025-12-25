# Asset Library - Public API for Fonts & Icons

A centralized repository for design assets with full-featured REST APIs for fonts and icons.

## Overview

Free, open-source API providing access to:
- **442 font families** with 2,558 web font files
- **1,512 icons** from Phosphor Icons with 6 variants each (9,072 total files)

## Quick Start

```bash
# Install dependencies
cd api && npm install

# Start API server
npm start

# Server runs at http://localhost:3000
```

## API Documentation

### Font Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/fonts` | List all fonts (supports ?category, ?subset, ?sort) |
| `GET /api/v1/fonts/:family` | Get single font details |
| `GET /api/v1/categories` | List all font categories |
| `GET /css?family=Name:wght@400;700` | Generate @font-face CSS (Google Fonts compatible) |

**Example Usage:**

```html
<!-- Link fonts in HTML -->
<link href="http://localhost:3000/css?family=Aeonik:wght@400;700&display=swap" rel="stylesheet">
```

```javascript
// Fetch font data
const response = await fetch('http://localhost:3000/api/v1/fonts?category=sans-serif&sort=alpha');
const data = await response.json();
```

### Icon Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/icons` | List all icons (supports ?provider, ?category, ?variant, ?search, ?limit, ?offset) |
| `GET /api/v1/icons/providers` | List all icon providers |
| `GET /api/v1/icons/:provider` | Get icons for a specific provider |
| `GET /api/v1/icons/:provider/:name` | Get single icon details |

**Example Usage:**

```javascript
// List all Phosphor icons
const response = await fetch('http://localhost:3000/api/v1/icons?provider=phosphor&limit=20');
const data = await response.json();

// Search for arrow icons
const arrows = await fetch('http://localhost:3000/api/v1/icons?search=arrow&category=arrows');

// Get specific icon details
const icon = await fetch('http://localhost:3000/api/v1/icons/phosphor/acorn');
```

```jsx
// Use React components
import { AcornRegular, AcornBold } from '@library/icons/phosphor/react/regular';

function MyComponent() {
  return <AcornRegular size={24} color="#000" />;
}
```

### General Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/stats` | Get comprehensive API statistics |
| `GET /` | API documentation and endpoint overview |

See [api/README.md](./api/README.md) for full API documentation.

## Repository Structure

```
LIBRARY/
├── api/                 # REST API server (Express.js)
│   ├── server.js        # Main API application
│   ├── package.json     # API dependencies
│   └── README.md        # API documentation
│
├── data/                # Asset databases & metadata
│   ├── fonts-api-db.json       # Font API database (442 families)
│   ├── fonts-metadata.json     # Complete font metadata
│   ├── font-categories.json    # Font category assignments
│   └── icons-api-db.json       # Icon API database (1,512 icons)
│
├── typefaces/           # Source fonts (TTF/OTF)
│   └── 442 font families, 1,279 files, 134MB
│
├── typefaces-web/       # Web-optimized fonts (WOFF2/WOFF)
│   └── 442 font families, 2,558 files, 134MB
│
├── icons/               # Icon collections
│   ├── phosphor/        # Phosphor Icons
│   │   ├── svg/         # SVG files (6 variants × 1,512 icons)
│   │   ├── react/       # React TypeScript components
│   │   └── swift/       # Swift/iOS implementation guide
│   └── scripts/         # Icon generation scripts
│
├── scripts/             # Automation & build scripts
│   ├── generate-metadata.js        # Font metadata generator
│   ├── generate-icons-metadata.js  # Icon metadata generator
│   ├── batch-convert-web.py        # Web font converter
│   └── README.md                   # Script documentation
│
├── @archives/           # Historical project files & deprecated code
│   └── README.md        # Archive index
│
├── STATUS.md            # Detailed project status tracker
├── package.json         # Root project configuration
└── README.md            # This file
```

## Asset Collections

### Fonts

| Metric | Value |
|--------|-------|
| Font Families | 442 |
| Source Files (TTF/OTF) | 1,279 |
| Web Files (WOFF2) | 1,279 |
| Web Files (WOFF) | 1,279 |
| Total Size | 134 MB |

**Categories:**
- Sans-Serif: 431 families (97.7%)
- Monospace: 4 families (0.9%)
- Script: 4 families (0.9%)
- Display: 1 family (0.2%)
- Serif: 1 family (0.2%)

### Icons

| Metric | Value |
|--------|-------|
| Providers | 1 (Phosphor) |
| Unique Icons | 1,512 |
| Variants per Icon | 6 (regular, bold, fill, duotone, thin, light) |
| Total Icon Files | 9,072 SVG files |
| React Components | 1,513 TypeScript components |
| License | MIT |

**Formats:**
- SVG (all variants)
- React TypeScript components
- Swift/iOS implementation guide

**Categories:** arrows, brand, communication, commerce, design, development, editor, finance, games, health, maps, media, nature, objects, people, system, weather

## Development

### Running the API

```bash
# Start API server
npm run api

# Development mode (auto-reload)
npm run api:dev
```

### Generating Metadata

```bash
# Generate font metadata
node scripts/generate-metadata.js

# Generate icon metadata
node scripts/generate-icons-metadata.js
```

### Converting Fonts

```bash
# Convert fonts to web formats (WOFF2/WOFF)
python3 scripts/batch-convert-web.py
```

## Project Status

See [STATUS.md](./STATUS.md) for detailed progress tracking.

**Current Progress: 80% Complete**
- Phase 1: Font Audit & Normalization - ✅ Complete
- Phase 2: Web Format Generation - ✅ Complete
- Phase 3: API Development - ✅ Complete
- Phase 4: Icon Integration - ✅ Complete
- Phase 5: CDN & Hosting - 🔄 Ready to start
- Phase 6: Documentation & DX - 🔄 In progress

## Architecture

### Multi-Provider Icon System

The icon system is designed to support multiple icon providers:

```
icons/
├── phosphor/          # Phosphor Icons provider
├── material/          # (Future) Material Icons
├── feather/           # (Future) Feather Icons
└── scripts/           # Provider-specific generation scripts
    ├── phosphor/
    ├── material/
    └── feather/
```

Each provider maintains its own:
- SVG source files organized by variant
- Generated React components
- Platform-specific implementations (Swift, Vue, etc.)
- Metadata in the unified icons-api-db.json

### API Design Principles

1. **Google Fonts Compatibility**: Font CSS endpoint follows Google Fonts URL patterns
2. **RESTful Architecture**: Consistent, predictable endpoint structure
3. **Provider Agnostic**: Icon system supports multiple providers seamlessly
4. **Extensible**: Easy to add new asset types (illustrations, patterns, etc.)
5. **Type Safe**: TypeScript support for all React components

## Contributing

To add a new icon provider:

1. Create provider directory: `icons/[provider-name]/`
2. Organize assets by variant in `svg/` subdirectories
3. Update `scripts/generate-icons-metadata.js` with provider config
4. Run metadata generator to update API database
5. (Optional) Create React components with generation script

## License

MIT License - Free for personal and commercial use

Font licenses vary by family - see individual font directories for details.
Phosphor Icons: MIT License (https://phosphoricons.com)

---

**Repository:** https://github.com/aidenlive/LIBRARY
**Last Updated:** December 25, 2025
**API Version:** 2.0.0
