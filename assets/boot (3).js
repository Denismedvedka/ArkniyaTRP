/* Пути к ассетам. Раньше здесь лежал base64 — теперь настоящие файлы. */
window.ARK_MAP="assets/img/map.webp";
window.ARK_ARMS={"arkniya": {"src": "assets/img/arms/arkniya.webp"}, "eliriya": {"src": "assets/img/arms/eliriya.webp"}, "monia": {"src": "assets/img/arms/monia.webp"}, "astiniya": {"src": "assets/img/arms/astiniya.webp"}, "magra": {"src": "assets/img/arms/magra.webp"}, "fiona": {"src": "assets/img/arms/fiona.webp"}};
window.ARK_ICONS={"destiny": "assets/img/icons/destiny.webp", "empire": "assets/img/icons/empire.webp", "history": "assets/img/icons/history.webp", "home": "assets/img/icons/home.webp", "relations": "assets/img/icons/relations.webp", "war": "assets/img/icons/war.webp", "inquisition": "assets/img/icons/inquisition.webp", "back": "assets/img/icons/back.webp", "hero": "assets/img/icons/hero.webp", "mask": "assets/img/icons/mask.webp", "scales": "assets/img/icons/scales.webp", "family": "assets/img/icons/family.webp"};

/* ---- Настройка доступа к модели ---- */
(function(){
  var K="ark_ai_cfg_v1",PK="ark_ai_profiles_v1";
  function profs(){try{var r=localStorage.getItem(PK);if(r)return JSON.parse(r)}catch(e){}return {}}
  function saveProfs(o){try{localStorage.setItem(PK,JSON.stringify(o))}catch(e){}}
  var PRESETS={
    gemini:{label:"Google AI Studio (не работает в ЕС)",provider:"openai",
      baseUrl:"https://generativelanguage.googleapis.com/v1beta/openai",model:"gemini-3.5-flash",
      hint:"ВНИМАНИЕ: бесплатный тариф недоступен в ЕС, Британии и Швейцарии — вернёт отказ по стране."},
    mistral:{label:"Mistral — ЕС, без отказов по стране",provider:"openai",
      baseUrl:"https://api.mistral.ai/v1",model:"mistral-large-latest",
      hint:"console.mistral.ai, карта не нужна. Серверы в Париже, из ЕС работает. Медленно: 2 запроса в минуту."},
    groq:{label:"Groq — быстрые лимиты",provider:"openai",
      baseUrl:"https://api.groq.com/openai/v1",model:"",
      hint:"console.groq.com, ключ сразу. 30 запросов в минуту, 1000 в сутки."},
    openrouter:{label:"OpenRouter (много моделей)",provider:"openai",
      baseUrl:"https://openrouter.ai/api/v1",model:"",
      hint:"Бесплатно 50 запросов в сутки. Нажми «Список моделей» и выбери с пометкой :free"},
    anthropic:{label:"Anthropic Claude (платно)",provider:"anthropic",
      baseUrl:"https://api.anthropic.com/v1",model:"claude-sonnet-4-6",
      hint:"Нужен платный ключ console.anthropic.com"},
    custom:{label:"Другой OpenAI-совместимый",provider:"openai",baseUrl:"",model:"",
      hint:"Любой сервис с путём /chat/completions"}
  };
  function cfg(){try{var r=localStorage.getItem(K);if(r)return JSON.parse(r)}catch(e){}return null}

  function open(){
    if(document.getElementById("arkAiPanel"))return;
    var c=cfg()||PRESETS.mistral, cur="mistral";
    for(var k in PRESETS)if(PRESETS[k].baseUrl&&c.baseUrl===PRESETS[k].baseUrl)cur=k;
    var wrap=document.createElement("div");
    wrap.id="arkAiPanel";
    wrap.style.cssText="position:fixed;inset:0;z-index:99999;background:rgba(5,4,3,.94);display:flex;"+
      "align-items:center;justify-content:center;padding:14px;font-family:Georgia,serif;color:#c8a97a";
    wrap.innerHTML=
     '<div style="width:100%;max-width:430px;background:#0d0a06;border:1px solid #c4962a;border-radius:8px;padding:18px 16px">'+
     '<div style="letter-spacing:3px;text-transform:uppercase;font-size:14px;color:#c9a24a;text-align:center;margin-bottom:4px">Доступ к Мастеру</div>'+
     '<div style="font-size:11.5px;opacity:.6;text-align:center;margin-bottom:14px">Ключ хранится только в этом браузере и никуда не отправляется, кроме выбранного сервиса.</div>'+
     '<div id="arkPR" style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px"></div><label style="font-size:11px;opacity:.7">Сервис</label>'+
     '<select id="arkP" style="width:100%;margin:3px 0 10px;padding:8px;background:#13100a;color:#c8a97a;border:1px solid #3a2a14;border-radius:4px;font-family:inherit"></select>'+
     '<label style="font-size:11px;opacity:.7">Адрес</label>'+
     '<input id="arkU" style="width:100%;margin:3px 0 10px;padding:8px;background:#13100a;color:#c8a97a;border:1px solid #3a2a14;border-radius:4px;font-family:inherit;font-size:12px">'+
     '<label style="font-size:11px;opacity:.7">Модель <button id="arkL" style="margin-left:6px;padding:1px 7px;background:none;color:#8a7a5a;border:1px solid #3a2a14;border-radius:3px;cursor:pointer;font-family:inherit;font-size:10px">Список моделей</button></label>'+
     '<input id="arkM" list="arkML" style="width:100%;margin:3px 0 10px;padding:8px;background:#13100a;color:#c8a97a;border:1px solid #3a2a14;border-radius:4px;font-family:inherit;font-size:12px">'+
     '<datalist id="arkML"></datalist><label style="font-size:11px;opacity:.7">Ключ API</label>'+
     '<input id="arkK" type="password" autocomplete="off" style="width:100%;margin:3px 0 6px;padding:8px;background:#13100a;color:#c8a97a;border:1px solid #3a2a14;border-radius:4px;font-family:inherit;font-size:12px">'+
     '<div id="arkH" style="font-size:11px;opacity:.55;font-style:italic;min-height:28px"></div>'+
     '<div id="arkS" style="font-size:12px;min-height:18px;margin:4px 0"></div>'+
     '<div style="display:flex;gap:8px;margin-top:6px">'+
     '<button id="arkT" style="flex:1;padding:10px;background:none;color:#8a7a5a;border:1px solid #3a2a14;border-radius:5px;cursor:pointer;font-family:inherit;font-size:12px">Проверить</button>'+
     '<button id="arkSv" style="flex:1;padding:10px;background:none;color:#8a7a5a;border:1px solid #3a2a14;border-radius:5px;cursor:pointer;font-family:inherit;font-size:12px">Запомнить</button><button id="arkOk" style="flex:1;padding:10px;background:#1a1409;color:#c9a24a;border:1px solid #c4962a;border-radius:5px;cursor:pointer;font-family:inherit;font-size:12px">Применить</button>'+
     '</div></div>';
    document.body.appendChild(wrap);
    var sel=wrap.querySelector("#arkP"),U=wrap.querySelector("#arkU"),M=wrap.querySelector("#arkM"),
        KY=wrap.querySelector("#arkK"),H=wrap.querySelector("#arkH"),S=wrap.querySelector("#arkS");
    for(var k2 in PRESETS){var o=document.createElement("option");o.value=k2;o.textContent=PRESETS[k2].label;sel.appendChild(o)}
    sel.value=cur;
    function fill(reset){var p=PRESETS[sel.value];
      if(reset){U.value=p.baseUrl;M.value=p.model}
      H.textContent=p.hint}
    U.value=c.baseUrl||PRESETS[cur].baseUrl;M.value=c.model||PRESETS[cur].model;KY.value=c.apiKey||"";
    fill(false);
    sel.onchange=function(){fill(true)};
    function build(){return {provider:PRESETS[sel.value].provider,baseUrl:U.value.trim(),
      model:M.value.trim(),apiKey:KY.value.trim()}}
    var PR=wrap.querySelector("#arkPR");
    function drawProfs(){
      var all=profs(),names=Object.keys(all);
      PR.innerHTML=names.length?"":'<span style="font-size:11px;opacity:.45">Профилей пока нет — настрой и нажми «Запомнить»</span>';
      names.forEach(function(n){
        var b=document.createElement("button");
        b.textContent=n;
        b.style.cssText="padding:4px 9px;background:#13100a;color:#c8a97a;border:1px solid #3a2a14;"+
          "border-radius:12px;cursor:pointer;font-family:inherit;font-size:11px";
        b.onclick=function(){var v=all[n];
          U.value=v.baseUrl;M.value=v.model;KY.value=v.apiKey;
          for(var kk in PRESETS)if(PRESETS[kk].baseUrl&&v.baseUrl===PRESETS[kk].baseUrl)sel.value=kk;
          H.textContent=PRESETS[sel.value].hint;
          S.style.color="#5a9a5a";S.textContent="Профиль «"+n+"» подставлен. Нажми «Применить».";};
        b.oncontextmenu=function(ev){ev.preventDefault();
          if(!confirm("Удалить профиль «"+n+"»?"))return;
          var a2=profs();delete a2[n];saveProfs(a2);drawProfs()};
        PR.appendChild(b);
      });
    }
    drawProfs();
    wrap.querySelector("#arkSv").onclick=function(){
      var v=build();
      if(!v.apiKey){S.style.color="#b06a4a";S.textContent="Нечего запоминать без ключа";return}
      var n=prompt("Название профиля","Mistral для тестов");
      if(!n)return;
      var all=profs();all[n]=v;saveProfs(all);drawProfs();
      S.style.color="#5a9a5a";S.textContent="Профиль «"+n+"» сохранён";
    };
    wrap.querySelector("#arkL").onclick=async function(){
      var v=build();
      if(!v.apiKey){S.style.color="#b06a4a";S.textContent="Сначала введи ключ";return}
      if(v.provider==="anthropic"){S.style.color="#8a7a5a";S.textContent="Список моделей смотри на docs.claude.com";return}
      S.style.color="#8a7a5a";S.textContent="Гружу список…";
      try{
        var r=await fetch(v.baseUrl.replace(/\/+$/,"")+"/models",{headers:{"Authorization":"Bearer "+v.apiKey}});
        var d=await r.json();
        if(d&&d.error){S.style.color="#b06a4a";S.textContent="Отказ: "+(d.error.message||"ошибка");return}
        var list=(d&&(d.data||d.models)||[]).map(function(m){return (m.id||m.name||"").replace(/^models\//,"")}).filter(Boolean).sort();
        var dl=wrap.querySelector("#arkML");dl.innerHTML="";
        list.forEach(function(id){var o=document.createElement("option");o.value=id;dl.appendChild(o)});
        var free=list.filter(function(x){return /:free$/.test(x)});
        S.style.color="#5a9a5a";
        S.textContent="Доступно "+list.length+" моделей"+(free.length?(", бесплатных "+free.length):"")+". Жми поле «Модель».";
        if(!M.value&&list.length)M.value=(free[0]||list[0]);
      }catch(e){S.style.color="#b06a4a";S.textContent="Не дозвонился: "+(e.message||e)}
    };
    wrap.querySelector("#arkT").onclick=async function(){
      var v=build();if(!v.apiKey){S.style.color="#b06a4a";S.textContent="Введи ключ";return}
      S.style.color="#8a7a5a";S.textContent="Проверяю…";
      try{
        var req=v.provider==="anthropic"
          ?{url:v.baseUrl+"/messages",headers:{"Content-Type":"application/json","x-api-key":v.apiKey,
             "anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
            body:JSON.stringify({model:v.model,max_tokens:16,messages:[{role:"user",content:"ping"}]})}
          :{url:v.baseUrl.replace(/\/+$/,"")+"/chat/completions",
            headers:{"Content-Type":"application/json","Authorization":"Bearer "+v.apiKey},
            body:JSON.stringify({model:v.model,max_tokens:16,messages:[{role:"user",content:"ping"}]})};
        var r=await fetch(req.url,{method:"POST",headers:req.headers,body:req.body});
        var d=await r.json();
        if(d&&d.error){var em=(d.error.message||"ошибка")+"";
          S.style.color="#b06a4a";
          S.textContent=/location is not supported|FAILED_PRECONDITION|user location/i.test(em)
            ?"Сервис не работает в твоей стране. Выбери Mistral или Groq."
            :(/not (found|available)|404|no longer/i.test(em)
              ?"Такой модели нет. Нажми «Список моделей» и выбери из доступных."
              :"Отказ: "+em)}
        else{S.style.color="#5a9a5a";S.textContent="Связь есть, модель отвечает"}
      }catch(e){S.style.color="#b06a4a";S.textContent="Не дозвонился: "+(e.message||e)}
    };
    wrap.querySelector("#arkOk").onclick=function(){
      var v=build();
      if(!v.apiKey){S.style.color="#b06a4a";S.textContent="Без ключа игра не заработает";return}
      try{localStorage.setItem(K,JSON.stringify(v))}catch(e){}
      wrap.remove();
    };
  }
  window.arkAIsettings=open;

  function addBtn(){
    if(document.getElementById("arkAiBtn"))return;
    var b=document.createElement("button");
    b.id="arkAiBtn";b.title="Доступ к Мастеру";b.textContent="⚙";
    b.style.cssText="position:fixed;bottom:10px;left:10px;z-index:8888;width:34px;height:34px;"+
      "border-radius:50%;background:#0d0a06;border:1px solid #3a2a14;color:#8a7a5a;cursor:pointer;opacity:.75";
    b.onclick=open;document.body.appendChild(b);
  }
  function boot(){addBtn();if(!cfg()||!cfg().apiKey)open()}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
