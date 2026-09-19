import React, { useState, useRef, useEffect } from 'react';
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Sparkles,
  Maximize,
  Minimize,
  Check,
  X,
  RefreshCw,
  Move,
  Grid,
  Sun,
  Contrast,
  Palette
} from 'lucide-react';
import { apiUrl } from '../config/api';

const PRESETS = [
  { name: 'NATURAL', brightness: 100, contrast: 100, saturation: 100, sepia: 0 },
  { name: 'OBSIDIAN NOIR', brightness: 110, contrast: 135, saturation: 0, sepia: 0 },
  { name: 'WARM TERRACOTTA', brightness: 105, contrast: 110, saturation: 115, sepia: 25 },
  { name: 'VIVID STUDIO', brightness: 105, contrast: 120, saturation: 140, sepia: 0 },
  { name: 'MUTED LUXURY', brightness: 100, contrast: 95, saturation: 65, sepia: 10 },
  { name: 'HIGH CONTRAST', brightness: 100, contrast: 150, saturation: 110, sepia: 0 }
];

const ASPECT_RATIOS = [
  { label: '16:10 (CASE STUDY)', value: 16 / 10 },
  { label: '16:9 (CINEMA)', value: 16 / 9 },
  { label: '4:3 (STANDARD)', value: 4 / 3 },
  { label: '1:1 (SQUARE)', value: 1 },
  { label: 'ORIGINAL', value: null }
];

