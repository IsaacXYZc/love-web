import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import PuzzleJigsaw from "./pages/PuzzleJigsaw.jsx";
import PhotoFrame from "./pages/PhotoFrame.jsx";
import Card3dModel from "./pages/Card3dModel.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <App /> */}
    <PuzzleJigsaw 
        imageUrl="descarga.png"
        rows={4} columns={3} />
    <PhotoFrame
        imageUrl="descarga.png"
        text="Loved you yesterday, love you still, always have, always will."
      />
    
      {/* <Card3dModelpath= "/model3d/eric_v1.2.glb"/> */}
      <Card3dModel
      path = "/model3d/eric.glb" 
      // imgUrl = "southpark.jpg", "fondo.png", "https://images7.alphacoders.com/113/1137187.jpg"
      imgUrl = "https://images7.alphacoders.com/113/1137187.jpg"
      />


  </StrictMode>
);
