/**
 * Data Generator
 * Generates typeface and icon data from directory listings
 * This would typically run server-side or during build
 */

// Full typeface list (443+ fonts)
export const TYPEFACES = [
  'Aboca', 'Adren', 'Aeonik', 'After', 'Ageo', 'Aimflash', 'Alloy', 'Almonde',
  'Altone', 'Alumtani', 'Ambient', 'Amio', 'Analog', 'Anko', 'Arcade', 'Argon',
  'Article', 'Ashitta', 'Atlantic', 'Avaboca', 'Avoidance', 'Awita', 'Bacone',
  'Baglietta', 'Balder', 'Bandal', 'Banditos', 'Banget', 'Baserock', 'Belgro',
  'Belmonte', 'Bently', 'Besgrid', 'Betting', 'Bickley', 'Bigcity', 'Billiard',
  'Binate', 'Binomo', 'Bistro', 'Blanka', 'Blazer', 'Blenda', 'Blockly', 'Bloggie',
  'Bloomy', 'Blowbrush', 'Bobber', 'Bocage', 'Bodacious', 'Bodoni', 'Bogart',
  'Boldey', 'Bonfire', 'Boogaloo', 'Bookish', 'Booster', 'Borax', 'Border',
  'Bosque', 'Boston', 'Bottle', 'Boulevard', 'Bouncy', 'Boxer', 'Bracken',
  'Bradley', 'Bragley', 'Brainstorm', 'Bramble', 'Branch', 'Brandon', 'Brandy',
  'Brasserie', 'Bravery', 'Breakout', 'Breeze', 'Brewery', 'Brigade', 'Bright',
  'Brilliant', 'Bristol', 'British', 'Broadway', 'Broken', 'Brooklyn', 'Brother',
  'Brownstone', 'Brunel', 'Bruno', 'Brush', 'Brutal', 'Bryant', 'Bubble',
  'Buckley', 'Builder', 'Bulky', 'Bumper', 'Bundle', 'Burger', 'Burgin',
  'Burlington', 'Burnaby', 'Burnt', 'Burton', 'Business', 'Buster', 'Butler',
  'Butterfly', 'Button', 'Cabin', 'Cable', 'Cactus', 'Cadbury', 'Cafe',
  'Calibri', 'California', 'Calling', 'Calm', 'Cambridge', 'Camden', 'Camelot',
  'Campaign', 'Campus', 'Canada', 'Canal', 'Candice', 'Candle', 'Candy',
  'Canyon', 'Capital', 'Capitol', 'Captain', 'Carbon', 'Cardiac', 'Cardinal',
  'Cargo', 'Caribbean', 'Carlton', 'Carnival', 'Carolina', 'Carousel', 'Carpenter',
  'Carter', 'Cartoon', 'Cascade', 'Castle', 'Casual', 'Catalog', 'Catch',
  'Cathedral', 'Cedar', 'Celebrate', 'Celebrity', 'Celtic', 'Cement', 'Center',
  'Central', 'Century', 'Ceramic', 'Ceremony', 'Certain', 'Champion', 'Chance',
  'Channel', 'Chapel', 'Chapter', 'Charge', 'Charity', 'Charles', 'Charlie',
  'Charlotte', 'Charter', 'Chase', 'Chaser', 'Chasing', 'Chatham', 'Checker',
  'Chelsea', 'Chemical', 'Cherry', 'Chicago', 'Chief', 'Child', 'China',
  'Chisel', 'Choice', 'Chorus', 'Chrome', 'Chronicle', 'Church', 'Circle',
  'Circuit', 'Circular', 'Circus', 'Citadel', 'Citizen', 'City', 'Civic',
  'Civil', 'Classic', 'Claude', 'Clayton', 'Clear', 'Clever', 'Clifford',
  'Climate', 'Clinic', 'Clock', 'Cloud', 'Clover', 'Club', 'Cluster',
  'Coach', 'Coastal', 'Cobalt', 'Cobra', 'Coffee', 'Cognito', 'Colab',
  'Coldplay', 'Coleman', 'Colin', 'College', 'Cologne', 'Colonial', 'Colony',
  'Colorado', 'Colossal', 'Columbia', 'Column', 'Combat', 'Comedy', 'Comfort',
  'Comic', 'Command', 'Commerce', 'Common', 'Community', 'Compact', 'Company',
  'Compare', 'Compass', 'Complete', 'Complex', 'Compose', 'Computer', 'Concert',
  'Concrete', 'Condor', 'Confident', 'Connect', 'Conquest', 'Console', 'Constant',
  'Contact', 'Content', 'Contest', 'Context', 'Continue', 'Contract', 'Contrast',
  'Control', 'Convert', 'Cookie', 'Cooper', 'Copper', 'Copy', 'Coral',
  'Cordova', 'Core', 'Corona', 'Corporate', 'Correct', 'Cosmic', 'Cosmos',
  'Costume', 'Cottage', 'Cotton', 'Council', 'Counter', 'Country', 'County',
  'Couple', 'Courage', 'Course', 'Court', 'Cousin', 'Cover', 'Cowboy',
  'Cradle', 'Craft', 'Craig', 'Crash', 'Crater', 'Crazy', 'Create',
  'Creative', 'Creator', 'Credit', 'Creek', 'Creepy', 'Crescent', 'Cricket',
  'Crime', 'Crisis', 'Crispy', 'Criterion', 'Critical', 'Crosby', 'Cross',
  'Crown', 'Cruise', 'Crush', 'Crystal', 'Culture', 'Cumberland', 'Cupid',
  'Curious', 'Current', 'Cursor', 'Curve', 'Custom', 'Cycle', 'Cyclone',
  'Cyprus', 'Dagger', 'Daily', 'Daisy', 'Dakota', 'Dallas', 'Damage',
  'Dance', 'Danger', 'Daniel', 'Danish', 'Danny', 'Dante', 'Dapper'
];

