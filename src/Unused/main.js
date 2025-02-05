import Renderer from "./renderer.js";
import startApp from "../utils/app.js";

let renderer3 = new Renderer();

let { THREE, scene, camera, flow, vec3 } = renderer3;
window.app = await startApp({
  renderer3,
});

let { dd } = renderer3;

renderer3.start();

import Audio from "../utils/audio.js";

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

import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
const loader = new FontLoader();
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";

let thraxBombs = [];
// loader.load( 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function ( font ) {
loader.load("helvetiker_regular.typeface.json", function (font) {
  // ♡ η
  const phrases = ["Nataly", "I♡U", "IηU", "Nataly♡"]; //['Texto aqui', 'Otra frase', 'Y otra más'];
  // const phrases = ['1', '2', '3',	'4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'];
  const geometries = [];
  for (let i = 0; i < phrases.length; i++) {
    geometries.push(
      new TextGeometry(phrases[i], {
        font: font,
        // size: 16,
        size: 10,
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
      new THREE.MeshBasicMaterial({ color: "#fffb00" })
    );
    scene.add(mesh);
    let bnds = new THREE.Box3().setFromObject(mesh);
    bnds.getCenter(_p);
    mesh.geometry.translate(-_p.x, -_p.y, -_p.z);
    bnds.getSize(_p);
    let sc = 1 / _p.x;
    mesh.geometry.scale(sc, sc, sc);

    let mss = new MeshSurfaceSampler(mesh).setWeightAttribute(null).build();
    function* meshSpark(n, shell) {
      mss.sample(_p, _n);
      _p.applyQuaternion(camera.quaternion); //localToWorld(_p);
      n.position.copy(shell.position);
      n.position.add(_p);
      n.velocity.copy(_p);
      n.velocity.add(shell.velocity);
      n.life = rrng(1, 2.5);
      n.mass = 1.2; //rrng(0.1,0.11);

      if (window.innerWidth < 800) {
        _p.multiplyScalar(1.5);
        n.drag = 0.97; //rrng(.95,.95);
      } else {
        _p.multiplyScalar(1.5);
        n.drag = 0.99; //rrng(.95,.95);
      }
      yield n.life * 1000;
    }
    const newBomb = function* (n, shell) {
      for (let i = 0; i < 700; i++) {
        let spark = n.sys.emit(meshSpark, shell);
        spark.color = n.color;
      }
    //   yield;
    };

    thraxBombs.push(newBomb);
  }

});
