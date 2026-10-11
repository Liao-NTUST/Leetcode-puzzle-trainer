// 執行積木產生的程式碼並比對測資
(function (root) {
  // 一個節點類別涵蓋所有題型：串列、樹、字典樹、圖、隨機指標、四分樹、LRU 雙向串列
  class Node {
    constructor(val) {
      this.val = val === undefined ? 0 : val;
      this.next = null;
      this.left = null;
      this.right = null;
      this.random = null;
      this.prev = null;
      this.key = 0;
      this.neighbors = [];
      this.children = new Map();
      this.isEnd = false;
      this.isLeaf = false;
      this.topLeft = null;
      this.topRight = null;
      this.bottomLeft = null;
      this.bottomRight = null;
    }
  }

  // 排序 / 堆積用的比較：數字照大小、字串照字典序、清單逐項比
  function cmp(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) {
      for (let i = 0; i < Math.min(a.length, b.length); i++) {
        const c = cmp(a[i], b[i]);
        if (c) return c;
      }
      return a.length - b.length;
    }
    return a < b ? -1 : a > b ? 1 : 0;
  }

  class Heap {
    constructor(isMin) { this.a = []; this.min = isMin !== false; }
    better(x, y) { const c = cmp(x, y); return this.min ? c < 0 : c > 0; }
    size() { return this.a.length; }
    peek() { return this.a[0]; }
    push(v) {
      const a = this.a;
      a.push(v);
      let i = a.length - 1;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (!this.better(a[i], a[p])) break;
        [a[i], a[p]] = [a[p], a[i]];
        i = p;
      }
    }
    pop() {
      const a = this.a;
      if (!a.length) return undefined;
      const top = a[0];
      const last = a.pop();
      if (a.length) {
        a[0] = last;
        let i = 0;
        for (;;) {
          const l = 2 * i + 1, r = l + 1;
          let m = i;
          if (l < a.length && this.better(a[l], a[m])) m = l;
          if (r < a.length && this.better(a[r], a[m])) m = r;
          if (m === i) break;
          [a[i], a[m]] = [a[m], a[i]];
          i = m;
        }
      }
      return top;
    }
  }

  // ---------- 測資 ↔ 資料結構 ----------
  function arrayToList(arr, pos) {
    const nodes = arr.map((x) => new Node(x));
    nodes.forEach((n, i) => (n.next = nodes[i + 1] || null));
    if (typeof pos === 'number' && pos >= 0 && nodes.length) nodes[nodes.length - 1].next = nodes[pos];
    return nodes[0] || null;
  }
  function listToArray(head) {
    const out = [];
    const seen = new Set();
    while (head) {
      if (seen.has(head) || out.length > 10000) throw new Error('回傳的串列有環，或長度異常');
      seen.add(head);
      out.push(head.val);
      head = head.next;
    }
    return out;
  }
  function arrayToTree(arr) {
    if (!arr.length || arr[0] === null) return null;
    const rootNode = new Node(arr[0]);
    const q = [rootNode];
    let i = 1;
    while (q.length && i < arr.length) {
      const n = q.shift();
      if (i < arr.length && arr[i] !== null) q.push((n.left = new Node(arr[i])));
      i++;
      if (i < arr.length && arr[i] !== null) q.push((n.right = new Node(arr[i])));
      i++;
    }
    return rootNode;
  }
  function treeToArray(rootNode) {
    const out = [];
    const q = [rootNode];
    let guard = 0;
    while (q.length) {
      if (++guard > 20000) throw new Error('回傳的樹結構異常（可能有環）');
      const n = q.shift();
      if (n) {
        out.push(n.val);
        q.push(n.left, n.right);
      } else out.push(null);
    }
    while (out.length && out[out.length - 1] === null) out.pop();
    return out;
  }
  // 圖：鄰接串列，節點值從 1 開始
  function adjToGraph(adj) {
    if (!adj.length) return null;
    const nodes = adj.map((_, i) => new Node(i + 1));
    adj.forEach((nb, i) => (nodes[i].neighbors = nb.map((j) => nodes[j - 1])));
    return nodes[0];
  }
  function graphToAdj(start, original) {
    if (!start) return [];
    const seen = new Map();
    const q = [start];
    seen.set(start.val, start);
    while (q.length) {
      const n = q.shift();
      if (original && original.has(n)) throw new Error('回傳的圖裡有原本的節點，不是深拷貝');
      for (const m of n.neighbors || []) if (!seen.has(m.val)) { seen.set(m.val, m); q.push(m); }
    }
    const max = Math.max(...seen.keys());
    return Array.from({ length: max }, (_, i) => (seen.get(i + 1) ? seen.get(i + 1).neighbors.map((m) => m.val) : []));
  }
  function collectGraph(start) {
    const s = new Set();
    const q = start ? [start] : [];
    while (q.length) { const n = q.pop(); if (s.has(n)) continue; s.add(n); (n.neighbors || []).forEach((m) => q.push(m)); }
    return s;
  }
  // 隨機指標串列：[[val, randomIndex | null], ...]
  function pairsToRandomList(pairs) {
    const nodes = pairs.map(([val]) => new Node(val));
    nodes.forEach((n, i) => { n.next = nodes[i + 1] || null; n.random = pairs[i][1] === null ? null : nodes[pairs[i][1]]; });
    return nodes[0] || null;
  }
  function randomListToPairs(head, original) {
    const nodes = [];
    for (let n = head; n; n = n.next) {
      if (nodes.length > 10000) throw new Error('串列太長或有環');
      if (original && original.has(n)) throw new Error('回傳的串列裡有原本的節點，不是深拷貝');
      nodes.push(n);
    }
    const idx = new Map(nodes.map((n, i) => [n, i]));
    return nodes.map((n) => [n.val, n.random ? (idx.has(n.random) ? idx.get(n.random) : -999) : null]);
  }
  // 有 next 的樹：依 next 指標逐層輸出，每層後面加 "#"
  function nextTreeToArray(rootNode) {
    const out = [];
    let level = rootNode;
    let guard = 0;
    while (level) {
      let nextLevel = null;
      for (let n = level; n; n = n.next) {
        if (++guard > 20000) throw new Error('next 指標有環');
        out.push(n.val);
        if (!nextLevel) nextLevel = n.left || n.right || null;
      }
      out.push('#');
      // 下一層的開頭：本層第一個有孩子的節點
      let start = null;
      for (let n = level; n && !start; n = n.next) start = n.left || n.right;
      level = start;
    }
    return out;
  }
  // 四分樹：層序 [[isLeaf, val], ...]，null 表示沒有節點
  function quadToArray(rootNode) {
    const out = [];
    const q = [rootNode];
    while (q.length) {
      const n = q.shift();
      if (!n) { out.push(null); continue; }
      out.push([n.isLeaf ? 1 : 0, n.val ? 1 : 0]);
      if (!n.isLeaf) q.push(n.topLeft, n.topRight, n.bottomLeft, n.bottomRight);
    }
    while (out.length && out[out.length - 1] === null) out.pop();
    return out;
  }

  const clone = (x) => JSON.parse(JSON.stringify(x));

  function convertIn(type, a, test) {
    if (type === 'list') return arrayToList(a, test && test.pos);
    if (type === 'tree' || type === 'nextTree') return arrayToTree(a);
    if (type === 'graph') return adjToGraph(a);
    if (type === 'randomList') return pairsToRandomList(a);
    if (type === 'listArray') return a.map((x) => arrayToList(x));
    return a;
  }
  function findNode(n, v) {
    if (!n) return null;
    if (n.val === v) return n;
    return findNode(n.left, v) || findNode(n.right, v);
  }
  function prepareArgs(p, test) {
    const args = clone(test.args);
    const types = p.types || {};
    const out = args.map((a, i) => convertIn(types[p.params[i]], a, p.prepare === 'cycle' ? test : null));
    // 「樹裡的某個節點」：用值在第一個參數（樹）裡找出那個節點
    p.params.forEach((n, i) => { if (types[n] === 'treeNodeRef') out[i] = findNode(out[0], args[i]); });
    return out;
  }

  function normalizeOutput(p, r, ctx) {
    const o = p.output;
    if (o === 'list' && (r === null || r instanceof Node)) return listToArray(r);
    if (o === 'tree' && (r === null || r instanceof Node)) return treeToArray(r);
    if (o === 'nextTree' && (r === null || r instanceof Node)) return nextTreeToArray(r);
    if (o === 'graph' && (r === null || r instanceof Node)) return graphToAdj(r, ctx && ctx.original);
    if (o === 'randomList' && (r === null || r instanceof Node)) return randomListToPairs(r, ctx && ctx.original);
    if (o === 'quad' && (r === null || r instanceof Node)) return quadToArray(r);
    if (o === 'nodeVal' && (r === null || r instanceof Node)) return r ? r.val : null;
    if (r instanceof Set) return [...r];
    if (r instanceof Map) return Object.fromEntries(r);
    if (r instanceof Heap) return r.a.slice();
    return r === undefined ? null : r;
  }

  const key = (x) => JSON.stringify(x);
  const byKey = (a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0);
  function canonical(p, v) {
    if (!Array.isArray(v)) return v;
    if (p.compare === 'unordered' || p.compare === 'unorderedOuter') return [...v].sort(byKey);
    if (p.compare === 'unorderedDeep') return v.map((x) => (Array.isArray(x) ? [...x].sort(byKey) : x)).sort(byKey);
    return v;
  }
  function closeEnough(a, b) {
    if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= 1e-5 * Math.max(1, Math.abs(b));
    if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => closeEnough(x, b[i]));
    return key(a) === key(b);
  }
  function equal(p, got, expected) {
    if (p.compare === 'float') return closeEnough(got, expected);
    return key(canonical(p, got)) === key(canonical(p, expected));
  }

  // ---------- 特殊檢查 ----------
  function inorder(n, out) { if (n) { inorder(n.left, out); out.push(n.val); inorder(n.right, out); } return out; }
  function height(n) {
    if (!n) return 0;
    const l = height(n.left), r = height(n.right);
    if (l < 0 || r < 0 || Math.abs(l - r) > 1) return -1;
    return Math.max(l, r) + 1;
  }
  // 這些檢查只看「純資料」（陣列、數字），C++ / Java 的測試也共用
  const CHECKS = {
    // 原地修改：回傳 k，檢查 nums 的前 k 個
    kPrefix(p, test, k, args) {
      if (typeof k !== 'number') return { pass: false, got: fmt(k) };
      const prefix = args[0].slice(0, k);
      const norm = (a) => (p.prefixUnordered ? [...a].sort(cmp) : a);
      return { pass: k === test.expected.length && key(norm(prefix)) === key(norm(test.expected)), got: `k = ${k}，前 k 個 = ${fmt(prefix)}` };
    },
    // 任何一種高度平衡的 BST 都算對（out 是層序陣列）
    balancedBST(p, test, out) {
      const t = arrayToTree(out || []);
      const ok = key(inorder(t, [])) === key(test.args[0]) && height(t) >= 0;
      return { pass: ok, got: fmt(out) + (ok ? '' : '（不是高度平衡的 BST，或中序走訪不對）') };
    },
    // 任何合法的拓撲排序都算對；有環時要回傳 []
    topoOrder(p, test, out) {
      const [n, pre] = test.args;
      if (!Array.isArray(out)) return { pass: false, got: fmt(out) };
      if (!test.expected.length) return { pass: out.length === 0, got: fmt(out) };
      const pos = new Map(out.map((c, i) => [c, i]));
      const ok = out.length === n && pos.size === n && out.every((c) => c >= 0 && c < n) && pre.every(([a, b]) => pos.get(b) < pos.get(a));
      return { pass: ok, got: fmt(out) + (ok ? '' : '（不是合法的修課順序）') };
    },
    // 回傳任何一個峰值的索引都算對
    peak(p, test, i) {
      const a = test.args[0];
      const at = (j) => (j < 0 || j >= a.length ? -Infinity : a[j]);
      const ok = Number.isInteger(i) && i >= 0 && i < a.length && at(i) > at(i - 1) && at(i) > at(i + 1);
      return { pass: ok, got: fmt(i) + (ok ? '' : '（不是峰值）') };
    },
  };

  function fmt(v, depth) {
    depth = depth || 0;
    if (depth > 4) return '…';
    if (v === undefined) return '（沒有回傳值）';
    if (v === null) return 'null';
    if (typeof v === 'string') return JSON.stringify(v);
    if (typeof v === 'number') return Number.isFinite(v) ? String(Math.round(v * 1e6) / 1e6) : Number.isNaN(v) ? 'NaN' : v > 0 ? '∞' : '-∞';
    if (typeof v === 'boolean') return String(v);
    if (Array.isArray(v)) {
      const items = v.slice(0, 60).map((x) => fmt(x, depth + 1));
      if (v.length > 60) items.push(`…共 ${v.length} 項`);
      return '[' + items.join(', ') + ']';
    }
    if (v instanceof Map) return '{' + [...v].slice(0, 40).map(([k, x]) => `${fmt(k, depth + 1)}: ${fmt(x, depth + 1)}`).join(', ') + '}';
    if (v instanceof Set) return 'Set{' + [...v].slice(0, 40).map((x) => fmt(x, depth + 1)).join(', ') + '}';
    if (v instanceof Heap) return 'Heap' + fmt(v.a.slice().sort((a, b) => (v.min ? cmp(a, b) : cmp(b, a))), depth);
    if (v instanceof Node) return `Node(${fmt(v.val, depth + 1)})`;
    if (typeof v === 'function') return 'function';
    if (v && v.any) return v.any.map((x) => fmt(x, depth + 1)).join(' 或 ');
    try { return JSON.stringify(v); } catch (e) { return String(v); }
  }

  function describeArgs(p, test) {
    if (p.design) {
      if (p.design.roundtrip) return `輸入 = ${fmt(test.args[0])}`;
      return test.ops.map((op, i) => `${op}(${(test.args[i] || []).map((x) => fmt(x)).join(', ')})`).join(' → ');
    }
    const parts = p.params.map((name, i) => `${name} = ${fmt(test.args[i])}`);
    if (p.prepare === 'cycle') parts.push(`pos = ${test.pos}`);
    return parts.join(', ');
  }

  function friendlyError(e) {
    if (e instanceof RangeError && /call stack/i.test(e.message)) return '遞迴太深（是不是忘了終止條件 base case？）';
    if (e instanceof TypeError && /null|undefined/.test(e.message)) return '對 null / undefined 取值了：' + e.message + '（檢查索引是否超出範圍、節點是否為 null）';
    return e.message || String(e);
  }

  const MAX_STEPS = 5e6;
  const RUNTIME = ['Node', '__log', '__guard', '__cmp', 'Heap'];
  function makeEnv() {
    const logs = [];
    let steps = 0;
    return {
      logs,
      log: (...a) => { if (logs.length < 300) logs.push(a.map((x) => fmt(x)).join(' ')); },
      guard: () => ++steps > MAX_STEPS,
    };
  }

  function runAll(p, code) {
    return p.design ? runDesign(p, code) : runFunction(p, code);
  }

  function runFunction(p, code) {
    let factory;
    try {
      factory = new Function(...RUNTIME, `return function (${p.params.join(', ')}) {\n${code}\n};`);
    } catch (e) {
      return { compileError: '程式組合有誤：' + e.message, results: [] };
    }
    const results = p.tests.map((test) => {
      const env = makeEnv();
      const r = { input: describeArgs(p, test), expected: test.anyOf ? test.anyOf.map((x) => fmt(x)).join(' 或 ') : fmt(test.expected), logs: env.logs };
      try {
        const fn = factory(Node, env.log, env.guard, cmp, Heap);
        const args = prepareArgs(p, test);
        const original = p.output === 'graph' ? collectGraph(args[0]) : p.output === 'randomList' ? new Set((() => { const s = []; for (let n = args[0]; n; n = n.next) s.push(n); return s; })()) : null;
        let out = fn(...args);
        if (p.check) {
          Object.assign(r, CHECKS[p.check](p, test, normalizeOutput(p, out), args));
          return r;
        }
        if (p.resultFrom === 'arg0') out = args[0];
        const norm = normalizeOutput(p, out, { original });
        r.got = out === undefined && !p.resultFrom ? fmt(undefined) : fmt(norm);
        r.pass = test.anyOf ? test.anyOf.some((x) => equal(p, norm, x)) : equal(p, norm, test.expected);
      } catch (e) {
        r.pass = false;
        r.error = friendlyError(e);
      }
      return r;
    });
    return { results };
  }

  // 設計題：依序呼叫方法，比對每一步的回傳值（null 表示 void）
  function runDesign(p, code) {
    let factory;
    try {
      factory = new Function(...RUNTIME, code);
    } catch (e) {
      return { compileError: '程式組合有誤：' + e.message, results: [] };
    }
    const D = p.design;
    const results = p.tests.map((test) => {
      const env = makeEnv();
      const r = { input: describeArgs(p, test), expected: fmt(test.expected), logs: env.logs };
      try {
        const obj = factory(Node, env.log, env.guard, cmp, Heap);
        if (D.roundtrip) {
          const [enc, dec] = D.roundtrip;
          obj[D.cls]();
          const input = convertIn(D.inputType, clone(test.args[0]));
          const mid = obj[enc](input);
          const out = normalizeOutput({ output: D.inputType }, obj[dec](mid));
          r.got = `${enc} → ${fmt(mid)}，${dec} → ${fmt(out)}`;
          r.pass = equal(p, out, test.expected);
          return r;
        }
        const outs = [];
        let pass = true;
        test.ops.forEach((op, i) => {
          const m = D.methods.find((x) => x.name === op);
          const args = (test.args[i] || []).map((a, j) => convertIn(m.types && m.types[j], clone(a)));
          let res = obj[op](...args);
          res = op === D.cls || m.ret === 'void' ? null : normalizeOutput({ output: m.output }, res);
          outs.push(res);
          const want = test.expected[i];
          const ok = want && want.any ? want.any.some((x) => equal(p, res, x)) : (p.compare === 'float' ? closeEnough(res, want) : key(res) === key(want));
          if (!ok) pass = false;
        });
        r.got = fmt(outs);
        r.pass = pass;
      } catch (e) {
        r.pass = false;
        r.error = friendlyError(e);
      }
      return r;
    });
    return { results };
  }

  root.Runner = { CHECKS, equal, closeEnough, Node, Heap, cmp, runAll, fmt, describeArgs, arrayToTree, treeToArray, arrayToList, listToArray, adjToGraph, graphToAdj };
})(typeof window !== 'undefined' ? window : globalThis);
