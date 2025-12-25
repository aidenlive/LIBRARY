# Asset Library Public API

Free, open-source API for design assets:
- **442 font families** with 2,558 web font files
- **1,512 icons** from Phosphor Icons (9,072 total files across 6 variants)

## Quick Start

```bash
# Install dependencies
npm install

# Start server
npm start

# Development mode (auto-reload)
npm run dev
```

Server will run on `http://localhost:3000`

Visit `http://localhost:3000` to see the API documentation and available endpoints.

---

## Font API

### List All Fonts

```http
GET /api/v1/fonts
```

**Query Parameters:**
- `category` - Filter by category (`sans-serif`, `serif`, `mono`, `display`, `script`)
- `subset` - Filter by character subset (`latin`, `latin-ext`, `cyrillic`, `greek`)
- `sort` - Sort order (`alpha`, `popularity`)

**Example:**
```bash
curl "http://localhost:3000/api/v1/fonts?category=sans-serif&sort=alpha"
```

**Response:**
```json
{
  "items": [
    {
      "family": "Aeonik",
      "displayName": "Aeonik",
      "category": "sans-serif",
      "variants": ["100", "100italic", "regular", "italic", "700", "900"],
      "subsets": ["latin"],
      "version": "v1.0.0",
      "lastModified": "2025-12-25",
      "files": {
        "regular": {
          "woff2": "https://cdn.library.dev/fonts/aeonik/v1/Aeonik-Regular.woff2",
          "woff": "https://cdn.library.dev/fonts/aeonik/v1/Aeonik-Regular.woff"
        }
      }
    }
  ],
  "metadata": {
    "total": 431,
    "filtered": true
  }
}
```

### Get Single Font

```http
GET /api/v1/fonts/:family
```

**Example:**
```bash
curl "http://localhost:3000/api/v1/fonts/aeonik"
```

**Response:**
```json
{
  "family": "Aeonik",
  "category": "sans-serif",
  "variants": ["regular", "700"],
  "subsets": ["latin"],
  "files": { /* variant files */ }
}
```

### Generate CSS

```http
GET /css?family=NAME:wght@400;700&display=swap
```

**Query Parameters:**
- `family` - Font family with weights (Google Fonts format)
- `display` - Font-display value (`swap`, `block`, `fallback`, `optional`)
- `subset` - Character subset (`latin`, `latin-ext`, `cyrillic`)

**Examples:**

Single weight:
```bash
curl "http://localhost:3000/css?family=Aeonik"
```

Multiple weights:
```bash
curl "http://localhost:3000/css?family=Aeonik:wght@400;700&display=swap"
```

With italics:
```bash
curl "http://localhost:3000/css?family=Aeonik:ital,wght@0,400;0,700;1,400;1,700"
```

**Response:**
```css
/* Aeonik - 400 normal */
@font-face {
  font-family: 'Aeonik';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(https://cdn.library.dev/fonts/aeonik/v1/Aeonik-Regular.woff2) format('woff2'),
       url(https://cdn.library.dev/fonts/aeonik/v1/Aeonik-Regular.woff) format('woff');
  unicode-range: U+0000-00FF, ...;
}
```

### Get Font Categories

```http
GET /api/v1/categories
```

**Response:**
```json
{
  "categories": ["display", "mono", "sans-serif", "script", "serif"],
  "counts": {
    "sans-serif": 431,
    "mono": 4,
    "script": 4,
    "serif": 1,
    "display": 1
  }
}
```

---

## Icon API

### List All Icon Providers

```http
GET /api/v1/icons/providers
```

**Response:**
```json
{
  "providers": [
    {
      "key": "phosphor",
      "name": "Phosphor",
      "displayName": "Phosphor Icons",
      "description": "A flexible icon family for interfaces, diagrams, presentations",
      "license": "MIT",
      "website": "https://phosphoricons.com",
      "iconCount": 1512,
      "variants": ["regular", "bold", "fill", "duotone", "thin", "light"],
      "formats": {
        "svg": true,
        "react": true,
        "swift": true
      },
      "categories": ["arrows", "brand", "communication", "commerce", "design", ...]
    }
  ],
  "metadata": {
    "total": 1
  }
}
```

### List All Icons

```http
GET /api/v1/icons
```

**Query Parameters:**
- `provider` - Filter by provider (`phosphor`)
- `category` - Filter by category (`arrows`, `communication`, `media`, etc.)
- `variant` - Filter by variant (`regular`, `bold`, `fill`, `duotone`, `thin`, `light`)
- `search` - Search in icon names and tags
- `limit` - Results per page (default: 100)
- `offset` - Pagination offset (default: 0)

