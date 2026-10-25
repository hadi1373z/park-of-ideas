import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {createPaperChase,chaseTarget,CHASE_FLOCK,CHASE_HOME,CHASE_KEY,targetBearing,nextPadFocus} from '../src/skyfold/chase.js';
import {buildChaseWorld} from '../src/skyfold/chase-world.js';
import {onPaper} from '../src/skyfold/journey.js';
const values=new Map(),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},chase=createPaperChase(storage),far={x:60,z:30};
assert.equal(chase.active,false);assert.equal(chase.catch(far).ok,false);chase.start();
assert.equal(chase.catch(far).reason,'distance');assert.equal(chase.state.caught.length,0);
for(let i=0;i<5;i++)for(let t=0;t<200;t+=.9){const p=chaseTarget(i,t);assert.ok(onPaper(p.x,p.z));assert.ok(Math.hypot(p.x-CHASE_FLOCK[i].x,p.z-CHASE_FLOCK[i].z)<2.3);}
assert.notDeepEqual(chaseTarget(0,0),chaseTarget(0,3));assert.deepEqual(chaseTarget(0,0,true),chaseTarget(0,3,true));
assert.equal(chase.dash(),true);assert.equal(chase.dashing,true);assert.equal(chase.dash(),false,'An active dash cannot be restarted');
for(let i=0;i<15;i++)chase.tick(.06,far);assert.equal(chase.dashing,false);assert.equal(chase.dashReady,false);
chase.pause();const held=chase.state;for(let i=0;i<50;i++)chase.tick(.06,far);assert.deepEqual(chase.state,held);assert.equal(chase.catch(chase.target()).reason,'paused');assert.equal(chase.dash(),false);chase.resume();for(let i=0;i<50;i++)chase.tick(.06,far);assert.equal(chase.dashReady,true);
chase.start();for(let i=0;i<5;i++){const target=chase.target();const caught=chase.catch(target);assert.equal(caught.ok,true);assert.equal(caught.streak,i+1);assert.equal(caught.points,100+i*25);if(i<4)assert.equal(chase.catch(target).ok,false,'One press cannot catch a second distant crane');}
assert.equal(chase.state.phase,'playing','Catching five is not the finish');assert.equal(chase.state.score,750);assert.equal(chase.tick(.06,far),null);assert.equal(chase.tick(.06,CHASE_HOME),'won');assert.equal(chase.state.phase,'won');assert.ok(chase.record.bestScore>750);assert.equal(chase.record.completed,1);assert.deepEqual(createPaperChase(storage).record,chase.record);
const record=chase.record;chase.start(true);for(let i=0;i<1600;i++)chase.tick(.06,far);assert.equal(chase.state.phase,'playing','Practice has no deadline');for(let i=0;i<5;i++)chase.catch(chase.target());chase.tick(.06,CHASE_HOME);assert.equal(chase.state.phase,'won');assert.equal(chase.record.bestScore,record.bestScore,'Practice cannot replace the challenge record');
chase.start();chase.catch(chase.target());for(let i=0;i<220;i++)chase.tick(.06,far);assert.equal(chase.catch(chase.target()).streak,1,'A slow catch starts a fresh streak');for(let i=0;i<1600;i++)chase.tick(.06,far);assert.equal(chase.state.phase,'lost');assert.equal(chase.state.elapsed,90);assert.equal(chase.catch(chase.target()).ok,false);assert.equal(chase.record.bestScore,record.bestScore);
const copy=chase.state;copy.caught.length=0;assert.equal(chase.state.caught.length,2);chase.stop();assert.equal(chase.active,false);
values.set(CHASE_KEY,'{"version":1,"bestScore":"bad","bestTime":-3,"completed":-1}');assert.equal(createPaperChase(storage).record.bestScore,0);
const memory=createPaperChase({getItem(){throw Error();},setItem(){throw Error();}});memory.start(true);for(let i=0;i<5;i++)memory.catch(memory.target());memory.tick(.06,CHASE_HOME);assert.equal(memory.state.phase,'won');assert.equal(memory.saved,false);
assert.equal(nextPadFocus(-1,3,-1),2);assert.equal(nextPadFocus(2,3,1),0);assert.equal(nextPadFocus(0,0,1),-1);assert.equal(targetBearing({x:0,z:0,yaw:0},{x:10,z:0}).degrees,90);assert.equal(targetBearing({x:0,z:0,yaw:0},{x:0,z:-10}).distance,10);
const T={};vm.runInNewContext(await readFile(new URL('../src/assets/three.min.js',import.meta.url),'utf8'),{exports:T,module:{exports:T},console:{warn(){}}});
const round=createPaperChase(),world=buildChaseWorld(T,round,()=>0);world.update();assert.equal(world.group.visible,false);round.start();world.update();assert.equal(world.birds.filter(b=>b.group.visible).length,1);assert.equal(world.mark.visible,true);for(const b of world.birds){assert.equal(b.group.userData.paperOnly,true);assert.equal(b.group.userData.addedParts,0);}for(let i=0;i<5;i++)round.catch(round.target());for(let i=0;i<40;i++)round.tick(.06,far);world.update();assert.equal(world.birds.filter(b=>b.group.visible).length,5);assert.equal(world.mark.visible,false);for(const b of world.birds)assert.ok(Math.hypot(b.group.position.x,b.group.position.z-60)<3.5,'Caught cranes return to the real home fold');world.dispose();world.dispose();assert.equal(world.group.children.length,0);
// Exercise the actual shared standard-controller adapter with held buttons,
// disconnection and modal blocking; do not claim a physical hardware test.
const ctx={window:{}};vm.runInNewContext(await readFile(new URL('../src/gamepad-input.js',import.meta.url),'utf8'),ctx);let pads=[];const input=ctx.window.createCityGamepad(()=>pads),pad={index:0,connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false}))};pads=[pad];input.poll();pad.buttons[0].pressed=true;assert.equal(input.poll().confirm,true);assert.equal(input.poll().confirm,false);pad.buttons[0].pressed=false;input.poll();pad.buttons[2].pressed=true;assert.equal(input.poll().light,true,'West / X / Square dashes');pad.buttons[9].pressed=true;assert.equal(input.poll().menu,true);pad.axes=[1,-1,.7,0];const moving=input.poll();assert.equal(moving.forward,1);assert.equal(moving.strafe,1);const modal=input.poll(true);assert.equal(modal.forward,0);assert.equal(modal.lookX,0);assert.equal(modal.uiX,1);pad.buttons[1].pressed=true;assert.equal(input.poll(true).back,true);pads=[];assert.equal(input.poll().connected,false);
console.log('PASS: moving paper-only chase targets, five-catch delivery goal, streak scoring, dash cooldown, pause/practice/deadline/replay, honest local records, home flock geometry and simulated standard controller edges.');

