/* ============================================================
   Generalist Agent — app.js
   Antarmuka ala MarbelAIv2.1 (Claude-style: sidebar + kolom chat +
   composer minimal) dengan model gratis tanpa API key yang sama
   seperti MarbelAIv2.1.
   ============================================================ */

// ---------- Model gratis (sama seperti MarbelAIv2.1) ----------
const FREE_MODELS = ['qwen3.8-27b', 'gpt-oss-20b', 'qwen3-8b'];
const DIRECT_UPSTREAMS = [
  'https://hermes.ai.unturf.com',
  'https://qwen.ai.unturf.com',
  'https://text.pollinations.ai',
  'https://api.free.ai',
];
const DIRECT_PAYLOAD = {
  'https://hermes.ai.unturf.com': { chat_template_kwargs: { enable_thinking: false } },
  'https://qwen.ai.unturf.com': { chat_template_kwargs: { enable_thinking: false } },
  'https://text.pollinations.ai': {},
  'https://api.free.ai': {},
};
// uncloseai kini hanya melayani satu model: turboderp/Qwen3.8-27B-exl3.
const UNCLOSEAI_MODEL = 'turboderp/Qwen3.8-27B-exl3';
const DIRECT_MODEL_MAP = {
  'https://hermes.ai.unturf.com': { 'qwen3.8-27b': UNCLOSEAI_MODEL, 'gpt-oss-20b': UNCLOSEAI_MODEL, 'qwen3-8b': UNCLOSEAI_MODEL },
  'https://qwen.ai.unturf.com': { 'qwen3.8-27b': UNCLOSEAI_MODEL, 'gpt-oss-20b': UNCLOSEAI_MODEL, 'qwen3-8b': UNCLOSEAI_MODEL },
  'https://text.pollinations.ai': { 'qwen3.8-27b': 'openai', 'gpt-oss-20b': 'openai', 'qwen3-8b': 'openai' },
  'https://api.free.ai': { 'qwen3.8-27b': 'qwen7b', 'gpt-oss-20b': 'qwen7b', 'qwen3-8b': 'qwen3-8b' },
};
const FREE_MODEL_KEY = 'free_model';
let FREE_MODEL = localStorage.getItem(FREE_MODEL_KEY) || 'semua';

// ---------- Mode API ----------
let API_MODE = localStorage.getItem('api_mode') || 'free'; // 'free' | 'openhands' | 'custom'

const OH_PARAMS = new URLSearchParams(location.search);
let OH_API_BASE = OH_PARAMS.get('oh_api_base') || localStorage.getItem('oh_api_base') || 'https://app.all-hands.dev/api/v1';
const OH_URL_KEY = OH_PARAMS.get('api_key');
let OH_API_KEY = OH_URL_KEY || localStorage.getItem('oh_api_key') || '';
if (OH_URL_KEY) localStorage.setItem('oh_api_key', OH_URL_KEY);
if (OH_PARAMS.get('oh_api_base')) localStorage.setItem('oh_api_base', OH_API_BASE);

let CUSTOM_API_BASE = localStorage.getItem('custom_api_base') || '';
let CUSTOM_API_KEY = localStorage.getItem('custom_api_key') || '';
let CUSTOM_MODEL = localStorage.getItem('custom_model') || 'gpt-5.5';

// ---------- Elemen DOM ----------
const layoutEl = document.querySelector('.layout');
const messagesEl = document.getElementById('messages');
const welcomeEl = document.getElementById('welcome');
const activeBadge = document.getElementById('activeBadge');
const form = document.getElementById('form');
const input = document.getElementById('input');
const modelSelect = document.getElementById('modelSelect');
const sendBtn = document.getElementById('send');
const statusDot = document.getElementById('statusDot');
const statusLabel = document.getElementById('statusLabel');
const threadList = document.getElementById('threadList');
const themeToggle = document.getElementById('themeToggle');
const panelHide = document.getElementById('panelHide');
const sideToggle = document.getElementById('sideToggle');
const newThreadBtn = document.getElementById('newThread');

// ---------- State ----------
let busy = false;
let threadId = 0;
let threadCount = 0;
let history = []; // { id, items: [{ role, content, model? }] }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- Scrim sidebar (mobile) ----------
const scrim = document.createElement('button');
scrim.type = 'button';
scrim.className = 'scrim';
scrim.tabIndex = -1;
scrim.setAttribute('aria-hidden', 'true');
scrim.setAttribute('aria-label', 'Tutup sidebar');
document.querySelector('.main').appendChild(scrim);

