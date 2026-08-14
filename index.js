(() => {
'use strict';

const ID = 'st_quick_commands_cat';
const KEY = 'st_quick_commands_v1';
const POS = 'st_quick_commands_cat_pos_v2';

const defaults = {
  enabled: true,
  restoreInputAfterSend: true,
  rules: [
    {id:'r1', title:'不代赵语璃', enabled:true, text:'$指令：只对赵语璃以外角色进行角色扮演\n$指令：禁止替赵语璃进行对话、发言、表情、动作和内心想法的描写，禁止以赵语璃发的话做描写'},
    {id:'r2', title:'NPC推剧情', enabled:true, text:'$若有其他人物在场时，{{char}}需要赋予他们语言或者动作神态，用以推动剧情'},
    {id:'r3', title:'反史诗化', enabled:false, text:'$避免无意义夸张描写与史诗化套语。\n$禁止频繁使用「排山倒海」「海啸般」「洪流般」「撕裂神魂」「毁天灭地」「震碎虚空」等夸张表达。优先使用符合场景与人物能力的描写。'},
    {id:'r4', title:'能力一致', enabled:false, text:'$禁止为戏剧效果临时提升或降低角色、神器、NPC能力。\n$所有力量、武功、内力、神器效果必须与既有设定一致。'},
    {id:'r5', title:'少AI句式', enabled:false, text:'$避免重复使用固定推进句式。\n$少用「没有时间」「来不及」「顾不上」「某种」「彷佛」「似乎」「不由得」「下意识」等高频AI表达。'}
  ]
};

const clone = x => JSON.parse(JSON.stringify(x));

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    return raw
      ? Object.assign(clone(defaults), raw, {rules: Array.isArray(raw.rules) ? raw.rules : clone(defaults.rules)})
      : clone(defaults);
  } catch {
    return clone(defaults);
  }
}

let state = loadState();
let injecting = false;
let oldText = '';
let sentText = '';

function saveState() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function getActiveCommands() {
  if (!state.enabled) return '';
  return state.rules
    .filter(r => r.enabled && String(r.text || '').trim())
    .map(r => String(r.text).trim())
    .join('\n');
}

function getInput() {
  return document.querySelector('#send_textarea')
      || document.querySelector('textarea#send_textarea')
      || document.querySelector('textarea[name="text"]');
}

function setInputValue(el, value) {
  const proto = Object.getPrototypeOf(el);
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (setter) setter.call(el, value);
  else el.value = value;
  el.dispatchEvent(new Event('input', {bubbles:true}));
}

function injectCommands() {
  if (injecting) return;

  const el = getInput();
  const cmd = getActiveCommands();

  if (!el || !cmd || !el.value.trim() || el.value.includes('<!-- ST_QUICK_COMMANDS -->')) return;

  oldText = el.value;
  sentText = `<!-- ST_QUICK_COMMANDS -->\n${cmd}\n\n${oldText}`;
  injecting = true;
  setInputValue(el, sentText);

  setTimeout(() => {
    const current = getInput();
    if (state.restoreInputAfterSend && current && current.value === sentText) {
      setInputValue(current, oldText);
    }
    injecting = false;
    oldText = '';
    sentText = '';
  }, 1200);
}

function catSVG() {
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M18 40 L13 12 L37 28 Q50 22 63 28 L87 12 L82 41 Q91 51 88 66 Q84 87 50 89 Q16 87 12 66 Q9 51 18 40Z"
      fill="#fff" stroke="#5f7194" stroke-width="4" stroke-linejoin="round"/>
    <path d="M18 18 L34 31 L20 36Z" fill="#dce8ff"/>
    <path d="M82 18 L66 31 L80 36Z" fill="#dce8ff"/>
    <ellipse cx="34" cy="55" rx="7" ry="9" fill="#34445f"/>
    <ellipse cx="66" cy="55" rx="7" ry="9" fill="#34445f"/>
    <path d="M46 65 Q50 69 54 65" fill="none" stroke="#5f7194" stroke-width="3" stroke-linecap="round"/>
    <path d="M50 62 L46 59 Q50 56 54 59Z" fill="#e9a9b6"/>
    <path d="M25 66 L7 62 M25 72 L8 74 M75 66 L93 62 M75 72 L92 74"
      stroke="#5f7194" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
}

function loadPos() {
  try {
    return JSON.parse(localStorage.getItem(POS) || 'null');
  } catch {
    return null;
  }
}

function placeWrap(wrap, x, y) {
  const width = 78;
  const height = 58;
  x = Math.max(8, Math.min(window.innerWidth - width - 8, x));
  y = Math.max(8, Math.min(window.innerHeight - height - 8, y));
  wrap.style.left = `${x}px`;
  wrap.style.top = `${y}px`;
  localStorage.setItem(POS, JSON.stringify({x, y}));
}

