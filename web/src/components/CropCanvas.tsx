import { useRef, useEffect } from "react";

export function CropCanvas({ image, crop, setCrop }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const cropStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const img = new window.Image();
    img.src = image;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);
    };
  }, [image, crop]);

  function onMouseDown(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    if (
      mouseX >= crop.x &&
      mouseX <= crop.x + crop.w &&
      mouseY >= crop.y &&
      mouseY <= crop.y + crop.h
    ) {
      dragging.current = true;
      dragStart.current = { x: mouseX, y: mouseY };
      cropStart.current = { x: crop.x, y: crop.y };
    }
  }

  function onMouseMove(e) {
    if (!dragging.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const dx = mouseX - dragStart.current.x;
    const dy = mouseY - dragStart.current.y;
    setCrop((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(cropStart.current.x + dx, 800 - prev.w)),
      y: Math.max(0, Math.min(cropStart.current.y + dy, 250 - prev.h)),
    }));
  }

  function onMouseUp() {
    dragging.current = false;
  }

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={250}
      style={{ border: "1px solid #333", maxWidth: "100%", cursor: "move" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    />
  );
}