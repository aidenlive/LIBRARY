/**
 * Font Loader
 * Handles lazy loading of fonts using Intersection Observer
 * and the CSS Font Loading API
 */

// Font loading states
export const FontLoadState = {
  UNLOADED: 'unloaded',
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error'
};

/**
 * Font Loader Class
 * Manages font loading with priority queue and caching
 */
export class FontLoader {
  constructor(options = {}) {
    this.fonts = new Map(); // fontFamily -> { state, font, url }
    this.loadQueue = [];
    this.concurrent = options.concurrent || 6; // Max concurrent loads
    this.activeLoads = 0;
    this.timeout = options.timeout || 10000; // 10 seconds
    this.observer = null;
    this.onProgress = options.onProgress || null;
    this.onError = options.onError || null;

    // Check if Font Loading API is supported
    this.supported = 'fonts' in document;
    if (!this.supported) {
      console.warn('CSS Font Loading API not supported, using fallback');
    }
  }

  /**
   * Initialize Intersection Observer for lazy loading
   */
  initObserver(callback) {
    if (this.observer) {
      return this.observer;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const fontFamily = entry.target.dataset.fontFamily;
            const fontUrl = entry.target.dataset.fontUrl;

            if (fontFamily && fontUrl) {
              // Trigger font load
              this.loadFont(fontFamily, fontUrl, 1)
                .then(() => {
                  // Dispatch custom event on the element
                  const event = new CustomEvent('fontload-trigger', {
                    detail: { fontFamily, state: 'loaded' }
                  });
                  entry.target.dispatchEvent(event);
                })
                .catch(err => {
                  console.warn(`Font load failed for ${fontFamily}:`, err);
                  const event = new CustomEvent('fontload-trigger', {
                    detail: { fontFamily, state: 'error', error: err }
                  });
                  entry.target.dispatchEvent(event);
                });

              // Unobserve after triggering (load only once)
              this.observer.unobserve(entry.target);
            }

            // Also call the callback if provided
            if (callback) {
              callback(fontFamily, entry.target);
            }
          }
        });
      },
      {
        rootMargin: '200px', // Preload fonts 200px before they enter viewport
        threshold: 0.01
      }
    );

    return this.observer;
  }

  /**
   * Observe an element for font loading
   */
  observe(element, fontFamily) {
    if (!this.observer) {
      this.initObserver((family, el) => {
        this.loadFont(family, el.dataset.fontUrl);
      });
    }

    element.dataset.fontFamily = fontFamily;
    this.observer.observe(element);
  }

  /**
   * Stop observing an element
   */
  unobserve(element) {
    if (this.observer) {
      this.observer.unobserve(element);
    }
  }

  /**
   * Load a font using CSS Font Loading API
   */
  async loadFont(fontFamily, url, priority = 1) {
    // Check if already loaded or loading
    if (this.fonts.has(fontFamily)) {
      const existing = this.fonts.get(fontFamily);
      if (existing.state === FontLoadState.LOADED) {
        return existing.font;
      }
      if (existing.state === FontLoadState.LOADING) {
        return existing.promise;
      }
    }

    // Create font load promise
    const loadPromise = this._loadFontFile(fontFamily, url);

    // Track state
    this.fonts.set(fontFamily, {
      state: FontLoadState.LOADING,
      url,
      promise: loadPromise,
      priority
    });

    // Add to queue
    this.loadQueue.push({ fontFamily, url, priority, promise: loadPromise });

    // Start processing queue
    this._processQueue();

    return loadPromise;
  }

  /**
   * Internal method to load font file
   */
  async _loadFontFile(fontFamily, url) {
    try {
      // Use CSS Font Loading API if supported
      if (this.supported) {
        const fontFace = new FontFace(fontFamily, `url(${url})`);

        // Add timeout
        const loadPromise = Promise.race([
          fontFace.load(),
          this._timeout(this.timeout, fontFamily)
        ]);

        const loadedFont = await loadPromise;
        document.fonts.add(loadedFont);

        // Update state
        const fontData = this.fonts.get(fontFamily);
        if (fontData) {
          fontData.state = FontLoadState.LOADED;
          fontData.font = loadedFont;
        }

        console.log(`✅ Loaded font: ${fontFamily}`);
        return loadedFont;

      } else {
        // Fallback: Create style element with @font-face
        this._loadFontFallback(fontFamily, url);

        // Update state
        const fontData = this.fonts.get(fontFamily);
        if (fontData) {
          fontData.state = FontLoadState.LOADED;
        }

        console.log(`✅ Loaded font (fallback): ${fontFamily}`);
        return { family: fontFamily };
      }

    } catch (error) {
      console.error(`❌ Failed to load font ${fontFamily}:`, error);

      // Update state
      const fontData = this.fonts.get(fontFamily);
      if (fontData) {
        fontData.state = FontLoadState.ERROR;
        fontData.error = error;
      }

      if (this.onError) {
        this.onError(fontFamily, error);
      }

      throw error;
    }
  }

  /**
   * Fallback method using @font-face CSS
   */
  _loadFontFallback(fontFamily, url) {
    const styleId = `font-${fontFamily.replace(/\s+/g, '-')}`;

    // Check if already added
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @font-face {
        font-family: '${fontFamily}';
        src: url('${url}') format('opentype'),
             url('${url}') format('truetype');
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Timeout promise helper
   */
  _timeout(ms, fontFamily) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Font loading timeout: ${fontFamily}`));
      }, ms);
    });
  }

  /**
   * Process load queue with concurrency control
   */
  async _processQueue() {
    // Don't start new loads if at max concurrent
    if (this.activeLoads >= this.concurrent) {
      return;
    }

    // Sort queue by priority (lower = higher priority)
    this.loadQueue.sort((a, b) => a.priority - b.priority);

    // Process items
    while (this.activeLoads < this.concurrent && this.loadQueue.length > 0) {
      const item = this.loadQueue.shift();
      if (!item) break;

      this.activeLoads++;

      // Wait for load to complete
      item.promise
        .catch(() => {
          // Error already handled in _loadFontFile
        })
        .finally(() => {
          this.activeLoads--;
          this._processQueue(); // Process next item
        });
    }
  }

  /**
   * Preload multiple fonts
   */
  async preload(fonts, priority = 0) {
    const promises = fonts.map(font =>
      this.loadFont(font.family, font.url, priority)
        .catch(err => {
          console.warn(`Failed to preload ${font.family}:`, err);
          return null;
        })
    );

    const results = await Promise.allSettled(promises);

    const loaded = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
    console.log(`📦 Preloaded ${loaded}/${fonts.length} fonts`);

    return results;
  }

  /**
   * Get font loading state
   */
  getState(fontFamily) {
    const font = this.fonts.get(fontFamily);
    return font ? font.state : FontLoadState.UNLOADED;
  }

  /**
   * Check if font is loaded
   */
  isLoaded(fontFamily) {
    return this.getState(fontFamily) === FontLoadState.LOADED;
  }

  /**
   * Get loading stats
   */
  getStats() {
    const stats = {
      total: this.fonts.size,
      loaded: 0,
      loading: 0,
      error: 0,
      unloaded: 0
    };

    this.fonts.forEach(font => {
      switch (font.state) {
        case FontLoadState.LOADED:
          stats.loaded++;
          break;
        case FontLoadState.LOADING:
          stats.loading++;
          break;
        case FontLoadState.ERROR:
          stats.error++;
          break;
        default:
          stats.unloaded++;
      }
    });

    return stats;
  }

  /**
   * Clear all fonts
   */
  clear() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.fonts.clear();
    this.loadQueue = [];
    this.activeLoads = 0;
  }

  /**
   * Disconnect observer
   */
  destroy() {
    this.clear();
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

/**
 * Create a global font loader instance
 */
export function createFontLoader(options) {
  return new FontLoader(options);
}
