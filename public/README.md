# Asset Library — Mobile-First Static Web App

Award-winning, mobile-first static library for browsing, previewing, and downloading premium typefaces and icon assets. Built to **Apple Design Award standards** with OKLCH monochrome design system.

## 🎯 Features

- **443+ Typefaces**: Premium font collection with live previews
- **1,512+ Icons**: Phosphor icon library (React, Web, Swift)
- **Mobile-First**: Optimized for all screen sizes
- **Zero Build**: Pure HTML/CSS/JS, no tooling required
- **OKLCH Colors**: Perceptually uniform monochrome palette
- **Dark Mode**: Automatic theme switching
- **Search & Filter**: Real-time search with category filters
- **Copy Snippets**: One-click code copying
- **Direct Downloads**: Download from GitHub repository

## 🚀 Quick Start

### Development

```bash
# Python
python -m http.server 8080

# Node.js
npx http-server -p 8080 -c-1

# Live reload
npx browser-sync start --server --files "**/*" --no-notify
```

Then open: http://localhost:8080

### Deployment

1. Upload `/public` directory to hosting
2. No build step required
3. Set cache headers for `/assets`, `/styles`, `/scripts`
4. Enable compression (gzip/Brotli)

## 📁 Structure

```
/public
├── index.html              # Main entry point
├── /scripts               # JavaScript modules (ES6)
│   ├── app.js            # Main application
│   ├── filters.js        # Search & filtering
│   ├── ui-helpers.js     # UI components
│   └── data-generator.js # Data utilities
├── /styles               # CSS architecture
│   ├── tokens.css       # OKLCH design tokens
│   ├── reset.css        # Modern reset
│   ├── layout.css       # 24-column grid
│   ├── components.css   # UI components
│   └── utilities.css    # Utility classes
├── /data                # Configuration
│   └── config.json      # Site config
└── /docs               # Documentation
    └── README.md       # Full documentation
```

## 🎨 Design System

### Color (OKLCH Monochrome)

- **Light Theme**: oklch(100% 0 0) → oklch(20% 0 0)
- **Dark Theme**: oklch(15% 0 0) → oklch(95% 0 0)
- Perceptually uniform grayscale
- Automatic theme detection
- Manual theme toggle

### Typography

- **Sans**: Inter (400, 500, 600, 700)
- **Mono**: JetBrains Mono (400, 500, 600)
- **Scale**: 12px → 48px
- **Base**: 16px (1rem)

### Spacing

4px base scale for vertical rhythm:
- 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

### Grid

24-column fluid grid system:
- **Mobile**: 1 column
- **Tablet** (640px+): 2-4 columns
- **Desktop** (1024px+): 6-12 columns

## 📱 Mobile-First Design

### No Flex-Wrap Policy

Following SYSTEM-MESSAGE.xml guidelines:
- **Truncation**: Long text is truncated with ellipsis
- **Horizontal Scroll**: Overflow handled with smooth scrolling
- **Icon-Only States**: Logo adapts to icon-only on mobile
- **Progressive Disclosure**: Content revealed progressively

### Responsive Components

- **Navbar**: Floating with backdrop blur, icon-only logo on mobile
- **Cards**: Adaptive grid, hover states, touch-optimized
- **Modal**: Full-screen on mobile, centered on desktop
- **FAB**: Fixed action button for quick access
- **Toast**: Contextual notifications

## ♿ Accessibility

- **WCAG 2.1 AA** compliant
- Semantic HTML5 elements
- ARIA labels and roles
- Keyboard navigation (Tab, Enter, Escape)
- Focus indicators (2px outline)
- Skip links for screen readers
- Reduced motion support

## ⚡ Performance

- **Lighthouse Score**: ≥ 90 (all metrics)
- **Core Web Vitals**: Optimized
- **Bundle Size**: Minimal JavaScript
- **CSS-First**: Animations in CSS
- **Debounced Search**: 300ms delay
- **Lazy Loading**: Images and assets

## 🔗 Repository Links

- **Typefaces**: [/typefaces](https://github.com/aidenlive/LIBRARY/tree/main/typefaces)
- **Icons**: [/icons](https://github.com/aidenlive/LIBRARY/tree/main/icons)
- **Documentation**: [/public/docs](./docs/README.md)

## 📄 License

See repository for license information.

## 🙏 Credits

- **Icons**: [Phosphor Icons](https://phosphoricons.com/)
- **Fonts**: Inter by Rasmus Andersson
- **Monospace**: JetBrains Mono
- **Color System**: OKLCH perceptual color space

---

Built with ❤️ to Apple Design Award standards
