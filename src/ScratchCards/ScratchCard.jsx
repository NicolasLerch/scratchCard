import { useEffect, useRef, useState } from "react";

const ScratchCard = ({
  brushSize,
  threshold,
  onComplete,
  content,
  coverColor = "gray",
  coverImage,
  onScratchStart,
  onScratchEnd,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // ResizeObserver para detectar cambios en el tamaño del contenedor
  useEffect(() => {
    const resize = () => {
      const { offsetWidth } = containerRef.current;
      setDimensions({
        width: offsetWidth,
        height: offsetWidth * 0.6, // proporción 3:2 por ejemplo
      });
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Paso 1: fondo gris o el color que quieras
    ctx.fillStyle = coverColor;
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Paso 2: dibujar la imagen PNG encima
    if (coverImage) {
      const image = new Image();
      image.src = coverImage;
      image.onload = () => {
        const imgWidth = dimensions.width * 0.5;
        const imgHeight = dimensions.height * 0.25;
        const x = (dimensions.width - imgWidth) / 2;
        const y = (dimensions.height - imgHeight) / 2;
        ctx.drawImage(image, x, y, imgWidth, imgHeight);
      };
    }
  }, [dimensions, coverColor, coverImage]);

  const getPosition = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    draw(e);
    onScratchStart?.();
  };

  const endDrawing = () => {
    setIsDrawing(false);
    checkScratchPercentage();
    onScratchEnd?.();
  };

  const draw = (e) => {
    if (!isDrawing || completed) return;
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPosition(e);

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(
      0,
      0,
      dimensions.width,
      dimensions.height
    );
    let cleared = 0;

    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) cleared++;
    }

    const percent = (cleared / (dimensions.width * dimensions.height)) * 100;
    if (percent > threshold && !completed) {
      setCompleted(true);
      onComplete?.();
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        maxWidth: "400px",
        margin: "0 auto",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: dimensions.height,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 0,
          }}
        >
          {content}
        </div>

        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1,
            cursor: "grab",
          }}
          onMouseDown={startDrawing}
          onTouchStart={startDrawing}
          onMouseUp={endDrawing}
          onTouchEnd={endDrawing}
          onMouseMove={draw}
          onTouchMove={draw}
        />
      </div>
    </div>
  );
};

export default ScratchCard;