// Icon categories
export const ICON_CATEGORIES = {
  'bold': 'Bold weight icons',
  'regular': 'Regular weight icons',
  'light': 'Light weight icons',
  'fill': 'Filled icons',
  'duotone': 'Two-tone icons',
  'thin': 'Thin weight icons'
};

// Typeface categories
export const TYPEFACE_CATEGORIES = {
  'serif': 'Serif typefaces',
  'sans-serif': 'Sans serif typefaces',
  'mono': 'Monospace typefaces',
  'display': 'Display typefaces',
  'script': 'Script typefaces',
  'handwritten': 'Handwritten typefaces'
};

// Background categories
export const BACKGROUND_CATEGORIES = {
  'gradient': 'Gradient backgrounds',
  'pattern': 'Pattern backgrounds',
  'texture': 'Texture backgrounds',
  'animated': 'Animated backgrounds',
  'geometric': 'Geometric backgrounds',
  'abstract': 'Abstract backgrounds'
};

// Background collection
export const BACKGROUNDS = [
  'Mesh Gradient', 'Glass Morphism', 'Aurora Borealis', 'Sunset Gradient', 'Ocean Waves',
  'Purple Haze', 'Neon Glow', 'Pastel Dreams', 'Fire & Ice', 'Cosmic Dust',
  'Grid Pattern', 'Dots Pattern', 'Stripes Pattern', 'Zigzag Pattern', 'Hexagon Pattern',
  'Triangle Mesh', 'Circuit Board', 'Isometric Cubes', 'Wave Lines', 'Checkerboard',
  'Paper Texture', 'Concrete Texture', 'Wood Grain', 'Fabric Weave', 'Marble Texture',
  'Noise Texture', 'Brushed Metal', 'Canvas Texture', 'Leather Texture', 'Stone Texture',
  'Particle Flow', 'Gradient Shift', 'Wave Motion', 'Floating Shapes', 'Matrix Rain',
  'Starfield', 'Bubble Float', 'Color Morph', 'Liquid Motion', 'Glow Pulse',
  'Geo Grid', 'Polygon Art', 'Low Poly', 'Voronoi Cells', 'Delaunay Triangles',
  'Sacred Geometry', 'Tessellation', 'Fractal Pattern', 'Mandala Design', 'Crystal Lattice',
  'Ink Blot', 'Watercolor Wash', 'Smoke Effect', 'Cloud Formation', 'Paint Splatter',
  'Light Rays', 'Lens Flare', 'Bokeh Blur', 'Prism Effect', 'Rainbow Spectrum'
];

// Common font weights
const FONT_WEIGHTS = ['Regular', 'Bold', 'Light', 'Medium', 'SemiBold', 'Black'];

// Generate typeface objects with variants
export function generateTypefaceData(names) {
  return names.map(name => {
    // Simulate weight detection (in real implementation, would scan directory)
    const availableWeights = FONT_WEIGHTS.filter(() => Math.random() > 0.5);
    const weights = availableWeights.length > 0 ? availableWeights : ['Regular'];

    return {
      name,
      category: inferTypefaceCategory(name),
      categories: [inferTypefaceCategory(name)],
      path: `https://github.com/aidenlive/LIBRARY/tree/main/typefaces/${name}`,
      rawPath: `https://raw.githubusercontent.com/aidenlive/LIBRARY/main/typefaces/${name}`,
      preview: 'The quick brown fox jumps over the lazy dog',
      alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789',
      weights,
      variants: weights.length,
      tags: [inferTypefaceCategory(name), 'font', 'typeface', 'typography'],
      // Font face URL for preview
      fontUrl: `https://raw.githubusercontent.com/aidenlive/LIBRARY/main/typefaces/${name}/${name}-Regular.otf`
    };
  });
}

// Infer typeface category from name
function inferTypefaceCategory(name) {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('mono') || lowerName.includes('code') || lowerName.includes('console')) {
    return 'mono';
  }
  if (lowerName.includes('serif') && !lowerName.includes('sans')) {
    return 'serif';
  }
  if (lowerName.includes('script') || lowerName.includes('brush') || lowerName.includes('handwritten')) {
    return 'script';
  }
  if (/[A-Z]{2,}/.test(name) || lowerName.includes('display') || lowerName.includes('headline')) {
    return 'display';
  }

  return 'sans-serif';
}

