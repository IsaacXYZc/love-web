import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import BlurText from "../components/BlurText";

const Card3d = ({ path, imgUrl }) => {
  const mountRef = useRef(null);
  let abrirAction = useRef(null);
  let currentAction = useRef(null);
  const [showTitle, setShowTitle] = useState(0);

  useEffect(() => {
    const song = new Audio("/assets/song.mp4");
    song.loop = true;
    song.play();
    song.volume = 0.3;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(1, 6, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const mixers = []; // Arreglo para trackear todos los mixers

    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
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
    scene.add(ambientLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;

    const loader = new GLTFLoader();
    let model;
    // let mixer;
    let cerrarAction;
    let canPlayOpenClose = false;

    loader.load(
      path,
      (gltf) => {
        model = gltf.scene;
        if (window.innerWidth < 800) {
          model.scale.set(1.3, 1.3, 0.5);
          model.translateY(-10);
        } else {
          model.scale.set(2, 2, 2);
          model.translateY(-15);
          model.translateX(-6);
        }

        scene.add(model);

        if (gltf.animations?.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          mixers.push(mixer); // Agregar al arreglo

          // Configurar todas las animaciones
          const upAnim = gltf.animations.find((a) => a.name === "Action_up");
          const abrirAnim = gltf.animations.find(
            (a) => a.name === "Action_abrir_Esqueleto"
          );
          const cerrarAnim = gltf.animations.find(
            (a) => a.name === "Action_cerrar"
          );
          console.log(gltf.animations);

          // Configurar animación up inicial
          if (upAnim) {
            const upAction = mixer.clipAction(upAnim);
            upAction.setLoop(THREE.LoopOnce);
            upAction.clampWhenFinished = true;

            // Cuando termine la animación up, permitir abrir/cerrar
            mixer.addEventListener("finished", (e) => {
              if (e.action === upAction) {
                canPlayOpenClose = true;
                mixer.removeEventListener("finished");
              }
            });

            currentAction.current = upAction;
            upAction.play();
          }

          // Configurar animaciones abrir/cerrar
          if (abrirAnim) {
            abrirAction.current = mixer.clipAction(abrirAnim);
            abrirAction.current.setLoop(THREE.LoopOnce);
            abrirAction.current.clampWhenFinished = true;
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

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();

      mixers.forEach((mixer) => mixer.update(delta)); // Actualizar todos los mixers

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleClick = () => {
      if (!abrirAction.current || !cerrarAction || !canPlayOpenClose) return;
      let isOpen = false;
      if(currentAction.current.getClip().name === "Action_abrir_Esqueleto") isOpen = true;

      console.log("Abrir Action", abrirAction.current);


      if(currentAction.current && (currentAction.current.getClip().name === "Action_abrir_Esqueleto" || currentAction.current.getClip().name === "Action_cerrar")) {
        if(currentAction.current.isRunning()) return
      }

      // Detener la animación actual si existe
      if (currentAction.current) {
        console.log("Detener animación actual", currentAction.current.isRunning(), currentAction.current.getClip().name);
        currentAction.current.stop(); // Detener la animación actual
      } 

      if (currentAction.current.isRunning()) {
        console.log("Animación actual ya se está ejecutando");
        return;
      }

      if (isOpen) {
        currentAction.current = cerrarAction;
        cerrarAction.reset();
        cerrarAction.play();
      } else {
        currentAction.current = abrirAction.current;
        abrirAction.current.reset();
        abrirAction.current.play();
      }

      isOpen = !isOpen;
    };

    mountRef.current.addEventListener("click", handleClick);

    const handleResize = () => {
      console.log(
        "Resized to:",
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
      camera.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
    };
    window.addEventListener("resize", handleResize);

    return () => {
      mixers.forEach((mixer) => {
        mixer.stopAllAction();
        mixer.uncacheRoot(mixer.getRoot());
      });
      window.removeEventListener("resize", handleResize);
      mountRef.current.removeEventListener("click", handleClick);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  const handleAnimationComplete = () => {
    setTimeout(() => {
    setShowTitle(2)
    }, 1000);
    const audio = new Audio("/assets/eric_audio.mp3");
    audio.volume = 0.3; // Ajusta el volumen entre 0.0 y 1.0
    audio.play();

    // Reproducir la animación abrir
    console.log("Abrir Actionss", currentAction.current, currentAction.current.getClip().name, currentAction.current.isRunning());
    if (currentAction.current && (currentAction.current.getClip().name === "Action_abrir_Esqueleto" || currentAction.current.isRunning())) return;
    currentAction.current.stop();

    if (abrirAction.current) {
      currentAction.current = abrirAction.current;
      abrirAction.current.reset();
      abrirAction.current.play();
    }
  };

  return (
    <>
      <div className="relative w-full h-screen flex justify-center items-center">
        <img
          src={imgUrl}
          alt="descarga"
          className="absolute top-0 left-0 w-full h-full object-cover blur-[2px]"
        />
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
        ;
      </div>
      <div className="pointer-events-none absolute top-0 left-0 w-full h-full flex justify-center object-cover">
        {
          (showTitle===0)?(<BlurText
            key={1} 
            text={`Siempre es un "te amo"`}
            delay={340}
            animateBy="words"
            direction="top"
            onAnimationComplete={()=>setShowTitle(1)}
            className="text-4xl sm:text-8xl mt-8 sm:mt-12 text-shadow-stroke text-white drop-shadow-lg font-semibold "
          />):( showTitle===1 && <BlurText
            key={2} 
            text="Pero nunca un..."
            delay={340}
            animateBy="words"
            direction="top"
            blur="6px"
            onAnimationComplete={handleAnimationComplete}
            className="text-4xl sm:text-8xl mt-8 sm:mt-12 text-shadow-stroke text-white drop-shadow-lg font-semibold "
          />)
        }
        
      </div>
    </>
  );
};

export default Card3d;
