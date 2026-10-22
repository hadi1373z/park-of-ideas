// One folded square, doubled into a triangle; all surfaces are paper panels.
export function buildPaperBird(T,{color='#90afa4',scale=1.25,wingAngle=.12}={}){
 wingAngle=T.MathUtils.clamp(wingAngle,-.1,.65);
 const group=new T.Group(),geometries=[],materials=[],wings=[],half=.12,fold=Math.PI*5/12;
 group.name='Single-sheet paper bird';group.scale.setScalar(scale);group.userData={paperOnly:true,sourceSheets:1,addedParts:0};
 const front=new T.MeshLambertMaterial({color,side:T.DoubleSide}),back=new T.MeshLambertMaterial({color:'#efe9d7',side:T.DoubleSide}),line=new T.LineBasicMaterial({color:'#526b64'});materials.push(front,back,line);
 const clip=(poly,x,side)=>{const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=(a[0]-x)*side,db=(b[0]-x)*side;if(da>=-1e-8)out.push(a);if(da*db<0){const u=da/(da-db);out.push([x,a[1]+u*(b[1]-a[1])]);}}return out;};
 function panel(points,parent,map,layer){const positions=points.map(map),shape=new T.Shape(points.map(([x,y])=>new T.Vector2(x,y))),geo=new T.ShapeGeometry(shape),attr=geo.attributes.position;for(let i=0;i<attr.count;i++){const q=map([attr.getX(i),attr.getY(i)]);attr.setXYZ(i,q[0],q[1]+layer*.0015,q[2]);}geo.computeVertexNormals();geometries.push(geo);const mesh=new T.Mesh(geo,layer?back:front);mesh.userData={paperPanel:true,sourceLayer:layer};parent.add(mesh);const edge=new T.BufferGeometry().setFromPoints([...positions,positions[0]].map(p=>new T.Vector3(p[0],p[1]+layer*.0015,p[2])));geometries.push(edge);parent.add(new T.Line(edge,line));}
 const triangle=[[-1,0],[1,0],[0,1]];
 for(const sign of [-1,1]){
  const wing=new T.Group();wing.name=sign<0?'Left paper wing':'Right paper wing';wing.position.x=sign*half*Math.cos(fold);group.add(wing);wings.push({group:wing,sign});
  const wingPoints=clip(triangle,sign*half,sign),bodyPoints=clip(clip(triangle,0,sign),sign*half,-sign);
  for(let layer=0;layer<2;layer++){
   panel(wingPoints,wing,([x,y])=>[x-sign*half,0,-y],layer);
   panel(bodyPoints,group,([x,y])=>[x*Math.cos(fold),(Math.abs(x)-half)*Math.sin(fold),-y],layer);
  }
 }
 function animate(time,{flying=true,reducedMotion=false}={}){for(const wing of wings)wing.group.rotation.z=wing.sign*(wingAngle+(flying&&!reducedMotion?Math.sin(time*3.4)*.2:0));}
 animate(0,{reducedMotion:true});
 return{group,wings,animate,dispose(){group.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());group.clear();}};
}
