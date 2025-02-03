import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { Flow } from "../utils/flow.js";
import PostProcessing from "../utils/PostProcessing.js";
import Audio from "../utils/audio.js";
import startApp from "../utils/app.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";

const Fireworks = () => {
  const mountRef = useRef(null);
  console.log("mountRef", mountRef);

  useEffect(() => {
    const init = async () => {
      let renderer3 = new Renderer(mountRef);

      let { THREE, scene, camera, flow, vec3 } = renderer3;
      window.app = await startApp({
        renderer3,
      });

      let { dd } = renderer3;

      renderer3.start();

      let audio = new Audio(camera);

      let sfx = ({
        name,
        position,
        minGain = 0.05,
        maxGain = 0.3,
        minDetune = -700,
        maxDetune = -200,
      }) => {
        audio.play(
          name,
          position,
          rrng(minGain, maxGain),
          rrng(minDetune, maxDetune)
        );
      };

      let { abs, min, random } = Math;
      let rrng = (n = 0, p = 1) => random() * (p - n) + n;
      let irrng = (n = 0, p = 1) => (random() * (p - n) + n) | 0;
      let grav = -0.0098;
      function* mt() {}
      class sys {
        constructor() {
          this.nodes = [];
          this.now = performance.now() / 1000;
        }
        step() {
          let now = performance.now() / 1000;
          this.dt = now - this.now;
          this.now = now;
          this.ndt = this.dt / (1 / 60);
          let i = 0,
            w = 0;
          for (; i < this.nodes.length; i++) {
            let n = this.nodes[i];
            if (!n.step()) {
              this.nodes[w++] = n;
            }
          }
          this.nodes.length = w;
        }
        emit(fn = mt, ctx) {
          let n = new sys.node(this);
          n.flow = flow.start(fn, n, ctx);
          n.flow.onDone = () => (n.dead = true);
          n.velocity.randomDirection();
          n.velocity.x *= 0.1;
          n.velocity.z *= 0.1;
          n.velocity.y = abs(n.velocity.y);
          n.velocity.y *= 0.4;
          this.nodes.push(n);
          return n;
        }
      }

      let _p = vec3();
      let _n = vec3();

      sys.node = class {
        constructor(sys) {
          this.sys = sys;
          this.life = 0.2;
          this.spawntime = sys.now;
          this.mass = 1;
          this.drag = 0;
          this.position = vec3();
          this.velocity = vec3();
          this.color = (Math.random() * (1 << 24)) | 0;
          this.prims = new Array(8);
          this.ptop = 0;
        }
        destroyPrim(p) {
          dd.pushtop(p);
          dd.moveto(0, 0, 0);
          dd.lineto(0, 0, 0);
          dd.poptop();
        }
        dispose() {
          let t = this.ptop;
          if (this.ptop >= this.prims.length) t = this.prims.length;
          for (let i = 0; i < t; i++) this.destroyPrim(this.prims[i]);
        }
        step() {
          dd.color = this.color;

          let age = min(1, (this.sys.now - this.spawntime) / this.life);

          if (this.ptop >= this.prims.length) {
            let p = this.prims[this.ptop % this.prims.length];
            dd.pushtop(p);
            dd.moveto(0, 0, 0);
            dd.lineto(0, 0, 0);
            dd.poptop();
          }

          this.prims[this.ptop % this.prims.length] = dd.top();
          this.ptop++;
          dd.moveto(this.position);
          _p.copy(this.velocity);
          _p.multiplyScalar(this.sys.ndt);
          this.position.add(_p);
          dd.lineto(this.position);
          this.velocity.y += grav * this.mass * this.sys.ndt;
          if (this.position.y < 0) {
            this.position.y = 0 - this.position.y;
            this.velocity.y *= -1;
            this.velocity.multiplyScalar(0.5);
          } else {
            if (this.drag) this.velocity.multiplyScalar(this.drag);
          }
          for (let i = 0, t = min(this.prims.length, this.ptop); i < t; i++) {
            let id = (this.ptop + i) % this.prims.length;
            let p = this.prims[id];
            let brightness = (i / t) * ((1 - age) ** 2 * 2.0);
            dd.pushtop(p);
            dd.lineCol(dd._color, brightness);
            dd.poptop();
          }

          if (this.dead) {
            this.dispose();
            return true;
          }
        }
      };

      function* spark(n, shell) {
        n.position.copy(shell.position);
        n.velocity.randomDirection().multiplyScalar(0.23 * shell.power);
        n.velocity.add(shell.velocity);
        n.life = rrng(0.8, 1);
        n.mass = rrng(0.5, 1);
        n.drag = rrng(0.95, 0.99);
        yield n.life * 1000;
      }

      function* shell(shell) {
        shell.velocity.y += 0.7;
        shell.velocity.x *= 1.5;
        shell.velocity.z *= 1.5;
        shell.power = rrng(1, 2);
        shell.life = 1.05 * shell.power;
        yield shell.life * 1000; // (1900*shell.velocity.y)|0;
        shell.dead = true;
        sfx({
          name: random() > 0.1 ? "boom0" : "pop0",
          position: shell.position,
          minDetune: -2000,
          maxDetune: 500,
          minGain: 0.5,
          maxGain: 0.7,
        });

        if (thraxBombs[0] && !irrng(0, 20)) {
          shell.sys.emit(
            thraxBombs[Math.floor(Math.random() * thraxBombs.length)],
            shell
          );
        }
        for (let i = 0; i < 50; i++) {
          shell.sys.emit(spark, shell);
        }
      }

      function* launcher(launcher) {
        launcher.velocity.set(0, 0, 0);
        while (1) {
          yield irrng(10, 30);
          if (rrng() > 0.95) yield 3000;
          sfx({
            name: "launch0",
            position: launcher.position,
            minDetune: -500,
            maxDetune: 3500,
          });
          launcher.sys.emit(shell, launcher);
        }
      }
      let msys = new sys();
      msys.emit(launcher);

      flow.start(function* () {
        while (1) {
          msys.step();
          yield 0;
        }
      });

      const loader = new FontLoader();

      let thraxBombs = [];
      // loader.load( 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function ( font ) {
      loader.load("fonts/helvetiker_regular.typeface.json", function (font) {
        // ♡ η
        const phrases = ['I♡U-','IηU']; //['Texto aqui', 'Otra frase', 'Y otra más'];
        // const phrases = ['1', '2', '3',	'4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'];
        const geometries = [];
        for (let i = 0; i < phrases.length; i++) {
          geometries.push(
            new TextGeometry(phrases[i], {
              font: font,
              // size: 16,
              size: 16,
              depth: 1,
              curveSegments: 2,
              bevelEnabled: true,
              bevelThickness: 0.1,
              bevelSize: 0.1,
              bevelOffset: 0,
              bevelSegments: 1,
            })
          );
        }

        for (let i = 0; i < geometries.length; i++) {
          let mesh = new THREE.Mesh(
            geometries[i],
            new THREE.MeshBasicMaterial({ color: "#ff0000" })
          );
          scene.add(mesh);
          let bnds = new THREE.Box3().setFromObject(mesh);
          bnds.getCenter(_p);
          mesh.geometry.translate(-_p.x, -_p.y, -_p.z);
          bnds.getSize(_p);
          let sc = 1 / _p.x;
          mesh.geometry.scale(sc, sc, sc);

          let mss = new MeshSurfaceSampler(mesh)
            .setWeightAttribute(null)
            .build();
          function* meshSpark(n, shell) {
            mss.sample(_p, _n);
            _p.applyQuaternion(camera.quaternion); //localToWorld(_p);
            n.position.copy(shell.position);
            n.position.add(_p);
            n.velocity.copy(_p);
            n.velocity.add(shell.velocity);
            n.life = rrng(1, 2.5);
            n.mass = 0.5; //rrng(0.1,0.11);

            if (window.innerWidth < 800) {
              _p.multiplyScalar(1.5);
              n.drag = 0.99; //rrng(.95,.95);
            } else {
              _p.multiplyScalar(2.5);
              n.drag = 0.99; //rrng(.95,.95);
            }
            yield n.life * 1000;
          }
          const newBomb = function* (n, shell) {
            for (let i = 0; i < 500; i++) {
              let spark = n.sys.emit(meshSpark, shell);
              spark.color = n.color;
            }
            yield;
          };

          thraxBombs.push(newBomb);
        }
      });
    };
    init();
  }, []);

  return (
    <div className="relative w-full bg-black h-screen flex justify-center items-center cursor-crosshair">
      <div
        ref={mountRef}
        style={{
          filter: "drop-shadow(0px 200px 50px #0000009d)",
          position: "absolute",
          left: "0px",
          top: "0px",
          width: "100%",
          height: "100vh",
        }}
      />
    </div>
  );
};

