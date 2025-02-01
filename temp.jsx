import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

const ThreeJSGLTFViewer2 = ({path, imgUrl}) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(1, 6, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Mejora el mapeo de tonos
    renderer.toneMappingExposure = 1.0;
    mountRef.current.appendChild(renderer.domElement);

    // Cargar el Environment Map (HDRI)
    new RGBELoader().setPath("/hdri/").load("sky.hdr", (texture) => {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      pmremGenerator.dispose();

      scene.environment = envMap;
      // scene.background = envMap; // Puedes comentar esto si no quieres el fondo
    });

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(5, 10, 7.5);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    // scene.add(ambientLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;

    const loader = new GLTFLoader();
    let model;
    let mixer;
    let abrirAction;
    let cerrarAction;
    let isOpen = false;
    let currentAction = null;
    let canPlayOpenClose = false;

    loader.load(
      path,
      (gltf) => {
        model = gltf.scene;
        if(window.innerWidth < 800){
          model.scale.set(1.3, 1.3, 0.5);
          model.translateY(-10);
        } else {
          model.scale.set(2, 2, 0.5);
          model.translateY(-15);
          model.translateX(-6);
        }
        
        scene.add(model);

        if (gltf.animations?.length > 0) {
          mixer = new THREE.AnimationMixer(model);

          // Configurar todas las animaciones
          const upAnim = gltf.animations.find(a => a.name === "Action_up");
          const abrirAnim = gltf.animations.find(a => a.name === "Action_abrir");
          const cerrarAnim = gltf.animations.find(a => a.name === "Action_cerrar");
          console.log(gltf.animations);

          // Configurar animación up inicial
          if (upAnim) {
            const upAction = mixer.clipAction(upAnim); 
            upAction.setLoop(THREE.LoopOnce);
            upAction.clampWhenFinished = true;
            
            // Cuando termine la animación up, permitir abrir/cerrar
            mixer.addEventListener('finished', (e) => {
              if (e.action === upAction) {
                canPlayOpenClose = true;
                mixer.removeEventListener('finished');
              }
            });

            currentAction = upAction;
            upAction.play();
          }

          // Configurar animaciones abrir/cerrar
          if (abrirAnim) {
            abrirAction = mixer.clipAction(abrirAnim);
            abrirAction.setLoop(THREE.LoopOnce);
            abrirAction.clampWhenFinished = true;
          }

          if (cerrarAnim) {
            cerrarAction = mixer.clipAction(cerrarAnim);
            cerrarAction.setLoop(THREE.LoopOnce);
            cerrarAction.clampWhenFinished = true;
          }
        }
      },
      undefined,
      (error) => console.error("Error loading model:", error)
    );

   
    loader.load(
      "/model3d/globo1.glb",
      (gltf) => {
        const model2 = gltf.scene;
        model2.scale.set(1, 1, 1);
        model2.position.set(0, 5, 0);
        scene.add(model2);

        const mixer2 = new THREE.AnimationMixer(model2);
        const anim = gltf.animations.find(a => a.name === "Action");
        console.log(gltf.animations);
        const action = mixer2.clipAction(anim);
        action.setLoop(THREE.LoopRepeat, 5);
        action.play();
      },
      undefined,
      (error) => console.error("Error loading model:", error)
    );

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      if (mixer) mixer.update(clock.getDelta());
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleClick = () => {
      if (!abrirAction || !cerrarAction || !canPlayOpenClose) return;

      // Detener la animación actual si existe
      if (currentAction) {
        currentAction.stop();
      }

      if (isOpen) {
        currentAction = cerrarAction;
        cerrarAction.reset();
        cerrarAction.play();
      } else {
        currentAction = abrirAction;
        abrirAction.reset();
        abrirAction.play();
      }
      
      isOpen = !isOpen;
    };

    mountRef.current.addEventListener('click', handleClick);

    const handleResize = () => {
      console.log("Resized to:", mountRef.current.clientWidth, mountRef.current.clientHeight);
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (mixer) {
        mixer.stopAllAction();
        mixer.uncacheRoot(model);
      }
      window.removeEventListener('resize', handleResize);
      mountRef.current.removeEventListener('click', handleClick);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return<div className="relative w-full h-screen bg-red-500 flex justify-center items-center">
  <img
    src={imgUrl}
    alt="descarga"
    className="absolute top-0 left-0 w-full h-full object-cover"
  />
   <div ref={mountRef} style={{ filter: "drop-shadow(0px 200px 50px #0000009d)",position:"absolute", left:"0px", top:"0px", width: '100%', height: '100vh' }} />;
   </div>
};

export default ThreeJSGLTFViewer2;
