// src/hooks/usePreprocess.ts
import { useCallback } from "react";
import type * as ortTypes from "onnxruntime-web";

const ort = (window as any).ort as typeof ortTypes;

// ── Konfigurasi ──────────────────────────────────────────────────────────────
const INPUT_SIZE    = 256;
const LINE_KERNEL_W = 50; // Lebar kernel horizontal (sama dengan Python)

// ImageNet normalization (sesuai training MobileViT)
const CH_MEAN = [0.485, 0.456, 0.406];
const CH_STD  = [0.229, 0.224, 0.225];

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadHTMLImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => resolve(img);
    img.onerror = () => reject(new Error("Gagal load gambar"));
    img.src = src;
  });
}

/**
 * Konversi gambar → grayscale Uint8Array
 * Setara: Image.open(path).convert('L') di Pillow
 * Formula luminance ITU-R BT.601: 0.299R + 0.587G + 0.114B
 */
function toGrayscale(img: HTMLImageElement): {
  gray: Uint8Array;
  w: number;
  h: number;
} {
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  const canvas = document.createElement("canvas");
  canvas.width  = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(img, 0, 0);
  const { data } = canvas.getContext("2d")!.getImageData(0, 0, w, h);

  const gray = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    gray[i] = Math.round(
      0.299 * data[i * 4] +
      0.587 * data[i * 4 + 1] +
      0.114 * data[i * 4 + 2]
    );
  }
  return { gray, w, h };
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 1 — INVERSI
// ════════════════════════════════════════════════════════════════════════════

/**
 * Menginvert citra jika background putih (kertas).
 *
 * Python:
 *   if np.mean(img) > 127:
 *       img = cv2.bitwise_not(img)
 *
 * Logika: Jika rata-rata piksel > 127 → background terang (putih).
 * Setelah diinvert: kertas jadi hitam, goresan pensil jadi putih (nilai tinggi).
 */
export function invertIfWhiteBackground(gray: Uint8Array): Uint8Array {
  // Hitung mean (setara np.mean)
  let sum = 0;
  for (let i = 0; i < gray.length; i++) sum += gray[i];
  const mean = sum / gray.length;

  // Jika sudah dark background, tidak perlu diinvert
  if (mean <= 127) return new Uint8Array(gray);

  // bitwise_not: 255 - pixel (identik dengan cv2.bitwise_not untuk uint8)
  const inv = new Uint8Array(gray.length);
  for (let i = 0; i < gray.length; i++) inv[i] = 255 - gray[i];
  return inv;
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 2 — KONSTRUKSI CITRA MULTIKANAL
// ════════════════════════════════════════════════════════════════════════════

/**
 * Erosi dengan kernel horizontal 1×kw (sliding-window minimum).
 *
 * Python:
 *   kernel = getStructuringElement(MORPH_RECT, (kw, 1))
 *   cv2.erode(img, kernel)
 *
 * Border mode: REPLICATE — piksel tepi direplikasi ke luar batas.
 */
function erodeH(
  src: Uint8Array,
  w: number,
  h: number,
  kw: number
): Uint8Array {
  const dst  = new Uint8Array(src.length);
  const half = Math.floor(kw / 2);

  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      let min = 255;
      // Clamp ke batas gambar (BORDER_REPLICATE)
      const x0 = Math.max(0, x - half);
      const x1 = Math.min(w - 1, x + half);
      for (let k = x0; k <= x1; k++) {
        const v = src[row + k];
        if (v < min) min = v;
      }
      dst[row + x] = min;
    }
  }
  return dst;
}

/**
 * Dilasi dengan kernel horizontal 1×kw (sliding-window maximum).
 *
 * Python:
 *   cv2.dilate(img, kernel)
 */
function dilateH(
  src: Uint8Array,
  w: number,
  h: number,
  kw: number
): Uint8Array {
  const dst  = new Uint8Array(src.length);
  const half = Math.floor(kw / 2);

  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      let max = 0;
      const x0 = Math.max(0, x - half);
      const x1 = Math.min(w - 1, x + half);
      for (let k = x0; k <= x1; k++) {
        const v = src[row + k];
        if (v > max) max = v;
      }
      dst[row + x] = max;
    }
  }
  return dst;
}

/**
 * Morphological OPEN = Erosi → Dilasi dengan kernel yang sama.
 *
 * Python:
 *   cv2.morphologyEx(img, cv2.MORPH_OPEN, horizontal_kernel)
 *
 * Efek: Hanya piksel yang "bertahan" setelah erosi yang dikembalikan →
 * hanya struktur horizontal panjang (garis buku) yang tersisa.
 */
