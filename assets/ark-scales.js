/* ==========================================================================
   Шкалы, звания и карточки справки Блаженной Аркнийской Империи.
   Один источник правды: используется и книгой (book.html), и игрой (app.js).
   Звания сняты с экранов справки оригинала. Ничего придуманного здесь нет.
   Подключать ОБЫЧНЫМ <script>, до app.js — глобали должны существовать раньше.
   ========================================================================== */
/* ==========================================================================
   ИМЕНА. Один список на всю игру: экран создания, расчёт навыков,
   подписи в панели, короткие подписи в подсказках, наказ Мастеру.
   Раньше эти же названия лежали в пяти местах и уже разошлись
   («Схемы» против «Тайных планов», «Изобр.» вместо Находчивости).
   ========================================================================== */
var ARK_TRAITS=[
 {id:"resolve",     field:"resolution",   nm:"Решительность", ab:"Реш.",  d:"воля, действие, отвага"},
 {id:"perception",  field:"sensitivity",  nm:"Чуткость",      ab:"Чут.",  d:"восприятие, эмпатия"},
 {id:"nobility",    field:"nobility",     nm:"Благородство",  ab:"Благ.", d:"честь, происхождение",            estate:"noble"},
 {id:"spirituality",field:"spirituality", nm:"Духовность",    ab:"Дух.",  d:"вера, Близнецы",                  estate:"clergy"},
 {id:"ingenuity",   field:"ingenuity",    nm:"Находчивость",  ab:"Нах.",  d:"быстрота ума, выгода из положения",estate:"bastard"}
];
/* Навык = черта склада + черта пути. Обе 0..10, навык 0..20. */
var ARK_SKILLS=[
 {id:"valour",      nm:"Доблесть",     ab:"Добл.",  core:"resolve",    trait:"nobility"},
 {id:"diplomacy",   nm:"Дипломатия",   ab:"Дипл.",  core:"perception", trait:"nobility"},
 {id:"rhetoric",    nm:"Красноречие",  ab:"Красн.", core:"resolve",    trait:"spirituality"},
 {id:"theology",    nm:"Теология",     ab:"Теол.",  core:"perception", trait:"spirituality"},
 {id:"schemes",     nm:"Тайные планы", ab:"Тайн.",  core:"resolve",    trait:"ingenuity"},
 {id:"manipulation",nm:"Манипуляция",  ab:"Манип.", core:"perception", trait:"ingenuity"}
];
var ARK_ESTATES=[
 {id:"arkna",   nm:"Аркн",              short:"Аркн"},
 {id:"noble",   nm:"Дворянин",          short:"Дворянин"},
 {id:"clergy",  nm:"Священник",         short:"Священник"},
 {id:"commoner",nm:"Простолюдин",       short:"Простолюдин"},
 {id:"bastard", nm:"Незаконнорождённый",short:"Незакон."}
];
function arkTrait(id){for(var i=0;i<ARK_TRAITS.length;i++)if(ARK_TRAITS[i].id===id)return ARK_TRAITS[i];return null}
function arkSkill(id){for(var i=0;i<ARK_SKILLS.length;i++)if(ARK_SKILLS[i].id===id)return ARK_SKILLS[i];return null}
function arkEstateName(id,short){for(var i=0;i<ARK_ESTATES.length;i++)if(ARK_ESTATES[i].id===id)
 return short?ARK_ESTATES[i].short:ARK_ESTATES[i].nm; return id}
/* Из каких двух черт растёт навык — строкой для карточки справки */
function arkSkillFrom(id){var k=arkSkill(id);if(!k)return null;
 var a=arkTrait(k.core),b=arkTrait(k.trait);
 return (a?a.nm:k.core)+" + "+(b?b.nm:k.trait)}
/* Короткие подписи для подсказок на кнопках */
var ARK_SHORT=(function(){var m={honor:"Честь",faith:"Вера",secret:"Тайна",stamina:"Силы"};
 ARK_TRAITS.forEach(function(t){m[t.id]=t.ab;m[t.field]=t.ab});
 ARK_SKILLS.forEach(function(k){m[k.id]=k.ab});
 return m})();

var REL_LADDER=[{v:-5,t:"Вражда",c:"#8b1414"},{v:-4,t:"Неприязнь",c:"#b06a4a"},{v:-2,t:"Равнодушие",c:"#6a5a3a"},{v:3,t:"Симпатия",c:"#c9a24a"},{v:5,t:"Привязанность",c:"#e8d8b0"}];
function relNorm(v){v=v||0;if(v>5||v<-5){v=Math.round(v/20)}return Math.max(-5,Math.min(5,v))}
function relSeg(v){var n=relNorm(v),k=0;for(var i=0;i<REL_LADDER.length;i++)if(n>=REL_LADDER[i].v)k=i;return k}
function relOn(st,v){var k=relSeg(v),j=REL_LADDER.indexOf(st),m=2;return j===m?k===m:(j<m?k<=j:k>=j)}
function relInfo(v){return REL_LADDER[relSeg(v)]}

