/* ============================================================
   MAISON D'OR — логика витрины (роутинг, рендер, корзина)
   ============================================================ */

const state = {
  category: null,   // текущая активная категория на странице каталога
  favorites: new Set(JSON.parse(localStorage.getItem('md_favs') || '[]')),
  cart: JSON.parse(localStorage.getItem('md_cart') || '[]'),
  activeProductId: null,
  selectedSize: null
};

function saveState() {
  localStorage.setItem('md_favs', JSON.stringify([...state.favorites]));
  localStorage.setItem('md_cart', JSON.stringify(state.cart));
}

/* ---------- утилиты ---------- */
function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function visualStyle(brand, seed) {
  const rng = seededRandom(seed);
  const angle = Math.round(rng() * 360);
  const stop = Math.round(28 + rng() * 42);
  return `background:linear-gradient(${angle}deg, ${brand.accent} 0%, #060606 ${stop}%, ${brand.accent2}2a 100%);`;
}

function parseHash() {
  return location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
}

function go(path) {
  location.hash = path;
}

/* ---------- шапка / хлебные крошки ---------- */
function renderCrumbs(parts) {
  const wrap = document.getElementById('crumbs');
  const items = [{ label: 'Maison', href: '#/' }];

  if (parts[0] === 'brand' && parts[1]) {
    const brand = getBrand(parts[1]);
    if (brand) {
      items.push({ label: brand.name, href: `#/brand/${brand.id}` });
      if (parts[2]) {
        const g = GENDERS.find(g => g.id === parts[2]);
        if (g) items.push({ label: g.label, href: `#/brand/${brand.id}/${g.id}` });
      }
    }
  }

  wrap.innerHTML = items.map((it, i) => {
    const isLast = i === items.length - 1;
    return (i > 0 ? '<span class="sep">/</span>' : '') +
      `<span class="crumb${isLast ? ' current' : ''}" data-href="${it.href}">${it.label}</span>`;
  }).join('');

  wrap.querySelectorAll('.crumb').forEach(c => {
    c.addEventListener('click', () => go(c.dataset.href.replace(/^#/, '')));
  });
}

function updateBagCount() {
  const count = state.cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('bagCount').textContent = count;
}

/* ---------- HOME ---------- */
function renderHome() {
  const view = document.getElementById('view');
  view.innerHTML = `
    <section class="hero">
      <span class="eyebrow">Приватный дом эксклюзивной моды</span>
      <h1>Четыре Дома. <em>Одно</em> приглашение.</h1>
      <p>Maison D'Or собирает под одной крышей избранные модные дома. Ниже — витрина в учебных целях: без реальных транзакций, с ориентировочными ценами и размерными сетками.</p>
    </section>
    <div class="brand-grid">
      ${BRANDS.map(b => `
        <a class="brand-tile" href="#/brand/${b.id}">
          <div class="tile-bg" style="${visualStyle(b, b.id + 'home')}"></div>
          <div class="big-initial">${b.initial}</div>
          <span class="tile-enter">Войти в дом →</span>
          <div class="tile-content">
            <div class="tile-name u-serif">${b.name}</div>
            <div class="tile-tag">${b.tagline}</div>
          </div>
        </a>
      `).join('')}
    </div>
    <div class="editorial-strip">
      <div class="cell"><div class="num u-serif">${BRANDS.length}</div><div class="lbl">Модных дома</div></div>
      <div class="cell"><div class="num u-serif">${GENDERS.length}</div><div class="lbl">Направления</div></div>
      <div class="cell"><div class="num u-serif">${PRODUCTS.length}</div><div class="lbl">Позиций в каталоге</div></div>
      <div class="cell"><div class="num u-serif">1:1</div><div class="lbl">Ателье-подгонка</div></div>
    </div>
  `;
  renderCrumbs([]);
}

/* ---------- BRAND LANDING ---------- */
function renderBrandLanding(brandId) {
  const brand = getBrand(brandId);
  const view = document.getElementById('view');
  if (!brand) { go('/'); return; }

  view.innerHTML = `
    <section class="brand-hero">
      <div class="tile-bg" style="position:absolute;inset:0;${visualStyle(brand, brand.id + 'hero')}"></div>
      <div class="inner">
        <span class="eyebrow">${brand.tagline}</span>
        <h1 class="u-serif">${brand.name}</h1>
        <p class="desc">${brand.desc}</p>
      </div>
    </section>
    <div class="gender-grid">
      ${GENDERS.map(g => {
        const count = getProducts({ brandId, genderId: g.id }).length;
        return `
        <a class="gender-tile" href="#/brand/${brand.id}/${g.id}">
          <div class="g-label u-serif">${g.label}</div>
          <div class="g-count">${count} позиций</div>
          <div class="g-line"></div>
        </a>`;
      }).join('')}
    </div>
  `;
  renderCrumbs(['brand', brandId]);
}

/* ---------- CATALOG ---------- */
function renderCatalogPage(brandId, genderId) {
  const brand = getBrand(brandId);
  const gender = GENDERS.find(g => g.id === genderId);
  if (!brand || !gender) { go('/'); return; }

  const categories = getCategories(genderId);
  if (!state.category || !categories.includes(state.category)) {
    state.category = categories[0];
  }

  const view = document.getElementById('view');
  view.innerHTML = `
    <section class="catalog-head">
      <span class="eyebrow">${brand.name}</span>
      <h1 class="u-serif">${gender.label} коллекция</h1>
      <div class="tag">Ready-to-wear · Limited Access</div>
    </section>
    <div class="cat-tabs" id="catTabs">
      ${categories.map(c => `<button class="cat-tab${c === state.category ? ' active' : ''}" data-cat="${c}">${c}</button>`).join('')}
    </div>
    <div class="toolbar">
      <span id="resultCount"></span>
      <span>Каталог обновлён — Осень/Зима</span>
    </div>
    <div class="product-grid" id="productGrid"></div>
  `;

  view.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.category = tab.dataset.cat;
      renderCatalogPage(brandId, genderId);
    });
  });

  renderProductGrid(brandId, genderId, state.category);
  renderCrumbs(['brand', brandId, genderId]);
}

