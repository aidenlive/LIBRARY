# LIBRARY - Typography Public API

A centralized repository for design assets with a full-featured Typography API.

## Typography API

Free, open-source typography API with **442 font families** and **2,558 web font files**.

### Quick Start

```bash
# Install dependencies
npm install

# Start API server
npm run api

# Server runs at http://localhost:3000
```

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/fonts` | List all fonts (supports filtering & sorting) |
| `GET /api/v1/fonts/:family` | Get font details |
| `GET /api/v1/categories` | List all categories |
| `GET /api/v1/stats` | Get API statistics |
| `GET /css?family=Name:wght@400;700` | Generate @font-face CSS |

### Usage Example

```html
<link href="http://localhost:3000/css?family=Aeonik:wght@400;700&display=swap" rel="stylesheet">
```

See [api/README.md](./api/README.md) for full API documentation.

## Repository Structure

```
LIBRARY/
├── api/                 # REST API server (Express.js)
│   ├── server.js        # Main API application
│   └── README.md        # API documentation
├── data/                # Active data files
│   ├── fonts-api-db.json    # Font database for API
│   ├── fonts-metadata.json  # Complete font metadata
│   └── font-categories.json # Category assignments
├── scripts/             # Automation scripts
│   ├── batch-convert-web.py # Web font converter
│   ├── generate-metadata.js # Metadata generator
│   └── ...
├── typefaces/           # Source fonts (TTF/OTF) - 1,279 files
├── typefaces-web/       # Web fonts (WOFF2/WOFF) - 2,558 files
├── icons/               # Icon collections (Phosphor)
├── SKILLS/              # Claude Skills guidelines
├── public/              # Static assets & demos
├── @archives/           # Historical project files
├── STATUS.md            # Project status tracker
└── README.md            # This file
```

## Font Collection

| Metric | Value |
|--------|-------|
| Font Families | 442 |
| Source Files (TTF/OTF) | 1,279 |
| Web Files (WOFF2) | 1,279 |
| Web Files (WOFF) | 1,279 |
| Total Web Size | 130.6 MB |

### Categories

- **Sans-Serif:** 431 families
- **Monospace:** 4 families
- **Script:** 4 families
- **Display:** 1 family
- **Serif:** 1 family

## Development

### Scripts

```bash
# Start API server
npm run api

# Development mode (auto-reload)
npm run api:dev

# Generate metadata
node scripts/generate-metadata.js

# Convert fonts to web formats
python3 scripts/batch-convert-web.py
```

### Project Status

See [STATUS.md](./STATUS.md) for detailed progress tracking.

**Current Progress: 75% Complete**
- Phase 1: Audit & Normalization - Complete
- Phase 2: Web Format Generation - Complete
- Phase 3: API Development - Complete
- Phase 4: CDN & Hosting - Ready to start
- Phase 5: Documentation & DX - Not started

## Other Assets

### Icons

Phosphor icon collection with React components. See [icons/README.md](./icons/README.md).

### Skills

Claude AI skill definitions. See [SKILLS/SKILL.md](./SKILLS/SKILL.md).

## License

MIT License - see LICENSE file

---

**Last Updated:** December 25, 2025
