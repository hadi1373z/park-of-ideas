import {CHASE_HOME,CHASE_FLOCK,chaseTarget} from './chase.js';
import {buildPaperCrane} from '../origami-creatures.js';

export function buildChaseWorld(T,chase,groundHeight){
 const group=new T.Group();group.name='Paper Chase — free folded-paper flock';
 const colors=['#cf795a','#cda36b','#83a9a6','#7898ba','#b58c99'];
 const birds=CHASE_FLOCK.map((_,i)=>{const bird=buildPaperCrane(T,{color:colors[i],scale:1.2});group.add(bird.group);bird.animate(0,{flying:false,reducedMotion:true});return bird;});
 const restLifts=birds.map(b=>-new T.Box3().setFromObject(b.group).min.y);
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([0,0,-5,5,0,0,0,.35,5,-5,0,0,0,.06,0],3));geo.setIndex([0,1,4,1,2,4,2,3,4,3,0,4]);geo.computeVertexNormals();
 const mat=new T.MeshStandardMaterial({color:'#c34c38',side:T.DoubleSide,roughness:1});
 const home=new T.Mesh(geo,mat);home.position.set(CHASE_HOME.x,.12,CHASE_HOME.z);home.name='The red starting fold';home.receiveShadow=true;group.add(home);
 const targetGeo=new T.RingGeometry(1.8,1.88,40),targetMat=new T.MeshBasicMaterial({color:'#bb4835',side:T.DoubleSide,transparent:true,opacity:.65,depthWrite:false}),mark=new T.Mesh(targetGeo,targetMat);mark.rotation.x=-Math.PI/2;group.add(mark);
 const landingRay=new T.Raycaster(),landingOrigin=new T.Vector3(),down=new T.Vector3(0,-1,0);
 function perchHeight(x,z){home.updateWorldMatrix(true,false);landingRay.set(landingOrigin.set(x,20,z),down);return landingRay.intersectObject(home,false)[0]?.point.y??groundHeight(x,z);}
 let disposed=false;
 function update(reduced=false){
  const s=chase.state;group.visible=s.phase!=='idle';if(!group.visible)return;
  const target=chase.target(reduced);home.scale.setScalar(s.caught.length===5?1.15:1);
  mark.visible=s.caught.length<5;if(mark.visible){mark.position.set(target.x,groundHeight(target.x,target.z)+.12,target.z);}
  for(let i=0;i<birds.length;i++){
   const bird=birds[i],caught=s.caught[i];bird.group.visible=!!caught||i===s.caught.length;
   if(!bird.group.visible)continue;
   if(caught){
    const age=s.elapsed-caught.at,progress=reduced?1:Math.min(1,age/2.2),ease=progress*progress*(3-2*progress),homeX=CHASE_HOME.x+Math.cos(i*1.256)*3.4,homeZ=CHASE_HOME.z+Math.sin(i*1.256)*3.4;
    const startY=groundHeight(caught.x,caught.z)+2.2+(reduced?0:Math.sin(caught.at*1.7+i)*.16),restY=perchHeight(homeX,homeZ)+restLifts[i]+.015;
    bird.group.position.set(caught.x+(homeX-caught.x)*ease,startY+(restY-startY)*ease+Math.sin(progress*Math.PI)*7,caught.z+(homeZ-caught.z)*ease);
    const flyYaw=Math.atan2(-(homeX-caught.x),-(homeZ-caught.z)),restYaw=-i*1.256,turn=T.MathUtils.smoothstep(progress,.65,1),delta=Math.atan2(Math.sin(restYaw-flyYaw),Math.cos(restYaw-flyYaw));
    bird.group.rotation.set(-Math.sin(progress*Math.PI)*.08,flyYaw+delta*turn,Math.sin(progress*Math.PI)*.045);bird.animate(s.elapsed+i,{flying:progress<1,reducedMotion:reduced});
   }else{
    const p=chaseTarget(i,s.elapsed,reduced),t=reduced?0:s.elapsed,before=chaseTarget(i,t-.05),after=chaseTarget(i,t+.05);
    bird.group.position.set(p.x,groundHeight(p.x,p.z)+2.2+(reduced?0:Math.sin(s.elapsed*1.7+i)*.16),p.z);
    bird.group.rotation.set(0,Math.atan2(-(after.x-before.x),-(after.z-before.z)),reduced?0:Math.sin(s.elapsed*.55+i)*.045);bird.animate(s.elapsed+i,{reducedMotion:reduced});
   }
  }
 }
 return{group,birds,home,mark,update,dispose(){if(disposed)return;disposed=true;birds.forEach(b=>b.dispose());geo.dispose();mat.dispose();targetGeo.dispose();targetMat.dispose();group.removeFromParent();group.clear();}};
}