const isNarrow = () => window.innerWidth <= 768;
const sidebarOpen = () => !layoutEl.classList.contains('collapsed');

function syncSidebar() {
  scrim.classList.toggle('show', isNarrow() && sidebarOpen());
  [sideToggle, panelHide].forEach((b) => {
    if (!b) return;
    b.setAttribute('aria-expanded', sidebarOpen() ? 'true' : 'false');
    const label = sidebarOpen() ? 'Hide sidebar' : 'Show sidebar';
    b.title = label;
    b.setAttribute('aria-label', label);
  });
}

scrim.addEventListener('click', () => layoutEl.classList.add('collapsed'));
new MutationObserver(syncSidebar).observe(layoutEl, { attributes: true, attributeFilter: ['class'] });
window.addEventListener('resize', syncSidebar);
if (isNarrow()) layoutEl.classList.add('collapsed');

// ---------- Status ----------
function setStatus(state, label) {
  statusDot.className = 'dot' + (state ? ' ' + state : '');
  if (label) statusLabel.textContent = label;
}

// ---------- Util ----------
const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function renderMarkdown(text) {
  if (!text) return '';
  const parts = [];
  const re = /```([\w-]*)\n?([\s\S]*?)```/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    parts.push({ t: 'text', v: text.slice(last, m.index) });
    parts.push({ t: 'code', v: m[2] });
    last = m.index + m[0].length;
  }
  parts.push({ t: 'text', v: text.slice(last) });

  return parts.map((p) => {
    if (p.t === 'code') return '<div class="code-block"><pre>' + escHtml(p.v) + '</pre></div>';
    let h = escHtml(p.v);
    h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
    h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/(^|[^*\w])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    h = h.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    h = h.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    h = h.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    h = h.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    h = h.replace(/(?:^- .*(?:\n|$))+/gm, (block) => {
      const items = block.replace(/\n$/, '').split('\n')
        .map((l) => '<li>' + l.replace(/^- /, '') + '</li>').join('');
      return '<ul>' + items + '</ul>';
    });
    h = h.replace(/\n/g, '<br>');
    return h;
  }).join('');
}

function cleanResponse(text) {
  if (!text) return '';
  return text
    .replace(/<start_of_thought>[\s\S]*?<end_of_thought>/gi, '')
    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
    .trim();
}

function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function scrollDown() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function showChat() {
  if (welcomeEl) welcomeEl.style.display = 'none';
}

// ---------- Pesan ----------
function addUserMessage(content) {
  const el = document.createElement('div');
  el.className = 'msg user';
  const body = document.createElement('div');
  body.className = 'ubody';
  body.textContent = content;
  el.appendChild(body);
  messagesEl.appendChild(el);
  scrollDown();
}

function createAssistantMessage() {
  const wrap = document.createElement('div');
  wrap.className = 'msg assistant';

  const tag = document.createElement('div');
  tag.className = 'role-tag';
  tag.innerHTML = '<span class="agent-dot">&#10022;</span><span>Generalist Agent</span><span class="model-tag"></span>';

  const body = document.createElement('div');
  body.className = 'body';
  const inner = document.createElement('div');
  inner.className = 'inner';
  const tools = document.createElement('div');
  tools.className = 'tools';
  const actions = document.createElement('div');
  actions.className = 'm-actions';
  actions.style.display = 'none';

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'm-act copy';
  copyBtn.textContent = 'Copy';
  const regenBtn = document.createElement('button');
  regenBtn.type = 'button';
  regenBtn.className = 'm-act regen';
  regenBtn.textContent = 'Regenerate';
  actions.appendChild(copyBtn);
  actions.appendChild(regenBtn);

  body.appendChild(inner);
  body.appendChild(tools);
  body.appendChild(actions);
  wrap.appendChild(tag);
  wrap.appendChild(body);
  messagesEl.appendChild(wrap);
  scrollDown();

  return { wrap, tag, body, inner, tools, actions, copyBtn, regenBtn };
}

const typingHtml = () => '<span class="typing"><span></span><span></span><span></span></span>';

