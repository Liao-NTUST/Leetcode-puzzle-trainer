// 第 D 批：二元樹 / BST
(function () {
  const { set, inc, Ret, If, IfChain, For, While, Repeat, at, setAt, len, push, pop, popFirst, isEmpty, empty, list, reverse, mapNew, mset, mget,
    o, not, isNull, tern, NULL, INF, max, min, str, concat, split, join, toNum, nget, nset, newNode, defRet, def, callR, call } = Solutions.dsl;
  const add = (p, sol) => { PROBLEMS.push(p); Solutions.add(p.id, sol); };
  const nn = (x) => not(isNull(x));
  const L = (x) => nget(x, 'left');
  const R = (x) => nget(x, 'right');
  const val = (x) => nget(x, 'val');
  const leaf = (x) => o(isNull(L(x)), 'and', isNull(R(x)));
  const tree = (x) => newNode(x, 'TreeNode');
  // BFS 一層一層走：body(node, i, size) 處理每個節點
  const bfs = (before, each, after) => [
    set('q', list('root')),
    While(not(isEmpty('q')), [
      set('size', len('q')),
      ...before,
      For('i', 0, 'size', 1, [
        set('node', popFirst('q')),
        ...each,
        If(nn(L('node')), push('q', L('node'))),
        If(nn(R('node')), push('q', R('node'))),
      ]),
      ...after,
    ]),
  ];

  add({
    id: 'symmetric-tree', no: 101, title: 'Symmetric Tree', zh: '對稱二元樹', difficulty: 'Easy', lists: ['T150'], pattern: 'treeDfs',
    fn: 'isSymmetric', params: ['root'], types: { root: 'tree' }, sig: 'bool; TreeNode',
    desc: `<p>判斷二元樹是否左右對稱（以根為中心的鏡像）。</p>`,
    tests: [
      { args: [[1, 2, 2, 3, 4, 4, 3]], expected: true },
      { args: [[1, 2, 2, null, 3, null, 3]], expected: false },
      { args: [[1]], expected: true },
      { args: [[1, 2, 3]], expected: false },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['對稱 = 左子樹和右子樹互為鏡像。', '寫 mirror(a, b)：a 的左要對應 b 的右，a 的右要對應 b 的左。'],
    insight: '跟「相同的樹」幾乎一樣，只是比較時左右交叉。',
    solution: `函式 mirror(a, b):
    都是 null → true；只有一個 null → false
    回傳 a.val == b.val 且 mirror(a.left, b.right) 且 mirror(a.right, b.left)
回傳 mirror(root.left, root.right)`,
  }, {
    helpers: [defRet('mirror', ['a', 'b'], [
      If(o(isNull('a'), 'and', isNull('b')), Ret(true)),
      If(o(isNull('a'), 'or', isNull('b')), Ret(false)),
    ], o(o(o(val('a'), '==', val('b')), 'and', callR('mirror', ['a', 'b'], [L('a'), R('b')])), 'and', callR('mirror', ['a', 'b'], [R('a'), L('b')])))],
    body: [Ret(callR('mirror', ['a', 'b'], [L('root'), R('root')]))],
  });

  add({
    id: 'construct-pre-in', no: 105, title: 'Construct Binary Tree from Preorder and Inorder Traversal', zh: '從前序與中序走訪建構二元樹', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'treeDfs',
    fn: 'buildTree', params: ['preorder', 'inorder'], output: 'tree', sig: 'TreeNode; int[], int[]',
    desc: `<p>給二元樹的前序走訪和中序走訪（值都不重複），建構出這棵樹。</p>`,
    tests: [
      { args: [[3, 9, 20, 15, 7], [9, 3, 15, 20, 7]], expected: [3, 9, 20, null, null, 15, 7] },
      { args: [[-1], [-1]], expected: [-1] },
      { args: [[1, 2], [2, 1]], expected: [1, 2] },
      { args: [[1, 2, 3], [2, 1, 3]], expected: [1, 2, 3] },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['前序的第一個一定是根。', '在中序中找到根的位置 k：左邊是左子樹、右邊是右子樹，也就知道左子樹有幾個節點。', '用字典記中序每個值的索引，就不用每次線性搜尋。'],
    insight: '前序給「誰是根」，中序給「左右怎麼分」。',
    solution: `idx = 中序 值 → 索引
函式 build(preL, inL, size):
    如果 size <= 0: 回傳 null
    rootVal = preorder[preL]; k = idx[rootVal]; leftSize = k - inL
    node = 新節點(rootVal)
    node.left = build(preL + 1, inL, leftSize)
    node.right = build(preL + 1 + leftSize, k + 1, size - leftSize - 1)
    回傳 node`,
  }, {
    helpers: [defRet('build', ['preL', 'inL', 'size'], [
      If(o('size', '<=', 0), Ret(NULL())),
      set('rootVal', at('preorder', 'preL')),
      set('k', mget('idx', 'rootVal')),
      set('leftSize', o('k', '-', 'inL')),
      set('node', tree('rootVal')),
      nset('node', 'left', callR('build', ['preL', 'inL', 'size'], [o('preL', '+', 1), 'inL', 'leftSize'])),
      nset('node', 'right', callR('build', ['preL', 'inL', 'size'], [o(o('preL', '+', 1), '+', 'leftSize'), o('k', '+', 1), o(o('size', '-', 'leftSize'), '-', 1)])),
    ], 'node')],
    body: [
      set('idx', mapNew()),
      For('i', 0, len('inorder'), 1, mset('idx', at('inorder', 'i'), 'i')),
      Ret(callR('build', ['preL', 'inL', 'size'], [0, 0, len('preorder')])),
    ],
  });

  add({
    id: 'construct-in-post', no: 106, title: 'Construct Binary Tree from Inorder and Postorder Traversal', zh: '從中序與後序走訪建構二元樹', difficulty: 'Medium', lists: ['T150'], pattern: 'treeDfs',
    fn: 'buildTree', params: ['inorder', 'postorder'], output: 'tree', sig: 'TreeNode; int[], int[]',
    desc: `<p>給二元樹的中序走訪和後序走訪（值都不重複），建構出這棵樹。</p>`,
    tests: [
      { args: [[9, 3, 15, 20, 7], [9, 15, 7, 20, 3]], expected: [3, 9, 20, null, null, 15, 7] },
      { args: [[-1], [-1]], expected: [-1] },
      { args: [[2, 1], [2, 1]], expected: [1, 2] },
      { args: [[1, 2], [2, 1]], expected: [1, null, 2] },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['後序的最後一個是根。', '一樣用中序找根的位置，分出左右子樹的大小。', '後序是「左 → 右 → 根」，所以根的前面先是右子樹、再往前是左子樹。'],
    insight: '跟前序 + 中序同一招，只是根在後序的尾巴。',
    solution: `idx = 中序 值 → 索引
函式 build(postR, inL, size):
    如果 size <= 0: 回傳 null
    rootVal = postorder[postR]; k = idx[rootVal]
    leftSize = k - inL; rightSize = size - leftSize - 1
    node.right = build(postR - 1, k + 1, rightSize)
    node.left = build(postR - 1 - rightSize, inL, leftSize)
    回傳 node`,
  }, {
    helpers: [defRet('build', ['postR', 'inL', 'size'], [
      If(o('size', '<=', 0), Ret(NULL())),
      set('rootVal', at('postorder', 'postR')),
      set('k', mget('idx', 'rootVal')),
      set('leftSize', o('k', '-', 'inL')),
      set('rightSize', o(o('size', '-', 'leftSize'), '-', 1)),
      set('node', tree('rootVal')),
      nset('node', 'right', callR('build', ['postR', 'inL', 'size'], [o('postR', '-', 1), o('k', '+', 1), 'rightSize'])),
      nset('node', 'left', callR('build', ['postR', 'inL', 'size'], [o(o('postR', '-', 1), '-', 'rightSize'), 'inL', 'leftSize'])),
    ], 'node')],
    body: [
      set('idx', mapNew()),
      For('i', 0, len('inorder'), 1, mset('idx', at('inorder', 'i'), 'i')),
      Ret(callR('build', ['postR', 'inL', 'size'], [o(len('postorder'), '-', 1), 0, len('inorder')])),
    ],
  });

  add({
    id: 'populating-next-ii', no: 117, title: 'Populating Next Right Pointers in Each Node II', zh: '填充每個節點的下一個右側節點指標 II', difficulty: 'Medium', lists: ['T150'], pattern: 'treeBfs',
    fn: 'connect', params: ['root'], types: { root: 'nextTree' }, output: 'nextTree', nodeKind: 'NextNode', sig: 'NextNode; NextNode',
    desc: `<p>每個樹節點多一個 <code>next</code> 指標，讓它指向<b>同一層右邊的下一個節點</b>，最右邊的指向 null。回傳根。</p><p class="muted">輸出格式：依 next 指標逐層列出，每層後面加 "#"。</p>`,
    tests: [
      { args: [[1, 2, 3, 4, 5, null, 7]], expected: [1, '#', 2, 3, '#', 4, 5, 7, '#'] },
      { args: [[]], expected: [] },
      { args: [[1]], expected: [1, '#'] },
      { args: [[1, 2, 3, 4, 5, 6, 7]], expected: [1, '#', 2, 3, '#', 4, 5, 6, 7, '#'] },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['層序走訪（BFS）：用佇列一層一層處理。', '同一層的節點依序取出，前一個的 next 指向目前這個。'],
    insight: 'BFS 的「一次處理一整層」寫法：先記下這層的大小 size，再取 size 次。（進階：利用已建好的 next 指標做到 O(1) 空間）',
    solution: `如果 root 是 null: 回傳 root
q = [root]
當 q 不空:
    size = q 的長度, prev = null
    重複 size 次:
        node = 取出 q 的第一個
        如果 prev: prev.next = node
        prev = node
        把 node 的左右子放進 q
回傳 root`,
  }, { body: [
    If(isNull('root'), Ret('root')),
    set('q', list('root')),
    While(not(isEmpty('q')), [
      set('size', len('q')),
      set('prev', NULL()),
      Repeat('size', [
        set('node', popFirst('q')),
        If(nn('prev'), nset('prev', 'next', 'node')),
        set('prev', 'node'),
        If(nn(L('node')), push('q', L('node'))),
        If(nn(R('node')), push('q', R('node'))),
      ]),
    ]),
    Ret('root'),
  ] });

  add({
    id: 'flatten-tree', no: 114, title: 'Flatten Binary Tree to Linked List', zh: '二元樹展開為鏈結串列', difficulty: 'Medium', lists: ['T150'], pattern: 'treeDfs',
    fn: 'flatten', params: ['root'], types: { root: 'tree' }, output: 'tree', sig: 'void; TreeNode', resultFrom: 'arg0',
    desc: `<p>把二元樹原地展開成「只用 right 指標」的串列，順序和前序走訪相同，left 全部設成 null。</p>`,
    tests: [
      { args: [[1, 2, 5, 3, 4, null, 6]], expected: [1, null, 2, null, 3, null, 4, null, 5, null, 6] },
      { args: [[]], expected: [] },
      { args: [[0]], expected: [0] },
      { args: [[1, 2]], expected: [1, null, 2] },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['對每個有左子樹的節點 cur：左子樹要插到 cur 和 cur.right 之間。', '左子樹「最右邊的節點」pre 就是前序中右子樹的前一個 → pre.right = cur.right。', '然後 cur.right = cur.left，cur.left = null，往右繼續。'],
    insight: '找「前驅節點」把右子樹接過去，就能 O(1) 空間原地改造（Morris 走訪的想法）。',
    solution: `cur = root
當 cur:
    如果 cur.left:
        pre = cur.left; 當 pre.right: pre = pre.right
        pre.right = cur.right
        cur.right = cur.left; cur.left = null
    cur = cur.right`,
  }, { body: [
    set('cur', 'root'),
    While(nn('cur'), [
      If(nn(L('cur')), [
        set('pre', L('cur')),
        While(nn(R('pre')), set('pre', R('pre'))),
        nset('pre', 'right', R('cur')),
        nset('cur', 'right', L('cur')),
        nset('cur', 'left', NULL()),
      ]),
      set('cur', R('cur')),
    ]),
  ] });

  add({
    id: 'path-sum', no: 112, title: 'Path Sum', zh: '路徑總和', difficulty: 'Easy', lists: ['T150'], pattern: 'treeDfs',
    fn: 'hasPathSum', params: ['root', 'targetSum'], types: { root: 'tree' }, sig: 'bool; TreeNode, int',
    desc: `<p>是否存在一條從根到<b>葉子</b>的路徑，節點值加總等於 <code>targetSum</code>？</p>`,
    tests: [
      { args: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], 22], expected: true },
      { args: [[1, 2, 3], 5], expected: false },
      { args: [[], 0], expected: false },
      { args: [[1, 2], 1], expected: false },
      { args: [[1, 2], 3], expected: true },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['往下走的時候，把 target 減掉目前節點的值。', '到葉子時檢查剩下的是不是剛好等於葉子的值。', '注意：必須是「葉子」，只有一邊子樹的節點不算終點。'],
    insight: '把「累加」改成「剩下多少」，遞迴參數就只要一個數字。',
    solution: `函式 has(node, rem):
    如果 node 是 null: 回傳 false
    如果 node 是葉子: 回傳 rem == node.val
    回傳 has(node.left, rem - node.val) 或 has(node.right, rem - node.val)
回傳 has(root, targetSum)`,
  }, {
    helpers: [defRet('has', ['node', 'rem'], [
      If(isNull('node'), Ret(false)),
      If(leaf('node'), Ret(o('rem', '==', val('node')))),
    ], o(callR('has', ['node', 'rem'], [L('node'), o('rem', '-', val('node'))]), 'or', callR('has', ['node', 'rem'], [R('node'), o('rem', '-', val('node'))])))],
    body: [Ret(callR('has', ['node', 'rem'], ['root', 'targetSum']))],
  });

  add({
    id: 'sum-root-to-leaf', no: 129, title: 'Sum Root to Leaf Numbers', zh: '求根到葉子節點數字之和', difficulty: 'Medium', lists: ['T150'], pattern: 'treeDfs',
    fn: 'sumNumbers', params: ['root'], types: { root: 'tree' }, sig: 'int; TreeNode',
    desc: `<p>每個節點是 0-9 的數字，每條根到葉子的路徑代表一個數（例如 1→2→3 是 123）。回傳所有這些數的總和。</p>`,
    tests: [
      { args: [[1, 2, 3]], expected: 25 },
      { args: [[4, 9, 0, 5, 1]], expected: 1026 },
      { args: [[5]], expected: 5 },
      { args: [[1, 0]], expected: 10 },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['往下走時把目前的數字帶下去：cur = cur * 10 + node.val。', '到葉子時回傳 cur；其他節點回傳左右子樹結果的和。'],
    insight: '「從上往下傳狀態」的 DFS：參數就是到目前為止的路徑資訊。',
    solution: `函式 dfs(node, cur):
    如果 node 是 null: 回傳 0
    cur = cur * 10 + node.val
    如果 node 是葉子: 回傳 cur
    回傳 dfs(node.left, cur) + dfs(node.right, cur)
回傳 dfs(root, 0)`,
  }, {
    helpers: [defRet('dfs', ['node', 'cur'], [
      If(isNull('node'), Ret(0)),
      set('cur', o(o('cur', '*', 10), '+', val('node'))),
      If(leaf('node'), Ret('cur')),
    ], o(callR('dfs', ['node', 'cur'], [L('node'), 'cur']), '+', callR('dfs', ['node', 'cur'], [R('node'), 'cur'])))],
    body: [Ret(callR('dfs', ['node', 'cur'], ['root', 0]))],
  });

  add({
    id: 'max-path-sum', no: 124, title: 'Binary Tree Maximum Path Sum', zh: '二元樹中的最大路徑和', difficulty: 'Hard', lists: ['B75', 'T150'], pattern: 'treeDfs',
    fn: 'maxPathSum', params: ['root'], types: { root: 'tree' }, sig: 'int; TreeNode',
    desc: `<p>路徑是沿著父子關係連起來的一串節點（每個節點最多用一次，不一定經過根）。回傳最大的路徑和。</p>`,
    tests: [
      { args: [[1, 2, 3]], expected: 6 },
      { args: [[-10, 9, 20, null, null, 15, 7]], expected: 42 },
      { args: [[-3]], expected: -3 },
      { args: [[2, -1]], expected: 2 },
      { args: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]], expected: 48 },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['對每個節點，「以它為最高點」的路徑 = 它自己 + 左邊往下最多能拿的 + 右邊往下最多能拿的。', '但回傳給父節點的只能選一邊（路徑不能分岔）：node.val + max(左, 右)。', '負的貢獻不如不要：gain = max(子樹結果, 0)。全域最大值用一個清單 best 來存，函式裡改 best[0]。'],
    insight: '遞迴「回傳值」和「要更新的答案」不一樣：回傳單邊，答案考慮雙邊。',
    solution: `best = [root.val]
函式 gain(node):
    如果 node 是 null: 回傳 0
    l = max(gain(node.left), 0); r = max(gain(node.right), 0)
    best[0] = max(best[0], node.val + l + r)
    回傳 node.val + max(l, r)
gain(root); 回傳 best[0]`,
  }, {
    helpers: [defRet('gain', ['node'], [
      If(isNull('node'), Ret(0)),
      set('l', max(callR('gain', ['node'], [L('node')]), 0)),
      set('r', max(callR('gain', ['node'], [R('node')]), 0)),
      setAt('best', 0, max(at('best', 0), o(o(val('node'), '+', 'l'), '+', 'r'))),
    ], o(val('node'), '+', max('l', 'r')))],
    body: [
      set('best', list(val('root'))),
      set('ignored', callR('gain', ['node'], ['root'])),
      Ret(at('best', 0)),
    ],
  });

  add({
    id: 'bst-iterator', no: 173, title: 'Binary Search Tree Iterator', zh: '二元搜尋樹迭代器', difficulty: 'Medium', lists: ['T150'], pattern: 'design',
    design: { cls: 'BSTIterator', methods: [
      { name: 'BSTIterator', params: ['root'], types: ['tree'] },
      { name: 'next', params: [] },
      { name: 'hasNext', params: [] },
    ] },
    sig: { BSTIterator: 'void; TreeNode', next: 'int;', hasNext: 'bool;' },
    desc: `<p>實作 BST 的中序迭代器：<code>next()</code> 依序回傳下一個最小的數，<code>hasNext()</code> 回傳是否還有。</p><p>平均 O(1) 時間、O(h) 空間（h 是樹高）。</p>`,
    tests: [
      { ops: ['BSTIterator', 'next', 'next', 'hasNext', 'next', 'hasNext', 'next', 'hasNext', 'next', 'hasNext'], args: [[[7, 3, 15, null, null, 9, 20]], [], [], [], [], [], [], [], [], []],
        expected: [null, 3, 7, true, 9, true, 15, true, 20, false] },
      { ops: ['BSTIterator', 'hasNext', 'next', 'hasNext'], args: [[[1]], [], [], []], expected: [null, true, 1, false] },
    ],
    time: 'O(1)', space: 'O(n)',
    hints: ['把遞迴的中序走訪「攤開」成手動的堆疊。', '一開始把根一路往左的節點都放進堆疊。', 'next：取出頂端，再把它的右子樹一路往左放進堆疊。'],
    insight: '迭代器 = 把遞迴的呼叫堆疊存成資料，每次只往前走一步。',
    solution: `BSTIterator(root): st = []; pushLeft(root)
pushLeft(node): 當 node: 放入 st; node = node.left
next(): node = 取出 st 頂端; pushLeft(node.right); 回傳 node.val
hasNext(): 回傳 st 不是空的`,
  }, {
    helpers: [def('pushLeft', ['node'], While(nn('node'), [push('st', 'node'), set('node', L('node'))]))],
    methods: {
      BSTIterator: [set('st', empty()), call('pushLeft', ['node'], ['root'])],
      next: [set('top', pop('st')), call('pushLeft', ['node'], [R('top')]), Ret(val('top'))],
      hasNext: [Ret(not(isEmpty('st')))],
    },
  });

  add({
    id: 'count-complete-nodes', no: 222, title: 'Count Complete Tree Nodes', zh: '完全二元樹的節點個數', difficulty: 'Easy', lists: ['T150'], pattern: 'treeDfs',
    fn: 'countNodes', params: ['root'], types: { root: 'tree' }, sig: 'int; TreeNode',
    desc: `<p>給一棵<b>完全二元樹</b>，回傳節點數。要求比 O(n) 更快。</p>`,
    tests: [
      { args: [[1, 2, 3, 4, 5, 6]], expected: 6 },
      { args: [[]], expected: 0 },
      { args: [[1]], expected: 1 },
      { args: [[1, 2, 3, 4]], expected: 4 },
      { args: [[1, 2, 3, 4, 5, 6, 7]], expected: 7 },
    ],
    time: 'O(log² n)', space: 'O(log n)',
    hints: ['一路往左走的深度 lh、一路往右走的深度 rh。', '如果 lh == rh，這是滿二元樹，節點數 = 2^lh − 1（用 1 << lh）。', '否則遞迴：1 + count(左) + count(右)；其中一邊一定是滿的，很快就結束。'],
    insight: '利用「完全樹」的結構，每層只需要往下走一條路。',
    solution: `函式 count(node):
    如果 node 是 null: 回傳 0
    lh = 一路往左的高度, rh = 一路往右的高度
    如果 lh == rh: 回傳 (1 << lh) - 1
    回傳 1 + count(node.left) + count(node.right)`,
  }, {
    helpers: [defRet('count', ['node'], [
      If(isNull('node'), Ret(0)),
      set('lh', 0), set('cur', 'node'),
      While(nn('cur'), [inc('lh', 1), set('cur', L('cur'))]),
      set('rh', 0), set('cur', 'node'),
      While(nn('cur'), [inc('rh', 1), set('cur', R('cur'))]),
      If(o('lh', '==', 'rh'), Ret(o(o(1, '<<', 'lh'), '-', 1))),
    ], o(o(1, '+', callR('count', ['node'], [L('node')])), '+', callR('count', ['node'], [R('node')])))],
    body: [Ret(callR('count', ['node'], ['root']))],
  });

  add({
    id: 'lca-binary-tree', no: 236, title: 'Lowest Common Ancestor of a Binary Tree', zh: '二元樹的最近共同祖先', difficulty: 'Medium', lists: ['T150'], pattern: 'treeDfs',
    fn: 'lowestCommonAncestor', params: ['root', 'p', 'q'], types: { root: 'tree', p: 'treeNodeRef', q: 'treeNodeRef' }, output: 'nodeVal', sig: 'TreeNode; TreeNode, TreeNode, TreeNode',
    desc: `<p>找出節點 p 和 q 的最近共同祖先（一個節點也可以是自己的祖先）。</p><p class="muted">測資中 p、q 寫成節點的值，傳進函式時是樹裡的節點；輸出顯示答案節點的值。</p>`,
    tests: [
      { args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 1], expected: 3 },
      { args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 4], expected: 5 },
      { args: [[1, 2], 1, 2], expected: 1 },
      { args: [[1, 2, 3], 2, 3], expected: 1 },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['函式 lca(node)：回傳在 node 這棵子樹裡找到的 p 或 q（或它們的共同祖先）。', '遇到 null、p 或 q 就直接回傳自己。', '左右兩邊都找到東西 → node 就是答案；只有一邊有 → 回傳那一邊。'],
    insight: '後序遞迴：讓子樹「回報找到什麼」，在第一個兩邊都有回報的節點匯合。',
    solution: `函式 lca(node):
    如果 node 是 null 或 node == p 或 node == q: 回傳 node
    l = lca(node.left); r = lca(node.right)
    如果 l 和 r 都不是 null: 回傳 node
    回傳 (l 不是 null ? l : r)
回傳 lca(root)`,
  }, {
    helpers: [defRet('lca', ['node'], [
      If(o(o(isNull('node'), 'or', o('node', '==', 'p')), 'or', o('node', '==', 'q')), Ret('node')),
      set('l', callR('lca', ['node'], [L('node')])),
      set('r', callR('lca', ['node'], [R('node')])),
      If(o(nn('l'), 'and', nn('r')), Ret('node')),
    ], tern(nn('l'), 'l', 'r'))],
    body: [Ret(callR('lca', ['node'], ['root']))],
  });

  add({
    id: 'lca-bst', no: 235, title: 'Lowest Common Ancestor of a Binary Search Tree', zh: '二元搜尋樹的最近共同祖先', difficulty: 'Medium', lists: ['B75'], pattern: 'bst',
    fn: 'lowestCommonAncestor', params: ['root', 'p', 'q'], types: { root: 'tree', p: 'treeNodeRef', q: 'treeNodeRef' }, output: 'nodeVal', sig: 'TreeNode; TreeNode, TreeNode, TreeNode',
    desc: `<p>在<b>二元搜尋樹</b>中找出 p 和 q 的最近共同祖先。</p><p class="muted">測資中 p、q 寫成節點的值；輸出顯示答案節點的值。</p>`,
    tests: [
      { args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 8], expected: 6 },
      { args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 4], expected: 2 },
      { args: [[2, 1], 2, 1], expected: 2 },
      { args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 3, 5], expected: 4 },
    ],
    time: 'O(log n)', space: 'O(1)',
    hints: ['BST：左邊都比較小、右邊都比較大。', 'p、q 都比目前節點小 → 答案在左邊；都比較大 → 在右邊。', '否則它們分在兩邊（或其中一個就是目前節點）→ 目前節點就是答案。'],
    insight: '善用 BST 的順序性質，不用遞迴兩邊，一路往下就好。',
    solution: `cur = root
當 cur:
    如果 p.val < cur.val 且 q.val < cur.val: cur = cur.left
    否則如果 p.val > cur.val 且 q.val > cur.val: cur = cur.right
    否則: 回傳 cur
回傳 null`,
  }, { body: [
    set('cur', 'root'),
    While(nn('cur'), IfChain([
      [o(o(val('p'), '<', val('cur')), 'and', o(val('q'), '<', val('cur'))), set('cur', L('cur'))],
      [o(o(val('p'), '>', val('cur')), 'and', o(val('q'), '>', val('cur'))), set('cur', R('cur'))],
    ], Ret('cur'))),
    Ret(NULL()),
  ] });

  add({
    id: 'right-side-view', no: 199, title: 'Binary Tree Right Side View', zh: '二元樹的右視圖', difficulty: 'Medium', lists: ['T150'], pattern: 'treeBfs',
    fn: 'rightSideView', params: ['root'], types: { root: 'tree' }, sig: 'List<int>; TreeNode',
    desc: `<p>站在樹的右邊往左看，由上到下回傳看得到的節點值。</p>`,
    tests: [
      { args: [[1, 2, 3, null, 5, null, 4]], expected: [1, 3, 4] },
      { args: [[1, null, 3]], expected: [1, 3] },
      { args: [[]], expected: [] },
      { args: [[1, 2, 3, 4]], expected: [1, 3, 4] },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['看得到的 = 每一層最右邊的節點。', 'BFS 一層一層走，每層的最後一個加入答案。'],
    insight: '「每一層的某個節點」→ 層序走訪。',
    solution: `如果 root 是 null: 回傳 []
q = [root]
當 q 不空:
    size = q 的長度
    對 i 從 0 到 size: node = 取出第一個; 如果 i == size-1: 加入 node.val; 放入左右子
回傳 res`,
  }, { body: [
    set('res', empty()),
    If(isNull('root'), Ret('res')),
    ...bfs([], [If(o('i', '==', o('size', '-', 1)), push('res', val('node')))], []),
    Ret('res'),
  ] });

  add({
    id: 'average-of-levels', no: 637, title: 'Average of Levels in Binary Tree', zh: '二元樹的層平均值', difficulty: 'Easy', lists: ['T150'], pattern: 'treeBfs',
    fn: 'averageOfLevels', params: ['root'], types: { root: 'tree' }, sig: 'List<double>; TreeNode', compare: 'float',
    desc: `<p>回傳每一層節點值的平均數（誤差 10⁻⁵ 以內都算對）。</p>`,
    tests: [
      { args: [[3, 9, 20, null, null, 15, 7]], expected: [3, 14.5, 11] },
      { args: [[3, 9, 20, 15, 7]], expected: [3, 14.5, 11] },
      { args: [[1]], expected: [1] },
      { args: [[1, 2]], expected: [1, 2] },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['BFS 一層一層走，每層把值加總再除以這層的數量。', '注意除法要用小數除法。'],
    insight: '層序走訪的標準模板：外層迴圈一層，內層迴圈這層的每個節點。',
    solution: `q = [root]
當 q 不空:
    size = q 的長度, total = 0
    重複 size 次: node = 取出第一個; total += node.val; 放入左右子
    加入 total / size
回傳 res`,
  }, { body: [
    set('res', empty()),
    ...bfs([set('total', 0)], [set('total', o('total', '+', val('node')))], [push('res', o('total', '/', 'size'))]),
    Ret('res'),
  ] });

  add({
    id: 'level-order', no: 102, title: 'Binary Tree Level Order Traversal', zh: '二元樹的層序走訪', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'treeBfs',
    fn: 'levelOrder', params: ['root'], types: { root: 'tree' }, sig: 'List<List<int>>; TreeNode',
    desc: `<p>由上到下、每層由左到右，回傳每一層的節點值（每層一個清單）。</p>`,
    tests: [
      { args: [[3, 9, 20, null, null, 15, 7]], expected: [[3], [9, 20], [15, 7]] },
      { args: [[1]], expected: [[1]] },
      { args: [[]], expected: [] },
      { args: [[1, 2, 3, 4, null, null, 5]], expected: [[1], [2, 3], [4, 5]] },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['佇列 + 每層先記下 size。', '每層開一個新清單，取出 size 個節點放進去。'],
    insight: 'BFS 模板題，所有「按層處理」的樹題都是它的變形。',
    solution: `如果 root 是 null: 回傳 []
q = [root]
當 q 不空:
    level = []; size = q 的長度
    重複 size 次: node = 取出第一個; 加入 node.val 到 level; 放入左右子
    加入 level 到 res
回傳 res`,
  }, { body: [
    set('res', empty()),
    If(isNull('root'), Ret('res')),
    ...bfs([set('level', empty())], [push('level', val('node'))], [push('res', 'level')]),
    Ret('res'),
  ] });

  add({
    id: 'zigzag-level-order', no: 103, title: 'Binary Tree Zigzag Level Order Traversal', zh: '二元樹的鋸齒形層序走訪', difficulty: 'Medium', lists: ['T150'], pattern: 'treeBfs',
    fn: 'zigzagLevelOrder', params: ['root'], types: { root: 'tree' }, sig: 'List<List<int>>; TreeNode',
    desc: `<p>層序走訪，但方向交替：第一層左到右、第二層右到左、第三層左到右…</p>`,
    tests: [
      { args: [[3, 9, 20, null, null, 15, 7]], expected: [[3], [20, 9], [15, 7]] },
      { args: [[1]], expected: [[1]] },
      { args: [[]], expected: [] },
      { args: [[1, 2, 3, 4, 5, 6, 7]], expected: [[1], [3, 2], [4, 5, 6, 7]] },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['照一般層序走訪收集每層。', '用一個布林值記方向，需要「右到左」的層就把 level 反轉。'],
    insight: '先用最熟的模板，再對結果做小修改。',
    solution: `一般層序走訪，leftToRight = true
每層收集完: 如果 leftToRight 是 false: 反轉 level
加入 level; leftToRight = not leftToRight`,
  }, { body: [
    set('res', empty()),
    If(isNull('root'), Ret('res')),
    set('leftToRight', true),
    ...bfs([set('level', empty())], [push('level', val('node'))], [
      If(not('leftToRight'), reverse('level')),
      push('res', 'level'),
      set('leftToRight', not('leftToRight')),
    ]),
    Ret('res'),
  ] });

  const inorderLoop = (visit) => [
    set('st', empty()), set('cur', 'root'),
    While(o(nn('cur'), 'or', not(isEmpty('st'))), [
      While(nn('cur'), [push('st', 'cur'), set('cur', L('cur'))]),
      set('cur', pop('st')),
      ...visit,
      set('cur', R('cur')),
    ]),
  ];
  add({
    id: 'min-abs-diff-bst', no: 530, title: 'Minimum Absolute Difference in BST', zh: '二元搜尋樹的最小絕對差', difficulty: 'Easy', lists: ['T150'], pattern: 'bst',
    fn: 'getMinimumDifference', params: ['root'], types: { root: 'tree' }, sig: 'int; TreeNode',
    desc: `<p>回傳 BST 中任意兩個節點值的最小差（絕對值）。</p>`,
    tests: [
      { args: [[4, 2, 6, 1, 3]], expected: 1 },
      { args: [[1, 0, 48, null, null, 12, 49]], expected: 1 },
      { args: [[5, 1, 8]], expected: 3 },
      { args: [[10, 5, 15]], expected: 5 },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['BST 的中序走訪是由小到大排序的。', '排序後，最小差一定出現在相鄰的兩個數之間。', '中序走訪時記住「上一個值」。'],
    insight: 'BST + 中序 = 排序好的序列，很多 BST 題都靠這點。',
    solution: `中序走訪（用堆疊）:
    每拜訪一個節點: 如果有上一個值: best = min(best, cur.val - prev)
    prev = cur.val
回傳 best`,
  }, { body: [
    set('best', INF()), set('prevVal', 0), set('hasPrev', false),
    ...inorderLoop([
      If('hasPrev', set('best', min('best', o(val('cur'), '-', 'prevVal')))),
      set('prevVal', val('cur')),
      set('hasPrev', true),
    ]),
    Ret('best'),
  ] });

  add({
    id: 'kth-smallest-bst', no: 230, title: 'Kth Smallest Element in a BST', zh: '二元搜尋樹中第 K 小的元素', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'bst',
    fn: 'kthSmallest', params: ['root', 'k'], types: { root: 'tree' }, sig: 'int; TreeNode, int',
    desc: `<p>回傳 BST 中第 k 小的值（k 從 1 開始）。</p>`,
    tests: [
      { args: [[3, 1, 4, null, 2], 1], expected: 1 },
      { args: [[5, 3, 6, 2, 4, null, null, 1], 3], expected: 3 },
      { args: [[1], 1], expected: 1 },
      { args: [[2, 1, 3], 3], expected: 3 },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['中序走訪會由小到大拜訪。', '數到第 k 個就回傳，不用走完整棵樹。'],
    insight: '迭代式中序走訪可以「中途停下來」，比遞迴更好控制。',
    solution: `中序走訪（用堆疊）:
    每拜訪一個節點: k -= 1; 如果 k == 0: 回傳 cur.val`,
  }, { body: [
    ...inorderLoop([inc('k', -1), If(o('k', '==', 0), Ret(val('cur')))]),
    Ret(-1),
  ] });

  add({
    id: 'validate-bst', no: 98, title: 'Validate Binary Search Tree', zh: '驗證二元搜尋樹', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'bst',
    fn: 'isValidBST', params: ['root'], types: { root: 'tree' }, sig: 'bool; TreeNode',
    desc: `<p>判斷是否為有效的 BST：左子樹所有值 &lt; 節點值 &lt; 右子樹所有值（嚴格），且每棵子樹也是 BST。</p>`,
    tests: [
      { args: [[2, 1, 3]], expected: true },
      { args: [[5, 1, 4, null, null, 3, 6]], expected: false },
      { args: [[5, 4, 6, null, null, 3, 7]], expected: false },
      { args: [[2, 2, 2]], expected: false },
      { args: [[1]], expected: true },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['只比較父子是不夠的（第 3 個測資：3 在 5 的右子樹裡，卻比 5 小）。', '往下傳「允許的範圍」：上界節點 hi、下界節點 lo（null 表示沒有限制）。', '往左走：上界變成目前節點；往右走：下界變成目前節點。'],
    insight: '把祖先的限制當成參數往下傳。',
    solution: `函式 ok(node, lo, hi):
    如果 node 是 null: 回傳 true
    如果 lo 且 node.val <= lo.val: 回傳 false
    如果 hi 且 node.val >= hi.val: 回傳 false
    回傳 ok(node.left, lo, node) 且 ok(node.right, node, hi)
回傳 ok(root, null, null)`,
  }, {
    helpers: [defRet('ok', ['node', 'lo', 'hi'], [
      If(isNull('node'), Ret(true)),
      If(o(nn('lo'), 'and', o(val('node'), '<=', val('lo'))), Ret(false)),
      If(o(nn('hi'), 'and', o(val('node'), '>=', val('hi'))), Ret(false)),
    ], o(callR('ok', ['node', 'lo', 'hi'], [L('node'), 'lo', 'node']), 'and', callR('ok', ['node', 'lo', 'hi'], [R('node'), 'node', 'hi'])))],
    body: [Ret(callR('ok', ['node', 'lo', 'hi'], ['root', NULL(), NULL()]))],
  });

  add({
    id: 'subtree-of-another', no: 572, title: 'Subtree of Another Tree', zh: '另一棵樹的子樹', difficulty: 'Easy', lists: ['B75'], pattern: 'treeDfs',
    fn: 'isSubtree', params: ['root', 'subRoot'], types: { root: 'tree', subRoot: 'tree' }, sig: 'bool; TreeNode, TreeNode',
    desc: `<p>判斷 <code>subRoot</code> 是否為 <code>root</code> 的某個子樹（某個節點連同它所有的子孫，跟 subRoot 完全相同）。</p>`,
    tests: [
      { args: [[3, 4, 5, 1, 2], [4, 1, 2]], expected: true },
      { args: [[3, 4, 5, 1, 2, null, null, null, null, 0], [4, 1, 2]], expected: false },
      { args: [[1, 1], [1]], expected: true },
      { args: [[1], [2]], expected: false },
    ],
    time: 'O(n·k)', space: 'O(n)',
    hints: ['先寫「相同的樹」same(a, b)。', '對 root 的每個節點，檢查 same(節點, subRoot)。'],
    insight: '組合兩個遞迴：外層走遍每個節點，內層比較兩棵樹。',
    solution: `函式 same(a, b): ...（同「相同的樹」）
函式 check(node):
    如果 node 是 null: 回傳 false
    如果 same(node, subRoot): 回傳 true
    回傳 check(node.left) 或 check(node.right)
回傳 check(root)`,
  }, {
    helpers: [
      defRet('same', ['a', 'b'], [
        If(o(isNull('a'), 'and', isNull('b')), Ret(true)),
        If(o(isNull('a'), 'or', isNull('b')), Ret(false)),
        If(o(val('a'), '!=', val('b')), Ret(false)),
      ], o(callR('same', ['a', 'b'], [L('a'), L('b')]), 'and', callR('same', ['a', 'b'], [R('a'), R('b')]))),
      defRet('check', ['node'], [
        If(isNull('node'), Ret(false)),
        If(callR('same', ['a', 'b'], ['node', 'subRoot']), Ret(true)),
      ], o(callR('check', ['node'], [L('node')]), 'or', callR('check', ['node'], [R('node')]))),
    ],
    body: [Ret(callR('check', ['node'], ['root']))],
  });

  add({
    id: 'serialize-deserialize-tree', no: 297, title: 'Serialize and Deserialize Binary Tree', zh: '二元樹的序列化與反序列化', difficulty: 'Hard', lists: ['B75'], pattern: 'design',
    design: { cls: 'Codec', roundtrip: ['serialize', 'deserialize'], inputType: 'tree', methods: [
      { name: 'Codec', params: [] },
      { name: 'serialize', params: ['root'], types: ['tree'] },
      { name: 'deserialize', params: ['data'], output: 'tree' },
    ] },
    sig: { Codec: 'void;', serialize: 'string; TreeNode', deserialize: 'TreeNode; string' },
    desc: `<p>設計 serialize：把二元樹轉成字串；deserialize：把字串還原成同一棵樹。格式由你決定。</p><p class="muted">測試會檢查 deserialize(serialize(樹)) 是否和原本一樣。</p>`,
    tests: [
      { args: [[1, 2, 3, null, null, 4, 5]], expected: [1, 2, 3, null, null, 4, 5] },
      { args: [[]], expected: [] },
      { args: [[1]], expected: [1] },
      { args: [[1, 2, null, 3]], expected: [1, 2, null, 3] },
      { args: [[-1, 0, 1]], expected: [-1, 0, 1] },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['用前序走訪，空節點也要記下來（例如 "#"），這樣結構才唯一。', '序列化：前序走訪，把值和 "#" 用逗號接起來。', '反序列化：切開後依序取出，用同樣的前序遞迴建回來。'],
    insight: '「前序 + 空節點標記」就能唯一決定一棵樹。',
    solution: `serialize(root): out = []; ser(root); 回傳 用 "," 接起來
ser(node): null → 加入 "#"；否則加入 值，再 ser(左)、ser(右)
deserialize(data): tokens = 依 "," 切開; 回傳 des()
des(): t = 取出 tokens 第一個; "#" → null
    node = 新節點(數字(t)); node.left = des(); node.right = des(); 回傳 node`,
  }, {
    helpers: [
      def('ser', ['node'], [
        If(isNull('node'), [push('out', str('#')), Ret()]),
        push('out', concat(str(''), val('node'))),
        call('ser', ['node'], [L('node')]),
        call('ser', ['node'], [R('node')]),
      ]),
      defRet('des', [], [
        set('t', popFirst('tokens')),
        If(o('t', '==', str('#')), Ret(NULL())),
        set('node', tree(toNum('t'))),
        nset('node', 'left', callR('des', [], [])),
        nset('node', 'right', callR('des', [], [])),
      ], 'node'),
    ],
    methods: {
      Codec: [],
      serialize: [set('out', empty()), call('ser', ['node'], ['root']), Ret(join('out', str(',')))],
      deserialize: [set('tokens', split('data', str(','))), Ret(callR('des', [], []))],
    },
  });

  add({
    id: 'sorted-array-to-bst', no: 108, title: 'Convert Sorted Array to Binary Search Tree', zh: '將有序陣列轉換為二元搜尋樹', difficulty: 'Easy', lists: ['T150'], pattern: 'divide',
    fn: 'sortedArrayToBST', params: ['nums'], output: 'tree', sig: 'TreeNode; int[]', check: 'balancedBST',
    desc: `<p>把由小到大排序的陣列轉成<b>高度平衡</b>的 BST（任意節點左右子樹高度差 ≤ 1）。答案不唯一，任何正確的都算對。</p>`,
    tests: [
      { args: [[-10, -3, 0, 5, 9]], expected: [0, -3, 9, -10, null, 5] },
      { args: [[1, 3]], expected: [3, 1] },
      { args: [[0]], expected: [0] },
      { args: [[1, 2, 3, 4, 5, 6, 7]], expected: [4, 2, 6, 1, 3, 5, 7] },
    ],
    time: 'O(n)', space: 'O(log n)',
    hints: ['選中間的元素當根，左右兩半的數量就差不多。', '左半邊遞迴建左子樹，右半邊遞迴建右子樹。'],
    insight: '分治：「選中間當根」自然保證平衡。',
    solution: `函式 build(l, r):
    如果 l > r: 回傳 null
    m = (l + r) // 2
    node = 新節點(nums[m])
    node.left = build(l, m - 1); node.right = build(m + 1, r)
    回傳 node
回傳 build(0, n - 1)`,
  }, {
    helpers: [defRet('build', ['l', 'r'], [
      If(o('l', '>', 'r'), Ret(NULL())),
      set('m', o(o('l', '+', 'r'), '//', 2)),
      set('node', tree(at('nums', 'm'))),
      nset('node', 'left', callR('build', ['l', 'r'], ['l', o('m', '-', 1)])),
      nset('node', 'right', callR('build', ['l', 'r'], [o('m', '+', 1), 'r'])),
    ], 'node')],
    body: [Ret(callR('build', ['l', 'r'], [0, o(len('nums'), '-', 1)]))],
  });
})();