/* Звания сняты с экранов справки оригинала. Полосы: [минимум, звание]. */
var STAT_BANDS={
 /* Личность, 0..10 */
 perception:[[0,"Невнимательный"],[2,"Заинтересованный"],[4,"Любознательный"],[7,"Прозорливый"]],
 resolve:[[0,"Безвольный"],[2,"Деятельный"],[4,"Упорный"],[7,"Непреклонный"]],
 nobility:[[0,"Не знающий чести"],[2,"Честный"],[4,"Благородный"],[7,"Прирождённый дворянин"]],
 ingenuity:[[0,"Медлительный"],[2,"Смышлёный"],[4,"Предприимчивый"],[7,"Изобретательный"]],
 spirituality:[[0,"Приземлённый"],[2,"Ищущий"],[4,"Одухотворённый"],[7,"Благословлён Богами"]],
 /* Способности, 0..20 */
 diplomacy:[[0,"Безвестный"],[10,"Подающий надежды"],[13,"Влиятельный"],[16,"Вхож в высшие круги"],[20,"Искусный дипломат"]],
 valour:[[0,"Слаб в бою"],[10,"Сносный боец"],[13,"Достойный воитель"],[16,"Опасный соперник"],[20,"Закалённый в боях"]],
 theology:[[0,"Неофит"],[10,"Последователь"],[13,"Посвящённый"],[16,"Богослов"],[20,"Пророк"]],
 rhetoric:[[0,"Косноязычный"],[10,"Ясная речь"],[13,"Красноречивый"],[16,"Вдохновенный оратор"],[20,"Великий трибун"]],
 manipulation:[[0,"Бесхитростный"],[10,"Себе на уме"],[13,"Хитроумный"],[16,"Интриган"],[20,"Мастер манипуляции"]],
 schemes:[[0,"Неумелый"],[10,"Заговорщик"],[13,"Особо опасен"],[16,"Главарь"],[20,"Преступный гений"]]};
STAT_BANDS.scheming=STAT_BANDS.schemes;
/* Дом, 0..10 */
var FAM_BANDS={
 repute:[[0,"Клеймо позора"],[1,"Запятнанная честь"],[4,"Скромное положение"],[7,"Известны среди знати"],[10,"Славный род"]],
 wealth:[[0,"Разорение"],[1,"Бедность"],[4,"Средний достаток"],[7,"Процветание"],[10,"Богатый род"]],
 unity:[[0,"Ненависть"],[1,"Склоки и споры"],[4,"Разногласия"],[7,"Спокойствие"],[10,"Гармония"]]};
/* Провинция. Власть и Церковь идут от -5 до 5, Достаток и Порядок от 0 до 10. */
var PROV_BANDS={
 power:[[-5,"Власть древних родов"],[-4,"Власть наместника"],[-2,"Борьба за власть"],[3,"Власть простого народа"],[5,"Власть террора"]],
 church:[[-5,"Падение Новой Веры"],[-4,"Старая Вера"],[-2,"Церковный раскол"],[3,"Новая Вера"],[5,"Падение Старой Веры"]],
 wealth:[[0,"Мёртвая земля"],[1,"Нищета и разруха"],[4,"Достаток"],[7,"Зажиточность"],[10,"Край изобилия"]],
 order:[[0,"Беззаконие"],[1,"Волнения"],[4,"Недовольство"],[7,"Спокойствие"],[10,"Торжество Закона"]]};
/* Границы шкал — один источник правды для отрисовки и для правки значений. */
var ARK_SCALE={
 family:{repute:[0,10],wealth:[0,10],unity:[0,10]},
 prov:{power:[-5,5],church:[-5,5],wealth:[0,10],order:[0,10]}};
function scaleOf(grp,id){var g=ARK_SCALE[grp];return (g&&g[id])||[0,10]}
function clampStat(grp,id,v){var r=scaleOf(grp,id);return Math.max(r[0],Math.min(r[1],v))}
var STAMINA_BANDS=[[-10,"Обессилен"],[0,"Способен на поступок"],[10,"Полон сил"],[20,"Готов ко всему"]];
/* Дело. У каждого пути свои две линейки, 0..10. */
var CAREER_BANDS={
 career:[[0,"Крах карьеры"],[1,"Опасное положение"],[3,"Судья"],[7,"Будущий префект"],[10,"Тирания дворян"]],
 justice:[[0,"Упадок Префектуры"],[1,"Беззаконие"],[3,"Борьба за правосудие"],[7,"Народ под защитой"],[10,"Захват власти народом"]],
 inq_power:[[0,"Упадок Инквизиции"],[1,"Опасное положение"],[3,"Укрепление Ордена"],[7,"Непререкаемый авторитет"],[10,"Тирания Инквизиции"]],
 tolerance:[[0,"Расправа над Новой Верой"],[1,"Преследование инакомыслящих"],[3,"Надзор за верой"],[7,"Сила Новой Веры"],[10,"Религиозные бунты"]],
 spynet:[[0,"Провал сети"],[1,"Опасное положение"],[3,"Внедрение шпионов"],[7,"Везде свои люди"],[10,"Господство Фелиппе"]],
 unrest:[[0,"Провал заговорщиков"],[1,"Волнения утихли"],[3,"Недовольство"],[7,"Народ готов к борьбе"],[10,"Беспорядки и погромы"]],
 /* Аркн. Кровь против людской доли — по образцу пары Карьера/Правосудие. */
 blood:[[0,"Дом низложен"],[1,"Имя под сомнением"],[3,"Голос при дворе"],[7,"Опора трона"],[10,"Тирания древних Домов"]],
 humanRight:[[0,"Люди безгласны"],[1,"Ропот в предместьях"],[3,"Люди при своих правах"],[7,"Голос черни громче крови"],[10,"Конец власти Домов"]],
 /* Простолюдин. Мошна против своих. */
 trade:[[0,"Разорение"],[1,"Долговая яма"],[3,"Своё дело"],[7,"Первый в цехе"],[10,"Мошна выше герба"]],
 commune:[[0,"Свои отвернулись"],[1,"Косые взгляды"],[3,"Свой среди своих"],[7,"Слово в квартале"],[10,"Квартал идёт за тобой"]],
 /* Эпоха Вольной Магии: Инквизиции ещё нет, дар — ремесло на службе Закону. */
 craft:[[0,"Дар отвергнут"],[1,"Подмастерье"],[3,"Чародей на службе"],[7,"Первый среди волшебников"],[10,"Магия превыше Закона"]],
 dread:[[0,"Дар привычен, как ремесло"],[1,"Косые взгляды"],[3,"Опаска"],[7,"Требуют запрета"],[10,"Быть Собору"]],
 /* Годы Страданий: волшебство снова законно и делит мир с машинами. */
 machine:[[0,"Мастерские стоят"],[1,"Гарь и долги"],[3,"Ремесло при машинах"],[7,"Машины кормят провинцию"],[10,"Дар больше не нужен"]],
 /* До Тайной канцелярии: безудельный сам по себе. */
 ties:[[0,"Ни одного должника"],[1,"Шаткие знакомства"],[3,"Свои люди"],[7,"Город в твоей горсти"],[10,"Тень правит городом"]],
 hunt:[[0,"О тебе не знают"],[1,"Имя всплывает"],[3,"Под надзором"],[7,"Объявлен в розыск"],[10,"Облава"]],
 /* Годы Страданий: аркна травят. */
 refuge:[[0,"Дом выдан"],[1,"Прячетесь порознь"],[3,"Тень Дома"],[7,"Дом уцелел"],[10,"Дом ушёл в предание"]],
 bloodhunt:[[0,"Кровь ещё чтут"],[1,"Шепчутся"],[3,"Аркнов сторонятся"],[7,"Охота на кровь"],[10,"Домов больше нет"]]};
