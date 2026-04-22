import { useState, useEffect, useRef } from "react";
import type * as ortTypes from 'onnxruntime-web';



const ort = (window as any).ort as typeof ortTypes;
const ORT_VERSION = "1.24.3";
// Pengecekan aman untuk memastikan ort sudah termuat dari index.html
if (ort && ort.env && ort.env.wasm) {
  ort.env.wasm.numThreads = 1;
  // (Masukkan kembali logika import.meta.env.DEV untuk pathing di sini seperti sebelumnya)

  if (import.meta.env.DEV) {
      // Saat npm run dev: Bypass Vite restriction dengan mengambil worker dari CDN
      ort.env.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;
      console.log("🛠️ Dev Mode: Memuat WASM dari CDN");
  } else {
      // Saat npm run build / production: Gunakan lokal agar aplikasi full offline
      ort.env.wasm.wasmPaths = "/assets/";
      console.log("🚀 Prod Mode: Memuat WASM dari local assets");
  }
}

ort.env.wasm.numThreads = 1;

interface ModelInfo{
    inputNames: any[],
    outputNames: any[]
}

type ModelState = {
  session: ortTypes.InferenceSession | null;
  loading: boolean;
  error: string | null;
};


export function useModel(modelURL:string){
    const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
    const [state, setState] = useState<ModelState>({
        session: null,
        loading: true,
        error: null,
    });

    const sessionRef = useRef<ortTypes.InferenceSession | null>(null);
    

    useEffect(() => {
    let cancelled = false;

      async function loadModel() {
        try {
          setState((prev) => ({ ...prev, loading: true, error: null }));

          const session = await ort.InferenceSession.create(modelURL, {
            executionProviders: ["webgl","wasm"],
            graphOptimizationLevel: "all",
            intraOpNumThreads: 1
          });

          if (!cancelled) {
            sessionRef.current = session;
            setState({ session, loading: false, error: null });
            const info:ModelInfo = {
                inputNames: session.inputNames as string[],
                outputNames: session.outputNames as string [],
            };
            setModelInfo(info);
            console.log(`✅ Model ${modelURL} berhasil dimuat`);
            console.log('Input Names:', info.inputNames);
            console.log('Output Names:', info.outputNames);
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Gagal load model";
          if (!cancelled) {
            setState({
              session: null,
              loading: false,
              error: errorMessage,
            });
          }
          console.error(`❌ Error loading model ${modelURL}:`, errorMessage);
        }
      }

      loadModel();

      return () => {
        cancelled = true;
      };}, [modelURL]);
    
    return {state,modelInfo};
}