/* tests/rt.js — проверка сборки перед выдачей.
   Запуск из корня репозитория:  npm i jsdom  &&  node tests/rt.js
   Код выхода 0 — всё зелёное. */
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..'), A = f => path.join(ROOT, 'assets', f);
let fail = 0, pass = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ок   ' + m); } else { fail++; console.log('  СБОЙ ' + m); } };
const MODS = ['boot', 'ark-eras', 'ark-scales', 'ark-rules', 'ark-lore', 'ark-map', 'ark-script', 'ark-jerian', 'ark-wire'];
const app = fs.readFileSync(A('app.js'), 'utf8');

console.log('1. Синтаксис');
for (const m of MODS) {
  let good = true; try { cp.execFileSync(process.execPath, ['--check', A(m + '.js')], { stdio: 'pipe' }); } catch (e) { good = false; }
  ok(good, m + '.js');
}
{ let good = true; try { cp.execFileSync(process.execPath, ['--input-type=module', '--check'], { input: app, stdio: ['pipe', 'pipe', 'pipe'] }); } catch (e) { good = false; } ok(good, 'app.js (модуль)'); }

console.log('2. Порядок подключения в index.html');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const order = [...html.matchAll(/assets\/([\w-]+)\.js/g)].map(m => m[1]);
ok(JSON.stringify(order) === JSON.stringify(MODS.concat('app')), order.join(' → '));

console.log('3. Глобалы и коллизии имён');
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><body><div id="root"></div></body>', { runScripts: 'outside-only', url: 'http://localhost/' });
const W = dom.window;
for (const m of MODS) W.eval(fs.readFileSync(A(m + '.js'), 'utf8'));
for (const g of ['ARK_ERAS', 'ARK_TRAITS', 'ARK_RULES', 'ARK_CANON', 'ARK_GEO', 'ARK_SCRIPT', 'ARK_JERIAN', 'ARK_WIRE', 'arkPromptEra'])
  ok(typeof W.eval('typeof ' + g) === 'string' && W.eval('typeof ' + g) !== 'undefined', g + ' определён');
ok(typeof W.ARK_MAP === 'string' && /map\.webp/.test(W.ARK_MAP), 'ARK_MAP остался путём к картинке карты (старая карта в игре)');
ok(W.ARK_LORE === undefined, 'глобального ARK_LORE нет — не спорит с const в app.js');

console.log('4. Ремни: справа не больше пяти');
const E = W.ARK_ERAS;
const a = app.indexOf('var ARK_TABS_L='), b = app.indexOf('})();', app.indexOf('var ARK_TABS_R=')) + 5;
W.eval(app.slice(a, b).replace('var ARK_TABS_L', 'window.ARK_TABS_L').replace('var ARK_TABS_R', 'window.ARK_TABS_R'));
const vis = (l, ch, y) => l.filter(t => (!t.when || t.when(ch, y)) && (!t.sec || E.has(y, t.sec)));
let maxR = 0;
for (let y = 1; y <= 1182; y += 7) for (const ch of [{}, { revolt: { active: 1 }, gift: { mage: 1 } }])
  maxR = Math.max(maxR, vis(W.ARK_TABS_R, ch, y).length);
ok(maxR <= 5, 'максимум справа: ' + maxR);

console.log('5. Эпохальный фильтр: будущее не попадает в наказ');
let leak = 0;
for (let y = 1; y <= 1182; y++) for (const mo of E.months) {
  const t = W.arkPromptEra(y, mo);
  for (const mm of t.matchAll(/(?<![\d–-])(\d{3,4})(?![\d])/g)) if (+mm[1] > y) leak++;
}
ok(leak === 0, 'дат позже года партии: ' + leak);
const cpA = app.indexOf('const Cp=`'), cpB = app.indexOf('`,', app.indexOf('━━━ МИР'));
const loreA = app.indexOf('const ARK_LORE=`'), loreB = app.indexOf('`;', loreA);
const staticText = app.slice(cpA, cpB) + app.slice(loreA, loreB);
ok(!/115[1-9]|116\d|117\d/.test(staticText.replace(/~?1150 лет/g, '')), 'в МИР и ARK_LORE нет дат после 1150');

