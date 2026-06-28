/**
 * PC Builder Pro - Main Application
 */

const App = {
  init() {
    this.initTheme();
    this.initLoading();
    this.initNavbar();
    this.initMobileMenu();
    this.initScrollAnimations();
    this.initFAQ();
    this.initModals();
    this.updateBadges();
    SearchEngine.initSearchBar('#global-search', '#search-dropdown');
    this.initPageSpecific();
  },

  initTheme() {
    const theme = Storage.getTheme();
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelector('.theme-toggle')?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      Storage.setTheme(next);
      document.querySelector('.theme-toggle').textContent = next === 'dark' ? '🌙' : '☀️';
    });
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) toggle.textContent = theme === 'dark' ? '🌙' : '☀️';
  },

  initLoading() {
    const loader = document.querySelector('.loading-screen');
    if (!loader) return;
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('hidden'), 800);
    });
  },

  initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  },

  initMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      menu.classList.toggle('open');
    });

    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        menu.classList.remove('open');
      });
    });
  },

  initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    reveals.forEach(el => observer.observe(el));
  },

  initFAQ() {
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      });
    });
  },

  initModals() {
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
        }
      });
    });

    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.modal-overlay')?.classList.remove('open');
      });
    });
  },

  updateBadges() {
    this.updateWishlistBadge();
    this.updateCompareBadge();
  },

  updateWishlistBadge() {
    const badge = document.querySelector('.wishlist-badge');
    if (badge) {
      const count = Storage.getWishlist().length;
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  },

  updateCompareBadge() {
    const badge = document.querySelector('.compare-badge');
    if (badge) {
      const count = Storage.getCompareList().length;
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  },

  toast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  /** Render a product card */
  renderProductCard(product, options = {}) {
    const { showActions = true } = options;
    const inWishlist = Storage.isInWishlist(product.id);
    const specs = [
      product.socket, product.memory, product.series, product.generation
    ].filter(Boolean).slice(0, 3);
    const imgAttrs = typeof productImgAttrs === 'function' ? productImgAttrs(product) : `class="product-img" loading="lazy"`;

    return `
      <div class="card product-card" data-id="${product.id}">
        <div class="card-image">
          
          ${product.rgb ? '<span class="card-rgb-badge">RGB</span>' : ''}
          ${product.rating >= 4.5 ? '<span class="card-badge">Top Rated</span>' : ''}
        </div>
        <div class="card-body">
          <div class="card-brand">${product.brand}</div>
          <h3 class="card-title">${product.name}</h3>
          <div class="card-specs">
            ${specs.map(s => `<span class="spec-tag">${s}</span>`).join('')}
          </div>
          <div class="card-footer">
            <span class="card-price">${formatPrice(product.price)}</span>
            <span class="card-rating">⭐ ${product.rating}</span>
          </div>
          ${showActions ? `
            <div class="card-actions">
              <button class="btn btn-sm btn-primary view-product" data-id="${product.id}">View</button>
              <button class="btn btn-sm btn-secondary wishlist-btn" data-id="${product.id}" title="Wishlist">
                ${inWishlist ? '❤️' : '🤍'}
              </button>
              <button class="btn btn-sm btn-secondary compare-btn" data-id="${product.id}" title="Compare">⚖️</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  /** Bind product card events */
  bindProductCards(container) {
    if (!container) return;

    container.querySelectorAll('.view-product').forEach(btn => {
      btn.addEventListener('click', () => {
        const product = getProductById(btn.dataset.id);
        if (product) this.showProductModal(product);
      });
    });

    container.querySelectorAll('.wishlist-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (Storage.isInWishlist(id)) {
          Storage.removeFromWishlist(id);
          btn.textContent = '🤍';
          this.toast('Removed from wishlist', 'info');
        } else {
          Storage.addToWishlist(id);
          btn.textContent = '❤️';
          this.toast('Added to wishlist', 'success');
        }
        this.updateWishlistBadge();
      });
    });

    container.querySelectorAll('.compare-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (Storage.addToCompare(btn.dataset.id)) {
          this.toast('Added to compare', 'success');
          this.updateCompareBadge();
        } else {
          this.toast('Compare list full or already added', 'error');
        }
      });
    });
  },

  /** Show product detail modal */
  showProductModal(product) {
    const modal = document.getElementById('product-modal');
    const body = document.getElementById('modal-body');
    const title = document.getElementById('modal-title');
    if (!modal || !body) return;

    title.textContent = product.name;
    const compatible = Compatibility.findCompatibleProducts(product);

    const specRows = [
      ['Brand', product.brand], ['Series', product.series], ['Generation', product.generation],
      ['Socket', product.socket], ['Chipset', product.chipset], ['TDP', product.tdp ? `${product.tdp}W` : null],
      ['Memory', product.memory], ['Speed', product.speed], ['PCIe', product.pcie],
      ['Warranty', product.warranty], ['Rating', `⭐ ${product.rating} (${product.reviews} reviews)`]
    ].filter(([, v]) => v);

    body.innerHTML = `
      <div class="product-detail">
        <div class="product-detail-image">
          
        </div>
        <div class="product-detail-info">
          <div class="card-brand">${product.brand} · ${product.category.toUpperCase()}</div>
          <h2>${product.name}</h2>
          <div class="product-detail-price">${formatPrice(product.price)}</div>
          <p class="text-muted">${product.description}</p>
          <table class="specs-table">
            ${specRows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}
          </table>
          <div class="flex gap-2 mt-3">
            <button class="btn btn-primary" id="modal-add-build" data-id="${product.id}">Add to Build</button>
            <button class="btn btn-secondary" id="modal-wishlist" data-id="${product.id}">
              ${Storage.isInWishlist(product.id) ? '❤️ Wishlisted' : '🤍 Wishlist'}
            </button>
            <button class="btn btn-secondary" id="modal-compare" data-id="${product.id}">⚖️ Compare</button>
          </div>
          ${compatible.length ? `
            <h4 class="mt-3">Compatible Products</h4>
            <div class="card-specs mt-2">
              ${compatible.map(p => `<span class="spec-tag" style="cursor:pointer" data-compat-id="${p.id}">${p.name}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    modal.classList.add('open');

    body.querySelector('#modal-add-build')?.addEventListener('click', () => {
      window.location.href = `builder.html?add=${product.id}`;
    });

    body.querySelector('#modal-wishlist')?.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      if (Storage.isInWishlist(id)) {
        Storage.removeFromWishlist(id);
        e.target.textContent = '🤍 Wishlist';
      } else {
        Storage.addToWishlist(id);
        e.target.textContent = '❤️ Wishlisted';
      }
      this.updateWishlistBadge();
    });

    body.querySelector('#modal-compare')?.addEventListener('click', () => {
      if (Storage.addToCompare(product.id)) {
        this.toast('Added to compare', 'success');
        this.updateCompareBadge();
      }
    });

    body.querySelectorAll('[data-compat-id]').forEach(el => {
      el.addEventListener('click', () => {
        const p = getProductById(el.dataset.compatId);
        if (p) this.showProductModal(p);
      });
    });
  },

  /** Animate counter */
  animateCounter(element, target, duration = 2000) {
    const start = 0;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.floor(start + (target - start) * eased).toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  },

  initPageSpecific() {
    const page = window.location.pathname.split('/').pop() || 'index.html';

    if (page === 'index.html' || page === '') {
      this.initHomePage();
    } else if (page === 'products.html') {
      this.initProductsPage();
    } else if (page === 'wishlist.html') {
      this.initWishlistPage();
    } else if (page === 'saved-builds.html') {
      this.initSavedBuildsPage();
    } else if (page === 'compare.html') {
      ComparePage.init();
    } else if (page === 'contact.html') {
      this.initContactForm();
    }
  },

  initHomePage() {
    // Featured Components
    const featuredGrid = document.getElementById('featured-products');
    if (featuredGrid) {
      const products = getFeaturedProducts(8);
      featuredGrid.innerHTML = products.map(p => this.renderProductCard(p)).join('');
      this.bindProductCards(featuredGrid);
    }

    // Popular Brands
    const brandsGrid = document.getElementById('brands-grid');
    if (brandsGrid) {
      const brands = getBrands();
      brandsGrid.innerHTML = brands.map(b => `<div class="brand-card reveal">${b}</div>`).join('');
    }

    // Gaming Builds
    const buildsGrid = document.getElementById('gaming-builds');
    if (buildsGrid) {
      buildsGrid.innerHTML = FEATURED_BUILDS.map(b => `
        <div class="build-card reveal" data-budget="${b.budget}">
          <div class="build-card-image">
            
            <div class="build-card-overlay">
              <div class="build-tags">${b.tags.map(t => `<span class="build-tag">${t}</span>`).join('')}</div>
              <h3>${b.name}</h3>
              <p>${b.description}</p>
              <span class="build-budget">${formatPrice(b.budget)}</span>
            </div>
          </div>
        </div>
      `).join('');

      buildsGrid.querySelectorAll('.build-card').forEach(card => {
        card.addEventListener('click', () => {
          const budget = parseInt(card.dataset.budget);
          const build = suggestBudgetBuild(budget);
          Storage.setCurrentBuild(build);
          window.location.href = 'builder.html';
        });
      });
    }

    // Budget Builds section
    const budgetGrid = document.getElementById('budget-builds');
    if (budgetGrid) {
      budgetGrid.innerHTML = BUDGET_TIERS.slice(0, 6).map(t => `
        <div class="perf-card reveal budget-card" data-budget="${t.value}" style="cursor:pointer">
          <div class="perf-icon">💰</div>
          <div class="perf-value">${t.label}</div>
          <div class="perf-label">Click to auto-build</div>
        </div>
      `).join('');

      budgetGrid.querySelectorAll('.budget-card').forEach(card => {
        card.addEventListener('click', () => {
          const build = suggestBudgetBuild(parseInt(card.dataset.budget));
          Storage.setCurrentBuild(build);
          window.location.href = 'builder.html';
        });
      });
    }

    // Latest Products
    const latestGrid = document.getElementById('latest-products');
    if (latestGrid) {
      const products = getLatestProducts(8);
      latestGrid.innerHTML = products.map(p => this.renderProductCard(p)).join('');
      this.bindProductCards(latestGrid);
    }

    // Reviews
    const reviewsGrid = document.getElementById('reviews-grid');
    if (reviewsGrid) {
      reviewsGrid.innerHTML = REVIEWS.map(r => `
        <div class="review-card reveal">
          <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
          <p class="review-text">"${r.text}"</p>
          <div class="review-author">
            <div class="review-avatar">${r.name.charAt(0)}</div>
            <div>
              <div class="review-name">${r.name}</div>
              <div class="review-date">${r.date}</div>
            </div>
          </div>
        </div>
      `).join('');
    }

    // FAQ
    const faqList = document.getElementById('faq-list');
    if (faqList) {
      faqList.innerHTML = FAQ_DATA.map(f => `
        <div class="faq-item reveal">
          <button class="faq-question">${f.q}<span class="icon">+</span></button>
          <div class="faq-answer"><p>${f.a}</p></div>
        </div>
      `).join('');
      this.initFAQ();
    }

    // Stats counters
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count);
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this.animateCounter(el, target);
          observer.disconnect();
        }
      });
      observer.observe(el);
    });

    // Budget filter chips on home
    document.querySelectorAll('.budget-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.budget-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const budget = parseInt(chip.dataset.budget);
        const build = suggestBudgetBuild(budget);
        Storage.setCurrentBuild(build);
        window.location.href = 'builder.html';
      });
    });

    // Newsletter
    document.getElementById('newsletter-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.toast('Subscribed successfully!', 'success');
      e.target.reset();
    });
  },

  initProductsPage() {
    const grid = document.getElementById('products-grid');
    const countEl = document.getElementById('products-count');
    if (!grid) return;

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    const category = params.get('cat') || '';

    if (query) {
      const searchInput = document.getElementById('products-search');
      if (searchInput) searchInput.value = query;
    }

    const render = () => {
      const searchVal = document.getElementById('products-search')?.value || query;
      const sort = document.getElementById('sort-select')?.value || 'rating';
      const activeCat = document.querySelector('.category-tab.active')?.dataset.cat || category;

      const products = SearchEngine.getFilteredProducts({
        query: searchVal,
        category: activeCat,
        sort
      });

      if (countEl) countEl.textContent = `${products.length} products found`;
      grid.innerHTML = products.length
        ? products.map(p => this.renderProductCard(p)).join('')
        : '<div class="empty-state"><div class="empty-state-icon">🔍</div><h3>No products found</h3><p>Try adjusting your filters</p></div>';

      this.bindProductCards(grid);
    };

    // Category tabs
    const tabsContainer = document.getElementById('category-tabs');
    if (tabsContainer) {
      const cats = [{ id: '', name: 'All' }, ...BUILDER_CATEGORIES];
      tabsContainer.innerHTML = cats.map(c =>
        `<button class="category-tab ${c.id === category ? 'active' : ''}" data-cat="${c.id}">${c.name}</button>`
      ).join('');

      tabsContainer.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          tabsContainer.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          render();
        });
      });
    }

    SearchEngine.initProductFilters(render);

    document.getElementById('products-search')?.addEventListener('input', render);
    document.getElementById('sort-select')?.addEventListener('change', render);

    document.getElementById('mobile-filter-toggle')?.addEventListener('click', () => {
      document.getElementById('filters-panel')?.classList.toggle('mobile-open');
    });

    render();
  },

  initWishlistPage() {
    const grid = document.getElementById('wishlist-grid');
    if (!grid) return;

    const ids = Storage.getWishlist();
    if (!ids.length) {
      grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💔</div><h3>Your wishlist is empty</h3><p>Browse products and add items you love</p><a href="products.html" class="btn btn-primary mt-3">Browse Products</a></div>';
      return;
    }

    const products = ids.map(id => getProductById(id)).filter(Boolean);
    grid.innerHTML = products.map(p => `
      <div class="card wishlist-item" data-id="${p.id}">
        <div class="card-image"></div>
        <div class="card-body">
          <div class="card-brand">${p.brand}</div>
          <h3 class="card-title">${p.name}</h3>
          <div class="card-footer">
            <span class="card-price">${formatPrice(p.price)}</span>
            <span class="card-rating">⭐ ${p.rating}</span>
          </div>
          <div class="card-actions">
            <button class="btn btn-sm btn-primary view-product" data-id="${p.id}">View</button>
            <button class="btn btn-sm btn-secondary remove-wishlist" data-id="${p.id}">Remove</button>
          </div>
        </div>
      </div>
    `).join('');

    this.bindProductCards(grid);

    grid.querySelectorAll('.remove-wishlist').forEach(btn => {
      btn.addEventListener('click', () => {
        Storage.removeFromWishlist(btn.dataset.id);
        btn.closest('.wishlist-item')?.remove();
        this.updateWishlistBadge();
        this.toast('Removed from wishlist', 'info');
        if (!Storage.getWishlist().length) this.initWishlistPage();
      });
    });
  },

  initSavedBuildsPage() {
    const container = document.getElementById('saved-builds-list');
    if (!container) return;

    const builds = Storage.getSavedBuilds();
    if (!builds.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💾</div><h3>No saved builds yet</h3><p>Start building and save your configuration</p><a href="builder.html" class="btn btn-primary mt-3">Start Building</a></div>';
      return;
    }

    container.innerHTML = builds.map(b => `
      <div class="saved-build-card reveal" data-id="${b.id}">
        <div class="saved-build-header">
          <div>
            <div class="saved-build-name">${b.name}</div>
            <div class="saved-build-date">${new Date(b.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</div>
          </div>
          <span class="card-price">${formatPrice(b.total)}</span>
        </div>
        <div class="saved-build-components">
          ${Object.entries(b.build).map(([cat, p]) =>
            p ? `<span class="spec-tag">${BUILDER_CATEGORIES.find(c => c.id === cat)?.name || cat}: ${p.name}</span>` : ''
          ).join('')}
        </div>
        <div class="saved-build-actions">
          <button class="btn btn-sm btn-primary load-build" data-id="${b.id}">Load Build</button>
          <button class="btn btn-sm btn-secondary delete-build" data-id="${b.id}">Delete</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.load-build').forEach(btn => {
      btn.addEventListener('click', () => {
        const saved = Storage.getBuild(btn.dataset.id);
        if (saved) {
          Storage.setCurrentBuild(saved.build);
          window.location.href = 'builder.html';
        }
      });
    });

    container.querySelectorAll('.delete-build').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this saved build?')) {
          Storage.deleteBuild(btn.dataset.id);
          btn.closest('.saved-build-card')?.remove();
          this.toast('Build deleted', 'info');
        }
      });
    });
  },

  initContactForm() {
    document.getElementById('contact-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.toast('Message sent successfully!', 'success');
      e.target.reset();
    });
  }
};

