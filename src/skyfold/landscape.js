import {OUTLINE,STAGES,radians,canyonSpan,boatPose} from './journey.js';
import {buildPaperBoat} from '../origami-boat.js';
import {buildPaperCrane,buildPaperButterfly} from '../origami-creatures.js';

export function buildSkyfold(T,journey){
 const group=new T.Group();group.name='Skyfold — one unfolding paper landscape';const owned=new Set(),creatures=[],targets=[],instruments={},walkingSurfaces=[];
 const own=o=>(owned.add(o),o),materials={};
 for(const [id,color]of Object.entries({ivory:'#eee7cf',white:'#fff9e8',sand:'#d5c9a8',blue:'#334f8e',deep:'#29375f',red:'#c34c38',rose:'#dc8e70',gold:'#bd903b',sage:'#8b9c86'}))materials[id]=own(new T.MeshStandardMaterial({color,roughness:1,metalness:0,side:T.DoubleSide}));
 const crease=own(new T.LineBasicMaterial({color:'#8b846f',transparent:true,opacity:.38})),redLine=own(new T.LineBasicMaterial({color:'#b74231'})),blueLine=own(new T.LineBasicMaterial({color:'#435b93',transparent:true,opacity:.3}));
 function panel(parent,points,faces,material='ivory',name='Folded paper',edges=true){const g=own(new T.BufferGeometry());g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));g.setIndex(faces.flat());g.computeVertexNormals();const mesh=new T.Mesh(g,materials[material]);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);if(edges){const e=own(new T.EdgesGeometry(g,12));parent.add(new T.LineSegments(e,crease));}return mesh;}
 function line(parent,pts,mat=crease){const g=own(new T.BufferGeometry().setFromPoints(pts.map(p=>new T.Vector3(...p))));const o=new T.Line(g,mat);parent.add(o);return o;}
 function rectangle(parent,w,d,material='ivory',y=0){const mesh=panel(parent,[[-w/2,y,-d/2],[w/2,y,-d/2],[w/2,y,d/2],[-w/2,y,d/2]],[[0,2,1],[0,3,2]],material);walkingSurfaces.push(mesh);return mesh;}
 function zone(id){const c=STAGES.find(s=>s.id===id),g=new T.Group();g.position.set(c.x,.07,c.z);g.name=c.name;g.userData.stage=id;group.add(g);targets.push(g);instruments[id]={group:g};return g;}
 // A thin continuous sheet with triangulated creases, not separate paving tiles.
 const sheetPoints=[[0,0,0],...OUTLINE.map(([x,z])=>[x,0,z])],sheetFaces=OUTLINE.map((_,i)=>[0,1+i,1+(i+1)%OUTLINE.length]);
 walkingSurfaces.push(panel(group,sheetPoints,sheetFaces,'ivory','The continuous paper sheet'));
 for(let i=0;i<OUTLINE.length;i++){const a=OUTLINE[i],b=OUTLINE[(i+1)%OUTLINE.length];panel(group,[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],-.55,b[1]],[a[0],-.55,a[1]]],[[0,1,2],[0,2,3]],'sand','The thickness of paper',false);}
 // Edges curl up from the same boundary, with a cobalt underside.
 for(const i of[0,3,5]){const a=OUTLINE[i],b=OUTLINE[(i+1)%OUTLINE.length],mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;panel(group,[[a[0],.01,a[1]],[b[0],.01,b[1]],[mx*1.17,9,mz*1.17]],[[0,1,2]],i===3?'blue':'white','A lifted edge');}
 // A fine red continuous thread connects the three folds and the final orchard.
 const route=new T.CatmullRomCurve3([[0,.09,62],[-15,.09,39],[-32,.09,30],[-5,.09,24],[27,.09,29],[46,.09,0],[36,.09,-18],[26,.09,-46],[-2,.09,-51],[-30,.09,-23]].map(p=>new T.Vector3(...p)));
 const ribbon=own(new T.TubeGeometry(route,140,.055,3,false));group.add(new T.Mesh(ribbon,materials.red));
 // Sharp paper mountains, each made from a single creased fan.
 for(const [x,z,r,h]of[[-58,-13,13,25],[-2,47,11,15],[1,-59,11,17],[45,45,15,18],[54,-8,10,15]]){const pts=[[x,h,z],...Array.from({length:6},(_,i)=>[x+Math.cos(i*Math.PI/3)*r,.02,z+Math.sin(i*Math.PI/3)*r])];for(let i=0;i<6;i++)panel(group,pts,[[0,i+1,1+(i+1)%6]],i%3===0?'blue':i%2?'white':'sand','Mountain crease');}
 // Low paper grasses are folded triangles rising directly from the sheet.
 let seed=219;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<75;i++){const x=(rand()-.5)*118,z=(rand()-.5)*115;if(STAGES.some(c=>Math.hypot(x-c.x,z-c.z)<20)||Math.abs(x)<14&&z>23)continue;const h=1+rand()*3,w=.6+rand();panel(group,[[x-w,.02,z],[x,h,z-.6],[x+w,.02,z],[x,.6,z+.8]],[[0,1,3],[1,2,3]],i%5===0?'red':'sage','Folded grass');}
 // 01: a chain of six hinged strips. Each endpoint is the next hinge; the
 // moving far bank really follows the shortening accordion, with no loose parts.
 const canyon=zone('canyon'),pleats=[],start=-18,len=5,spanTarget=canyonSpan(55);
 for(let i=0;i<6;i++){const g=new T.Group();canyon.add(g);rectangle(g,len,12,i%2?'white':'sand');pleats.push(g);}
 const bank=new T.Group();canyon.add(bank);rectangle(bank,9,10,'blue');line(bank,[[0,.04,-4.8],[0,.04,5]],redLine);
 const dock=new T.Group();dock.position.set(start+spanTarget+4.5,0,20);canyon.add(dock);rectangle(dock,9,12,'white');line(dock,[[0,.06,-6],[0,.06,4]],redLine);
 // A short bridge unfolds only when the bank and dock align.
 const crossing=new T.Group();crossing.position.set(start+spanTarget+4.5,.09,5);canyon.add(crossing);const crossPanel=panel(crossing,[[-2,0,0],[2,0,0],[2,0,9],[-2,0,9]],[[0,2,1],[0,3,2]],'red','The opened canyon crossing');
 walkingSurfaces.push(crossPanel);
 for(let z=1;z<9;z+=1.5)line(crossing,[[-1.8,.025,z],[1.8,.025,z]],crease);
 // Comparison marks remain at the actual joining location.
 for(const z of[-5,5])line(canyon,[[start+spanTarget+3.5,.1,z],[start+spanTarget+5.5,.1,z]],redLine);
 Object.assign(instruments.canyon,{pleats,bank,crossing,crossPanel});
 // 02: two paper walls hinge away from the passage. The cut-out aperture and
 // roof are real geometry, so opening the wings reveals a visible route.
 const pavilion=zone('pavilion');rectangle(pavilion,24,23,'sand');
 const wall=(x,sign)=>{const hinge=new T.Group();hinge.position.set(x,0,0);pavilion.add(hinge);panel(hinge,[[0,0,0],[sign*8,0,0],[sign*8,10,0],[0,12,0]],[[0,1,2],[0,2,3]],sign===1?'blue':'red','Turning paper wing');line(hinge,[[sign*8,0,.03],[sign*8,10,.03]],redLine);return hinge;};
 const left=wall(-8,1),right=wall(8,-1);
 panel(pavilion,[[-10,10,-8],[0,15,-8],[10,10,-8],[10,10,-2],[0,15,-2],[-10,10,-2]],[[0,1,4],[0,4,5],[1,2,3],[1,3,4]],'white','Pavilion folded roof');
 for(const x of[-8,8])panel(pavilion,[[x,0,-8],[x,10,-8],[x,10,-7.5],[x,0,-7.5]],[[0,1,2],[0,2,3]],'blue','Paper supporting fold');
 const passage=rectangle(pavilion,8,20,'red',.08);passage.name='The pavilion passage';
 // Dotted desired edges, distinct from the moving solid wing edges.
 for(const x of[-8,8])for(let z=-8;z<0;z+=1.6)line(pavilion,[[x,.13,z],[x,.13,z+.7]],redLine);
 Object.assign(instruments.pavilion,{left,right,passage});
 // 03: a connected creased river tray with a curved blue channel. The whole
 // tray tilts, so the paper boat remains on its transformed water surface.
 const river=zone('river'),tray=new T.Group();tray.position.y=3.5;river.add(tray);rectangle(tray,17,34,'white');
 const channelPts=[],channelFaces=[];for(let i=0;i<=60;i++){const p=boatPose(i/60);channelPts.push([p.x-3,.12,p.z],[p.x+3,.12,p.z]);if(i<60){const a=i*2;channelFaces.push([a,a+1,a+3],[a,a+3,a+2]);}}
 panel(tray,channelPts,channelFaces,'blue','The blue paper river',false);
 for(const sign of[-1,1])panel(tray,[[sign*8.5,0,-17],[sign*8.5,0,17],[sign*7,2,17],[sign*7,2,-17]],[[0,1,2],[0,2,3]],'sand','River valley fold');
 for(const z of[-15,15])line(tray,[[-4,.16,z],[4,.16,z]],redLine);
 const boat=buildPaperBoat(T,{color:'#ce513e',scale:1.5});creatures.push(boat);tray.add(boat.group);
 // Two triangular paper folds form an attached pedestal under the tray.
 panel(river,[[-6,0,0],[6,0,0],[0,3.5,0]],[[0,1,2]],'sand','The river pivot');
 Object.assign(instruments.river,{tray,boat});
 // 04: four attached gatefold leaves unfold from a closed envelope into a
 // garden. Trees and the little pavilion are children of these actual leaves.
 const orchard=zone('orchard'),leaves=[];
 const tree=(parent,x,z,size,index)=>{const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(size);parent.add(g);panel(g,[[0,0,0],[0,6,0],[.9,0,.2],[-.9,0,.2]],[[0,1,2],[0,3,1]],'sand','Paper tree crease');for(let i=0;i<4;i++){const a=i*Math.PI/2;const v=(r,y,offset=0)=>[Math.cos(a+offset)*r,y,Math.sin(a+offset)*r];panel(g,[[0,3,0],v(3.4,5,-.45),[0,8,0],v(3.4,5,.45)],[[0,1,2],[0,2,3]],index%2?'rose':'red','Folded orchard crown');}return g;};
 for(let i=0;i<4;i++){const hinge=new T.Group();hinge.rotation.y=i*Math.PI/2;orchard.add(hinge);const leaf=new T.Group();hinge.add(leaf);walkingSurfaces.push(panel(leaf,[[-8,0,0],[8,0,0],[12,0,19],[-12,0,19]],[[0,2,1],[0,3,2]],i%2?'white':'sand','An unfolding orchard leaf'));for(const [j,x,z,s]of[[0,-5,11,.72],[1,5,14,.9],[2,0,6,.56]])tree(leaf,x,z,s,i+j);leaves.push(leaf);}
 const secret=new T.Group();orchard.add(secret);rectangle(secret,11,11,'blue',.1);
 for(const sign of[-1,1])panel(secret,[[sign*5,0,-5],[sign*5,7,-5],[sign*5,7,5],[sign*5,0,5]],[[0,1,2],[0,2,3]],'ivory','The hidden pavilion sides');
 panel(secret,[[-7,7,-7],[0,11,-7],[7,7,-7],[7,7,7],[0,11,7],[-7,7,7]],[[0,1,4],[0,4,5],[1,2,3],[1,3,4]],'red','The hidden pavilion roof');
 Object.assign(instruments.orchard,{leaves,secret});
 // Creatures are shared folded-paper models, with no supports or attachments.
 const flyers=[];for(let i=0;i<5;i++){const bird=buildPaperCrane(T,{color:i%2?'#c7523e':'#f6edda',scale:2});creatures.push(bird);group.add(bird.group);flyers.push(bird);}
 const butterflies=[];for(let i=0;i<4;i++){const b=buildPaperButterfly(T,{color:i%2?'#334f8e':'#d48e70',scale:1.5});creatures.push(b);orchard.add(b.group);butterflies.push(b);}
 let opened=journey.data.orchard?1:0,angle=journey.state.angle,la=journey.state.left,ra=journey.state.right,tilt=journey.state.tilt,disposed=false;
 function update(time,dt,reduced=false){
  const state=journey.state,ease=reduced?1:1-Math.exp(-Math.max(0,dt)*8);angle+=(state.angle-angle)*ease;la+=(state.left-la)*ease;ra+=(state.right-ra)*ease;tilt+=(state.tilt-tilt)*ease;
  const a=radians(angle),dx=len*Math.cos(a),dy=len*Math.sin(a);for(let i=0;i<6;i++){pleats[i].position.set(start+(i+.5)*dx,(i%2?dy/2:dy/2),0);pleats[i].rotation.z=(i%2?-1:1)*a;}
  bank.position.set(start+canyonSpan(angle)+4.5,0,0);crossing.rotation.x=journey.data.solved.includes('canyon')?0:-Math.PI/2;crossPanel.visible=true;
  left.rotation.y=radians(la);right.rotation.y=-radians(ra);passage.visible=journey.data.solved.includes('pavilion');
  tray.rotation.x=-radians(tilt);const p=boatPose(state.boat);boat.group.position.set(p.x,p.y+.12,p.z);boat.group.rotation.y=p.yaw;boat.group.rotation.z=reduced?0:Math.sin(time*1.8)*.025;
  opened+=((journey.data.orchard?1:0)-opened)*(reduced?1:1-Math.exp(-dt*.85));for(const leaf of leaves)leaf.rotation.x=-(1-opened)*Math.PI*.46;secret.scale.setScalar(Math.max(.001,opened));
  flyers.forEach((bird,i)=>{const t=reduced?i*1.3:time*.095+i*1.25;bird.group.position.set(Math.cos(t)*(34+i*3),22+Math.sin(t*1.6+i)*4,Math.sin(t)*40);bird.group.rotation.y=-t;bird.animate(time+i,{reducedMotion:reduced});});
  butterflies.forEach((b,i)=>{b.group.visible=opened>.8;const t=reduced?i:time*.5+i*1.57;b.group.position.set(Math.cos(t)*13,4+Math.sin(t*1.7)*2,Math.sin(t)*13);b.group.rotation.y=-t;b.animate(time+i,{reducedMotion:reduced});});
 }
 update(0,1,true);
 const groundRay=new T.Raycaster(),down=new T.Vector3(0,-1,0),origin=new T.Vector3(),normal=new T.Vector3();
 function groundHeight(x,z){group.updateMatrixWorld(true);groundRay.set(origin.set(x,90,z),down);for(const hit of groundRay.intersectObjects(walkingSurfaces,false)){if(!hit.object.visible)continue;normal.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);if(normal.y>.3)return Math.max(0,hit.point.y);}return 0;}
 return{group,targets,instruments,groundHeight,stats:{folds:3,orchardLeaves:4,cranes:5,butterflies:4,boats:1},update,dispose(){if(disposed)return;disposed=true;creatures.forEach(c=>c.dispose());owned.forEach(o=>o.dispose());group.removeFromParent();group.clear();}};
}