function renderProductGrid(brandId, genderId, category) {
  const brand = getBrand(brandId);
  const products = getProducts({ brandId, genderId, category });
  const grid = document.getElementById('productGrid');
  document.getElementById('resultCount').textContent = `${products.length} моделей`;

  if (!products.length) {
    grid.innerHTML = `<div class="empty-state">В этой категории пока нет позиций.</div>`;
    return;
  }

  grid.innerHTML = products.map(p => `
    <div class="p-card" data-id="${p.id}">
      <div class="p-visual" data-open="${p.id}" style="${visualStyle(brand, p.id)}">
        <div class="p-initial">${brand.initial}</div>
        ${p.badge ? `<div class="p-badge">${p.badge}</div>` : ''}
        <button class="p-fav${state.favorites.has(p.id) ? ' active' : ''}" data-fav="${p.id}" title="В избранное">♥</button>
        <div class="p-quick">Быстрый просмотр</div>
      </div>
      <div class="p-info" data-open="${p.id}">
        <div class="p-cat">${p.category}</div>
        <div class="p-name u-serif">${p.name}</div>
        <div class="p-price">${formatPrice(p.price)}</div>
        <div class="p-sizes">${p.sizes.slice(0, 5).map(s => `<span>${s}</span>`).join('')}${p.sizes.length > 5 ? `<span>+${p.sizes.length - 5}</span>` : ''}</div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('[data-open]').forEach(node => {
    node.addEventListener('click', () => openProductModal(node.dataset.open));
  });
  grid.querySelectorAll('[data-fav]').forEach(node => {
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(node.dataset.fav);
      node.classList.toggle('active');
    });
  });
}

function toggleFavorite(id) {
  if (state.favorites.has(id)) state.favorites.delete(id);
  else state.favorites.add(id);
  saveState();
}

/* ---------- MODAL ---------- */
function openProductModal(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const brand = getBrand(product.brandId);

  state.activeProductId = productId;
  state.selectedSize = null;

  const overlay = document.getElementById('modalOverlay');
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-visual" style="${visualStyle(brand, product.id + 'modal')}">
        <div class="p-initial">${brand.initial}</div>
      </div>
      <div class="modal-body">
        <button class="modal-close" id="modalClose">×</button>
        <div class="m-cat">${brand.name} · ${product.category}</div>
        <h2 class="u-serif">${product.name}</h2>
        <div class="m-price">${formatPrice(product.price)}</div>
        <p class="m-desc">${product.description}</p>
        ${product.badge ? `<div class="m-stock">${product.badge}</div>` : ''}
        <div class="size-label">Выберите размер</div>
        <div class="size-row" id="sizeRow">
          ${product.sizes.map(s => `<div class="size-pill" data-size="${s}">${s}</div>`).join('')}
        </div>
        <div class="m-actions">
          <button class="btn-gold" id="addToBagBtn" disabled>Добавить в сумку</button>
          <button class="btn-ghost" id="closeModalBtn2">Продолжить просмотр</button>
        </div>
        <div class="m-note">Оформление происходит через персонального шоппера Maison D'Or. Учебная демонстрация — реальная оплата не производится.</div>
      </div>
    </div>
  `;
  overlay.classList.add('open');

  overlay.querySelector('#modalClose').addEventListener('click', closeModal);
  overlay.querySelector('#closeModalBtn2').addEventListener('click', closeModal);
  overlay.addEventListener('click', function bg(e) { if (e.target === overlay) closeModal(); });

  overlay.querySelectorAll('.size-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      overlay.querySelectorAll('.size-pill').forEach(p2 => p2.classList.remove('selected'));
      pill.classList.add('selected');
      state.selectedSize = pill.dataset.size;
      overlay.querySelector('#addToBagBtn').disabled = false;
    });
  });

  overlay.querySelector('#addToBagBtn').addEventListener('click', () => {
    if (!state.selectedSize) return;
    addToCart(product.id, state.selectedSize);
    closeModal();
    showToast(`${product.name} (${state.selectedSize}) добавлено в сумку`);
  });
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

