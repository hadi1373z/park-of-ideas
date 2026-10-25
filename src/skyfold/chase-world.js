import {CHASE_HOME,CHASE_FLOCK,chaseTarget} from './chase.js';
import {buildPaperCrane} from '../origami-creatures.js';

export function buildChaseWorld(T,chase,groundHeight){
 const group=new T.Group();group.name='Paper Chase — free folded-paper flock';
 const birds=CHASE_FLOCK.map((_,i)=>{const bird=buildPaperCrane(T,{color:i%2?'#eea36f':'#ce513e',scale:1.85});group.add(bird.group);return bird;});
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([0,0,-5,5,0,0,0,.35,5,-5,0,0,0,.06,0],3));geo.setIndex([0,1,4,1,2,4,2,3,4,3,0,4]);geo.computeVertexNormals();
 const mat=new T.MeshStandardMaterial({color:'#c34c38',side:T.DoubleSide,roughness:1});
 const home=new T.Mesh(geo,mat);home.position.set(CHASE_HOME.x,.12,CHASE_HOME.z);home.name='The red starting fold';home.receiveShadow=true;group.add(home);
 const targetGeo=new T.RingGeometry(1.8,1.88,40),targetMat=new T.MeshBasicMaterial({color:'#bb4835',side:T.DoubleSide,transparent:true,opacity:.65,depthWrite:false}),mark=new T.Mesh(targetGeo,targetMat);mark.rotation.x=-Math.PI/2;group.add(mark);
 let disposed=false;
 function update(reduced=false){
  const s=chase.state;group.visible=s.phase!=='idle';if(!group.visible)return;
  const target=chase.target(reduced);home.scale.setScalar(s.caught.length===5?1.15:1);
  mark.visible=s.caught.length<5;if(mark.visible){mark.position.set(target.x,groundHeight(target.x,target.z)+.12,target.z);}
  for(let i=0;i<birds.length;i++){
   const bird=birds[i],caught=s.caught[i];bird.group.visible=!!caught||i===s.caught.length;
   if(!bird.group.visible)continue;
   if(caught){
    const age=s.elapsed-caught.at,progress=reduced?1:Math.min(1,age/1.6),homeX=CHASE_HOME.x+Math.cos(i*1.256)*3.4,homeZ=CHASE_HOME.z+Math.sin(i*1.256)*3.4;
    bird.group.position.set(caught.x+(homeX-caught.x)*progress,groundHeight(homeX,homeZ)+.5+Math.sin(progress*Math.PI)*8,caught.z+(homeZ-caught.z)*progress);
    bird.group.rotation.y=-i*1.256;bird.animate(s.elapsed+i,{flying:progress<1,reducedMotion:reduced});
   }else{
    const p=chaseTarget(i,s.elapsed,reduced);bird.group.position.set(p.x,groundHeight(p.x,p.z)+2.2+(reduced?0:Math.sin(s.elapsed*1.7+i)*.28),p.z);bird.group.rotation.y=-s.elapsed*.45+i;bird.animate(s.elapsed+i,{reducedMotion:reduced});
   }
  }
 }
 return{group,birds,home,mark,update,dispose(){if(disposed)return;disposed=true;birds.forEach(b=>b.dispose());geo.dispose();mat.dispose();targetGeo.dispose();targetMat.dispose();group.removeFromParent();group.clear();}};
}
