/**
 * Asset Library - Main Application
 * Mobile-first, high-performance asset browser
 */

import { Modal, Dropdown, Tabs, ThemeManager, showToast, copyToClipboard, downloadFile } from './ui-helpers.js';
import { FilterManager, createSearchHandler, createFilterHandler } from './filters.js';
import { TYPEFACES, generateTypefaceData } from './data-generator.js';

// ============================================
// Application State
// ============================================
const state = {
  typefaces: [],
  icons: [],
  config: null,
  modal: null,
  theme: null,
  typefaceFilter: null,
  iconFilter: null
};

// ============================================
// GitHub Repository Configuration
// ============================================
const REPO_BASE = 'https://raw.githubusercontent.com/aidenlive/LIBRARY/main';

// ============================================
// Initialize Application
// ============================================
async function init() {
  console.log('🚀 Initializing Asset Library...');

  // Make showToast globally accessible for inline handlers
  window.showToast = showToast;

  // Initialize UI components
  state.modal = new Modal('modal-overlay');
  state.theme = new ThemeManager();
  new Tabs('.tab', '.tab-panel');
  new Dropdown('user-menu-btn', 'user-menu');

  // Set up event listeners
  setupEventListeners();

  // Load data
  await loadTypefaces();
  await loadIcons();

  console.log('✅ Asset Library initialized');
}

// ============================================
// Event Listeners
// ============================================
function setupEventListeners() {
  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle?.addEventListener('click', () => {
    const newTheme = state.theme.toggle();
    showToast(`Switched to ${newTheme} mode`);
  });

  // FAB button
  const fabBtn = document.getElementById('fab-btn');
  fabBtn?.addEventListener('click', () => {
    showToast('Download all assets feature coming soon!');
  });

  // Global search
  const globalSearch = document.getElementById('global-search');
  globalSearch?.addEventListener('input', (e) => {
    const query = e.target.value;

    // Search in active tab
    const activeTab = document.querySelector('.tab.active');
    if (activeTab?.dataset.tab === 'typefaces') {
      state.typefaceFilter?.search(query);
    } else {
      state.iconFilter?.search(query);
    }
  });
}

// ============================================
// Load Typefaces
// ============================================
async function loadTypefaces() {
  console.log('📚 Loading typefaces...');

  try {
    // Generate typeface data from pre-defined list
    state.typefaces = generateTypefaceData(TYPEFACES);

    // Set up filter manager
    state.typefaceFilter = new FilterManager(state.typefaces, renderTypefaces);

    // Set up search and filters
    createSearchHandler(state.typefaceFilter, 'global-search');
    createFilterHandler(state.typefaceFilter, '#typefaces-panel');

    // Initial render
    renderTypefaces(state.typefaces);

    console.log(`✅ Loaded ${state.typefaces.length} typefaces`);
  } catch (error) {
    console.error('Failed to load typefaces:', error);
    showToast('Failed to load typefaces');
  }
}