/* Восстание. Общая сила 0..10, поддержка сословий 0..3. */
var REVOLT_BANDS={
 revolt:[[0,"Восстание проигрывает"],[1,"Восстание держится"],[6,"Восстание побеждает"],[9,"Кровавая резня"]],
 army:[[0,"Горстка бойцов"],[1,"Отряд"],[2,"Полк"],[3,"Армия"]],
 support:[[0,"Нет сторонников"],[1,"Осторожная поддержка"],[2,"Доверие"],[3,"Безоговорочный вождь"]]};
/* Дело. У каждого пути свои две линейки, 0..10. Снято с экранов справки. */
var CAREER_DEF={
 arkna:{nm:"Древний Дом",list:[
  {id:"blood",nm:"Влияние Дома",col:"#8a4a9a",
   d:"Вес твоего Дома среди аркнов и при дворе.|Определяет, слушают ли твоё слово те, в ком течёт голубая кровь."},
  {id:"humanRight",nm:"Право людей",col:"#5a9a5a",
   d:"Насколько люди провинции добились голоса против древних Домов.|Чем выше, тем труднее править одной лишь кровью."}]},
 noble:{nm:"Судья",list:[
  {id:"career",nm:"Карьера",col:"#c4962a",
   d:"Поддержка властей и дворянского сословия на твоём пути к креслу префекта провинции."},
  {id:"justice",nm:"Правосудие",col:"#4a7a9a",
   d:"Власть Префектуры и сила закона в провинции.|Определяет защиту низкого сословия от дворянского произвола."}]},
 clergy:{nm:"Инквизитор",list:[
  {id:"inq_power",nm:"Сила Инквизиции",col:"#8a4a2a",
   d:"Влияние Ордена Инквизиции в провинции.|Определяет твои полномочия и духовный авторитет как инквизитора."},
  {id:"tolerance",nm:"Веротерпимость",col:"#5a9a5a",
   d:"Распространение новых учений о Близнецах среди жителей провинции.|Чем выше веротерпимость, тем сложнее Инквизиции подавлять эти учения."}]},
 commoner:{nm:"Цех",list:[
  {id:"trade",nm:"Промысел",col:"#c4962a",
   d:"Твой промысел, заказы и место в цехе.|Определяет, есть ли у тебя деньги и покровители наверху."},
  {id:"commune",nm:"Община",col:"#8b1414",
   d:"Доверие таких же, как ты.|Чем выше, тем больше людей за твоей спиной — и тем ближе квартал к бунту."}]},
 bastard:{nm:"Заговорщик",list:[
  {id:"spynet",nm:"Шпионская сеть",col:"#8a4a9a",
   d:"Сеть шпионов и осведомителей, которой ты управляешь.|От неё зависит влияние Тайной канцелярии в городе."},
  {id:"unrest",nm:"Волнения",col:"#8b1414",
   d:"Бунтарские настроения простолюдинов в провинции. Готовность низкого сословия выступить против властей и бороться за свои права."}]},
 /* --- Дела, приходящие с эпохой --- */
 mage:{nm:"Коллегия",list:[
  {id:"craft",nm:"Волшебное ремесло",col:"#8a4a9a",
   d:"Твоё место среди волшебников, служащих Государству и Закону.|Инквизиции ещё нет: дар — почтенное ремесло."},
  {id:"dread",nm:"Страх перед даром",col:"#8b1414",
   d:"Насколько люди боятся волшебства.|Чем выше, тем громче требуют запрета — и тем ближе Первый Собор."}]},
 mageCraft:{nm:"Ремесло",list:[
  {id:"craft",nm:"Волшебное ремесло",col:"#8a4a9a",
   d:"Дар снова законен и кормит.|Волшебное ремесло уживается с производством — пока уживается."},
  {id:"machine",nm:"Машины",col:"#c4962a",
   d:"Мануфактуры и паровые машины провинции.|Чем выше, тем меньше нужды в даре."}]},
 outcast:{nm:"Безудельный",list:[
  {id:"ties",nm:"Тёмные связи",col:"#8a4a9a",
   d:"Должники, скупщики и осведомители, которых ты знаешь по имени.|Тайной канцелярии ещё нет — сеть только твоя."},
  {id:"hunt",nm:"Розыск",col:"#8b1414",
   d:"Насколько плотно тобой занялись власти.|Чем выше, тем ближе облава."}]},
 fugitiveHouse:{nm:"Гонимый Дом",list:[
  {id:"refuge",nm:"Укрытие",col:"#4a7a9a",
   d:"Что осталось от Дома и где оно спрятано.|Голубая кровь больше не защищает."},
  {id:"bloodhunt",nm:"Охота на кровь",col:"#8b1414",
   d:"Как рьяно в провинции ищут аркнов.|Чем выше, тем меньше Домов доживёт до конца Страданий."}]}};

