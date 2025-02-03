//import "./test.js"

import DebugDrawer from "./DebugDrawer.js"
export default async function startApp({renderer3}) {
    let {THREE, scene, camera, controls, ground, flow} = renderer3;


    ground.visible = false;


    let dd = renderer3.dd = new DebugDrawer({
        THREE
    });
    scene.add(dd.lines);


    let minCamDist = 1.;
    let maxCamDist = 130.0;
    let camDist = 1.9;
    let targetCamDist = camera.position.distanceTo(controls.target);
    let clamp=(v,min,max)=>v<min?min:(v>max)?max:v
   // controls.enableZoom = false;
    document.addEventListener('wheel',e=>{
        let dlt = e.deltaY;
        targetCamDist += dlt*.001*camDist; //Scale by distance
        targetCamDist = clamp(targetCamDist,minCamDist,maxCamDist)     
    })
    let activeControls={
        camera,controls
    }

    flow.start(function*(){
        //Make camera chase the 
        while(1){
            if(targetCamDist!==camDist){
                camDist += (targetCamDist-camDist)*.05;
                camDist = clamp(camDist,minCamDist,maxCamDist)
                activeControls.camera.position.sub(activeControls.controls.target).setLength(camDist).add(activeControls.controls.target);
            }
            yield 0;
        }
    })
    return{
        activeControls
    }
}

