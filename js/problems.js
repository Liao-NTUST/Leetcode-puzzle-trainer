// 題庫。lists: B75 = Blind 75、T150 = Top Interview 150
// types: 參數型別轉換（list = 鏈結串列、tree = 二元樹，測資用陣列表示）
// output: 回傳值的轉換方式；compare: exact | unordered | unorderedDeep
// resultFrom: 'arg0' 表示原地修改第一個參數（LeetCode 的 void 題）

window.PATTERNS = {
  hash: '雜湊表 Hash Map / Set',
  twoPointers: '雙指標 Two Pointers',
  slidingWindow: '滑動視窗 Sliding Window',
  stack: '堆疊 Stack',
  binarySearch: '二分搜尋 Binary Search',
  linkedList: '鏈結串列 Linked List',
  treeDfs: '樹的遞迴 / DFS',
  graph: '圖 / 網格 DFS・BFS',
  dp: '動態規劃 DP',
  greedy: '貪婪 Greedy',
  prefix: '前綴 / 後綴 Prefix・Suffix',
  bit: '位元運算 Bit Manipulation',
  math: '數學 Math',
  string: '字串處理 String',
  intervals: '區間 Intervals',
  matrix: '矩陣 Matrix',
  treeBfs: '樹的層序走訪 BFS',
  bst: '二元搜尋樹 BST',
  backtracking: '回溯 Backtracking',
  heap: '堆積 Heap',
  trie: '字典樹 Trie',
  design: '資料結構設計 Design',
  divide: '分治 Divide & Conquer',
};

window.COMPLEXITIES = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)', 'O(m·n)', 'O(n·k)'];

