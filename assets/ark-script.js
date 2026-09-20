/* ark-script.js — поиск по сценарию «Жизнь и страдания господина Бранте»
   для ИИ-мастера. Работает и как обычный поиск, и как инструмент (tool use).

   Данные: script/blocks.json (16852 блока, ~4.9 МБ) грузятся лениво,
   индекс строится в памяти при первом обращении.

   ВАЖНО: блоки — это оригинальный текст игры. Мастер должен использовать их
   как образец интонации и как справку о фактах, но НЕ пересказывать дословно.
   Об этом сказано в ARK_SCRIPT.toolSpec.description и в шапке выдачи. */
(function (root) {
  'use strict';

  var DATA = null, INDEX = null, DF = null, AVGLEN = 0, LOADING = null;
  var PATH = 'script/blocks.json';

  // ——— морфология: грубое отсечение русских окончаний ———
  var ENDS = [
    'ившись','ывшись','ующий','ившие','ывшие','ается','аются','ается',
    'ость','ами','ями','ого','ему','ому','ыми','ими','ей','ой','ов','ев',
    'ах','ях','ам','ям','ум','ом','ем','ий','ый','ая','яя','ое','ее','ые','ие',
    'ешь','ишь','ует','уют','ает','ают','ить','ать','еть','ять','ыть',
    'ла','ло','ли','ль','на','не','ну','ны','у','ю','а','я','ы','и','е','о','ь'
  ];
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
    var out = [], i;
    for (i = 0; i < m.length; i++) out.push(stem(m[i]));
    return out;
  }

  function buildIndex() {
    INDEX = Object.create(null);
    DF = Object.create(null);
    var total = 0;
    for (var i = 0; i < DATA.length; i++) {
      var tk = tokens(DATA[i].text), seen = Object.create(null), tf = Object.create(null);
      total += tk.length;
      DATA[i]._len = tk.length || 1;
      for (var j = 0; j < tk.length; j++) {
        var t = tk[j];
        tf[t] = (tf[t] || 0) + 1;
        if (!seen[t]) { seen[t] = 1; DF[t] = (DF[t] || 0) + 1; (INDEX[t] || (INDEX[t] = [])).push(i); }
      }
      DATA[i]._tf = tf;
    }
    AVGLEN = total / DATA.length;
  }

  function ensure(cb) {
    if (DATA) return cb(null);
    if (LOADING) return LOADING.push(cb);
    LOADING = [cb];
    var done = function (err, arr) {
      if (!err) { DATA = arr; buildIndex(); }
      var q = LOADING; LOADING = null;
      q.forEach(function (f) { f(err); });
    };
    var isNode = typeof process === 'object' && process.versions && process.versions.node &&
                 typeof module === 'object' && module.exports;
    if (typeof fetch === 'function' && !isNode) {
      fetch(ARK_SCRIPT.path).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (a) { done(null, a); }).catch(function (e) { done(e); });
    } else {
      try {
        var fs = require('fs'), p = require('path');
        var full = p.isAbsolute(ARK_SCRIPT.path) ? ARK_SCRIPT.path : p.join(__dirname, ARK_SCRIPT.path);
        done(null, JSON.parse(fs.readFileSync(full, 'utf8')));
      } catch (e) { done(e); }
    }
  }

  // ——— BM25 ———
  var K1 = 1.4, B = 0.72;
  function score(query, opts) {
    opts = opts || {};
    var qt = tokens(query);
    if (!qt.length) return [];
    var N = DATA.length, acc = Object.create(null), i, j;
    for (i = 0; i < qt.length; i++) {
      var t = qt[i], posting = INDEX[t];
      if (!posting) continue;
      var idf = Math.log(1 + (N - DF[t] + 0.5) / (DF[t] + 0.5));
      for (j = 0; j < posting.length; j++) {
        var d = posting[j], rec = DATA[d];
        if (opts.kind && rec.kind !== opts.kind) continue;
        var f = rec._tf[t];
        var s = idf * (f * (K1 + 1)) / (f + K1 * (1 - B + B * rec._len / AVGLEN));
        acc[d] = (acc[d] || 0) + s;
      }
    }
    // бонус за точное вхождение фразы
    var lq = String(query).toLowerCase();
    var out = [];
    for (var k in acc) {
      var idx = +k, r = DATA[idx], sc = acc[k];
      if (r.text.toLowerCase().indexOf(lq) >= 0) sc *= 1.6;
      out.push([idx, sc]);
    }
    out.sort(function (a, b) { return b[1] - a[1]; });
    return out;
  }

  // сценарий содержит десятки почти одинаковых вариантов эпилогов —
  // схлопываем их, чтобы мастер не получил пять копий одного абзаца
  function dedupe(hits, limit) {
    var out = [], seen = [];
    for (var i = 0; i < hits.length && out.length < limit; i++) {
      var txt = DATA[hits[i][0]].text, head = txt.slice(0, 60).toLowerCase(), dup = false;
      for (var j = 0; j < seen.length; j++) if (seen[j] === head) { dup = true; break; }
      if (dup) continue;
      seen.push(head);
      out.push(hits[i]);
    }
    return out;
  }

  var ARK_SCRIPT = {
    path: PATH,
    get ready() { return !!DATA; },
    get size() { return DATA ? DATA.length : 0; },

    load: function () {
      return new Promise(function (res, rej) {
        ensure(function (e) { e ? rej(e) : res(ARK_SCRIPT.size); });
      });
    },

    /* Основной поиск.
       ARK_SCRIPT.search('причастие плеть', {limit:5, kind:'text', context:1}) */
    search: function (query, opts) {
      opts = opts || {};
      var limit = opts.limit || 5, ctx = opts.context || 0;
      return ARK_SCRIPT.load().then(function () {
        var hits = dedupe(score(query, opts), limit);
        return hits.map(function (h) {
          var i = h[0], r = DATA[i], item = {
            i: r.i, line: r.line, kind: r.kind, text: r.text, score: Math.round(h[1] * 100) / 100
          };
          if (ctx) {
            item.before = DATA.slice(Math.max(0, i - ctx), i).map(function (x) { return x.text; });
            item.after = DATA.slice(i + 1, i + 1 + ctx).map(function (x) { return x.text; });
          }
          return item;
        });
      });
    },

    /* Готовый блок для промпта: образцы стиля по теме сцены. */
    styleSamples: function (topic, n) {
      return ARK_SCRIPT.search(topic, { limit: n || 3, kind: 'text' }).then(function (hits) {
        if (!hits.length) return '';
        return 'ОБРАЗЦЫ ОРИГИНАЛЬНОГО ТЕКСТА ИГРЫ (тема: ' + topic + ')\n' +
          'Держи эту интонацию: второе лицо, настоящее время, короткие абзацы, без пафоса.\n' +
          'НЕ переписывай эти куски дословно — это ориентир, а не материал.\n\n' +
          hits.map(function (h) { return '· ' + h.text; }).join('\n\n');
      });
    },

    /* Как в оригинале формулируются варианты выбора. */
    choiceSamples: function (topic, n) {
      return ARK_SCRIPT.search(topic, { limit: n || 8, kind: 'choice' }).then(function (hits) {
        return hits.map(function (h) { return h.text; });
      });
    },

    // ——— описание инструмента для модели ———
    toolSpec: {
      name: 'search_game_script',
      description: 'Поиск по оригинальному тексту игры «Жизнь и страдания господина Бранте». ' +
        'Используй, когда нужно свериться с каноном: как в игре описано событие, место, персонаж, ' +
        'обряд или как звучат формулировки вариантов выбора. ' +
        'Возвращает фрагменты оригинала. Это ориентир по фактам и интонации — ' +
        'пересказывай своими словами, не копируй дословно. ' +
        'Поиск учитывает русскую морфологию: можно искать «Жанна», найдётся и «Жанны».',
      input_schema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Ключевые слова: имена, места, события. 2–6 слов.' },
          kind: { type: 'string', enum: ['text', 'choice'],
            description: 'text — повествование (по умолчанию), choice — формулировки вариантов выбора.' },
          limit: { type: 'integer', description: 'Сколько фрагментов вернуть, 1–8. По умолчанию 4.' }
        },
        required: ['query']
      }
    },

    // то же в формате OpenAI-совместимых провайдеров
    openaiToolSpec: function () {
      return {
        type: 'function',
        function: {
          name: ARK_SCRIPT.toolSpec.name,
          description: ARK_SCRIPT.toolSpec.description,
          parameters: ARK_SCRIPT.toolSpec.input_schema
        }
      };
    },

    /* Исполнение вызова инструмента. Возвращает строку для tool_result. */
    runTool: function (input) {
      input = input || {};
      var lim = Math.min(Math.max(input.limit || 4, 1), 8);
      return ARK_SCRIPT.search(input.query || '', {
        limit: lim, kind: input.kind === 'choice' ? 'choice' : 'text'
      }).then(function (hits) {
        if (!hits.length) return 'В сценарии игры ничего не найдено по запросу «' + (input.query || '') +
          '». Не выдумывай канон: скажи, что источник об этом молчит, либо опиши сцену нейтрально.';
        return 'Найдено фрагментов: ' + hits.length +
          '. Это оригинальный текст игры — используй как справку и образец интонации, не копируй дословно.\n\n' +
          hits.map(function (h, n) {
            return (n + 1) + ') [' + h.kind + ', блок ' + h.i + ']\n' + h.text;
          }).join('\n\n');
      }).catch(function (e) {
        return 'Поиск по сценарию недоступен (' + e.message + '). Опирайся только на ARK_LORE.';
      });
    }
  };

  if (typeof module === 'object' && module.exports) module.exports = ARK_SCRIPT;
  root.ARK_SCRIPT = ARK_SCRIPT;
})(typeof globalThis !== 'undefined' ? globalThis : this);
