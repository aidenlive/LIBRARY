#!/usr/bin/env node

/**
 * Generate index files for React components
 * Creates barrel exports for easier imports
 * 
 * Usage: node generate-react-index.js
 * 
 * This script generates index.ts files for all React component variants
 * in ../../phosphor/react/
 */

const fs = require('fs');
const path = require('path');

const variants = ['regular', 'bold', 'fill', 'duotone', 'thin', 'light'];
const phosphorDir = path.join(__dirname, '../../phosphor');
const reactDir = path.join(phosphorDir, 'react');

/**
 * Convert kebab-case to PascalCase
 */
function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Generate index file for a variant
 */
function generateIndex(variant) {
  const variantDir = path.join(reactDir, variant);
  
  if (!fs.existsSync(variantDir)) {
    return;
  }

  const files = fs.readdirSync(variantDir)
    .filter(file => file.endsWith('.tsx'))
    .sort();

  const exports = files.map(file => {
    const componentName = file.replace('.tsx', '');
    return `export { ${componentName} } from './${componentName}';`;
  });

  const indexContent = `/**
 * Phosphor Icons - ${variant.charAt(0).toUpperCase() + variant.slice(1)} Variant
 * Auto-generated index file
 */

${exports.join('\n')}
`;

  const indexPath = path.join(variantDir, 'index.ts');
  fs.writeFileSync(indexPath, indexContent);
  
  console.log(`✓ Generated index for ${variant} (${files.length} components)`);
}

// Generate index files for all variants
console.log('Generating React index files...\n');
variants.forEach(generateIndex);

// Generate main index file
const mainExports = variants.map(variant => {
  const variantCapitalized = variant.charAt(0).toUpperCase() + variant.slice(1);
  return `export * as ${variantCapitalized} from './${variant}';`;
});

const mainIndexContent = `/**
 * Phosphor Icons - React Components
 * Main barrel export for all variants
 */

${mainExports.join('\n')}
`;

fs.writeFileSync(path.join(reactDir, 'index.ts'), mainIndexContent);
console.log('\n✓ Generated main index file');
console.log('\n✓ All index files generated successfully!');

