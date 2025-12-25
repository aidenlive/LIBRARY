# Asset Library Explorer

A comprehensive frontend interface for visually exploring, discovering, and using all available assets from the library.

## 🎯 Overview

The Asset Library Explorer is a single-page web application that provides an intuitive interface to browse and use:

- **442 Font Families** with 930+ variants across 5 categories
- **1,512 Icons** from Phosphor Icons with 6 style variants each

## ✨ Features

### 🔤 Font Explorer
- **Search**: Find fonts by name or family
- **Filter by Category**: Sans Serif, Serif, Monospace, Display, Script
- **Sort Options**: By name, variant count, or recent additions
- **Live Preview**: Preview fonts with customizable text
- **Variant Display**: See all available weights and styles
- **Code Generation**: Get ready-to-use CSS, HTML, and CDN URLs
- **Copy to Clipboard**: One-click copying of code snippets

### 🎨 Icon Explorer
- **Search**: Find icons by name, category, or tags
- **Filter by Category**: 17 categories (arrows, brand, communication, etc.)
- **Variant Selection**: Regular, Bold, Fill, Duotone, Thin, Light
- **Visual Preview**: See all variants of each icon
- **Multiple Formats**: SVG, React components, and CDN URLs
- **Copy to Clipboard**: Easy copying of implementation code

### 🎨 Design Features
- **Dark/Light Theme**: Toggle between themes with persistent preference
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with smooth animations
- **Accessible**: Keyboard navigation and screen reader friendly

## 🚀 Usage

### Running Locally

#### Option 1: With the API Server (Recommended)

1. Start the API server:
```bash
cd /home/user/LIBRARY/api
npm install
npm start
```

2. Open the explorer in your browser:
```bash
# Using Python
cd /home/user/LIBRARY/public
python3 -m http.server 8080

# Using Node.js
npx http-server -p 8080

# Using PHP
php -S localhost:8080
```

3. Visit `http://localhost:8080` in your browser

#### Option 2: Standalone (Using JSON Files)

The explorer automatically falls back to loading data directly from JSON files if the API is not available:

1. Simply open `index.html` in a modern web browser
2. Or serve it with any static file server

### Deploying to Production

1. **Copy to web server**:
   ```bash
   cp -r public/* /var/www/html/
   ```

2. **Deploy to cloud platforms**:
   - **Netlify/Vercel**: Drop the `public` folder or connect to Git
   - **GitHub Pages**: Push to `gh-pages` branch
   - **AWS S3**: Upload as static website
   - **Cloudflare Pages**: Connect repository

3. **Update API endpoint** (if using custom API):
   - Edit `index.html` line ~812
   - Change `API_BASE` constant to your API URL

## 🛠 Integration Examples

### Static HTML Projects

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Add font from library -->
    <link rel="stylesheet" href="https://cdn.library.dev/css?family=Aeonik:wght@400;700">
    <style>
        body {
            font-family: 'Aeonik', sans-serif;
        }
    </style>
</head>
<body>
    <!-- Use icon from library -->
    <img src="https://cdn.library.dev/icons/phosphor/v1/svg/regular/acorn.svg" alt="Acorn">
</body>
</html>
```

### React Projects

```jsx
// Import font in CSS
@import url('https://cdn.library.dev/css?family=Aeonik:wght@400;700');

// Import icon component
import { AcornRegular } from '@library/icons/phosphor/react';

function App() {
  return (
    <div style={{ fontFamily: 'Aeonik, sans-serif' }}>
      <AcornRegular size={24} />
      <h1>Hello World</h1>
    </div>
  );
}
```

### Swift/iOS Projects

```swift
// Download font files and add to Xcode project
// Update Info.plist with font names

import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Hello World")
            .font(.custom("Aeonik-Regular", size: 24))
    }
}
```

## 📁 File Structure

```
public/
├── index.html          # Main application (self-contained)
└── README.md          # This file
```

## 🔌 API Integration

The explorer connects to the Asset Library API for live data:

### Font Endpoints
- `GET /api/v1/fonts` - List all fonts
- `GET /api/v1/fonts/:family` - Get font details
- `GET /css?family=NAME:wght@400;700` - Generate CSS

### Icon Endpoints
- `GET /api/v1/icons` - List all icons
- `GET /api/v1/icons/phosphor/:name` - Get icon details

### Fallback Behavior
If the API is unavailable, the explorer automatically loads from:
- `../data/fonts-api-db.json`
- `../data/icons-api-db.json`

## 🎨 Customization

### Theme Colors

Edit CSS variables in `index.html` (lines ~10-50):

```css
:root {
    --primary: #2563eb;          /* Primary brand color */
    --success: #10b981;          /* Success color */
    --bg-primary: #ffffff;       /* Main background */
    --text-primary: #0f172a;     /* Main text color */
    /* ... more variables ... */
}
```

### CDN URLs

Update CDN base URLs in code snippets (search for `cdn.library.dev`):

```javascript
// Around line 1100-1150 in index.html
const cdnBase = 'https://your-cdn.com';
```

### Preview Text

Change default preview text (line ~1051):

```javascript
document.getElementById('previewTextInput').value = "Your custom preview text";
```

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Responsive Breakpoints

- **Desktop**: 1400px+ (full features)
- **Tablet**: 768px - 1399px (optimized layout)
- **Mobile**: < 768px (stacked layout)

## ⚡ Performance

- **Single File**: No external dependencies
- **Fast Load**: < 100KB total size
- **Cached Data**: API responses cached for performance
- **Lazy Loading**: Images and fonts loaded on demand

## 🔒 Security

- **No External Scripts**: All code is inline
- **CSP Compatible**: Works with Content Security Policy
- **No Tracking**: No analytics or tracking scripts
- **HTTPS Ready**: Works with secure connections

## 🐛 Troubleshooting

### Fonts not loading
1. Check if API server is running
2. Verify CORS settings in API server
3. Check browser console for errors
4. Try using fallback JSON files

### Icons not displaying
1. Ensure icon data is loaded
2. Check network tab for failed requests
3. Verify icon names match database
4. Clear browser cache

### Search not working
1. Wait for data to fully load
2. Check browser console for errors
3. Try refreshing the page
4. Verify JSON data is valid

### Theme not persisting
1. Check localStorage permissions
2. Clear browser data and retry
3. Ensure JavaScript is enabled

## 🚀 Future Enhancements

- [ ] Add font pairing suggestions
- [ ] Icon customization (size, color, stroke)
- [ ] Download fonts as zip
- [ ] Export icon collections
- [ ] Collections/favorites system
- [ ] Share links to specific assets
- [ ] Advanced filtering options
- [ ] Font comparison tool

## 📄 License

This asset explorer interface is part of the Asset Library project. See main repository LICENSE for details.

## 🤝 Contributing

Found a bug or have a feature request? Please open an issue in the main repository.

## 📞 Support

For questions or issues:
- Check the main repository README
- Review API documentation in `/api/README.md`
- Check STATUS.md for project status

---

**Built with ❤️ for developers by developers**
