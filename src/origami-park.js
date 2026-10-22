import {buildPaperCrane,buildPaperButterfly} from './origami-creatures.js';
import {buildPaperBoat} from './origami-boat.js';
import {buildPaperBird} from './origami-bird.js';
import {ORIGAMI_LESSONS,paperDiagram} from './origami-lessons.js';
// All eight friends use the same reproducible single-square bird fold, with different wing poses.
export const ORIGAMI_FLOCK=Object.freeze([
 {x:-78,z:-260,y:4,color:'#8fb9ad',scale:1.55,wingAngle:.08},
 {x:12,z:-225,y:4.6,color:'#e2bd76',scale:1.65,wingAngle:.3},
 {x:92,z:-266,y:4.2,color:'#c68d82',scale:1.5,wingAngle:.48},
 {x:105,z:-350,y:5,color:'#92b6cc',scale:1.7,wingAngle:.22},
 {x:65,z:-430,y:4.8,color:'#b6a0cb',scale:1.55,wingAngle:.4},
 {x:-28,z:-445,y:4.2,color:'#d9d0aa',scale:1.75,wingAngle:.12},
 {x:-100,z:-390,y:5,color:'#a9bd88',scale:1.6,wingAngle:.52},
 {x:-115,z:-315,y:4.5,color:'#cda36a',scale:1.7,wingAngle:.32}
].map(spec=>Object.freeze({...spec,...(spec.x===undefined?{}:{x:spec.x/.65,z:(spec.z+330)/.65,y:spec.y/.65,scale:spec.scale/.65})})));
export const CREATURE_FLOCK=Object.freeze([
 {type:'crane',x:-60,z:-310,y:4.8,color:'#e9ddbb',scale:1.6,phase:.5},
 {type:'crane',x:56,z:-375,y:5.3,color:'#a4c9d4',scale:1.55,phase:2},
 {type:'butterfly',x:-40,z:-395,y:2.8,color:'#dda0bb',scale:1.15,phase:0},
 {type:'butterfly',x:35,z:-285,y:3.2,color:'#e3b867',scale:1.25,phase:2},
 {type:'butterfly',x:88,z:-330,y:3,color:'#a99bcf',scale:1.2,phase:4}
].map(spec=>Object.freeze({...spec,...(spec.x===undefined?{}:{x:spec.x/.65,z:(spec.z+330)/.65,y:spec.y/.65,scale:spec.scale/.65})})));
export const FLOATING_FLOCK=Object.freeze([
 {angle:0,color:'#e9ddbb',scale:.9,wingAngle:.22},
 {angle:2.1,color:'#c68d82',scale:.85,wingAngle:.3},
 {angle:4.2,color:'#92b6cc',scale:.95,wingAngle:.16}
].map(Object.freeze));
// Smooth closed tours cross several districts instead of orbiting a spawn point.
export function createOrigamiTour(T,start,index,park){
 const points=[new T.Vector3(start.x,0,start.z)],direction=index%2?-1:1;
 for(let j=0;j<5;j++){const a=index*1.37+direction*j*Math.PI*2/5,r=(j%2?160:110)*park.scale;points.push(new T.Vector3(park.x+Math.sin(a)*r,0,park.z+Math.cos(a)*r));}
 const tour=new T.CatmullRomCurve3(points,true,'centripetal');tour.arcLengthDivisions=2400;return tour;
}
export function origamiTourPose(tour,distance,time,height,kind,phase=0){
 const u=(distance/tour.getLength())%1,p=tour.getPointAt(u),t= tour.getTangentAt(u),flutter=kind==='butterfly';
 return{x:p.x,z:p.z,y:height+Math.sin(time*(flutter?2.1:.7)+phase)*(flutter?.2:.12),yaw:Math.atan2(-t.x,-t.z),roll:Math.sin(time+phase)*(flutter?.1:.035)};
}
export function floatingOrigamiPose(time,angle,park){
 const a=angle+time*.045,r=6.6*park.scale;
 return{x:park.x+Math.sin(a)*r,z:park.z+Math.cos(a)*r,y:1.35*park.scale-.006+Math.sin(time*1.1+angle)*.008,yaw:a,roll:Math.sin(time*.8+angle)*.018};
}
export function installOrigamiPark(M,T){
 const group=new T.Group();group.name='Flying paper origami';M.scene.add(group);
 const friends=[];let current=ORIGAMI_LESSONS[0],step=0,lastTime=0,nearest=null,finished=false;
 const tx=(fa,en)=>CITY_I18N.tx(fa,en),pick=p=>CITY_I18N.lang==='de'&&p[2]?p[2]:CITY_I18N.translatePublic(p[CITY_I18N.lang==='fa'?0:1]);
 for(let i=0;i<ORIGAMI_FLOCK.length;i++){
  const spec=ORIGAMI_FLOCK[i],lesson=ORIGAMI_LESSONS.find(l=>l.id==='bird'),bird=buildPaperBird(T,spec),root=bird.group;root.name='Gliding paper bird '+(i+1);root.position.set(spec.x,spec.y,spec.z);group.add(root);
  root.traverse(o=>o.userData={...o.userData,origamiFriend:lesson.id,animated:true});M.city.targets.push(root);
  friends.push({lesson,root,bird,baseHeight:root.position.y,start:{x:root.position.x,z:root.position.z},phase:i*1.7,flightTime:0,distance:0,tour:createOrigamiTour(T,root.position,i,M.city.PARK)});
 }
 for(const [i,spec] of CREATURE_FLOCK.entries()){const lesson=ORIGAMI_LESSONS.find(l=>l.id===spec.type),bird=(spec.type==='crane'?buildPaperCrane:buildPaperButterfly)(T,spec),root=bird.group;root.position.set(spec.x,spec.y,spec.z);group.add(root);root.traverse(o=>o.userData={...o.userData,origamiFriend:lesson.id,animated:true});M.city.targets.push(root);friends.push({lesson,root,bird,kind:spec.type,baseHeight:spec.y,phase:spec.phase,flightTime:0,distance:0,tour:createOrigamiTour(T,root.position,i+8,M.city.PARK)});}
 for(const spec of FLOATING_FLOCK){const lesson=ORIGAMI_LESSONS.find(l=>l.id==='boat'),bird=buildPaperBoat(T,spec),root=bird.group,pose=floatingOrigamiPose(0,spec.angle,M.city.PARK);root.name='Floating paper boat';root.position.set(pose.x,pose.y,pose.z);root.rotation.y=pose.yaw;group.add(root);root.traverse(o=>o.userData={...o.userData,origamiFriend:lesson.id,animated:true});M.city.targets.push(root);friends.push({lesson,root,bird,kind:'floating',phase:spec.angle,flightTime:0});}
 const dialog=document.createElement('dialog');dialog.id='origami-dialog';dialog.setAttribute('aria-labelledby','origami-title');dialog.innerHTML='<header><div><p class="origami-kicker"></p><h2 id="origami-title"></h2></div><button class="glass" data-origami="close" data-close type="button"></button></header><nav class="origami-friends"></nav><p class="origami-materials"></p><div class="origami-progress" role="status"></div><h3 class="origami-step-title"></h3><p class="origami-step-text"></p><div class="origami-papers"><figure><figcaption class="origami-before"></figcaption><div class="origami-before-svg"></div></figure><figure><figcaption class="origami-after"></figcaption><div class="origami-after-svg"></div></figure></div><p class="origami-legend"></p><div class="origami-check"></div><footer><button class="glass" data-origami="back" type="button"></button><button class="glass" data-origami="replay" type="button"></button><button class="primary" data-origami="next" type="button"></button></footer><p class="origami-result" role="status"></p><div class="origami-bottom"><button class="glass" data-origami="park" type="button"></button><button class="glass" data-origami="reset" type="button"></button><a target="_blank" rel="noopener noreferrer"></a></div>';
 document.body.append(dialog);const n=s=>dialog.querySelector(s),button=id=>n(`[data-origami="${id}"]`);
 const near=document.createElement('button');near.type='button';near.id='origami-near';near.className='primary';near.hidden=true;near.onclick=()=>nearest&&open(nearest.lesson.id);document.body.append(near);
 const launcher=document.createElement('button');launcher.type='button';launcher.className='glass';launcher.id='origami-open';launcher.onclick=()=>open(nearest?.lesson.id);document.querySelector('.visit-actions').append(launcher);
 const storageKey=id=>'park-of-ideas:origami-made:v1:'+id;
 function readFinished(){try{return localStorage.getItem(storageKey(current.id))==='yes';}catch{return false;}}
 function render(){
  dialog.classList.toggle('origami-milestones',Boolean(current.diagramKind));n('.origami-kicker').textContent=tx('دوستانِ کاغذیِ پارک','PAPER FRIENDS OF THE PARK');n('h2').textContent=pick(current.name);button('close').textContent=tx('بستن','Close');launcher.textContent=tx('دوستان اوریگامی','Origami friends');
  const nav=n('nav');nav.setAttribute('aria-label',tx('انتخاب دوستِ کاغذی','Choose a paper friend'));nav.replaceChildren(...ORIGAMI_LESSONS.map(lesson=>{const b=document.createElement('button');b.type='button';b.className='glass';b.dataset.origamiLesson=lesson.id;b.textContent=pick(lesson.model);b.setAttribute('aria-pressed',String(current.id===lesson.id));b.onclick=()=>{current=lesson;step=0;finished=readFinished();render();n(`[data-origami-lesson="${lesson.id}"]`).focus();};return b;}));
  n('.origami-materials').textContent=current.id==='boat'?pick(['یک برگ کاغذ مستطیلی A4؛ بدون قطعهٔ اضافی، قیچی یا چسب.','One rectangular A4 sheet. No extra parts, scissors or glue.','Ein rechteckiges A4-Blatt. Keine zusätzlichen Teile, Schere oder Klebstoff.']):current.paperOnly?pick(['یک مربع کاغذِ ۱۵ سانتی‌متری؛ بدون قطعهٔ اضافی، قیچی یا چسب.','One 15 cm square. No extra parts, scissors or glue.','Ein 15-cm-Quadrat. Keine zusätzlichen Teile, Schere oder Klebstoff.']):pick(['یک مربع ۱۵ سانتی‌متری و یک مداد برای رسمِ صورت.','One 15 cm square and a pencil for the face.','Ein 15-cm-Quadrat und ein Stift für das Gesicht.']);
  const s=current.steps[step];n('.origami-progress').textContent=tx('تا ','FOLD ')+(step+1)+' / '+current.steps.length;n('h3').textContent=pick(s.title);n('.origami-step-text').textContent=pick(s.text);
  n('.origami-before').textContent=tx('پیش از تا','BEFORE');n('.origami-after').textContent=tx('پس از تا','AFTER');n('.origami-before-svg').innerHTML=paperDiagram(current,step,{before:true});n('.origami-after-svg').innerHTML=paperDiagram(current,step);n('.origami-before-svg svg').setAttribute('aria-label',tx('کاغذ پیش از تا؛ خط‌چین و جهتِ حرکت','Paper before the fold, with a dashed crease and movement arrow'));n('.origami-after-svg svg').setAttribute('aria-label',tx('شکلِ کاغذ پس از انجامِ این مرحله','Paper shape after this step'));
  n('.origami-legend').textContent=Boolean(current.diagramKind)?pick(['این‌ها طرح‌های راهنمای شکل‌اند، نه شبیه‌سازی لایه‌ها. برای تاهای جیبی و معکوس، راهنمای تصویری کامل را باز کن.','These sketches show orientation milestones, not a layer simulation. Open the full illustrated guide for pocket and reverse folds.','Die Skizzen zeigen Zwischenformen, keine Lagensimulation. Öffne die vollständige Bildanleitung für Taschen- und Umkehrfaltungen.']):tx('خط‌چین = جای تا · پیکان = حرکتِ گوشه · سفید = پشتِ کاغذ. کاغذِ خودت را مثل تصویر نگه دار.','Dashed line = crease · Arrow = corner movement · White = paper reverse. Hold your paper like the picture.');n('.origami-check').textContent=tx('قبل از ادامه بررسی کن: ','Before continuing, check: ')+pick(s.check);
  button('back').textContent=tx('مرحلهٔ قبل','Back');button('back').disabled=step===0;button('next').textContent=step===current.steps.length-1?tx('من ساختمش!','I made it!'):tx('انجام دادم؛ مرحلهٔ بعد','I tried it · Next fold');button('replay').textContent=Boolean(current.diagramKind)?pick(['دوباره دو طرح را مقایسه کن','Compare the sketches again','Skizzen erneut vergleichen']):tx('دوباره پیکان را دنبال کن','Trace the arrow again');button('park').textContent=tx('دیدار در پارک','Meet us in the park');button('reset').textContent=tx('از یک برگ تازه شروع کن','Start with a fresh sheet');n('a').href=current.source;n('a').textContent=Boolean(current.diagramKind)?pick(['راهنمای تصویری کامل ↗','Full illustrated folding guide ↗','Vollständige Bildanleitung ↗']):tx('یک راهنمای دیگر ↗','Another folding guide ↗');n('.origami-result').textContent=finished?tx('آفرین! این بار تلاش کن بدون راهنما یکی دیگر بسازی یا به دوستی یاد بدهی.','You made a paper friend! Try a fresh square without the guide, or teach someone else.'):'';
 }
 function open(id){current=ORIGAMI_LESSONS.find(l=>l.id===id)||current;step=0;finished=readFinished();M.clearMovement();render();dialog.showModal();}
 button('close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>M.clearMovement());button('back').onclick=()=>{step=Math.max(0,step-1);render();};button('next').onclick=()=>{if(step<current.steps.length-1)step++;else{finished=true;try{localStorage.setItem(storageKey(current.id),'yes');}catch{}}render();};button('reset').onclick=()=>{step=0;finished=false;render();};button('replay').onclick=()=>{n('.origami-before-svg').classList.remove('origami-trace');void n('.origami-before-svg').offsetWidth;n('.origami-before-svg').classList.add('origami-trace');};button('park').onclick=()=>{dialog.close();M.quickStart('park');};
 const oldTarget=M.city.targetInfo;M.city.targetInfo=d=>d.origamiFriend?{kind:'origami',data:d,title:tx('با من اوریگامی بساز','Fold origami with me')}:oldTarget(d);const oldShow=M.showExtra;M.showExtra=info=>{if(info.kind!=='origami')return oldShow(info);open(info.data.origamiFriend);return true;};
 const oldUpdate=M.city.update;M.city.update=(...args)=>{oldUpdate(...args);const time=args[1],dt=Math.min(.06,lastTime?time-lastTime:0);lastTime=time;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;nearest=null;let nearestDistance=3.8;
  group.visible=M.mode==='overview'||M.mode==='city'&&M.city.region(M.player.x,M.player.z).id==='park';
  for(const friend of friends){const p=friend.root.position,d=Math.hypot(M.player.x-p.x,M.player.z-p.z);if(d<nearestDistance){nearest=friend;nearestDistance=d;}
   friend.bird.animate(friend.flightTime+friend.phase,{flying:friend.kind!=='floating'&&d>=3.8&&!dialog.open,reducedMotion:reduced});
   if(reduced||dialog.open)continue;
   if(d<3.8){if(friend.kind!=='floating')friend.root.rotation.y=Math.atan2(M.player.x-p.x,M.player.z-p.z)+Math.PI;continue;}
   friend.flightTime+=dt;
   let pose;if(friend.kind==='floating')pose=floatingOrigamiPose(friend.flightTime,friend.phase,M.city.PARK);
   else{friend.distance+=dt*(friend.kind==='butterfly'?.85:friend.kind==='crane'?1.2:1.5);pose=origamiTourPose(friend.tour,friend.distance,friend.flightTime,friend.baseHeight,friend.kind,friend.phase);}
   p.set(pose.x,pose.y,pose.z);friend.root.rotation.y=pose.yaw;friend.root.rotation.z=pose.roll;
  }
  near.hidden=!nearest||!group.visible||M.mode!=='city'||dialog.open;if(nearest)near.textContent=tx('با ','Fold with ')+pick(nearest.lesson.name)+tx(' تا بزن','');
 };
 function languageChanged(){render();}
 addEventListener('city-language',languageChanged);languageChanged();addEventListener('pagehide',()=>{friends.forEach(f=>f.bird.dispose());group.removeFromParent();dialog.remove();near.remove();},{once:true});
 window.CITY_ORIGAMI={group,friends,open,lessons:ORIGAMI_LESSONS};return window.CITY_ORIGAMI;
}
