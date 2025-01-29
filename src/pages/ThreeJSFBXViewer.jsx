import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const ThreeJSGLTFViewer = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      300
    );
    camera.position.set(2, 0, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const loader = new GLTFLoader();
    let model;
    let mixer;
    let abrirAction;
    let cerrarAction;
    let isOpen = false;

    loader.load(
      "/model3d/eric2.glb",
      (gltf) => {
        model = gltf.scene;
        scene.add(model);

        if (gltf.animations?.length > 0) {
          mixer = new THREE.AnimationMixer(model);

          // Animación inicial "levantar"
          const levantarAnim = gltf.animations.find(a => a.name === "levantar");
          if (levantarAnim) {
            const action = mixer.clipAction(levantarAnim);
            action.setLoop(THREE.LoopOnce, 1);
            action.clampWhenFinished = true;
            
            // Preparar transición a "abrir/cerrar" al terminar
            mixer.addEventListener('finished', () => {
              // Configurar ambas animaciones
              const abrirAnim = gltf.animations.find(a => a.name === "abrir");
              const cerrarAnim = gltf.animations.find(a => a.name === "cerrar");
              
              if (abrirAnim) {
                abrirAction = mixer.clipAction(abrirAnim);
                abrirAction.setLoop(THREE.LoopOnce, 1);
                abrirAction.clampWhenFinished = true;
                abrirAction.enabled = true;
              }
              
              if (cerrarAnim) {
                cerrarAction = mixer.clipAction(cerrarAnim);
                cerrarAction.setLoop(THREE.LoopOnce, 1);
                cerrarAction.clampWhenFinished = true;
                cerrarAction.enabled = true;
              }

            });
            mixer.addEventListener("finished", (event) => {
              event.action.paused = true;
              event.action.time = event.action.getClip().duration - 0.1; // Ajusta al último fotograma sin errores
            });
            
            action.play();
          }

        }
      },
      undefined,
      (error) => console.error("Error loading model:", error)
    );

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      if (mixer) mixer.update(clock.getDelta());
      renderer.render(scene, camera);
    };

    animate();

    const handleClick = () => {
      if (!abrirAction || !cerrarAction) return;
    
      if (isOpen) {
        cerrarAction.reset();
        cerrarAction.play();
        abrirAction.stop();
      } else {
        abrirAction.reset();
        abrirAction.play();
        cerrarAction.stop();
      }
      isOpen = !isOpen;
    };
    

    // Event listeners
    mountRef.current.addEventListener('click', handleClick);
    const handleResize = () => {
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current.removeEventListener('click', handleClick);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default ThreeJSGLTFViewer;