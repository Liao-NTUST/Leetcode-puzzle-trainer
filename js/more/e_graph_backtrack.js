// 第 E 批：圖 / 字典樹 / 回溯
(function () {
  const { set, inc, Ret, If, IfChain, For, Each, While, Continue, Break, at, setAt, len, push, popStmt, popFirst, isEmpty, empty, list, fill, grid, copy, slice,
    concat, letter, digit, mapNew, mset, mget, mgetd, mhas, mkeys, mvals, msize, setNew, sadd, shas, sdel, setFrom,
    o, not, isNull, tern, NULL, str, nget, nset, newNode, defRet, def, callR, call } = Solutions.dsl;
  const add = (p, sol) => { PROBLEMS.push(p); Solutions.add(p.id, sol); };
  const nn = (x) => not(isNull(x));
  const cell = (g, r, c) => at(at(g, r), c);
  const inBounds = (r, c) => o(o(o(r, '>=', 0), 'and', o(r, '<', 'm')), 'and', o(o(c, '>=', 0), 'and', o(c, '<', 'n')));
  const outBounds = (r, c) => o(o(o(r, '<', 0), 'or', o(r, '>=', 'm')), 'or', o(o(c, '<', 0), 'or', o(c, '>=', 'n')));

  add({
    id: 'surrounded-regions', no: 130, title: 'Surrounded Regions', zh: '被圍繞的區域', difficulty: 'Medium', lists: ['T150'], pattern: 'graph',
    fn: 'solve', params: ['board'], sig: 'void; char[][]', resultFrom: 'arg0',
    desc: `<p>把所有被 "X" 完全包圍的 "O" 區域翻成 "X"。跟邊界上的 "O" 相連的區域不算被包圍（原地修改）。</p>`,
    tests: [
      { args: [[['X', 'X', 'X', 'X'], ['X', 'O', 'O', 'X'], ['X', 'X', 'O', 'X'], ['X', 'O', 'X', 'X']]], expected: [['X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X'], ['X', 'O', 'X', 'X']] },
      { args: [[['X']]], expected: [['X']] },
      { args: [[['O', 'O'], ['O', 'O']]], expected: [['O', 'O'], ['O', 'O']] },
      { args: [[['X', 'O', 'X'], ['O', 'X', 'O'], ['X', 'O', 'X']]], expected: [['X', 'O', 'X'], ['O', 'X', 'O'], ['X', 'O', 'X']] },
    ],
    time: 'O(m·n)', space: 'O(m·n)',
    hints: ['反過來想：哪些 O 「不會」被翻？跟邊界相連的。', '從邊界上的每個 O 出發做 DFS，把能到的 O 先標記成 "S"（安全）。', '最後：剩下的 O → X，S → O。'],
    insight: '「被包圍」很難直接判斷，但「逃得出去」很好找 → 反向思考，從邊界出發。',
    solution: `函式 mark(r, c): 超出範圍或不是 "O" → 結束; 標成 "S"; 往四個方向 mark
對邊界上的每一格: mark
對每一格: "O" → "X"; "S" → "O"`,
  }, {
    helpers: [def('mark', ['r', 'c'], [
      If(outBounds('r', 'c'), Ret()),
      If(o(cell('board', 'r', 'c'), '!=', str('O')), Ret()),
      setAt(at('board', 'r'), 'c', str('S')),
      call('mark', ['r', 'c'], [o('r', '+', 1), 'c']), call('mark', ['r', 'c'], [o('r', '-', 1), 'c']),
      call('mark', ['r', 'c'], ['r', o('c', '+', 1)]), call('mark', ['r', 'c'], ['r', o('c', '-', 1)]),
    ])],
    body: [
      set('m', len('board')), set('n', len(at('board', 0))),
      For('r', 0, 'm', 1, [call('mark', ['r', 'c'], ['r', 0]), call('mark', ['r', 'c'], ['r', o('n', '-', 1)])]),
      For('c', 0, 'n', 1, [call('mark', ['r', 'c'], [0, 'c']), call('mark', ['r', 'c'], [o('m', '-', 1), 'c'])]),
      For('r', 0, 'm', 1, For('c', 0, 'n', 1, IfChain([
        [o(cell('board', 'r', 'c'), '==', str('O')), setAt(at('board', 'r'), 'c', str('X'))],
        [o(cell('board', 'r', 'c'), '==', str('S')), setAt(at('board', 'r'), 'c', str('O'))],
      ]))),
    ],
  });

  add({
    id: 'clone-graph', no: 133, title: 'Clone Graph', zh: '複製圖', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'graph',
    fn: 'cloneGraph', params: ['node'], types: { node: 'graph' }, output: 'graph', nodeKind: 'GraphNode', sig: 'Node; Node',
    desc: `<p>給無向連通圖中的一個節點，回傳整張圖的<b>深拷貝</b>。每個節點有 <code>val</code> 和 <code>neighbors</code>（鄰居清單）。</p><p class="muted">測資用鄰接串列表示，節點值從 1 開始，傳入的是值為 1 的節點。</p>`,
    tests: [
      { args: [[[2, 4], [1, 3], [2, 4], [1, 3]]], expected: [[2, 4], [1, 3], [2, 4], [1, 3]] },
      { args: [[[]]], expected: [[]] },
      { args: [[]], expected: [] },
      { args: [[[2], [1]]], expected: [[2], [1]] },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['圖可能有環，要記住「哪些節點已經複製過」。', '字典：舊節點 → 新節點。', 'clone(n)：已經複製過就直接回傳；否則建立新節點、先存進字典，再遞迴複製所有鄰居。'],
    insight: '先登記再遞迴，就不會因為環而無限迴圈。',
    solution: `copies = 空字典
函式 clone(n):
    如果 n 是 null: 回傳 null
    如果 copies 有 n: 回傳 copies[n]
    c = 新節點(n.val); copies[n] = c
    對 n 的每個鄰居 nb: 把 clone(nb) 加到 c.neighbors
    回傳 c
回傳 clone(node)`,
  }, {
    helpers: [defRet('clone', ['n'], [
      If(isNull('n'), Ret(NULL())),
      If(mhas('copies', 'n'), Ret(mget('copies', 'n'))),
      set('c', newNode(nget('n', 'val'), 'GraphNode')),
      mset('copies', 'n', 'c'),
      Each('nb', nget('n', 'neighbors'), push(nget('c', 'neighbors'), callR('clone', ['n'], ['nb']))),
    ], 'c')],
    body: [set('copies', mapNew()), Ret(callR('clone', ['n'], ['node']))],
  });

  add({
    id: 'evaluate-division', no: 399, title: 'Evaluate Division', zh: '除法求值', difficulty: 'Medium', lists: ['T150'], pattern: 'graph',
    fn: 'calcEquation', params: ['equations', 'values', 'queries'], sig: 'double[]; List<List<string>>, double[], List<List<string>>', compare: 'float',
    desc: `<p><code>equations[i] = [A, B]</code> 和 <code>values[i]</code> 表示 A / B = values[i]。對每個查詢 [C, D] 回傳 C / D；無法求出就回傳 -1.0。</p>`,
    tests: [
      { args: [[['a', 'b'], ['b', 'c']], [2.0, 3.0], [['a', 'c'], ['b', 'a'], ['a', 'e'], ['a', 'a'], ['x', 'x']]], expected: [6.0, 0.5, -1.0, 1.0, -1.0] },
      { args: [[['a', 'b'], ['b', 'c'], ['bc', 'cd']], [1.5, 2.5, 5.0], [['a', 'c'], ['c', 'b'], ['bc', 'cd'], ['cd', 'bc']]], expected: [3.75, 0.4, 5.0, 0.2] },
      { args: [[['a', 'b']], [0.5], [['a', 'b'], ['b', 'a'], ['a', 'c'], ['x', 'y']]], expected: [0.5, 2.0, -1.0, -1.0] },
    ],
    time: 'O(n·k)', space: 'O(n)',
    hints: ['把變數當成圖的節點：A / B = v 表示 A → B 權重 v、B → A 權重 1/v。', 'C / D = 從 C 走到 D 路徑上權重的乘積。', '用 DFS 找路徑，記得用集合避免繞圈。'],
    insight: '代數關係 → 帶權重的圖；求值 → 找路徑。',
    solution: `g = 字典: 變數 → (鄰居 → 權重)
建圖: g[a][b] = v; g[b][a] = 1 / v
函式 dfs(cur, target, seen):
    如果 cur == target: 回傳 1
    把 cur 放進 seen
    對 g[cur] 的每個鄰居 nb (不在 seen): r = dfs(nb, target, seen); 如果 r > 0: 回傳 r * g[cur][nb]
    回傳 -1
每個查詢: 變數不存在 → -1；否則 dfs`,
  }, {
    helpers: [defRet('dfs', ['cur', 'target', 'seen'], [
      If(o('cur', '==', 'target'), Ret(1)),
      sadd('seen', 'cur'),
      Each('nb', mkeys(mget('g', 'cur')), If(not(shas('seen', 'nb')), [
        set('r', callR('dfs', ['cur', 'target', 'seen'], ['nb', 'target', 'seen'])),
        If(o('r', '>', 0), Ret(o('r', '*', mget(mget('g', 'cur'), 'nb')))),
      ])),
    ], -1)],
    body: [
      set('g', mapNew()),
      For('i', 0, len('equations'), 1, [
        set('a', at(at('equations', 'i'), 0)), set('b', at(at('equations', 'i'), 1)),
        If(not(mhas('g', 'a')), mset('g', 'a', mapNew())),
        If(not(mhas('g', 'b')), mset('g', 'b', mapNew())),
        mset(mget('g', 'a'), 'b', at('values', 'i')),
        mset(mget('g', 'b'), 'a', o(1, '/', at('values', 'i'))),
      ]),
      set('res', empty()),
      Each('q', 'queries', [
        set('a', at('q', 0)), set('b', at('q', 1)),
        If(o(not(mhas('g', 'a')), 'or', not(mhas('g', 'b'))), push('res', -1), [set('seen', setNew()), push('res', callR('dfs', ['cur', 'target', 'seen'], ['a', 'b', 'seen']))]),
      ]),
      Ret('res'),
    ],
  });

  // 拓撲排序共用：建圖 + 入度
  const buildGraph = [
    set('indeg', fill('numCourses', 0)),
    set('adj', fill('numCourses', empty())),
    Each('p', 'prerequisites', [
      push(at('adj', at('p', 1)), at('p', 0)),
      setAt('indeg', at('p', 0), o(at('indeg', at('p', 0)), '+', 1)),
    ]),
    set('q', empty()),
    For('i', 0, 'numCourses', 1, If(o(at('indeg', 'i'), '==', 0), push('q', 'i'))),
  ];
  const kahn = (visit) => While(not(isEmpty('q')), [
    set('cur', popFirst('q')),
    ...visit,
    Each('nx', at('adj', 'cur'), [
      setAt('indeg', 'nx', o(at('indeg', 'nx'), '-', 1)),
      If(o(at('indeg', 'nx'), '==', 0), push('q', 'nx')),
    ]),
  ]);
  add({
    id: 'course-schedule', no: 207, title: 'Course Schedule', zh: '課程表', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'graph',
    fn: 'canFinish', params: ['numCourses', 'prerequisites'], sig: 'bool; int, int[][]',
    desc: `<p>有 numCourses 門課（0 ~ n-1），<code>prerequisites[i] = [a, b]</code> 表示修 a 之前要先修 b。能不能修完所有課？</p>`,
    tests: [
      { args: [2, [[1, 0]]], expected: true },
      { args: [2, [[1, 0], [0, 1]]], expected: false },
      { args: [3, []], expected: true },
      { args: [4, [[1, 0], [2, 1], [3, 2], [1, 3]]], expected: false },
    ],
    time: 'O(n + e)', space: 'O(n + e)',
    hints: ['課程 = 節點，先修關係 = 有向邊 b → a。能修完 ⇔ 圖裡沒有環。', 'Kahn 拓撲排序：入度為 0 的課可以先修，修完後把它指向的課入度減 1。', '最後修完的課數 == numCourses 就沒有環。'],
    insight: '「有依賴關係的排程」= 拓撲排序；排不完 = 有環。',
    solution: `建 adj（b → a）和入度 indeg
q = 所有入度 0 的課, done = 0
當 q 不空:
    cur = 取出第一個; done += 1
    對 adj[cur] 的每個 nx: indeg[nx] -= 1; 變 0 就放進 q
回傳 done == numCourses`,
  }, { body: [
    ...buildGraph,
    set('done', 0),
    kahn([inc('done', 1)]),
    Ret(o('done', '==', 'numCourses')),
  ] });

  add({
    id: 'course-schedule-ii', no: 210, title: 'Course Schedule II', zh: '課程表 II', difficulty: 'Medium', lists: ['T150'], pattern: 'graph',
    fn: 'findOrder', params: ['numCourses', 'prerequisites'], sig: 'int[]; int, int[][]', check: 'topoOrder',
    desc: `<p>同上題，但要回傳一個可行的修課順序；有多種的話回傳任一種都可以，修不完就回傳空陣列。</p>`,
    tests: [
      { args: [2, [[1, 0]]], expected: [0, 1] },
      { args: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], expected: [0, 1, 2, 3] },
      { args: [1, []], expected: [0] },
      { args: [2, [[1, 0], [0, 1]]], expected: [] },
    ],
    time: 'O(n + e)', space: 'O(n + e)',
    hints: ['跟課程表一樣做 Kahn 拓撲排序。', '從佇列取出的順序就是一個合法的修課順序。'],
    insight: 'Kahn 演算法同時給出「能不能」和「怎麼排」。',
    solution: `同課程表，但把取出的 cur 依序加入 order
如果 order 的長度 ≠ numCourses: 回傳 []
回傳 order`,
  }, { body: [
    ...buildGraph,
    set('order', empty()),
    kahn([push('order', 'cur')]),
    If(o(len('order'), '!=', 'numCourses'), Ret(empty())),
    Ret('order'),
  ] });

  add({
    id: 'pacific-atlantic', no: 417, title: 'Pacific Atlantic Water Flow', zh: '太平洋大西洋水流問題', difficulty: 'Medium', lists: ['B75'], pattern: 'graph',
    fn: 'pacificAtlantic', params: ['heights'], sig: 'List<List<int>>; int[][]', compare: 'unordered',
    desc: `<p>矩陣的上、左邊界接太平洋，下、右邊界接大西洋。雨水只能流向高度 ≤ 自己的相鄰格子。回傳所有雨水<b>同時能流到兩個大洋</b>的格子座標 [r, c]（順序不限）。</p>`,
    tests: [
      { args: [[[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]]], expected: [[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]] },
      { args: [[[1]]], expected: [[0, 0]] },
      { args: [[[1, 1], [1, 1]]], expected: [[0, 0], [0, 1], [1, 0], [1, 1]] },
    ],
    time: 'O(m·n)', space: 'O(m·n)',
    hints: ['從每一格模擬水往下流太慢了。', '反過來：從海邊「往上爬」（只走高度 ≥ 目前的格子），能爬到的格子就能流到那個海。', '分別從太平洋邊、大西洋邊做 DFS，兩邊都到得了的就是答案。'],
    insight: '多起點 → 多終點的問題，常常反過來從終點出發會簡單很多。',
    solution: `pac, atl = m×n 的 false
函式 climb(r, c, ocean): 標記 ocean[r][c]; 往四周 (範圍內、還沒標記、高度 >= 目前) 繼續 climb
上邊、左邊出發 climb(…, pac)；下邊、右邊出發 climb(…, atl)
兩個都 true 的格子加入答案`,
  }, {
    helpers: [def('climb', ['r', 'c', 'ocean'], [
      setAt(at('ocean', 'r'), 'c', true),
      For('d', 0, 4, 1, [
        set('nr', o('r', '+', at('dr', 'd'))), set('nc', o('c', '+', at('dc', 'd'))),
        If(o(o(inBounds('nr', 'nc'), 'and', not(cell('ocean', 'nr', 'nc'))), 'and', o(cell('heights', 'nr', 'nc'), '>=', cell('heights', 'r', 'c'))),
          call('climb', ['r', 'c', 'ocean'], ['nr', 'nc', 'ocean'])),
      ]),
    ])],
    body: [
      set('m', len('heights')), set('n', len(at('heights', 0))),
      set('dr', list(1, -1, 0, 0)), set('dc', list(0, 0, 1, -1)),
      set('pac', grid('m', 'n', false)), set('atl', grid('m', 'n', false)),
      For('r', 0, 'm', 1, [call('climb', ['r', 'c', 'ocean'], ['r', 0, 'pac']), call('climb', ['r', 'c', 'ocean'], ['r', o('n', '-', 1), 'atl'])]),
      For('c', 0, 'n', 1, [call('climb', ['r', 'c', 'ocean'], [0, 'c', 'pac']), call('climb', ['r', 'c', 'ocean'], [o('m', '-', 1), 'c', 'atl'])]),
      set('res', empty()),
      For('r', 0, 'm', 1, For('c', 0, 'n', 1, If(o(cell('pac', 'r', 'c'), 'and', cell('atl', 'r', 'c')), push('res', list('r', 'c'))))),
      Ret('res'),
    ],
  });

  add({
    id: 'alien-dictionary', no: 269, title: 'Alien Dictionary', zh: '火星詞典', difficulty: 'Hard', lists: ['B75'], pattern: 'graph',
    fn: 'alienOrder', params: ['words'], sig: 'string; string[]',
    desc: `<p>外星語言也用小寫字母，但字母順序不同。給一份<b>已依外星字母順序排序</b>的單字清單，回傳字母的順序；不合理（矛盾）就回傳 ""。（LeetCode 付費題）</p><p class="muted">這裡的測資答案都是唯一的。</p>`,
    tests: [
      { args: [['wrt', 'wrf', 'er', 'ett', 'rftt']], expected: 'wertf' },
      { args: [['z', 'x']], expected: 'zx' },
      { args: [['z', 'x', 'z']], expected: '' },
      { args: [['abc', 'ab']], expected: '' },
    ],
    time: 'O(n·k)', space: 'O(1)',
    hints: ['相鄰兩個單字第一個不同的字母，給出一條「誰在前」的邊。', '特例：前一個單字比較長、而且後一個是它的前綴 → 不合理。', '對字母做拓撲排序；排不完（有環）就回傳 ""。'],
    insight: '排序結果 → 兩兩比較得到局部順序 → 拓撲排序還原全域順序。',
    solution: `每個出現過的字母: indeg[c] = 0, adj[c] = []
對相鄰的 w1, w2:
    找第一個不同的位置 j: 加邊 w1[j] → w2[j]
    沒有不同且 len(w1) > len(w2): 回傳 ""
拓撲排序（Kahn），結果長度 ≠ 字母數 → ""`,
  }, { body: [
    set('indeg', mapNew()), set('adj', mapNew()),
    Each('w', 'words', Each('c', 'w', If(not(mhas('indeg', 'c')), [mset('indeg', 'c', 0), mset('adj', 'c', empty())]))),
    For('i', 0, o(len('words'), '-', 1), 1, [
      set('w1', at('words', 'i')), set('w2', at('words', o('i', '+', 1))),
      set('found', false),
      For('j', 0, tern(o(len('w1'), '<', len('w2')), len('w1'), len('w2')), 1, If(o(at('w1', 'j'), '!=', at('w2', 'j')), [
        push(mget('adj', at('w1', 'j')), at('w2', 'j')),
        mset('indeg', at('w2', 'j'), o(mget('indeg', at('w2', 'j')), '+', 1)),
        set('found', true),
        Break(),
      ])),
      If(o(not('found'), 'and', o(len('w1'), '>', len('w2'))), Ret(str(''))),
    ]),
    set('q', empty()),
    Each('c', mkeys('indeg'), If(o(mget('indeg', 'c'), '==', 0), push('q', 'c'))),
    set('res', str('')),
    While(not(isEmpty('q')), [
      set('cur', popFirst('q')),
      set('res', concat('res', 'cur')),
      Each('nx', mget('adj', 'cur'), [
        mset('indeg', 'nx', o(mget('indeg', 'nx'), '-', 1)),
        If(o(mget('indeg', 'nx'), '==', 0), push('q', 'nx')),
      ]),
    ]),
    If(o(len('res'), '!=', msize('indeg')), Ret(str(''))),
    Ret('res'),
  ] });

  const findDef = defRet('find', ['x'], [
    While(o(at('parent', 'x'), '!=', 'x'), [
      setAt('parent', 'x', at('parent', at('parent', 'x'))),
      set('x', at('parent', 'x')),
    ]),
  ], 'x');
  const initParent = [set('parent', fill('n', 0)), For('i', 0, 'n', 1, setAt('parent', 'i', 'i'))];
  add({
    id: 'graph-valid-tree', no: 261, title: 'Graph Valid Tree', zh: '以圖判樹', difficulty: 'Medium', lists: ['B75'], pattern: 'graph',
    fn: 'validTree', params: ['n', 'edges'], sig: 'bool; int, int[][]',
    desc: `<p>n 個節點（0 ~ n-1）和無向邊 <code>edges</code>，判斷這些邊是否構成一棵<b>樹</b>（連通且沒有環）。（LeetCode 付費題）</p>`,
    tests: [
      { args: [5, [[0, 1], [0, 2], [0, 3], [1, 4]]], expected: true },
      { args: [5, [[0, 1], [1, 2], [2, 3], [1, 3], [1, 4]]], expected: false },
      { args: [1, []], expected: true },
      { args: [4, [[0, 1], [2, 3]]], expected: false },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['樹有剛好 n − 1 條邊；邊數不對就不是樹。', '邊數對的情況下，只要沒有環就一定連通。', '並查集（Union-Find）：連接兩點前，如果它們已經在同一組 → 有環。'],
    insight: '並查集專門處理「是否同一組」和「合併兩組」，判斷無向圖有沒有環很方便。',
    solution: `如果 len(edges) ≠ n - 1: 回傳 false
parent[i] = i
函式 find(x): 當 parent[x] ≠ x: parent[x] = parent[parent[x]]; x = parent[x]; 回傳 x
對每條邊 [a, b]:
    ra = find(a), rb = find(b)
    如果 ra == rb: 回傳 false
    parent[ra] = rb
回傳 true`,
  }, {
    helpers: [findDef],
    body: [
      If(o(len('edges'), '!=', o('n', '-', 1)), Ret(false)),
      ...initParent,
      Each('e', 'edges', [
        set('ra', callR('find', ['x'], [at('e', 0)])), set('rb', callR('find', ['x'], [at('e', 1)])),
        If(o('ra', '==', 'rb'), Ret(false)),
        setAt('parent', 'ra', 'rb'),
      ]),
      Ret(true),
    ],
  });

  add({
    id: 'connected-components', no: 323, title: 'Number of Connected Components in an Undirected Graph', zh: '無向圖中連通分量的數目', difficulty: 'Medium', lists: ['B75'], pattern: 'graph',
    fn: 'countComponents', params: ['n', 'edges'], sig: 'int; int, int[][]',
    desc: `<p>n 個節點（0 ~ n-1）和無向邊 <code>edges</code>，回傳連通分量（互相連通的組）的數量。（LeetCode 付費題）</p>`,
    tests: [
      { args: [5, [[0, 1], [1, 2], [3, 4]]], expected: 2 },
      { args: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], expected: 1 },
      { args: [3, []], expected: 3 },
      { args: [4, [[0, 1], [1, 2], [2, 0]]], expected: 2 },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['一開始每個節點自己一組，共 n 組。', '每條邊如果連接兩個不同組，就合併，組數減 1。'],
    insight: '並查集：組數 = n − 成功合併的次數。',
    solution: `parent[i] = i; count = n
對每條邊 [a, b]:
    ra = find(a), rb = find(b)
    如果 ra ≠ rb: parent[ra] = rb; count -= 1
回傳 count`,
  }, {
    helpers: [findDef],
    body: [
      ...initParent,
      set('count', 'n'),
      Each('e', 'edges', [
        set('ra', callR('find', ['x'], [at('e', 0)])), set('rb', callR('find', ['x'], [at('e', 1)])),
        If(o('ra', '!=', 'rb'), [setAt('parent', 'ra', 'rb'), inc('count', -1)]),
      ]),
      Ret('count'),
    ],
  });

  add({
    id: 'snakes-and-ladders', no: 909, title: 'Snakes and Ladders', zh: '蛇梯棋', difficulty: 'Medium', lists: ['T150'], pattern: 'graph',
    fn: 'snakesAndLadders', params: ['board'], sig: 'int; int[][]',
    desc: `<p>n×n 棋盤從左下角開始編號 1，以「之」字形往上編到 n²。每次擲骰可前進 1~6 格；如果停在蛇或梯子上（board 值 ≠ -1）就移到它指的格子。從 1 到 n² 最少要擲幾次？到不了回傳 -1。</p>`,
    tests: [
      { args: [[[-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, 35, -1, -1, 13, -1], [-1, -1, -1, -1, -1, -1], [-1, 15, -1, -1, -1, -1]]], expected: 4 },
      { args: [[[-1, -1], [-1, 3]]], expected: 1 },
      { args: [[[-1, -1, -1], [-1, 9, 8], [-1, 8, 9]]], expected: 1 },
      { args: [[[-1, -1], [-1, -1]]], expected: 1 },
    ],
    time: 'O(n²)', space: 'O(n²)',
    hints: ['「最少步數」→ BFS。每個格子是一個節點，擲骰的 1~6 是邊。', '編號 → 座標：r = (x−1) // n，c = (x−1) % n；實際列 = n−1−r；r 是奇數時這列是由右往左。', '用 dist 陣列記錄每格的步數（−1 表示還沒到過）。'],
    insight: '把棋盤格子抽象成圖的節點，最短路徑就是 BFS。',
    solution: `target = n*n; dist = 長度 target+1，全部 -1; dist[1] = 0; q = [1]
當 q 不空:
    cur = 取出第一個; 如果 cur == target: 回傳 dist[cur]
    對 k = 1..6: nxt = cur + k（超過 target 就停）
        換算座標; 如果有蛇或梯子: nxt = board[row][col]
        如果 dist[nxt] == -1: dist[nxt] = dist[cur] + 1; 放入 q
回傳 -1`,
  }, { body: [
    set('n', len('board')),
    set('target', o('n', '*', 'n')),
    set('dist', fill(o('target', '+', 1), -1)),
    setAt('dist', 1, 0),
    set('q', list(1)),
    While(not(isEmpty('q')), [
      set('cur', popFirst('q')),
      If(o('cur', '==', 'target'), Ret(at('dist', 'cur'))),
      For('k', 1, 7, 1, [
        set('nxt', o('cur', '+', 'k')),
        If(o('nxt', '>', 'target'), Break()),
        set('r', o(o('nxt', '-', 1), '//', 'n')),
        set('c', o(o('nxt', '-', 1), '%', 'n')),
        set('row', o(o('n', '-', 1), '-', 'r')),
        set('col', tern(o(o('r', '%', 2), '==', 0), 'c', o(o('n', '-', 1), '-', 'c'))),
        If(o(cell('board', 'row', 'col'), '!=', -1), set('nxt', cell('board', 'row', 'col'))),
        If(o(at('dist', 'nxt'), '==', -1), [setAt('dist', 'nxt', o(at('dist', 'cur'), '+', 1)), push('q', 'nxt')]),
      ]),
    ]),
    Ret(-1),
  ] });

  const bfsWords = (startVar, endVar, setVar, alphabet, count) => [
    set('dist', mapNew()),
    mset('dist', startVar, count),
    set('q', list(startVar)),
    While(not(isEmpty('q')), [
      set('cur', popFirst('q')),
      If(o('cur', '==', endVar), Ret(mget('dist', 'cur'))),
      For('i', 0, len('cur'), 1, alphabet([
        set('cand', concat(concat(slice('cur', 0, 'i'), 'ch'), slice('cur', o('i', '+', 1), len('cur')))),
        If(o(shas(setVar, 'cand'), 'and', not(mhas('dist', 'cand'))), [
          mset('dist', 'cand', o(mget('dist', 'cur'), '+', 1)),
          push('q', 'cand'),
        ]),
      ])),
    ]),
  ];
  add({
    id: 'min-genetic-mutation', no: 433, title: 'Minimum Genetic Mutation', zh: '最小基因變化', difficulty: 'Medium', lists: ['T150'], pattern: 'graph',
    fn: 'minMutation', params: ['startGene', 'endGene', 'bank'], sig: 'int; string, string, string[]',
    desc: `<p>基因是 8 個字元的字串（只有 A、C、G、T）。每次只能改一個字元，而且改完的基因必須在 <code>bank</code> 裡。從 startGene 到 endGene 最少要改幾次？做不到回傳 -1。</p>`,
    tests: [
      { args: ['AACCGGTT', 'AACCGGTA', ['AACCGGTA']], expected: 1 },
      { args: ['AACCGGTT', 'AAACGGTA', ['AACCGGTA', 'AACCGCTA', 'AAACGGTA']], expected: 2 },
      { args: ['AAAAACCC', 'AACCCCCC', ['AAAACCCC', 'AAACCCCC', 'AACCCCCC']], expected: 3 },
      { args: ['AACCGGTT', 'AACCGGTA', []], expected: -1 },
    ],
    time: 'O(n·k)', space: 'O(n)',
    hints: ['每個基因是一個節點，差一個字元的基因之間有邊。', '最少次數 → BFS。', '產生鄰居：每個位置換成 A/C/G/T，在 bank 裡而且沒看過就加入佇列。'],
    insight: '「一步一步變換」的最短路徑題 → 隱式圖上的 BFS。',
    solution: `bankSet = 用 bank 建立集合
dist = { start: 0 }, q = [start]
當 q 不空:
    cur = 取出第一個; 如果 cur == end: 回傳 dist[cur]
    對每個位置 i、每個字母 ch ∈ "ACGT":
        cand = cur 把第 i 個換成 ch
        如果 cand 在 bankSet 且沒看過: dist[cand] = dist[cur] + 1; 放入 q
回傳 -1`,
  }, { body: [
    set('bankSet', setFrom('bank')),
    ...bfsWords('startGene', 'endGene', 'bankSet', (body) => Each('ch', str('ACGT'), body), 0),
    Ret(-1),
  ] });

  add({
    id: 'word-ladder', no: 127, title: 'Word Ladder', zh: '單字接龍', difficulty: 'Hard', lists: ['T150'], pattern: 'graph',
    fn: 'ladderLength', params: ['beginWord', 'endWord', 'wordList'], sig: 'int; string, string, List<string>',
    desc: `<p>從 beginWord 變到 endWord，每次只能改一個字母，而且每個中間單字都要在 wordList 裡。回傳最短轉換序列的<b>單字數</b>（包含頭尾）；做不到回傳 0。</p>`,
    tests: [
      { args: ['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log', 'cog']], expected: 5 },
      { args: ['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log']], expected: 0 },
      { args: ['a', 'c', ['a', 'b', 'c']], expected: 2 },
      { args: ['hot', 'dog', ['hot', 'dog']], expected: 0 },
    ],
    time: 'O(n·k)', space: 'O(n)',
    hints: ['跟最小基因變化一樣的 BFS，只是字母變成 a ~ z。', '起點的距離算 1（題目要的是單字數）。'],
    insight: '同一個模板換個字母表就能解另一題：辨識出「隱式圖 + BFS」才是關鍵。',
    solution: `wordSet = 用 wordList 建立集合
dist = { begin: 1 }, q = [begin]
BFS：每個位置換成 a ~ z，在 wordSet 且沒看過就加入
走到 end 回傳 dist[end]；走不到回傳 0`,
  }, { body: [
    set('wordSet', setFrom('wordList')),
    ...bfsWords('beginWord', 'endWord', 'wordSet', (body) => For('k', 0, 26, 1, [set('ch', letter('k')), ...body]), 1),
    Ret(0),
  ] });

  // ===================== 字典樹 =====================
  const kids = (x) => nget(x, 'children');
  add({
    id: 'implement-trie', no: 208, title: 'Implement Trie (Prefix Tree)', zh: '實作 Trie（前綴樹）', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'trie',
    design: { cls: 'Trie', methods: [
      { name: 'Trie', params: [] },
      { name: 'insert', params: ['word'], ret: 'void' },
      { name: 'search', params: ['word'] },
      { name: 'startsWith', params: ['prefix'] },
    ] },
    sig: { Trie: 'void;', insert: 'void; string', search: 'bool; string', startsWith: 'bool; string' },
    desc: `<p>實作前綴樹：<code>insert(word)</code> 加入單字、<code>search(word)</code> 單字是否存在、<code>startsWith(prefix)</code> 是否有單字以 prefix 開頭。</p><p class="muted">「節點」分類裡的字典樹節點有 children（字元 → 子節點的字典）和 isEnd（是否為單字結尾）。</p>`,
    tests: [
      { ops: ['Trie', 'insert', 'search', 'search', 'startsWith', 'insert', 'search'], args: [[], ['apple'], ['apple'], ['app'], ['app'], ['app'], ['app']],
        expected: [null, null, true, false, true, null, true] },
      { ops: ['Trie', 'insert', 'insert', 'search', 'startsWith', 'search'], args: [[], ['ab'], ['abc'], ['a'], ['abd'], ['abc']], expected: [null, null, null, false, false, true] },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['每個節點用字典存「下一個字元 → 子節點」。', 'insert：沿著字元往下走，沒有路就建新節點；最後一個節點標記 isEnd。', 'search 和 startsWith 都是沿路往下走；差別在最後要不要檢查 isEnd。'],
    insight: '共用前綴的字串存在同一條路徑上，查詢時間只跟字串長度有關。',
    solution: `Trie(): root = 新的字典樹節點
insert(word): node = root; 每個字元 c: 沒有子節點就建; node = node.children[c]; 最後 node.isEnd = true
search(word): 一路往下，斷了就 false；最後回傳 node.isEnd
startsWith(prefix): 一路往下，斷了就 false；走完回傳 true`,
  }, { methods: {
    Trie: [set('root', newNode(0, 'TrieNode'))],
    insert: [
      set('node', 'root'),
      Each('c', 'word', [
        If(not(mhas(kids('node'), 'c')), mset(kids('node'), 'c', newNode(0, 'TrieNode'))),
        set('node', mget(kids('node'), 'c')),
      ]),
      nset('node', 'isEnd', true),
    ],
    search: [
      set('node', 'root'),
      Each('c', 'word', [If(not(mhas(kids('node'), 'c')), Ret(false)), set('node', mget(kids('node'), 'c'))]),
      Ret(nget('node', 'isEnd')),
    ],
    startsWith: [
      set('node', 'root'),
      Each('c', 'prefix', [If(not(mhas(kids('node'), 'c')), Ret(false)), set('node', mget(kids('node'), 'c'))]),
      Ret(true),
    ],
  } });

  add({
    id: 'add-search-word', no: 211, title: 'Design Add and Search Words Data Structure', zh: '新增與搜尋單字', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'trie',
    design: { cls: 'WordDictionary', methods: [
      { name: 'WordDictionary', params: [] },
      { name: 'addWord', params: ['word'], ret: 'void' },
      { name: 'search', params: ['word'] },
    ] },
    sig: { WordDictionary: 'void;', addWord: 'void; string', search: 'bool; string' },
    desc: `<p>支援 <code>addWord(word)</code> 和 <code>search(word)</code>，search 的 word 可以包含 <code>.</code>，代表任意一個字母。</p>`,
    tests: [
      { ops: ['WordDictionary', 'addWord', 'addWord', 'addWord', 'search', 'search', 'search', 'search'], args: [[], ['bad'], ['dad'], ['mad'], ['pad'], ['bad'], ['.ad'], ['b..']],
        expected: [null, null, null, null, false, true, true, true] },
      { ops: ['WordDictionary', 'addWord', 'search', 'search'], args: [[], ['a'], ['.'], ['a.']], expected: [null, null, true, false] },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['用 Trie 存單字。', '搜尋遇到一般字母就往對應的子節點走；遇到 "." 就要試所有子節點。', '寫成遞迴 dfs(node, i, w)：比對 w 的第 i 個字元。'],
    insight: '萬用字元 = 在 Trie 上分支搜尋（DFS）。',
    solution: `addWord: 同 Trie 的 insert
函式 dfs(node, i, w):
    如果 i == len(w): 回傳 node.isEnd
    c = w[i]
    如果 c == '.': 對每個子節點 child: 如果 dfs(child, i+1, w): 回傳 true; 回傳 false
    沒有子節點 c: 回傳 false
    回傳 dfs(node.children[c], i+1, w)
search(word): 回傳 dfs(root, 0, word)`,
  }, {
    helpers: [defRet('dfs', ['node', 'i', 'w'], [
      If(o('i', '==', len('w')), Ret(nget('node', 'isEnd'))),
      set('c', at('w', 'i')),
      If(o('c', '==', str('.')), [
        Each('child', mvals(kids('node')), If(callR('dfs', ['node', 'i', 'w'], ['child', o('i', '+', 1), 'w']), Ret(true))),
        Ret(false),
      ]),
      If(not(mhas(kids('node'), 'c')), Ret(false)),
    ], callR('dfs', ['node', 'i', 'w'], [mget(kids('node'), 'c'), o('i', '+', 1), 'w']))],
    methods: {
      WordDictionary: [set('root', newNode(0, 'TrieNode'))],
      addWord: [
        set('node', 'root'),
        Each('c', 'word', [
          If(not(mhas(kids('node'), 'c')), mset(kids('node'), 'c', newNode(0, 'TrieNode'))),
          set('node', mget(kids('node'), 'c')),
        ]),
        nset('node', 'isEnd', true),
      ],
      search: [Ret(callR('dfs', ['node', 'i', 'w'], ['root', 0, 'word']))],
    },
  });

  add({
    id: 'word-search-ii', no: 212, title: 'Word Search II', zh: '單字搜尋 II', difficulty: 'Hard', lists: ['B75', 'T150'], pattern: 'trie',
    fn: 'findWords', params: ['board', 'words'], sig: 'List<string>; char[][], string[]', compare: 'unordered',
    desc: `<p>在字母網格中找出所有出現在 <code>words</code> 裡的單字。單字由上下左右相鄰的格子組成，同一格在一個單字中只能用一次。（順序不限）</p>`,
    tests: [
      { args: [[['o', 'a', 'a', 'n'], ['e', 't', 'a', 'e'], ['i', 'h', 'k', 'r'], ['i', 'f', 'l', 'v']], ['oath', 'pea', 'eat', 'rain']], expected: ['eat', 'oath'] },
      { args: [[['a', 'b'], ['c', 'd']], ['abcb']], expected: [] },
      { args: [[['a']], ['a']], expected: ['a'] },
      { args: [[['a', 'b'], ['a', 'b']], ['ab', 'ba', 'aa', 'bb']], expected: ['ab', 'ba', 'aa', 'bb'] },
    ],
    time: 'O(m·n·4^k)', space: 'O(n·k)',
    hints: ['對每個單字各做一次單字搜尋太慢。', '把所有單字放進 Trie，DFS 時同時在網格和 Trie 上往下走；Trie 走不下去就提早停。', '找到單字後把那個節點的 isEnd 設成 false，避免重複加入。'],
    insight: 'Trie 讓多個單字「共用前綴的搜尋」，一次 DFS 找出全部。',
    solution: `把 words 全部插入 Trie
函式 dfs(r, c, node, cur):
    超出範圍 或 board[r][c] 是 '#' 或 node 沒有這個字元: 結束
    ch = board[r][c]; nxt = node.children[ch]; cur2 = cur + ch
    如果 nxt.isEnd: 加入 cur2; nxt.isEnd = false
    board[r][c] = '#'
    往四個方向 dfs(…, nxt, cur2)
    board[r][c] = ch
對每一格 dfs(r, c, root, "")`,
  }, {
    helpers: [def('dfs', ['r', 'c', 'node', 'cur'], [
      If(outBounds('r', 'c'), Ret()),
      set('ch', cell('board', 'r', 'c')),
      If(o(o('ch', '==', str('#')), 'or', not(mhas(kids('node'), 'ch'))), Ret()),
      set('nxt', mget(kids('node'), 'ch')),
      set('cur2', concat('cur', 'ch')),
      If(nget('nxt', 'isEnd'), [push('res', 'cur2'), nset('nxt', 'isEnd', false)]),
      setAt(at('board', 'r'), 'c', str('#')),
      call('dfs', ['r', 'c', 'node', 'cur'], [o('r', '+', 1), 'c', 'nxt', 'cur2']),
      call('dfs', ['r', 'c', 'node', 'cur'], [o('r', '-', 1), 'c', 'nxt', 'cur2']),
      call('dfs', ['r', 'c', 'node', 'cur'], ['r', o('c', '+', 1), 'nxt', 'cur2']),
      call('dfs', ['r', 'c', 'node', 'cur'], ['r', o('c', '-', 1), 'nxt', 'cur2']),
      setAt(at('board', 'r'), 'c', 'ch'),
    ])],
    body: [
      set('root', newNode(0, 'TrieNode')),
      Each('w', 'words', [
        set('node', 'root'),
        Each('letter', 'w', [
          If(not(mhas(kids('node'), 'letter')), mset(kids('node'), 'letter', newNode(0, 'TrieNode'))),
          set('node', mget(kids('node'), 'letter')),
        ]),
        nset('node', 'isEnd', true),
      ]),
      set('res', empty()),
      set('m', len('board')), set('n', len(at('board', 0))),
      For('r', 0, 'm', 1, For('c', 0, 'n', 1, call('dfs', ['r', 'c', 'node', 'cur'], ['r', 'c', 'root', str('')]))),
      Ret('res'),
    ],
  });

  // ===================== 回溯 =====================
  add({
    id: 'letter-combinations', no: 17, title: 'Letter Combinations of a Phone Number', zh: '電話號碼的字母組合', difficulty: 'Medium', lists: ['T150'], pattern: 'backtracking',
    fn: 'letterCombinations', params: ['digits'], sig: 'List<string>; string', compare: 'unordered',
    desc: `<p>手機按鍵 2-9 各對應幾個字母（2: abc, 3: def, …, 7: pqrs, 9: wxyz）。回傳數字字串能代表的所有字母組合（順序不限）。</p>`,
    tests: [
      { args: ['23'], expected: ['ad', 'ae', 'af', 'bd', 'be', 'bf', 'cd', 'ce', 'cf'] },
      { args: [''], expected: [] },
      { args: ['2'], expected: ['a', 'b', 'c'] },
      { args: ['79'], expected: ['pw', 'px', 'py', 'pz', 'qw', 'qx', 'qy', 'qz', 'rw', 'rx', 'ry', 'rz', 'sw', 'sx', 'sy', 'sz'] },
    ],
    time: 'O(4^n)', space: 'O(n)',
    hints: ['用清單 phone[d] 存數字 d 對應的字母字串。', '遞迴 bt(i, cur)：處理到第 i 個數字，目前組出 cur。', 'i 到尾巴就加入答案；否則把第 i 個數字的每個字母接上去，遞迴下一個。'],
    insight: '回溯 = 每一層做一個選擇；層數 = 數字個數，每層的分支 = 該數字的字母數。',
    solution: `如果 digits 是空的: 回傳 []
phone = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"]
函式 bt(i, cur):
    如果 i == len(digits): 加入 cur; 結束
    對 phone[數字值(digits[i])] 的每個字母 ch: bt(i + 1, cur + ch)
bt(0, "")`,
  }, {
    helpers: [def('bt', ['i', 'cur'], [
      If(o('i', '==', len('digits')), [push('res', 'cur'), Ret()]),
      Each('ch', at('phone', digit(at('digits', 'i'))), call('bt', ['i', 'cur'], [o('i', '+', 1), concat('cur', 'ch')])),
    ])],
    body: [
      set('res', empty()),
      If(o(len('digits'), '==', 0), Ret('res')),
      set('phone', list(...['', '', 'abc', 'def', 'ghi', 'jkl', 'mno', 'pqrs', 'tuv', 'wxyz'].map(str))),
      call('bt', ['i', 'cur'], [0, str('')]),
      Ret('res'),
    ],
  });

  add({
    id: 'combinations', no: 77, title: 'Combinations', zh: '組合', difficulty: 'Medium', lists: ['T150'], pattern: 'backtracking',
    fn: 'combine', params: ['n', 'k'], sig: 'List<List<int>>; int, int', compare: 'unorderedDeep',
    desc: `<p>回傳從 1 ~ n 中選 k 個數的所有組合（順序不限）。</p>`,
    tests: [
      { args: [4, 2], expected: [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]] },
      { args: [1, 1], expected: [[1]] },
      { args: [3, 3], expected: [[1, 2, 3]] },
      { args: [3, 1], expected: [[1], [2], [3]] },
    ],
    time: 'O(2ⁿ)', space: 'O(n)',
    hints: ['path 存目前選了哪些數。bt(start)：下一個只能從 start 開始選，避免重複的組合。', 'path 滿 k 個就把「複本」加入答案。', '選 i → 遞迴 bt(i+1) → 撤銷選擇（移除最後一個）。'],
    insight: '回溯三步驟：做選擇 → 遞迴 → 撤銷選擇。存答案要存複本。',
    solution: `path = [], res = []
函式 bt(start):
    如果 len(path) == k: 加入 path 的複本; 結束
    對 i 從 start 到 n:
        放入 i; bt(i + 1); 移除最後一個
bt(1)`,
  }, {
    helpers: [def('bt', ['start'], [
      If(o(len('path'), '==', 'k'), [push('res', copy('path')), Ret()]),
      For('i', 'start', o('n', '+', 1), 1, [push('path', 'i'), call('bt', ['start'], [o('i', '+', 1)]), popStmt('path')]),
    ])],
    body: [set('path', empty()), set('res', empty()), call('bt', ['start'], [1]), Ret('res')],
  });

  add({
    id: 'permutations', no: 46, title: 'Permutations', zh: '全排列', difficulty: 'Medium', lists: ['T150'], pattern: 'backtracking',
    fn: 'permute', params: ['nums'], sig: 'List<List<int>>; int[]', compare: 'unorderedOuter',
    desc: `<p><code>nums</code> 的數字都不同，回傳所有排列（順序不限）。</p>`,
    tests: [
      { args: [[1, 2, 3]], expected: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]] },
      { args: [[0, 1]], expected: [[0, 1], [1, 0]] },
      { args: [[1]], expected: [[1]] },
      { args: [[5, -1]], expected: [[5, -1], [-1, 5]] },
    ],
    time: 'O(n·n!)', space: 'O(n)',
    hints: ['跟組合不同，排列的每個位置都可以選任何「還沒用過」的數。', '用 used 陣列記錄哪些數已經在 path 裡。', 'path 長度等於 n 時加入複本。'],
    insight: '組合用 start 避免重複；排列用 used 標記避免重複使用。',
    solution: `used = 全 false, path = []
函式 bt():
    如果 len(path) == n: 加入 path 的複本; 結束
    對每個 i: 如果 used[i]: 跳過
        used[i] = true; 放入 nums[i]; bt(); 移除最後一個; used[i] = false
bt()`,
  }, {
    helpers: [def('bt', [], [
      If(o(len('path'), '==', len('nums')), [push('res', copy('path')), Ret()]),
      For('i', 0, len('nums'), 1, [
        If(at('used', 'i'), Continue()),
        setAt('used', 'i', true), push('path', at('nums', 'i')),
        call('bt', [], []),
        popStmt('path'), setAt('used', 'i', false),
      ]),
    ])],
    body: [set('used', fill(len('nums'), false)), set('path', empty()), set('res', empty()), call('bt', [], []), Ret('res')],
  });

  add({
    id: 'combination-sum', no: 39, title: 'Combination Sum', zh: '組合總和', difficulty: 'Medium', lists: ['T150'], pattern: 'backtracking',
    fn: 'combinationSum', params: ['candidates', 'target'], sig: 'List<List<int>>; int[], int', compare: 'unorderedDeep',
    desc: `<p>從不重複的 <code>candidates</code> 中選數字（每個可以選<b>無限次</b>），找出所有總和等於 target 的組合（順序不限）。</p>`,
    tests: [
      { args: [[2, 3, 6, 7], 7], expected: [[2, 2, 3], [7]] },
      { args: [[2, 3, 5], 8], expected: [[2, 2, 2, 2], [2, 3, 3], [3, 5]] },
      { args: [[2], 1], expected: [] },
      { args: [[1], 2], expected: [[1, 1]] },
    ],
    time: 'O(2ⁿ)', space: 'O(n)',
    hints: ['bt(start, rem)：從第 start 個候選開始選，還差 rem。', '可以重複選 → 選了 i 之後，遞迴仍然從 i 開始。', 'rem == 0 就找到一組；候選比 rem 大就不選。'],
    insight: '「可重複選」與「不可重複選」只差在遞迴時傳 i 還是 i + 1。',
    solution: `函式 bt(start, rem):
    如果 rem == 0: 加入 path 的複本; 結束
    對 i 從 start 到 n:
        如果 candidates[i] <= rem: 放入; bt(i, rem - candidates[i]); 移除最後一個
bt(0, target)`,
  }, {
    helpers: [def('bt', ['start', 'rem'], [
      If(o('rem', '==', 0), [push('res', copy('path')), Ret()]),
      For('i', 'start', len('candidates'), 1, If(o(at('candidates', 'i'), '<=', 'rem'), [
        push('path', at('candidates', 'i')),
        call('bt', ['start', 'rem'], ['i', o('rem', '-', at('candidates', 'i'))]),
        popStmt('path'),
      ])),
    ])],
    body: [set('path', empty()), set('res', empty()), call('bt', ['start', 'rem'], [0, 'target']), Ret('res')],
  });

  add({
    id: 'n-queens-ii', no: 52, title: 'N-Queens II', zh: 'N 皇后 II', difficulty: 'Hard', lists: ['T150'], pattern: 'backtracking',
    fn: 'totalNQueens', params: ['n'], sig: 'int; int',
    desc: `<p>在 n×n 棋盤上放 n 個皇后，彼此不能互相攻擊（同列、同行、同對角線）。回傳有幾種放法。</p>`,
    tests: [
      { args: [4], expected: 2 },
      { args: [1], expected: 1 },
      { args: [5], expected: 10 },
      { args: [6], expected: 4 },
      { args: [8], expected: 92 },
    ],
    time: 'O(n!)', space: 'O(n)',
    hints: ['一列放一個皇后，遞迴 place(r) 決定第 r 列放在哪一行。', '用三個集合記錄被佔的：行 c、主對角線 r − c、副對角線 r + c。', 'place 回傳從第 r 列開始有幾種放法，加總起來。'],
    insight: '對角線可以用 r − c 和 r + c 編號，衝突檢查就變成 O(1) 的集合查詢。',
    solution: `cols, d1, d2 = 空集合
函式 place(r):
    如果 r == n: 回傳 1
    total = 0
    對 c 從 0 到 n:
        衝突（c 在 cols、r-c 在 d1、r+c 在 d2）就跳過
        三個集合都加入; total += place(r + 1); 三個都移除
    回傳 total
回傳 place(0)`,
  }, {
    helpers: [defRet('place', ['r'], [
      If(o('r', '==', 'n'), Ret(1)),
      set('total', 0),
      For('c', 0, 'n', 1, [
        If(o(o(shas('cols', 'c'), 'or', shas('d1', o('r', '-', 'c'))), 'or', shas('d2', o('r', '+', 'c'))), Continue()),
        sadd('cols', 'c'), sadd('d1', o('r', '-', 'c')), sadd('d2', o('r', '+', 'c')),
        set('total', o('total', '+', callR('place', ['r'], [o('r', '+', 1)]))),
        sdel('cols', 'c'), sdel('d1', o('r', '-', 'c')), sdel('d2', o('r', '+', 'c')),
      ]),
    ], 'total')],
    body: [set('cols', setNew()), set('d1', setNew()), set('d2', setNew()), Ret(callR('place', ['r'], [0]))],
  });

  add({
    id: 'generate-parentheses', no: 22, title: 'Generate Parentheses', zh: '括號生成', difficulty: 'Medium', lists: ['T150'], pattern: 'backtracking',
    fn: 'generateParenthesis', params: ['n'], sig: 'List<string>; int', compare: 'unordered',
    desc: `<p>產生所有由 n 對括號組成的<b>合法</b>括號字串（順序不限）。</p>`,
    tests: [
      { args: [3], expected: ['((()))', '(()())', '(())()', '()(())', '()()()'] },
      { args: [1], expected: ['()'] },
      { args: [2], expected: ['(())', '()()'] },
    ],
    time: 'O(2ⁿ)', space: 'O(n)',
    hints: ['bt(cur, open, close)：已經用了幾個左括號、幾個右括號。', '左括號還沒用完（open < n）就可以放 "("。', '右括號比左括號少（close < open）才能放 ")"，這樣永遠合法。'],
    insight: '在回溯時就只做合法的選擇（剪枝），不用最後再檢查。',
    solution: `函式 bt(cur, open, close):
    如果 len(cur) == 2n: 加入 cur; 結束
    如果 open < n: bt(cur + "(", open + 1, close)
    如果 close < open: bt(cur + ")", open, close + 1)
bt("", 0, 0)`,
  }, {
    helpers: [def('bt', ['cur', 'open', 'close'], [
      If(o(len('cur'), '==', o(2, '*', 'n')), [push('res', 'cur'), Ret()]),
      If(o('open', '<', 'n'), call('bt', ['cur', 'open', 'close'], [concat('cur', str('(')), o('open', '+', 1), 'close'])),
      If(o('close', '<', 'open'), call('bt', ['cur', 'open', 'close'], [concat('cur', str(')')), 'open', o('close', '+', 1)])),
    ])],
    body: [set('res', empty()), call('bt', ['cur', 'open', 'close'], [str(''), 0, 0]), Ret('res')],
  });

  add({
    id: 'word-search', no: 79, title: 'Word Search', zh: '單字搜尋', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'backtracking',
    fn: 'exist', params: ['board', 'word'], sig: 'bool; char[][], string',
    desc: `<p>判斷 <code>word</code> 是否能在字母網格中，由上下左右相鄰的格子依序組成（同一格不能重複使用）。</p>`,
    tests: [
      { args: [[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'ABCCED'], expected: true },
      { args: [[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'SEE'], expected: true },
      { args: [[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'ABCB'], expected: false },
      { args: [[['a']], 'a'], expected: true },
    ],
    time: 'O(m·n·4^k)', space: 'O(k)',
    hints: ['從每一格出發做 DFS：dfs(r, c, i) 表示目前這格要對上 word[i]。', '走過的格子暫時改成 "#"，避免重複使用；回來時再改回去。', 'i 走到 word 的長度就成功。'],
    insight: '網格回溯：標記 → 探索四個方向 → 還原標記。',
    solution: `函式 dfs(r, c, i):
    如果 i == len(word): 回傳 true
    超出範圍 或 board[r][c] ≠ word[i]: 回傳 false
    tmp = board[r][c]; board[r][c] = '#'
    found = 四個方向任一個 dfs(…, i + 1) 成功
    board[r][c] = tmp
    回傳 found
任一格 dfs(r, c, 0) 成功就回傳 true`,
  }, {
    helpers: [defRet('dfs', ['r', 'c', 'i'], [
      If(o('i', '==', len('word')), Ret(true)),
      If(o(outBounds('r', 'c'), 'or', o(cell('board', 'r', 'c'), '!=', at('word', 'i'))), Ret(false)),
      set('tmp', cell('board', 'r', 'c')),
      setAt(at('board', 'r'), 'c', str('#')),
      set('found', o(o(o(
        callR('dfs', ['r', 'c', 'i'], [o('r', '+', 1), 'c', o('i', '+', 1)]), 'or',
        callR('dfs', ['r', 'c', 'i'], [o('r', '-', 1), 'c', o('i', '+', 1)])), 'or',
        callR('dfs', ['r', 'c', 'i'], ['r', o('c', '+', 1), o('i', '+', 1)])), 'or',
        callR('dfs', ['r', 'c', 'i'], ['r', o('c', '-', 1), o('i', '+', 1)]))),
      setAt(at('board', 'r'), 'c', 'tmp'),
    ], 'found')],
    body: [
      set('m', len('board')), set('n', len(at('board', 0))),
      For('r', 0, 'm', 1, For('c', 0, 'n', 1, If(callR('dfs', ['r', 'c', 'i'], ['r', 'c', 0]), Ret(true)))),
      Ret(false),
    ],
  });
})();
