// 第 C 批：鏈結串列
(function () {
  const { set, inc, Ret, If, IfChain, For, While, Repeat, Break, at, setAt, len, list, mapNew, mset, mget, mhas, mapDel, msize,
    o, not, isNull, tern, NULL, nget, nset, newNode, heapNew, hpush, hpop, hsize, defRet, def, callR, call } = Solutions.dsl;
  const add = (p, sol) => { PROBLEMS.push(p); Solutions.add(p.id, sol); };
  const nn = (x) => not(isNull(x));
  const next = (x) => nget(x, 'next');
  const val = (x) => nget(x, 'val');

  add({
    id: 'add-two-numbers', no: 2, title: 'Add Two Numbers', zh: '兩數相加', difficulty: 'Medium', lists: ['T150'], pattern: 'linkedList',
    fn: 'addTwoNumbers', params: ['l1', 'l2'], types: { l1: 'list', l2: 'list' }, output: 'list', sig: 'ListNode; ListNode, ListNode',
    desc: `<p>兩個非負整數用鏈結串列<b>逆序</b>存每一位數（個位數在最前面）。回傳兩數之和（同樣逆序）。</p><p>例如 [2,4,3] + [5,6,4] 代表 342 + 465 = 807 → [7,0,8]。</p>`,
    tests: [
      { args: [[2, 4, 3], [5, 6, 4]], expected: [7, 0, 8] },
      { args: [[0], [0]], expected: [0] },
      { args: [[9, 9, 9, 9, 9, 9, 9], [9, 9, 9, 9]], expected: [8, 9, 9, 9, 0, 0, 0, 1] },
      { args: [[5], [5]], expected: [0, 1] },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['逆序剛好是直式加法的順序：從個位數開始。', '每一位：s = 進位 + 兩邊的位數（沒有就當 0），新節點 = s % 10，進位 = s // 10。', '兩條都走完但還有進位，要再補一個節點。'],
    insight: '模擬直式加法；用 dummy 頭節點簡化串列建構。',
    solution: `dummy = 新節點(0); tail = dummy; carry = 0
當 l1 不是 null 或 l2 不是 null 或 carry > 0:
    s = carry
    如果 l1: s += l1.val; l1 = l1.next
    如果 l2: s += l2.val; l2 = l2.next
    carry = s // 10
    tail.next = 新節點(s % 10); tail = tail.next
回傳 dummy.next`,
  }, { body: [
    set('dummy', newNode(0)), set('tail', 'dummy'), set('carry', 0),
    While(o(o(nn('l1'), 'or', nn('l2')), 'or', o('carry', '>', 0)), [
      set('s', 'carry'),
      If(nn('l1'), [set('s', o('s', '+', val('l1'))), set('l1', next('l1'))]),
      If(nn('l2'), [set('s', o('s', '+', val('l2'))), set('l2', next('l2'))]),
      set('carry', o('s', '//', 10)),
      nset('tail', 'next', newNode(o('s', '%', 10))),
      set('tail', next('tail')),
    ]),
    Ret(next('dummy')),
  ] });

  add({
    id: 'copy-random-list', no: 138, title: 'Copy List with Random Pointer', zh: '隨機鏈結串列的複製', difficulty: 'Medium', lists: ['T150'], pattern: 'linkedList',
    fn: 'copyRandomList', params: ['head'], types: { head: 'randomList' }, output: 'randomList', nodeKind: 'RandomNode', sig: 'RandomNode; RandomNode',
    desc: `<p>每個節點除了 next，還有一個 <code>random</code> 指標指向串列中任意節點或 null。請<b>深拷貝</b>整個串列（新串列不能用到任何原本的節點）。</p><p class="muted">測資格式：[[val, random 指向的索引], ...]。</p>`,
    tests: [
      { args: [[[7, null], [13, 0], [11, 4], [10, 2], [1, 0]]], expected: [[7, null], [13, 0], [11, 4], [10, 2], [1, 0]] },
      { args: [[[1, 1], [2, 1]]], expected: [[1, 1], [2, 1]] },
      { args: [[[3, null], [3, 0], [3, null]]], expected: [[3, null], [3, 0], [3, null]] },
      { args: [[]], expected: [] },
    ],
    time: 'O(n)', space: 'O(n)',
    hints: ['困難點：複製 random 時，它指向的節點可能還沒被複製。', '分兩趟：第一趟只建立新節點，用字典記「舊節點 → 新節點」。', '第二趟用字典接上 next 和 random。'],
    insight: '「舊 → 新」對照表是複製任何指標結構（圖、隨機串列）的萬用方法。',
    solution: `copy = 空字典
cur = head; 當 cur: copy[cur] = 新節點(cur.val); cur = cur.next
cur = head; 當 cur:
    copy[cur].next = (cur.next 是 null ? null : copy[cur.next])
    copy[cur].random = (cur.random 是 null ? null : copy[cur.random])
    cur = cur.next
回傳 (head 是 null ? null : copy[head])`,
  }, { body: [
    set('copy', mapNew()),
    set('cur', 'head'),
    While(nn('cur'), [mset('copy', 'cur', newNode(val('cur'), 'RandomNode')), set('cur', next('cur'))]),
    set('cur', 'head'),
    While(nn('cur'), [
      nset(mget('copy', 'cur'), 'next', tern(isNull(next('cur')), NULL(), mget('copy', next('cur')))),
      nset(mget('copy', 'cur'), 'random', tern(isNull(nget('cur', 'random')), NULL(), mget('copy', nget('cur', 'random')))),
      set('cur', next('cur')),
    ]),
    Ret(tern(isNull('head'), NULL(), mget('copy', 'head'))),
  ] });

  add({
    id: 'reverse-linked-list-ii', no: 92, title: 'Reverse Linked List II', zh: '反轉鏈結串列 II', difficulty: 'Medium', lists: ['T150'], pattern: 'linkedList',
    fn: 'reverseBetween', params: ['head', 'left', 'right'], types: { head: 'list' }, output: 'list', sig: 'ListNode; ListNode, int, int',
    desc: `<p>反轉串列中第 <code>left</code> 到第 <code>right</code> 個節點（從 1 開始數），回傳新的頭。</p>`,
    tests: [
      { args: [[1, 2, 3, 4, 5], 2, 4], expected: [1, 4, 3, 2, 5] },
      { args: [[5], 1, 1], expected: [5] },
      { args: [[3, 5], 1, 2], expected: [5, 3] },
      { args: [[1, 2, 3], 1, 3], expected: [3, 2, 1] },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['用 dummy 處理 left = 1 的情況。', 'prev 走到第 left−1 個節點，cur = prev.next。', '重複 right−left 次：把 cur 後面的節點「拔出來」插到 prev 後面。'],
    insight: '頭插法：每次把下一個節點搬到區段最前面，一趟完成區段反轉。',
    solution: `dummy.next = head; prev = dummy
重複 left-1 次: prev = prev.next
cur = prev.next
重複 right-left 次:
    nxt = cur.next
    cur.next = nxt.next
    nxt.next = prev.next
    prev.next = nxt
回傳 dummy.next`,
  }, { body: [
    set('dummy', newNode(0)), nset('dummy', 'next', 'head'),
    set('prev', 'dummy'),
    Repeat(o('left', '-', 1), set('prev', next('prev'))),
    set('cur', next('prev')),
    Repeat(o('right', '-', 'left'), [
      set('nxt', next('cur')),
      nset('cur', 'next', next('nxt')),
      nset('nxt', 'next', next('prev')),
      nset('prev', 'next', 'nxt'),
    ]),
    Ret(next('dummy')),
  ] });

  add({
    id: 'reverse-k-group', no: 25, title: 'Reverse Nodes in k-Group', zh: 'K 個一組反轉鏈結串列', difficulty: 'Hard', lists: ['T150'], pattern: 'linkedList',
    fn: 'reverseKGroup', params: ['head', 'k'], types: { head: 'list' }, output: 'list', sig: 'ListNode; ListNode, int',
    desc: `<p>每 k 個節點一組反轉；最後不足 k 個的保持原順序。只能改指標，不能改節點的值。</p>`,
    tests: [
      { args: [[1, 2, 3, 4, 5], 2], expected: [2, 1, 4, 3, 5] },
      { args: [[1, 2, 3, 4, 5], 3], expected: [3, 2, 1, 4, 5] },
      { args: [[1, 2, 3, 4, 5], 1], expected: [1, 2, 3, 4, 5] },
      { args: [[1, 2], 2], expected: [2, 1] },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['groupPrev 指向「上一組的最後一個節點」（一開始是 dummy）。', '先往後找第 k 個節點 kth；找不到就結束。', '反轉 groupPrev.next 到 kth 這一段，接回去，groupPrev 移到這組新的尾巴。'],
    insight: '把大問題拆成「找一組 → 反轉一組 → 接回去」的重複步驟。',
    solution: `dummy.next = head; groupPrev = dummy
重複:
    kth = groupPrev 往後走 k 步（途中變 null 就結束）
    groupNext = kth.next
    prev = groupNext, cur = groupPrev.next
    當 cur ≠ groupNext: 反轉指標
    first = groupPrev.next; groupPrev.next = kth; groupPrev = first
回傳 dummy.next`,
  }, { body: [
    set('dummy', newNode(0)), nset('dummy', 'next', 'head'),
    set('groupPrev', 'dummy'),
    While(true, [
      set('kth', 'groupPrev'),
      set('count', 0),
      While(o(o('count', '<', 'k'), 'and', nn('kth')), [set('kth', next('kth')), inc('count', 1)]),
      If(isNull('kth'), Break()),
      set('groupNext', next('kth')),
      set('prev', 'groupNext'),
      set('cur', next('groupPrev')),
      While(o('cur', '!=', 'groupNext'), [set('nxt', next('cur')), nset('cur', 'next', 'prev'), set('prev', 'cur'), set('cur', 'nxt')]),
      set('first', next('groupPrev')),
      nset('groupPrev', 'next', 'kth'),
      set('groupPrev', 'first'),
    ]),
    Ret(next('dummy')),
  ] });

  add({
    id: 'remove-nth-node', no: 19, title: 'Remove Nth Node From End of List', zh: '刪除鏈結串列的倒數第 N 個節點', difficulty: 'Medium', lists: ['B75', 'T150'], pattern: 'linkedList',
    fn: 'removeNthFromEnd', params: ['head', 'n'], types: { head: 'list' }, output: 'list', sig: 'ListNode; ListNode, int',
    desc: `<p>刪除串列的<b>倒數</b>第 n 個節點，回傳頭節點。進階：只走一趟。</p>`,
    tests: [
      { args: [[1, 2, 3, 4, 5], 2], expected: [1, 2, 3, 5] },
      { args: [[1], 1], expected: [] },
      { args: [[1, 2], 1], expected: [1] },
      { args: [[1, 2], 2], expected: [2] },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['讓 fast 先走 n+1 步，再讓 slow、fast 一起走。', 'fast 走到 null 時，slow 剛好在要刪除節點的前一個。', '用 dummy 處理刪除頭節點的情況。'],
    insight: '固定距離的雙指標：先拉開距離，再一起走。',
    solution: `dummy.next = head; fast = dummy; slow = dummy
重複 n+1 次: fast = fast.next
當 fast 不是 null: fast = fast.next; slow = slow.next
slow.next = slow.next.next
回傳 dummy.next`,
  }, { body: [
    set('dummy', newNode(0)), nset('dummy', 'next', 'head'),
    set('fast', 'dummy'), set('slow', 'dummy'),
    Repeat(o('n', '+', 1), set('fast', next('fast'))),
    While(nn('fast'), [set('fast', next('fast')), set('slow', next('slow'))]),
    nset('slow', 'next', next(next('slow'))),
    Ret(next('dummy')),
  ] });

  add({
    id: 'remove-duplicates-list-ii', no: 82, title: 'Remove Duplicates from Sorted List II', zh: '刪除排序鏈結串列中的重複元素 II', difficulty: 'Medium', lists: ['T150'], pattern: 'linkedList',
    fn: 'deleteDuplicates', params: ['head'], types: { head: 'list' }, output: 'list', sig: 'ListNode; ListNode',
    desc: `<p>已排序的串列，把所有<b>有重複</b>的數字整組刪掉，只留下原本就只出現一次的數字。</p>`,
    tests: [
      { args: [[1, 2, 3, 3, 4, 4, 5]], expected: [1, 2, 5] },
      { args: [[1, 1, 1, 2, 3]], expected: [2, 3] },
      { args: [[]], expected: [] },
      { args: [[1, 1]], expected: [] },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['頭節點也可能被刪 → 用 dummy。', 'prev 指向最後一個確定保留的節點。', '發現 cur 和 cur.next 一樣時，跳過所有等於這個值的節點，再讓 prev.next 接到後面。'],
    insight: '「整組刪除」要先跳過整組，再一次接回去。',
    solution: `dummy.next = head; prev = dummy; cur = head
當 cur:
    如果 cur.next 且 cur.val == cur.next.val:
        v = cur.val; 當 cur 且 cur.val == v: cur = cur.next
        prev.next = cur
    否則: prev = cur; cur = cur.next
回傳 dummy.next`,
  }, { body: [
    set('dummy', newNode(0)), nset('dummy', 'next', 'head'),
    set('prev', 'dummy'), set('cur', 'head'),
    While(nn('cur'), If(o(nn(next('cur')), 'and', o(val('cur'), '==', val(next('cur')))), [
      set('v', val('cur')),
      While(o(nn('cur'), 'and', o(val('cur'), '==', 'v')), set('cur', next('cur'))),
      nset('prev', 'next', 'cur'),
    ], [set('prev', 'cur'), set('cur', next('cur'))])),
    Ret(next('dummy')),
  ] });

  add({
    id: 'rotate-list', no: 61, title: 'Rotate List', zh: '旋轉鏈結串列', difficulty: 'Medium', lists: ['T150'], pattern: 'linkedList',
    fn: 'rotateRight', params: ['head', 'k'], types: { head: 'list' }, output: 'list', sig: 'ListNode; ListNode, int',
    desc: `<p>把串列往右旋轉 k 步（最後 k 個節點移到前面）。</p>`,
    tests: [
      { args: [[1, 2, 3, 4, 5], 2], expected: [4, 5, 1, 2, 3] },
      { args: [[0, 1, 2], 4], expected: [2, 0, 1] },
      { args: [[], 0], expected: [] },
      { args: [[1], 5], expected: [1] },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['先算長度 n，k = k % n。', '把尾巴接回頭，變成環。', '從頭走 n−k−1 步找到新的尾巴，斷開環。'],
    insight: '先接成環再找斷點，比搬節點簡單。',
    solution: `如果 head 是 null: 回傳 head
n = 長度, tail = 最後一個節點
k = k % n; 如果 k == 0: 回傳 head
tail.next = head
newTail = head; 重複 n-k-1 次: newTail = newTail.next
newHead = newTail.next; newTail.next = null
回傳 newHead`,
  }, { body: [
    If(isNull('head'), Ret('head')),
    set('n', 1), set('tail', 'head'),
    While(nn(next('tail')), [set('tail', next('tail')), inc('n', 1)]),
    set('k', o('k', '%', 'n')),
    If(o('k', '==', 0), Ret('head')),
    nset('tail', 'next', 'head'),
    set('newTail', 'head'),
    Repeat(o(o('n', '-', 'k'), '-', 1), set('newTail', next('newTail'))),
    set('newHead', next('newTail')),
    nset('newTail', 'next', NULL()),
    Ret('newHead'),
  ] });

  add({
    id: 'partition-list', no: 86, title: 'Partition List', zh: '分隔鏈結串列', difficulty: 'Medium', lists: ['T150'], pattern: 'linkedList',
    fn: 'partition', params: ['head', 'x'], types: { head: 'list' }, output: 'list', sig: 'ListNode; ListNode, int',
    desc: `<p>把串列分成兩部分：所有 <b>&lt; x</b> 的節點在前、<b>≥ x</b> 的在後，兩部分內各自保持原本的相對順序。</p>`,
    tests: [
      { args: [[1, 4, 3, 2, 5, 2], 3], expected: [1, 2, 2, 4, 3, 5] },
      { args: [[2, 1], 2], expected: [1, 2] },
      { args: [[], 0], expected: [] },
      { args: [[3, 1, 2], 3], expected: [1, 2, 3] },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['建兩條新串列（各用一個 dummy）：小的、大的。', '依序把節點接到對應串列的尾巴。', '最後把小的尾巴接到大的頭；大的尾巴要設成 null。'],
    insight: '「穩定分組」= 兩條佇列分別收集，最後接起來。',
    solution: `lessHead, geHead = 兩個 dummy; less = lessHead; ge = geHead
對每個節點 cur:
    如果 cur.val < x: less.next = cur; less = cur
    否則: ge.next = cur; ge = cur
ge.next = null; less.next = geHead.next
回傳 lessHead.next`,
  }, { body: [
    set('lessHead', newNode(0)), set('geHead', newNode(0)),
    set('less', 'lessHead'), set('ge', 'geHead'),
    set('cur', 'head'),
    While(nn('cur'), [
      If(o(val('cur'), '<', 'x'), [nset('less', 'next', 'cur'), set('less', 'cur')], [nset('ge', 'next', 'cur'), set('ge', 'cur')]),
      set('cur', next('cur')),
    ]),
    nset('ge', 'next', NULL()),
    nset('less', 'next', next('geHead')),
    Ret(next('lessHead')),
  ] });

  add({
    id: 'reorder-list', no: 143, title: 'Reorder List', zh: '重排鏈結串列', difficulty: 'Medium', lists: ['B75'], pattern: 'linkedList',
    fn: 'reorderList', params: ['head'], types: { head: 'list' }, output: 'list', sig: 'void; ListNode', resultFrom: 'arg0',
    desc: `<p>把 L0 → L1 → … → Ln 重排成 L0 → Ln → L1 → Ln−1 → L2 → …（原地修改，不用回傳）。</p>`,
    tests: [
      { args: [[1, 2, 3, 4]], expected: [1, 4, 2, 3] },
      { args: [[1, 2, 3, 4, 5]], expected: [1, 5, 2, 4, 3] },
      { args: [[1]], expected: [1] },
      { args: [[1, 2]], expected: [1, 2] },
    ],
    time: 'O(n)', space: 'O(1)',
    hints: ['三個經典步驟的組合。', '1) 快慢指標找中點，切成兩半。2) 反轉後半段。', '3) 兩條串列交錯合併。'],
    insight: '把複雜操作拆成三個熟悉的小技巧：找中點、反轉、合併。',
    solution: `slow = fast = head
當 fast.next 且 fast.next.next: slow = slow.next; fast = fast.next.next
second = slow.next; slow.next = null
反轉 second → prev
first = head, second = prev
當 second: 交錯接上`,
  }, { body: [
    set('slow', 'head'), set('fast', 'head'),
    While(o(nn(next('fast')), 'and', nn(next(next('fast')))), [set('slow', next('slow')), set('fast', next(next('fast')))]),
    set('second', next('slow')),
    nset('slow', 'next', NULL()),
    set('prev', NULL()),
    While(nn('second'), [set('nxt', next('second')), nset('second', 'next', 'prev'), set('prev', 'second'), set('second', 'nxt')]),
    set('first', 'head'), set('second', 'prev'),
    While(nn('second'), [
      set('t1', next('first')), set('t2', next('second')),
      nset('first', 'next', 'second'), nset('second', 'next', 't1'),
      set('first', 't1'), set('second', 't2'),
    ]),
  ] });

  add({
    id: 'merge-k-lists', no: 23, title: 'Merge k Sorted Lists', zh: '合併 K 個升序鏈結串列', difficulty: 'Hard', lists: ['B75', 'T150'], pattern: 'heap',
    fn: 'mergeKLists', params: ['lists'], types: { lists: 'listArray' }, output: 'list', sig: 'ListNode; ListNode[]',
    desc: `<p>給 k 個已排序的鏈結串列，合併成一個排序的串列。</p>`,
    tests: [
      { args: [[[1, 4, 5], [1, 3, 4], [2, 6]]], expected: [1, 1, 2, 3, 4, 4, 5, 6] },
      { args: [[]], expected: [] },
      { args: [[[]]], expected: [] },
      { args: [[[2], [], [-1]]], expected: [-1, 2] },
    ],
    time: 'O(n log n)', space: 'O(k)',
    hints: ['每一步都要從 k 條串列的「目前頭」中挑最小的。', '用最小堆積放 [值, 是第幾條串列]，每次取出最小的。', '取出後把那條串列往後走一步，有下一個就再放回堆積。（也可以兩兩合併：分治法）'],
    insight: '「從 k 個候選中反覆挑最小」→ 最小堆積，每次 O(log k)。',
    solution: `heap = 最小堆積
對每條 i: 如果 lists[i] 不是 null: 放入 [lists[i].val, i]
dummy, tail
當 heap 不空:
    [v, i] = 取出頂端
    tail.next = lists[i]; tail = lists[i]
    lists[i] = lists[i].next
    如果 lists[i] 不是 null: 放入 [lists[i].val, i]
回傳 dummy.next`,
  }, { body: [
    set('heap', heapNew('min')),
    For('i', 0, len('lists'), 1, If(nn(at('lists', 'i')), hpush('heap', list(val(at('lists', 'i')), 'i')))),
    set('dummy', newNode(0)), set('tail', 'dummy'),
    While(o(hsize('heap'), '>', 0), [
      set('top', hpop('heap')),
      set('i', at('top', 1)),
      nset('tail', 'next', at('lists', 'i')),
      set('tail', at('lists', 'i')),
      setAt('lists', 'i', next(at('lists', 'i'))),
      If(nn(at('lists', 'i')), hpush('heap', list(val(at('lists', 'i')), 'i'))),
    ]),
    Ret(next('dummy')),
  ] });

  const mergeDef = defRet('merge', ['a', 'b'], [
    set('dummy', newNode(0)), set('tail', 'dummy'),
    While(o(nn('a'), 'and', nn('b')), [
      If(o(val('a'), '<=', val('b')), [nset('tail', 'next', 'a'), set('a', next('a'))], [nset('tail', 'next', 'b'), set('b', next('b'))]),
      set('tail', next('tail')),
    ]),
    nset('tail', 'next', tern(nn('a'), 'a', 'b')),
  ], next('dummy'));
  add({
    id: 'sort-list', no: 148, title: 'Sort List', zh: '排序鏈結串列', difficulty: 'Medium', lists: ['T150'], pattern: 'divide',
    fn: 'sortList', params: ['head'], types: { head: 'list' }, output: 'list', sig: 'ListNode; ListNode',
    desc: `<p>把鏈結串列由小到大排序。要求 O(n log n) 時間。</p>`,
    tests: [
      { args: [[4, 2, 1, 3]], expected: [1, 2, 3, 4] },
      { args: [[-1, 5, 3, 4, 0]], expected: [-1, 0, 3, 4, 5] },
      { args: [[]], expected: [] },
      { args: [[1]], expected: [1] },
    ],
    time: 'O(n log n)', space: 'O(log n)',
    hints: ['串列不能隨機存取 → 合併排序最適合。', '快慢指標找中點，切成兩半，各自遞迴排序。', '再用「合併兩個排序串列」接起來。'],
    insight: '分治：切半（找中點）→ 遞迴 → 合併，跟陣列的合併排序一模一樣。',
    solution: `函式 sortL(h):
    如果 h 是 null 或 h.next 是 null: 回傳 h
    slow = h, fast = h.next
    當 fast 且 fast.next: slow = slow.next; fast = fast.next.next
    mid = slow.next; slow.next = null
    回傳 merge(sortL(h), sortL(mid))
回傳 sortL(head)`,
  }, {
    helpers: [
      defRet('sortL', ['h'], [
        If(o(isNull('h'), 'or', isNull(next('h'))), Ret('h')),
        set('slow', 'h'), set('fast', next('h')),
        While(o(nn('fast'), 'and', nn(next('fast'))), [set('slow', next('slow')), set('fast', next(next('fast')))]),
        set('mid', next('slow')),
        nset('slow', 'next', NULL()),
      ], callR('merge', ['a', 'b'], [callR('sortL', ['h'], ['h']), callR('sortL', ['h'], ['mid'])])),
      mergeDef,
    ],
    body: [Ret(callR('sortL', ['h'], ['head']))],
  });

  // ===================== LRU Cache =====================
  const unlink = (n) => call('unlink', ['node'], [n]);
  const pushFront = (n) => call('pushFront', ['node'], [n]);
  add({
    id: 'lru-cache', no: 146, title: 'LRU Cache', zh: 'LRU 快取', difficulty: 'Medium', lists: ['T150'], pattern: 'design',
    design: { cls: 'LRUCache', methods: [
      { name: 'LRUCache', params: ['capacity'] },
      { name: 'get', params: ['key'] },
      { name: 'put', params: ['key', 'value'], ret: 'void' },
    ] },
    sig: { LRUCache: 'void; int', get: 'int; int', put: 'void; int, int' },
    desc: `<p>設計容量為 <code>capacity</code> 的 LRU（最近最少使用）快取：</p><ul><li><code>get(key)</code>：存在就回傳值（並算作「最近使用」），否則 -1。</li><li><code>put(key, value)</code>：新增或更新；超過容量時，淘汰<b>最久沒被使用</b>的鍵。</li></ul><p>兩個操作都要平均 <b>O(1)</b>。</p>`,
    tests: [
      { ops: ['LRUCache', 'put', 'put', 'get', 'put', 'get', 'put', 'get', 'get', 'get'], args: [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]],
        expected: [null, null, null, 1, null, -1, null, -1, 3, 4] },
      { ops: ['LRUCache', 'put', 'get', 'put', 'get', 'get'], args: [[1], [2, 1], [2], [3, 2], [2], [3]], expected: [null, null, 1, null, -1, 2] },
      { ops: ['LRUCache', 'put', 'put', 'put', 'get'], args: [[2], [1, 1], [1, 5], [2, 2], [1]], expected: [null, null, null, null, 5] },
    ],
    time: 'O(1)', space: 'O(n)',
    hints: ['字典：key → 節點，O(1) 找到節點。', '雙向鏈結串列：最近用的放最前面，最久沒用的在最後面；有 prev 指標才能 O(1) 把節點拔出來。', '用兩個哨兵節點 head、tail，就不用處理空串列的特例。寫兩個輔助函式：unlink(node)、pushFront(node)。'],
    insight: '雜湊表 + 雙向鏈結串列：一個負責「找得到」，一個負責「排得出順序」。',
    solution: `LRUCache(capacity): cap = capacity; map = {}; head, tail = 哨兵; head.next = tail; tail.prev = head
unlink(node): node.prev.next = node.next; node.next.prev = node.prev
pushFront(node): node.next = head.next; node.prev = head; head.next.prev = node; head.next = node
get(key): 不存在回傳 -1; node = map[key]; unlink; pushFront; 回傳 node.val
put(key, value):
    已存在: 更新 val; unlink; pushFront; 結束
    建立新節點, map[key] = node, pushFront
    如果 map 大小 > cap: lru = tail.prev; unlink(lru); 刪除 map[lru.key]`,
  }, {
    helpers: [
      def('unlink', ['node'], [
        nset(nget('node', 'prev'), 'next', next('node')),
        nset(next('node'), 'prev', nget('node', 'prev')),
      ]),
      def('pushFront', ['node'], [
        nset('node', 'next', next('head')),
        nset('node', 'prev', 'head'),
        nset(next('head'), 'prev', 'node'),
        nset('head', 'next', 'node'),
      ]),
    ],
    methods: {
      LRUCache: [
        set('cap', 'capacity'),
        set('cache', mapNew()),
        set('head', newNode(0, 'DListNode')), set('tail', newNode(0, 'DListNode')),
        nset('head', 'next', 'tail'), nset('tail', 'prev', 'head'),
      ],
      get: [
        If(not(mhas('cache', 'key')), Ret(-1)),
        set('node', mget('cache', 'key')),
        unlink('node'), pushFront('node'),
        Ret(val('node')),
      ],
      put: [
        If(mhas('cache', 'key'), [
          set('node', mget('cache', 'key')),
          nset('node', 'val', 'value'),
          unlink('node'), pushFront('node'),
          Ret(),
        ]),
        set('node', newNode('value', 'DListNode')),
        nset('node', 'key', 'key'),
        mset('cache', 'key', 'node'),
        pushFront('node'),
        If(o(msize('cache'), '>', 'cap'), [
          set('lru', nget('tail', 'prev')),
          unlink('lru'),
          mapDel('cache', nget('lru', 'key')),
        ]),
      ],
    },
  });
})();
