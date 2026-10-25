export const SAVE_KEY='skyfold:journey:v1';
export const STAGES=[
 {id:'canyon',name:'Accordion Canyon',verb:'Bring the far shore closer.',x:-32,z:17,number:'01',description:'Distance is only a fold. Compress the pleats until the two red marks meet, then keep that fold.'},
 {id:'pavilion',name:'The Turning Pavilion',verb:'Make room for a doorway.',x:29,z:15,number:'02',description:'Two walls, one opening. Turn both paper wings until their red edges meet the dotted doorway.'},
 {id:'river',name:'The Paper River',verb:'Give the boat a way through.',x:26,z:-28,number:'03',description:'Lift the near bank to make a gentle downhill slope. Release the boat and adjust the tilt as it travels. Level paper holds it still; a reverse slope brings it back.'},
 {id:'orchard',name:'The Hidden Orchard',verb:'Find what the paper was hiding.',x:-30,z:-38,number:'04',description:'Three folds have changed this place. One last unfolding reveals the garden inside it.'}
];
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:a));
export const radians=d=>d*Math.PI/180;
export function canyonSpan(angle){return 30*Math.cos(radians(clamp(angle,0,75)));}
export function canyonAligned(angle){return Math.abs(canyonSpan(angle)-canyonSpan(55))<.72;}
export function pavilionAligned(left,right){return Math.abs(left-90)<=4&&Math.abs(right-90)<=4;}
export function riverSpeed(tilt){return Math.sin(radians(clamp(tilt,-12,12)))*.65;}
export function boatPose(progress){const p=clamp(progress,0,1);return{x:Math.sin(p*Math.PI*2)*2.6,z:15-p*30,y:.22,yaw:Math.atan2(30,2.6*Math.PI*2*Math.cos(p*Math.PI*2))};}
export function createJourney(storage){
 let data={version:1,solved:[],orchard:false,note:''},saved=!!storage;
 try{const value=JSON.parse(storage?.getItem(SAVE_KEY)||'null');if(value?.version===1){const ids=['canyon','pavilion','river'];for(const id of ids){if(!Array.isArray(value.solved)||!value.solved.includes(id))break;data.solved.push(id);}data.orchard=!!value.orchard&&data.solved.length===3;data.note=typeof value.note==='string'?value.note.slice(0,2400):'';}}catch{saved=false;}
 const state={angle:data.solved.includes('canyon')?55:8,left:data.solved.includes('pavilion')?90:15,right:data.solved.includes('pavilion')?90:30,tilt:0,boat:data.solved.includes('river')?1:0,running:false};
 function persist(){try{if(!storage)throw Error('No storage');storage.setItem(SAVE_KEY,JSON.stringify(data));saved=true;}catch{saved=false;}return saved;}
 function available(id){const i=STAGES.findIndex(s=>s.id===id);return i>=0&&i<=data.solved.length;}
 function finish(id){if(data.solved.includes(id))return true;if(!available(id))return false;if(id==='canyon'&&!canyonAligned(state.angle))return false;if(id==='pavilion'&&!pavilionAligned(state.left,state.right))return false;if(id==='river'&&state.boat<1)return false;if(id==='orchard'){data.orchard=true;persist();return true;}data.solved.push(id);if(id==='canyon')state.angle=55;if(id==='pavilion'){state.left=90;state.right=90;}persist();return true;}
 return{state,get data(){return{...data,solved:[...data.solved]};},get saved(){return saved;},available,finish,
  adjust(key,value){if(!Number.isFinite(value))return false;if(key==='angle'&&!data.solved.includes('canyon'))state.angle=clamp(value,0,75);else if(['left','right'].includes(key)&&available('pavilion')&&!data.solved.includes('pavilion'))state[key]=clamp(value,0,110);else if(key==='tilt'&&available('river')&&!data.solved.includes('river'))state.tilt=clamp(value,-12,12);else return false;return true;},
  release(){if(!available('river')||data.solved.includes('river'))return false;state.running=!state.running;return state.running;},
  tick(dt){if(!state.running||!Number.isFinite(dt)||dt<=0)return false;state.boat=clamp(state.boat+riverSpeed(state.tilt)*Math.min(.06,dt),0,1);if(state.boat===1){state.running=false;state.tilt=0;finish('river');return true;}return false;},
  note(value){data.note=String(value).slice(0,2400);return persist();},
  reset(){data={version:1,solved:[],orchard:false,note:data.note};Object.assign(state,{angle:8,left:15,right:30,tilt:0,boat:0,running:false});return persist();}
 };
}
// The walking sheet is a convex polygon. Stay on the paper rather than falling
// into the sky. Convex half-plane clipping also handles fast diagonal movement.
export const OUTLINE=[[-70,36],[-38,76],[23,70],[69,30],[61,-32],[24,-72],[-35,-65],[-73,-16]];
export function onPaper(x,z,margin=2){if(!Number.isFinite(x)||!Number.isFinite(z))return false;for(let i=0;i<OUTLINE.length;i++){const a=OUTLINE[i],b=OUTLINE[(i+1)%OUTLINE.length],dx=b[0]-a[0],dz=b[1]-a[1];if(dx*(z-a[1])-dz*(x-a[0])>-margin*Math.hypot(dx,dz))return false;}return true;}
export function moveOnPaper(p,strafe,forward,dt,speed=10){if(![p.x,p.z,p.yaw,strafe,forward,dt].every(Number.isFinite)||dt<=0)return{...p};const n=Math.max(1,Math.hypot(strafe,forward)),step=Math.min(dt,.06)*speed/n,dx=(strafe*Math.cos(p.yaw)-forward*Math.sin(p.yaw))*step,dz=(-strafe*Math.sin(p.yaw)-forward*Math.cos(p.yaw))*step;let x=p.x,z=p.z;if(onPaper(x+dx,z+dz)){x+=dx;z+=dz;}else{if(onPaper(x+dx,z))x+=dx;if(onPaper(x,z+dz))z+=dz;}return{...p,x,z};}
