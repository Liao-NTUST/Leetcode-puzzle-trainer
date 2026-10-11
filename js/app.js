(function () {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 無痕模式等情況 */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
  };

  const PROBLEMS = window.PROBLEMS;
  const byId = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
  const LIST_NAME = { B75: 'Blind 75', T150: 'Top 150' };
  const slug = (p) => p.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').trim().replace(/[\s-]+/g, '-');

  let ws;
  let current = null;
  let loading = false;
  let saveTimer = null;
  let codeTimer = null;
  let lang = store.get('lbt:codeLang', 'cpp');
  if (!['cpp', 'java', 'python'].includes(lang)) lang = 'cpp';
  let activeTab = 'results';
  let viewingSolution = false; // 正在看解答積木時，不儲存工作區、不算通過
  const solved = new Set(store.get('lbt:solved', []));
  const filter = Object.assign({ list: 'all', pattern: 'all', q: '' }, store.get('lbt:filter', {}));

  // ---------- 主題 ----------
  const LIGHT = Blockly.Theme.defineTheme('lbtLight', {
    base: Blockly.Themes.Classic,
    componentStyles: { workspaceBackgroundColour: '#fbfbfd', toolboxBackgroundColour: '#f1f3f6', toolboxForegroundColour: '#1d2330', flyoutBackgroundColour: '#e8ebf0', flyoutOpacity: 0.95 },
  });
  const DARK = Blockly.Theme.defineTheme('lbtDark', {
    base: Blockly.Themes.Classic,
    componentStyles: {
      workspaceBackgroundColour: '#181a20', toolboxBackgroundColour: '#20232b', toolboxForegroundColour: '#e6e8ee',
      flyoutBackgroundColour: '#2a2e38', flyoutForegroundColour: '#e6e8ee', flyoutOpacity: 0.95,
      scrollbarColour: '#5a606e', insertionMarkerColour: '#ffffff', insertionMarkerOpacity: 0.3, cursorColour: '#d0d0d0',
    },
  });
  const isDark = () => {
    const t = document.documentElement.dataset.theme;
    return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  };
  function applyTheme(t) {
    if (t === 'auto') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = t;
    store.set('lbt:theme', t);
    $('#btnTheme').title = '主題：' + { auto: '跟隨系統', light: '淺色', dark: '深色' }[t];
    if (ws) ws.setTheme(isDark() ? DARK : LIGHT);
  }
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => ws && ws.setTheme(isDark() ? DARK : LIGHT));

  // ---------- Blockly ----------
  function initWorkspace() {
    ws = Blockly.inject('blockly', {
      toolbox: LBT.toolbox,
      theme: isDark() ? DARK : LIGHT,
      grid: { spacing: 24, length: 3, colour: '#8884', snap: true },
      zoom: { controls: true, wheel: false, startScale: 0.85, maxScale: 2, minScale: 0.4, scaleSpeed: 1.15 },
      move: { scrollbars: true, drag: true, wheel: true },
      trashcan: true,
      sounds: false,
    });
    ws.addChangeListener(Blockly.Events.disableOrphans);
    ws.addChangeListener((e) => {
      if (loading || e.isUiEvent) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveNow, 400);
      if (activeTab === 'code') { clearTimeout(codeTimer); codeTimer = setTimeout(renderCode, 250); }
    });
    new ResizeObserver(() => Blockly.svgResize(ws)).observe($('#blockly'));
  }

  function saveNow() {
    clearTimeout(saveTimer);
    if (!current || !ws || viewingSolution) return;
    store.set('lbt:ws:' + current.id, Blockly.serialization.workspaces.save(ws));
  }

  function signature(p) {
    return `🧩 解題函式 ${p.fn}(${p.params.join(', ')})`;
  }
  function methodSig(p, m) {
    if (m.name === p.design.cls) return `🏗️ 建構子 ${p.design.cls}(${m.params.join(', ')})`;
    return `🧩 ${m.name}(${m.params.join(', ')})${m.ret === 'void' ? '' : '  → 要回傳'}`;
  }
  const allParams = (p) => (p.design ? [...new Set(p.design.methods.flatMap((m) => m.params))] : p.params);

  function setupWorkspace(p, fresh, override) {
    loading = true;
    Blockly.Events.disable();
    try {
      ws.clear();
      const saved = override || (fresh ? null : store.get('lbt:ws:' + p.id, null));
      if (saved) {
        try { Blockly.serialization.workspaces.load(saved, ws); } catch (e) { ws.clear(); }
      }
      allParams(p).forEach((n) => { if (!ws.getVariable(n)) ws.createVariable(n); });
      let roots;
      let created = false;
      if (p.design) {
        roots = p.design.methods.map((m) => {
          let r = ws.getBlocksByType('method_root', false).find((b) => b.data === m.name);
          if (!r) { r = Blockly.serialization.blocks.append({ type: 'method_root', data: m.name, x: 30, y: 30 }, ws); created = true; }
          r.setFieldValue(methodSig(p, m), 'SIG');
          r.setDeletable(false);
          return r;
        });
      } else {
        let root = ws.getBlocksByType('solution_root', false)[0];
        if (!root) { root = Blockly.serialization.blocks.append({ type: 'solution_root', x: 30, y: 30 }, ws); created = true; }
        root.setFieldValue(signature(p), 'SIG');
        root.setDeletable(false);
        roots = [root];
      }
      if (override || (created && roots.length > 1)) {
        // 一般題：輔助函式在上、主函式在下；設計題：方法依序排下來，輔助函式放最後。都不會重疊
        const others = ws.getTopBlocks(false).filter((b) => !roots.includes(b));
        const order = p.design ? [...roots, ...others] : [...others, ...roots];
        let y = 30;
        order.forEach((b) => {
          const xy = b.getRelativeToSurfaceXY();
          b.moveBy(30 - xy.x, y - xy.y);
          y += b.getHeightWidth().height + 50;
        });
      }
    } finally {
      Blockly.Events.enable();
      loading = false;
    }
    ws.clearUndo();
    ws.scroll(0, 0);
  }

  // ---------- 題目載入 ----------
  function loadProblem(id) {
    const p = byId[id] || PROBLEMS[0];
    if (current) saveNow();
    viewingSolution = false;
    current = p;
    LBT.current = p;
    store.set('lbt:last', p.id);
    setupWorkspace(p, false);
    renderProblem();
    renderNav();
    $('#tab-results').innerHTML = '<p class="muted">把積木組好後按「執行測試」。</p>';
    $('#tab-output').innerHTML = '<p class="muted">用「⭐ 回傳 / 印出」裡的「印出」積木追蹤變數，結果會顯示在這裡。</p>';
    setStatus('', '');
    updateSolutionUI();
    if (activeTab === 'code') renderCode();
    $('#leftPane').scrollTop = 0;
  }

  // 依題目 id 產生固定的亂數，讓選項順序每次都一樣
  function seeded(str) {
    let h = 2166136261;
    for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
  }
  function shuffle(arr, rnd) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function quizOptions(p) {
    const rnd = seeded(p.id);
    const pats = shuffle(Object.keys(PATTERNS).filter((k) => k !== p.pattern), rnd).slice(0, 3);
    const common = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'];
    const pool = common.includes(p.time) ? common : COMPLEXITIES;
    const times = shuffle(pool.filter((t) => t !== p.time), rnd).slice(0, 3);
    return { pattern: shuffle([p.pattern, ...pats], rnd), time: shuffle([p.time, ...times], rnd) };
  }

  function renderProblem() {
    const p = current;
    const quiz = store.get('lbt:quiz:' + p.id, {});
    const hintsShown = store.get('lbt:hints:' + p.id, 0);
    const opts = quizOptions(p);
    const patternKnown = !!quiz.pattern;

    const examples = p.tests.slice(0, 2).map((t, i) => `
      <div class="example"><b>範例 ${i + 1}</b><br>
        <b>輸入：</b><code>${esc(Runner.describeArgs(p, t))}</code><br>
        <b>輸出：</b><code>${esc(t.anyOf ? t.anyOf.map((x) => Runner.fmt(x)).join(' 或 ') : Runner.fmt(t.expected))}</code></div>`).join('');

    const optBtns = (kind, list, label) => list.map((o) => {
      let cls = 'opt';
      if (quiz[kind]) {
        const right = kind === 'pattern' ? p.pattern : p.time;
        if (o === right) cls += ' correct';
        else if (o === quiz[kind]) cls += ' wrong';
      }
      return `<button class="${cls}" data-kind="${kind}" data-val="${esc(o)}" ${quiz[kind] ? 'disabled' : ''}>${esc(label(o))}</button>`;
    }).join('');

    const fb = (kind, right, text) => !quiz[kind] ? '' :
      `<div class="quiz-fb">${quiz[kind] === right ? '✅ 答對了！' : '❌ 再想想看。正確答案是 <b>' + esc(text) + '</b>'}</div>`;

    const bothAnswered = quiz.pattern && quiz.time;

    $('#problem').innerHTML = `
      <h1 class="p-title"><span class="no">${p.no}.</span> ${esc(p.title)}</h1>
      <div class="p-sub">${esc(p.zh)}</div>
      <div class="badges">
        <span class="badge ${p.difficulty}">${p.difficulty}</span>
        ${p.lists.map((l) => `<span class="badge">${LIST_NAME[l]}</span>`).join('')}
        ${patternKnown ? `<span class="badge">${esc(PATTERNS[p.pattern])}</span>` : '<span class="badge locked">🔒 技巧（先回答觀念快問）</span>'}
        ${solved.has(p.id) ? '<span class="badge solved">✓ 已通過</span>' : ''}
        <span class="badge"><a href="https://leetcode.com/problems/${slug(p)}/" target="_blank" rel="noopener">LeetCode ↗</a></span>
      </div>
      <div class="desc">${p.desc}</div>
      ${examples}

      <h3 class="sec">🧠 觀念快問 <span class="muted" style="font-weight:400;font-size:13px">先想再拼</span></h3>
      <div class="card">
        <div class="quiz-q">1. 這題的核心技巧是？</div>
        <div class="options">${optBtns('pattern', opts.pattern, (k) => PATTERNS[k])}</div>
        ${fb('pattern', p.pattern, PATTERNS[p.pattern])}
      </div>
      <div class="card">
        <div class="quiz-q">2. 最佳解的時間複雜度是？</div>
        <div class="options">${optBtns('time', opts.time, (t) => t)}</div>
        ${fb('time', p.time, p.time)}
        ${bothAnswered ? `<div class="insight">💡 <b>核心觀念：</b>${esc(p.insight)}</div>` : ''}
      </div>

      <h3 class="sec">💡 提示 <span class="muted" style="font-weight:400;font-size:13px">${hintsShown}/${p.hints.length}</span></h3>
      ${p.hints.slice(0, hintsShown).map((h, i) => `<div class="hint"><b>提示 ${i + 1}：</b>${esc(h)}</div>`).join('')}
      ${hintsShown < p.hints.length ? `<button class="ghost" id="btnHint">看${hintsShown ? '下一個' : ''}提示</button>` : ''}

      <h3 class="sec">📖 參考思路</h3>
      <details class="solution card">
        <summary>展開虛擬碼（建議先自己試過再看）</summary>
        <pre class="code">${esc(p.solution)}</pre>
        <div class="muted">時間 ${esc(p.time)}・空間 ${esc(p.space)}</div>
      </details>
    `;

    $$('#problem .opt').forEach((b) => b.addEventListener('click', () => {
      const q = store.get('lbt:quiz:' + p.id, {});
      q[b.dataset.kind] = b.dataset.val;
      store.set('lbt:quiz:' + p.id, q);
      renderProblem();
    }));
    const hb = $('#btnHint');
    if (hb) hb.addEventListener('click', () => { store.set('lbt:hints:' + p.id, hintsShown + 1); renderProblem(); });
  }

  // ---------- 導覽 / 列表 ----------
  function filtered() {
    const q = filter.q.trim().toLowerCase();
    return PROBLEMS.filter((p) =>
      (filter.list === 'all' || p.lists.includes(filter.list)) &&
      (filter.pattern === 'all' || p.pattern === filter.pattern) &&
      (!q || p.title.toLowerCase().includes(q) || p.zh.includes(q) || String(p.no) === q));
  }

  function renderNav() {
    $('#navTitle').textContent = current ? `${current.no}. ${current.title}` : '題目列表';
    const inList = PROBLEMS.filter((p) => filter.list === 'all' || p.lists.includes(filter.list));
    const done = inList.filter((p) => solved.has(p.id)).length;
    $('#progress').textContent = `${filter.list === 'all' ? '全部' : LIST_NAME[filter.list]}：已通過 ${done} / ${inList.length}`;
  }

  function renderList() {
    const items = filtered();
    const groups = {};
    items.forEach((p) => (groups[p.pattern] = groups[p.pattern] || []).push(p));
    const html = Object.keys(PATTERNS).filter((k) => groups[k]).map((k) => `
      <div class="group-title">${esc(PATTERNS[k])}</div>
      ${groups[k].map((p) => `
        <button class="item ${current && current.id === p.id ? 'current' : ''}" data-id="${p.id}">
          <span class="check">${solved.has(p.id) ? '✓' : ''}</span>
          <span class="name">${p.no}. ${esc(p.title)}<small>${esc(p.zh)}</small></span>
          <span class="diff ${p.difficulty}">${p.difficulty}</span>
        </button>`).join('')}`).join('');
    $('#problemList').innerHTML = html || '<p class="muted" style="padding:12px">沒有符合的題目</p>';
    $$('#problemList .item').forEach((b) => b.addEventListener('click', () => { loadProblem(b.dataset.id); closeDrawer(); }));
    $$('#listSeg button').forEach((b) => b.classList.toggle('active', b.dataset.list === filter.list));
  }

  function openDrawer() {
    renderList();
    $('#drawer').hidden = false;
    $('#drawerOverlay').hidden = false;
    const cur = $('#problemList .item.current');
    if (cur) cur.scrollIntoView({ block: 'center' });
  }
  function closeDrawer() { $('#drawer').hidden = true; $('#drawerOverlay').hidden = true; }

  function step(delta) {
    const list = filtered();
    const pool = list.length ? list : PROBLEMS;
    const i = pool.findIndex((p) => p.id === current.id);
    const next = pool[(i + delta + pool.length) % pool.length];
    loadProblem(next.id);
  }

  // ---------- 執行 ----------
  function setStatus(text, cls) {
    const el = $('#runStatus');
    el.textContent = text;
    el.className = 'run-status ' + (cls || '');
  }

  function run() {
    saveNow();
    const code = current.design ? LBT.buildDesignJS(ws, current) : LBT.buildJS(ws);
    const { compileError, results } = Runner.runAll(current, code);
    showTab('results');
    if (compileError) {
      $('#tab-results').innerHTML = `<div class="summary bad">⚠️ ${esc(compileError)}</div>`;
      setStatus('組合有誤', 'bad');
      return;
    }
    const passed = results.filter((r) => r.pass).length;
    const all = passed === results.length;
    if (all && !viewingSolution && !solved.has(current.id)) {
      solved.add(current.id);
      store.set('lbt:solved', [...solved]);
      renderProblem();
      renderNav();
    }
    setStatus(all ? `✅ 全部通過 ${passed}/${results.length}` : `通過 ${passed}/${results.length}`, all ? 'ok' : 'bad');

    let firstFailOpened = false;
    $('#tab-results').innerHTML = `
      <div class="summary ${all ? 'ok' : 'bad'}">${all && viewingSolution ? '👀 這是參考解答的執行結果（不會記為通過）。看懂之後回到自己的積木再拼一次吧！' : all ? '🎉 全部通過！觀念正確。試著用「對應程式碼」看看它寫成程式長什麼樣子。' : `通過 ${passed} / ${results.length} 筆測資`}</div>
      ${results.map((r, i) => {
        const open = !r.pass && !firstFailOpened;
        if (open) firstFailOpened = true;
        return `<details class="result ${r.pass ? 'pass' : 'fail'}" ${open ? 'open' : ''}>
          <summary>${r.pass ? '✅' : '❌'} 測試 ${i + 1}</summary>
          <div class="rows">
            <b>輸入</b><code>${esc(r.input)}</code>
            <b>預期</b><code>${esc(r.expected)}</code>
            ${r.error ? `<b>錯誤</b><code class="err">${esc(r.error)}</code>` : `<b>你的輸出</b><code>${esc(r.got)}</code>`}
            ${r.logs.length ? `<b>印出</b><pre class="logs">${esc(r.logs.join('\n'))}</pre>` : ''}
          </div>
        </details>`;
      }).join('')}`;

    const withLogs = results.filter((r) => r.logs.length);
    $('#tab-output').innerHTML = withLogs.length
      ? results.map((r, i) => r.logs.length ? `<div class="out-block"><h4>測試 ${i + 1}（${esc(r.input)}）</h4><pre class="code logs">${esc(r.logs.join('\n'))}</pre></div>` : '').join('')
      : '<p class="muted">這次執行沒有任何「印出」。</p>';
  }

  // ---------- 分頁 / 程式碼 ----------
  function showTab(name) {
    activeTab = name;
    $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
    ['results', 'output', 'code'].forEach((n) => ($('#tab-' + n).hidden = n !== name));
    $('#langSeg').hidden = name !== 'code';
    if (name === 'code') renderCode();
  }
  function renderCode() {
    if (!current) return;
    let code;
    try { code = lang === 'python' ? LBT.previewPython(ws, current) : Typed.translate(ws, current, lang); }
    catch (e) { code = '// 無法產生程式碼：' + e.message; }
    $('#codeView').textContent = code;
    $$('#langSeg button').forEach((b) => b.classList.toggle('active', b.dataset.lang === lang));
  }

  // ---------- 拖曳調整版面 ----------
  function dragGutter(el, onMove) {
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      el.classList.add('dragging');
      const move = (ev) => onMove(ev);
      const up = () => {
        el.classList.remove('dragging');
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        store.set('lbt:layout', { left: getComputedStyle(document.documentElement).getPropertyValue('--left-w'), bottom: getComputedStyle(document.documentElement).getPropertyValue('--bottom-h') });
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
    });
  }
  function initLayout() {
    const saved = store.get('lbt:layout', null);
    if (saved) {
      if (saved.left) document.documentElement.style.setProperty('--left-w', saved.left.trim());
      if (saved.bottom) document.documentElement.style.setProperty('--bottom-h', saved.bottom.trim());
    }
    dragGutter($('#gutterV'), (e) => {
      const r = $('#split').getBoundingClientRect();
      const pct = Math.min(70, Math.max(20, ((e.clientX - r.left) / r.width) * 100));
      document.documentElement.style.setProperty('--left-w', pct.toFixed(1) + '%');
    });
    dragGutter($('#gutterH'), (e) => {
      const r = $('#rightPane').getBoundingClientRect();
      const pct = Math.min(75, Math.max(12, ((r.bottom - e.clientY) / r.height) * 100));
      document.documentElement.style.setProperty('--bottom-h', pct.toFixed(1) + '%');
    });
  }

  // ---------- 事件 ----------
  function bind() {
    $('#btnRun').addEventListener('click', run);
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
      if (e.key === 'Escape') { closeDrawer(); closeHelp(); }
    });
    armButton($('#btnReset'), '確定清空？再按一次', () => {
      viewingSolution = false;
      store.del('lbt:ws:' + current.id);
      setupWorkspace(current, true);
      saveNow();
      updateSolutionUI();
      if (activeTab === 'code') renderCode();
    });
    armButton($('#btnSolution'), '確定看解答？再按一次', showSolution, () => viewingSolution);

    $$('.tab').forEach((t) => t.addEventListener('click', () => showTab(t.dataset.tab)));
    $$('#langSeg button').forEach((b) => b.addEventListener('click', () => { lang = b.dataset.lang; store.set('lbt:codeLang', lang); renderCode(); }));

    $('#btnList').addEventListener('click', openDrawer);
    $('#btnCloseDrawer').addEventListener('click', closeDrawer);
    $('#drawerOverlay').addEventListener('click', closeDrawer);
    $('#btnPrev').addEventListener('click', () => step(-1));
    $('#btnNext').addEventListener('click', () => step(1));

    $$('#listSeg button').forEach((b) => b.addEventListener('click', () => {
      filter.list = b.dataset.list; store.set('lbt:filter', filter); renderList(); renderNav();
    }));
    const sel = $('#patternSel');
    sel.innerHTML = '<option value="all">全部技巧</option>' + Object.entries(PATTERNS).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');
    sel.value = filter.pattern;
    sel.addEventListener('change', () => { filter.pattern = sel.value; store.set('lbt:filter', filter); renderList(); });
    const sb = $('#searchBox');
    sb.value = filter.q;
    sb.addEventListener('input', () => { filter.q = sb.value; store.set('lbt:filter', filter); renderList(); });

    $('#btnHelp').addEventListener('click', openHelp);
    $('#btnCloseHelp').addEventListener('click', closeHelp);
    $('#helpOverlay').addEventListener('click', closeHelp);

    $('#btnTheme').addEventListener('click', () => {
      const order = ['auto', 'light', 'dark'];
      const cur = store.get('lbt:theme', 'auto');
      applyTheme(order[(order.indexOf(cur) + 1) % order.length]);
    });
    window.addEventListener('beforeunload', saveNow);
  }
  // 第一次按會變成「確認」狀態，3 秒內再按一次才執行。skipConfirm() 為 true 時直接執行
  function armButton(btn, confirmText, action, skipConfirm) {
    let timer = null;
    const restore = () => { timer = null; btn.textContent = btn.dataset.label; btn.classList.remove('confirm'); };
    btn.dataset.label = btn.textContent;
    btn.addEventListener('click', () => {
      if (skipConfirm && skipConfirm()) { restore(); action(); return; }
      if (!timer) {
        btn.textContent = confirmText;
        btn.classList.add('confirm');
        timer = setTimeout(restore, 3000);
        return;
      }
      clearTimeout(timer);
      restore();
      action();
    });
  }

  // ---------- 解答積木 ----------
  function showSolution() {
    if (viewingSolution) { // 回到自己的積木
      viewingSolution = false;
      setupWorkspace(current, false);
    } else {
      const data = Solutions.toWorkspace(current);
      if (!data) return;
      saveNow();
      viewingSolution = true;
      setupWorkspace(current, false, data);
    }
    updateSolutionUI();
    setStatus('', '');
    if (activeTab === 'code') renderCode();
  }
  function updateSolutionUI() {
    const btn = $('#btnSolution');
    btn.hidden = !Solutions.has(current.id);
    btn.dataset.label = viewingSolution ? '↩ 回到我的積木' : '🧩 看解答拼法';
    btn.textContent = btn.dataset.label;
    btn.classList.toggle('viewing', viewingSolution);
    $('#solBanner').hidden = !viewingSolution;
  }

  function openHelp() { $('#help').hidden = false; $('#helpOverlay').hidden = false; }
  function closeHelp() { $('#help').hidden = true; $('#helpOverlay').hidden = true; store.set('lbt:seenHelp', true); }

  // ---------- 啟動 ----------
  applyTheme(store.get('lbt:theme', 'auto'));
  initLayout();
  initWorkspace();
  bind();
  loadProblem(store.get('lbt:last', PROBLEMS[0].id));
  if (!store.get('lbt:seenHelp', false)) openHelp();
})();
