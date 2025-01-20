import React, { useEffect, useRef, useState } from "react";
import { Stage, Container, Shape, Graphics } from "@createjs/easeljs";
import "tailwindcss/tailwind.css";

const Puzzle = ({ imageUrl, rows = 4, columns = 5 }) => {
  const canvasRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = new Stage(canvas);

    const loadImage = () => {
      const image = new Image();
      image.src = imageUrl;
      image.onload = () => {
        createPuzzle(image, stage);
      };
    };

    const createPuzzle = (image, stage) => {
      const pieceWidth = image.width / columns;
      const pieceHeight = image.height / rows;
      let placedPieces = 0;

      // Container to hold puzzle pieces
      const puzzleContainer = new Container();
      stage.addChild(puzzleContainer);

      // Add the background image
      const backgroundImage = new createjs.Bitmap(image);
      backgroundImage.alpha = 0.2;
      backgroundImage.x = (canvas.width - image.width) / 2;
      backgroundImage.y = (canvas.height - image.height) / 2;
      stage.addChild(backgroundImage);

      // Create pieces
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const shape = new Shape();
          const graphics = shape.graphics;

          graphics.beginBitmapFill(image, "no-repeat")
            .drawRect(
              -col * pieceWidth,
              -row * pieceHeight,
              pieceWidth,
              pieceHeight
            );

          shape.setBounds(0, 0, pieceWidth, pieceHeight);
          shape.x = Math.random() * (canvas.width - pieceWidth);
          shape.y = Math.random() * (canvas.height - pieceHeight);

          shape.on("pressmove", (event) => {
            shape.x = event.stageX - pieceWidth / 2;
            shape.y = event.stageY - pieceHeight / 2;
            stage.update();
          });

          shape.on("pressup", () => {
            const targetX = backgroundImage.x + col * pieceWidth;
            const targetY = backgroundImage.y + row * pieceHeight;

            if (
              Math.abs(shape.x - targetX) < 10 &&
              Math.abs(shape.y - targetY) < 10
            ) {
              shape.x = targetX;
              shape.y = targetY;
              shape.mouseEnabled = false;
              placedPieces++;

              setProgress((placedPieces / (rows * columns)) * 100);

              if (placedPieces === rows * columns) {
                alert("Puzzle Completed!");
              }
            }

            stage.update();
          });

          puzzleContainer.addChild(shape);
        }
      }

      stage.update();
    };

    loadImage();

    return () => {
      stage.removeAllChildren();
    };
  }, [imageUrl, rows, columns]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Jigsaw Puzzle</h1>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border rounded-lg shadow-lg bg-white"
          width={800}
          height={600}
        ></canvas>
        <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded shadow text-lg">
          Progress: {progress.toFixed(0)}%
        </div>
      </div>
    </div>
  );
};

export default Puzzle;