window.PROBLEMS = [
  // ===================== 陣列 / 雜湊 =====================
  {
    id: 'two-sum', no: 1, title: 'Two Sum', zh: '兩數之和', difficulty: 'Easy', lists: ['B75', 'T150'], pattern: 'hash',
    fn: 'twoSum', params: ['nums', 'target'], compare: 'unordered',
    desc: `<p>給你一個整數陣列 <code>nums</code> 和一個整數 <code>target</code>，請找出陣列中<b>相加等於 target 的兩個數字</b>，回傳它們的<b>索引</b>（順序不限）。</p>
<p>每組輸入保證剛好只有一組答案，同一個元素不能用兩次。</p>`,
    tests: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { args: [[3, 2, 4], 6], expected: [1, 2] },
      { args: [[3, 3], 6], expected: [0, 1] },
      { args: [[1, 5, 3, 8, 2], 10], expected: [3, 4] },
      { args: [[-1, -2, -3, -4, -5], -8], expected: [2, 4] },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: [
      '暴力法是兩層迴圈試所有組合 O(n²)。能不能只走一遍？',
      '走到 nums[i] 時，你真正想問的是：「target − nums[i] 之前出現過嗎？出現在哪？」',
      '用字典記錄「數值 → 索引」，邊走邊查、邊走邊記。',
    ],
    insight: '「找配對」→ 把「要找的東西」當成鍵，用 Hash Map 把 O(n) 的查找降成 O(1)。',
    solution: `seen = 新的空字典
對 i 從 0 到 nums 長度:
    need = target - nums[i]
    如果 seen 有 need:
        回傳 [seen[need], i]
    seen[nums[i]] = i`,
  },
  {
    id: 'contains-duplicate', no: 217, title: 'Contains Duplicate', zh: '存在重複元素', difficulty: 'Easy', lists: ['B75'], pattern: 'hash',
    fn: 'containsDuplicate', params: ['nums'],
    desc: `<p>如果陣列 <code>nums</code> 中有任何數字出現<b>至少兩次</b>，回傳 <code>true</code>；所有數字都不同則回傳 <code>false</code>。</p>`,
    tests: [
      { args: [[1, 2, 3, 1]], expected: true },
      { args: [[1, 2, 3, 4]], expected: false },
      { args: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expected: true },
      { args: [[5]], expected: false },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['「有沒有看過」這類問題，想想哪種資料結構查詢最快？', '用集合記住看過的數字，遇到已經在集合裡的就可以提早結束。'],
    insight: '「看過沒有」= Hash Set。',
    solution: `seen = 新的空集合
對 nums 中每個 x:
    如果 seen 裡有 x: 回傳 true
    把 x 放進 seen
回傳 false`,
  },
  {
    id: 'valid-anagram', no: 242, title: 'Valid Anagram', zh: '有效的字母異位詞', difficulty: 'Easy', lists: ['B75', 'T150'], pattern: 'hash',
    fn: 'isAnagram', params: ['s', 't'],
    desc: `<p>給你兩個字串 <code>s</code> 和 <code>t</code>，判斷 <code>t</code> 是不是 <code>s</code> 的<b>字母異位詞</b>（用到的字母和次數完全相同，只是順序不同）。</p>`,
    tests: [
      { args: ['anagram', 'nagaram'], expected: true },
      { args: ['rat', 'car'], expected: false },
      { args: ['a', 'ab'], expected: false },
      { args: ['aacc', 'ccac'], expected: false },
      { args: ['listen', 'silent'], expected: true },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['長度不同可以直接回傳 false。', '用字典數每個字母出現幾次：s 的字母 +1、t 的字母 −1。', '最後所有計數都要是 0。'],
    insight: '「組成相同」→ 比較字元計數（頻率表），不需要真的排列。',
    solution: `如果 s 長度 ≠ t 長度: 回傳 false
count = 新的空字典
對 i 從 0 到 s 長度:
    count[s[i]] = (count[s[i]] 沒有就 0) + 1
    count[t[i]] = (count[t[i]] 沒有就 0) - 1
對 count 的每個值 c:
    如果 c ≠ 0: 回傳 false
回傳 true`,
  },
  {
    id: 'ransom-note', no: 383, title: 'Ransom Note', zh: '贖金信', difficulty: 'Easy', lists: ['T150'], pattern: 'hash',
    fn: 'canConstruct', params: ['ransomNote', 'magazine'],
    desc: `<p>判斷能不能用 <code>magazine</code> 裡的字母拼出 <code>ransomNote</code>。<code>magazine</code> 中的每個字母<b>只能用一次</b>。</p>`,
    tests: [
      { args: ['a', 'b'], expected: false },
      { args: ['aa', 'ab'], expected: false },
      { args: ['aa', 'aab'], expected: true },
      { args: ['abc', 'cbaxyz'], expected: true },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['先數 magazine 每個字母有幾個（庫存）。', '再走過 ransomNote，每用一個字母就扣庫存；庫存不夠就失敗。'],
    insight: '頻率表 = 庫存清單。先建庫存，再消耗。',
    solution: `stock = 新的空字典
對 magazine 中每個 c: stock[c] = (沒有就 0) + 1
對 ransomNote 中每個 c:
    如果 (stock[c] 沒有就 0) == 0: 回傳 false
    stock[c] = stock[c] - 1
回傳 true`,
  },
  {
    id: 'majority-element', no: 169, title: 'Majority Element', zh: '多數元素', difficulty: 'Easy', lists: ['T150'], pattern: 'hash',
    fn: 'majorityElement', params: ['nums'],
    desc: `<p>回傳陣列中出現次數<b>超過 ⌊n/2⌋</b> 的元素。保證這個元素一定存在。</p><p class="muted">進階：能做到 O(1) 額外空間嗎？（Boyer–Moore 投票法）</p>`,
    tests: [
      { args: [[3, 2, 3]], expected: 3 },
      { args: [[2, 2, 1, 1, 1, 2, 2]], expected: 2 },
      { args: [[1]], expected: 1 },
      { args: [[6, 5, 5]], expected: 5 },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['直覺做法：用字典計數，計數超過 n/2 就回傳。', '投票法：維護「候選人」和「票數」。票數為 0 時換候選人；相同 +1，不同 −1。'],
    insight: '多數元素的票數一定比其他所有人加起來多，所以互相抵銷後剩下的就是它。',
    solution: `candidate = 0, votes = 0
對 nums 中每個 x:
    如果 votes == 0: candidate = x
    如果 x == candidate: votes += 1
    否則: votes -= 1
回傳 candidate`,
  },
  {
    id: 'longest-consecutive', no: 128, title: 'Longest Consecutive Sequence', zh: '最長連續序列', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'hash',
    fn: 'longestConsecutive', params: ['nums'],
    desc: `<p>給一個未排序的整數陣列，找出<b>數字連續</b>的最長序列長度（元素在原陣列中不必相鄰）。要求 O(n) 時間。</p>`,
    tests: [
      { args: [[100, 4, 200, 1, 3, 2]], expected: 4 },
      { args: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], expected: 9 },
      { args: [[]], expected: 0 },
      { args: [[1, 2, 0, 1]], expected: 3 },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['排序可以做，但那是 O(n log n)。', '把所有數字放進集合。', '只有當 x−1 不在集合裡時，x 才是一段序列的「起點」，從起點往上數。'],
    insight: '用集合 O(1) 查詢，並且只從「起點」開始數，每個數字最多被數一次 → O(n)。',
    solution: `s = 用 nums 建立集合
best = 0
對 nums 中每個 x:
    如果 s 裡沒有 x-1:
        len = 1
        當 s 裡有 x+len: len += 1
        best = max(best, len)
回傳 best`,
  },
  {
    id: 'group-anagrams', no: 49, title: 'Group Anagrams', zh: '字母異位詞分組', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'hash',
    fn: 'groupAnagrams', params: ['strs'], compare: 'unorderedDeep',
    desc: `<p>把字串陣列 <code>strs</code> 中互為字母異位詞的字串分在同一組，回傳所有分組（組的順序、組內順序都不限）。</p>`,
    tests: [
      { args: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], expected: [['bat'], ['nat', 'tan'], ['ate', 'eat', 'tea']] },
      { args: [['']], expected: [['']] },
      { args: [['a']], expected: [['a']] },
      { args: [['abc', 'bca', 'xyz', 'cab', 'zyx']], expected: [['abc', 'bca', 'cab'], ['xyz', 'zyx']] },
    ],
    time: 'O(n·k)', space: 'O(n·k)',
    hints: ['異位詞有什麼「共同的身分證」？', '把字串的字元排序後，異位詞會變成一模一樣的字串，可以當字典的鍵。', '字典：鍵 = 排序後字串，值 = 這組的清單。'],
    insight: '設計一個「正規化的鍵」，把同類的東西映射到同一格 → 分組問題的萬用招。',
    solution: `groups = 新的空字典
對 strs 中每個 w:
    key = w 的字元排序
    如果 groups 沒有 key: groups[key] = 空清單
    把 w 加到 groups[key] 尾端
回傳 groups 的所有值`,
  },
  {
    id: 'top-k-frequent', no: 347, title: 'Top K Frequent Elements', zh: '前 K 個高頻元素', difficulty: 'Medium', lists: ['B75'], pattern: 'hash',
    fn: 'topKFrequent', params: ['nums', 'k'], compare: 'unordered',
    desc: `<p>回傳 <code>nums</code> 中出現頻率<b>前 k 高</b>的元素（順序不限）。保證答案唯一。</p>`,
    tests: [
      { args: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2] },
      { args: [[1], 1], expected: [1] },
      { args: [[4, 1, -1, 2, -1, 2, 3], 2], expected: [-1, 2] },
      { args: [[5, 5, 6, 6, 6, 7], 1], expected: [6] },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['先用字典數頻率。', '頻率最多就是 n。做一個長度 n+1 的「桶子」清單：bucket[次數] = 這些數字。', '從最大的桶子往回收集，收滿 k 個就停。'],
    insight: '值域有限（次數 ≤ n）時，用 Bucket Sort 取代排序，從 O(n log n) 變 O(n)。',
    solution: `count = 字典計數
bucket = 長度 n+1 的清單，每格放 空清單
對 count 的每個鍵 x: 把 x 加到 bucket[count[x]]
res = 空清單
讓 f 從 n 走到 0 (每步 -1):
    對 bucket[f] 每個 x:
        把 x 加到 res; 如果 res 長度 == k: 回傳 res`,
  },
  {
    id: 'product-except-self', no: 238, title: 'Product of Array Except Self', zh: '除自身以外陣列的乘積', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'prefix',
    fn: 'productExceptSelf', params: ['nums'],
    desc: `<p>回傳陣列 <code>answer</code>，其中 <code>answer[i]</code> 等於 <code>nums</code> 中<b>除了 nums[i] 以外</b>所有元素的乘積。</p><p><b>不能使用除法</b>，且要 O(n) 時間。</p>`,
    tests: [
      { args: [[1, 2, 3, 4]], expected: [24, 12, 8, 6] },
      { args: [[-1, 1, 0, -3, 3]], expected: [0, 0, 9, 0, 0] },
      { args: [[2, 3]], expected: [3, 2] },
      { args: [[5, 1, 2]], expected: [2, 10, 5] },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['answer[i] = (i 左邊所有數的乘積) × (i 右邊所有數的乘積)。', '先從左往右走一次，記錄「左邊乘積」。', '再從右往左走一次，用一個變數累積「右邊乘積」乘上去。'],
    insight: '「除了自己以外」→ 拆成前綴 × 後綴，兩趟掃描。',
    solution: `n = nums 長度
ans = 長度 n 的清單，每格放 1
left = 1
對 i 從 0 到 n: ans[i] = left; left = left * nums[i]
right = 1
讓 i 從 n-1 走到 -1 (每步 -1): ans[i] = ans[i] * right; right = right * nums[i]
回傳 ans`,
  },

  // ===================== 雙指標 =====================
  {
    id: 'valid-palindrome', no: 125, title: 'Valid Palindrome', zh: '驗證回文串', difficulty: 'Easy', lists: ['B75', 'T150'], pattern: 'twoPointers',
    fn: 'isPalindrome', params: ['s'],
    desc: `<p>把字串中所有大寫轉小寫、移除所有<b>非英數字元</b>後，如果正讀反讀都一樣就是回文。判斷 <code>s</code> 是不是回文。</p>`,
    tests: [
      { args: ['A man, a plan, a canal: Panama'], expected: true },
      { args: ['race a car'], expected: false },
      { args: [' '], expected: true },
      { args: ['0P'], expected: false },
      { args: ['ab_a'], expected: true },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['左指標從頭、右指標從尾，往中間走。', '遇到非英數字元就跳過。', '比較時記得都轉成小寫。'],
    insight: '對稱性的問題 → 兩端往中間夾的雙指標。',
    solution: `l = 0, r = s 長度 - 1
當 l < r:
    如果 s[l] 不是英數: l += 1; 繼續
    如果 s[r] 不是英數: r -= 1; 繼續
    如果 s[l] 小寫 ≠ s[r] 小寫: 回傳 false
    l += 1; r -= 1
回傳 true`,
  },
  {
    id: 'is-subsequence', no: 392, title: 'Is Subsequence', zh: '判斷子序列', difficulty: 'Easy', lists: ['T150'], pattern: 'twoPointers',
    fn: 'isSubsequence', params: ['s', 't'],
    desc: `<p>判斷 <code>s</code> 是不是 <code>t</code> 的<b>子序列</b>：從 t 刪掉一些字元（也可以不刪）、不改變順序，能不能得到 s。</p>`,
    tests: [
      { args: ['abc', 'ahbgdc'], expected: true },
      { args: ['axc', 'ahbgdc'], expected: false },
      { args: ['', 'ahbgdc'], expected: true },
      { args: ['b', 'c'], expected: false },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['用 i 指向 s、j 指向 t。', 'j 每次都往前走；只有 s[i] == t[j] 時 i 才往前。', '最後看 i 有沒有走完 s。'],
    insight: '兩個序列的「配對進度」→ 兩個指標各自前進。',
    solution: `i = 0
對 j 從 0 到 t 長度:
    如果 i < s 長度 且 s[i] == t[j]: i += 1
回傳 i == s 長度`,
  },
  {
    id: 'two-sum-ii', no: 167, title: 'Two Sum II - Input Array Is Sorted', zh: '兩數之和 II（已排序）', difficulty: 'Medium', lists: ['T150'], pattern: 'twoPointers',
    fn: 'twoSum', params: ['numbers', 'target'],
    desc: `<p><code>numbers</code> 已經<b>由小到大排序</b>。找出兩個數相加等於 <code>target</code>，回傳它們的位置 <b>[index1, index2]</b>（從 <b>1</b> 開始數，index1 &lt; index2）。只能用 O(1) 額外空間。</p>`,
    tests: [
      { args: [[2, 7, 11, 15], 9], expected: [1, 2] },
      { args: [[2, 3, 4], 6], expected: [1, 3] },
      { args: [[-1, 0], -1], expected: [1, 2] },
      { args: [[1, 2, 3, 4, 4, 9, 56, 90], 8], expected: [4, 5] },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['已排序是很強的提示！', '左指標指最小、右指標指最大。總和太大 → 右邊往左；太小 → 左邊往右。'],
    insight: '排序後的配對問題 → 左右夾擊，每一步都能排除一整排不可能的組合。',
    solution: `l = 0, r = 長度 - 1
當 l < r:
    sum = numbers[l] + numbers[r]
    如果 sum == target: 回傳 [l+1, r+1]
    如果 sum < target: l += 1
    否則: r -= 1`,
  },
  {
    id: 'container-most-water', no: 11, title: 'Container With Most Water', zh: '盛最多水的容器', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'twoPointers',
    fn: 'maxArea', params: ['height'],
    desc: `<p><code>height[i]</code> 是第 i 條垂直線的高度。選兩條線和 x 軸組成容器，回傳容器<b>最多能裝多少水</b>。</p><p>水量 = (右 − 左) × min(左高, 右高)</p>`,
    tests: [
      { args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
      { args: [[1, 1]], expected: 1 },
      { args: [[4, 3, 2, 1, 4]], expected: 16 },
      { args: [[1, 2, 1]], expected: 2 },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['從最寬的情況開始：l = 0、r = 最後。', '要移動哪一邊？水量被「比較矮」的那條限制。', '移動較高的那條只會讓寬度變小、高度不會變高 → 永遠移動較矮的那邊。'],
    insight: '雙指標的正確性來自「排除論證」：較矮那條線和任何更內側的線組合都不會更好。',
    solution: `l = 0, r = 長度 - 1, best = 0
當 l < r:
    best = max(best, (r - l) * min(height[l], height[r]))
    如果 height[l] < height[r]: l += 1
    否則: r -= 1
回傳 best`,
  },
  {
    id: 'three-sum', no: 15, title: '3Sum', zh: '三數之和', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'twoPointers',
    fn: 'threeSum', params: ['nums'], compare: 'unorderedDeep',
    desc: `<p>找出所有<b>不重複</b>的三元組 <code>[a, b, c]</code>，使 a + b + c = 0。回傳順序不限。</p>`,
    tests: [
      { args: [[-1, 0, 1, 2, -1, -4]], expected: [[-1, -1, 2], [-1, 0, 1]] },
      { args: [[0, 1, 1]], expected: [] },
      { args: [[0, 0, 0]], expected: [[0, 0, 0]] },
      { args: [[-2, 0, 0, 2, 2]], expected: [[-2, 0, 2]] },
    ],
    time: 'O(n²)', space: 'O(1)',
    hints: ['先排序。', '固定第一個數 nums[i]，剩下就變成「已排序陣列的 Two Sum」→ 左右雙指標。', '去重：nums[i] 和前一個一樣就跳過；找到答案後，l、r 也要跳過相同的值。'],
    insight: 'k-Sum = 排序 + 固定一個 + (k−1)-Sum。去重靠「排序後跳過相同值」。',
    solution: `排序 nums; res = 空清單
對 i 從 0 到 n:
    如果 i > 0 且 nums[i] == nums[i-1]: 繼續
    l = i+1, r = n-1
    當 l < r:
        sum = nums[i] + nums[l] + nums[r]
        如果 sum < 0: l += 1
        否則如果 sum > 0: r -= 1
        否則:
            加入 [nums[i], nums[l], nums[r]]
            l += 1
            當 l < r 且 nums[l] == nums[l-1]: l += 1
回傳 res`,
  },
  {
    id: 'merge-sorted-array', no: 88, title: 'Merge Sorted Array', zh: '合併兩個有序陣列', difficulty: 'Easy', lists: ['T150'], pattern: 'twoPointers',
    fn: 'merge', params: ['nums1', 'm', 'nums2', 'n'], resultFrom: 'arg0',
    desc: `<p><code>nums1</code> 長度 m+n，前 m 個是有效數字、後 n 個是 0（空位）。<code>nums2</code> 有 n 個數字。兩者都已排序。</p><p>請把 nums2 <b>原地</b>合併進 nums1，使 nums1 保持排序（不用回傳，系統會直接檢查 nums1）。</p>`,
    tests: [
      { args: [[1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3], expected: [1, 2, 2, 3, 5, 6] },
      { args: [[1], 1, [], 0], expected: [1] },
      { args: [[0], 0, [1], 1], expected: [1] },
      { args: [[4, 5, 6, 0, 0, 0], 3, [1, 2, 3], 3], expected: [1, 2, 3, 4, 5, 6] },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['從前面開始放會覆蓋到還沒處理的數字。', '空位在後面 → 從「後面」開始放最大的！', '三個指標：i = m−1、j = n−1、k = m+n−1。'],
    insight: '原地合併時從尾端寫入，就不會覆蓋尚未讀取的資料。',
    solution: `i = m-1, j = n-1, k = m+n-1
當 j >= 0:
    如果 i >= 0 且 nums1[i] > nums2[j]:
        nums1[k] = nums1[i]; i -= 1
    否則:
        nums1[k] = nums2[j]; j -= 1
    k -= 1`,
  },

  // ===================== 滑動視窗 / 貪婪 =====================
  {
    id: 'best-time-stock', no: 121, title: 'Best Time to Buy and Sell Stock', zh: '買賣股票的最佳時機', difficulty: 'Easy', lists: ['B75', 'T150'], pattern: 'greedy',
    fn: 'maxProfit', params: ['prices'],
    desc: `<p><code>prices[i]</code> 是第 i 天的股價。選<b>一天買入</b>、<b>之後某天賣出</b>，回傳最大利潤；無法獲利則回傳 0。</p>`,
    tests: [
      { args: [[7, 1, 5, 3, 6, 4]], expected: 5 },
      { args: [[7, 6, 4, 3, 1]], expected: 0 },
      { args: [[2, 4, 1]], expected: 2 },
      { args: [[1]], expected: 0 },
      { args: [[3, 2, 6, 5, 0, 3]], expected: 4 },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['如果今天賣出，最好的買入點是哪一天？', '「到今天為止的最低價」。邊走邊記錄最低價，順便算今天賣的利潤。'],
    insight: '把「選兩個點」變成「走一遍，維護到目前為止的最佳狀態」。',
    solution: `minPrice = ∞, best = 0
對 prices 中每個 p:
    minPrice = min(minPrice, p)
    best = max(best, p - minPrice)
回傳 best`,
  },
  {
    id: 'jump-game', no: 55, title: 'Jump Game', zh: '跳躍遊戲', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'greedy',
    fn: 'canJump', params: ['nums'],
    desc: `<p>你站在索引 0，<code>nums[i]</code> 代表在位置 i 最多能往前跳幾格。判斷能不能到達<b>最後一格</b>。</p>`,
    tests: [
      { args: [[2, 3, 1, 1, 4]], expected: true },
      { args: [[3, 2, 1, 0, 4]], expected: false },
      { args: [[0]], expected: true },
      { args: [[2, 0, 0]], expected: true },
      { args: [[1, 0, 1, 0]], expected: false },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['不用真的去試每一種跳法。', '維護「目前最遠可以到哪裡」reach。', '走到位置 i 時如果 i > reach，代表到不了這裡 → false。'],
    insight: '只關心「可達範圍的邊界」，而不是每條路徑 → 貪婪。',
    solution: `reach = 0
對 i 從 0 到 nums 長度:
    如果 i > reach: 回傳 false
    reach = max(reach, i + nums[i])
回傳 true`,
  },
  {
    id: 'longest-substring', no: 3, title: 'Longest Substring Without Repeating Characters', zh: '無重複字元的最長子字串', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'slidingWindow',
    fn: 'lengthOfLongestSubstring', params: ['s'],
    desc: `<p>找出字串 <code>s</code> 中<b>不含重複字元</b>的最長<b>連續</b>子字串長度。</p>`,
    tests: [
      { args: ['abcabcbb'], expected: 3 },
      { args: ['bbbbb'], expected: 1 },
      { args: ['pwwkew'], expected: 3 },
      { args: [''], expected: 0 },
      { args: ['abba'], expected: 2 },
      { args: [' '], expected: 1 },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['「連續子字串 + 最長/最短」→ 滑動視窗。', '右邊界一直往右擴張；如果新字元已經在視窗裡，就把左邊界往右縮。', '可以用字典記錄每個字元最後出現的位置，讓左邊界直接跳過去（注意左邊界不能往回走）。'],
    insight: '視窗維持「合法」狀態：右邊擴張、違規時左邊收縮，每個字元進出各一次 → O(n)。',
    solution: `last = 新的空字典, left = 0, best = 0
對 r 從 0 到 s 長度:
    c = s[r]
    如果 last 有 c 且 last[c] >= left:
        left = last[c] + 1
    last[c] = r
    best = max(best, r - left + 1)
回傳 best`,
  },

  // ===================== 堆疊 =====================
  {
    id: 'valid-parentheses', no: 20, title: 'Valid Parentheses', zh: '有效的括號', difficulty: 'Easy', lists: ['B75', 'T150'], pattern: 'stack',
    fn: 'isValid', params: ['s'],
    desc: `<p>字串 <code>s</code> 只包含 <code>( ) [ ] { }</code>。判斷括號是否有效：每個左括號都要被<b>同類型</b>的右括號以<b>正確順序</b>關閉。</p>`,
    tests: [
      { args: ['()'], expected: true },
      { args: ['()[]{}'], expected: true },
      { args: ['(]'], expected: false },
      { args: ['([)]'], expected: false },
      { args: ['{[]}'], expected: true },
      { args: ['('], expected: false },
      { args: [']'], expected: false },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['最後打開的括號要最先被關閉 → 後進先出。', '遇到左括號就放進堆疊；遇到右括號就檢查堆疊頂端是不是對應的左括號。', '別忘了：右括號出現時堆疊可能是空的；最後堆疊也必須是空的。'],
    insight: '「最近的、還沒配對的」→ 堆疊 (LIFO)。',
    solution: `pair = 字典 { ')':'(', ']':'[', '}':'{' }
stack = 空清單
對 s 中每個 c:
    如果 pair 沒有 c: 把 c 放進 stack
    否則:
        如果 stack 是空的 或 stack 最後一個 ≠ pair[c]: 回傳 false
        移除 stack 最後一個
回傳 stack 是空的`,
  },
  {
    id: 'eval-rpn', no: 150, title: 'Evaluate Reverse Polish Notation', zh: '逆波蘭表示法求值', difficulty: 'Medium', lists: ['T150'], pattern: 'stack',
    fn: 'evalRPN', params: ['tokens'],
    desc: `<p>計算逆波蘭表示法（後序式）的值。運算子有 <code>+ - * /</code>，除法<b>向 0 取整</b>。</p><p>例如 <code>["2","1","+","3","*"]</code> = (2 + 1) × 3 = 9。</p>`,
    tests: [
      { args: [['2', '1', '+', '3', '*']], expected: 9 },
      { args: [['4', '13', '5', '/', '+']], expected: 6 },
      { args: [['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+']], expected: 22 },
      { args: [['3', '-4', '/']], expected: 0 },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['遇到數字 → 放進堆疊（記得轉成數字）。', '遇到運算子 → 從堆疊取出兩個數字運算，再放回去。', '注意順序：先取出的是「右邊」的運算元。'],
    insight: '後序式天生就是為堆疊設計的：運算子作用在「最近的兩個值」。',
    solution: `stack = 空清單
對 tokens 中每個 t:
    如果 t 是 + - * / 其中之一:
        b = 取出最後一個; a = 取出最後一個
        依運算子計算 a ? b，把結果放回 stack
    否則: 把 t 轉成數字放進 stack
回傳 stack 最後一個`,
  },

  // ===================== 二分搜尋 =====================
  {
    id: 'find-min-rotated', no: 153, title: 'Find Minimum in Rotated Sorted Array', zh: '旋轉排序陣列中的最小值', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'binarySearch',
    fn: 'findMin', params: ['nums'],
    desc: `<p>一個元素不重複的遞增陣列被<b>旋轉</b>過（例如 [0,1,2,4,5,6,7] → [4,5,6,7,0,1,2]）。在 O(log n) 時間內找出最小值。</p>`,
    tests: [
      { args: [[3, 4, 5, 1, 2]], expected: 1 },
      { args: [[4, 5, 6, 7, 0, 1, 2]], expected: 0 },
      { args: [[11, 13, 15, 17]], expected: 11 },
      { args: [[2, 1]], expected: 1 },
      { args: [[1]], expected: 1 },
    ],
    time: 'O(log n)', space: 'O(1)',
    hints: ['O(log n) 幾乎就是在暗示二分搜尋。', '比較 nums[mid] 和 nums[r]：如果 nums[mid] > nums[r]，最小值一定在 mid 的右邊。', '否則最小值在 mid 或它的左邊（r = mid）。'],
    insight: '二分搜尋不一定要「找目標值」，只要每次能判斷答案在哪一半就行。',
    solution: `l = 0, r = n - 1
當 l < r:
    mid = (l + r) 整數除以 2
    如果 nums[mid] > nums[r]: l = mid + 1
    否則: r = mid
回傳 nums[l]`,
  },
  {
    id: 'search-rotated', no: 33, title: 'Search in Rotated Sorted Array', zh: '搜尋旋轉排序陣列', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'binarySearch',
    fn: 'search', params: ['nums', 'target'],
    desc: `<p>在旋轉過的遞增陣列（元素不重複）中搜尋 <code>target</code>，回傳索引，找不到回傳 -1。要求 O(log n)。</p>`,
    tests: [
      { args: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4 },
      { args: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1 },
      { args: [[1], 0], expected: -1 },
      { args: [[1, 3], 3], expected: 1 },
      { args: [[5, 1, 3], 5], expected: 0 },
    ],
    time: 'O(log n)', space: 'O(1)',
    hints: ['切一刀之後，左半或右半「至少有一邊」是完整排序的。', '如果 nums[l] <= nums[mid]，左半是排序的；判斷 target 是否落在 [nums[l], nums[mid]) 之間。', '否則右半是排序的，判斷 target 是否落在 (nums[mid], nums[r]] 之間。'],
    insight: '先判斷「哪一半是有序的」，再判斷目標在不在那一半。',
    solution: `l = 0, r = n - 1
當 l <= r:
    mid = (l + r) 整數除以 2
    如果 nums[mid] == target: 回傳 mid
    如果 nums[l] <= nums[mid]:
        如果 nums[l] <= target < nums[mid]: r = mid - 1
        否則: l = mid + 1
    否則:
        如果 nums[mid] < target <= nums[r]: l = mid + 1
        否則: r = mid - 1
回傳 -1`,
  },

  // ===================== 鏈結串列 =====================
  {
    id: 'reverse-linked-list', no: 206, title: 'Reverse Linked List', zh: '反轉鏈結串列', difficulty: 'Easy', lists: ['B75'], pattern: 'linkedList',
    fn: 'reverseList', params: ['head'], types: { head: 'list' }, output: 'list',
    desc: `<p>給你鏈結串列的頭節點 <code>head</code>，把串列<b>反轉</b>後回傳新的頭節點。</p><p class="muted">節點有 <code>val</code> 和 <code>next</code>，到尾巴時 next 是 null。測資用陣列表示串列。</p>`,
    tests: [
      { args: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
      { args: [[1, 2]], expected: [2, 1] },
      { args: [[]], expected: [] },
      { args: [[7]], expected: [7] },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['需要三個變數：prev（已反轉部分的頭）、cur（目前節點）、nxt（暫存下一個）。', '每一步：先存 nxt = cur.next，再把 cur.next 指向 prev。', '然後 prev、cur 都往前一步。最後回傳 prev。'],
    insight: '改指標前先把「會遺失的東西」存起來。',
    solution: `prev = null, cur = head
當 cur 不是 null:
    nxt = cur.next
    cur.next = prev
    prev = cur
    cur = nxt
回傳 prev`,
  },
  {
    id: 'merge-two-lists', no: 21, title: 'Merge Two Sorted Lists', zh: '合併兩個有序串列', difficulty: 'Easy', lists: ['B75', 'T150'], pattern: 'linkedList',
    fn: 'mergeTwoLists', params: ['list1', 'list2'], types: { list1: 'list', list2: 'list' }, output: 'list',
    desc: `<p>把兩個<b>已排序</b>的鏈結串列合併成一個排序的串列，回傳頭節點。</p>`,
    tests: [
      { args: [[1, 2, 4], [1, 3, 4]], expected: [1, 1, 2, 3, 4, 4] },
      { args: [[], []], expected: [] },
      { args: [[], [0]], expected: [0] },
      { args: [[5], [1, 2, 3]], expected: [1, 2, 3, 5] },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['建立一個「假頭」dummy 節點，可以省掉很多特殊情況。', '用 tail 指向結果串列的尾巴，每次把比較小的節點接上去。', '其中一條走完後，把另一條剩下的整段直接接上。'],
    insight: 'Dummy head 技巧：讓「第一個節點」不再是特例。',
    solution: `dummy = 新節點(0); tail = dummy
當 list1 和 list2 都不是 null:
    如果 list1.val <= list2.val: tail.next = list1; list1 = list1.next
    否則: tail.next = list2; list2 = list2.next
    tail = tail.next
tail.next = (list1 不是 null ? list1 : list2)
回傳 dummy.next`,
  },
  {
    id: 'linked-list-cycle', no: 141, title: 'Linked List Cycle', zh: '環狀鏈結串列', difficulty: 'Easy', lists: ['B75', 'T150'], pattern: 'linkedList',
    fn: 'hasCycle', params: ['head'], types: { head: 'list' }, prepare: 'cycle',
    desc: `<p>判斷鏈結串列中有沒有<b>環</b>（某個節點的 next 指回前面的節點）。</p><p class="muted">測資中的 pos 表示尾巴接回第幾個節點（-1 表示沒有環），pos 不會傳給你的函式。進階：O(1) 空間。</p>`,
    tests: [
      { args: [[3, 2, 0, -4]], pos: 1, expected: true },
      { args: [[1, 2]], pos: 0, expected: true },
      { args: [[1]], pos: -1, expected: false },
      { args: [[1, 2, 3, 4]], pos: -1, expected: false },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['用集合記錄走過的節點可以做，但要 O(n) 空間。', '龜兔賽跑：slow 每次走 1 步、fast 每次走 2 步。', '有環的話 fast 一定會追上 slow；沒環的話 fast 會走到 null。'],
    insight: 'Floyd 快慢指標：速度差讓兩者在環內必定相遇。',
    solution: `slow = head, fast = head
當 fast 不是 null 且 fast.next 不是 null:
    slow = slow.next
    fast = fast.next.next
    如果 slow == fast: 回傳 true
回傳 false`,
  },

  // ===================== 樹 =====================
  {
    id: 'max-depth-tree', no: 104, title: 'Maximum Depth of Binary Tree', zh: '二元樹的最大深度', difficulty: 'Easy', lists: ['B75', 'T150'], pattern: 'treeDfs',
    fn: 'maxDepth', params: ['root'], types: { root: 'tree' },
    desc: `<p>回傳二元樹的<b>最大深度</b>（根到最遠葉子經過的節點數）。</p><p class="muted">測資用層序陣列表示樹，null 代表沒有節點。節點有 val、left、right。</p>`,
    tests: [
      { args: [[3, 9, 20, null, null, 15, 7]], expected: 3 },
      { args: [[1, null, 2]], expected: 2 },
      { args: [[]], expected: 0 },
      { args: [[1, 2, 3, 4, null, null, null, 5]], expected: 4 },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['到「⚙️ 函式」建立一個有回傳值的函式 depth(node)。', '空節點的深度是 0。', '深度 = max(左子樹深度, 右子樹深度) + 1。'],
    insight: '樹的遞迴三步驟：base case（null）、問左右子樹、組合答案。',
    solution: `函式 depth(node):
    如果 node 是 null: 回傳 0
    回傳 max(depth(node.left), depth(node.right)) + 1
回傳 depth(root)`,
  },
  {
    id: 'invert-tree', no: 226, title: 'Invert Binary Tree', zh: '翻轉二元樹', difficulty: 'Easy', lists: ['B75', 'T150'], pattern: 'treeDfs',
    fn: 'invertTree', params: ['root'], types: { root: 'tree' }, output: 'tree',
    desc: `<p>把二元樹<b>左右鏡像翻轉</b>（每個節點的左右子樹互換），回傳根節點。</p>`,
    tests: [
      { args: [[4, 2, 7, 1, 3, 6, 9]], expected: [4, 7, 2, 9, 6, 3, 1] },
      { args: [[2, 1, 3]], expected: [2, 3, 1] },
      { args: [[]], expected: [] },
      { args: [[1, 2]], expected: [1, null, 2] },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['建立函式 flip(node)。', '如果 node 是 null 就結束。', '交換 node.left 和 node.right（用暫存變數），再分別對左右遞迴。'],
    insight: '對每個節點做同一件小事 → 遞迴走訪整棵樹。',
    solution: `函式 flip(node):
    如果 node 是 null: 回傳
    tmp = node.left
    node.left = node.right
    node.right = tmp
    flip(node.left); flip(node.right)
flip(root)
回傳 root`,
  },
  {
    id: 'same-tree', no: 100, title: 'Same Tree', zh: '相同的樹', difficulty: 'Easy', lists: ['B75', 'T150'], pattern: 'treeDfs',
    fn: 'isSameTree', params: ['p', 'q'], types: { p: 'tree', q: 'tree' },
    desc: `<p>判斷兩棵二元樹是否<b>結構相同且每個節點的值都相同</b>。</p>`,
    tests: [
      { args: [[1, 2, 3], [1, 2, 3]], expected: true },
      { args: [[1, 2], [1, null, 2]], expected: false },
      { args: [[1, 2, 1], [1, 1, 2]], expected: false },
      { args: [[], []], expected: true },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['建立函式 same(a, b)。', '兩個都是 null → true；只有一個是 null → false；值不同 → false。', '否則看 same(a.left, b.left) 且 same(a.right, b.right)。'],
    insight: '同時遞迴兩棵樹，先處理所有 null 的組合。',
    solution: `函式 same(a, b):
    如果 a 是 null 且 b 是 null: 回傳 true
    如果 a 是 null 或 b 是 null: 回傳 false
    如果 a.val ≠ b.val: 回傳 false
    回傳 same(a.left, b.left) 且 same(a.right, b.right)
回傳 same(p, q)`,
  },

  // ===================== 圖 =====================
  {
    id: 'number-of-islands', no: 200, title: 'Number of Islands', zh: '島嶼數量', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'graph',
    fn: 'numIslands', params: ['grid'],
    desc: `<p><code>grid</code> 是由 <code>"1"</code>（陸地）和 <code>"0"</code>（水）組成的二維網格。上下左右相連的陸地算同一座島，回傳<b>島嶼數量</b>。</p>`,
    tests: [
      { args: [[['1', '1', '1', '1', '0'], ['1', '1', '0', '1', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '0', '0', '0']]], expected: 1 },
      { args: [[['1', '1', '0', '0', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '1', '0', '0'], ['0', '0', '0', '1', '1']]], expected: 3 },
      { args: [[['1', '0', '1'], ['0', '1', '0'], ['1', '0', '1']]], expected: 5 },
      { args: [[['0']]], expected: 0 },
    ],
    time: 'O(m·n)', space: 'O(m·n)',
    hints: ['掃過每一格，遇到 "1" 就是發現一座新島 → 計數 +1。', '發現新島後，把整座島「淹掉」（改成 "0"），避免重複計算。', '建立函式 sink(r, c)：超出邊界或不是 "1" 就返回；否則改成 "0"，再對上下左右遞迴。'],
    insight: '網格 = 隱含的圖；「連通塊數量」= 外層掃描 + 內層 DFS/BFS 標記。',
    solution: `函式 sink(r, c):
    如果 r < 0 或 c < 0 或 r >= 列數 或 c >= 行數: 回傳
    如果 grid[r][c] ≠ "1": 回傳
    grid[r][c] = "0"
    sink(r+1,c); sink(r-1,c); sink(r,c+1); sink(r,c-1)
count = 0
對每個 r, c:
    如果 grid[r][c] == "1": count += 1; sink(r, c)
回傳 count`,
  },

  // ===================== 動態規劃 =====================
  {
    id: 'climbing-stairs', no: 70, title: 'Climbing Stairs', zh: '爬樓梯', difficulty: 'Easy', lists: ['B75', 'T150'], pattern: 'dp',
    fn: 'climbStairs', params: ['n'],
    desc: `<p>爬 <code>n</code> 階樓梯，每次可以爬 <b>1 或 2 階</b>。共有幾種不同的爬法？</p>`,
    tests: [
      { args: [2], expected: 2 },
      { args: [3], expected: 3 },
      { args: [5], expected: 8 },
      { args: [10], expected: 89 },
      { args: [1], expected: 1 },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['走到第 n 階的最後一步，要嘛從 n−1 階上來，要嘛從 n−2 階上來。', 'ways(n) = ways(n−1) + ways(n−2)。', '只需要記住前兩個值，用迴圈往上推。'],
    insight: 'DP 思考法：「最後一步是什麼？」→ 寫出遞迴關係 → 由小推到大。',
    solution: `a = 1, b = 1   (到第 0 階、第 1 階的方法數)
重複 n - 1 次:
    c = a + b
    a = b
    b = c
回傳 b`,
  },
  {
    id: 'house-robber', no: 198, title: 'House Robber', zh: '打家劫舍', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'dp',
    fn: 'rob', params: ['nums'],
    desc: `<p>一排房子，<code>nums[i]</code> 是第 i 間的金額。<b>不能偷相鄰的兩間</b>，回傳最多能偷多少錢。</p>`,
    tests: [
      { args: [[1, 2, 3, 1]], expected: 4 },
      { args: [[2, 7, 9, 3, 1]], expected: 12 },
      { args: [[2, 1, 1, 2]], expected: 4 },
      { args: [[5]], expected: 5 },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['面對第 i 間房子只有兩個選擇：偷或不偷。', '偷：前前一間為止的最佳 + nums[i]；不偷：前一間為止的最佳。', 'best(i) = max(best(i−1), best(i−2) + nums[i])，只要記住兩個變數。'],
    insight: '「選或不選」型 DP：每一步取兩種選擇的最大值。',
    solution: `prev2 = 0, prev1 = 0
對 nums 中每個 x:
    cur = max(prev1, prev2 + x)
    prev2 = prev1
    prev1 = cur
回傳 prev1`,
  },
  {
    id: 'maximum-subarray', no: 53, title: 'Maximum Subarray', zh: '最大子陣列和', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'dp',
    fn: 'maxSubArray', params: ['nums'],
    desc: `<p>找出總和最大的<b>連續</b>子陣列（至少一個元素），回傳它的總和。</p>`,
    tests: [
      { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { args: [[1]], expected: 1 },
      { args: [[5, 4, -1, 7, 8]], expected: 23 },
      { args: [[-3, -1, -2]], expected: -1 },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['考慮「以 nums[i] 結尾」的最大子陣列和。', '它要嘛是 nums[i] 自己重新開始，要嘛接在前一段後面。', 'cur = max(nums[i], cur + nums[i])，另外用 best 記錄出現過的最大值。'],
    insight: 'Kadane：如果前面累積的是負數，就丟掉重來。',
    solution: `cur = nums[0], best = nums[0]
對 i 從 1 到 n:
    cur = max(nums[i], cur + nums[i])
    best = max(best, cur)
回傳 best`,
  },
  {
    id: 'coin-change', no: 322, title: 'Coin Change', zh: '零錢兌換', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'dp',
    fn: 'coinChange', params: ['coins', 'amount'],
    desc: `<p>給不同面額的硬幣 <code>coins</code>（每種數量無限）和總金額 <code>amount</code>，回傳湊出該金額<b>最少需要幾枚</b>硬幣；湊不出來回傳 -1。</p>`,
    tests: [
      { args: [[1, 2, 5], 11], expected: 3 },
      { args: [[2], 3], expected: -1 },
      { args: [[1], 0], expected: 0 },
      { args: [[2, 5, 10, 1], 27], expected: 4 },
      { args: [[186, 419, 83, 408], 6249], expected: 20 },
    ],
    time: 'O(n·k)', space: 'O(n)',
    hints: ['貪婪（先拿最大面額）不一定對！例如 coins=[1,3,4], amount=6。', 'dp[a] = 湊出金額 a 的最少硬幣數。dp[0] = 0，其他先設 ∞。', 'dp[a] = min(dp[a], dp[a − coin] + 1)，對每個 coin ≤ a。'],
    insight: '完全背包：大問題的最佳解 = 某個小問題的最佳解 + 1 步。',
    solution: `dp = 長度 amount+1 的清單，每格放 ∞
dp[0] = 0
對 a 從 1 到 amount+1:
    對 coins 中每個 c:
        如果 c <= a: dp[a] = min(dp[a], dp[a-c] + 1)
回傳 (dp[amount] == ∞ ? -1 : dp[amount])`,
  },
  {
    id: 'unique-paths', no: 62, title: 'Unique Paths', zh: '不同路徑', difficulty: 'Medium', lists: ['B75'], pattern: 'dp',
    fn: 'uniquePaths', params: ['m', 'n'],
    desc: `<p>機器人在 <code>m × n</code> 網格的左上角，每次只能往<b>右</b>或往<b>下</b>走一格。走到右下角共有幾條不同路徑？</p>`,
    tests: [
      { args: [3, 7], expected: 28 },
      { args: [3, 2], expected: 3 },
      { args: [1, 1], expected: 1 },
      { args: [10, 10], expected: 48620 },
    ],
    time: 'O(m·n)', space: 'O(m·n)',
    hints: ['到達 (r, c) 的上一步只可能來自上面 (r−1, c) 或左邊 (r, c−1)。', 'dp[r][c] = dp[r−1][c] + dp[r][c−1]。', '第一列和第一行都只有 1 種走法。'],
    insight: '二維 DP：格子的答案 = 所有「可能的上一步」的答案總和。',
    solution: `dp = m 列 × n 行的二維清單，每格放 1
對 r 從 1 到 m:
    對 c 從 1 到 n:
        dp[r][c] = dp[r-1][c] + dp[r][c-1]
回傳 dp[m-1][n-1]`,
  },

  // ===================== 位元 / 數學 =====================
  {
    id: 'missing-number', no: 268, title: 'Missing Number', zh: '遺失的數字', difficulty: 'Easy', lists: ['B75'], pattern: 'math',
    fn: 'missingNumber', params: ['nums'],
    desc: `<p><code>nums</code> 包含 <b>0 到 n</b> 之間的 n 個不同數字，找出缺少的那一個。進階：O(1) 空間。</p>`,
    tests: [
      { args: [[3, 0, 1]], expected: 2 },
      { args: [[0, 1]], expected: 2 },
      { args: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], expected: 8 },
      { args: [[0]], expected: 1 },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['0 到 n 的總和是多少？', '公式：n × (n + 1) / 2。', '答案 = 應有的總和 − 實際總和。（也可以用 XOR 做）'],
    insight: '「完整集合 − 實際集合 = 缺的」→ 用總和或 XOR 一次抵銷。',
    solution: `n = nums 長度
total = n * (n + 1) 整數除以 2
對 nums 中每個 x: total -= x
回傳 total`,
  },
  {
    id: 'single-number', no: 136, title: 'Single Number', zh: '只出現一次的數字', difficulty: 'Easy', lists: ['T150'], pattern: 'bit',
    fn: 'singleNumber', params: ['nums'],
    desc: `<p>陣列中除了某個數字只出現一次，其他都出現<b>兩次</b>。找出那個數字。要求 O(n) 時間、O(1) 空間。</p>`,
    tests: [
      { args: [[2, 2, 1]], expected: 1 },
      { args: [[4, 1, 2, 1, 2]], expected: 4 },
      { args: [[1]], expected: 1 },
      { args: [[-3, 7, 7]], expected: -3 },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['XOR 有什麼特性？', 'x ^ x = 0、x ^ 0 = x，而且順序不影響結果。', '把所有數字 XOR 起來，成對的全部抵銷。'],
    insight: 'XOR = 不進位的加法，相同的東西會互相抵銷。',
    solution: `res = 0
對 nums 中每個 x: res = res ^ x
回傳 res`,
  },
  {
    id: 'number-of-1-bits', no: 191, title: 'Number of 1 Bits', zh: '位元 1 的個數', difficulty: 'Easy', lists: ['B75', 'T150'], pattern: 'bit',
    fn: 'hammingWeight', params: ['n'],
    desc: `<p>給一個正整數 <code>n</code>，回傳它的二進位表示中有幾個 <b>1</b>。</p><p class="muted">例如 11 = 1011₂ → 3</p>`,
    tests: [
      { args: [11], expected: 3 },
      { args: [128], expected: 1 },
      { args: [2147483645], expected: 30 },
      { args: [1], expected: 1 },
    ],
    time: 'O(1)', space: 'O(1)',
    hints: ['n & 1 可以看最低位是不是 1。', 'n >> 1 可以把 n 往右移一位（丟掉最低位）。', '進階：n & (n − 1) 會把最低位的 1 消掉。'],
    insight: '逐位檢查：& 1 取最低位、>> 1 往右移。',
    solution: `count = 0
當 n > 0:
    count += n & 1
    n = n >> 1
回傳 count`,
  },

  // ===================== 字串 =====================
  {
    id: 'longest-common-prefix', no: 14, title: 'Longest Common Prefix', zh: '最長共同前綴', difficulty: 'Easy', lists: ['T150'], pattern: 'string',
    fn: 'longestCommonPrefix', params: ['strs'],
    desc: `<p>找出字串陣列中所有字串的<b>最長共同前綴</b>，沒有則回傳空字串 <code>""</code>。</p>`,
    tests: [
      { args: [['flower', 'flow', 'flight']], expected: 'fl' },
      { args: [['dog', 'racecar', 'car']], expected: '' },
      { args: [['a']], expected: 'a' },
      { args: [['ab', 'a']], expected: 'a' },
    ],
    time: 'O(n·k)', space: 'O(1)',
    hints: ['以第一個字串為基準，一個字元一個字元檢查。', '第 i 個字元：所有字串都要夠長，而且 s[i] 都相同。', '一旦不符合就回傳 strs[0] 從 0 到 i 的片段。'],
    insight: '縱向掃描：逐「欄」比較，遇到第一個不一致就停。',
    solution: `first = strs[0]
對 i 從 0 到 first 長度:
    對 strs 中每個 w:
        如果 i >= w 長度 或 w[i] ≠ first[i]:
            回傳 first 從 0 到 i 的片段
回傳 first`,
  },
];
