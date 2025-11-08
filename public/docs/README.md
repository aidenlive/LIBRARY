# Asset Library Documentation

## Overview

Award-winning, mobile-first static library for browsing, previewing, and downloading premium typefaces and icon assets. Built to Apple Design Award standards with OKLCH monochrome design system.

## Features

- **Mobile-First Design**: Optimized for all screen sizes with responsive breakpoints
- **OKLCH Color System**: Perceptually uniform monochrome palette with light/dark themes
- **Zero Build Step**: Pure HTML/CSS/JS, no build tooling required
- **High Performance**: Optimized for fast load times and smooth interactions
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
- **Asset Browser**: Browse 443+ typefaces and 1,512+ Phosphor icons
- **Live Preview**: Preview assets before download
- **Code Snippets**: Copy ready-to-use code snippets
- **Direct Downloads**: Download assets directly from GitHub

## Architecture

```
/public
├── index.html              # Main entry point
├── /templates              # HTML template fragments
├── /scripts                # JavaScript modules
│   ├── app.js             # Main application logic
│   ├── filters.js         # Search and filtering
│   └── ui-helpers.js      # UI components and utilities
├── /styles                 # CSS architecture
│   ├── tokens.css         # Design tokens (OKLCH)
│   ├── reset.css          # Modern CSS reset
│   ├── layout.css         # Layout system (24-column grid)
│   ├── components.css     # UI components
│   └── utilities.css      # Utility classes
├── /data                   # JSON configuration
│   └── config.json        # Site configuration
├── /assets                 # Static assets
└── /docs                   # Documentation
```

## Design System

### Color Tokens (OKLCH)

The design system uses OKLCH color space for perceptually uniform colors:

- **Light Theme**: High contrast monochrome (oklch(100% 0 0) to oklch(20% 0 0))
- **Dark Theme**: Inverted monochrome (oklch(15% 0 0) to oklch(95% 0 0))
- **Automatic**: Respects user's system preference
- **Manual Toggle**: Theme switcher in user menu

### Spacing Scale

4px base spacing scale for consistent vertical rhythm:

```
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-6: 24px
--space-8: 32px
```

### Typography

- **Sans Serif**: Inter (400, 500, 600, 700)
- **Monospace**: JetBrains Mono (400, 500, 600)
- **Scale**: 12px to 48px with consistent line heights

### Grid System

24-column fluid grid system with mobile-first breakpoints:

- Mobile: 1 column
- Tablet (640px+): 2-4 columns
- Desktop (1024px+): 6-12 columns

## Components

### Navbar

Floating navbar with:
- Icon-only logo on mobile
- Full logo on desktop
- Global search
- User menu with theme toggle

### Cards

Interactive cards with:
- Hover lift effect
- Smooth transitions
- Preview on click
- Download capabilities

### Modal

Full-featured modal with:
- Asset preview
- Code snippets
- Copy to clipboard
- Direct download links

### Toast Notifications

Elegant toast notifications for:
- Success messages
- Copy confirmations
- Error handling

## Usage

### Development Server

```bash
# Python
python -m http.server 8080

# Node.js
npx http-server -p 8080 -c-1

# Live reload
npx browser-sync start --server --files "**/*" --no-notify
```

### Deployment

1. No build step required
2. Upload `/public` directory to hosting
3. Set cache headers for static assets
4. Enable gzip/Brotli compression
5. Verify Lighthouse score ≥ 90

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

## Accessibility

- Semantic HTML5 elements
- ARIA labels and roles
- Keyboard navigation (Tab, Enter, Escape)
- Focus indicators
- Skip links
- Screen reader friendly
- Reduced motion support

## Performance

- Optimized for Core Web Vitals
- Lazy loading for images
- Debounced search (300ms)
- Efficient DOM updates
- Minimal JavaScript bundle
- CSS-first animations

## License

See repository for license information.

## Credits

- **Icons**: [Phosphor Icons](https://phosphoricons.com/)
- **Fonts**: Inter by Rasmus Andersson, JetBrains Mono
- **Design System**: OKLCH color space, mobile-first principles
