// 自訂積木定義 + JavaScript / Python 產生器
// 設計原則：索引一律從 0 開始、區間一律「含頭不含尾」，跟 LeetCode 的寫法一致。
(function () {
  const JS = window.javascript ? javascript.javascriptGenerator : Blockly.JavaScript;
  const PY = window.python ? python.pythonGenerator : Blockly.Python;

  // 運算子優先順序（數字越小綁越緊）
  const J = { ATOMIC: 0, MEMBER: 1.2, CALL: 2, UNARY: 4.4, MUL: 5.1, ADD: 6.2, REL: 8, EQ: 9, AND: 13, OR: 14, ASSIGN: 16, NONE: 99 };
  const P = { ATOMIC: 0, MEMBER: 2.1, CALL: 2.2, MUL: 5, ADD: 6, REL: 11, NOT: 12, NONE: 99 };

  PY.INDENT = '    ';
  JS.INFINITE_LOOP_TRAP = 'if (__guard()) throw new Error("迴圈執行太多次（可能是無窮迴圈）");\n';
  JS.addReservedWords('Node,__log,__guard,__cmp,Heap');
  PY.addReservedWords('ListNode,TreeNode,TrieNode,heapq,random,self');

  const defs = [];
  function setGen(gen, type, fn) {
    if (gen.forBlock) gen.forBlock[type] = fn;
    else gen[type] = (b) => fn(b, gen);
  }
  function def(json, js, py) {
    defs.push(json);
    setGen(JS, json.type, js);
    setGen(PY, json.type, py);
  }
  const v = (g, b, name, order, dflt) => g.valueToCode(b, name, order) || dflt || (g === PY ? 'None' : 'null');
  const varName = (g, b) => g.getVariableName(b.getFieldValue('VAR'));
  const body = (g, b, name) => {
    let code = g.statementToCode(b, name);
    if (g.addLoopTrap) code = g.addLoopTrap(code, b);
    return code || (g === PY ? g.INDENT + 'pass\n' : '');
  };
  const vin = (name, check) => ({ type: 'input_value', name, ...(check ? { check } : {}) });
  const STMT = { previousStatement: null, nextStatement: null };

  // ---------- 解題主函式 ----------
  def(
    { type: 'solution_root', message0: '%1', args0: [{ type: 'field_label_serializable', name: 'SIG', text: 'solution()' }],
      message1: '%1', args1: [{ type: 'input_statement', name: 'BODY' }], style: { hat: 'cap' }, colour: 20,
      tooltip: '解題函式：把步驟積木放進來，最後用「回傳」交出答案' },
    // 主體會被 statementToCode 縮排一層，JS 這邊拿掉讓預覽比較整齊
    (b, g) => g.statementToCode(b, 'BODY').split('\n').map((l) => (l.startsWith(g.INDENT) ? l.slice(g.INDENT.length) : l)).join('\n'),
    (b, g) => '#__SOLUTION__\n' + g.statementToCode(b, 'BODY')
  );

  // 設計題（例如 MinStack）：每個方法一塊。方法名稱存在 block.data
  def(
    { type: 'method_root', message0: '%1', args0: [{ type: 'field_label_serializable', name: 'SIG', text: 'method()' }],
      message1: '%1', args1: [{ type: 'input_statement', name: 'BODY' }], style: { hat: 'cap' }, colour: 20,
      tooltip: '類別的方法。不同方法之間共用的變數就是這個類別的「欄位」' },
    (b, g) => g.statementToCode(b, 'BODY').split('\n').map((l) => (l.startsWith(g.INDENT) ? l.slice(g.INDENT.length) : l)).join('\n'),
    (b, g) => `#__METHOD__${b.data}\n` + g.statementToCode(b, 'BODY')
  );

  def(
    { type: 'ret_value', message0: '回傳 %1', args0: [vin('VALUE')], previousStatement: null, colour: 0,
      tooltip: '結束函式並交出這個值' },
    (b, g) => { const x = g.valueToCode(b, 'VALUE', J.NONE); return x ? `return ${x};\n` : 'return;\n'; },
    (b, g) => { const x = g.valueToCode(b, 'VALUE', P.NONE); return x ? `return ${x}\n` : 'return\n'; }
  );

  def(
    { type: 'print', message0: '印出 %1', args0: [vin('VALUE')], ...STMT, colour: 0, tooltip: '在「輸出」分頁顯示這個值，方便追蹤變數' },
    (b, g) => '__log(' + v(g, b, 'VALUE', J.NONE) + ');\n',
    (b, g) => 'print(' + v(g, b, 'VALUE', P.NONE) + ')\n'
  );

  // ---------- 迴圈 ----------
  def(
    { type: 'for_range', message0: '讓 %1 從 %2 走到 %3 (不含)，每步 %4',
      args0: [{ type: 'field_variable', name: 'VAR', variable: 'i' }, vin('FROM', 'Number'), vin('TO', 'Number'), vin('STEP', 'Number')],
      message1: '每一步做 %1', args1: [{ type: 'input_statement', name: 'DO' }], inputsInline: true, ...STMT, colour: 120,
      tooltip: '等同 for (i = 起點; i < 終點; i += 步長)。步長為負數時改成 i > 終點' },
    (b, g) => {
      const i = varName(g, b), from = v(g, b, 'FROM', J.ASSIGN, '0'), to = v(g, b, 'TO', J.REL, '0'), step = v(g, b, 'STEP', J.ASSIGN, '1');
      const cond = /^-?\d+(\.\d+)?$/.test(step)
        ? (Number(step) >= 0 ? `${i} < ${to}` : `${i} > ${to}`)
        : `(${step} >= 0 ? ${i} < ${to} : ${i} > ${to})`;
      return `for (${i} = ${from}; ${cond}; ${i} += ${step}) {\n${body(g, b, 'DO')}}\n`;
    },
    (b, g) => {
      const i = varName(g, b), from = v(g, b, 'FROM', P.NONE, '0'), to = v(g, b, 'TO', P.NONE, '0'), step = v(g, b, 'STEP', P.NONE, '1');
      const args = step === '1' ? (from === '0' ? to : `${from}, ${to}`) : `${from}, ${to}, ${step}`;
      return `for ${i} in range(${args}):\n${body(g, b, 'DO')}`;
    }
  );

  def(
    { type: 'for_each', message0: '對 %2 裡的每一個 %1', args0: [{ type: 'field_variable', name: 'VAR', variable: 'x' }, vin('LIST')],
      message1: '做 %1', args1: [{ type: 'input_statement', name: 'DO' }], ...STMT, colour: 120,
      tooltip: '依序取出清單 / 字串 / 集合中的每個元素' },
    (b, g) => `for (${varName(g, b)} of ${v(g, b, 'LIST', J.ASSIGN, '[]')}) {\n${body(g, b, 'DO')}}\n`,
    (b, g) => `for ${varName(g, b)} in ${v(g, b, 'LIST', P.NONE, '[]')}:\n${body(g, b, 'DO')}`
  );

  // ---------- 判斷 ----------
  def(
    { type: 'is_null', message0: '%1 是空的 (null)', args0: [vin('X')], output: 'Boolean', colour: 210 },
    (b, g) => [`(${v(g, b, 'X', J.EQ)} == null)`, J.ATOMIC],
    (b, g) => [`${v(g, b, 'X', P.REL)} is None`, P.REL]
  );

  // ---------- 數學 ----------
  def(
    { type: 'math_minmax', message0: '%1 ( %2 , %3 )', args0: [{ type: 'field_dropdown', name: 'OP', options: [['較大值 max', 'max'], ['較小值 min', 'min']] }, vin('A', 'Number'), vin('B', 'Number')],
      inputsInline: true, output: 'Number', colour: 230 },
    (b, g) => [`Math.${b.getFieldValue('OP')}(${v(g, b, 'A', J.NONE, '0')}, ${v(g, b, 'B', J.NONE, '0')})`, J.CALL],
    (b, g) => [`${b.getFieldValue('OP')}(${v(g, b, 'A', P.NONE, '0')}, ${v(g, b, 'B', P.NONE, '0')})`, P.CALL]
  );
  def(
    { type: 'math_intdiv', message0: '%1 整數除以 %2', args0: [vin('A', 'Number'), vin('B', 'Number')], inputsInline: true, output: 'Number', colour: 230,
      tooltip: '除完捨去小數（向 0 取整）' },
    (b, g) => [`Math.trunc(${v(g, b, 'A', J.MUL, '0')} / ${v(g, b, 'B', J.MUL, '1')})`, J.CALL],
    (b, g) => [`int(${v(g, b, 'A', P.MUL, '0')} / ${v(g, b, 'B', P.MUL, '1')})`, P.CALL]
  );
  const BIT = [['AND &', '&'], ['OR |', '|'], ['XOR ^', '^'], ['左移 <<', '<<'], ['右移 >>', '>>'], ['無號右移 >>>', '>>>']];
  def(
    { type: 'math_bit', message0: '%1 %2 %3', args0: [vin('A', 'Number'), { type: 'field_dropdown', name: 'OP', options: BIT }, vin('B', 'Number')],
      inputsInline: true, output: 'Number', colour: 230, tooltip: '位元運算。>>> 是「無號」右移：左邊補 0（Java / JS 才有）' },
    (b, g) => [`(${v(g, b, 'A', J.NONE, '0')} ${b.getFieldValue('OP')} ${v(g, b, 'B', J.NONE, '0')})`, J.ATOMIC],
    (b, g) => [`(${v(g, b, 'A', P.NONE, '0')} ${b.getFieldValue('OP') === '>>>' ? '>>' : b.getFieldValue('OP')} ${v(g, b, 'B', P.NONE, '0')})`, P.ATOMIC]
  );
  def(
    { type: 'random_int', message0: '0 到 %1 (不含) 的隨機整數', args0: [vin('N', 'Number')], output: 'Number', colour: 230 },
    (b, g) => [`Math.floor(Math.random() * ${v(g, b, 'N', J.MUL, '1')})`, J.CALL],
    (b, g) => { g.definitions_.import_random = 'import random'; return [`random.randrange(${v(g, b, 'N', P.NONE, '1')})`, P.CALL]; }
  );
  def(
    { type: 'to_number', message0: '把 %1 轉成數字', args0: [vin('X')], output: 'Number', colour: 230 },
    (b, g) => [`Number(${v(g, b, 'X', J.NONE, '0')})`, J.CALL],
    (b, g) => [`int(${v(g, b, 'X', P.NONE, '0')})`, P.CALL]
  );

  // ---------- 清單 / 陣列 / 字串 ----------
  const LIST_C = 260;
  def({ type: 'arr_new_empty', message0: '空清單 [ ]', output: 'Array', colour: LIST_C }, () => ['[]', J.ATOMIC], () => ['[]', P.ATOMIC]);
  def(
    { type: 'arr_new_fill', message0: '長度 %1 的清單，每格放 %2', args0: [vin('N', 'Number'), vin('V')], inputsInline: true, output: 'Array', colour: LIST_C },
    (b, g) => [`Array.from({length: ${v(g, b, 'N', J.NONE, '0')}}, () => ${v(g, b, 'V', J.ASSIGN, '0')})`, J.CALL],
    (b, g) => [`[${v(g, b, 'V', P.NONE, '0')} for _ in range(${v(g, b, 'N', P.NONE, '0')})]`, P.ATOMIC]
  );
  def(
    { type: 'arr_new_2d', message0: '%1 列 × %2 行的二維清單，每格放 %3', args0: [vin('M', 'Number'), vin('N', 'Number'), vin('V')], inputsInline: true, output: 'Array', colour: LIST_C },
    (b, g) => [`Array.from({length: ${v(g, b, 'M', J.NONE, '0')}}, () => Array.from({length: ${v(g, b, 'N', J.NONE, '0')}}, () => ${v(g, b, 'V', J.ASSIGN, '0')}))`, J.CALL],
    (b, g) => [`[[${v(g, b, 'V', P.NONE, '0')} for _ in range(${v(g, b, 'N', P.NONE, '0')})] for _ in range(${v(g, b, 'M', P.NONE, '0')})]`, P.ATOMIC]
  );
  def(
    { type: 'arr_get', message0: '%1 [ %2 ]', args0: [vin('ARR'), vin('IDX', 'Number')], inputsInline: true, output: null, colour: LIST_C,
      tooltip: '取出第 i 格（從 0 開始數）；字串也適用' },
    (b, g) => [`${v(g, b, 'ARR', J.MEMBER)}[${v(g, b, 'IDX', J.NONE, '0')}]`, J.MEMBER],
    (b, g) => [`${v(g, b, 'ARR', P.MEMBER)}[${v(g, b, 'IDX', P.NONE, '0')}]`, P.MEMBER]
  );
  def(
    { type: 'arr_set', message0: '設定 %1 [ %2 ] = %3', args0: [vin('ARR'), vin('IDX', 'Number'), vin('V')], inputsInline: true, ...STMT, colour: LIST_C },
    (b, g) => `${v(g, b, 'ARR', J.MEMBER)}[${v(g, b, 'IDX', J.NONE, '0')}] = ${v(g, b, 'V', J.ASSIGN)};\n`,
    (b, g) => `${v(g, b, 'ARR', P.MEMBER)}[${v(g, b, 'IDX', P.NONE, '0')}] = ${v(g, b, 'V', P.NONE)}\n`
  );
  def(
    { type: 'arr_len', message0: '%1 的長度', args0: [vin('ARR')], output: 'Number', colour: LIST_C, tooltip: '清單或字串的長度' },
    (b, g) => [`${v(g, b, 'ARR', J.MEMBER, '[]')}.length`, J.MEMBER],
    (b, g) => [`len(${v(g, b, 'ARR', P.NONE, '[]')})`, P.CALL]
  );
  def(
    { type: 'arr_is_empty', message0: '%1 是空的嗎', args0: [vin('ARR')], output: 'Boolean', colour: LIST_C },
    (b, g) => [`(${v(g, b, 'ARR', J.MEMBER, '[]')}.length === 0)`, J.ATOMIC],
    (b, g) => [`len(${v(g, b, 'ARR', P.NONE, '[]')}) == 0`, P.REL]
  );
  def(
    { type: 'arr_push', message0: '把 %1 加到 %2 的尾端', args0: [vin('V'), vin('ARR')], inputsInline: true, ...STMT, colour: LIST_C, tooltip: 'push / append（堆疊的「放入」）' },
    (b, g) => `${v(g, b, 'ARR', J.MEMBER, '[]')}.push(${v(g, b, 'V', J.NONE)});\n`,
    (b, g) => `${v(g, b, 'ARR', P.MEMBER, '[]')}.append(${v(g, b, 'V', P.NONE)})\n`
  );
  def(
    { type: 'arr_pop', message0: '取出並移除 %1 的%2', args0: [vin('ARR'), { type: 'field_dropdown', name: 'END', options: [['最後一個', 'last'], ['第一個', 'first']] }],
      inputsInline: true, output: null, colour: LIST_C, tooltip: '最後一個 = 堆疊 pop；第一個 = 佇列 dequeue' },
    (b, g) => [`${v(g, b, 'ARR', J.MEMBER, '[]')}.${b.getFieldValue('END') === 'last' ? 'pop()' : 'shift()'}`, J.CALL],
    (b, g) => [`${v(g, b, 'ARR', P.MEMBER, '[]')}.${b.getFieldValue('END') === 'last' ? 'pop()' : 'pop(0)'}`, P.CALL]
  );
  def(
    { type: 'arr_pop_stmt', message0: '移除 %1 的%2', args0: [vin('ARR'), { type: 'field_dropdown', name: 'END', options: [['最後一個', 'last'], ['第一個', 'first']] }],
      inputsInline: true, ...STMT, colour: LIST_C },
    (b, g) => `${v(g, b, 'ARR', J.MEMBER, '[]')}.${b.getFieldValue('END') === 'last' ? 'pop()' : 'shift()'};\n`,
    (b, g) => `${v(g, b, 'ARR', P.MEMBER, '[]')}.${b.getFieldValue('END') === 'last' ? 'pop()' : 'pop(0)'}\n`
  );
  def(
    { type: 'arr_last', message0: '%1 的最後一個', args0: [vin('ARR')], output: null, colour: LIST_C, tooltip: '偷看堆疊頂端（不移除）' },
    (b, g) => { const a = v(g, b, 'ARR', J.MEMBER, '[]'); return [`${a}[${a}.length - 1]`, J.MEMBER]; },
    (b, g) => [`${v(g, b, 'ARR', P.MEMBER, '[]')}[-1]`, P.MEMBER]
  );
  def(
    { type: 'arr_sort', message0: '把 %1 由小到大排序', args0: [vin('ARR', 'Array')], ...STMT, colour: LIST_C },
    (b, g) => `${v(g, b, 'ARR', J.MEMBER, '[]')}.sort(__cmp);\n`,
    (b, g) => `${v(g, b, 'ARR', P.MEMBER, '[]')}.sort()\n`
  );
  def(
    { type: 'arr_sort_by', message0: '把 %1 依每個元素的第 %2 項由小到大排序', args0: [vin('ARR', 'Array'), vin('K', 'Number')], inputsInline: true, ...STMT, colour: LIST_C,
      tooltip: '例如區間 [[1,3],[2,6]] 依第 1 項（結尾）排序' },
    (b, g) => { const k = v(g, b, 'K', J.NONE, '0'); return `${v(g, b, 'ARR', J.MEMBER, '[]')}.sort((x, y) => __cmp(x[${k}], y[${k}]));\n`; },
    (b, g) => `${v(g, b, 'ARR', P.MEMBER, '[]')}.sort(key=lambda e: e[${v(g, b, 'K', P.NONE, '0')}])\n`
  );
  def(
    { type: 'arr_reverse', message0: '把 %1 反轉', args0: [vin('ARR', 'Array')], ...STMT, colour: LIST_C },
    (b, g) => `${v(g, b, 'ARR', J.MEMBER, '[]')}.reverse();\n`,
    (b, g) => `${v(g, b, 'ARR', P.MEMBER, '[]')}.reverse()\n`
  );
  def(
    { type: 'arr_copy', message0: '%1 的複本', args0: [vin('ARR')], output: 'Array', colour: LIST_C,
      tooltip: '回溯法把目前路徑存進答案時，要存「複本」，不然之後修改路徑會連答案一起改到' },
    (b, g) => [`${v(g, b, 'ARR', J.MEMBER, '[]')}.slice()`, J.CALL],
    (b, g) => [`list(${v(g, b, 'ARR', P.NONE, '[]')})`, P.CALL]
  );
  def(
    { type: 'arr_insert', message0: '在 %1 的第 %2 格插入 %3', args0: [vin('ARR'), vin('IDX', 'Number'), vin('V')], inputsInline: true, ...STMT, colour: LIST_C },
    (b, g) => `${v(g, b, 'ARR', J.MEMBER, '[]')}.splice(${v(g, b, 'IDX', J.NONE, '0')}, 0, ${v(g, b, 'V', J.NONE)});\n`,
    (b, g) => `${v(g, b, 'ARR', P.MEMBER, '[]')}.insert(${v(g, b, 'IDX', P.NONE, '0')}, ${v(g, b, 'V', P.NONE)})\n`
  );
  def(
    { type: 'str_slice', message0: '%1 從 %2 到 %3 (不含) 的片段', args0: [vin('ARR'), vin('S', 'Number'), vin('E', 'Number')], inputsInline: true, output: null, colour: LIST_C,
      tooltip: '子字串 / 子清單，含頭不含尾' },
    (b, g) => [`${v(g, b, 'ARR', J.MEMBER, '[]')}.slice(${v(g, b, 'S', J.NONE, '0')}, ${v(g, b, 'E', J.NONE, '0')})`, J.CALL],
    (b, g) => [`${v(g, b, 'ARR', P.MEMBER, '[]')}[${v(g, b, 'S', P.NONE, '0')}:${v(g, b, 'E', P.NONE, '0')}]`, P.MEMBER]
  );

  const STR_C = 160;
  def(
    { type: 'str_lower', message0: '%1 轉小寫', args0: [vin('S', 'String')], output: 'String', colour: STR_C },
    (b, g) => [`${v(g, b, 'S', J.MEMBER, "''")}.toLowerCase()`, J.CALL],
    (b, g) => [`${v(g, b, 'S', P.MEMBER, "''")}.lower()`, P.CALL]
  );
  def(
    { type: 'is_alnum', message0: '%1 是英文字母或數字', args0: [vin('C', 'String')], output: 'Boolean', colour: STR_C },
    (b, g) => [`/^[a-z0-9]$/i.test(${v(g, b, 'C', J.NONE, "''")})`, J.CALL],
    (b, g) => [`${v(g, b, 'C', P.MEMBER, "''")}.isalnum()`, P.CALL]
  );
  def(
    { type: 'str_sort_chars', message0: '把 %1 的字元排序後的字串', args0: [vin('S', 'String')], output: 'String', colour: STR_C, tooltip: '例如 "eat" → "aet"' },
    (b, g) => [`${v(g, b, 'S', J.MEMBER, "''")}.split('').sort().join('')`, J.CALL],
    (b, g) => [`''.join(sorted(${v(g, b, 'S', P.NONE, "''")}))`, P.CALL]
  );
  def(
    { type: 'str_concat', message0: '%1 接上 %2', args0: [vin('A'), vin('B')], inputsInline: true, output: 'String', colour: STR_C },
    (b, g) => [`(String(${v(g, b, 'A', J.NONE, "''")}) + String(${v(g, b, 'B', J.NONE, "''")}))`, J.ATOMIC],
    (b, g) => [`(str(${v(g, b, 'A', P.NONE, "''")}) + str(${v(g, b, 'B', P.NONE, "''")}))`, P.ATOMIC]
  );
  const CODE_OPTS = [["數字值 (c - '0')", 'digit'], ["字母序 (c - 'a')", 'letter'], ['字元碼 (ASCII)', 'code']];
  def(
    { type: 'char_code', message0: '字元 %1 的 %2', args0: [vin('C'), { type: 'field_dropdown', name: 'WHAT', options: CODE_OPTS }], inputsInline: true, output: 'Number', colour: STR_C,
      tooltip: "'7' 的數字值是 7；'c' 的字母序是 2（a 是 0）" },
    (b, g) => {
      const c = v(g, b, 'C', J.MEMBER, "''"), w = b.getFieldValue('WHAT');
      return w === 'code' ? [`${c}.charCodeAt(0)`, J.CALL] : [`(${c}.charCodeAt(0) - ${w === 'digit' ? 48 : 97})`, J.ATOMIC];
    },
    (b, g) => {
      const c = v(g, b, 'C', P.NONE, "''"), w = b.getFieldValue('WHAT');
      return w === 'digit' ? [`int(${c})`, P.CALL] : w === 'letter' ? [`(ord(${c}) - ord('a'))`, P.ATOMIC] : [`ord(${c})`, P.CALL];
    }
  );
  def(
    { type: 'char_from', message0: '第 %1 個%2', args0: [vin('N', 'Number'), { type: 'field_dropdown', name: 'WHAT', options: [['小寫字母 (0 → a)', 'letter'], ['數字字元 (0 → \'0\')', 'digit']] }],
      inputsInline: true, output: 'String', colour: STR_C },
    (b, g) => [`String.fromCharCode(${b.getFieldValue('WHAT') === 'letter' ? 97 : 48} + ${v(g, b, 'N', J.ADD, '0')})`, J.CALL],
    (b, g) => [b.getFieldValue('WHAT') === 'letter' ? `chr(ord('a') + ${v(g, b, 'N', P.ADD, '0')})` : `str(${v(g, b, 'N', P.NONE, '0')})`, P.CALL]
  );
  def(
    { type: 'str_split', message0: '把 %1 依 %2 切開 (略過空字串)', args0: [vin('S'), vin('SEP')], inputsInline: true, output: 'Array', colour: STR_C,
      tooltip: '例如 "a  b" 依 " " 切開 → ["a", "b"]' },
    (b, g) => [`${v(g, b, 'S', J.MEMBER, "''")}.split(${v(g, b, 'SEP', J.NONE, "' '")}).filter((w) => w !== '')`, J.CALL],
    (b, g) => {
      const sb = b.getInputTargetBlock('SEP');
      const s = v(g, b, 'S', P.MEMBER, "''");
      if (sb && sb.type === 'text' && sb.getFieldValue('TEXT') === ' ') return [`${s}.split()`, P.CALL];
      return [`[w for w in ${s}.split(${v(g, b, 'SEP', P.NONE, "' '")}) if w]`, P.ATOMIC];
    }
  );
  def(
    { type: 'str_join', message0: '用 %2 把 %1 接成字串', args0: [vin('ARR'), vin('SEP')], inputsInline: true, output: 'String', colour: STR_C },
    (b, g) => [`${v(g, b, 'ARR', J.MEMBER, '[]')}.join(${v(g, b, 'SEP', J.NONE, "''")})`, J.CALL],
    (b, g) => [`${v(g, b, 'SEP', P.MEMBER, "''")}.join(${v(g, b, 'ARR', P.NONE, '[]')})`, P.CALL]
  );
  def(
    { type: 'str_repeat', message0: '%1 重複 %2 次', args0: [vin('S'), vin('N', 'Number')], inputsInline: true, output: 'String', colour: STR_C },
    (b, g) => [`${v(g, b, 'S', J.MEMBER, "''")}.repeat(${v(g, b, 'N', J.NONE, '0')})`, J.CALL],
    (b, g) => [`(${v(g, b, 'S', P.MUL, "''")} * ${v(g, b, 'N', P.MUL, '0')})`, P.ATOMIC]
  );

  // ---------- 雜湊表（字典） ----------
  const MAP_C = 30;
  def({ type: 'map_new', message0: '新的空字典 { }', output: 'Map', colour: MAP_C, tooltip: 'Hash Map：用「鍵」快速找到「值」' },
    () => ['new Map()', J.ATOMIC], () => ['{}', P.ATOMIC]);
  def(
    { type: 'map_set', message0: '在字典 %1 記下 鍵 %2 → 值 %3', args0: [vin('M'), vin('K'), vin('V')], inputsInline: true, ...STMT, colour: MAP_C },
    (b, g) => `${v(g, b, 'M', J.MEMBER)}.set(${v(g, b, 'K', J.NONE)}, ${v(g, b, 'V', J.NONE)});\n`,
    (b, g) => `${v(g, b, 'M', P.MEMBER)}[${v(g, b, 'K', P.NONE)}] = ${v(g, b, 'V', P.NONE)}\n`
  );
  def(
    { type: 'map_get', message0: '字典 %1 中 鍵 %2 的值', args0: [vin('M'), vin('K')], inputsInline: true, output: null, colour: MAP_C },
    (b, g) => [`${v(g, b, 'M', J.MEMBER)}.get(${v(g, b, 'K', J.NONE)})`, J.CALL],
    (b, g) => [`${v(g, b, 'M', P.MEMBER)}[${v(g, b, 'K', P.NONE)}]`, P.MEMBER]
  );
  def(
    { type: 'map_get_default', message0: '字典 %1 中 鍵 %2 的值，沒有就用 %3', args0: [vin('M'), vin('K'), vin('D')], inputsInline: true, output: null, colour: MAP_C,
      tooltip: '計數時很好用：count[x] = (沒有就 0) + 1' },
    (b, g) => { const m = v(g, b, 'M', J.MEMBER), k = v(g, b, 'K', J.NONE); return [`(${m}.has(${k}) ? ${m}.get(${k}) : ${v(g, b, 'D', J.NONE, '0')})`, J.ATOMIC]; },
    (b, g) => [`${v(g, b, 'M', P.MEMBER)}.get(${v(g, b, 'K', P.NONE)}, ${v(g, b, 'D', P.NONE, '0')})`, P.CALL]
  );
  def(
    { type: 'map_has', message0: '字典 %1 有 鍵 %2 嗎', args0: [vin('M'), vin('K')], inputsInline: true, output: 'Boolean', colour: MAP_C },
    (b, g) => [`${v(g, b, 'M', J.MEMBER)}.has(${v(g, b, 'K', J.NONE)})`, J.CALL],
    (b, g) => [`${v(g, b, 'K', P.REL)} in ${v(g, b, 'M', P.REL)}`, P.REL]
  );
  def(
    { type: 'map_delete', message0: '從字典 %1 刪除 鍵 %2', args0: [vin('M'), vin('K')], inputsInline: true, ...STMT, colour: MAP_C },
    (b, g) => `${v(g, b, 'M', J.MEMBER)}.delete(${v(g, b, 'K', J.NONE)});\n`,
    (b, g) => `del ${v(g, b, 'M', P.MEMBER)}[${v(g, b, 'K', P.NONE)}]\n`
  );
  def(
    { type: 'map_size', message0: '字典 %1 的大小', args0: [vin('M')], output: 'Number', colour: MAP_C },
    (b, g) => [`${v(g, b, 'M', J.MEMBER)}.size`, J.MEMBER],
    (b, g) => [`len(${v(g, b, 'M', P.NONE)})`, P.CALL]
  );
  def(
    { type: 'map_list', message0: '字典 %1 的所有 %2 (清單)', args0: [vin('M'), { type: 'field_dropdown', name: 'WHAT', options: [['鍵', 'keys'], ['值', 'values']] }],
      inputsInline: true, output: 'Array', colour: MAP_C },
    (b, g) => [`Array.from(${v(g, b, 'M', J.MEMBER)}.${b.getFieldValue('WHAT')}())`, J.CALL],
    (b, g) => [`list(${v(g, b, 'M', P.MEMBER)}.${b.getFieldValue('WHAT')}())`, P.CALL]
  );

  // ---------- 集合 ----------
  const SET_C = 50;
  def({ type: 'set_new', message0: '新的空集合', output: 'Set', colour: SET_C, tooltip: 'Hash Set：快速判斷「看過沒」' },
    () => ['new Set()', J.ATOMIC], () => ['set()', P.CALL]);
  def(
    { type: 'set_from', message0: '用 %1 建立集合', args0: [vin('L')], output: 'Set', colour: SET_C },
    (b, g) => [`new Set(${v(g, b, 'L', J.NONE, '[]')})`, J.CALL],
    (b, g) => [`set(${v(g, b, 'L', P.NONE, '[]')})`, P.CALL]
  );
  def(
    { type: 'set_add', message0: '把 %1 放進集合 %2', args0: [vin('V'), vin('S')], inputsInline: true, ...STMT, colour: SET_C },
    (b, g) => `${v(g, b, 'S', J.MEMBER)}.add(${v(g, b, 'V', J.NONE)});\n`,
    (b, g) => `${v(g, b, 'S', P.MEMBER)}.add(${v(g, b, 'V', P.NONE)})\n`
  );
  def(
    { type: 'set_has', message0: '集合 %1 裡有 %2 嗎', args0: [vin('S'), vin('V')], inputsInline: true, output: 'Boolean', colour: SET_C },
    (b, g) => [`${v(g, b, 'S', J.MEMBER)}.has(${v(g, b, 'V', J.NONE)})`, J.CALL],
    (b, g) => [`${v(g, b, 'V', P.REL)} in ${v(g, b, 'S', P.REL)}`, P.REL]
  );
  def(
    { type: 'set_delete', message0: '從集合 %1 移除 %2', args0: [vin('S'), vin('V')], inputsInline: true, ...STMT, colour: SET_C },
    (b, g) => `${v(g, b, 'S', J.MEMBER)}.delete(${v(g, b, 'V', J.NONE)});\n`,
    (b, g) => `${v(g, b, 'S', P.MEMBER)}.discard(${v(g, b, 'V', P.NONE)})\n`
  );
  def(
    { type: 'set_size', message0: '集合 %1 的大小', args0: [vin('S')], output: 'Number', colour: SET_C },
    (b, g) => [`${v(g, b, 'S', J.MEMBER)}.size`, J.MEMBER],
    (b, g) => [`len(${v(g, b, 'S', P.NONE)})`, P.CALL]
  );

  // ---------- 節點（鏈結串列 / 二元樹） ----------
  const NODE_C = 290;
  const FIELDS = [['val (值)', 'val'], ['next (下一個)', 'next'], ['left (左子)', 'left'], ['right (右子)', 'right'],
    ['random (隨機指標)', 'random'], ['neighbors (鄰居清單)', 'neighbors'], ['children (子節點字典)', 'children'], ['isEnd (單字結尾)', 'isEnd'],
    ['key (鍵)', 'key'], ['prev (上一個)', 'prev'], ['isLeaf (是葉子)', 'isLeaf'],
    ['topLeft (左上)', 'topLeft'], ['topRight (右上)', 'topRight'], ['bottomLeft (左下)', 'bottomLeft'], ['bottomRight (右下)', 'bottomRight']];
  const KINDS = [['串列節點', 'ListNode'], ['樹節點', 'TreeNode'], ['字典樹節點', 'TrieNode'], ['雙向串列節點', 'DListNode'],
    ['圖節點', 'GraphNode'], ['隨機指標串列節點', 'RandomNode'], ['有 next 的樹節點', 'NextNode'], ['四分樹節點', 'QuadNode']];
  // Python / C++ / Java 上的類別名稱（LeetCode 把好幾種都叫 Node）
  const KIND_CLASS = { ListNode: 'ListNode', TreeNode: 'TreeNode', TrieNode: 'TrieNode', DListNode: 'DListNode', GraphNode: 'Node', RandomNode: 'Node', NextNode: 'Node', QuadNode: 'Node' };
  def(
    { type: 'node_get', message0: '%1 的 %2', args0: [vin('N'), { type: 'field_dropdown', name: 'F', options: FIELDS }], inputsInline: true, output: null, colour: NODE_C },
    (b, g) => [`${v(g, b, 'N', J.MEMBER)}.${b.getFieldValue('F')}`, J.MEMBER],
    (b, g) => [`${v(g, b, 'N', P.MEMBER)}.${b.getFieldValue('F')}`, P.MEMBER]
  );
  def(
    { type: 'node_set', message0: '設定 %1 的 %2 = %3', args0: [vin('N'), { type: 'field_dropdown', name: 'F', options: FIELDS }, vin('V')], inputsInline: true, ...STMT, colour: NODE_C },
    (b, g) => `${v(g, b, 'N', J.MEMBER)}.${b.getFieldValue('F')} = ${v(g, b, 'V', J.ASSIGN)};\n`,
    (b, g) => `${v(g, b, 'N', P.MEMBER)}.${b.getFieldValue('F')} = ${v(g, b, 'V', P.NONE)}\n`
  );
  def(
    { type: 'node_new', message0: '新的%1，值 = %2', args0: [{ type: 'field_dropdown', name: 'KIND', options: KINDS }, vin('V')],
      inputsInline: true, output: null, colour: NODE_C, tooltip: '字典樹節點不需要值，隨便放一個就好' },
    (b, g) => [`new Node(${v(g, b, 'V', J.NONE, '0')})`, J.CALL],
    (b, g) => {
      const k = b.getFieldValue('KIND');
      return [k === 'TrieNode' ? 'TrieNode()' : `${KIND_CLASS[k]}(${v(g, b, 'V', P.NONE, '0')})`, P.CALL];
    }
  );

  // ---------- 堆積（優先佇列） ----------
  const HEAP_C = 15;
  const isMaxHeap = (b) => {
    const h = b.getInputTargetBlock('H');
    return !!(h && h.type === 'variables_get' && LBT.maxHeapVars && LBT.maxHeapVars.has(h.getFieldValue('VAR')));
  };
  def(
    { type: 'heap_new', message0: '新的%1堆積', args0: [{ type: 'field_dropdown', name: 'KIND', options: [['最小', 'min'], ['最大', 'max']] }], output: 'Heap', colour: HEAP_C,
      tooltip: '最小堆積：頂端永遠是最小的元素。元素也可以是清單 [優先度, 資料...]，會從第 0 項開始比' },
    (b) => [`new Heap(${b.getFieldValue('KIND') === 'min'})`, J.CALL],
    () => ['[]', P.ATOMIC]
  );
  def(
    { type: 'heap_push', message0: '把 %1 放進堆積 %2', args0: [vin('V'), vin('H')], inputsInline: true, ...STMT, colour: HEAP_C },
    (b, g) => `${v(g, b, 'H', J.MEMBER)}.push(${v(g, b, 'V', J.NONE)});\n`,
    (b, g) => { g.definitions_.import_heapq = 'import heapq'; return `heapq.heappush${isMaxHeap(b) ? '_max' : ''}(${v(g, b, 'H', P.NONE)}, ${v(g, b, 'V', P.NONE)})\n`; }
  );
  def(
    { type: 'heap_pop', message0: '取出堆積 %1 的頂端', args0: [vin('H')], output: null, colour: HEAP_C },
    (b, g) => [`${v(g, b, 'H', J.MEMBER)}.pop()`, J.CALL],
    (b, g) => { g.definitions_.import_heapq = 'import heapq'; return [`heapq.heappop${isMaxHeap(b) ? '_max' : ''}(${v(g, b, 'H', P.NONE)})`, P.CALL]; }
  );
  def(
    { type: 'heap_pop_stmt', message0: '移除堆積 %1 的頂端', args0: [vin('H')], ...STMT, colour: HEAP_C },
    (b, g) => `${v(g, b, 'H', J.MEMBER)}.pop();\n`,
    (b, g) => { g.definitions_.import_heapq = 'import heapq'; return `heapq.heappop${isMaxHeap(b) ? '_max' : ''}(${v(g, b, 'H', P.NONE)})\n`; }
  );
  def(
    { type: 'heap_peek', message0: '堆積 %1 的頂端', args0: [vin('H')], output: null, colour: HEAP_C },
    (b, g) => [`${v(g, b, 'H', J.MEMBER)}.peek()`, J.CALL],
    (b, g) => [`${v(g, b, 'H', P.MEMBER)}[0]`, P.MEMBER]
  );
  def(
    { type: 'heap_size', message0: '堆積 %1 的大小', args0: [vin('H')], output: 'Number', colour: HEAP_C },
    (b, g) => [`${v(g, b, 'H', J.MEMBER)}.size()`, J.CALL],
    (b, g) => [`len(${v(g, b, 'H', P.NONE)})`, P.CALL]
  );

  Blockly.defineBlocksWithJsonArray(defs);

  // 讓「跳出 / 繼續」積木認得自訂的迴圈，否則放進去會被停用
  const loopTypes = Blockly.libraryBlocks && Blockly.libraryBlocks.loops && Blockly.libraryBlocks.loops.loopTypes;
  if (loopTypes) { loopTypes.add('for_range'); loopTypes.add('for_each'); }

  // 內建的「變數 加上」積木改成單純的 +=
  const change = (name, d) => (/^-\d/.test(d) ? `${name} -= ${d.slice(1)}` : `${name} += ${d}`);
  setGen(JS, 'math_change', (b, g) => change(varName(g, b), v(g, b, 'DELTA', J.ASSIGN, '0')) + ';\n');
  setGen(PY, 'math_change', (b, g) => change(varName(g, b), v(g, b, 'DELTA', P.NONE, '0')) + '\n');

  // ---------- 函式（遞迴）內的變數：只要在函式裡「設定」過就是區域變數 ----------
  // 跟 Python 的規則一樣，避免遞迴時互相覆蓋。
  const ASSIGNING = ['variables_set', 'math_change', 'for_range', 'for_each'];
  // 函式外層的名字：一般題是解題函式的參數；設計題是類別欄位
  const outerNames = () => {
    const p = LBT.current;
    if (!p) return new Set();
    if (p.design) return LBT.fieldSet || new Set();
    return new Set(p.params);
  };
  ['procedures_defreturn', 'procedures_defnoreturn'].forEach((type) => {
    const orig = JS.forBlock[type];
    JS.forBlock[type] = function (b, g) {
      const before = Object.assign({}, g.definitions_);
      const res = orig.call(this, b, g);
      const params = new Set(b.getVars().map((n) => g.getVariableName(n)));
      const locals = new Set();
      b.getDescendants(false).forEach((d) => {
        if (ASSIGNING.includes(d.type)) {
          const name = g.getVariableName(d.getFieldValue('VAR'));
          if (!params.has(name) && !outerNames().has(name)) locals.add(name);
        }
      });
      if (locals.size) {
        for (const key of Object.keys(g.definitions_)) {
          if (key[0] === '%' && g.definitions_[key] !== before[key]) {
            g.definitions_[key] = g.definitions_[key].replace(') {\n', `) {\n${g.INDENT}var ${[...locals].join(', ')};\n`);
          }
        }
      }
      return res;
    };
  });

  // ---------- 工具箱 ----------
  const num = (n) => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
  const blk = (type, extra) => ({ kind: 'block', type, ...(extra || {}) });
  const toolbox = {
    kind: 'categoryToolbox',
    contents: [
      { kind: 'category', name: '⭐ 回傳 / 印出', colour: '0', contents: [blk('ret_value'), blk('print')] },
      { kind: 'category', name: '🔁 迴圈', colour: '120', contents: [
        blk('controls_repeat_ext', { inputs: { TIMES: num(10) } }),
        blk('for_range', { inputs: { FROM: num(0), TO: num(10), STEP: num(1) } }),
        blk('for_each'),
        blk('controls_whileUntil'),
        blk('controls_flow_statements'),
      ] },
      { kind: 'category', name: '🔀 判斷', colour: '210', contents: [
        blk('controls_if'),
        blk('controls_if', { extraState: { hasElse: true } }),
        blk('controls_if', { extraState: { elseIfCount: 1, hasElse: true } }),
        blk('logic_compare'), blk('logic_operation'), blk('logic_negate'),
        blk('logic_boolean'), blk('logic_null'), blk('is_null'), blk('logic_ternary'),
      ] },
      { kind: 'category', name: '🔢 數學', colour: '230', contents: [
        blk('math_number', { fields: { NUM: 0 } }),
        blk('math_arithmetic', { inputs: { A: num(1), B: num(1) } }),
        blk('math_modulo', { inputs: { DIVIDEND: num(10), DIVISOR: num(2) } }),
        blk('math_intdiv', { inputs: { A: num(7), B: num(2) } }),
        blk('math_minmax'),
        blk('math_single', { fields: { OP: 'ABS' } }),
        blk('math_constant', { fields: { CONSTANT: 'INFINITY' } }),
        blk('math_bit'),
        blk('to_number'),
        blk('random_int', { inputs: { N: num(10) } }),
      ] },
      { kind: 'category', name: '📦 變數', colour: '330', custom: 'VARIABLE' },
      { kind: 'category', name: '📋 清單', colour: String(LIST_C), contents: [
        blk('arr_new_empty'), blk('lists_create_with'),
        blk('arr_new_fill', { inputs: { N: num(5), V: num(0) } }),
        blk('arr_new_2d', { inputs: { M: num(3), N: num(3), V: num(0) } }),
        blk('arr_get', { inputs: { IDX: num(0) } }),
        blk('arr_set', { inputs: { IDX: num(0) } }),
        blk('arr_len'), blk('arr_is_empty'),
        blk('arr_push'), blk('arr_pop'), blk('arr_pop_stmt'), blk('arr_last'),
        blk('arr_sort'),
        blk('arr_sort_by', { inputs: { K: num(0) } }),
        blk('arr_reverse'), blk('arr_copy'),
        blk('arr_insert', { inputs: { IDX: num(0) } }),
        blk('str_slice', { inputs: { S: num(0), E: num(1) } }),
      ] },
      { kind: 'category', name: '🔤 字串', colour: String(STR_C), contents: [
        blk('text'), blk('str_concat'), blk('str_lower'), blk('is_alnum'), blk('str_sort_chars'),
        blk('char_code'), blk('char_from', { inputs: { N: num(0) } }),
        blk('str_split', { inputs: { SEP: { shadow: { type: 'text', fields: { TEXT: ' ' } } } } }),
        blk('str_join', { inputs: { SEP: { shadow: { type: 'text', fields: { TEXT: ',' } } } } }),
        blk('str_repeat', { inputs: { N: num(2) } }),
        blk('str_slice', { inputs: { S: num(0), E: num(1) } }),
        blk('arr_get', { inputs: { IDX: num(0) } }), blk('arr_len'),
      ] },
      { kind: 'category', name: '🗂️ 字典', colour: String(MAP_C), contents: [
        blk('map_new'), blk('map_set'), blk('map_get'), blk('map_get_default', { inputs: { D: num(0) } }),
        blk('map_has'), blk('map_delete'), blk('map_size'), blk('map_list'),
      ] },
      { kind: 'category', name: '🎯 集合', colour: String(SET_C), contents: [
        blk('set_new'), blk('set_from'), blk('set_add'), blk('set_has'), blk('set_delete'), blk('set_size'),
      ] },
      { kind: 'category', name: '⛰️ 堆積', colour: String(HEAP_C), contents: [
        blk('heap_new'), blk('heap_push'), blk('heap_pop'), blk('heap_pop_stmt'), blk('heap_peek'), blk('heap_size'),
      ] },
      { kind: 'category', name: '🔗 節點', colour: String(NODE_C), contents: [
        blk('node_get'), blk('node_set'), blk('node_new', { inputs: { V: num(0) } }), blk('logic_null'), blk('is_null'),
      ] },
      { kind: 'category', name: '⚙️ 函式 (遞迴)', colour: '290', custom: 'PROCEDURE' },
    ],
  };

  // ---------- 產生程式碼 ----------
  function indent(code, pad) {
    return code.split('\n').map((l) => (l ? pad + l : l)).join('\n');
  }
  function buildJS(ws) {
    return JS.workspaceToCode(ws);
  }
  function previewJS(ws, p) {
    const code = buildJS(ws).split('\n')
      .filter((l) => !l.includes('__guard()'))
      .map((l) => {
        const m = /^var (.*);$/.exec(l);
        if (!m) return l;
        const rest = m[1].split(', ').filter((x) => !p.params.includes(x));
        return rest.length ? `var ${rest.join(', ')};` : null;
      })
      .filter((l) => l !== null)
      .join('\n').replace(/\n{3,}/g, '\n\n').trim();
    return `function ${p.fn}(${p.params.join(', ')}) {\n${indent(code, '  ')}\n}\n`;
  }
  function previewPython(ws, p) {
    LBT.maxHeapVars = maxHeapVars(ws);
    if (p.design) return previewDesignPython(ws, p);
    const raw = PY.workspaceToCode(ws);
    const [pre, body = ''] = raw.split('#__SOLUTION__\n');
    const lines = pre.split('\n').filter((l) => !/^\w+ = None$/.test(l) && !/^\s*global /.test(l));
    const imports = lines.filter((l) => /^(import|from) /.test(l));
    const helpers = lines.filter((l) => !/^(import|from) /.test(l)).join('\n').trim();
    let out = imports.length ? imports.join('\n') + '\n\n' : '';
    out += `def ${p.fn}(${p.params.join(', ')}):\n`;
    if (helpers) out += indent(helpers, PY.INDENT) + '\n\n';
    out += body.trim() ? body.replace(/\s+$/, '') + '\n' : PY.INDENT + 'pass\n';
    return out;
  }

  // ---------- 設計題（類別） ----------
  const methodRoots = (ws) => ws.getTopBlocks(true).filter((b) => b.type === 'method_root' && b.isEnabled());
  // 欄位 = 建構子裡用到的變數，或在兩個以上方法出現、而且至少有一個方法只讀不寫的變數
  // （每個方法都會先設定再使用的，只是暫存用的區域變數）
  function fieldNames(ws, p) {
    const uses = new Map();
    methodRoots(ws).forEach((r) => {
      const params = (p.design.methods.find((m) => m.name === r.data) || { params: [] }).params;
      const refs = new Set(), assigned = new Set();
      r.getDescendants(false).forEach((d) => {
        if (!d.getField('VAR')) return;
        const vv = ws.getVariableById(d.getFieldValue('VAR'));
        if (!vv || params.includes(vv.name)) return;
        refs.add(vv.name);
        if (['variables_set', 'math_change', 'for_range', 'for_each'].includes(d.type)) assigned.add(vv.name);
      });
      refs.forEach((n) => {
        if (!uses.has(n)) uses.set(n, []);
        uses.get(n).push({ ctor: r.data === p.design.cls, assigned: assigned.has(n) });
      });
    });
    // 輔助函式也算一個「使用的地方」（參數除外）
    ws.getTopBlocks(true).forEach((b) => {
      if (!b.isEnabled() || !/^procedures_def/.test(b.type)) return;
      const params = b.getVars();
      const refs = new Set(), assigned = new Set();
      b.getDescendants(false).forEach((d) => {
        if (!d.getField('VAR') || d === b) return;
        const vv = ws.getVariableById(d.getFieldValue('VAR'));
        if (!vv || params.includes(vv.name)) return;
        refs.add(vv.name);
        if (['variables_set', 'math_change', 'for_range', 'for_each'].includes(d.type)) assigned.add(vv.name);
      });
      refs.forEach((n) => {
        if (!uses.has(n)) uses.set(n, []);
        uses.get(n).push({ ctor: false, assigned: assigned.has(n) });
      });
    });
    return new Set([...uses].filter(([, us]) => us.some((u) => u.ctor) || (us.length > 1 && us.some((u) => !u.assigned))).map(([n]) => n));
  }
  function buildDesignJS(ws, p) {
    LBT.fieldSet = fieldNames(ws, p);
    JS.init(ws);
    const roots = methodRoots(ws);
    const parts = p.design.methods.map((m) => {
      const r = roots.find((x) => x.data === m.name);
      const body = r ? JS.blockToCode(r) : '';
      const params = m.params.map((n) => { const vv = ws.getVariable(n); return vv ? JS.getVariableName(vv.getId()) : n; });
      return `${JSON.stringify(m.name)}: function (${params.join(', ')}) {\n${body}\n}`;
    });
    ws.getTopBlocks(true).forEach((b) => { if (b.isEnabled() && /^procedures_def/.test(b.type)) JS.blockToCode(b); });
    return JS.finish('') + '\nreturn {\n' + parts.join(',\n') + '\n};\n';
  }
  function maxHeapVars(ws) {
    const s = new Set();
    ws.getAllBlocks(false).forEach((b) => {
      if (b.type !== 'variables_set') return;
      const val = b.getInputTargetBlock('VALUE');
      if (val && val.type === 'heap_new' && val.getFieldValue('KIND') === 'max') s.add(b.getFieldValue('VAR'));
    });
    return s;
  }
  function previewDesignPython(ws, p) {
    LBT.maxHeapVars = maxHeapVars(ws);
    const fields = fieldNames(ws, p);
    LBT.fieldSet = fields;
    const raw = PY.workspaceToCode(ws);
    const segs = raw.split(/#__METHOD__(\w+)\n/);
    const pre = segs[0].split('\n').filter((l) => !/^\w+ = None$/.test(l) && !/^\s*global /.test(l));
    const imports = pre.filter((l) => /^(import|from) /.test(l));
    const helperCode = pre.filter((l) => !/^(import|from) /.test(l)).join('\n').trim();
    const helperNames = [...helperCode.matchAll(/^def (\w+)\(/gm)].map((m) => m[1]);
    const names = [...fields];
    const helperCall = helperNames.length ? new RegExp('(?<![.\\w])(' + helperNames.join('|') + ')\\(', 'g') : null;
    // 欄位前面加 self.（跳過字串和 a.b 的屬性）
    const fix = (code) => code.split('\n').map((line) => {
      let out = line.replace(/'[^']*'|"[^"]*"|(?<![.\w])([A-Za-z_]\w*)\b/g, (m, id) => (id && names.includes(id) ? 'self.' + id : m));
      if (helperCall) out = out.replace(helperCall, 'self.$1(');
      return out;
    }).join('\n');
    const bodies = {};
    for (let i = 1; i < segs.length; i += 2) bodies[segs[i]] = segs[i + 1] || '';
    let out = imports.length ? imports.join('\n') + '\n\n' : '';
    out += `class ${p.design.cls}:\n`;
    p.design.methods.forEach((m) => {
      const name = m.name === p.design.cls ? '__init__' : m.name;
      const body = (bodies[m.name] || '').replace(/\s+$/, '');
      out += `${PY.INDENT}def ${name}(${['self', ...m.params].join(', ')}):\n`;
      out += (body.trim() ? indent(fix(body), PY.INDENT) : PY.INDENT.repeat(2) + 'pass') + '\n\n';
    });
    if (helperCode) {
      const helpers = fix(helperCode).replace(/^def self\.(\w+)\(/gm, 'def $1(').replace(/^def (\w+)\((\)?)/gm, (m, n, close) => (close ? `def ${n}(self)` : `def ${n}(self, `));
      out += indent(helpers, PY.INDENT) + '\n';
    }
    return out.replace(/\s+$/, '') + '\n';
  }

  window.LBT = { JS, PY, toolbox, buildJS, buildDesignJS, previewJS, previewPython, previewDesignPython, fieldNames, maxHeapVars, methodRoots, KIND_CLASS, current: null };
})();