**Examples:**

List all Phosphor icons:
```bash
curl "http://localhost:3000/api/v1/icons?provider=phosphor&limit=20"
```

Search for arrow icons:
```bash
curl "http://localhost:3000/api/v1/icons?search=arrow&category=arrows"
```

Filter by variant:
```bash
curl "http://localhost:3000/api/v1/icons?variant=bold&limit=50"
```

**Response:**
```json
{
  "items": [
    {
      "provider": "phosphor",
      "name": "acorn",
      "displayName": "Acorn",
      "category": "nature",
      "tags": ["acorn"],
      "variants": ["regular", "bold", "fill", "duotone", "thin", "light"],
      "files": {
        "regular": {
          "svg": "https://cdn.library.dev/icons/phosphor/v1/svg/regular/acorn.svg",
          "react": "@library/icons/phosphor/react/regular/AcornRegular"
        }
      }
    }
  ],
  "metadata": {
    "total": 1512,
    "returned": 20,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

### Get Icons for a Provider

```http
GET /api/v1/icons/:provider
```

**Query Parameters:** Same as `/api/v1/icons` (category, variant, search, limit, offset)

**Example:**
```bash
curl "http://localhost:3000/api/v1/icons/phosphor?category=arrows&limit=10"
```

**Response:**
```json
{
  "provider": {
    "key": "phosphor",
    "name": "Phosphor",
    "displayName": "Phosphor Icons",
    "description": "A flexible icon family for interfaces, diagrams, presentations",
    "license": "MIT",
    "website": "https://phosphoricons.com",
    "variants": ["regular", "bold", "fill", "duotone", "thin", "light"],
    "formats": { "svg": true, "react": true, "swift": true },
    "categories": [...]
  },
  "items": [/* array of icons */],
  "metadata": {
    "total": 150,
    "returned": 10,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### Get Single Icon

```http
GET /api/v1/icons/:provider/:name
```

**Example:**
```bash
curl "http://localhost:3000/api/v1/icons/phosphor/acorn"
```

**Response:**
```json
{
  "provider": {
    "key": "phosphor",
    "name": "Phosphor",
    "displayName": "Phosphor Icons",
    "license": "MIT",
    "website": "https://phosphoricons.com"
  },
  "icon": {
    "name": "acorn",
    "displayName": "Acorn",
    "category": "nature",
    "tags": ["acorn"],
    "variants": ["regular", "bold", "fill", "duotone", "thin", "light"],
    "files": {
      "regular": {
        "svg": "https://cdn.library.dev/icons/phosphor/v1/svg/regular/acorn.svg",
        "react": "@library/icons/phosphor/react/regular/AcornRegular"
      },
      "bold": {
        "svg": "https://cdn.library.dev/icons/phosphor/v1/svg/bold/acorn.svg",
        "react": "@library/icons/phosphor/react/bold/AcornBold"
      },
      "fill": { /* ... */ },
      "duotone": { /* ... */ },
      "thin": { /* ... */ },
      "light": { /* ... */ }
    }
  }
}
```

---

## General Endpoints

### Get API Statistics

```http
GET /api/v1/stats
```

**Response:**
```json
{
  "fonts": {
    "totalFamilies": 442,
    "totalVariants": 996,
    "version": "1.0.0",
    "generated": "2025-12-25T...",
    "categories": {
      "sans-serif": 431,
      "mono": 4,
      "script": 4,
      "serif": 1,
      "display": 1
    }
  },
  "icons": {
    "totalProviders": 1,
    "totalIcons": 1512,
    "generated": "2025-12-25T...",
    "providers": {
      "phosphor": {
        "name": "Phosphor Icons",
        "count": 1512,
        "variants": 6,
        "categories": 17
      }
    }
  }
}
```

### Get API Documentation

```http
GET /
```

Returns comprehensive API documentation with all available endpoints and examples.

---

## Usage Examples

### Font Usage in HTML

**Single Weight:**
```html
<!DOCTYPE html>
<html>
<head>
  <link href="http://localhost:3000/css?family=Aeonik" rel="stylesheet">
  <style>
    body {
      font-family: 'Aeonik', sans-serif;
    }
  </style>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>
```

**Multiple Weights:**
```html
<link href="http://localhost:3000/css?family=Aeonik:wght@400;700&display=swap" rel="stylesheet">

<style>
  body {
    font-family: 'Aeonik', sans-serif;
    font-weight: 400;
  }

  h1 {
    font-weight: 700;
  }
</style>
```

### Icon Usage with React

```jsx
import { AcornRegular, AcornBold, AcornFill } from '@library/icons/phosphor/react';

function MyComponent() {
  return (
    <div>
      {/* Regular variant */}
      <AcornRegular size={24} color="#000" />

      {/* Bold variant */}
      <AcornBold size={32} color="#333" />

      {/* Filled variant */}
      <AcornFill size={48} color="#666" />
    </div>
  );
}
```

### Icon Usage with SVG

```html
<!-- Direct SVG usage -->
<img src="https://cdn.library.dev/icons/phosphor/v1/svg/regular/acorn.svg" alt="Acorn" />

<!-- Inline SVG with fetch -->
<script>
  fetch('http://localhost:3000/api/v1/icons/phosphor/acorn')
    .then(res => res.json())
    .then(data => {
      const svgUrl = data.icon.files.regular.svg;
      document.getElementById('icon').src = svgUrl;
    });
</script>
```

### Icon Search and Discovery

```javascript
// Search for arrow icons
async function searchIcons(query) {
  const response = await fetch(
    `http://localhost:3000/api/v1/icons?search=${query}&limit=20`
  );
  const data = await response.json();

  return data.items.map(icon => ({
    name: icon.name,
    category: icon.category,
    svg: icon.files.regular.svg
  }));
}