/* Дело зависит от эпохи. Таблица подмен переехала в ark-eras.js —
   там же, где даты и признаки эпох. Здесь только обращение к ней. */
function arkEraOf(year){
 return (window.ARK_ERAS&&window.ARK_ERAS.eraOf)?window.ARK_ERAS.eraOf(year):null;
}
/* Старые названия путей — чтобы уже начатые игры не потеряли Дело */
var CAREER_ALIAS={priest:"clergy",landless:"bastard"};
function careerRank(id,v){return bandLabel(CAREER_BANDS[id],v)}
/* Дело идёт от сословия и эпохи. Одно место для правки. */
function arkYearOf(ch){var y=ch&&(ch.year!=null?ch.year:ch.epochYear);return (typeof y==="number")?y:1130}
function careerPathOf(ch,year){
 if(!ch)return "bastard";
 var e=ch.estate||(ch.career||{}).estate||"bastard";
 e=CAREER_ALIAS[e]||e;
 if(!CAREER_DEF[e])e="bastard";
 var y=(year!=null)?year:arkYearOf(ch);
 var era=arkEraOf(y);
 if(era&&era.careers&&era.careers[e]&&CAREER_DEF[era.careers[e]])return era.careers[e];
 return e;
}
function careerStatsOf(ch,year){return CAREER_DEF[careerPathOf(ch,year)].list}
/* Значение линейки. Если эпоха только что сменила дело — начинаем с рабочих 3. */
function careerVal(ch,id){var c=(ch&&ch.career)||{};return (typeof c[id]==="number")?c[id]:3}
var DEATH_BANDS=[[0,"Не познавший смерть"],[1,"Умерший однажды"],[2,"Умерший дважды"],[3,"Умерший трижды"],[4,"Истинная смерть"]];
function bandLabel(arr,v){if(!arr||!arr.length)return "";var out=arr[0][1];for(var i=0;i<arr.length;i++)if(v>=arr[i][0])out=arr[i][1];return out}
function bandRange(arr,v,top){if(!arr||!arr.length)return "";var k=0;for(var i=0;i<arr.length;i++)if(v>=arr[i][0])k=i;
 var a=arr[k][0],b=(k+1<arr.length)?arr[k+1][0]-1:top;return a===b?(""+a):(a+" … "+b)}
function statRank(id,v,max){return bandLabel(STAT_BANDS[id],v)}
function statRange(id,v,max){return bandRange(STAT_BANDS[id],v,max||10)}
function famRank(id,v){return bandLabel(FAM_BANDS[id],v)}
function provRank(id,v){return bandLabel(PROV_BANDS[id],v)}
function staminaRank(v,max){return bandLabel(STAMINA_BANDS,v)}
/* ==========================================================================
   Карточки справки — как в оригинале: значок, название, описание,
   черта, список полос, текущая выделена красным между ромбами.
   Открывается кликом по любой линейке. Работает без React.
   ========================================================================== */
