# Phosphor Icons

Phosphor icon collection optimized for multi-platform use across web, React, and Swift projects.

## Directory Structure

```
phosphor/
├── svg/                      # Base SVG files organized by variant
│   ├── regular/              # Regular weight icons (1,512 icons)
│   ├── bold/                 # Bold weight icons (1,512 icons)
│   ├── fill/                 # Filled variant icons (1,512 icons)
│   ├── duotone/              # Duotone variant icons (1,512 icons)
│   ├── thin/                 # Thin weight icons (1,512 icons)
│   └── light/                # Light weight icons (1,512 icons)
├── react/                    # React TypeScript components
│   ├── regular/              # Regular variant components
│   ├── bold/                 # Bold variant components
│   ├── fill/                 # Fill variant components
│   ├── duotone/              # Duotone variant components
│   ├── thin/                 # Thin variant components
│   ├── light/                # Light variant components
│   └── index.ts              # Main barrel export
├── swift/                    # iOS/Swift setup instructions
└── README.md                 # This file
```

**Total Icons**: 9,072 SVG files across 6 variants (1,512 icons per variant)

## Platform Usage

### Web / General / Design Tools
- **Location**: `svg/`
- **Format**: SVG files
- **Usage**: Direct import or inline SVG. SVG files work natively in design tools like Figma and Sketch.
- **Naming**: `icon-name.svg` (kebab-case)
- **Note**: SVG files can be used directly in Figma, Sketch, and other design tools that support SVG

### React
- **Location**: `react/`
- **Format**: TypeScript React components with proper typing
- **Usage**: 
  ```tsx
  // Import specific icon
  import { AcornRegular } from '@library/icons/phosphor/react/regular';
  
  // Import from variant barrel
  import { AcornRegular, AddressBookRegular } from '@library/icons/phosphor/react/regular';
  
  // Import all variants
  import { Regular, Bold, Fill } from '@library/icons/phosphor/react';
  
  // Use in component
  function MyComponent() {
    return (
      <div>
        <AcornRegular size={24} color="#000" />
        <Regular.AcornRegular size={32} />
      </div>
    );
  }
  ```
- **Naming**: `IconNameVariant.tsx` (PascalCase, e.g., `AcornRegular.tsx`)
- **Props**: All components accept standard SVG props and forward refs

### Swift / iOS
- **Location**: `swift/`
- **Format**: SVG files (convert to PDF for asset catalogs)
- **Usage**: 
  1. See `swift/README.md` for detailed instructions
  2. Convert SVG to PDF for Xcode Asset Catalogs
  3. Use iOS 13+ native SVG support
  4. Access source SVGs from: `svg/<variant>/<icon-name>.svg`
- **Naming**: `icon-name.svg` or `icon-name.pdf` (after conversion)
- **Note**: See `swift/README.md` for conversion instructions and best practices

## File Organization

### Base SVGs
All base SVG files should be placed in `svg/` directory. These are the source files that can be:
- Used directly in web projects
- Converted/optimized for specific platforms
- Referenced by other platform-specific formats

### Platform-Specific Files
Platform-specific optimizations or formats should be placed in their respective directories:
- **react/**: React components, TypeScript definitions, or React-optimized SVGs
- **swift/**: PDF vectors, SF Symbols, or Swift asset catalogs
- **svg/**: Base SVG files that can be used directly in web projects and design tools (Figma, Sketch, etc.)

## Naming Conventions

- Use **kebab-case** for file names: `icon-name.svg`
- Use **PascalCase** for React component names: `IconName.tsx`
- Be descriptive and consistent
- Include variant suffixes when needed: `icon-name-filled.svg`, `icon-name-bold.svg`

## Icon Variants

Phosphor icons typically come in different weights/styles:
- Regular (default)
- Bold
- Fill
- Duotone
- Thin
- Light

Organize variants using suffixes or subdirectories as needed.

## Remote Access

Icons can be accessed remotely from other projects by referencing this repository:
- Git submodule
- NPM package (if published)
- Direct repository reference
- Asset CDN (if configured)

## Scripts & Automation

All generation and optimization scripts are located in `icons/scripts/phosphor/`. See [scripts/phosphor/README.md](../scripts/phosphor/README.md) for complete documentation.

### Quick Start

**Regenerate React Components:**
```bash
cd icons/scripts/phosphor
node generate-react-components.js
node generate-react-index.js
```

**Generate Swift/iOS Assets:**
```bash
cd icons/scripts/phosphor
node generate-swift-assets.js
```

**Optimize SVG Files:**
```bash
cd icons/scripts/phosphor
node optimize-svg.js
```

### Available Scripts

- **React**: `generate-react-components.js`, `generate-react-index.js`
- **Swift/iOS**: `generate-swift-assets.js`
- **Web**: `optimize-svg.js`

All scripts support platform-specific generation and can be run individually or as part of a complete workflow.

## Source

Icons are sourced from the official [Phosphor Icons](https://phosphoricons.com) repository:
- Repository: https://github.com/phosphor-icons/core
- License: MIT
- Total Icons: 1,512 unique icons × 6 variants = 9,072 total files

## Adding Icons

1. Place base SVG files in `svg/<variant>/` directory
2. Run scripts from `icons/scripts/phosphor/`:
   ```bash
   cd icons/scripts/phosphor
   node generate-react-components.js
   node generate-react-index.js
   ```
3. (Optional) Generate Swift assets: `node generate-swift-assets.js`
4. (Optional) Optimize SVGs: `node optimize-svg.js`
5. Follow naming conventions (kebab-case for files, PascalCase for components)
6. Update this README if adding new formats or structures

For detailed script documentation, see [scripts/phosphor/README.md](../scripts/phosphor/README.md).
