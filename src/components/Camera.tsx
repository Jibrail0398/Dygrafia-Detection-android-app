import React, { useState } from 'react';
import { camera } from 'ionicons/icons';
import UploadCard from './UploadCard';
import ImageUploadedCard from './ImageUploadedCard';
import InfferenceResult from './InfferenceResult';
import { openCamera } from '../services/camera';
import { RunInfference } from '../services/infference';

const Camera: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isImageCaptured, setIsImageCaptured] = useState<Boolean>(false);
  const [inferenceResult, setInferenceResult] = useState<{
    label: 'Potential Dysgraphia' | 'Low Potential Dysgraphia';
    confidence?: number;
    findings: string[];
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
          const result = RunInfference('Potential Dysgraphia');
          setInferenceResult(result as typeof inferenceResult);
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
          const result = RunInfference('Potential Dysgraphia');
          setInferenceResult(result as typeof inferenceResult);
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