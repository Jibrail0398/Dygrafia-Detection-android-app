// src/hooks/useInference.ts
import { useState, useCallback } from "react";
import type * as ortTypes from "onnxruntime-web";
import { useModel } from "./useModel";
import { usePreprocess } from "./usePreprocess";

const ort = (window as any).ort as typeof ortTypes;
// Sesuaikan dengan label 2 kelas kamu
const CLASS_LABELS: Record<number, string> = {
  0: "Low Potential Dysgraphia",
  1: "Potential Dysgraphia",
};

type InferenceResult = {
  label: string;
  classIndex: number;
  confidence: number;
  probabilities: number[];
};

type InferenceState = {
  result: InferenceResult | null;
  inferring: boolean;
  error: string | null;
};

export function useInference(modelUrl: string) {
  const { state: { session, loading: modelLoading, error: modelError } } = useModel(modelUrl);
  const { preprocess } = usePreprocess();

  const [state, setState] = useState<InferenceState>({
    result: null,
    inferring: false,
    error: null,
  });

  const classify = useCallback(
    async (imageSource: string) => {
      if (!session) {
        setState((prev) => ({ ...prev, error: "Model belum siap" }));
        return; // return undefined
      }

      setState({ result: null, inferring: true, error: null });

      try {
        const tensor = await preprocess(imageSource);

        // PERBAIKAN 1: Sesuaikan nama input node dengan model ONNX Anda ("image")
        const feeds: Record<string, ortTypes.Tensor> = {
          image: tensor, // Sebelumnya "pixel_values"
        };
        
        const output = await session.run(feeds);

        const logits = output["logits"].data as Float32Array;
        const probs  = softmax(Array.from(logits));
        const classIndex = probs.indexOf(Math.max(...probs));

        // PERBAIKAN 2: Simpan hasil ke dalam variabel terlebih dahulu
        const inferenceResult = {
          label: CLASS_LABELS[classIndex] ?? `Class ${classIndex}`,
          classIndex,
          confidence: probs[classIndex],
          probabilities: probs,
        };

        // Update state bawaan hook
        setState({
          inferring: false,
          error: null,
          result: inferenceResult,
        });

        // PERBAIKAN 3: Kembalikan objek agar bisa ditangkap oleh `await classify()`
        return inferenceResult;

      } catch (err) {
        setState({
          result: null,
          inferring: false,
          error: err instanceof Error ? err.message : "Inferensi gagal",
        });
        return null;
      }
    },
    [session, preprocess]
  );

  return {
    classify,
    result:        state.result,
    inferring:     state.inferring,
    error:         state.error || modelError,
    modelReady:    !modelLoading && !!session,
    modelLoading,
  };
}

// Helper softmax
function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exp = logits.map((x) => Math.exp(x - max));
  const sum = exp.reduce((a, b) => a + b, 0);
  return exp.map((e) => e / sum);
}