var ARK_HELP={
 /* --- Личность --- */
 perception:{t:"Чуткость",sym:"◉",b:STAT_BANDS.perception,mn:0,mx:10,
  d:"Твоё внимание к миру и людям вокруг, умение воспринимать и учиться.|Повлияет на твой склад ума и способности во взрослой жизни."},
 resolve:{t:"Решительность",sym:"✊",b:STAT_BANDS.resolve,mn:0,mx:10,
  d:"Твоё упорство и сила характера, умение добиваться своего.|Повлияет на твой склад ума и способности во взрослой жизни."},
 nobility:{t:"Благородство",sym:"⛨",b:STAT_BANDS.nobility,mn:0,mx:10,
  d:"Благородство твоих помыслов и деяний, стремление к идеалам дворянской чести.|Влияет на то, способен ли ты стать дворянином мантии."},
 ingenuity:{t:"Находчивость",sym:"✧",b:STAT_BANDS.ingenuity,mn:0,mx:10,
  d:"Быстрота твоего ума, способность оборачивать ситуацию себе на пользу.|Влияет на то, способен ли ты выживать без сословных привилегий."},
 spirituality:{t:"Духовность",sym:"⸙",b:STAT_BANDS.spirituality,mn:0,mx:10,
  d:"Твоё стремление к постижению тайн бытия, исследованию божественного в мире, в других людях и в себе.|Влияет на то, способен ли ты стать священником."},

 /* --- Способности --- */
 diplomacy:{t:"Дипломатия",sym:"✒",b:STAT_BANDS.diplomacy,mn:0,mx:20,
  d:"Знание имперских законов, связи и влияние во властных кругах и в высшем обществе. От этого качества зависят твои возможности договариваться с важными людьми.|Наиболее важно для судьи."},
 valour:{t:"Доблесть",sym:"⚔",b:STAT_BANDS.valour,mn:0,mx:20,
  d:"Твои воинские таланты, мощь в битвах и поединках. Влияет на способность вести сражения и командовать войсками.|Наиболее важно для судьи."},
 theology:{t:"Теология",sym:"✝",b:STAT_BANDS.theology,mn:0,mx:20,
  d:"Твоё владение священными текстами и понимание божественных законов. Способность строить и защищать свои собственные трактовки веры.|Наиболее важно для инквизитора."},
 rhetoric:{t:"Красноречие",sym:"☘",b:STAT_BANDS.rhetoric,mn:0,mx:20,
  d:"Твоя способность вселять в людей веру, вести и направлять своими речами.|Наиболее важно для инквизитора."},
 manipulation:{t:"Манипуляция",sym:"✵",b:STAT_BANDS.manipulation,mn:0,mx:20,
  d:"Твоя способность влиять на людей хитростью и обманом, использовать их ради достижения своих целей.|Наиболее важно для заговорщика."},
 schemes:{t:"Тайные планы",sym:"⚚",b:STAT_BANDS.schemes,mn:0,mx:20,
  d:"Твоя способность сеять смуту, устраивать засады, убийства, налёты, вести подрывную деятельность. Определяет успех твоих преступных замыслов.|Наиболее важно для заговорщика."},

 /* --- Запас сил --- */
 stamina:{t:"Запас сил",sym:"🔥",b:STAMINA_BANDS,mn:-10,mx:30,
  d:"Мера твоих внутренних сил и готовности действовать. Тратится на совершение трудных поступков."},

 /* --- Дом --- */
 fam_repute:{t:"Репутация",sym:"❦",b:FAM_BANDS.repute,mn:0,mx:10,
  d:"Честь семьи, положение в высшем свете.|Влияет на отношение дворянского общества к вашей семье."},
 fam_wealth:{t:"Богатство",sym:"◈",b:FAM_BANDS.wealth,mn:0,mx:10,
  d:"Благосостояние вашей семьи, ваш достаток и владения."},
 fam_unity:{t:"Единство",sym:"♥",b:FAM_BANDS.unity,mn:0,mx:10,
  d:"Близость и доверие внутри вашего семейства.|Влияет на судьбу членов семьи."},

 /* --- Провинция --- */
 prov_power:{t:"Власть",sym:"♛",b:PROV_BANDS.power,mn:-5,mx:5,
  d:"Текущий расклад сил в борьбе за власть в провинции."},
 prov_church:{t:"Церковь",sym:"⛪",b:PROV_BANDS.church,mn:-5,mx:5,
  d:"Господствующее направление Церкви. Догмы, обряды и традиции, которых придерживается большинство жителей провинции."},
 prov_wealth:{t:"Достаток",sym:"⚘",b:PROV_BANDS.wealth,mn:0,mx:10,
  d:"Благосостояние провинции и её жителей."},
 prov_order:{t:"Порядок",sym:"⚖",b:PROV_BANDS.order,mn:0,mx:10,
  d:"Исполнение законов в провинции, прочность порядка в обществе."},

 /* --- Дело --- */
 car_career:{t:"Карьера",sym:"⌃",b:CAREER_BANDS.career,mn:0,mx:10,
  d:"Поддержка властей и дворянского сословия на твоём пути к креслу префекта провинции."},
 car_justice:{t:"Правосудие",sym:"⚖",b:CAREER_BANDS.justice,mn:0,mx:10,
  d:"Власть Префектуры и сила закона в провинции.|Определяет защиту низкого сословия от дворянского произвола."},
 car_inq_power:{t:"Сила Инквизиции",sym:"†",b:CAREER_BANDS.inq_power,mn:0,mx:10,
  d:"Влияние Ордена Инквизиции в провинции.|Определяет твои полномочия и духовный авторитет как инквизитора."},
 car_tolerance:{t:"Веротерпимость",sym:"✡",b:CAREER_BANDS.tolerance,mn:0,mx:10,
  d:"Распространение новых учений о Близнецах среди жителей провинции.|Чем выше веротерпимость, тем сложнее Инквизиции подавлять эти учения."},
 car_blood:{t:"Влияние Дома",sym:"❖",b:CAREER_BANDS.blood,mn:0,mx:10,
  d:"Вес твоего Дома среди аркнов и при дворе.|Определяет, слушают ли твоё слово те, в ком течёт голубая кровь."},
 car_humanRight:{t:"Право людей",sym:"⚖",b:CAREER_BANDS.humanRight,mn:0,mx:10,
  d:"Насколько люди провинции добились голоса против древних Домов.|Чем выше, тем труднее править одной лишь кровью."},
 car_trade:{t:"Промысел",sym:"⚒",b:CAREER_BANDS.trade,mn:0,mx:10,
  d:"Твой промысел, заказы и место в цехе.|Определяет, есть ли у тебя деньги и покровители наверху."},
 car_commune:{t:"Община",sym:"⚭",b:CAREER_BANDS.commune,mn:0,mx:10,
  d:"Доверие таких же, как ты.|Чем выше, тем больше людей за твоей спиной — и тем ближе квартал к бунту."},
 car_spynet:{t:"Шпионская сеть",sym:"☾",b:CAREER_BANDS.spynet,mn:0,mx:10,
  d:"Сеть шпионов и осведомителей, которой ты управляешь.|От неё зависит влияние Тайной канцелярии в городе."},
 car_unrest:{t:"Волнения",sym:"⚒",b:CAREER_BANDS.unrest,mn:0,mx:10,
  d:"Бунтарские настроения простолюдинов в провинции. Готовность низкого сословия выступить против властей и бороться за свои права."},

 car_craft:{t:"Волшебное ремесло",sym:"✧",b:CAREER_BANDS.craft,mn:0,mx:10,
  d:"Твоё место среди волшебников.|Пока дар законен — это почтенное ремесло."},
 car_dread:{t:"Страх перед даром",sym:"☾",b:CAREER_BANDS.dread,mn:0,mx:10,
  d:"Насколько люди боятся волшебства.|Чем выше, тем громче требуют запрета — и тем ближе Собор."},
 car_machine:{t:"Машины",sym:"⚙",b:CAREER_BANDS.machine,mn:0,mx:10,
  d:"Мануфактуры и паровые машины провинции.|Чем выше, тем меньше нужды в даре."},
 car_ties:{t:"Тёмные связи",sym:"⚯",b:CAREER_BANDS.ties,mn:0,mx:10,
  d:"Должники, скупщики и осведомители, которых ты знаешь по имени."},
 car_hunt:{t:"Розыск",sym:"⚑",b:CAREER_BANDS.hunt,mn:0,mx:10,
  d:"Насколько плотно тобой занялись власти.|Чем выше, тем ближе облава."},
 car_refuge:{t:"Укрытие",sym:"⌂",b:CAREER_BANDS.refuge,mn:0,mx:10,
  d:"Что осталось от Дома и где оно спрятано.|Голубая кровь больше не защищает."},
 car_bloodhunt:{t:"Охота на кровь",sym:"⚔",b:CAREER_BANDS.bloodhunt,mn:0,mx:10,
  d:"Как рьяно в провинции ищут аркнов."},

 /* --- Смерти --- */
 /* --- Дело --- */
 career:{t:"Карьера",sym:"⌸",b:CAREER_BANDS.career,mn:0,mx:10,
  d:"Поддержка властей и дворянского сословия на твоём пути к креслу префекта провинции."},
 justice:{t:"Правосудие",sym:"⚖",b:CAREER_BANDS.justice,mn:0,mx:10,
  d:"Власть Префектуры и сила закона в провинции.|Определяет защиту низкого сословия от дворянского произвола."},
 inq_power:{t:"Сила Инквизиции",sym:"✝",b:CAREER_BANDS.inq_power,mn:0,mx:10,
  d:"Влияние Ордена Инквизиции в провинции.|Определяет твои полномочия и духовный авторитет как инквизитора."},
 tolerance:{t:"Веротерпимость",sym:"✡",b:CAREER_BANDS.tolerance,mn:0,mx:10,
  d:"Распространение новых учений о Близнецах среди жителей провинции. Чем выше веротерпимость, тем сложнее Инквизиции подавлять эти учения."},
 spynet:{t:"Шпионская сеть",sym:"☾",b:CAREER_BANDS.spynet,mn:0,mx:10,
  d:"Сеть шпионов и осведомителей, которой ты управляешь.|От неё зависит влияние Тайной Канцелярии в городе."},
 unrest:{t:"Волнения",sym:"⚒",b:CAREER_BANDS.unrest,mn:0,mx:10,
  d:"Бунтарские настроения простолюдинов в провинции. Готовность низкого сословия выступить против властей и бороться за свои права."},

 /* --- Восстание --- */
 revolt:{t:"Восстание",sym:"⚔",b:REVOLT_BANDS.revolt,mn:0,mx:10,
  d:"Общая сила мятежа. Мощь и сплочённость восставших, поддержка мятежа среди горожан.|От этого зависит исход решающего столкновения."},
 army:{t:"Войска",sym:"⛨",b:REVOLT_BANDS.army,mn:0,mx:3,
  d:"Военная сила, которую тебе удалось собрать под своё начало."},
 nobles:{t:"Дворяне",sym:"♛",b:REVOLT_BANDS.support,mn:0,mx:3,
  d:"Степень твоего влияния среди знати.|От их поддержки зависит, сумеешь ли ты одержать верх в борьбе за город."},
 clergy:{t:"Духовенство",sym:"✝",b:REVOLT_BANDS.support,mn:0,mx:3,
  d:"Степень твоего влияния среди священников.|От их поддержки зависит, сумеешь ли ты одержать верх в борьбе за город."},
 commons:{t:"Простолюдины",sym:"⚖",b:REVOLT_BANDS.support,mn:0,mx:3,
  d:"Твоё влияние среди простого народа.|От поддержки простолюдинов зависит, сумеешь ли ты одержать верх в борьбе за город."},

 deaths:{t:"Смерти",sym:"☠",b:DEATH_BANDS,mn:0,mx:4,
  d:"Погибшего малой смертью ждёт перерождение. Погибшего истинной смертью ждёт суд Близнецов."},

};

