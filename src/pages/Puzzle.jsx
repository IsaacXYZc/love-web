import React, { useEffect, useRef, useState } from 'react';

const Puzzle = ({ imageUrl, rows = 4, columns = 5 }) => {
  const canvasRef = useRef(null);
  const [pieces, setPieces] = useState([]);
  const [completedPieces, setCompletedPieces] = useState(0);
  const [image, setImage] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 1024, height: 768 });
  const [dragInfo, setDragInfo] = useState(null);

  // Función para generar los patrones de las piezas (1 para saliente, 0 para entrante)
  const generatePiecesPattern = () => {
    const pattern = [];
    for (let y = 0; y < rows; y++) {
      pattern[y] = [];
      for (let x = 0; x < columns; x++) {
        pattern[y][x] = {
          right: x < columns - 1 ? Math.random() < 0.5 : null,
          bottom: y < rows - 1 ? Math.random() < 0.5 : null,
          left: x > 0 ? !pattern[y][x-1].right : null,
          top: y > 0 ? !pattern[y-1][x].bottom : null
        };
      }
    }
    return pattern;
  };

  // Función para dibujar una pieza con forma de rompecabezas
  const drawPiece = (ctx, piece, pattern, image) => {
    const { width: pieceWidth, height: pieceHeight } = piece;
    const tabSize = Math.min(pieceWidth, pieceHeight) * 0.2;

    ctx.beginPath();
    ctx.moveTo(0, 0);

    // Borde superior
    if (pattern.top !== null) {
      ctx.lineTo(pieceWidth * 0.3, 0);
      if (pattern.top) {
        ctx.bezierCurveTo(
          pieceWidth * 0.35, -tabSize,
          pieceWidth * 0.65, -tabSize,
          pieceWidth * 0.7, 0
        );
      } else {
        ctx.bezierCurveTo(
          pieceWidth * 0.35, tabSize,
          pieceWidth * 0.65, tabSize,
          pieceWidth * 0.7, 0
        );
      }
    }
    ctx.lineTo(pieceWidth, 0);

    // Borde derecho
    if (pattern.right !== null) {
      ctx.lineTo(pieceWidth, pieceHeight * 0.3);
      if (pattern.right) {
        ctx.bezierCurveTo(
          pieceWidth + tabSize, pieceHeight * 0.35,
          pieceWidth + tabSize, pieceHeight * 0.65,
          pieceWidth, pieceHeight * 0.7
        );
      } else {
        ctx.bezierCurveTo(
          pieceWidth - tabSize, pieceHeight * 0.35,
          pieceWidth - tabSize, pieceHeight * 0.65,
          pieceWidth, pieceHeight * 0.7
        );
      }
    }
    ctx.lineTo(pieceWidth, pieceHeight);

    // Borde inferior
    if (pattern.bottom !== null) {
      ctx.lineTo(pieceWidth * 0.7, pieceHeight);
      if (pattern.bottom) {
        ctx.bezierCurveTo(
          pieceWidth * 0.65, pieceHeight + tabSize,
          pieceWidth * 0.35, pieceHeight + tabSize,
          pieceWidth * 0.3, pieceHeight
        );
      } else {
        ctx.bezierCurveTo(
          pieceWidth * 0.65, pieceHeight - tabSize,
          pieceWidth * 0.35, pieceHeight - tabSize,
          pieceWidth * 0.3, pieceHeight
        );
      }
    }
    ctx.lineTo(0, pieceHeight);

    // Borde izquierdo
    if (pattern.left !== null) {
      ctx.lineTo(0, pieceHeight * 0.7);
      if (pattern.left) {
        ctx.bezierCurveTo(
          tabSize, pieceHeight * 0.65,
          tabSize, pieceHeight * 0.35,
          0, pieceHeight * 0.3
        );
      } else {
        ctx.bezierCurveTo(
          -tabSize, pieceHeight * 0.65,
          -tabSize, pieceHeight * 0.35,
          0, pieceHeight * 0.3
        );
      }
    }
    ctx.lineTo(0, 0);

    ctx.closePath();
    ctx.clip();
    
    // Dibuja la parte de la imagen correspondiente a esta pieza
    ctx.drawImage(
      image,
      piece.originX, piece.originY,
      pieceWidth, pieceHeight,
      0, 0,
      pieceWidth, pieceHeight
    );

    // Dibuja el borde de la pieza
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      const pattern = generatePiecesPattern();
      initializePuzzle(img, pattern);
    };
  }, [imageUrl, rows, columns]);

  const initializePuzzle = (img, pattern) => {
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
          isPlaced: false,
          pattern: pattern[y][x]
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
      pieceCanvas.width = piece.width + 20; // Extra space for tabs
      pieceCanvas.height = piece.height + 20;
      const pieceCtx = pieceCanvas.getContext('2d');

      pieceCtx.save();
      pieceCtx.translate(10, 10); // Center the piece in the extra space
      drawPiece(pieceCtx, piece, piece.pattern, image);
      pieceCtx.restore();

      ctx.drawImage(pieceCanvas, piece.x - 10, piece.y - 10);
    });
  }, [pieces, image, dimensions]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find if we clicked on a piece
    const clickedPiece = pieces.findIndex(piece => 
      x >= piece.x - 10 && x <= piece.x + piece.width + 10 &&
      y >= piece.y - 10 && y <= piece.y + piece.height + 10
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
        Rompecabezas ({completedPieces}/{rows * columns})
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

export default Puzzle;