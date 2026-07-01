"use client";

import { useRef } from "react";

interface ImageUploadProps {
  preview: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (file: File) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

export function ImageUpload({
  preview,
  fileInputRef,
  onFileChange,
  onDrop,
}: ImageUploadProps) {
  return (
    <div
      className="w-full min-h-96 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-ring transition-colors"
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => fileInputRef.current?.click()}
    >
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="max-h-[400px] rounded-lg object-contain"
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Drag and drop an image here, or click to select
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, WEBP supported
          </p>
        </>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileChange(file);
        }}
      />
    </div>
  );
}