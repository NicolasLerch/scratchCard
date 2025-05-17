import { useEffect, useRef, useState } from "react";

const ScratchCard = ({
  // brushSize,
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

  const { width, height } = dimensions;
  const radius = 8;

  // Paso 0: función para dibujar borde redondeado con sombra
  function drawRoundedRectWithShadow(ctx, width, height, radius) {
    // ctx.shadowColor = "rgba(10, 10, 10, 1)";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(width - radius, 0);
    ctx.quadraticCurveTo(width, 0, width, radius);
    ctx.lineTo(width, height - radius);
    ctx.quadraticCurveTo(width, height, width - radius, height);
    ctx.lineTo(radius, height);
    ctx.quadraticCurveTo(0, height, 0, height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();
    
    // Limpia la sombra para el resto del dibujo
    ctx.shadowColor = "transparent";
    // ctx.shadowColor = "black";
    
  }

  // Limpia el canvas
  ctx.clearRect(0, 0, width, height);

  // Paso 1: fondo gris (con bordes redondeados y sombra)
  ctx.fillStyle = coverColor;
  drawRoundedRectWithShadow(ctx, width, height, radius);

  // Paso 2: dibujar la imagen PNG encima
  if (coverImage) {
    const image = new Image();
    image.src = coverImage;
    image.onload = () => {
      const imgWidth = width * 0.5;
      const imgHeight = height * 0.25;
      const x = (width - imgWidth) / 2;
      const y = (height - imgHeight) / 2;
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

    const dynamicBrushSize = Math.max(10, dimensions.width * 0.05);

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    // ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
    ctx.arc(pos.x, pos.y, dynamicBrushSize / 2, 0, Math.PI * 2);
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
            backgroundColor: "#f090d0", // color rosa claro
            // backgroundColor: "#471017", // color bordo
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
            // boxShadow: "0 0 1px 0.5rem #FFD1F0",
            // boxShadow: "0 0 1px 0.5rem rgb(247, 158, 217)",
             boxShadow: "0 0 1px 0.5rem #471017",
            borderRadius: "10px",
            // border: "15px solid #fff",
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
