/* ============================================================
   IDEA MARKET — логика (роутинг, рендер, покупки, лайки, комменты)
   ============================================================ */

const state = {
  wallet: Number(localStorage.getItem('im_wallet') ?? 75),
  purchased: new Set(JSON.parse(localStorage.getItem('im_purchased') || '[]')),
  liked: new Set(JSON.parse(localStorage.getItem('im_liked') || '[]')),
  myIdeas: JSON.parse(localStorage.getItem('im_myideas') || '[]'),
  myComments: JSON.parse(localStorage.getItem('im_comments') || '[]'),
  category: 'all',
  sort: 'new',
  pendingBuyId: null
};

function saveState() {
  localStorage.setItem('im_wallet', String(state.wallet));
  localStorage.setItem('im_purchased', JSON.stringify([...state.purchased]));
  localStorage.setItem('im_liked', JSON.stringify([...state.liked]));
  localStorage.setItem('im_myideas', JSON.stringify(state.myIdeas));
  localStorage.setItem('im_comments', JSON.stringify(state.myComments));
}

/* ---------- утилиты ---------- */
function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function parseHash() {
  return location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
}

function go(path) {
  location.hash = path;
}

function formatPrice(n) {
  return `$${n}`;
}

function allIdeas() {
  return [...IDEAS, ...state.myIdeas];
}

function getIdea(id) {
  return allIdeas().find(i => i.id === id);
}

function getComments(ideaId) {
  const seeded = COMMENT_SEED.filter(c => c.ideaId === ideaId);
  const mine = state.myComments.filter(c => c.ideaId === ideaId);
  return [...seeded, ...mine];
}

function categoryLabel(id) {
  const c = CATEGORIES.find(c => c.id === id);
  return c ? c.label : id;
}

function updateWalletChip() {
  document.getElementById('walletAmount').textContent = formatPrice(state.wallet);
}

/* ---------- шапка / хлебные крошки ---------- */
function renderCrumbs(parts) {
  const wrap = document.getElementById('crumbs');
  const items = [{ label: 'Лента', href: '#/' }];

  if (parts[0] === 'idea' && parts[1]) {
    const idea = getIdea(parts[1]);
    if (idea) items.push({ label: idea.title, href: `#/idea/${idea.id}` });
  } else if (parts[0] === 'sell') {
    items.push({ label: 'Продать идею', href: '#/sell' });
  } else if (parts[0] === 'profile' && parts[1]) {
    const author = getAuthor(parts[1]);
    if (author) items.push({ label: author.name, href: `#/profile/${author.id}` });
  } else if (parts[0] === 'library') {
    items.push({ label: 'Моя библиотека', href: '#/library' });
  }

  wrap.innerHTML = items.map((it, i) => {
    const isLast = i === items.length - 1;
    return (i > 0 ? '<span class="sep">/</span>' : '') +
      `<span class="crumb${isLast ? ' current' : ''}" data-href="${it.href}">${escapeHtml(it.label)}</span>`;
  }).join('');

  wrap.querySelectorAll('.crumb').forEach(c => {
    c.addEventListener('click', () => go(c.dataset.href.replace(/^#/, '')));
  });
}

/* ---------- КАРТОЧКА ИДЕИ ---------- */
function ideaCardHtml(idea) {
  const author = getAuthor(idea.authorId);
  return `
    <div class="idea-card" data-open="${idea.id}">
      <div class="ic-top">
        <span class="ic-cat">${escapeHtml(categoryLabel(idea.category))}</span>
        ${idea.badge ? `<span class="ic-badge ${idea.badge}">${idea.badge === 'hot' ? '🔥 хит' : '✦ новое'}</span>` : ''}
      </div>
      <div class="ic-title">${escapeHtml(idea.title)}</div>
      <div class="ic-hook">${escapeHtml(idea.hook)}</div>
      <div class="ic-foot">
        <div class="ic-author">
          <span class="ic-avatar">${author.initial}</span>
          ${escapeHtml(author.name)}
        </div>
        <span class="price-pill">${formatPrice(idea.price)}</span>
      </div>
      <div class="ic-stats">
        <span>👁 ${idea.views}</span>
        <span>${state.liked.has(idea.id) ? '♥' : '♡'} ${idea.likes + (state.liked.has(idea.id) ? 1 : 0)}</span>
        <span>💬 ${getComments(idea.id).length}</span>
      </div>
    </div>
  `;
}

function bindCardOpen(container) {
  container.querySelectorAll('[data-open]').forEach(node => {
    node.addEventListener('click', () => go(`/idea/${node.dataset.open}`));
  });
}

/* ---------- HOME ---------- */
function renderHome() {
  const view = document.getElementById('view');
  view.innerHTML = `
    <section class="hero">
      <span class="eyebrow">Закрытый рынок идей</span>
      <h1>Идеи, которые <em>стоят</em> того,<br>чтобы их прочитать до конца.</h1>
      <p>Каждая карточка — это крючок. Полное описание открывается только после покупки.
      Цены от $1 до $50 — учебная демонстрация, реальные платежи не производятся.</p>
      <div class="stat-strip">
        <div class="cell"><div class="num">${allIdeas().length}</div><div class="lbl">Идей в продаже</div></div>
        <div class="cell"><div class="num">${AUTHORS.length}</div><div class="lbl">Авторов</div></div>
        <div class="cell"><div class="num">${CATEGORIES.length}</div><div class="lbl">Категорий</div></div>
      </div>
    </section>

    <div class="cat-tabs" id="catTabs">
      <button class="cat-tab${state.category === 'all' ? ' active' : ''}" data-cat="all">Все</button>
      ${CATEGORIES.map(c => `<button class="cat-tab${state.category === c.id ? ' active' : ''}" data-cat="${c.id}">${escapeHtml(c.label)}</button>`).join('')}
    </div>

    <div class="toolbar">
      <span id="resultCount"></span>
      <div class="sort-row" id="sortRow">
        <button class="sort-btn${state.sort === 'new' ? ' active' : ''}" data-sort="new">Новое</button>
        <button class="sort-btn${state.sort === 'popular' ? ' active' : ''}" data-sort="popular">Популярное</button>
        <button class="sort-btn${state.sort === 'cheap' ? ' active' : ''}" data-sort="cheap">Дешевле</button>
        <button class="sort-btn${state.sort === 'expensive' ? ' active' : ''}" data-sort="expensive">Дороже</button>
      </div>
    </div>

    <div class="idea-grid" id="ideaGrid"></div>
  `;

  view.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.category = tab.dataset.cat;
      renderHome();
    });
  });
  view.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.sort = btn.dataset.sort;
      renderHome();
    });
  });

  renderFeedGrid();
  renderCrumbs([]);
}