function copyToClipboard(text, btn) {
  const done = () => {
    const old = btn.textContent;
    btn.textContent = 'Copied';
    btn.classList.add('ok');
    setTimeout(() => { btn.textContent = old; btn.classList.remove('ok'); }, 1400);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, () => done());
  } else {
    done();
  }
}

function addToolLine(toolsEl, name) {
  const line = document.createElement('div');
  line.className = 'tool-line';
  line.innerHTML = '<i class="ri-tools-line"></i>' + escHtml(name);
  toolsEl.appendChild(line);
  scrollDown();
}

// ---------- Model gratis: pemanggilan langsung (tanpa backend/API key) ----------
function directChatUrl(base) {
  const b = base.replace(/\/$/, '');
  if (b === 'https://text.pollinations.ai') return b + '/openai';
  return b + '/v1/chat/completions';
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout ' + Math.round(ms / 1000) + 's')), ms)),
  ]);
}

async function directChat(messages, model) {
  const errors = [];
  for (const base of DIRECT_UPSTREAMS) {
    const url = directChatUrl(base);
    const upModel = (DIRECT_MODEL_MAP[base] && DIRECT_MODEL_MAP[base][model]) || model;
    const payload = Object.assign({}, DIRECT_PAYLOAD[base] || {}, {
      model: upModel, messages: messages, stream: false,
    });
    try {
      const res = await withTimeout(fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      }), 60000);
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error('HTTP ' + res.status + (t ? ': ' + t.slice(0, 100) : ''));
      }
      const data = await res.json();
      if (data && data.error) throw new Error(data.error.message || data.error);
      let text = '';
      if (data && data.choices && data.choices[0]) {
        const c = data.choices[0].message || {};
        text = c.content || c.reasoning_content || '';
      }
      if (typeof data === 'string') text = data;
      if (!text) throw new Error('Model tanpa isi');
      return { text: text, realModel: (data && data.model) || model };
    } catch (err) {
      errors.push(base.replace('https://', '') + ' \u2192 ' + err.message);
    }
  }
  throw new Error(errors.join(' \u00b7 ') || 'Semua upstream gagal.');
}

function firstFulfilled(promises) {
  return new Promise((resolve, reject) => {
    let pending = promises.length;
    if (pending === 0) { reject(new Error('Tidak ada model untuk dicoba.')); return; }
    let done = false, lastErr = null;
    promises.forEach((p) => p.then((v) => {
      if (done) return;
      done = true;
      resolve(v);
    }, (err) => {
      lastErr = err;
      pending--;
      if (pending === 0 && !done) reject(lastErr || new Error('Semua model gagal.'));
    }));
  });
}

function activeFreeModels() {
  if (FREE_MODEL && FREE_MODEL !== 'semua' && FREE_MODELS.indexOf(FREE_MODEL) !== -1) return [FREE_MODEL];
  return FREE_MODELS.slice();
}

// Efek mengetik sederhana untuk jawaban non-streaming.
async function typewrite(text, onChunk) {
  if (!onChunk) return;
  const steps = Math.min(40, Math.max(1, Math.ceil(text.length / 60)));
  const size = Math.ceil(text.length / steps);
  for (let i = size; i < text.length; i += size) {
    onChunk(text.slice(0, i));
    await sleep(14);
  }
  onChunk(text);
}

async function freeAnswer(msgs, model, onChunk) {
  const selected = activeFreeModels();
  let result;
  if (selected.length > 1) {
    setStatus('', 'Auto model\u2026');
    result = await firstFulfilled(selected.map((m) =>
      directChat(msgs, m).then((o) => ({ modelId: o.realModel || m, content: o.text }))));
  } else {
    const m = selected[0];
    setStatus('', m + '\u2026');
    const o = await directChat(msgs, m);
    result = { modelId: o.realModel || m, content: o.text };
  }
  const cleaned = cleanResponse(result.content);
  await typewrite(cleaned, onChunk);
  return { content: cleaned, modelId: result.modelId };
}