/** Shared navbar/footer HTML generator */
function getNavbar() {
  return `
    <nav class="navbar">
      <div class="container">
        <a href="index.html" class="logo">
          <div class="logo-icon">⚡</div>
          PC Builder Pro
        </a>
        <div class="nav-links">
          <a href="index.html">Home</a>
          <a href="builder.html">Builder</a>
          <a href="products.html">Products</a>
          <a href="compare.html">Compare</a>
          <a href="about.html">About</a>
          <a href="contact.html">Contact</a>
        </div>
        <div class="nav-actions">
          <div class="search-bar" style="max-width:200px;display:none" id="nav-search-wrap">
            <span class="search-icon">🔍</span>
            <input type="text" id="global-search" placeholder="Search...">
            <div class="search-results-dropdown" id="search-dropdown"></div>
          </div>
          <a href="wishlist.html" class="nav-icon-btn" title="Wishlist">❤️<span class="badge-count wishlist-badge" style="display:none">0</span></a>
          <a href="compare.html" class="nav-icon-btn" title="Compare">⚖️<span class="badge-count compare-badge" style="display:none">0</span></a>
          <a href="saved-builds.html" class="nav-icon-btn" title="Saved Builds">💾</a>
          <button class="theme-toggle" title="Toggle Theme">🌙</button>
          <button class="menu-toggle" aria-label="Menu"><span></span><span></span><span></span></button>
        </div>
      </div>
    </nav>
    <div class="mobile-menu">
      <a href="index.html">Home</a>
      <a href="builder.html">PC Builder</a>
      <a href="products.html">Products</a>
      <a href="compare.html">Compare</a>
      <a href="wishlist.html">Wishlist</a>
      <a href="saved-builds.html">Saved Builds</a>
      <a href="about.html">About</a>
      <a href="contact.html">Contact</a>
    </div>
  `;
}

