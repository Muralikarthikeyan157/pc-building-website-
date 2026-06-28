/**
 * PC Builder Pro - Compare Page Logic
 */

const ComparePage = {
  compareCategory: 'cpu',
  maxItems: 4,

  COMPARE_SPECS: {
    cpu: ['brand', 'series', 'generation', 'socket', 'cores', 'threads', 'speed', 'tdp', 'price', 'rating'],
    gpu: ['brand', 'series', 'generation', 'memory', 'speed', 'tdp', 'length', 'pcie', 'price', 'rating'],
    motherboard: ['brand', 'series', 'socket', 'chipset', 'memory', 'formFactor', 'm2Slots', 'pcie', 'price', 'rating'],
    ram: ['brand', 'series', 'memory', 'speed', 'memoryType', 'price', 'rating'],
    ssd: ['brand', 'series', 'memory', 'generation', 'speed', 'price', 'rating'],
    psu: ['brand', 'series', 'wattage', 'efficiency', 'modular', 'price', 'rating'],
    monitor: ['brand', 'series', 'memory', 'generation', 'speed', 'price', 'rating']
  },

  SPEC_LABELS: {
    brand: 'Brand', series: 'Series', generation: 'Generation', socket: 'Socket',
    cores: 'Cores', threads: 'Threads', speed: 'Speed', tdp: 'TDP',
    memory: 'Memory', length: 'Length', pcie: 'PCIe', chipset: 'Chipset',
    formFactor: 'Form Factor', m2Slots: 'M.2 Slots', memoryType: 'Type',
    wattage: 'Wattage', efficiency: 'Efficiency', modular: 'Modular',
    price: 'Price', rating: 'Rating'
  },

  init() {
    this.renderCategorySelect();
    this.renderCompareSlots();
    this.renderCompareTable();
    this.bindEvents();
    App.updateCompareBadge();
  },

  bindEvents() {
    document.getElementById('compare-category')?.addEventListener('change', (e) => {
      this.compareCategory = e.target.value;
      Storage.clearCompare();
      this.renderCompareSlots();
      this.renderCompareTable();
      App.updateCompareBadge();
    });

    document.getElementById('clear-compare')?.addEventListener('click', () => {
      Storage.clearCompare();
      this.renderCompareSlots();
      this.renderCompareTable();
      App.updateCompareBadge();
      App.toast('Compare list cleared', 'info');
    });
  },

  renderCategorySelect() {
    const select = document.getElementById('compare-category');
    if (!select) return;
    const categories = [
      { id: 'cpu', name: 'CPUs' },
      { id: 'gpu', name: 'Graphics Cards' },
      { id: 'motherboard', name: 'Motherboards' },
      { id: 'ram', name: 'RAM' },
      { id: 'ssd', name: 'SSD' },
      { id: 'psu', name: 'Power Supplies' },
      { id: 'monitor', name: 'Monitors' }
    ];
    select.innerHTML = categories.map(c =>
      `<option value="${c.id}" ${c.id === this.compareCategory ? 'selected' : ''}>${c.name}</option>`
    ).join('');
  },

  getCompareProducts() {
    return Storage.getCompareList()
      .map(id => getProductById(id))
      .filter(p => p && p.category === this.compareCategory);
  },

  renderCompareSlots() {
    const container = document.getElementById('compare-slots');
    if (!container) return;

    const products = this.getCompareProducts();
    const slots = [];

    for (let i = 0; i < this.maxItems; i++) {
      const product = products[i];
      if (product) {
        slots.push(`
          <div class="compare-slot filled" data-index="${i}">
            
            <h4>${product.name}</h4>
            <p class="card-price">${formatPrice(product.price)}</p>
            <button class="btn btn-sm btn-secondary remove-compare" data-id="${product.id}">Remove</button>
          </div>
        `);
      } else {
        slots.push(`
          <div class="compare-slot" data-index="${i}">
            <span style="font-size:2rem;opacity:0.3">+</span>
            <p class="text-muted">Add product to compare</p>
            <button class="btn btn-sm btn-primary add-compare-slot">Browse ${this.compareCategory.toUpperCase()}</button>
          </div>
        `);
      }
    }

    container.innerHTML = slots.join('');

    container.querySelectorAll('.remove-compare').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        Storage.removeFromCompare(btn.dataset.id);
        this.renderCompareSlots();
        this.renderCompareTable();
        App.updateCompareBadge();
      });
    });

    container.querySelectorAll('.add-compare-slot').forEach(btn => {
      btn.addEventListener('click', () => {
        this.showProductPicker();
      });
    });
  },

  showProductPicker() {
    const products = getProductsByCategory(this.compareCategory);
    const modal = document.getElementById('product-modal');
    const body = document.getElementById('modal-body');
    const title = document.getElementById('modal-title');

    if (!modal || !body) return;

    title.textContent = `Select ${this.compareCategory.toUpperCase()} to Compare`;
    body.innerHTML = `
      <div class="search-bar mb-3">
        <span class="search-icon">🔍</span>
        <input type="text" id="compare-search" placeholder="Search products...">
      </div>
      <div class="picker-products" style="max-height:400px">
        ${products.slice(0, 50).map(p => `
          <div class="picker-product compare-pick" data-id="${p.id}">
            
            <div class="picker-product-info">
              <h4>${p.name}</h4>
              <p>${p.brand} · ⭐ ${p.rating}</p>
            </div>
            <span class="picker-product-price">${formatPrice(p.price)}</span>
            <button class="picker-select-btn">Add</button>
          </div>
        `).join('')}
      </div>
    `;

    modal.classList.add('open');

    body.querySelector('#compare-search')?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      body.querySelectorAll('.compare-pick').forEach(el => {
        const name = el.querySelector('h4').textContent.toLowerCase();
        el.style.display = name.includes(q) ? '' : 'none';
      });
    });

    body.querySelectorAll('.compare-pick').forEach(el => {
      el.querySelector('.picker-select-btn')?.addEventListener('click', () => {
        const added = Storage.addToCompare(el.dataset.id);
        if (added) {
          App.toast('Added to compare', 'success');
          modal.classList.remove('open');
          this.renderCompareSlots();
          this.renderCompareTable();
          App.updateCompareBadge();
        } else {
          App.toast('Compare list full (max 4)', 'error');
        }
      });
    });
  },

  renderCompareTable() {
    const container = document.getElementById('compare-table-container');
    if (!container) return;

    const products = this.getCompareProducts();
    if (products.length < 2) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚖️</div><h3>Add at least 2 products to compare</h3></div>';
      return;
    }

    const specs = this.COMPARE_SPECS[this.compareCategory] || ['brand', 'price', 'rating'];

    let html = '<div class="compare-table-wrapper"><table class="compare-table"><thead><tr><th>Specification</th>';
    products.forEach(p => {
      html += `<th class="compare-product-header">
        
        <div>${p.name}</div>
      </th>`;
    });
    html += '</tr></thead><tbody>';

    specs.forEach(spec => {
      html += `<tr><td>${this.SPEC_LABELS[spec] || spec}</td>`;
      products.forEach(p => {
        let val = p[spec];
        if (spec === 'price') val = formatPrice(val);
        if (spec === 'rating') val = `⭐ ${val}`;
        html += `<td>${val ?? '—'}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
  }
};

window.ComparePage = ComparePage;