/* ---------- CART ---------- */
function addToCart(productId, size) {
  const existing = state.cart.find(i => i.productId === productId && i.size === size);
  if (existing) existing.qty += 1;
  else state.cart.push({ productId, size, qty: 1 });
  saveState();
  updateBagCount();
  renderCartDrawer();
}

function removeFromCart(productId, size) {
  state.cart = state.cart.filter(i => !(i.productId === productId && i.size === size));
  saveState();
  updateBagCount();
  renderCartDrawer();
}

function renderCartDrawer() {
  const wrap = document.getElementById('drawerItems');
  const footer = document.getElementById('drawerFoot');

  if (!state.cart.length) {
    wrap.innerHTML = `<div class="drawer-empty">Ваша сумка пуста.<br>Выберите модель в каталоге, чтобы начать.</div>`;
    footer.innerHTML = '';
    return;
  }

  let total = 0;
  wrap.innerHTML = state.cart.map(item => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    if (!product) return '';
    const brand = getBrand(product.brandId);
    total += product.price * item.qty;
    return `
      <div class="drawer-item">
        <div class="di-visual" style="${visualStyle(brand, product.id + 'cart')}"><div class="p-initial">${brand.initial}</div></div>
        <div class="di-info">
          <div class="di-name u-serif">${product.name}</div>
          <div class="di-meta">${brand.name} · Размер ${item.size} · ×${item.qty}</div>
          <div class="di-price">${formatPrice(product.price * item.qty)}</div>
          <button class="di-remove" data-remove="${product.id}|${item.size}">Удалить</button>
        </div>
      </div>
    `;
  }).join('');

  wrap.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [pid, size] = btn.dataset.remove.split('|');
      removeFromCart(pid, size);
    });
  });

  footer.innerHTML = `
    <div class="drawer-total"><span>Итого</span><b>${formatPrice(total)}</b></div>
    <button class="btn-gold" id="requestBtn">Запросить покупку у шоппера</button>
  `;
  footer.querySelector('#requestBtn').addEventListener('click', () => {
    showToast('Заявка отправлена личному шопперу (демо)');
  });
}

function openDrawer() {
  document.getElementById('drawerOverlay').classList.add('open');
  document.getElementById('cartDrawer').classList.add('open');
  renderCartDrawer();
}
function closeDrawer() {
  document.getElementById('drawerOverlay').classList.remove('open');
  document.getElementById('cartDrawer').classList.remove('open');
}

/* ---------- TOAST ---------- */
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------- ROUTER ---------- */
function render() {
  const parts = parseHash();
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });

  if (parts.length === 0) {
    state.category = null;
    renderHome();
  } else if (parts[0] === 'brand' && parts[1] && !parts[2]) {
    state.category = null;
    renderBrandLanding(parts[1]);
  } else if (parts[0] === 'brand' && parts[1] && parts[2]) {
    renderCatalogPage(parts[1], parts[2]);
  } else {
    renderHome();
  }
}

/* ---------- INIT ---------- */
function initApp() {
  document.getElementById('logoHome').addEventListener('click', () => go('/'));
  document.getElementById('cartBtn').addEventListener('click', openDrawer);
  document.getElementById('drawerClose').addEventListener('click', closeDrawer);
  document.getElementById('drawerOverlay').addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeModal(); closeDrawer(); }
  });

  window.addEventListener('hashchange', render);
  updateBagCount();
  render();
}

document.addEventListener('DOMContentLoaded', initApp);
