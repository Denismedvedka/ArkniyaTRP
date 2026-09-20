/* ark-jerian.js — сцены «The Life and Suffering of Prince Jerian».
   В отличие от ark-script.js (плоский текст Бранте), здесь полная структура:
   сцена → абзацы → варианты выбора → текст последствий каждого варианта.

   ПРИОРИТЕТ ИСТОЧНИКОВ (жёсткое правило):
     1. Библия проекта и правила в системном промпте — высшая инстанция.
     2. ARK_LORE — канон артбука.
     3. Этот модуль — материал игры: интонация, детали, устройство сцен.
   Если текст сцены расходится с библией — прав промпт, а не текст.
   Это правило вшито в выдачу инструмента, чтобы мастер не спорил с правилами,
   опираясь на найденный фрагмент.

   Данные: jerian/scenes.json (92 сцены, ~5.2 МБ), грузятся лениво.
   Покрытие: главы I–III. Глав IV «Кредо» и V «Тысячелетний сенат» в файле нет. */
(function (root) {
  'use strict';

  var DATA = null, DOCS = null, INDEX = null, DF = null, AVGLEN = 0, LOADING = null;

  var ENDS = ['ившись','ывшись','ующий','ившие','ывшие','ается','аются',
    'ость','ами','ями','ого','ему','ому','ыми','ими','ей','ой','ов','ев',
    'ах','ях','ам','ям','ум','ом','ем','ий','ый','ая','яя','ое','ее','ые','ие',
    'ешь','ишь','ует','уют','ает','ают','ить','ать','еть','ять','ыть',
    'ла','ло','ли','ль','на','не','ну','ны','у','ю','а','я','ы','и','е','о','ь'];
  function stem(w) {
    if (w.length <= 4) return w;
    for (var i = 0; i < ENDS.length; i++) {
      var e = ENDS[i];
      if (w.length - e.length >= 4 && w.slice(-e.length) === e) return w.slice(0, -e.length);
    }
    return w;
  }
  function tokens(s) {
    var m = String(s).toLowerCase().replace(/ё/g, 'е').match(/[а-яa-z0-9]{2,}/g);
    if (!m) return [];
    for (var i = 0; i < m.length; i++) m[i] = stem(m[i]);
    return m;
  }

  // документ поиска = сцена целиком (заголовок + текст + метки выборов)
  function build() {
    DOCS = DATA.map(function (s) {
      var parts = [s.title, s.chapter].concat(s.text);
      s.choices.forEach(function (c) {
        parts.push(c.label); if (c.desc) parts.push(c.desc);
        if (c.cons) parts = parts.concat(c.cons);
      });
      return parts.join('\n');
    });
    INDEX = Object.create(null); DF = Object.create(null);
    var total = 0;
    for (var i = 0; i < DOCS.length; i++) {
      var tk = tokens(DOCS[i]), tf = Object.create(null), seen = Object.create(null);
      total += tk.length;
      for (var j = 0; j < tk.length; j++) {
        var t = tk[j];
        tf[t] = (tf[t] || 0) + 1;
        if (!seen[t]) { seen[t] = 1; DF[t] = (DF[t] || 0) + 1; (INDEX[t] || (INDEX[t] = [])).push(i); }
      }
      DATA[i]._tf = tf; DATA[i]._len = tk.length || 1;
    }
    AVGLEN = total / DOCS.length;
  }

  function ensure(cb) {
    if (DATA) return cb(null);
    if (LOADING) return LOADING.push(cb);
    LOADING = [cb];
    var done = function (err, arr) {
      if (!err) { DATA = arr; build(); }
      var q = LOADING; LOADING = null;
      q.forEach(function (f) { f(err); });
    };
    var isNode = typeof process === 'object' && process.versions && process.versions.node &&
                 typeof module === 'object' && module.exports;
    if (typeof fetch === 'function' && !isNode) {
      fetch(ARK_JERIAN.path).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status); return r.json();
      }).then(function (a) { done(null, a); }).catch(done);
    } else {
      try {
        var fs = require('fs'), p = require('path');
        var full = p.isAbsolute(ARK_JERIAN.path) ? ARK_JERIAN.path : p.join(__dirname, ARK_JERIAN.path);
        done(null, JSON.parse(fs.readFileSync(full, 'utf8')));
      } catch (e) { done(e); }
    }
  }

  var K1 = 1.4, B = 0.72;
  function rank(query, chapter) {
    var qt = tokens(query);
    if (!qt.length) return [];
    var N = DOCS.length, acc = Object.create(null), i, j;
    for (i = 0; i < qt.length; i++) {
      var t = qt[i], post = INDEX[t];
      if (!post) continue;
      var idf = Math.log(1 + (N - DF[t] + 0.5) / (DF[t] + 0.5));
      for (j = 0; j < post.length; j++) {
        var d = post[j];
        if (chapter && DATA[d].ch !== chapter) continue;
        var f = DATA[d]._tf[t];
        acc[d] = (acc[d] || 0) + idf * (f * (K1 + 1)) / (f + K1 * (1 - B + B * DATA[d]._len / AVGLEN));
      }
    }
    var lq = String(query).toLowerCase(), out = [];
    for (var k in acc) {
      var sc = acc[k];
      if ((DATA[k].title || '').toLowerCase().indexOf(lq) >= 0) sc *= 2.2;
      out.push([+k, sc]);
    }
    out.sort(function (a, b) { return b[1] - a[1]; });
    return out;
  }

  var NOTE = 'ПРИОРИТЕТ: библия проекта и правила в промпте выше этого текста. ' +
    'Если найденное расходится с ними — следуй правилам, а не тексту игры. ' +
    'Материал ниже — ориентир по интонации и устройству сцены, не образец для копирования.';

  var ARK_JERIAN = {
    path: 'jerian/scenes.json',
    coverage: 'Главы I–III. Глав IV «Кредо» и V «Тысячелетний сенат» в данных нет.',
    get ready() { return !!DATA; },
    get size() { return DATA ? DATA.length : 0; },

    load: function () {
      return new Promise(function (res, rej) {
        ensure(function (e) { e ? rej(e) : res(ARK_JERIAN.size); });
      });
    },

    /* Поиск сцен. opts: {limit, chapter:'010'|'020'|'030', full:true} */
    search: function (query, opts) {
      opts = opts || {};
      var limit = opts.limit || 3;
      return ARK_JERIAN.load().then(function () {
        return rank(query, opts.chapter).slice(0, limit).map(function (h) {
          var s = DATA[h[0]];
          return {
            id: s.id, chapter: s.chapter, title: s.title, slug: s.slug,
            score: Math.round(h[1] * 100) / 100,
            text: opts.full ? s.text : s.text.slice(0, 3),
            paragraphs: s.text.length,
            choices: s.choices.map(function (c) {
              return {
                n: c.n, label: c.label, desc: c.desc,
                consequence: opts.full ? (c.cons || []) : (c.cons || []).slice(0, 1),
                consParagraphs: (c.cons || []).length
              };
            })
          };
        });
      });
    },

    scene: function (slugOrTitle) {
      return ARK_JERIAN.load().then(function () {
        var q = String(slugOrTitle).toLowerCase();
        for (var i = 0; i < DATA.length; i++)
          if (DATA[i].slug.toLowerCase() === q || (DATA[i].title || '').toLowerCase() === q) return DATA[i];
        return null;
      });
    },

    list: function (chapter) {
      return ARK_JERIAN.load().then(function () {
        return DATA.filter(function (s) { return !chapter || s.ch === chapter; })
                   .map(function (s) { return { id: s.id, chapter: s.chapter, title: s.title, choices: s.choices.length }; });
      });
    },

    /* Как в оригинале устроена развилка: метка, пояснение, к чему ведёт. */
    choicePattern: function (topic, n) {
      return ARK_JERIAN.search(topic, { limit: n || 2 }).then(function (hits) {
        if (!hits.length) return '';
        return NOTE + '\n\nУСТРОЙСТВО РАЗВИЛОК В ОРИГИНАЛЕ\n' + hits.map(function (h) {
          return '· Сцена «' + h.title + '» (' + h.chapter + ')\n' +
            h.choices.map(function (c) {
              return '   — ' + c.label + '\n     пояснение: ' + (c.desc || '—') +
                     '\n     ведёт к: ' + ((c.consequence[0] || '').slice(0, 160)) + '…';
            }).join('\n');
        }).join('\n\n');
      });
    },

    toolSpec: {
      name: 'search_jerian_scenes',
      description: 'Поиск по сценам игры «The Life and Suffering of Prince Jerian» (главы I–III). ' +
        'Возвращает сцену целиком: заголовок, абзацы, варианты выбора с пояснениями ' +
        'и текст последствий каждого варианта. ' +
        'Используй, чтобы свериться с тем, как в оригинале устроена сцена и развилка. ' +
        'ВАЖНО: библия проекта и правила в системном промпте имеют приоритет над этим текстом; ' +
        'при расхождении следуй правилам. Пересказывай своими словами, не копируй дословно.',
      input_schema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Ключевые слова: имя, событие, место. 2–6 слов.' },
          chapter: { type: 'string', enum: ['010', '020', '030'],
            description: '010 — Небытие, 020 — Наследник, 030 — Великий Цензор. Без него ищет везде.' },
          full: { type: 'boolean', description: 'true — сцена целиком; по умолчанию сокращённо.' },
          limit: { type: 'integer', description: 'Сколько сцен вернуть, 1–3. По умолчанию 2.' }
        },
        required: ['query']
      }
    },
    openaiToolSpec: function () {
      return { type: 'function', function: {
        name: ARK_JERIAN.toolSpec.name,
        description: ARK_JERIAN.toolSpec.description,
        parameters: ARK_JERIAN.toolSpec.input_schema } };
    },

    runTool: function (input) {
      input = input || {};
      var lim = Math.min(Math.max(input.limit || 2, 1), 3);
      return ARK_JERIAN.search(input.query || '', {
        limit: lim, chapter: input.chapter, full: !!input.full
      }).then(function (hits) {
        if (!hits.length) return 'В сценах «Принца Джериана» ничего не найдено по запросу «' +
          (input.query || '') + '». ' + ARK_JERIAN.coverage +
          ' Не выдумывай канон: скажи, что источник молчит, либо опирайся на правила промпта.';
        return NOTE + '\n\nНайдено сцен: ' + hits.length + '\n\n' + hits.map(function (h) {
          var s = '### ' + h.title + '  (' + h.chapter + ', абзацев: ' + h.paragraphs + ')\n' +
                  h.text.join('\n') + (h.paragraphs > h.text.length ? '\n[…]' : '');
          if (h.choices.length) {
            s += '\n\nРазвилка:\n' + h.choices.map(function (c) {
              return '  ' + c.n + ') ' + c.label +
                (c.desc ? '\n     — ' + c.desc : '') +
                (c.consequence.length ? '\n     → ' + c.consequence.join('\n       ') +
                  (c.consParagraphs > c.consequence.length ? ' […]' : '') : '');
            }).join('\n');
          }
          return s;
        }).join('\n\n———\n\n');
      }).catch(function (e) {
        return 'Поиск по сценам недоступен (' + e.message + '). Опирайся на правила промпта и ARK_LORE.';
      });
    }
  };

  if (typeof module === 'object' && module.exports) module.exports = ARK_JERIAN;
  root.ARK_JERIAN = ARK_JERIAN;
})(typeof globalThis !== 'undefined' ? globalThis : this);
