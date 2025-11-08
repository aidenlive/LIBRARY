/**
 * Main Application
 * Initializes app and coordinates modules
 */

import { debounce } from './ui-helpers.js';

/**
 * Initialize application
 */
export function initApp() {
  // Initialize modals
  initModals();
  
  // Initialize search
  initSearch();
  
  // Initialize filters
  initFilters();
  
  // Initialize code snippet copy buttons
  initCodeSnippets();
}

/**
 * Initialize modal system
 */
async function initModals() {
  // Create backdrop if it doesn't exist
  if (!document.querySelector('.modal-backdrop')) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);
  }

  // Initialize all modals on the page
  const { Modal } = await import('./ui-helpers.js');
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    const modalId = modal.id;
    if (modalId) {
      window[`modal_${modalId}`] = new Modal(modalId);
    }
  });
}

/**
 * Initialize search functionality
 */
function initSearch() {
  const searchInputs = document.querySelectorAll('.search-input');
  
  searchInputs.forEach(input => {
    const debouncedSearch = debounce(() => {
      const searchTerm = input.value;
      const event = new CustomEvent('search:change', {
        detail: { searchTerm }
      });
      input.dispatchEvent(event);
    }, 300);

    input.addEventListener('input', debouncedSearch);
  });
}

/**
 * Initialize filter buttons
 */
function initFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filterGroup = btn.closest('.filter-group');
      if (filterGroup) {
        // Remove active class from siblings
        filterGroup.querySelectorAll('.filter-btn').forEach(b => {
          b.classList.remove('active');
        });
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Dispatch filter change event
        const filterValue = btn.dataset.filter || btn.textContent.trim();
        const event = new CustomEvent('filter:change', {
          detail: { filter: filterValue }
        });
        btn.dispatchEvent(event);
      }
    });
  });
}

/**
 * Initialize code snippet copy buttons
 */
function initCodeSnippets() {
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('code-snippet-copy')) {
      const codeSnippet = e.target.closest('.code-snippet');
      if (codeSnippet) {
        const code = codeSnippet.querySelector('pre')?.textContent || 
                     codeSnippet.textContent.trim();
        
        const { copyToClipboard, showToast } = await import('./ui-helpers.js');
        const success = await copyToClipboard(code);
        
        if (success) {
          showToast('Code copied to clipboard!');
          e.target.textContent = 'Copied!';
          setTimeout(() => {
            e.target.textContent = 'Copy';
          }, 2000);
        } else {
          showToast('Failed to copy code');
        }
      }
    }
  });
}

/**
 * Open modal helper
 */
export async function openModal(modalId, title, content) {
  const modalVar = window[`modal_${modalId}`];
  if (modalVar) {
    if (title || content) {
      modalVar.setContent(title, content);
    }
    modalVar.open();
  } else {
    // Initialize modal if not already initialized
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
      const { Modal } = await import('./ui-helpers.js');
      const modal = new Modal(modalId);
      window[`modal_${modalId}`] = modal;
      if (title || content) {
        modal.setContent(title, content);
      }
      modal.open();
    } else {
      console.warn(`Modal element with id "${modalId}" not found`);
    }
  }
}

/**
 * Close modal helper
 */
export function closeModal(modalId) {
  const modalVar = window[`modal_${modalId}`];
  if (modalVar) {
    modalVar.close();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

