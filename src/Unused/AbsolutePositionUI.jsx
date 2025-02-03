import React from "react";
import RotatingText from "./RotatingText";
import Magnet from "./Magnet";

const AbsolutePositionUI = () => {
  return (
    <div className="fixed border-4  rounded-xl  border-red-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center p-4">
      <div className="flex flex-row ">
        <p className="text-[2rem]  font-extrabold font-sans text-red-500 mb-4">
          ¿Quieres ser mi San valentin?
        </p>
        {/* <RotatingText
          texts={["Novia", "Polola", "Calabacita", "Natilla con fresas"]}
          mainClassName="px-2 sm:px-2 md:px-3 bg-cyan-300 text-black overflow-hidden  text-[2rem] font-extrabold font-sans py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
          staggerFrom={"last"}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-120%" }}
          staggerDuration={0.025}
          splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          rotationInterval={2000}
        /> */}
      </div>
      <img
        src="https://upload.wikimedia.org/wikipedia/en/7/77/EricCartman.png"
        alt="Imagen"
        className="mb-4"
      />
      <div className="flex gap-4">
        <button className="bg-green-500 shadow-lg hover:bg-red-400 shadow-green-500/50 text-white px-4 py-2 rounded">
          Confirmar
        </button>
        <Magnet padding={500} disabled={false} magnetStrength={1}>
          <button className="bg-green-500 focus:bg-red-400 shadow-lg shadow-green-500/50 text-white px-4 py-2 rounded">
            Clic
          </button>
        </Magnet>
        <button className="bg-red-500 text-white px-4 py-2 rounded">
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default AbsolutePositionUI;
