import {installOrigamiPark} from './origami-park.js';
import {boundedPoint,moveVisitor} from './navigation.js';
export async function createPark(options){
 const T=window.THREE,{canvas,onMove=()=>{},onSelect=()=>{}}=options;
 const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
 const scene=new T.Scene();scene.background=new T.Color('#cbd9d5');scene.fog=new T.Fog('#cbd9d5',350,950);
 const camera=new T.PerspectiveCamera(55,1,.1,1400);const ambient=new T.HemisphereLight('#f7f7e6','#667d58',2.1);scene.add(ambient);const sun=new T.DirectionalLight('#fff0cc',2.8);sun.position.set(-100,190,80);scene.add(sun);
 const park=window.buildIdeaPark(T);scene.add(park.group);const player={x:0,y:2.8,z:34,yaw:0,pitch:0};let view='overview',distance=480,orbit=.32,disposed=false,raf,lastTime=0,lastHUD=0,movement={x:0,z:0},drag=null;
 const keys=new Set(),ray=new T.Raycaster(),pointer=new T.Vector2(),pad=window.createCityGamepad();ray.layers.enable(1);
 const modal=()=>!!document.querySelector('dialog[open]');
 const clear=()=>{keys.clear();movement={x:0,z:0};};
 const pointAt=(x,z)=>{player.yaw=Math.atan2(-(x-player.x),-(z-player.z));player.pitch=0;};
 const city={PARK:{x:0,z:0,scale:1},targets:[...park.targets],region:()=>({id:'park'}),targetInfo:d=>d.select?{kind:'park',data:d}:null,update:(_p,t)=>park.update(t,matchMedia('(prefers-reduced-motion: reduce)').matches)};
 const M={scene,player,city,get mode(){return view==='overview'?'overview':'city';},clearMovement:clear,quickStart(){view='wander';arrive(0,28);},showExtra:info=>{if(info?.data?.select){onSelect(info.data.select);return true;}return false;}};
 function arrive(x,z){const p=boundedPoint(x,z);if(!p)return false;Object.assign(player,p);clear();return true;}
 installOrigamiPark(M,T);
 function selectAt(x,y,near=false){scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);pointer.set(x,y);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(city.targets,true).filter(h=>(!near||h.distance<14)&&h.object.visible);const hit=hits.find(h=>city.targetInfo(h.object.userData));if(hit){const info=city.targetInfo(hit.object.userData);M.showExtra(info);return true;}return false;}
 const listeners=[];function listen(target,type,fn,opts){target.addEventListener(type,fn,opts);listeners.push(()=>target.removeEventListener(type,fn,opts));}
 listen(window,'keydown',e=>{if(modal()||['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)||e.ctrlKey||e.altKey||e.metaKey)return;const key=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','pageup','pagedown','e','shift'].includes(key)){e.preventDefault();keys.add(key);if(key==='e'&&!e.repeat)selectAt(0,0,true);}});
 listen(window,'keyup',e=>keys.delete(e.key.toLowerCase()));listen(window,'blur',clear);listen(document,'visibilitychange',()=>{if(document.hidden)clear();});
 listen(canvas,'pointerdown',e=>{if(modal())return;canvas.focus({preventScroll:true});drag={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId);});
 listen(canvas,'pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.moved ||= Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>5;if(drag.moved){if(view==='overview')orbit-=dx*.005;else{player.yaw-=dx*.004;player.pitch=T.MathUtils.clamp(player.pitch-dy*.004,-1.1,1.1);}}drag.x=e.clientX;drag.y=e.clientY;});
 listen(canvas,'pointerup',e=>{if(!drag||e.pointerId!==drag.id)return;if(!drag.moved){const r=canvas.getBoundingClientRect();selectAt((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);}drag=null;});listen(canvas,'pointercancel',()=>{drag=null;clear();});
 listen(canvas,'wheel',e=>{if(view==='overview'){e.preventDefault();distance=T.MathUtils.clamp(distance+e.deltaY*.15,170,680);}},{passive:false});
 function destination(id){return park.personPositions.get(id)||park.districtPositions.get(id)||park.landmarks.get(id)||park.seedPositions.get(id);}
 const api={setMovement(x,z){movement={x:Number(x)||0,z:Number(z)||0};},setView(next){view=next==='wander'?'wander':'overview';clear();},teleport(id){const p=destination(id);if(!p)return false;arrive(p.x,p.z+12);pointAt(p.x,p.z);view='wander';onMove({x:player.x,z:player.z,view});return true;},focus(id){return this.teleport(id);},zoom(n){distance=T.MathUtils.clamp(distance+n*30,170,680);},setTime(value){const dusk=value==='dusk';scene.background.set(dusk?'#576a70':'#cbd9d5');scene.fog.color.copy(scene.background);sun.intensity=dusk?1.1:2.8;ambient.intensity=dusk?1.3:2.1;},goHome(){arrive(0,34);pointAt(0,0);},addSeed:s=>park.addSeed(s),removeSeed:id=>park.removeSeed(id),updateSeed:s=>park.updateSeed(s),getStats:()=>({...park.stats}),getPosition:()=>({...player,view}),dispose(){disposed=true;cancelAnimationFrame(raf);listeners.forEach(fn=>fn());renderer.dispose();scene.traverse(o=>{o.geometry?.dispose();for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[]){m.map?.dispose();m.dispose();}});}};
 function resize(){const w=canvas.clientWidth||innerWidth,h=canvas.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}listen(window,'resize',resize);resize();
 function tick(ms){if(disposed)return;raf=requestAnimationFrame(tick);const t=ms/1000,dt=Math.min(.06,lastTime?t-lastTime:0);lastTime=t;const blocked=modal()||document.hidden,g=pad.poll(blocked);if(blocked)clear();
  if(g.back){document.querySelector('dialog[open]')?.close();clear();}if(g.music)document.getElementById('sound-toggle').click();
  if(!blocked){if(g.menu)document.getElementById('map-open').click();if(g.start)api.setView('wander');
   if(view==='wander'){const forward=Number(keys.has('w')||keys.has('arrowup'))-Number(keys.has('s')||keys.has('arrowdown'))-movement.z+g.forward,strafe=Number(keys.has('d'))-Number(keys.has('a'))+movement.x+g.strafe;player.yaw+=(Number(keys.has('arrowleft'))-Number(keys.has('arrowright'))-g.lookX)*dt*1.8;player.pitch=T.MathUtils.clamp(player.pitch+(Number(keys.has('pageup'))-Number(keys.has('pagedown'))-g.lookY)*dt,-1.1,1.1);Object.assign(player,moveVisitor(player,strafe,forward,dt,keys.has('shift')||g.sprint?32:16));if(g.interact)selectAt(0,0,true);}
  }
  if(view==='overview'){camera.position.set(Math.sin(orbit)*distance,distance*.92,Math.cos(orbit)*distance);camera.lookAt(0,0,0);}else{camera.position.set(player.x,player.y,player.z);camera.rotation.order='YXZ';camera.rotation.set(player.pitch,player.yaw,0,'YXZ');}
  if(!document.hidden){city.update(player,t);renderer.render(scene,camera);}if(t-lastHUD>.15){lastHUD=t;let districtId=null,best=40;for(const [id,p]of park.districtPositions){const d=Math.hypot(player.x-p.x,player.z-p.z);if(d<best){best=d;districtId=id;}}onMove({x:player.x,z:player.z,view,districtId,labels:[]});Object.assign(canvas.dataset,{ready:'true',view,playerX:player.x.toFixed(2),playerZ:player.z.toFixed(2),drawCalls:String(renderer.info.render.calls)});}
 }
 listen(window,'pagehide',()=>api.dispose(),{once:true});options.onReady?.();raf=requestAnimationFrame(tick);return api;
}