function render() {
  const p = document.getElementById(`${ID}_panel`);
  if (!p) return;

  p.querySelector('#sq-enabled').checked = !!state.enabled;
  p.querySelector('#sq-restore').checked = !!state.restoreInputAfterSend;

  const list = p.querySelector('#sq-list');
  list.innerHTML = '';

  state.rules.forEach((r, i) => {
    const row = document.createElement('div');
    row.className = 'sq-rule';
    row.innerHTML = `
      <div class="sq-row">
        <label class="sq-use"><input class="en" type="checkbox"> 用</label>
        <input class="title" type="text">
        <button class="up" type="button">↑</button>
        <button class="down" type="button">↓</button>
        <button class="del" type="button">刪</button>
      </div>
      <textarea class="txt"></textarea>
    `;

    row.querySelector('.en').checked = !!r.enabled;
    row.querySelector('.title').value = r.title || '';
    row.querySelector('.txt').value = r.text || '';

    row.querySelector('.en').addEventListener('change', e => {
      r.enabled = e.target.checked;
      saveState();
    });
    row.querySelector('.title').addEventListener('input', e => {
      r.title = e.target.value;
      saveState();
    });
    row.querySelector('.txt').addEventListener('input', e => {
      r.text = e.target.value;
      saveState();
    });
    row.querySelector('.del').addEventListener('click', () => {
      if (confirm('刪除這條指令？')) {
        state.rules.splice(i, 1);
        saveState();
        render();
      }
    });
    row.querySelector('.up').addEventListener('click', () => {
      if (i > 0) {
        const [item] = state.rules.splice(i, 1);
        state.rules.splice(i - 1, 0, item);
        saveState();
        render();
      }
    });
    row.querySelector('.down').addEventListener('click', () => {
      if (i < state.rules.length - 1) {
        const [item] = state.rules.splice(i, 1);
        state.rules.splice(i + 1, 0, item);
        saveState();
        render();
      }
    });

    list.appendChild(row);
  });
}

function createPanel() {
  if (document.getElementById(`${ID}_panel`)) return;

  const p = document.createElement('div');
  p.id = `${ID}_panel`;
  p.hidden = true;
  p.innerHTML = `
    <div class="sq-head">
      <b>🐾 快捷指令</b>
      <button class="sq-close" type="button">×</button>
    </div>

    <label class="sq-check"><input id="sq-enabled" type="checkbox"> 啟用自動附加</label>
    <label class="sq-check"><input id="sq-restore" type="checkbox"> 發送後還原輸入框</label>

    <div class="sq-actions">
      <button id="sq-add" type="button">＋新增</button>
      <button id="sq-export" type="button">匯出</button>
      <button id="sq-import" type="button">匯入</button>
    </div>

    <textarea id="sq-importbox" placeholder="貼上 JSON，再按一次匯入"></textarea>
    <div id="sq-list"></div>
  `;

  document.body.appendChild(p);

  p.querySelector('.sq-close').addEventListener('click', () => {
    p.hidden = true;
  });

  p.querySelector('#sq-enabled').addEventListener('change', e => {
    state.enabled = e.target.checked;
    saveState();
  });

  p.querySelector('#sq-restore').addEventListener('change', e => {
    state.restoreInputAfterSend = e.target.checked;
    saveState();
  });

  p.querySelector('#sq-add').addEventListener('click', () => {
    state.rules.push({
      id: String(Date.now()),
      title: '新指令',
      enabled: true,
      text: '$指令：'
    });
    saveState();
    render();
  });

  p.querySelector('#sq-export').addEventListener('click', async () => {
    const text = JSON.stringify(state, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      alert('已複製到剪貼簿');
    } catch {
      prompt('複製以下 JSON：', text);
    }
  });

  p.querySelector('#sq-import').addEventListener('click', () => {
    const box = p.querySelector('#sq-importbox');
    if (!box.classList.contains('open')) {
      box.classList.add('open');
      box.focus();
      return;
    }

    try {
      const imported = JSON.parse(box.value);
      if (!Array.isArray(imported.rules)) throw new Error('invalid');
      state = Object.assign(clone(defaults), imported, {rules: imported.rules});
      saveState();
      box.value = '';
      box.classList.remove('open');
      render();
      alert('匯入完成');
    } catch {
      alert('JSON 格式錯誤');
    }
  });

  render();
}