// ---------- Custom LLM (OpenAI-compatible) ----------
async function customAnswer(msgs, onChunk) {
  const base = CUSTOM_API_BASE.replace(/\/$/, '');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch(base + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + CUSTOM_API_KEY },
      body: JSON.stringify({ model: CUSTOM_MODEL, messages: msgs, temperature: 0.7, max_tokens: 4096 }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error('HTTP ' + response.status + ': ' + response.statusText);
    const data = await response.json();
    const text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
    await typewrite(text, onChunk);
    return { content: text, modelId: CUSTOM_MODEL };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ---------- OpenHands (opsional, butuh API key) ----------
async function openhandsAnswer(msgs, onChunk, onTool) {
  const lastUser = msgs.slice().reverse().find((m) => m.role === 'user');
  const initial = lastUser ? lastUser.content : '';
  const response = await fetch(OH_API_BASE + '/app-conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + OH_API_KEY },
    body: JSON.stringify({ initial_message: { content: [{ type: 'text', text: initial }] } }),
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('OpenHands API key is missing or invalid (HTTP 401).');
    throw new Error('OpenHands request failed: ' + response.status);
  }
  const data = await response.json();
  let convId = data.app_conversation_id || null;
  if (!convId && data.id) {
    setStatus('', 'Starting sandbox\u2026');
    convId = await waitForConversation(data.id);
  }
  if (!convId) throw new Error('Could not resolve conversation id');
  return await pollEvents(convId, onChunk, onTool);
}

async function waitForConversation(startTaskId) {
  for (let i = 0; i < 90; i++) {
    await sleep(2000);
    const res = await fetch(OH_API_BASE + '/app-conversations/start-tasks?ids=' + encodeURIComponent(startTaskId), {
      headers: { 'Authorization': 'Bearer ' + OH_API_KEY },
    });
    if (!res.ok) continue;
    const body = await res.json();
    const task = Array.isArray(body) ? body[0] : (body.items || [])[0];
    if (!task) continue;
    if (task.status === 'READY' && task.app_conversation_id) return task.app_conversation_id;
    if (task.status === 'ERROR' || task.status === 'FAILED') throw new Error('Sandbox failed to start: ' + (task.detail || task.status));
  }
  throw new Error('Timed out waiting for the sandbox to start');
}

function isFinished(event) {
  return event.kind === 'ConversationStateUpdateEvent' && event.key === 'execution_status' &&
    (event.value === 'finished' || event.value === 'failed' || event.value === 'error');
}

async function pollEvents(convId, onChunk, onTool) {
  const seen = new Set();
  let consecutiveEmpty = 0;
  let buffer = '';
  const baseDelay = 600;
  while (true) {
    try {
      const response = await fetch(OH_API_BASE + '/conversation/' + convId + '/events/search?limit=100', {
        headers: { 'Authorization': 'Bearer ' + OH_API_KEY },
      });
      if (!response.ok) { await sleep(baseDelay); consecutiveEmpty = 0; continue; }
      const data = await response.json();
      const items = data.items || [];
      if (items.length === 0) {
        consecutiveEmpty++;
        await sleep(baseDelay + consecutiveEmpty * 100);
        continue;
      }
      consecutiveEmpty = 0;
      for (const event of items) {
        if (seen.has(event.id)) continue;
        seen.add(event.id);
        if (event.kind === 'MessageEvent' && (event.source === 'agent' || event.source === 'assistant')) {
          const msg = event.message || event.llm_message || {};
          let text = typeof msg === 'string' ? msg : (msg.content || '');
          if (Array.isArray(text)) text = text.map((c) => c.text || c.content || '').join('');
          text = cleanResponse(text);
          if (text && text.trim()) {
            buffer = text;
            if (onChunk) onChunk(buffer);
          }
        }
        if (event.kind === 'ActionEvent' && event.tool_name && onTool) onTool(event.tool_name);
        if (isFinished(event)) return { content: buffer, modelId: 'OpenHands' };
      }
      await sleep(baseDelay - 100);
    } catch (e) {
      await sleep(baseDelay * 2);
    }
  }
}

// ---------- Router jawaban ----------
async function chatAnswer(msgs, model, onChunk, onTool) {
  if (API_MODE === 'custom') return await customAnswer(msgs, onChunk);
  if (API_MODE === 'openhands') return await openhandsAnswer(msgs, onChunk, onTool);
  return await freeAnswer(msgs, model, onChunk);
}

// ---------- Riwayat / thread ----------
const STORE_KEY = 'ga_threads_v1';

function persist() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ threadId, threadCount, history }));
  } catch (e) { /* quota — abaikan */ }
}

