/**
 * Filter & Search Utilities
 * Search and filter functionality for fonts and icons
 */

/**
 * Search filter - filters array by search term
 */
export function filterBySearch(items, searchTerm, searchFields = ['name']) {
  if (!searchTerm || searchTerm.trim() === '') {
    return items;
  }

  const term = searchTerm.toLowerCase().trim();
  
  return items.filter(item => {
    return searchFields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(term);
      }
      return false;
    });
  });
}

/**
 * Filter by category/tag
 */
export function filterByCategory(items, category, categoryField = 'category') {
  if (!category || category === 'all') {
    return items;
  }

  return items.filter(item => {
    const itemCategory = item[categoryField];
    if (Array.isArray(itemCategory)) {
      return itemCategory.includes(category);
    }
    return itemCategory === category;
  });
}

/**
 * Filter by variant (for icons)
 */
export function filterByVariant(items, variant, variantField = 'variants') {
  if (!variant || variant === 'all') {
    return items;
  }

  return items.filter(item => {
    const variants = item[variantField];
    if (Array.isArray(variants)) {
      return variants.includes(variant);
    }
    return variants === variant;
  });
}

/**
 * Sort items
 */
export function sortItems(items, sortBy = 'name', order = 'asc') {
  const sorted = [...items].sort((a, b) => {
    const aVal = a[sortBy] || '';
    const bVal = b[sortBy] || '';
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal);
    }
    
    return aVal - bVal;
  });

  return order === 'desc' ? sorted.reverse() : sorted;
}

/**
 * Combined filter function
 */
export function applyFilters(items, filters = {}) {
  let filtered = [...items];

  // Search filter
  if (filters.search) {
    filtered = filterBySearch(filtered, filters.search, filters.searchFields);
  }

  // Category filter
  if (filters.category) {
    filtered = filterByCategory(filtered, filters.category, filters.categoryField);
  }

  // Variant filter
  if (filters.variant) {
    filtered = filterByVariant(filtered, filters.variant, filters.variantField);
  }

  // Sort
  if (filters.sortBy) {
    filtered = sortItems(filtered, filters.sortBy, filters.order || 'asc');
  }

  return filtered;
}

/**
 * Virtual scrolling helper - get visible items
 */
export function getVisibleItems(allItems, containerHeight, itemHeight, scrollTop) {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    allItems.length
  );

  return {
    items: allItems.slice(startIndex, endIndex),
    startIndex,
    endIndex,
    totalHeight: allItems.length * itemHeight
  };
}

/**
 * Group items by first letter (for alphabetized lists)
 */
export function groupByFirstLetter(items, nameField = 'name') {
  const groups = {};
  
  items.forEach(item => {
    const name = item[nameField] || '';
    const firstLetter = name.charAt(0).toUpperCase();
    if (!groups[firstLetter]) {
      groups[firstLetter] = [];
    }
    groups[firstLetter].push(item);
  });

  return Object.keys(groups)
    .sort()
    .map(letter => ({
      letter,
      items: groups[letter]
    }));
}