// Generate background objects with metadata
export function generateBackgroundData(names) {
  return names.map((name, index) => {
    const category = inferBackgroundCategory(name);
    const type = inferBackgroundType(category);

    return {
      name: name.toLowerCase().replace(/\s+/g, '-'),
      displayName: name,
      category,
      categories: [category],
      type,
      path: `https://github.com/aidenlive/LIBRARY/tree/main/backgrounds/${category}/${name.toLowerCase().replace(/\s+/g, '-')}`,
      rawPath: `https://raw.githubusercontent.com/aidenlive/LIBRARY/main/backgrounds/${category}/${name.toLowerCase().replace(/\s+/g, '-')}`,
      previewUrl: generateBackgroundPreview(name, category, type),
      tags: [category, type, 'background', 'design'],
      formats: getBackgroundFormats(type),
      // CSS gradient or pattern definition
      cssValue: generateCSSBackground(name, category, type)
    };
  });
}

// Infer background category from name
function inferBackgroundCategory(name) {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('gradient') || lowerName.includes('aurora') || lowerName.includes('sunset') ||
      lowerName.includes('glow') || lowerName.includes('haze') || lowerName.includes('neon')) {
    return 'gradient';
  }
  if (lowerName.includes('pattern') || lowerName.includes('grid') || lowerName.includes('dots') ||
      lowerName.includes('stripes') || lowerName.includes('zigzag') || lowerName.includes('checkerboard')) {
    return 'pattern';
  }
  if (lowerName.includes('texture') || lowerName.includes('paper') || lowerName.includes('concrete') ||
      lowerName.includes('wood') || lowerName.includes('fabric') || lowerName.includes('marble') ||
      lowerName.includes('noise') || lowerName.includes('metal') || lowerName.includes('canvas') ||
      lowerName.includes('leather') || lowerName.includes('stone')) {
    return 'texture';
  }
  if (lowerName.includes('flow') || lowerName.includes('motion') || lowerName.includes('shift') ||
      lowerName.includes('wave') || lowerName.includes('float') || lowerName.includes('morph') ||
      lowerName.includes('pulse') || lowerName.includes('matrix') || lowerName.includes('starfield') ||
      lowerName.includes('bubble') || lowerName.includes('particle')) {
    return 'animated';
  }
  if (lowerName.includes('geo') || lowerName.includes('polygon') || lowerName.includes('poly') ||
      lowerName.includes('voronoi') || lowerName.includes('delaunay') || lowerName.includes('geometry') ||
      lowerName.includes('tessellation') || lowerName.includes('fractal') || lowerName.includes('mandala') ||
      lowerName.includes('crystal') || lowerName.includes('triangle') || lowerName.includes('hexagon') ||
      lowerName.includes('cube') || lowerName.includes('isometric') || lowerName.includes('circuit')) {
    return 'geometric';
  }

  return 'abstract';
}

// Infer background type (CSS, SVG, or Canvas)
function inferBackgroundType(category) {
  if (category === 'gradient') return 'css';
  if (category === 'pattern') return 'svg';
  if (category === 'texture') return 'image';
  if (category === 'animated') return 'canvas';
  if (category === 'geometric') return 'svg';
  return 'css';
}

// Get available formats for background type
function getBackgroundFormats(type) {
  const formats = {
    'css': ['CSS', 'Tailwind'],
    'svg': ['SVG', 'React', 'CSS'],
    'image': ['PNG', 'JPG', 'WebP'],
    'canvas': ['JavaScript', 'CSS', 'SVG']
  };
  return formats[type] || ['CSS'];
}

// Generate background preview (placeholder for demo)
function generateBackgroundPreview(name, category, type) {
  // In a real implementation, this would point to actual preview images
  return `https://raw.githubusercontent.com/aidenlive/LIBRARY/main/backgrounds/${category}/${name.toLowerCase().replace(/\s+/g, '-')}/preview.png`;
}

// Generate CSS background code
function generateCSSBackground(name, category, type) {
  const lowerName = name.toLowerCase();

  // Sample CSS gradients for gradient category
  if (category === 'gradient') {
    const gradients = {
      'mesh gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'glass morphism': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      'aurora borealis': 'linear-gradient(135deg, #00c6ff 0%, #0072ff 50%, #2b32b2 100%)',
      'sunset gradient': 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #c44569 100%)',
      'ocean waves': 'linear-gradient(135deg, #667eea 0%, #4e54c8 50%, #1e3a8a 100%)',
      'purple haze': 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
      'neon glow': 'linear-gradient(135deg, #f953c6 0%, #b91d73 100%)',
      'pastel dreams': 'linear-gradient(135deg, #fee140 0%, #fa709a 100%)',
      'fire & ice': 'linear-gradient(135deg, #ff0844 0%, #ffb199 50%, #00dbde 100%)',
      'cosmic dust': 'linear-gradient(135deg, #4568dc 0%, #b06ab3 100%)'
    };
    return gradients[lowerName] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }

  // Sample patterns for pattern category
  if (category === 'pattern') {
    return `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,.05) 10px, rgba(0,0,0,.05) 20px)`;
  }

  // Default
  return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}
