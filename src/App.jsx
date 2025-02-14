import { useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from "react-router-dom";
import PuzzleJigsaw from "./pages/PuzzleJigsaw";
import Fireworks from "./pages/Fireworks";
import Card3d from "./pages/Card3d";
import PhotoFrame from "./components/PhotoFrame";
import ImageModal from "./components/ImageModal";

function App() {
  const [gameFinished, setGameFinished] = useState(
    sessionStorage.getItem("gameFinished") || false
  );
  const [open, setOpen] = useState(false);
  const navigate = useNavigate(false);

  const handleCloseModal = () => {
    setOpen(false);
    navigate("/fireworks");
  };

  const handleGameFinish = (finish) => {
    sessionStorage.setItem("gameFinished", finish);
    setGameFinished(finish); // Actualiza el estado de React
  };

  return (
      <Routes>
        <Route
          path="/"
          element={
            <>
              <PuzzleJigsaw
                handleGameFinish={handleGameFinish}
                imageUrl={"imagen.webp"}
                //frase bonita de amor
                // text="El amor es la fuerza más humilde, pero la más poderosa de que dispone el mundo."
                //rows={6} columns={8} // alto - ancho
                 rows={1}
                 columns={2} // alto- ancho
                openModal={setOpen}
              />
              <PhotoFrame
                imageUrl={"imagen.webp"}
                text="No puedo maginar un mundo en el que no estes tú"
              />
              <ImageModal
                open={open}
                handleClose={handleCloseModal}
                imageUrl={"imagen.webp"}
                text="El amor es la fuerza más humilde, pero la más poderosa de que dispone el mundo."
                title="🎉 Felicidades Nath, My beloved! 🎉"
                description="Se supone que somos nosotros, pero no tenemos fotos juntos :)"
              />
            </> // emoji de un planeta 
          }
        />
        <Route
          path="/fireworks"
          element={gameFinished ? <Fireworks /> : <Navigate to="/" />}
        />
        <Route
          path="/card"
          element={
            <Card3d path="/model3d/card_eric.glb" imgUrl="southpark.webp" />
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
  );
}

export default App;

/* 
 <Card3d
      path="/model3d/eric.glb"
      imgUrl="https://images7.alphacoders.com/113/1137187.jpg" //"southpark.jpg", "fondo.png", "https://images7.alphacoders.com/113/1137187.jpg"
    /> 
*/
