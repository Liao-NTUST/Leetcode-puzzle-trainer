// 第 G 批：動態規劃
(function () {
  const { set, Ret, If, For, Each, While, Break, at, setAt, len, push, fill, grid, copy, slice, digit, setFrom, shas,
    o, not, max, min, neg, str, defRet, callR } = Solutions.dsl;
  const add = (p, sol) => { PROBLEMS.push(p); Solutions.add(p.id, sol); };
  const cell = (g, r, c) => at(at(g, r), c);
  const setCell = (g, r, c, v) => setAt(at(g, r), c, v);

  add({
    id: 'longest-increasing-subsequence', no: 300, title: 'Longest Increasing Subsequence', zh: '最長遞增子序列', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'dp',
    fn: 'lengthOfLIS', params: ['nums'], sig: 'int; int[]',
    desc: `<p>回傳最長<b>嚴格遞增</b>子序列的長度（子序列不必連續）。進階：O(n log n)。</p>`,
    tests: [
      { args: [[10, 9, 2, 5, 3, 7, 101, 18]], expected: 4 },
      { args: [[0, 1, 0, 3, 2, 3]], expected: 4 },
      { args: [[7, 7, 7, 7, 7, 7, 7]], expected: 1 },
      { args: [[1]], expected: 1 },
    ],
    time: 'O(n log n)', space: 'O(n)',
    hints: ['O(n²) 做法：dp[i] = 以 nums[i] 結尾的最長長度 = 1 + max(dp[j])，j < i 且 nums[j] < nums[i]。', 'O(n log n)：tails[k] = 長度 k+1 的遞增子序列中，最小的結尾。', '每個 x 用二分搜尋找第一個 ≥ x 的位置：找不到就接在後面，找到就替換。'],
    insight: '貪婪 + 二分：讓每個長度的結尾盡量小，才有機會接更長。',
    solution: `tails = []
對每個 x:
    lo = 0, hi = len(tails)
    二分找第一個 tails[mid] >= x
    如果 lo == len(tails): 加入 x
    否則: tails[lo] = x
回傳 len(tails)`,
  }, { body: [
    set('tails', Solutions.dsl.empty()),
    Each('x', 'nums', [
      set('lo', 0), set('hi', len('tails')),
      While(o('lo', '<', 'hi'), [
        set('mid', o(o('lo', '+', 'hi'), '//', 2)),
        If(o(at('tails', 'mid'), '<', 'x'), set('lo', o('mid', '+', 1)), set('hi', 'mid')),
      ]),
      If(o('lo', '==', len('tails')), push('tails', 'x'), setAt('tails', 'lo', 'x')),
    ]),
    Ret(len('tails')),
  ] });

  add({
    id: 'longest-common-subsequence', no: 1143, title: 'Longest Common Subsequence', zh: '最長公共子序列', difficulty: 'Medium', lists: ['B75'], pattern: 'dp',
    fn: 'longestCommonSubsequence', params: ['text1', 'text2'], sig: 'int; string, string',
    desc: `<p>回傳兩個字串最長公共子序列的長度（子序列：刪掉一些字元、不改變順序）。</p>`,
    tests: [
      { args: ['abcde', 'ace'], expected: 3 },
      { args: ['abc', 'abc'], expected: 3 },
      { args: ['abc', 'def'], expected: 0 },
      { args: ['bsbininm', 'jmjkbkjkv'], expected: 1 },
    ],
    time: 'O(m·n)', space: 'O(m·n)',
    hints: ['dp[i][j] = text1 前 i 個字元和 text2 前 j 個字元的 LCS 長度。', '最後一個字元相同：dp[i][j] = dp[i−1][j−1] + 1。', '不同：dp[i][j] = max(dp[i−1][j], dp[i][j−1])。'],
    insight: '兩個序列的 DP：表格的兩個維度各代表一個字串的前綴。',
    solution: `dp = (m+1) × (n+1) 的 0
對 i 從 1 到 m, j 從 1 到 n:
    如果 text1[i-1] == text2[j-1]: dp[i][j] = dp[i-1][j-1] + 1
    否則: dp[i][j] = max(dp[i-1][j], dp[i][j-1])
回傳 dp[m][n]`,
  }, { body: [
    set('m', len('text1')), set('n', len('text2')),
    set('dp', grid(o('m', '+', 1), o('n', '+', 1), 0)),
    For('i', 1, o('m', '+', 1), 1, For('j', 1, o('n', '+', 1), 1,
      If(o(at('text1', o('i', '-', 1)), '==', at('text2', o('j', '-', 1))),
        setCell('dp', 'i', 'j', o(cell('dp', o('i', '-', 1), o('j', '-', 1)), '+', 1)),
        setCell('dp', 'i', 'j', max(cell('dp', o('i', '-', 1), 'j'), cell('dp', 'i', o('j', '-', 1))))))),
    Ret(cell('dp', 'm', 'n')),
  ] });

  add({
    id: 'word-break', no: 139, title: 'Word Break', zh: '單字拆分', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'dp',
    fn: 'wordBreak', params: ['s', 'wordDict'], sig: 'bool; string, List<string>',
    desc: `<p>判斷字串 s 能不能切成一個或多個字典裡的單字（單字可以重複使用）。</p>`,
    tests: [
      { args: ['leetcode', ['leet', 'code']], expected: true },
      { args: ['applepenapple', ['apple', 'pen']], expected: true },
      { args: ['catsandog', ['cats', 'dog', 'sand', 'and', 'cat']], expected: false },
      { args: ['a', ['b']], expected: false },
    ],
    time: 'O(n²)', space: 'O(n)',
    hints: ['dp[i] = s 的前 i 個字元能不能被拆分。dp[0] = true。', 'dp[i] 成立，如果存在 j < i 使 dp[j] 成立而且 s[j..i) 在字典裡。', '字典先轉成集合，查詢比較快。'],
    insight: '「能不能切」→ 前綴 DP：枚舉最後一個單字的起點。',
    solution: `words = 用 wordDict 建立集合
dp = 長度 n+1 的 false; dp[0] = true
對 i 從 1 到 n:
    對 j 從 0 到 i:
        如果 dp[j] 且 s[j..i) 在 words: dp[i] = true; 跳出
回傳 dp[n]`,
  }, { body: [
    set('words', setFrom('wordDict')),
    set('n', len('s')),
    set('dp', fill(o('n', '+', 1), false)),
    setAt('dp', 0, true),
    For('i', 1, o('n', '+', 1), 1, For('j', 0, 'i', 1,
      If(o(at('dp', 'j'), 'and', shas('words', slice('s', 'j', 'i'))), [setAt('dp', 'i', true), Break()]))),
    Ret(at('dp', 'n')),
  ] });

  add({
    id: 'combination-sum-iv', no: 377, title: 'Combination Sum IV', zh: '組合總和 IV', difficulty: 'Medium', lists: ['B75'], pattern: 'dp',
    fn: 'combinationSum4', params: ['nums', 'target'], sig: 'int; int[], int',
    desc: `<p>從不重複的正整數 nums 中選數字（可重複選），總和等於 target 的<b>排列</b>有幾種？（順序不同算不同種）</p>`,
    tests: [
      { args: [[1, 2, 3], 4], expected: 7 },
      { args: [[9], 3], expected: 0 },
      { args: [[1], 5], expected: 1 },
      { args: [[1, 2], 10], expected: 89 },
    ],
    time: 'O(n·k)', space: 'O(n)',
    hints: ['dp[t] = 湊出 t 的方法數；dp[0] = 1。', '最後一個選的數是 x → 前面要湊出 t − x。', 'dp[t] = Σ dp[t − x]（x ≤ t）。外層跑 t、內層跑 x，順序才會被算成不同。'],
    insight: '跟爬樓梯一樣：「最後一步是什麼」決定遞迴式；迴圈順序決定是排列還是組合。',
    solution: `dp = 長度 target+1 的 0; dp[0] = 1
對 t 從 1 到 target:
    對 nums 中每個 x: 如果 x <= t: dp[t] += dp[t - x]
回傳 dp[target]`,
  }, { body: [
    set('dp', fill(o('target', '+', 1), 0)),
    setAt('dp', 0, 1),
    For('t', 1, o('target', '+', 1), 1, Each('x', 'nums', If(o('x', '<=', 't'), setAt('dp', 't', o(at('dp', 't'), '+', at('dp', o('t', '-', 'x'))))))),
    Ret(at('dp', 'target')),
  ] });

  add({
    id: 'house-robber-ii', no: 213, title: 'House Robber II', zh: '打家劫舍 II', difficulty: 'Medium', lists: ['B75'], pattern: 'dp',
    fn: 'rob', params: ['nums'], sig: 'int; int[]',
    desc: `<p>跟打家劫舍一樣，但房子圍成<b>一圈</b>：第一間和最後一間也相鄰。</p>`,
    tests: [
      { args: [[2, 3, 2]], expected: 3 },
      { args: [[1, 2, 3, 1]], expected: 4 },
      { args: [[1, 2, 3]], expected: 3 },
      { args: [[5]], expected: 5 },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['第一間和最後一間不能同時偷。', '所以拆成兩種情況：不偷最後一間（範圍 0 ~ n−2）、不偷第一間（範圍 1 ~ n−1），各做一次原本的打家劫舍。', '只有一間房子時要特別處理。'],
    insight: '環形 → 拆成兩個線性問題取最大值。',
    solution: `函式 robRange(l, r): 原本打家劫舍，只看 nums[l..r]
如果 n == 1: 回傳 nums[0]
回傳 max(robRange(0, n-2), robRange(1, n-1))`,
  }, {
    helpers: [defRet('robRange', ['l', 'r'], [
      set('prev2', 0), set('prev1', 0),
      For('i', 'l', o('r', '+', 1), 1, [
        set('cur', max('prev1', o('prev2', '+', at('nums', 'i')))),
        set('prev2', 'prev1'), set('prev1', 'cur'),
      ]),
    ], 'prev1')],
    body: [
      set('n', len('nums')),
      If(o('n', '==', 1), Ret(at('nums', 0))),
      Ret(max(callR('robRange', ['l', 'r'], [0, o('n', '-', 2)]), callR('robRange', ['l', 'r'], [1, o('n', '-', 1)]))),
    ],
  });

  add({
    id: 'decode-ways', no: 91, title: 'Decode Ways', zh: '解碼方法', difficulty: 'Medium', lists: ['B75'], pattern: 'dp',
    fn: 'numDecodings', params: ['s'], sig: 'int; string',
    desc: `<p>A→1、B→2、…、Z→26。給一串數字，回傳有幾種解碼方法。（"06" 不能解成 F）</p>`,
    tests: [
      { args: ['12'], expected: 2 },
      { args: ['226'], expected: 3 },
      { args: ['06'], expected: 0 },
      { args: ['11106'], expected: 2 },
      { args: ['10'], expected: 1 },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['dp[i] = 前 i 個字元的解碼方法數；dp[0] = 1。', '最後一個字元單獨解碼（不是 0）：加上 dp[i−1]。', '最後兩個字元合起來解碼（10 ~ 26）：加上 dp[i−2]。'],
    insight: '爬樓梯的變形：每次走 1 步或 2 步，只是有些步不合法。',
    solution: `dp = 長度 n+1 的 0; dp[0] = 1
對 i 從 1 到 n:
    如果 s[i-1] ≠ '0': dp[i] += dp[i-1]
    如果 i >= 2: two = 兩位數 s[i-2..i); 如果 10 <= two <= 26: dp[i] += dp[i-2]
回傳 dp[n]`,
  }, { body: [
    set('n', len('s')),
    set('dp', fill(o('n', '+', 1), 0)),
    setAt('dp', 0, 1),
    For('i', 1, o('n', '+', 1), 1, [
      If(o(at('s', o('i', '-', 1)), '!=', str('0')), setAt('dp', 'i', o(at('dp', 'i'), '+', at('dp', o('i', '-', 1))))),
      If(o('i', '>=', 2), [
        set('two', o(o(digit(at('s', o('i', '-', 2))), '*', 10), '+', digit(at('s', o('i', '-', 1))))),
        If(o(o('two', '>=', 10), 'and', o('two', '<=', 26)), setAt('dp', 'i', o(at('dp', 'i'), '+', at('dp', o('i', '-', 2))))),
      ]),
    ]),
    Ret(at('dp', 'n')),
  ] });

  add({
    id: 'triangle', no: 120, title: 'Triangle', zh: '三角形最小路徑和', difficulty: 'Medium', lists: ['T150'], pattern: 'dp',
    fn: 'minimumTotal', params: ['triangle'], sig: 'int; List<List<int>>',
    desc: `<p>從三角形頂端走到底部，每一步只能走到下一列相鄰的兩個位置（同一個索引或索引 +1）。回傳最小路徑和。</p>`,
    tests: [
      { args: [[[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]]], expected: 11 },
      { args: [[[-10]]], expected: -10 },
      { args: [[[1], [2, 3]]], expected: 3 },
    ],
    time: 'O(n²)', space: 'O(n)',
    hints: ['從底部往上算比較簡單：每個位置的最佳值 = 自己 + 下一列兩個相鄰位置的較小值。', '用一維陣列 dp，從最後一列開始，一列一列往上覆蓋。'],
    insight: '由下往上的 DP 讓「終點不唯一」變成「起點唯一」。',
    solution: `dp = 最後一列的複本
對 r 從 n-2 往上到 0:
    對 c 從 0 到 r: dp[c] = triangle[r][c] + min(dp[c], dp[c+1])
回傳 dp[0]`,
  }, { body: [
    set('n', len('triangle')),
    set('dp', copy(at('triangle', o('n', '-', 1)))),
    For('r', o('n', '-', 2), -1, -1, For('c', 0, o('r', '+', 1), 1,
      setAt('dp', 'c', o(cell('triangle', 'r', 'c'), '+', min(at('dp', 'c'), at('dp', o('c', '+', 1))))))),
    Ret(at('dp', 0)),
  ] });

  add({
    id: 'minimum-path-sum', no: 64, title: 'Minimum Path Sum', zh: '最小路徑和', difficulty: 'Medium', lists: ['T150'], pattern: 'dp',
    fn: 'minPathSum', params: ['grid'], sig: 'int; int[][]',
    desc: `<p>從左上角走到右下角，每次只能往右或往下，回傳路徑上數字總和的最小值。</p>`,
    tests: [
      { args: [[[1, 3, 1], [1, 5, 1], [4, 2, 1]]], expected: 7 },
      { args: [[[1, 2, 3], [4, 5, 6]]], expected: 12 },
      { args: [[[5]]], expected: 5 },
    ],
    time: 'O(m·n)', space: 'O(1)',
    hints: ['到達 (r, c) 只能從上面或左邊來。', 'grid[r][c] += min(上, 左)；第一列只能從左來、第一行只能從上來。', '可以直接覆蓋 grid，不用額外空間。'],
    insight: '二維 DP：格子的答案只依賴上面和左邊。',
    solution: `對每個 r, c:
    如果 r == 0 且 c == 0: 跳過
    否則如果 r == 0: grid[r][c] += grid[r][c-1]
    否則如果 c == 0: grid[r][c] += grid[r-1][c]
    否則: grid[r][c] += min(grid[r-1][c], grid[r][c-1])
回傳 grid[m-1][n-1]`,
  }, { body: [
    set('m', len('grid')), set('n', len(at('grid', 0))),
    For('r', 0, 'm', 1, For('c', 0, 'n', 1, Solutions.dsl.IfChain([
      [o(o('r', '==', 0), 'and', o('c', '==', 0)), Solutions.dsl.Continue()],
      [o('r', '==', 0), setCell('grid', 'r', 'c', o(cell('grid', 'r', 'c'), '+', cell('grid', 'r', o('c', '-', 1))))],
      [o('c', '==', 0), setCell('grid', 'r', 'c', o(cell('grid', 'r', 'c'), '+', cell('grid', o('r', '-', 1), 'c')))],
    ], setCell('grid', 'r', 'c', o(cell('grid', 'r', 'c'), '+', min(cell('grid', o('r', '-', 1), 'c'), cell('grid', 'r', o('c', '-', 1)))))))),
    Ret(cell('grid', o('m', '-', 1), o('n', '-', 1))),
  ] });

  add({
    id: 'unique-paths-ii', no: 63, title: 'Unique Paths II', zh: '不同路徑 II', difficulty: 'Medium', lists: ['T150'], pattern: 'dp',
    fn: 'uniquePathsWithObstacles', params: ['obstacleGrid'], sig: 'int; int[][]',
    desc: `<p>跟「不同路徑」一樣（只能往右或往下），但格子是 1 的地方有障礙物不能走。回傳路徑數。</p>`,
    tests: [
      { args: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], expected: 2 },
      { args: [[[0, 1], [0, 0]]], expected: 1 },
      { args: [[[1]]], expected: 0 },
      { args: [[[0]]], expected: 1 },
    ],
    time: 'O(m·n)', space: 'O(n)',
    hints: ['dp[c] 表示走到目前這一列第 c 格的方法數（一維就夠）。', '障礙物的格子方法數是 0。', '否則 dp[c] += dp[c−1]（上面的就是原本的 dp[c]）。'],
    insight: '二維 DP 只依賴上一列 → 壓成一維陣列。',
    solution: `dp = 長度 n 的 0; dp[0] = (起點不是障礙 ? 1 : 0)
對每個 r, c:
    如果 grid[r][c] == 1: dp[c] = 0
    否則如果 c > 0: dp[c] += dp[c-1]
回傳 dp[n-1]`,
  }, { body: [
    set('m', len('obstacleGrid')), set('n', len(at('obstacleGrid', 0))),
    set('dp', fill('n', 0)),
    setAt('dp', 0, Solutions.dsl.tern(o(cell('obstacleGrid', 0, 0), '==', 0), 1, 0)),
    For('r', 0, 'm', 1, For('c', 0, 'n', 1, Solutions.dsl.IfChain([
      [o(cell('obstacleGrid', 'r', 'c'), '==', 1), setAt('dp', 'c', 0)],
      [o('c', '>', 0), setAt('dp', 'c', o(at('dp', 'c'), '+', at('dp', o('c', '-', 1))))],
    ]))),
    Ret(at('dp', o('n', '-', 1))),
  ] });

  add({
    id: 'interleaving-string', no: 97, title: 'Interleaving String', zh: '交錯字串', difficulty: 'Medium', lists: ['T150'], pattern: 'dp',
    fn: 'isInterleave', params: ['s1', 's2', 's3'], sig: 'bool; string, string, string',
    desc: `<p>判斷 s3 是否由 s1 和 s2 <b>交錯</b>組成（各自的字元順序保持不變）。</p>`,
    tests: [
      { args: ['aabcc', 'dbbca', 'aadbbcbcac'], expected: true },
      { args: ['aabcc', 'dbbca', 'aadbbbaccc'], expected: false },
      { args: ['', '', ''], expected: true },
      { args: ['a', '', 'a'], expected: true },
      { args: ['a', 'b', 'abc'], expected: false },
    ],
    time: 'O(m·n)', space: 'O(m·n)',
    hints: ['長度不合直接 false。', 'dp[i][j] = s1 前 i 個和 s2 前 j 個能否組成 s3 前 i+j 個。', 'dp[i][j] = (dp[i−1][j] 且 s1[i−1] == s3[i+j−1]) 或 (dp[i][j−1] 且 s2[j−1] == s3[i+j−1])。'],
    insight: '兩個指標各自前進的所有可能 → 用二維 DP 記錄「走到 (i, j) 是否可行」。',
    solution: `如果 m + n ≠ len(s3): 回傳 false
dp = (m+1) × (n+1) 的 false; dp[0][0] = true
對 i 從 0 到 m, j 從 0 到 n:
    如果 i > 0 且 dp[i-1][j] 且 s1[i-1] == s3[i+j-1]: dp[i][j] = true
    如果 j > 0 且 dp[i][j-1] 且 s2[j-1] == s3[i+j-1]: dp[i][j] = true
回傳 dp[m][n]`,
  }, { body: [
    set('m', len('s1')), set('n', len('s2')),
    If(o(o('m', '+', 'n'), '!=', len('s3')), Ret(false)),
    set('dp', grid(o('m', '+', 1), o('n', '+', 1), false)),
    setCell('dp', 0, 0, true),
    For('i', 0, o('m', '+', 1), 1, For('j', 0, o('n', '+', 1), 1, [
      If(o(o(o('i', '>', 0), 'and', cell('dp', o('i', '-', 1), 'j')), 'and', o(at('s1', o('i', '-', 1)), '==', at('s3', o(o('i', '+', 'j'), '-', 1)))), setCell('dp', 'i', 'j', true)),
      If(o(o(o('j', '>', 0), 'and', cell('dp', 'i', o('j', '-', 1))), 'and', o(at('s2', o('j', '-', 1)), '==', at('s3', o(o('i', '+', 'j'), '-', 1)))), setCell('dp', 'i', 'j', true)),
    ])),
    Ret(cell('dp', 'm', 'n')),
  ] });

  add({
    id: 'edit-distance', no: 72, title: 'Edit Distance', zh: '編輯距離', difficulty: 'Medium', lists: ['T150'], pattern: 'dp',
    fn: 'minDistance', params: ['word1', 'word2'], sig: 'int; string, string',
    desc: `<p>把 word1 變成 word2 最少要幾次操作？可以插入、刪除或替換一個字元。</p>`,
    tests: [
      { args: ['horse', 'ros'], expected: 3 },
      { args: ['intention', 'execution'], expected: 5 },
      { args: ['', 'a'], expected: 1 },
      { args: ['abc', 'abc'], expected: 0 },
    ],
    time: 'O(m·n)', space: 'O(m·n)',
    hints: ['dp[i][j] = word1 前 i 個變成 word2 前 j 個的最少操作數。', '邊界：dp[i][0] = i（全刪）、dp[0][j] = j（全插入）。', '字元相同：dp[i−1][j−1]；不同：1 + min(替換 dp[i−1][j−1], 刪除 dp[i−1][j], 插入 dp[i][j−1])。'],
    insight: '每種操作對應表格中一個方向的移動，取最小。',
    solution: `dp = (m+1) × (n+1); dp[i][0] = i; dp[0][j] = j
對 i, j:
    如果 word1[i-1] == word2[j-1]: dp[i][j] = dp[i-1][j-1]
    否則: dp[i][j] = 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])
回傳 dp[m][n]`,
  }, { body: [
    set('m', len('word1')), set('n', len('word2')),
    set('dp', grid(o('m', '+', 1), o('n', '+', 1), 0)),
    For('i', 0, o('m', '+', 1), 1, setCell('dp', 'i', 0, 'i')),
    For('j', 0, o('n', '+', 1), 1, setCell('dp', 0, 'j', 'j')),
    For('i', 1, o('m', '+', 1), 1, For('j', 1, o('n', '+', 1), 1,
      If(o(at('word1', o('i', '-', 1)), '==', at('word2', o('j', '-', 1))),
        setCell('dp', 'i', 'j', cell('dp', o('i', '-', 1), o('j', '-', 1))),
        setCell('dp', 'i', 'j', o(1, '+', min(min(cell('dp', o('i', '-', 1), o('j', '-', 1)), cell('dp', o('i', '-', 1), 'j')), cell('dp', 'i', o('j', '-', 1)))))))),
    Ret(cell('dp', 'm', 'n')),
  ] });

  add({
    id: 'best-time-stock-iii', no: 123, title: 'Best Time to Buy and Sell Stock III', zh: '買賣股票的最佳時機 III', difficulty: 'Hard', lists: ['T150'], pattern: 'dp',
    fn: 'maxProfit', params: ['prices'], sig: 'int; int[]',
    desc: `<p>最多完成<b>兩筆</b>交易（買賣各一次算一筆，手上最多一股），回傳最大利潤。</p>`,
    tests: [
      { args: [[3, 3, 5, 0, 0, 3, 1, 4]], expected: 6 },
      { args: [[1, 2, 3, 4, 5]], expected: 4 },
      { args: [[7, 6, 4, 3, 1]], expected: 0 },
      { args: [[1]], expected: 0 },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['用四個狀態：b1 第一次買入後、s1 第一次賣出後、b2 第二次買入後、s2 第二次賣出後的最大餘額。', '每天依序更新：b1 = max(b1, −p)、s1 = max(s1, b1 + p)、b2 = max(b2, s1 − p)、s2 = max(s2, b2 + p)。'],
    insight: '狀態機 DP：把「目前處在哪個階段」當成狀態。',
    solution: `b1 = b2 = -prices[0], s1 = s2 = 0
對每個 p:
    b1 = max(b1, -p); s1 = max(s1, b1 + p)
    b2 = max(b2, s1 - p); s2 = max(s2, b2 + p)
回傳 s2`,
  }, { body: [
    set('b1', neg(at('prices', 0))), set('s1', 0), set('b2', neg(at('prices', 0))), set('s2', 0),
    Each('p', 'prices', [
      set('b1', max('b1', neg('p'))),
      set('s1', max('s1', o('b1', '+', 'p'))),
      set('b2', max('b2', o('s1', '-', 'p'))),
      set('s2', max('s2', o('b2', '+', 'p'))),
    ]),
    Ret('s2'),
  ] });

  add({
    id: 'best-time-stock-iv', no: 188, title: 'Best Time to Buy and Sell Stock IV', zh: '買賣股票的最佳時機 IV', difficulty: 'Hard', lists: ['T150'], pattern: 'dp',
    fn: 'maxProfit', params: ['k', 'prices'], sig: 'int; int, int[]',
    desc: `<p>最多完成 <b>k 筆</b>交易，回傳最大利潤。</p>`,
    tests: [
      { args: [2, [2, 4, 1]], expected: 2 },
      { args: [2, [3, 2, 6, 5, 0, 3]], expected: 7 },
      { args: [1, [1, 2]], expected: 1 },
      { args: [3, [1, 2, 4, 2, 5, 7, 2, 4, 9, 0]], expected: 15 },
    ],
    time: 'O(n·k)', space: 'O(k)',
    hints: ['把 III 的四個狀態推廣成陣列：buy[j]、sell[j] 表示第 j 筆交易買入後 / 賣出後的最大餘額。', 'buy[j] = max(buy[j], sell[j−1] − p)；sell[j] = max(sell[j], buy[j] + p)。'],
    insight: '同一個狀態機，狀態數從 4 變成 2k。',
    solution: `buy = 長度 k+1，全部 -∞; sell = 長度 k+1，全部 0
對每個 p:
    對 j 從 1 到 k:
        buy[j] = max(buy[j], sell[j-1] - p)
        sell[j] = max(sell[j], buy[j] + p)
回傳 sell[k]`,
  }, { body: [
    set('buy', fill(o('k', '+', 1), neg(at('prices', 0)))),
    set('sell', fill(o('k', '+', 1), 0)),
    Each('p', 'prices', For('j', 1, o('k', '+', 1), 1, [
      setAt('buy', 'j', max(at('buy', 'j'), o(at('sell', o('j', '-', 1)), '-', 'p'))),
      setAt('sell', 'j', max(at('sell', 'j'), o(at('buy', 'j'), '+', 'p'))),
    ])),
    Ret(at('sell', 'k')),
  ] });

  add({
    id: 'maximal-square', no: 221, title: 'Maximal Square', zh: '最大正方形', difficulty: 'Medium', lists: ['T150'], pattern: 'dp',
    fn: 'maximalSquare', params: ['matrix'], sig: 'int; char[][]',
    desc: `<p>在 "0" / "1" 組成的矩陣中，找出只包含 "1" 的最大正方形，回傳它的<b>面積</b>。</p>`,
    tests: [
      { args: [[['1', '0', '1', '0', '0'], ['1', '0', '1', '1', '1'], ['1', '1', '1', '1', '1'], ['1', '0', '0', '1', '0']]], expected: 4 },
      { args: [[['0', '1'], ['1', '0']]], expected: 1 },
      { args: [[['0']]], expected: 0 },
      { args: [[['1', '1'], ['1', '1']]], expected: 4 },
    ],
    time: 'O(m·n)', space: 'O(m·n)',
    hints: ['dp[i][j] = 以 (i−1, j−1) 為右下角的最大正方形邊長。', '如果那格是 "1"：dp[i][j] = min(上, 左, 左上) + 1。', '記錄最大邊長，最後回傳邊長平方。'],
    insight: '正方形能多大，受限於三個方向中最小的那個。',
    solution: `dp = (m+1) × (n+1) 的 0, best = 0
對 i 從 1 到 m, j 從 1 到 n:
    如果 matrix[i-1][j-1] == "1":
        dp[i][j] = min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1
        best = max(best, dp[i][j])
回傳 best * best`,
  }, { body: [
    set('m', len('matrix')), set('n', len(at('matrix', 0))),
    set('dp', grid(o('m', '+', 1), o('n', '+', 1), 0)),
    set('best', 0),
    For('i', 1, o('m', '+', 1), 1, For('j', 1, o('n', '+', 1), 1, If(o(cell('matrix', o('i', '-', 1), o('j', '-', 1)), '==', str('1')), [
      setCell('dp', 'i', 'j', o(min(min(cell('dp', o('i', '-', 1), 'j'), cell('dp', 'i', o('j', '-', 1))), cell('dp', o('i', '-', 1), o('j', '-', 1))), '+', 1)),
      set('best', max('best', cell('dp', 'i', 'j'))),
    ]))),
    Ret(o('best', '*', 'best')),
  ] });
})();