// ============================================
// Load Icons
// ============================================
async function loadIcons() {
  console.log('🎨 Loading icons...');

  try {
    // Phosphor icon names (using actual Phosphor CSS class names)
    const iconNames = [
      'address-book', 'airplane', 'airplane-in-flight', 'airplane-landing',
      'airplane-takeoff', 'airplane-tilt', 'airplay', 'alarm', 'alien',
      'align-bottom', 'align-center-horizontal', 'align-center-vertical',
      'align-left', 'align-right', 'align-top', 'anchor', 'anchor-simple',
      'android-logo', 'angular-logo', 'aperture', 'app-store-logo',
      'app-window', 'apple-logo', 'apple-podcasts-logo', 'archive', 'armchair',
      'arrow-arc-left', 'arrow-arc-right', 'arrow-bend-down-left', 'arrow-bend-down-right',
      'arrow-circle-down', 'arrow-circle-left', 'arrow-circle-right', 'arrow-circle-up',
      'arrow-clockwise', 'arrow-down', 'arrow-left', 'arrow-right', 'arrow-up',
      'article', 'asterisk', 'at', 'atom', 'baby', 'backpack', 'backspace',
      'bag', 'bag-simple', 'balloon', 'bandaids', 'bank', 'barbell', 'barcode',
      'battery-charging', 'battery-empty', 'battery-full', 'battery-high',
      'battery-low', 'battery-medium', 'battery-warning', 'bell', 'bell-ringing',
      'bell-simple', 'bell-simple-ringing', 'bell-slash', 'bicycle', 'book',
      'book-bookmark', 'book-open', 'bookmark', 'bookmarks', 'briefcase',
      'broadcast', 'bug', 'building', 'calendar', 'calendar-blank', 'camera',
      'car', 'caret-down', 'caret-left', 'caret-right', 'caret-up',
      'chart-bar', 'chart-line', 'chart-pie', 'check', 'check-circle',
      'circle', 'clock', 'cloud', 'code', 'coffee', 'coin', 'compass',
      'copy', 'copyright', 'cpu', 'credit-card', 'crown', 'cube', 'database',
      'desktop', 'download', 'download-simple', 'envelope', 'eye', 'file',
      'flag', 'folder', 'gear', 'gift', 'globe', 'graduation-cap', 'hamburger',
      'heart', 'house', 'image', 'info', 'key', 'lightbulb', 'link', 'lock',
      'magnifying-glass', 'map-pin', 'medal', 'megaphone', 'microphone',
      'moon', 'music-note', 'newspaper', 'note', 'notification', 'paint-brush',
      'paperclip', 'pause', 'pencil', 'phone', 'play', 'plus', 'power',
      'printer', 'question', 'rocket', 'share', 'shield', 'shopping-cart',
      'sign-in', 'sign-out', 'star', 'sun', 'tag', 'target', 'trash',
      'trophy', 'upload', 'user', 'users', 'video', 'warning', 'x'
    ];

    // Create icons with proper category assignment for filtering
    state.icons = [];
    const weights = ['bold', 'regular', 'light', 'fill'];

    iconNames.forEach(name => {
      weights.forEach(weight => {
        state.icons.push({
          name: `${name}-${weight}`,
          displayName: name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          weight,
          category: weight,
          categories: [weight],
          className: `ph-${name}`,
          weightClass: weight === 'regular' ? '' : `ph-${weight}`,
          path: `${REPO_BASE}/icons/phosphor`,
          tags: ['icon', 'phosphor', weight, name.replace(/-/g, ' ')]
        });
      });
    });

    // Set up filter manager
    state.iconFilter = new FilterManager(state.icons, renderIcons);

    // Set up filters
    createFilterHandler(state.iconFilter, '#icons-panel');

    // Initial render
    renderIcons(state.icons);

    console.log(`✅ Loaded ${state.icons.length} icons`);
  } catch (error) {
    console.error('Failed to load icons:', error);
    showToast('Failed to load icons');
  }
}

