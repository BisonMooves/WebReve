import React, { useState, useRef } from 'react';
import { UploadCloud, AlertCircle, Loader2, X, RefreshCw, Crop, Sliders } from 'lucide-react';
import ImageEditorModal from './ImageEditorModal';

export default function ImageUploader({
  value,
  onChange,
  currentImage,
  onImageUploaded,
  label = "PROJECT COVER IMAGE (HIGH QUALITY)"
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadMeta, setUploadMeta] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const fileInputRef = useRef(null);

  const activeValue = value || currentImage || '';

  const triggerChange = (newUrl, meta = null) => {
    if (typeof onChange === 'function') {
      onChange(newUrl);
    }
    if (typeof onImageUploaded === 'function') {
      onImageUploaded(newUrl);
    }
    if (meta) {
      setUploadMeta(meta);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP, SVG, etc.)');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.url) {
          triggerChange(data.url, {
            filename: data.filename || file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            storage: data.storage === 'mongodb_gridfs' ? 'MongoDB GridFS (Lossless)' : 'Direct Stream',
            type: file.type
          });
          return;
        }
      }
      throw new Error(`Upload endpoint returned non-JSON or status ${response.status}`);
    } catch (err) {
      console.warn("Using high-res base64 local fallback:", err.message);
      // Client-side high-res base64 fallback
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          triggerChange(e.target.result, {
            filename: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            storage: 'Local High-Res Asset',
            type: file.type
          });
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2 font-mono text-xs">
      <label className="block font-bold text-[#1A1512]/80 uppercase tracking-wider">
        {label}
      </label>

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* Image Preview or Upload Dropzone */}
      {activeValue ? (
        <div className="border border-[#1A1512]/20 bg-[#F0EBE1] p-3 space-y-3">
          <div className="relative aspect-[16/9] w-full bg-[#1A1512]/5 overflow-hidden border border-[#1A1512]/15 group">
            <img
              src={activeValue}
              alt="Uploaded high-quality preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#1A1512]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 p-4">
              <button
                type="button"
                onClick={() => setIsEditorOpen(true)}
                className="px-3 py-2 bg-[#C1512F] text-white hover:bg-[#1A1512] font-bold text-[10px] tracking-widest uppercase transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>ADJUST & CROP</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-[#F0EBE1] text-[#1A1512] hover:bg-[#1A1512] hover:text-white font-bold text-[10px] tracking-widest uppercase transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>CHANGE</span>
              </button>
              <button
                type="button"
                onClick={() => triggerChange('')}
                className="px-3 py-2 bg-white/20 text-white hover:bg-[#C1512F] font-bold text-[10px] tracking-widest uppercase transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <X className="w-3.5 h-3.5" />
                <span>REMOVE</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#1A1512]/70 pt-1">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-[#1A1512] text-white font-bold uppercase">
                {uploadMeta?.storage || 'STORED ASSET'}
              </span>
              {uploadMeta?.size && <span>{uploadMeta.size}</span>}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditorOpen(true)}
                className="text-[#C1512F] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Crop className="w-3.5 h-3.5" />
                <span>SCALE & FILTERS</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[#1A1512] hover:text-[#C1512F] font-bold underline cursor-pointer"
              >
                REPLACE FILE
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed transition-all p-8 flex flex-col items-center justify-center text-center cursor-pointer ${
            isDragging
              ? 'border-[#C1512F] bg-[#C1512F]/5'
              : 'border-[#1A1512]/25 hover:border-[#1A1512] bg-[#1A1512]/5'
          }`}
        >
          {isUploading ? (
            <div className="space-y-3 py-4 flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-[#C1512F] animate-spin" />
              <div className="font-bold uppercase tracking-widest text-[#1A1512]">
                UPLOADING TO MONGODB GRIDFS...
              </div>
              <p className="text-[10px] text-[#1A1512]/60">
                Streaming full uncompressed resolution into database chunks
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto rounded-none border border-[#1A1512]/20 flex items-center justify-center bg-[#F0EBE1] text-[#1A1512]">
                <UploadCloud className="w-6 h-6 text-[#C1512F]" />
              </div>
              <div>
                <div className="font-bold text-sm uppercase tracking-wider text-[#1A1512]">
                  CLICK TO UPLOAD HIGH-QUALITY IMAGE
                </div>
                <p className="text-[10px] text-[#1A1512]/60 mt-1 uppercase tracking-widest">
                  OR DRAG & DROP MASTER FILE (PNG, JPG, WEBP, SVG UP TO 50MB)
                </p>
              </div>
              <div className="inline-block px-3 py-1 bg-[#1A1512] text-white text-[10px] font-bold uppercase tracking-widest">
                STORED IN MONGODB ATLAS
              </div>
            </div>
          )}
        </div>
      )}

      {uploadError && (
        <div className="flex items-center gap-1.5 text-[#C1512F] text-[10px] font-bold">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Interactive Image Editor Studio Modal */}
      {isEditorOpen && activeValue && (
        <ImageEditorModal
          imageUrl={activeValue}
          onSave={(newUrl) => triggerChange(newUrl)}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
}
