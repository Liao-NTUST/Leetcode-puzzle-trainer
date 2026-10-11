// 第 B 批：雜湊 / 矩陣 / 區間 / 堆疊 / 回文 / 設計題
(function () {
  const { set, inc, Ret, If, IfChain, For, Each, While, Continue, Break, at, setAt, len, push, pop, popStmt, last, isEmpty, empty, list, grid, sort, sortBy, reverse, slice,
    concat, split, join, digit, toNum, mapNew, mset, mget, mgetd, mhas, mapDel, setNew, sadd, shas, o, not, tern, max, min, str, rand } = Solutions.dsl;
  const add = (p, sol) => { PROBLEMS.push(p); Solutions.add(p.id, sol); };

  add({
    id: 'isomorphic-strings', no: 205, title: 'Isomorphic Strings', zh: '同構字串', difficulty: 'Easy', lists: ['T150'], pattern: 'hash',
    fn: 'isIsomorphic', params: ['s', 't'], sig: 'bool; string, string',
    desc: `<p>如果 <code>s</code> 的字元可以一對一替換得到 <code>t</code>（同一個字元一定換成同一個，不同字元不能換成同一個），就是同構。</p>`,
    tests: [
      { args: ['egg', 'add'], expected: true },
      { args: ['foo', 'bar'], expected: false },
      { args: ['paper', 'title'], expected: true },
      { args: ['badc', 'baba'], expected: false },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['「一對一」要檢查兩個方向。', '用兩個字典：s→t 和 t→s。只要有一邊對不上就失敗。'],
    insight: '雙射（一對一）= 兩個方向的映射都要一致。',
    solution: `st = 空字典, ts = 空字典
對 i 從 0 到 n:
    a = s[i], b = t[i]
    如果 st 有 a 且 st[a] ≠ b: 回傳 false
    如果 ts 有 b 且 ts[b] ≠ a: 回傳 false
    st[a] = b; ts[b] = a
回傳 true`,
  }, { body: [
    set('st', mapNew()), set('ts', mapNew()),
    For('i', 0, len('s'), 1, [
      set('a', at('s', 'i')), set('b', at('t', 'i')),
      If(o(mhas('st', 'a'), 'and', o(mget('st', 'a'), '!=', 'b')), Ret(false)),
      If(o(mhas('ts', 'b'), 'and', o(mget('ts', 'b'), '!=', 'a')), Ret(false)),
      mset('st', 'a', 'b'), mset('ts', 'b', 'a'),
    ]),
    Ret(true),
  ] });

  add({
    id: 'word-pattern', no: 290, title: 'Word Pattern', zh: '單字規律', difficulty: 'Easy', lists: ['T150'], pattern: 'hash',
    fn: 'wordPattern', params: ['pattern', 's'], sig: 'bool; string, string',
    desc: `<p>判斷字串 <code>s</code>（用空格分隔的單字）是否遵循 <code>pattern</code> 的規律：pattern 的每個字母一對一對應到一個單字。</p>`,
    tests: [
      { args: ['abba', 'dog cat cat dog'], expected: true },
      { args: ['abba', 'dog cat cat fish'], expected: false },
      { args: ['aaaa', 'dog cat cat dog'], expected: false },
      { args: ['abba', 'dog dog dog dog'], expected: false },
      { args: ['aaa', 'aa aa aa aa'], expected: false },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['先把 s 切成單字，數量不同就直接 false。', '跟同構字串一樣，兩個方向都要一致。'],
    insight: '同構問題換個外衣：字母 ↔ 單字的雙射。',
    solution: `words = 把 s 依空格切開
如果 len(words) ≠ len(pattern): 回傳 false
對 i: 檢查 pattern[i] → words[i] 和 words[i] → pattern[i] 兩個字典都一致
回傳 true`,
  }, { body: [
    set('words', split('s', str(' '))),
    If(o(len('words'), '!=', len('pattern')), Ret(false)),
    set('pw', mapNew()), set('wp', mapNew()),
    For('i', 0, len('words'), 1, [
      set('c', at('pattern', 'i')), set('w', at('words', 'i')),
      If(o(mhas('pw', 'c'), 'and', o(mget('pw', 'c'), '!=', 'w')), Ret(false)),
      If(o(mhas('wp', 'w'), 'and', o(mget('wp', 'w'), '!=', 'c')), Ret(false)),
      mset('pw', 'c', 'w'), mset('wp', 'w', 'c'),
    ]),
    Ret(true),
  ] });

  add({
    id: 'happy-number', no: 202, title: 'Happy Number', zh: '快樂數', difficulty: 'Easy', lists: ['T150'], pattern: 'hash',
    fn: 'isHappy', params: ['n'], sig: 'bool; int',
    desc: `<p>把數字換成「各位數平方和」，一直重複。如果最後會變成 1 就是快樂數；如果陷入不含 1 的循環就不是。</p>`,
    tests: [
      { args: [19], expected: true },
      { args: [2], expected: false },
      { args: [1], expected: true },
      { args: [7], expected: true },
    ],
    time: 'O(log n)', space: 'O(log n)',
    hints: ['用集合記錄出現過的數字。', '再次出現 → 有循環 → 不是快樂數。', '取各位數：x % 10，然後 x = x // 10。'],
    insight: '「會不會陷入循環」→ 記錄看過的狀態（或快慢指標）。',
    solution: `seen = 空集合
當 n ≠ 1 且 n 不在 seen:
    把 n 放進 seen
    total = 0
    當 n > 0: d = n % 10; total += d*d; n = n // 10
    n = total
回傳 n == 1`,
  }, { body: [
    set('seen', setNew()),
    While(o(o('n', '!=', 1), 'and', not(shas('seen', 'n'))), [
      sadd('seen', 'n'),
      set('total', 0),
      While(o('n', '>', 0), [set('d', o('n', '%', 10)), set('total', o('total', '+', o('d', '*', 'd'))), set('n', o('n', '//', 10))]),
      set('n', 'total'),
    ]),
    Ret(o('n', '==', 1)),
  ] });

  add({
    id: 'contains-duplicate-ii', no: 219, title: 'Contains Duplicate II', zh: '存在重複元素 II', difficulty: 'Easy', lists: ['T150'], pattern: 'hash',
    fn: 'containsNearbyDuplicate', params: ['nums', 'k'], sig: 'bool; int[], int',
    desc: `<p>是否存在兩個不同索引 i、j，使 <code>nums[i] == nums[j]</code> 且 <code>|i − j| ≤ k</code>？</p>`,
    tests: [
      { args: [[1, 2, 3, 1], 3], expected: true },
      { args: [[1, 0, 1, 1], 1], expected: true },
      { args: [[1, 2, 3, 1, 2, 3], 2], expected: false },
      { args: [[99, 99], 2], expected: true },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['只需要跟「同一個數字上一次出現的位置」比。', '字典：數字 → 最後出現的索引。'],
    insight: '「最近一次出現在哪」= 字典記最後位置。',
    solution: `lastSeen = 空字典
對 i 從 0 到 n:
    如果 lastSeen 有 nums[i] 且 i - lastSeen[nums[i]] <= k: 回傳 true
    lastSeen[nums[i]] = i
回傳 false`,
  }, { body: [
    set('lastSeen', mapNew()),
    For('i', 0, len('nums'), 1, [
      If(o(mhas('lastSeen', at('nums', 'i')), 'and', o(o('i', '-', mget('lastSeen', at('nums', 'i'))), '<=', 'k')), Ret(true)),
      mset('lastSeen', at('nums', 'i'), 'i'),
    ]),
    Ret(false),
  ] });

  const SUDOKU = [
    ['5', '3', '.', '.', '7', '.', '.', '.', '.'], ['6', '.', '.', '1', '9', '5', '.', '.', '.'], ['.', '9', '8', '.', '.', '.', '.', '6', '.'],
    ['8', '.', '.', '.', '6', '.', '.', '.', '3'], ['4', '.', '.', '8', '.', '3', '.', '.', '1'], ['7', '.', '.', '.', '2', '.', '.', '.', '6'],
    ['.', '6', '.', '.', '.', '.', '2', '8', '.'], ['.', '.', '.', '4', '1', '9', '.', '.', '5'], ['.', '.', '.', '.', '8', '.', '.', '7', '9'],
  ];
  const variant = (r, c, v) => SUDOKU.map((row, i) => row.map((x, j) => (i === r && j === c ? v : x)));
  add({
    id: 'valid-sudoku', no: 36, title: 'Valid Sudoku', zh: '有效的數獨', difficulty: 'Medium', lists: ['T150'], pattern: 'matrix',
    fn: 'isValidSudoku', params: ['board'], sig: 'bool; char[][]',
    desc: `<p>判斷 9×9 數獨目前填的數字是否合法（不用判斷能不能解）：每列、每行、每個 3×3 宮格內 1-9 都不能重複。空格是 "."。</p>`,
    tests: [
      { args: [SUDOKU], expected: true },
      { args: [variant(0, 0, '8')], expected: false },
      { args: [variant(2, 0, '3')], expected: false },
      { args: [Array.from({ length: 9 }, () => Array(9).fill('.'))], expected: true },
    ],
    time: 'O(1)', space: 'O(1)',
    hints: ['用三組布林表格：rows[r][d]、cols[c][d]、boxes[b][d]，記錄數字 d 是否出現過。', '宮格編號 b = (r // 3) * 3 + c // 3。', '數字字元轉索引：digit(ch) − 1。'],
    insight: '同時檢查三種限制 → 每種限制一張「看過沒」的表。',
    solution: `rows, cols, boxes = 9×9 的 false
對每個 r, c:
    ch = board[r][c]; 如果 ch == '.': 繼續
    d = 數字值(ch) - 1; b = (r // 3) * 3 + c // 3
    如果 rows[r][d] 或 cols[c][d] 或 boxes[b][d]: 回傳 false
    三個都設成 true
回傳 true`,
  }, { body: [
    set('rows', grid(9, 9, false)), set('cols', grid(9, 9, false)), set('boxes', grid(9, 9, false)),
    For('r', 0, 9, 1, For('c', 0, 9, 1, [
      set('ch', at(at('board', 'r'), 'c')),
      If(o('ch', '==', str('.')), Continue()),
      set('d', o(digit('ch'), '-', 1)),
      set('b', o(o(o('r', '//', 3), '*', 3), '+', o('c', '//', 3))),
      If(o(o(at(at('rows', 'r'), 'd'), 'or', at(at('cols', 'c'), 'd')), 'or', at(at('boxes', 'b'), 'd')), Ret(false)),
      setAt(at('rows', 'r'), 'd', true), setAt(at('cols', 'c'), 'd', true), setAt(at('boxes', 'b'), 'd', true),
    ])),
    Ret(true),
  ] });

  add({
    id: 'spiral-matrix', no: 54, title: 'Spiral Matrix', zh: '螺旋矩陣', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'matrix',
    fn: 'spiralOrder', params: ['matrix'], sig: 'List<int>; int[][]',
    desc: `<p>依<b>順時針螺旋</b>順序回傳 m×n 矩陣的所有元素。</p>`,
    tests: [
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [1, 2, 3, 6, 9, 8, 7, 4, 5] },
      { args: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]], expected: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7] },
      { args: [[[1]]], expected: [1] },
      { args: [[[1, 2], [3, 4], [5, 6]]], expected: [1, 2, 4, 6, 5, 3] },
    ],
    time: 'O(m·n)', space: 'O(1)',
    hints: ['維護四個邊界 top、bottom、left、right。', '走完一條邊就把那條邊界往內縮。', '往左走和往上走之前要再檢查一次邊界，避免單列 / 單行時重複。'],
    insight: '模擬題用「邊界收縮」比用「方向 + 已拜訪」更不容易出錯。',
    solution: `top = 0, bottom = m-1, left = 0, right = n-1
當 top <= bottom 且 left <= right:
    往右走 top 列; top += 1
    往下走 right 行; right -= 1
    如果 top <= bottom: 往左走 bottom 列; bottom -= 1
    如果 left <= right: 往上走 left 行; left += 1`,
  }, { body: [
    set('res', empty()),
    set('top', 0), set('bottom', o(len('matrix'), '-', 1)), set('left', 0), set('right', o(len(at('matrix', 0)), '-', 1)),
    While(o(o('top', '<=', 'bottom'), 'and', o('left', '<=', 'right')), [
      For('c', 'left', o('right', '+', 1), 1, push('res', at(at('matrix', 'top'), 'c'))),
      inc('top', 1),
      For('r', 'top', o('bottom', '+', 1), 1, push('res', at(at('matrix', 'r'), 'right'))),
      inc('right', -1),
      If(o('top', '<=', 'bottom'), [For('c', 'right', o('left', '-', 1), -1, push('res', at(at('matrix', 'bottom'), 'c'))), inc('bottom', -1)]),
      If(o('left', '<=', 'right'), [For('r', 'bottom', o('top', '-', 1), -1, push('res', at(at('matrix', 'r'), 'left'))), inc('left', 1)]),
    ]),
    Ret('res'),
  ] });

  add({
    id: 'rotate-image', no: 48, title: 'Rotate Image', zh: '旋轉影像', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'matrix',
    fn: 'rotate', params: ['matrix'], sig: 'void; int[][]', resultFrom: 'arg0',
    desc: `<p>把 n×n 矩陣<b>順時針旋轉 90 度</b>，必須原地修改。</p>`,
    tests: [
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [[7, 4, 1], [8, 5, 2], [9, 6, 3]] },
      { args: [[[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]], expected: [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]] },
      { args: [[[1]]], expected: [[1]] },
      { args: [[[1, 2], [3, 4]]], expected: [[3, 1], [4, 2]] },
    ],
    time: 'O(n²)', space: 'O(1)',
    hints: ['順時針 90 度 = 先轉置（沿對角線翻）+ 每一列左右反轉。', '轉置：只交換 i < j 的 matrix[i][j] 和 matrix[j][i]。'],
    insight: '複雜的幾何變換拆成兩個簡單的翻轉。',
    solution: `對 i, j (j > i): 交換 matrix[i][j] 和 matrix[j][i]
對每一列: 反轉`,
  }, { body: [
    set('n', len('matrix')),
    For('i', 0, 'n', 1, For('j', o('i', '+', 1), 'n', 1, [
      set('tmp', at(at('matrix', 'i'), 'j')),
      setAt(at('matrix', 'i'), 'j', at(at('matrix', 'j'), 'i')),
      setAt(at('matrix', 'j'), 'i', 'tmp'),
    ])),
    For('i', 0, 'n', 1, reverse(at('matrix', 'i'))),
  ] });

  add({
    id: 'set-matrix-zeroes', no: 73, title: 'Set Matrix Zeroes', zh: '矩陣置零', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'matrix',
    fn: 'setZeroes', params: ['matrix'], sig: 'void; int[][]', resultFrom: 'arg0',
    desc: `<p>如果某個元素是 0，就把它<b>整列和整行</b>都設成 0（原地修改）。</p>`,
    tests: [
      { args: [[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], expected: [[1, 0, 1], [0, 0, 0], [1, 0, 1]] },
      { args: [[[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]], expected: [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]] },
      { args: [[[1]]], expected: [[1]] },
      { args: [[[1, 0]]], expected: [[0, 0]] },
    ],
    time: 'O(m·n)', space: 'O(m + n)',
    hints: ['不能邊掃邊改，不然新的 0 會造成連鎖反應。', '先掃一遍，用集合記下哪些列、哪些行要清零。', '進階：用第一列、第一行當標記，做到 O(1) 空間。'],
    insight: '先「記錄」再「修改」，避免讀到自己剛寫進去的資料。',
    solution: `zeroRows, zeroCols = 空集合
掃描: matrix[r][c] == 0 → 記下 r 和 c
再掃描: r 在 zeroRows 或 c 在 zeroCols → 設成 0`,
  }, { body: [
    set('zeroRows', setNew()), set('zeroCols', setNew()),
    For('r', 0, len('matrix'), 1, For('c', 0, len(at('matrix', 0)), 1,
      If(o(at(at('matrix', 'r'), 'c'), '==', 0), [sadd('zeroRows', 'r'), sadd('zeroCols', 'c')]))),
    For('r', 0, len('matrix'), 1, For('c', 0, len(at('matrix', 0)), 1,
      If(o(shas('zeroRows', 'r'), 'or', shas('zeroCols', 'c')), setAt(at('matrix', 'r'), 'c', 0)))),
  ] });

  add({
    id: 'game-of-life', no: 289, title: 'Game of Life', zh: '生命遊戲', difficulty: 'Medium', lists: ['T150'], pattern: 'matrix',
    fn: 'gameOfLife', params: ['board'], sig: 'void; int[][]', resultFrom: 'arg0',
    desc: `<p>每格是活 (1) 或死 (0)，依周圍 8 格的活細胞數同時更新：</p><ul><li>活細胞周圍 &lt; 2 或 &gt; 3 個活的 → 死</li><li>活細胞周圍 2 或 3 個 → 活</li><li>死細胞周圍剛好 3 個 → 復活</li></ul><p>原地更新成下一個狀態。</p>`,
    tests: [
      { args: [[[0, 1, 0], [0, 0, 1], [1, 1, 1], [0, 0, 0]]], expected: [[0, 0, 0], [1, 0, 1], [0, 1, 1], [0, 1, 0]] },
      { args: [[[1, 1], [1, 0]]], expected: [[1, 1], [1, 1]] },
      { args: [[[1]]], expected: [[0]] },
      { args: [[[0]]], expected: [[0]] },
    ],
    time: 'O(m·n)', space: 'O(m·n)',
    hints: ['所有格子要「同時」更新 → 計算時要看舊的狀態。', '先把整個盤面複製一份（每一列都要複製），用舊盤面數鄰居。', '進階：用 2、3 等額外狀態編碼「舊值 + 新值」，做到 O(1) 空間。'],
    insight: '同步更新 = 讀舊的、寫新的，兩份資料不能混在一起。',
    solution: `old = 盤面的複本（逐列複製）
對每個 r, c:
    live = old 周圍 8 格中 1 的數量
    如果 old[r][c] == 1 且 (live < 2 或 live > 3): board[r][c] = 0
    如果 old[r][c] == 0 且 live == 3: board[r][c] = 1`,
  }, { body: [
    set('m', len('board')), set('n', len(at('board', 0))),
    set('old', grid('m', 'n', 0)),
    For('r', 0, 'm', 1, For('c', 0, 'n', 1, setAt(at('old', 'r'), 'c', at(at('board', 'r'), 'c')))),
    For('r', 0, 'm', 1, For('c', 0, 'n', 1, [
      set('live', 0),
      For('dr', -1, 2, 1, For('dc', -1, 2, 1, [
        set('nr', o('r', '+', 'dr')), set('nc', o('c', '+', 'dc')),
        If(o(o(o('dr', '!=', 0), 'or', o('dc', '!=', 0)), 'and', o(o(o('nr', '>=', 0), 'and', o('nr', '<', 'm')), 'and', o(o('nc', '>=', 0), 'and', o('nc', '<', 'n')))),
          set('live', o('live', '+', at(at('old', 'nr'), 'nc')))),
      ])),
      IfChain([
        [o(o(at(at('old', 'r'), 'c'), '==', 1), 'and', o(o('live', '<', 2), 'or', o('live', '>', 3))), setAt(at('board', 'r'), 'c', 0)],
        [o(o(at(at('old', 'r'), 'c'), '==', 0), 'and', o('live', '==', 3)), setAt(at('board', 'r'), 'c', 1)],
      ]),
    ])),
  ] });

  add({
    id: 'merge-intervals', no: 56, title: 'Merge Intervals', zh: '合併區間', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'intervals',
    fn: 'merge', params: ['intervals'], sig: 'int[][]; int[][]',
    desc: `<p>合併所有重疊的區間，回傳不重疊的區間清單。</p>`,
    tests: [
      { args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
      { args: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
      { args: [[[4, 7], [1, 4]]], expected: [[1, 7]] },
      { args: [[[1, 4], [2, 3]]], expected: [[1, 4]] },
    ],
    time: 'O(n log n)', space: 'O(n)',
    hints: ['先依起點排序，可能重疊的區間就會相鄰。', '跟「結果中最後一個區間」比較：起點 ≤ 它的終點就合併（終點取較大）。', '否則加入一個新區間。'],
    insight: '區間題的第一步幾乎都是排序。',
    solution: `依起點排序 intervals
res = 空清單
對每個區間 iv:
    如果 res 是空的 或 res 最後一個的終點 < iv[0]: 加入 [iv[0], iv[1]]
    否則: res 最後一個的終點 = max(它, iv[1])
回傳 res`,
  }, { body: [
    sortBy('intervals', 0),
    set('res', empty()),
    Each('iv', 'intervals', If(o(isEmpty('res'), 'or', o(at(last('res'), 1), '<', at('iv', 0))),
      push('res', list(at('iv', 0), at('iv', 1))),
      setAt(last('res'), 1, max(at(last('res'), 1), at('iv', 1))))),
    Ret('res'),
  ] });

  add({
    id: 'insert-interval', no: 57, title: 'Insert Interval', zh: '插入區間', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'intervals',
    fn: 'insert', params: ['intervals', 'newInterval'], sig: 'int[][]; int[][], int[]',
    desc: `<p><code>intervals</code> 已依起點排序且互不重疊。插入 <code>newInterval</code>，必要時合併，回傳結果。</p>`,
    tests: [
      { args: [[[1, 3], [6, 9]], [2, 5]], expected: [[1, 5], [6, 9]] },
      { args: [[[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]], expected: [[1, 2], [3, 10], [12, 16]] },
      { args: [[], [5, 7]], expected: [[5, 7]] },
      { args: [[[1, 5]], [2, 3]], expected: [[1, 5]] },
      { args: [[[1, 5]], [6, 8]], expected: [[1, 5], [6, 8]] },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['分三段：完全在新區間左邊的、跟新區間重疊的、完全在右邊的。', '重疊的那段：起點取最小、終點取最大，合併成一個。'],
    insight: '已排序 → 一次掃描分成「左、重疊、右」三段。',
    solution: `i = 0
當 i < n 且 intervals[i][1] < new[0]: 加入 intervals[i]; i += 1
s = new[0], e = new[1]
當 i < n 且 intervals[i][0] <= e: s = min(s, ..); e = max(e, ..); i += 1
加入 [s, e]
剩下的全部加入`,
  }, { body: [
    set('res', empty()),
    set('i', 0), set('n', len('intervals')),
    While(o(o('i', '<', 'n'), 'and', o(at(at('intervals', 'i'), 1), '<', at('newInterval', 0))), [push('res', at('intervals', 'i')), inc('i', 1)]),
    set('s', at('newInterval', 0)), set('e', at('newInterval', 1)),
    While(o(o('i', '<', 'n'), 'and', o(at(at('intervals', 'i'), 0), '<=', 'e')), [
      set('s', min('s', at(at('intervals', 'i'), 0))), set('e', max('e', at(at('intervals', 'i'), 1))), inc('i', 1),
    ]),
    push('res', list('s', 'e')),
    While(o('i', '<', 'n'), [push('res', at('intervals', 'i')), inc('i', 1)]),
    Ret('res'),
  ] });

  add({
    id: 'non-overlapping-intervals', no: 435, title: 'Non-overlapping Intervals', zh: '無重疊區間', difficulty: 'Medium', lists: ['B75'], pattern: 'intervals',
    fn: 'eraseOverlapIntervals', params: ['intervals'], sig: 'int; int[][]',
    desc: `<p>最少要移除幾個區間，才能讓剩下的區間互不重疊？（只在端點相接不算重疊）</p>`,
    tests: [
      { args: [[[1, 2], [2, 3], [3, 4], [1, 3]]], expected: 1 },
      { args: [[[1, 2], [1, 2], [1, 2]]], expected: 2 },
      { args: [[[1, 2], [2, 3]]], expected: 0 },
      { args: [[[1, 100], [11, 22], [1, 11], [2, 12]]], expected: 2 },
    ],
    time: 'O(n log n)', space: 'O(1)',
    hints: ['反過來想：最多能保留幾個不重疊的區間？', '依終點排序，每次都選「最早結束」的區間，留給後面最多空間。', '起點 < 目前終點就是衝突，要移除。'],
    insight: '區間排程經典貪婪：依結束時間排序，越早結束越好。',
    solution: `依終點排序
end = intervals[0][1], count = 0
對 i 從 1 到 n:
    如果 intervals[i][0] < end: count += 1
    否則: end = intervals[i][1]
回傳 count`,
  }, { body: [
    sortBy('intervals', 1),
    set('end', at(at('intervals', 0), 1)),
    set('count', 0),
    For('i', 1, len('intervals'), 1, If(o(at(at('intervals', 'i'), 0), '<', 'end'), inc('count', 1), set('end', at(at('intervals', 'i'), 1)))),
    Ret('count'),
  ] });

  add({
    id: 'min-arrows-balloons', no: 452, title: 'Minimum Number of Arrows to Burst Balloons', zh: '用最少數量的箭引爆氣球', difficulty: 'Medium', lists: ['T150'], pattern: 'intervals',
    fn: 'findMinArrowShots', params: ['points'], sig: 'int; int[][]',
    desc: `<p>每顆氣球是 x 軸上的區間 [start, end]。在 x 射一支垂直的箭可以射破所有 start ≤ x ≤ end 的氣球。最少要幾支箭？</p>`,
    tests: [
      { args: [[[10, 16], [2, 8], [1, 6], [7, 12]]], expected: 2 },
      { args: [[[1, 2], [3, 4], [5, 6], [7, 8]]], expected: 4 },
      { args: [[[1, 2], [2, 3], [3, 4], [4, 5]]], expected: 2 },
      { args: [[[1, 2]]], expected: 1 },
    ],
    time: 'O(n log n)', space: 'O(1)',
    hints: ['依終點排序。', '箭射在目前氣球的終點，能順便射破所有起點 ≤ 這個終點的氣球。', '遇到起點 > 箭的位置，就要再射一支。'],
    insight: '跟無重疊區間同一招：依終點排序的貪婪。',
    solution: `依終點排序
arrows = 1, end = points[0][1]
對 i 從 1 到 n:
    如果 points[i][0] > end: arrows += 1; end = points[i][1]
回傳 arrows`,
  }, { body: [
    sortBy('points', 1),
    set('arrows', 1),
    set('end', at(at('points', 0), 1)),
    For('i', 1, len('points'), 1, If(o(at(at('points', 'i'), 0), '>', 'end'), [inc('arrows', 1), set('end', at(at('points', 'i'), 1))])),
    Ret('arrows'),
  ] });

  add({
    id: 'meeting-rooms', no: 252, title: 'Meeting Rooms', zh: '會議室', difficulty: 'Easy', lists: ['B75'], pattern: 'intervals',
    fn: 'canAttendMeetings', params: ['intervals'], sig: 'bool; int[][]',
    desc: `<p>給一堆會議時間 [start, end]，一個人能不能參加<b>全部</b>會議？（LeetCode 付費題）</p>`,
    tests: [
      { args: [[[0, 30], [5, 10], [15, 20]]], expected: false },
      { args: [[[7, 10], [2, 4]]], expected: true },
      { args: [[]], expected: true },
      { args: [[[1, 5], [5, 8]]], expected: true },
    ],
    time: 'O(n log n)', space: 'O(1)',
    hints: ['依開始時間排序。', '只要有一個會議在前一個結束前就開始，就衝突了。'],
    insight: '排序後只需要比較相鄰的兩個。',
    solution: `依起點排序
對 i 從 1 到 n:
    如果 intervals[i][0] < intervals[i-1][1]: 回傳 false
回傳 true`,
  }, { body: [
    sortBy('intervals', 0),
    For('i', 1, len('intervals'), 1, If(o(at(at('intervals', 'i'), 0), '<', at(at('intervals', o('i', '-', 1)), 1)), Ret(false))),
    Ret(true),
  ] });

  add({
    id: 'meeting-rooms-ii', no: 253, title: 'Meeting Rooms II', zh: '會議室 II', difficulty: 'Medium', lists: ['B75'], pattern: 'intervals',
    fn: 'minMeetingRooms', params: ['intervals'], sig: 'int; int[][]',
    desc: `<p>給一堆會議時間 [start, end]，最少需要幾間會議室？（LeetCode 付費題）</p>`,
    tests: [
      { args: [[[0, 30], [5, 10], [15, 20]]], expected: 2 },
      { args: [[[7, 10], [2, 4]]], expected: 1 },
      { args: [[[1, 5], [5, 8]]], expected: 1 },
      { args: [[[1, 10], [2, 7], [3, 19], [8, 12], [10, 20], [11, 30]]], expected: 4 },
    ],
    time: 'O(n log n)', space: 'O(n)',
    hints: ['把開始時間和結束時間分開，各自排序。', '依序看每個開始時間：如果最早結束的會議已經結束（start ≥ ends[j]），就沿用那間（j += 1）。', '否則要開新的一間。'],
    insight: '只關心「同時進行的會議數」，所以開始和結束可以拆開來看。（也可以用最小堆積記錄各房間的結束時間）',
    solution: `starts = 所有起點排序, ends = 所有終點排序
rooms = 0, j = 0
對 i 從 0 到 n:
    如果 starts[i] < ends[j]: rooms += 1
    否則: j += 1
回傳 rooms`,
  }, { body: [
    set('starts', empty()), set('ends', empty()),
    Each('iv', 'intervals', [push('starts', at('iv', 0)), push('ends', at('iv', 1))]),
    sort('starts'), sort('ends'),
    set('rooms', 0), set('j', 0),
    For('i', 0, len('starts'), 1, If(o(at('starts', 'i'), '<', at('ends', 'j')), inc('rooms', 1), inc('j', 1))),
    Ret('rooms'),
  ] });

  add({
    id: 'simplify-path', no: 71, title: 'Simplify Path', zh: '簡化路徑', difficulty: 'Medium', lists: ['T150'], pattern: 'stack',
    fn: 'simplifyPath', params: ['path'], sig: 'string; string',
    desc: `<p>把 Unix 風格的絕對路徑化簡：<code>.</code> 是目前目錄、<code>..</code> 是上一層、多個 <code>/</code> 視為一個，結果以 <code>/</code> 開頭、結尾沒有 <code>/</code>。</p>`,
    tests: [
      { args: ['/home/'], expected: '/home' },
      { args: ['/home//foo/'], expected: '/home/foo' },
      { args: ['/home/user/Documents/../Pictures'], expected: '/home/user/Pictures' },
      { args: ['/../'], expected: '/' },
      { args: ['/.../a/../b/c/../d/./'], expected: '/.../b/d' },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['用 / 切開，略過空字串。', '用堆疊記錄目前的資料夾：".." 就退一層（堆疊不空時），"." 跳過，其他就放進去。', '最後用 / 接起來，前面補一個 /。'],
    insight: '「回到上一層」= 堆疊的 pop。',
    solution: `stack = 空清單
對 把 path 依 "/" 切開 的每個 part:
    如果 part == "..": 如果 stack 不空: 移除最後一個
    否則如果 part ≠ ".": 放進 stack
回傳 "/" 接上 (用 "/" 把 stack 接起來)`,
  }, { body: [
    set('stack', empty()),
    Each('part', split('path', str('/')), IfChain([
      [o('part', '==', str('..')), If(not(isEmpty('stack')), popStmt('stack'))],
      [o('part', '!=', str('.')), push('stack', 'part')],
    ])),
    Ret(concat(str('/'), join('stack', str('/')))),
  ] });

  add({
    id: 'basic-calculator', no: 224, title: 'Basic Calculator', zh: '基本計算機', difficulty: 'Hard', lists: ['T150'], pattern: 'stack',
    fn: 'calculate', params: ['s'], sig: 'int; string',
    desc: `<p>計算只含非負整數、<code>+ - ( )</code> 和空格的運算式（<code>-</code> 也可能是負號，例如 "-(2+3)"）。不能用 eval。</p>`,
    tests: [
      { args: ['1 + 1'], expected: 2 },
      { args: [' 2-1 + 2 '], expected: 3 },
      { args: ['(1+(4+5+2)-3)+(6+8)'], expected: 23 },
      { args: ['-(2+3)'], expected: -5 },
      { args: ['10 - (3 - (2 + 1))'], expected: 10 },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['沒有乘除，所以只要記錄目前結果 res、正在讀的數字 num、num 前面的符號 sign。', '遇到 "(" 時把 res 和 sign 存進堆疊，從頭開始算括號裡的。', '遇到 ")" 時算完括號內的結果，再跟堆疊裡的 res、sign 合併。'],
    insight: '括號 = 「先暫停目前的計算，算完裡面再回來」→ 堆疊保存上下文。',
    solution: `res = 0, num = 0, sign = 1, stack = []
對 s 中每個 c:
    數字: num = num*10 + 數字值(c)
    + 或 -: res += sign*num; num = 0; sign = (c == '+' ? 1 : -1)
    (: 放入 res、sign; res = 0; sign = 1
    ): res += sign*num; num = 0; s2 = 取出; r2 = 取出; res = r2 + s2*res
回傳 res + sign*num`,
  }, { body: [
    set('res', 0), set('num', 0), set('sign', 1), set('stack', empty()),
    Each('c', 's', IfChain([
      [o(o('c', '>=', str('0')), 'and', o('c', '<=', str('9'))), set('num', o(o('num', '*', 10), '+', digit('c')))],
      [o(o('c', '==', str('+')), 'or', o('c', '==', str('-'))), [
        set('res', o('res', '+', o('sign', '*', 'num'))), set('num', 0), set('sign', tern(o('c', '==', str('+')), 1, -1)),
      ]],
      [o('c', '==', str('(')), [push('stack', 'res'), push('stack', 'sign'), set('res', 0), set('sign', 1)]],
      [o('c', '==', str(')')), [
        set('res', o('res', '+', o('sign', '*', 'num'))), set('num', 0),
        set('prevSign', pop('stack')), set('prevRes', pop('stack')),
        set('res', o('prevRes', '+', o('prevSign', '*', 'res'))),
      ]],
    ])),
    Ret(o('res', '+', o('sign', '*', 'num'))),
  ] });

  add({
    id: 'longest-palindromic-substring', no: 5, title: 'Longest Palindromic Substring', zh: '最長回文子字串', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'twoPointers',
    fn: 'longestPalindrome', params: ['s'], sig: 'string; string',
    desc: `<p>回傳 <code>s</code> 中最長的回文子字串（有多個一樣長的，回傳任一個都可以）。</p>`,
    tests: [
      { args: ['babad'], anyOf: ['bab', 'aba'] },
      { args: ['cbbd'], expected: 'bb' },
      { args: ['a'], expected: 'a' },
      { args: ['ac'], anyOf: ['a', 'c'] },
      { args: ['forgeeksskeegfor'], expected: 'geeksskeeg' },
    ],
    time: 'O(n²)', space: 'O(1)',
    hints: ['回文從中心往兩邊對稱。', '每個位置當中心往外擴：奇數長度中心是 (i, i)，偶數長度是 (i, i+1)。', '擴到不相等時，回文是 s[l+1 .. r-1]，長度 r − l − 1。'],
    insight: '中心擴展：2n−1 個中心，每個最多擴 n 次。',
    solution: `start = 0, bestLen = 0
對每個 i，分別用 (l, r) = (i, i) 和 (i, i+1):
    當 l >= 0 且 r < n 且 s[l] == s[r]: l -= 1; r += 1
    如果 r - l - 1 > bestLen: bestLen = r - l - 1; start = l + 1
回傳 s 從 start 起 bestLen 長的片段`,
  }, { body: [
    set('n', len('s')),
    set('start', 0), set('bestLen', 0),
    For('i', 0, 'n', 1, For('w', 0, 2, 1, [
      set('l', 'i'), set('r', o('i', '+', 'w')),
      While(o(o(o('l', '>=', 0), 'and', o('r', '<', 'n')), 'and', o(at('s', 'l'), '==', at('s', 'r'))), [inc('l', -1), inc('r', 1)]),
      If(o(o(o('r', '-', 'l'), '-', 1), '>', 'bestLen'), [set('bestLen', o(o('r', '-', 'l'), '-', 1)), set('start', o('l', '+', 1))]),
    ])),
    Ret(slice('s', 'start', o('start', '+', 'bestLen'))),
  ] });

  add({
    id: 'palindromic-substrings', no: 647, title: 'Palindromic Substrings', zh: '回文子字串', difficulty: 'Medium', lists: ['B75'], pattern: 'twoPointers',
    fn: 'countSubstrings', params: ['s'], sig: 'int; string',
    desc: `<p>計算 <code>s</code> 有幾個回文子字串（位置不同就算不同）。</p>`,
    tests: [
      { args: ['abc'], expected: 3 },
      { args: ['aaa'], expected: 6 },
      { args: ['a'], expected: 1 },
      { args: ['abba'], expected: 6 },
    ],
    time: 'O(n²)', space: 'O(1)',
    hints: ['跟最長回文子字串一樣用中心擴展。', '每擴展成功一次，就多一個回文子字串。'],
    insight: '中心擴展順便計數：每一步成功的擴展都對應一個回文。',
    solution: `count = 0
對每個中心 (i, i) 和 (i, i+1):
    當 範圍內 且 s[l] == s[r]: count += 1; l -= 1; r += 1
回傳 count`,
  }, { body: [
    set('n', len('s')),
    set('count', 0),
    For('i', 0, 'n', 1, For('w', 0, 2, 1, [
      set('l', 'i'), set('r', o('i', '+', 'w')),
      While(o(o(o('l', '>=', 0), 'and', o('r', '<', 'n')), 'and', o(at('s', 'l'), '==', at('s', 'r'))), [inc('count', 1), inc('l', -1), inc('r', 1)]),
    ])),
    Ret('count'),
  ] });

  // ===================== 設計題 =====================
  add({
    id: 'min-stack', no: 155, title: 'Min Stack', zh: '最小堆疊', difficulty: 'Medium', lists: ['T150'], pattern: 'design',
    design: { cls: 'MinStack', methods: [
      { name: 'MinStack', params: [] },
      { name: 'push', params: ['val'], ret: 'void' },
      { name: 'pop', params: [], ret: 'void' },
      { name: 'top', params: [] },
      { name: 'getMin', params: [] },
    ] },
    sig: { MinStack: 'void;', push: 'void; int', pop: 'void;', top: 'int;', getMin: 'int;' },
    desc: `<p>設計一個堆疊，除了 push、pop、top 以外，還能在 <b>O(1)</b> 時間取得目前的最小值 getMin。</p><p class="muted">設計題：每個方法一塊積木。在兩個以上方法用到的變數，就是這個類別的「欄位」（例如堆疊本身）。</p>`,
    tests: [
      { ops: ['MinStack', 'push', 'push', 'push', 'getMin', 'pop', 'top', 'getMin'], args: [[], [-2], [0], [-3], [], [], [], []], expected: [null, null, null, null, -3, null, 0, -2] },
      { ops: ['MinStack', 'push', 'push', 'getMin', 'push', 'getMin', 'pop', 'getMin', 'top'], args: [[], [2], [2], [], [1], [], [], [], []], expected: [null, null, null, 2, null, 1, null, 2, 2] },
      { ops: ['MinStack', 'push', 'top', 'getMin'], args: [[], [5], [], []], expected: [null, null, 5, 5] },
    ],
    time: 'O(1)', space: 'O(n)',
    hints: ['再多一個堆疊 mins，頂端永遠是目前的最小值。', 'push 時，如果 val ≤ mins 頂端（或 mins 是空的），也 push 到 mins。', 'pop 時，如果彈出的值等於 mins 頂端，mins 也要 pop。'],
    insight: '用額外空間記錄「每個時間點的答案」，換取 O(1) 查詢。',
    solution: `MinStack(): st = [], mins = []
push(val): 放入 st; 如果 mins 空 或 val <= mins 頂端: 放入 mins
pop(): 如果 st 頂端 == mins 頂端: mins 移除頂端; st 移除頂端
top(): 回傳 st 頂端
getMin(): 回傳 mins 頂端`,
  }, { methods: {
    MinStack: [set('st', empty()), set('mins', empty())],
    push: [push('st', 'val'), If(o(isEmpty('mins'), 'or', o('val', '<=', last('mins'))), push('mins', 'val'))],
    pop: [If(o(last('st'), '==', last('mins')), popStmt('mins')), popStmt('st')],
    top: [Ret(last('st'))],
    getMin: [Ret(last('mins'))],
  } });

  add({
    id: 'encode-decode-strings', no: 271, title: 'Encode and Decode Strings', zh: '字串的編碼與解碼', difficulty: 'Medium', lists: ['B75'], pattern: 'design',
    design: { cls: 'Codec', roundtrip: ['encode', 'decode'], methods: [
      { name: 'Codec', params: [] },
      { name: 'encode', params: ['strs'] },
      { name: 'decode', params: ['s'] },
    ] },
    sig: { Codec: 'void;', encode: 'string; List<string>', decode: 'List<string>; string' },
    desc: `<p>設計 encode：把字串清單編碼成一個字串；decode：把它還原成原本的清單。字串可能包含<b>任何字元</b>（包括你想拿來當分隔符號的字元）。（LeetCode 付費題）</p><p class="muted">測試會檢查 decode(encode(輸入)) 是否等於輸入。</p>`,
    tests: [
      { args: [['lint', 'code', 'love', 'you']], expected: ['lint', 'code', 'love', 'you'] },
      { args: [['we', 'say', ':', 'yes']], expected: ['we', 'say', ':', 'yes'] },
      { args: [['']], expected: [''] },
      { args: [[]], expected: [] },
      { args: [['a#b', '3#', '##']], expected: ['a#b', '3#', '##'] },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['單純用分隔符號會失敗，因為字串本身可能含有分隔符號。', '每個字串前面寫上「長度 + #」，例如 "lint" → "4#lint"。', 'decode 時先讀到 # 取得長度，再往後切那麼長。'],
    insight: '長度前綴（length-prefix）讓資料本身是什麼字元都沒關係。',
    solution: `encode(strs): 對每個 w: res = res 接上 len(w) 接上 "#" 接上 w
decode(s):
    i = 0
    當 i < len(s):
        j = i; 當 s[j] ≠ '#': j += 1
        n = 把 s[i..j) 轉成數字
        加入 s[j+1 .. j+1+n); i = j + 1 + n`,
  }, { methods: {
    Codec: [],
    encode: [
      set('res', str('')),
      Each('w', 'strs', set('res', concat(concat(concat('res', len('w')), str('#')), 'w'))),
      Ret('res'),
    ],
    decode: [
      set('out', empty()),
      set('i', 0),
      While(o('i', '<', len('s')), [
        set('j', 'i'),
        While(o(at('s', 'j'), '!=', str('#')), inc('j', 1)),
        set('size', toNum(slice('s', 'i', 'j'))),
        push('out', slice('s', o('j', '+', 1), o(o('j', '+', 1), '+', 'size'))),
        set('i', o(o('j', '+', 1), '+', 'size')),
      ]),
      Ret('out'),
    ],
  } });

  add({
    id: 'insert-delete-getrandom', no: 380, title: 'Insert Delete GetRandom O(1)', zh: 'O(1) 時間插入、刪除和取得隨機元素', difficulty: 'Medium', lists: ['T150'], pattern: 'design',
    design: { cls: 'RandomizedSet', methods: [
      { name: 'RandomizedSet', params: [] },
      { name: 'insert', params: ['val'] },
      { name: 'remove', params: ['val'] },
      { name: 'getRandom', params: [] },
    ] },
    sig: { RandomizedSet: 'void;', insert: 'bool; int', remove: 'bool; int', getRandom: 'int;' },
    desc: `<p>設計一個集合，insert、remove、getRandom（等機率回傳一個元素）都要平均 <b>O(1)</b>。insert / remove 回傳是否成功。</p>`,
    tests: [
      { ops: ['RandomizedSet', 'insert', 'remove', 'insert', 'getRandom', 'remove', 'insert', 'getRandom'], args: [[], [1], [2], [2], [], [1], [2], []],
        expected: [null, true, false, true, { any: [1, 2] }, true, false, 2] },
      { ops: ['RandomizedSet', 'insert', 'insert', 'insert', 'remove', 'remove', 'getRandom'], args: [[], [5], [6], [7], [5], [7], []],
        expected: [null, true, true, true, true, true, 6] },
    ],
    time: 'O(1)', space: 'O(n)',
    hints: ['陣列可以 O(1) 隨機取值，但刪除中間的元素要 O(n)。', '刪除時把要刪的元素跟最後一個交換，再刪掉最後一個。', '用字典記錄每個值在陣列中的索引，交換時記得更新。'],
    insight: '陣列（隨機存取）+ 字典（快速定位）互補；「和最後一個交換再刪除」是常用技巧。',
    solution: `vals = [], pos = {}
insert(val): 已存在回傳 false; pos[val] = len(vals); 放入 vals
remove(val): 不存在回傳 false
    i = pos[val], lastVal = vals 最後一個
    vals[i] = lastVal; pos[lastVal] = i
    移除 vals 最後一個; 刪除 pos[val]
getRandom(): 回傳 vals[隨機索引]`,
  }, { methods: {
    RandomizedSet: [set('vals', empty()), set('pos', mapNew())],
    insert: [If(mhas('pos', 'val'), Ret(false)), mset('pos', 'val', len('vals')), push('vals', 'val'), Ret(true)],
    remove: [
      If(not(mhas('pos', 'val')), Ret(false)),
      set('i', mget('pos', 'val')),
      set('lastVal', last('vals')),
      setAt('vals', 'i', 'lastVal'),
      mset('pos', 'lastVal', 'i'),
      popStmt('vals'),
      mapDel('pos', 'val'),
      Ret(true),
    ],
    getRandom: [Ret(at('vals', rand(len('vals'))))],
  } });
})();