export default Fireworks;

function Renderer(mountRef) {
  //{THREE,OrbitControls,RGBELoader,GLTFLoader}
  

  let { Scene, WebGLRenderer, PerspectiveCamera } = THREE;
  this.THREE = THREE;

  let flow = (this.flow = new Flow());

  this.vec3 = (x, y, z) => new THREE.Vector3(x, y, z);

  console.log("thx🌎");

  let renderer = (this.renderer = new WebGLRenderer({
    antialias: true,
    alpha: false,
  }));

  renderer.setClearColor(0x000000, 0);

  // const container = document.createElement('div')
  // Object.assign(container.style,{position:'fixed',top:'0',left:'0',right:'0',bottom:'0'})
  // document.body.appendChild(container)
  mountRef.current.appendChild(renderer.domElement);

  let scene = (this.scene = new Scene());
  let camera = (this.camera = new PerspectiveCamera(75, 1, 0.01, 1000));
  scene.add(camera);
  let controls = (this.controls = new OrbitControls(
    camera,
    renderer.domElement
  ));
  camera.position.set(-24, 54, -26);
  controls.target.set(0, 40, 0);
  //controls.maxPolarAngle = Math.PI * 0.5;

  const dlight = (this.directionalLight = new THREE.DirectionalLight(
    0xffffff,
    0.5
  ));
  scene.add(dlight);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  //Create a DirectionalLight and turn on shadows for the light
  dlight.position.set(10, 20, 10);
  dlight.castShadow = true;

  //Set up shadow properties for the light
  dlight.shadow.mapSize.width = 1024;
  dlight.shadow.mapSize.height = 1024;
  dlight.shadow.camera.near = 0.5;
  dlight.shadow.camera.far = 50;
  dlight.shadow.camera.left = dlight.shadow.camera.bottom = -8;
  dlight.shadow.camera.top = dlight.shadow.camera.right = 8;

  let gui = new GUI();
  gui.close();
  let postProcessing = (this.postProcessing = new PostProcessing({
    THREE,
    renderer,
    scene,
    camera,
    gui,
  }));

  postProcessing.pauseBloom = {
    threshold: 0,
    strength: 3,
    radius: 1,
  };

  postProcessing.defaultBloom = {
    threshold: 0.23,
    strength: 0.086,
    radius: 0,
  };

  Object.assign(postProcessing.bloom, postProcessing.defaultBloom);

  this.gltfLoader = new GLTFLoader();

  controls.enableDamping = true;

  let onWindowResize = (event) => {
    let width = window.innerWidth;
    let height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    postProcessing && postProcessing.resize(width, height);
  };

  onWindowResize();
  window.addEventListener("resize", onWindowResize, false);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
  window.addEventListener("pointermove", onPointerMove);

  document.body.oncontextmenu = () => false;

  let buttons = (this.buttons = {
    lastButtons: 0,
    buttons: 0,
  });
  let onButtons = (e) => {
    buttons.buttons = e.buttons;
    //e.preventDefault()
    //e.stopPropagation()
    return false;
  };

  window.addEventListener("keydown", (e) => {
    this.keys[e.code] = true;
  });
  window.addEventListener("keyup", (e) => {
    this.keys[e.code] = false;
  });
  window.addEventListener("pointerdown", onButtons);
  window.addEventListener("pointerup", onButtons);
  let raycast = (target = scene) => {
    raycaster.setFromCamera(pointer, camera);
    raycasting.lastHit = raycasting.intersects[0];
    raycasting.intersects.length = 0;
    if (buttons.buttons == 1) {
    } else raycasting.startHit = null;
    // calculate objects intersecting the picking ray
    raycaster.intersectObject(target, true, raycasting.intersects);
    raycasting.hit = raycasting.intersects[0];
    if (!buttons.lastButtons) {
      raycasting.startHit = raycasting.hit;
    }
    return raycasting.hit ? true : false;
  };

  let raycasting = (this.raycasting = {
    intersects: [],
    lastHit: null,
    hit: null,
    raycast,
    buttons,
  });

  let pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  let envMap;
  this.loadEnvironmentMap = async ({
    url = "./pretville_street_1k (4).hdr",
    blur = 1,
  } = {}) => {
    return new Promise((resolve, reject) => {
      new RGBELoader().setPath("").load(url, function (texture) {
        envMap = pmremGenerator.fromEquirectangular(texture).texture;
        const blurFactor = 0.041 * blur; //Blur the envmap...
        let nscene = new THREE.Scene();
        nscene.environment = envMap;
        nscene.background = envMap;
        texture.dispose();
        scene.background = scene.environment = pmremGenerator.fromScene(
          nscene,
          blurFactor
        ).texture;
        pmremGenerator.dispose();
        resolve(scene.environment);
      });
    });
  };
  let ground = (this.ground = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({
      color: "white",
    })
  ));
  ground.castShadow = ground.receiveShadow = true;
  ground.scale.set(50, 0.1, 50);
  ground.position.set(0, -0.05, 0);
  scene.add(ground);
  ground.castShadow = ground.receiveShadow = true;

  this.onFrame = null;

  

  let lastTime;
  /*

  let angle = 0;
  let radius = 60; // Radio de la órbita de la cámara
  let speed = 0.005;
  let animationLoop = (time) => {
    let dt = lastTime ? time - lastTime : 0;
    lastTime = time;

    // Rotar la cámara alrededor del punto de interés
    angle += speed;
    camera.position.x = Math.cos(angle) * radius;
    camera.position.z = Math.sin(angle) * radius;
    camera.lookAt(0, 40, 0); // Asegurar que la cámara siempre mire al centro

    this.onFrame && this.onFrame(dt, time);
    flow.updateAll();
    controls.update();
    postProcessing && postProcessing.render();
};
*/


let animationLoop = (time) => {
    let dt = lastTime ? time - lastTime : 0;
    lastTime = time;
    this.onFrame && this.onFrame(dt, time);
    flow.updateAll();
    controls.update();
    postProcessing && postProcessing.render();
  };

  this.start = () => renderer.setAnimationLoop(animationLoop);

  let factory = {
    box: () => new THREE.BoxGeometry(),
    sphere: () => new THREE.SphereGeometry(0.5),
  };
  this.mesh = ({
    type = "box",
    geometry,
    position,
    rotation,
    scale,
    material,
    metalness,
    roughness,
    color,
  } = {}) => {
    let mgeometry = geometry || factory[type]();
    let mmaterial =
      material ||
      new THREE.MeshStandardMaterial({
        color: color || "red",
        metalness: metalness || 0.7,
        roughness: roughness || 0.3,
      });
    let mesh = new THREE.Mesh(mgeometry, mmaterial);
    position && mesh.position.copy(position);
    rotation && mesh.rotation.copy(rotation);
    scale && mesh.scale.copy(scale);
    mesh.castShadow = mesh.receiveShadow = true;
    return mesh;
  };
}