function arkHelpClose(){
 var w=document.getElementById("arkHelp");
 if(w){w.remove();document.removeEventListener("keydown",arkHelpKey)}
}
function arkHelpKey(e){if(e.key==="Escape")arkHelpClose()}

function arkHelpOpen(id,val){
 var h=ARK_HELP[id];
 if(!h||typeof document==="undefined")return;
 arkHelpClose();
 val=(typeof val==="number")?val:0;
 var bands=h.b||[],cur=0;
 for(var i=0;i<bands.length;i++)if(val>=bands[i][0])cur=i;

 var wrap=document.createElement("div");
 wrap.id="arkHelp";
 wrap.style.cssText="position:fixed;inset:0;z-index:99998;background:rgba(6,5,3,.72);"+
  "display:flex;align-items:center;justify-content:center;padding:18px";

 var card=document.createElement("div");
 card.style.cssText="width:min(360px,92vw);max-height:88vh;overflow-y:auto;text-align:center;"+
  "background:linear-gradient(168deg,#e6dcc0 0%,#dfd3b2 46%,#d5c8a6 100%);"+
  "box-shadow:inset 0 0 70px rgba(120,95,55,.32),0 12px 50px rgba(0,0,0,.75);"+
  "border:1px solid #b9a87f;border-radius:3px;padding:22px 20px 24px;"+
  "font-family:'IM Fell English',Georgia,serif;color:#2a241c";

 /* Значок: тёмная стрельчатая арка с символом, как в книге */
 var ico='<svg viewBox="0 0 44 46" width="44" height="46" style="display:block;margin:0 auto 12px">'+
  '<path d="M6 44V20a16 16 0 0 1 32 0v24z" fill="#171310"/>'+
  '<rect x="2" y="38" width="40" height="6" fill="#171310"/>'+
  '<text x="22" y="32" text-anchor="middle" font-size="17" fill="#e6dcc0" '+
  'font-family="Georgia,serif">'+(h.sym||"◈")+'</text></svg>';

 var rule='<div style="height:1px;background:#2a241c;opacity:.75;margin:14px 2px"></div>';

 var _gr=(id&&typeof arkSkillFrom==="function")?arkSkillFrom(id):null;
 var dtxt=String(h.d||"")+(_gr?"|Вырастает из двух черт: "+_gr+".":"");
 var desc=dtxt.split("|").map(function(line,k){
  return '<div style="font-size:14px;line-height:1.5'+(k?';margin-top:4px':'')+
   (k?';font-style:italic':'')+'">'+line+'</div>'}).join("");

 var rows=bands.map(function(b,k){
  var from=b[0], to=(k+1<bands.length)?bands[k+1][0]-1:h.mx;
  var range=(from===to)?String(from):(from+" … "+to);
  var on=(k===cur);
  return '<div style="margin:'+(k?"18px":"2px")+' 0 0">'+
   '<div style="font-size:15px;letter-spacing:.5px;color:'+(on?"#8b1414":"#2a241c")+'">'+
   (on?'<span style="color:#2a241c;margin:0 9px">◈</span>':'')+
   '<b style="font-weight:'+(on?"700":"400")+'">'+range+'</b>'+
   (on?'<span style="color:#2a241c;margin:0 9px">◈</span>':'')+'</div>'+
   '<div style="font-size:15px;margin-top:2px;color:'+(on?"#8b1414":"#2a241c")+'">'+b[1]+'</div>'+
   '</div>'});

 card.innerHTML=ico+
  '<div style="font-family:\'Cinzel\',Georgia,serif;font-size:20px;letter-spacing:1px;'+
  'text-transform:uppercase;margin-bottom:2px">'+h.t+'</div>'+
  rule+desc+rule+rows.join("")+
  '<div style="margin-top:20px;font-size:11px;letter-spacing:2px;text-transform:uppercase;'+
  'color:#6a5c44;cursor:pointer" id="arkHelpX">Закрыть</div>';

 card.onclick=function(e){e.stopPropagation()};
 card.querySelector("#arkHelpX").onclick=arkHelpClose;
 wrap.onclick=arkHelpClose;
 wrap.appendChild(card);
 document.body.appendChild(wrap);
 document.addEventListener("keydown",arkHelpKey);
}


