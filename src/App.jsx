import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import PuzzleJigsaw from "./pages/PuzzleJigsaw";
import Fireworks from "./pages/Fireworks";
import Card3dModel from "./pages/Card3dModel";

function App() {
  const [gameFinished, setGameFinished] = useState(sessionStorage.getItem("gameFinished") || false);

  const handleGameFinish = (finish) => {
    sessionStorage.setItem("gameFinished", finish);
    setGameFinished(finish);  // Actualiza el estado de React
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
            <PuzzleJigsaw
              handleGameFinish={handleGameFinish}
              imageUrl={
                "imagen.png"
              }
              //frase bonita de amor
              text="El amor es la fuerza más humilde, pero la más poderosa de que dispone el mundo."
              rows={1}
              columns={2}
            />
          }
        />
        <Route path="/fireworks"  element={ gameFinished  ? <Fireworks /> : <Navigate to="/" />} />
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