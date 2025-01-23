import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PuzzleGame from './pages/PuzzleGame.jsx'
import Puzzle from './pages/Puzzle.jsx'
import PuzzleJigsaw from './pages/PuzzleJigsaw.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    <PuzzleJigsaw imageUrl="https://nexgard.com.au/sites/default/files/2024-02/AdobeStock274064877_360x316.jpeg" rows={10} columns={10} />
    <PuzzleGame imageUrl="https://nexgard.com.au/sites/default/files/2024-02/AdobeStock274064877_360x316.jpeg" rows={2} columns={3} />
    <Puzzle imageUrl="https://nexgard.com.au/sites/default/files/2024-02/AdobeStock274064877_360x316.jpeg" rows={2} columns={2} />
  </StrictMode>,
)
