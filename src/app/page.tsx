"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { ERA_DATA, REGION_DATA, ERA_FUN_FACTS } from "@/lib/prompt-data";
import type { Era, Region } from "@/lib/prompt-data";

type Step = "landing" | "region" | "era" | "upload" | "generating" | "result";

const ERAS: Era[] = ["70s", "80s", "90s", "00s", "10s"];
const REGIONS: Region[] = ["east", "west", "south", "midwest", "international"];

function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const w = size === "sm" ? 120 : 160;
  return (
    <Image
      src="/hennessy-logo-white.png"
      alt="Hennessy"
      width={w}
      height={Math.round(w * 0.29)}
      className="mx-auto"
      priority
      unoptimized
    />
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 justify-center">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-300 ${
            i <= current ? "w-6 bg-[var(--color-gold)]" : "w-1.5 bg-white/20"
          }`}
        />
      ))}
    </div>
  );
}

function GeneratingScreen({ era, region }: { era: Era; region: Region | null }) {
  const facts = ERA_FUN_FACTS[era];
  const [factIndex, setFactIndex] = useState(() => Math.floor(Math.random() * facts.length));
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => {
        let next = Math.floor(Math.random() * facts.length);
        while (next === prev && facts.length > 1) {
          next = Math.floor(Math.random() * facts.length);
        }
        return next;
      });
      setFadeKey((k) => k + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [facts]);

  return (
    <div className="fade-in flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
      <Logo size="sm" />
      <div className="mt-10 mb-4">
        <div className="spinner mx-auto" />
      </div>
      <p className="text-sm font-semibold uppercase tracking-wider mb-1">
        Creating your cover
      </p>
      <p className="text-xs text-white/40 max-w-xs mb-8">
        Transforming your photo into a {ERA_DATA[era].label}{" "}
        {region && REGION_DATA[region].label} hip hop album cover.
      </p>

      {/* Cycling fun fact */}
      <div className="max-w-sm mx-auto">
        <p className="text-[10px] text-[var(--color-gold)] uppercase tracking-widest mb-2 font-semibold">
          Did you know?
        </p>
        <p key={fadeKey} className="text-sm text-white/60 leading-relaxed fade-in">
          {facts[factIndex]}
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  const [era, setEra] = useState<Era | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handlePhotoSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPhoto(ev.target?.result as string);
      reader.readAsDataURL(file);
    },
    []
  );

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1024 }, height: { ideal: 1024 } },
      });
      streamRef.current = stream;
      setCameraActive(true);
      // Attach stream after render via effect
    } catch {
      setError("Could not access camera. Please upload a photo instead.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const c = document.createElement("canvas");
    const size = Math.min(video.videoWidth, video.videoHeight);
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    // Center-crop to square
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    c.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      setPhotoFile(file);
      setPhoto(c.toDataURL("image/jpeg", 0.9));
      stopCamera();
    }, "image/jpeg", 0.9);
  }, [stopCamera]);

  // Attach stream to video element when camera becomes active
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  // Cleanup camera on unmount or step change
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Paste image support
  useEffect(() => {
    if (step !== "upload" || photo) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) return;
          setPhotoFile(file);
          const reader = new FileReader();
          reader.onload = (ev) => setPhoto(ev.target?.result as string);
          reader.readAsDataURL(file);
          return;
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [step, photo]);

  const handleGenerate = useCallback(async () => {
    if (!era || !region || !photoFile) return;
    stopCamera();
    setStep("generating");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", photoFile);
      formData.append("era", era);
      formData.append("region", region);

      const res = await fetch("/api/generate", { method: "POST", body: formData });
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned an invalid response. Please try again.");
      }

      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      if (!data.image) {
        throw new Error("No image returned. Please try again.");
      }

      setResult(data.image);
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("upload");
    }
  }, [era, region, photoFile, stopCamera]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const albumImg = new window.Image();
    albumImg.crossOrigin = "anonymous";
    albumImg.onload = () => {
      const size = 1500; // Match overlay dimensions
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(albumImg, 0, 0, size, size);

      // Draw the branded overlay on top
      const overlay = new window.Image();
      overlay.onload = () => {
        ctx.drawImage(overlay, 0, 0, size, size);
        const link = document.createElement("a");
        link.download = `hennessy-album-${era}-${region}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      };
      overlay.src = "/Overlay.png";
    };
    albumImg.src = result;
  }, [result, era, region]);

  const reset = () => {
    // Skip landing if terms already accepted — go straight to region
    if (termsAccepted) {
      setStep("region");
    } else {
      setStep("landing");
    }
    setEra(null);
    setRegion(null);
    setPhoto(null);
    setPhotoFile(null);
    setResult(null);
    setError(null);
  };

  const stepNum =
    step === "landing" ? 0 : step === "region" ? 1 : step === "era" ? 2 : step === "upload" ? 3 : -1;

  return (
    <div className="h-screen bg-[#0d0d0d] text-white flex flex-col overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoSelect}
      />

      {/* ===== LANDING ===== */}
      {step === "landing" && (
        <div className="fade-in flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          <Logo />

          <div className="divider mt-8 mb-6" />

          <h1
            className="text-3xl sm:text-4xl font-bold uppercase tracking-wider leading-tight"
          >
            AI.BUM COVERS
          </h1>

          <p className="text-xs text-[var(--color-muted)] uppercase tracking-[0.2em] mt-2 mb-2">
            Honoring 50 Years of Hip Hop
          </p>

          <p className="text-sm text-white/60 leading-relaxed mt-4 mb-10 max-w-xs">
            Star in your very own Hip Hop album cover with an A.I. generated backdrop.
          </p>

          {/* Terms */}
          <label className="flex items-center gap-3 cursor-pointer mb-8 text-sm text-white/60">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-4 h-4 accent-[var(--color-gold)] rounded"
            />
            <span>
              Accept the <span className="underline text-white/80">Terms and Conditions</span>
            </span>
          </label>

          <button
            className="btn-primary"
            disabled={!termsAccepted}
            onClick={() => setStep("region")}
          >
            Get Started
          </button>
        </div>
      )}

      {/* ===== SELECT REGION ===== */}
      {step === "region" && (
        <div className="fade-in flex-1 flex flex-col px-6 py-4 overflow-y-auto">
          <Logo size="sm" />
          <div className="mt-3 mb-4">
            <StepIndicator current={0} total={4} />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto w-full min-h-0">
            <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider mb-1">
              Select Region
            </h2>

            {region && (
              <div className="fade-in mt-1 mb-3">
                <p className="text-[var(--color-gold)] text-xs font-semibold uppercase tracking-widest mb-1">
                  {REGION_DATA[region].label}
                </p>
                <p className="text-xs text-white/50 leading-relaxed max-w-sm">
                  {REGION_DATA[region].description}
                </p>
              </div>
            )}
            {!region && <div className="mb-3" />}

            <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
              {REGIONS.slice(0, 4).map((r) => (
                <button
                  key={r}
                  className={`pill ${region === r ? "active" : ""}`}
                  onClick={() => setRegion(r)}
                >
                  {REGION_DATA[r].label}
                </button>
              ))}
              <button
                className={`pill col-span-2 ${region === "international" ? "active" : ""}`}
                onClick={() => setRegion("international")}
              >
                {REGION_DATA.international.label}
              </button>
            </div>

            <div className="mt-5 w-full">
              <button
                className="btn-primary"
                disabled={!region}
                onClick={() => setStep("era")}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SELECT ERA ===== */}
      {step === "era" && (
        <div className="fade-in flex-1 flex flex-col px-6 py-4 overflow-y-auto">
          <Logo size="sm" />
          <div className="mt-3 mb-4">
            <StepIndicator current={1} total={4} />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto w-full min-h-0">
            <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider mb-1">
              Select Era
            </h2>

            {era && (
              <div className="fade-in mt-1 mb-3">
                <p className="text-[var(--color-gold)] text-xs font-semibold uppercase tracking-widest mb-1">
                  {ERA_DATA[era].label}
                </p>
                <p className="text-xs text-white/50 leading-relaxed max-w-sm">
                  {ERA_DATA[era].description}
                </p>
              </div>
            )}
            {!era && <div className="mb-3" />}

            <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
              {ERAS.slice(0, 4).map((e) => (
                <button
                  key={e}
                  className={`pill ${era === e ? "active" : ""}`}
                  onClick={() => setEra(e)}
                >
                  {e}
                </button>
              ))}
              <button
                className={`pill col-span-2 ${era === "10s" ? "active" : ""}`}
                onClick={() => setEra("10s")}
              >
                10s
              </button>
            </div>

            <div className="mt-5 w-full flex flex-col gap-2 items-center">
              <button
                className="btn-primary"
                disabled={!era}
                onClick={() => setStep("upload")}
              >
                Continue
              </button>
              <button
                className="text-xs text-white/40 hover:text-white/60 transition-colors"
                onClick={() => setStep("region")}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== UPLOAD PHOTO ===== */}
      {step === "upload" && (
        <div className="fade-in flex-1 flex flex-col px-6 py-4 overflow-y-auto">
          <Logo size="sm" />
          <div className="mt-3 mb-4">
            <StepIndicator current={2} total={4} />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider mb-2">
              Your Photo
            </h2>
            <p className="text-sm text-white/50 mb-6">
              Upload a selfie to be transformed into your album cover.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm w-full max-w-xs">
                {error}
              </div>
            )}

            {photo ? (
              <div className="mb-6">
                <div className="w-40 h-40 sm:w-52 sm:h-52 mx-auto rounded-lg overflow-hidden ring-2 ring-[var(--color-gold)] mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt="Your selfie" className="w-full h-full object-cover" />
                </div>
                <button
                  className="text-xs text-white/40 hover:text-white/60 underline transition-colors"
                  onClick={() => { setPhoto(null); setPhotoFile(null); }}
                >
                  Choose different photo
                </button>
              </div>
            ) : cameraActive ? (
              <div className="mb-6 w-full max-w-xs">
                <div className="aspect-square rounded-lg overflow-hidden ring-2 ring-[var(--color-gold)] mb-3 bg-black relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                </div>
                <div className="flex gap-3 justify-center">
                  <button className="btn-primary !max-w-[160px]" onClick={capturePhoto}>
                    Take Photo
                  </button>
                  <button className="btn-secondary !max-w-[120px]" onClick={stopCamera}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6 w-full max-w-xs flex flex-col gap-3">
                <div
                  className="upload-zone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="mx-auto mb-2 opacity-40">
                    <path d="M18 6v18M10 14l8-8 8 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 28h24" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <p className="text-sm text-white/40">Upload a photo</p>
                  <p className="text-xs text-white/20 mt-1">or paste from clipboard</p>
                </div>
                <button
                  className="btn-secondary"
                  onClick={startCamera}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-60">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    Use Camera
                  </span>
                </button>
              </div>
            )}

            <div className="w-full flex flex-col gap-3 items-center">
              <button
                className="btn-primary"
                disabled={!photo}
                onClick={handleGenerate}
              >
                Generate Cover
              </button>
              <button
                className="text-xs text-white/40 hover:text-white/60 transition-colors"
                onClick={() => setStep("era")}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== GENERATING ===== */}
      {step === "generating" && era && (
        <GeneratingScreen era={era} region={region} />
      )}

      {/* ===== RESULT ===== */}
      {step === "result" && result && (
        <div className="fade-in flex-1 flex flex-col px-4 py-3 min-h-0">
          <Logo size="sm" />
          <div className="mt-2 mb-2">
            <StepIndicator current={3} total={4} />
          </div>

          <h2 className="text-lg font-bold uppercase tracking-wider text-center mb-2">
            Your Cover
          </h2>

          {/* Result image — fills available space */}
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <div className="relative h-full max-h-full" style={{ aspectRatio: "1/1" }}>
              <div className="h-full aspect-square rounded-lg overflow-hidden ring-2 ring-[var(--color-gold)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result} alt="Your album cover" className="w-full h-full object-cover" />
              </div>

              {/* Branded overlay */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Overlay.png"
                alt=""
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-3 w-full max-w-sm mx-auto">
            <button className="btn-primary flex-1 !py-3 !text-xs" onClick={handleDownload}>
              Save
            </button>
            <button className="btn-secondary flex-1 !py-3 !text-xs" onClick={handleGenerate}>
              Regenerate
            </button>
          </div>
          <button
            className="text-xs text-white/40 hover:text-white/60 transition-colors mt-2 text-center"
            onClick={reset}
          >
            Start Over
          </button>
        </div>
      )}

      {/* Footer — shown on inner steps */}
      {stepNum >= 0 && (
        <div className="py-2 text-center flex-shrink-0">
          <p className="text-[10px] text-white/20 uppercase tracking-widest">
            Hennessy {"•"} 50 Years of Hip Hop
          </p>
        </div>
      )}
    </div>
  );
}