/* ==========================================================================
   Куски наказа Мастеру. Собираются из таблиц выше, а не набираются руками:
   иначе шкала меняется, а промпт остаётся старым — так уже было дважды.
   ========================================================================== */
function arkBandsText(bands,max){
 return bands.map(function(b,k){
  var to=(k+1<bands.length)?bands[k+1][0]-1:max;
  return (b[0]===to?b[0]:b[0]+".."+to)+"="+b[1]}).join(", ");
}
function arkPromptRelations(){
 return "ОТНОШЕНИЯ: value ЦЕЛОЕ "+REL_LADDER[0].v+".."+REL_LADDER[REL_LADDER.length-1].v+" ("+
  REL_LADDER.map(function(st,k){
   var to=(k+1<REL_LADDER.length)?REL_LADDER[k+1].v-1:5;
   return (st.v===to?st.v:st.v+".."+to)+" "+st.t}).join(", ")+").";
}
function arkPromptProvince(){
 var names={power:"Власть",church:"Церковь",wealth:"Достаток",order:"Порядок"};
 return "ПРОВИНЦИЯ: "+Object.keys(PROV_BANDS).map(function(id){
  var r=scaleOf("prov",id);
  return names[id]+"("+r[0]+".."+r[1]+": "+arkBandsText(PROV_BANDS[id],r[1])+")"}).join("; ")+".";
}
function arkPromptFamily(){
 var names={repute:"Репутация",wealth:"Богатство",unity:"Единство"};
 return "СЕМЬЯ (0..10, 5 среднее): "+Object.keys(FAM_BANDS).map(function(id){
  return names[id]+"("+arkBandsText(FAM_BANDS[id],10)+")"}).join("; ")+".";
}
function arkPromptCareers(){
 var out=[];
 for(var key in CAREER_DEF){
  var d=CAREER_DEF[key];
  out.push(d.nm+": "+d.list.map(function(c){
   return c.id+"("+c.nm+" — "+arkBandsText(CAREER_BANDS[c.id],10)+")"}).join("; "));
 }
 return "ДЕЛО — две линейки, заданные СОСЛОВИЕМ и ЭПОХОЙ. Обе 0..10, меняются через career_delta {stat,value}. "+
  "Линейки в паре ТЯНУТ В РАЗНЫЕ СТОРОНЫ: рост одной обычно стоит другой. "+
  "0 на первой — личный крах героя, 10 на любой — беда, только с разных сторон. "+
  out.join(" | ")+
  " Трогай ТОЛЬКО линейки текущего Дела. НИКОГДА не поминай институт, которого в этом году ещё или уже нет.";
}
/* Дело героя словами — для наказа Мастеру в конкретной партии */
function arkPromptCurrentCareer(ch,year){
 var d=CAREER_DEF[careerPathOf(ch,year)];
 return "ТВОЁ ДЕЛО СЕЙЧАС — "+d.nm+": "+d.list.map(function(c){return c.nm+" ("+c.id+")"}).join(", ")+".";
}

/* ==========================================================================
   Родство. Мастер присылает роли словами, поэтому разбираем по корню слова.
   Порядок важен: «прадед» проверяется раньше «деда».
   ========================================================================== */
var ARK_KIN=[
 {gen:-2,t:"Прадеды", w:["прадед","прабаб"]},
 {gen:-2,t:"Деды",    w:["дед","бабк","бабуш"]},
 {gen:-1,t:"Родители",w:["отец","отц","мать","матер","отчим","мачех","дядя","дяд","тёт","тет"]},
 {gen: 0,t:"Ровня",   w:["брат","сестр","жена","муж","супруг","кузен","кузин","невест","жених","свояк","золов","шурин"]},
 {gen: 1,t:"Дети",    w:["сын","дочь","дочер","племянник","племянниц","пасынок","падчериц"]},
 {gen: 2,t:"Внуки",   w:["внук","внучк","правнук"]}
];
function arkKinOf(role){
 var r=String(role||"").toLowerCase();
 if(!r)return null;
 for(var i=0;i<ARK_KIN.length;i++)
  for(var k=0;k<ARK_KIN[i].w.length;k++)
   if(r.indexOf(ARK_KIN[i].w[k])>=0)return ARK_KIN[i];
 return null;
}
/* Ряды дерева от старших к младшим. Не-родня сюда не попадает. */
function arkKinTree(list){
 var by={};
 (list||[]).forEach(function(p){
  var k=arkKinOf(p.role);
  if(!k)return;
  if(!by[k.gen])by[k.gen]={gen:k.gen,t:k.t,people:[]};
  by[k.gen].people.push(p);
 });
 return Object.keys(by).map(function(g){return by[g]})
  .sort(function(a,b){return a.gen-b.gen});
}
/* Мёртв ли: Мастер пишет статус словами. */
function arkIsDead(p){
 var st=String((p&&p.status)||"").toLowerCase();
 return st.indexOf("смерт")>=0||st.indexOf("погиб")>=0||st.indexOf("мёртв")>=0||st.indexOf("мертв")>=0;
}

