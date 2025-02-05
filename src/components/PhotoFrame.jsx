import React, { useEffect, useState } from 'react';
import Draggable from 'react-draggable';

const PhotoFrame = ({ imageUrl, text, x , y }) => {
  const [dimentions, setDimentions] = useState({ initialX:"50%", initialY:"10%"});

  useEffect(() => {
    if(window.innerWidth < 768) {
      setDimentions({ initialX:"70%", initialY:"0%"});
    } else {
      setDimentions({ initialX:"55%", initialY:"15%"});
    }
  },[]);
  
  // const handleDrag = (e, data) => {
  // };

  return (
    <div className="rotate-[-0.05rad] pointer-events-none absolute top-0 left-0 w-[97vw] h-[95vh]">
    <Draggable 
      // position={"x:10, y:10"}
      // onDrag={handleDrag}
      axis="both"
      bounds="parent"
      // className="bg-red-600"
      // defaultPosition={{x: 100, y: 100}}
      // nodeRef= "React.Ref<typeof React.Component></typeof>"
      // style={{position: "absolute", left: x, top: y}}
    >
      <div
        className="absolute pointer-events-auto cursor-move max-w-[30vw] sm:max-w-[20vw] z-50 rotate-[-0.05rad] bg-stone-100 text-center flex flex-col p-1.5 justify-center items-center shadow-custom-frame border-2 border-r-neutral-500 border-neutral-300 border-l-white border-t-white"
        style={{
          left: dimentions.initialX,
          top: dimentions.initialY,

        }}
      >
        <img
          src={imageUrl}
          alt="Frame Content"
          className="shadow-inset-light sm:max-h-[35vh] min-w-full object-contain bg-stone-800 pointer-events-none border-2 border-neutral-400 border-b-white border-t-stone-400 border-r-white"
        />
        <div className=" sm:mt-2 font-rouge mb-2 sm:mb-4 text-sm sm:text-2xl font-bold text-stone-800">
          {text}
        </div>
      </div>
    </Draggable>
    </div>
  );
};

export default PhotoFrame;