// ============================================
// Render Typefaces
// ============================================
function renderTypefaces(typefaces) {
  const grid = document.getElementById('typefaces-grid');
  const emptyState = document.getElementById('typefaces-empty');
  const countEl = document.getElementById('typeface-count');

  if (!grid) return;

  // Update count
  if (countEl) {
    countEl.textContent = typefaces.length;
  }

  // Show empty state if no results
  if (typefaces.length === 0) {
    grid.classList.add('hidden');
    emptyState?.classList.remove('hidden');
    return;
  }

  grid.classList.remove('hidden');
  emptyState?.classList.add('hidden');

  // Render typeface cards with actual font preview
  const previewText = "Typography is the art and technique of arranging type to make written language legible, readable and appealing when displayed.";

  grid.innerHTML = typefaces.map(typeface => {
    const fontId = `font-${typeface.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    return `
      <style>
        @font-face {
          font-family: '${typeface.name}';
          src: url('${typeface.fontUrl}') format('opentype');
          font-display: swap;
        }
      </style>
      <article class="card card-interactive hover-lift" data-typeface="${typeface.name}">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-semibold truncate" style="flex: 1; margin-right: 0.5rem;">${typeface.name}</h3>
          <div class="badge badge-subtle">${typeface.category}</div>
        </div>
        <div class="text-xs text-tertiary mb-3">
          ${typeface.variants} variant${typeface.variants !== 1 ? 's' : ''}
        </div>
        <div class="text-base text-primary line-clamp-2" style="font-family: '${typeface.name}', Inter, sans-serif; line-height: 1.4;">
          ${previewText}
        </div>
      </article>
    `;
  }).join('');

  // Add click handlers
  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const name = card.dataset.typeface;
      const typeface = typefaces.find(t => t.name === name);
      showTypefaceModal(typeface);
    });
  });
}

// ============================================
// Render Icons
// ============================================
function renderIcons(icons) {
  const grid = document.getElementById('icons-grid');
  const emptyState = document.getElementById('icons-empty');
  const countEl = document.getElementById('icon-count');

  if (!grid) return;

  // Update count
  if (countEl) {
    countEl.textContent = icons.length;
  }

  // Show empty state if no results
  if (icons.length === 0) {
    grid.classList.add('hidden');
    emptyState?.classList.remove('hidden');
    return;
  }

  grid.classList.remove('hidden');
  emptyState?.classList.add('hidden');

  // Render icon cards
  grid.innerHTML = icons.map(icon => `
    <article class="card card-compact card-interactive hover-lift text-center" data-icon="${icon.name}">
      <div class="stack-sm">
        <div class="flex-center" style="height: 64px;">
          <i class="ph ${icon.weightClass} ${icon.className} text-5xl"></i>
        </div>
        <h4 class="text-sm font-medium truncate">${icon.displayName}</h4>
        <div class="badge badge-subtle capitalize" style="font-size: 10px;">${icon.weight}</div>
      </div>
    </article>
  `).join('');

  // Add click handlers
  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const name = card.dataset.icon;
      const icon = icons.find(i => i.name === name);
      showIconModal(icon);
    });
  });
}

// ============================================
// Helper: Add Syntax Highlighting to Code
// ============================================
function highlightCode(code, language = 'html') {
  // Simple syntax highlighting for HTML, CSS, and JavaScript
  let highlighted = code
    // HTML tags
    .replace(/(&lt;\/?)([a-z][a-z0-9]*)/gi, '$1<span class="token-tag">$2</span>')
    // Attributes
    .replace(/\s([a-z-]+)=/gi, ' <span class="token-attr">$1</span>=')
    // Strings
    .replace(/(["'])([^"']*)\1/g, '<span class="token-string">$1$2$1</span>')
    // CSS properties
    .replace(/([a-z-]+):/gi, '<span class="token-property">$1</span>:')
    // Comments
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token-comment">$1</span>')
    .replace(/(\/\/.*$)/gm, '<span class="token-comment">$1</span>')
    .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="token-comment">$1</span>')
    // Keywords
    .replace(/\b(import|export|function|const|let|var|return|from|style|font-family|src|url|format|font-weight|font-style)\b/g, '<span class="token-keyword">$1</span>');

  return highlighted;
}

// Helper: Escape HTML for safe rendering
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// Modal: Typeface Preview
// ============================================
function showTypefaceModal(typeface) {
  if (!typeface) return;

  // Default preview paragraph - professional and readable
  const defaultPreview = "Typography is the art and technique of arranging type to make written language legible, readable and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing and letter-spacing.";

  // Code examples with syntax highlighting
  const htmlCode = `<!-- Add to your HTML -->
<link rel="stylesheet" href="fonts/${typeface.name}/style.css">

<!-- Use in your HTML -->
<p style="font-family: '${typeface.name}', sans-serif;">
  Your text here
</p>`;

  const cssCode = `/* CSS @font-face declaration */
@font-face {
  font-family: '${typeface.name}';
  src: url('fonts/${typeface.name}/${typeface.name}-Regular.otf') format('opentype');
  font-weight: 400;
  font-style: normal;
}

/* Use in your CSS */
.custom-text {
  font-family: '${typeface.name}', sans-serif;
}`;

  const reactCode = `// Import in your component
import '${typeface.name}/style.css';

// Use in JSX
export function MyComponent() {
  return (
    <p style={{ fontFamily: "'${typeface.name}', sans-serif" }}>
      Your text here
    </p>
  );
}`;

  const swiftCode = `// Add ${typeface.name}.ttf to your Xcode project
// Update Info.plist with font name

// Use in SwiftUI
Text("Your text here")
  .font(.custom("${typeface.name}", size: 16))

// Use in UIKit
let label = UILabel()
label.font = UIFont(name: "${typeface.name}", size: 16)`;

  // Escape and highlight code samples
  const htmlEscaped = highlightCode(escapeHtml(htmlCode));
  const cssEscaped = highlightCode(escapeHtml(cssCode));
  const reactEscaped = highlightCode(escapeHtml(reactCode));
  const swiftEscaped = highlightCode(escapeHtml(swiftCode));

  state.modal.open({
    title: typeface.name,
    body: `
      <div>
        <!-- Metadata Badges -->
        <div class="flex items-center gap-2 flex-wrap" style="margin-bottom: var(--space-4);">
          <div class="badge badge-default">${typeface.category}</div>
          <div class="badge badge-subtle">${typeface.variants} variant${typeface.variants !== 1 ? 's' : ''}</div>
        </div>

        <!-- Segmented Control -->
        <div class="segment-control">
          <button class="segment-button active" data-segment="preview">
            <i class="ph ph-text-aa"></i>
            <span>Preview</span>
          </button>
          <button class="segment-button" data-segment="weights">
            <i class="ph ph-selection-all"></i>
            <span>Weights</span>
          </button>
          <button class="segment-button" data-segment="usage">
            <i class="ph ph-code"></i>
            <span>Usage</span>
          </button>
        </div>

        <!-- Preview Section -->
        <div class="modal-section active" data-section="preview">
          <!-- Professional Editor Controls -->
          <div class="preview-controls">
            <!-- Left: Color Controls -->
            <div class="preview-control-group">
              <div class="preview-control-item">
                <label class="preview-control-label" for="text-color-picker">Text Color</label>
                <input type="color" id="text-color-picker" class="color-picker-input" value="#000000">
              </div>
              <div class="preview-control-item">
                <label class="preview-control-label" for="bg-color-picker">Background</label>
                <input type="color" id="bg-color-picker" class="color-picker-input" value="#f5f5f5">
              </div>
            </div>

            <!-- Right: Size & Weight Controls -->
            <div class="preview-control-group">
              <div class="preview-control-item">
                <label class="preview-control-label" for="font-size-select">Size</label>
                <select id="font-size-select" class="preview-select">
                  <option value="12">12px</option>
                  <option value="14">14px</option>
                  <option value="16">16px</option>
                  <option value="18">18px</option>
                  <option value="20">20px</option>
                  <option value="24">24px</option>
                  <option value="28">28px</option>
                  <option value="32" selected>32px</option>
                  <option value="36">36px</option>
                  <option value="48">48px</option>
                  <option value="64">64px</option>
                  <option value="72">72px</option>
                </select>
              </div>
              <div class="preview-control-item">
                <label class="preview-control-label" for="font-weight-select">Weight</label>
                <select id="font-weight-select" class="preview-select">
                  <option value="100">Thin</option>
                  <option value="200">Extra Light</option>
                  <option value="300">Light</option>
                  <option value="400" selected>Regular</option>
                  <option value="500">Medium</option>
                  <option value="600">Semi Bold</option>
                  <option value="700">Bold</option>
                  <option value="800">Extra Bold</option>
                  <option value="900">Black</option>
                </select>
              </div>
            </div>
          </div>

          <textarea
            class="font-preview-input"
            id="font-preview-text-${typeface.name.replace(/\s/g, '')}"
            placeholder="Type to preview this typeface..."
            style="font-family: '${typeface.name}', Inter, sans-serif; color: #000000; background-color: #f5f5f5; font-size: 32px; font-weight: 400;"
          >${defaultPreview}</textarea>
        </div>

        <!-- Weights Section -->
        <div class="modal-section" data-section="weights">
          <div class="grid grid-mobile-1" style="gap: var(--space-3);">
            ${typeface.weights.map(weight => `
              <div class="weight-preview-card">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-medium text-secondary capitalize">${weight}</span>
                  <span class="badge badge-subtle" style="font-size: 10px;">OTF</span>
                </div>
                <div class="text-lg weight-preview-sample" style="font-family: '${typeface.name}', Inter, sans-serif; line-height: 1.4;">
                  ${defaultPreview.split('.')[0]}.
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Usage Section -->
        <div class="modal-section" data-section="usage">
          <div class="tabs" role="tablist" id="code-tabs" style="margin-bottom: var(--space-3);">
            <button class="tab active" data-code-tab="html">HTML/CSS</button>
            <button class="tab" data-code-tab="react">React</button>
            <button class="tab" data-code-tab="swift">Swift</button>
          </div>

          <div id="code-html" class="code-panel">
            <div class="code-block" style="margin-bottom: var(--space-3);">
              <div class="code-header flex-between">
                <span class="code-title">HTML</span>
                <button class="btn-icon btn-icon-sm btn-ghost copy-code-btn" data-code="${escapeHtml(htmlCode)}">
                  <i class="ph ph-copy"></i>
                </button>
              </div>
              <div class="code-content">
                <pre><code>${htmlEscaped}</code></pre>
              </div>
            </div>
            <div class="code-block">
              <div class="code-header flex-between">
                <span class="code-title">CSS</span>
                <button class="btn-icon btn-icon-sm btn-ghost copy-code-btn" data-code="${escapeHtml(cssCode)}">
                  <i class="ph ph-copy"></i>
                </button>
              </div>
              <div class="code-content">
                <pre><code>${cssEscaped}</code></pre>
              </div>
            </div>
          </div>

          <div id="code-react" class="code-panel hidden">
            <div class="code-block">
              <div class="code-header flex-between">
                <span class="code-title">React</span>
                <button class="btn-icon btn-icon-sm btn-ghost copy-code-btn" data-code="${escapeHtml(reactCode)}">
                  <i class="ph ph-copy"></i>
                </button>
              </div>
              <div class="code-content">
                <pre><code>${reactEscaped}</code></pre>
              </div>
            </div>
          </div>

          <div id="code-swift" class="code-panel hidden">
            <div class="code-block">
              <div class="code-header flex-between">
                <span class="code-title">Swift</span>
                <button class="btn-icon btn-icon-sm btn-ghost copy-code-btn" data-code="${escapeHtml(swiftCode)}">
                  <i class="ph ph-copy"></i>
                </button>
              </div>
              <div class="code-content">
                <pre><code>${swiftEscaped}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    onCopy: () => {
      copyToClipboard(cssCode);
    },
    onDownload: () => {
      window.open(typeface.path, '_blank');
      showToast(`Opening ${typeface.name} in GitHub`);
    }
  });

  // Add event handlers after modal opens
  setTimeout(() => {
    // Segmented control switching
    document.querySelectorAll('.segment-button').forEach(btn => {
      btn.addEventListener('click', () => {
        const segment = btn.dataset.segment;

        // Update buttons
        document.querySelectorAll('.segment-button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update sections
        document.querySelectorAll('.modal-section').forEach(s => s.classList.remove('active'));
        document.querySelector(`[data-section="${segment}"]`).classList.add('active');
      });
    });

    // Code tab switching
    document.querySelectorAll('#code-tabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const codeType = tab.dataset.codeTab;

        // Update tabs
        document.querySelectorAll('#code-tabs .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update panels
        document.querySelectorAll('.code-panel').forEach(p => p.classList.add('hidden'));
        document.getElementById(`code-${codeType}`).classList.remove('hidden');
      });
    });

    // Copy code buttons
    document.querySelectorAll('.copy-code-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code;
        navigator.clipboard.writeText(code).then(() => {
          showToast('Copied to clipboard!');
        });
      });
    });

    // Dynamic text preview update
    const previewInput = document.querySelector('.font-preview-input');
    if (previewInput) {
      previewInput.addEventListener('input', (e) => {
        const text = e.target.value || defaultPreview;
        // Update weight preview samples
        document.querySelectorAll('.weight-preview-sample').forEach(sample => {
          sample.textContent = text.split('.')[0] + '.';
        });
      });
    }

    // Color picker controls
    const textColorPicker = document.getElementById('text-color-picker');
    const bgColorPicker = document.getElementById('bg-color-picker');
    const fontSizeSelect = document.getElementById('font-size-select');
    const fontWeightSelect = document.getElementById('font-weight-select');

    if (textColorPicker && previewInput) {
      textColorPicker.addEventListener('input', (e) => {
        previewInput.style.color = e.target.value;
      });
    }

    if (bgColorPicker && previewInput) {
      bgColorPicker.addEventListener('input', (e) => {
        previewInput.style.backgroundColor = e.target.value;
      });
    }

    // Font size control
    if (fontSizeSelect && previewInput) {
      fontSizeSelect.addEventListener('change', (e) => {
        previewInput.style.fontSize = `${e.target.value}px`;
      });
    }

    // Font weight control
    if (fontWeightSelect && previewInput) {
      fontWeightSelect.addEventListener('change', (e) => {
        previewInput.style.fontWeight = e.target.value;
      });
    }
  }, 100);
}

// ============================================
// Modal: Icon Preview
// ============================================
function showIconModal(icon) {
  if (!icon) return;

  // Get base icon name (without weight suffix)
  const baseName = icon.name.replace(/-(?:bold|regular|light|fill)$/, '');
  const componentName = icon.displayName.replace(/\s+/g, '');

  // Code examples
  const htmlCode = `<!-- Add Phosphor Icons CDN to your HTML -->
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web/src/regular/style.css">

<!-- Use icon in HTML -->
<i class="${icon.className}"></i>

<!-- Different weights -->
<i class="ph-bold ${icon.className}"></i>
<i class="ph-light ${icon.className}"></i>
<i class="ph-fill ${icon.className}"></i>`;

  const cssCode = `/* Style your icon */
.${icon.className} {
  font-size: 24px;
  color: #000;
}

/* Responsive sizing */
@media (max-width: 768px) {
  .${icon.className} {
    font-size: 20px;
  }
}`;

  const reactCode = `// Install: npm install @phosphor-icons/react
import { ${componentName} } from '@phosphor-icons/react';

export function MyComponent() {
  return (
    <div>
      {/* Regular weight */}
      <${componentName} size={32} weight="regular" />

      {/* Other weights */}
      <${componentName} size={32} weight="bold" />
      <${componentName} size={32} weight="light" />
      <${componentName} size={32} weight="fill" />
    </div>
  );
}`;

  const swiftCode = `// Install via SPM: https://github.com/phosphor-icons/phosphor-icons-swift

import SwiftUI
import PhosphorSwift

struct ContentView: View {
  var body: some View {
    // Regular weight
    Image(systemName: "${baseName}")
      .font(.system(size: 24))

    // Different weights
    PhosphorIcon.${baseName}
      .font(.system(size: 24, weight: .bold))
  }
}`;

  // Escape and highlight code
  const htmlEscaped = highlightCode(escapeHtml(htmlCode));
  const cssEscaped = highlightCode(escapeHtml(cssCode));
  const reactEscaped = highlightCode(escapeHtml(reactCode));
  const swiftEscaped = highlightCode(escapeHtml(swiftCode));

  state.modal.open({
    title: icon.displayName,
    body: `
      <div>
        <!-- Metadata Badges -->
        <div class="flex items-center gap-2 flex-wrap" style="margin-bottom: var(--space-4);">
          <div class="badge badge-default">Phosphor Icon</div>
          <div class="badge badge-subtle capitalize">${icon.weight}</div>
        </div>

        <!-- Segmented Control -->
        <div class="segment-control">
          <button class="segment-button active" data-segment="preview">
            <i class="ph ph-eye"></i>
            <span>Preview</span>
          </button>
          <button class="segment-button" data-segment="weights">
            <i class="ph ph-selection-all"></i>
            <span>Weights</span>
          </button>
          <button class="segment-button" data-segment="usage">
            <i class="ph ph-code"></i>
            <span>Usage</span>
          </button>
        </div>

        <!-- Preview Section -->
        <div class="modal-section active" data-section="preview">
          <!-- Professional Editor Controls -->
          <div class="preview-controls">
            <!-- Left: Color Controls -->
            <div class="preview-control-group">
              <div class="preview-control-item">
                <label class="preview-control-label" for="icon-color-picker">Icon Color</label>
                <input type="color" id="icon-color-picker" class="color-picker-input" value="#000000">
              </div>
              <div class="preview-control-item">
                <label class="preview-control-label" for="icon-bg-picker">Background</label>
                <input type="color" id="icon-bg-picker" class="color-picker-input" value="#f5f5f5">
              </div>
            </div>

            <!-- Right: Size Control -->
            <div class="preview-control-group">
              <div class="preview-control-item">
                <label class="preview-control-label" for="icon-size-select">Size</label>
                <select id="icon-size-select" class="preview-select">
                  <option value="24">24px</option>
                  <option value="32">32px</option>
                  <option value="48">48px</option>
                  <option value="64">64px</option>
                  <option value="96">96px</option>
                  <option value="128" selected>128px</option>
                  <option value="160">160px</option>
                  <option value="192">192px</option>
                  <option value="256">256px</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex-center" id="icon-preview-container" style="background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%); border-radius: var(--radius-xl); min-height: 480px; border: 2px solid var(--color-border-default); transition: background var(--transition-base);">
            <i class="ph ${icon.weightClass} ${icon.className}" id="icon-preview-element" style="font-size: 128px; color: #000000; transition: all var(--transition-base);"></i>
          </div>
        </div>

        <!-- Weights Section -->
        <div class="modal-section" data-section="weights">
          <div class="grid grid-mobile-2 grid-tablet-3" style="gap: var(--space-3);">
            ${['regular', 'bold', 'light', 'fill', 'thin', 'duotone'].map(weight => `
              <div class="weight-preview-card text-center">
                <i class="ph-${weight} ${icon.className}" style="font-size: 48px; color: var(--color-icon-primary); margin-bottom: var(--space-2);"></i>
                <div class="text-xs font-medium text-secondary capitalize">${weight}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Usage Section -->
        <div class="modal-section" data-section="usage">
          <div class="tabs" role="tablist" id="code-tabs-icon" style="margin-bottom: var(--space-3);">
            <button class="tab active" data-code-tab="html">HTML/CSS</button>
            <button class="tab" data-code-tab="react">React</button>
            <button class="tab" data-code-tab="swift">Swift</button>
          </div>

          <div id="code-icon-html" class="code-panel">
            <div class="code-block" style="margin-bottom: var(--space-3);">
              <div class="code-header flex-between">
                <span class="code-title">HTML</span>
                <button class="btn-icon btn-icon-sm btn-ghost copy-code-btn" data-code="${escapeHtml(htmlCode)}">
                  <i class="ph ph-copy"></i>
                </button>
              </div>
              <div class="code-content">
                <pre><code>${htmlEscaped}</code></pre>
              </div>
            </div>
            <div class="code-block">
              <div class="code-header flex-between">
                <span class="code-title">CSS</span>
                <button class="btn-icon btn-icon-sm btn-ghost copy-code-btn" data-code="${escapeHtml(cssCode)}">
                  <i class="ph ph-copy"></i>
                </button>
              </div>
              <div class="code-content">
                <pre><code>${cssEscaped}</code></pre>
              </div>
            </div>
          </div>

          <div id="code-icon-react" class="code-panel hidden">
            <div class="code-block">
              <div class="code-header flex-between">
                <span class="code-title">React</span>
                <button class="btn-icon btn-icon-sm btn-ghost copy-code-btn" data-code="${escapeHtml(reactCode)}">
                  <i class="ph ph-copy"></i>
                </button>
              </div>
              <div class="code-content">
                <pre><code>${reactEscaped}</code></pre>
              </div>
            </div>
          </div>

          <div id="code-icon-swift" class="code-panel hidden">
            <div class="code-block">
              <div class="code-header flex-between">
                <span class="code-title">Swift</span>
                <button class="btn-icon btn-icon-sm btn-ghost copy-code-btn" data-code="${escapeHtml(swiftCode)}">
                  <i class="ph ph-copy"></i>
                </button>
              </div>
              <div class="code-content">
                <pre><code>${swiftEscaped}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    onCopy: () => {
      copyToClipboard(htmlCode);
    },
    onDownload: () => {
      window.open(icon.path, '_blank');
      showToast(`Opening ${icon.displayName} in GitHub`);
    }
  });

  // Add event handlers after modal opens
  setTimeout(() => {
    // Segmented control switching
    document.querySelectorAll('.segment-button').forEach(btn => {
      btn.addEventListener('click', () => {
        const segment = btn.dataset.segment;

        // Update buttons
        document.querySelectorAll('.segment-button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update sections
        document.querySelectorAll('.modal-section').forEach(s => s.classList.remove('active'));
        document.querySelector(`[data-section="${segment}"]`).classList.add('active');
      });
    });

    // Code tab switching
    document.querySelectorAll('#code-tabs-icon .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const codeType = tab.dataset.codeTab;

        // Update tabs
        document.querySelectorAll('#code-tabs-icon .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update panels
        document.querySelectorAll('.code-panel').forEach(p => p.classList.add('hidden'));
        document.getElementById(`code-icon-${codeType}`).classList.remove('hidden');
      });
    });

    // Copy code buttons
    document.querySelectorAll('.copy-code-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code;
        navigator.clipboard.writeText(code).then(() => {
          showToast('Copied to clipboard!');
        });
      });
    });

    // Icon color picker controls
    const iconColorPicker = document.getElementById('icon-color-picker');
    const iconBgPicker = document.getElementById('icon-bg-picker');
    const iconSizeSelect = document.getElementById('icon-size-select');
    const iconPreviewElement = document.getElementById('icon-preview-element');
    const iconPreviewContainer = document.getElementById('icon-preview-container');

    if (iconColorPicker && iconPreviewElement) {
      iconColorPicker.addEventListener('input', (e) => {
        iconPreviewElement.style.color = e.target.value;
      });
    }

    if (iconBgPicker && iconPreviewContainer) {
      iconBgPicker.addEventListener('input', (e) => {
        const color = e.target.value;
        // Create a lighter gradient based on the selected color
        iconPreviewContainer.style.background = `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`;
      });
    }

    // Icon size control
    if (iconSizeSelect && iconPreviewElement) {
      iconSizeSelect.addEventListener('change', (e) => {
        iconPreviewElement.style.fontSize = `${e.target.value}px`;
      });
    }
  }, 100);
}

// ============================================
// Helper: Infer typeface category
// ============================================
function inferCategory(name) {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('mono') || lowerName.includes('code')) {
    return 'mono';
  }
  if (lowerName.includes('serif')) {
    return 'serif';
  }
  if (/[A-Z][A-Z]/.test(name)) {
    return 'display';
  }

  return 'sans-serif';
}

// ============================================
// Start Application
// ============================================
init();
