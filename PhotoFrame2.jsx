import React, { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

const PhotoFrame2 = ({ imageUrl, text, x, y, width, height }) => {
  return (
    <div
      className="absolute rotate-[-0.05rad] bg-neutral-100 text-center flex flex-col px-4 pt-4 justify-center items-center shadow-custom-frame border-2 border-r-neutral-400 border-neutral-300 border-l-white border-t-white"
      style={{
        width,
        height,
      }}
    >
      <img
        src={imageUrl}
        alt="Frame Content"
        className=" border-2 border-neutral-400 border-b-gray-300 border-t-white border-r-white inset-shadow-white"
      />
      <div className="mt-2 font-rouge mb-4 text-2xl font-bold text-gray-600">
        {text}
      </div>
    </div>
  );
};

const DraggablePhotoFrame = () => {
  const [frames, setFrames] = useState([
    { id: "1", text: "Photo 1", imageUrl: "https://via.placeholder.com/150", x: 100, y: 100, width: 150, height: 200 },
    { id: "2", text: "Photo 2", imageUrl: "https://via.placeholder.com/150", x: 300, y: 200, width: 150, height: 200 },
  ]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
  
    const items = Array.from(frames);
    const [reorderedItem] = items.splice(result.source.index, 1);
    
    const updatedItem = {
      ...reorderedItem,
      x: result.destination.x,
      y: result.destination.y
    };
    
    items.splice(result.destination.index, 0, updatedItem);
    setFrames(items);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="frames" direction="horizontal">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ position: "relative", height: "100vh", width: "100vw" }}
          >
            {frames.map((frame, index) => (
              <Draggable key={frame.id} draggableId={frame.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      position: "absolute",
                      left: frame.x,
                      top: frame.y,
                    }}
                  >
                    <PhotoFrame2
                      imageUrl={frame.imageUrl}
                      text={frame.text}
                      x={frame.x}
                      y={frame.y}
                      width={frame.width}
                      height={frame.height}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DraggablePhotoFrame;
