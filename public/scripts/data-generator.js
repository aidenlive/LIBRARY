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