function currentThread() {
  return history.find((h) => h.id === threadId);
}

function threadHistoryFor(skipIndex) {
  const th = currentThread();
  if (!th) return [];
  return th.items.filter((i, idx) => i.role && idx !== skipIndex).map((i) => ({ role: i.role, content: i.content }));
}

function updateThreadList() {
  threadList.innerHTML = '';
  history.forEach((h) => {
    const li = document.createElement('li');
    li.className = 'thread-item' + (h.id === threadId && !busy ? ' active' : '');
    const first = h.items.find((i) => i.role === 'user');
    const name = first ? first.content : 'Conversation ' + h.id;
    li.innerHTML = '<span class="tid">#' + h.id + '</span><span class="tname">' + escHtml(name.slice(0, 40)) + '</span>';
    li.addEventListener('click', () => {
      if (isNarrow()) layoutEl.classList.add('collapsed');
      loadThread(h.id);
    });
    threadList.appendChild(li);
  });
}

function newThread() {
  threadId = ++threadCount;
  history.push({ id: threadId, items: [] });
  messagesEl.innerHTML = '';
  if (welcomeEl) welcomeEl.style.display = '';
  activeBadge.classList.remove('show');
  input.value = '';
  resize();
  updateThreadList();
  persist();
}

function loadThread(id) {
  const th = history.find((h) => h.id === id);
  if (!th || busy) return;
  threadId = id;
  messagesEl.innerHTML = '';
  if (welcomeEl) welcomeEl.style.display = th.items.length ? 'none' : '';
  activeBadge.classList.remove('show');
  th.items.forEach((i) => {
    if (i.role === 'user') {
      addUserMessage(i.content);
    } else {
      const msgEls = createAssistantMessage();
      msgEls.inner.innerHTML = renderMarkdown(i.content);
      if (i.model) msgEls.tag.querySelector('.model-tag').textContent = '\u00b7 ' + i.model;
      msgEls.actions.style.display = '';
      wireActions(msgEls, th, i);
    }
  });
  updateThreadList();
  scrollDown();
  persist();
}

function wireActions(msgEls, th, item) {
  msgEls.copyBtn.addEventListener('click', () => copyToClipboard(msgEls.inner.textContent || '', msgEls.copyBtn));
  msgEls.regenBtn.addEventListener('click', () => {
    if (busy) return;
    regenerate(th.items.indexOf(item), msgEls);
  });
}

async function regenerate(idx, msgEls) {
  const th = currentThread();
  if (!th || idx < 0) return;
  busy = true;
  sendBtn.disabled = true;
  activeBadge.classList.add('show');
  msgEls.inner.innerHTML = typingHtml();
  msgEls.tools.innerHTML = '';
  msgEls.actions.style.display = 'none';
  setStatus('', 'Regenerating\u2026');
  try {
    const built = await chatAnswer(threadHistoryFor(idx), modelSelect.value,
      (partial) => { msgEls.inner.innerHTML = renderMarkdown(partial); scrollDown(); },
      (name) => addToolLine(msgEls.tools, name));
    msgEls.inner.innerHTML = renderMarkdown(built.content);
    th.items[idx] = { role: 'assistant', content: built.content, model: built.modelId };
    msgEls.actions.style.display = '';
    if (built.modelId) msgEls.tag.querySelector('.model-tag').textContent = '\u00b7 ' + built.modelId;
    setStatus('on', 'Connected');
    persist();
  } catch (err) {
    const friendly = 'Something went wrong while contacting the server.\nDetails: ' + err.message + '\n\nPlease wait a moment and try again.';
    msgEls.wrap.classList.add('err');
    msgEls.inner.innerHTML = renderMarkdown(friendly);
    th.items[idx] = { role: 'assistant', content: friendly };
    setStatus('err', 'Failed');
  } finally {
    busy = false;
    sendBtn.disabled = false;
    activeBadge.classList.remove('show');
    updateThreadList();
  }
}