export default function ImageEditorModal({ imageUrl, onSave, onClose }) {
  const [activeTab, setActiveTab] = useState('transform'); // 'transform' | 'adjust' | 'presets'
  
  // Transform State
  const [zoom, setZoom] = useState(1); // 0.2 to 3.0 (minimizing & magnifying)
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = useState(16 / 10);
  const [showGrid, setShowGrid] = useState(true);

  // Adjustment State
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [sepia, setSepia] = useState(0);
  const [activePreset, setActivePreset] = useState('NATURAL');

  // Drag interaction state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Mouse pan handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setZoom((prev) => Math.min(Math.max(0.2, Number((prev + delta).toFixed(2))), 3.5));
  };

  // Reset to initial
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setPosition({ x: 0, y: 0 });
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setSepia(0);
    setActivePreset('NATURAL');
  };

  // Fit to frame (Minimize image to show entire bounds)
  const handleFitToFrame = () => {
    setZoom(0.65);
    setPosition({ x: 0, y: 0 });
  };

  // Fill frame
  const handleFillFrame = () => {
    setZoom(1.2);
    setPosition({ x: 0, y: 0 });
  };

  // Apply Preset
  const applyPreset = (preset) => {
    setActivePreset(preset.name);
    setBrightness(preset.brightness);
    setContrast(preset.contrast);
    setSaturation(preset.saturation);
    setSepia(preset.sepia);
  };

  // High-Resolution Canvas Rendering & Export
  const handleApplyAndExport = async () => {
    if (!imageUrl) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Target canvas dimensions (Full High Definition Resolution)
      const targetWidth = 1920;
      const targetHeight = aspectRatio ? Math.round(1920 / aspectRatio) : Math.round((1920 * img.height) / img.width);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      // Clear & fill background (Cream / Warm Editorial)
      ctx.fillStyle = '#1A1512';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Apply CSS Filters directly on 2D context
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%)`;

      ctx.save();

      // Translate to canvas center
      ctx.translate(targetWidth / 2 + position.x * 2.5, targetHeight / 2 + position.y * 2.5);

      // Rotate
      ctx.rotate((rotation * Math.PI) / 180);

      // Scale / Zoom and Flips
      const scaleX = (flipH ? -1 : 1) * zoom;
      const scaleY = (flipV ? -1 : 1) * zoom;
      ctx.scale(scaleX, scaleY);

      // Draw image centered
      const drawWidth = targetWidth;
      const drawHeight = (targetWidth * img.height) / img.width;
      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

      ctx.restore();

      // Convert canvas to blob & upload to MongoDB
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            throw new Error('Canvas export failed');
          }

          try {
            const formData = new FormData();
            formData.append('image', blob, `edited-${Date.now()}.webp`);

            const res = await fetch(apiUrl('/api/upload'), {
              method: 'POST',
              body: formData
            });

            if (res.ok) {
              const data = await res.json();
              if (data.url) {
                onSave(data.url);
                onClose();
                return;
              }
            }
          } catch (uploadErr) {
            console.warn('Direct upload fallback to base64:', uploadErr);
          }

          // Fallback to high-res data URL if offline
          const dataUrl = canvas.toDataURL('image/webp', 0.95);
          onSave(dataUrl);
          onClose();
        },
        'image/webp',
        0.95
      );
    } catch (err) {
      console.error('Error exporting edited image:', err);
      alert('Failed to process image edits. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // CSS Filter string for live preview
  const filterStyle = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%)`;
  const transformStyle = `translate(${position.x}px, ${position.y}px) scale(${flipH ? -zoom : zoom}, ${flipV ? -zoom : zoom}) rotate(${rotation}deg)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-[#1A1512]/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#F0EBE1] border-2 border-[#1A1512] max-w-5xl w-full flex flex-col my-auto max-h-[95vh] shadow-2xl rounded-none font-sans overflow-hidden">
        
        {/* Top Studio Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#1A1512] text-white border-b border-[#1A1512]">
          <div className="flex items-center gap-3">
            <Crop className="w-5 h-5 text-[#C1512F]" />
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
              IMAGE STUDIO & ADJUSTER
            </h2>
            <span className="hidden sm:inline-block font-mono text-[10px] font-bold px-2 py-0.5 bg-white/10 text-white/80">
              HIGH QUALITY • 100% LOSSLESS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="hidden md:flex items-center gap-1.5 font-mono text-xs font-bold text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Content Grid */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Main Interactive Viewport / Canvas */}
          <div className="flex-1 bg-[#1A1512] relative flex items-center justify-center p-4 sm:p-8 select-none min-h-[360px] sm:min-h-[440px] overflow-hidden">
            
            {/* Viewport Framing Container */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              style={{
                aspectRatio: aspectRatio || 'auto',
                maxWidth: '100%',
                maxHeight: '100%',
                width: aspectRatio ? '580px' : 'auto',
                height: aspectRatio ? 'auto' : '360px'
              }}
              className="relative overflow-hidden border-2 border-[#C1512F] shadow-2xl bg-[#0B0908] cursor-grab active:cursor-grabbing flex items-center justify-center"
            >
              {/* Image with live transforms & filters */}
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Studio adjust preview"
                draggable={false}
                style={{
                  transform: transformStyle,
                  filter: filterStyle,
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out, filter 0.15s ease-out'
                }}
                className="max-w-full max-h-full object-contain pointer-events-none origin-center"
              />

              {/* Rule of Thirds Grid Overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
                  <div className="border-r border-b border-white/15" />
                  <div className="border-r border-b border-white/15" />
                  <div className="border-b border-white/15" />
                  <div className="border-r border-b border-white/15" />
                  <div className="border-r border-b border-white/15" />
                  <div className="border-b border-white/15" />
                  <div className="border-r border-white/15" />
                  <div className="border-r border-white/15" />
                  <div />
                </div>
              )}

              {/* Live Zoom / Position Badge */}
              <div className="absolute bottom-2 left-2 bg-[#1A1512]/80 backdrop-blur-xs text-white font-mono text-[10px] px-2 py-0.5 border border-white/10 pointer-events-none">
                ZOOM: {Math.round(zoom * 100)}% {rotation !== 0 && `• ${rotation}°`}
              </div>
            </div>

            {/* Quick Canvas Viewport Floating Controls */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-[#1A1512]/90 border border-white/15 p-1 font-mono text-xs">
              <button
                type="button"
                onClick={handleFitToFrame}
                className="px-2 py-1 hover:bg-white/15 text-white flex items-center gap-1 text-[10px] font-bold tracking-wider cursor-pointer"
                title="Minimize / Fit image to frame"
              >
                <Minimize className="w-3 h-3 text-[#C1512F]" />
                <span>FIT</span>
              </button>
              <button
                type="button"
                onClick={handleFillFrame}
                className="px-2 py-1 hover:bg-white/15 text-white flex items-center gap-1 text-[10px] font-bold tracking-wider cursor-pointer"
                title="Fill frame"
              >
                <Maximize className="w-3 h-3 text-[#C1512F]" />
                <span>FILL</span>
              </button>
              <button
                type="button"
                onClick={() => setShowGrid(!showGrid)}
                className={`p-1.5 transition-colors cursor-pointer ${showGrid ? 'bg-[#C1512F] text-white' : 'text-white/60 hover:text-white'}`}
                title="Toggle alignment grid"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Controls Panel */}
          <div className="w-full lg:w-80 bg-[#F0EBE1] border-t lg:border-t-0 lg:border-l border-[#1A1512]/15 flex flex-col justify-between">
            
            {/* Control Tabs */}
            <div className="flex border-b border-[#1A1512]/15 font-mono text-[11px] font-bold tracking-widest">
              <button
                onClick={() => setActiveTab('transform')}
                className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
                  activeTab === 'transform'
                    ? 'bg-[#1A1512] text-white'
                    : 'text-[#1A1512]/70 hover:bg-[#1A1512]/5 hover:text-[#1A1512]'
                }`}
              >
                TRANSFORM
              </button>
              <button
                onClick={() => setActiveTab('adjust')}
                className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
                  activeTab === 'adjust'
                    ? 'bg-[#1A1512] text-white'
                    : 'text-[#1A1512]/70 hover:bg-[#1A1512]/5 hover:text-[#1A1512]'
                }`}
              >
                ADJUST
              </button>
              <button
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
                  activeTab === 'presets'
                    ? 'bg-[#1A1512] text-white'
                    : 'text-[#1A1512]/70 hover:bg-[#1A1512]/5 hover:text-[#1A1512]'
                }`}
              >
                PRESETS
              </button>
            </div>

            {/* Tab Panes */}
            <div className="p-5 space-y-6 overflow-y-auto flex-1 font-mono text-xs">
              
              {/* TAB 1: TRANSFORM (Zoom, Scale, Minimize, Rotate, Aspect Ratio) */}
              {activeTab === 'transform' && (
                <div className="space-y-5">
                  {/* Zoom / Scale Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#1A1512]/80">
                      <span>SCALE / ZOOM ({Math.round(zoom * 100)}%)</span>
                      <span className="text-[10px] text-[#C1512F]">0.2X — 3.5X</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.max(0.2, Number((z - 0.1).toFixed(2))))}
                        className="p-1 border border-[#1A1512]/20 hover:bg-[#1A1512] hover:text-white cursor-pointer"
                        title="Minimize / Zoom Out"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="range"
                        min="0.2"
                        max="3.5"
                        step="0.05"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="flex-1 accent-[#C1512F] cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.min(3.5, Number((z + 0.1).toFixed(2))))}
                        className="p-1 border border-[#1A1512]/20 hover:bg-[#1A1512] hover:text-white cursor-pointer"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Rotate & Flip Actions */}
                  <div className="space-y-2">
                    <span className="font-bold text-[11px] text-[#1A1512]/80 uppercase block">
                      ORIENTATION & ROTATION
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                        className="p-2 border border-[#1A1512]/20 hover:bg-[#1A1512] hover:text-white flex flex-col items-center gap-1 text-[9px] font-bold uppercase transition-colors cursor-pointer"
                        title="Rotate 90° CCW"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>-90°</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRotation((r) => (r + 90) % 360)}
                        className="p-2 border border-[#1A1512]/20 hover:bg-[#1A1512] hover:text-white flex flex-col items-center gap-1 text-[9px] font-bold uppercase transition-colors cursor-pointer"
                        title="Rotate 90° CW"
                      >
                        <RotateCw className="w-4 h-4" />
                        <span>+90°</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFlipH(!flipH)}
                        className={`p-2 border transition-colors flex flex-col items-center gap-1 text-[9px] font-bold uppercase cursor-pointer ${
                          flipH
                            ? 'bg-[#C1512F] text-white border-[#C1512F]'
                            : 'border-[#1A1512]/20 hover:bg-[#1A1512] hover:text-white'
                        }`}
                        title="Flip Horizontal"
                      >
                        <FlipHorizontal className="w-4 h-4" />
                        <span>FLIP H</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFlipV(!flipV)}
                        className={`p-2 border transition-colors flex flex-col items-center gap-1 text-[9px] font-bold uppercase cursor-pointer ${
                          flipV
                            ? 'bg-[#C1512F] text-white border-[#C1512F]'
                            : 'border-[#1A1512]/20 hover:bg-[#1A1512] hover:text-white'
                        }`}
                        title="Flip Vertical"
                      >
                        <FlipVertical className="w-4 h-4" />
                        <span>FLIP V</span>
                      </button>
                    </div>
                  </div>

                  {/* Aspect Ratio Framing Presets */}
                  <div className="space-y-2">
                    <span className="font-bold text-[11px] text-[#1A1512]/80 uppercase block">
                      ASPECT RATIO CROP PRESETS
                    </span>
                    <div className="space-y-1">
                      {ASPECT_RATIOS.map((ratio) => (
                        <button
                          key={ratio.label}
                          type="button"
                          onClick={() => setAspectRatio(ratio.value)}
                          className={`w-full py-2 px-3 text-left border flex items-center justify-between text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                            aspectRatio === ratio.value
                              ? 'bg-[#1A1512] text-white border-[#1A1512]'
                              : 'border-[#1A1512]/15 hover:bg-[#1A1512]/10 text-[#1A1512]'
                          }`}
                        >
                          <span>{ratio.label}</span>
                          {aspectRatio === ratio.value && <Check className="w-3.5 h-3.5 text-[#C1512F]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#1A1512]/5 border border-[#1A1512]/10 text-[10px] text-[#1A1512]/60 flex items-center gap-2">
                    <Move className="w-3.5 h-3.5 text-[#C1512F] shrink-0" />
                    <span>Tip: Click and drag the image in the canvas to reposition.</span>
                  </div>
                </div>
              )}

              {/* TAB 2: ADJUST (Brightness, Contrast, Saturation, Sepia) */}
              {activeTab === 'adjust' && (
                <div className="space-y-5">
                  {/* Brightness */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#1A1512]/80">
                      <div className="flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-[#C1512F]" />
                        <span>BRIGHTNESS</span>
                      </div>
                      <span>{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="180"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-[#C1512F] cursor-pointer"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#1A1512]/80">
                      <div className="flex items-center gap-1.5">
                        <Contrast className="w-3.5 h-3.5 text-[#C1512F]" />
                        <span>CONTRAST</span>
                      </div>
                      <span>{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="180"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-[#C1512F] cursor-pointer"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#1A1512]/80">
                      <div className="flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-[#C1512F]" />
                        <span>SATURATION</span>
                      </div>
                      <span>{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full accent-[#C1512F] cursor-pointer"
                    />
                  </div>

                  {/* Warmth / Sepia */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#1A1512]/80">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#C1512F]" />
                        <span>WARMTH (SEPIA)</span>
                      </div>
                      <span>{sepia}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sepia}
                      onChange={(e) => setSepia(Number(e.target.value))}
                      className="w-full accent-[#C1512F] cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: PRESETS */}
              {activeTab === 'presets' && (
                <div className="space-y-3">
                  <span className="font-bold text-[11px] text-[#1A1512]/80 uppercase block">
                    EDITORIAL COLOR GRADES
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className={`p-3 border text-left flex items-center justify-between transition-colors cursor-pointer ${
                          activePreset === preset.name
                            ? 'bg-[#1A1512] text-white border-[#1A1512]'
                            : 'border-[#1A1512]/15 hover:bg-[#1A1512]/5 text-[#1A1512]'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-xs uppercase">{preset.name}</div>
                          <div className="text-[9px] opacity-60 font-sans">
                            B: {preset.brightness}% • C: {preset.contrast}% • S: {preset.saturation}%
                          </div>
                        </div>
                        {activePreset === preset.name && (
                          <Check className="w-4 h-4 text-[#C1512F]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 border-t border-[#1A1512]/15 bg-[#E8E2D7] flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="w-1/3 py-2.5 border border-[#1A1512] hover:bg-[#1A1512]/10 font-mono text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={handleApplyAndExport}
                disabled={isProcessing}
                className="w-2/3 py-2.5 bg-[#1A1512] text-white hover:bg-[#C1512F] font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#C1512F]" />
                    <span>PROCESSING...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-[#C1512F]" />
                    <span>SAVE EDITS</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
