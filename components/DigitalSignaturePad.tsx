"use client";

import React, { useRef, useState, useEffect } from "react";
import { Pen, Type, RotateCcw, Check, Sparkles } from "lucide-react";

interface DigitalSignaturePadProps {
  onSignatureChange: (signatureDataUrl: string, type: "drawn" | "typed") => void;
  initialName?: string;
}

export function DigitalSignaturePad({ onSignatureChange, initialName = "" }: DigitalSignaturePadProps) {
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState(initialName);
  const [selectedFont, setSelectedFont] = useState<"cursive" | "serif" | "modern">("cursive");
  const [hasDrawn, setHasDrawn] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (initialName && !typedName) {
      setTypedName(initialName);
    }
  }, [initialName]);

  // Handle Typed Signature Export
  useEffect(() => {
    if (mode === "type" && typedName.trim()) {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 160;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "transparent";
        ctx.fillRect(0, 0, 600, 160);

        let fontStyle = "italic 44px 'Brush Script MT', 'Dancing Script', 'Caveat', cursive";
        if (selectedFont === "serif") fontStyle = "italic 40px 'Georgia', 'Playfair Display', serif";
        if (selectedFont === "modern") fontStyle = "36px 'Helvetica Neue', 'Segoe UI', sans-serif";

        ctx.font = fontStyle;
        ctx.fillStyle = "#2dd4bf"; // Teal accent signature color
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(typedName, 300, 80);

        // Add subtle underline
        ctx.strokeStyle = "rgba(45, 212, 191, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(100, 115);
        ctx.lineTo(500, 115);
        ctx.stroke();

        const dataUrl = canvas.toDataURL("image/png");
        onSignatureChange(dataUrl, "typed");
      }
    }
  }, [mode, typedName, selectedFont]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high-DPI screens
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = "#2dd4bf";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  useEffect(() => {
    if (mode === "draw") {
      initCanvas();
    }
  }, [mode]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const { x, y } = getCoordinates(e);
    lastPointRef.current = { x, y };
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastPointRef.current = { x, y };
  };

  const stopDrawing = () => {
    if (isDrawingRef.current && canvasRef.current) {
      isDrawingRef.current = false;
      const dataUrl = canvasRef.current.toDataURL("image/png");
      onSignatureChange(dataUrl, "drawn");
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSignatureChange("", "drawn");
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0b0f17] p-4 shadow-xl">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("draw")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              mode === "draw"
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Pen className="w-3.5 h-3.5" />
            <span>Draw Signature</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("type")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              mode === "type"
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Type Legal Signature</span>
          </button>
        </div>

        {mode === "draw" && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] font-mono text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* DRAW MODE */}
      {mode === "draw" ? (
        <div className="relative">
          <div className="w-full h-36 rounded-xl bg-[#070a12] border border-dashed border-slate-700/80 flex items-center justify-center overflow-hidden relative touch-none cursor-crosshair">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full"
            />

            {!hasDrawn && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-slate-500 text-xs font-mono">
                <span className="flex items-center gap-1.5">
                  <Pen className="w-3.5 h-3.5 text-teal-400/60" />
                  Sign here with mouse, trackpad, or finger
                </span>
              </div>
            )}
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Electronic Signature Standard (E-SIGN Act Compliant)</span>
            <span className={hasDrawn ? "text-emerald-400 font-bold" : "text-amber-400"}>
              {hasDrawn ? "● Signature Captured" : "Waiting for signature"}
            </span>
          </div>
        </div>
      ) : (
        /* TYPE MODE */
        <div className="space-y-3">
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="Type your full legal name..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#070a12] border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-teal-400 font-mono"
          />

          {/* Font Style Options */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedFont("cursive")}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                selectedFont === "cursive"
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                  : "bg-slate-900 border border-slate-800 text-slate-400"
              }`}
            >
              <span className="italic font-serif">Script Cursive</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFont("serif")}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                selectedFont === "serif"
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                  : "bg-slate-900 border border-slate-800 text-slate-400"
              }`}
            >
              <span className="italic font-serif">Executive Serif</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFont("modern")}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                selectedFont === "modern"
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                  : "bg-slate-900 border border-slate-800 text-slate-400"
              }`}
            >
              <span>Modern Clean</span>
            </button>
          </div>

          {/* Signature Live Preview Box */}
          <div className="w-full h-24 rounded-xl bg-[#070a12] border border-slate-800 flex items-center justify-center p-3 relative overflow-hidden">
            {typedName.trim() ? (
              <span
                className={`text-2xl text-teal-300 tracking-wide select-none ${
                  selectedFont === "cursive"
                    ? "italic font-serif font-medium"
                    : selectedFont === "serif"
                    ? "italic font-serif"
                    : "font-sans font-medium"
                }`}
              >
                {typedName}
              </span>
            ) : (
              <span className="text-xs font-mono text-slate-600">Enter name above to generate legal signature</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
