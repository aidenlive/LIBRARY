/**
 * UI Helper Functions
 * Handles UI interactions, modals, toasts, dropdowns
 */

// Toast notification
export function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  const messageEl = document.getElementById('toast-message');

  if (!toast || !messageEl) return;

  messageEl.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// Modal management
export class Modal {
  constructor(overlayId = 'modal-overlay') {
    this.overlay = document.getElementById(overlayId);
    this.modal = this.overlay?.querySelector('.modal');
    this.titleEl = document.getElementById('modal-title');
    this.bodyEl = document.getElementById('modal-body');
    this.closeBtn = document.getElementById('modal-close');
    this.copyBtn = document.getElementById('modal-copy');
    this.downloadBtn = document.getElementById('modal-download');

    this.init();
  }

  init() {
    if (!this.overlay) return;

    // Close on overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Close button
    this.closeBtn?.addEventListener('click', () => this.close());

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.overlay.classList.contains('hidden')) {
        this.close();
      }
    });
  }

  open({ title, body, onCopy, onDownload }) {
    if (!this.overlay) return;

    if (title) this.titleEl.textContent = title;
    if (body) this.bodyEl.innerHTML = body;

    // Set up action handlers
    if (this.copyBtn) {
      this.copyBtn.onclick = onCopy || null;
    }

    if (this.downloadBtn) {
      this.downloadBtn.onclick = onDownload || null;
    }

    this.overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (!this.overlay) return;

    this.overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// Dropdown management
export class Dropdown {
  constructor(triggerId, menuId) {
    this.trigger = document.getElementById(triggerId);
    this.menu = document.getElementById(menuId);
    this.isOpen = false;

    this.init();
  }

  init() {
    if (!this.trigger || !this.menu) return;

    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // Close on outside click
    document.addEventListener('click', () => {
      if (this.isOpen) this.close();
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.menu.classList.add('open');
    this.isOpen = true;
  }

  close() {
    this.menu.classList.remove('open');
    this.isOpen = false;
  }
}

// Tab management
export class Tabs {
  constructor(tabsSelector = '.tab', panelsSelector = '.tab-panel') {
    this.tabs = document.querySelectorAll(tabsSelector);
    this.panels = document.querySelectorAll(panelsSelector);

    this.init();
  }

  init() {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab));
    });
  }

  switchTab(selectedTab) {
    const targetPanel = selectedTab.dataset.tab;

    // Update tabs
    this.tabs.forEach(tab => {
      const isSelected = tab === selectedTab;
      tab.classList.toggle('active', isSelected);
      tab.setAttribute('aria-selected', isSelected);
    });

    // Update panels
    this.panels.forEach(panel => {
      const shouldShow = panel.id === `${targetPanel}-panel`;
      panel.classList.toggle('hidden', !shouldShow);
      panel.classList.toggle('active', shouldShow);
    });
  }
}

// Copy to clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    showToast('Failed to copy');
    return false;
  }
}

// Download file helper
export function downloadFile(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  showToast(`Downloading ${filename}`);
}

// Debounce utility
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Theme toggle
export class ThemeManager {
  constructor() {
    this.theme = this.getPreferredTheme();
    this.init();
  }

  init() {
    this.applyTheme(this.theme);
  }

  getPreferredTheme() {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.theme = theme;
  }

  toggle() {
    const newTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    return newTheme;
  }
}

// Loading state management
export function setLoadingState(element, isLoading) {
  if (!element) return;

  if (isLoading) {
    element.classList.add('skeleton');
  } else {
    element.classList.remove('skeleton');
  }
}

// Empty state management
export function toggleEmptyState(gridId, emptyStateId, isEmpty) {
  const grid = document.getElementById(gridId);
  const emptyState = document.getElementById(emptyStateId);

  if (grid) {
    grid.classList.toggle('hidden', isEmpty);
  }

  if (emptyState) {
    emptyState.classList.toggle('hidden', !isEmpty);
  }
}