function renderFeedGrid() {
  let ideas = allIdeas();
  if (state.category !== 'all') ideas = ideas.filter(i => i.category === state.category);

  ideas = [...ideas];
  if (state.sort === 'popular') ideas.sort((a, b) => b.likes - a.likes);
  else if (state.sort === 'cheap') ideas.sort((a, b) => a.price - b.price);
  else if (state.sort === 'expensive') ideas.sort((a, b) => b.price - a.price);
  else ideas.reverse();

  document.getElementById('resultCount').textContent = `${ideas.length} идей`;
  const grid = document.getElementById('ideaGrid');

  if (!ideas.length) {
    grid.innerHTML = `<div class="empty-state">В этой категории пока нет идей.</div>`;
    return;
  }

  grid.innerHTML = ideas.map(ideaCardHtml).join('');
  bindCardOpen(grid);
}

/* ---------- IDEA PAGE ---------- */
function renderIdeaPage(id) {
  const idea = getIdea(id);
  const view = document.getElementById('view');
  if (!idea) { go('/'); return; }

  idea.views += 1; // демо-инкремент просмотров за сеанс

  const author = getAuthor(idea.authorId);
  const isOwned = state.purchased.has(idea.id);
  const isLiked = state.liked.has(idea.id);
  const likeCount = idea.likes + (isLiked ? 1 : 0);
  const comments = getComments(idea.id);

  view.innerHTML = `
    <div class="idea-page">
      <div class="idp-head">
        <span class="ic-cat">${escapeHtml(categoryLabel(idea.category))}</span>
        ${idea.badge ? `<span class="ic-badge ${idea.badge}" style="margin-left:8px">${idea.badge === 'hot' ? '🔥 хит' : '✦ новое'}</span>` : ''}
      </div>
      <h1 class="idp-title">${escapeHtml(idea.title)}</h1>
      <div class="idp-hook">${escapeHtml(idea.hook)}</div>

      <div class="idp-meta-row">
        <div class="idp-stats">
          <span>👁 ${idea.views} просмотров</span>
          <span>💬 ${comments.length} комментариев</span>
        </div>
        <button class="like-btn${isLiked ? ' liked' : ''}" id="likeBtn">
          <span>${isLiked ? '♥' : '♡'}</span> <span id="likeCount">${likeCount}</span>
        </button>
      </div>

      <a class="author-card" href="#/profile/${author.id}">
        <span class="ic-avatar">${author.initial}</span>
        <div>
          <div class="ac-name">${escapeHtml(author.name)}</div>
          <div class="ac-sub">★ ${author.rating} · ${author.sold} продаж</div>
        </div>
        <span class="ac-arrow">Профиль →</span>
      </a>

      <div class="idp-body-wrap" id="bodyWrap">
        ${isOwned ? `<div class="unlocked-tag">✓ Открыто · вы купили эту идею</div>` : ''}
        <div class="idp-body${isOwned ? '' : ' idp-locked'}">${escapeHtml(idea.body)}</div>
        ${isOwned ? '' : `
          <div class="lock-cta">
            <div class="lock-icon">🔒</div>
            <h3>Полное описание закрыто</h3>
            <p>Проблема, инсайт, план действий и разбор — доступны сразу после покупки.</p>
            <button class="btn-buy" id="buyBtn">Купить за ${formatPrice(idea.price)}</button>
          </div>
        `}
      </div>

      <div class="comments">
        <h3>Комментарии (${comments.length})</h3>
        <form class="comment-form" id="commentForm">
          <input type="text" id="commentInput" placeholder="Оставить комментарий..." maxlength="240" required>
          <button type="submit">Отправить</button>
        </form>
        <div id="commentList">
          ${comments.length ? comments.map(commentHtml).join('') : '<div class="hint">Пока нет комментариев — будьте первым.</div>'}
        </div>
      </div>
    </div>
  `;

  const likeBtn = document.getElementById('likeBtn');
  likeBtn.addEventListener('click', () => {
    toggleLike(idea.id);
    const nowLiked = state.liked.has(idea.id);
    likeBtn.classList.toggle('liked', nowLiked);
    likeBtn.querySelector('span').textContent = nowLiked ? '♥' : '♡';
    document.getElementById('likeCount').textContent = idea.likes + (nowLiked ? 1 : 0);
  });

  const buyBtn = document.getElementById('buyBtn');
  if (buyBtn) buyBtn.addEventListener('click', () => openBuyModal(idea.id));

  document.getElementById('commentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    if (!text) return;
    addComment(idea.id, text);
    input.value = '';
    renderIdeaPage(idea.id);
  });

  renderCrumbs(['idea', idea.id]);
}

