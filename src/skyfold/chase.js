import {onPaper} from './journey.js';

export const CHASE_KEY='skyfold:paper-chase:v1';
export const CHASE_HOME={x:0,z:60,radius:6};
export const CHASE_SECONDS=90;
export const CATCH_RADIUS=5;
export const CHASE_FLOCK=[
 {id:'sun',name:'The sunlit crane',x:13,z:48},
 {id:'wing',name:'The pavilion crane',x:38,z:31},
 {id:'river',name:'The river crane',x:27,z:-16},
 {id:'cloud',name:'The cloud crane',x:-8,z:-29},
 {id:'crease',name:'The canyon crane',x:-35,z:14}
];

export function chaseTarget(index,elapsed,reduced=false){
 const bird=CHASE_FLOCK[index];if(!bird)return null;
 const t=reduced?index*1.8:elapsed*.55+index*1.8;
 return{...bird,x:bird.x+Math.sin(t)*1.8,z:bird.z+Math.cos(t*.8)*1.4};
}
export function targetBearing(player,target){
 const dx=target.x-player.x,dz=target.z-player.z;
 const angle=Math.atan2(-dx,-dz)-player.yaw;
 return{distance:Math.hypot(dx,dz),degrees:-Math.atan2(Math.sin(angle),Math.cos(angle))*180/Math.PI};
}
export function createPaperChase(storage){
 let record={version:1,bestScore:0,bestTime:null,completed:0},saved=!!storage;
 try{const v=JSON.parse(storage?.getItem(CHASE_KEY)||'null');if(v?.version===1){record.bestScore=Number.isFinite(v.bestScore)?Math.max(0,Math.floor(v.bestScore)):0;record.bestTime=Number.isFinite(v.bestTime)&&v.bestTime>0?v.bestTime:null;record.completed=Number.isFinite(v.completed)?Math.max(0,Math.floor(v.completed)):0;}}catch{saved=false;}
 let state;
 function reset(practice=false){state={phase:'playing',practice:!!practice,elapsed:0,caught:[],score:0,streak:0,lastCatch:null,dashUntil:0,dashReadyAt:0,newBest:false};}
 reset();state.phase='idle';
 const persist=()=>{try{if(!storage)throw Error('No storage');storage.setItem(CHASE_KEY,JSON.stringify(record));saved=true;}catch{saved=false;}};
 function finish(){state.phase='won';if(!state.practice){state.score+=Math.floor(Math.max(0,CHASE_SECONDS-state.elapsed)*5);state.newBest=state.score>record.bestScore;record.bestScore=Math.max(record.bestScore,state.score);record.bestTime=record.bestTime===null?state.elapsed:Math.min(record.bestTime,state.elapsed);}record.completed++;persist();}
 return{
  get state(){return{...state,caught:state.caught.map(c=>({...c}))};},get record(){return{...record};},get saved(){return saved;},
  get active(){return state.phase!=='idle';},get playing(){return state.phase==='playing';},
  get remaining(){return Math.max(0,CHASE_SECONDS-state.elapsed);},
  get dashReady(){return state.phase==='playing'&&state.elapsed>=state.dashReadyAt;},
  get dashing(){return state.phase==='playing'&&state.elapsed<state.dashUntil;},
  start(practice=false){reset(practice);},stop(){state.phase='idle';},
  target(reduced=false){if(state.phase==='idle')return null;return chaseTarget(state.caught.length,state.elapsed,reduced)||{...CHASE_HOME,id:'home',name:'The starting fold'};},
  pause(){if(state.phase!=='playing')return false;state.phase='paused';return true;},
  resume(){if(state.phase!=='paused')return false;state.phase='playing';return true;},
  dash(){if(state.phase!=='playing'||state.elapsed<state.dashReadyAt)return false;state.dashUntil=state.elapsed+.6;state.dashReadyAt=state.elapsed+3.5;return true;},
  catch(player,reduced=false){
   if(state.phase!=='playing'||!Number.isFinite(player.x)||!Number.isFinite(player.z))return{ok:false,reason:'paused'};
   const target=chaseTarget(state.caught.length,state.elapsed,reduced);
   if(!target)return{ok:false,reason:'home'};
   if(Math.hypot(player.x-target.x,player.z-target.z)>CATCH_RADIUS)return{ok:false,reason:'distance'};
   state.streak=state.lastCatch!==null&&state.elapsed-state.lastCatch<=12?Math.min(5,state.streak+1):1;
   const points=100+(state.streak-1)*25;state.score+=points;state.lastCatch=state.elapsed;
   state.caught.push({id:target.id,at:state.elapsed,x:target.x,z:target.z});
   return{ok:true,points,streak:state.streak,id:target.id,returning:state.caught.length===CHASE_FLOCK.length};
  },
  tick(dt,player){
   if(state.phase!=='playing'||!Number.isFinite(dt)||dt<=0)return null;
   state.elapsed+=Math.min(dt,.06);
   if(!state.practice&&state.elapsed>=CHASE_SECONDS){state.elapsed=CHASE_SECONDS;state.phase='lost';return'lost';}
   // Delivering the flock wins only inside the starting fold, not at catch #5.
   if(state.caught.length===CHASE_FLOCK.length&&Number.isFinite(player.x)&&Number.isFinite(player.z)&&onPaper(player.x,player.z)&&Math.hypot(player.x-CHASE_HOME.x,player.z-CHASE_HOME.z)<=CHASE_HOME.radius){finish();return'won';}
   return null;
  }
 };
}

// Menu movement is shared by the title screen, fold controls and game menus.
// It returns a focus index; callers own DOM focus and activation.
export function nextPadFocus(index,count,direction){if(count<=0)return-1;if(index<0)return direction<0?count-1:0;return(index+direction+count)%count;}
