#!/usr/bin/env node

/**
 * Generate React components from SVG files
 * This script converts SVG files to React components for each variant
 * 
 * Usage: node generate-react-components.js
 * 
 * This script reads SVG files from ../../phosphor/svg/ and generates
 * React TypeScript components in ../../phosphor/react/
 */

const fs = require('fs');
const path = require('path');

const variants = ['regular', 'bold', 'fill', 'duotone', 'thin', 'light'];
const phosphorDir = path.join(__dirname, '../../phosphor');
const svgDir = path.join(phosphorDir, 'svg');
const reactDir = path.join(phosphorDir, 'react');

// Ensure React directories exist
variants.forEach(variant => {
  const dir = path.join(reactDir, variant);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

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
 * Generate React component from SVG content
 */
function generateReactComponent(svgContent, iconName, variant) {
  const componentName = toPascalCase(iconName);
  const variantCapitalized = variant.charAt(0).toUpperCase() + variant.slice(1);
  
  // Extract SVG content (remove <svg> tags, keep inner content)
  const svgInner = svgContent
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>/, '')
    .trim();

  return `import React from 'react';

/**
 * ${componentName}${variantCapitalized} icon component
 * Generated from Phosphor Icons
 */
export const ${componentName}${variantCapitalized} = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>((props, ref) => (
  <svg
    ref={ref}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    fill="currentColor"
    {...props}
  >
    ${svgInner}
  </svg>
));

${componentName}${variantCapitalized}.displayName = '${componentName}${variantCapitalized}';
`;
}

/**
 * Process all SVG files for a variant
 */
function processVariant(variant) {
  const variantSvgDir = path.join(svgDir, variant);
  const variantReactDir = path.join(reactDir, variant);

  if (!fs.existsSync(variantSvgDir)) {
    console.log(`Skipping ${variant} - directory not found`);
    return;
  }

  const files = fs.readdirSync(variantSvgDir).filter(file => file.endsWith('.svg'));
  console.log(`Processing ${files.length} icons for ${variant} variant...`);

  files.forEach(file => {
    const svgPath = path.join(variantSvgDir, file);
    const svgContent = fs.readFileSync(svgPath, 'utf-8');
    
    // Extract icon name (remove variant suffix and .svg extension)
    const iconName = file
      .replace(`-${variant}.svg`, '')
      .replace('.svg', '');
    
    const componentName = toPascalCase(iconName);
    const componentFileName = `${componentName}${variant.charAt(0).toUpperCase() + variant.slice(1)}.tsx`;
    const componentPath = path.join(variantReactDir, componentFileName);
    
    const componentCode = generateReactComponent(svgContent, iconName, variant);
    fs.writeFileSync(componentPath, componentCode);
  });

  console.log(`✓ Generated ${files.length} React components for ${variant}`);
}

// Process all variants
console.log('Generating React components from SVG files...\n');
variants.forEach(processVariant);
console.log('\n✓ All React components generated successfully!');