function commentHtml(c) {
  return `
    <div class="comment">
      <span class="ic-avatar">${escapeHtml(c.author.slice(0, 2).toUpperCase())}</span>
      <div class="comment-body">
        <div class="comment-top">
          <span class="comment-author">${escapeHtml(c.author)}</span>
          <span class="comment-ts">${escapeHtml(c.ts)}</span>
        </div>
        <div class="comment-text">${escapeHtml(c.text)}</div>
      </div>
    </div>
  `;
}

function toggleLike(id) {
  if (state.liked.has(id)) state.liked.delete(id);
  else state.liked.add(id);
  saveState();
}

function addComment(ideaId, text) {
  state.myComments.push({
    id: 'uc-' + Date.now(),
    ideaId,
    author: 'Вы',
    text,
    ts: 'только что'
  });
  saveState();
}

/* ---------- ПОКУПКА ---------- */
function openBuyModal(ideaId) {
  const idea = getIdea(ideaId);
  if (!idea) return;
  state.pendingBuyId = ideaId;

  const overlay = document.getElementById('modalOverlay');
  const enough = state.wallet >= idea.price;

  overlay.innerHTML = `
    <div class="modal">
      <button class="modal-close" id="modalClose">×</button>
      <h2>${escapeHtml(idea.title)}</h2>
      <p class="m-hook">${escapeHtml(idea.hook)}</p>
      <div class="m-price-row">
        <span class="lbl">Стоимость</span>
        <span class="val">${formatPrice(idea.price)}</span>
      </div>
      <p class="m-balance">Ваш баланс: <b>${formatPrice(state.wallet)}</b></p>
      <div class="m-actions">
        ${enough
          ? `<button class="btn-buy" id="confirmBuyBtn">Подтвердить покупку</button>`
          : `<button class="btn-buy" id="topupFromModalBtn">Пополнить баланс на $50</button>`}
        <button class="btn-ghost-sm" id="cancelBuyBtn" style="text-align:center">Отмена</button>
      </div>
      <div class="m-note">Демо-покупка: реальные деньги не списываются.</div>
    </div>
  `;
  overlay.classList.add('open');

  overlay.querySelector('#modalClose').addEventListener('click', closeModal);
  overlay.querySelector('#cancelBuyBtn').addEventListener('click', closeModal);
  overlay.addEventListener('click', function bg(e) { if (e.target === overlay) closeModal(); });

  const confirmBtn = overlay.querySelector('#confirmBuyBtn');
  if (confirmBtn) confirmBtn.addEventListener('click', () => confirmPurchase(ideaId));

  const topupBtn = overlay.querySelector('#topupFromModalBtn');
  if (topupBtn) topupBtn.addEventListener('click', () => {
    topUpWallet(50);
    openBuyModal(ideaId);
  });
}

