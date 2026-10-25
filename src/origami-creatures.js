// Stylized folded-paper surfaces. Moving flaps share their complete hinge edge
// with the central fold; there are no solid animal bodies or attached ornaments.
function paperKit(T,type,color,scale){
 const group=new T.Group(),geometries=[],materials=[];group.name='Folded-paper '+type;group.scale.setScalar(scale);group.userData={paperOnly:true,sourceSheets:1,addedParts:0,origamiType:type,representation:'stylized folded surface'};
 // Fine, deterministic fibres keep the surfaces matte without adding geometry
 // or image downloads. The same sheet continues through every moving hinge.
 const pixels=new Uint8Array(128*128*4);let seed=71;
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){seed=(seed*1664525+1013904223)>>>0;const fibre=(x+y*7)%31===0?6:0,v=247-(seed>>>28)-fibre,i=(y*128+x)*4;pixels[i]=pixels[i+1]=pixels[i+2]=v;pixels[i+3]=255;}
 const grain=new T.DataTexture(pixels,128,128,T.RGBAFormat);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.magFilter=T.LinearFilter;grain.minFilter=T.LinearMipmapLinearFilter;grain.generateMipmaps=true;grain.needsUpdate=true;
 const paper=new T.MeshStandardMaterial({color,side:T.DoubleSide,roughness:.94,metalness:0,flatShading:true,map:grain,bumpMap:grain,bumpScale:.009});
 // A pale reverse side makes folded-over paper readable from below. This is
 // still one double-sided surface, not a second body or attached decoration.
 paper.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nif (!gl_FrontFacing) diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.91, 0.86, 0.74), 0.78);');};
 paper.customProgramCacheKey=()=> 'folded-paper-reverse-v1';
 const edge=new T.LineBasicMaterial({color:new T.Color(color).multiplyScalar(.5),transparent:true,opacity:.25});materials.push(paper,edge);
 function panel(parent,points,faces,name){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));geo.setAttribute('uv',new T.Float32BufferAttribute(points.flatMap(p=>[p[0]*.9+.5,p[2]*.9+p[1]*.4+.5]),2));geo.setIndex(faces.flat());geo.computeVertexNormals();geometries.push(geo);const mesh=new T.Mesh(geo,paper);mesh.name=name;mesh.userData={paperPanel:true};mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);const wire=new T.EdgesGeometry(geo,8);geometries.push(wire);const creases=new T.LineSegments(wire,edge);creases.userData.paperCrease=true;parent.add(creases);return mesh;}
 let disposed=false;function dispose(){if(disposed)return;disposed=true;group.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());grain.dispose();group.clear();}
 return {group,panel,dispose};
}

export function buildPaperCrane(T,{color='#e9ddbb',scale=1.45}={}){
 const {group,panel,dispose}=paperKit(T,'crane',color,scale),wings=[];
 const la=[-.12,.1,-.28],lb=[-.12,.1,.28],ra=[.12,.1,-.28],rb=[.12,.1,.28],ridge=[0,.4,.04];
 panel(group,[la,lb,rb,ra,ridge],[[0,1,4],[1,2,4],[2,3,4],[3,0,4]],'Crane central paper folds');
 // Neck, reverse-folded beak and tail are continuations of the front/back edges.
 const nl=[-.045,1.24,-.77],nr=[.045,1.24,-.77];
 panel(group,[la,ra,nr,nl,[0,1.02,-1.16],[0,.74,-.56],[0,1.28,-.83]],[[0,1,5],[1,2,5],[2,3,5],[3,0,5],[3,2,6],[2,4,6],[4,3,6]],'Crane reverse-folded neck and beak');
 panel(group,[lb,rb,[0,.86,1.26],[0,.48,.76]],[[1,0,3],[2,1,3],[0,2,3]],'Crane tapered paper tail');
 for(const sign of[-1,1]){
  const wing=new T.Group();wing.name='Crane paper wing';wing.position.set(sign*.12,.1,0);group.add(wing);
  const points=[[0,0,-.28],[sign*.58,.04,-.4],[sign*1.52,.02,.17],[sign*.42,-.015,.43],[0,0,.28],[sign*.43,.19,.035]],faces=[];
  for(let i=0;i<5;i++)faces.push(sign>0?[(i+1)%5,i,5]:[i,(i+1)%5,5]);
  panel(wing,points,faces,'Crane pleated paper wing');wings.push({group:wing,sign});
 }
 function animate(time,{flying=true,reducedMotion=false}={}){const cycle=((time%9)+9)%9,pulse=flying&&!reducedMotion&&cycle<3?Math.sin(cycle*Math.PI/3):0;for(const w of wings)w.group.rotation.z=w.sign*(.12+pulse*.32);}
 animate(0,{reducedMotion:true});return{group,wings,animate,dispose};
}

export function buildPaperButterfly(T,{color='#d7a0b5',scale=1.1}={}){
 const {group,panel,dispose}=paperKit(T,'butterfly',color,scale),wings=[];
 const la=[-.035,0,-.35],lb=[-.035,0,.3],ra=[.035,0,-.35],rb=[.035,0,.3];
 panel(group,[la,lb,rb,ra,[0,.09,.02]],[[0,1,4],[1,2,4],[2,3,4],[3,0,4]],'Butterfly centre crease');
 for(const sign of[-1,1]){const wing=new T.Group();wing.name='Butterfly paper wing';wing.position.x=sign*.035;group.add(wing);
  const points=[[0,0,-.35],[sign*.7,0,-.62],[sign*.88,0,-.18],[sign*.5,0,.08],[sign*.6,0,.42],[sign*.28,0,.61],[0,0,.3]];
  points.push([sign*.3,.12,.01]);const indices=[];for(let i=0;i<7;i++)indices.push(sign>0?[(i+1)%7,i,7]:[i,(i+1)%7,7]);panel(wing,points,indices,'Butterfly creased paper wing');wings.push({group:wing,sign});
 }
 function animate(time,{flying=true,reducedMotion=false}={}){const lift=flying&&!reducedMotion?.55+.48*Math.sin(time*10):.28;for(const w of wings)w.group.rotation.z=w.sign*lift;}
 animate(0,{reducedMotion:true});return{group,wings,animate,dispose};
}

// Local clocks are advanced only during flight, so stopping to teach a fold
// never causes a jump forward when the visitor closes the guide.
export function origamiFlightPose(type,time,start,phase=0){
 const butterfly=type==='butterfly',angle=phase+time*(butterfly?1.05:.19),rx=butterfly?1.15:3.7,rz=butterfly?.8:2.3;
 return{x:start.x+Math.cos(angle)*rx,z:start.z+Math.sin(angle)*rz,y:start.y+(butterfly?.2*Math.sin(time*2.1+phase):.08*Math.sin(time*.7+phase)),yaw:Math.atan2(Math.sin(angle)*rx,-Math.cos(angle)*rz),roll:Math.sin(angle)*(butterfly?.12:.045)};
}
