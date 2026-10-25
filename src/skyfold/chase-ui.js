import {nextPadFocus} from './chase.js';

export function createChaseUI(chase,{getExperience,onStart,onExit,status}){
 const $=id=>document.getElementById(id),dialog=$('chase-dialog');let padAdjusted=0,wasConnected=false,previousDevice='';
 const experience=()=>getExperience();
 function text(id,value){if($(id).textContent!==value)$(id).textContent=value;}
 function control(label,fn,primary=false){const b=document.createElement('button');b.type='button';b.textContent=label;b.className=primary?'primary':'chase-menu-button';b.disabled=!experience();b.onclick=fn;return b;}
 function display(kind,title,description){
  experience()?.clear();$('chase-dialog-word').textContent=kind;$('chase-dialog-title').textContent=title;$('chase-dialog-description').textContent=description;$('chase-dialog-controls').replaceChildren();
  $('chase-dialog-record').textContent=!chase.saved?'Browser storage is unavailable. Records last for this visit.':chase.record.bestScore?`Best challenge: ${chase.record.bestScore} points · fastest flight ${Math.round(chase.record.bestTime)}s`:'Your best challenge score will stay in this browser.';
  if(!dialog.open)dialog.showModal();
 }
 function exit(){dialog.close();experience()?.stopChase();document.body.classList.remove('playing-chase');$('chase-hud').hidden=true;$('chase-actions').hidden=true;$('chase-guide').hidden=true;$('chase-reticle').hidden=true;onExit();}
 function start(practice=false){if(!experience())return;dialog.close();onStart();experience().startChase(practice);document.body.classList.add('playing-chase');for(const id of['chase-hud','chase-actions','chase-guide','chase-reticle'])$(id).hidden=false;document.getElementById('paper-world').focus({preventScroll:true});refresh();status(practice?'Practice flight: catch five paper cranes, then follow the arrow home.':'Paper Chase: catch five cranes and return to the red starting fold.');}
 function lobby(){
  if(chase.active){pause();return;}
  display('A SMALL GAME IN A PAPER WORLD','Paper Chase','Five cranes are drifting through the park. Find each one, get close and catch it. Then bring the flock back to the red starting fold. Catch quickly for streak bonuses; dash to cover ground.');
  $('chase-dialog-controls').append(control('Play the 90-second challenge',()=>start(false),true),control('Practice without a timer',()=>start(true)));
  const close=control('Back to the park',()=>dialog.close());close.disabled=false;$('chase-dialog-controls').append(close);
  $('chase-dialog-controls').querySelector('button')?.focus();
 }
 function paused(reason){
  const description=reason==='controller'?'Your controller disconnected. Reconnect it, or continue with keyboard and touch. The clock is stopped.':reason==='hidden'||reason==='focus'?'Your flight paused while you were away. The clock is stopped.':'Take a breather. Your time, cranes and score are waiting here.';
  display('FLIGHT PAUSED','Ready when you are.',description);
  $('chase-dialog-controls').append(control('Resume the flight',resume,true),control('Restart this flight',()=>start(chase.state.practice)),control('Exit to the park',exit));
  $('chase-dialog-controls').querySelector('button')?.focus();
 }
 function pause(){if(chase.playing)experience()?.pauseChase();else if(chase.state.phase==='paused')paused('menu');}
 function resume(){dialog.close();experience()?.resumeChase();$('paper-world').focus({preventScroll:true});}
 function result(won){
  const s=chase.state,title=won?'The flock is home.':'One more flight?';
  const description=won?`${s.score} points · five cranes home in ${Math.round(s.elapsed)} seconds.${s.newBest?' A new best score!':s.practice?' A complete practice flight.':''}`:`${s.caught.length} of five cranes caught · ${s.score} points. Try again, or take an unhurried practice flight.`;
  display(won?'A GOOD FLIGHT':'THE CLOCK HAS LANDED',title,description);
  $('chase-dialog-controls').append(control('Play the challenge again',()=>start(false),true),control('Practice without a timer',()=>start(true)),control('Explore the park',exit));
  $('chase-dialog-controls').querySelector('button')?.focus();
 }
 function event(type,detail){
  if(type==='paused')paused(detail.reason);
  if(type==='won'||type==='lost')result(type==='won');
  if(type==='caught')status(detail.returning?'Five cranes! Follow the arrow back to the red starting fold.':`Crane caught! +${detail.points}${detail.streak>1?' · '+detail.streak+'-catch streak':''}`);
  if(type==='miss')status(detail.reason==='distance'?'Move closer to the drifting crane, then press A / × or E.':detail.reason==='home'?'Follow the arrow to bring the flock home.':'Resume your flight to catch a crane.');
  refresh();
 }
 function refresh(){
  const v=experience()?.chaseView;if(!v||v.phase==='idle')return;
  const seconds=Math.ceil(v.remaining),clock=v.practice?'∞':Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
  text('chase-clock',clock);text('chase-score',String(v.score));text('chase-count',v.caught.length+' / 5');
  text('chase-target-name',v.caught.length===5?'Bring the flock home':v.target.name);
  text('chase-distance',Math.ceil(v.bearing.distance)+' m · '+(v.caught.length===5?'return to the red fold':v.canCatch?'close enough to catch':'follow the arrow'));
  $('chase-arrow').style.transform=`rotate(${v.bearing.degrees.toFixed(1)}deg)`;
  $('chase-catch').disabled=!v.canCatch;text('chase-catch',v.caught.length===5?'Return home':'A / ×  Catch');
  $('chase-dash').disabled=!v.dashReady;text('chase-dash',v.dashReady?'X / □  Dash':'Dash · '+Math.max(1,Math.ceil(v.dashReadyAt-v.elapsed))+'s');
  const streak=v.lastCatch!==null&&v.elapsed-v.lastCatch<=12&&v.streak>1;
  text('chase-streak',streak?v.streak+'-catch streak':'Catch · dash · return');
  $('chase-clock').classList.toggle('urgent',!v.practice&&v.remaining<=15);
 }
 function close(){if(chase.state.phase==='paused')resume();else if(chase.active)exit();else dialog.close();}
 function pad(g,time){
  const device=g.connected?'Controller ready · A / × select':'Controller: press a button to connect';
  if(device!==previousDevice){text('controller-status',device);previousDevice=device;}
  const scope=document.querySelector('dialog[open]')||(!$('fold-panel').hidden?$('fold-panel'):!$('welcome').hidden?$('welcome'):null);
  const justConnected=g.connected&&!wasConnected;wasConnected=!!g.connected;if(!g.connected||!scope)return false;
  if(g.menu&&scope===$('welcome')){$('journey-open').click();return true;}
  const options=[...scope.querySelectorAll('button:not(:disabled),input[type="range"]:not(:disabled),summary,textarea,a[href]')].filter(e=>e.getClientRects().length);
  let active=document.activeElement,index=options.indexOf(active);
  if(g.next||g.previous){index=nextPadFocus(index,options.length,g.next?1:-1);options[index]?.focus();return true;}
  if(index<0&&(justConnected||g.confirm)){active=options[0];active?.focus();}
  if(active?.matches('input[type="range"]')&&Math.abs(g.uiX)>.5&&time-padAdjusted>.12){active.value=Math.max(Number(active.min),Math.min(Number(active.max),Number(active.value)+Math.sign(g.uiX)));active.dispatchEvent(new Event('input',{bubbles:true}));padAdjusted=time;return true;}
  if(g.confirm&&active?.matches('button,summary,a[href]')){active.click();return true;}
  return false;
 }
 $('play-chase').onclick=lobby;$('chase-pause').onclick=pause;$('chase-catch').onclick=()=>{experience()?.catch();$('paper-world').focus({preventScroll:true});};$('chase-dash').onclick=()=>{experience()?.dash();$('paper-world').focus({preventScroll:true});};$('chase-dialog-close').onclick=close;
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});document.addEventListener('skyfold-frame',refresh);
 return{lobby,pause,close,event,pad,refresh};
}
