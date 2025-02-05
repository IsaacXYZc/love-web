import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const TinyCharacter = ({ image, position, delay, redirectUrl, direction, duration, size, dialogImage = "dialog.png",
    dialogDuration = 3000, // Duración de la burbuja en ms
    dialogInterval = 5000,}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (isVisible) {
        let dialogTimer;
      // Iniciar la aparición periódica de la burbuja de diálogo
      setTimeout(()=>{
        dialogTimer = setInterval(() => {
        setShowDialog(true);
        setTimeout(() => setShowDialog(false), dialogDuration); // Ocultar después de `dialogDuration`
      }, dialogInterval)}
      ,duration*1000);

      return () => clearInterval(dialogTimer);
    }
  }, [isVisible, dialogDuration, dialogInterval]);

  const handleClick = () => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  const initialX = direction === "left" ? "-100vw" : "10vw"; // Animación desde la izquierda o derecha

  return (
    isVisible && (
      <div style={{ position: "absolute", top: position.top, left: position.left, transform: "translate(-50%, -50%)", zIndex: 9999 }}>
        {/* Burbuja de diálogo */}
        {showDialog && (
          <motion.img
            src={dialogImage}
            alt="Dialog Bubble"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: -50 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              transform: "translateX(-50%)",
              width: "80px",
              height: "auto",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Personaje */}
        <motion.img
          src={image}
          alt="Tiny Character"
          onClick={handleClick}
          initial={{ x: initialX, opacity: 0 }}
          animate={{ x: "0%", opacity: 1 }}
          transition={{ duration, ease: "easeOut" }}
          style={{
            cursor: "pointer",
            width: size,
            height: "auto",
          }}
        />
      </div>
    )
  );
};

export default TinyCharacter;
