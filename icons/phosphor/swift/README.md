# Phosphor Icons for Swift/iOS

This directory contains instructions and resources for using Phosphor Icons in Swift/iOS projects.

## SVG to iOS Assets

Phosphor icons are provided as SVG files in the `../svg/` directory. To use them in iOS projects, you have several options:

### Option 1: Use SVG Files Directly (iOS 13+)

iOS 13+ supports SVG images in asset catalogs:

1. Open your Xcode project
2. Select your Assets.xcassets
3. Create a new Image Set
4. Drag and drop the SVG file from `../svg/<variant>/<icon-name>.svg`
5. Set the "Preserve Vector Data" checkbox
6. Use in your code:

```swift
let icon = UIImage(named: "icon-name")
```

### Option 2: Convert to PDF (Recommended for Asset Catalogs)

1. Use a tool like [SVG to PDF converter](https://cloudconvert.com/svg-to-pdf) or command-line tools
2. Import PDF files into Xcode Asset Catalog
3. Set "Preserve Vector Data" for scalable assets

### Option 3: Use SF Symbols (Alternative)

For system-like icons, consider using Apple's SF Symbols instead. However, if you need Phosphor's specific design, use the SVG/PDF approach above.

## Directory Structure

```
swift/
├── README.md          # This file
└── [Your converted assets can go here]
```

## Conversion Script

You can create a script to batch convert SVGs to PDFs if needed. Here's a basic approach using ImageMagick or similar tools:

```bash
# Example using ImageMagick (if installed)
for file in ../svg/regular/*.svg; do
    filename=$(basename "$file" .svg)
    convert "$file" "${filename}.pdf"
done
```

## Notes

- SVG files are vector-based and scale perfectly at any size
- PDF format is preferred for Xcode Asset Catalogs
- Ensure "Preserve Vector Data" is enabled for scalable assets
- Icons use `currentColor` fill, so they adapt to your app's tint color

