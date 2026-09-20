/* ark-wire.js — связка модулей с наказом Мастеру. Подключать ПОСЛЕ всех ark-*.js, ДО app.js.

   Порядок системных блоков (сверху вниз = по убыванию приоритета):
     1. ARK_RULES  — библия проекта, выше всего;
     2. ARK_LORE   — канон проекта (const внутри app.js, передаётся аргументом);
     3. ARK_CANON  — артбук «Принца Джериана», отобранный по году партии;
     4. наказ Мастеру (Cp + блок эпохи + состояние героя) и справка из текстов игр.
   Блоки 1–3 статичны и кешируются одним ключом на блоке 3. Раньше кеш стоял
   на ARK_LORE ПОСЛЕ меняющегося наказа — такой префикс не совпадает ни разу.

   Справка из текстов игр подбирается ДО запроса, одним вызовом, а не через tool use:
   так она работает у всех провайдеров, и ответ Мастера остаётся чистым JSON. */
(function (root) {
  'use strict';

  function eras() { return root.ARK_ERAS || null; }

  /* Артбук описывает эпоху Уттера (1121–1150). Для более ранних лет из него
     отдаются только вневременные темы — остальное там для героя будущее. */
  function canonBlock(year) {
    var C = root.ARK_CANON, E = eras();
    if (!C || typeof C.system !== 'function') return '';
    var role = E ? E.roleOf('canon', year) : 'canon';
    if (role === 'future') {
      return E.stamp('canon', year).replace('[БУДУЩЕЕ', '[ТОЛЬКО ВНЕВРЕМЕННОЕ') + '\n' +
        C.system(['arkns', 'death']);
    }
    return (E ? E.stamp('canon', year) + '\n' : '') + C.system();
  }

  function systemBlocks(dynamic, year, arkLore) {
    var out = [];
    if (root.ARK_RULES && typeof root.ARK_RULES.system === 'function')
      out.push({ type: 'text', text: root.ARK_RULES.system() });
    if (arkLore) out.push({ type: 'text', text: arkLore });
    var cb = canonBlock(year);
    if (cb) out.push({ type: 'text', text: cb });
    if (out.length) out[out.length - 1].cache_control = { type: 'ephemeral' };
    out.push({ type: 'text', text: dynamic });
    return out;
  }

  function withTimeout(p, ms) {
    return Promise.race([p, new Promise(function (res) { setTimeout(function () { res(''); }, ms); })]);
  }

  /* Образцы оригинального текста по действию игрока. Будущее для героя не отдаётся. */
  function reference(action, year) {
    var q = String(action || '').trim(), E = eras(), jobs = [];
    if (q.length < 3) return Promise.resolve('');
    function one(mod, src, fn) {
      if (!mod || (E && E.roleOf(src, year) === 'future')) return;
      jobs.push(withTimeout(fn(mod).then(function (t) {
        return t ? (E ? E.stamp(src, year) + '\n' : '') + t : '';
      }).catch(function () { return ''; }), 5000));
    }
    one(root.ARK_SCRIPT, 'script', function (m) { return m.styleSamples(q, 2); });
    one(root.ARK_JERIAN, 'jerian', function (m) { return m.choicePattern(q, 1); });
    return Promise.all(jobs).then(function (parts) {
      parts = parts.filter(Boolean);
      if (!parts.length) return '';
      return '\n\n━━━ СПРАВКА ИЗ ТЕКСТОВ ИГР ━━━\n' +
        (root.ARK_RULES ? root.ARK_RULES.priorityNote + '\n\n' : '') + parts.join('\n\n');
    });
  }

  var ARK_WIRE = { systemBlocks: systemBlocks, reference: reference, canonBlock: canonBlock };
  if (typeof module === 'object' && module.exports) module.exports = ARK_WIRE;
  root.ARK_WIRE = ARK_WIRE;
})(typeof globalThis !== 'undefined' ? globalThis : this);