function positionPanelNearCat() {
  const p = document.getElementById(`${ID}_panel`);
  const wrap = document.getElementById(`${ID}_wrap`);
  if (!p || !wrap || p.hidden) return;

  const gap = 10;
  const margin = 8;
  const r = wrap.getBoundingClientRect();

  // Let CSS provide the size first.
  p.style.left = 'auto';
  p.style.right = 'auto';
  p.style.top = 'auto';
  p.style.bottom = 'auto';
  p.style.transform = 'none';

  const panelWidth = Math.min(window.innerWidth - margin * 2, 520);
  p.style.width = `${panelWidth}px`;

  // Available space around the cat.
  const below = window.innerHeight - r.bottom - gap - margin;
  const above = r.top - gap - margin;

  const preferredHeight = Math.min(window.innerHeight * 0.62, 560);
  const useBelow = below >= 240 || below >= above;

  let top;
  let maxHeight;

  if (useBelow) {
    top = r.bottom + gap;
    maxHeight = Math.max(180, below);
  } else {
    maxHeight = Math.max(180, above);
    top = r.top - gap - Math.min(preferredHeight, maxHeight);
  }

  // Horizontal alignment follows cat, but clamp to screen.
  let left = r.left;
  if (left + panelWidth > window.innerWidth - margin) {
    left = window.innerWidth - panelWidth - margin;
  }
  left = Math.max(margin, left);

  p.style.left = `${left}px`;
  p.style.top = `${Math.max(margin, top)}px`;
  p.style.maxHeight = `${Math.min(preferredHeight, maxHeight)}px`;
  p.style.bottom = 'auto';
}

function togglePanel() {
  const p = document.getElementById(`${ID}_panel`);
  if (!p) return;
  p.hidden = !p.hidden;
  if (!p.hidden) {
    render();
    requestAnimationFrame(positionPanelNearCat);
  }
}

function createFloatingButton() {
  if (document.getElementById(`${ID}_wrap`)) return;

  createPanel();

  const wrap = document.createElement('div');
  wrap.id = `${ID}_wrap`;
  wrap.innerHTML = `
    <button id="${ID}_button" type="button" aria-label="快捷指令">${catSVG()}</button>
    <button id="${ID}_drag" type="button" aria-label="拖動快捷指令">⋮</button>
  `;
  document.body.appendChild(wrap);

  const cat = wrap.querySelector(`#${ID}_button`);
  const drag = wrap.querySelector(`#${ID}_drag`);

  const saved = loadPos();
  placeWrap(
    wrap,
    saved?.x ?? (window.innerWidth - 90),
    saved?.y ?? Math.max(110, window.innerHeight - 280)
  );

  // Important: cat uses ONLY click. No touchend handler, so iOS won't double-toggle.
  cat.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    togglePanel();
  });

  let dragging = false;
  let sx = 0, sy = 0, bx = 0, by = 0;

  function beginDrag(x, y) {
    dragging = true;
    sx = x;
    sy = y;
    const r = wrap.getBoundingClientRect();
    bx = r.left;
    by = r.top;
  }

  function moveDrag(x, y) {
    if (!dragging) return;
    placeWrap(wrap, bx + (x - sx), by + (y - sy));
    positionPanelNearCat();
  }

  function endDrag() {
    dragging = false;
  }

  drag.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    beginDrag(t.clientX, t.clientY);
  }, {passive:true});

  drag.addEventListener('touchmove', e => {
    if (!dragging || e.touches.length !== 1) return;
    e.preventDefault();
    const t = e.touches[0];
    moveDrag(t.clientX, t.clientY);
  }, {passive:false});

  drag.addEventListener('touchend', endDrag, {passive:true});
  drag.addEventListener('touchcancel', endDrag, {passive:true});

  drag.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    beginDrag(e.clientX, e.clientY);
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (dragging) moveDrag(e.clientX, e.clientY);
  });

  document.addEventListener('mouseup', endDrag);
}

function bindSendHooks() {
  document.addEventListener('click', e => {
    if (e.target?.closest?.('#send_but,#send_button,.send_but,[data-testid="send-button"]')) {
      injectCommands();
    }
  }, true);

  document.addEventListener('keydown', e => {
    const input = getInput();
    if (
      input &&
      e.target === input &&
      e.key === 'Enter' &&
      !e.shiftKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.metaKey
    ) {
      injectCommands();
    }
  }, true);
}


window.addEventListener('resize', () => {
  positionPanelNearCat();
});

window.addEventListener('orientationchange', () => {
  setTimeout(positionPanelNearCat, 120);
});

function boot() {
  createFloatingButton();
  bindSendHooks();
}

// No MutationObserver. Boot exactly once.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, {once:true});
} else {
  boot();
}

})();