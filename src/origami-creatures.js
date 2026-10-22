// Stylized folded-paper surfaces. Moving flaps share their complete hinge edge
// with the central fold; there are no solid animal bodies or attached ornaments.
function paperKit(T,type,color,scale){
 const group=new T.Group(),geometries=[],materials=[];group.name='Folded-paper '+type;group.scale.setScalar(scale);group.userData={paperOnly:true,sourceSheets:1,addedParts:0,origamiType:type,representation:'stylized folded surface'};
 const paper=new T.MeshLambertMaterial({color,side:T.DoubleSide}),edge=new T.LineBasicMaterial({color:'#5a655b'});materials.push(paper,edge);
 function panel(parent,points,faces,name){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));geo.setIndex(faces.flat());geo.computeVertexNormals();geometries.push(geo);const mesh=new T.Mesh(geo,paper);mesh.name=name;mesh.userData={paperPanel:true};parent.add(mesh);const wire=new T.WireframeGeometry(geo);geometries.push(wire);const creases=new T.LineSegments(wire,edge);creases.userData.paperCrease=true;parent.add(creases);return mesh;}
 function dispose(){group.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());group.clear();}
 return {group,panel,dispose};
}

export function buildPaperCrane(T,{color='#e9ddbb',scale=1.45}={}){
 const {group,panel,dispose}=paperKit(T,'crane',color,scale),wings=[];
 const la=[-.12,.1,-.28],lb=[-.12,.1,.28],ra=[.12,.1,-.28],rb=[.12,.1,.28],ridge=[0,.34,0];
 panel(group,[la,lb,rb,ra,ridge],[[0,1,4],[1,2,4],[2,3,4],[3,0,4]],'Crane central paper folds');
 // Neck, reverse-folded beak and tail are continuations of the front/back edges.
 const nl=[-.035,.95,-.72],nr=[.035,.95,-.72];
 panel(group,[la,ra,nr,nl,[0,.78,-1.02]],[[0,1,2],[0,2,3],[3,2,4]],'Crane folded neck and beak');
 panel(group,[lb,rb,[0,.6,1.12]],[[0,1,2]],'Crane folded tail');
 for(const sign of[-1,1]){const wing=new T.Group();wing.name='Crane paper wing';wing.position.set(sign*.12,.1,0);group.add(wing);panel(wing,[[0,0,-.28],[0,0,.28],[sign*1.12,.02,.35]],[[0,1,2]],'Crane wing panel');wings.push({group:wing,sign});}
 function animate(time,{flying=true,reducedMotion=false}={}){const cycle=((time%9)+9)%9,pulse=flying&&!reducedMotion&&cycle<3?Math.sin(cycle*Math.PI/3):0;for(const w of wings)w.group.rotation.z=w.sign*(.12+pulse*.32);}
 animate(0,{reducedMotion:true});return{group,wings,animate,dispose};
}

export function buildPaperButterfly(T,{color='#d7a0b5',scale=1.1}={}){
 const {group,panel,dispose}=paperKit(T,'butterfly',color,scale),wings=[];
 const la=[-.035,0,-.35],lb=[-.035,0,.3],ra=[.035,0,-.35],rb=[.035,0,.3];
 panel(group,[la,lb,rb,ra,[0,.09,.02]],[[0,1,4],[1,2,4],[2,3,4],[3,0,4]],'Butterfly centre crease');
 for(const sign of[-1,1]){const wing=new T.Group();wing.name='Butterfly paper wing';wing.position.x=sign*.035;group.add(wing);
  const points=[[0,0,-.35],[sign*.7,0,-.62],[sign*.88,0,-.18],[sign*.5,0,.08],[sign*.6,0,.42],[sign*.28,0,.61],[0,0,.3]];
  const indices=T.ShapeUtils.triangulateShape(points.map(p=>new T.Vector2(p[0],p[2])),[]);panel(wing,points,indices,'Butterfly folded wing panel');wings.push({group:wing,sign});
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
