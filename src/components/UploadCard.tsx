import React from 'react';
import { IonIcon } from '@ionic/react';

interface UploadCardProps {
  icon: string;
  title: string;
  subtitle: string;
  buttonText: string;
  onButtonClick?: () => void;
}

const UploadCard: React.FC<UploadCardProps> = ({
  icon,
  title,
  subtitle,
  buttonText,
  onButtonClick,
}) => {
  return (
    <div className="upload-card-container">
      <div className="upload-card">
        <div className="upload-card-icon">
          <IonIcon icon={icon} />
        </div>
        <h2 className="upload-card-title">{title}</h2>
        <p className="upload-card-subtitle">{subtitle}</p>
        <button className="upload-card-button" onClick={onButtonClick}>
          <span>+</span> {buttonText}
        </button>
      </div>
    </div>
  );
};

export default UploadCard;