function morphOpenH(
  src: Uint8Array,
  w: number,
  h: number,
  kw: number
): Uint8Array {
  // MORPH_OPEN = erode dulu, lalu dilate
  return dilateH(erodeH(src, w, h, kw), w, h, kw);
}

/**
 * Memisahkan tulisan dan garis buku ke channel terpisah.
 *
 * Python (preprocess_multichannel):
 *   channel_R = img              → Citra asli (tulisan + garis)
 *   channel_G = detected_lines   → Garis saja (hasil MORPH_OPEN)
 *   channel_B = np.zeros_like()  → Kosong (nol)
 *   merged = cv2.merge([R, G, B])
 *
 * Menerima gray yang sudah diinvert dari Step 1.
 * Return: ImageData RGBA (A=255 untuk kompatibilitas Canvas API).
 */
export function buildMultichannelImage(
  invertedGray: Uint8Array,
  w: number,
  h: number,
  kernelW: number = LINE_KERNEL_W
): ImageData {
  const channelR = invertedGray;                              // Tulisan + Garis
  const channelG = morphOpenH(invertedGray, w, h, kernelW);  // Garis saja
  // channelB = zeros (dikosongkan, tidak ada info)

  const rgba = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4]     = channelR[i]; // R → tulisan + garis (merah secara visual)
    rgba[i * 4 + 1] = channelG[i]; // G → garis buku saja (kuning saat ada R)
    rgba[i * 4 + 2] = 0;           // B → kosong (nol)
    rgba[i * 4 + 3] = 255;         // Alpha → opaque
  }
  return new ImageData(rgba, w, h);
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 3 — RESIZE DENGAN ASPECT RATIO + PADDING
// ════════════════════════════════════════════════════════════════════════════

/**
 * Resize proporsional lalu pad ke targetSize×targetSize dengan hitam (pad=0).
 *
 * Python (resize_with_aspect_and_pad):
 *   scale = min(target/w, target/h)
 *   new_w = round(w * scale)
 *   new_h = round(h * scale)
 *   resized = cv2.resize(img, (new_w, new_h), INTER_AREA)
 *   pad_left = (target - new_w) // 2
 *   pad_top  = (target - new_h) // 2
 *   padded = cv2.copyMakeBorder(..., BORDER_CONSTANT, value=0)
 *
 * Canvas drawImage dengan imageSmoothingQuality='high' ≈ INTER_AREA
 * untuk kasus downscaling (foto → 256px).
 */
export function resizeWithAspectPad(
  imageData: ImageData,
  targetSize: number = INPUT_SIZE
): ImageData {
  const srcW = imageData.width;
  const srcH = imageData.height;

  if (srcW === targetSize && srcH === targetSize) return imageData;

  // Skala agar muat tanpa distorsi (identik dengan Python)
  const scale = Math.min(targetSize / srcW, targetSize / srcH);
  const newW  = Math.round(srcW * scale);
  const newH  = Math.round(srcH * scale);

  // Canvas sumber → gambar multikanal sebelum resize
  const srcCanvas = document.createElement("canvas");
  srcCanvas.width  = srcW;
  srcCanvas.height = srcH;
  srcCanvas.getContext("2d")!.putImageData(imageData, 0, 0);

  // Canvas resize: drawImage melakukan interpolasi bilinear
  const resCanvas = document.createElement("canvas");
  resCanvas.width  = newW;
  resCanvas.height = newH;
  const resCtx = resCanvas.getContext("2d")!;
  resCtx.imageSmoothingEnabled = true;
  resCtx.imageSmoothingQuality = "high";
  resCtx.drawImage(srcCanvas, 0, 0, newW, newH);

  // Padding simetris — rumus identik dengan Python (//) 
  const padLeft = Math.floor((targetSize - newW) / 2); // (target - new_w) // 2
  const padTop  = Math.floor((targetSize - newH) / 2); // (target - new_h) // 2

  // Canvas output: background hitam (pad_value = 0) → gambar di tengah
  const outCanvas = document.createElement("canvas");
  outCanvas.width  = targetSize;
  outCanvas.height = targetSize;
  const outCtx = outCanvas.getContext("2d")!;
  outCtx.fillStyle = "#000000"; // pad_value = 0
  outCtx.fillRect(0, 0, targetSize, targetSize);
  outCtx.drawImage(resCanvas, padLeft, padTop, newW, newH);

  return outCtx.getImageData(0, 0, targetSize, targetSize);
}

