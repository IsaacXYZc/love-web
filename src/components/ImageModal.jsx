import React from "react";
import { IoMdDownload } from "react-icons/io";

const ImageModal = ({ open, handleClose, imageUrl, title, description }) => {
  if (!open) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "love-image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 shadow-lg text-center">
        <h2 className="text-4xl font-rouge font-semibold mb-2">{title}</h2>
        <img
          src={imageUrl}
          alt="Imagen Modal"
          className="w-full h-80 object-contain rounded-md"
        />
        <p className="text-gray-600 mt-2 mb-4">{description}</p>
        <div className="flex justify-center flex-row gap-4 ">
          <button
            onClick={handleDownload}
            className="flex flex-row items-center justify-center border-2 border-gray-400 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Descargar Imagen
            <IoMdDownload className="ml-2" />
          </button>
          <button
            onClick={handleClose}
            className="bg-red-400 border-2 border-red-800 text-white px-4 py-2 rounded-md hover:bg-rose-500 transition"
          >
            Ver fuegos artificiales
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
