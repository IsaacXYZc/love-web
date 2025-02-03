import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import PuzzleJigsaw from "./pages/PuzzleJigsaw";
import Fireworks from "./pages/Fireworks";
import Card3dModel from "./pages/Card3dModel";

function App() {

  const handleGameFinish = (finish) => {
    localStorage.setItem("gameFinish", finish);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <PuzzleJigsaw
              handleGameFinish={handleGameFinish}
              imageUrl={
                "descarga.png"
              }
              text="¡Puzzle Jigsaw!"
              rows={2}
              columns={2}
            />
          }
        />
        <Route path="/fireworks"  element={ localStorage.getItem("gameFinish") ? <Fireworks /> : <Navigate to="/" />} />
        <Route path="/scene1" element={ <Card3dModel path="/model3d/eric.glb" imgUrl="https://images7.alphacoders.com/113/1137187.jpg" />} />
        <Route path="/scene2" element={ <Card3dModel path="/model3d/c_eric.glb" imgUrl="https://images7.alphacoders.com/113/1137187.jpg" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
     
    </Router>
  );
}

export default App;


 /* 
 <Card3dModel
      path="/model3d/eric.glb"
      imgUrl="https://images7.alphacoders.com/113/1137187.jpg" //"southpark.jpg", "fondo.png", "https://images7.alphacoders.com/113/1137187.jpg"
    /> 
*/