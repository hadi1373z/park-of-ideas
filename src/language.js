/* Public Atlas FA/EN counterpart. Original data, IDs and browser-local text stay in the original source closures. */
(function (g) {
  'use strict';
  var doc = g.document, norm = function (s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); };
  var originals = new WeakMap(), attributes = new WeakMap(), publicBlocks = new WeakMap();
  var requested=new URLSearchParams(g.location.search).get('lang');var lang=['fa','de'].includes(requested)?requested:'en';
  var scheduled = false, observer, guardTimer, dictionary = {}, fragments = [], signature = '', sourcePeople = null, refreshGuarded = false;
  var privateSelector = '[data-city-private],input,textarea,[contenteditable="true"]';
  var skipped = privateSelector + ',script,style,svg,code,pre,.math-box,.math-display,.formula,[role="math"],.math-expression,.tex-source,.plain-notation,[data-city-public-key]';
  var shared = {
    'PARK OF IDEAS':'پارک ایده‌ها',
    'Language':'زبان',
    'Atlas · Ideas Park':'اطلس · پارک ایده‌ها',
    'The original park tools, catalogue, reader, missions and personal idea grove are available here. Garden visits return you to walking in the shared city.':'ابزارهای اصلی پارک، فهرست، خوانشگر، مأموریت‌ها و باغچهٔ شخصی ایده‌ها در اینجا در دسترس‌اند. بازدید از باغ‌ها شما را به پیاده‌روی در شهر مشترک برمی‌گرداند.',
    'Nine gardens':'نه باغ','Search all minds':'جست‌وجوی همهٔ اندیشمندان','Your idea grove':'باغچهٔ ایده‌های شما','Missions':'مأموریت‌ها','Reading paths':'مسیرهای خواندن','Complete Atlas reader':'خوانشگر کامل اطلس',
    'Born':'زادروز','BCE':'پیش از میلاد','Unsave':'حذف از نشان‌شده‌ها','Profile of':'زندگی و اندیشهٔ','Copy link to':'کپی پیوندِ','thinking':'اندیشیدن','matches':'نتیجه','match':'نتیجه','ideas':'ایده','idea':'ایده','planted':'کاشته‌شده','taking root':'در حال ریشه گرفتن','min':'دقیقه','connections':'پیوند','profiles':'مدخل','reference':'منبع','references':'منبع','Map of nine idea gardens around Curiosity Square':'نقشهٔ نه باغ ایده پیرامون میدان کنجکاوی','Visit Curiosity Square':'بازدید از میدان کنجکاوی','The Ideas Park':'پارک ایده‌ها','A world to wander. A question to follow.':'جهانی برای گشتن. پرسشی برای دنبال کردن.','Explore six mathematical profiles':'کاوش شش زندگی و اندیشهٔ ریاضی','Read about':'خواندن دربارهٔ','ONE QUESTION. MANY WAYS TO THINK.':'یک پرسش. راه‌های بسیار برای اندیشیدن.','von Neumann':'فون نویمان'
  };
  function buildDictionary() {
    var a = g.CITY_PARK_PUBLIC_FA || {}, b = g.CITY_PARK_READER_FA || {};
    if (!sourcePeople && g.Atlas) sourcePeople = g.Atlas.catalogue.people;
    var people = sourcePeople || [];
    var next = Object.keys(a).length + ':' + Object.keys(b).length + ':' + people.length+':'+lang;
    if (next === signature) return;
    signature = next; dictionary = {};
    [shared,a,b].forEach(function (part) { Object.keys(part).forEach(function (key) { dictionary[norm(key)] = lang==='de'?(g.CITY_PUBLIC_DE?.[key]||key):part[key]; }); });
    people.forEach(function(p) {var full=dictionary[norm(p.name)];if(!full)return;var surname=norm(p.name).split(' ').pop(), faSurname=norm(full).split(' ').pop();if(!dictionary[surname])dictionary[surname]=faSurname;});
    fragments = Object.keys(dictionary).filter(function (key) { return /[A-Za-z]/.test(key) && key.length > 2 && dictionary[key] !== key; }).sort(function (a,b) { return b.length-a.length; });
  }
  function lookup(text) { buildDictionary(); var key = norm(text); return Object.prototype.hasOwnProperty.call(dictionary,key) ? dictionary[key] : null; }
  function translate(text, language) {
    var raw = String(text == null ? '' : text); if (!['fa','de'].includes(language || lang)) return raw;
    var exact = lookup(raw); if (exact != null) return raw.match(/^\s*/)[0] + exact + raw.match(/\s*$/)[0];
    // Only exact authored fragments may be replaced; generated numbers and punctuation are retained.
    var value = raw, slots = [];
    fragments.forEach(function (key) {
      if (value.indexOf(key) < 0) return;
      var at = 0, found;
      while ((found = value.indexOf(key,at)) >= 0) {
        var before = value[found-1] || '', after = value[found+key.length] || '';
        if ((/[A-Za-z]/.test(key[0]) && /[A-Za-z]/.test(before)) || (/[A-Za-z]/.test(key[key.length-1]) && /[A-Za-z]/.test(after))) { at=found+key.length; continue; }
        var token = '\uE000' + slots.length + '\uE001'; slots.push(dictionary[key]); value=value.slice(0,found)+token+value.slice(found+key.length); at=found+token.length;
      }
    });
    return value.replace(/\uE000(\d+)\uE001/g,function (_,i) { return slots[Number(i)]; });
  }
  function isPrivate(node) { var el=node && (node.nodeType===1 ? node : node.parentElement); return !!(el && el.closest && el.closest(privateSelector)); }
  function guard() {
    doc.dispatchEvent(new CustomEvent('city-language-will-change',{detail:{lang:lang}}));
    clearTimeout(guardTimer); guardTimer=setTimeout(function () { doc.dispatchEvent(new CustomEvent('city-language-did-change',{detail:{lang:lang}})); },160);
  }
  function guardOnce() {if(!refreshGuarded){refreshGuarded=true;guard();}}
  function textNode(node) {
    var parent=node.parentElement; if (!parent || !parent.closest) return;
    // Untranslated full Nietzsche paragraphs stay wholly in their preserved original language.
    if(parent.tagName.toUpperCase()==='P' && parent.closest('details'))return;
    var svgText=/^(TEXT|TSPAN)$/.test(parent.tagName.toUpperCase()) && parent.closest('svg');
    if(parent.closest(skipped) && !(svgText && !parent.closest(privateSelector+',script,style,code,pre,.formula,[role="math"],.math-box')))return;
    var record=originals.get(node);
    if(record && record.lang===lang && record.version===signature && node.nodeValue===record.last)return;
    if (!record || (node.nodeValue!==record.last && node.nodeValue!==record.raw)) record={raw:node.nodeValue,last:node.nodeValue};
    var exactSVG=svgText && lang!=='en' ? lookup(record.raw) : null;
    var next=svgText ? (exactSVG==null ? record.raw : exactSVG) : translate(record.raw); if(node.nodeValue!==next){guardOnce();node.nodeValue=next;} record.last=next;record.lang=lang;record.version=signature; originals.set(node,record);
  }
  function html(s) { return String(s).replace(/[&<>"']/g,function(c) {return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function element(el) {
    if (isPrivate(el)) {
      // Placeholders label a tool; input values and textarea text are always private.
      if (!/^(INPUT|TEXTAREA)$/.test(el.tagName)) return;
    }
    if (el.closest && el.closest('script,style,code,pre,.formula,[role="math"],[data-city-private]')) return;
    if (el.hasAttribute && el.hasAttribute('data-city-public-key')) {
      var source=el.getAttribute('data-city-public-key'), rec=publicBlocks.get(el);
      if(!rec)rec={raw:el.innerHTML,last:el.innerHTML};
      var translated=lang==='fa' ? lookup(source) : null;
      var next=translated==null ? rec.raw : html(translated).replace(/\n/g,'<br>');
      if(el.innerHTML!==next){guardOnce();el.innerHTML=next;}rec.last=next;publicBlocks.set(el,rec);
    }
    var records=attributes.get(el)||{};
    ['title','aria-label','placeholder','alt'].forEach(function(name) {
      if(!el.hasAttribute || !el.hasAttribute(name))return;
      var current=el.getAttribute(name),rec=records[name];
      if(!rec || (current!==rec.last && current!==rec.raw))rec={raw:current,last:current};
      var next=translate(rec.raw);if(current!==next){guardOnce();el.setAttribute(name,next);}rec.last=next;records[name]=rec;
    }); attributes.set(el,records);
  }
  function refresh() {
    if(!doc.documentElement)return;
    refreshGuarded=false;buildDictionary(); if(observer)observer.disconnect();
    if(doc.documentElement.lang!==lang || doc.documentElement.dir!==(lang==='fa'?'rtl':'ltr'))guardOnce();
    doc.documentElement.lang=lang;doc.documentElement.dir=lang==='fa'?'rtl':'ltr';
    if(doc.body)doc.body.dataset.language=lang;
    var walker=doc.createTreeWalker(doc.documentElement,NodeFilter.SHOW_TEXT);var node;
    while((node=walker.nextNode()))textNode(node);
    Array.prototype.forEach.call(doc.querySelectorAll('*'),element);
    if(observer)observer.observe(doc.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','placeholder','alt']});
    scheduled=false;
  }
  function schedule() {if(scheduled)return;scheduled=true;requestAnimationFrame(refresh);}
  function relay() {Array.prototype.forEach.call(doc.querySelectorAll('iframe'),function (frame) {try {frame.contentWindow.postMessage({type:'city-language',lang:lang},g.location.origin);}catch (_) {}});}
  function setLanguage(value) {lang=['fa','de'].includes(value)?value:'en';refresh();relay();return lang;}
  function publicSearchText(value) {var raw=String(value==null?'':value);var pieces=raw.split(/\n\s*\n/);return raw+' '+pieces.map(function(p){return translate(p,'fa');}).join(' ');}
  function boot() {
    var style=doc.createElement('style');style.textContent='body[data-language="fa"]{direction:rtl}body[data-language="fa"] .article,body[data-language="fa"] .lead,body[data-language="fa"] .ui-text,body[data-language="fa"] .park-tools-intro{text-align:right}body[data-language="fa"] .math-box,body[data-language="fa"] .math-display,body[data-language="fa"] .formula,body[data-language="fa"] [role="math"],body[data-language="fa"] code,body[data-language="fa"] pre{direction:ltr;text-align:left}body[data-language="fa"] input[type="url"]{direction:ltr}';doc.head.appendChild(style);
    observer=new MutationObserver(schedule);refresh();
    doc.addEventListener('load',function(e){if(e.target.tagName==='IFRAME')relay();},true);
  }
  g.CITY_PARK_LANGUAGE={ready:true,getLanguage:function(){return lang;},setLanguage:setLanguage,translate:translate,publicSearchText:publicSearchText,matchesPublicQuery:function(text,q){return publicSearchText(text).toLowerCase().includes(String(q||'').toLowerCase());},refresh:refresh,isPrivateDOM:isPrivate,coverage:function(){buildDictionary();return {catalogue:Object.keys(g.CITY_PARK_PUBLIC_FA||{}).length,reader:Object.keys(g.CITY_PARK_READER_FA||{}).length,normalizedKeys:Object.keys(dictionary).length};}};
  g.addEventListener('message',function(e){if(e.origin!==g.location.origin || !e.data || e.data.type!=='city-language')return;setLanguage(e.data.lang);});
  if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(window);