// ── Normalisasi + Tensor ──────────────────────────────────────────────────────

/**
 * ImageData RGBA → ONNX Float32 tensor [1, 3, H, W] dalam layout CHW.
 *
 * PyTorch equivalent:
 *   transforms.ToTensor()   → pixel / 255
 *   transforms.Normalize()  → (v - mean) / std
 */
function toOnnxTensor(imageData: ImageData): ortTypes.Tensor {
  const { data, width: W, height: H } = imageData;
  const N = W * H;
  const float32 = new Float32Array(3 * N);

  for (let i = 0; i < N; i++) {
    // 1. Ekstrak R dan G yang sudah dihitung sebelumnya
    const R = data[i * 4];     // Tulisan + Garis
    const G = data[i * 4 + 1]; // Garis saja
    const B = data[i * 4 + 2]; // Selalu 0

    // 2. Tiru efek PIL .convert("L") (Rumus Luma ITU-R 601)
    const L = (R * 0.299) + (G * 0.587) + (B * 0.114);
    
    // 3. Tiru efek x.repeat(3, 1, 1) dan hapus Normalisasi ImageNet
    const normalizedPixel = L / 255.0;
    
    float32[i]         = normalizedPixel; // Channel 1 identik
    float32[N + i]     = normalizedPixel; // Channel 2 identik
    float32[2 * N + i] = normalizedPixel; // Channel 3 identik
  }

  return new ort.Tensor("float32", float32, [1, 3, H, W]);
}

// ════════════════════════════════════════════════════════════════════════════
// HOOK UTAMA
// ════════════════════════════════════════════════════════════════════════════

/** Hasil intermediate preprocessing untuk debugging / visualisasi di UI */
export interface PreprocessDebugResult {
  invertedImageData:    ImageData; // Step 1 result (grayscale inverted)
  multichannelImageData: ImageData; // Step 2 result (R+G+B separated)
  resizedImageData:     ImageData; // Step 3 result (256×256 padded)
  tensor:               ortTypes.Tensor;
}

export function usePreprocess() {
  /**
   * Pipeline utama:
   *   load → grayscale → inversion → multikanal → resize+pad → tensor
   */
  const preprocess = useCallback(
    async (imageSource: string): Promise<ortTypes.Tensor> => {
      const img              = await loadHTMLImage(imageSource);
      const { gray, w, h }   = toGrayscale(img);

      const inverted          = invertIfWhiteBackground(gray);       // Step 1
      const multichannel      = buildMultichannelImage(inverted, w, h); // Step 2
      const resized           = resizeWithAspectPad(multichannel);   // Step 3

      return toOnnxTensor(resized);
    },
    []
  );

  /**
   * Pipeline dengan intermediate output untuk visualisasi/debugging.
   * Bisa ditampilkan di <canvas> element di UI Ionic.
   */
  const preprocessWithDebug = useCallback(
    async (imageSource: string): Promise<PreprocessDebugResult> => {
      const img            = await loadHTMLImage(imageSource);
      const { gray, w, h } = toGrayscale(img);

      // Step 1 — Inversi
      const inverted = invertIfWhiteBackground(gray);
      const invRGBA  = new Uint8ClampedArray(w * h * 4);
      for (let i = 0; i < w * h; i++) {
        invRGBA[i * 4] = invRGBA[i * 4 + 1] = invRGBA[i * 4 + 2] = inverted[i];
        invRGBA[i * 4 + 3] = 255;
      }

      // Step 2 — Multikanal
      const multichannel = buildMultichannelImage(inverted, w, h);

      // Step 3 — Resize + Pad
      const resized = resizeWithAspectPad(multichannel);

      return {
        invertedImageData:     new ImageData(invRGBA, w, h),
        multichannelImageData: multichannel,
        resizedImageData:      resized,
        tensor:                toOnnxTensor(resized),
      };
    },
    []
  );

  const preprocessRaw = useCallback(
    async (imageSource: string): Promise<ortTypes.Tensor> => {
      // Jalur NORMAL: gambar mentah dari kamera/galeri
      const img            = await loadHTMLImage(imageSource);
      const { gray, w, h } = toGrayscale(img);
      const inverted       = invertIfWhiteBackground(gray);
      const multichannel   = buildMultichannelImage(inverted, w, h);
      const resized        = resizeWithAspectPad(multichannel);
      return toOnnxTensor(resized);
    },
    []
  );

 

  return { preprocess, preprocessWithDebug };
}