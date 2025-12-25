# Typography Public API

Free, open-source typography API with 441 font families.

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

## API Endpoints

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
      "lastModified": "2025-12-24",
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
  "files": { /* ... */ }
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

/* Aeonik - 700 normal */
@font-face {
  font-family: 'Aeonik';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(https://cdn.library.dev/fonts/aeonik/v1/Aeonik-Bold.woff2) format('woff2'),
       url(https://cdn.library.dev/fonts/aeonik/v1/Aeonik-Bold.woff) format('woff');
  unicode-range: U+0000-00FF, ...;
}
```

### Get Categories

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

### Get Statistics

```http
GET /api/v1/stats
```

**Response:**
```json
{
  "totalFamilies": 441,
  "totalVariants": 930,
  "version": "1.0.0",
  "generated": "2025-12-24T...",
  "categories": {
    "sans-serif": 431,
    "mono": 4,
    "script": 4,
    "serif": 1,
    "display": 1
  }
}
```

## Usage in HTML

### Single Weight

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

### Multiple Weights

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

### With Italics

```html
<link href="http://localhost:3000/css?family=Aeonik:ital,wght@0,400;0,700;1,400;1,700" rel="stylesheet">

<style>
  body {
    font-family: 'Aeonik', sans-serif;
  }

  em {
    font-style: italic;
    font-weight: 400;
  }
</style>
```

## CORS Support

All endpoints support CORS with `Access-Control-Allow-Origin: *` for maximum compatibility.

## Caching

CSS endpoint returns with aggressive caching headers:
```
Cache-Control: public, max-age=31536000, immutable
```

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
COPY data/fonts-api-db.json ./data/
EXPOSE 3000
CMD ["npm", "start"]
```

### Cloudflare Workers

See `docs/DEPLOYMENT.md` for deployment guides.

## Development

```bash
# Watch mode with auto-reload
npm run dev

# Test endpoints
curl http://localhost:3000/api/v1/stats
curl http://localhost:3000/css?family=Aeonik:wght@400;700
```

## License

MIT License - see LICENSE file

## Related

- [Google Fonts API](https://developers.google.com/fonts/docs/getting_started) - Inspiration for API design
- [TYPOGRAPHY-PUBLIC-API-PROPOSAL.md](../TYPOGRAPHY-PUBLIC-API-PROPOSAL.md) - Full project proposal
