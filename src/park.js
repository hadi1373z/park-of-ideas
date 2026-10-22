/* Authentic Atlas Ideas Park geometry and content, adapted to the shared city renderer. */
window.buildIdeaPark=function(THREE){
 const edition=window.PARK_EDITION,rooms=edition?.id==='question-garden';
 const groveX=edition?.grove?.x??42,groveZ=edition?.grove?.z??38;
 const scene=new THREE.Group(),rayTargets=new THREE.Group();scene.name='Atlas Ideas Park';scene.add(rayTargets);
 const districts=PARK_DATA.districts,people=PARK_DATA.catalogue.people,mobile=innerWidth<760;let treeCount=0;
  const mats = {
    grass: new THREE.MeshStandardMaterial({ color: '#9aaf86', roughness: 1 }),
    grassDark: new THREE.MeshStandardMaterial({ color: '#8ca179', roughness: 1 }),
    path: new THREE.MeshStandardMaterial({ color: '#e8dcc4', roughness: .97 }),
    cream: new THREE.MeshStandardMaterial({ color: '#f2e8d5', roughness: .8 }),
    stone: new THREE.MeshStandardMaterial({ color: '#ded5c1', roughness: .95 }),
    bronze: new THREE.MeshStandardMaterial({ color: '#a67d4e', roughness: .37, metalness: .45 }),
    wood: new THREE.MeshStandardMaterial({ color: '#a27852', roughness: .84 }),
    dark: new THREE.MeshStandardMaterial({ color: '#42574e', roughness: .63 }),
    terra: new THREE.MeshStandardMaterial({ color: '#bf785c', roughness: .85 }),
    trunk: new THREE.MeshStandardMaterial({ color: '#7a6450', roughness: 1 }),
    leaf: new THREE.MeshStandardMaterial({ color: '#6e8e65', roughness: 1, flatShading: true }),
    leafLight: new THREE.MeshStandardMaterial({ color: '#8da174', roughness: 1, flatShading: true }),
    leafGold: new THREE.MeshStandardMaterial({ color: '#b1af73', roughness: 1, flatShading: true }),
    water: new THREE.MeshStandardMaterial({ color: '#7eaea9', roughness: .2, metalness: .22, transparent: true, opacity: .94 }),
    waterLight: new THREE.MeshStandardMaterial({ color: '#c5e6df', roughness: .18, transparent: true, opacity: .67 }),
    glass: new THREE.MeshStandardMaterial({ color: '#b9d7cb', roughness: .12, metalness: .1, transparent: true, opacity: .65 }),
  };
  if(rooms)for(const [id,color]of Object.entries(edition.palette))mats[id]?.color.set(color);
  const geometries = [];
  const textures = [];
  const dynamicMaterials = [];
  const clickable = [];
  const nameSprites = [];
  const districtPositions = new Map();
  const personPositions = new Map();
  const seedPositions = new Map();
  const seedObjects = new Map();
  const seedData = new Map();
  const landmarks = new Map();
  const pulses = [];
  const dummy = new THREE.Object3D();
  const seedGroup = new THREE.Group();
  scene.add(seedGroup);

  function geometry(g) { geometries.push(g); return g; }
  const boxGeo = geometry(new THREE.BoxGeometry(1, 1, 1));
  const sphereGeo = geometry(new THREE.IcosahedronGeometry(1, 1));
  const lowSphereGeo = geometry(new THREE.IcosahedronGeometry(1, 0));
  const cylinderGeo = geometry(new THREE.CylinderGeometry(1, 1, 1, 12));
  const coneGeo = geometry(new THREE.ConeGeometry(1, 1, 8));

  function mesh(g, material, x = 0, y = 0, z = 0, parent = scene, shadow = true) {
    const m = new THREE.Mesh(g, material);
    m.position.set(x, y, z);
    m.castShadow = shadow;
    m.receiveShadow = true;
    if(material===mats.path&&parent===scene&&y<.2)m.visible=window.CITY_CONFIG?.showGroundPaving!==false;
    parent.add(m);
    return m;
  }
  function box(x, y, z, sx, sy, sz, mat, parent = scene, shadow = true) {
    const m = mesh(boxGeo, mat, x, y, z, parent, shadow);
    m.scale.set(sx, sy, sz);
    return m;
  }
  function sphere(x, y, z, sx, sy, sz, mat, parent = scene, shadow = true) {
    const m = mesh(sphereGeo, mat, x, y, z, parent, shadow);
    m.scale.set(sx, sy, sz);
    return m;
  }
  function cylinder(x, y, z, radius, h, mat, parent = scene, shadow = true) {
    const m = mesh(cylinderGeo, mat, x, y, z, parent, shadow);
    m.scale.set(radius, h, radius);
    return m;
  }
  function ring(x, y, z, radius, tube, mat, parent = scene, horizontal = true) {
    const m = mesh(geometry(new THREE.TorusGeometry(radius, tube, 8, 64)), mat, x, y, z, parent);
    if (horizontal) {
      m.rotation.x = Math.PI / 2;
      if (mat === mats.path) m.scale.y = .04;
    }
    return m;
  }
  function lineBetween(a, b, radius, mat, parent = scene) {
    const v = new THREE.Vector3().subVectors(b, a);
    const m = cylinder(0, 0, 0, radius, v.length(), mat, parent);
    m.position.copy(a).add(b).multiplyScalar(.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize());
    return m;
  }
  function road(a, b, roadWidth = 6) {
    if(rooms)return null;
    const distance = a.distanceTo(b);
    const m = box((a.x + b.x) / 2, .06, (a.z + b.z) / 2, roadWidth, .12, distance, mats.path, scene, false);
    m.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
    return m;
  }
  function mark(group, type, id) {
    group.traverse(object => {
      if (object.isMesh) {
        object.userData.select = { type, id };
        clickable.push(object);
      }
    });
  }
  function accent(hex) {
    const m = new THREE.MeshStandardMaterial({ color: hex || '#b98163', roughness: .49, metalness: .16 });
    dynamicMaterials.push(m);
    return m;
  }
  function textTexture(title, subtitle = '', color = '#42574e', size = mobile ? 384 : 512, publicLabel = true) {
    const c = document.createElement('canvas');
    c.width = size; c.height = Math.round(size * (subtitle ? 200 : 140) / 768);
    const ctx = c.getContext('2d');
    const logicalHeight = subtitle ? 200 : 140;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    // Private grove titles deliberately never enter the public registry, even
    // when their raw value equals an authored catalogue name such as Euclid.
    const language = publicLabel ? window.CITY_WORLD_PUBLIC_LANGUAGE : null;
    function repaint() {
      const shownTitle = language ? language.translatePublic(title) : title;
      const shownSubtitle = language ? language.translatePublic(subtitle) : subtitle;
      const persian = language?.getLanguage() === 'fa';
      ctx.setTransform(size / 768, 0, 0, size / 768, 0, 0);
      ctx.clearRect(0, 0, 768, logicalHeight);
      ctx.fillStyle = '#f5eddc';
      ctx.fillRect(0, 0, 768, logicalHeight);
      ctx.fillStyle = color;
      ctx.fillRect(0, logicalHeight - 9, 768, 9);
      ctx.direction = persian ? 'rtl' : 'ltr';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      let fontSize = subtitle ? 53 : 50;
      const family = persian ? 'Tahoma, Arial, sans-serif' : 'Georgia, serif';
      ctx.font = `600 ${fontSize}px ${family}`;
      while (ctx.measureText(shownTitle).width > 768 - 54 && fontSize > 22) {
        fontSize -= 2; ctx.font = `600 ${fontSize}px ${family}`;
      }
      ctx.fillText(shownTitle, 384, subtitle ? 67 : 66);
      if (subtitle) {
        ctx.font = '22px system-ui, sans-serif';
        ctx.fillStyle = '#647065';
        ctx.fillText(shownSubtitle.length > 55 ? shownSubtitle.slice(0, 52) + '…' : shownSubtitle, 384, 133);
      }
      t.needsUpdate = true;
    }
    if (language) {
      const unregister = language.registerPublicLabel({title, subtitle, repaint});
      t.addEventListener('dispose', unregister);
    } else repaint();
    textures.push(t);
    return t;
  }
  function plaque(title, subtitle, color, x, y, z, w, h, rotation, parent, publicLabel = true) {
    const material = new THREE.MeshBasicMaterial({ map: textTexture(title, subtitle, color, undefined, publicLabel), side: THREE.DoubleSide });
    dynamicMaterials.push(material);
    const p = mesh(geometry(new THREE.PlaneGeometry(w, h)), material, x, y, z, parent, false);
    p.rotation.y = rotation;
    return p;
  }

  // A 480 metre park, with broad promenades and nine quiet circular gardens.
  const terrain = cylinder(0, -.75, 0, 240, 1.5, mats.grass, scene, false);
  terrain.name=rooms?'One continuous garden landscape':'Park terrain';
  if(rooms){
    // Non-overlapping rectangles make joined gravel promenades with no raised tile pieces.
    const edges=[-218,-68,-58,58,68,218];
    for(let ix=0;ix<5;ix++)for(let iz=0;iz<5;iz++)if(ix===1||ix===3||iz===1||iz===3){const a=edges[ix],b=edges[ix+1],c=edges[iz],d=edges[iz+1];box((a+b)/2,.015,(c+d)/2,b-a,.03,d-c,mats.path);}
    for(const z of[-205,205])box(0,.015,z,126,.03,10,mats.path);
  }
  terrain.receiveShadow = true;

  if(!rooms)box(0, .08, 0, 12, .16, 12, mats.path, scene, false);

  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    road(new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.sin(a) * 228, 0, Math.cos(a) * 228), 5);
  }

  function bench(x, z, angle = 0, parent = scene) {
    const group = new THREE.Group(); group.position.set(x, .12, z); group.rotation.y = angle; parent.add(group);
    for (const side of [-1, 1]) box(side * 1.5, .7, 0, .22, 1.2, 1.3, mats.dark, group);
    box(0, 1.15, 0, 4.1, .25, 1.5, mats.wood, group);
    box(0, 1.9, -.65, 4.1, 1.0, .2, mats.wood, group);
    return group;
  }
  for (let i = 0; i < (rooms?0:34); i++) {
    const a = i * Math.PI * 2 / 34;
    const r = i % 2 ? 109 : 92;
    bench(Math.sin(a) * r, Math.cos(a) * r, a + Math.PI);
  }

  // Central fountain: the constellation at the park's heart.
  const fountain = new THREE.Group(); fountain.name='Central Question Fountain'; fountain.position.set(edition?.fountain?.x||0,0,edition?.fountain?.z||0); scene.add(fountain);
  cylinder(0, .6, 0, 12.5, 1.2, mats.stone, fountain);
  cylinder(0, 1.26, 0, 11.1, .18, mats.water, fountain, false);
  ring(0, 1.35, 0, 11.7, .68, mats.cream, fountain);
  cylinder(0, 2.7, 0, 2.6, 3.4, mats.cream, fountain);
  ring(0, 4.5, 0, 4.5, .48, mats.bronze, fountain);
  cylinder(0, 4.48, 0, 4.3, .22, mats.water, fountain, false);
  sphere(0, 6, 0, 1.5, 1.5, 1.5, mats.bronze, fountain);
  const jetPoints = [];
  for (let i = 0; i < 100; i++) {
    const a = i * 2.399963;
    const t = (i % 20) / 20;
    jetPoints.push(Math.sin(a) * (1 + 7.5 * t), 1.5 + 7.5 * Math.sin(t * Math.PI), Math.cos(a) * (1 + 7.5 * t));
  }
  const jetGeo = geometry(new THREE.BufferGeometry());
  jetGeo.setAttribute('position', new THREE.Float32BufferAttribute(jetPoints, 3));
  const jetMat = new THREE.PointsMaterial({ color: '#f1ffff', size: .24, transparent: true, opacity: .8, sizeAttenuation: true });
  dynamicMaterials.push(jetMat);
  const waterDrops = new THREE.Points(jetGeo, jetMat); fountain.add(waterDrops);
  const fountainHalo = ring(0, 1.4, 0, 8, .035, mats.waterLight, fountain);
  mark(fountain, 'landmark', 'fountain'); landmarks.set('fountain', { x: fountain.position.x, z: fountain.position.z });
  for (let i = 0; i < (rooms?0:7); i++) {
    const a = i * Math.PI * 2 / 7;
    bench(Math.sin(a) * 23, Math.cos(a) * 23, a);
  }

  // House of Ideas: a warm terracotta studio with an open colonnade.
  const studio = new THREE.Group(); studio.position.set(rooms?0:44, 0, rooms?-205:-54); scene.add(studio);
  cylinder(0, .25, 0, 17.5, .5, mats.path, studio, false);
  box(0, 4.7, 0, 20, 9, 14, mats.cream, studio);
  box(0, 1, 11, 26, 2, 7, mats.stone, studio);
  for (let i = 0; i < 5; i++) box((i - 2) * 5.1, 5.5, 11, .6, 9, .6, mats.cream, studio);
  box(0, 10.4, 7, 27, .8, 15, mats.terra, studio);
  const roofA = box(-5.5, 11.5, -1, 11.8, .8, 18, mats.terra, studio); roofA.rotation.z = .27;
  const roofB = box(5.5, 11.5, -1, 11.8, .8, 18, mats.terra, studio); roofB.rotation.z = -.27;
  box(0, 5.0, 7.05, 5.1, 6.7, .12, mats.dark, studio);
  for (let i = 0; i < 4; i++) {
    const side = i < 2 ? -1 : 1;
    box(side * 6.9, 5.7, i % 2 ? -7.08 : 7.08, 3.2, 4.2, .13, mats.glass, studio);
  }
  plaque('House of Ideas', 'A studio for the unfinished', '#a3674f', 0, 9.2, 14.55, 17, 3.2, 0, studio);
  for (let i = 0; i < 4; i++) box(0, .2 + i * .25, 16 + i * 1.4, 13 - i * .5, .4, 2, mats.stone, studio);
  road(new THREE.Vector3(44, 0, -33), new THREE.Vector3(15, 0, -20), 5);
  mark(studio, 'landmark', 'studio'); landmarks.set('studio', { x: studio.position.x, z: studio.position.z+20 });

  // The amphitheatre is a welcoming semicircle, scaled for a conversation.
  const theatre = new THREE.Group(); theatre.position.set(rooms?192:72, 0, rooms?0:70); theatre.rotation.y = -.6; scene.add(theatre);
  cylinder(0, .12, 0, 23, .24, mats.path, theatre, false);
  cylinder(0, .6, 0, 9, 1.2, mats.cream, theatre);
  for (let i = 0; i < 5; i++) {
    const r = 13 + i * 2.2;
    const shape = geometry(new THREE.TorusGeometry(r, .85, 4, 40, Math.PI * 1.3));
    const m = mesh(shape, i % 2 ? mats.terra : mats.stone, 0, 1.3 + i * .7, 0, theatre);
    m.rotation.x = Math.PI / 2; m.rotation.z = Math.PI * .85;
  }
  box(0, 1.25, -6, 8, .7, 4, mats.wood, theatre);
  plaque('Open questions', 'The amphitheatre', '#896955', 0, 4.1, -8, 10, 2.4, Math.PI, theatre);
  mark(theatre, 'landmark', 'amphitheater'); landmarks.set('amphitheater', { x: theatre.position.x, z: theatre.position.z });

  // Observatory: polished brass, open sky and a slowly turning telescope.
  const observatory = new THREE.Group(); observatory.position.set(rooms?-192:-67, 0, rooms?-40:-68); scene.add(observatory);
  cylinder(0, .55, 0, 17, 1.1, mats.path, observatory, false);
  cylinder(0, 3.8, 0, 10, 7.1, mats.cream, observatory);
  const dome = mesh(geometry(new THREE.SphereGeometry(10.1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2)), mats.bronze, 0, 7.5, 0, observatory);
  box(0, 3.3, 10.05, 4.4, 6.1, .13, mats.dark, observatory);
  ring(0, 7.45, 0, 10.1, .25, mats.terra, observatory);
  const telescope = new THREE.Group(); telescope.position.set(0, 8.5, 0); observatory.add(telescope);
  const barrel = cylinder(0, 3.5, 0, 1.35, 13, mats.dark, telescope); barrel.rotation.z = .9;
  cylinder(0, .3, 0, 2.6, .7, mats.bronze, telescope);
  const barrelEnd = sphere(-4.8, 7.4, 0, 1.28, 1.28, 1.28, mats.glass, telescope);
  plaque('Observatory', 'Look beyond the familiar', '#7a654b', 0, 6.4, 10.2, 11, 2.6, 0, observatory);
  mark(observatory, 'landmark', 'observatory'); landmarks.set('observatory', { x: observatory.position.x, z: observatory.position.z+16 });

  // Each discipline has its own small architectural sculpture at the centre.
  function pavilion(group, field, material) {
    cylinder(0, .4, 0, 8.4, .8, mats.cream, group);
    ring(0, .85, 0, 7.7, .18, material, group);
    if (field === 'geometry') {
      const pyramid = mesh(geometry(new THREE.ConeGeometry(5.6, 11, 4)), material, 0, 7, 0, group);
      pyramid.rotation.y = Math.PI / 4;
      const wire = new THREE.LineSegments(geometry(new THREE.EdgesGeometry(pyramid.geometry)), new THREE.LineBasicMaterial({ color: '#f6ead4' }));
      dynamicMaterials.push(wire.material); wire.position.copy(pyramid.position); wire.rotation.copy(pyramid.rotation); group.add(wire);
      sphere(0, 14, 0, 1.7, 1.7, 1.7, mats.bronze, group);
    } else if (field === 'graphs') {
      const pts = [new THREE.Vector3(-5, 4, 0), new THREE.Vector3(4, 4, 3), new THREE.Vector3(0, 13, -2), new THREE.Vector3(4, 9, -4), new THREE.Vector3(-3, 9, 4)];
      for (let i = 0; i < pts.length; i++) {
        sphere(pts[i].x, pts[i].y, pts[i].z, 1.35, 1.35, 1.35, material, group);
        for (let j = i + 1; j < pts.length; j++) if ((i + j) % 3 !== 0) lineBetween(pts[i], pts[j], .17, mats.bronze, group);
      }
    } else if (field === 'analysis') {
      for (let i = 0; i < 15; i++) {
        const x = (i - 7) * .8, y = 7.5 + 3 * Math.sin(i * .48);
        box(x, y / 2 + .8, 0, .38, y, 2.5, i % 3 ? material : mats.bronze, group);
      }
      ring(0, 7, 0, 6, .3, mats.cream, group, false);
    } else if (field === 'algebra') {
      const a = ring(-2, 7.7, 0, 4.2, .65, material, group, false); a.rotation.y = .5;
      const b = ring(2, 7.7, 0, 4.2, .65, mats.bronze, group, false); b.rotation.y = -.5;
      cylinder(-4, 3, 0, .45, 5, mats.cream, group); cylinder(4, 3, 0, .45, 5, mats.cream, group);
    } else if (field === 'logic') {
      for (let i = 0; i < 3; i++) {
        const h = 5 + i * 3;
        box(-4 + i, h / 2 + .8, -i * 2.1, .7, h, .7, material, group);
        box(4 - i, h / 2 + .8, -i * 2.1, .7, h, .7, material, group);
        box(0, h + .8, -i * 2.1, 8.7 - i * 2, .7, .7, i % 2 ? mats.bronze : material, group);
      }
    } else if (field === 'information') {
      for (let i = 0; i < 5; i++) {
        const hoop = ring(0, 7.8, 0, 5.4, .24, i % 2 ? mats.bronze : material, group, false);
        hoop.rotation.y = i * Math.PI / 5;
      }
      sphere(0, 7.8, 0, 1.5, 1.5, 1.5, mats.cream, group);
    } else if (field === 'algorithms') {
      const pts = [];
      for (let i = 0; i < (rooms?0:7); i++) {
        const a = i * 1.8;
        pts.push(new THREE.Vector3(Math.sin(a) * 4, 2 + i * 1.65, Math.cos(a) * 4));
      }
      for (let i = 0; i < pts.length; i++) {
        box(pts[i].x, pts[i].y, pts[i].z, 2.4, .5, 2.4, i % 2 ? material : mats.bronze, group);
        if (i) lineBetween(pts[i - 1], pts[i], .23, mats.cream, group);
      }
    } else if (field === 'systems') {
      for (let i = 0; i < 5; i++) {
        const hoop = ring(0, 2.7 + i * 2, 0, 5 - i * .5, .6, i % 2 ? mats.bronze : material, group);
        hoop.rotation.z = i * .1;
      }
      cylinder(0, 6, 0, .7, 11, mats.cream, group);
    } else {
      for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) {
        const h = 5 + ((x + z + 4) % 3) * 2.2;
        box(x * 3.2, h / 2 + .8, z * 3.2, .45, h, .45, material, group);
        box(x * 3.2, h + .8, z * 3.2, 2.8, .4, 2.8, mats.bronze, group);
      }
      sphere(0, 12.3, 0, 1.3, 1.3, 1.3, mats.cream, group);
    }
  }

  function personSculpture(group, field, material, variation) {
    const v = variation % 4;
    if (field === 'graphs' || field === 'algorithms') {
      const pts = [];
      for (let i = 0; i < 5; i++) {
        const a = i * Math.PI * 2 / 5 + variation * .37;
        pts.push(new THREE.Vector3(Math.sin(a) * 1.8, 4.2 + (i % 3) * 1.3, Math.cos(a) * 1.8));
      }
      pts.forEach((p, i) => {
        sphere(p.x, p.y, p.z, .55, .55, .55, i % 2 ? mats.bronze : material, group);
        lineBetween(p, pts[(i + 1) % 5], .09, mats.dark, group);
        if (field === 'graphs' && i < 3) lineBetween(p, pts[(i + 2) % 5], .07, mats.bronze, group);
      });
    } else if (field === 'geometry') {
      const oct = mesh(geometry(new THREE.OctahedronGeometry(2.2, 0)), material, 0, 5.3, 0, group);
      oct.rotation.set(.25 + v * .15, variation * .6, .3);
      ring(0, 5.3, 0, 2.7, .11, mats.bronze, group, false).rotation.y = .7;
    } else if (field === 'analysis') {
      const points = [];
      for (let i = 0; i < 24; i++) points.push(new THREE.Vector3((i / 23 - .5) * 5, 5.3 + 1.8 * Math.sin(i / 23 * Math.PI * (2 + v * .5)), .55 * Math.cos(i / 23 * Math.PI * 3)));
      mesh(geometry(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 26, .25, 7, false)), material, 0, 0, 0, group);
      cylinder(0, 3.7, 0, .17, 3.1, mats.bronze, group);
    } else if (field === 'algebra') {
      ring(-.75, 5.3, 0, 1.7, .3, material, group, false).rotation.y = .6;
      ring(.75, 5.3, 0, 1.7, .3, mats.bronze, group, false).rotation.y = -.6;
    } else if (field === 'logic') {
      for (let i = 0; i < 3; i++) {
        box(0, 3.6 + i * 1.1, 0, 3.6 - i * .65, .45, 1.8 - i * .25, i % 2 ? mats.bronze : material, group);
      }
      box(-1.25, 4.6, .0, .4, 3, .4, material, group); box(1.25, 4.6, 0, .4, 3, .4, material, group);
    } else if (field === 'information') {
      for (let i = 0; i < 3; i++) {
        const hoop = ring(0, 5.3, 0, 2, .14 + v * .03, i % 2 ? mats.bronze : material, group, false);
        hoop.rotation.y = i * Math.PI / 3;
      }
      sphere(0, 5.3, 0, .5, .5, .5, mats.cream, group);
    } else if (field === 'systems') {
      for (let i = 0; i < 4; i++) ring(0, 3.7 + i * .9, 0, 1.9 - i * .15, .28, i % 2 ? material : mats.bronze, group);
      cylinder(0, 5, 0, .2, 4.8, mats.dark, group);
    } else {
      const cube = box(0, 5.1, 0, 2.8, 2.8, 2.8, material, group);
      cube.rotation.set(.2, variation * .37, .14);
      const edges = new THREE.LineSegments(geometry(new THREE.EdgesGeometry(boxGeo)), new THREE.LineBasicMaterial({ color: '#f1e7d4' }));
      dynamicMaterials.push(edges.material); edges.scale.set(3.6, 3.6, 3.6); edges.position.set(0, 5.1, 0); edges.rotation.copy(cube.rotation); group.add(edges);
    }
  }

  const colors = new Map();
  districts.forEach((district, index) => {
    const a = index * Math.PI * 2 / Math.max(1, districts.length) - Math.PI / 2;
    const x = Number.isFinite(+district.x) ? +district.x : Math.sin(a) * 145;
    const z = Number.isFinite(+district.z) ? +district.z : Math.cos(a) * 145;
    districtPositions.set(district.id, { x, z });
    const material = accent(district.color);
    colors.set(district.id, material);
    const garden = new THREE.Group(); garden.position.set(x, 0, z); scene.add(garden);
    if(rooms){
      garden.name='Open garden room: '+district.id;
      box(0,.025,0,84,.05,84,index%2?mats.grassDark:mats.grass,garden,false);
      for(const side of[-1,1]){box(side*40,.24,0,.6,.48,78,mats.stone,garden);box(0,.24,side*40,78,.48,.6,mats.stone,garden);}
    }else{
    cylinder(0, .09, 0, 34.5, .18, mats.path, garden, false).visible=window.CITY_CONFIG?.showGroundPaving!==false;
    cylinder(0, .2, 0, 30.3, .12, index % 2 ? mats.grassDark : mats.grass, garden, false);
    ring(0, .26, 0, 31.4, 1.2, mats.path, garden).visible=window.CITY_CONFIG?.showGroundPaving!==false;
    ring(0, .29, 0, 34, .28, mats.cream, garden);
    ring(0, .3, 0, 23, 2.7, mats.path, garden).visible=window.CITY_CONFIG?.showGroundPaving!==false;
    }
    const pavilionGroup = new THREE.Group(); garden.add(pavilionGroup);
    if(rooms)pavilionGroup.scale.setScalar(.72);
    pavilion(pavilionGroup, district.id, material);
    mark(pavilionGroup, 'district', district.id);
    const inward = Math.atan2(-x, -z);
    // District names remain in the park interface; no freestanding signboards.
    for (let j = 0; j < 3; j++) {
      const ba = inward + Math.PI + (j - 1) * .7;
      bench(Math.sin(ba) * 29, Math.cos(ba) * 29, ba + Math.PI, garden);
    }
    road(new THREE.Vector3(x, 0, z), new THREE.Vector3(0, 0, 0), 6.2);
    const members = people.filter(p => (p.districtId || p.district || p.field) === district.id);
    members.forEach((person, i) => {
      const pa = inward + .32 + i * Math.PI * 2 / Math.max(members.length, 1);
      const r = members.length > 18 ? 25 : 23;
      const px = rooms?Math.sin(pa)*r*1.22:Math.sin(pa)*r, pz = rooms?Math.cos(pa)*r*1.22:Math.cos(pa)*r;
      const monument = new THREE.Group(); monument.position.set(px, 0, pz); monument.rotation.y = pa; garden.add(monument);if(rooms)monument.scale.setScalar(.7);
      cylinder(0, .23, 0, 3.5, .46, mats.stone, monument);
      box(0, 1.55, 0, 4.8, 2.25, 4.8, mats.cream, monument);
      box(0, 2.76, 0, 5.2, .24, 5.2, material, monument);
      personSculpture(monument, district.id, material, i);
      plaque(person.name || person.id, '', district.color || '#42574e', 0, 1.6, 2.43, 4.35, 1.2, 0, monument);
      mark(monument, 'person', person.id);
      personPositions.set(person.id, { x: x + px, z: z + pz, districtId: district.id });
      const spriteMat = new THREE.SpriteMaterial({ map: textTexture(person.name || person.id, '', district.color || '#42574e', mobile ? 256 : 384), depthTest: true, transparent: true });
      dynamicMaterials.push(spriteMat);
      const sprite = new THREE.Sprite(spriteMat); sprite.position.set(x + px, 9.2, z + pz); sprite.scale.set(11, 3, 1); sprite.visible = false; scene.add(sprite);
      nameSprites.push(sprite);
    });
  });

  // Entry colonnade and small orange lanterns establish a human scale.
  const entrance = new THREE.Group(); entrance.position.set(0, 0, 223); scene.add(entrance);
  for (const side of [-1, 1]) {
    box(side * 13, 5, 0, 1.4, 10, 1.4, mats.cream, entrance);
    sphere(side * 13, 11, 0, 1.2, 1.2, 1.2, mats.terra, entrance);
  }
  box(0, 10.2, 0, 29, 1.1, 2, mats.cream, entrance);
  for (let i = 0; i < (rooms?0:48); i++) {
    const a = i * Math.PI * 2 / 48;
    const r = 146;
    cylinder(Math.sin(a) * r, 2.6, Math.cos(a) * r, .16, 5.2, mats.dark);
    const lamp = sphere(Math.sin(a) * r, 5.4, Math.cos(a) * r, .45, .65, .45, mats.cream);
    lamp.castShadow = false;
  }

  // Deterministic planting: an outer woodland, avenues and relaxed interior groves.
  let randomState = 739221;
  function random() { randomState = (randomState * 1664525 + 1013904223) >>> 0; return randomState / 4294967296; }
  const treeLocations = [];
  function treeAllowed(x, z) {
    const radius = Math.hypot(x, z);
    if(rooms){
      if(radius>234||radius<8||Math.abs(Math.abs(x)-63)<9||Math.abs(Math.abs(z)-63)<9||Math.abs(z)>195&&Math.abs(x)<80)return false;
      for(const p of districtPositions.values())if(Math.abs(x-p.x)<47&&Math.abs(z-p.z)<47)return false;
      if(Math.hypot(x+180,z-70)<28||Math.hypot(x-192,z)<28||Math.hypot(x+192,z+40)<25)return false;return true;
    }
    if (radius < 58 || Math.abs(radius - 100) < 5 || Math.abs(radius - 145) < 7 || Math.abs(radius - 231) < 6) return false;
    for (const d of districtPositions.values()) if (Math.hypot(x - d.x, z - d.z) < 39) return false;
    if (((x + 63) / 37) ** 2 + ((z - 37) / 28) ** 2 < 1.5) return false;
    if (Math.hypot(x - 44, z + 54) < 24 || Math.hypot(x + 67, z + 68) < 22 || Math.hypot(x - 72, z - 70) < 28 || Math.hypot(x - 42, z - 38) < 21) return false;
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      if (Math.abs(x * Math.cos(a) - z * Math.sin(a)) < 6) return false;
    }
    for (const d of districtPositions.values()) {
      const a = Math.atan2(d.x, d.z);
      if (Math.abs(x * Math.cos(a) - z * Math.sin(a)) < 5 && x * d.x + z * d.z > 0) return false;
    }
    return radius < 236;
  }
  for (let attempt = 0; attempt < 3600 && treeLocations.length < (rooms?300:620); attempt++) {
    const a = random() * Math.PI * 2;
    const r = 44 + Math.sqrt(random()) * 189;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (treeAllowed(x, z)) treeLocations.push({ x, z, size: 4.3 + random() * 4.6, kind: Math.floor(random() * 3), rot: random() * 7 });
  }
  if(rooms){
    // Branching silhouettes and overlapping small crowns replace the original faceted blobs.
    const stems=new THREE.InstancedMesh(cylinderGeo,mats.trunk,treeLocations.length);
    const branchGeo=geometry(new THREE.CylinderGeometry(1,1,1,6));
    const branches=new THREE.InstancedMesh(branchGeo,mats.trunk,treeLocations.length*3);
    const canopyMaterial=new THREE.MeshLambertMaterial({color:0xffffff});dynamicMaterials.push(canopyMaterial);
    const canopies=new THREE.InstancedMesh(geometry(new THREE.IcosahedronGeometry(1,1)),canopyMaterial,treeLocations.length*7);canopies.name='Layered woodland canopies';
    branches.name='Woodland branches';const up=new THREE.Vector3(0,1,0),start=new THREE.Vector3(),end=new THREE.Vector3(),direction=new THREE.Vector3();
    treeLocations.forEach((t,i)=>{
      dummy.position.set(t.x,t.size*.4,t.z);dummy.rotation.set(0,t.rot,0);dummy.scale.set(.18,t.size*.8,.18);dummy.updateMatrix();stems.setMatrixAt(i,dummy.matrix);
      for(let j=0;j<7;j++){
        const a=t.rot+j*2.39996,r=j===0?0:t.size*(.25+(j%3)*.035),y=t.size*(j===0?1.16:.84+(j%3)*.12);
        end.set(t.x+Math.sin(a)*r,y,t.z+Math.cos(a)*r);dummy.position.copy(end);dummy.rotation.set(.12*(j%2),a,.08);dummy.scale.set(t.size*(.25+(j%2)*.035),t.size*.3,t.size*.26);dummy.updateMatrix();canopies.setMatrixAt(i*7+j,dummy.matrix);canopies.setColorAt(i*7+j,new THREE.Color(['#81956d','#667f60','#a7ab70','#738b69'][(i+j)%4]));
        if(j>0&&j<4){start.set(t.x,t.size*.56,t.z);direction.subVectors(end,start);dummy.position.copy(start).add(end).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(up,direction.clone().normalize());dummy.scale.set(.075,direction.length(),.075);dummy.updateMatrix();branches.setMatrixAt(i*3+j-1,dummy.matrix);}
      }
    });
    scene.add(stems,branches,canopies);treeCount=treeLocations.length;
  }else{
  const trunks = new THREE.InstancedMesh(cylinderGeo, mats.trunk, treeLocations.length);
  const crownsA = new THREE.InstancedMesh(lowSphereGeo, mats.leaf, treeLocations.length);
  const crownsB = new THREE.InstancedMesh(lowSphereGeo, mats.leafLight, treeLocations.length);
  const treeShadows = new THREE.InstancedMesh(cylinderGeo, mats.grassDark, treeLocations.length);
  treeShadows.castShadow = false;
  trunks.castShadow = false; trunks.receiveShadow = true;
  crownsA.castShadow = true; crownsA.receiveShadow = true;
  crownsB.castShadow = false; crownsB.receiveShadow = true;
  treeLocations.forEach((t, i) => {
    dummy.position.set(t.x + .6, .012, t.z + .3); dummy.scale.set(t.size * .55, .016, t.size * .5); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); treeShadows.setMatrixAt(i, dummy.matrix);
    dummy.position.set(t.x, t.size * .37, t.z); dummy.scale.set(.31, t.size * .74, .31); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); trunks.setMatrixAt(i, dummy.matrix);
    dummy.position.set(t.x, t.size, t.z); dummy.scale.set(t.size * .51, t.size * .58, t.size * .49); dummy.rotation.set(.06, t.rot, .04); dummy.updateMatrix(); crownsA.setMatrixAt(i, dummy.matrix);
    dummy.position.set(t.x + t.size * .21, t.size * 1.2, t.z - t.size * .08); dummy.scale.set(t.size * .36, t.size * .39, t.size * .36); dummy.rotation.set(.1, t.rot + .5, 0); dummy.updateMatrix(); crownsB.setMatrixAt(i, dummy.matrix);
    crownsA.setColorAt(i, new THREE.Color(rooms?(t.kind===2?'#ad995f':t.kind===1?'#87966b':'#637e67'):t.kind === 2 ? '#89986c' : t.kind === 1 ? '#718b62' : '#648464'));
  });
  scene.add(treeShadows, trunks, crownsA, crownsB); treeCount = treeLocations.length;
  }

  // Beds of small blossoms, instanced rather than individually drawn.
  const flowerLocations = [];
  districts.forEach((d, di) => {
    const p = districtPositions.get(d.id);
    for (let i = 0; i < 70; i++) {
      const a = i * 2.39996;
      const r = 32.2 + random() * 1.4;
      flowerLocations.push({ x:p.x+(rooms?(i%2?-1:1)*38:Math.sin(a)*r), z:p.z+(rooms?((i*1.31)%76)-38:Math.cos(a)*r), c:di%3 });
    }
  });
  for (let i = 0; i < 180; i++) {
    const a = random() * Math.PI * 2, r = 20 + random() * 3;
    flowerLocations.push({ x: groveX + Math.sin(a) * r, z: groveZ + Math.cos(a) * r, c: i % 3 });
  }
  const flowers = new THREE.InstancedMesh(lowSphereGeo, mats.cream, flowerLocations.length);
  flowers.castShadow = false;
  flowerLocations.forEach((f, i) => {
    dummy.position.set(f.x, .4 + random() * .4, f.z); dummy.rotation.set(0, random() * 6, 0); dummy.scale.set(.32, .23, .32); dummy.updateMatrix(); flowers.setMatrixAt(i, dummy.matrix);
    flowers.setColorAt(i, new THREE.Color(['#f0caad', '#eee5c2', '#c3a2b7'][f.c]));
  }); scene.add(flowers);

  // The idea grove is the one part of the park that grows with its visitor.
  const grove=new THREE.Group();grove.position.set(groveX-42,0,groveZ-38);scene.add(grove);
  cylinder(42, .12, 38, 19, .24, mats.path, grove, false);
  cylinder(42, .26, 38, 16.8, .12, mats.grassDark, grove, false);
  ring(42, .3, 38, 17.8, .65, mats.cream, grove);
  landmarks.set('grove', { x: groveX, z: groveZ });
  bench(57, 42, -Math.PI / 2,grove); bench(33, 49, -.5,grove);


  function addSeed(seed) {
    if (!seed?.id || seedPositions.has(seed.id)) return false;
    const i = seedPositions.size;
    const a = i * 2.39996;
    const r = Math.min(13.5, 4 + Math.sqrt(i) * 2.4);
    const x = Number.isFinite(+seed.x) ? +seed.x : groveX + Math.sin(a) * r;
    const z = Number.isFinite(+seed.z) ? +seed.z : groveZ + Math.cos(a) * r;
    const group = new THREE.Group(); group.position.set(x, 0, z); seedGroup.add(group);
    const bloom = accent(seed.color || ['#d29b87', '#c4ba80', '#b79cbb', '#dfa988'][i % 4]);
    cylinder(0, .17, 0, 1.9, .34, mats.cream, group);
    cylinder(0, 2.3, 0, .18, 4.6, mats.trunk, group);
    for (let j = 0; j < 4; j++) {
      const angle = j * 2.3999;
      const bx = Math.sin(angle) * 1.3, bz = Math.cos(angle) * 1.3, by = 3.7 + j * .3;
      lineBetween(new THREE.Vector3(0, 2.8, 0), new THREE.Vector3(bx, by, bz), .11, mats.trunk, group);
      sphere(bx, by + .55, bz, 1.25, 1.25, 1.25, bloom, group);
    }
    sphere(0, 5.1, 0, 1.3, 1.4, 1.3, bloom, group);
    if (seed.title) plaque(seed.title, '', '#5c6150', 0, 1.1, 1.95, 4, 1, 0, group, false);
    mark(group, 'seed', seed.id); seedPositions.set(seed.id, { x, z }); seedObjects.set(seed.id, group); seedData.set(seed.id, { ...seed, x, z }); treeCount++;
    return { x, z };
  }
  function removeSeed(id) {
    const group = seedObjects.get(id);
    if (!group) return false;
    group.traverse(object => { const i = clickable.indexOf(object); if (i >= 0) clickable.splice(i, 1); });
    seedGroup.remove(group); seedObjects.delete(id); seedPositions.delete(id); seedData.delete(id); treeCount--;
    return true;
  }
  function updateSeed(seed) {
    if (!seed?.id) return false;
    const existing = seedData.get(seed.id);
    if (!existing) return addSeed(seed);
    removeSeed(seed.id);
    return addSeed({ ...existing, ...seed });
  }
  function setSeeds(seeds) {
    const ids = new Set((seeds || []).map(s => s.id));
    for (const id of seedObjects.keys()) if (!ids.has(id)) removeSeed(id);
    for (const seed of seeds || []) {
      const previous = seedData.get(seed.id);
      if (!previous) addSeed(seed);
      else if (previous.title !== seed.title || previous.color !== seed.color || (seed.x != null && previous.x !== seed.x) || (seed.z != null && previous.z !== seed.z)) updateSeed(seed);
    }
    return seedPositions.size;
  }

  function batchStaticGeometry() {
    scene.updateMatrixWorld(true);
    const animated = new Set([seedGroup,telescope,fountainHalo,...pulses.map(p=>p.object)]);
    const batches = new Map();
    scene.traverse(object => {
      if (!object.isMesh || object.isInstancedMesh || object.isSprite || Array.isArray(object.material)) return;
      for (let parent = object; parent; parent = parent.parent) if (animated.has(parent)) return;
      let list = batches.get(object.material);
      if (!list) batches.set(object.material, list = []);
      list.push(object);
    });
    for (const [material, objects] of batches) {
      if (objects.length < 2) continue;
      const parts = objects.map(object => {
        const transformed = object.geometry.clone().applyMatrix4(object.matrixWorld);
        const flat = transformed.index ? transformed.toNonIndexed() : transformed;
        if (flat !== transformed) transformed.dispose();
        return flat;
      });
      const count = parts.reduce((sum, g) => sum + g.attributes.position.count, 0);
      const positions = new Float32Array(count * 3);
      const normals = new Float32Array(count * 3);
      const uvs = new Float32Array(count * 2);
      let offset = 0;
      for (const g of parts) {
        const n = g.attributes.position.count;
        positions.set(g.attributes.position.array, offset * 3);
        if (g.attributes.normal) normals.set(g.attributes.normal.array, offset * 3);
        if (g.attributes.uv) uvs.set(g.attributes.uv.array, offset * 2);
        offset += n; g.dispose();
      }
      const merged = geometry(new THREE.BufferGeometry());
      merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
      merged.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      merged.computeBoundingSphere();
      const rendered = mesh(merged, material, 0, 0, 0, scene, objects.some(o => o.castShadow));
      rendered.receiveShadow = objects.some(o => o.receiveShadow);
      for (const object of objects) {
 const matrix=object.matrixWorld.clone();object.parent?.remove(object);
 if(clickable.includes(object)){object.matrixAutoUpdate=false;object.matrix.copy(matrix);object.layers.set(1);rayTargets.add(object);}
}
    }
  }

 batchStaticGeometry();
 // Ideas Park is freely walkable; scenery and selection remain visible.
 function canStand(){return true;}
 function update(t,reducedMotion){if(reducedMotion)return;waterDrops.rotation.y=t*.11;waterDrops.position.y=Math.sin(t*2)*.1;fountainHalo.rotation.z=t*.15;pulses.forEach(p=>p.object.scale.setScalar(1+((t*.12+p.offset*.17)%1)*.7));telescope.rotation.y=Math.sin(t*.045)*.35;}
 return{group:scene,targets:clickable,districtPositions,personPositions,seedPositions,landmarks,addSeed,removeSeed,updateSeed,setSeeds,canStand,update,stats:{edition:rooms?edition.id:'atlas',people:people.length,districts:districts.length,trees:treeCount}};
};
