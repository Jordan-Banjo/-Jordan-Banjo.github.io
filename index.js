import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import { OrbitControls} from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader} from 'https://unpkg.com/three@0.127.0/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader} from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import {TextGeometry} from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';


let scene, camera, renderer, model, model1, loader, eyemixer, rocketmixer, action, moon, points, controls, clips, clock = new THREE.Clock();

function init() {

  //SCENE 
  scene = new THREE.Scene();
  let canvas = document.querySelector('bg');
  renderer = new THREE.WebGL1Renderer({ canvas: document.querySelector('#bg')});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  

  scene.background = new THREE.CubeTextureLoader()
  .setPath('').load([
    'front.png',
    'back.png',
    'top.png',
    'bottom.png',
    'left.png',
    'right.png'
  ]);

  
  //CAMERA
  camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1, 1000);
  camera.position.set(0, 50, 200); //camera in the centre
  
  //CONTROLS
  controls = new OrbitControls(camera, renderer.domElement);
  
  //ADD LIGHTS
  let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.95);
  hemiLight.position.set(0,50,0);
  scene.add(hemiLight);
  let pointLight = new THREE.PointLight(0xFFFFFF);
  let d = 8.25;
  let dirLight = new THREE.DirectionalLight(0xFFFFFF, 0.95)
  dirLight.position.set(-8,12,8);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
  let gridHelper = new THREE.GridHelper(200,50);
  scene.add(pointLight, hemiLight, dirLight);
  
  let fontLoader = new FontLoader();
  fontLoader.load('Impact_Regular.json', function(font){
    let geometrySetting = {
      font: font,
      size: 20,
      height: 5,
      curveSegments: 20,
      bevelEnabled:  true,
      bevelThickness: 1,
      bevelSize: 0.5,
      bevelSegments: 20
    };
    let textGeoJordan = new TextGeometry("Jordan's", geometrySetting);
    let textGeoUniverse = new TextGeometry("Universe ", geometrySetting);
    let moonTexture = new THREE.TextureLoader().load('moon.jpeg');
    
    let textMatJordan = new THREE.MeshNormalMaterial({side: THREE.DoubleSide});
    let textMatUniverse = new THREE.MeshNormalMaterial({side: THREE.DoubleSide});

  
    
    let TextJordan = new THREE.Mesh(textGeoJordan, textMatJordan);
    let TextUniverse = new THREE.Mesh(textGeoUniverse, textMatUniverse);
    let moon = new THREE.Mesh( new THREE.SphereGeometry(3, 32, 32), 
    new  THREE.MeshStandardMaterial({
      map: moonTexture,
    })
    );

    scene.add(moon)
    moon.position.z = -5;
    moon.position.y = -2;
    moon.position.setX(-10);
    
    TextJordan.position.set(-110,-70,20);
    TextUniverse.position.set(0,-70,20);

    scene.add(TextJordan);
    scene.add(TextUniverse);
  })
  
  let loader = new GLTFLoader();

  var eye;
  var eyeMixer;
  loader.load('Eye.glb', function(gltf){
     eye = gltf.scene;
    eye.traverse(c => {
      if (c.isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
      }
    });
    eye.scale.set(20,20,20);
    eye.position.set(120,30,20);
    eye.name = "eye"
    scene.add(eye);
   
   eyemixer = new THREE.AnimationMixer(gltf.scene);
   clips = gltf.animations;
   clips.forEach(function(clip) {
   let action = eyemixer.clipAction(clip);
   action.play();
   });
    
  });

  
  var rocket;
  var rocketmixer;
  loader.load('Rocket.glb', function(gltf) {
    rocket = gltf.scene;
    rocket.traverse(a => {
      if (a.isMesh) {
        a.castShadow = true;
        a.receiveShadow = true;
      }
    rocket.scale.set(30,30,30);
    rocket.position.set(-5,-700,-300);
    rocket.name = "rocket";
    scene.add(rocket);

    rocketmixer = new THREE.AnimationMixer(gltf.scene);
    clips = gltf.animations;
    clips.forEach(function(clip) {
    let action = rocketmixer.clipAction(clip);
    action.play();
    });

    });
    
    
})
  
  loader.load('AstroBoy-SmokeTrail4.glb', function(gltf) {
    model = gltf.scene;
   clips = gltf.animations;
   model.traverse(o => {
     if (o.isMesh) {
     o.castShadow = true;
     o.receiveShadow = true;
     }
   });
   model.scale.set(30,30,30);
   model.position.set(-10,-75,32)
   scene.add(model);
 
   },
 
 
   );

  
  renderer.render(scene, camera);
  resizeRenderer(renderer);
  animate();
  moveCamera();
}



function resizeRenderer(renderer) {
  const canvas = renderer.domElement;
  let width = window.innerWidth;
  let height = window.innerHeight;
  let canvasPixelWidth = canvas.width / window.devicePixelRatio;
  let canvasPixelHeight = canvas.height / window.devicePixelRatio;

  const needResize = 
  canvasPixelWidth !== width || canvasPixelHeight !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

function moveCamera() {
  let t = document.body.getBoundingClientRect().top;
  
  
  camera.position.z = t * -0.3;
  camera.position.y = t * -0.01;
  camera.rotation.x = t * -0.01;

}

document.body.onscroll = moveCamera;


function animate() {

  var delta = clock.getDelta();
  

  if (eyemixer)
  eyemixer.update(delta);

  if(rocketmixer)
  rocketmixer.update(delta);
  


  


  if (resizeRenderer(renderer)) { //checks to see if we need to resize by calling our function
    const canvas = renderer.domElement;
    camera.aspect =canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  } 
  
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  
}


init();
