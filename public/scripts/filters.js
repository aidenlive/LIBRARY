/**
 * Filtering and Search Functions
 * Handles search, filtering, and data manipulation
 */

import { debounce, toggleEmptyState } from './ui-helpers.js';

export class FilterManager {
  constructor(items = [], renderCallback) {
    this.allItems = items;
    this.filteredItems = items;
    this.renderCallback = renderCallback;
    this.activeFilters = new Set(['all']);
    this.searchQuery = '';
  }

  setItems(items) {
    this.allItems = items;
    this.applyFilters();
  }

  search(query) {
    this.searchQuery = query.toLowerCase().trim();
    this.applyFilters();
  }

  filter(filterValue) {
    if (filterValue === 'all') {
      this.activeFilters.clear();
      this.activeFilters.add('all');
    } else {
      this.activeFilters.delete('all');

      if (this.activeFilters.has(filterValue)) {
        this.activeFilters.delete(filterValue);
      } else {
        this.activeFilters.add(filterValue);
      }

      // If no filters selected, default to 'all'
      if (this.activeFilters.size === 0) {
        this.activeFilters.add('all');
      }
    }

    this.applyFilters();
  }

  applyFilters() {
    let results = [...this.allItems];

    // Apply search filter
    if (this.searchQuery) {
      results = results.filter(item =>
        item.name.toLowerCase().includes(this.searchQuery) ||
        item.category?.toLowerCase().includes(this.searchQuery) ||
        item.tags?.some(tag => tag.toLowerCase().includes(this.searchQuery))
      );
    }

    // Apply category filters
    if (!this.activeFilters.has('all')) {
      results = results.filter(item =>
        item.categories?.some(cat => this.activeFilters.has(cat)) ||
        this.activeFilters.has(item.category)
      );
    }

    this.filteredItems = results;
    this.renderCallback(results);

    return results;
  }

  getFilteredItems() {
    return this.filteredItems;
  }

  getCount() {
    return this.filteredItems.length;
  }
}

// Search handler with debounce
export function createSearchHandler(filterManager, inputId) {
  const input = document.getElementById(inputId);

  if (!input) return;

  const debouncedSearch = debounce((query) => {
    filterManager.search(query);
  }, 300);

  input.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
  });
}

// Filter chip handler
export function createFilterHandler(filterManager, containerSelector) {
  const chips = document.querySelectorAll(`${containerSelector} .chip[data-filter]`);

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const filterValue = chip.dataset.filter;
      filterManager.filter(filterValue);

      // Update active state
      updateFilterChipStates(chips, filterManager.activeFilters);
    });
  });
}

function updateFilterChipStates(chips, activeFilters) {
  chips.forEach(chip => {
    const filterValue = chip.dataset.filter;
    const isActive = activeFilters.has(filterValue);

    chip.style.backgroundColor = isActive
      ? 'var(--color-surface-3)'
      : 'var(--color-surface-2)';
    chip.style.borderColor = isActive
      ? 'var(--color-border-default)'
      : 'transparent';
  });
}

// Sort utilities
export function sortBy(items, key, order = 'asc') {
  return [...items].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (typeof aVal === 'string') {
      return order === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return order === 'asc' ? aVal - bVal : bVal - aVal;
  });
}

// Group items by category
export function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const value = item[key];
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(item);
    return groups;
  }, {});
}