/* ==========================================================================
   Восстание. Общая сила 0..10, поддержка сословий 0..3.
   Появляется, только когда мятеж действительно идёт.
   ========================================================================== */
var REVOLT_DEF={
 main:{id:"main",nm:"Восстание",col:"#8b1414",b:REVOLT_BANDS.revolt,
  d:"Общая сила мятежа. Мощь и сплочённость восставших, поддержка среди горожан.|От неё зависит исход решающего столкновения."},
 support:[
  {id:"army",   nm:"Войска",       col:"#8a4a2a",b:REVOLT_BANDS.army,   d:"Военная сила, которую тебе удалось собрать под своё начало."},
  {id:"nobles", nm:"Дворяне",      col:"#c4962a",b:REVOLT_BANDS.support,d:"Степень твоего влияния среди знати.|От их поддержки зависит, возьмёшь ли ты верх в борьбе за город."},
  {id:"clergy", nm:"Духовенство",  col:"#4a7a9a",b:REVOLT_BANDS.support,d:"Степень твоего влияния среди священников."},
  {id:"commons",nm:"Простолюдины", col:"#5a9a5a",b:REVOLT_BANDS.support,d:"Твоё влияние среди простого народа."}
 ]
};
ARK_HELP.rev_main={t:"Восстание",sym:"⚒",b:REVOLT_BANDS.revolt,mn:0,mx:10,d:REVOLT_DEF.main.d};
REVOLT_DEF.support.forEach(function(c){
 ARK_HELP["rev_"+c.id]={t:c.nm,sym:"⚔",b:c.b,mn:0,mx:3,d:c.d}});

/* Идёт ли мятеж: и эпоха допускает, и он объявлен в партии. */
function arkHasRevolt(ch,year){
 var E=window.ARK_ERAS;
 if(E&&!E.has(year!=null?year:arkYearOf(ch),"revolt"))return false;
 var r=ch&&ch.revolt;
 return !!(r&&r.active);
}
/* Есть ли Дар: волшебство по рождению либо чудеса Близнецов у священника. */
function arkHasGift(ch,year){
 var E=window.ARK_ERAS;
 if(E&&!E.has(year!=null?year:arkYearOf(ch),"magic"))return false;
 var g=ch&&ch.gift;
 return !!(g&&(g.mage||g.miracles));
}

/* ==========================================================================
   Книжный разворот для игры. Те же доли и краски, что в book.html.
   Левая страница — повествование, правая — выбор.
   ========================================================================== */
var ARK_BOOK={
 /* Ремни нарисованы на самой текстуре, поэтому у обёртки нет отступов:
    доли ремней должны совпасть с картинкой один в один. */
 shell:{position:"relative",flex:1,minHeight:0,display:"flex",alignItems:"stretch",
   justifyContent:"center",padding:0,
   background:"url('assets/img/book.webp') center/100% 100% no-repeat, #0a0806"},
 spread:{flex:1,minHeight:0,display:"flex",gap:"1.6%",maxWidth:1180,margin:"0 auto",
   padding:"3.2% 6.5% 4.2%"},
 page:{flex:1,minWidth:0,minHeight:0,overflowY:"auto",padding:"14px 16px 18px",
   background:"transparent",boxShadow:"none"},
 fold:{width:1,background:"linear-gradient(to bottom,transparent,rgba(60,44,22,.35),transparent)",
   flexShrink:0}
};
ARK_BOOK.pageL=Object.assign({},ARK_BOOK.page);
ARK_BOOK.pageR=Object.assign({},ARK_BOOK.page,{paddingTop:18});
/* Узкий экран: страницы встают друг под друга, иначе строка в 12 слов. */
function arkBookNarrow(){return (typeof window!=="undefined")&&window.innerWidth<760}

/* Узкий экран: разворот складывается в одну колонку, текстура книги убирается —
   на телефоне две страницы дают строку в десять слов. */
(function(){
 if(typeof document==="undefined"||document.getElementById("arkBookCSS"))return;
 var st=document.createElement("style");
 st.id="arkBookCSS";
 st.textContent="@media (max-width:760px){"+
  ".ark-shell{background:#0d0a06 !important;padding:0 !important}"+
  ".ark-spread{flex-direction:column !important;padding:0 !important;gap:0 !important}"+
  ".ark-spread>div{overflow:visible !important}"+
  "}";
 (document.head||document.documentElement).appendChild(st);
})();

/* Доли ремней на развороте — те же, что в book.html. */
var ARK_STRAP_TOP=0.252, ARK_STRAP_BOT=0.835;
function arkStrapTop(i,n){
 if(n<=1)return (ARK_STRAP_TOP+ARK_STRAP_BOT)/2;
 return ARK_STRAP_TOP+(ARK_STRAP_BOT-ARK_STRAP_TOP)*i/(n-1);
}
/* Золочение иконки при наведении — как в книге. */
var ARK_GILD="sepia(1) saturate(2.6) hue-rotate(-14deg) brightness(1.06) contrast(1.05)";
