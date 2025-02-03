import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Shape, Image as KonvaImage } from "react-konva";
import PhotoFrame from "../components/PhotoFrame";
import { useNavigate } from "react-router-dom";

const PuzzleJigsaw = ({ handleGameFinish, imageUrl, text, rows, columns }) => {
  const [image, setImage] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [scale, setScale] = useState(1);
  const [snapPieces, setSnapPieces] = useState([]);
  const pieceRefs = useRef({}); // Guarda referencias a los nodos de las piezas
  const navigate = useNavigate();

  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;

    img.onload = () => {
      let newScale;
      if (window.innerWidth < 768) {
        newScale = (window.innerWidth / img.width) * 0.9;
        if(img.height > img.width){
          newScale = window.innerHeight / img.height * 0.6;
        }
      } else {
        const maxSize = window.innerWidth * 0.46;
        if (img.height > img.width) {
          newScale = maxSize / img.height;
        } else {
          newScale = maxSize / img.width;
        }
      }

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
    let targetX;
    let targetY;
    if (window.innerWidth < 768) {
      targetX = window.innerWidth * 0.5 - img.width * newScale * 0.5;
      targetY = window.innerHeight * 0.05;
    } else {
      targetX = window.innerWidth * 0.25 - img.width * newScale * 0.5;
      targetY = window.innerHeight * 0.5 - img.height * newScale * 0.5;
    }
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        newPieces.push({
          id: id.toString(),
          x: targetX + col * pieceWidth,
          y: targetY + row * pieceHeight,
          width: pieceWidth,
          height: pieceHeight,
          row,
          col,
          isDragging: false,
          isCorrectPlace: false,
        });
        newSnapPieces.push({
          id: id.toString(),
          x: targetX + col * pieceWidth,
          y: targetY + row * pieceHeight,
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
    setTimeout(() => scatterPieces(newPieces), 300);
  };

  const scatterPieces = (newPieces) => {
    newPieces.forEach((piece) => {
      const node = pieceRefs.current[piece.id];
      if (node) {
        let randomX;
        let randomY;
        if (window.innerWidth < 768) {
          randomX = Math.random() * (window.innerWidth - piece.width);
          randomY =
          window.innerHeight * 0.6 +
          Math.random() * (window.innerHeight * 0.4 - piece.height);
        } else {
          randomX = window.innerWidth * 0.5 +
          Math.random() * (window.innerWidth * 0.4 - piece.width);
          randomY =
          window.innerHeight * 0.6 +
          Math.random() * (window.innerHeight * 0.3 - piece.height);
        }

        node.to({
          x: randomX,
          y: randomY,
          duration: 0.5,
        });
      }
    });
  };


  

  useEffect(() => {
    const isPuzzleComplete = pieces.every((piece) => piece.isCorrectPlace) && pieces.length > 0;
    if (isPuzzleComplete) {
      handleGameFinish(true);
      setTimeout(() => {
        console.log("Puzzle Complete",isPuzzleComplete);
        console.log("Pieces",pieces);
        navigate("/fireworks");
        const newPieces = pieces.map((piece) => {
          return {
            ...piece,
            isDragging: false,
            isCorrectPlace: false,
          };
        });
        setPieces(newPieces);
      }, 1000);
    }
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
    e.target.getStage().container().style.cursor = 'grabbing';
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
    e.target.getStage().container().style.cursor = 'grab';
    const piece = e.target;
    const tolerance = Math.max(pieces[0].width, pieces[0].height) * 0.18;

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
      new Audio("/assets/pop1.mp3").play();
      e.target.getStage().container().style.cursor = 'default';
      e.target.moveToBottom();
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
  };

  return (
    <>
    <Stage width={window.innerWidth<768?window.innerWidth:window.innerWidth*0.999} height={window.innerHeight}       
    style={{
      // backgroundColor: "#ff0000", // Color de fondo
      backgroundImage: `url('fondo.png')`, // URL de la imagen
      backgroundSize: 'cover', // Ajusta la imagen al tamaño del Stage
      backgroundPosition: 'center', // Centra la imagen
      backgroundRepeat: 'no-repeat', // Evita la repetición de la imagen
    }}
>
      <Layer>
        {snapPieces.map((piece) => (
          <Shape
            key={piece.id}
            id={piece.id}
            piece={piece}
            x={piece.x}
            y={piece.y}
            sceneFunc={drawCustomPiece}
            fill={"#ffe2f0"}
            stroke="#ca7e8e"
            strokeWidth={1}
          />
        ))}
      </Layer>
      <Layer>
        {pieces.map((piece) => (
          <Shape
            key={piece.id}
            id={piece.id}
            piece={piece}
            x={piece.isCorrectPlace ? piece.x : piece.x + 1}
            y={piece.isCorrectPlace ? piece.y : piece.y + 1}
            ref={(node) => (pieceRefs.current[piece.id] = node)}
            sceneFunc={drawCustomPiece}
            fillPatternImage={image}
            fillPatternScale={{
              x: scale,
              y: scale,
            }}
            fillPatternOffset={{
              x: (piece.col * image.width) / columns,
              y: (piece.row * image.height) / rows,
            }}
            draggable={piece.isCorrectPlace ? false : true}
            
            stroke="#000"
            strokeWidth={
              piece.isDragging ? 2.5 : piece.isCorrectPlace ? 0.5 : 2
            }
            
            scaleX={piece.isDragging ? 1.1 : 1}
            scaleY={piece.isDragging ? 1.1 : 1}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onMouseEnter={piece.isCorrectPlace ? (e) => e.target.getStage().container().style.cursor = 'default' : (e) => e.target.getStage().container().style.cursor = 'grab'}
            onMouseLeave={(e) =>  e.target.getStage().container().style.cursor = 'default'}
          />
        ))}
      </Layer>
    </Stage>
    <PhotoFrame
      imageUrl={imageUrl}
      text={text}
    />
    </>
  );
};

export default PuzzleJigsaw;