// ---------- Kirim ----------
async function onSend() {
  const text = input.value.trim();
  if (!text || busy) return;

  if (API_MODE === 'custom' && (!CUSTOM_API_BASE || !CUSTOM_API_KEY)) {
    showSettings();
    showToast('Set your Custom LLM base URL and API key first');
    return;
  }
  if (API_MODE === 'openhands' && !OH_API_KEY) {
    showSettings();
    showToast('Add your OpenHands API key to start chatting');
    return;
  }

  if (history.length === 0) newThread();

  busy = true;
  sendBtn.disabled = true;
  showChat();
  activeBadge.classList.add('show');
  input.value = '';
  resize();
  setStatus('', 'Processing\u2026');

  const current = currentThread();
  if (!current) { busy = false; return; }
  current.items.push({ role: 'user', content: text });
  addUserMessage(text);

  const msgEls = createAssistantMessage();
  msgEls.inner.innerHTML = typingHtml();
  const item = { role: 'assistant', content: '' };
  const itemIdx = current.items.length;
  current.items.push(item);

  try {
    const built = await chatAnswer(threadHistoryFor(itemIdx), modelSelect.value,
      (partial) => { msgEls.inner.innerHTML = renderMarkdown(partial); scrollDown(); },
      (name) => addToolLine(msgEls.tools, name));
    msgEls.inner.innerHTML = renderMarkdown(built.content || '_(empty response)_');
    item.content = built.content;
    item.model = built.modelId;
    if (built.modelId) msgEls.tag.querySelector('.model-tag').textContent = '\u00b7 ' + built.modelId;
    msgEls.actions.style.display = '';
    wireActions(msgEls, current, item);
    setStatus('on', 'Connected');
    persist();
  } catch (err) {
    const friendly = 'Something went wrong while contacting the server.\nDetails: ' + err.message + '\n\nPlease wait a moment and try again.';
    const errItem = { role: 'assistant', content: friendly };
    current.items.push(errItem);
    const errEl = createAssistantMessage();
    errEl.wrap.classList.add('err');
    errEl.inner.innerHTML = renderMarkdown(friendly);
    setStatus('err', 'Failed');
    persist();
  } finally {
    busy = false;
    sendBtn.disabled = false;
    activeBadge.classList.remove('show');
    updateThreadList();
    input.focus();
  }
}

function resize() {
  input.style.height = 'auto';
  input.style.height = Math.min(220, Math.max(48, input.scrollHeight)) + 'px';
}

function quickAction(text) {
  input.value = text;
  input.focus();
  resize();
}

// ---------- Model select ----------
function populateModelSelect() {
  const opts = ['<option value="semua">Auto Model (Tercepat)</option>'];
  FREE_MODELS.forEach((m) => opts.push('<option value="' + m + '">' + m + '</option>'));
  modelSelect.innerHTML = opts.join('');
  modelSelect.value = FREE_MODEL;
}

function setModel(value) {
  FREE_MODEL = value;
  localStorage.setItem(FREE_MODEL_KEY, value);
  if (modelSelect.value !== value) modelSelect.value = value;
  const sel = document.getElementById('freeModel');
  if (sel && sel.value !== value) sel.value = value;
}

// ---------- Tema ----------
function applyTheme(theme) {
  if (theme == null) document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', theme);
  if (themeToggle) themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
}

function toggleTheme() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = dark ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('ga_theme', next);
}

const savedTheme = localStorage.getItem('ga_theme');
if (savedTheme == null) {
  if (window.matchMedia('(prefers-color-scheme:dark)').matches) document.documentElement.setAttribute('data-theme', 'dark');
} else {
  applyTheme(savedTheme);
}

// ---------- Modal bantuan (shortcuts) ----------
function closeModal() {
  const m = document.querySelector('.modal-overlay');
  if (m) m.remove();
}

function openModal(html) {
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = '<div class="modal">' + html + '</div>';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);
  return overlay;
}

function showShortcuts() {
  const items = [
    ['Send message', 'Enter'],
    ['New line', 'Shift + Enter'],
    ['Toggle theme', 'Ctrl + T'],
    ['Export chat', 'Ctrl + E'],
    ['Clear chat', 'Ctrl + L'],
    ['Close dialog', 'Esc'],
  ];
  openModal(
    '<h3><i class="ri-keyboard-line"></i> Keyboard shortcuts</h3>' +
    '<div class="shortcut-list">' +
    items.map((s) => '<div class="shortcut-item"><span>' + s[0] + '</span><span class="kbd">' + s[1] + '</span></div>').join('') +
    '</div>' +
    '<button class="modal-close" onclick="closeModal()">Close</button>'
  );
}

