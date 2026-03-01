"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [cropSize, setCropSize] = useState(200);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setCropPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropPosition.x, y: e.clientY - cropPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current) return;

    const imgRect = imageRef.current.getBoundingClientRect();
    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;

    newX = Math.max(0, Math.min(newX, imgRect.width - cropSize));
    newY = Math.max(0, Math.min(newY, imgRect.height - cropSize));

    setCropPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = () => {
    if (!imageRef.current) return;
    const newSize = Math.max(50, cropSize - 20);
    setCropSize(newSize);
    // Adjust position to keep crop within bounds
    const imgRect = imageRef.current.getBoundingClientRect();
    setCropPosition((prev) => ({
      x: Math.min(prev.x, imgRect.width - newSize),
      y: Math.min(prev.y, imgRect.height - newSize),
    }));
  };

  const zoomOut = () => {
    if (!imageRef.current) return;
    const imgRect = imageRef.current.getBoundingClientRect();
    const maxSize = Math.min(imgRect.width, imgRect.height);
    const newSize = Math.min(maxSize, cropSize + 20);
    setCropSize(newSize);
    // Adjust position to keep crop within bounds
    setCropPosition((prev) => ({
      x: Math.min(prev.x, imgRect.width - newSize),
      y: Math.min(prev.y, imgRect.height - newSize),
    }));
  };

  useEffect(() => {
    if (imageRef.current && image) {
      const img = imageRef.current;
      const minDim = Math.min(img.naturalWidth, img.naturalHeight);
      const displayScale = img.width / img.naturalWidth;
      setCropSize(Math.min(200, minDim * displayScale));
    }
  }, [image]);

  const exportImage = () => {
    if (!image || !imageRef.current) return;

    const img = imageRef.current;
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    const sourceX = cropPosition.x * scaleX;
    const sourceY = cropPosition.y * scaleY;
    const sourceSize = cropSize * scaleX;

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 1024, 1024);

      const tempImg = new Image();
      tempImg.onload = () => {
        ctx.drawImage(tempImg, sourceX, sourceY, sourceSize, sourceSize, 0, 0, 1024, 1024);
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "cropped-1024x1024.png";
        link.click();
      };
      tempImg.src = image;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl font-bold">1024 Square PNG</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
      />

      {image && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-zinc-500">Drag the square to select crop area:</p>
          <div
            ref={containerRef}
            className="relative inline-block cursor-crosshair select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={image}
              alt="Uploaded"
              className="max-w-lg max-h-96 object-contain"
              draggable={false}
            />
            <div
              className="absolute border-2 border-white shadow-lg cursor-move"
              style={{
                left: cropPosition.x,
                top: cropPosition.y,
                width: cropSize,
                height: cropSize,
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
              }}
              onMouseDown={handleMouseDown}
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={zoomIn}
              className="py-2 px-4 rounded-full bg-zinc-200 text-zinc-700 text-sm font-semibold hover:bg-zinc-300"
            >
              Zoom In +
            </button>
            <button
              onClick={zoomOut}
              className="py-2 px-4 rounded-full bg-zinc-200 text-zinc-700 text-sm font-semibold hover:bg-zinc-300"
            >
              Zoom Out -
            </button>
          </div>

          <button
            onClick={exportImage}
            className="py-2 px-4 rounded-full bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700"
          >
            Export PNG (1024x1024)
          </button>
        </div>
      )}
    </main>
  );
}
