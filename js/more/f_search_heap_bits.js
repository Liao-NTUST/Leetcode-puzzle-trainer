// 第 F 批：分治 / 二分搜尋 / 堆積 / 位元 / 數學
(function () {
  const { set, inc, Ret, If, IfChain, For, Each, While, Repeat, Break, at, setAt, len, push, empty, list, fill, sortBy, concat, digit, digitChar,
    mapNew, mset, mgetd, o, not, tern, max, min, abs, INF, neg, str, nset, newNode, heapNew, hpush, hpop, hpopStmt, hpeek, hsize, defRet, callR } = Solutions.dsl;
  const add = (p, sol) => { PROBLEMS.push(p); Solutions.add(p.id, sol); };
  const cell = (g, r, c) => at(at(g, r), c);

  add({
    id: 'construct-quad-tree', no: 427, title: 'Construct Quad Tree', zh: '建立四分樹', difficulty: 'Medium', lists: ['T150'], pattern: 'divide',
    fn: 'construct', params: ['grid'], output: 'quad', nodeKind: 'QuadNode', sig: 'QuadNode; int[][]',
    desc: `<p>把 n×n 的 0/1 矩陣轉成四分樹：如果整塊都是同一個值，就是葉子（isLeaf = true，val 是那個值）；否則切成左上、右上、左下、右下四塊遞迴建立（非葉子的 val 設成 true）。</p><p class="muted">輸出格式：層序 [[isLeaf, val], ...]。</p>`,
    tests: [
      { args: [[[0, 1], [1, 0]]], expected: [[0, 1], [1, 0], [1, 1], [1, 1], [1, 0]] },
      { args: [[[1, 1], [1, 1]]], expected: [[1, 1]] },
      { args: [[[1]]], expected: [[1, 1]] },
      { args: [[[1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 1, 1], [0, 0, 1, 1]]], expected: [[0, 1], [1, 1], [1, 0], [1, 0], [1, 1]] },
    ],
    time: 'O(n² log n)', space: 'O(log n)',
    hints: ['build(r, c, size)：處理左上角在 (r, c)、邊長 size 的區塊。', '先檢查整塊是否同一個值：是就回傳葉子。', '否則切成四塊（邊長 size // 2）各自遞迴，接到四個子節點上。'],
    insight: '分治：檢查「能不能直接解決」，不行就切成小塊。',
    solution: `函式 build(r, c, size):
    如果區塊內全部等於 grid[r][c]: 回傳 葉子(val = grid[r][c] == 1)
    half = size // 2
    node = 新節點(true)
    node.topLeft = build(r, c, half); node.topRight = build(r, c + half, half)
    node.bottomLeft = build(r + half, c, half); node.bottomRight = build(r + half, c + half, half)
    回傳 node
回傳 build(0, 0, n)`,
  }, {
    helpers: [defRet('build', ['r', 'c', 'size'], [
      set('first', cell('grid', 'r', 'c')),
      set('same', true),
      For('i', 'r', o('r', '+', 'size'), 1, For('j', 'c', o('c', '+', 'size'), 1, If(o(cell('grid', 'i', 'j'), '!=', 'first'), set('same', false)))),
      If('same', [set('leaf', newNode(o('first', '==', 1), 'QuadNode')), nset('leaf', 'isLeaf', true), Ret('leaf')]),
      set('half', o('size', '//', 2)),
      set('node', newNode(true, 'QuadNode')),
      nset('node', 'topLeft', callR('build', ['r', 'c', 'size'], ['r', 'c', 'half'])),
      nset('node', 'topRight', callR('build', ['r', 'c', 'size'], ['r', o('c', '+', 'half'), 'half'])),
      nset('node', 'bottomLeft', callR('build', ['r', 'c', 'size'], [o('r', '+', 'half'), 'c', 'half'])),
      nset('node', 'bottomRight', callR('build', ['r', 'c', 'size'], [o('r', '+', 'half'), o('c', '+', 'half'), 'half'])),
    ], 'node')],
    body: [Ret(callR('build', ['r', 'c', 'size'], [0, 0, len('grid')]))],
  });

  add({
    id: 'search-insert-position', no: 35, title: 'Search Insert Position', zh: '搜尋插入位置', difficulty: 'Easy', lists: ['T150'], pattern: 'binarySearch',
    fn: 'searchInsert', params: ['nums', 'target'], sig: 'int; int[], int',
    desc: `<p>在已排序、不重複的陣列中找 target 的索引；找不到就回傳它應該插入的位置。要求 O(log n)。</p>`,
    tests: [
      { args: [[1, 3, 5, 6], 5], expected: 2 },
      { args: [[1, 3, 5, 6], 2], expected: 1 },
      { args: [[1, 3, 5, 6], 7], expected: 4 },
      { args: [[1, 3, 5, 6], 0], expected: 0 },
      { args: [[1], 1], expected: 0 },
    ],
    time: 'O(log n)', space: 'O(1)',
    hints: ['找「第一個 ≥ target 的位置」（lower bound）。', '搜尋範圍 [lo, hi)，hi 一開始是 n（可能插在最後面）。', 'nums[mid] < target → lo = mid + 1；否則 hi = mid。'],
    insight: 'lower bound 是最常用的二分搜尋模板，很多題都是它的變形。',
    solution: `lo = 0, hi = n
當 lo < hi:
    mid = (lo + hi) // 2
    如果 nums[mid] < target: lo = mid + 1
    否則: hi = mid
回傳 lo`,
  }, { body: [
    set('lo', 0), set('hi', len('nums')),
    While(o('lo', '<', 'hi'), [
      set('mid', o(o('lo', '+', 'hi'), '//', 2)),
      If(o(at('nums', 'mid'), '<', 'target'), set('lo', o('mid', '+', 1)), set('hi', 'mid')),
    ]),
    Ret('lo'),
  ] });

  add({
    id: 'search-2d-matrix', no: 74, title: 'Search a 2D Matrix', zh: '搜尋二維矩陣', difficulty: 'Medium', lists: ['T150'], pattern: 'binarySearch',
    fn: 'searchMatrix', params: ['matrix', 'target'], sig: 'bool; int[][], int',
    desc: `<p>矩陣每一列由小到大排序，而且每列第一個數大於上一列最後一個數。判斷 target 是否在矩陣中，要求 O(log(m·n))。</p>`,
    tests: [
      { args: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3], expected: true },
      { args: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13], expected: false },
      { args: [[[1]], 1], expected: true },
      { args: [[[1, 3]], 3], expected: true },
    ],
    time: 'O(log n)', space: 'O(1)',
    hints: ['把整個矩陣看成一條長度 m·n 的排序陣列。', '第 k 個元素在 matrix[k // n][k % n]。'],
    insight: '座標轉換讓二維問題變回一維的二分搜尋。',
    solution: `lo = 0, hi = m*n - 1
當 lo <= hi:
    mid = (lo + hi) // 2; v = matrix[mid // n][mid % n]
    v == target → true；v < target → lo = mid + 1；否則 hi = mid - 1
回傳 false`,
  }, { body: [
    set('m', len('matrix')), set('n', len(at('matrix', 0))),
    set('lo', 0), set('hi', o(o('m', '*', 'n'), '-', 1)),
    While(o('lo', '<=', 'hi'), [
      set('mid', o(o('lo', '+', 'hi'), '//', 2)),
      set('v', cell('matrix', o('mid', '//', 'n'), o('mid', '%', 'n'))),
      IfChain([[o('v', '==', 'target'), Ret(true)], [o('v', '<', 'target'), set('lo', o('mid', '+', 1))]], set('hi', o('mid', '-', 1))),
    ]),
    Ret(false),
  ] });

  add({
    id: 'find-peak-element', no: 162, title: 'Find Peak Element', zh: '尋找峰值', difficulty: 'Medium', lists: ['T150'], pattern: 'binarySearch',
    fn: 'findPeakElement', params: ['nums'], sig: 'int; int[]', check: 'peak',
    desc: `<p>峰值是比左右鄰居都大的元素（陣列兩端外面視為 −∞）。回傳<b>任一個</b>峰值的索引，要求 O(log n)。相鄰元素不會相等。</p>`,
    tests: [
      { args: [[1, 2, 3, 1]], expected: 2 },
      { args: [[1, 2, 1, 3, 5, 6, 4]], expected: 5 },
      { args: [[1]], expected: 0 },
      { args: [[2, 1]], expected: 0 },
      { args: [[1, 2]], expected: 1 },
    ],
    time: 'O(log n)', space: 'O(1)',
    hints: ['看 mid 和 mid+1：往「上坡」的方向一定有峰值。', 'nums[mid] > nums[mid+1] → 峰值在 mid 或左邊（hi = mid）。', '否則峰值在右邊（lo = mid + 1）。'],
    insight: '二分搜尋不需要整個陣列有序，只要能判斷「答案在哪一半」。',
    solution: `lo = 0, hi = n - 1
當 lo < hi:
    mid = (lo + hi) // 2
    如果 nums[mid] > nums[mid+1]: hi = mid
    否則: lo = mid + 1
回傳 lo`,
  }, { body: [
    set('lo', 0), set('hi', o(len('nums'), '-', 1)),
    While(o('lo', '<', 'hi'), [
      set('mid', o(o('lo', '+', 'hi'), '//', 2)),
      If(o(at('nums', 'mid'), '>', at('nums', o('mid', '+', 1))), set('hi', 'mid'), set('lo', o('mid', '+', 1))),
    ]),
    Ret('lo'),
  ] });

  add({
    id: 'first-last-position', no: 34, title: 'Find First and Last Position of Element in Sorted Array', zh: '在排序陣列中查找元素的第一個和最後一個位置', difficulty: 'Medium', lists: ['T150'], pattern: 'binarySearch',
    fn: 'searchRange', params: ['nums', 'target'], sig: 'int[]; int[], int',
    desc: `<p>在已排序陣列中找出 target 的開始和結束位置 [first, last]；不存在則回傳 [-1, -1]。要求 O(log n)。</p>`,
    tests: [
      { args: [[5, 7, 7, 8, 8, 10], 8], expected: [3, 4] },
      { args: [[5, 7, 7, 8, 8, 10], 6], expected: [-1, -1] },
      { args: [[], 0], expected: [-1, -1] },
      { args: [[1], 1], expected: [0, 0] },
      { args: [[2, 2], 2], expected: [0, 1] },
    ],
    time: 'O(log n)', space: 'O(1)',
    hints: ['寫一個 lower bound 函式：第一個 ≥ x 的位置。', 'first = bound(target)；檢查它是不是真的等於 target。', 'last = bound(target + 1) − 1。'],
    insight: '「最後一個 = x」等於「第一個 > x」的前一個，同一個函式用兩次。',
    solution: `函式 bound(x): lower bound
first = bound(target)
如果 first == n 或 nums[first] ≠ target: 回傳 [-1, -1]
回傳 [first, bound(target + 1) - 1]`,
  }, {
    helpers: [defRet('bound', ['x'], [
      set('lo', 0), set('hi', len('nums')),
      While(o('lo', '<', 'hi'), [
        set('mid', o(o('lo', '+', 'hi'), '//', 2)),
        If(o(at('nums', 'mid'), '<', 'x'), set('lo', o('mid', '+', 1)), set('hi', 'mid')),
      ]),
    ], 'lo')],
    body: [
      set('first', callR('bound', ['x'], ['target'])),
      If(o(o('first', '==', len('nums')), 'or', o(at('nums', 'first'), '!=', 'target')), Ret(list(-1, -1))),
      Ret(list('first', o(callR('bound', ['x'], [o('target', '+', 1)]), '-', 1))),
    ],
  });

  add({
    id: 'median-two-sorted-arrays', no: 4, title: 'Median of Two Sorted Arrays', zh: '尋找兩個正序陣列的中位數', difficulty: 'Hard', lists: ['T150'], pattern: 'binarySearch',
    fn: 'findMedianSortedArrays', params: ['nums1', 'nums2'], sig: 'double; int[], int[]', compare: 'float',
    desc: `<p>回傳兩個已排序陣列合併後的中位數。要求 O(log(m+n))。</p>`,
    tests: [
      { args: [[1, 3], [2]], expected: 2.0 },
      { args: [[1, 2], [3, 4]], expected: 2.5 },
      { args: [[], [1]], expected: 1.0 },
      { args: [[0, 0], [0, 0]], expected: 0.0 },
      { args: [[2], []], expected: 2.0 },
      { args: [[1, 3, 8], [2, 7]], expected: 3.0 },
    ],
    time: 'O(log n)', space: 'O(1)',
    hints: ['在較短的陣列 A 上二分「切幾個到左半邊」i；B 切 j = half − i 個。', '合法的切法：A 左最大 ≤ B 右最小，而且 B 左最大 ≤ A 右最小。', '切到邊界外時，用 ±∞ 代替。中位數由左半最大和右半最小決定。'],
    insight: '不需要真的合併，只要找到把所有數分成左右兩半的那條切線。',
    solution: `讓 A 是比較短的陣列；half = (m + n + 1) // 2
lo = 0, hi = m
當 lo <= hi:
    i = (lo + hi) // 2; j = half - i
    aL = A[i-1] 或 -∞, aR = A[i] 或 ∞, bL, bR 同理
    如果 aL <= bR 且 bL <= aR:
        奇數 → max(aL, bL)；偶數 → (max(aL, bL) + min(aR, bR)) / 2
    否則如果 aL > bR: hi = i - 1
    否則: lo = i + 1`,
  }, { body: [
    set('A', 'nums1'), set('B', 'nums2'),
    If(o(len('A'), '>', len('B')), [set('tmp', 'A'), set('A', 'B'), set('B', 'tmp')]),
    set('m', len('A')), set('n', len('B')),
    set('half', o(o(o('m', '+', 'n'), '+', 1), '//', 2)),
    set('lo', 0), set('hi', 'm'),
    While(o('lo', '<=', 'hi'), [
      set('i', o(o('lo', '+', 'hi'), '//', 2)),
      set('j', o('half', '-', 'i')),
      set('aL', tern(o('i', '>', 0), at('A', o('i', '-', 1)), neg(INF()))),
      set('aR', tern(o('i', '<', 'm'), at('A', 'i'), INF())),
      set('bL', tern(o('j', '>', 0), at('B', o('j', '-', 1)), neg(INF()))),
      set('bR', tern(o('j', '<', 'n'), at('B', 'j'), INF())),
      IfChain([
        [o(o('aL', '<=', 'bR'), 'and', o('bL', '<=', 'aR')), [
          If(o(o(o('m', '+', 'n'), '%', 2), '==', 1), Ret(max('aL', 'bL'))),
          Ret(o(o(max('aL', 'bL'), '+', min('aR', 'bR')), '/', 2)),
        ]],
        [o('aL', '>', 'bR'), set('hi', o('i', '-', 1))],
      ], set('lo', o('i', '+', 1))),
    ]),
    Ret(0),
  ] });

  add({
    id: 'kth-largest-element', no: 215, title: 'Kth Largest Element in an Array', zh: '陣列中的第 K 個最大元素', difficulty: 'Medium', lists: ['T150'], pattern: 'heap',
    fn: 'findKthLargest', params: ['nums', 'k'], sig: 'int; int[], int',
    desc: `<p>回傳陣列中第 k 大的元素（排序後的第 k 大，不是第 k 個不同的數）。能不能不排序？</p>`,
    tests: [
      { args: [[3, 2, 1, 5, 6, 4], 2], expected: 5 },
      { args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4 },
      { args: [[1], 1], expected: 1 },
      { args: [[2, 1], 2], expected: 1 },
    ],
    time: 'O(n log n)', space: 'O(k)',
    hints: ['維護一個大小為 k 的最小堆積，裡面放「目前最大的 k 個」。', '每放一個數進去，超過 k 個就把最小的丟掉。', '最後堆積頂端（k 個裡最小的）就是第 k 大。'],
    insight: '「前 k 大」用大小為 k 的最小堆積：O(n log k)。（進階：快速選擇平均 O(n)）',
    solution: `heap = 最小堆積
對 nums 中每個 x:
    放入 x
    如果 heap 大小 > k: 移除頂端
回傳 heap 頂端`,
  }, { body: [
    set('heap', heapNew('min')),
    Each('x', 'nums', [hpush('heap', 'x'), If(o(hsize('heap'), '>', 'k'), hpopStmt('heap'))]),
    Ret(hpeek('heap')),
  ] });

  add({
    id: 'ipo', no: 502, title: 'IPO', zh: 'IPO', difficulty: 'Hard', lists: ['T150'], pattern: 'heap',
    fn: 'findMaximizedCapital', params: ['k', 'w', 'profits', 'capital'], sig: 'int; int, int, int[], int[]',
    desc: `<p>一開始有資本 w，最多做 k 個專案。專案 i 需要資本 capital[i] 才能開始（資本不會被扣掉），完成後獲得純利 profits[i]。回傳最後最多能有多少資本。</p>`,
    tests: [
      { args: [2, 0, [1, 2, 3], [0, 1, 1]], expected: 4 },
      { args: [3, 0, [1, 2, 3], [0, 1, 2]], expected: 6 },
      { args: [1, 0, [1, 2], [1, 1]], expected: 0 },
      { args: [1, 2, [1, 2, 3], [1, 1, 2]], expected: 5 },
    ],
    time: 'O(n log n)', space: 'O(n)',
    hints: ['每一步都選「目前做得起的專案中，利潤最高的」（貪婪）。', '把專案依所需資本排序；資本增加時，把新做得起的專案利潤放進最大堆積。', '從堆積取最大利潤加到 w；堆積空了就提早結束。'],
    insight: '排序 + 堆積：排序決定「什麼時候解鎖」，堆積決定「解鎖的裡面挑哪個」。',
    solution: `projects = [[capital[i], profits[i]], ...] 依資本排序
heap = 最大堆積, i = 0
重複 k 次:
    當 i < n 且 projects[i][0] <= w: 放入 projects[i][1]; i += 1
    如果 heap 是空的: 跳出
    w += 取出頂端
回傳 w`,
  }, { body: [
    set('projects', empty()),
    For('i', 0, len('profits'), 1, push('projects', list(at('capital', 'i'), at('profits', 'i')))),
    sortBy('projects', 0),
    set('heap', heapNew('max')),
    set('idx', 0),
    Repeat('k', [
      While(o(o('idx', '<', len('projects')), 'and', o(cell('projects', 'idx', 0), '<=', 'w')), [hpush('heap', cell('projects', 'idx', 1)), inc('idx', 1)]),
      If(o(hsize('heap'), '==', 0), Break()),
      set('gain', hpop('heap')),
      set('w', o('w', '+', 'gain')),
    ]),
    Ret('w'),
  ] });

  add({
    id: 'k-smallest-pairs', no: 373, title: 'Find K Pairs with Smallest Sums', zh: '查找和最小的 K 對數字', difficulty: 'Medium', lists: ['T150'], pattern: 'heap',
    fn: 'kSmallestPairs', params: ['nums1', 'nums2', 'k'], sig: 'List<List<int>>; int[], int[], int', compare: 'unorderedOuter',
    desc: `<p>兩個已排序陣列，各取一個數組成數對 [u, v]。回傳和最小的 k 個數對。</p>`,
    tests: [
      { args: [[1, 7, 11], [2, 4, 6], 3], expected: [[1, 2], [1, 4], [1, 6]] },
      { args: [[1, 1, 2], [1, 2, 3], 2], expected: [[1, 1], [1, 1]] },
      { args: [[1, 2], [3], 3], expected: [[1, 3], [2, 3]] },
      { args: [[1, 2, 4], [3, 5], 2], expected: [[1, 3], [2, 3]] },
    ],
    time: 'O(n log n)', space: 'O(k)',
    hints: ['想像一張表格 sum[i][j] = nums1[i] + nums2[j]，每一列都是遞增的。', '一開始把每一列的第一個 [sum, i, 0] 放進最小堆積。', '取出最小的 [_, i, j] 之後，把同一列的下一個 [.., i, j+1] 放進去。'],
    insight: '多路合併：k 個排序序列各出一個代表，堆積幫你挑最小。（跟合併 K 個串列同一招）',
    solution: `heap = 最小堆積
對 i 從 0 到 min(k, len(nums1)): 放入 [nums1[i] + nums2[0], i, 0]
當 len(res) < k 且 heap 不空:
    [s, i, j] = 取出頂端; 加入 [nums1[i], nums2[j]]
    如果 j + 1 < len(nums2): 放入 [nums1[i] + nums2[j+1], i, j + 1]
回傳 res`,
  }, { body: [
    set('heap', heapNew('min')),
    For('i', 0, min('k', len('nums1')), 1, hpush('heap', list(o(at('nums1', 'i'), '+', at('nums2', 0)), 'i', 0))),
    set('res', empty()),
    While(o(o(len('res'), '<', 'k'), 'and', o(hsize('heap'), '>', 0)), [
      set('top', hpop('heap')),
      set('a', at('top', 1)), set('b', at('top', 2)),
      push('res', list(at('nums1', 'a'), at('nums2', 'b'))),
      If(o(o('b', '+', 1), '<', len('nums2')), hpush('heap', list(o(at('nums1', 'a'), '+', at('nums2', o('b', '+', 1))), 'a', o('b', '+', 1)))),
    ]),
    Ret('res'),
  ] });

  add({
    id: 'find-median-data-stream', no: 295, title: 'Find Median from Data Stream', zh: '資料流的中位數', difficulty: 'Hard', lists: ['B75', 'T150'], pattern: 'heap',
    design: { cls: 'MedianFinder', methods: [
      { name: 'MedianFinder', params: [] },
      { name: 'addNum', params: ['num'], ret: 'void' },
      { name: 'findMedian', params: [] },
    ] },
    sig: { MedianFinder: 'void;', addNum: 'void; int', findMedian: 'double;' },
    compare: 'float',
    desc: `<p>數字一個一個加進來（addNum），隨時要能回傳目前所有數的中位數（findMedian）。</p>`,
    tests: [
      { ops: ['MedianFinder', 'addNum', 'addNum', 'findMedian', 'addNum', 'findMedian'], args: [[], [1], [2], [], [3], []], expected: [null, null, null, 1.5, null, 2.0] },
      { ops: ['MedianFinder', 'addNum', 'findMedian', 'addNum', 'findMedian', 'addNum', 'findMedian'], args: [[], [-1], [], [-2], [], [-3], []], expected: [null, null, -1.0, null, -1.5, null, -2.0] },
      { ops: ['MedianFinder', 'addNum', 'addNum', 'addNum', 'addNum', 'findMedian'], args: [[], [6], [10], [2], [6], []], expected: [null, null, null, null, null, 6.0] },
    ],
    time: 'O(log n)', space: 'O(n)',
    hints: ['把數字分成「較小的一半」和「較大的一半」。', '較小的一半用最大堆積 lo（頂端是小半邊的最大值），較大的一半用最小堆積 hi。', '加入時先放 lo，再把 lo 的頂端移到 hi；如果 hi 比 lo 多，再移一個回來。中位數只看兩個頂端。'],
    insight: '兩個堆積夾住中間：中位數永遠在兩個頂端。',
    solution: `MedianFinder(): lo = 最大堆積, hi = 最小堆積
addNum(num):
    放入 lo; 把 lo 的頂端移到 hi
    如果 hi 的大小 > lo 的大小: 把 hi 的頂端移到 lo
findMedian():
    如果 lo 比較多: 回傳 lo 頂端
    回傳 (lo 頂端 + hi 頂端) / 2`,
  }, { methods: {
    MedianFinder: [set('lo', heapNew('max')), set('hi', heapNew('min'))],
    addNum: [
      hpush('lo', 'num'),
      set('moved', hpop('lo')), hpush('hi', 'moved'),
      If(o(hsize('hi'), '>', hsize('lo')), [set('moved', hpop('hi')), hpush('lo', 'moved')]),
    ],
    findMedian: [
      If(o(hsize('lo'), '>', hsize('hi')), Ret(hpeek('lo'))),
      Ret(o(o(hpeek('lo'), '+', hpeek('hi')), '/', 2)),
    ],
  } });

  // ===================== 位元 / 數學 =====================
  add({
    id: 'add-binary', no: 67, title: 'Add Binary', zh: '二進位求和', difficulty: 'Easy', lists: ['T150'], pattern: 'bit',
    fn: 'addBinary', params: ['a', 'b'], sig: 'string; string, string',
    desc: `<p>兩個二進位字串相加，回傳二進位字串。</p>`,
    tests: [
      { args: ['11', '1'], expected: '100' },
      { args: ['1010', '1011'], expected: '10101' },
      { args: ['0', '0'], expected: '0' },
      { args: ['1', '111'], expected: '1000' },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['從兩個字串的尾巴開始，跟直式加法一樣。', 's = 進位 + 兩邊的位元；這一位是 s % 2，進位是 s // 2。', '新的位元接在結果的「前面」。'],
    insight: '跟「兩數相加」同一個模板，只是換成二進位。',
    solution: `i = len(a) - 1, j = len(b) - 1, carry = 0, res = ""
當 i >= 0 或 j >= 0 或 carry > 0:
    s = carry
    如果 i >= 0: s += 數字值(a[i]); i -= 1
    如果 j >= 0: s += 數字值(b[j]); j -= 1
    res = 數字字元(s % 2) 接上 res; carry = s // 2
回傳 res`,
  }, { body: [
    set('i', o(len('a'), '-', 1)), set('j', o(len('b'), '-', 1)), set('carry', 0), set('res', str('')),
    While(o(o(o('i', '>=', 0), 'or', o('j', '>=', 0)), 'or', o('carry', '>', 0)), [
      set('s', 'carry'),
      If(o('i', '>=', 0), [set('s', o('s', '+', digit(at('a', 'i')))), inc('i', -1)]),
      If(o('j', '>=', 0), [set('s', o('s', '+', digit(at('b', 'j')))), inc('j', -1)]),
      set('res', concat(digitChar(o('s', '%', 2)), 'res')),
      set('carry', o('s', '//', 2)),
    ]),
    Ret('res'),
  ] });

  add({
    id: 'reverse-bits', no: 190, title: 'Reverse Bits', zh: '顛倒二進位位元', difficulty: 'Easy', lists: ['B75', 'T150'], pattern: 'bit',
    fn: 'reverseBits', params: ['n'], sig: 'uint; uint',
    desc: `<p>把 32 位元<b>無號</b>整數的二進位位元順序顛倒，回傳結果。</p><p class="muted">例如 43261596 = 00000010100101000001111010011100₂ → 00111001011110000010100101000000₂ = 964176192</p>`,
    tests: [
      { args: [43261596], expected: 964176192 },
      { args: [4294967293], expected: 3221225471 },
      { args: [0], expected: 0 },
      { args: [1], expected: 2147483648 },
    ],
    time: 'O(1)', space: 'O(1)',
    hints: ['重複 32 次：取出 n 的最低位 (n & 1)，接到 res 的最低位 (res << 1 | 位元)。', 'n 往右移一位要用「無號右移 >>>」，左邊才會補 0。', '最後 res >>> 0 把結果當成無號數。'],
    insight: '逐位搬運：一邊從右邊拿、一邊從右邊放，順序自然顛倒。',
    solution: `res = 0
重複 32 次:
    res = (res << 1) | (n & 1)
    n = n >>> 1
回傳 res >>> 0`,
  }, { body: [
    set('res', 0),
    Repeat(32, [
      set('res', o(o('res', '<<', 1), '|', o('n', '&', 1))),
      set('n', o('n', '>>>', 1)),
    ]),
    Ret(o('res', '>>>', 0)),
  ] });

  add({
    id: 'single-number-ii', no: 137, title: 'Single Number II', zh: '只出現一次的數字 II', difficulty: 'Medium', lists: ['T150'], pattern: 'bit',
    fn: 'singleNumber', params: ['nums'], sig: 'int; int[]',
    desc: `<p>除了某個數只出現一次，其他數都出現<b>三次</b>。找出那個數。O(n) 時間、O(1) 空間。</p>`,
    tests: [
      { args: [[2, 2, 3, 2]], expected: 3 },
      { args: [[0, 1, 0, 1, 0, 1, 99]], expected: 99 },
      { args: [[-2, -2, 1, 1, 4, 1, 4, 4, -4, -2]], expected: -4 },
      { args: [[5]], expected: 5 },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['看每一個位元：出現三次的數在這一位貢獻的 1 一定是 3 的倍數。', '統計所有數在第 b 位的 1 的個數，% 3 ≠ 0 表示答案在這一位是 1。', '負數也一樣，32 個位元都要檢查。'],
    insight: '逐位元計數再取餘數，可以推廣到「其他數都出現 k 次」。',
    solution: `res = 0
對 b 從 0 到 32:
    count = 所有數在第 b 位的 1 的個數
    如果 count % 3 ≠ 0: res = res | (1 << b)
回傳 res`,
  }, { body: [
    set('res', 0),
    For('b', 0, 32, 1, [
      set('count', 0),
      Each('x', 'nums', set('count', o('count', '+', o(o('x', '>>', 'b'), '&', 1)))),
      If(o(o('count', '%', 3), '!=', 0), set('res', o('res', '|', o(1, '<<', 'b')))),
    ]),
    Ret('res'),
  ] });

  add({
    id: 'bitwise-and-range', no: 201, title: 'Bitwise AND of Numbers Range', zh: '數字範圍按位元與', difficulty: 'Medium', lists: ['T150'], pattern: 'bit',
    fn: 'rangeBitwiseAnd', params: ['left', 'right'], sig: 'int; int, int',
    desc: `<p>回傳 [left, right] 範圍內所有整數的 AND 結果。</p>`,
    tests: [
      { args: [5, 7], expected: 4 },
      { args: [0, 0], expected: 0 },
      { args: [1, 2147483647], expected: 0 },
      { args: [12, 15], expected: 12 },
    ],
    time: 'O(1)', space: 'O(1)',
    hints: ['只要範圍內有數字在某一位是 0，AND 結果那一位就是 0。', '答案其實就是 left 和 right 二進位的「共同前綴」。', '兩個一起往右移，直到相等；記下移了幾次，最後再移回來。'],
    insight: '連續整數的 AND = 共同前綴，後面全部變 0。',
    solution: `shift = 0
當 left < right: left = left >> 1; right = right >> 1; shift += 1
回傳 left << shift`,
  }, { body: [
    set('shift', 0),
    While(o('left', '<', 'right'), [set('left', o('left', '>>', 1)), set('right', o('right', '>>', 1)), inc('shift', 1)]),
    Ret(o('left', '<<', 'shift')),
  ] });

  add({
    id: 'sum-of-two-integers', no: 371, title: 'Sum of Two Integers', zh: '兩整數之和', difficulty: 'Medium', lists: ['B75'], pattern: 'bit',
    fn: 'getSum', params: ['a', 'b'], sig: 'int; int, int',
    desc: `<p>不使用 + 和 − 運算子，計算兩個整數的和。</p><p class="muted">提示：Python 的整數沒有位數上限，負數需要額外遮罩；對應程式碼的 Python 版本只供參考。</p>`,
    tests: [
      { args: [1, 2], expected: 3 },
      { args: [2, 3], expected: 5 },
      { args: [-1, 1], expected: 0 },
      { args: [-5, 3], expected: -2 },
    ],
    time: 'O(1)', space: 'O(1)',
    hints: ['XOR 是「不進位的加法」。', 'AND 再左移一位就是「進位」。', '重複「和 = a ^ b，進位 = (a & b) << 1」直到進位為 0。'],
    insight: '加法 = 不進位加法 + 進位，用位元運算模擬加法器。',
    solution: `當 b ≠ 0:
    carry = (a & b) << 1
    a = a ^ b
    b = carry
回傳 a`,
  }, { body: [
    While(o('b', '!=', 0), [
      set('carry', o(o('a', '&', 'b'), '<<', 1)),
      set('a', o('a', '^', 'b')),
      set('b', 'carry'),
    ]),
    Ret('a'),
  ] });

  add({
    id: 'counting-bits', no: 338, title: 'Counting Bits', zh: '位元計數', difficulty: 'Easy', lists: ['B75'], pattern: 'bit',
    fn: 'countBits', params: ['n'], sig: 'int[]; int',
    desc: `<p>回傳長度 n+1 的陣列，第 i 個是 i 的二進位中 1 的個數。要求 O(n)。</p>`,
    tests: [
      { args: [2], expected: [0, 1, 1] },
      { args: [5], expected: [0, 1, 1, 2, 1, 2] },
      { args: [0], expected: [0] },
      { args: [8], expected: [0, 1, 1, 2, 1, 2, 2, 3, 1] },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['i >> 1 是把 i 的最低位去掉，它的答案已經算過了。', 'bits[i] = bits[i >> 1] + (i & 1)。'],
    insight: '位元版的 DP：大的數字用「去掉一位」的小數字推出來。',
    solution: `ans = 長度 n+1 的 0
對 i 從 1 到 n+1: ans[i] = ans[i >> 1] + (i & 1)
回傳 ans`,
  }, { body: [
    set('ans', fill(o('n', '+', 1), 0)),
    For('i', 1, o('n', '+', 1), 1, setAt('ans', 'i', o(at('ans', o('i', '>>', 1)), '+', o('i', '&', 1)))),
    Ret('ans'),
  ] });

  add({
    id: 'palindrome-number', no: 9, title: 'Palindrome Number', zh: '回文數', difficulty: 'Easy', lists: ['T150'], pattern: 'math',
    fn: 'isPalindrome', params: ['x'], sig: 'bool; int',
    desc: `<p>判斷整數 x 是否為回文數（正讀反讀都一樣）。進階：不轉成字串。</p>`,
    tests: [
      { args: [121], expected: true },
      { args: [-121], expected: false },
      { args: [10], expected: false },
      { args: [0], expected: true },
      { args: [12321], expected: true },
    ],
    time: 'O(log n)', space: 'O(1)',
    hints: ['負數一定不是；結尾是 0 的（除了 0 本身）也不是。', '只反轉「後半段」數字：當 x > rev 時，把 x 的最後一位搬到 rev。', '結束時 x == rev（偶數位）或 x == rev // 10（奇數位）。'],
    insight: '只反轉一半，既避免溢位，也剛好知道何時到中間。',
    solution: `如果 x < 0 或 (x % 10 == 0 且 x ≠ 0): 回傳 false
rev = 0
當 x > rev: rev = rev * 10 + x % 10; x = x // 10
回傳 x == rev 或 x == rev // 10`,
  }, { body: [
    If(o(o('x', '<', 0), 'or', o(o(o('x', '%', 10), '==', 0), 'and', o('x', '!=', 0))), Ret(false)),
    set('rev', 0),
    While(o('x', '>', 'rev'), [set('rev', o(o('rev', '*', 10), '+', o('x', '%', 10))), set('x', o('x', '//', 10))]),
    Ret(o(o('x', '==', 'rev'), 'or', o('x', '==', o('rev', '//', 10)))),
  ] });

  add({
    id: 'plus-one', no: 66, title: 'Plus One', zh: '加一', difficulty: 'Easy', lists: ['T150'], pattern: 'math',
    fn: 'plusOne', params: ['digits'], sig: 'int[]; int[]',
    desc: `<p>非負整數用陣列表示每一位（最高位在前）。回傳這個數加一之後的陣列。</p>`,
    tests: [
      { args: [[1, 2, 3]], expected: [1, 2, 4] },
      { args: [[4, 3, 2, 1]], expected: [4, 3, 2, 2] },
      { args: [[9]], expected: [1, 0] },
      { args: [[9, 9]], expected: [1, 0, 0] },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['從最後一位開始：小於 9 就直接 +1 回傳。', '是 9 就變成 0，繼續往前進位。', '全部都是 9：答案是 1 後面接 n 個 0。'],
    insight: '大部分情況一步就結束，只有連續的 9 才需要進位。',
    solution: `對 i 從 n-1 往下到 0:
    如果 digits[i] < 9: digits[i] += 1; 回傳 digits
    digits[i] = 0
res = 長度 n+1 的 0; res[0] = 1
回傳 res`,
  }, { body: [
    For('i', o(len('digits'), '-', 1), -1, -1, [
      If(o(at('digits', 'i'), '<', 9), [setAt('digits', 'i', o(at('digits', 'i'), '+', 1)), Ret('digits')]),
      setAt('digits', 'i', 0),
    ]),
    set('res', fill(o(len('digits'), '+', 1), 0)),
    setAt('res', 0, 1),
    Ret('res'),
  ] });

  add({
    id: 'factorial-trailing-zeroes', no: 172, title: 'Factorial Trailing Zeroes', zh: '階乘後的零', difficulty: 'Medium', lists: ['T150'], pattern: 'math',
    fn: 'trailingZeroes', params: ['n'], sig: 'int; int',
    desc: `<p>回傳 n! 結尾有幾個 0。</p>`,
    tests: [
      { args: [3], expected: 0 },
      { args: [5], expected: 1 },
      { args: [0], expected: 0 },
      { args: [25], expected: 6 },
      { args: [100], expected: 24 },
    ],
    time: 'O(log n)', space: 'O(1)',
    hints: ['結尾的 0 來自 2 × 5，而 2 一定比 5 多。', '所以答案 = n! 的質因數中有幾個 5。', '5 的倍數各貢獻一個、25 的倍數再多一個、125 的倍數再多一個… → 不斷 n //= 5 加總。'],
    insight: '數學觀察把 O(n) 的計算變成 O(log n)。',
    solution: `count = 0
當 n > 0: n = n // 5; count += n
回傳 count`,
  }, { body: [
    set('count', 0),
    While(o('n', '>', 0), [set('n', o('n', '//', 5)), set('count', o('count', '+', 'n'))]),
    Ret('count'),
  ] });

  add({
    id: 'sqrt-x', no: 69, title: 'Sqrt(x)', zh: 'x 的平方根', difficulty: 'Easy', lists: ['T150'], pattern: 'binarySearch',
    fn: 'mySqrt', params: ['x'], sig: 'int; int',
    desc: `<p>回傳 √x 無條件捨去後的整數。不能用內建的次方或開根號函式。</p>`,
    tests: [
      { args: [4], expected: 2 },
      { args: [8], expected: 2 },
      { args: [0], expected: 0 },
      { args: [1], expected: 1 },
      { args: [2147395599], expected: 46339 },
    ],
    time: 'O(log n)', space: 'O(1)',
    hints: ['在 1 ~ x 之間二分搜尋「最大的 mid 使 mid × mid ≤ x」。', 'mid × mid 可能超過 int 範圍 → 改成比較 mid ≤ x // mid。'],
    insight: '「找最大的滿足條件的數」→ 二分搜尋；注意乘法溢位。',
    solution: `lo = 1, hi = x, ans = 0
當 lo <= hi:
    mid = lo + (hi - lo) // 2
    如果 mid <= x // mid: ans = mid; lo = mid + 1
    否則: hi = mid - 1
回傳 ans`,
  }, { body: [
    set('lo', 1), set('hi', 'x'), set('ans', 0),
    While(o('lo', '<=', 'hi'), [
      set('mid', o('lo', '+', o(o('hi', '-', 'lo'), '//', 2))),
      If(o('mid', '<=', o('x', '//', 'mid')), [set('ans', 'mid'), set('lo', o('mid', '+', 1))], set('hi', o('mid', '-', 1))),
    ]),
    Ret('ans'),
  ] });

  add({
    id: 'pow-x-n', no: 50, title: 'Pow(x, n)', zh: 'Pow(x, n)', difficulty: 'Medium', lists: ['T150'], pattern: 'math',
    fn: 'myPow', params: ['x', 'n'], sig: 'double; double, int', compare: 'float',
    desc: `<p>計算 x 的 n 次方（n 可能是負數）。要求 O(log n)。</p>`,
    tests: [
      { args: [2.0, 10], expected: 1024.0 },
      { args: [2.1, 3], expected: 9.261 },
      { args: [2.0, -2], expected: 0.25 },
      { args: [1.0, 2147483647], expected: 1.0 },
      { args: [0.5, -1], expected: 2.0 },
    ],
    time: 'O(log n)', space: 'O(1)',
    hints: ['n 是負數時，x^n = (1/x)^(−n)。', '快速冪：e 是奇數就把目前的底數乘進答案；底數平方，e 減半。'],
    insight: '把指數用二進位拆開：x^13 = x^8 · x^4 · x^1，只要 O(log n) 次乘法。',
    solution: `如果 n < 0: x = 1 / x
e = |n|, res = 1
當 e > 0:
    如果 e % 2 == 1: res = res * x
    x = x * x; e = e // 2
回傳 res`,
  }, { body: [
    If(o('n', '<', 0), set('x', o(1, '/', 'x'))),
    set('e', abs('n')),
    set('res', 1),
    While(o('e', '>', 0), [
      If(o(o('e', '%', 2), '==', 1), set('res', o('res', '*', 'x'))),
      set('x', o('x', '*', 'x')),
      set('e', o('e', '//', 2)),
    ]),
    Ret('res'),
  ] });

  add({
    id: 'max-points-on-line', no: 149, title: 'Max Points on a Line', zh: '直線上最多的點數', difficulty: 'Hard', lists: ['T150'], pattern: 'hash',
    fn: 'maxPoints', params: ['points'], sig: 'int; int[][]',
    desc: `<p>平面上有一些不重複的點，回傳最多有幾個點落在同一條直線上。</p>`,
    tests: [
      { args: [[[1, 1], [2, 2], [3, 3]]], expected: 3 },
      { args: [[[1, 1], [3, 2], [5, 3], [4, 1], [2, 3], [1, 4]]], expected: 4 },
      { args: [[[0, 0]]], expected: 1 },
      { args: [[[1, 0], [0, 0]]], expected: 2 },
    ],
    time: 'O(n²)', space: 'O(n)',
    hints: ['固定一個點 i，其他點跟它的「斜率」相同就在同一條線上。', '斜率用分數 dy/dx 表示，先除以最大公因數 gcd，再統一正負號，避免浮點誤差。', '用字典數每種斜率出現幾次。'],
    insight: '幾何問題轉成「分組計數」；用約分後的整數對當鍵，避免小數誤差。',
    solution: `函式 gcd(a, b): 當 b ≠ 0: (a, b) = (b, a % b); 回傳 a
best = 1
對每個點 i:
    slopes = 空字典
    對 j > i:
        dx, dy = 差值; g = gcd(|dx|, |dy|); dx //= g; dy //= g
        統一方向（dx < 0，或 dx == 0 且 dy < 0 時都取負）
        key = "dy/dx"; slopes[key] += 1; best = max(best, slopes[key] + 1)
回傳 best`,
  }, {
    helpers: [defRet('gcd', ['a', 'b'], [
      While(o('b', '!=', 0), [set('t', o('a', '%', 'b')), set('a', 'b'), set('b', 't')]),
    ], 'a')],
    body: [
      set('best', 1),
      For('i', 0, len('points'), 1, [
        set('slopes', mapNew()),
        For('j', o('i', '+', 1), len('points'), 1, [
          set('dx', o(cell('points', 'j', 0), '-', cell('points', 'i', 0))),
          set('dy', o(cell('points', 'j', 1), '-', cell('points', 'i', 1))),
          set('g', callR('gcd', ['a', 'b'], [abs('dx'), abs('dy')])),
          set('dx', o('dx', '//', 'g')), set('dy', o('dy', '//', 'g')),
          If(o(o('dx', '<', 0), 'or', o(o('dx', '==', 0), 'and', o('dy', '<', 0))), [set('dx', neg('dx')), set('dy', neg('dy'))]),
          set('key', concat(concat('dy', str('/')), 'dx')),
          mset('slopes', 'key', o(mgetd('slopes', 'key', 0), '+', 1)),
          set('best', max('best', o(mgetd('slopes', 'key', 0), '+', 1))),
        ]),
      ]),
      Ret('best'),
    ],
  });
})();
