/**
 * PC Builder Pro - LocalStorage Management
 */

const Storage = {
  KEYS: {
    WISHLIST: 'pcbuilder_wishlist',
    SAVED_BUILDS: 'pcbuilder_saved_builds',
    CURRENT_BUILD: 'pcbuilder_current_build',
    COMPARE: 'pcbuilder_compare',
    THEME: 'pcbuilder_theme',
    RECENT_SEARCHES: 'pcbuilder_recent_searches'
  },

  get(key, fallback = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  /* Wishlist */
  getWishlist() {
    return this.get(this.KEYS.WISHLIST, []);
  },

  addToWishlist(productId) {
    const list = this.getWishlist();
    if (!list.includes(productId)) {
      list.push(productId);
      this.set(this.KEYS.WISHLIST, list);
      return true;
    }
    return false;
  },

  removeFromWishlist(productId) {
    const list = this.getWishlist().filter(id => id !== productId);
    this.set(this.KEYS.WISHLIST, list);
  },

  isInWishlist(productId) {
    return this.getWishlist().includes(productId);
  },

  /* Saved Builds */
  getSavedBuilds() {
    return this.get(this.KEYS.SAVED_BUILDS, []);
  },

  saveBuild(name, build) {
    const builds = this.getSavedBuilds();
    const entry = {
      id: 'build_' + Date.now(),
      name,
      build,
      date: new Date().toISOString(),
      total: Object.values(build).reduce((sum, p) => sum + (p?.price || 0), 0)
    };
    builds.unshift(entry);
    this.set(this.KEYS.SAVED_BUILDS, builds);
    return entry;
  },

  deleteBuild(buildId) {
    const builds = this.getSavedBuilds().filter(b => b.id !== buildId);
    this.set(this.KEYS.SAVED_BUILDS, builds);
  },

  getBuild(buildId) {
    return this.getSavedBuilds().find(b => b.id === buildId);
  },

  /* Current Build */
  getCurrentBuild() {
    return this.get(this.KEYS.CURRENT_BUILD, {});
  },

  setCurrentBuild(build) {
    this.set(this.KEYS.CURRENT_BUILD, build);
  },

  clearCurrentBuild() {
    this.remove(this.KEYS.CURRENT_BUILD);
  },

  /* Compare */
  getCompareList() {
    return this.get(this.KEYS.COMPARE, []);
  },

  addToCompare(productId) {
    const list = this.getCompareList();
    if (list.length >= 4) return false;
    if (!list.includes(productId)) {
      list.push(productId);
      this.set(this.KEYS.COMPARE, list);
      return true;
    }
    return false;
  },

  removeFromCompare(productId) {
    const list = this.getCompareList().filter(id => id !== productId);
    this.set(this.KEYS.COMPARE, list);
  },

  clearCompare() {
    this.set(this.KEYS.COMPARE, []);
  },

  /* Theme */
  getTheme() {
    return this.get(this.KEYS.THEME, 'dark');
  },

  setTheme(theme) {
    this.set(this.KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  },

  /* Recent Searches */
  addRecentSearch(query) {
    if (!query?.trim()) return;
    let recent = this.get(this.KEYS.RECENT_SEARCHES, []);
    recent = recent.filter(q => q !== query);
    recent.unshift(query);
    recent = recent.slice(0, 10);
    this.set(this.KEYS.RECENT_SEARCHES, recent);
  }
};

window.Storage = Storage;
