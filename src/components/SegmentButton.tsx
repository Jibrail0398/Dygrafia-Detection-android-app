import React from 'react';
import { IonSegment, IonSegmentButton, IonLabel, IonIcon } from '@ionic/react';
import { image, camera } from 'ionicons/icons';
import "../theme/global.css"

interface SegmentButtonProps {
  value?: string;
  onSegmentChange?: (value: string) => void;
}

const SegmentButton: React.FC<SegmentButtonProps> = ({ value = 'Upload', onSegmentChange }) => {

  const handleSegmentChange = (newValue: string) => {
    onSegmentChange?.(newValue);
  };

  return (
    <div className="segment-button-container">
      <IonSegment
        value={value}
        onIonChange={(e) => handleSegmentChange(e.detail.value as string)}
        className="segment-button"
      >
        <IonSegmentButton value="Upload" className="segment-button">
          <IonIcon aria-hidden="true" icon={image} size="large" />
          <IonLabel>Upload Gambar</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="Camera" className="segment-button">
          <IonIcon aria-hidden="true" icon={camera} size="large" />
          <IonLabel>Kamera</IonLabel>
        </IonSegmentButton>
      </IonSegment>
    </div>
  );
};

export default SegmentButton;
