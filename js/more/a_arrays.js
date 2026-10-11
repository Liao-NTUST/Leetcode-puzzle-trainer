// 第 A 批：陣列 / 字串 / 雙指標 / 滑動視窗
(function () {
  const { set, inc, Ret, If, IfChain, For, Each, While, Continue, Break, at, setAt, len, push, last, empty, list, fill, sort, reverse, slice,
    concat, split, join, repeat, mapNew, mset, mget, mgetd, mhas, o, not, tern, max, min, INF, str, def, call } = Solutions.dsl;
  const add = (p, sol) => { PROBLEMS.push(p); Solutions.add(p.id, sol); };

  add({
    id: 'remove-element', no: 27, title: 'Remove Element', zh: '移除元素', difficulty: 'Easy', lists: ['T150'], pattern: 'twoPointers',
    fn: 'removeElement', params: ['nums', 'val'], sig: 'int; int[], int', check: 'kPrefix', prefixUnordered: true,
    desc: `<p><b>原地</b>移除 <code>nums</code> 中所有等於 <code>val</code> 的元素，回傳剩下的個數 <code>k</code>。</p><p>前 k 個位置要放剩下的元素（順序不限），後面放什麼都可以。</p>`,
    tests: [
      { args: [[3, 2, 2, 3], 3], expected: [2, 2] },
      { args: [[0, 1, 2, 2, 3, 0, 4, 2], 2], expected: [0, 1, 3, 0, 4] },
      { args: [[], 0], expected: [] },
      { args: [[1], 1], expected: [] },
      { args: [[4, 5], 3], expected: [4, 5] },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['用一個「寫入位置」k，從 0 開始。', '讀到不等於 val 的數字，就寫到 nums[k]，然後 k += 1。'],
    insight: '快慢指標：快指標負責讀，慢指標負責寫，原地過濾陣列。',
    solution: `k = 0
對 nums 中每個 x:
    如果 x ≠ val: nums[k] = x; k += 1
回傳 k`,
  }, { body: [
    set('k', 0),
    Each('x', 'nums', If(o('x', '!=', 'val'), [setAt('nums', 'k', 'x'), inc('k', 1)])),
    Ret('k'),
  ] });

  add({
    id: 'remove-duplicates', no: 26, title: 'Remove Duplicates from Sorted Array', zh: '刪除有序陣列中的重複項', difficulty: 'Easy', lists: ['T150'], pattern: 'twoPointers',
    fn: 'removeDuplicates', params: ['nums'], sig: 'int; int[]', check: 'kPrefix',
    desc: `<p><code>nums</code> 已排序。<b>原地</b>刪除重複的數字，讓每個數字只出現一次，回傳不重複的個數 <code>k</code>，前 k 個位置依序放這些數字。</p>`,
    tests: [
      { args: [[1, 1, 2]], expected: [1, 2] },
      { args: [[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]], expected: [0, 1, 2, 3, 4] },
      { args: [[1]], expected: [1] },
      { args: [[-1, 0, 0, 0, 3, 3]], expected: [-1, 0, 3] },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['已排序 → 重複的數字一定相鄰。', 'k 指向下一個寫入位置；nums[i] 跟「最後寫入的 nums[k−1]」不同才寫。'],
    insight: '排序後去重 = 只跟「上一個保留的」比。',
    solution: `k = 1
對 i 從 1 到 n:
    如果 nums[i] ≠ nums[k-1]: nums[k] = nums[i]; k += 1
回傳 k`,
  }, { body: [
    set('k', 1),
    For('i', 1, len('nums'), 1, If(o(at('nums', 'i'), '!=', at('nums', o('k', '-', 1))), [setAt('nums', 'k', at('nums', 'i')), inc('k', 1)])),
    Ret('k'),
  ] });

  add({
    id: 'remove-duplicates-ii', no: 80, title: 'Remove Duplicates from Sorted Array II', zh: '刪除有序陣列中的重複項 II', difficulty: 'Medium', lists: ['T150'], pattern: 'twoPointers',
    fn: 'removeDuplicates', params: ['nums'], sig: 'int; int[]', check: 'kPrefix',
    desc: `<p>同上題，但每個數字<b>最多保留兩次</b>。回傳 k，前 k 個位置依序放結果。</p>`,
    tests: [
      { args: [[1, 1, 1, 2, 2, 3]], expected: [1, 1, 2, 2, 3] },
      { args: [[0, 0, 1, 1, 1, 1, 2, 3, 3]], expected: [0, 0, 1, 1, 2, 3, 3] },
      { args: [[1]], expected: [1] },
      { args: [[1, 1]], expected: [1, 1] },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['寫入位置 k。前兩個一定可以寫。', '之後只要 x ≠ nums[k−2]（往前數兩個已保留的），就可以寫。'],
    insight: '「最多保留 m 個」→ 跟往前第 m 個已保留的元素比較。',
    solution: `k = 0
對 nums 中每個 x:
    如果 k < 2 或 x ≠ nums[k-2]: nums[k] = x; k += 1
回傳 k`,
  }, { body: [
    set('k', 0),
    Each('x', 'nums', If(o(o('k', '<', 2), 'or', o('x', '!=', at('nums', o('k', '-', 2)))), [setAt('nums', 'k', 'x'), inc('k', 1)])),
    Ret('k'),
  ] });

  add({
    id: 'rotate-array', no: 189, title: 'Rotate Array', zh: '輪轉陣列', difficulty: 'Medium', lists: ['T150'], pattern: 'twoPointers',
    fn: 'rotate', params: ['nums', 'k'], sig: 'void; int[], int', resultFrom: 'arg0',
    desc: `<p>把陣列往右<b>輪轉 k 步</b>（原地修改，不用回傳）。例如 [1,2,3,4,5,6,7] 轉 3 步 → [5,6,7,1,2,3,4]。</p>`,
    tests: [
      { args: [[1, 2, 3, 4, 5, 6, 7], 3], expected: [5, 6, 7, 1, 2, 3, 4] },
      { args: [[-1, -100, 3, 99], 2], expected: [3, 99, -1, -100] },
      { args: [[1, 2], 3], expected: [2, 1] },
      { args: [[1], 0], expected: [1] },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['k 可能比長度大，先 k = k % n。', '三次反轉：整個反轉、前 k 個反轉、剩下的反轉。', '寫一個 rev(l, r) 函式反轉一段。'],
    insight: '輪轉 = 三次反轉，O(1) 額外空間。',
    solution: `函式 rev(l, r): 當 l < r: 交換 nums[l], nums[r]; l += 1; r -= 1
k = k % n
rev(0, n-1); rev(0, k-1); rev(k, n-1)`,
  }, {
    helpers: [def('rev', ['l', 'r'], While(o('l', '<', 'r'), [
      set('tmp', at('nums', 'l')), setAt('nums', 'l', at('nums', 'r')), setAt('nums', 'r', 'tmp'), inc('l', 1), inc('r', -1),
    ]))],
    body: [
      set('n', len('nums')),
      set('k', o('k', '%', 'n')),
      call('rev', ['l', 'r'], [0, o('n', '-', 1)]),
      call('rev', ['l', 'r'], [0, o('k', '-', 1)]),
      call('rev', ['l', 'r'], ['k', o('n', '-', 1)]),
    ],
  });

  add({
    id: 'best-time-stock-ii', no: 122, title: 'Best Time to Buy and Sell Stock II', zh: '買賣股票的最佳時機 II', difficulty: 'Medium', lists: ['T150'], pattern: 'greedy',
    fn: 'maxProfit', params: ['prices'], sig: 'int; int[]',
    desc: `<p>每天都可以買或賣（手上最多一股），可以交易<b>任意多次</b>。回傳最大利潤。</p>`,
    tests: [
      { args: [[7, 1, 5, 3, 6, 4]], expected: 7 },
      { args: [[1, 2, 3, 4, 5]], expected: 4 },
      { args: [[7, 6, 4, 3, 1]], expected: 0 },
      { args: [[2, 1, 2, 0, 1]], expected: 2 },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['連續上漲好幾天，一次買賣的利潤 = 每天漲幅加總。', '所以只要今天比昨天高，就把差價收進來。'],
    insight: '交易次數不限 → 收下每一段上漲（貪婪）。',
    solution: `profit = 0
對 i 從 1 到 n:
    如果 prices[i] > prices[i-1]: profit += prices[i] - prices[i-1]
回傳 profit`,
  }, { body: [
    set('profit', 0),
    For('i', 1, len('prices'), 1, If(o(at('prices', 'i'), '>', at('prices', o('i', '-', 1))),
      set('profit', o('profit', '+', o(at('prices', 'i'), '-', at('prices', o('i', '-', 1))))))),
    Ret('profit'),
  ] });

  add({
    id: 'jump-game-ii', no: 45, title: 'Jump Game II', zh: '跳躍遊戲 II', difficulty: 'Medium', lists: ['T150'], pattern: 'greedy',
    fn: 'jump', params: ['nums'], sig: 'int; int[]',
    desc: `<p>從索引 0 出發，<code>nums[i]</code> 是在 i 最多能跳的距離。保證能到達最後一格，回傳<b>最少跳幾次</b>。</p>`,
    tests: [
      { args: [[2, 3, 1, 1, 4]], expected: 2 },
      { args: [[2, 3, 0, 1, 4]], expected: 2 },
      { args: [[0]], expected: 0 },
      { args: [[1, 2, 3]], expected: 2 },
      { args: [[1, 1, 1, 1]], expected: 3 },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['把「跳 j 次能到的範圍」想成 BFS 的一層。', '走過目前這一層時，順便記下下一層最遠到哪 (far)。', '走到這一層的邊界 end 時，跳一次，邊界更新成 far。'],
    insight: '隱式 BFS：每一層是一段連續區間，只要記錄區間邊界。',
    solution: `jumps = 0, end = 0, far = 0
對 i 從 0 到 n-1:
    far = max(far, i + nums[i])
    如果 i == end: jumps += 1; end = far
回傳 jumps`,
  }, { body: [
    set('jumps', 0), set('end', 0), set('far', 0),
    For('i', 0, o(len('nums'), '-', 1), 1, [
      set('far', max('far', o('i', '+', at('nums', 'i')))),
      If(o('i', '==', 'end'), [inc('jumps', 1), set('end', 'far')]),
    ]),
    Ret('jumps'),
  ] });

  add({
    id: 'h-index', no: 274, title: 'H-Index', zh: 'H 指數', difficulty: 'Medium', lists: ['T150'], pattern: 'greedy',
    fn: 'hIndex', params: ['citations'], sig: 'int; int[]',
    desc: `<p>h 指數：有 h 篇論文各被引用<b>至少 h 次</b>的最大 h。給每篇論文的引用數 <code>citations</code>，回傳 h 指數。</p>`,
    tests: [
      { args: [[3, 0, 6, 1, 5]], expected: 3 },
      { args: [[1, 3, 1]], expected: 1 },
      { args: [[0]], expected: 0 },
      { args: [[100]], expected: 1 },
      { args: [[4, 4, 0, 0]], expected: 2 },
    ],
    time: 'O(n log n)', space: 'O(1)',
    hints: ['先由小到大排序。', '排序後第 i 篇（含）之後還有 n − i 篇；如果 citations[i] ≥ n − i，h = n − i 就成立。', '從小的 i 開始找，第一個成立的就是最大的 h。'],
    insight: '排序後「引用數」和「剩下篇數」兩條線交叉的地方就是答案。',
    solution: `排序 citations
對 i 從 0 到 n:
    如果 citations[i] >= n - i: 回傳 n - i
回傳 0`,
  }, { body: [
    sort('citations'),
    set('n', len('citations')),
    For('i', 0, 'n', 1, If(o(at('citations', 'i'), '>=', o('n', '-', 'i')), Ret(o('n', '-', 'i')))),
    Ret(0),
  ] });

  add({
    id: 'gas-station', no: 134, title: 'Gas Station', zh: '加油站', difficulty: 'Medium', lists: ['T150'], pattern: 'greedy',
    fn: 'canCompleteCircuit', params: ['gas', 'cost'], sig: 'int; int[], int[]',
    desc: `<p>環形路線上有 n 個加油站，在第 i 站可加 <code>gas[i]</code> 的油，開到下一站要花 <code>cost[i]</code>。油箱一開始是空的。</p><p>回傳能繞一圈的出發站索引（保證唯一），不行就回傳 -1。</p>`,
    tests: [
      { args: [[1, 2, 3, 4, 5], [3, 4, 5, 1, 2]], expected: 3 },
      { args: [[2, 3, 4], [3, 4, 3]], expected: -1 },
      { args: [[5, 1, 2, 3, 4], [4, 4, 1, 5, 1]], expected: 4 },
      { args: [[3, 1, 1], [1, 2, 2]], expected: 0 },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['總油量 < 總花費 → 一定不行。', '從某站出發，油箱變負時，表示從出發站到這裡的任何一站出發都不行。', '直接把出發站改成下一站，油箱歸零。'],
    insight: '失敗的區段整段都可以跳過 → 一次掃描就能找到起點。',
    solution: `total = 0, tank = 0, start = 0
對 i 從 0 到 n:
    d = gas[i] - cost[i]
    total += d; tank += d
    如果 tank < 0: start = i + 1; tank = 0
回傳 (total < 0 ? -1 : start)`,
  }, { body: [
    set('total', 0), set('tank', 0), set('start', 0),
    For('i', 0, len('gas'), 1, [
      set('d', o(at('gas', 'i'), '-', at('cost', 'i'))),
      set('total', o('total', '+', 'd')),
      set('tank', o('tank', '+', 'd')),
      If(o('tank', '<', 0), [set('start', o('i', '+', 1)), set('tank', 0)]),
    ]),
    Ret(tern(o('total', '<', 0), -1, 'start')),
  ] });

  add({
    id: 'candy', no: 135, title: 'Candy', zh: '分發糖果', difficulty: 'Hard', lists: ['T150'], pattern: 'greedy',
    fn: 'candy', params: ['ratings'], sig: 'int; int[]',
    desc: `<p>每個小孩至少一顆糖；分數比<b>相鄰</b>小孩高的，糖果要比他多。回傳最少需要的糖果總數。</p>`,
    tests: [
      { args: [[1, 0, 2]], expected: 5 },
      { args: [[1, 2, 2]], expected: 4 },
      { args: [[1, 3, 2, 2, 1]], expected: 7 },
      { args: [[1]], expected: 1 },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['把「左鄰」和「右鄰」兩個條件分開處理。', '從左往右：比左邊高就 = 左邊 + 1。', '從右往左：比右邊高就 = max(自己, 右邊 + 1)。'],
    insight: '雙向條件拆成兩次單向掃描，再取最大值。',
    solution: `c = 長度 n 的清單，每格 1
對 i 從 1 到 n: 如果 r[i] > r[i-1]: c[i] = c[i-1] + 1
對 i 從 n-2 往下到 0: 如果 r[i] > r[i+1]: c[i] = max(c[i], c[i+1] + 1)
回傳 c 的總和`,
  }, { body: [
    set('n', len('ratings')),
    set('c', fill('n', 1)),
    For('i', 1, 'n', 1, If(o(at('ratings', 'i'), '>', at('ratings', o('i', '-', 1))), setAt('c', 'i', o(at('c', o('i', '-', 1)), '+', 1)))),
    For('i', o('n', '-', 2), -1, -1, If(o(at('ratings', 'i'), '>', at('ratings', o('i', '+', 1))),
      setAt('c', 'i', max(at('c', 'i'), o(at('c', o('i', '+', 1)), '+', 1))))),
    set('total', 0),
    Each('x', 'c', set('total', o('total', '+', 'x'))),
    Ret('total'),
  ] });

  add({
    id: 'trapping-rain-water', no: 42, title: 'Trapping Rain Water', zh: '接雨水', difficulty: 'Hard', lists: ['T150'], pattern: 'twoPointers',
    fn: 'trap', params: ['height'], sig: 'int; int[]',
    desc: `<p><code>height</code> 是每根柱子的高度（寬度 1）。下雨後柱子之間能接多少水？</p>`,
    tests: [
      { args: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], expected: 6 },
      { args: [[4, 2, 0, 3, 2, 5]], expected: 9 },
      { args: [[1]], expected: 0 },
      { args: [[5, 4, 1, 2]], expected: 1 },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['某格的水量 = min(左邊最高, 右邊最高) − 自己的高度。', '雙指標：哪邊比較矮，那邊的水量就由那邊的最高值決定。', '移動比較矮的那一邊，同時更新那一邊的最高值。'],
    insight: '水位取決於較矮的那一側，所以從矮的那側往內收就能確定答案。',
    solution: `l = 0, r = n-1, lmax = 0, rmax = 0, water = 0
當 l < r:
    如果 h[l] < h[r]: lmax = max(lmax, h[l]); water += lmax - h[l]; l += 1
    否則: rmax = max(rmax, h[r]); water += rmax - h[r]; r -= 1
回傳 water`,
  }, { body: [
    set('l', 0), set('r', o(len('height'), '-', 1)), set('lmax', 0), set('rmax', 0), set('water', 0),
    While(o('l', '<', 'r'), If(o(at('height', 'l'), '<', at('height', 'r')),
      [set('lmax', max('lmax', at('height', 'l'))), set('water', o('water', '+', o('lmax', '-', at('height', 'l')))), inc('l', 1)],
      [set('rmax', max('rmax', at('height', 'r'))), set('water', o('water', '+', o('rmax', '-', at('height', 'r')))), inc('r', -1)])),
    Ret('water'),
  ] });

  const ROMAN = [['M', 1000], ['D', 500], ['C', 100], ['L', 50], ['X', 10], ['V', 5], ['I', 1]];
  add({
    id: 'roman-to-integer', no: 13, title: 'Roman to Integer', zh: '羅馬數字轉整數', difficulty: 'Easy', lists: ['T150'], pattern: 'hash',
    fn: 'romanToInt', params: ['s'], sig: 'int; string',
    desc: `<p>把羅馬數字轉成整數。I=1, V=5, X=10, L=50, C=100, D=500, M=1000。小的數字寫在大的前面表示相減（例如 IV = 4、CM = 900）。</p>`,
    tests: [
      { args: ['III'], expected: 3 },
      { args: ['LVIII'], expected: 58 },
      { args: ['MCMXCIV'], expected: 1994 },
      { args: ['IV'], expected: 4 },
      { args: ['MMMCMXCIX'], expected: 3999 },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['用字典記每個符號的值。', '如果目前符號的值比下一個小，就減掉；否則加上。'],
    insight: '「小在大前面就減」→ 每個符號只要看它的下一個。',
    solution: `value = { I:1, V:5, ... }
total = 0
對 i 從 0 到 n:
    v = value[s[i]]
    如果 i+1 < n 且 v < value[s[i+1]]: total -= v
    否則: total += v
回傳 total`,
  }, { body: [
    set('value', mapNew()),
    ...ROMAN.map(([c, n]) => mset('value', str(c), n)),
    set('total', 0),
    For('i', 0, len('s'), 1, [
      set('v', mget('value', at('s', 'i'))),
      If(o(o(o('i', '+', 1), '<', len('s')), 'and', o('v', '<', mget('value', at('s', o('i', '+', 1))))),
        set('total', o('total', '-', 'v')), set('total', o('total', '+', 'v'))),
    ]),
    Ret('total'),
  ] });

  const VALS = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const SYMS = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  add({
    id: 'integer-to-roman', no: 12, title: 'Integer to Roman', zh: '整數轉羅馬數字', difficulty: 'Medium', lists: ['T150'], pattern: 'greedy',
    fn: 'intToRoman', params: ['num'], sig: 'string; int',
    desc: `<p>把 1 ~ 3999 的整數轉成羅馬數字。</p>`,
    tests: [
      { args: [3749], expected: 'MMMDCCXLIX' },
      { args: [58], expected: 'LVIII' },
      { args: [1994], expected: 'MCMXCIV' },
      { args: [4], expected: 'IV' },
      { args: [3999], expected: 'MMMCMXCIX' },
    ],
    time: 'O(1)', space: 'O(1)',
    hints: ['把 900、400、90、40、9、4 這些特殊組合也當成「符號」。', '從大到小，能減就一直減，順便把符號接上去。'],
    insight: '把特例也做成表格，就能用單純的貪婪找零錢。',
    solution: `vals = [1000, 900, 500, ...], syms = ["M", "CM", "D", ...]
res = ""
對 i 從 0 到 13:
    當 num >= vals[i]: res = res 接上 syms[i]; num -= vals[i]
回傳 res`,
  }, { body: [
    set('vals', list(...VALS)),
    set('syms', list(...SYMS.map(str))),
    set('res', str('')),
    For('i', 0, len('vals'), 1, While(o('num', '>=', at('vals', 'i')), [
      set('res', concat('res', at('syms', 'i'))),
      set('num', o('num', '-', at('vals', 'i'))),
    ])),
    Ret('res'),
  ] });

  add({
    id: 'length-of-last-word', no: 58, title: 'Length of Last Word', zh: '最後一個單字的長度', difficulty: 'Easy', lists: ['T150'], pattern: 'string',
    fn: 'lengthOfLastWord', params: ['s'], sig: 'int; string',
    desc: `<p>字串由單字和空格組成，回傳<b>最後一個單字</b>的長度。</p>`,
    tests: [
      { args: ['Hello World'], expected: 5 },
      { args: ['   fly me   to   the moon  '], expected: 4 },
      { args: ['luffy is still joyboy'], expected: 6 },
      { args: ['a'], expected: 1 },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['從字串尾端往前看。', '先跳過結尾的空格，再數有幾個非空格字元。'],
    insight: '只關心結尾 → 從後面往前掃。',
    solution: `i = n - 1
當 s[i] == ' ': i -= 1
count = 0
當 i >= 0 且 s[i] ≠ ' ': count += 1; i -= 1
回傳 count`,
  }, { body: [
    set('i', o(len('s'), '-', 1)),
    While(o(at('s', 'i'), '==', str(' ')), inc('i', -1)),
    set('count', 0),
    While(o(o('i', '>=', 0), 'and', o(at('s', 'i'), '!=', str(' '))), [inc('count', 1), inc('i', -1)]),
    Ret('count'),
  ] });

  add({
    id: 'reverse-words', no: 151, title: 'Reverse Words in a String', zh: '反轉字串中的單字', difficulty: 'Medium', lists: ['T150'], pattern: 'string',
    fn: 'reverseWords', params: ['s'], sig: 'string; string',
    desc: `<p>把字串中單字的順序反轉，單字之間只留一個空格，頭尾不要有空格。</p>`,
    tests: [
      { args: ['the sky is blue'], expected: 'blue is sky the' },
      { args: ['  hello world  '], expected: 'world hello' },
      { args: ['a good   example'], expected: 'example good a' },
      { args: ['x'], expected: 'x' },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['用空格把字串切成單字清單（略過空字串）。', '把清單反轉，再用一個空格接起來。'],
    insight: '先拆成有結構的資料（單字清單），處理起來就簡單了。',
    solution: `words = 把 s 依 " " 切開
反轉 words
回傳 用 " " 把 words 接起來`,
  }, { body: [
    set('words', split('s', str(' '))),
    reverse('words'),
    Ret(join('words', str(' '))),
  ] });

  add({
    id: 'zigzag-conversion', no: 6, title: 'Zigzag Conversion', zh: 'Z 字形變換', difficulty: 'Medium', lists: ['T150'], pattern: 'string',
    fn: 'convert', params: ['s', 'numRows'], sig: 'string; string, int',
    desc: `<p>把字串依 Z 字形寫在 numRows 列上（往下寫到底再斜著往上），再一列一列讀出來。</p><pre class="code">P   A   H   N
A P L S I I G
Y   I   R</pre><p>"PAYPALISHIRING", 3 列 → "PAHNAPLSIIGYIR"</p>`,
    tests: [
      { args: ['PAYPALISHIRING', 3], expected: 'PAHNAPLSIIGYIR' },
      { args: ['PAYPALISHIRING', 4], expected: 'PINALSIGYAHRPI' },
      { args: ['A', 1], expected: 'A' },
      { args: ['AB', 1], expected: 'AB' },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['不用真的畫出二維表格，只要知道每個字元在第幾列。', '每列一個字串，用 r 記目前在哪一列、dir 記方向。', '碰到第一列或最後一列就轉向。只有 1 列時直接回傳。'],
    insight: '模擬題：抓住「狀態」（目前列 + 方向）就好，不用整張表格。',
    solution: `如果 numRows == 1: 回傳 s
rows = numRows 個空字串, r = 0, dir = 1
對 s 中每個 c:
    rows[r] = rows[r] 接上 c
    如果 r == 0: dir = 1；如果 r == numRows-1: dir = -1
    r += dir
回傳 rows 接起來`,
  }, { body: [
    If(o('numRows', '==', 1), Ret('s')),
    set('rows', fill('numRows', str(''))),
    set('r', 0), set('dir', 1),
    Each('c', 's', [
      setAt('rows', 'r', concat(at('rows', 'r'), 'c')),
      IfChain([[o('r', '==', 0), set('dir', 1)], [o('r', '==', o('numRows', '-', 1)), set('dir', -1)]]),
      set('r', o('r', '+', 'dir')),
    ]),
    Ret(join('rows', str(''))),
  ] });

  add({
    id: 'find-first-occurrence', no: 28, title: 'Find the Index of the First Occurrence in a String', zh: '找出字串中第一個匹配項的索引', difficulty: 'Easy', lists: ['T150'], pattern: 'string',
    fn: 'strStr', params: ['haystack', 'needle'], sig: 'int; string, string',
    desc: `<p>回傳 <code>needle</code> 在 <code>haystack</code> 中第一次出現的索引，沒有則回傳 -1。</p>`,
    tests: [
      { args: ['sadbutsad', 'sad'], expected: 0 },
      { args: ['leetcode', 'leeto'], expected: -1 },
      { args: ['hello', 'll'], expected: 2 },
      { args: ['a', 'a'], expected: 0 },
      { args: ['mississippi', 'issip'], expected: 4 },
      { args: ['ab', 'abc'], expected: -1 },
    ],
    time: 'O(n·k)', space: 'O(1)',
    hints: ['可能的起點只有 0 到 len(haystack) − len(needle)。', '每個起點比較一段長度為 len(needle) 的子字串。'],
    insight: '暴力比對已經夠用；進階可學 KMP 把時間降到 O(n + k)。',
    solution: `對 i 從 0 到 len(h) - len(n) + 1:
    如果 h 從 i 到 i+len(n) 的片段 == needle: 回傳 i
回傳 -1`,
  }, { body: [
    For('i', 0, o(o(len('haystack'), '-', len('needle')), '+', 1), 1,
      If(o(slice('haystack', 'i', o('i', '+', len('needle'))), '==', 'needle'), Ret('i'))),
    Ret(-1),
  ] });

  add({
    id: 'text-justification', no: 68, title: 'Text Justification', zh: '文字左右對齊', difficulty: 'Hard', lists: ['T150'], pattern: 'string',
    fn: 'fullJustify', params: ['words', 'maxWidth'], sig: 'List<string>; string[], int',
    desc: `<p>把單字排成每行剛好 <code>maxWidth</code> 個字元：每行盡量放多的單字，空格平均分配，除不盡時<b>左邊的空隙多放</b>。</p><p><b>最後一行</b>和<b>只有一個單字的行</b>要靠左對齊，右邊補空格。</p>`,
    tests: [
      { args: [['This', 'is', 'an', 'example', 'of', 'text', 'justification.'], 16], expected: ['This    is    an', 'example  of text', 'justification.  '] },
      { args: [['What', 'must', 'be', 'acknowledgment', 'shall', 'be'], 16], expected: ['What   must   be', 'acknowledgment  ', 'shall be        '] },
      { args: [['Science', 'is', 'what', 'we', 'understand', 'well', 'enough', 'to', 'explain', 'to', 'a', 'computer.', 'Art', 'is', 'everything', 'else', 'we', 'do'], 20],
        expected: ['Science  is  what we', 'understand      well', 'enough to explain to', 'a  computer.  Art is', 'everything  else  we', 'do                  '] },
      { args: [['a'], 1], expected: ['a'] },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['先決定一行放哪些單字 [i, j)：單字總長 + 至少一個空格 ≤ maxWidth。', '一般行：空格總數 = maxWidth − 單字總長，平均分給 j−i−1 個空隙，餘數給左邊。', '最後一行或只有一個單字：單字間一個空格，最後補滿。'],
    insight: '模擬題拆成「分行」和「排版」兩步，邊界情況（最後一行、單一單字）分開處理。',
    solution: `i = 0
當 i < n:
    j = i, wordLen = 0
    當 j < n 且 wordLen + len(words[j]) + (j - i) <= maxWidth: wordLen += len(words[j]); j += 1
    gaps = j - i - 1
    如果 j == n 或 gaps == 0: 單字間一個空格，最後補空格到 maxWidth
    否則: each = 空格數 // gaps, extra = 空格數 % gaps，前 extra 個空隙多一格
    加入 line; i = j`,
  }, { body: [
    set('res', empty()),
    set('n', len('words')),
    set('i', 0),
    While(o('i', '<', 'n'), [
      set('j', 'i'),
      set('wordLen', 0),
      While(o(o('j', '<', 'n'), 'and', o(o(o('wordLen', '+', len(at('words', 'j'))), '+', o('j', '-', 'i')), '<=', 'maxWidth')), [
        set('wordLen', o('wordLen', '+', len(at('words', 'j')))),
        inc('j', 1),
      ]),
      set('gaps', o(o('j', '-', 'i'), '-', 1)),
      set('line', str('')),
      If(o(o('j', '==', 'n'), 'or', o('gaps', '==', 0)), [
        For('k', 'i', 'j', 1, [
          set('line', concat('line', at('words', 'k'))),
          If(o('k', '<', o('j', '-', 1)), set('line', concat('line', str(' ')))),
        ]),
        set('line', concat('line', repeat(str(' '), o('maxWidth', '-', len('line'))))),
      ], [
        set('spaces', o('maxWidth', '-', 'wordLen')),
        set('each', o('spaces', '//', 'gaps')),
        set('extra', o('spaces', '%', 'gaps')),
        For('k', 'i', 'j', 1, [
          set('line', concat('line', at('words', 'k'))),
          If(o('k', '<', o('j', '-', 1)), set('line', concat('line', repeat(str(' '), o('each', '+', tern(o(o('k', '-', 'i'), '<', 'extra'), 1, 0)))))),
        ]),
      ]),
      push('res', 'line'),
      set('i', 'j'),
    ]),
    Ret('res'),
  ] });

  add({
    id: 'min-size-subarray-sum', no: 209, title: 'Minimum Size Subarray Sum', zh: '長度最小的子陣列', difficulty: 'Medium', lists: ['T150'], pattern: 'slidingWindow',
    fn: 'minSubArrayLen', params: ['target', 'nums'], sig: 'int; int, int[]',
    desc: `<p>正整數陣列 <code>nums</code> 中，找出總和 <b>≥ target</b> 的最短<b>連續</b>子陣列長度；不存在則回傳 0。</p>`,
    tests: [
      { args: [7, [2, 3, 1, 2, 4, 3]], expected: 2 },
      { args: [4, [1, 4, 4]], expected: 1 },
      { args: [11, [1, 1, 1, 1, 1, 1, 1, 1]], expected: 0 },
      { args: [15, [1, 2, 3, 4, 5]], expected: 5 },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['全是正數 → 視窗變長總和一定變大。', '右邊界擴張加進總和；總和 ≥ target 時，盡量把左邊界往右縮，並記錄長度。'],
    insight: '「最短的、滿足條件的連續區間」→ 滑動視窗，能縮就縮。',
    solution: `l = 0, total = 0, best = ∞
對 r 從 0 到 n:
    total += nums[r]
    當 total >= target: best = min(best, r - l + 1); total -= nums[l]; l += 1
回傳 (best == ∞ ? 0 : best)`,
  }, { body: [
    set('l', 0), set('total', 0), set('best', INF()),
    For('r', 0, len('nums'), 1, [
      set('total', o('total', '+', at('nums', 'r'))),
      While(o('total', '>=', 'target'), [
        set('best', min('best', o(o('r', '-', 'l'), '+', 1))),
        set('total', o('total', '-', at('nums', 'l'))),
        inc('l', 1),
      ]),
    ]),
    Ret(tern(o('best', '==', INF()), 0, 'best')),
  ] });

  add({
    id: 'substring-concatenation', no: 30, title: 'Substring with Concatenation of All Words', zh: '串聯所有單字的子字串', difficulty: 'Hard', lists: ['T150'], pattern: 'slidingWindow',
    fn: 'findSubstring', params: ['s', 'words'], sig: 'List<int>; string, string[]', compare: 'unordered',
    desc: `<p><code>words</code> 裡的單字長度都一樣。找出 <code>s</code> 中所有起點，使得從那裡開始的子字串剛好是 words 所有單字<b>以任意順序</b>串起來的結果。</p>`,
    tests: [
      { args: ['barfoothefoobarman', ['foo', 'bar']], expected: [0, 9] },
      { args: ['wordgoodgoodgoodbestword', ['word', 'good', 'best', 'word']], expected: [] },
      { args: ['barfoofoobarthefoobarman', ['bar', 'foo', 'the']], expected: [6, 9, 12] },
      { args: ['aaa', ['a', 'a']], expected: [0, 1] },
    ],
    time: 'O(n·k)', space: 'O(k)',
    hints: ['先用字典數每個單字需要幾個。', '每個起點 i，一次切一個單字長度，邊切邊計數。', '遇到不在字典裡、或用超過的單字就失敗。'],
    insight: '「任意順序的組合」= 比較頻率表。進階可以用以單字長度為步長的滑動視窗做到 O(n)。',
    solution: `wl = 單字長度, total = wl * 單字數
need = 每個單字的數量
對每個起點 i (0 到 len(s) - total):
    seen = 空字典, ok = true
    對 j 從 0 到 單字數: w = s 第 i+j*wl 起長度 wl 的片段
        如果 w 不在 need 或 seen[w] 超過 need[w]: ok = false; 跳出
    如果 ok: 加入 i`,
  }, { body: [
    set('wl', len(at('words', 0))),
    set('total', o('wl', '*', len('words'))),
    set('need', mapNew()),
    Each('w', 'words', mset('need', 'w', o(mgetd('need', 'w', 0), '+', 1))),
    set('res', empty()),
    For('i', 0, o(o(len('s'), '-', 'total'), '+', 1), 1, [
      set('seen', mapNew()),
      set('ok', true),
      For('j', 0, len('words'), 1, [
        set('piece', slice('s', o('i', '+', o('j', '*', 'wl')), o('i', '+', o(o('j', '+', 1), '*', 'wl')))),
        If(not(mhas('need', 'piece')), [set('ok', false), Break()]),
        mset('seen', 'piece', o(mgetd('seen', 'piece', 0), '+', 1)),
        If(o(mget('seen', 'piece'), '>', mget('need', 'piece')), [set('ok', false), Break()]),
      ]),
      If('ok', push('res', 'i')),
    ]),
    Ret('res'),
  ] });

  add({
    id: 'min-window-substring', no: 76, title: 'Minimum Window Substring', zh: '最小覆蓋子字串', difficulty: 'Hard', lists: ['B75', 'T150'], pattern: 'slidingWindow',
    fn: 'minWindow', params: ['s', 't'], sig: 'string; string, string',
    desc: `<p>找出 <code>s</code> 中<b>包含 t 所有字元（含重複次數）</b>的最短子字串；沒有則回傳 ""。答案保證唯一。</p>`,
    tests: [
      { args: ['ADOBECODEBANC', 'ABC'], expected: 'BANC' },
      { args: ['a', 'a'], expected: 'a' },
      { args: ['a', 'aa'], expected: '' },
      { args: ['ab', 'b'], expected: 'b' },
      { args: ['cabwefgewcwaefgcf', 'cae'], expected: 'cwae' },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['need[c] = 還需要幾個 c；missing = 總共還缺幾個字元。', '右邊界擴張：如果 need[c] > 0 就 missing −1，然後 need[c] −1。', 'missing == 0 時視窗合法：記錄答案，再縮左邊界（need[左字元] +1，變正就 missing +1）。'],
    insight: '滑動視窗 + 欠債表：need 可以變負數（多出來的），只有「欠的」歸零才算合法。',
    solution: `need = t 的字元計數, missing = len(t), l = 0, bestL = 0, bestLen = ∞
對 r 從 0 到 n:
    c = s[r]
    如果 need[c] > 0: missing -= 1
    need[c] -= 1
    當 missing == 0:
        如果 r - l + 1 < bestLen: bestLen = r - l + 1; bestL = l
        need[s[l]] += 1
        如果 need[s[l]] > 0: missing += 1
        l += 1
回傳 (bestLen == ∞ ? "" : s 從 bestL 起 bestLen 長的片段)`,
  }, { body: [
    set('need', mapNew()),
    Each('c', 't', mset('need', 'c', o(mgetd('need', 'c', 0), '+', 1))),
    set('missing', len('t')),
    set('l', 0), set('bestL', 0), set('bestLen', INF()),
    For('r', 0, len('s'), 1, [
      set('c', at('s', 'r')),
      If(o(mgetd('need', 'c', 0), '>', 0), inc('missing', -1)),
      mset('need', 'c', o(mgetd('need', 'c', 0), '-', 1)),
      While(o('missing', '==', 0), [
        If(o(o(o('r', '-', 'l'), '+', 1), '<', 'bestLen'), [set('bestLen', o(o('r', '-', 'l'), '+', 1)), set('bestL', 'l')]),
        set('lc', at('s', 'l')),
        mset('need', 'lc', o(mget('need', 'lc'), '+', 1)),
        If(o(mget('need', 'lc'), '>', 0), inc('missing', 1)),
        inc('l', 1),
      ]),
    ]),
    Ret(tern(o('bestLen', '==', INF()), str(''), slice('s', 'bestL', o('bestL', '+', 'bestLen')))),
  ] });

  add({
    id: 'longest-repeating-replacement', no: 424, title: 'Longest Repeating Character Replacement', zh: '替換後的最長重複字元', difficulty: 'Medium', lists: ['B75'], pattern: 'slidingWindow',
    fn: 'characterReplacement', params: ['s', 'k'], sig: 'int; string, int',
    desc: `<p>字串只有大寫字母。最多把 <code>k</code> 個字元換成任意字母，回傳能得到的「全部相同字母」子字串的最長長度。</p>`,
    tests: [
      { args: ['ABAB', 2], expected: 4 },
      { args: ['AABABBA', 1], expected: 4 },
      { args: ['AAAA', 0], expected: 4 },
      { args: ['ABCDE', 1], expected: 2 },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['視窗合法的條件：視窗長度 − 視窗中最多的字母數 ≤ k。', '右邊擴張時更新該字母的計數和 maxf。', '不合法時左邊縮一格（maxf 不必往下修正，答案不會因此變錯）。'],
    insight: '把「要換幾個」轉成「長度 − 最多字母數」，就變成標準滑動視窗。',
    solution: `count = 空字典, l = 0, maxf = 0, best = 0
對 r 從 0 到 n:
    count[s[r]] += 1; maxf = max(maxf, count[s[r]])
    當 (r - l + 1) - maxf > k: count[s[l]] -= 1; l += 1
    best = max(best, r - l + 1)
回傳 best`,
  }, { body: [
    set('count', mapNew()), set('l', 0), set('maxf', 0), set('best', 0),
    For('r', 0, len('s'), 1, [
      set('c', at('s', 'r')),
      mset('count', 'c', o(mgetd('count', 'c', 0), '+', 1)),
      set('maxf', max('maxf', mget('count', 'c'))),
      While(o(o(o(o('r', '-', 'l'), '+', 1), '-', 'maxf'), '>', 'k'), [
        mset('count', at('s', 'l'), o(mget('count', at('s', 'l')), '-', 1)),
        inc('l', 1),
      ]),
      set('best', max('best', o(o('r', '-', 'l'), '+', 1))),
    ]),
    Ret('best'),
  ] });

  add({
    id: 'maximum-product-subarray', no: 152, title: 'Maximum Product Subarray', zh: '乘積最大子陣列', difficulty: 'Medium', lists: ['B75'], pattern: 'dp',
    fn: 'maxProduct', params: ['nums'], sig: 'int; int[]',
    desc: `<p>找出乘積最大的<b>連續</b>子陣列，回傳乘積。</p>`,
    tests: [
      { args: [[2, 3, -2, 4]], expected: 6 },
      { args: [[-2, 0, -1]], expected: 0 },
      { args: [[-2, 3, -4]], expected: 24 },
      { args: [[-2]], expected: -2 },
      { args: [[0, 2]], expected: 2 },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['負數會讓最大變最小、最小變最大。', '同時記錄「以目前結尾」的最大乘積 hi 和最小乘積 lo。', '遇到負數先交換 hi、lo，再各自更新。'],
    insight: 'Kadane 的變形：因為有負號，要同時追蹤最大和最小。',
    solution: `hi = lo = best = nums[0]
對 i 從 1 到 n:
    x = nums[i]
    如果 x < 0: 交換 hi, lo
    hi = max(x, hi * x); lo = min(x, lo * x)
    best = max(best, hi)
回傳 best`,
  }, { body: [
    set('hi', at('nums', 0)), set('lo', at('nums', 0)), set('best', at('nums', 0)),
    For('i', 1, len('nums'), 1, [
      set('x', at('nums', 'i')),
      If(o('x', '<', 0), [set('tmp', 'hi'), set('hi', 'lo'), set('lo', 'tmp')]),
      set('hi', max('x', o('hi', '*', 'x'))),
      set('lo', min('x', o('lo', '*', 'x'))),
      set('best', max('best', 'hi')),
    ]),
    Ret('best'),
  ] });

  add({
    id: 'max-sum-circular', no: 918, title: 'Maximum Sum Circular Subarray', zh: '環形子陣列的最大和', difficulty: 'Medium', lists: ['T150'], pattern: 'dp',
    fn: 'maxSubarraySumCircular', params: ['nums'], sig: 'int; int[]',
    desc: `<p>陣列是<b>環形</b>的（最後一個接回第一個）。回傳非空子陣列的最大和，每個元素最多用一次。</p>`,
    tests: [
      { args: [[1, -2, 3, -2]], expected: 3 },
      { args: [[5, -3, 5]], expected: 10 },
      { args: [[-3, -2, -3]], expected: -2 },
      { args: [[3, -1, 2, -1]], expected: 4 },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['跨過尾端的子陣列 = 總和 − 中間某段子陣列。', '所以答案 = max(一般最大子陣列和, 總和 − 最小子陣列和)。', '如果全部是負數（最大和 < 0），只能用第一種。'],
    insight: '環形 = 「取中間一段」或「挖掉中間一段」，各用一次 Kadane。',
    solution: `total = 0, curMax = 0, maxSum = -∞, curMin = 0, minSum = ∞
對 nums 中每個 x:
    curMax = max(x, curMax + x); maxSum = max(maxSum, curMax)
    curMin = min(x, curMin + x); minSum = min(minSum, curMin)
    total += x
如果 maxSum < 0: 回傳 maxSum
回傳 max(maxSum, total - minSum)`,
  }, { body: [
    set('total', 0), set('curMax', 0), set('maxSum', at('nums', 0)), set('curMin', 0), set('minSum', at('nums', 0)),
    Each('x', 'nums', [
      set('curMax', max('x', o('curMax', '+', 'x'))),
      set('maxSum', max('maxSum', 'curMax')),
      set('curMin', min('x', o('curMin', '+', 'x'))),
      set('minSum', min('minSum', 'curMin')),
      set('total', o('total', '+', 'x')),
    ]),
    If(o('maxSum', '<', 0), Ret('maxSum')),
    Ret(max('maxSum', o('total', '-', 'minSum'))),
  ] });

  add({
    id: 'summary-ranges', no: 228, title: 'Summary Ranges', zh: '彙總區間', difficulty: 'Easy', lists: ['T150'], pattern: 'intervals',
    fn: 'summaryRanges', params: ['nums'], sig: 'List<string>; int[]',
    desc: `<p>已排序、不重複的整數陣列，把連續的數字合併成區間字串：單一數字寫 "a"，一段寫 "a->b"。</p>`,
    tests: [
      { args: [[0, 1, 2, 4, 5, 7]], expected: ['0->2', '4->5', '7'] },
      { args: [[0, 2, 3, 4, 6, 8, 9]], expected: ['0', '2->4', '6', '8->9'] },
      { args: [[]], expected: [] },
      { args: [[-1]], expected: ['-1'] },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['記住區間起點 start，往後走到不連續為止。', '起點和終點一樣就只寫一個數字。'],
    insight: '分組掃描：外層找每組開頭，內層走到這組結尾。',
    solution: `i = 0
當 i < n:
    start = nums[i]
    當 i+1 < n 且 nums[i+1] == nums[i] + 1: i += 1
    加入 (nums[i] == start ? "start" : "start->nums[i]")
    i += 1`,
  }, { body: [
    set('res', empty()),
    set('i', 0),
    While(o('i', '<', len('nums')), [
      set('start', at('nums', 'i')),
      While(o(o(o('i', '+', 1), '<', len('nums')), 'and', o(at('nums', o('i', '+', 1)), '==', o(at('nums', 'i'), '+', 1))), inc('i', 1)),
      If(o(at('nums', 'i'), '==', 'start'),
        push('res', concat(str(''), 'start')),
        push('res', concat(concat('start', str('->')), at('nums', 'i')))),
      inc('i', 1),
    ]),
    Ret('res'),
  ] });
})();
