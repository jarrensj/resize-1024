"use client";

import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [resizedImage, setResizedImage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImage(dataUrl);
        resizeImage(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const resizeImage = (dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 1024, 1024);

        const scale = Math.min(1024 / img.width, 1024 / img.height);
        const newWidth = img.width * scale;
        const newHeight = img.height * scale;
        const x = (1024 - newWidth) / 2;
        const y = (1024 - newHeight) / 2;

        ctx.drawImage(img, x, y, newWidth, newHeight);
        setResizedImage(canvas.toDataURL());
      }
    };
    img.src = dataUrl;
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
          <p className="text-sm text-zinc-500">Original Image:</p>
          <img src={image} alt="Uploaded" className="max-w-md max-h-96 object-contain" />
        </div>
      )}

      {resizedImage && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-zinc-500">Resized (1024x1024):</p>
          <img src={resizedImage} alt="Resized" className="max-w-md max-h-96 object-contain border" />
        </div>
      )}
    </main>
  );
}
