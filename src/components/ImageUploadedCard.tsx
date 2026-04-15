import React from 'react';
import { IonIcon } from '@ionic/react';
import { arrowUndo } from 'ionicons/icons';

interface ImageUploadedCardProps {
  imageSrc: string;
  fileName?: string;
  onRetake?: () => void;
  showRetakeButton?: boolean;
}

const ImageUploadedCard: React.FC<ImageUploadedCardProps> = ({
  imageSrc,
  fileName,
  onRetake,
  showRetakeButton = false,
}) => {
  return (
    <div className="image-uploaded-card-container">
      <div className="image-uploaded-card">
        <div className="image-uploaded-card-image-wrapper">
          <img
            src={imageSrc}
            alt="Uploaded content"
            className="image-uploaded-card-image"
          />
        </div>
        {fileName && (
          <p className="image-uploaded-card-filename">{fileName}</p>
        )}
        {showRetakeButton && onRetake && (
          <button className="image-uploaded-card-retake-button" onClick={onRetake}>
            <IonIcon icon={arrowUndo} /> Ganti Gambar
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageUploadedCard;
