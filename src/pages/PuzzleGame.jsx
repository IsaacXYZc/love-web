import React, { useEffect, useState } from "react";
import { Stage, Layer, Shape, Image as KonvaImage } from "react-konva";

const PuzzleGame = ({ imageUrl, rows, columns }) => {
  const [image, setImage] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (rows <= 0 || columns <= 0) return; // Validación básica

    const img = new window.Image();
    img.src = imageUrl;

    img.onload = () => {
      const scale = Math.min(window.innerWidth / img.width, window.innerHeight / img.height);
      setImage(img);
      setDimensions({ width: img.width * scale, height: img.height * scale });
      generatePuzzlePieces(img, scale);
    };
  }, [imageUrl, rows, columns]);

  const generatePuzzlePieces = (img, scale) => {
    const pieceWidth = (img.width * scale) / columns;
    const pieceHeight = (img.height * scale) / rows;

    const newPieces = [];
    let id = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        newPieces.push({
          id: id.toString(),
          x: col * pieceWidth,
          y: row * pieceHeight,
          width: pieceWidth,
          height: pieceHeight,
          row,
          col,
          isDragging: false,
        });
        id++;
      }
    }
    setPieces(newPieces);
  };

  const drawCustomPiece = (context, shape) => {
    const piece = shape.getAttr("piece");
    const { col, row } = piece;
    const { width, height } = piece;
    const knobSize = Math.min(width, height) / 4;

    context.beginPath();
    context.moveTo(0, 0);

    // Top side
    if (row > 0) {
      context.lineTo(width * 0.4, 0);
      const isInverted = (row + col) % 2 === 0;
      context.bezierCurveTo(
        width * 0.4, isInverted ? knobSize : -knobSize,
        width * 0.6, isInverted ? knobSize : -knobSize,
        width * 0.6, 0
      );
    }
    context.lineTo(width, 0);

    // Right side
    if (col < columns - 1) {
      context.lineTo(width, height * 0.4);
      const isInverted = (row + col) % 2 !== 0;
      context.bezierCurveTo(
        width - (isInverted ? knobSize : -knobSize), height * 0.4,
        width - (isInverted ? knobSize : -knobSize), height * 0.6,
        width, height * 0.6
      );
    }
    context.lineTo(width, height);

    // Bottom side
    if (row < rows - 1) {
      context.lineTo(width * 0.6, height);
      const isInverted = (row + col) % 2 === 0;
      context.bezierCurveTo(
        width * 0.6, height - (isInverted ? knobSize : -knobSize),
        width * 0.4, height - (isInverted ? knobSize : -knobSize),
        width * 0.4, height
      );
    }
    context.lineTo(0, height);

    // Left side
    if (col > 0) {
      context.lineTo(0, height * 0.6);
      const isInverted = (row + col) % 2 !== 0;
      context.bezierCurveTo(
        isInverted ? knobSize : -knobSize, height * 0.6,
        isInverted ? knobSize : -knobSize, height * 0.4,
        0, height * 0.4
      );
    }
    context.closePath();
    context.fillStrokeShape(shape);
  };

  const handleDragStart = (e) => {
    const id = e.target.id();
    setPieces(
      pieces.map((piece) => ({
        ...piece,
        isDragging: piece.id === id,
      }))
    );
  };

  const handleDragEnd = (e) => {
    setPieces(
      pieces.map((piece) => ({
        ...piece,
        isDragging: false,
      }))
    );
  };

  if (!image) return null;

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <KonvaImage
          image={image}
          opacity={0.3}
          width={dimensions.width}
          height={dimensions.height}
          x={(window.innerWidth - dimensions.width) / 2}
          y={(window.innerHeight - dimensions.height) / 2}
        />
        {pieces.map((piece) => (
          <Shape
            key={piece.id}
            id={piece.id}
            piece={piece}
            x={piece.x}
            y={piece.y}
            sceneFunc={drawCustomPiece}
            fillPatternImage={image}
            fillPatternOffset={{ x: piece.x, y: piece.y }}
            draggable
            stroke="#000"
            strokeWidth={1}
            shadowBlur={4}
            shadowOpacity={piece.isDragging ? 0.3 : 0}
            scaleX={piece.isDragging ? 1.1 : 1}
            scaleY={piece.isDragging ? 1.1 : 1}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default PuzzleGame;
