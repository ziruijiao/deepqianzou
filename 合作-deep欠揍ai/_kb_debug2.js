global.window = global;
require(process.argv[3]);
// 复刻 script.js 中当前的 findKnowledge
function findKnowledge(question) {
  const kb = window.KNOWLEDGE;
  if (!Array.isArray(kb)) return null;
  const lowerQ = String(question || '').toLowerCase().trim();
  if (!lowerQ) return null;
  let best = null; let bestScore = 0;
  for (const item of kb) {
    if (!item || typeof item !== 'object') continue;
    const title = String(item.title || '');
    const tags = Array.isArray(item.tags) ? item.tags : [];
    const text = String(item.text || '');
    const titleLower = title.toLowerCase();
    let score = 0;
    for (const t of tags) { const tt = String(t).toLowerCase(); if (tt && lowerQ.includes(tt)) score += 4; }
    if (titleLower && lowerQ.includes(titleLower)) score += 6;
    if (titleLower && lowerQ.length >= 2 && titleLower.includes(lowerQ.slice(0, 3))) score += 2;
    if (titleLower && lowerQ.includes(titleLower.slice(0, 2))) score += 1;
    if (score > 0 && score > bestScore) { bestScore = score; best = { text, title }; }
  }
  if (best) return { title: best.title, text: best.text, score: bestScore };
  return null;
}
const qs = ['不合逻辑类病句辨析','病句辨析','新文化运动核心要点','一次函数图像性质','秦岭—淮河一线地理意义','分式有意义条件'];
for (const q of qs) {
  const r = findKnowledge(q);
  console.log('Q:', q, '=>', r ? ('HIT['+r.title+'] score='+r.score+' :: '+r.text.slice(0,30)) : 'MISS');
}