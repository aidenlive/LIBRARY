#!/usr/bin/env node

/**
 * Typography Public API Server
 * REST API for font catalog and CSS generation
 *
 * Endpoints:
 *   GET  /api/v1/fonts           - List all fonts
 *   GET  /api/v1/fonts/:family   - Get single font details
 *   GET  /css                    - Generate @font-face CSS
 */

import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Load fonts database
let fontsDB = null;

async function loadFontsDatabase() {
  try {
    const dbPath = path.join(__dirname, '../data/fonts-api-db.json');
    const data = await fs.readFile(dbPath, 'utf-8');
    fontsDB = JSON.parse(data);
    console.log(`✓ Loaded ${fontsDB.metadata.totalFamilies} font families`);
  } catch (error) {
    console.error('✗ Failed to load fonts database:', error.message);
    process.exit(1);
  }
}

// Unicode ranges for different subsets
const UNICODE_RANGES = {
  latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  'latin-ext': 'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
  cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
  greek: 'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF'
};

/**
 * GET /api/v1/fonts
 * List all fonts with optional filtering and sorting
 */
app.get('/api/v1/fonts', (req, res) => {
  const { sort, category, subset } = req.query;

  let results = Object.values(fontsDB.fonts);

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
  } else if (sort === 'popularity') {
    // TODO: Implement popularity sorting based on usage metrics
    results.sort((a, b) => a.family.localeCompare(b.family));
  }

  res.json({
    items: results,
    metadata: {
      total: results.length,
      filtered: results.length < Object.keys(fontsDB.fonts).length
    }
  });
});

/**
 * GET /api/v1/fonts/:family
 * Get details for a single font family
 */
app.get('/api/v1/fonts/:family', (req, res) => {
  const familyKey = req.params.family.toLowerCase();
  const font = fontsDB.fonts[familyKey];

  if (!font) {
    return res.status(404).json({
      error: 'Font not found',
      message: `Font family "${req.params.family}" not found in database`
    });
  }

  res.json(font);
});

/**
 * Parse Google Fonts-style family parameter
 * Examples:
 *   Aeonik               → { family: 'Aeonik', variants: ['regular'] }
 *   Aeonik:wght@400;700  → { family: 'Aeonik', variants: ['400', '700'] }
 *   Aeonik:ital,wght@0,400;0,700;1,400  → { family: 'Aeonik', variants: ['400', '700', '400italic'] }
 */
function parseFamilyParam(familyParam) {
  if (!familyParam.includes(':')) {
    return { family: familyParam, variants: ['regular'] };
  }

  const [family, rest] = familyParam.split(':');
  const [axes, values] = rest.split('@');

  if (!values) {
    return { family, variants: ['regular'] };
  }

  const variants = [];
  const variantParts = values.split(';');

  for (const part of variantParts) {
    const [italic, weight] = part.includes(',') ? part.split(',') : ['0', part];

    if (italic === '1') {
      variants.push(weight === '400' ? 'italic' : `${weight}italic`);
    } else {
      variants.push(weight === '400' ? 'regular' : weight);
    }
  }

  return { family, variants };
}

/**
 * GET /css
 * Generate @font-face declarations
 */
app.get('/css', (req, res) => {
  const { family, display = 'swap', subset = 'latin' } = req.query;

  if (!family) {
    return res.status(400).send('/* Missing family parameter */');
  }

  const { family: fontFamily, variants } = parseFamilyParam(family);
  const familyKey = fontFamily.toLowerCase();
  const font = fontsDB.fonts[familyKey];

  if (!font) {
    return res.status(404).send(`/* Font family "${fontFamily}" not found */`);
  }

  const cssBlocks = [];

  for (const variant of variants) {
    const variantData = font.files[variant];

    if (!variantData) {
      continue; // Skip unavailable variants
    }

    // Determine weight and style from variant key
    let weight = 400;
    let style = 'normal';

    if (variant === 'regular') {
      weight = 400;
      style = 'normal';
    } else if (variant === 'italic') {
      weight = 400;
      style = 'italic';
    } else if (variant.endsWith('italic')) {
      weight = parseInt(variant.replace('italic', ''));
      style = 'italic';
    } else {
      weight = parseInt(variant);
      style = 'normal';
    }

    const css = `
/* ${fontFamily} - ${weight} ${style} */
@font-face {
  font-family: '${fontFamily}';
  font-style: ${style};
  font-weight: ${weight};
  font-display: ${display};
  src: url(${variantData.woff2}) format('woff2'),
       url(${variantData.woff}) format('woff');
  unicode-range: ${UNICODE_RANGES[subset] || UNICODE_RANGES.latin};
}`;

    cssBlocks.push(css.trim());
  }

  if (cssBlocks.length === 0) {
    return res.status(404).send(`/* No variants found for "${fontFamily}" */`);
  }

  res.setHeader('Content-Type', 'text/css; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(cssBlocks.join('\n\n'));
});

/**
 * GET /api/v1/categories
 * List all available categories
 */
app.get('/api/v1/categories', (req, res) => {
  const categories = {};

  for (const font of Object.values(fontsDB.fonts)) {
    categories[font.category] = (categories[font.category] || 0) + 1;
  }

  res.json({
    categories: Object.keys(categories).sort(),
    counts: categories
  });
});

/**
 * GET /api/v1/stats
 * Get API statistics
 */
app.get('/api/v1/stats', (req, res) => {
  const stats = {
    totalFamilies: fontsDB.metadata.totalFamilies,
    totalVariants: fontsDB.metadata.totalVariants,
    version: fontsDB.metadata.version,
    generated: fontsDB.metadata.generated
  };

  // Category breakdown
  const categories = {};
  for (const font of Object.values(fontsDB.fonts)) {
    categories[font.category] = (categories[font.category] || 0) + 1;
  }

  stats.categories = categories;

  res.json(stats);
});

/**
 * GET /
 * API documentation
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Typography Public API',
    version: '1.0.0',
    description: 'Free, open-source typography API with 441 font families',
    endpoints: {
      '/api/v1/fonts': 'List all fonts (supports ?category=, ?subset=, ?sort=)',
      '/api/v1/fonts/:family': 'Get single font details',
      '/api/v1/categories': 'List all categories',
      '/api/v1/stats': 'Get API statistics',
      '/css?family=Name:wght@400;700': 'Generate @font-face CSS'
    },
    examples: {
      listFonts: `${req.protocol}://${req.get('host')}/api/v1/fonts?category=sans-serif&sort=alpha`,
      getFont: `${req.protocol}://${req.get('host')}/api/v1/fonts/aeonik`,
      generateCSS: `${req.protocol}://${req.get('host')}/css?family=Aeonik:wght@400;700&display=swap`
    },
    documentation: 'https://github.com/aidenlive/LIBRARY'
  });
});

/**
 * Start server
 */
async function start() {
  await loadFontsDatabase();

  app.listen(PORT, () => {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`  Typography Public API`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    console.log(`  Server running on port ${PORT}`);
    console.log(`  http://localhost:${PORT}\n`);
    console.log(`  Endpoints:`);
    console.log(`    GET  /api/v1/fonts`);
    console.log(`    GET  /api/v1/fonts/:family`);
    console.log(`    GET  /api/v1/categories`);
    console.log(`    GET  /api/v1/stats`);
    console.log(`    GET  /css?family=Name:wght@400;700\n`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  });
}

start().catch(error => {
  console.error('✗ Failed to start server:', error);
  process.exit(1);
});
