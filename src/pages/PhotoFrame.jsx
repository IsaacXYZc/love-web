import React from "react";

const PhotoFrame = ({ imageUrl, text, x, y, width, height }) => {
  return (
    <div
      className="absolute rotate-[-0.05rad] bg-neutral-100 text-center flex flex-col px-4 pt-4 justify-center items-center shadow-custom-frame border-2 border-r-neutral-400 border-neutral-300 border-l-white border-t-white"
      style={{
        left: x,
        top: y,
        width,
        height,
      }}
    >
      <img
        src={imageUrl}
        alt="Frame Content"
        className=" border-2 border-neutral-400 border-b-gray-300 border-t-white border-r-white inset-shadow-white"
      />
      <div className="mt-2  font-rouge mb-4 text-2xl font-bold text-gray-600">{text}</div>
    </div>
  );
};

export default PhotoFrame;
