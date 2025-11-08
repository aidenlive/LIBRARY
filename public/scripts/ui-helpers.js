/**
 * UI Helpers
 * Modal management, code snippet generation, and utility functions
 */

/**
 * Modal Management
 */
export class Modal {
  constructor(modalId) {
    this.modal = document.getElementById(modalId);
    this.backdrop = document.querySelector('.modal-backdrop');
    this.closeBtn = this.modal?.querySelector('.modal-close');
    this.isOpen = false;
    
    if (!this.modal) {
      console.warn(`Modal with id "${modalId}" not found`);
      return;
    }

    this.init();
  }

  init() {
    // Close button
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Backdrop click
    if (this.backdrop) {
      this.backdrop.addEventListener('click', (e) => {
        if (e.target === this.backdrop) {
          this.close();
        }
      });
    }

    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Trap focus within modal
    this.setupFocusTrap();
  }

  setupFocusTrap() {
    const focusableElements = this.modal.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    
    this.firstFocusable = focusableElements[0];
    this.lastFocusable = focusableElements[focusableElements.length - 1];

    this.modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === this.firstFocusable) {
          e.preventDefault();
          this.lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === this.lastFocusable) {
          e.preventDefault();
          this.firstFocusable?.focus();
        }
      }
    });
  }

  open() {
    if (!this.modal) return;
    
    this.isOpen = true;
    this.modal.classList.add('active');
    if (this.backdrop) {
      this.backdrop.classList.add('active');
    }
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus first focusable element
    this.firstFocusable?.focus();
    
    // Dispatch custom event
    this.modal.dispatchEvent(new CustomEvent('modal:open'));
  }

  close() {
    if (!this.modal) return;
    
    this.isOpen = false;
    this.modal.classList.remove('active');
    if (this.backdrop) {
      this.backdrop.classList.remove('active');
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Dispatch custom event
    this.modal.dispatchEvent(new CustomEvent('modal:close'));
  }

  setContent(title, body) {
    if (!this.modal) return;
    
    const titleEl = this.modal.querySelector('.modal-title');
    const bodyEl = this.modal.querySelector('.modal-body');
    
    if (titleEl && title) {
      titleEl.textContent = title;
    }
    
    if (bodyEl && body) {
      if (typeof body === 'string') {
        bodyEl.innerHTML = body;
      } else {
        bodyEl.innerHTML = '';
        bodyEl.appendChild(body);
      }
    }
  }
}

/**
 * Code Snippet Generator
 */
export class CodeSnippet {
  static generateFontFace(fontFamily, fontPath, weight = '400', style = 'normal', format = 'truetype') {
    const formatMap = {
      'truetype': 'truetype',
      'opentype': 'opentype',
      'woff': 'woff',
      'woff2': 'woff2'
    };

    const formatValue = formatMap[format] || format;
    const weightValue = weight === 'normal' ? '400' : weight;
    const styleValue = style === 'normal' ? 'normal' : style;

    return `@font-face {
  font-family: '${fontFamily}';
  src: url('${fontPath}') format('${formatValue}');
  font-weight: ${weightValue};
  font-style: ${styleValue};
  font-display: swap;
}`;
  }

  static generateFontCSS(fontFamily, className = null) {
    const selector = className || `.${fontFamily.toLowerCase().replace(/\s+/g, '-')}`;
    return `${selector} {
  font-family: '${fontFamily}', sans-serif;
}`;
  }

  static generateSVGInline(svgContent) {
    return svgContent.trim();
  }

  static generateReactImport(iconName, variant = 'regular') {
    const componentName = this.toPascalCase(iconName) + this.capitalize(variant);
    return `import { ${componentName} } from '@library/icons/phosphor/react/${variant}';`;
  }

  static generateReactUsage(iconName, variant = 'regular', size = 24) {
    const componentName = this.toPascalCase(iconName) + this.capitalize(variant);
    return `<${componentName} size={${size}} color="#000" />`;
  }

  static generateCSSBackground(iconPath) {
    return `background-image: url('${iconPath}');
background-size: contain;
background-repeat: no-repeat;
background-position: center;`;
  }

  static toPascalCase(str) {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * Copy to Clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (err) {
      document.body.removeChild(textarea);
      return false;
    }
  }
}

/**
 * Show Toast Notification
 */
export function showToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-bg-inverse);
    color: var(--color-text-inverse);
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: var(--shadow-lg);
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });
  
  // Remove after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, duration);
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
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

/**
 * Throttle function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

