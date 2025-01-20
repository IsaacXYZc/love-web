import React, { useEffect, useRef, useState } from 'react';

const PuzzleGame = ({ imageUrl, rows = 4, columns = 5 }) => {
  const canvasRef = useRef(null);
  const [pieces, setPieces] = useState([]);
  const [completedPieces, setCompletedPieces] = useState(0);
  const [image, setImage] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 1024, height: 768 });
  const [dragInfo, setDragInfo] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      initializePuzzle(img);
    };
  }, [imageUrl, rows, columns]);

  const initializePuzzle = (img) => {
    const pieceWidth = Math.round(img.width / columns);
    const pieceHeight = Math.round(img.height / rows);
    const newPieces = [];

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const piece = {
          id: `piece-${y}-${x}`,
          x: Math.random() * (dimensions.width - pieceWidth),
          y: Math.random() * (dimensions.height - pieceHeight),
          originX: x * pieceWidth,
          originY: y * pieceHeight,
          width: pieceWidth,
          height: pieceHeight,
          isPlaced: false
        };
        newPieces.push(piece);
      }
    }
    setPieces(newPieces);
  };

  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#ddd';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw original image with transparency
    const puzzleX = canvas.width/2 - image.width/2;
    const puzzleY = canvas.height/2 - image.height/2;
    ctx.globalAlpha = 0.2;
    ctx.drawImage(image, puzzleX, puzzleY);
    ctx.globalAlpha = 1;

    // Draw each piece
    pieces.forEach(piece => {
      const pieceCanvas = document.createElement('canvas');
      pieceCanvas.width = piece.width;
      pieceCanvas.height = piece.height;
      const pieceCtx = pieceCanvas.getContext('2d');

      pieceCtx.drawImage(
        image,
        piece.originX, piece.originY,
        piece.width, piece.height,
        0, 0,
        piece.width, piece.height
      );

      ctx.drawImage(pieceCanvas, piece.x, piece.y);
    });
  }, [pieces, image, dimensions]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find if we clicked on a piece
    const clickedPiece = pieces.findIndex(piece => 
      x >= piece.x && x <= piece.x + piece.width &&
      y >= piece.y && y <= piece.y + piece.height
    );

    if (clickedPiece !== -1 && !pieces[clickedPiece].isPlaced) {
      setDragInfo({
        pieceIndex: clickedPiece,
        offsetX: x - pieces[clickedPiece].x,
        offsetY: y - pieces[clickedPiece].y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!dragInfo) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPieces = [...pieces];
    newPieces[dragInfo.pieceIndex] = {
      ...newPieces[dragInfo.pieceIndex],
      x: x - dragInfo.offsetX,
      y: y - dragInfo.offsetY
    };
    setPieces(newPieces);
  };

  const handleMouseUp = () => {
    if (!dragInfo) return;

    const piece = pieces[dragInfo.pieceIndex];
    const puzzleX = dimensions.width/2 - image.width/2;
    const puzzleY = dimensions.height/2 - image.height/2;
    const correctX = puzzleX + piece.originX;
    const correctY = puzzleY + piece.originY;
    const threshold = 30;

    if (
      Math.abs(piece.x - correctX) < threshold &&
      Math.abs(piece.y - correctY) < threshold
    ) {
      const newPieces = [...pieces];
      newPieces[dragInfo.pieceIndex] = {
        ...newPieces[dragInfo.pieceIndex],
        x: correctX,
        y: correctY,
        isPlaced: true
      };
      setPieces(newPieces);
      setCompletedPieces(prev => prev + 1);
    }

    setDragInfo(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-4xl mx-auto">
      <div className="text-center mb-4 text-xl font-bold">
        Jigsaw Puzzle ({completedPieces}/{rows * columns})
      </div>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="border border-gray-300 cursor-pointer"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      {completedPieces === rows * columns && (
        <div className="mt-4 text-center text-green-600 text-2xl font-bold">
          ¡Felicitaciones! Has completado el rompecabezas
        </div>
      )}
    </div>
  );
};

export default PuzzleGame;