
        (function() {
            const STORAGE_KEY = 'qianzou_ai_chats';
            let chats = [];
            let currentChatId = null;
            let isLight = false;

            const chatArea = document.getElementById('chatArea');
            const userInput = document.getElementById('userInput');
            const sendBtn = document.getElementById('sendBtn');
            const chatList = document.getElementById('chatList');
            const newChatBtn = document.getElementById('newChatBtn');
            const themeToggle = document.getElementById('themeToggle');

            function saveChats() {
                try { localStorage.setItem(STORAGE_KEY, JSON.stringify(chats)); } catch (e) {}
            }

            function loadChats() {
                try {
                    const raw = localStorage.getItem(STORAGE_KEY);
                    if (raw) chats = JSON.parse(raw);
                } catch (e) { chats = []; }
                if (!Array.isArray(chats)) chats = [];
                if (chats.length === 0) createNewChat(false);
                if (!currentChatId || !chats.find(c => c.id === currentChatId)) {
                    currentChatId = chats[0].id;
                }
                renderChatList();
                renderChatArea();
            }

            function generateId() {
                return 'chat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
            }

            function createNewChat(save = true) {
                const newChat = { id: generateId(), title: '新对话', messages: [] };
                chats.unshift(newChat);
                currentChatId = newChat.id;
                if (save) saveChats();
                renderChatList();
                renderChatArea();
                userInput.focus();
                return newChat;
            }

            function getCurrentChat() {
                return chats.find(c => c.id === currentChatId) || null;
            }

            function switchChat(id) {
                if (id === currentChatId) return;
                currentChatId = id;
                renderChatList();
                renderChatArea();
                userInput.focus();
            }

            function updateChatTitle(chat, firstMessage) {
                if (!chat || !firstMessage) return;
                const text = firstMessage.trim();
                if (!text) return;
                const title = text.length > 5 ? text.slice(0, 5) + '...' : text;
                chat.title = title;
            }

            function renderChatList() {
                chatList.innerHTML = '';
                chats.forEach(chat => {
                    const btn = document.createElement('button');
                    btn.className = 'chat-item' + (chat.id === currentChatId ? ' active' : '');
                    btn.innerHTML = `<span class="chat-icon">💬</span><span class="chat-label">${escapeHtml(chat.title)}</span>`;
                    btn.addEventListener('click', () => switchChat(chat.id));
                    chatList.appendChild(btn);
                });
            }

            function renderChatArea() {
                chatArea.innerHTML = '';
                const chat = getCurrentChat();
                if (!chat) return;
                if (chat.messages.length === 0) {
                    renderHolidayCenter();
                    return;
                }
                chat.messages.forEach(msg => renderMessage(msg, false));
                chatArea.scrollTop = chatArea.scrollHeight;
            }

            function getHoliday() {
                const now = new Date();
                const month = now.getMonth() + 1;
                const day = now.getDate();
                const holidays = {
                    '1-1': { name: '元旦', emoji: '🎊' },
                    '2-14': { name: '情人节', emoji: '💕' },
                    '3-8': { name: '妇女节', emoji: '🌹' },
                    '3-12': { name: '植树节', emoji: '🌳' },
                    '4-1': { name: '愚人节', emoji: '🤡' },
                    '5-1': { name: '劳动节', emoji: '💪' },
                    '5-4': { name: '青年节', emoji: '🔥' },
                    '6-1': { name: '儿童节', emoji: '🧒' },
                    '7-1': { name: '建党节', emoji: '🇨🇳' },
                    '8-1': { name: '建军节', emoji: '🎖️' },
                    '9-10': { name: '教师节', emoji: '📚' },
                    '10-1': { name: '国庆节', emoji: '🇨🇳' },
                    '12-24': { name: '平安夜', emoji: '🎄' },
                    '12-25': { name: '圣诞节', emoji: '🎅' },
                };
                const key = month + '-' + day;
                if (holidays[key]) return { ...holidays[key], date: now };
                return null;
            }

            function isWeekend() {
                const day = new Date().getDay();
                return day === 0 || day === 6;
            }

            function renderHolidayCenter() {
                const holiday = getHoliday();
                const div = document.createElement('div');
                div.className = 'holiday-center';
                if (holiday) {
                    div.innerHTML = `
                        <div class="holiday-emoji">${holiday.emoji}</div>
                        <div class="holiday-text">${holiday.name}快乐</div>
                        <div class="holiday-sub">今天是 ${holiday.name}，祝你节日快乐！</div>
                        <div class="holiday-date">${holiday.date.getFullYear()}年${holiday.date.getMonth()+1}月${holiday.date.getDate()}日</div>
                    `;
                } else if (isWeekend()) {
                    div.innerHTML = `
                        <div class="holiday-emoji">🎉</div>
                        <div class="holiday-text">周末快乐</div>
                        <div class="holiday-sub">今天是周末，好好休息一下吧！</div>
                        <div class="holiday-date">${new Date().getFullYear()}年${new Date().getMonth()+1}月${new Date().getDate()}日</div>
                    `;
                } else {
                    div.innerHTML = `
                        <div class="holiday-emoji">🤖</div>
                        <div class="holiday-text">你好呀</div>
                        <div class="holiday-sub">我是欠揍AI，输入问题或数学表达式开始对话吧</div>
                        <div class="holiday-date">${new Date().getFullYear()}年${new Date().getMonth()+1}月${new Date().getDate()}日</div>
                    `;
                }
                chatArea.appendChild(div);
            }

            function renderMessage(msg, scroll = true) {
                const messageDiv = document.createElement('div');
                messageDiv.classList.add('message', msg.sender);
                const avatarDiv = document.createElement('div');
                avatarDiv.classList.add('avatar');
                avatarDiv.textContent = msg.sender === 'user' ? '👤' : '🤖';
                const bubbleDiv = document.createElement('div');
                bubbleDiv.classList.add('bubble');

                if (msg.type === 'math' && msg.data) {
                    bubbleDiv.classList.add('math-result');
                    bubbleDiv.innerHTML = `
                        <div style="margin-bottom:5px;"> <span class="expr">${escapeHtml(msg.data.expr)}</span></div>
                        <div style="font-size:0.85rem;">AST 解析结果：</div>
                        <div class="result-value">${escapeHtml(msg.data.result)}</div>
                        ${msg.data.isComplex ? '<div style="font-size:0.75rem; color:#c78aff; margin-top:3px;">ℂ 复数结果</div>' : ''}
                        <div class="range-hint">a,b ∈ [-2²⁵⁵, 2²⁵⁵-1] </div>
                    `;
                } else if (msg.type === 'translate' && msg.data) {
                    bubbleDiv.classList.add('translate-result');
                    if (msg.data.from === 'mixed') bubbleDiv.classList.add('mixed');
                    
                    let langTag = '';
                    if (msg.data.from === 'en') langTag = '🇬🇧 英语 → 中文';
                    else if (msg.data.from === 'zh') langTag = '🇨🇳 中文 → 英语';
                    else if (msg.data.from === 'mixed') langTag = '中英混搭';
                    
                    const posStr = msg.data.pos ? ` <span style="color:var(--text-secondary);">(${msg.data.pos})</span>` : '';
                    const noteStr = msg.data.note ? `<div style="font-size:0.8rem; color:var(--text-secondary); margin-top:3px;">${escapeHtml(msg.data.note)}</div>` : '';
                    bubbleDiv.innerHTML = `
                        <div><span class="lang-tag">${langTag}</span></div>
                        <div class="src">原文：${escapeHtml(msg.data.src)}</div>
                        <div class="dst">译文：${escapeHtml(msg.data.dst)}${posStr}</div>
                        ${noteStr}
                    `;
                } else {
                    bubbleDiv.textContent = msg.text || '';
                }

                messageDiv.appendChild(avatarDiv);
                messageDiv.appendChild(bubbleDiv);
                chatArea.appendChild(messageDiv);
                if (scroll) chatArea.scrollTop = chatArea.scrollHeight;
            }

            function escapeHtml(s) {
                if (typeof s !== 'string') return String(s);
                return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            }

            function addMessageToChat(msg, scroll = true) {
                const chat = getCurrentChat();
                if (!chat) return;
                if (chat.title === '新对话' && msg.sender === 'user' && msg.text) {
                    updateChatTitle(chat, msg.text);
                    renderChatList();
                }
                chat.messages.push(msg);
                saveChats();
                if (chat.messages.length === 1) chatArea.innerHTML = '';
                renderMessage(msg, scroll);
            }

            // ============================================================
            // 数学引擎
            // ============================================================
            const MIN_VAL = -Math.pow(2, 255);
            const MAX_VAL = Math.pow(2, 255) - 1;
            const complex = (re, im = 0) => ({ re, im });
            function cAdd(a, b) { return complex(a.re + b.re, a.im + b.im); }
            function cSub(a, b) { return complex(a.re - b.re, a.im - b.im); }
            function cMul(a, b) { return complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re); }
            function cDiv(a, b) {
                const denom = b.re * b.re + b.im * b.im;
                if (denom === 0) throw new Error('复数除以零');
                return complex((a.re * b.re + a.im * b.im) / denom, (a.im * b.re - a.re * b.im) / denom);
            }
            function cAbs(a) { return Math.sqrt(a.re * a.re + a.im * a.im); }
            function cExp(a) {
                const expRe = Math.exp(a.re);
                return complex(expRe * Math.cos(a.im), expRe * Math.sin(a.im));
            }
            function cSin(a) { return complex(Math.sin(a.re) * Math.cosh(a.im), Math.cos(a.re) * Math.sinh(a.im)); }
            function cCos(a) { return complex(Math.cos(a.re) * Math.cosh(a.im), -Math.sin(a.re) * Math.sinh(a.im)); }
            function cTan(a) { return cDiv(cSin(a), cCos(a)); }
            function cLog(a) {
                const r = cAbs(a);
                if (r === 0) throw new Error('对数参数为零');
                const theta = Math.atan2(a.im, a.re);
                return complex(Math.log(r), theta);
            }
            function cSqrt(a) {
                const r = cAbs(a);
                if (r === 0) return complex(0, 0);
                const theta = Math.atan2(a.im, a.re);
                const sqrtR = Math.sqrt(r);
                return complex(sqrtR * Math.cos(theta / 2), sqrtR * Math.sin(theta / 2));
            }
            function cPow(a, b) {
                if (a.re === 0 && a.im === 0) {
                    if (b.re > 0 && b.im === 0) return complex(0, 0);
                    if (b.re === 0 && b.im === 0) return complex(1, 0);
                    throw new Error('0的复数幂未定义');
                }
                const logA = cLog(a);
                const bLogA = cMul(b, logA);
                return cExp(bLogA);
            }
            function toComplex(x) {
                if (typeof x === 'number') return complex(x, 0);
                if (x && typeof x.re === 'number' && typeof x.im === 'number') return x;
                throw new Error('无法转换为复数: ' + x);
            }
            function checkRange(c) {
                const re = c.re, im = c.im;
                if (isFinite(re) && isFinite(im)) {
                    if (re < MIN_VAL || re > MAX_VAL) throw new Error(`实部超出范围`);
                    if (im < MIN_VAL || im > MAX_VAL) throw new Error(`虚部超出范围`);
                    return c;
                }
                if (!isFinite(re) || !isFinite(im)) throw new Error(`结果包含无穷大`);
                return c;
            }

            function isPrime(n) {
                n = Math.floor(n);
                if (n < 2) return false;
                if (n === 2) return true;
                if (n % 2 === 0) return false;
                for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false;
                return true;
            }
            function factorial(n) {
                n = Math.floor(n);
                if (n < 0) throw new Error('阶乘不支持负数');
                if (n > 170) return Infinity;
                let r = 1;
                for (let i = 2; i <= n; i++) r *= i;
                return r;
            }
            function integrate(fn, a, b, eps = 1e-8) {
                function simpson(f, a, b) {
                    const c = (a + b) / 2;
                    return (b - a) / 6 * (f(a) + 4 * f(c) + f(b));
                }
                function adaptive(f, a, b, eps, whole, depth) {
                    const c = (a + b) / 2;
                    const left = simpson(f, a, c);
                    const right = simpson(f, c, b);
                    const delta = left + right - whole;
                    if (depth <= 0 || Math.abs(delta) <= 15 * eps) return left + right + delta / 15;
                    return adaptive(f, a, c, eps / 2, left, depth - 1) +
                           adaptive(f, c, b, eps / 2, right, depth - 1);
                }
                const whole = simpson(fn, a, b);
                return adaptive(fn, a, b, eps, whole, 20);
            }
            function derivative(fn, x, h = 1e-7) { return (fn(x + h) - fn(x - h)) / (2 * h); }
            function limit(fn, x0) { return fn(x0 + 1e-9); }
            function sumSeries(fn, start, end, terms = 100000) {
                let sum = complex(0, 0);
                if (end === Infinity) {
                    for (let n = start; n < start + terms; n++) {
                        sum = cAdd(sum, toComplex(fn(n)));
                    }
                } else {
                    for (let n = start; n <= end; n++) {
                        sum = cAdd(sum, toComplex(fn(n)));
                    }
                }
                return sum;
            }

            // ============================================================
            // 词法分析器（已修复 e^i）
            // ============================================================
            function tokenize(s) {
                s = s.replace(/\s+/g, '');
                s = s.replace(/[=？?。，,]+$/g, '');
                // 预处理：e^数字i → e^(数字i)
                s = s.replace(/e\^([+-]?\d+(?:\.\d+)?)i(?![\d\w])/g, 'e^($1i)');
                s = s.replace(/e\^([+-]?\d+(?:\.\d+)?)\*i(?![\d\w])/g, 'e^($1*i)');
                // e^i → e^(i)
                s = s.replace(/e\^i(?![\d\w])/g, 'e^(i)');
                
                const tokens = [];
                let i = 0;
                while (i < s.length) {
                    const ch = s[i];
                    if (/[0-9.]/.test(ch)) {
                        let numStr = '';
                        while (i < s.length && /[0-9.]/.test(s[i])) { numStr += s[i]; i++; }
                        if (i < s.length && (s[i] === 'e' || s[i] === 'E')) {
                            const next = s[i + 1];
                            if (next && (/[0-9]/.test(next) || ((next === '+' || next === '-') && s[i + 2] && /[0-9]/.test(s[i + 2])))) {
                                numStr += s[i]; i++;
                                if (i < s.length && (s[i] === '+' || s[i] === '-')) { numStr += s[i]; i++; }
                                while (i < s.length && /[0-9]/.test(s[i])) { numStr += s[i]; i++; }
                            }
                        }
                        tokens.push({ type: 'number', value: parseFloat(numStr) });
                        continue;
                    }
                    if (s.substr(i, 2) === 'pi') {
                        tokens.push({ type: 'const', value: complex(Math.PI, 0) }); i += 2; continue;
                    }
                    if (/[a-zA-Z_]/.test(ch)) {
                        let name = '';
                        while (i < s.length && /[a-zA-Z0-9_]/.test(s[i])) { name += s[i]; i++; }
                        const lower = name.toLowerCase();
                        // ===== 关键修复：单字母常量优先 =====
                        if (name.length === 1 && lower === 'e') {
                            tokens.push({ type: 'const', value: complex(Math.E, 0) });
                        } else if (name.length === 1 && lower === 'i') {
                            tokens.push({ type: 'const', value: complex(0, 1) });
                        } else if (lower === 'pi') {
                            tokens.push({ type: 'const', value: complex(Math.PI, 0) });
                        } else if (lower === 'int' || lower === 'integrate') {
                            tokens.push({ type: 'op', value: 'int' });
                        } else if (lower === 'sum' || lower === 'sigma') {
                            tokens.push({ type: 'op', value: 'sum' });
                        } else if (lower === 'lim' || lower === 'limit') {
                            tokens.push({ type: 'op', value: 'lim' });
                        } else if (lower === 'diff' || lower === 'differentiate') {
                            tokens.push({ type: 'op', value: 'diff' });
                        } else {
                            tokens.push({ type: 'func', value: lower });
                        }
                        continue;
                    }
                    if ('+-*/^(),!<>=√∫Σ∂'.includes(ch)) {
                        if (ch === '√') { tokens.push({ type: 'func', value: 'sqrt' }); i++; continue; }
                        if (ch === '∫') { tokens.push({ type: 'op', value: 'int' }); i++; continue; }
                        if (ch === 'Σ') { tokens.push({ type: 'op', value: 'sum' }); i++; continue; }
                        if (ch === '∂') { tokens.push({ type: 'op', value: 'diff' }); i++; continue; }
                        if (ch === '=') { i++; continue; }
                        tokens.push({ type: 'op', value: ch }); i++; continue;
                    }
                    i++;
                }
                return tokens;
            }

            function parse(tokens) {
                let pos = 0;
                const peek = () => tokens[pos] || null;
                const consume = (type, value) => {
                    const t = tokens[pos];
                    if (!t) return null;
                    if (type && t.type !== type) return null;
                    if (value !== undefined && t.value !== value) return null;
                    pos++; return t;
                };
                function canStartFactor(t) {
                    if (!t) return false;
                    return t.type === 'number' || t.type === 'const' || t.type === 'func' || (t.type === 'op' && t.value === '(');
                }
                function parseExpr() {
                    let left = parseTerm();
                    while (true) {
                        const t = peek();
                        if (t && t.type === 'op' && (t.value === '+' || t.value === '-')) {
                            pos++; const right = parseTerm();
                            left = { type: 'binary', op: t.value, left, right };
                        } else break;
                    }
                    return left;
                }
                function parseTerm() {
                    let left = parseFactor();
                    while (true) {
                        const t = peek();
                        if (t && t.type === 'op' && (t.value === '*' || t.value === '/')) {
                            pos++; const right = parseFactor();
                            left = { type: 'binary', op: t.value, left, right };
                        } else if (t && canStartFactor(t)) {
                            const right = parseFactor();
                            left = { type: 'binary', op: '*', left, right };
                        } else break;
                    }
                    return left;
                }
                function parseFactor() {
                    let base = parsePrimary();
                    if (peek() && peek().type === 'op' && peek().value === '^') {
                        pos++; const exp = parseFactor();
                        base = { type: 'binary', op: '^', left: base, right: exp };
                    }
                    while (peek() && peek().type === 'op' && peek().value === '!') {
                        pos++; base = { type: 'factorial', expr: base };
                    }
                    return base;
                }
                function parsePrimary() {
                    const t = peek();
                    if (!t) throw new Error('表达式意外结束');
                    if (t.type === 'number') { pos++; return { type: 'number', value: t.value }; }
                    if (t.type === 'const') { pos++; return { type: 'constant', value: t.value }; }
                    if (t.type === 'func') {
                        const funcName = t.value; pos++;
                        if (peek() && peek().type === 'op' && peek().value === '(') {
                            pos++; const args = [];
                            if (peek() && !(peek().type === 'op' && peek().value === ')')) {
                                args.push(parseExpr());
                                while (peek() && peek().type === 'op' && peek().value === ',') {
                                    pos++; args.push(parseExpr());
                                }
                            }
                            consume('op', ')');
                            return { type: 'call', name: funcName, args };
                        }
                        const arg = parseFactor();
                        return { type: 'call', name: funcName, args: [arg] };
                    }
                    if (t.type === 'op' && t.value === '(') {
                        pos++; const expr = parseExpr();
                        consume('op', ')'); return expr;
                    }
                    if (t.type === 'op' && t.value === '-') {
                        pos++; const expr = parseFactor();
                        return { type: 'unary', op: '-', expr };
                    }
                    if (t.type === 'op' && t.value === '+') { pos++; return parseFactor(); }
                    throw new Error('无法解析');
                }
                const ast = parseExpr();
                if (pos < tokens.length) throw new Error('表达式有剩余标记');
                return ast;
            }

            function evaluate(ast, env = {}) {
                switch (ast.type) {
                    case 'number': return checkRange(complex(ast.value, 0));
                    case 'constant': return checkRange(ast.value);
                    case 'unary':
                        if (ast.op === '-') {
                            const val = evaluate(ast.expr, env);
                            return checkRange(complex(-val.re, -val.im));
                        }
                        throw new Error('未知一元运算符');
                    case 'binary': {
                        const left = evaluate(ast.left, env);
                        const right = evaluate(ast.right, env);
                        switch (ast.op) {
                            case '+': return checkRange(cAdd(left, right));
                            case '-': return checkRange(cSub(left, right));
                            case '*': return checkRange(cMul(left, right));
                            case '/': return checkRange(cDiv(left, right));
                            case '^': {
                                const isE = Math.abs(left.re - Math.E) < 1e-12 && Math.abs(left.im) < 1e-12;
                                const isPureImaginary = Math.abs(right.re) < 1e-12 && Math.abs(right.im) > 1e-12;
                                if (isE && isPureImaginary) {
                                    // 欧拉公式：e^(iθ) = cos(θ) + i·sin(θ)
                                    const theta = right.im;
                                    return checkRange(complex(Math.cos(theta), Math.sin(theta)));
                                }
                                return checkRange(cPow(left, right));
                            }
                            default: throw new Error('未知二元运算符');
                        }
                    }
                    case 'factorial': {
                        const val = evaluate(ast.expr, env);
                        if (Math.abs(val.im) > 1e-12) throw new Error('阶乘仅支持实数');
                        return checkRange(complex(factorial(val.re), 0));
                    }
                    case 'call': {
                        const name = ast.name;
                        const args = ast.args || [];
                        const evaluatedArgs = args.map(a => evaluate(a, env));
                        if (evaluatedArgs.length === 1) {
                            const x = evaluatedArgs[0];
                            switch (name) {
                                case 'sin': return checkRange(cSin(x));
                                case 'cos': return checkRange(cCos(x));
                                case 'tan': return checkRange(cTan(x));
                                case 'asin': {
                                    if (Math.abs(x.im) < 1e-12 && x.re >= -1 && x.re <= 1) return checkRange(complex(Math.asin(x.re), 0));
                                    const iX = complex(-x.im, x.re);
                                    const oneMinusX2 = cSub(complex(1, 0), cMul(x, x));
                                    const sqrtVal = cSqrt(oneMinusX2);
                                    const inside = cAdd(iX, sqrtVal);
                                    const logVal = cLog(inside);
                                    return checkRange(cMul(complex(0, -1), logVal));
                                }
                                case 'acos': {
                                    if (Math.abs(x.im) < 1e-12 && x.re >= -1 && x.re <= 1) return checkRange(complex(Math.acos(x.re), 0));
                                    const asinVal = evaluate({ type: 'call', name: 'asin', args: [{ type: 'constant', value: x }] });
                                    return checkRange(cSub(complex(Math.PI / 2, 0), asinVal));
                                }
                                case 'atan': {
                                    if (Math.abs(x.im) < 1e-12) return checkRange(complex(Math.atan(x.re), 0));
                                    const i = complex(0, 1);
                                    const ratio = cDiv(cAdd(i, x), cSub(i, x));
                                    return checkRange(cMul(complex(0, 0.5), cLog(ratio)));
                                }
                                case 'sqrt': return checkRange(cSqrt(x));
                                case 'exp': return checkRange(cExp(x));
                                case 'log': case 'ln': return checkRange(cLog(x));
                                case 'abs': return checkRange(complex(cAbs(x), 0));
                                case 'prime': {
                                    if (Math.abs(x.im) > 1e-12) throw new Error('素数判断仅支持实数');
                                    return checkRange(complex(isPrime(x.re) ? 1 : 0, 0));
                                }
                                case 'fact': return checkRange(complex(factorial(x.re), 0));
                                default: throw new Error('未知函数');
                            }
                        }
                        if (name === 'int' || name === 'integrate') {
                            const exprAst = args[0];
                            const a = evaluate(args[args.length - 2], env);
                            const b = evaluate(args[args.length - 1], env);
                            const fn = (x) => {
                                const localEnv = { ...env, x: complex(x, 0) };
                                return evaluate(exprAst, localEnv).re;
                            };
                            return checkRange(complex(integrate(fn, a.re, b.re), 0));
                        }
                        if (name === 'diff') {
                            const exprAst = args[0];
                            const point = args.length >= 2 ? evaluate(args[args.length - 1], env) : complex(0, 0);
                            const fn = (x) => {
                                const localEnv = { ...env, x: complex(x, 0) };
                                return evaluate(exprAst, localEnv).re;
                            };
                            return checkRange(complex(derivative(fn, point.re), 0));
                        }
                        if (name === 'lim') {
                            const exprAst = args[0];
                            const x0 = args.length >= 2 ? evaluate(args[args.length - 1], env) : complex(0, 0);
                            const fn = (x) => {
                                const localEnv = { ...env, x: complex(x, 0) };
                                return evaluate(exprAst, localEnv).re;
                            };
                            return checkRange(complex(limit(fn, x0.re), 0));
                        }
                        if (name === 'sum') {
                            const exprAst = args[0];
                            const start = args.length >= 3 ? evaluate(args[args.length - 2], env) : complex(1, 0);
                            const end = args.length >= 3 ? evaluate(args[args.length - 1], env) : complex(Infinity, 0);
                            const fn = (n) => {
                                const localEnv = { ...env, n: complex(n, 0), x: complex(n, 0) };
                                return evaluate(exprAst, localEnv);
                            };
                            return checkRange(sumSeries(fn, start.re, end.re === Infinity ? Infinity : end.re));
                        }
                        throw new Error('未知多参数函数');
                    }
                    default: throw new Error('未知AST节点');
                }
            }

            function isMathExpression(text) {
    const patterns = [
        /[0-9]+\s*[\+\-\*\/\^]/, /[\+\-\*\/\^]\s*[0-9]/,
        /sin|cos|tan|asin|acos|atan|sqrt|exp|log|ln|abs|prime|fact/i,
        /∫|Σ|∂|lim|int|sum|diff/i, /\(.*\)/, /[0-9]+\s*!/,
        /[0-9]+\s*[a-zA-Z]/, /[a-zA-Z]\s*[\+\-\*\/\^]\s*[0-9]/,
        /[0-9]+\s*[\+\-\*\/]\s*[0-9]+/, /[\+\-\*\/\^]\s*\(/,
        /\(.*\)\s*[\+\-\*\/\^]/, /[a-zA-Z]\s*\(.*\)/,
        /[0-9]+\s*[\^]\s*[0-9]+/, /[0-9]+\s*[!]/,
        /i\s*[\+\-\*\/]/, /[\+\-\*\/]\s*i/,
        /e\^/i, /[0-9]+\s*\*\s*i/, /i\s*\*\s*[0-9]+/,
        // ===== 新增：pi 和常量表达式 =====
        /pi/i,               // 含 pi（大小写不敏感）
        /pi\s*[\+\-\*\/\^]/, // pi 后接运算符
        /[\+\-\*\/\^]\s*pi/i, // 运算符后接 pi
    ];
    return patterns.some(p => p.test(text));
}

            function solveMath(expr) {
                let s = expr
                    .replace(/×/g, '*').replace(/÷/g, '/').replace(/π/g, 'pi')
                    .replace(/∞/g, 'Infinity').replace(/√/g, 'sqrt')
                    .replace(/∫/g, 'int').replace(/Σ/g, 'sum').replace(/∂/g, 'diff')
                    .replace(/\bln\b/g, 'log').replace(/\barcsin\b/g, 'asin')
                    .replace(/\barccos\b/g, 'acos').replace(/\barctan\b/g, 'atan');
                const env = { x: complex(0, 0), n: complex(0, 0), t: complex(0, 0) };
                try {
                    const tokens = tokenize(s);
                    if (tokens.length === 0) throw new Error('空表达式');
                    const ast = parse(tokens);
                    const result = evaluate(ast, env);
                    return { success: true, result };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            }

            function formatNumber(n) {
                if (!isFinite(n)) return n > 0 ? '∞' : '-∞';
                if (Math.abs(n) < 1e-20) return '0';
                const rounded = Math.round(n);
                if (Math.abs(n - rounded) < 1e-15 && Math.abs(n) < 1e15) return rounded.toString();
                const absN = Math.abs(n);
                if (absN > 1e15 || absN < 1e-6) return n.toExponential(20);
                let s = n.toFixed(20);
                s = s.replace(/\.?0+$/, '');
                if (s === '' || s === '-') s = '0';
                return s;
            }

            function formatMathResult(expr, result) {
                const re = result.re, im = result.im;
                let resultStr = '';
                if (Math.abs(im) < 1e-20) resultStr = formatNumber(re);
                else if (Math.abs(re) < 1e-20) resultStr = formatNumber(im) + 'i';
                else {
                    const sign = im >= 0 ? '+' : '-';
                    resultStr = formatNumber(re) + ' ' + sign + ' ' + formatNumber(Math.abs(im)) + 'i';
                }
                return { expr, result: resultStr, isComplex: Math.abs(im) > 1e-20 };
            }

            // ============================================================
            // 中英词典
            // ============================================================
            const DICT = {
                'i': { zh: '我', pos: 'pron.' },
                'me': { zh: '我（宾格）', pos: 'pron.' },
                'my': { zh: '我的', pos: 'pron.' },
                'you': { zh: '你；你们', pos: 'pron.' },
                'your': { zh: '你的', pos: 'pron.' },
                'he': { zh: '他', pos: 'pron.' },
                'she': { zh: '她', pos: 'pron.' },
                'it': { zh: '它', pos: 'pron.' },
                'we': { zh: '我们', pos: 'pron.' },
                'they': { zh: '他们', pos: 'pron.' },
                "i'm": { zh: '我是（I am 的缩写）', pos: '缩写' },
                "im": { zh: '我是（I\'m 的非标准写法）', pos: '缩写' },
                "i am": { zh: '我是', pos: 'phrase' },
                "you're": { zh: '你是（You are 的缩写）', pos: '缩写' },
                "he's": { zh: '他是（He is 的缩写）', pos: '缩写' },
                "she's": { zh: '她是（She is 的缩写）', pos: '缩写' },
                "it's": { zh: '它是（It is 的缩写）', pos: '缩写' },
                "we're": { zh: '我们是（We are 的缩写）', pos: '缩写' },
                "they're": { zh: '他们是（They are 的缩写）', pos: '缩写' },
                "don't": { zh: '不（Do not 的缩写）', pos: '缩写' },
                "doesn't": { zh: '不（Does not 的缩写）', pos: '缩写' },
                "didn't": { zh: '没有（Did not 的缩写）', pos: '缩写' },
                "isn't": { zh: '不是（Is not 的缩写）', pos: '缩写' },
                "aren't": { zh: '不是（Are not 的缩写）', pos: '缩写' },
                "can't": { zh: '不能（Cannot 的缩写）', pos: '缩写' },
                "won't": { zh: '不会（Will not 的缩写）', pos: '缩写' },
                "wouldn't": { zh: '不会（Would not 的缩写）', pos: '缩写' },
                "shouldn't": { zh: '不应该（Should not 的缩写）', pos: '缩写' },
                "lol": { zh: '大笑（laughing out loud）', pos: '缩写' },
                "omg": { zh: '我的天（Oh my God）', pos: '缩写' },
                "btw": { zh: '顺便说一下（by the way）', pos: '缩写' },
                "idk": { zh: '我不知道（I don\'t know）', pos: '缩写' },
                "np": { zh: '没问题（no problem）', pos: '缩写' },
                "thx": { zh: '谢谢（thanks）', pos: '缩写' },
                "ai": { zh: '人工智能', pos: '缩写' },
                "api": { zh: '应用程序接口', pos: '缩写' },
                "cpu": { zh: '中央处理器', pos: '缩写' },
                "os": { zh: '操作系统', pos: '缩写' },
                "js": { zh: 'JavaScript', pos: '缩写' },
                "html": { zh: '超文本标记语言', pos: '缩写' },
                "gay": { zh: '同性恋', pos: 'adj./n.' },
                "mj": { zh: '蜘蛛侠', pos: '缩写' },
                'play': { zh: '玩；播放', pos: 'v./n.' },
                'can': { zh: '能；可以', pos: 'v.' },
                'cannot': { zh: '不能', pos: 'v.' },
                'do': { zh: '做', pos: 'v.' },
                'does': { zh: '做（第三人称单数）', pos: 'v.' },
                'did': { zh: '做（过去式）', pos: 'v.' },
                'have': { zh: '有', pos: 'v.' },
                'has': { zh: '有（第三人称单数）', pos: 'v.' },
                'had': { zh: '有（过去式）', pos: 'v.' },
                'be': { zh: '是；在', pos: 'v.' },
                'is': { zh: '是', pos: 'v.' },
                'am': { zh: '是', pos: 'v.' },
                'are': { zh: '是', pos: 'v.' },
                'was': { zh: '是（过去式）', pos: 'v.' },
                'were': { zh: '是（过去式）', pos: 'v.' },
                'go': { zh: '去；走', pos: 'v.' },
                'goes': { zh: '去（第三人称单数）', pos: 'v.' },
                'going': { zh: '正在去', pos: 'v.' },
                'went': { zh: '去了', pos: 'v.' },
                'come': { zh: '来', pos: 'v.' },
                'comes': { zh: '来（第三人称单数）', pos: 'v.' },
                'coming': { zh: '正在来', pos: 'v.' },
                'came': { zh: '来了', pos: 'v.' },
                'get': { zh: '得到；变得', pos: 'v.' },
                'gets': { zh: '得到（第三人称单数）', pos: 'v.' },
                'getting': { zh: '正在得到', pos: 'v.' },
                'got': { zh: '得到了', pos: 'v.' },
                'make': { zh: '制作；使', pos: 'v.' },
                'makes': { zh: '制作（第三人称单数）', pos: 'v.' },
                'making': { zh: '正在制作', pos: 'v.' },
                'made': { zh: '制作了', pos: 'v.' },
                'take': { zh: '拿；取', pos: 'v.' },
                'takes': { zh: '拿（第三人称单数）', pos: 'v.' },
                'taking': { zh: '正在拿', pos: 'v.' },
                'took': { zh: '拿了', pos: 'v.' },
                'see': { zh: '看见', pos: 'v.' },
                'sees': { zh: '看见（第三人称单数）', pos: 'v.' },
                'seeing': { zh: '正在看见', pos: 'v.' },
                'saw': { zh: '看见了', pos: 'v.' },
                'look': { zh: '看', pos: 'v.' },
                'looks': { zh: '看（第三人称单数）', pos: 'v.' },
                'looking': { zh: '正在看', pos: 'v.' },
                'looked': { zh: '看了', pos: 'v.' },
                'watch': { zh: '观看', pos: 'v.' },
                'watches': { zh: '观看（第三人称单数）', pos: 'v.' },
                'watching': { zh: '正在观看', pos: 'v.' },
                'watched': { zh: '观看了', pos: 'v.' },
                'read': { zh: '读', pos: 'v.' },
                'reads': { zh: '读（第三人称单数）', pos: 'v.' },
                'reading': { zh: '正在读', pos: 'v.' },
                'write': { zh: '写', pos: 'v.' },
                'writes': { zh: '写（第三人称单数）', pos: 'v.' },
                'writing': { zh: '正在写', pos: 'v.' },
                'wrote': { zh: '写了', pos: 'v.' },
                'speak': { zh: '说', pos: 'v.' },
                'speaks': { zh: '说（第三人称单数）', pos: 'v.' },
                'speaking': { zh: '正在说', pos: 'v.' },
                'spoke': { zh: '说了', pos: 'v.' },
                'talk': { zh: '谈话', pos: 'v.' },
                'talks': { zh: '谈话（第三人称单数）', pos: 'v.' },
                'talking': { zh: '正在谈话', pos: 'v.' },
                'talked': { zh: '谈话了', pos: 'v.' },
                'listen': { zh: '听', pos: 'v.' },
                'listens': { zh: '听（第三人称单数）', pos: 'v.' },
                'listening': { zh: '正在听', pos: 'v.' },
                'listened': { zh: '听了', pos: 'v.' },
                'hear': { zh: '听见', pos: 'v.' },
                'hears': { zh: '听见（第三人称单数）', pos: 'v.' },
                'hearing': { zh: '正在听见', pos: 'v.' },
                'heard': { zh: '听见了', pos: 'v.' },
                'think': { zh: '想', pos: 'v.' },
                'thinks': { zh: '想（第三人称单数）', pos: 'v.' },
                'thinking': { zh: '正在想', pos: 'v.' },
                'thought': { zh: '想了', pos: 'v.' },
                'know': { zh: '知道', pos: 'v.' },
                'knows': { zh: '知道（第三人称单数）', pos: 'v.' },
                'knowing': { zh: '正在知道', pos: 'v.' },
                'knew': { zh: '知道了', pos: 'v.' },
                'want': { zh: '想要', pos: 'v.' },
                'wants': { zh: '想要（第三人称单数）', pos: 'v.' },
                'wanting': { zh: '正在想要', pos: 'v.' },
                'wanted': { zh: '想要了', pos: 'v.' },
                'need': { zh: '需要', pos: 'v.' },
                'needs': { zh: '需要（第三人称单数）', pos: 'v.' },
                'needing': { zh: '正在需要', pos: 'v.' },
                'needed': { zh: '需要了', pos: 'v.' },
                'help': { zh: '帮助', pos: 'v.' },
                'helps': { zh: '帮助（第三人称单数）', pos: 'v.' },
                'helping': { zh: '正在帮助', pos: 'v.' },
                'helped': { zh: '帮助了', pos: 'v.' },
                'work': { zh: '工作', pos: 'v.' },
                'works': { zh: '工作（第三人称单数）', pos: 'v.' },
                'working': { zh: '正在工作', pos: 'v.' },
                'worked': { zh: '工作了', pos: 'v.' },
                'study': { zh: '学习', pos: 'v.' },
                'studies': { zh: '学习（第三人称单数）', pos: 'v.' },
                'studying': { zh: '正在学习', pos: 'v.' },
                'studied': { zh: '学习了', pos: 'v.' },
                'learn': { zh: '学习', pos: 'v.' },
                'learns': { zh: '学习（第三人称单数）', pos: 'v.' },
                'learning': { zh: '正在学习', pos: 'v.' },
                'learned': { zh: '学习了', pos: 'v.' },
                'find': { zh: '找到', pos: 'v.' },
                'finds': { zh: '找到（第三人称单数）', pos: 'v.' },
                'finding': { zh: '正在找到', pos: 'v.' },
                'found': { zh: '找到了', pos: 'v.' },
                'lose': { zh: '失去', pos: 'v.' },
                'loses': { zh: '失去（第三人称单数）', pos: 'v.' },
                'losing': { zh: '正在失去', pos: 'v.' },
                'lost': { zh: '失去了', pos: 'v.' },
                'buy': { zh: '买', pos: 'v.' },
                'buys': { zh: '买（第三人称单数）', pos: 'v.' },
                'buying': { zh: '正在买', pos: 'v.' },
                'bought': { zh: '买了', pos: 'v.' },
                'sell': { zh: '卖', pos: 'v.' },
                'sells': { zh: '卖（第三人称单数）', pos: 'v.' },
                'selling': { zh: '正在卖', pos: 'v.' },
                'sold': { zh: '卖了', pos: 'v.' },
                'cut': { zh: '切；剪', pos: 'v.' },
                'cuts': { zh: '切（第三人称单数）', pos: 'v.' },
                'cutting': { zh: '正在切', pos: 'v.' },
                'break': { zh: '打破', pos: 'v.' },
                'breaks': { zh: '打破（第三人称单数）', pos: 'v.' },
                'breaking': { zh: '正在打破', pos: 'v.' },
                'broke': { zh: '打破了', pos: 'v.' },
                'open': { zh: '打开', pos: 'v./adj.' },
                'opens': { zh: '打开（第三人称单数）', pos: 'v.' },
                'opening': { zh: '正在打开', pos: 'v.' },
                'opened': { zh: '打开了', pos: 'v.' },
                'close': { zh: '关闭', pos: 'v./adj.' },
                'closes': { zh: '关闭（第三人称单数）', pos: 'v.' },
                'closing': { zh: '正在关闭', pos: 'v.' },
                'closed': { zh: '关闭了', pos: 'v.' },
                'eat': { zh: '吃', pos: 'v.' },
                'eats': { zh: '吃（第三人称单数）', pos: 'v.' },
                'eating': { zh: '正在吃', pos: 'v.' },
                'ate': { zh: '吃了', pos: 'v.' },
                'drink': { zh: '喝', pos: 'v.' },
                'drinks': { zh: '喝（第三人称单数）', pos: 'v.' },
                'drinking': { zh: '正在喝', pos: 'v.' },
                'drank': { zh: '喝了', pos: 'v.' },
                'sleep': { zh: '睡觉', pos: 'v.' },
                'sleeps': { zh: '睡觉（第三人称单数）', pos: 'v.' },
                'sleeping': { zh: '正在睡觉', pos: 'v.' },
                'slept': { zh: '睡觉了', pos: 'v.' },
                'love': { zh: '爱', pos: 'v./n.' },
                'loves': { zh: '爱（第三人称单数）', pos: 'v.' },
                'loving': { zh: '正在爱', pos: 'v.' },
                'loved': { zh: '爱了', pos: 'v.' },
                'hate': { zh: '恨', pos: 'v.' },
                'likes': { zh: '喜欢（第三人称单数）', pos: 'v.' },
                'like': { zh: '喜欢', pos: 'v.' },
                'liking': { zh: '正在喜欢', pos: 'v.' },
                'liked': { zh: '喜欢了', pos: 'v.' },
                'run': { zh: '跑', pos: 'v.' },
                'runs': { zh: '跑（第三人称单数）', pos: 'v.' },
                'running': { zh: '正在跑', pos: 'v.' },
                'ran': { zh: '跑了', pos: 'v.' },
                'walk': { zh: '走', pos: 'v.' },
                'walks': { zh: '走（第三人称单数）', pos: 'v.' },
                'walking': { zh: '正在走', pos: 'v.' },
                'walked': { zh: '走了', pos: 'v.' },
                'jump': { zh: '跳', pos: 'v.' },
                'jumps': { zh: '跳（第三人称单数）', pos: 'v.' },
                'jumping': { zh: '正在跳', pos: 'v.' },
                'jumped': { zh: '跳了', pos: 'v.' },
                'swim': { zh: '游泳', pos: 'v.' },
                'swims': { zh: '游泳（第三人称单数）', pos: 'v.' },
                'swimming': { zh: '正在游泳', pos: 'v.' },
                'swam': { zh: '游泳了', pos: 'v.' },
                'fly': { zh: '飞', pos: 'v.' },
                'flies': { zh: '飞（第三人称单数）', pos: 'v.' },
                'flying': { zh: '正在飞', pos: 'v.' },
                'flew': { zh: '飞了', pos: 'v.' },
                'sing': { zh: '唱', pos: 'v.' },
                'sings': { zh: '唱（第三人称单数）', pos: 'v.' },
                'singing': { zh: '正在唱', pos: 'v.' },
                'sang': { zh: '唱了', pos: 'v.' },
                'dance': { zh: '跳舞', pos: 'v.' },
                'dances': { zh: '跳舞（第三人称单数）', pos: 'v.' },
                'dancing': { zh: '正在跳舞', pos: 'v.' },
                'danced': { zh: '跳舞了', pos: 'v.' },
                'apple': { zh: '苹果', pos: 'n.' },
                'apples': { zh: '苹果（复数）', pos: 'n.' },
                'banana': { zh: '香蕉', pos: 'n.' },
                'book': { zh: '书', pos: 'n.' },
                'books': { zh: '书（复数）', pos: 'n.' },
                'computer': { zh: '电脑', pos: 'n.' },
                'computers': { zh: '电脑（复数）', pos: 'n.' },
                'phone': { zh: '电话', pos: 'n.' },
                'water': { zh: '水', pos: 'n.' },
                'fire': { zh: '火', pos: 'n.' },
                'sun': { zh: '太阳', pos: 'n.' },
                'moon': { zh: '月亮', pos: 'n.' },
                'star': { zh: '星星', pos: 'n.' },
                'sky': { zh: '天空', pos: 'n.' },
                'sea': { zh: '海', pos: 'n.' },
                'tree': { zh: '树', pos: 'n.' },
                'flower': { zh: '花', pos: 'n.' },
                'grass': { zh: '草', pos: 'n.' },
                'dog': { zh: '狗', pos: 'n.' },
                'dogs': { zh: '狗（复数）', pos: 'n.' },
                'cat': { zh: '猫', pos: 'n.' },
                'cats': { zh: '猫（复数）', pos: 'n.' },
                'bird': { zh: '鸟', pos: 'n.' },
                'fish': { zh: '鱼', pos: 'n.' },
                'human': { zh: '人类', pos: 'n.' },
                'friend': { zh: '朋友', pos: 'n.' },
                'family': { zh: '家庭', pos: 'n.' },
                'food': { zh: '食物', pos: 'n.' },
                'money': { zh: '钱', pos: 'n.' },
                'time': { zh: '时间', pos: 'n.' },
                'day': { zh: '天', pos: 'n.' },
                'night': { zh: '夜晚', pos: 'n.' },
                'name': { zh: '名字', pos: 'n.' },
                'word': { zh: '单词', pos: 'n.' },
                'language': { zh: '语言', pos: 'n.' },
                'english': { zh: '英语', pos: 'n.' },
                'chinese': { zh: '中文', pos: 'n.' },
                'school': { zh: '学校', pos: 'n.' },
                'student': { zh: '学生', pos: 'n.' },
                'teacher': { zh: '老师', pos: 'n.' },
                'head': { zh: '头', pos: 'n.' },
                'hair': { zh: '头发', pos: 'n.' },
                'face': { zh: '脸', pos: 'n.' },
                'eye': { zh: '眼睛', pos: 'n.' },
                'ear': { zh: '耳朵', pos: 'n.' },
                'nose': { zh: '鼻子', pos: 'n.' },
                'mouth': { zh: '嘴巴', pos: 'n.' },
                'hand': { zh: '手', pos: 'n.' },
                'arm': { zh: '手臂', pos: 'n.' },
                'leg': { zh: '腿', pos: 'n.' },
                'foot': { zh: '脚', pos: 'n.' },
                'heart': { zh: '心脏', pos: 'n.' },
                'brain': { zh: '大脑', pos: 'n.' },
                'penis': { zh: '阴茎', pos: 'n.' },
                'vagina': { zh: '阴道', pos: 'n.' },
                'happy': { zh: '快乐的', pos: 'adj.' },
                'sad': { zh: '悲伤的', pos: 'adj.' },
                'angry': { zh: '生气的', pos: 'adj.' },
                'beautiful': { zh: '美丽的', pos: 'adj.' },
                'ugly': { zh: '丑陋的', pos: 'adj.' },
                'big': { zh: '大的', pos: 'adj.' },
                'small': { zh: '小的', pos: 'adj.' },
                'tall': { zh: '高的', pos: 'adj.' },
                'short': { zh: '矮的', pos: 'adj.' },
                'fast': { zh: '快的', pos: 'adj.' },
                'slow': { zh: '慢的', pos: 'adj.' },
                'hot': { zh: '热的', pos: 'adj.' },
                'cold': { zh: '冷的', pos: 'adj.' },
                'new': { zh: '新的', pos: 'adj.' },
                'old': { zh: '旧的', pos: 'adj.' },
                'good': { zh: '好的', pos: 'adj.' },
                'bad': { zh: '坏的', pos: 'adj.' },
                'right': { zh: '对的', pos: 'adj.' },
                'wrong': { zh: '错的', pos: 'adj.' },
                'hello': { zh: '你好', pos: 'int.' },
                'hi': { zh: '嗨', pos: 'int.' },
                'bye': { zh: '再见', pos: 'int.' },
                'thanks': { zh: '谢谢', pos: 'int.' },
                'please': { zh: '请', pos: 'adv.' },
                'sorry': { zh: '对不起', pos: 'adj.' },
                'yes': { zh: '是的', pos: 'adv.' },
                'no': { zh: '不', pos: 'adv.' },
                'ok': { zh: '好的', pos: 'adj.' },
                'and': { zh: '和', pos: 'conj.' },
                'or': { zh: '或者', pos: 'conj.' },
                'but': { zh: '但是', pos: 'conj.' },
                'the': { zh: '这；那', pos: 'art.' },
                'a': { zh: '一个', pos: 'art.' },
                'an': { zh: '一个', pos: 'art.' },
                'not': { zh: '不', pos: 'adv.' },
                'very': { zh: '非常', pos: 'adv.' },
                'up': { zh: '向上', pos: 'adv.' },
                'down': { zh: '向下', pos: 'adv.' },
                'in': { zh: '在……里面', pos: 'prep.' },
                'out': { zh: '外面', pos: 'adv.' },
                'on': { zh: '在……上面', pos: 'prep.' },
                'off': { zh: '离开；关掉', pos: 'adv.' },
                'cut off': { zh: '切掉', pos: 'phrase' },
                'put on': { zh: '穿上', pos: 'phrase' },
                'take off': { zh: '脱下', pos: 'phrase' },
                'turn on': { zh: '打开', pos: 'phrase' },
                'turn off': { zh: '关闭', pos: 'phrase' },
                'look for': { zh: '寻找', pos: 'phrase' },
                'wait for': { zh: '等待', pos: 'phrase' },
                'give up': { zh: '放弃', pos: 'phrase' },
                'get up': { zh: '起床', pos: 'phrase' },
                'sit down': { zh: '坐下', pos: 'phrase' },
                'stand up': { zh: '站起来', pos: 'phrase' },
                'come in': { zh: '进来', pos: 'phrase' },
                'go out': { zh: '出去', pos: 'phrase' },
                'come back': { zh: '回来', pos: 'phrase' },
                'wake up': { zh: '醒来', pos: 'phrase' },
                'grow up': { zh: '长大', pos: 'phrase' },
                'hurry up': { zh: '快点', pos: 'phrase' },
                'clean up': { zh: '清理', pos: 'phrase' },
                'find out': { zh: '发现', pos: 'phrase' },
                'work out': { zh: '解决', pos: 'phrase' },
                'break up': { zh: '分手', pos: 'phrase' },
                'make up': { zh: '编造', pos: 'phrase' },
                'show up': { zh: '出现', pos: 'phrase' },
                'good morning': { zh: '早上好', pos: 'phrase' },
                'good afternoon': { zh: '下午好', pos: 'phrase' },
                'good evening': { zh: '晚上好', pos: 'phrase' },
                'good night': { zh: '晚安', pos: 'phrase' },
                'thank you': { zh: '谢谢你', pos: 'phrase' },
                'how are you': { zh: '你好吗？', pos: 'phrase' },
                'i love you': { zh: '我爱你', pos: 'phrase' },
                'i miss you': { zh: '我想你', pos: 'phrase' },
                'nice to meet you': { zh: '很高兴认识你', pos: 'phrase' },
                'see you': { zh: '再见', pos: 'phrase' },
                'excuse me': { zh: '打扰一下', pos: 'phrase' },
                'no problem': { zh: '没问题', pos: 'phrase' },
                'of course': { zh: '当然', pos: 'phrase' },
                'happy birthday': { zh: '生日快乐', pos: 'phrase' },
                'merry christmas': { zh: '圣诞快乐', pos: 'phrase' },
                'happy new year': { zh: '新年快乐', pos: 'phrase' },
                'long time no see': { zh: '好久不见', pos: 'phrase' },
                'take care': { zh: '保重', pos: 'phrase' },
                'good luck': { zh: '祝你好运', pos: 'phrase' },
                'well done': { zh: '做得好', pos: 'phrase' },
                'come on': { zh: '加油', pos: 'phrase' },
                'hold on': { zh: '等一下', pos: 'phrase' },
                'never mind': { zh: '没关系', pos: 'phrase' },
            };

            const REVERSE_DICT = {};
            for (const [en, data] of Object.entries(DICT)) {
                const zhList = data.zh.split(/[；;]/).map(s => s.trim()).filter(Boolean);
                for (const zh of zhList) {
                    const cleanZh = zh.replace(/（.*?）|\(.*?\)/g, '').trim();
                    if (!cleanZh) continue;
                    if (!REVERSE_DICT[cleanZh]) REVERSE_DICT[cleanZh] = [];
                    if (!REVERSE_DICT[cleanZh].includes(en)) REVERSE_DICT[cleanZh].push(en);
                }
            }

            function detectLanguage(text) {
                if (/[\u4e00-\u9fa5]/.test(text)) return 'zh';
                if (/[a-zA-Z]/.test(text)) return 'en';
                return 'unknown';
            }
            function isEnglishPhrase(text) { return /^[a-zA-Z\s\-'.]+$/.test(text.trim()) && /[a-zA-Z]/.test(text); }
            function isChinesePhrase(text) { return /^[\u4e00-\u9fa5\s，。！？、；：""''（）《》\d]+$/.test(text.trim()) && /[\u4e00-\u9fa5]/.test(text); }

            function lemmatize(word) {
                const w = word.toLowerCase();
                const noApos = w.replace(/'/g, '');
                if (DICT[noApos]) return noApos;
                if (DICT[w]) return w;
                if (w.endsWith('ies') && w.length > 4) { const b = w.slice(0, -3) + 'y'; if (DICT[b]) return b; }
                if (w.endsWith('es') && w.length > 3) { const b = w.slice(0, -2); if (DICT[b]) return b; }
                if (w.endsWith('s') && w.length > 2) { const b = w.slice(0, -1); if (DICT[b]) return b; }
                if (w.endsWith('ing') && w.length > 4) {
                    const b1 = w.slice(0, -3); if (DICT[b1]) return b1;
                    const b2 = w.slice(0, -3) + 'e'; if (DICT[b2]) return b2;
                }
                if (w.endsWith('ed') && w.length > 3) {
                    const b1 = w.slice(0, -2); if (DICT[b1]) return b1;
                    const b2 = w.slice(0, -1); if (DICT[b2]) return b2;
                }
                return w;
            }

            function translateEnToZh(text) {
                const cleaned = text.trim().replace(/[.?!,;:'"]+$/, '').trim();
                const key = cleaned.toLowerCase();
                if (DICT[key]) return { ok: true, src: text, dst: DICT[key].zh, pos: DICT[key].pos, type: 'word' };
                const lemma = lemmatize(key);
                if (lemma !== key && DICT[lemma]) return { ok: true, src: text, dst: DICT[lemma].zh, pos: DICT[lemma].pos, type: 'word' };
                const words = cleaned.split(/\s+/);
                if (words.length > 0) {
                    const parts = [];
                    let allFound = true;
                    let i = 0;
                    while (i < words.length) {
                        if (i + 1 < words.length) {
                            const twoWord = (words[i] + ' ' + words[i+1]).replace(/[.?!,;:"]+$/g, '').toLowerCase();
                            if (DICT[twoWord]) { parts.push(DICT[twoWord].zh); i += 2; continue; }
                        }
                        const wClean = words[i].replace(/[.?!,;:"]+$/g, '').toLowerCase();
                        const wLemma = lemmatize(wClean);
                        if (DICT[wClean]) parts.push(DICT[wClean].zh);
                        else if (DICT[wLemma]) parts.push(DICT[wLemma].zh);
                        else if (wClean.includes("'")) {
                            const noApos = wClean.replace(/'/g, '');
                            if (DICT[noApos]) parts.push(DICT[noApos].zh);
                            else { parts.push(words[i]); allFound = false; }
                        }
                        else { parts.push(words[i]); allFound = false; }
                        i++;
                    }
                    if (allFound) return { ok: true, src: text, dst: parts.join(''), pos: 'phrase', type: 'sentence' };
                }
                return { ok: false, src: text };
            }

            function translateZhToEn(text) {
                const cleaned = text.trim().replace(/[。，！？、；：""''（）《》]+$/g, '').trim();
                if (REVERSE_DICT[cleaned]) return { ok: true, src: text, dst: REVERSE_DICT[cleaned][0], pos: '', type: 'phrase' };
                const stripped = cleaned.replace(/[吗呢吧啊哦嗯呀哇]+$/g, '');
                if (REVERSE_DICT[stripped]) return { ok: true, src: text, dst: REVERSE_DICT[stripped][0], pos: '', type: 'phrase' };
                for (const [zh, enList] of Object.entries(REVERSE_DICT)) {
                    if (cleaned.includes(zh) && zh.length >= 2) {
                        return { ok: true, src: text, dst: enList[0], pos: '', type: 'partial', note: `（包含“${zh}”）` };
                    }
                }
                return { ok: false, src: text };
            }

            // 中英混搭翻译
            function translateMixed(text) {
                const cleaned = text.trim().replace(/[。，！？、；：""''（）《》.?!,;:'"]+$/g, '').trim();
                if (!cleaned) return null;

                const segments = cleaned.match(/[\u4e00-\u9fa5]+|[a-zA-Z']+|\s+|[^\u4e00-\u9fa5a-zA-Z\s]+/g);
                if (!segments) return null;

                const parts = [];
                let hasTranslatedEn = false;

                for (const seg of segments) {
                    if (/^\s+$/.test(seg)) continue;
                    if (/[\u4e00-\u9fa5]/.test(seg)) {
                        parts.push(seg);
                        continue;
                    }
                    if (/[a-zA-Z']/.test(seg)) {
                        const lower = seg.toLowerCase();
                        if (DICT[lower]) {
                            parts.push(DICT[lower].zh);
                            hasTranslatedEn = true;
                            continue;
                        }
                        const lemma = lemmatize(lower);
                        if (lemma !== lower && DICT[lemma]) {
                            parts.push(DICT[lemma].zh);
                            hasTranslatedEn = true;
                            continue;
                        }
                        const noApos = lower.replace(/'/g, '');
                        if (DICT[noApos]) {
                            parts.push(DICT[noApos].zh);
                            hasTranslatedEn = true;
                            continue;
                        }
                        parts.push(seg);
                        continue;
                    }
                    parts.push(seg);
                }

                if (!hasTranslatedEn) return null;

                return {
                    from: 'mixed',
                    to: 'zh',
                    src: text,
                    dst: parts.join(''),
                    pos: '混搭',
                    type: 'mixed'
                };
            }

            function detectTranslateIntent(text) {
                const zh2en = [/用英语怎么说/, /英语怎么说/, /英文怎么说/, /英语是什么/, /英文是什么/, /的英语/, /的英文/, /翻译成英语/, /翻译成英文/, /怎么说/i];
                const en2zh = [/什么意思/, /啥意思/, /是什么/, /中文/, /翻译/, /释义/, /meaning/i];
                for (const p of zh2en) if (p.test(text)) return 'zh2en';
                for (const p of en2zh) if (p.test(text)) return 'en2zh';
                if (isEnglishPhrase(text) && detectLanguage(text) === 'en') return 'en2zh';
                if (isChinesePhrase(text) && detectLanguage(text) === 'zh') return 'zh2en';
                return null;
            }

            function extractQuery(text) {
                let q = text;
                const removePatterns = [/什么意思/g, /啥意思/g, /是什么意思/g, /是什么/g, /用英语怎么说/g, /英语怎么说/g, /英文怎么说/g, /英语是什么/g, /英文是什么/g, /的英语/g, /的英文/g, /翻译成英语/g, /翻译成英文/g, /翻译一下/g, /中文/g, /翻译/g, /释义/g];
                for (const p of removePatterns) q = q.replace(p, ' ');
                return q.trim().replace(/[.?!,;:'"]+$/, '').replace(/[。，！？、；：]+$/g, '').trim();
            }

            function translate(text) {
                const hasZh = /[\u4e00-\u9fa5]/.test(text);
                const hasEn = /[a-zA-Z]/.test(text);
                if (hasZh && hasEn) {
                    const mixed = translateMixed(text);
                    if (mixed) return mixed;
                }
                const intent = detectTranslateIntent(text);
                if (!intent) return null;
                const query = extractQuery(text);
                if (!query) return null;
                if (intent === 'en2zh') {
                    const r = translateEnToZh(query);
                    if (r.ok) return { from: 'en', to: 'zh', ...r };
                } else if (intent === 'zh2en') {
                    const r = translateZhToEn(query);
                    if (r.ok) return { from: 'zh', to: 'en', ...r };
                }
                return null;
            }

            function findAnswer(question) {
                const lowerQ = question.toLowerCase();
                const kb = [
                    { keywords: ['你好', '嗨', 'hello', 'hi'], answer: '你好呀！😊 我是欠揍AI。输入数学表达式、英语单词或问题试试！' },
                    { keywords: ['你的名字', '你是谁', '你叫什么'], answer: '我是欠揍AI，内置 AST 递推分解器 + 中英词典。支持数学、编程、历史、生物、政治、中英互译（含中英混搭）。' },
                    { keywords: ['谢谢', '感谢', 'thanks'], answer: '不客气！能帮到你我很开心。😊' },
                    { keywords: ['再见', '拜拜', 'bye'], answer: '再见！有问题随时找我。👋' },
                    { keywords: ['动态规划', 'dp', 'dynamic programming'], answer: '动态规划是一种算法，用高效的每层剪枝来弥补穷举的效率慢，避免子问题答案复用。动态规划（DP）也分为很多种类，如：线性、背包等。' },
                    { keywords: ['贪心', '贪心算法', 'greedy'], answer: '贪心是一种很“短视”的算法，他依靠局部最优解来达到近似全局最优解。对于当前选择不会影响后面全局的题目来说，贪心是可以绝对AC的；但是：如果遇到0/1背包这种问题，贪心就只能骗骗分了，这种要动态规划（DP）来做，才能AC。' },
                    { keywords: ['二分', '二分查找'], answer: '二分查找是一种在有序数组中查找元素的算法，每次比较中间元素，将搜索范围减半。时间复杂度 O(log n)。' },
                    { keywords: ['排序', '冒泡排序', '快速排序'], answer: '常见排序算法：\n• 冒泡排序：O(n²)，稳定。\n• 快速排序：平均 O(n log n)，不稳定。\n• 归并排序：O(n log n)，稳定。' },
                    { keywords: ['时间复杂度', '大o'], answer: '时间复杂度衡量算法运行时间随输入规模的增长趋势。常见：O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)。' },
                    { keywords: ['链表'], answer: '链表是一种线性数据结构，节点包含数据和指向下一节点的指针。优点：插入删除 O(1)；缺点：随机访问 O(n)。' },
                    { keywords: ['栈', 'stack', '队列', 'queue'], answer: '栈（Stack）：后进先出（LIFO）。\n队列（Queue）：先进先出（FIFO）。' },
                    { keywords: ['哈希', '哈希表'], answer: '哈希表通过哈希函数将键映射到数组下标，实现平均 O(1) 的插入、删除、查找。' },
                    { keywords: ['树', '二叉树', 'bst'], answer: '二叉树：每个节点最多两个子节点。\n二叉搜索树（BST）：左 < 根 < 右。\n平衡树：AVL 树、红黑树。' },
                    { keywords: ['图', 'dfs', 'bfs'], answer: 'DFS（深度优先）：用栈/递归。\nBFS（广度优先）：用队列。\n最短路：Dijkstra、Bellman-Ford、Floyd。' },
                    { keywords: ['递归', 'recursion'], answer: '递归是函数调用自身的编程技巧。必须有：① 基准情况；② 递归情况。典型例子：阶乘、斐波那契、汉诺塔。' },
                    { keywords: ['python'], answer: 'Python 是一种高级、解释型、动态类型的编程语言，语法简洁易读。广泛用于数据分析、AI、Web、自动化脚本。' },
                    { keywords: ['c++', 'cpp'], answer: 'C++ 是一种编译型、静态类型、多范式编程语言，性能极高。广泛用于游戏引擎、操作系统、竞赛编程。' },
                    { keywords: ['java'], answer: 'Java 是一种面向对象、编译型、跨平台的语言，靠 JVM 实现“一次编写，到处运行”。' },
                    { keywords: ['javascript', 'js', '前端'], answer: 'JavaScript 是 Web 前端核心语言，也可用 Node.js 做后端。' },
                    { keywords: ['操作系统', 'os', '进程', '线程', '死锁'], answer: '操作系统管理硬件和软件资源。\n进程：资源分配单位，独立地址空间。\n线程：CPU 调度单位，共享进程资源。\n死锁四个条件：互斥、占有并等待、非抢占、循环等待。' },
                    { keywords: ['计算机网络', 'tcp', 'udp', 'http', 'https'], answer: 'TCP：面向连接、可靠、有序，三次握手四次挥手。\nUDP：无连接、不可靠、快。\nHTTP：应用层协议，无状态。\nHTTPS = HTTP + TLS/SSL，加密传输。' },
                    { keywords: ['人类身体组成', '人体组成', '人体结构'], answer: '人体由九大系统组成：运动、消化、呼吸、循环、泌尿、神经、内分泌、免疫、感觉器官。\n\n男性特有：睾丸、前列腺等，睾酮水平较高。\n女性特有：卵巢、子宫等，雌激素水平较高，有月经周期。' },
                    { keywords: ['男女生身体区别', '男女身体差异'], answer: '男女生理主要区别：\n1. 染色体：男性 XY，女性 XX\n2. 生殖系统：男性有睾丸，女性有卵巢、子宫\n3. 激素：男性睾酮为主，女性雌激素为主\n4. 第二性征：男性喉结、胡须；女性乳房发育、骨盆宽\n5. 女性有月经周期，可怀孕生育' },
                    { keywords: ['蒋介石', '蒋中正'], answer: '蒋介石（1887—1975），字中正，浙江奉化人。\n• 早年留学日本，加入同盟会\n• 1924年任黄埔军校校长\n• 1927年发动"四一二"政变\n• 1928年北伐成功\n• 1937—1945年领导抗日战争\n• 1949年败退台湾，1975年病逝于台北' },
                    { keywords: ['汪精卫', '汪兆铭'], answer: '汪精卫（1883—1944），名兆铭，广东三水人。\n• 早年加入同盟会，刺杀摄政王载沣\n• 1925年任国民政府主席\n• 1938年投敌叛国\n• 1940年成立汪伪国民政府\n• 1944年病死于日本\n• 历史定性：民族罪人' },
                    { keywords: ['秦始皇', '嬴政'], answer: '秦始皇（前259—前210），中国历史上第一位皇帝，统一六国（前221年），建立秦朝。推行郡县制、统一文字、货币、度量衡。' },
                    { keywords: ['唐朝有哪些皇帝', '唐朝皇帝'], answer: '唐朝（618—907）共21位皇帝（含武则天）：\n高祖李渊、太宗李世民、高宗李治、中宗李显、睿宗李旦、武则天、玄宗李隆基、肃宗李亨、代宗李豫、德宗李适、顺宗李诵、宪宗李纯、穆宗李恒、敬宗李湛、文宗李昂、武宗李炎、宣宗李忱、懿宗李漼、僖宗李儇、昭宗李晔、哀帝李柷' },
                    { keywords: ['明朝有哪些皇帝', '明朝皇帝'], answer: '明朝（1368—1644）共16位皇帝：\n太祖朱元璋、惠帝朱允炆、成祖朱棣、仁宗朱高炽、宣宗朱瞻基、英宗朱祁镇、代宗朱祁钰、宪宗朱见深、孝宗朱祐樘、武宗朱厚照、世宗朱厚熜、穆宗朱载坖、神宗朱翊钧、光宗朱常洛、熹宗朱由校、思宗朱由检' },
                    { keywords: ['清朝有哪些皇帝', '清朝皇帝'], answer: '清朝（1636—1912）共12位皇帝：\n太祖努尔哈赤、太宗皇太极、世祖福临（顺治）、圣祖玄烨（康熙）、世宗胤禛（雍正）、高宗弘历（乾隆）、仁宗颙琰（嘉庆）、宣宗旻宁（道光）、文宗奕詝（咸丰）、穆宗载淳（同治）、德宗载湉（光绪）、逊帝溥仪（宣统）' },
                    { keywords: ['牛顿', '万有引力'], answer: '牛顿（1643—1727），英国物理学家、数学家。\n• 牛顿三大运动定律。\n• 万有引力定律。\n• 与莱布尼茨独立发明微积分。' },
                    { keywords: ['爱因斯坦', '相对论'], answer: '爱因斯坦（1879—1955），德裔美国物理学家。\n• 1905奇迹年：狭义相对论、光电效应。\n• 1915广义相对论。\n• 质能方程 E=mc²。' },
                ];
                for (let item of kb) {
                    for (let kw of item.keywords) {
                        if (lowerQ.includes(kw.toLowerCase())) return item.answer;
                    }
                }
                return null;
            }

            function findKnowledge(question) {
                const kb = window.KNOWLEDGE;
                if (!Array.isArray(kb)) return null;
                const lowerQ = String(question || '').toLowerCase().trim();
                if (!lowerQ) return null;
                let best = null;
                let bestScore = 0;
                for (const item of kb) {
                    if (!item || typeof item !== 'object') continue;
                    const title = String(item.title || '').trim();
                    const tags = Array.isArray(item.tags) ? item.tags : [];
                    const text = String(item.text || '');
                    const titleLower = title.toLowerCase();
                    let score = 0;
                    for (const t of tags) {
                        const tt = String(t).trim().toLowerCase();
                        // 精确标签命中（权重最高）
                        if (tt && lowerQ.includes(tt)) score += 4;
                    }
                    if (titleLower && lowerQ.includes(titleLower)) score += 6;
                    // 问题本身就是标题的一部分（如“二分查找”命中“什么是二分查找”）
                    if (titleLower && lowerQ.length >= 2 && titleLower.includes(lowerQ.slice(0, 3))) score += 2;
                    // 标题前两个字命中问题
                    if (titleLower && lowerQ.includes(titleLower.slice(0, 2))) score += 1;
                    if (score > 0 && score > bestScore) {
                        bestScore = score;
                        best = { text, title };
                    }
                }
                if (best) {
                    return '知识库「' + best.title + '」：\n\n' + best.text + '\n\n知识库采用日历午后（https://riliwuhou.de5.net)v4.0.8版本知识库，由焦梓睿提供';
                }
                return null;
            }

            function handleUserMessage() {
                const rawText = userInput.value.trim();
                if (rawText === '') return;

                const userMsg = { sender: 'user', type: 'text', text: rawText };
                addMessageToChat(userMsg, true);
                userInput.value = '';
                userInput.focus();

                showTypingIndicator();

                setTimeout(() => {
                    removeTypingIndicator();

                    if (isMathExpression(rawText)) {
                        const mathResult = solveMath(rawText);
                        if (mathResult.success) {
                            const formatted = formatMathResult(rawText, mathResult.result);
                            addMessageToChat({ sender: 'bot', type: 'math', data: formatted }, true);
                            return;
                        }
                    }

                    const transResult = translate(rawText);
                    if (transResult) {
                        if (transResult.from === 'zh' && transResult.to === 'en') {
                            transResult.dst = transResult.dst.charAt(0).toUpperCase() + transResult.dst.slice(1);
                        }
                        addMessageToChat({ sender: 'bot', type: 'translate', data: transResult }, true);
                        return;
                    }

                    const answer = findAnswer(rawText);
                    if (answer !== null) {
                        addMessageToChat({ sender: 'bot', type: 'text', text: answer }, true);
                        return;
                    }

                    const kbAnswer = findKnowledge(rawText);
                    if (kbAnswer !== null) {
                        addMessageToChat({ sender: 'bot', type: 'text', text: kbAnswer }, true);
                        return;
                    }

                    addMessageToChat({
                        sender: 'bot',
                        type: 'text',
                        text: `这个问题我不太确定，你可以复制以下问题去问 DeepSeek：\n\n「${rawText}」\n\n官网：https://chat.deepseek.com/`
                    }, true);
                }, 400);
            }

            function showTypingIndicator() {
                const indicatorDiv = document.createElement('div');
                indicatorDiv.classList.add('message', 'bot');
                indicatorDiv.id = 'typingIndicator';
                const avatarDiv = document.createElement('div');
                avatarDiv.classList.add('avatar');
                avatarDiv.textContent = '🤖';
                const bubbleDiv = document.createElement('div');
                bubbleDiv.classList.add('bubble');
                bubbleDiv.style.display = 'flex';
                bubbleDiv.style.alignItems = 'center';
                bubbleDiv.style.gap = '6px';
                bubbleDiv.innerHTML = `
                    <span style="color:var(--text-secondary);">思考中</span>
                    <div class="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                `;
                indicatorDiv.appendChild(avatarDiv);
                indicatorDiv.appendChild(bubbleDiv);
                chatArea.appendChild(indicatorDiv);
                chatArea.scrollTop = chatArea.scrollHeight;
            }

            function removeTypingIndicator() {
                const indicator = document.getElementById('typingIndicator');
                if (indicator) indicator.remove();
            }

            document.querySelectorAll('.nav-item').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                    document.getElementById('page-' + btn.dataset.page).classList.add('active');
                });
            });

            themeToggle.addEventListener('click', () => {
                isLight = !isLight;
                document.body.classList.toggle('light-theme', isLight);
                themeToggle.textContent = isLight ? '☀️ 浅色' : '🌙 深色';
                try { localStorage.setItem('qianzou_ai_theme', isLight ? 'light' : 'dark'); } catch (e) {}
            });

            newChatBtn.addEventListener('click', () => { createNewChat(true); });
            sendBtn.addEventListener('click', handleUserMessage);
            userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); handleUserMessage(); }
            });

            window.addEventListener('load', () => {
                // 恢复主题偏好（存入缓存）
                try {
                    const savedTheme = localStorage.getItem('qianzou_ai_theme');
                    if (savedTheme === 'light') {
                        isLight = true;
                        document.body.classList.add('light-theme');
                        themeToggle.textContent = '☀️ 浅色';
                    }
                } catch (e) {}
                loadChats();
                userInput.focus();
            });
        })();
    