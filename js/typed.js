// 把積木翻譯成 C++ / Java（LeetCode 的 class Solution 格式）。
// 積木本身沒有型別，所以先做型別推論（從參數、賦值、容器的使用方式推出來），再產生程式碼。
(function (root) {
  // ===================== 型別 =====================
  const T = (k, extra) => Object.assign({ k }, extra);
  const U = T('unknown');
  const INT = T('int'), LONG = T('long'), UINT = T('uint'), DBL = T('double'), BOOL = T('bool'), CHAR = T('char'), STR = T('string'), NUL = T('null'), VOID = T('void');
  const LIT1 = T('string', { lit1: true }); // 長度 1 的文字常數：可能是 char 也可能是 string
  const LIST = (el, arr) => T('list', { el: el || U, arr: !!arr });
  const MAP = (key, val) => T('map', { key: key || U, val: val || U });
  const SET = (el) => T('set', { el: el || U });
  // 堆積裡的清單元素一律用陣列（Java: int[]，比較時用 Arrays.compare）
  const HEAP = (el, min) => T('heap', { el: el && el.k === 'list' ? T('list', { el: el.el, arr: true }) : el || U, min: min !== false });
  const NODE = (kind) => T('node', { kind: kind || null });
  const PRIM = ['int', 'long', 'uint', 'double', 'bool', 'char'];
  const NUMERIC = ['int', 'long', 'uint', 'double'];
  const known = (t) => t && t.k !== 'unknown';
  const isPrim = (t) => t && PRIM.includes(t.k);
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  function unify(a, b) {
    if (!known(a)) return b || U;
    if (!known(b)) return a;
    if (a.k === 'null') return b;
    if (b.k === 'null') return a;
    if (a.k === 'string' && a.lit1 && b.k === 'char') return b;
    if (b.k === 'string' && b.lit1 && a.k === 'char') return a;
    if (a.k === 'string' && b.k === 'string') return a.lit1 && b.lit1 ? a : STR;
    if (NUMERIC.includes(a.k) && NUMERIC.includes(b.k) && a.k !== b.k) {
      if (a.k === 'double' || b.k === 'double') return DBL;
      if (a.k === 'long' || b.k === 'long') return LONG;
      if (a.k === 'uint' || b.k === 'uint') return UINT;
    }
    if (a.k !== b.k) return a;
    if (a.k === 'list') return LIST(unify(a.el, b.el), a.arr || b.arr);
    if (a.k === 'map') return MAP(unify(a.key, b.key), unify(a.val, b.val));
    if (a.k === 'set') return SET(unify(a.el, b.el));
    if (a.k === 'heap') return HEAP(unify(a.el, b.el), a.min);
    if (a.k === 'node') return NODE(a.kind || b.kind);
    return a;
  }
  function resolve(t) {
    if (!known(t)) return INT;
    if (t.k === 'string') return STR;
    if (t.k === 'null') return NODE('ListNode');
    if (t.k === 'list') return LIST(resolve(t.el), t.arr);
    if (t.k === 'map') return MAP(resolve(t.key), resolve(t.val));
    if (t.k === 'set') return SET(resolve(t.el));
    if (t.k === 'heap') { const el = resolve(t.el); return HEAP(el.k === 'list' ? LIST(el.el, true) : el, t.min); }
    if (t.k === 'node') return NODE(t.kind || 'ListNode');
    return t;
  }
  const elemOf = (t) => (!t ? U : t.k === 'string' ? CHAR : ['list', 'set', 'heap'].includes(t.k) ? t.el : U);

  // LeetCode 上的函式簽名：「回傳型別; 參數型別, ...」（新題目直接寫在題目的 sig 欄位）
  const SIGS = {
    'two-sum': 'int[]; int[], int', 'contains-duplicate': 'bool; int[]', 'valid-anagram': 'bool; string, string',
    'ransom-note': 'bool; string, string', 'majority-element': 'int; int[]', 'longest-consecutive': 'int; int[]',
    'group-anagrams': 'List<List<string>>; string[]', 'top-k-frequent': 'int[]; int[], int', 'product-except-self': 'int[]; int[]',
    'valid-palindrome': 'bool; string', 'is-subsequence': 'bool; string, string', 'two-sum-ii': 'int[]; int[], int',
    'container-most-water': 'int; int[]', 'three-sum': 'List<List<int>>; int[]', 'merge-sorted-array': 'void; int[], int, int[], int',
    'best-time-stock': 'int; int[]', 'jump-game': 'bool; int[]', 'longest-substring': 'int; string', 'valid-parentheses': 'bool; string',
    'eval-rpn': 'int; string[]', 'find-min-rotated': 'int; int[]', 'search-rotated': 'int; int[], int',
    'reverse-linked-list': 'ListNode; ListNode', 'merge-two-lists': 'ListNode; ListNode, ListNode', 'linked-list-cycle': 'bool; ListNode',
    'max-depth-tree': 'int; TreeNode', 'invert-tree': 'TreeNode; TreeNode', 'same-tree': 'bool; TreeNode, TreeNode',
    'number-of-islands': 'int; char[][]', 'climbing-stairs': 'int; int', 'house-robber': 'int; int[]', 'maximum-subarray': 'int; int[]',
    'coin-change': 'int; int[], int', 'unique-paths': 'int; int, int', 'missing-number': 'int; int[]', 'single-number': 'int; int[]',
    'number-of-1-bits': 'int; int', 'longest-common-prefix': 'string; string[]',
  };
  const BASE = { int: INT, long: LONG, uint: UINT, bool: BOOL, char: CHAR, string: STR, double: DBL, void: VOID };
  function parseT(s) {
    s = s.trim();
    if (s.endsWith('[]')) return LIST(parseT(s.slice(0, -2)), true);
    const m = /^List<(.*)>$/.exec(s);
    if (m) return LIST(parseT(m[1]), false);
    if (BASE[s]) return BASE[s];
    if (/^\w+Node$|^Node$/.test(s)) return NODE(s === 'Node' ? 'GraphNode' : s);
    return U;
  }
  const parseSig = (str) => {
    const [ret, ps] = str.split(';');
    return { ret: parseT(ret || 'void'), params: (ps || '').split(',').map((x) => x.trim()).filter(Boolean).map(parseT) };
  };
  // 沒寫簽名的題目，從測資猜型別
  function typeFromValue(v, kind) {
    if (kind === 'list') return NODE('ListNode');
    if (kind === 'tree') return NODE('TreeNode');
    if (typeof v === 'boolean') return BOOL;
    if (typeof v === 'number') return Number.isInteger(v) ? INT : DBL;
    if (typeof v === 'string') return STR;
    if (Array.isArray(v)) {
      const first = v.find((x) => x !== null && x !== undefined);
      if (first === undefined) return LIST(INT, true);
      if (Array.isArray(first) && typeof first.find((x) => x != null) === 'string' && first.every((x) => x.length === 1)) return LIST(LIST(CHAR, true), true);
      return LIST(typeFromValue(first), true);
    }
    return U;
  }
  function signature(p) {
    if (p.design) {
      const methods = {};
      p.design.methods.forEach((m) => { methods[m.name] = parseSig((p.sig && p.sig[m.name]) || 'void;'); });
      return { methods };
    }
    const s = p.sig || SIGS[p.id];
    if (s) return parseSig(s);
    const t0 = p.tests[0];
    const types = p.types || {};
    return {
      ret: p.resultFrom ? VOID : p.output ? NODE(p.output === 'tree' ? 'TreeNode' : 'ListNode') : typeFromValue(t0.expected),
      params: p.params.map((n, i) => typeFromValue(t0.args[i], types[n])),
    };
  }

  // 節點欄位的型別
  const FIELD_KIND = { next: 'ListNode', left: 'TreeNode', right: 'TreeNode', random: 'RandomNode', prev: 'DListNode',
    topLeft: 'QuadNode', topRight: 'QuadNode', bottomLeft: 'QuadNode', bottomRight: 'QuadNode' };
  const KIND_FIELDS = { ListNode: ['next'], TreeNode: ['left', 'right'], RandomNode: ['next', 'random'], DListNode: ['next', 'prev'],
    NextNode: ['left', 'right', 'next'], QuadNode: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] };
  function fieldType(kind, f) {
    if (f === 'val') return kind === 'QuadNode' ? BOOL : INT;
    if (f === 'key') return INT;
    if (f === 'isEnd' || f === 'isLeaf') return BOOL;
    if (f === 'neighbors') return LIST(NODE('GraphNode'));
    if (f === 'children') return MAP(CHAR, NODE('TrieNode'));
    if (kind && KIND_FIELDS[kind] && KIND_FIELDS[kind].includes(f)) return NODE(kind);
    return NODE(FIELD_KIND[f] || 'ListNode');
  }
  const CLASS_OF = { GraphNode: 'Node', RandomNode: 'Node', NextNode: 'Node', QuadNode: 'Node' };
  const className = (kind) => CLASS_OF[kind] || kind || 'ListNode';

  const RESERVED = new Set(('alignas alignof and asm auto bool break case catch char class const constexpr continue default delete do double else enum explicit ' +
    'extern false float for friend goto if inline int long namespace new not nullptr operator or private protected public register return short signed ' +
    'sizeof static struct switch template this throw true try typedef typename union unsigned using virtual void volatile while xor abstract boolean byte ' +
    'extends final finally implements import instanceof interface native null package super synchronized throws transient var String max min sort abs ' +
    'swap vector string map set list reverse queue stack').split(' '));
  const ident = (n) => {
    let s = String(n).replace(/[^\p{L}\p{N}_]/gu, '_');
    if (/^\d/.test(s)) s = '_' + s;
    return RESERVED.has(s) ? s + '_' : s;
  };

  // 優先順序（數字越大越鬆）
  const P = { ATOM: 0, POST: 1, UNARY: 3, MUL: 5, ADD: 6, SHIFT: 7, REL: 9, EQ: 10, BAND: 11, BXOR: 12, BOR: 13, AND: 14, OR: 15, TERN: 16 };
  const paren = (e, max) => (e.p > max ? `(${e.c})` : e.c);
  const parenR = (e, max) => (e.p >= max && e.p > P.ATOM ? `(${e.c})` : e.c);
  const E = (c, p, extra) => Object.assign({ c, p: p || P.ATOM }, extra);

  const ASSIGNING = ['variables_set', 'math_change', 'for_range', 'for_each'];

  // ===================== 主程式 =====================
  function translate(ws, p, lang) {
    const CPP = lang === 'cpp';
    const uses = new Set();
    const sig = signature(p);
    const vname = (b, field) => {
      const v = ws.getVariableById(b.getFieldValue(field || 'VAR'));
      return v ? v.name : '?';
    };
    const on = (b) => b && b.isEnabled();
    const input = (b, name) => { const t = b.getInputTargetBlock(name); return on(t) ? t : null; };

    // ---------- 範圍：入口（解題函式或類別方法）+ 自訂函式 ----------
    const scopes = [];
    const cls = { env: new Map() }; // 設計題的欄位
    const fields = p.design ? LBT.fieldNames(ws, p) : new Set();
    let main;
    if (p.design) {
      const roots = ws.getBlocksByType('method_root', false);
      p.design.methods.forEach((m) => {
        const r = roots.find((b) => b.data === m.name);
        const ms = sig.methods[m.name];
        const sc = { name: m.name, isEntry: true, isCtor: m.name === p.design.cls, top: r, body: r && input(r, 'BODY'), params: m.params.slice(), ret: m.name === p.design.cls ? VOID : ms.ret, env: new Map() };
        m.params.forEach((n, i) => sc.env.set(n, ms.params[i] || U));
        scopes.push(sc);
      });
      main = scopes[0];
    } else {
      const rootBlock = ws.getBlocksByType('solution_root', false)[0];
      main = { name: p.fn, isEntry: true, top: rootBlock, body: rootBlock && input(rootBlock, 'BODY'), params: p.params.slice(), ret: sig.ret, env: new Map() };
      p.params.forEach((n, i) => main.env.set(n, sig.params[i] || U));
      scopes.push(main);
    }
    const procs = new Map();
    ws.getTopBlocks(true).forEach((b) => {
      if (!on(b) || (b.type !== 'procedures_defreturn' && b.type !== 'procedures_defnoreturn')) return;
      const sc = { name: b.getFieldValue('NAME'), top: b, body: input(b, 'STACK'), retExpr: b.type === 'procedures_defreturn' ? input(b, 'RETURN') : null,
        params: b.getVars(), ret: b.type === 'procedures_defnoreturn' ? VOID : U, env: new Map() };
      scopes.push(sc);
      procs.set(sc.name, sc);
    });

    const blocksOf = (sc) => {
      const out = [];
      [sc.body, sc.retExpr].forEach((b) => b && b.getDescendants(true).forEach((d) => on(d) && out.push(d)));
      return out;
    };
    scopes.forEach((sc) => {
      sc.blocks = blocksOf(sc);
      sc.refs = new Set();
      sc.assigned = new Set();
      sc.blocks.forEach((b) => {
        if (b.getField('VAR') && b.type !== 'procedures_defreturn') {
          sc.refs.add(vname(b));
          if (ASSIGNING.includes(b.type)) sc.assigned.add(vname(b));
        }
      });
      if (sc.isEntry) sc.locals = new Set([...sc.refs].filter((n) => !sc.params.includes(n) && !fields.has(n)));
      else sc.locals = new Set([...sc.assigned].filter((n) => !sc.params.includes(n) && !fields.has(n)));
      sc.free = new Set([...sc.refs].filter((n) => !sc.locals.has(n) && !sc.params.includes(n) && !fields.has(n)));
    });
    // 自訂函式用到外層的變數 → 改成多傳參數（呼叫的函式要的也一起往上傳）
    for (let pass = 0; pass < 5; pass++) {
      scopes.forEach((sc) => {
        if (sc.isEntry) return;
        sc.blocks.forEach((b) => {
          if (!/^procedures_call/.test(b.type)) return;
          const callee = procs.get(b.getFieldValue('NAME'));
          if (callee) callee.free.forEach((n) => { if (!sc.locals.has(n) && !sc.params.includes(n)) sc.free.add(n); });
        });
      });
    }
    const captured = (sc) => (sc.isEntry ? [] : [...sc.free]);
    // 自訂函式「被誰呼叫」決定被捕捉的變數從哪個範圍來（一般題就是主函式）
    const outerOf = () => main;

    // ---------- 型別推論 ----------
    const owner = (sc, n) => (fields.has(n) ? cls : sc.isEntry || sc.locals.has(n) || sc.params.includes(n) ? sc : outerOf(sc));
    const lookup = (sc, n) => owner(sc, n).env.get(n) || U;
    let changed = false;
    function envSet(sc, n, t) {
      const o = owner(sc, n);
      const old = o.env.get(n) || U;
      const nu = unify(old, t);
      if (!same(nu, old)) { o.env.set(n, nu); changed = true; }
    }
    function typeOf(b, sc) {
      if (!b) return U;
      const ti = (name) => typeOf(input(b, name), sc);
      switch (b.type) {
        case 'math_number': return Number.isInteger(Number(b.getFieldValue('NUM'))) ? INT : DBL;
        case 'text': return b.getFieldValue('TEXT').length === 1 ? LIT1 : STR;
        case 'logic_boolean': case 'logic_compare': case 'logic_operation': case 'logic_negate': case 'is_null':
        case 'map_has': case 'set_has': case 'arr_is_empty': case 'is_alnum': return BOOL;
        case 'logic_null': return NUL;
        case 'math_constant': return b.getFieldValue('CONSTANT') === 'INFINITY' ? INT : DBL;
        case 'variables_get': return lookup(sc, vname(b));
        case 'math_arithmetic': {
          const op = b.getFieldValue('OP');
          if (op === 'DIVIDE' || op === 'POWER') return DBL;
          const a = ti('A'), c = ti('B');
          if (a.k === 'string' || c.k === 'string') return STR;
          return NUMERIC.includes(a.k) && NUMERIC.includes(c.k) ? unify(a, c) : NUMERIC.includes(a.k) ? a : NUMERIC.includes(c.k) ? c : INT;
        }
        case 'math_bit': { const a = ti('A'); return a.k === 'uint' || a.k === 'long' ? a : INT; }
        case 'math_modulo': case 'math_intdiv': { const a = ti(b.type === 'math_modulo' ? 'DIVIDEND' : 'A'); return a.k === 'long' || a.k === 'uint' ? a : INT; }
        case 'arr_len': case 'map_size': case 'set_size': case 'to_number': case 'char_code': case 'random_int': case 'heap_size': return INT;
        case 'math_single': return b.getFieldValue('OP') === 'ABS' || b.getFieldValue('OP') === 'NEG' ? ti('NUM') : DBL;
        case 'math_minmax': return NUMERIC.includes(ti('A').k) && NUMERIC.includes(ti('B').k) ? unify(ti('A'), ti('B')) : INT;
        case 'logic_ternary': return unify(ti('THEN'), ti('ELSE'));
        case 'arr_get': case 'arr_pop': case 'arr_last': return elemOf(ti('ARR'));
        case 'heap_pop': case 'heap_peek': return elemOf(ti('H'));
        case 'arr_new_empty': return LIST(U);
        case 'lists_create_with': {
          let t = U;
          for (let i = 0; b.getInput('ADD' + i); i++) t = unify(t, ti('ADD' + i));
          return LIST(t);
        }
        case 'arr_new_fill': { const v = ti('V'); return LIST(v, isPrim(v)); }
        case 'arr_new_2d': { const v = ti('V'); return LIST(LIST(v, isPrim(v)), isPrim(v)); }
        case 'arr_copy': { const a = ti('ARR'); return a.k === 'list' ? LIST(a.el, a.arr) : a; }
        case 'str_slice': { const a = ti('ARR'); return a.k === 'string' ? STR : a.k === 'list' ? LIST(a.el, a.arr) : U; }
        case 'str_lower': return ti('S').k === 'char' ? CHAR : STR;
        case 'char_from': return CHAR;
        case 'str_split': return LIST(STR);
        case 'str_sort_chars': case 'str_concat': case 'str_join': case 'str_repeat': return STR;
        case 'map_new': return MAP();
        case 'map_get': return ti('M').val || U;
        case 'map_get_default': return unify(ti('M').val || U, ti('D'));
        case 'map_list': { const m = ti('M'); return LIST(b.getFieldValue('WHAT') === 'keys' ? m.key : m.val); }
        case 'set_new': return SET();
        case 'set_from': return SET(elemOf(ti('L')));
        case 'heap_new': return HEAP(U, b.getFieldValue('KIND') === 'min');
        case 'node_get': {
          const n = ti('N');
          return fieldType(n.k === 'node' ? n.kind : null, b.getFieldValue('F'));
        }
        case 'node_new': return NODE(b.getFieldValue('KIND'));
        case 'procedures_callreturn': { const c = procs.get(b.getFieldValue('NAME')); return c ? c.ret : U; }
        default: return U;
      }
    }
    function constrain(b, t, sc) {
      if (!b || !known(t)) return;
      if (b.type === 'variables_get') envSet(sc, vname(b), t);
      else if (b.type === 'arr_get' || b.type === 'arr_last' || b.type === 'arr_pop') {
        if (typeOf(input(b, 'ARR'), sc).k !== 'string') constrain(input(b, 'ARR'), LIST(t), sc);
      } else if (b.type === 'map_get' || b.type === 'map_get_default') constrain(input(b, 'M'), MAP(U, t), sc);
      else if (b.type === 'heap_pop' || b.type === 'heap_peek') {
        const h = typeOf(input(b, 'H'), sc);
        constrain(input(b, 'H'), HEAP(t, h.k === 'heap' ? h.min : true), sc);
      } else if (b.type === 'node_get') {
        const f = b.getFieldValue('F');
        if (t.k === 'node' && t.kind && FIELD_KIND[f]) constrain(input(b, 'N'), NODE(t.kind), sc);
      }
    }
    function setRet(sc, t) {
      const nu = unify(sc.ret, t);
      if (!same(nu, sc.ret)) { sc.ret = nu; changed = true; }
    }
    function infer(b, sc) {
      const ti = (name) => typeOf(input(b, name), sc);
      switch (b.type) {
        case 'variables_set': envSet(sc, vname(b), ti('VALUE')); constrain(input(b, 'VALUE'), lookup(sc, vname(b)), sc); break;
        case 'math_change': case 'for_range': envSet(sc, vname(b), INT); break;
        case 'for_each': envSet(sc, vname(b), elemOf(ti('LIST'))); break;
        case 'arr_push': case 'arr_insert': constrain(input(b, 'ARR'), LIST(ti('V')), sc); constrain(input(b, 'V'), elemOf(ti('ARR')), sc); break;
        case 'arr_set': if (ti('ARR').k !== 'string') constrain(input(b, 'ARR'), LIST(ti('V')), sc); constrain(input(b, 'V'), elemOf(ti('ARR')), sc); break;
        case 'map_set': constrain(input(b, 'M'), MAP(ti('K'), ti('V')), sc); constrain(input(b, 'V'), ti('M').val, sc); break;
        case 'map_has': case 'map_get': case 'map_delete': constrain(input(b, 'M'), MAP(ti('K'), U), sc); break;
        case 'map_get_default': constrain(input(b, 'M'), MAP(ti('K'), ti('D')), sc); break;
        case 'set_add': case 'set_has': case 'set_delete': constrain(input(b, 'S'), SET(ti('V')), sc); break;
        case 'heap_push': { const h = ti('H'); constrain(input(b, 'H'), HEAP(ti('V'), h.k === 'heap' ? h.min : true), sc); break; }
        case 'logic_compare': constrain(input(b, 'A'), ti('B'), sc); constrain(input(b, 'B'), ti('A'), sc); break;
        case 'node_set': {
          const n = ti('N');
          constrain(input(b, 'V'), fieldType(n.k === 'node' ? n.kind : null, b.getFieldValue('F')), sc);
          break;
        }
        case 'ret_value':
          if (!sc.isEntry) setRet(sc, ti('VALUE'));
          // 回傳 double 時不往回推（int 會自動轉成 double）
          else if ((isPrim(sc.ret) && sc.ret.k !== 'double') || sc.ret.k === 'string' || sc.ret.k === 'node') constrain(input(b, 'VALUE'), sc.ret, sc);
          // 回傳 int[][] 時，清單裡的元素用 int[]（外層仍是 List，方便 add）
          else if (sc.ret.k === 'list') constrain(input(b, 'VALUE'), LIST(sc.ret.el, false), sc);
          break;
        case 'procedures_callreturn': case 'procedures_callnoreturn': {
          const c = procs.get(b.getFieldValue('NAME'));
          if (c) c.params.forEach((n, i) => { envSet(c, n, ti('ARG' + i)); constrain(input(b, 'ARG' + i), lookup(c, n), sc); });
          break;
        }
        default:
      }
    }
    for (let pass = 0; pass < 12; pass++) {
      changed = false;
      scopes.forEach((sc) => {
        sc.blocks.forEach((b) => infer(b, sc));
        if (sc.retExpr) setRet(sc, typeOf(sc.retExpr, sc));
      });
      if (!changed) break;
    }
    // 定案：剩下不知道的一律當 int
    [...scopes, cls].forEach((sc) => {
      sc.env.forEach((t, n) => sc.env.set(n, resolve(t)));
      if (sc.ret) sc.ret = sc.ret.k === 'void' ? VOID : resolve(sc.ret);
    });
    const typeR = (b, sc) => resolve(typeOf(b, sc));
    const varT = (sc, n) => resolve(lookup(sc, n));

    // ---------- 變數宣告位置 ----------
    function planDecls(sc) {
      const occ = new Map();
      const add = (n, o) => { if (!occ.has(n)) occ.set(n, []); occ.get(n).push(o); };
      function walk(key, first, prefix, loops) {
        let i = 0;
        for (let b = first; b; b = b.getNextBlock(), i++) {
          if (!on(b)) continue;
          const path = prefix.concat([{ key, i, b }]);
          const isLoopVar = (b.type === 'for_range' || b.type === 'for_each');
          if (b.getField('VAR')) add(vname(b), { path, b, inLoop: loops.includes(vname(b)) || isLoopVar });
          b.inputList.forEach((inp) => {
            const t = inp.connection && inp.connection.targetBlock();
            if (!t || !on(t)) return;
            if (inp.type === Blockly.inputs.inputTypes.STATEMENT) {
              walk(b.id + ':' + inp.name, t, path, isLoopVar ? loops.concat([vname(b)]) : loops);
            } else {
              t.getDescendants(false).forEach((d) => { if (on(d) && d.getField('VAR')) add(vname(d), { path, b, inLoop: loops.includes(vname(d)) }); });
            }
          });
        }
        return i;
      }
      const n = walk('root', sc.body, [], []);
      if (sc.retExpr) sc.retExpr.getDescendants(false).forEach((d) => { if (d.getField('VAR')) add(vname(d), { path: [{ key: 'root', i: n, b: null }], b: null }); });

      sc.loopDecl = new Set();
      sc.inlineDecl = new Set();
      sc.declBefore = new Map();
      sc.locals.forEach((name) => {
        const all = occ.get(name) || [];
        if (all.length && all.every((o) => o.inLoop)) { sc.loopDecl.add(name); return; }
        if (!all.length) return;
        let d = 0;
        for (;;) {
          const k0 = all[0].path[d] && all[0].path[d].key;
          if (!k0 || !all.every((o) => o.path[d] && o.path[d].key === k0)) { d--; break; }
          const i0 = all[0].path[d].i;
          if (!all.every((o) => o.path[d].i === i0)) break;
          d++;
        }
        if (d < 0) d = 0;
        const key = all[0].path[d].key;
        const idx = Math.min(...all.map((o) => o.path[d].i));
        const firstAt = all.filter((o) => o.path[d].i === idx);
        const stmt = firstAt[0].path[d].b;
        const selfRef = stmt && stmt.type === 'variables_set' && input(stmt, 'VALUE') &&
          input(stmt, 'VALUE').getDescendants(false).some((x) => x.getField('VAR') && vname(x) === name);
        if (stmt && stmt.type === 'variables_set' && vname(stmt) === name && firstAt.every((o) => o.path.length === d + 1) && !selfRef) {
          sc.inlineDecl.add(stmt.id);
        } else {
          const k = key + '#' + idx;
          if (!sc.declBefore.has(k)) sc.declBefore.set(k, []);
          sc.declBefore.get(k).push(name);
        }
      });
    }
    scopes.forEach(planDecls);

    // ===================== 產生程式碼 =====================
    const BOX = { int: 'Integer', long: 'Long', uint: 'Integer', double: 'Double', bool: 'Boolean', char: 'Character', string: 'String' };
    const usedKinds = new Set();
    function tn(t, boxed) {
      if (t.k === 'node') usedKinds.add(t.kind);
      if (CPP) {
        switch (t.k) {
          case 'int': case 'double': case 'bool': case 'char': case 'void': return t.k;
          case 'long': return 'long long';
          case 'uint': return 'uint32_t';
          case 'string': return 'string';
          case 'list': return `vector<${tn(t.el)}>`;
          case 'map': return `unordered_map<${tn(t.key)}, ${tn(t.val)}>`;
          case 'set': return `unordered_set<${tn(t.el)}>`;
          case 'heap': return t.min ? `priority_queue<${tn(t.el)}, vector<${tn(t.el)}>, greater<${tn(t.el)}>>` : `priority_queue<${tn(t.el)}>`;
          case 'node': return className(t.kind) + '*';
          default: return 'auto';
        }
      }
      switch (t.k) {
        case 'int': case 'double': case 'char': case 'long': return boxed ? BOX[t.k] : t.k;
        case 'uint': return boxed ? 'Integer' : 'int';
        case 'bool': return boxed ? 'Boolean' : 'boolean';
        case 'string': return 'String';
        case 'void': return 'void';
        case 'list': return t.arr ? tn(t.el) + '[]' : `List<${tn(t.el, true)}>`;
        case 'map': return `Map<${tn(t.key, true)}, ${tn(t.val, true)}>`;
        case 'set': return `Set<${tn(t.el, true)}>`;
        case 'heap': return `PriorityQueue<${tn(t.el, true)}>`;
        case 'node': return className(t.kind);
        default: return 'var';
      }
    }
    const isContainer = (t) => ['list', 'map', 'set', 'heap'].includes(t.k);
    function paramDecl(t, n) {
      if (CPP) return isContainer(t) ? `${tn(t)}& ${n}` : `${tn(t)} ${n}`;
      return `${tn(t)} ${n}`;
    }
    function newHeap(t) {
      if (CPP) return null;
      if (t.el.k === 'list') return `new PriorityQueue<>((a, b) -> Arrays.compare(${t.min ? 'a, b' : 'b, a'}))`;
      return t.min ? 'new PriorityQueue<>()' : 'new PriorityQueue<>(Collections.reverseOrder())';
    }
    function defaultVal(t) {
      switch (t.k) {
        case 'int': case 'long': case 'uint': return '0';
        case 'double': return '0.0';
        case 'bool': return 'false';
        case 'char': return "' '";
        case 'string': return '""';
        case 'node': return CPP ? 'nullptr' : 'null';
        case 'list': return CPP ? null : t.arr ? 'null' : 'new ArrayList<>()';
        case 'map': return CPP ? null : 'new HashMap<>()';
        case 'set': return CPP ? null : 'new HashSet<>()';
        case 'heap': return newHeap(t);
        default: return null;
      }
    }
    const isZeroLit = (b) => b && ((b.type === 'math_number' && Number(b.getFieldValue('NUM')) === 0) ||
      (b.type === 'logic_boolean' && b.getFieldValue('BOOL') === 'FALSE') || b.type === 'logic_null' || b.type === 'arr_new_empty' ||
      b.type === 'map_new' || b.type === 'set_new' || (b.type === 'text' && b.getFieldValue('TEXT') === ''));
    const charLit = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
    const strLit = (s) => JSON.stringify(s);
    const NULLS = CPP ? 'nullptr' : 'null';
    const ARROW = CPP ? '->' : '.';

    // ---------- 運算式 ----------
    function ex(b, sc, want) {
      if (!b) return E(want ? defaultVal(resolve(want)) || '0' : '0');
      const X = (name, w) => ex(input(b, name), sc, w);
      const ty = (name) => typeR(input(b, name), sc);
      const bin = (op, prec, a, c) => E(`${paren(a, prec)} ${op} ${['&&', '||', '+', '*'].includes(op) ? paren(c, prec) : parenR(c, prec)}`, prec);
      switch (b.type) {
        case 'math_number': {
          const raw = Number(b.getFieldValue('NUM'));
          let n = String(raw);
          if (want && want.k === 'double' && Number.isInteger(raw)) n += '.0';
          if (!CPP && want && want.k === 'long' && Math.abs(raw) > 2147483647) n += 'L';
          return E(n, n.startsWith('-') ? P.UNARY : P.ATOM);
        }
        case 'text': {
          const s = b.getFieldValue('TEXT');
          return s.length === 1 && want && want.k === 'char' ? E(charLit(s)) : E(strLit(s));
        }
        case 'logic_boolean': return E(b.getFieldValue('BOOL') === 'TRUE' ? 'true' : 'false');
        case 'logic_null': return E(NULLS);
        case 'math_constant': {
          const c = b.getFieldValue('CONSTANT');
          if (c === 'INFINITY') {
            if (want && want.k === 'double') return E(CPP ? 'INFINITY' : 'Double.POSITIVE_INFINITY');
            if (want && want.k === 'long') return E(CPP ? 'LLONG_MAX / 2' : 'Long.MAX_VALUE / 2', P.MUL);
            return E(CPP ? 'INT_MAX / 2' : 'Integer.MAX_VALUE / 2', P.MUL);
          }
          const m = { PI: ['M_PI', 'Math.PI'], E: ['M_E', 'Math.E'], SQRT2: ['sqrt(2.0)', 'Math.sqrt(2)'], SQRT1_2: ['sqrt(0.5)', 'Math.sqrt(0.5)'], GOLDEN_RATIO: ['(1 + sqrt(5.0)) / 2', '(1 + Math.sqrt(5)) / 2'] }[c];
          return E(m ? m[CPP ? 0 : 1] : '0');
        }
        case 'variables_get': return E(ident(vname(b)));
        case 'math_arithmetic': {
          const op = b.getFieldValue('OP');
          const ta = ty('A'), tb = ty('B');
          const w = typeR(b, sc);
          let a = X('A', NUMERIC.includes(tb.k) ? w : tb), c = X('B', NUMERIC.includes(ta.k) ? w : ta);
          if (op === 'POWER') return E(`${CPP ? 'pow' : 'Math.pow'}(${a.c}, ${c.c})`);
          if (op === 'DIVIDE') {
            if (ta.k !== 'double' && tb.k !== 'double') a = E(`(double) ${paren(a, P.UNARY)}`, P.UNARY);
            return bin('/', P.MUL, a, c);
          }
          // size() 是無號數，相減可能變成超大的正數，先轉成 int
          if (CPP && (op === 'MINUS' || op === 'ADD') && (a.sizeT || c.sizeT)) {
            if (a.sizeT) a = E(`(int) ${a.c}`, P.UNARY);
            if (c.sizeT) c = E(`(int) ${c.c}`, P.UNARY);
          }
          // int 相乘可能超過範圍時，結果要放進 long 就先轉型
          if (op === 'MULTIPLY' && want && want.k === 'long' && ta.k === 'int' && tb.k === 'int') a = E(`(${CPP ? 'long long' : 'long'}) ${paren(a, P.UNARY)}`, P.UNARY);
          if (!CPP && op === 'ADD' && ta.k === 'char' && tb.k === 'char') a = E(`"" + ${paren(a, P.ADD)}`, P.ADD);
          if (CPP && op === 'ADD' && (ta.k === 'string' || tb.k === 'string')) {
            const toS = (e, t) => (t.k === 'char' ? E(`string(1, ${e.c})`) : NUMERIC.includes(t.k) ? E(`to_string(${e.c})`) : e);
            a = toS(a, ta); c = toS(c, tb);
          }
          const sym = { ADD: '+', MINUS: '-', MULTIPLY: '*' }[op];
          return bin(sym, sym === '*' ? P.MUL : P.ADD, a, c);
        }
        case 'logic_compare': {
          const op = { EQ: '==', NEQ: '!=', LT: '<', LTE: '<=', GT: '>', GTE: '>=' }[b.getFieldValue('OP')];
          const ta = ty('A'), tb = ty('B');
          let a = X('A', tb), c = X('B', ta);
          if (!CPP && (ta.k === 'string' || tb.k === 'string') && ta.k !== 'char' && tb.k !== 'char') {
            if (op === '==') return E(`${paren(a, P.POST)}.equals(${c.c})`, P.POST);
            if (op === '!=') return E(`!${paren(a, P.POST)}.equals(${c.c})`, P.UNARY);
            return E(`${paren(a, P.POST)}.compareTo(${c.c}) ${op} 0`, P.REL);
          }
          if (!CPP && a.boxed && c.boxed && isPrim(ta)) a = E(`(${tn(ta)}) ${paren(a, P.UNARY)}`, P.UNARY);
          if (CPP && (a.sizeT || c.sizeT) && op !== '==' && op !== '!=') {
            if (a.sizeT) a = E(`(int) ${a.c}`, P.UNARY);
            if (c.sizeT) c = E(`(int) ${c.c}`, P.UNARY);
          }
          return bin(op, op === '==' || op === '!=' ? P.EQ : P.REL, a, c);
        }
        case 'logic_operation': {
          const and = b.getFieldValue('OP') === 'AND';
          return bin(and ? '&&' : '||', and ? P.AND : P.OR, X('A', BOOL), X('B', BOOL));
        }
        case 'logic_negate': {
          const inner = input(b, 'BOOL');
          if (inner && inner.type === 'is_null') return E(`${paren(ex(input(inner, 'X'), sc), P.EQ - 1)} != ${NULLS}`, P.EQ);
          return E('!' + paren(X('BOOL', BOOL), P.UNARY), P.UNARY);
        }
        case 'logic_ternary': {
          const w = want || typeR(b, sc);
          // C++ 的三元運算子裡不能直接寫 {}，要寫出型別
          const br = (name) => { const e = X(name, w); return CPP && e.c.startsWith('{') ? E(tn(w) + e.c) : e; };
          return E(`${paren(X('IF', BOOL), P.TERN - 1)} ? ${paren(br('THEN'), P.TERN - 1)} : ${paren(br('ELSE'), P.TERN)}`, P.TERN);
        }
        case 'is_null': return E(`${paren(X('X'), P.EQ - 1)} == ${NULLS}`, P.EQ);
        case 'math_minmax': {
          const w = typeR(b, sc);
          let a = X('A', w), c = X('B', w);
          // C++ 的 max/min 兩邊型別要一樣
          if (CPP && (ty('A').k !== ty('B').k || a.sizeT || c.sizeT)) return E(`${b.getFieldValue('OP')}<${tn(w)}>(${a.c}, ${c.c})`);
          return E(`${CPP ? '' : 'Math.'}${b.getFieldValue('OP')}(${a.c}, ${c.c})`);
        }
        case 'math_single': {
          const op = b.getFieldValue('OP');
          const x = X('NUM');
          if (op === 'NEG') return E('-' + paren(x, P.UNARY), P.UNARY);
          const fn = { ROOT: 'sqrt', ABS: 'abs', LN: 'log', LOG10: 'log10', EXP: 'exp' }[op];
          if (fn) return E(`${CPP ? '' : 'Math.'}${fn}(${x.c})`);
          return E(`${CPP ? 'pow' : 'Math.pow'}(10, ${x.c})`);
        }
        case 'math_modulo': return bin('%', P.MUL, X('DIVIDEND'), X('DIVISOR'));
        case 'math_intdiv': return bin('/', P.MUL, X('A'), X('B'));
        case 'math_bit': {
          let op = b.getFieldValue('OP');
          const ta = ty('A');
          let a = X('A', ta);
          if (op === '>>>' && CPP) {
            op = '>>';
            if (ta.k !== 'uint') a = E(`(unsigned) ${paren(a, P.UNARY)}`, P.UNARY);
          }
          const prec = { '&': P.BAND, '|': P.BOR, '^': P.BXOR, '<<': P.SHIFT, '>>': P.SHIFT, '>>>': P.SHIFT }[op];
          return bin(op, prec, a, X('B', ta.k === 'uint' && op !== '<<' && op !== '>>' ? ta : INT));
        }
        case 'to_number': return E(`${CPP ? 'stoi' : 'Integer.parseInt'}(${X('X').c})`);
        case 'random_int': return E(CPP ? `rand() % ${parenR(X('N'), P.MUL)}` : `(int) (Math.random() * ${parenR(X('N'), P.MUL)})`, CPP ? P.MUL : P.UNARY);
        case 'char_code': {
          const w = b.getFieldValue('WHAT');
          let c = X('C', CHAR);
          if (ty('C').k === 'string') c = E(CPP ? `${paren(c, P.POST)}[0]` : `${paren(c, P.POST)}.charAt(0)`, P.POST);
          if (w === 'code') return E(`(int) ${paren(c, P.UNARY)}`, P.UNARY);
          return E(`${paren(c, P.ADD)} - ${w === 'digit' ? "'0'" : "'a'"}`, P.ADD);
        }
        case 'char_from': {
          const base = b.getFieldValue('WHAT') === 'letter' ? "'a'" : "'0'";
          return E(`(char) (${base} + ${paren(X('N', INT), P.ADD)})`, P.UNARY);
        }
        case 'arr_get': {
          const ta = ty('ARR');
          const a = paren(X('ARR'), P.POST), i = X('IDX', INT).c;
          if (!CPP && ta.k === 'string') return E(`${a}.charAt(${i})`, P.POST);
          if (!CPP && ta.k === 'list' && !ta.arr) return E(`${a}.get(${i})`, P.POST, { boxed: true });
          return E(`${a}[${i}]`, P.POST);
        }
        case 'arr_len': {
          const ta = ty('ARR');
          const a = paren(X('ARR'), P.POST);
          if (CPP) return E(`${a}.size()`, P.POST, { sizeT: true });
          if (ta.k === 'string') return E(`${a}.length()`, P.POST);
          return E(ta.k === 'list' && ta.arr ? `${a}.length` : `${a}.size()`, P.POST);
        }
        case 'arr_is_empty': {
          const ta = ty('ARR');
          const a = paren(X('ARR'), P.POST);
          if (CPP) return E(`${a}.empty()`, P.POST);
          return ta.k === 'list' && ta.arr ? E(`${a}.length == 0`, P.EQ) : E(`${a}.isEmpty()`, P.POST);
        }
        case 'arr_pop': {
          const a = paren(X('ARR'), P.POST);
          const last = b.getFieldValue('END') === 'last';
          if (CPP) return E(last ? `[&] { auto popped = ${a}.back(); ${a}.pop_back(); return popped; }()` : `[&] { auto popped = ${a}.front(); ${a}.erase(${a}.begin()); return popped; }()`, P.POST);
          return E(last ? `${a}.remove(${a}.size() - 1)` : `${a}.remove(0)`, P.POST, { boxed: true });
        }
        case 'arr_last': {
          const ta = ty('ARR');
          const a = paren(X('ARR'), P.POST);
          if (CPP) return E(`${a}.back()`, P.POST);
          if (ta.k === 'list' && ta.arr) return E(`${a}[${a}.length - 1]`, P.POST);
          return E(`${a}.get(${a}.size() - 1)`, P.POST, { boxed: true });
        }
        case 'arr_copy': {
          const ta = ty('ARR');
          const a = X('ARR');
          if (CPP) return a;
          return ta.k === 'list' && ta.arr ? E(`${paren(a, P.POST)}.clone()`, P.POST) : E(`new ArrayList<>(${a.c})`);
        }
        case 'arr_new_empty': {
          const t = want && want.k === 'list' ? want : typeR(b, sc);
          if (CPP) return E(want && want.k === 'list' ? '{}' : `${tn(t)}()`);
          return E(want ? 'new ArrayList<>()' : `new ArrayList<${tn(t.el, true)}>()`);
        }
        case 'lists_create_with': {
          const t = want && want.k === 'list' ? want : typeR(b, sc);
          const items = [];
          for (let i = 0; b.getInput('ADD' + i); i++) items.push(X('ADD' + i, t.el).c);
          if (CPP) return E(want && want.k === 'list' ? `{${items.join(', ')}}` : `${tn(t)}{${items.join(', ')}}`);
          if (t.arr) return E(`new ${tn(t.el)}[]{${items.join(', ')}}`);
          return E(`Arrays.asList(${items.join(', ')})`);
        }
        case 'arr_new_fill': {
          const t = typeR(b, sc);
          const n = X('N', INT).c;
          const vb = input(b, 'V');
          if (CPP) return E(isZeroLit(vb) ? `${tn(t)}(${n})` : `${tn(t)}(${n}, ${X('V', t.el).c})`);
          if (t.arr) {
            if (isZeroLit(vb)) return E(`new ${tn(t.el)}[${n}]`);
            uses.add('stream');
            const s = t.el.k === 'double' ? 'DoubleStream' : t.el.k === 'long' ? 'LongStream' : 'IntStream';
            return E(`${s}.generate(() -> ${X('V', t.el).c}).limit(${n}).toArray()`, P.POST);
          }
          uses.add('stream');
          return E(`Stream.generate(() -> ${X('V', t.el).c}).limit(${n}).collect(Collectors.toList())`, P.POST);
        }
        case 'arr_new_2d': {
          const t = typeR(b, sc);
          const m = X('M', INT).c, n = X('N', INT).c;
          const vb = input(b, 'V');
          if (CPP) return E(`${tn(t)}(${m}, ${tn(t.el)}(${n}${isZeroLit(vb) ? '' : ', ' + X('V', t.el.el).c}))`);
          if (t.arr) {
            if (isZeroLit(vb)) return E(`new ${tn(t.el.el)}[${m}][${n}]`);
            return E(`Arrays.stream(new ${tn(t.el.el)}[${m}][${n}]).peek(row -> Arrays.fill(row, ${X('V', t.el.el).c})).toArray(${tn(t.el.el)}[][]::new)`, P.POST);
          }
          uses.add('stream');
          return E(`Stream.generate(() -> new ArrayList<>(Collections.nCopies(${n}, ${X('V', t.el.el).c}))).limit(${m}).collect(Collectors.toList())`, P.POST);
        }
        case 'str_slice': {
          const ta = ty('ARR');
          const a = paren(X('ARR'), P.POST), s = X('S', INT), e = X('E', INT);
          if (ta.k === 'string') {
            if (CPP) return E(s.c === '0' ? `${a}.substr(0, ${e.c})` : `${a}.substr(${s.c}, ${parenR(e, P.ADD)} - ${parenR(s, P.ADD)})`, P.POST);
            return E(`${a}.substring(${s.c}, ${e.c})`, P.POST);
          }
          if (CPP) return E(`${tn(ta)}(${a}.begin() + ${parenR(s, P.ADD)}, ${a}.begin() + ${parenR(e, P.ADD)})`);
          if (ta.arr) return E(`Arrays.copyOfRange(${a}, ${s.c}, ${e.c})`);
          return E(`new ArrayList<>(${a}.subList(${s.c}, ${e.c}))`);
        }
        case 'str_lower': {
          const x = X('S');
          if (ty('S').k === 'char') return E(CPP ? `tolower(${x.c})` : `Character.toLowerCase(${x.c})`);
          if (CPP) return E(`[&] { string lowered = ${x.c}; for (char& ch : lowered) ch = tolower(ch); return lowered; }()`, P.POST);
          return E(`${paren(x, P.POST)}.toLowerCase()`, P.POST);
        }
        case 'is_alnum': return E(CPP ? `isalnum(${X('C').c})` : `Character.isLetterOrDigit(${X('C').c})`);
        case 'str_sort_chars': {
          const x = X('S');
          if (CPP) return E(`[&] { string sorted = ${x.c}; sort(sorted.begin(), sorted.end()); return sorted; }()`, P.POST);
          return E(`${paren(x, P.POST)}.chars().sorted().collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append).toString()`, P.POST);
        }
        case 'str_concat': {
          const conv = (name) => {
            const t = ty(name), x = X(name);
            if (!CPP) return x;
            if (t.k === 'string') return x;
            if (t.k === 'char') return E(`string(1, ${x.c})`);
            return E(`to_string(${x.c})`);
          };
          const a = conv('A'), c = conv('B');
          if (!CPP && ty('A').k !== 'string' && ty('B').k !== 'string') return E(`"" + ${paren(a, P.ADD)} + ${parenR(c, P.ADD)}`, P.ADD);
          return bin('+', P.ADD, a, c);
        }
        case 'str_split': {
          const s = paren(X('S'), P.POST);
          if (CPP) {
            const sep = X('SEP', CHAR).c;
            return E(`[&] { vector<string> parts; string cur; for (char ch : ${s}) { if (ch == ${sep}) { if (!cur.empty()) parts.push_back(cur); cur.clear(); } else cur += ch; } if (!cur.empty()) parts.push_back(cur); return parts; }()`, P.POST);
          }
          uses.add('stream');
          return E(`Arrays.stream(${s}.split(java.util.regex.Pattern.quote(${X('SEP', STR).c}))).filter(w -> !w.isEmpty()).collect(Collectors.toList())`, P.POST);
        }
        case 'str_join': {
          const a = paren(X('ARR'), P.POST), sep = X('SEP', STR).c;
          if (CPP) return E(`[&] { string joined; for (size_t i = 0; i < ${a}.size(); i++) { if (i) joined += ${sep}; joined += ${a}[i]; } return joined; }()`, P.POST);
          return E(`String.join(${sep}, ${a})`);
        }
        case 'str_repeat': {
          const sb = input(b, 'S');
          const n = X('N', INT).c;
          if (CPP) {
            if (sb && sb.type === 'text' && sb.getFieldValue('TEXT').length === 1) return E(`string(${n}, ${charLit(sb.getFieldValue('TEXT'))})`);
            if (ty('S').k === 'char') return E(`string(${n}, ${X('S').c})`);
            return E(`[&] { string out; for (int i = 0; i < ${n}; i++) out += ${X('S').c}; return out; }()`, P.POST);
          }
          if (ty('S').k === 'char') return E(`String.valueOf(${X('S').c}).repeat(${n})`, P.POST);
          return E(`${paren(X('S', STR), P.POST)}.repeat(${n})`, P.POST);
        }
        case 'map_new': {
          if (CPP) return E(want && want.k === 'map' ? '{}' : `${tn(typeR(b, sc))}()`);
          { const t = typeR(b, sc); return E(want ? 'new HashMap<>()' : `new HashMap<${tn(t.key, true)}, ${tn(t.val, true)}>()`); }
        }
        case 'map_get': {
          const tm = ty('M');
          const m = paren(X('M'), P.POST), k = X('K', tm.key).c;
          return CPP ? E(`${m}[${k}]`, P.POST) : E(`${m}.get(${k})`, P.POST, { boxed: true });
        }
        case 'map_get_default': {
          const tm = ty('M');
          const m = paren(X('M'), P.POST), k = X('K', tm.key).c, d = X('D', tm.val).c;
          return CPP ? E(`(${m}.count(${k}) ? ${m}[${k}] : ${d})`) : E(`${m}.getOrDefault(${k}, ${d})`, P.POST, { boxed: true });
        }
        case 'map_has': {
          const tm = ty('M');
          const m = paren(X('M'), P.POST), k = X('K', tm.key).c;
          return E(CPP ? `${m}.count(${k})` : `${m}.containsKey(${k})`, P.POST);
        }
        case 'map_size': case 'set_size': case 'heap_size': return E(`${paren(X(b.type === 'map_size' ? 'M' : b.type === 'set_size' ? 'S' : 'H'), P.POST)}.size()`, P.POST, { sizeT: CPP });
        case 'map_list': {
          const keys = b.getFieldValue('WHAT') === 'keys';
          const m = paren(X('M'), P.POST);
          if (CPP) {
            const t = typeR(b, sc);
            return E(`[&] { ${tn(t)} out; for (auto& [k, v] : ${m}) out.push_back(${keys ? 'k' : 'v'}); return out; }()`, P.POST);
          }
          return E(`new ArrayList<>(${m}.${keys ? 'keySet' : 'values'}())`);
        }
        case 'set_new': {
          if (CPP) return E(want && want.k === 'set' ? '{}' : `${tn(typeR(b, sc))}()`);
          { const t = typeR(b, sc); return E(want ? 'new HashSet<>()' : `new HashSet<${tn(t.el, true)}>()`); }
        }
        case 'set_from': {
          const tl = ty('L');
          const l = paren(X('L'), P.POST);
          if (CPP) return E(`${tn(typeR(b, sc))}(${l}.begin(), ${l}.end())`);
          uses.add('stream');
          if (tl.k === 'string') return E(`${l}.chars().mapToObj(ch -> (char) ch).collect(Collectors.toSet())`, P.POST);
          if (tl.k === 'list' && tl.arr) {
            if (tl.el.k === 'int' || tl.el.k === 'double' || tl.el.k === 'long') return E(`Arrays.stream(${l}).boxed().collect(Collectors.toSet())`, P.POST);
            return E(`new HashSet<>(Arrays.asList(${l}))`);
          }
          return E(`new HashSet<>(${l})`);
        }
        case 'set_has': {
          const ts = ty('S');
          return E(`${paren(X('S'), P.POST)}.${CPP ? 'count' : 'contains'}(${X('V', ts.el).c})`, P.POST);
        }
        case 'heap_new': {
          const t = want && want.k === 'heap' ? want : typeR(b, sc);
          if (CPP) return E(`${tn(t)}()`);
          return E(newHeap(t));
        }
        case 'heap_pop': {
          const h = paren(X('H'), P.POST);
          if (CPP) return E(`[&] { auto top = ${h}.top(); ${h}.pop(); return top; }()`, P.POST);
          return E(`${h}.poll()`, P.POST, { boxed: true });
        }
        case 'heap_peek': {
          const h = paren(X('H'), P.POST);
          return CPP ? E(`${h}.top()`, P.POST) : E(`${h}.peek()`, P.POST, { boxed: true });
        }
        case 'node_get': return E(`${paren(X('N'), P.POST)}${ARROW}${b.getFieldValue('F')}`, P.POST);
        case 'node_new': {
          const kind = b.getFieldValue('KIND');
          usedKinds.add(kind);
          if (kind === 'TrieNode') return E('new TrieNode()', P.UNARY);
          if (kind === 'QuadNode') return E(`new Node(${X('V', BOOL).c}, false)`, P.UNARY);
          return E(`new ${className(kind)}(${X('V', INT).c})`, P.UNARY);
        }
        case 'procedures_callreturn': return callExpr(b, sc);
        default: return E('/* ? */ 0');
      }
    }
    function callExpr(b, sc) {
      const c = procs.get(b.getFieldValue('NAME'));
      const args = captured(c || { isEntry: true }).map(ident);
      if (c) c.params.forEach((n, i) => args.push(ex(input(b, 'ARG' + i), sc, varT(c, n)).c));
      return E(`${ident(b.getFieldValue('NAME'))}(${args.join(', ')})`, P.POST);
    }

    // ---------- 敘述 ----------
    const IND = '    ';
    function fresh(sc, cands) {
      const taken = new Set([...sc.refs, ...sc.params, ...captured(sc), ...fields].map(ident));
      for (const c of cands) if (!taken.has(c)) return c;
      for (let i = 2; ; i++) if (!taken.has(cands[0] + i)) return cands[0] + i;
    }
    function emitList(first, key, sc, d, out) {
      let i = 0;
      for (let b = first; b; b = b.getNextBlock(), i++) {
        if (!on(b)) continue;
        (sc.declBefore.get(key + '#' + i) || []).forEach((n) => {
          const t = varT(sc, n);
          const dv = defaultVal(t);
          out.push(IND.repeat(d) + `${tn(t)} ${ident(n)}${dv ? ' = ' + dv : ''};`);
        });
        emitStmt(b, sc, d, out);
      }
      return i;
    }
    function block(b, name, sc, d, out) {
      const first = input(b, name);
      emitList(first, b.id + ':' + name, sc, d + 1, out);
    }
    const isJump = (b) => b && !b.getNextBlock() && (b.type === 'ret_value' || b.type === 'controls_flow_statements');

    function emitStmt(b, sc, d, out) {
      const pad = IND.repeat(d);
      const L = (s) => out.push(pad + s);
      const X = (name, w) => ex(input(b, name), sc, w);
      const ty = (name) => typeR(input(b, name), sc);
      switch (b.type) {
        case 'variables_set': {
          const name = vname(b), id = ident(name);
          const t = varT(sc, name);
          const decl = sc.inlineDecl.has(b.id);
          const lhs = decl ? `${tn(t)} ${id}` : id;
          const vb = input(b, 'VALUE');
          const vt = vb && vb.type;
          if (CPP && vt === 'arr_pop') {
            const a = paren(ex(input(vb, 'ARR'), sc), P.POST);
            const last = vb.getFieldValue('END') === 'last';
            L(`${lhs} = ${a}.${last ? 'back' : 'front'}();`);
            L(last ? `${a}.pop_back();` : `${a}.erase(${a}.begin());`);
            return;
          }
          if (CPP && vt === 'heap_pop') {
            const h = paren(ex(input(vb, 'H'), sc), P.POST);
            L(`${lhs} = ${h}.top();`);
            L(`${h}.pop();`);
            return;
          }
          if (vt === 'str_sort_chars') {
            const s = ex(input(vb, 'S'), sc).c;
            if (CPP) { L(`${lhs} = ${s};`); L(`sort(${id}.begin(), ${id}.end());`); return; }
            L(`char[] ${id}Chars = ${s}.toCharArray();`);
            L(`Arrays.sort(${id}Chars);`);
            L(`${lhs} = new String(${id}Chars);`);
            return;
          }
          if (CPP && vt === 'str_split' && decl) {
            const s = ex(input(vb, 'S'), sc).c, sep = ex(input(vb, 'SEP'), sc, CHAR).c;
            const ss = fresh(sc, ['ss', 'stream']), w = fresh(sc, ['word', 'token', 'w']);
            L(`${tn(t)} ${id};`);
            L(`stringstream ${ss}(${s});`);
            L(`string ${w};`);
            L(`while (getline(${ss}, ${w}, ${sep})) if (!${w}.empty()) ${id}.push_back(${w});`);
            return;
          }
          if ((vt === 'map_new' || vt === 'set_new' || vt === 'arr_new_empty' || vt === 'heap_new') && CPP) { L(decl ? `${tn(t)} ${id};` : `${id} = {};`); return; }
          if (vt === 'arr_new_fill' && t.k === 'list') {
            const n = ex(input(vb, 'N'), sc, INT).c, v = input(vb, 'V');
            if (CPP) {
              if (decl) L(`${tn(t)} ${id}(${n}${isZeroLit(v) ? '' : ', ' + ex(v, sc, t.el).c});`);
              else L(`${id} = ${ex(vb, sc, t).c};`);
              return;
            }
            if (t.arr) {
              L(`${lhs} = new ${tn(t.el)}[${n}];`);
              if (!isZeroLit(v)) L(`Arrays.fill(${id}, ${ex(v, sc, t.el).c});`);
              return;
            }
            if (isContainer(t.el)) {
              L(`${lhs} = new ArrayList<>();`);
              const k = fresh(sc, ['i', 'j', 'k', 'idx']);
              L(`for (int ${k} = 0; ${k} < ${n}; ${k}++) ${id}.add(${ex(v, sc, t.el).c});`);
              return;
            }
          }
          if (vt === 'arr_new_2d' && t.k === 'list') {
            const m = ex(input(vb, 'M'), sc, INT).c, n = ex(input(vb, 'N'), sc, INT).c, v = input(vb, 'V');
            if (CPP && decl) { L(`${tn(t)} ${id}(${m}, ${tn(t.el)}(${n}${isZeroLit(v) ? '' : ', ' + ex(v, sc, t.el.el).c}));`); return; }
            if (!CPP && t.arr) {
              L(`${lhs} = new ${tn(t.el.el)}[${m}][${n}];`);
              if (!isZeroLit(v)) L(`for (${tn(t.el)} row : ${id}) Arrays.fill(row, ${ex(v, sc, t.el.el).c});`);
              return;
            }
          }
          if (vt === 'set_from' && decl) {
            const lb = input(vb, 'L'), tl = typeR(lb, sc), l = paren(ex(lb, sc), P.POST);
            if (CPP) { L(`${tn(t)} ${id}(${l}.begin(), ${l}.end());`); return; }
            if (tl.k === 'list' && tl.arr) {
              L(`${tn(t)} ${id} = new HashSet<>();`);
              L(`for (${tn(tl.el)} item : ${l}) ${id}.add(item);`);
              return;
            }
          }
          // Java 的 Arrays.asList 長度固定，存成變數時改用可修改的 ArrayList
          if (!CPP && vt === 'lists_create_with' && t.k === 'list' && !t.arr) {
            L(`${lhs} = new ArrayList<>(${ex(vb, sc, t).c});`);
            return;
          }
          L(`${lhs} = ${ex(vb, sc, t).c};`);
          return;
        }
        case 'math_change': {
          const id = ident(vname(b));
          const db = input(b, 'DELTA');
          const dv = ex(db, sc, INT).c;
          if (dv === '1') L(`${id}++;`);
          else if (dv === '-1') L(`${id}--;`);
          else if (/^-\d/.test(dv)) L(`${id} -= ${dv.slice(1)};`);
          else L(`${id} += ${dv};`);
          return;
        }
        case 'controls_if': {
          let i = 0;
          const branches = [];
          while (b.getInput('IF' + i)) { branches.push(i); i++; }
          const hasElse = !!b.getInput('ELSE');
          if (branches.length === 1 && !hasElse && isJump(input(b, 'DO0'))) {
            const tmp = [];
            emitStmt(input(b, 'DO0'), sc, 0, tmp);
            if (tmp.length === 1) { L(`if (${X('IF0', BOOL).c}) ${tmp[0].trim()}`); return; }
          }
          branches.forEach((k) => {
            L(`${k === 0 ? 'if' : '} else if'} (${X('IF' + k, BOOL).c}) {`);
            block(b, 'DO' + k, sc, d, out);
          });
          if (hasElse) { L('} else {'); block(b, 'ELSE', sc, d, out); }
          L('}');
          return;
        }
        case 'for_range': {
          const name = vname(b), id = ident(name);
          const from = X('FROM', INT).c, to = ex(input(b, 'TO'), sc, INT), step = X('STEP', INT).c;
          const init = sc.loopDecl.has(name) ? `int ${id} = ${from}` : `${id} = ${from}`;
          let cond, upd;
          let toC = parenR(to, P.REL);
          if (CPP && to.sizeT) toC = `(int) ${to.c}`;
          if (/^-?\d+$/.test(step)) {
            const s = Number(step);
            cond = `${id} ${s >= 0 ? '<' : '>'} ${toC}`;
            upd = s === 1 ? `${id}++` : s === -1 ? `${id}--` : s > 0 ? `${id} += ${s}` : `${id} -= ${-s}`;
          } else {
            cond = `(${step} >= 0 ? ${id} < ${toC} : ${id} > ${toC})`;
            upd = `${id} += ${step}`;
          }
          L(`for (${init}; ${cond}; ${upd}) {`);
          block(b, 'DO', sc, d, out);
          L('}');
          return;
        }
        case 'for_each': {
          const name = vname(b), id = ident(name);
          const lb = input(b, 'LIST');
          const t = varT(sc, name);
          const own = sc.loopDecl.has(name);
          const varDecl = own ? id : 'item';
          let head;
          if (lb && lb.type === 'map_list') {
            const m = paren(ex(input(lb, 'M'), sc), P.POST);
            const keys = lb.getFieldValue('WHAT') === 'keys';
            if (CPP) head = keys ? `for (auto& [${varDecl}, ${fresh(sc, ['value', 'val', 'v'])}] : ${m})` : `for (auto& [${fresh(sc, ['key', 'k', 'ky'])}, ${varDecl}] : ${m})`;
            else head = `for (${tn(t)} ${varDecl} : ${m}.${keys ? 'keySet' : 'values'}())`;
          } else {
            const tl = typeR(lb, sc);
            let l = paren(ex(lb, sc), P.POST);
            if (!CPP && tl.k === 'string') l = `${l}.toCharArray()`;
            const declT = CPP ? (isPrim(t) ? tn(t) : `${tn(t)}&`) : tn(t);
            head = `for (${declT} ${varDecl} : ${l})`;
          }
          L(head + ' {');
          if (!own) out.push(IND.repeat(d + 1) + `${id} = item;`);
          block(b, 'DO', sc, d, out);
          L('}');
          return;
        }
        case 'controls_whileUntil': {
          const c = X('BOOL', BOOL);
          L(b.getFieldValue('MODE') === 'WHILE' ? `while (${c.c}) {` : `while (!${paren(c, P.UNARY)}) {`);
          block(b, 'DO', sc, d, out);
          L('}');
          return;
        }
        case 'controls_repeat_ext': {
          const k = fresh(sc, ['i', 'j', 'k', 'rep']);
          L(`for (int ${k} = 0; ${k} < ${parenR(X('TIMES', INT), P.REL)}; ${k}++) {`);
          block(b, 'DO', sc, d, out);
          L('}');
          return;
        }
        case 'controls_flow_statements': L(b.getFieldValue('FLOW') === 'BREAK' ? 'break;' : 'continue;'); return;
        case 'ret_value': {
          const vb = input(b, 'VALUE');
          if (!vb) { L('return;'); return; }
          const want = sc.ret;
          if (CPP && vb.type === 'map_list' && want.k === 'list') {
            const m = paren(ex(input(vb, 'M'), sc), P.POST);
            const keys = vb.getFieldValue('WHAT') === 'keys';
            const kk = fresh(sc, ['key', 'k', 'ky']), vv = fresh(sc, ['value', 'val', 'v']);
            L(`${tn(want)} result;`);
            L(`for (auto& [${kk}, ${vv}] : ${m}) result.push_back(${keys ? kk : vv});`);
            L('return result;');
            return;
          }
          const vt = typeR(vb, sc);
          let e = ex(vb, sc, want).c;
          if (!CPP && want.k === 'list' && want.arr && vt.k === 'list' && !vt.arr && vb.type !== 'lists_create_with') {
            const el = want.el;
            if (el.k === 'int') e = `${paren(ex(vb, sc), P.POST)}.stream().mapToInt(Integer::intValue).toArray()`;
            else if (el.k === 'double') e = `${paren(ex(vb, sc), P.POST)}.stream().mapToDouble(Double::doubleValue).toArray()`;
            else if (el.k === 'list') e = `${paren(ex(vb, sc), P.POST)}.toArray(new ${tn(el.el)}[0][])`;
            else e = `${paren(ex(vb, sc), P.POST)}.toArray(new ${tn(el)}[0])`;
          }
          L(`return ${e};`);
          return;
        }
        case 'print': {
          const t = ty('VALUE');
          const x = X('VALUE').c;
          if (CPP) L(`cout << ${isContainer(t) ? '/* 容器無法直接印出 */ ' + x + '.size()' : x} << endl;`);
          else L(`System.out.println(${t.k === 'list' && t.arr ? `Arrays.toString(${x})` : x});`);
          return;
        }
        case 'arr_set': {
          const ta = ty('ARR');
          const a = paren(X('ARR'), P.POST), i = X('IDX', INT).c, v = X('V', elemOf(ta)).c;
          if (!CPP && ta.k === 'list' && !ta.arr) L(`${a}.set(${i}, ${v});`);
          else L(`${a}[${i}] = ${v};`);
          return;
        }
        case 'arr_push': {
          const ta = ty('ARR');
          L(`${paren(X('ARR'), P.POST)}.${CPP ? 'push_back' : 'add'}(${X('V', elemOf(ta)).c});`);
          return;
        }
        case 'arr_insert': {
          const ta = ty('ARR');
          const a = paren(X('ARR'), P.POST), i = X('IDX', INT);
          L(CPP ? `${a}.insert(${a}.begin() + ${parenR(i, P.ADD)}, ${X('V', elemOf(ta)).c});` : `${a}.add(${i.c}, ${X('V', elemOf(ta)).c});`);
          return;
        }
        case 'arr_pop_stmt': {
          const a = paren(X('ARR'), P.POST);
          const last = b.getFieldValue('END') === 'last';
          if (CPP) L(last ? `${a}.pop_back();` : `${a}.erase(${a}.begin());`);
          else L(last ? `${a}.remove(${a}.size() - 1);` : `${a}.remove(0);`);
          return;
        }
        case 'arr_sort': {
          const ta = ty('ARR');
          const a = paren(X('ARR'), P.POST);
          if (CPP) L(`sort(${a}.begin(), ${a}.end());`);
          else if (ta.arr && ta.el.k === 'list') L(`Arrays.sort(${a}, (x, y) -> Arrays.compare(x, y));`);
          else L(ta.arr ? `Arrays.sort(${a});` : `Collections.sort(${a});`);
          return;
        }
        case 'arr_sort_by': {
          const ta = ty('ARR');
          const a = paren(X('ARR'), P.POST), k = X('K', INT).c;
          if (CPP) L(`sort(${a}.begin(), ${a}.end(), [](const auto& x, const auto& y) { return x[${k}] < y[${k}]; });`);
          else if (ta.arr && ta.el.arr) L(`Arrays.sort(${a}, (x, y) -> Integer.compare(x[${k}], y[${k}]));`);
          else if (ta.arr) L(`Arrays.sort(${a}, (x, y) -> Integer.compare(x.get(${k}), y.get(${k})));`);
          else L(`${a}.sort((x, y) -> Integer.compare(x.get(${k}), y.get(${k})));`);
          return;
        }
        case 'arr_reverse': {
          const ta = ty('ARR');
          const a = paren(X('ARR'), P.POST);
          if (CPP) L(`reverse(${a}.begin(), ${a}.end());`);
          else if (ta.arr) {
            const i = fresh(sc, ['i', 'lo']), j = fresh(sc, ['j', 'hi']);
            L(`for (int ${i} = 0, ${j} = ${a}.length - 1; ${i} < ${j}; ${i}++, ${j}--) { ${tn(ta.el)} tmp = ${a}[${i}]; ${a}[${i}] = ${a}[${j}]; ${a}[${j}] = tmp; }`);
          } else L(`Collections.reverse(${a});`);
          return;
        }
        case 'map_set': {
          const tm = ty('M');
          const m = paren(X('M'), P.POST), k = X('K', tm.key).c;
          const vb = input(b, 'V');
          if (CPP && vb && vb.type === 'math_arithmetic' && ['ADD', 'MINUS'].includes(vb.getFieldValue('OP'))) {
            const a = input(vb, 'A');
            const sameKey = a && (a.type === 'map_get' || (a.type === 'map_get_default' && isZeroLit(input(a, 'D')))) &&
              ex(input(a, 'M'), sc).c === X('M').c && ex(input(a, 'K'), sc, tm.key).c === k;
            if (sameKey) {
              const amt = ex(input(vb, 'B'), sc, INT).c;
              const plus = vb.getFieldValue('OP') === 'ADD';
              L(amt === '1' ? `${m}[${k}]${plus ? '++' : '--'};` : `${m}[${k}] ${plus ? '+=' : '-='} ${amt};`);
              return;
            }
          }
          const v = ex(vb, sc, tm.val).c;
          L(CPP ? `${m}[${k}] = ${v};` : `${m}.put(${k}, ${v});`);
          return;
        }
        case 'map_delete': L(`${paren(X('M'), P.POST)}.${CPP ? 'erase' : 'remove'}(${X('K', ty('M').key).c});`); return;
        case 'set_add': L(`${paren(X('S'), P.POST)}.${CPP ? 'insert' : 'add'}(${X('V', ty('S').el).c});`); return;
        case 'set_delete': L(`${paren(X('S'), P.POST)}.${CPP ? 'erase' : 'remove'}(${X('V', ty('S').el).c});`); return;
        case 'heap_push': L(`${paren(X('H'), P.POST)}.${CPP ? 'push' : 'offer'}(${X('V', ty('H').el).c});`); return;
        case 'heap_pop_stmt': L(`${paren(X('H'), P.POST)}.${CPP ? 'pop' : 'poll'}();`); return;
        case 'node_set': {
          const tn0 = ty('N');
          L(`${paren(X('N'), P.POST)}${ARROW}${b.getFieldValue('F')} = ${X('V', fieldType(tn0.kind, b.getFieldValue('F'))).c};`);
          return;
        }
        case 'procedures_callnoreturn': L(callExpr(b, sc).c + ';'); return;
        default:
      }
    }

    function fnDefault(t) {
      if (CPP) return '{}';
      if (t.k === 'list') return t.arr ? `new ${tn(t.el)}[0]` : 'new ArrayList<>()';
      return defaultVal(t) || 'null';
    }
    // 呼叫時直接傳「新建的容器」的參數，C++ 不能用參考 (&) 接，改成傳值
    const FRESH = ['set_new', 'map_new', 'arr_new_empty', 'lists_create_with', 'arr_new_fill', 'arr_new_2d', 'set_from', 'arr_copy', 'str_split', 'heap_new'];
    const byValue = new Set();
    scopes.forEach((s) => s.blocks.forEach((b) => {
      if (!/^procedures_call/.test(b.type)) return;
      const c = procs.get(b.getFieldValue('NAME'));
      if (c) c.params.forEach((n, i) => { const a = input(b, 'ARG' + i); if (a && FRESH.includes(a.type)) byValue.add(c.name + ':' + n); });
    }));
    function emitFunction(sc, d, out) {
      const params = [...captured(sc).map((n) => paramDecl(resolve(outerOf(sc).env.get(n) || U), ident(n))),
        ...sc.params.map((n) => (CPP && byValue.has(sc.name + ':' + n) ? `${tn(varT(sc, n))} ${ident(n)}` : paramDecl(varT(sc, n), ident(n))))];
      let head;
      if (sc.isCtor) head = `${p.design.cls}(${params.join(', ')})`;
      else head = `${tn(sc.ret)} ${ident(sc.name)}(${params.join(', ')})`;
      out.push(IND.repeat(d) + (CPP ? head : (sc.isEntry ? 'public ' : 'private ') + head) + ' {');
      const n = emitList(sc.body, 'root', sc, d + 1, out);
      if (sc.retExpr) {
        (sc.declBefore.get('root#' + n) || []).forEach((v) => out.push(IND.repeat(d + 1) + `${tn(varT(sc, v))} ${ident(v)};`));
        out.push(IND.repeat(d + 1) + `return ${ex(sc.retExpr, sc, sc.ret).c};`);
      } else if (sc.ret && sc.ret.k !== 'void') {
        let last = sc.body;
        while (last && last.getNextBlock()) last = last.getNextBlock();
        if (!last || last.type !== 'ret_value') out.push(IND.repeat(d + 1) + `return ${fnDefault(sc.ret)};`);
      }
      out.push(IND.repeat(d) + '}');
    }

    const body = [];
    const clsName = p.design ? p.design.cls : 'Solution';
    body.push(`class ${clsName} {`);
    if (CPP) body.push('public:');
    if (p.design && fields.size) {
      [...fields].forEach((n) => body.push(IND + (CPP ? '' : 'private ') + `${tn(resolve(cls.env.get(n) || U))} ${ident(n)};`));
      body.push('');
    }
    scopes.filter((s) => s.isEntry).forEach((sc, i) => { if (i) body.push(''); emitFunction(sc, 1, body); });
    scopes.filter((s) => !s.isEntry).forEach((sc) => { body.push(''); emitFunction(sc, 1, body); });
    body.push(CPP ? '};' : '}');

    // 自己定義的節點類別（LeetCode 沒提供的）
    const structs = [];
    if (usedKinds.has('TrieNode')) {
      structs.push(CPP
        ? 'struct TrieNode {\n    unordered_map<char, TrieNode*> children;\n    bool isEnd = false;\n};'
        : 'class TrieNode {\n    Map<Character, TrieNode> children = new HashMap<>();\n    boolean isEnd = false;\n}');
    }
    if (usedKinds.has('DListNode')) {
      structs.push(CPP
        ? 'struct DListNode {\n    int key = 0, val = 0;\n    DListNode* prev = nullptr;\n    DListNode* next = nullptr;\n    DListNode(int v) : val(v) {}\n};'
        : 'class DListNode {\n    int key, val;\n    DListNode prev, next;\n    DListNode(int v) { val = v; }\n}');
    }
    let code = (CPP && structs.length ? structs.join('\n\n') + '\n\n' : '') + body.join('\n') + '\n' + (!CPP && structs.length ? '\n' + structs.join('\n\n') + '\n' : '');
    if (!CPP) code = 'import java.util.*;\n' + (uses.has('stream') ? 'import java.util.stream.*;\n' : '') + '\n' + code;
    return code;
  }

  root.Typed = { translate, signature, SIGS };
})(typeof window !== 'undefined' ? window : globalThis);
