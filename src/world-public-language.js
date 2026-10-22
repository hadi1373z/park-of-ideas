/* Explicit authored public canvas labels only. No canvas/DOM interception, private text,
 * data translation, renderer, persistence or remote requests. Source English stays raw.
 * Load park-tools/public-fa.js + reader-public-fa.js, then this file, before park.js.
 */
(function(g){'use strict';
 const records=new Set();
 const authored={
  'House of Ideas':'خانهٔ ایده‌ها',
  'A studio for the unfinished':'کارگاهی برای ایده‌های ناتمام',
  'Open questions':'پرسش‌های باز',
  'The amphitheatre':'آمفی‌تئاتر',
  'Observatory':'رصدخانه',
  'Look beyond the familiar':'فراتر از آشناها بنگر',
  'ATLAS · IDEAS PARK':'اطلس · پارک ایده‌ها',
  'Plant a question. Let it grow.':'پرسشی بکار. بگذار رشد کند.'
 };
 let lang=g.CITY_I18N?.lang||(new URLSearchParams(g.location.search).get('lang')==='fa'?'fa':'en');
 function counterpart(text){for(const map of [g.CITY_PARK_READER_FA,g.CITY_PARK_PUBLIC_FA,authored])if(map&&Object.prototype.hasOwnProperty.call(map,text))return map[text];return null;}
 function translatePublic(text){const raw=String(text==null?'':text);if(lang==='de')return g.CITY_PUBLIC_DE?.[raw]||raw;if(lang!=='fa')return raw;const value=counterpart(raw);return value==null?raw:String(value);}
 function refresh(){for(const record of records)record.repaint();return records.size;}
 function setLanguage(next){if(next!=='fa'&&next!=='en'&&next!=='de')return lang;if(next!==lang){lang=next;refresh();}return lang;}
 function registerPublicLabel(record){
  if(!record||record.private===true||typeof record.repaint!=='function')throw Error('Register only an explicitly authored public label with a repaint function.');
  const retained={title:String(record.title||''),subtitle:String(record.subtitle||''),repaint:record.repaint};records.add(retained);retained.repaint();
  let active=true;return function(){if(active){active=false;records.delete(retained);}};
 }
 function coverage(){const labels=new Set();for(const r of records){if(r.title)labels.add(r.title);if(r.subtitle)labels.add(r.subtitle);}return {records:records.size,publicStrings:labels.size,missing:Array.from(labels).filter(text=>counterpart(text)==null)};}
 g.CITY_WORLD_PUBLIC_LANGUAGE={ready:true,getLanguage:()=>lang,setLanguage,translatePublic,registerPublicLabel,refresh,coverage};
 g.addEventListener('city-language',e=>setLanguage(e.detail?.lang));
 g.addEventListener('message',e=>{if(e.origin===g.location.origin&&e.data?.type==='city-language')setLanguage(e.data.lang);});
})(window);
