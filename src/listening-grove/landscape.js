import {CLEARINGS,groundHeight,paperPose,lightPose,balanceAngle} from './world.js';
import {buildPaperCrane} from '../origami-creatures.js';
export function buildListeningGrove(T){
 const group=new T.Group();group.name='The Listening Grove';const targets=[],instruments={},resources=new Set(),birds=[];
 const own=r=>(resources.add(r),r),geo=g=>own(g),mat=(color,roughness=1)=>own(new T.MeshStandardMaterial({color,roughness}));
 const moss=mat('#304d3d'),stone=mat('#798072'),wood=mat('#705544'),brass=mat('#c7a067',.45),paperRest=mat('#5c6657');
 const boxGeo=geo(new T.BoxGeometry(1,1,1)),sphere=geo(new T.IcosahedronGeometry(1,1)),pole=geo(new T.CylinderGeometry(1,1,1,8));
 function mesh(g,m,x,y,z,parent=group){const o=new T.Mesh(g,m);o.position.set(x,y,z);parent.add(o);return o;}
 function box(w,h,d,x,y,z,m,parent){const o=mesh(boxGeo,m,x,y,z,parent);o.scale.set(w,h,d);return o;}
 function cylinder(r,h,x,y,z,m,parent){const o=mesh(pole,m,x,y,z,parent);o.scale.set(r,h,r);return o;}
 const pixels=new Uint8Array(64*64*4);for(let y=0;y<64;y++)for(let x=0;x<64;x++){const r=Math.hypot(x-31.5,y-31.5)/31.5,i=(y*64+x)*4;pixels[i]=pixels[i+1]=pixels[i+2]=255;pixels[i+3]=Math.round(Math.max(0,1-r)**2*210);}const glow=own(new T.DataTexture(pixels,64,64,T.RGBAFormat));glow.magFilter=T.LinearFilter;glow.minFilter=T.LinearFilter;glow.needsUpdate=true;
 function halo(x,y,z,size,color,parent){const m=own(new T.SpriteMaterial({map:glow,color,opacity:.23,transparent:true,depthWrite:false,blending:T.AdditiveBlending})),o=new T.Sprite(m);o.position.set(x,y,z);o.scale.setScalar(size);(parent||group).add(o);return o;}
 const terrain=geo(new T.PlaneGeometry(650,650,110,110));terrain.rotateX(-Math.PI/2);const a=terrain.attributes.position,colors=[];for(let i=0;i<a.count;i++){const x=a.getX(i),z=a.getZ(i),h=groundHeight(x,z);a.setY(i,h);const c=new T.Color().setHSL(.36+Math.sin(x*.02)*.025,.18,.17+h*.006);colors.push(c.r,c.g,c.b);}terrain.setAttribute('color',new T.Float32BufferAttribute(colors,3));terrain.computeVertexNormals();mesh(terrain,own(new T.MeshStandardMaterial({vertexColors:true,roughness:1})),0,0,0).name='Continuous rolling woodland floor';
 const routePoints=[{x:0,z:73},...CLEARINGS.map(c=>c.approach),{x:0,z:73}];const route=new T.CatmullRomCurve3(routePoints.map(p=>new T.Vector3(p.x,0,p.z)),false,'centripetal');
 const roadPositions=[],roadIndex=[];for(let i=0;i<=260;i++){const u=i/260,p=route.getPoint(u),t=route.getTangent(u),len=Math.hypot(t.x,t.z);for(const side of[-1,1]){const x=p.x+t.z/len*side*1.6,z=p.z-t.x/len*side*1.6;roadPositions.push(x,groundHeight(x,z)+.055,z);}if(i<260){const j=i*2;roadIndex.push(j,j+2,j+1,j+1,j+2,j+3);}}const road=geo(new T.BufferGeometry());road.setAttribute('position',new T.Float32BufferAttribute(roadPositions,3));road.setIndex(roadIndex);road.computeVertexNormals();mesh(road,mat('#a79b80'),0,0,0).name='Winding gravel trail';
 // Lanterns guide the trail; their light is a soft sprite rather than a forest of dynamic lights.
 const lampCore=own(new T.MeshBasicMaterial({color:'#ffe1a2'}));for(let i=0;i<35;i++){const u=i/35,p=route.getPoint(u),t=route.getTangent(u),x=p.x+t.z*2.9,z=p.z-t.x*2.9,y=groundHeight(x,z);cylinder(.11,.65,x,y+.325,z,wood);const core=mesh(sphere,lampCore,x,y+.78,z);core.scale.set(.2,.28,.2);halo(x,y+.8,z,2.3,'#edbd76');}
 function clearing(c){const parent=new T.Group();parent.name=c.name;parent.position.set(c.x,groundHeight(c.x,c.z),c.z);group.add(parent);const disc=geo(new T.CircleGeometry(10.5,56));disc.rotateX(-Math.PI/2);const v=disc.attributes.position;for(let i=0;i<v.count;i++)v.setY(i,groundHeight(c.x+v.getX(i),c.z+v.getZ(i))-parent.position.y+.025);disc.computeVertexNormals();mesh(disc,mat('#576353'),0,0,0,parent);return parent;}
 for(const c of CLEARINGS){const root=clearing(c),props=new T.Group();root.add(props);instruments[c.id]={root,props};
  if(c.id==='echo'){
   cylinder(5.1,.65,0,.325,0,stone,props);const lip=mesh(geo(new T.TorusGeometry(4.95,.18,8,64)),brass,0,.67,0,props);lip.rotation.x=Math.PI/2;
   const water=mesh(geo(new T.CircleGeometry(4.75,64)),own(new T.MeshStandardMaterial({color:'#456b71',metalness:.45,roughness:.25})),0,.67,0,props);water.rotation.x=-Math.PI/2;const rings=[];
   for(let i=0;i<5;i++){const m=own(new T.MeshBasicMaterial({color:'#e7d9b4',transparent:true,opacity:0,depthWrite:false})),r=mesh(geo(new T.TorusGeometry(1,.026,4,64)),m,0,.69+i*.001,0,props);r.rotation.x=Math.PI/2;r.visible=false;rings.push(r);}instruments.echo.rings=rings;
   for(const x of[-6.5,6.5]){const b=mesh(sphere,stone,x,.7,2.8,props);b.scale.set(1.4,.7,1.1);}halo(0,1,0,8,'#b8e4db',props);
  }
  if(c.id==='harp'){
   for(const x of[-4,4])cylinder(.24,5.8,x,2.9,0,wood,props);const arch=new T.CatmullRomCurve3([new T.Vector3(-4,5.8,0),new T.Vector3(0,8.4,0),new T.Vector3(4,5.8,0)]);mesh(geo(new T.TubeGeometry(arch,40,.24,7,false)),wood,0,0,0,props);box(9,.45,1.8,0,.45,0,wood,props);
   const strings=[];for(let i=0;i<5;i++){const x=(i-2)*1.4,h=7.4-Math.abs(x)*.5,s=cylinder(.035,h,x,.75+h/2,0,brass,props);strings.push(s);halo(x,1,0,1.6,'#d5b4ed',props);}instruments.harp.strings=strings;
  }
  if(c.id==='balance'){
   const base=mesh(sphere,stone,0,1.35,0,props);base.scale.set(1.25,1.6,1.15);const beam=new T.Group();beam.position.y=3;props.add(beam);box(12,.3,.75,0,0,0,wood,beam);for(const x of[-4.5,4.5]){const r=mesh(geo(new T.TorusGeometry(.9,.09,7,32)),brass,x,.2,0,beam);r.rotation.x=Math.PI/2;}const weight=mesh(sphere,brass,0,.8,0,beam);weight.scale.set(.7,.8,.65);instruments.balance.beam=beam;instruments.balance.weight=weight;halo(0,3.2,0,5,'#efbd7d',props);
  }
  if(c.id==='lights'){
   const positions=new Float32Array(72*3),g=geo(new T.BufferGeometry());g.setAttribute('position',new T.BufferAttribute(positions,3));const points=new T.Points(g,own(new T.PointsMaterial({color:'#d6edac',map:glow,size:1.4,transparent:true,depthWrite:false,blending:T.AdditiveBlending})));props.add(points);instruments.lights.points=points;
   for(let i=0;i<5;i++){const a=i*Math.PI*.4;cylinder(.7,.9,Math.sin(a)*7,.45,Math.cos(a)*7,wood,props);}
  }
  if(c.id==='paper'){
   for(let i=0;i<6;i++){const bird=buildPaperCrane(T,{color:['#e8d9b0','#c5d5cb','#d5b9aa'][i%3],scale:1.1});bird.animate(0,{reducedMotion:true});const home=paperPose(i,0,null),bounds=new T.Box3().setFromObject(bird.group),top=home.y+bounds.min.y;cylinder(.55,top,home.x,top/2,home.z,paperRest,props);props.add(bird.group);birds.push({bird,index:i});}
  }
  props.traverse(o=>{if(o.isMesh||o.isPoints||o.isSprite)o.userData.clearing=c.id;});targets.push(props);
 }
 // A deterministic woodland with branching trunks and multiple overlapping crowns.
 let seed=32891;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);const trees=[];
 for(let i=0;i<2800&&trees.length<310;i++){const x=(random()-.5)*280,z=(random()-.5)*255;if(Math.hypot(x,z)<18||CLEARINGS.some(c=>Math.hypot(x-c.x,z-c.z)<15)||routePoints.some(p=>Math.hypot(x-p.x,z-p.z)<10))continue;let near=false;for(let u=0;u<=1;u+=.018){const p=route.getPoint(u);if(Math.hypot(x-p.x,z-p.z)<5.3){near=true;break;}}if(near)continue;trees.push({x,z,h:7+random()*7,a:random()*Math.PI*2});}
 const trunkGeo=geo(new T.CylinderGeometry(.055,.2,1,7)),branchGeo=geo(new T.CylinderGeometry(.025,.1,1,6)),leafGeo=geo(new T.IcosahedronGeometry(1,1));const trunks=new T.InstancedMesh(trunkGeo,wood,trees.length),branches=new T.InstancedMesh(branchGeo,wood,trees.length*4),crowns=new T.InstancedMesh(leafGeo,own(new T.MeshLambertMaterial({color:0xffffff})),trees.length*7),dummy=new T.Object3D(),up=new T.Vector3(0,1,0);
 trees.forEach((t,i)=>{const y=groundHeight(t.x,t.z);dummy.position.set(t.x,y+t.h*.39,t.z);dummy.rotation.set(0,t.a,0);dummy.scale.set(1,t.h*.78,1);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);for(let j=0;j<7;j++){const a=t.a+j*2.39996,r=j?t.h*.23:0,cy=y+t.h*(j?(.84+j%3*.09):1.11),x=t.x+Math.sin(a)*r,z=t.z+Math.cos(a)*r;dummy.position.set(x,cy,z);dummy.rotation.set(.1,a,.1);dummy.scale.set(t.h*.24,t.h*.27,t.h*.23);dummy.updateMatrix();crowns.setMatrixAt(i*7+j,dummy.matrix);crowns.setColorAt(i*7+j,new T.Color(['#476a58','#5c775e','#76876a','#395b50'][(i+j)%4]));if(j<4){const start=new T.Vector3(t.x,y+t.h*.52,t.z),end=new T.Vector3(x,cy,z),v=end.clone().sub(start);dummy.position.copy(start).add(end).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(up,v.clone().normalize());dummy.scale.set(1,v.length(),1);dummy.updateMatrix();branches.setMatrixAt(i*4+j,dummy.matrix);}}});trunks.name='Woodland trunks';crowns.name='Woodland canopies';group.add(trunks,branches,crowns);
 const fernGeo=geo(new T.ConeGeometry(.35,1.2,5)),ferns=[];for(let i=0;i<450;i++){const x=(random()-.5)*210,z=(random()-.5)*210;if(CLEARINGS.some(c=>Math.hypot(x-c.x,z-c.z)<12))continue;ferns.push({x,z});}const undergrowth=new T.InstancedMesh(fernGeo,moss,ferns.length);ferns.forEach((p,i)=>{dummy.position.set(p.x,groundHeight(p.x,p.z)+.35,p.z);dummy.rotation.set(0,i,0);dummy.scale.set(1.2,.6,1.2);dummy.updateMatrix();undergrowth.setMatrixAt(i,dummy.matrix);});group.add(undergrowth);
 const stars=[];for(let i=0;i<320;i++)stars.push((random()-.5)*700,90+random()*240,(random()-.5)*700);const skyGeo=geo(new T.BufferGeometry());skyGeo.setAttribute('position',new T.Float32BufferAttribute(stars,3));const starlight=new T.Points(skyGeo,own(new T.PointsMaterial({color:'#d8e8e6',size:.38,fog:false})));group.add(starlight);mesh(geo(new T.SphereGeometry(7,24,16)),own(new T.MeshBasicMaterial({color:'#f0e1b6',fog:false})),75,93,-160);halo(75,93,-160,43,'#99b9be');
 const state={ripples:[],plucked:Array(5).fill(-100),balance:0,gathered:false,launchedAt:null};let disposed=false;
 function update(t,dt,reduced=false){
  for(let i=0;i<5;i++){const age=t-(state.ripples.at(-1)??-100)-i*.55,phase=age/3.5,r=instruments.echo.rings[i];r.visible=age>=0&&phase<1;if(r.visible){r.scale.setScalar(.15+phase*4.5);r.material.opacity=(1-phase)*.8;}}
  instruments.harp.strings.forEach((s,i)=>{const age=t-state.plucked[i];s.position.z=reduced?0:age<3?Math.sin(age*35)*Math.exp(-age*2)*.22:0;});
  const b=instruments.balance;b.beam.rotation.z+=( -balanceAngle(state.balance)-b.beam.rotation.z)*Math.min(1,dt*4);b.weight.position.x=state.balance*1.9;
  const a=instruments.lights.points.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=lightPose(i,reduced?0:t,state.gathered);a.setXYZ(i,p.x,p.y,p.z);}a.needsUpdate=true;
  for(const {bird,index}of birds){const p=paperPose(index,t,reduced?null:state.launchedAt);bird.group.position.set(p.x,p.y,p.z);bird.group.rotation.y=p.yaw;bird.animate(t+index,{flying:p.flying,reducedMotion:reduced});}
 }
 return{group,targets,instruments,state,route,stats:{clearings:CLEARINGS.length,trees:trees.length,cranes:birds.length},update,dispose(){if(disposed)return;disposed=true;birds.forEach(b=>b.bird.dispose());resources.forEach(r=>r.dispose());group.removeFromParent();group.clear();}};
}
