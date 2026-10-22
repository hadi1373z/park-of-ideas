// A connected folded paper surface: open hull, pointed ends and central fold.
// No sail, mast, animal body or attached decoration.
export function buildPaperBoat(T,{color='#e9ddbb',scale=1}={}){
 const group=new T.Group();group.name='Floating paper boat';group.scale.setScalar(scale);
 group.userData={paperOnly:true,sourceSheets:1,addedParts:0,origamiType:'boat'};
 const points=[[-1.4,.24,0],[1.4,.24,0],[-.72,.29,.5],[.72,.29,.5],[-.72,.29,-.5],[.72,.29,-.5],[-.72,0,0],[.72,0,0],[0,.62,0]];
 const faces=[[0,2,6],[2,3,7],[2,7,6],[3,1,7],[0,6,4],[4,6,7],[4,7,5],[5,7,1],[6,8,7]];
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));geometry.setIndex(faces.flat());geometry.computeVertexNormals();
 const material=new T.MeshStandardMaterial({color,side:T.DoubleSide,roughness:.95,metalness:0});
 const hull=new T.Mesh(geometry,material);hull.name='Open folded-paper hull';hull.userData.paperPanel=true;group.add(hull);
 const edgeGeometry=new T.EdgesGeometry(geometry,18),edgeMaterial=new T.LineBasicMaterial({color:'#66756c',transparent:true,opacity:.65});
 group.add(new T.LineSegments(edgeGeometry,edgeMaterial));
 return{group,animate(){},dispose(){group.removeFromParent();geometry.dispose();material.dispose();edgeGeometry.dispose();edgeMaterial.dispose();group.clear();}};
}
