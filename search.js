/**
 * PC Builder Pro - Search & Filter Engine
 */

const SearchEngine = {
  debounceTimer: null,

  /** Live search with debounce */
  liveSearch(query, callback, delay = 300) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const results = searchProducts(query, this.activeFilters);
      callback(results);
    }, delay);
  },

  activeFilters: {},

  /** Apply filters */
  setFilter(key, value) {
    if (value === '' || value === false || value === null) {
      delete this.activeFilters[key];
    } else {
      this.activeFilters[key] = value;
    }
  },

  clearFilters() {
    this.activeFilters = {};
  },

  /** Get filtered and sorted products */
  getFilteredProducts(options = {}) {
    const { query = '', category = '', sort = 'rating' } = options;
    let results = searchProducts(query, { ...this.activeFilters, category: category || this.activeFilters.category });

    switch (sort) {
      case 'price-low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
      default:
        results.sort((a, b) => b.rating - a.rating);
        break;
    }

    return results;
  },

  /** Render search dropdown results */
  renderDropdownResults(results, container) {
    if (!container) return;
    if (!results.length) {
      container.innerHTML = '<div class="search-result-item"><span>No products found</span></div>';
      container.classList.add('open');
      return;
    }

    container.innerHTML = results.slice(0, 8).map(p => `
      <div class="search-result-item" data-id="${p.id}">
        
        <div>
          <strong>${p.name}</strong>
          <div class="text-muted" style="font-size:0.8rem">${formatPrice(p.price)} · ${p.category}</div>
        </div>
      </div>
    `).join('');
    container.classList.add('open');

    container.querySelectorAll('.search-result-item[data-id]').forEach(item => {
      item.addEventListener('click', () => {
        const product = getProductById(item.dataset.id);
        if (product) {
          App.showProductModal(product);
          container.classList.remove('open');
        }
      });
    });
  },

  /** Initialize global search bar */
  initSearchBar(inputSelector, dropdownSelector) {
    const input = document.querySelector(inputSelector);
    const dropdown = document.querySelector(dropdownSelector);
    if (!input || !dropdown) return;

    input.addEventListener('input', (e) => {
      const query = e.target.value;
      if (query.length < 2) {
        dropdown.classList.remove('open');
        return;
      }
      this.liveSearch(query, (results) => {
        this.renderDropdownResults(results, dropdown);
      });
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        Storage.addRecentSearch(input.value.trim());
        window.location.href = `products.html?q=${encodeURIComponent(input.value.trim())}`;
      }
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });
  },

  /** Build filter panel HTML */
  getFilterOptions() {
    return {
      brands: getBrands(),
      categories: BUILDER_CATEGORIES.map(c => ({ id: c.id, name: c.name })),
      sockets: [...new Set(PRODUCTS.map(p => p.socket).filter(Boolean))].sort(),
      chipsets: [...new Set(PRODUCTS.map(p => p.chipset).filter(Boolean))].sort(),
      pcie: [...new Set(PRODUCTS.map(p => p.pcie).filter(Boolean))].sort(),
      memoryTypes: ['DDR4', 'DDR5']
    };
  },

  /** Initialize filters on products page */
  initProductFilters(onFilterChange) {
    const panel = document.getElementById('filters-panel');
    if (!panel) return;

    const opts = this.getFilterOptions();

    panel.innerHTML = `
      <h3>Filters</h3>
      <div class="filter-group">
        <label>Brand</label>
        <select id="filter-brand">
          <option value="">All Brands</option>
          ${opts.brands.map(b => `<option value="${b}">${b}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label>Price Range</label>
        <input type="range" id="filter-price" min="0" max="200000" step="5000" value="200000">
        <span id="filter-price-label">Up to ₹2,00,000</span>
      </div>
      <div class="filter-group">
        <label class="filter-checkbox">
          <input type="checkbox" id="filter-rgb"> RGB Only
        </label>
        <label class="filter-checkbox">
          <input type="checkbox" id="filter-ddr4" data-type="DDR4"> DDR4
        </label>
        <label class="filter-checkbox">
          <input type="checkbox" id="filter-ddr5" data-type="DDR5"> DDR5
        </label>
        <label class="filter-checkbox">
          <input type="checkbox" id="filter-available" checked> In Stock
        </label>
      </div>
      <div class="filter-group">
        <label>Socket</label>
        <select id="filter-socket">
          <option value="">All Sockets</option>
          ${opts.sockets.map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label>Chipset</label>
        <select id="filter-chipset">
          <option value="">All Chipsets</option>
          ${opts.chipsets.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label>PCIe</label>
        <select id="filter-pcie">
          <option value="">All Versions</option>
          ${opts.pcie.map(p => `<option value="${p}">${p}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-secondary btn-sm" id="clear-filters" style="width:100%;margin-top:12px">Clear Filters</button>
    `;

    const applyFilters = () => {
      this.setFilter('brand', document.getElementById('filter-brand')?.value);
      this.setFilter('maxPrice', parseInt(document.getElementById('filter-price')?.value));
      this.setFilter('rgb', document.getElementById('filter-rgb')?.checked || null);
      this.setFilter('availability', document.getElementById('filter-available')?.checked || null);
      this.setFilter('socket', document.getElementById('filter-socket')?.value);
      this.setFilter('chipset', document.getElementById('filter-chipset')?.value);
      this.setFilter('pcie', document.getElementById('filter-pcie')?.value);

      const ddr4 = document.getElementById('filter-ddr4')?.checked;
      const ddr5 = document.getElementById('filter-ddr5')?.checked;
      if (ddr4 && !ddr5) this.setFilter('memoryType', 'DDR4');
      else if (ddr5 && !ddr4) this.setFilter('memoryType', 'DDR5');
      else delete this.activeFilters.memoryType;

      onFilterChange?.();
    };

    panel.querySelectorAll('select, input').forEach(el => {
      el.addEventListener('change', applyFilters);
      el.addEventListener('input', applyFilters);
    });

    document.getElementById('filter-price')?.addEventListener('input', (e) => {
      const label = document.getElementById('filter-price-label');
      if (label) label.textContent = `Up to ${formatPrice(parseInt(e.target.value))}`;
    });

    document.getElementById('clear-filters')?.addEventListener('click', () => {
      this.clearFilters();
      panel.querySelectorAll('select').forEach(s => s.value = '');
      panel.querySelectorAll('input[type="checkbox"]').forEach(c => {
        c.checked = c.id === 'filter-available';
      });
      const priceSlider = document.getElementById('filter-price');
      if (priceSlider) {
        priceSlider.value = 200000;
        document.getElementById('filter-price-label').textContent = 'Up to ₹2,00,000';
      }
      onFilterChange?.();
    });
  }
};

window.SearchEngine = SearchEngine;
