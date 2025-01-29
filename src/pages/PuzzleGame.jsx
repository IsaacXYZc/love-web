import React, { useEffect, useState } from "react";
import { Stage, Layer, Shape, Image as KonvaImage } from "react-konva";

const PuzzleGame = ({ imageUrl, rows, columns }) => {
  const [image, setImage] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [scale, setScale] = useState(1);
  const [target, setTarget] = useState({ x: 100, y: 100 });
  const [snapPieces, setSnapPieces] = useState([]);
  const [isComplete, setIsComplete] = useState(false);


  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;

    img.onload = () => {
      const newScale = Math.min(
        (window.innerWidth * 0.6) / img.width,
        (window.innerHeight * 0.6) / img.height
      );
      console.log(newScale);
      setScale(newScale);
      setImage(img);
      generatePuzzlePieces(img, newScale);
    };
  }, [imageUrl, rows, columns]);

  const generatePuzzlePieces = (img, newScale) => {
    const pieceWidth = (img.width / columns) * newScale;
    const pieceHeight = (img.height / rows) * newScale;

    const newPieces = [];
    const newSnapPieces = [];

    let id = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        newPieces.push({
          id: id.toString(),
          x: target.x + col * pieceWidth,
          y: target.y + row * pieceHeight,
          width: pieceWidth,
          height: pieceHeight,
          row,
          col,
          isDragging: false,
          isCorrectPlace: false,
        });
        newSnapPieces.push({
          id: id.toString(),
          x: target.x + col * pieceWidth,
          y: target.y + row * pieceHeight,
          width: pieceWidth,
          height: pieceHeight,
          row,
          col,
          // isCorrect: false,
        });
        id++;
      }
    }
    setSnapPieces(newSnapPieces);
    setPieces(newPieces);
  };


  useEffect(() => {
    const isPuzzleComplete = pieces.every((piece) => piece.isCorrectPlace);
    if (isPuzzleComplete) { 
      setIsComplete(true);
      // console.log(isComplete);
    }
    return () => {setIsComplete(false)};
  }, [pieces]);
  
  const drawCustomPiece = (context, shape) => {
    const piece = shape.getAttr("piece");
    const { col, row, width, height } = piece;
    const knobSize = Math.min(width, height) / 3;

    context.beginPath();
    context.moveTo(0, 0);
    //top side
    if (row != 0) {
      context.lineTo(width * 0.4, 0);
      if ((row + col) % 2 === 0) {
        context.bezierCurveTo(
          width * 0.4,
          0,
          width * 0.2,
          knobSize * 0.9,
          width * 0.5,
          knobSize
        );
        context.bezierCurveTo(
          width * 0.5,
          knobSize,
          width * 0.8,
          knobSize * 0.99,
          width * 0.6,
          0
        );
      } else {
        context.bezierCurveTo(
          width * 0.4,
          0,
          width * 0.2,
          -knobSize * 0.9,
          width * 0.5,
          -knobSize
        );
        context.bezierCurveTo(
          width * 0.5,
          -knobSize,
          width * 0.8,
          -knobSize * 0.99,
          width * 0.6,
          0
        );
      }
    }
    context.lineTo(width, 0);

    //right side
    if (col != columns - 1) {
      context.lineTo(width, height * 0.4);
      if ((row + col) % 2 != 0) {
        context.bezierCurveTo(
          width,
          height * 0.4,
          width - knobSize * 0.9,
          height * 0.2,
          width - knobSize,
          height * 0.5
        );
        context.bezierCurveTo(
          width - knobSize,
          height * 0.5,
          width - knobSize,
          height * 0.8,
          width,
          height * 0.6
        );
      } else {
        context.bezierCurveTo(
          width,
          height * 0.4,
          width + knobSize * 0.9,
          height * 0.2,
          width + knobSize,
          height * 0.5
        );
        context.bezierCurveTo(
          width + knobSize,
          height * 0.5,
          width + knobSize,
          height * 0.8,
          width,
          height * 0.6
        );
      }
    }
    context.lineTo(width, height);

    //bottom side
    if (row != rows - 1) {
      context.lineTo(width * 0.6, height);
      if ((row + col) % 2 === 0) {
        context.bezierCurveTo(
          width * 0.6,
          height,
          width * 0.8,
          height - knobSize * 0.9,
          width * 0.5,
          height - knobSize
        );
        context.bezierCurveTo(
          width * 0.5,
          height - knobSize,
          width * 0.2,
          height - knobSize * 0.99,
          width * 0.4,
          height
        );
      } else {
        context.bezierCurveTo(
          width * 0.6,
          height,
          width * 0.8,
          height + knobSize * 0.9,
          width * 0.5,
          height + knobSize
        );
        context.bezierCurveTo(
          width * 0.5,
          height + knobSize,
          width * 0.2,
          height + knobSize * 0.99,
          width * 0.4,
          height
        );
      }
    }
    context.lineTo(0, height);

    //left side
    if (col != 0) {
      context.lineTo(0, height * 0.6);
      if ((row + col) % 2 != 0) {
        context.bezierCurveTo(
          0,
          height * 0.6,
          knobSize * 0.9,
          height * 0.8,
          knobSize,
          height * 0.5
        );
        context.bezierCurveTo(
          knobSize,
          height * 0.5,
          knobSize,
          height * 0.2,
          0,
          height * 0.4
        );
      } else {
        context.bezierCurveTo(
          0,
          height * 0.6,
          -knobSize * 0.9,
          height * 0.8,
          -knobSize,
          height * 0.5
        );
        context.bezierCurveTo(
          -knobSize,
          height * 0.5,
          -knobSize,
          height * 0.2,
          0,
          height * 0.4
        );
      }
    }
    context.lineTo(0, 0);

    context.closePath();
    context.fillStrokeShape(shape);
  };

  if (!image) return null;

  const handleDragStart = (e) => {
    const id = e.target.id();
    e.target.moveToTop();
    setPieces(
      pieces.map((piece) => ({
        ...piece,
        isDragging: piece.id === id,
      }))
    );
  };

  const handleDragEnd = (e) => {
    const piece = e.target;
    const tolerance = 20;
  
    // Obtenemos la pieza correspondiente en snapPieces
    const snapPiece = snapPieces[e.target.id()];
  
    // Comprobamos si la pieza está en el rango de tolerancia
    if (
      snapPiece.x - tolerance < piece.x() &&
      snapPiece.x + tolerance > piece.x() &&
      snapPiece.y - tolerance < piece.y() &&
      snapPiece.y + tolerance > piece.y()
    ) {
      // Si está dentro del rango de tolerancia, actualizamos las coordenadas
      console.log("Correcto");
      setPieces(
        pieces.map((p) =>
          p.id === piece.id()
            ? {
                ...p,
                x: snapPiece.x,
                y: snapPiece.y,
                isDragging: false,
                isCorrectPlace: true, // Marcamos como correcta
              }
            : p
        )
      );
      
    } else {
      // Si no se encuentra en el rango, simplemente se detiene el arrastre
      setPieces(
        pieces.map((p) =>
          p.id === piece.id() ? { ...p, isDragging: false } : p
        )
      );
    }
    console.log(pieces[0]);
  };

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        {/* <KonvaImage
          image={image}
          width={image.width * scale}
          height={image.height * scale}
          x={target.x }
          y={target.y }
          opacity={0.3}
        /> */}
        {snapPieces.map((piece) => (
          <Shape
            key={piece.id}
            id={piece.id}
            piece={piece}
            x={piece.x }
            y={piece.y }
            sceneFunc={drawCustomPiece}
            fill={"#ffd1e7"}
            stroke="#ffffff"
            strokeWidth={1}

          />
        ))}
        {pieces.map((piece) => (
          <Shape
            key={piece.id}
            id={piece.id}
            piece={piece}
            x={piece.isCorrectPlace ? piece.x: piece.x + 1}
            y={piece.isCorrectPlace ? piece.y: piece.y + 1}
            sceneFunc={drawCustomPiece}
            fillPatternImage={image}
            fillPatternScale={{
              x: scale,
              y: scale,
            }}
            fillPatternOffset={{x: piece.col * image.width / columns, y: piece.row * image.height / rows }}
            draggable = {piece.isCorrectPlace ? false : true}
            stroke="#000"
            strokeWidth={piece.isDragging ? 2 : (piece.isCorrectPlace ? 0.5 : 1.5)}
            scaleX={piece.isDragging ? 1.05 : 1}
            scaleY={piece.isDragging ? 1.05 : 1}
            // shadowOffsetX={piece.isDragging ? 10 : 5}
            // shadowOffsetY={piece.isDragging ? 10 : 5}
            // shadowBlur={piece.isDragging ? 10 : 5}
            // shadowOpacity={piece.isDragging ? 0.6 : 0}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))}
        
      </Layer>
    </Stage>
  );
};

export default PuzzleGame;