function getFooter() {
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="index.html" class="logo">
              <div class="logo-icon">⚡</div>
              PC Builder Pro
            </a>
            <p>Build your dream gaming PC with our advanced compatibility checker, performance estimator, and budget optimizer. The ultimate PC building experience.</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul class="footer-links">
              <li><a href="builder.html">PC Builder</a></li>
              <li><a href="products.html">Products</a></li>
              <li><a href="compare.html">Compare</a></li>
              <li><a href="wishlist.html">Wishlist</a></li>
            </ul>
          </div>
          <div>
            <h4>Categories</h4>
            <ul class="footer-links">
              <li><a href="products.html?cat=cpu">Processors</a></li>
              <li><a href="products.html?cat=gpu">Graphics Cards</a></li>
              <li><a href="products.html?cat=motherboard">Motherboards</a></li>
              <li><a href="products.html?cat=ram">Memory</a></li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul class="footer-links">
              <li><a href="about.html">About Us</a></li>
              <li><a href="contact.html">Contact</a></li>
              <li><a href="index.html#faq">FAQ</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>&copy; 2026 PC Builder Pro. All rights reserved.</span>
          <div class="social-links">
            <a href="#" title="Twitter">𝕏</a>
            <a href="#" title="YouTube">▶</a>
            <a href="#" title="Discord">💬</a>
            <a href="#" title="Instagram">📷</a>
          </div>
        </div>
      </div>
    </footer>
  `;
}

function getProductModal() {
  return `
    <div class="modal-overlay" id="product-modal">
      <div class="modal">
        <div class="modal-header">
          <h2 id="modal-title">Product Details</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body" id="modal-body"></div>
      </div>
    </div>
  `;
}

function getLoadingScreen() {
  return `
    <div class="loading-screen">
      <div class="loader-rgb"></div>
      <div class="loading-text">LOADING</div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => App.init());

window.App = App;