console.log('6. Решённый канон');
ok(!app.includes('3 перерождения') && !app.includes('обратима 3 раза'), 'нет «трёх перерождений»');
ok(app.includes('обратима 4 раза') && app.includes('5-я смерть — Истинная'), 'четыре малые, пятая истинная');
ok(app.includes('n:4,t:"Последний шанс"') && app.includes('Math.min(4,(S.deaths'), 'шкала смертей и kill до четырёх');
ok(app.includes('Основана Джорианом'), 'основатель — Джориан');
ok(!app.includes('Схемы=Решительность'), 'в наказе «Тайные планы», не «Схемы»');
ok(/пятая смерть — истинная/.test(W.ARK_RULES.rule('four_lives').rule), 'библия: четыре малые, пятая истинная');
ok(/эпоха/.test(W.ARK_RULES.rule('magic_forbidden').rule), 'библия: закон о магии зависит от эпохи');
const all = MODS.map(m => fs.readFileSync(A(m + '.js'), 'utf8')).join('\n');
ok(!/[а-яё][a-z]{2,}[а-яё]/i.test(all.replace(/\\n/g, ' ')), 'нет латиницы внутри русских слов');

console.log('7. Системные блоки Мастера');
const blocks = W.ARK_WIRE.systemBlocks('ДИНАМИКА', 1140, 'ЛОР');
ok(blocks.length === 4 && blocks[0].text.startsWith('ПРАВИЛА ПРОЕКТА'), 'первым идёт библия');
ok(blocks[1].text === 'ЛОР' && /канон этого времени/.test(blocks[2].text), 'затем ARK_LORE, затем артбук');
ok(blocks[2].cache_control && !blocks[3].cache_control && blocks[3].text === 'ДИНАМИКА', 'кеш на последнем статичном блоке, наказ — последним');
const early = W.ARK_WIRE.canonBlock(400);
ok(/ТОЛЬКО ВНЕВРЕМЕННОЕ/.test(early) && !/Уттер/.test(early), 'в 400 г. из артбука только вневременное');

console.log('8. Справка из текстов игр');
const S = require(A('ark-script.js')); S.path = path.join(ROOT, 'script', 'blocks.json');
W.ARK_SCRIPT.search = S.search; W.ARK_SCRIPT.styleSamples = S.styleSamples;
W.ARK_JERIAN.path = path.join(ROOT, 'jerian', 'scenes.json');
(async () => {
  const r1140 = await W.ARK_WIRE.reference('Сестра Жанна причастие', 1140);
  ok(/СПРАВКА ИЗ ТЕКСТОВ ИГР/.test(r1140) && /канон этого времени/.test(r1140), '1140 г.: образцы Бранте есть');
  const r900 = await W.ARK_WIRE.reference('Сестра Жанна причастие', 900);
  ok(r900 === '', '900 г.: Бранте — будущее, справки нет');

  console.log('9. Отрисовка');
  const errs = [];
  const { VirtualConsole } = require('jsdom'); const vc = new VirtualConsole();
  vc.on('jsdomError', e => errs.push(e.message));
  const inl = n => '<script>' + fs.readFileSync(A(n + '.js'), 'utf8').replace(/<\/script/g, '<\\/script') + '</script>';
  const page = '<!doctype html><html><head></head><body><div id="root"></div>' + MODS.map(inl).join('') + inl('app') + '</body></html>';
  const w2 = new JSDOM(page, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/', virtualConsole: vc }).window;
  await new Promise(r => setTimeout(r, 1500));
  const txt = w2.document.getElementById('root').textContent.replace(/\s+/g, ' ').trim();
  ok(txt.length > 20, 'экран отрисован: «' + txt.slice(0, 60) + '…»');
  ok(errs.length === 0, 'ошибок при запуске: ' + errs.length + (errs[0] ? ' — ' + errs[0].slice(0, 120) : ''));

  console.log('\nИтог: ' + pass + ' ок, ' + fail + ' сбоев');
  process.exit(fail ? 1 : 0);
})();
