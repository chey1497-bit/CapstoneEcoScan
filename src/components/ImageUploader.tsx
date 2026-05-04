import React, { useCallback, useState } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImagesSelected: (files: File[]) => void;
  compact?: boolean;
}

export function ImageUploader({ onImagesSelected, compact = false }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = (Array.from(e.dataTransfer.files) as File[]).filter(file => file.type.startsWith('image/'));
      if (files.length > 0) {
        onImagesSelected(files);
      }
    }
  }, [onImagesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = (Array.from(e.target.files) as File[]).filter(file => file.type.startsWith('image/'));
      if (files.length > 0) {
        onImagesSelected(files);
      }
    }
  }, [onImagesSelected]);

  return (
    <div
      className={`relative w-full max-w-2xl mx-auto rounded-3xl border-2 border-dashed transition-all duration-200 ease-in-out ${
        isDragging 
          ? 'border-emerald-500 bg-emerald-50' 
          : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Upload images"
      />
      <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8 px-6' : 'py-16 px-6'}`}>
        <div className={`bg-emerald-100 rounded-full mb-4 ${compact ? 'p-3' : 'p-4'}`}>
          <UploadCloud className={`text-emerald-600 ${compact ? 'w-8 h-8' : 'w-10 h-10'}`} />
        </div>
        {compact ? (
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Add more photos</h3>
        ) : (
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Upload photos to analyze</h3>
        )}
        <p className={`text-slate-500 max-w-sm ${compact ? 'mb-4 text-sm' : 'mb-6'}`}>
          Drag and drop images of an outdoor environment, or click to browse your files.
        </p>
        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
          <ImageIcon className="w-4 h-4" />
          <span>Supports JPG, PNG, WebP (Multiple allowed)</span>
        </div>
      </div>
    </div>
  );
}