function confirmPurchase(ideaId) {
  const idea = getIdea(ideaId);
  if (!idea || state.wallet < idea.price) return;
  state.wallet -= idea.price;
  state.purchased.add(ideaId);
  saveState();
  updateWalletChip();
  closeModal();
  showToast(`«${idea.title}» разблокирована`);
  if (parseHash()[0] === 'idea' && parseHash()[1] === ideaId) renderIdeaPage(ideaId);
}

function topUpWallet(amount) {
  state.wallet += amount;
  saveState();
  updateWalletChip();
  showToast(`Баланс пополнен на ${formatPrice(amount)}`);
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

/* ---------- SELL ---------- */
function renderSellPage() {
  const view = document.getElementById('view');
  view.innerHTML = `
    <section class="hero" style="padding-top:0">
      <span class="eyebrow">Продать идею</span>
      <h1>Опишите идею так,<br>чтобы её <em>захотели</em> дочитать.</h1>
      <p>Крючок виден всем бесплатно. Полное описание открывается только после покупки — постройте его по схеме: проблема → инсайт → что внутри → почему сработает.</p>
    </section>
    <div class="sell-wrap">
      <form class="sell-form" id="sellForm">
        <div class="field">
          <label for="f-title">Заголовок</label>
          <input type="text" id="f-title" maxlength="90" placeholder="Например: Подписка на второй холодильник..." required>
        </div>
        <div class="field">
          <label for="f-category">Категория</label>
          <select id="f-category">
            ${CATEGORIES.map(c => `<option value="${c.id}">${escapeHtml(c.label)}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label for="f-hook">Крючок (виден всем бесплатно)</label>
          <textarea id="f-hook" maxlength="220" placeholder="1-2 цепляющих предложения, которые заставят прочитать дальше" required></textarea>
          <div class="hint">Это единственное, что читатель увидит до покупки — сделайте его сильным.</div>
        </div>
        <div class="field">
          <label for="f-body">Полное описание (открывается после покупки)</label>
          <textarea id="f-body" maxlength="4000" style="min-height:180px" placeholder="Проблема → Инсайт → Что внутри → Почему сработает" required></textarea>
        </div>
        <div class="field">
          <label for="f-price">Цена</label>
          <div class="price-row">
            <input type="range" id="f-price" min="1" max="50" value="15">
            <span class="price-live" id="priceLive">$15</span>
          </div>
          <div class="hint">Диапазон цен на площадке: от $1 до $50.</div>
        </div>
        <div class="submit-row">
          <button type="submit" class="btn-buy">Опубликовать идею</button>
        </div>
      </form>

      <div class="preview-col">
        <div class="preview-label">Так будет выглядеть карточка</div>
        <div id="cardPreview"></div>
      </div>
    </div>
  `;

  const form = document.getElementById('sellForm');
  const priceInput = document.getElementById('f-price');
  const priceLive = document.getElementById('priceLive');
  const preview = document.getElementById('cardPreview');

  function updatePreview() {
    const draft = {
      id: 'preview',
      authorId: 'me',
      category: document.getElementById('f-category').value,
      title: document.getElementById('f-title').value.trim() || 'Заголовок вашей идеи',
      hook: document.getElementById('f-hook').value.trim() || 'Здесь появится ваш крючок — то, что цепляет с первого предложения.',
      price: Number(priceInput.value),
      likes: 0,
      views: 0,
      badge: 'new'
    };
    preview.innerHTML = ideaCardHtml(draft);
  }

  priceInput.addEventListener('input', () => {
    priceLive.textContent = formatPrice(priceInput.value);
    updatePreview();
  });
  form.querySelectorAll('input,textarea,select').forEach(n => n.addEventListener('input', updatePreview));
  updatePreview();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('f-title').value.trim();
    const hook = document.getElementById('f-hook').value.trim();
    const body = document.getElementById('f-body').value.trim();
    const category = document.getElementById('f-category').value;
    const price = Number(priceInput.value);
    if (!title || !hook || !body) return;

    const id = 'my-' + Date.now();
    state.myIdeas.push({
      id, authorId: 'me', category, title, hook, body, price,
      likes: 0, views: 0, badge: 'new'
    });
    saveState();
    showToast('Идея опубликована');
    go(`/idea/${id}`);
  });

  renderCrumbs(['sell']);
}

/* ---------- PROFILE ---------- */
function renderProfilePage(authorId) {
  const author = getAuthor(authorId);
  const view = document.getElementById('view');
  if (!author) { go('/'); return; }

  const ideas = allIdeas().filter(i => i.authorId === author.id);

  view.innerHTML = `
    <div class="profile-hero">
      <span class="ic-avatar">${author.initial}</span>
      <div>
        <h1>${escapeHtml(author.name)}</h1>
        <div class="p-bio">${escapeHtml(author.bio)}</div>
        <div class="p-stats">
          <span>★ ${author.rating}</span>
          <span>${author.sold} продаж</span>
          <span>${ideas.length} идей на витрине</span>
        </div>
      </div>
    </div>
    <div class="section-title">Идеи автора</div>
    <div class="idea-grid" id="authorGrid"></div>
  `;

  const grid = document.getElementById('authorGrid');
  grid.innerHTML = ideas.length
    ? ideas.map(ideaCardHtml).join('')
    : '<div class="empty-state">Пока нет опубликованных идей.</div>';
  bindCardOpen(grid);

  renderCrumbs(['profile', author.id]);
}

/* ---------- LIBRARY ---------- */
function renderLibraryPage() {
  const view = document.getElementById('view');
  const tab = (parseHash()[1]) || 'purchased';

  const purchased = allIdeas().filter(i => state.purchased.has(i.id));
  const mine = state.myIdeas;

  view.innerHTML = `
    <div class="wallet-card">
      <div>
        <div class="wl-num" id="wlNum">${formatPrice(state.wallet)}</div>
        <div class="wl-label">Демо-баланс</div>
      </div>
      <button class="btn-topup" id="topupBtn">Пополнить на $50</button>
    </div>

    <div class="tab-row">
      <button class="lib-tab${tab === 'purchased' ? ' active' : ''}" data-tab="purchased">Мои покупки (${purchased.length})</button>
      <button class="lib-tab${tab === 'mine' ? ' active' : ''}" data-tab="mine">Мои идеи (${mine.length})</button>
    </div>

    <div class="idea-grid" id="libGrid"></div>
  `;

  document.getElementById('topupBtn').addEventListener('click', () => {
    topUpWallet(50);
    document.getElementById('wlNum').textContent = formatPrice(state.wallet);
  });

  view.querySelectorAll('.lib-tab').forEach(btn => {
    btn.addEventListener('click', () => go(`/library/${btn.dataset.tab}`));
  });

  const grid = document.getElementById('libGrid');
  const list = tab === 'mine' ? mine : purchased;
  grid.innerHTML = list.length
    ? list.map(ideaCardHtml).join('')
    : `<div class="empty-state">${tab === 'mine' ? 'Вы ещё не опубликовали ни одной идеи.' : 'Вы ещё ничего не купили.'}</div>`;
  bindCardOpen(grid);

  renderCrumbs(['library']);
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
    renderHome();
  } else if (parts[0] === 'idea' && parts[1]) {
    renderIdeaPage(parts[1]);
  } else if (parts[0] === 'sell') {
    renderSellPage();
  } else if (parts[0] === 'profile' && parts[1]) {
    renderProfilePage(parts[1]);
  } else if (parts[0] === 'library') {
    renderLibraryPage();
  } else {
    renderHome();
  }
}

/* ---------- INIT ---------- */
function initApp() {
  document.getElementById('logoHome').addEventListener('click', () => go('/'));
  document.getElementById('walletBtn').addEventListener('click', () => go('/library'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  window.addEventListener('hashchange', render);
  updateWalletChip();
  render();
}

document.addEventListener('DOMContentLoaded', initApp);