// ---------- Modal pengaturan ----------
function showSettings() {
  const isFree = API_MODE === 'free';
  const isCustom = API_MODE === 'custom';
  const isOH = API_MODE === 'openhands';

  const freeOpts = ['<option value="semua"' + (FREE_MODEL === 'semua' ? ' selected' : '') + '>Auto Model (Tercepat)</option>']
    .concat(FREE_MODELS.map((m) => '<option value="' + m + '"' + (FREE_MODEL === m ? ' selected' : '') + '>' + m + '</option>'))
    .join('');

  const customModels = ['gpt-5.5', 'gpt-5.5-mini', 'gpt-5.5-nano', 'gpt-5.5-pro', 'claude-opus-4-7', 'claude-sonnet-4-6', 'gemini-2.5-flash', 'deepseek-chat', 'grok-4.3', 'smart-chat'];
  const customOpts = customModels.map((m) => '<option value="' + m + '"' + (CUSTOM_MODEL === m ? ' selected' : '') + '>' + m + '</option>').join('');

  openModal(
    '<h3><i class="ri-settings-3-line"></i> API settings</h3>' +
    '<div class="field"><label>API mode</label><div class="mode-row">' +
      '<button class="mode-btn ' + (isFree ? 'active' : '') + '" onclick="setApiMode(\'free\', this)"><i class="ri-sparkling-2-line"></i> Free Models</button>' +
      '<button class="mode-btn ' + (isOH ? 'active' : '') + '" onclick="setApiMode(\'openhands\', this)"><i class="ri-robot-line"></i> OpenHands</button>' +
      '<button class="mode-btn ' + (isCustom ? 'active' : '') + '" onclick="setApiMode(\'custom\', this)"><i class="ri-links-line"></i> Custom LLM</button>' +
    '</div></div>' +

    '<div id="freeApiSettings" style="display:' + (isFree ? 'block' : 'none') + ';">' +
      '<div class="field"><label>Model</label><select id="freeModel">' + freeOpts + '</select>' +
      '<small>Free models without an API key \u2014 same as <a href="https://antono4.github.io/MarbelAIv2.1/" target="_blank" rel="noopener">MarbelAIv2.1</a>. Automatic failover between providers.</small></div>' +
    '</div>' +

    '<div id="openhandsApiSettings" style="display:' + (isOH ? 'block' : 'none') + ';">' +
      '<div class="field"><label>OpenHands API Key</label><input type="password" id="ohApiKey" value="' + escHtml(OH_API_KEY) + '" placeholder="sk-oh-...">' +
      '<small>Get a key at <a href="https://app.all-hands.dev/settings/api-keys" target="_blank" rel="noopener">app.all-hands.dev/settings/api-keys</a>. Stored only in this browser.</small></div>' +
      '<div class="field"><label>API Base URL</label><input type="text" id="ohApiBase" value="' + escHtml(OH_API_BASE) + '" placeholder="https://app.all-hands.dev/api/v1"></div>' +
    '</div>' +

    '<div id="customApiSettings" style="display:' + (isCustom ? 'block' : 'none') + ';">' +
      '<div class="field"><label>API Base URL</label><input type="text" id="customApiBase" value="' + escHtml(CUSTOM_API_BASE) + '" placeholder="https://api.example.com/v1">' +
      '<small>Free keys: <a href="https://github.com/alistaitsacle/free-llm-api-keys" target="_blank" rel="noopener">github.com/alistaitsacle/free-llm-api-keys</a></small></div>' +
      '<div class="field"><label>API Key</label><input type="password" id="customApiKey" value="' + escHtml(CUSTOM_API_KEY) + '" placeholder="sk-..."></div>' +
      '<div class="field"><label>Model</label><select id="customModel">' + customOpts + '</select></div>' +
    '</div>' +

    '<div class="modal-actions"><button class="btn-primary" onclick="saveSettings()">Save &amp; Test</button>' +
    '<button class="btn-ghost" onclick="closeModal()">Cancel</button></div>'
  );
}

