'use strict';
/* Veil — прототип приватного мессенджера. Всё хранится локально (localStorage),
   собеседники и их геопозиции симулируются. Бэкенд не нужен. */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];

/* ───────── иконки ───────── */
const IC = {
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  map: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M18 14.8c2 .6 3.2 2.3 3.5 5.2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4.2 4-6.5 8-6.5s7.2 2.3 8 6.5"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="3"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  send: '<path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/>',
  clip: '<path d="M20 11.5 12 19.5a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8"/>',
  timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 1.5M9.5 3h5"/>',
  trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>',
  crown: '<path d="M3.5 8l4.5 4 4-7 4 7 4.5-4-1.7 11H5.2z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  ghost: '<path d="M5 20V11a7 7 0 0 1 14 0v9l-3-2-2 2-2-2-2 2-2-2z"/><circle cx="9.5" cy="11" r=".8" fill="currentColor"/><circle cx="14.5" cy="11" r=".8" fill="currentColor"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  more: '<circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="19" cy="12" r="1.2" fill="currentColor"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5"/>',
  flame: '<path d="M12 3c.5 3.5 4.5 5 4.5 10a4.5 4.5 0 0 1-9 0c0-2 1-3 2-4 0 1.5.8 2.2 1.5 2.2C11.5 8.5 10.5 6 12 3z"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  locate: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  shield: '<path d="M12 3l7.5 3v5.5c0 4.5-3 8-7.5 9.5-4.5-1.5-7.5-5-7.5-9.5V6z"/>',
  palette: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 2-1 1.5-2-.6-1.2.2-2.5 1.6-2.5H17a3.5 3.5 0 0 0 3.5-3.5C20.5 7 16.8 3.5 12 3.5z"/><circle cx="8" cy="11" r="1" fill="currentColor"/><circle cx="11" cy="7.8" r="1" fill="currentColor"/><circle cx="15" cy="8.5" r="1" fill="currentColor"/>',
  video: '<rect x="3" y="6.5" width="12.5" height="11" rx="3"/><path d="M15.5 10.5l5-2.5v8l-5-2.5"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z"/>',
  star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z"/>',
  eyeoff: '<path d="M3 3l18 18M10.6 6.2A9 9 0 0 1 12 6c5 0 8.5 4.5 9.5 6-.5.8-1.6 2.1-3.1 3.3M6.6 7.6C4.6 9 3.3 10.9 2.5 12c1 1.5 4.5 6 9.5 6 1.3 0 2.5-.3 3.6-.8"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/>'
};
const ic = (n, s = 22) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${IC[n]}</svg>`;

/* ───────── состояние ───────── */
const KEY = 'veil.v1';
const DEFAULT_THEME = { accent: '#0a84ff', hue: null, grad: 45, glass: 50, bubble: 'round' };
const ACCENTS = ['#0a84ff', '#30d158', '#ff375f', '#bf5af2', '#ff9f0a', '#64d2ff', '#ffd60a', '#ff6482', '#5e5ce6', '#ac8e68'];
const BGS = [
  { n: 'Графит', hue: null }, { n: 'Полночь', hue: 228 }, { n: 'Аврора', hue: 172 },
  { n: 'Ember', hue: 12 }, { n: 'Лес', hue: 140 }, { n: 'Слива', hue: 290 }, { n: 'Океан', hue: 200 }
];
const seed = () => ({
  me: { name: '', username: '', bio: '', h: 215, img: null, photos: [] },
  premium: false,
  theme: { ...DEFAULT_THEME },
  map: { ghost: false, audience: 'all', selected: [], precise: true },
  contacts: [],
  chats: []
});

let S;
function load() {
  try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
  if (!S || !S.me) S = seed();
  // видео живут только в сессии
  S.chats.forEach(c => c.msgs.forEach(m => { if (m.media && m.media.type === 'video' && !/^blob:/.test(m.media.url)) delete m.media; else if (m.media && m.media.type === 'video') { delete m.media; m.text = m.text || '🎞 Видео (только в сессии)'; } }));
}
function save() {
  try {
    const copy = JSON.parse(JSON.stringify(S, (k, v) => (k === 'typing' || k === 'dying') ? undefined : v));
    copy.chats.forEach(c => c.msgs.forEach(m => { if (m.media && m.media.type === 'video') { delete m.media; m.text = m.text || '🎞 Видео'; } }));
    copy.me.videos = [];
    localStorage.setItem(KEY, JSON.stringify(copy));
  } catch (e) { /* квота — не критично */ }
}
const videosMem = [];
const CATALOG = []; // публичный каталог групп приходит с сервера
const Transport = window.VeilTransport || { send() {} };

/* ───────── утилиты UI ───────── */
const fmtTime = ts => new Date(ts).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
const fmtAgo = ts => { const d = Date.now() - ts; if (d < 60e3) return 'сейчас'; if (d < 3600e3) return Math.floor(d / 60e3) + ' мин'; if (d < 86400e3) return fmtTime(ts); return 'вчера'; };
const fmtTTL = s => s < 60 ? s + ' с' : s < 3600 ? (s / 60) + ' мин' : s < 86400 ? (s / 3600) + ' ч' : (s / 86400) + ' дн';
const left = t => { const s = Math.max(0, Math.ceil((t - Date.now()) / 1000)); return s >= 3600 ? Math.floor(s / 3600) + 'ч' : s >= 60 ? Math.floor(s / 60) + 'м' : s + 'с'; };
const grad = h => `linear-gradient(135deg,hsl(${h} 80% 62%),hsl(${(h + 40) % 360} 75% 42%))`;
function avatar(o, size = 50) {
  const st = `width:${size}px;height:${size}px;font-size:${size * .4}px;`;
  if (o.img) return `<div class="av" style="${st}"><img src="${o.img}" alt=""></div>`;
  return `<div class="av" style="${st}background:${grad(o.h ?? 210)}">${esc((o.name || '?')[0].toUpperCase())}</div>`;
}
const chatById = id => S.chats.find(c => c.id === id);
const contactById = id => S.contacts.find(c => c.id === id);
const lastMsg = c => c.msgs[c.msgs.length - 1];
function toast(t) {
  const el = $('#toast'); el.textContent = t; el.classList.add('on');
  clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 2200);
}
const sw = on => `<span class="sw ${on ? 'on' : ''}"></span>`;

/* ───────── тема (Premium) ───────── */
function applyTheme() {
  const t = S.premium ? S.theme : DEFAULT_THEME, r = document.documentElement.style;
  const g = t.grad / 100, neutral = t.hue == null, sat = neutral ? 7 : 62;
  const hue = neutral ? 250 : t.hue;
  r.setProperty('--accent', t.accent);
  r.setProperty('--accent2', shade(t.accent));
  r.setProperty('--bg1', neutral ? '#000' : `hsl(${hue} 45% 3%)`);
  r.setProperty('--bg2', `hsl(${hue} ${sat}% ${4 + g * 14}%)`);
  r.setProperty('--bg3', `hsl(${(hue + 25) % 360} ${sat}% ${6 + g * 24}%)`);
  const gs = 25 + g * 45;
  r.setProperty('--panel', neutral
    ? 'linear-gradient(165deg,#74b5b1 0%,#9b90c6 32%,#8d8bc2 62%,#7aa6b4 100%)'
    : `linear-gradient(165deg,hsl(${(hue + 340) % 360} ${gs}% 58%) 0%,hsl(${hue} ${gs + 6}% 64%) 34%,hsl(${(hue + 20) % 360} ${gs + 2}% 60%) 64%,hsl(${(hue + 350) % 360} ${gs - 4}% 55%) 100%)`);
  r.setProperty('--ga', (.12 + t.glass / 100 * .3).toFixed(2));
  r.setProperty('--blur', (10 + t.glass * .3) + 'px');
  r.setProperty('--r-bub', t.bubble === 'square' ? '8px' : t.bubble === 'soft' ? '26px' : '20px');
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = '#000000';
}
function shade(hex) { // второй цвет градиента — сдвиг оттенка
  const n = parseInt(hex.slice(1), 16), R = n >> 16 & 255, G = n >> 8 & 255, B = n & 255;
  const [h, s, l] = rgb2hsl(R, G, B); return `hsl(${(h + 32) % 360} ${Math.max(50, s)}% ${Math.max(38, l - 6)}%)`;
}
function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2;
  if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
  return [h, s * 100, l * 100];
}

/* ───────── каркас ───────── */
let tab = 'chats', curChat = null;
function shell() {
  $('#app').innerHTML = `
  <div class="view on" id="v-chats"></div>
  <div class="view" id="v-map"></div>
  <div class="view" id="v-groups"></div>
  <div class="view" id="v-profile"></div>
  <nav id="tabbar" class="glass"></nav>
  <section id="chatpage"></section>
  <div id="sheets"></div>
  <div id="toast" class="glass"></div>`;
}
function renderTabbar() {
  const un = S.chats.reduce((a, c) => a + (c.unread || 0), 0);
  const T = [['chats', 'chat', 'Чаты'], ['map', 'map', 'Карта'], ['groups', 'users', 'Группы'], ['profile', 'user', 'Профиль']];
  $('#tabbar').innerHTML = T.map(([k, i, l]) => `<button data-act="tab" data-v="${k}" class="${tab === k ? 'on' : ''}">${ic(i, 24)}<span>${l}</span>${k === 'chats' && un ? `<i class="tb">${un}</i>` : ''}</button>`).join('');
}
function switchTab(t) {
  tab = t; $$('.view').forEach(v => v.classList.toggle('on', v.id === 'v-' + t));
  renderTabbar();
  if (t === 'map') initMap();
  if (t === 'groups') renderGroups();
  if (t === 'profile') renderProfile();
  if (t === 'chats') renderChats();
}

/* ───────── чаты: список ───────── */
function renderChatsView() {
  $('#v-chats').innerHTML = `
    <div class="scroll" id="chatscroll" style="padding:0 0 130px">
      <section class="panel hero">
        <div class="statusbar"></div>
        <div class="toprow"><label class="search"><span>${ic('search', 18)}</span><input id="q" placeholder="Поиск" autocomplete="off"></label>
          <button class="circ soft" data-act="newchat">${ic('edit', 20)}</button></div>
        <h1>Оставайтесь<br>на связи</h1>
        <div class="strip" id="strip"></div>
      </section>
      <div id="chatlist"></div>
    </div>`;
  renderChats();
}
function renderStrip() {
  const el = $('#strip'); if (!el) return;
  el.innerHTML = `<button class="sb" data-act="newchat"><i class="add">${ic('plus', 26)}</i><span>Новый</span></button>` +
    S.chats.filter(c => c.type !== 'group').slice(0, 8).map(c => `<button class="sb" data-act="open" data-id="${c.id}">${avatar(c, 64)}<span>${esc(c.name.replace(/^@/, ''))}</span></button>`).join('');
}
function renderChats() {
  const box = $('#chatlist'); if (!box) return; renderStrip();
  const q = ($('#q')?.value || '').toLowerCase();
  const list = S.chats.filter(c => c.name.toLowerCase().includes(q)).sort((a, b) => (lastMsg(b)?.ts || 0) - (lastMsg(a)?.ts || 0));
  if (!list.length) { box.innerHTML = `<div class="empty">${ic('chat', 46)}<br>Пока здесь пусто.<br>Нажмите ✎ и напишите первое сообщение.</div>`; renderTabbar(); return; }
  box.innerHTML = `<div class="list plain">` + list.map(c => {
    const m = lastMsg(c); let pv = m ? (m.media ? (m.media.type === 'video' ? '🎞 Видео' : '📷 Фото') : m.text) : 'Нет сообщений';
    if (c.typing) pv = 'печатает…';
    const sec = c.type === 'secret';
    if (sec && m && m.from === 'them' && m.ttl) pv = 'Зашифрованное сообщение';
    if (m && m.from === 'me' && !c.typing) pv = 'Вы: ' + pv;
    return `<div class="item" data-act="open" data-id="${c.id}">${avatar(c, 52)}
      <div class="mid"><div class="nm">${sec ? ic('lock', 14) : ''}${esc(c.name)}${c.type === 'group' ? kindPill(c.kind, true) : ''}</div>
      <div class="pv ${sec ? 'sec' : ''}">${esc(pv)}</div></div>
      <div class="rt"><span>${m ? fmtAgo(m.ts) : ''}</span>${c.unread ? `<i class="badge">${c.unread}</i>` : (c.ttl ? `<span style="color:#ffb340">${ic('timer', 15)}</span>` : '')}</div></div>`;
  }).join('') + `</div>`;
  renderTabbar();
}
function kindPill(k, small) {
  const m = { open: ['globe', 'Открытая'], closed: ['lock', 'Закрытая'], paid: ['star', 'Платная'] }[k];
  return `<span class="pill ${k}" ${small ? 'style="margin-left:4px;font-size:10.5px;padding:2px 7px"' : ''}>${ic(m[0], 11)}${m[1]}</span>`;
}

/* ───────── чат ───────── */
function openChat(id) {
  const c = chatById(id); if (!c) return;
  curChat = id; c.unread = 0;
  const page = $('#chatpage'); page.classList.remove('burning', 'shielded');
  const sec = c.type === 'secret';
  page.innerHTML = `
    <div id="shield">${ic('shield', 44)}<b>Экран защищён</b><small>Вернитесь в окно, чтобы продолжить</small></div>
    <div class="panel"><header class="chead">
      <button class="circ" data-act="back">${ic('back', 24)}</button>
      ${c.type === 'group' ? avatar(c, 40) : avatar(c, 40)}
      <div class="ttl"><b>${sec ? ic("lock", 13) : ""}${esc(c.name)}</b><small id="csub"></small></div>
      <button class="circ" data-act="cmenu">${ic('more', 24)}</button>
    </header>
    <div class="msgs" id="msgs"></div></div>
    <div class="composer">
      <button class="circ soft" data-act="attach">${ic('clip', 21)}</button>
      <label class="field"><input id="msgin" placeholder="${sec ? 'Секретное сообщение' : 'Сообщение'}" autocomplete="off">${sec ? `<button class="chip" data-act="ttl" id="ttlchip"></button>` : ''}</label>
      <button class="circ sendbtn" data-act="send">${ic('send', 20)}</button>
    </div>`;
  renderMsgs(true); updateChatSub();
  page.classList.add('open');
  $('#msgin').addEventListener('keydown', e => { if (e.key === 'Enter') sendText(); });
  renderChats();
}
function updateChatSub() {
  const c = chatById(curChat); if (!c) return; const el = $('#csub'); if (!el) return;
  if (c.typing) { el.textContent = 'печатает…'; el.className = ''; }
  else if (c.type === 'secret') { el.textContent = 'сквозное шифрование' + (c.ttl ? ' · исчезают через ' + fmtTTL(c.ttl) : ''); el.className = 'g'; }
  else if (c.type === 'group') { el.textContent = (c.members.length + 1) + ' участн. · ' + { open: 'открытая', closed: 'закрытая', paid: 'платная' }[c.kind]; el.className = ''; }
  else { el.textContent = 'в сети'; el.className = ''; }
  const chip = $('#ttlchip'); if (chip) chip.innerHTML = c.ttl ? ic('flame', 13) + fmtTTL(c.ttl) : ic('timer', 13) + 'выкл';
}
function msgHTML(c, m) {
  const mine = m.from === 'me', sec = c.type === 'secret';
  let body = '';
  if (m.media) body += m.media.type === 'video' ? `<video src="${m.media.url}" controls playsinline></video>` : `<img src="${m.media.url}" alt="">`;
  if (m.text) body += `<div class="txt">${esc(m.text)}</div>`;
  const who = c.type === 'group' && !mine ? `<div class="who" style="color:hsl(${m.h || 200} 85% 72%)">${esc(m.name)}</div>` : '';
  const fire = m.expiresAt ? `<span class="fire" data-exp="${m.expiresAt}">${ic('flame', 11)}${left(m.expiresAt)}</span>` : (m.ttl && !mine ? `<span class="fire">${ic('flame', 11)}${fmtTTL(m.ttl)}</span>` : '');
  return `<div class="row ${mine ? 'me' : 'them'} ${m.dying ? 'dissolve' : ''}" data-mid="${m.id}"><div class="bub ${sec && !mine ? 'veil' : ''}">${who}${body}<div class="meta">${fire}${fmtTime(m.ts)}${mine ? ic('check', 12) : ''}</div></div></div>`;
}
function renderMsgs(scroll) {
  const c = chatById(curChat), box = $('#msgs'); if (!c || !box) return;
  const sec = c.type === 'secret';
  const note = sec ? `<div class="sysnote glass g">${ic('lock', 14)} Секретный чат · сообщения не хранятся на сервере, не пересылаются и исчезают по таймеру. Чат можно уничтожить у обоих.</div>` : (c.type === 'group' && c.kind === 'closed' ? `<div class="sysnote glass">Закрытая группа · вход только по приглашению</div>` : '');
  box.innerHTML = note + c.msgs.map(m => msgHTML(c, m)).join('') + (c.typing ? `<div class="typing glass"><i></i><i></i><i></i></div>` : '');
  if (scroll !== false) box.scrollTop = box.scrollHeight;
}
function sendMsg(c, data) {
  const m = { id: uid(), from: 'me', ts: Date.now(), ...data };
  if (c.type === 'secret' && c.ttl) m.expiresAt = Date.now() + c.ttl * 1000;
  c.msgs.push(m); save(); renderMsgs(); renderChats(); simulateReply(c);
}
function sendText() {
  const inp = $('#msgin'), t = inp.value.trim(); if (!t) return;
  inp.value = ''; sendMsg(chatById(curChat), { text: t });
}
function simulateReply(c) { Transport.send(c); }
function armTimer(m, c) { if (c.type === 'secret' && m.ttl && !m.expiresAt) m.expiresAt = Date.now() + m.ttl * 1000; }
async function shrink(file, max = 900, q = .8) {
  const url = URL.createObjectURL(file);
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
  const k = Math.min(1, max / Math.max(img.width, img.height)), cv = document.createElement('canvas');
  cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
  cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url);
  return cv.toDataURL('image/jpeg', q);
}
async function readMedia(file) {
  if (file.type.startsWith('video/')) { const url = URL.createObjectURL(file); videosMem.push(url); return { type: 'video', url }; }
  return { type: 'image', url: await shrink(file) };
}

/* меню чата */
function chatMenu() {
  const c = chatById(curChat); if (!c) return;
  let h = '';
  if (c.type === 'secret') {
    h = `<h2>🔒 ${esc(c.name)}</h2><p class="sub">Секретный чат. Ключи только на ваших устройствах.</p>
      <div class="grp">
        <button class="cell" data-act="ttl">${ic('timer', 22).replace('class="ic"', 'class="ic tint"')}<span class="l">Автоудаление сообщений<small>${c.ttl ? 'Через ' + fmtTTL(c.ttl) : 'Выключено'}</small></span>${ic('chev', 18)}</button>
        <button class="cell" data-act="tg-auto">${ic('flame', 22)}<span class="l">Уничтожить при выходе<small>Чат исчезнет сразу, как вы его закроете</small></span>${sw(c.autoDestroy)}</button>
        <button class="cell" data-act="tg-protect">${ic('shield', 22)}<span class="l">Защита экрана<small>Скрывать чат при сворачивании окна</small></span>${sw(S.protect !== false)}</button>
      </div>
      <button class="btn dng" data-act="destroy">${ic('trash', 20)} Уничтожить чат у обоих</button>`;
  } else if (c.type === 'direct') {
    h = `<h2>${esc(c.name)}</h2><p class="sub">Обычный облачный чат.</p>
      <div class="grp"><button class="cell" data-act="mksecret">${ic('lock', 22)}<span class="l">Начать секретный чат<small>Шифрование, таймер, самоуничтожение</small></span>${ic('chev', 18)}</button></div>
      <button class="btn dng" data-act="delete">${ic('trash', 20)} Удалить чат</button>`;
  } else {
    h = `<h2>${esc(c.name)}</h2><p class="sub">${kindPill(c.kind)} · ${c.members.length + 1} участников${c.kind === 'paid' ? ` · ${c.price} $ / ${c.period}` : ''}</p>
      ${c.owner ? `<div class="grp"><div class="cell"><span class="l">Ссылка-приглашение<small>veil.app/${c.id}</small></span></div></div>` : ''}
      <button class="btn dng" data-act="delete">${ic('trash', 20)} ${c.owner ? 'Удалить группу' : 'Покинуть группу'}</button>`;
  }
  sheet(h);
}
function ttlSheet() {
  const c = chatById(curChat); if (!c) return;
  const O = [[0, 'Выключено'], [5, '5 секунд'], [30, '30 секунд'], [60, '1 минута'], [3600, '1 час'], [86400, '1 день']];
  sheet(`<h2>Автоудаление</h2><p class="sub">Сообщения исчезнут через выбранное время после отправки/прочтения.</p>
    <div class="grp">${O.map(([v, l]) => `<button class="cell" data-act="setttl" data-v="${v}"><span class="l">${l}</span>${c.ttl === v ? ic('check', 20).replace('class="ic"', 'class="ic tint"') : ''}</button>`).join('')}</div>`);
}
function destroyChat(id, quiet) {
  const c = chatById(id); if (!c) return;
  const fin = () => {
    S.chats = S.chats.filter(x => x.id !== id); save();
    if (curChat === id) { curChat = null; $('#chatpage').classList.remove('open'); }
    renderChats(); if (!quiet) toast(c.type === 'secret' ? '🔥 Чат уничтожен у обоих' : 'Чат удалён');
  };
  if (quiet) return fin();
  $('#chatpage').classList.add('burning'); closeSheet(); setTimeout(fin, 780);
}
function closeChat() {
  const c = chatById(curChat);
  $('#chatpage').classList.remove('open'); const id = curChat; curChat = null;
  if (c && c.type === 'secret' && c.autoDestroy) { setTimeout(() => { destroyChat(id, true); toast('🔥 Секретный чат уничтожен'); }, 380); }
  renderChats();
}

/* ───────── шторки ───────── */
function sheet(html) {
  closeSheet(true);
  const root = $('#sheets');
  root.insertAdjacentHTML('beforeend', `<div class="backdrop" data-act="closesheet"></div><div class="sheet glass"><div class="grab"></div>${html}</div>`);
  requestAnimationFrame(() => { $$('#sheets .backdrop,#sheets .sheet').forEach(e => e.classList.add('in')); });
  return $('#sheets .sheet');
}
function closeSheet(instant) {
  const bd = $('#sheets .backdrop'), sh = $('#sheets .sheet'); if (!sh) return;
  if (instant) { bd.remove(); sh.remove(); return; }
  bd.classList.remove('in'); sh.classList.remove('in'); setTimeout(() => { bd.remove(); sh.remove(); }, 380);
}

/* новый чат */
function newChatSheet() {
  sheet(`<h2>Новое сообщение</h2><p class="sub">Введите username собеседника. Для приватной переписки включите секретный режим.</p>
    <input class="inp" id="nun" placeholder="@username" autocapitalize="off" autocomplete="off">
    <div class="grp"><button class="cell" data-act="tg-newsecret" id="secrow">${ic('lock', 22)}<span class="l">Секретный чат<small>Шифрование · таймер · уничтожение</small></span>${sw(false)}</button></div>
    <button class="btn" data-act="startchat">Начать чат</button>
    <button class="btn ghostb" data-act="newgroup">${ic('users', 20)} Создать группу</button>`);
}
function startChat() {
  const un = ($('#nun').value.trim().replace(/^@/, '').replace(/[^\w.]/g, '')).toLowerCase();
  if (!un) { toast('Введите username'); return; }
  const secret = $('#secrow .sw')?.classList.contains('on'), type = secret ? 'secret' : 'direct';
  let c = S.chats.find(x => x.with === un && x.type === type);
  if (!c) { c = { id: uid(), type, with: un, name: '@' + un, h: [...un].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 360, unread: 0, ttl: secret ? 30 : 0, autoDestroy: false, msgs: [] }; S.chats.push(c); save(); }
  closeSheet(); openChat(c.id);
}

/* ───────── группы ───────── */
let gFilter = 'all';
function renderGroups() {
  const mine = S.chats.filter(c => c.type === 'group');
  const cat = CATALOG.filter(g => !S.chats.some(c => c.catId === g.id) && (gFilter === 'all' || g.kind === gFilter));
  $('#v-groups').innerHTML = `
    <div class="statusbar"></div>
    <div class="large"><h1>Группы</h1><button class="cta g" data-act="newgroup">${ic('plus', 16)} Создать</button></div>
    <div class="scroll">
      <div class="sec-t">Мои группы</div>
      ${mine.length ? `<div class="list glass">${mine.map(c => `<div class="item" data-act="open" data-id="${c.id}">${avatar(c, 46)}<div class="mid"><div class="nm">${esc(c.name)}</div><div class="pv">${kindPill(c.kind)} <span style="margin-left:4px">${c.members.length + 1} уч.</span></div></div>${ic('chev', 18)}</div>`).join('')}</div>` : `<div class="empty">Групп пока нет. Создайте первую — закрытую, открытую или платную.</div>`}
      <div class="sec-t">Каталог</div>
      <div class="chips">${[['all', 'Все'], ['open', 'Открытые'], ['paid', 'Платные']].map(([k, l]) => `<button data-act="gfilter" data-v="${k}" class="${gFilter === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      <div class="list glass">${cat.map(g => `<div class="item" data-act="joinsheet" data-id="${g.id}">${avatar(g, 50)}<div class="mid"><div class="nm">${esc(g.name)}</div><div class="pv">${g.members.toLocaleString('ru')} участников</div></div>${g.kind === 'paid' ? `<span class="pill paid">${ic('star', 11)}${g.price} $</span>` : `<span class="pill open">Вступить</span>`}</div>`).join('') || '<div class="empty">Каталог пока пуст</div>'}</div>
    </div>`;
}
function joinSheet(id) {
  const g = CATALOG.find(x => x.id === id); if (!g) return;
  sheet(`<div style="text-align:center;padding:6px 0">${avatar(g, 84).replace('class="av"', 'class="av" style="margin:0 auto;')}
    <h2 style="margin-top:12px">${esc(g.name)}</h2>${kindPill(g.kind)}
    <p class="sub" style="margin-top:10px">${esc(g.desc)}<br>${g.members.toLocaleString('ru')} участников</p></div>
    ${g.kind === 'paid' ? `<div class="grp"><div class="cell"><span class="l">Подписка<small>Отмена в любой момент. Автор получает 90%.</small></span><b>${g.price} $ / ${g.period}</b></div></div>
      <button class="btn gold" data-act="pay" data-id="${g.id}">${ic('star', 20)} Оплатить и вступить</button>` : `<button class="btn" data-act="join" data-id="${g.id}">Вступить</button>`}`);
}
function joinGroup(id, paid) {
  const g = CATALOG.find(x => x.id === id);
  const c = { id: uid(), catId: id, type: 'group', name: g.name, h: g.h, kind: g.kind, price: g.price, period: g.period, unread: 0, ttl: 0,
    members: [{ name: 'Кира', h: 270 }, { name: 'Артём', h: 190 }, { name: 'Соня', h: 150 }],
    msgs: [{ id: uid(), from: 'them', name: 'Кира', h: 270, text: 'Добро пожаловать в «' + g.name + '»! 👋', ts: Date.now() }] };
  S.chats.push(c); save(); closeSheet(); renderGroups(); renderChats(); toast(paid ? '⭐ Подписка оформлена' : 'Вы вступили в группу');
}
let draft = { kind: 'closed', period: 'мес' };
function newGroupSheet() {
  draft = { kind: 'closed', period: 'мес' };
  const sh = sheet(`<h2>Новая группа</h2><p class="sub" id="gdesc"></p>
    <input class="inp" id="gname" placeholder="Название группы" maxlength="40">
    <div class="seg" id="gseg">${[['closed', 'Закрытая'], ['open', 'Открытая'], ['paid', 'Платная']].map(([k, l]) => `<button data-act="gkind" data-v="${k}" class="${k === 'closed' ? 'on' : ''}">${l}</button>`).join('')}</div>
    <div id="gpaid" style="display:none"><div class="lbl">Цена подписки, $</div><input class="inp" id="gprice" type="number" min="1" step="0.5" value="5">
      <div class="seg" id="gper">${[['мес', 'В месяц'], ['навсегда', 'Навсегда']].map(([k, l]) => `<button data-act="gper" data-v="${k}" class="${k === 'мес' ? 'on' : ''}">${l}</button>`).join('')}</div></div>
    <button class="btn" data-act="mkgroup">Создать</button>`);
  gDesc();
}
function gDesc() {
  const d = { closed: 'Закрытая — вход только по приглашению. Участников видят только участники.', open: 'Открытая — есть публичная ссылка, любой может вступить и найти в каталоге.', paid: 'Платная — доступ по подписке. Вы получаете 90% платежей.' }[draft.kind];
  const el = $('#gdesc'); if (el) el.textContent = d;
  const p = $('#gpaid'); if (p) p.style.display = draft.kind === 'paid' ? 'block' : 'none';
}
function makeGroup() {
  const name = $('#gname').value.trim(); if (!name) { toast('Введите название'); return; }
  const c = { id: uid(), type: 'group', owner: true, name, h: Math.floor(rnd(0, 360)), kind: draft.kind, unread: 0, ttl: 0, members: [], msgs: [] };
  if (draft.kind === 'paid') { c.price = +$('#gprice').value || 5; c.period = draft.period; }
  c.msgs.push({ id: uid(), from: 'them', name: 'Veil', h: 210, text: 'Группа создана. Ссылка-приглашение: veil.app/' + c.id, ts: Date.now() });
  S.chats.push(c); save(); closeSheet(); renderGroups(); renderChats(); toast('Группа создана'); setTimeout(() => openChat(c.id), 350);
}

/* ───────── профиль ───────── */
let mediaTab = 'photo';
function renderProfile() {
  const me = S.me;
  const photos = me.photos.map((p, i) => `<div data-act="viewmedia" data-i="${i}"><img src="${p}" alt=""></div>`).join('');
  const vids = videosMem.map(u => `<div><video src="${u}" muted playsinline controls></video></div>`).join('');
  $('#v-profile').innerHTML = `
    <div class="statusbar"></div>
    <div class="large"><h1>Профиль</h1><button class="circ glass" data-act="editprofile">${ic('edit', 20)}</button></div>
    <div class="scroll">
      <div class="pcard"><div data-act="pickavatar" style="cursor:pointer">${avatar(me, 104)}</div>
        <h2>${esc(me.name || 'Ваше имя')}${S.premium ? ` <span style="color:var(--gold)">${ic('crown', 20).replace('<svg', '<svg style="display:inline;vertical-align:-3px"')}</span>` : ''}</h2>
        <div class="un">${me.username ? '@' + esc(me.username) : 'Задайте username'}</div><p>${esc(me.bio || 'Добавьте описание')}</p></div>
      <div class="prem" data-act="premium">${ic('crown', 30)}<div style="flex:1"><b>${S.premium ? 'Veil Premium активен' : 'Veil Premium'}</b><small>${S.premium ? 'Темы, цвета, градации — в «Оформлении»' : 'Свои цвета, градиенты и стиль интерфейса'}</small></div>${ic('chev', 18)}</div>
      <div class="seg"><button data-act="mtab" data-v="photo" class="${mediaTab === 'photo' ? 'on' : ''}">Фото</button><button data-act="mtab" data-v="video" class="${mediaTab === 'video' ? 'on' : ''}">Видео</button></div>
      <div class="mgrid">${mediaTab === 'photo' ? photos : vids}<div data-act="addmedia">${ic('plus', 28)}</div></div>
      <div class="sec-t">Настройки</div>
      <div class="grp glass" style="margin-top:0">
        <button class="cell" data-act="appearance">${ic('palette', 22).replace('class="ic"', 'class="ic tint"')}<span class="l">Оформление<small>${S.premium ? 'Ваша тема' : 'Доступно в Premium'}</small></span>${S.premium ? '' : ic('crown', 18).replace('class="ic"', 'class="ic" style="color:var(--gold)"')}${ic('chev', 18)}</button>
        <button class="cell" data-act="mapprivacy">${ic('map', 22).replace('class="ic"', 'class="ic tint"')}<span class="l">Приватность карты<small>${mapStatus()}</small></span>${ic('chev', 18)}</button>
        <button class="cell" data-act="reset">${ic('trash', 22)}<span class="l">Выйти и стереть данные на устройстве</span></button>
      </div>
      <p class="sub" style="text-align:center;margin:18px 30px;color:var(--sub);font-size:13px;line-height:1.5">Veil — мессенджер, а не соцсеть: нет ленты, подписчиков и лайков. Вас видят только те, кого вы выбрали.</p>
    </div>`;
}
function editProfileSheet() {
  const m = S.me;
  sheet(`<h2>Профиль</h2><div style="display:flex;justify-content:center;margin:8px 0" data-act="pickavatar">${avatar(m, 86)}</div>
    <input class="inp" id="pn" placeholder="Имя" value="${esc(m.name)}" maxlength="30">
    <input class="inp" id="pu" placeholder="username" value="${esc(m.username)}" maxlength="24">
    <input class="inp" id="pb" placeholder="О себе" value="${esc(m.bio)}" maxlength="90">
    <button class="btn" data-act="saveprofile">Сохранить</button>`);
}

/* Premium и оформление */
function premiumSheet() {
  const F = [['palette', 'Свои цвета', 'Акцент интерфейса и пузырей сообщений'], ['star', 'Градации фона', 'Оттенок, насыщенность и глубина градиента'], ['shield', 'Стекло', 'Прозрачность и размытие панелей'], ['edit', 'Форма пузырей', 'Квадратные, стандартные или мягкие']];
  sheet(`<div style="text-align:center;padding:4px 0">${ic('crown', 54).replace('class="ic"', 'class="ic" style="margin:0 auto;color:var(--gold)"')}<h2 style="margin-top:8px">Veil Premium</h2><p class="sub">Тёмный интерфейс — для всех. Premium открывает полную настройку внешнего вида.</p></div>
    ${F.map(f => `<div class="feat">${ic(f[0], 22)}<div><b>${f[1]}</b><span>${f[2]}</span></div></div>`).join('')}
    ${S.premium ? `<button class="btn ghostb" data-act="premoff">Отключить Premium</button>` : `<button class="btn gold" data-act="premon">${ic('crown', 20)} Оформить — 3.99 $ / мес</button>`}`);
}
function appearanceSheet() {
  const t = S.theme, lk = !S.premium;
  const preview = `<div style="border-radius:24px;padding:14px;background:radial-gradient(120% 90% at 20% 0%,var(--bg3),transparent 70%),var(--bg1);border:1px solid rgba(255,255,255,.1);margin:6px 0 10px"><div class="row them" style="animation:none"><div class="bub" style="max-width:80%">Так выглядит собеседник</div></div><div class="row me" style="animation:none;margin-top:6px"><div class="bub">А это — вы ✨</div></div></div>`;
  sheet(`<h2>Оформление</h2>${lk ? `<p class="sub">Предпросмотр. Изменять тему можно с Premium 👑</p>` : '<p class="sub">Настройте интерфейс под себя.</p>'}${preview}
    <div class="lbl">Фон</div><div class="swatches">${BGS.map((b, i) => `<button class="swatch ${t.hue === b.hue ? 'on' : ''}" title="${b.n}" data-act="th-bg" data-i="${i}" style="background:${b.hue == null ? 'linear-gradient(135deg,#333,#000)' : `linear-gradient(135deg,hsl(${b.hue} 62% 30%),hsl(${b.hue} 45% 5%))`}">${lk && i ? `<span class="lk">${ic('lock', 9)}</span>` : ''}</button>`).join('')}</div>
    <div class="lbl">Оттенок фона</div><input type="range" class="rng hue" min="0" max="360" value="${t.hue ?? 230}" data-in="hue">
    <div class="lbl">Градация (глубина градиента)</div><input type="range" class="rng" min="0" max="100" value="${t.grad}" data-in="grad">
    <div class="lbl">Акцент</div><div class="swatches">${ACCENTS.map(a => `<button class="swatch ${t.accent === a ? 'on' : ''}" data-act="th-accent" data-v="${a}" style="background:${a}">${lk && a !== DEFAULT_THEME.accent ? `<span class="lk">${ic('lock', 9)}</span>` : ''}</button>`).join('')}
      <label class="swatch" style="background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red);overflow:hidden"><input type="color" data-in="accent" value="${t.accent}" style="opacity:0;width:100%;height:100%"></label></div>
    <div class="lbl">Стекло</div><input type="range" class="rng" min="0" max="100" value="${t.glass}" data-in="glass">
    <div class="lbl">Пузыри сообщений</div><div class="seg">${[['square', 'Углы'], ['round', 'Стандарт'], ['soft', 'Мягкие']].map(([k, l]) => `<button data-act="th-bub" data-v="${k}" class="${t.bubble === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    <button class="btn ghostb" data-act="th-reset">Сбросить тему</button>`);
}
const needPrem = () => { if (S.premium) return false; premiumSheet(); return true; };

/* ───────── карта ───────── */
const MAP = { m: null, pins: {}, inited: false, center: [55.7558, 37.6173], me: null, fb: false, K: 26000, pan: { x: 0, y: 0 } };
function mapStatus() {
  const m = S.map; if (m.ghost) return 'Режим призрака — вас не видно';
  const a = { all: 'Всем контактам', selected: 'Выбранным (' + m.selected.length + ')', none: 'Никому' }[m.audience];
  return a + (m.precise ? ' · точно' : ' · примерно');
}
function renderMapShell() {
  $('#v-map').innerHTML = `<div id="mapbox"></div>
    <div class="mtop"><div class="pilltxt glass">${ic('shield', 18)}<div>Карта контактов<small id="mapsub"></small></div></div></div>
    <div class="mside">
      <button class="circ glass ${S.map.ghost ? 'on' : ''}" data-act="ghost" id="ghostbtn">${ic('ghost', 22)}</button>
      <button class="circ glass" data-act="mapprivacy">${ic('eyeoff', 22)}</button>
      <button class="circ glass" data-act="recenter">${ic('locate', 22)}</button>
    </div><div class="mfoot" id="mfoot"></div>`;
  $('#mapsub').textContent = mapStatus();
}
const cpos = c => [MAP.center[0] + c.dy, MAP.center[1] + c.dx];
function pinHTML(o, me) {
  const inner = o.img ? `<img src="${o.img}" style="width:100%;height:100%;object-fit:cover">` : esc(o.name[0]);
  return `<div class="pin ${me ? 'me' : ''} ${me && S.map.ghost ? 'ghost' : ''}" ${me ? '' : `data-act="person" data-id="${o.id}"`}><div class="pav" style="background:${o.img ? '#222' : grad(o.h)}">${inner}</div><span>${me ? (S.map.ghost ? 'Скрыт' : esc(o.name || 'Вы')) : esc(o.name)}</span></div>`;
}
function initMap() {
  if (!MAP.inited) {
    MAP.inited = true; renderMapShell();
    const box = $('#mapbox');
    if (window.L) {
      MAP.m = L.map(box, { zoomControl: false, attributionControl: false }).setView(MAP.center, 15);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' }).addTo(MAP.m);
      L.control.attribution({ prefix: false }).addAttribution('© OpenStreetMap · CARTO').addTo(MAP.m);
      MAP.m.on('click', () => { $('#mfoot').innerHTML = ''; });
    } else { // офлайн-запасной вариант: схематичная карта с перетаскиванием
      MAP.fb = true; box.classList.add('fmap'); box.innerHTML = '<div id="fpan"></div>';
      let d = null;
      box.addEventListener('pointerdown', e => { d = { x: e.clientX - MAP.pan.x, y: e.clientY - MAP.pan.y }; box.setPointerCapture(e.pointerId); });
      box.addEventListener('pointermove', e => { if (!d) return; MAP.pan = { x: e.clientX - d.x, y: e.clientY - d.y }; panFB(); });
      box.addEventListener('pointerup', () => d = null);
    }
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => { MAP.center = [p.coords.latitude, p.coords.longitude]; if (MAP.m) MAP.m.setView(MAP.center, 15); Object.values(MAP.pins).forEach(p => p.remove && p.remove()); MAP.pins = {}; updatePins(); }, () => { }, { timeout: 4000 });
  }
  if (MAP.m) setTimeout(() => MAP.m.invalidateSize(), 50);
  $('#mapsub') && ($('#mapsub').textContent = mapStatus());
  updatePins();
}
function panFB() { $('#fpan').style.transform = `translate(${MAP.pan.x}px,${MAP.pan.y}px)`; $('#mapbox').style.backgroundPosition = `${MAP.pan.x}px ${MAP.pan.y}px`; }
function setPin(key, html, lat, lng, w = 64, ht = 74) {
  let p = MAP.pins[key];
  if (MAP.m) {
    const icon = L.divIcon({ className: '', html, iconSize: [w, ht], iconAnchor: [w / 2, ht - 8] });
    if (!p) MAP.pins[key] = L.marker([lat, lng], { icon }).addTo(MAP.m); else { p.setLatLng([lat, lng]); p.setIcon(icon); }
  } else {
    const x = (lng - MAP.center[1]) * MAP.K, y = -(lat - MAP.center[0]) * MAP.K * 1.75;
    if (!p) { p = document.createElement('div'); p.className = 'fp'; $('#fpan').appendChild(p); p.remove = () => p.parentNode && p.parentNode.removeChild(p); MAP.pins[key] = p; }
    p.innerHTML = html; p.style.left = (x - w / 2) + 'px'; p.style.top = (y - ht + 8) + 'px';
  }
}
function updatePins() {
  if (!MAP.inited) return;
  S.contacts.forEach(c => {
    const vis = c.share && !c.hidden;
    if (!vis) { const p = MAP.pins[c.id]; if (p) { (MAP.m ? MAP.m.removeLayer(p) : p.remove()); delete MAP.pins[c.id]; } return; }
    const [la, ln] = cpos(c); setPin(c.id, pinHTML(c), la, ln);
  });
  setPin('me', pinHTML(S.me, true), MAP.center[0], MAP.center[1]);
}
function dist(c) {
  const [la, ln] = cpos(c), R = 6371e3, r = Math.PI / 180, dl = (la - MAP.center[0]) * r, dn = (ln - MAP.center[1]) * r;
  const a = Math.sin(dl / 2) ** 2 + Math.cos(la * r) * Math.cos(MAP.center[0] * r) * Math.sin(dn / 2) ** 2;
  const d = 2 * R * Math.asin(Math.sqrt(a)); return d < 1000 ? Math.round(d / 10) * 10 + ' м' : (d / 1000).toFixed(1) + ' км';
}
function mapPrivacySheet() {
  const m = S.map, A = [['all', 'Всем контактам'], ['selected', 'Только выбранным'], ['none', 'Никому']];
  sheet(`<h2>Кто видит меня на карте</h2><p class="sub">Это часть мессенджера, а не соцсети: публичной карты нет — только ваши контакты, только по вашему выбору.</p>
    <div class="grp"><button class="cell" data-act="ghost">${ic('ghost', 22)}<span class="l">Режим призрака<small>Никто не видит вас, вы видите всех</small></span>${sw(m.ghost)}</button>
    <button class="cell" data-act="tg-precise">${ic('locate', 22)}<span class="l">Точное местоположение<small>Выкл — показывается район (±500 м)</small></span>${sw(m.precise)}</button></div>
    <div class="lbl">Показывать</div><div class="seg">${A.map(([k, l]) => `<button data-act="aud" data-v="${k}" class="${m.audience === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    ${m.audience === 'selected' ? (S.contacts.length ? `<div class="grp">${S.contacts.map(c => `<button class="cell" data-act="tg-sel" data-id="${c.id}">${avatar(c, 34)}<span class="l">${esc(c.name)}</span>${sw(m.selected.includes(c.id))}</button>`).join('')}</div>` : `<p class="sub">Здесь появятся ваши контакты, когда вы начнёте переписку.</p>`) : ''}`);
}

/* ───────── события ───────── */
const ACT = {
  tab: el => switchTab(el.dataset.v),
  open: el => openChat(el.dataset.id),
  back: () => closeChat(),
  cmenu: () => chatMenu(),
  send: () => sendText(),
  attach: () => $('#file').click(),
  ttl: () => ttlSheet(),
  setttl: el => { const c = chatById(curChat); c.ttl = +el.dataset.v; save(); updateChatSub(); renderChats(); closeSheet(); toast(c.ttl ? '🔥 Автоудаление: ' + fmtTTL(c.ttl) : 'Автоудаление выключено'); },
  'tg-auto': el => { const c = chatById(curChat); c.autoDestroy = !c.autoDestroy; save(); $('.sw', el).classList.toggle('on', c.autoDestroy); },
  'tg-protect': el => { S.protect = S.protect === false; save(); $('.sw', el).classList.toggle('on', S.protect !== false); },
  destroy: () => destroyChat(curChat),
  delete: () => destroyChat(curChat),
  mksecret: () => { const c = chatById(curChat); closeSheet(); closeChat(); setTimeout(() => { let s = S.chats.find(x => x.with === c.with && x.type === 'secret'); if (!s) { s = { id: uid(), type: 'secret', with: c.with, name: c.name, h: c.h, unread: 0, ttl: 30, autoDestroy: false, msgs: [] }; S.chats.push(s); save(); } openChat(s.id); }, 400); },
  closesheet: () => closeSheet(),
  newchat: () => newChatSheet(),
  'tg-newsecret': el => $('.sw', el).classList.toggle('on'),
  startchat: () => startChat(),
  newgroup: () => newGroupSheet(),
  gkind: el => { draft.kind = el.dataset.v; $$('#gseg button').forEach(b => b.classList.toggle('on', b === el)); gDesc(); },
  gper: el => { draft.period = el.dataset.v; $$('#gper button').forEach(b => b.classList.toggle('on', b === el)); },
  mkgroup: () => makeGroup(),
  gfilter: el => { gFilter = el.dataset.v; renderGroups(); },
  joinsheet: el => joinSheet(el.dataset.id),
  join: el => joinGroup(el.dataset.id, false),
  pay: el => { el.innerHTML = 'Обработка…'; setTimeout(() => joinGroup(el.dataset.id, true), 900); },
  editprofile: () => editProfileSheet(),
  saveprofile: () => { S.me.name = $('#pn').value.trim(); S.me.username = $('#pu').value.trim().replace(/[^\w.]/g, '').toLowerCase(); S.me.bio = $('#pb').value.trim(); save(); closeSheet(); renderProfile(); updatePins(); },
  pickavatar: () => $('#avfile').click(),
  addmedia: () => { $('#file').dataset.for = 'profile'; $('#file').click(); },
  mtab: el => { mediaTab = el.dataset.v; renderProfile(); },
  viewmedia: el => sheet(`<img src="${S.me.photos[+el.dataset.i]}" style="width:100%;border-radius:22px;margin-top:6px"><button class="btn dng" data-act="delphoto" data-i="${el.dataset.i}">${ic('trash', 20)} Удалить фото</button>`),
  delphoto: el => { S.me.photos.splice(+el.dataset.i, 1); save(); closeSheet(); renderProfile(); },
  premium: () => premiumSheet(),
  premon: () => { S.premium = true; save(); applyTheme(); premiumSheet(); renderProfile(); toast('👑 Premium активирован'); setTimeout(appearanceSheet, 700); },
  premoff: () => { S.premium = false; save(); applyTheme(); closeSheet(); renderProfile(); toast('Premium отключён'); },
  appearance: () => appearanceSheet(),
  'th-bg': el => { if (S.premium || +el.dataset.i === 0) { S.theme.hue = BGS[+el.dataset.i].hue; save(); applyTheme(); appearanceSheet(); } else premiumSheet(); },
  'th-accent': el => { if (!S.premium && el.dataset.v !== DEFAULT_THEME.accent) return premiumSheet(); S.theme.accent = el.dataset.v; save(); applyTheme(); appearanceSheet(); },
  'th-bub': el => { if (needPrem()) return; S.theme.bubble = el.dataset.v; save(); applyTheme(); appearanceSheet(); },
  'th-reset': () => { S.theme = { ...DEFAULT_THEME }; save(); applyTheme(); appearanceSheet(); },
  reset: () => { localStorage.removeItem(KEY); location.reload(); },
  mapprivacy: () => mapPrivacySheet(),
  ghost: () => { S.map.ghost = !S.map.ghost; save(); $('#ghostbtn')?.classList.toggle('on', S.map.ghost); $('#mapsub') && ($('#mapsub').textContent = mapStatus()); updatePins(); if ($('.sheet')) mapPrivacySheet(); toast(S.map.ghost ? '👻 Вас не видно на карте' : 'Вы снова на карте'); },
  'tg-precise': () => { S.map.precise = !S.map.precise; save(); mapPrivacySheet(); $('#mapsub') && ($('#mapsub').textContent = mapStatus()); },
  aud: el => { S.map.audience = el.dataset.v; save(); mapPrivacySheet(); $('#mapsub') && ($('#mapsub').textContent = mapStatus()); },
  'tg-sel': el => { const a = S.map.selected, i = a.indexOf(el.dataset.id); i < 0 ? a.push(el.dataset.id) : a.splice(i, 1); save(); mapPrivacySheet(); },
  recenter: () => { if (MAP.m) MAP.m.setView(MAP.center, 15); else { MAP.pan = { x: 0, y: 0 }; panFB(); } $('#mfoot').innerHTML = ''; }
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const f = ACT[el.dataset.act]; if (f) { e.stopPropagation(); f(el, e); }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'q') return renderChats();
  const k = t.dataset && t.dataset.in; if (!k) return;
  if (!S.premium) { t.value = k === 'accent' ? DEFAULT_THEME.accent : t.defaultValue; premiumSheet(); return; }
  if (k === 'hue') S.theme.hue = +t.value; else if (k === 'accent') S.theme.accent = t.value; else S.theme[k] = +t.value;
  applyTheme(); save();
});
$$('#file,#avfile').forEach(() => 0);
document.addEventListener('change', async e => {
  const t = e.target; if (t.id !== 'file' && t.id !== 'avfile') return;
  const f = t.files[0]; t.value = ''; if (!f) return;
  try {
    if (t.id === 'avfile') { S.me.img = await shrink(f, 400, .85); save(); renderProfile(); updatePins(); if ($('.sheet')) editProfileSheet(); return; }
    if (t.dataset.for === 'profile') {
      t.dataset.for = '';
      const m = await readMedia(f);
      if (m.type === 'video') { mediaTab = 'video'; } else { S.me.photos.unshift(m.url); S.me.photos = S.me.photos.slice(0, 15); mediaTab = 'photo'; save(); }
      renderProfile(); return;
    }
    const c = chatById(curChat); if (c) sendMsg(c, { media: await readMedia(f) });
  } catch (err) { toast('Не удалось загрузить файл'); }
});
// удержание для чтения секретных сообщений
let holdEl = null;
const holdOn = e => {
  const b = e.target.closest('.veil'); if (!b) return; holdEl = b; b.classList.add('show');
  const c = chatById(curChat), id = b.closest('[data-mid]').dataset.mid, m = c && c.msgs.find(x => x.id === id);
  if (m) { armTimer(m, c); }
};
const holdOff = () => { if (holdEl) { holdEl.classList.remove('show'); holdEl = null; } };
document.addEventListener('pointerdown', holdOn); document.addEventListener('pointerup', holdOff); document.addEventListener('pointercancel', holdOff); document.addEventListener('contextmenu', e => { if (e.target.closest('.veil')) e.preventDefault(); });
// защита экрана
const shieldOn = () => { const c = chatById(curChat); if (c && c.type === 'secret' && S.protect !== false) $('#chatpage').classList.add('shielded'); };
const shieldOff = () => $('#chatpage').classList.remove('shielded');
window.addEventListener('blur', shieldOn); window.addEventListener('focus', shieldOff);
document.addEventListener('visibilitychange', () => document.hidden ? shieldOn() : shieldOff());

/* ───────── таймеры ───────── */
setInterval(() => {
  let changed = false;
  S.chats.forEach(c => c.msgs.forEach(m => {
    if (m.expiresAt && !m.dying && m.expiresAt <= Date.now()) {
      m.dying = true; changed = true;
      const el = curChat === c.id && $(`[data-mid="${m.id}"]`); if (el) el.classList.add('dissolve');
      setTimeout(() => { const i = c.msgs.indexOf(m); if (i >= 0) c.msgs.splice(i, 1); save(); if (curChat === c.id) renderMsgs(false); renderChats(); }, 460);
    }
  }));
  $$('[data-exp]').forEach(el => { el.innerHTML = ic('flame', 11) + left(+el.dataset.exp); });
  if (changed) renderChats();
}, 500);
// видимость по выбору аудитории

/* ───────── старт ───────── */
load(); shell(); applyTheme(); renderChatsView(); renderTabbar();
