// 每題的參考解答（積木版）。用一個小型 DSL 描述，再轉成 Blockly 的 JSON 格式載入工作區。
// 慣例：數字 → 數字積木、字串 → 變數、文字常數要用 str('...')、true/false → 布林積木。
(function (root) {
  const vid = (n) => 'v_' + n;

  function chain(list) {
    const arr = [list].flat(Infinity).filter(Boolean);
    for (let i = 0; i < arr.length - 1; i++) arr[i].next = { block: arr[i + 1] };
    return arr[0] || null;
  }
  function lit(x) {
    if (x === undefined || x === null) return null;
    if (typeof x === 'number') return num(x);
    if (typeof x === 'string') return v(x);
    if (typeof x === 'boolean') return B('logic_boolean', { BOOL: x ? 'TRUE' : 'FALSE' });
    return x;
  }
  function B(type, fields, inputs, extra) {
    const b = { type };
    if (fields) b.fields = fields;
    if (inputs) {
      const ins = {};
      for (const [k, val] of Object.entries(inputs)) {
        const blk = Array.isArray(val) ? chain(val) : lit(val);
        if (blk) ins[k] = { block: blk };
      }
      if (Object.keys(ins).length) b.inputs = ins;
    }
    return Object.assign(b, extra || {});
  }

  // ---------- 值 ----------
  const num = (x) => B('math_number', { NUM: x });
  const str = (x) => B('text', { TEXT: x });
  const NULL = () => B('logic_null');
  const INF = () => B('math_constant', { CONSTANT: 'INFINITY' });
  const v = (n) => B('variables_get', { VAR: { id: vid(n) } });

  const ARITH = { '+': 'ADD', '-': 'MINUS', '*': 'MULTIPLY', '/': 'DIVIDE' };
  const CMP = { '==': 'EQ', '!=': 'NEQ', '<': 'LT', '<=': 'LTE', '>': 'GT', '>=': 'GTE' };
  const BITS = ['&', '|', '^', '<<', '>>', '>>>'];
  function o(a, op, b) {
    if (ARITH[op]) return B('math_arithmetic', { OP: ARITH[op] }, { A: a, B: b });
    if (CMP[op]) return B('logic_compare', { OP: CMP[op] }, { A: a, B: b });
    if (op === 'and' || op === 'or') return B('logic_operation', { OP: op.toUpperCase() }, { A: a, B: b });
    if (op === '%') return B('math_modulo', null, { DIVIDEND: a, DIVISOR: b });
    if (op === '//') return B('math_intdiv', null, { A: a, B: b });
    if (BITS.includes(op)) return B('math_bit', { OP: op }, { A: a, B: b });
    throw new Error('unknown op ' + op);
  }
  const not = (x) => B('logic_negate', null, { BOOL: x });
  const isNull = (x) => B('is_null', null, { X: x });
  const tern = (c, a, b) => B('logic_ternary', null, { IF: c, THEN: a, ELSE: b });
  const max = (a, b) => B('math_minmax', { OP: 'max' }, { A: a, B: b });
  const min = (a, b) => B('math_minmax', { OP: 'min' }, { A: a, B: b });
  const toNum = (x) => B('to_number', null, { X: x });

  // ---------- 敘述 ----------
  const set = (n, x) => B('variables_set', { VAR: { id: vid(n) } }, { VALUE: x });
  const inc = (n, d) => B('math_change', { VAR: { id: vid(n) } }, { DELTA: d });
  const Ret = (x) => B('ret_value', null, x === undefined ? null : { VALUE: x });
  const If = (c, then, els) => B('controls_if', null, { IF0: c, DO0: [then], ...(els ? { ELSE: [els] } : {}) }, els ? { extraState: { hasElse: true } } : undefined);
  function IfChain(pairs, els) {
    const inputs = {};
    pairs.forEach(([c, s], i) => { inputs['IF' + i] = c; inputs['DO' + i] = [s]; });
    if (els) inputs.ELSE = [els];
    return B('controls_if', null, inputs, { extraState: { elseIfCount: pairs.length - 1, hasElse: !!els } });
  }
  const For = (n, from, to, step, body) => B('for_range', { VAR: { id: vid(n) } }, { FROM: from, TO: to, STEP: step, DO: [body] });
  const Each = (n, list, body) => B('for_each', { VAR: { id: vid(n) } }, { LIST: list, DO: [body] });
  const While = (c, body) => B('controls_whileUntil', { MODE: 'WHILE' }, { BOOL: c, DO: [body] });
  const Repeat = (t, body) => B('controls_repeat_ext', null, { TIMES: t, DO: [body] });
  const Continue = () => B('controls_flow_statements', { FLOW: 'CONTINUE' });

  // ---------- 資料結構 ----------
  const at = (a, i) => B('arr_get', null, { ARR: a, IDX: i });
  const setAt = (a, i, x) => B('arr_set', null, { ARR: a, IDX: i, V: x });
  const len = (a) => B('arr_len', null, { ARR: a });
  const push = (a, x) => B('arr_push', null, { V: x, ARR: a });
  const pop = (a) => B('arr_pop', { END: 'last' }, { ARR: a });
  const last = (a) => B('arr_last', null, { ARR: a });
  const popStmt = (a) => B('arr_pop_stmt', { END: 'last' }, { ARR: a });
  const isEmpty = (a) => B('arr_is_empty', null, { ARR: a });
  const empty = () => B('arr_new_empty');
  const list = (...xs) => B('lists_create_with', null, Object.fromEntries(xs.map((x, i) => ['ADD' + i, x])), { extraState: { itemCount: xs.length } });
  const fill = (n, x) => B('arr_new_fill', null, { N: n, V: x });
  const grid = (m, n, x) => B('arr_new_2d', null, { M: m, N: n, V: x });
  const sort = (a) => B('arr_sort', null, { ARR: a });
  const slice = (a, s, e) => B('str_slice', null, { ARR: a, S: s, E: e });
  const lower = (s) => B('str_lower', null, { S: s });
  const alnum = (c) => B('is_alnum', null, { C: c });
  const sortChars = (s) => B('str_sort_chars', null, { S: s });
  const mapNew = () => B('map_new');
  const mset = (m, k, x) => B('map_set', null, { M: m, K: k, V: x });
  const mget = (m, k) => B('map_get', null, { M: m, K: k });
  const mgetd = (m, k, d) => B('map_get_default', null, { M: m, K: k, D: d });
  const mhas = (m, k) => B('map_has', null, { M: m, K: k });
  const mkeys = (m) => B('map_list', { WHAT: 'keys' }, { M: m });
  const mvals = (m) => B('map_list', { WHAT: 'values' }, { M: m });
  const setFrom = (l) => B('set_from', null, { L: l });
  const setNew = () => B('set_new');
  const sadd = (s, x) => B('set_add', null, { V: x, S: s });
  const shas = (s, x) => B('set_has', null, { S: s, V: x });
  const nget = (n, f) => B('node_get', { F: f }, { N: n });
  const nset = (n, f, x) => B('node_set', { F: f }, { N: n, V: x });
  const newNode = (x, kind) => B('node_new', { KIND: kind || 'ListNode' }, { V: x === undefined ? 0 : x });
  const popFirst = (a) => B('arr_pop', { END: 'first' }, { ARR: a });
  const popFirstStmt = (a) => B('arr_pop_stmt', { END: 'first' }, { ARR: a });
  const sortBy = (a, k) => B('arr_sort_by', null, { ARR: a, K: k });
  const reverse = (a) => B('arr_reverse', null, { ARR: a });
  const copy = (a) => B('arr_copy', null, { ARR: a });
  const insert = (a, i, x) => B('arr_insert', null, { ARR: a, IDX: i, V: x });
  const digit = (c) => B('char_code', { WHAT: 'digit' }, { C: c });
  const letterIdx = (c) => B('char_code', { WHAT: 'letter' }, { C: c });
  const charCode = (c) => B('char_code', { WHAT: 'code' }, { C: c });
  const letter = (n) => B('char_from', { WHAT: 'letter' }, { N: n });
  const digitChar = (n) => B('char_from', { WHAT: 'digit' }, { N: n });
  const split = (x, sep) => B('str_split', null, { S: x, SEP: sep });
  const join = (a, sep) => B('str_join', null, { ARR: a, SEP: sep });
  const repeat = (x, n) => B('str_repeat', null, { S: x, N: n });
  const concat = (a, b) => B('str_concat', null, { A: a, B: b });
  const rand = (n) => B('random_int', null, { N: n });
  const heapNew = (kind) => B('heap_new', { KIND: kind || 'min' });
  const hpush = (h, x) => B('heap_push', null, { V: x, H: h });
  const hpop = (h) => B('heap_pop', null, { H: h });
  const hpopStmt = (h) => B('heap_pop_stmt', null, { H: h });
  const hpeek = (h) => B('heap_peek', null, { H: h });
  const hsize = (h) => B('heap_size', null, { H: h });
  const mapDel = (m, k) => B('map_delete', null, { M: m, K: k });
  const msize = (m) => B('map_size', null, { M: m });
  const sdel = (s, x) => B('set_delete', null, { S: s, V: x });
  const ssize = (s) => B('set_size', null, { S: s });
  const abs = (x) => B('math_single', { OP: 'ABS' }, { NUM: x });
  const print = (x) => B('print', null, { VALUE: x });
  const Break = () => B('controls_flow_statements', { FLOW: 'BREAK' });
  const neg = (x) => o(0, '-', x);

  // ---------- 函式 ----------
  const params = (ps) => ps.map((p) => ({ name: p, id: vid(p) }));
  const args = (xs) => Object.fromEntries(xs.map((x, i) => ['ARG' + i, x]));
  const defRet = (name, ps, body, ret) => B('procedures_defreturn', { NAME: name }, { STACK: [body], RETURN: ret }, { extraState: { params: params(ps) } });
  const def = (name, ps, body) => B('procedures_defnoreturn', { NAME: name }, { STACK: [body] }, { extraState: { params: params(ps) } });
  const callR = (name, ps, xs) => B('procedures_callreturn', null, args(xs), { extraState: { name, params: ps } });
  const call = (name, ps, xs) => B('procedures_callnoreturn', null, args(xs), { extraState: { name, params: ps } });

  const S = {};

  // ===================== 陣列 / 雜湊 =====================
  S['two-sum'] = { body: [
    set('seen', mapNew()),
    For('i', 0, len('nums'), 1, [
      set('need', o('target', '-', at('nums', 'i'))),
      If(mhas('seen', 'need'), Ret(list(mget('seen', 'need'), 'i'))),
      mset('seen', at('nums', 'i'), 'i'),
    ]),
  ] };

  S['contains-duplicate'] = { body: [
    set('seen', setNew()),
    Each('x', 'nums', [
      If(shas('seen', 'x'), Ret(true)),
      sadd('seen', 'x'),
    ]),
    Ret(false),
  ] };

  S['valid-anagram'] = { body: [
    If(o(len('s'), '!=', len('t')), Ret(false)),
    set('count', mapNew()),
    For('i', 0, len('s'), 1, [
      mset('count', at('s', 'i'), o(mgetd('count', at('s', 'i'), 0), '+', 1)),
      mset('count', at('t', 'i'), o(mgetd('count', at('t', 'i'), 0), '-', 1)),
    ]),
    Each('c', mvals('count'), If(o('c', '!=', 0), Ret(false))),
    Ret(true),
  ] };

  S['ransom-note'] = { body: [
    set('stock', mapNew()),
    Each('c', 'magazine', mset('stock', 'c', o(mgetd('stock', 'c', 0), '+', 1))),
    Each('c', 'ransomNote', [
      If(o(mgetd('stock', 'c', 0), '==', 0), Ret(false)),
      mset('stock', 'c', o(mget('stock', 'c'), '-', 1)),
    ]),
    Ret(true),
  ] };

  S['majority-element'] = { body: [
    set('candidate', 0),
    set('votes', 0),
    Each('x', 'nums', [
      If(o('votes', '==', 0), set('candidate', 'x')),
      If(o('x', '==', 'candidate'), inc('votes', 1), inc('votes', -1)),
    ]),
    Ret('candidate'),
  ] };

  S['longest-consecutive'] = { body: [
    set('s', setFrom('nums')),
    set('best', 0),
    Each('x', 's', If(not(shas('s', o('x', '-', 1))), [
      set('run', 1),
      While(shas('s', o('x', '+', 'run')), inc('run', 1)),
      set('best', max('best', 'run')),
    ])),
    Ret('best'),
  ] };

  S['group-anagrams'] = { body: [
    set('groups', mapNew()),
    Each('w', 'strs', [
      set('key', sortChars('w')),
      If(not(mhas('groups', 'key')), mset('groups', 'key', empty())),
      push(mget('groups', 'key'), 'w'),
    ]),
    Ret(mvals('groups')),
  ] };

  S['top-k-frequent'] = { body: [
    set('count', mapNew()),
    Each('x', 'nums', mset('count', 'x', o(mgetd('count', 'x', 0), '+', 1))),
    set('bucket', fill(o(len('nums'), '+', 1), empty())),
    Each('x', mkeys('count'), push(at('bucket', mget('count', 'x')), 'x')),
    set('res', empty()),
    For('f', len('nums'), -1, -1, Each('x', at('bucket', 'f'), [
      push('res', 'x'),
      If(o(len('res'), '==', 'k'), Ret('res')),
    ])),
    Ret('res'),
  ] };

  S['product-except-self'] = { body: [
    set('ans', fill(len('nums'), 1)),
    set('left', 1),
    For('i', 0, len('nums'), 1, [
      setAt('ans', 'i', 'left'),
      set('left', o('left', '*', at('nums', 'i'))),
    ]),
    set('right', 1),
    For('i', o(len('nums'), '-', 1), -1, -1, [
      setAt('ans', 'i', o(at('ans', 'i'), '*', 'right')),
      set('right', o('right', '*', at('nums', 'i'))),
    ]),
    Ret('ans'),
  ] };

  // ===================== 雙指標 =====================
  S['valid-palindrome'] = { body: [
    set('l', 0),
    set('r', o(len('s'), '-', 1)),
    While(o('l', '<', 'r'), [
      If(not(alnum(at('s', 'l'))), [inc('l', 1), Continue()]),
      If(not(alnum(at('s', 'r'))), [inc('r', -1), Continue()]),
      If(o(lower(at('s', 'l')), '!=', lower(at('s', 'r'))), Ret(false)),
      inc('l', 1),
      inc('r', -1),
    ]),
    Ret(true),
  ] };

  S['is-subsequence'] = { body: [
    set('i', 0),
    For('j', 0, len('t'), 1,
      If(o(o('i', '<', len('s')), 'and', o(at('s', 'i'), '==', at('t', 'j'))), inc('i', 1))),
    Ret(o('i', '==', len('s'))),
  ] };

  S['two-sum-ii'] = { body: [
    set('l', 0),
    set('r', o(len('numbers'), '-', 1)),
    While(o('l', '<', 'r'), [
      set('total', o(at('numbers', 'l'), '+', at('numbers', 'r'))),
      If(o('total', '==', 'target'), Ret(list(o('l', '+', 1), o('r', '+', 1)))),
      If(o('total', '<', 'target'), inc('l', 1), inc('r', -1)),
    ]),
    Ret(list(-1, -1)),
  ] };

  S['container-most-water'] = { body: [
    set('l', 0),
    set('r', o(len('height'), '-', 1)),
    set('best', 0),
    While(o('l', '<', 'r'), [
      set('best', max('best', o(o('r', '-', 'l'), '*', min(at('height', 'l'), at('height', 'r'))))),
      If(o(at('height', 'l'), '<', at('height', 'r')), inc('l', 1), inc('r', -1)),
    ]),
    Ret('best'),
  ] };

  S['three-sum'] = { body: [
    sort('nums'),
    set('res', empty()),
    For('i', 0, len('nums'), 1, [
      If(o(o('i', '>', 0), 'and', o(at('nums', 'i'), '==', at('nums', o('i', '-', 1)))), Continue()),
      set('l', o('i', '+', 1)),
      set('r', o(len('nums'), '-', 1)),
      While(o('l', '<', 'r'), [
        set('total', o(o(at('nums', 'i'), '+', at('nums', 'l')), '+', at('nums', 'r'))),
        IfChain([
          [o('total', '<', 0), inc('l', 1)],
          [o('total', '>', 0), inc('r', -1)],
        ], [
          push('res', list(at('nums', 'i'), at('nums', 'l'), at('nums', 'r'))),
          inc('l', 1),
          inc('r', -1),
          While(o(o('l', '<', 'r'), 'and', o(at('nums', 'l'), '==', at('nums', o('l', '-', 1)))), inc('l', 1)),
        ]),
      ]),
    ]),
    Ret('res'),
  ] };

  S['merge-sorted-array'] = { body: [
    set('i', o('m', '-', 1)),
    set('j', o('n', '-', 1)),
    set('k', o(o('m', '+', 'n'), '-', 1)),
    While(o('j', '>=', 0), [
      If(o(o('i', '>=', 0), 'and', o(at('nums1', 'i'), '>', at('nums2', 'j'))),
        [setAt('nums1', 'k', at('nums1', 'i')), inc('i', -1)],
        [setAt('nums1', 'k', at('nums2', 'j')), inc('j', -1)]),
      inc('k', -1),
    ]),
  ] };

  // ===================== 貪婪 / 滑動視窗 =====================
  S['best-time-stock'] = { body: [
    set('minPrice', INF()),
    set('best', 0),
    Each('p', 'prices', [
      set('minPrice', min('minPrice', 'p')),
      set('best', max('best', o('p', '-', 'minPrice'))),
    ]),
    Ret('best'),
  ] };

  S['jump-game'] = { body: [
    set('reach', 0),
    For('i', 0, len('nums'), 1, [
      If(o('i', '>', 'reach'), Ret(false)),
      set('reach', max('reach', o('i', '+', at('nums', 'i')))),
    ]),
    Ret(true),
  ] };

  S['longest-substring'] = { body: [
    set('lastSeen', mapNew()),
    set('left', 0),
    set('best', 0),
    For('r', 0, len('s'), 1, [
      set('c', at('s', 'r')),
      If(o(mhas('lastSeen', 'c'), 'and', o(mget('lastSeen', 'c'), '>=', 'left')),
        set('left', o(mget('lastSeen', 'c'), '+', 1))),
      mset('lastSeen', 'c', 'r'),
      set('best', max('best', o(o('r', '-', 'left'), '+', 1))),
    ]),
    Ret('best'),
  ] };

  // ===================== 堆疊 =====================
  S['valid-parentheses'] = { body: [
    set('pair', mapNew()),
    mset('pair', str(')'), str('(')),
    mset('pair', str(']'), str('[')),
    mset('pair', str('}'), str('{')),
    set('stack', empty()),
    Each('c', 's', If(not(mhas('pair', 'c')),
      push('stack', 'c'),
      [
        If(o(isEmpty('stack'), 'or', o(last('stack'), '!=', mget('pair', 'c'))), Ret(false)),
        popStmt('stack'),
      ])),
    Ret(isEmpty('stack')),
  ] };

  const isOp = o(o(o(o('t', '==', str('+')), 'or', o('t', '==', str('-'))), 'or', o('t', '==', str('*'))), 'or', o('t', '==', str('/')));
  S['eval-rpn'] = { body: [
    set('stack', empty()),
    Each('t', 'tokens', If(isOp, [
      set('b', pop('stack')),
      set('a', pop('stack')),
      IfChain([
        [o('t', '==', str('+')), push('stack', o('a', '+', 'b'))],
        [o('t', '==', str('-')), push('stack', o('a', '-', 'b'))],
        [o('t', '==', str('*')), push('stack', o('a', '*', 'b'))],
      ], push('stack', o('a', '//', 'b'))),
    ], push('stack', toNum('t')))),
    Ret(last('stack')),
  ] };

  // ===================== 二分搜尋 =====================
  S['find-min-rotated'] = { body: [
    set('l', 0),
    set('r', o(len('nums'), '-', 1)),
    While(o('l', '<', 'r'), [
      set('mid', o(o('l', '+', 'r'), '//', 2)),
      If(o(at('nums', 'mid'), '>', at('nums', 'r')), set('l', o('mid', '+', 1)), set('r', 'mid')),
    ]),
    Ret(at('nums', 'l')),
  ] };

  S['search-rotated'] = { body: [
    set('l', 0),
    set('r', o(len('nums'), '-', 1)),
    While(o('l', '<=', 'r'), [
      set('mid', o(o('l', '+', 'r'), '//', 2)),
      If(o(at('nums', 'mid'), '==', 'target'), Ret('mid')),
      If(o(at('nums', 'l'), '<=', at('nums', 'mid')),
        If(o(o(at('nums', 'l'), '<=', 'target'), 'and', o('target', '<', at('nums', 'mid'))),
          set('r', o('mid', '-', 1)), set('l', o('mid', '+', 1))),
        If(o(o(at('nums', 'mid'), '<', 'target'), 'and', o('target', '<=', at('nums', 'r'))),
          set('l', o('mid', '+', 1)), set('r', o('mid', '-', 1)))),
    ]),
    Ret(-1),
  ] };

  // ===================== 鏈結串列 =====================
  S['reverse-linked-list'] = { body: [
    set('prev', NULL()),
    set('cur', 'head'),
    While(not(isNull('cur')), [
      set('nxt', nget('cur', 'next')),
      nset('cur', 'next', 'prev'),
      set('prev', 'cur'),
      set('cur', 'nxt'),
    ]),
    Ret('prev'),
  ] };

  S['merge-two-lists'] = { body: [
    set('dummy', newNode(0)),
    set('tail', 'dummy'),
    While(o(not(isNull('list1')), 'and', not(isNull('list2'))), [
      If(o(nget('list1', 'val'), '<=', nget('list2', 'val')),
        [nset('tail', 'next', 'list1'), set('list1', nget('list1', 'next'))],
        [nset('tail', 'next', 'list2'), set('list2', nget('list2', 'next'))]),
      set('tail', nget('tail', 'next')),
    ]),
    nset('tail', 'next', tern(not(isNull('list1')), 'list1', 'list2')),
    Ret(nget('dummy', 'next')),
  ] };

  S['linked-list-cycle'] = { body: [
    set('slow', 'head'),
    set('fast', 'head'),
    While(o(not(isNull('fast')), 'and', not(isNull(nget('fast', 'next')))), [
      set('slow', nget('slow', 'next')),
      set('fast', nget(nget('fast', 'next'), 'next')),
      If(o('slow', '==', 'fast'), Ret(true)),
    ]),
    Ret(false),
  ] };

  // ===================== 樹 =====================
  S['max-depth-tree'] = {
    helpers: [defRet('depth', ['node'], [
      If(isNull('node'), Ret(0)),
      set('l', callR('depth', ['node'], [nget('node', 'left')])),
      set('r', callR('depth', ['node'], [nget('node', 'right')])),
    ], o(max('l', 'r'), '+', 1))],
    body: [Ret(callR('depth', ['node'], ['root']))],
  };

  S['invert-tree'] = {
    helpers: [def('flip', ['node'], [
      If(isNull('node'), Ret()),
      set('tmp', nget('node', 'left')),
      nset('node', 'left', nget('node', 'right')),
      nset('node', 'right', 'tmp'),
      call('flip', ['node'], [nget('node', 'left')]),
      call('flip', ['node'], [nget('node', 'right')]),
    ])],
    body: [call('flip', ['node'], ['root']), Ret('root')],
  };

  S['same-tree'] = {
    helpers: [defRet('same', ['a', 'b'], [
      If(o(isNull('a'), 'and', isNull('b')), Ret(true)),
      If(o(isNull('a'), 'or', isNull('b')), Ret(false)),
      If(o(nget('a', 'val'), '!=', nget('b', 'val')), Ret(false)),
    ], o(callR('same', ['a', 'b'], [nget('a', 'left'), nget('b', 'left')]), 'and', callR('same', ['a', 'b'], [nget('a', 'right'), nget('b', 'right')])))],
    body: [Ret(callR('same', ['a', 'b'], ['p', 'q']))],
  };

  // ===================== 圖 =====================
  const sink = (r, c) => call('sink', ['r', 'c'], [r, c]);
  S['number-of-islands'] = {
    helpers: [def('sink', ['r', 'c'], [
      If(o(o(o('r', '<', 0), 'or', o('c', '<', 0)), 'or', o(o('r', '>=', len('grid')), 'or', o('c', '>=', len(at('grid', 0))))), Ret()),
      If(o(at(at('grid', 'r'), 'c'), '!=', str('1')), Ret()),
      setAt(at('grid', 'r'), 'c', str('0')),
      sink(o('r', '+', 1), 'c'),
      sink(o('r', '-', 1), 'c'),
      sink('r', o('c', '+', 1)),
      sink('r', o('c', '-', 1)),
    ])],
    body: [
      set('count', 0),
      For('i', 0, len('grid'), 1, For('j', 0, len(at('grid', 0)), 1,
        If(o(at(at('grid', 'i'), 'j'), '==', str('1')), [inc('count', 1), sink('i', 'j')]))),
      Ret('count'),
    ],
  };

  // ===================== 動態規劃 =====================
  S['climbing-stairs'] = { body: [
    set('a', 1),
    set('b', 1),
    Repeat(o('n', '-', 1), [
      set('c', o('a', '+', 'b')),
      set('a', 'b'),
      set('b', 'c'),
    ]),
    Ret('b'),
  ] };

  S['house-robber'] = { body: [
    set('prev2', 0),
    set('prev1', 0),
    Each('x', 'nums', [
      set('cur', max('prev1', o('prev2', '+', 'x'))),
      set('prev2', 'prev1'),
      set('prev1', 'cur'),
    ]),
    Ret('prev1'),
  ] };

  S['maximum-subarray'] = { body: [
    set('cur', at('nums', 0)),
    set('best', at('nums', 0)),
    For('i', 1, len('nums'), 1, [
      set('cur', max(at('nums', 'i'), o('cur', '+', at('nums', 'i')))),
      set('best', max('best', 'cur')),
    ]),
    Ret('best'),
  ] };

  S['coin-change'] = { body: [
    set('dp', fill(o('amount', '+', 1), INF())),
    setAt('dp', 0, 0),
    For('a', 1, o('amount', '+', 1), 1, Each('c', 'coins',
      If(o('c', '<=', 'a'), setAt('dp', 'a', min(at('dp', 'a'), o(at('dp', o('a', '-', 'c')), '+', 1)))))),
    Ret(tern(o(at('dp', 'amount'), '==', INF()), num(-1), at('dp', 'amount'))),
  ] };

  S['unique-paths'] = { body: [
    set('dp', grid('m', 'n', 1)),
    For('r', 1, 'm', 1, For('c', 1, 'n', 1,
      setAt(at('dp', 'r'), 'c', o(at(at('dp', o('r', '-', 1)), 'c'), '+', at(at('dp', 'r'), o('c', '-', 1)))))),
    Ret(at(at('dp', o('m', '-', 1)), o('n', '-', 1))),
  ] };

  // ===================== 位元 / 數學 / 字串 =====================
  S['missing-number'] = { body: [
    set('size', len('nums')),
    set('total', o(o('size', '*', o('size', '+', 1)), '//', 2)),
    Each('x', 'nums', set('total', o('total', '-', 'x'))),
    Ret('total'),
  ] };

  S['single-number'] = { body: [
    set('res', 0),
    Each('x', 'nums', set('res', o('res', '^', 'x'))),
    Ret('res'),
  ] };

  S['number-of-1-bits'] = { body: [
    set('count', 0),
    While(o('n', '>', 0), [
      set('count', o('count', '+', o('n', '&', 1))),
      set('n', o('n', '>>', 1)),
    ]),
    Ret('count'),
  ] };

  S['longest-common-prefix'] = { body: [
    set('first', at('strs', 0)),
    For('i', 0, len('first'), 1, Each('w', 'strs',
      If(o(o('i', '>=', len('w')), 'or', o(at('w', 'i'), '!=', at('first', 'i'))), Ret(slice('first', 0, 'i'))))),
    Ret('first'),
  ] };

  // ---------- 轉成 Blockly 工作區 JSON ----------
  function collectVars(node, out) {
    if (Array.isArray(node)) { node.forEach((n) => collectVars(n, out)); return; }
    if (!node || typeof node !== 'object') return;
    for (const [k, val] of Object.entries(node)) {
      if (k === 'VAR' && val && typeof val.id === 'string') out.add(val.id.slice(2));
      else if (k === 'params' && Array.isArray(val) && val[0] && val[0].id) val.forEach((p) => out.add(p.name));
      else collectVars(val, out);
    }
  }
  function toWorkspace(p) {
    const sol = S[p.id];
    if (!sol) return null;
    const roots = p.design
      ? p.design.methods.map((m) => B('method_root', null, { BODY: (sol.methods && sol.methods[m.name]) || [] }, { data: m.name, x: 30, y: 30 }))
      : [B('solution_root', null, { BODY: sol.body }, { x: 30, y: 30 })];
    const helpers = (sol.helpers || []).map((h, i) => Object.assign(h, { x: 620, y: 30 + i * 380 }));
    const blocks = [...helpers, ...roots];
    const names = new Set(p.design ? p.design.methods.flatMap((m) => m.params) : p.params);
    collectVars(JSON.parse(JSON.stringify(blocks)), names);
    return {
      variables: [...names].map((n) => ({ name: n, id: vid(n) })),
      blocks: { languageVersion: 0, blocks: JSON.parse(JSON.stringify(blocks)) },
    };
  }

  const dsl = { B, chain, lit, num, str, NULL, INF, v, o, not, isNull, tern, max, min, toNum, set, inc, Ret, If, IfChain, For, Each, While, Repeat, Continue, Break,
    at, setAt, len, push, pop, popStmt, popFirst, popFirstStmt, last, isEmpty, empty, list, fill, grid, sort, sortBy, reverse, copy, insert, slice,
    lower, alnum, sortChars, digit, letterIdx, charCode, letter, digitChar, split, join, repeat, concat, rand,
    mapNew, mset, mget, mgetd, mhas, mkeys, mvals, mapDel, msize, setFrom, setNew, sadd, shas, sdel, ssize,
    nget, nset, newNode, heapNew, hpush, hpop, hpopStmt, hpeek, hsize, abs, print, neg, defRet, def, callR, call };
  root.Solutions = { has: (id) => !!S[id], toWorkspace, add: (id, sol) => { S[id] = sol; }, dsl };
})(typeof window !== 'undefined' ? window : globalThis);