function setApiMode(mode, btn) {
  API_MODE = mode;
  localStorage.setItem('api_mode', mode);
  document.querySelectorAll('.modal .mode-btn').forEach((b) => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const freeDiv = document.getElementById('freeApiSettings');
  const ohDiv = document.getElementById('openhandsApiSettings');
  const customDiv = document.getElementById('customApiSettings');
  if (freeDiv) freeDiv.style.display = mode === 'free' ? 'block' : 'none';
  if (ohDiv) ohDiv.style.display = mode === 'openhands' ? 'block' : 'none';
  if (customDiv) customDiv.style.display = mode === 'custom' ? 'block' : 'none';
}

function saveSettings() {
  if (API_MODE === 'free') {
    const sel = document.getElementById('freeModel');
    if (sel) setModel(sel.value);
    localStorage.setItem('api_mode', 'free');
    closeModal();
    showToast('\u2705 Free models ready \u2014 no API key needed');
    return;
  }
  if (API_MODE === 'custom') {
    CUSTOM_API_BASE = (document.getElementById('customApiBase').value || '').trim();
    CUSTOM_API_KEY = (document.getElementById('customApiKey').value || '').trim();
    CUSTOM_MODEL = document.getElementById('customModel').value;
    localStorage.setItem('custom_api_base', CUSTOM_API_BASE);
    localStorage.setItem('custom_api_key', CUSTOM_API_KEY);
    localStorage.setItem('custom_model', CUSTOM_MODEL);
    if (!CUSTOM_API_BASE || !CUSTOM_API_KEY) { showToast('Please enter API Base URL and Key'); return; }
    localStorage.setItem('api_mode', 'custom');
    closeModal();
    showToast('Custom LLM saved');
    return;
  }
  const keyInput = document.getElementById('ohApiKey');
  const baseInput = document.getElementById('ohApiBase');
  OH_API_KEY = keyInput ? keyInput.value.trim() : OH_API_KEY;
  OH_API_BASE = (baseInput && baseInput.value.trim()) || 'https://app.all-hands.dev/api/v1';
  localStorage.setItem('oh_api_key', OH_API_KEY);
  localStorage.setItem('oh_api_base', OH_API_BASE);
  localStorage.setItem('api_mode', 'openhands');
  if (!OH_API_KEY) { showToast('Please enter your OpenHands API key'); return; }
  closeModal();
  showToast('OpenHands settings saved');
}

// ---------- Aksi topbar ----------
function clearChat() {
  if (!confirm('Clear this conversation?')) return;
  const th = currentThread();
  if (th) th.items = [];
  messagesEl.innerHTML = '';
  if (welcomeEl) welcomeEl.style.display = '';
  activeBadge.classList.remove('show');
  updateThreadList();
  persist();
}

function exportChat() {
  const th = currentThread();
  const items = th ? th.items : [];
  if (!items.length) { showToast('Nothing to export yet'); return; }
  let md = '# Generalist Agent \u2014 Conversation #' + threadId + '\n\n';
  items.forEach((i) => {
    md += (i.role === 'user' ? '**You:** ' : '**Generalist Agent:** ') + i.content + '\n\n';
  });
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'generalist-agent-' + threadId + '.md';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Conversation exported');
}

// ---------- Event listeners ----------
form.addEventListener('submit', (e) => { e.preventDefault(); onSend(); });
input.addEventListener('input', resize);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
});
modelSelect.addEventListener('change', () => setModel(modelSelect.value));
newThreadBtn.addEventListener('click', () => { if (isNarrow()) layoutEl.classList.add('collapsed'); newThread(); });
sideToggle.addEventListener('click', () => layoutEl.classList.toggle('collapsed'));
panelHide.addEventListener('click', () => layoutEl.classList.toggle('collapsed'));
themeToggle.addEventListener('click', toggleTheme);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 't') { e.preventDefault(); toggleTheme(); }
    if (e.key === 'e') { e.preventDefault(); exportChat(); }
    if (e.key === 'l') { e.preventDefault(); clearChat(); }
  }
});

// ---------- Init ----------
function restore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.history) || !data.history.length) return false;
    history = data.history;
    threadCount = data.threadCount || history[history.length - 1].id;
    threadId = data.threadId || history[history.length - 1].id;
    return true;
  } catch (e) { return false; }
}

populateModelSelect();
if (restore()) {
  loadThread(threadId);
} else {
  newThread();
}
setStatus('on', 'Ready');
syncSidebar();
resize();
