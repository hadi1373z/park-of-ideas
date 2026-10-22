window.CITY_CONFIG=Object.freeze({showGroundPaving:false});
window.CITY_I18N={get lang(){return window.CITY_PARK_LANGUAGE?.getLanguage()||'en';},tx(fa,en){return this.lang==='fa'?fa:this.translatePublic(en);},translatePublic(text){return this.lang==='de'?(window.CITY_PUBLIC_DE?.[text]||text):this.lang==='fa'?(window.CITY_PARK_LANGUAGE?.translate(text)||text):text;}};
const chooser=document.getElementById('park-language');chooser.value=new URLSearchParams(location.search).get('lang')||'en';
chooser.addEventListener('change',()=>{CITY_PARK_LANGUAGE.setLanguage(chooser.value);dispatchEvent(new CustomEvent('city-language',{detail:{lang:chooser.value}}));});
