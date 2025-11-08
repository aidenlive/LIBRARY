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
    // Sample icon names from Phosphor
    const iconNames = [
      'AddressBook', 'Acorn', 'Airplane', 'AirplaneInFlight', 'AirplaneLanding',
      'AirplaneTakeoff', 'AirplaneTilt', 'Airplay', 'Alarm', 'Alien', 'AlignBottom',
      'AlignCenterHorizontal', 'AlignCenterVertical', 'AlignLeft', 'AlignRight',
      'AlignTop', 'Anchor', 'AnchorSimple', 'AndroidLogo', 'Angle', 'AngularLogo',
      'Aperture', 'AppStoreLogo', 'AppWindow', 'AppleLogo', 'ApplePodcastsLogo',
      'Archive', 'Armchair', 'ArrowArcLeft', 'ArrowArcRight'
      // Note: Full list would include all 1,512+ icons
    ];

    state.icons = iconNames.map(name => ({
      name,
      category: 'bold',
      categories: ['bold', 'regular', 'light', 'fill'],
      component: `${name}Bold`,
      path: `${REPO_BASE}/icons/phosphor/react/bold/${name}Bold.tsx`,
      tags: ['icon', 'phosphor', 'react']
    }));

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

  // Render typeface cards
  grid.innerHTML = typefaces.map(typeface => `
    <article class="card card-interactive hover-lift" data-typeface="${typeface.name}">
      <div class="stack-sm">
        <h3 class="text-xl font-semibold truncate">${typeface.name}</h3>
        <div class="badge badge-default">${typeface.category}</div>
        <div class="mt-4 text-sm text-secondary line-clamp-2" style="font-family: Inter">
          ${typeface.preview}
        </div>
      </div>
    </article>
  `).join('');

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
          <i class="ph ph-${icon.name.toLowerCase()} text-5xl"></i>
        </div>
        <h4 class="text-sm font-medium truncate">${icon.name}</h4>
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
// Modal: Typeface Preview
// ============================================
function showTypefaceModal(typeface) {
  if (!typeface) return;

  const downloadUrl = typeface.path;
  const cssCode = `@font-face {
  font-family: '${typeface.name}';
  src: url('${downloadUrl}/font.otf') format('opentype');
  font-weight: normal;
  font-style: normal;
}`;

  state.modal.open({
    title: typeface.name,
    body: `
      <div class="stack-lg">
        <div class="badge badge-default">${typeface.category}</div>

        <div class="stack">
          <h3 class="text-2xl" style="font-family: Inter">${typeface.preview}</h3>
          <p class="text-sm text-tertiary">Preview with Inter font (actual font files available in repository)</p>
        </div>

        <div class="code-block">
          <div class="code-header">
            <span class="code-title">CSS</span>
          </div>
          <div class="code-content">
            <pre><code>${cssCode}</code></pre>
          </div>
        </div>

        <div class="flex gap-2 flex-wrap">
          ${typeface.tags.map(tag => `<span class="badge badge-subtle">${tag}</span>`).join('')}
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
}

// ============================================
// Modal: Icon Preview
// ============================================
function showIconModal(icon) {
  if (!icon) return;

  const reactCode = `import { ${icon.component} } from '@phosphor-icons/react';

function MyComponent() {
  return <${icon.component} size={32} weight="bold" />;
}`;

  state.modal.open({
    title: icon.name,
    body: `
      <div class="stack-lg">
        <div class="flex-center bg-surface-2 rounded-xl" style="height: 200px;">
          <i class="ph ph-${icon.name.toLowerCase()}" style="font-size: 128px;"></i>
        </div>

        <div class="code-block">
          <div class="code-header">
            <span class="code-title">React Component</span>
          </div>
          <div class="code-content">
            <pre><code>${reactCode}</code></pre>
          </div>
        </div>

        <div class="flex gap-2">
          ${icon.tags.map(tag => `<span class="badge badge-subtle">${tag}</span>`).join('')}
        </div>
      </div>
    `,
    onCopy: () => {
      copyToClipboard(reactCode);
    },
    onDownload: () => {
      window.open(icon.path, '_blank');
      showToast(`Opening ${icon.name} in GitHub`);
    }
  });
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
