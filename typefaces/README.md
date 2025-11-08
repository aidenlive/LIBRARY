# Typefaces

Custom font collection organized by font family for use across web, design, and development projects.

## Overview

This directory contains a curated collection of custom typefaces, each organized in its own folder by font family name. The collection includes both TTF (TrueType Font) and OTF (OpenType Font) formats.

## Statistics

- **Total Font Files**: 1,279 files
  - TTF (TrueType Font): 798 files
  - OTF (OpenType Font): 481 files
- **Font Families**: 200+ unique typeface families
- **Formats**: TTF, OTF

## Directory Structure

```
typefaces/
├── FontFamilyName/     # Each font family has its own directory
│   ├── FontName-Regular.ttf
│   ├── FontName-Bold.otf
│   ├── FontName-Italic.otf
│   └── ...             # Additional weights and styles
├── AnotherFamily/
│   └── ...
└── README.md           # This file
```

## Font Organization

Each font family is stored in its own directory, named after the font family. Within each directory, you'll find:

- **Font weight variants**: Regular, Bold, Light, Medium, Black, etc.
- **Font style variants**: Italic, Oblique
- **Combined variants**: Bold-Italic, Light-Italic, etc.
- **Format variants**: Both TTF and OTF versions when available

## File Formats

### TTF (TrueType Font)
- Widely compatible across all platforms
- Good for general use
- Supported by: Windows, macOS, Linux, web browsers

### OTF (OpenType Font)
- Advanced typographic features
- Better cross-platform compatibility
- Supports OpenType features (ligatures, alternates, etc.)
- Preferred for professional design work

## Usage

### Web Projects

#### CSS @font-face
```css
@font-face {
  font-family: 'FontName';
  src: url('path/to/font-family/FontName-Regular.ttf') format('truetype'),
       url('path/to/font-family/FontName-Regular.otf') format('opentype');
  font-weight: normal;
  font-style: normal;
}
```

#### Modern Web (with font-display)
```css
@font-face {
  font-family: 'FontName';
  src: url('path/to/font-family/FontName-Regular.otf') format('opentype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

### Design Tools

#### Adobe Creative Suite (Photoshop, Illustrator, InDesign)
1. Install fonts by double-clicking the font file
2. Or copy to system fonts directory:
   - **macOS**: `~/Library/Fonts/`
   - **Windows**: `C:\Windows\Fonts\`
3. Restart the application
4. Fonts will appear in the font menu

#### Sketch
1. Install fonts to system fonts directory
2. Or use Font Book (macOS) to install
3. Fonts will be available in Sketch

#### Figma
1. Install fonts to system fonts directory
2. Figma uses system fonts
3. Fonts will appear in the font picker

### Development Projects

#### React / Next.js
```javascript
// In your CSS or styled-components
import './fonts.css';

// fonts.css
@font-face {
  font-family: 'FontName';
  src: url('/fonts/FontName-Regular.otf') format('opentype');
}
```

#### Swift / iOS
1. Add font files to Xcode project
2. Add to `Info.plist`:
```xml
<key>UIAppFonts</key>
<array>
    <string>FontName-Regular.otf</string>
</array>
```
3. Use in code:
```swift
let font = UIFont(name: "FontName-Regular", size: 16)
```

#### Android
1. Place fonts in `res/font/` directory
2. Reference in XML:
```xml
<TextView
    android:fontFamily="@font/font_name_regular"
    ... />
```

## Remote Access

This font library can be accessed remotely from other projects:

### Git Submodule
```bash
git submodule add <repository-url> typefaces
```

### NPM Package (if published)
```bash
npm install @your-org/typefaces
```

### Direct Repository Reference
Reference the repository URL in your project configuration.

## Font Families

The collection includes a diverse range of typefaces:
- Display fonts
- Sans-serif fonts
- Serif fonts
- Monospace fonts
- Decorative fonts
- Handwriting/script fonts

Browse the directories to explore available font families. Each directory is named after the font family it contains.

## Naming Conventions

Font files typically follow these naming patterns:
- `FontName-Regular.ttf`
- `FontName-Bold.otf`
- `FontName-Italic.otf`
- `FontName-BoldItalic.otf`
- `FontName-Light.otf`
- `FontName-Medium.otf`
- `FontName-Black.otf`

## OpenType Features

OTF fonts may include advanced OpenType features:
- **Ligatures**: Automatic character combinations (fi, fl, etc.)
- **Alternates**: Stylistic character alternatives
- **Swash**: Decorative character variants
- **Small Caps**: Automatic small capital letters
- **Oldstyle Figures**: Numerals with varying heights

To use OpenType features:
- **CSS**: `font-feature-settings: "liga" 1, "kern" 1;`
- **Design Tools**: Enable in font settings/OpenType panel

## Adding New Fonts

1. Create a directory named after the font family
2. Place all font files (TTF/OTF) in that directory
3. Use consistent naming conventions
4. Include documentation if the font has special requirements
5. Update this README if adding significant new collections

## License & Usage

Ensure you have proper licensing for fonts used in commercial projects. Some fonts may have specific usage restrictions. Check individual font directories for license information or README files.

## Best Practices

1. **Web Performance**: Use `font-display: swap` for better loading performance
2. **Font Loading**: Preload critical fonts in HTML:
   ```html
   <link rel="preload" href="font.otf" as="font" type="font/otf" crossorigin>
   ```
3. **Font Subsetting**: Consider subsetting fonts to reduce file size for web use
4. **Fallbacks**: Always provide fallback fonts in CSS
5. **Format Priority**: Prefer OTF for design work, both formats for maximum compatibility

## Support

For questions about specific fonts or usage, refer to:
- Individual font family directories for documentation
- Font vendor documentation
- OpenType feature guides for advanced typography

