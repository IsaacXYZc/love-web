import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PuzzleGame from './pages/PuzzleGame.jsx'
import Puzzle from './pages/Puzzle.jsx'
import PuzzleJigsaw from './pages/PuzzleJigsaw.jsx'
import PhotoFrame from './pages/PhotoFrame.jsx'
import PhotoFrame2 from './pages/PhotoFrame2.jsx'
import DraggablePhotoFrame from './pages/PhotoFrame2.jsx'
import ThreeJSGLTFViewer from './pages/ThreeJSFBXViewer.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    {/* <PuzzleJigsaw 
        imageUrl="descarga.png"
        rows={3} columns={3} />
    <PhotoFrame2
        imageUrl="descarga.png"
        text="Loved you yesterday, love you still, always have, always will."
      /> */}
      <ThreeJSGLTFViewer />
  </StrictMode>,
)
