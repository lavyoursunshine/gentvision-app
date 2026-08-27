import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  Pipette, 
  Sparkles, 
  RefreshCw, 
  Sun, 
  SwitchCamera,
  Eye,
  Check
} from 'lucide-react';
import { ColorRGB, ColorAnalysisResult } from '../../types';
import { analyzeSensorColor, rgbToHex } from '../../core/colorimetry';
import { PRESET_SAMPLE_TESTS } from '../../data/sampleData';
import { ResultDetailCard } from './ResultDetailCard';

export const SmartColorAnalyzer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'preset'>('camera');
  const [selectedMeatType, setSelectedMeatType] = useState<'beef' | 'chicken' | 'fish' | 'pork' | 'custom'>('beef');
  
  // White Calibration States
  const [enableWhiteCalibration, setEnableWhiteCalibration] = useState<boolean>(true);
  const [whiteRefColor, setWhiteRefColor] = useState<ColorRGB>({ r: 245, g: 245, b: 245 });
  const [pipetteTarget, setPipetteTarget] = useState<'sensor' | 'white'>('sensor');

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Image & Canvas state
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverColor, setHoverColor] = useState<string | null>(null);
  const [lastRawRgb, setLastRawRgb] = useState<ColorRGB | null>(null);

  // Analysis result state
  const [analysisResult, setAnalysisResult] = useState<ColorAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1080 },
          height: { ideal: 1080 },
          aspectRatio: { ideal: 1.0 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      setCameraError('Akses kamera tidak aktif atau tidak diizinkan. Silakan gunakan tab Upload Foto atau Sampel Preset.');
      setIsCameraActive(false);
    }
  }, [facingMode]);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, startCamera, stopCamera]);

  const toggleCameraFacing = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Perform Analysis with White Reference
  const executeAnalysis = (sensorRgb: ColorRGB, customWhite?: ColorRGB) => {
    setLastRawRgb(sensorRgb);
    setIsAnalyzing(true);
    const whitePoint = enableWhiteCalibration ? (customWhite || whiteRefColor) : undefined;

    setTimeout(() => {
      const result = analyzeSensorColor(sensorRgb, selectedMeatType, whitePoint);
      setAnalysisResult(result);
      setIsAnalyzing(false);
    }, 300);
  };

  // Capture frame from active 1:1 camera and sample circular center ROI (Sensor)
  const captureAndAnalyzeCamera = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = Math.min(video.videoWidth || 600, video.videoHeight || 600);
    canvas.width = size;
    canvas.height = size;

    const offsetX = Math.max(0, ((video.videoWidth || size) - size) / 2);
    const offsetY = Math.max(0, ((video.videoHeight || size) - size) / 2);
    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.14;

    const imgData = ctx.getImageData(Math.round(centerX - radius), Math.round(centerY - radius), Math.round(radius * 2), Math.round(radius * 2));
    let totalR = 0, totalG = 0, totalB = 0, count = 0;

    for (let y = 0; y < radius * 2; y++) {
      for (let x = 0; x < radius * 2; x++) {
        const dx = x - radius;
        const dy = y - radius;
        if (dx * dx + dy * dy <= radius * radius) {
          const idx = (y * Math.round(radius * 2) + x) * 4;
          totalR += imgData.data[idx];
          totalG += imgData.data[idx + 1];
          totalB += imgData.data[idx + 2];
          count++;
        }
      }
    }

    const sensorRgb: ColorRGB = {
      r: Math.round(totalR / Math.max(count, 1)),
      g: Math.round(totalG / Math.max(count, 1)),
      b: Math.round(totalB / Math.max(count, 1)),
    };

    // Sample surrounding white card reference area
    const whiteStartX = Math.round(centerX - radius * 1.5);
    const whiteStartY = Math.max(0, Math.round(centerY - radius * 2.2));
    const whiteWidth = Math.round(radius * 3);
    const whiteHeight = Math.round(radius * 0.6);

    const whiteData = ctx.getImageData(whiteStartX, whiteStartY, whiteWidth, whiteHeight);
    let wTotalR = 0, wTotalG = 0, wTotalB = 0, wCount = 0;

    for (let i = 0; i < whiteData.data.length; i += 4) {
      wTotalR += whiteData.data[i];
      wTotalG += whiteData.data[i + 1];
      wTotalB += whiteData.data[i + 2];
      wCount++;
    }

    const detectedWhite: ColorRGB = {
      r: Math.round(wTotalR / Math.max(wCount, 1)),
      g: Math.round(wTotalG / Math.max(wCount, 1)),
      b: Math.round(wTotalB / Math.max(wCount, 1)),
    };

    setWhiteRefColor(detectedWhite);
    executeAnalysis(sensorRgb, detectedWhite);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setUploadedImageSrc(src);

      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.naturalWidth || 600;
        canvas.height = img.naturalHeight || 600;
        ctx.drawImage(img, 0, 0);

        const startX = Math.round(canvas.width / 2);
        const startY = Math.round(canvas.height / 2);
        const pixel = ctx.getImageData(startX, startY, 1, 1).data;
        const sensorRgb = { r: pixel[0], g: pixel[1], b: pixel[2] };
        
        executeAnalysis(sensorRgb);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Canvas Click for Pipette Sampling
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const sampledRgb: ColorRGB = { r: pixel[0], g: pixel[1], b: pixel[2] };

    if (pipetteTarget === 'white') {
      setWhiteRefColor(sampledRgb);
      setPipetteTarget('sensor');
      if (lastRawRgb) {
        executeAnalysis(lastRawRgb, sampledRgb);
      }
    } else {
      executeAnalysis(sampledRgb, whiteRefColor);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    setHoverColor(rgbToHex({ r: pixel[0], g: pixel[1], b: pixel[2] }));
  };

  return (
    <section id="scanner-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      
      {/* Section Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f0efc0]/80 border border-[#c4cb38]/50 text-[#1e6238] text-xs font-bold shadow-sm">
          <Eye className="w-4 h-4 text-[#70bc2c]" />
          <span>Pemindai Presisi Spektrum Warna Stiker GENT</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          Analisis Kolorimetri Kesegaran Daging
        </h2>
        <p className="max-w-2xl mx-auto text-slate-600 text-xs sm:text-sm">
          Posisikan sensor stiker GENT pada area pemindai bundar dengan kalibrasi titik putih terpadu.
        </p>
      </div>

      {/* Control & Calibration Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#c4cb38]/40 shadow-md space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Mode Selector */}
          <div className="flex bg-[#faf9ea] p-1.5 rounded-2xl border border-[#c4cb38]/30">
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'camera'
                  ? 'bg-[#1e6238] text-white shadow-md shadow-[#1e6238]/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4" />
              Kamera Live (1:1)
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-[#1e6238] text-white shadow-md shadow-[#1e6238]/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload Foto
            </button>
            <button
              onClick={() => setActiveTab('preset')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'preset'
                  ? 'bg-[#1e6238] text-white shadow-md shadow-[#1e6238]/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Sampel Preset Lab
            </button>
          </div>

          {/* Meat Type Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Jenis Sampel:</span>
            <select
              value={selectedMeatType}
              onChange={(e) => setSelectedMeatType(e.target.value as any)}
              className="bg-[#faf9ea] text-slate-800 font-semibold text-xs px-3.5 py-2 rounded-xl border border-[#c4cb38]/40 focus:outline-none focus:border-[#70bc2c] shadow-sm"
            >
              <option value="beef">🥩 Daging Sapi (Beef)</option>
              <option value="chicken">🍗 Daging Ayam (Poultry)</option>
              <option value="fish">🐟 Ikan / Seafood</option>
              <option value="pork">🥓 Daging Lainnya</option>
            </select>
          </div>

          {/* White Color Calibration Toggle */}
          <button
            onClick={() => {
              const nextVal = !enableWhiteCalibration;
              setEnableWhiteCalibration(nextVal);
              if (lastRawRgb) {
                executeAnalysis(lastRawRgb, nextVal ? whiteRefColor : undefined);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              enableWhiteCalibration
                ? 'bg-[#f0efc0] text-[#1e6238] border-[#c4cb38] shadow-sm'
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
            title="Menyesuaikan warna kamera melalui titik putih stiker GENT"
          >
            <Sun className="w-4 h-4 text-[#70bc2c]" />
            <span>{enableWhiteCalibration ? '✓ White Calibration Aktif' : 'White Calibration Off'}</span>
          </button>
        </div>

        {/* White Reference Status Badge & Pipette Mode */}
        {enableWhiteCalibration && (
          <div className="p-3 rounded-2xl bg-[#faf9ea] border border-[#c4cb38]/30 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">Titik Putih Referensi Stiker GENT:</span>
              <div 
                className="w-5 h-5 rounded-md border border-slate-300 shadow-inner" 
                style={{ backgroundColor: rgbToHex(whiteRefColor) }} 
              />
              <span className="font-mono text-slate-800 font-bold">
                RGB({whiteRefColor.r}, {whiteRefColor.g}, {whiteRefColor.b})
              </span>
            </div>

            {activeTab === 'upload' && uploadedImageSrc && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Mode Pipet Klik:</span>
                <button
                  onClick={() => setPipetteTarget('sensor')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    pipetteTarget === 'sensor'
                      ? 'bg-[#1e6238] text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  🎯 Pipet Warna Sensor
                </button>
                <button
                  onClick={() => setPipetteTarget('white')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    pipetteTarget === 'white'
                      ? 'bg-[#9f5472] text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  ⚪ Pipet Titik Putih Stiker
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Main Scanner Viewport & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Scanner Viewport */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#c4cb38]/40 shadow-xl relative space-y-4">
          
          {/* TAB 1: Live Camera Mode (1:1 Ratio + Circular Scan Area) */}
          {activeTab === 'camera' && (
            <div className="space-y-4">
              
              {/* 1:1 Aspect Ratio Container */}
              <div className="relative w-full aspect-square max-w-md mx-auto bg-slate-900 rounded-3xl overflow-hidden border-2 border-slate-200 shadow-inner flex items-center justify-center">
                {isCameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className="w-full h-full object-cover"
                    />

                    {/* Darkened Mask Overlay with Circular Center Hole */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      
                      {/* Outer Card Frame Guide */}
                      <div className="w-[88%] h-[88%] rounded-2xl border-2 border-dashed border-white/50 relative flex items-center justify-center">
                        
                        {/* Top Label */}
                        <div className="absolute top-3 text-[10px] font-bold text-[#1e6238] bg-[#f0efc0]/95 px-3 py-0.5 rounded-full shadow-sm border border-[#c4cb38]/50">
                          ⚪ Area Putih Kartu Stiker
                        </div>

                        {/* Bulat / Circular Scan Target (Sensor Window GENT) */}
                        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 border-[#70bc2c] shadow-[0_0_35px_rgba(112,188,44,0.75)] relative flex items-center justify-center animate-pulse-glow">
                          
                          {/* Inner Target Crosshair */}
                          <div className="w-12 h-12 rounded-full border-2 border-white/80 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-[#70bc2c] shadow-[0_0_10px_#70bc2c]" />
                          </div>

                          {/* Circular Laser Radar Sweep */}
                          <div className="absolute inset-0 rounded-full border-2 border-[#70bc2c]/40 animate-spin" style={{ animationDuration: '4s' }} />

                          {/* Scanner Label Tag */}
                          <div className="absolute -bottom-7 text-[10px] font-mono font-bold text-[#1e6238] bg-white/95 px-3 py-0.5 rounded-full shadow-md border border-[#c4cb38]/50 whitespace-nowrap">
                            Posisikan Sensor Bulat GENT di Sini
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Camera Switch Button */}
                    <button
                      onClick={toggleCameraFacing}
                      className="absolute top-3 right-3 p-2.5 rounded-2xl bg-white/90 hover:bg-white text-slate-800 border border-slate-200 shadow-md backdrop-blur-sm cursor-pointer z-10"
                      title="Ganti Kamera Depan/Belakang"
                    >
                      <SwitchCamera className="w-4 h-4 text-[#1e6238]" />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-3 bg-[#faf9ea] text-slate-800 w-full h-full flex flex-col items-center justify-center">
                    <Camera className="w-12 h-12 text-[#1e6238]/50 mx-auto animate-bounce" />
                    <p className="text-xs sm:text-sm text-slate-600 max-w-sm">
                      {cameraError || 'Menghubungkan ke kamera gawai Anda...'}
                    </p>
                    <button
                      onClick={startCamera}
                      className="px-5 py-2.5 rounded-xl bg-[#1e6238] hover:bg-[#174e2c] text-white text-xs font-bold shadow-md cursor-pointer"
                    >
                      Coba Ulang Kamera
                    </button>
                  </div>
                )}
              </div>

              {/* Capture Button */}
              <button
                onClick={captureAndAnalyzeCamera}
                disabled={!isCameraActive || isAnalyzing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1e6238] to-[#70bc2c] hover:from-[#174e2c] hover:to-[#5ea322] disabled:opacity-50 text-white font-black text-sm sm:text-base shadow-lg shadow-[#1e6238]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Menganalisis & Mengalibrasi Sensor...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    <span>Pindai & Analisis Stiker Bulat Sekarang</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: Upload Mode */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {!uploadedImageSrc ? (
                <label className="border-2 border-dashed border-[#c4cb38] hover:border-[#70bc2c] rounded-3xl p-10 flex flex-col items-center justify-center gap-3 bg-[#faf9ea] hover:bg-[#f0efc0]/40 cursor-pointer transition-all aspect-square max-w-md mx-auto">
                  <div className="p-4 rounded-2xl bg-[#f0efc0] text-[#1e6238]">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="text-center space-y-1">
                    <span className="font-bold text-slate-900 text-sm block">Pilih Foto Kemasan Stiker GENT</span>
                    <span className="text-xs text-slate-500">Mendukung format JPG, PNG, WEBP</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center aspect-square max-w-md mx-auto p-2">
                    <canvas
                      ref={canvasRef}
                      onClick={handleCanvasClick}
                      onMouseMove={handleCanvasMouseMove}
                      className="max-w-full max-h-full object-contain rounded-2xl cursor-crosshair shadow-sm"
                    />
                    
                    {hoverColor && (
                      <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-xl bg-white/95 border border-slate-200 text-xs font-mono font-bold flex items-center gap-2 shadow-lg backdrop-blur-sm">
                        <div 
                          className="w-4 h-4 rounded-full border border-slate-300 shadow-sm" 
                          style={{ backgroundColor: hoverColor }} 
                        />
                        <span className="text-slate-800">{hoverColor}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Pipette className="w-4 h-4 text-[#70bc2c]" />
                      {pipetteTarget === 'white'
                        ? '⚪ Klik area putih pada kartu stiker GENT'
                        : '🎯 Klik lingkaran sensor warna stiker GENT'}
                    </span>
                    <label className="text-[#1e6238] hover:text-[#70bc2c] font-bold cursor-pointer underline">
                      Ganti Foto
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Preset Testing Samples */}
          {activeTab === 'preset' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#f0efc0]/70 rounded-2xl border border-[#c4cb38]/50 text-xs text-[#1e6238] font-semibold">
                Pilih sampel tervalidasi laboratorium untuk menguji respon algoritma analisis kolorimetri secara langsung:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PRESET_SAMPLE_TESTS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedMeatType(preset.meatType);
                      executeAnalysis(preset.rgb);
                    }}
                    className="p-4 rounded-2xl bg-[#faf9ea] hover:bg-white border border-[#c4cb38]/30 hover:border-[#70bc2c] transition-all text-left space-y-3 cursor-pointer group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div 
                        className="w-9 h-9 rounded-full shadow-md border-2 border-white transition-transform group-hover:scale-110" 
                        style={{ backgroundColor: preset.colorHex }} 
                      />
                      <span className="text-[11px] font-mono text-slate-500 font-bold">{preset.colorHex}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#1e6238] transition-colors">
                        {preset.name}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Right Side: Scientific Analysis Result Card */}
        <div className="lg:col-span-6">
          {analysisResult ? (
            <ResultDetailCard
              result={analysisResult}
              onReset={() => {
                setAnalysisResult(null);
                if (activeTab === 'camera') startCamera();
              }}
            />
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-[#c4cb38]/40 text-center space-y-4 flex flex-col items-center justify-center min-h-[380px] shadow-xl">
              <div className="w-16 h-16 rounded-full bg-[#f0efc0] border border-[#c4cb38]/50 flex items-center justify-center shadow-sm">
                <Eye className="w-8 h-8 text-[#1e6238] animate-pulse" />
              </div>
              <div>
                <h3 className="text-slate-900 font-extrabold text-base">Siap Menganalisis Sensor GENT</h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                  Posisikan stiker pada kamera 1:1 bulat di samping atau pilih sampel preset untuk mendapatkan diagnosis kimiawi pH & TVB-N seketika.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </section>
  );
};
