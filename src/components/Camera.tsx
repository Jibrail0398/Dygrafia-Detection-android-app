import React, { useState } from 'react';
import { camera } from 'ionicons/icons';
import UploadCard from './UploadCard';
import ImageUploadedCard from './ImageUploadedCard';
import InfferenceResult from './InfferenceResult';
import { openCamera } from '../services/camera';
import { useInference } from '../hooks/useInference';

const Camera: React.FC = () => {
  const modelPath = "/models/mobilevit_fp16.onnx";
  const { classify } = useInference(modelPath);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isImageCaptured, setIsImageCaptured] = useState<Boolean>(false);
  const [inferenceResult, setInferenceResult] = useState<{
    label: string;
    classIndex: number;
    confidence: number;
    probabilities: number[];
    findings: string;
    disclaimer?: string;
  } | null>(null);

  const handleOpenCamera = async () => {
    try {
      const photo = await openCamera();
      if (photo && photo.dataUrl) {
        setImageUrl(photo.dataUrl);
        setIsImageCaptured(true);

        // Process inference
        try {
          const res = await classify(photo.dataUrl);

          // Tentukan findings berdasarkan label
          const findings = res?.label === "Potential Dysgraphia" 
            ? "Ditemukan salah satu atau kombinasi dari indikasi berikut:\n1. Spasi antar kata tidak konsisten\n2. Ukuran huruf tidak konsisten\n3. Huruf-huruf yang melewati garis atau melayang diantara garis"
            : "Tulisan tangan anak tampak normal, tidak ditemukan indikasi disgrafia";

          // Tentukan disclaimer berdasarkan label
          const disclaimer = res?.label === "Potential Dysgraphia"
            ? "“ Hasil ini merupakan skrining awal dan bukan  diagnosis medis. Untuk memastikan kondisi anak secara menyeluruh, silahkan berkonsultasi dengan tenaga professional. “"
            : "";

          if (res?.label) {
            const newInferenceResult = {
              ...res,
              findings: findings,
              disclaimer: disclaimer,
            };
            setInferenceResult(newInferenceResult);
            console.log(`Isi inferenceResult: `, newInferenceResult)
          }
          console.log("Hasil Prediksi:", res);
        } catch (error) {
          console.error('Inference error:', error);
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  const handleRetakePhoto = async () => {
    try {
      const photo = await openCamera();
      if (photo && photo.dataUrl) {
        setImageUrl(photo.dataUrl);
        setInferenceResult(null);

        // Process inference
        try {
          const res = await classify(photo.dataUrl);

          // Tentukan findings berdasarkan label
          const findings = res?.label === "Potential Dysgraphia" 
            ? "Ditemukan salah satu atau kombinasi dari indikasi berikut:\n1. Spasi antar kata tidak konsisten\n2. Ukuran huruf tidak konsisten\n3. Huruf-huruf yang melewati garis atau melayang diantara garis"
            : "Tulisan tangan anak tampak normal, tidak ditemukan indikasi disgrafia";

          // Tentukan disclaimer berdasarkan label
          const disclaimer = res?.label === "Potential Dysgraphia"
            ? "Hasil ini merupakan skrining awal dan bukan  diagnosis medis. Untuk memastikan kondisi anak secara menyeluruh, silahkan berkonsultasi dengan tenaga professional."
            : "";

          if (res?.label) {
            const newInferenceResult = {
              ...res,
              findings: findings,
              disclaimer: disclaimer,
            };
            setInferenceResult(newInferenceResult);
            console.log(`Isi inferenceResult: `, newInferenceResult)
          }
          console.log("Hasil Prediksi:", res);
        } catch (error) {
          console.error('Inference error:', error);
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  return (
    <div>
      {!isImageCaptured ? (
        <UploadCard
          icon={camera}
          title="Buka Kamera"
          subtitle="Ambil foto bulatan tangah anak"
          buttonText="Buka Kamera"
          onButtonClick={handleOpenCamera}
        />
      ) : (
        <>
          {imageUrl && (
            <ImageUploadedCard
              imageSrc={imageUrl}
              showRetakeButton={true}
              onRetake={handleRetakePhoto}
            />
          )}
          {inferenceResult && (
            <InfferenceResult
              label={inferenceResult.label}
              confidence={inferenceResult.confidence}
              findings={inferenceResult.findings}
              disclaimer={inferenceResult.disclaimer}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Camera;