// A small DOM fixture runs the real menu adapter. In particular, A on the
// title screen must open the lobby, the next A starts play, and Resume must
// consume A rather than forwarding it to a catch or a nearby fold.
const {createChaseUI}=await import('../src/skyfold/chase-ui.js');
class Element{
 constructor(tag,id=''){this.tagName=tag.toUpperCase();this.id=id;this.children=[];this.hidden=false;this.disabled=false;this.open=false;this.style={};this.textContent='';this.classList={add(){},remove(){},toggle(){}};}
 append(...nodes){for(const n of nodes){n.parentElement=this;this.children.push(n);}}
 replaceChildren(...nodes){this.children=[];this.append(...nodes);}
 querySelectorAll(selector){const all=[];const visit=e=>{for(const c of e.children){if(selector==='button'?c.tagName==='BUTTON':['BUTTON','INPUT','SUMMARY','TEXTAREA','A'].includes(c.tagName)&&!c.disabled)all.push(c);visit(c);}};visit(this);return all;}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
 getClientRects(){return this.hidden?[]:[{}];}
 matches(selector){return selector.split(',').some(s=>s.trim().startsWith(this.tagName.toLowerCase()));}
 focus(){doc.activeElement=this;}
 click(){if(!this.disabled)this.onclick?.();}
 showModal(){this.open=true;this.querySelector('button')?.focus();}
 close(){this.open=false;}
 addEventListener(){}
}
const elements=new Map();for(const id of['chase-dialog','chase-dialog-word','chase-dialog-title','chase-dialog-description','chase-dialog-controls','chase-dialog-record','chase-hud','chase-actions','chase-guide','chase-reticle','fold-panel','welcome','controller-status'])elements.set(id,new Element('section',id));for(const id of['play-chase','chase-pause','chase-catch','chase-dash','chase-dialog-close','journey-open'])elements.set(id,new Element('button',id));elements.set('paper-world',new Element('canvas','paper-world'));elements.get('fold-panel').hidden=true;elements.get('welcome').append(elements.get('play-chase'));elements.get('chase-dialog').append(elements.get('chase-dialog-close'),elements.get('chase-dialog-controls'));
const doc={activeElement:null,body:new Element('body'),getElementById:id=>elements.get(id),createElement:tag=>new Element(tag),querySelector:selector=>selector==='dialog[open]'&&elements.get('chase-dialog').open?elements.get('chase-dialog'):null,addEventListener(){}};
const beforeDocument=globalThis.document;globalThis.document=doc;
try{
 const game=createPaperChase();let ui,starts=0;
 const experience={clear(){},startChase(practice){starts++;game.start(practice);},pauseChase(){if(game.pause())ui.event('paused',{reason:'menu'});},resumeChase(){game.resume();},stopChase(){game.stop();}};
 ui=createChaseUI(game,{getExperience:()=>experience,onStart(){elements.get('welcome').hidden=true;},onExit(){},status(){}});
 const press={connected:true,confirm:true,next:false,previous:false,uiX:0,menu:false};
 assert.equal(ui.pad(press,1),true);assert.equal(elements.get('chase-dialog').open,true);assert.equal(doc.activeElement.textContent,'Play the 90-second challenge');assert.equal(starts,0);
 assert.equal(ui.pad(press,2),true);assert.equal(starts,1);assert.equal(game.playing,true);assert.equal(game.state.caught.length,0);assert.equal(elements.get('chase-dialog').open,false);
 experience.pauseChase();assert.equal(game.state.phase,'paused');assert.equal(doc.activeElement.textContent,'Resume the flight');
 assert.equal(ui.pad({...press,confirm:false,next:true},3),true);assert.equal(doc.activeElement.textContent,'Restart this flight');
 ui.pad({...press,confirm:false,previous:true},4);assert.equal(doc.activeElement.textContent,'Resume the flight');
 assert.equal(ui.pad(press,5),true);assert.equal(game.playing,true);assert.equal(starts,1,'Resume does not restart the game');assert.equal(game.state.caught.length,0);assert.equal(elements.get('chase-dialog').open,false);
}finally{if(beforeDocument===undefined)delete globalThis.document;else globalThis.document=beforeDocument;}
console.log('PASS: actual controller menu adapter starts from the title screen, focuses Play and Resume, supports D-pad, and consumes confirmations without duplicate scene actions.');
