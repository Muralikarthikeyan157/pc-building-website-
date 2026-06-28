/**
 * PC Builder Pro - PC Builder Page Logic
 */

const Builder = {
  build: {},
  activeCategory: null,

  init() {
    this.build = Storage.getCurrentBuild() || {};
    this.renderSlots();
    this.renderSummary();
    this.bindEvents();
    this.handleUrlParams();
  },

  handleUrlParams() {
    const params = new URLSearchParams(window.location.search);

    // Add product from URL
    const addId = params.get('add');
    if (addId) {
      const product = getProductById(addId);
      if (product) {
        this.selectProduct(product.category, product);
        App.toast(`Added ${product.name}`, 'success');
      }
    }

    // Budget suggest
    const budget = params.get('budget');
    if (budget) {
      this.applyBudgetBuild(parseInt(budget));
    }
  },

  bindEvents() {
    document.getElementById('save-build-btn')?.addEventListener('click', () => this.saveBuild());
    document.getElementById('clear-build-btn')?.addEventListener('click', () => this.clearBuild());
    document.getElementById('budget-suggest-btn')?.addEventListener('click', () => this.showBudgetModal());
    document.getElementById('share-build-btn')?.addEventListener('click', () => this.shareBuild());

    document.querySelectorAll('.budget-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.budget-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.applyBudgetBuild(parseInt(chip.dataset.budget));
      });
    });

    document.getElementById('close-picker')?.addEventListener('click', () => {
      document.getElementById('product-picker')?.classList.remove('open');
      this.activeCategory = null;
      document.querySelectorAll('.builder-slot').forEach(s => s.classList.remove('selected'));
    });
  },

  renderSlots() {
    const container = document.getElementById('builder-slots');
    if (!container) return;

    container.innerHTML = BUILDER_CATEGORIES.map(cat => {
      const product = this.build[cat.id];
      return `
        <div class="builder-slot ${product ? 'filled' : ''} ${cat.required ? 'required' : ''}"
             data-category="${cat.id}">
          <div class="slot-icon">${cat.icon}</div>
          <div class="slot-info">
            <div class="slot-name">${cat.name}</div>
            ${product
              ? `<div class="slot-product">${product.name}</div>`
              : `<div class="slot-empty">Choose ${cat.name}</div>`
            }
          </div>
          ${product ? `
            <span class="slot-price">${formatPrice(product.price)}</span>
            <div class="slot-actions">
              <button class="slot-remove" data-category="${cat.id}" title="Remove">✕</button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    container.querySelectorAll('.builder-slot').forEach(slot => {
      slot.addEventListener('click', (e) => {
        if (e.target.classList.contains('slot-remove')) return;
        this.openPicker(slot.dataset.category);
      });
    });

    container.querySelectorAll('.slot-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        delete this.build[btn.dataset.category];
        Storage.setCurrentBuild(this.build);
        this.renderSlots();
        this.renderSummary();
      });
    });
  },

  openPicker(category) {
    this.activeCategory = category;
    document.querySelectorAll('.builder-slot').forEach(s => {
      s.classList.toggle('selected', s.dataset.category === category);
    });

    const picker = document.getElementById('product-picker');
    const catInfo = BUILDER_CATEGORIES.find(c => c.id === category);
    if (!picker) return;

    document.getElementById('picker-title').textContent = `Select ${catInfo?.name || category}`;

    let products = getProductsByCategory(category);

    // Smart filter based on current build
    products = this.filterCompatibleProducts(category, products);

    this.renderPickerProducts(products);
    picker.classList.add('open');
    picker.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Picker search & filters
    const searchInput = document.getElementById('picker-search');
    const brandFilter = document.getElementById('picker-brand');
    const sortFilter = document.getElementById('picker-sort');

    if (brandFilter) {
      const brands = [...new Set(getProductsByCategory(category).map(p => p.brand))].sort();
      brandFilter.innerHTML = '<option value="">All Brands</option>' +
        brands.map(b => `<option value="${b}">${b}</option>`).join('');
    }

    const filterProducts = () => {
      let filtered = getProductsByCategory(category);
      filtered = this.filterCompatibleProducts(category, filtered);

      const q = searchInput?.value.toLowerCase() || '';
      const brand = brandFilter?.value || '';
      const sort = sortFilter?.value || 'rating';

      if (q) filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
      if (brand) filtered = filtered.filter(p => p.brand === brand);

      switch (sort) {
        case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
        case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
        default: filtered.sort((a, b) => b.rating - a.rating);
      }

      this.renderPickerProducts(filtered);
    };

    searchInput?.removeEventListener('input', filterProducts);
    searchInput?.addEventListener('input', filterProducts);
    brandFilter?.addEventListener('change', filterProducts);
    sortFilter?.addEventListener('change', filterProducts);
  },

  filterCompatibleProducts(category, products) {
    const cpu = this.build.cpu;
    const mobo = this.build.motherboard;
    const ram = this.build.ram;

    if (category === 'motherboard' && cpu) {
      products = products.filter(p => p.socket === cpu.socket);
    }
    if (category === 'cpu' && mobo) {
      products = products.filter(p => p.socket === mobo.socket);
    }
    if (category === 'ram' && mobo) {
      products = products.filter(p => (p.memoryType || p.generation) === mobo.memory);
    }
    if (category === 'motherboard' && ram) {
      products = products.filter(p => p.memory === (ram.memoryType || ram.generation));
    }

    return products;
  },

  renderPickerProducts(products) {
    const container = document.getElementById('picker-products');
    if (!container) return;

    if (!products.length) {
      container.innerHTML = '<div class="empty-state"><p>No compatible products found</p></div>';
      return;
    }

    container.innerHTML = products.slice(0, 100).map(p => `
      <div class="picker-product" data-id="${p.id}">
        
        <div class="picker-product-info">
          <h4>${p.name}</h4>
          <p>${p.brand} · ${p.series || ''} · ⭐ ${p.rating}</p>
        </div>
        <span class="picker-product-price">${formatPrice(p.price)}</span>
        <button class="picker-select-btn" data-id="${p.id}">Select</button>
      </div>
    `).join('');

    container.querySelectorAll('.picker-select-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const product = getProductById(btn.dataset.id);
        if (product) this.selectProduct(this.activeCategory, product);
      });
    });
  },

  selectProduct(category, product) {
    this.build[category] = product;
    Storage.setCurrentBuild(this.build);
    this.renderSlots();
    this.renderSummary();
    document.getElementById('product-picker')?.classList.remove('open');
    this.activeCategory = null;
    document.querySelectorAll('.builder-slot').forEach(s => s.classList.remove('selected'));
    App.toast(`${product.name} added`, 'success');
  },

  renderSummary() {
    const total = Object.values(this.build).reduce((sum, p) => sum + (p?.price || 0), 0);
    const totalEl = document.getElementById('summary-total');
    if (totalEl) totalEl.textContent = formatPrice(total);

    const wattage = Compatibility.estimateWattage(this.build);
    const wattageEl = document.getElementById('summary-wattage');
    if (wattageEl) wattageEl.textContent = `${wattage}W estimated`;

    const checks = Compatibility.checkBuild(this.build);
    const compatEl = document.getElementById('compat-list');
    if (compatEl) compatEl.innerHTML = Compatibility.renderChecks(checks);

    const perf = Compatibility.estimatePerformance(this.build);
    const perfEl = document.getElementById('perf-bars');
    if (perfEl) perfEl.innerHTML = Compatibility.renderPerformance(perf);

    const scoreEl = document.getElementById('overall-score');
    if (scoreEl) scoreEl.textContent = perf.overall;

    const psuRec = document.getElementById('psu-recommendation');
    if (psuRec) {
      const recWatt = Math.ceil(wattage * 1.3 / 50) * 50;
      psuRec.textContent = `Recommended: ${recWatt}W+ PSU`;
    }
  },

  saveBuild() {
    const name = prompt('Enter a name for this build:', `My Build ${new Date().toLocaleDateString()}`);
    if (!name) return;

    if (!Object.keys(this.build).length) {
      App.toast('Add components before saving', 'error');
      return;
    }

    Storage.saveBuild(name, { ...this.build });
    App.toast('Build saved successfully!', 'success');
  },

  clearBuild() {
    if (Object.keys(this.build).length && !confirm('Clear entire build?')) return;
    this.build = {};
    Storage.clearCurrentBuild();
    this.renderSlots();
    this.renderSummary();
    App.toast('Build cleared', 'info');
  },

  applyBudgetBuild(budget) {
    this.build = suggestBudgetBuild(budget);
    Storage.setCurrentBuild(this.build);
    this.renderSlots();
    this.renderSummary();
    App.toast(`Budget build for ${formatPrice(budget)} applied`, 'success');
  },

  showBudgetModal() {
    const modal = document.getElementById('budget-modal');
    if (!modal) return;
    modal.classList.add('open');

    document.querySelectorAll('#budget-modal .budget-chip').forEach(chip => {
      chip.onclick = () => {
        const budget = parseInt(chip.dataset.budget);
        const build = suggestBudgetBuild(budget);
        const results = document.getElementById('budget-results');
        if (results) {
          const total = Object.values(build).reduce((s, p) => s + (p?.price || 0), 0);
          results.innerHTML = `
            <p class="mb-2">Suggested build for <strong>${formatPrice(budget)}</strong> (Total: ${formatPrice(total)})</p>
            <div class="budget-suggest-results">
              ${Object.entries(build).map(([cat, p]) => p ? `
                <div class="budget-component">
                  <h4>${BUILDER_CATEGORIES.find(c => c.id === cat)?.name || cat}</h4>
                  <p><strong>${p.name}</strong></p>
                  <p class="card-price">${formatPrice(p.price)}</p>
                </div>
              ` : '').join('')}
            </div>
            <button class="btn btn-primary mt-3" id="apply-budget-build">Apply This Build</button>
          `;

          document.getElementById('apply-budget-build')?.addEventListener('click', () => {
            this.build = build;
            Storage.setCurrentBuild(this.build);
            this.renderSlots();
            this.renderSummary();
            modal.classList.remove('open');
            App.toast('Budget build applied!', 'success');
          });
        }
      };
    });
  },

  shareBuild() {
    const ids = Object.values(this.build).map(p => p?.id).filter(Boolean);
    if (!ids.length) {
      App.toast('Nothing to share', 'error');
      return;
    }
    const text = `Check out my PC build!\n${Object.entries(this.build).map(([k, p]) =>
      p ? `${BUILDER_CATEGORIES.find(c => c.id === k)?.name}: ${p.name}` : ''
    ).filter(Boolean).join('\n')}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      App.toast('Build copied to clipboard!', 'success');
    } else {
      App.toast('Copy not supported', 'error');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('builder-slots')) {
    Builder.init();
  }
});

window.Builder = Builder;
