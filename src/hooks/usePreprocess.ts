// src/hooks/usePreprocess.ts
import { useCallback } from "react";
import type * as ortTypes from "onnxruntime-web";

const ort = (window as any).ort as typeof ortTypes;

// ── Konfigurasi ──────────────────────────────────────────────────────────────
const INPUT_SIZE = 256;

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadHTMLImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Gagal load gambar"));
    img.src = src;
  });
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 1 — GRAYSCALE & OTSU THRESHOLDING INVERSI
// ════════════════════════════════════════════════════════════════════════════

/**
 * Mencari nilai threshold terbaik menggunakan metode Otsu.
 */
function getOtsuThreshold(grayData: Uint8Array): number {
  const hist = new Int32Array(256);
  for (let i = 0; i < grayData.length; i++) {
    hist[grayData[i]]++;
  }

  const total = grayData.length;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let varMax = 0;
  let threshold = 0;

  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    wF = total - wB;
    if (wF === 0) break;

    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;

    const varBetween = wB * wF * (mB - mF) * (mB - mF);
    if (varBetween > varMax) {
      varMax = varBetween;
      threshold = t;
    }
  }
  return threshold;
}

/**
 * Menerapkan Grayscale dan Otsu Inversi.
 * Setara dengan Python:
 * gray = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)
 * _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
 */
export function applyGrayscaleOtsuInvert(imageData: ImageData): ImageData {
  const { width, height, data } = imageData;
  const gray = new Uint8Array(width * height);
  
  // 1. Ekstrak Grayscale (Rumus Luma)
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    gray[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }

  // 2. Kalkulasi Threshold Otsu
  const threshold = getOtsuThreshold(gray);

  // 3. Terapkan Binary Invert (Piksel > threshold jadi 0 (Hitam), sisanya 255 (Putih))
  const outData = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const val = gray[i] > threshold ? 0 : 255; 
    outData[i * 4] = val;     // R
    outData[i * 4 + 1] = val; // G
    outData[i * 4 + 2] = val; // B
    outData[i * 4 + 3] = 255; // Alpha
  }

  return new ImageData(outData, width, height);
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 2 — RESIZE DENGAN ASPECT RATIO + PADDING
// ════════════════════════════════════════════════════════════════════════════

/**
 * Resize proporsional lalu pad ke targetSize×targetSize dengan hitam (pad=0).
 */
export function resizeWithAspectPad(
  srcImageData: ImageData,
  targetSize: number = INPUT_SIZE
): ImageData {
  const srcW = srcImageData.width;
  const srcH = srcImageData.height;

  // Buat canvas temporary untuk menampung gambar dari Otsu
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = srcW;
  tmpCanvas.height = srcH;
  tmpCanvas.getContext("2d")!.putImageData(srcImageData, 0, 0);

  // Kalkulasi skala aspect ratio
  const scale = Math.min(targetSize / srcW, targetSize / srcH);
  const newW  = Math.round(srcW * scale);
  const newH  = Math.round(srcH * scale);

  // Canvas resize dan padding
  const outCanvas = document.createElement("canvas");
  outCanvas.width  = targetSize;
  outCanvas.height = targetSize;
  const outCtx = outCanvas.getContext("2d")!;
  
  // Fill background dengan hitam (Padding)
  outCtx.fillStyle = "#000000"; 
  outCtx.fillRect(0, 0, targetSize, targetSize);
  
  // Aktifkan interpolasi high-quality
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = "high";

  // Kalkulasi jarak agar gambar ada di tengah
  const padLeft = Math.floor((targetSize - newW) / 2);
  const padTop  = Math.floor((targetSize - newH) / 2);

  // Tempelkan gambar ke tengah canvas
  outCtx.drawImage(tmpCanvas, padLeft, padTop, newW, newH);

  return outCtx.getImageData(0, 0, targetSize, targetSize);
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 3 — NORMALISASI + TENSOR
// ════════════════════════════════════════════════════════════════════════════

/**
 * ImageData → ONNX Tensor Float32 [1, 3, 256, 256] format NCHW.
 */
function toOnnxTensor(imageData: ImageData): ortTypes.Tensor {
  const { data, width: W, height: H } = imageData;
  const N = W * H;
  
  // Alokasi memory untuk 3 channel
  const float32 = new Float32Array(3 * N);

  for (let i = 0; i < N; i++) {
    // Karena gambar sudah Grayscale (R=G=B), kita cukup ambil channel Red (R)
    const L = data[i * 4]; 
    
    // Konversi ke rentang 0-1
    const normalizedPixel = L / 255.0;
    
    // Tiru efek x.repeat(3, 1, 1) dengan mengisi 3 channel dengan nilai yang sama
    float32[i]         = normalizedPixel; // Channel 1 (R)
    float32[N + i]     = normalizedPixel; // Channel 2 (G)
    float32[2 * N + i] = normalizedPixel; // Channel 3 (B)
  }

  // Catatan: Jika model Anda "strictly" menolak Tensor float32,
  // ONNX Runtime Web biasanya menangani casting ke fp16 di dalam backend wasm/webgl.
  return new ort.Tensor("float32", float32, [1, 3, H, W]);
}

// ════════════════════════════════════════════════════════════════════════════
// HOOK UTAMA
// ════════════════════════════════════════════════════════════════════════════

export interface PreprocessDebugResult {
  rawImageData: ImageData;
  otsuImageData: ImageData;
  resizedImageData: ImageData;
  tensor: ortTypes.Tensor;
}

export function usePreprocess() {
  const preprocess = useCallback(
    async (imageSource: string): Promise<{ tensor: ortTypes.Tensor; debug: PreprocessDebugResult }> => {
      // 1. Load image
      const img = await loadHTMLImage(imageSource);
      
      // 2. Ekstrak initial ImageData dari gambar asli
      const rawCanvas = document.createElement("canvas");
      rawCanvas.width = img.width;
      rawCanvas.height = img.height;
      const rawCtx = rawCanvas.getContext("2d")!;
      rawCtx.drawImage(img, 0, 0);
      const rawImageData = rawCtx.getImageData(0, 0, img.width, img.height);

      // 3. Terapkan Otsu Thresholding dan Inversi
      const otsuImageData = applyGrayscaleOtsuInvert(rawImageData);

      // 4. Resize Proporsional + Padding
      const resizedImageData = resizeWithAspectPad(otsuImageData, INPUT_SIZE); 

      // 5. Konversi ke Tensor NCHW
      const tensor = toOnnxTensor(resizedImageData);

      // Return tensor beserta object debug jika Anda ingin menampilkannya di UI
      return { 
        tensor, 
        debug: { rawImageData, otsuImageData, resizedImageData, tensor } 
      };
    },
    []
  );

  return { preprocess };
}