// Get icons by category
async function getIconsByCategory(category) {
  const response = await fetch(
    `http://localhost:3000/api/v1/icons/phosphor?category=${category}`
  );
  const data = await response.json();

  return data.items;
}

// Usage
const arrows = await searchIcons('arrow');
const mediaIcons = await getIconsByCategory('media');
```

---

## Icon Categories

Phosphor Icons are organized into 17 categories:

- **arrows** - Directional arrows and navigation
- **brand** - Brand logos and social media
- **communication** - Chat, email, phone, notifications
- **commerce** - Shopping, payments, receipts
- **design** - Design tools, colors, layouts
- **development** - Code, terminal, git, packages
- **editor** - Text formatting, alignment, styles
- **finance** - Charts, graphs, currency, banking
- **games** - Gaming, entertainment, rewards
- **health** - Medical, wellness, fitness
- **maps** - Location, navigation, geography
- **media** - Audio, video, images, playback
- **nature** - Plants, weather, animals
- **objects** - Everyday items, tools
- **people** - Users, profiles, avatars
- **system** - Files, folders, settings, warnings
- **weather** - Weather conditions, temperature

---

## CORS Support

All endpoints support CORS with `Access-Control-Allow-Origin: *` for maximum compatibility.

## Caching

CSS endpoint returns with aggressive caching headers:
```
Cache-Control: public, max-age=31536000, immutable
```

JSON endpoints use standard caching:
```
Cache-Control: public, max-age=3600
```

---

## Production Deployment

### Environment Variables

- `PORT` - Server port (default: 3000)

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY api/package*.json ./
RUN npm ci --production
COPY api/ ./
COPY data/*.json ./data/
EXPOSE 3000
CMD ["npm", "start"]
```

### Cloudflare Workers

See project documentation for deployment guides.

---

## Development

```bash
# Watch mode with auto-reload
npm run dev

# Test font endpoints
curl http://localhost:3000/api/v1/fonts?category=sans-serif
curl http://localhost:3000/css?family=Aeonik:wght@400;700

# Test icon endpoints
curl http://localhost:3000/api/v1/icons/providers
curl http://localhost:3000/api/v1/icons?search=arrow
curl http://localhost:3000/api/v1/icons/phosphor/acorn

# Get statistics
curl http://localhost:3000/api/v1/stats
```

---

## API Design Principles

1. **RESTful Architecture** - Predictable, resource-based endpoints
2. **Google Fonts Compatibility** - Font CSS endpoint follows Google Fonts URL patterns
3. **Multi-Provider Support** - Icon system designed to support multiple icon libraries
4. **Pagination** - Large result sets are paginated for performance
5. **Rich Filtering** - Comprehensive query parameters for precise data retrieval
6. **Type Safety** - All React icon components are fully typed with TypeScript
7. **Format Flexibility** - Icons available in SVG, React, and platform-specific formats

---

## License

MIT License - see LICENSE file

Font licenses vary by family - see individual font directories for details.
Phosphor Icons: MIT License (https://phosphoricons.com)

---

## Related

- [Google Fonts API](https://developers.google.com/fonts/docs/getting_started) - Inspiration for font API design
- [Phosphor Icons](https://phosphoricons.com) - Icon collection
- [@archives/TYPOGRAPHY-PUBLIC-API-PROPOSAL.md](../@archives/TYPOGRAPHY-PUBLIC-API-PROPOSAL.md) - Original project proposal

---

**API Version:** 2.0.0
**Last Updated:** December 25, 2025
