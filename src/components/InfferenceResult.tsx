import React from 'react';
import { IonIcon } from '@ionic/react';
import { warning, arrowUndo, close } from 'ionicons/icons';

interface InfferenceResultProps {
  label: string;
  confidence?: number;
  findings: string;
  disclaimer?: string;
  onDelete?: () => void;
  changeImages?: () => void;
}

const InfferenceResult: React.FC<InfferenceResultProps> = ({
  label,
  confidence,
  findings,
  disclaimer,
  onDelete,
  changeImages

}) => {
  console.log('InfferenceResult Props:', { label, confidence, findings, disclaimer });
  const isPotentialDysgraphia = label === 'Potential Dysgraphia';
  const labelColor = isPotentialDysgraphia ? '#d32f2f' : '#4caf50';

  return (
    <div className="inference-result-container">
      <div className="inference-result-card">
        {/* Label */}
        <h2 className="inference-result-label" style={{ color: labelColor }}>
          {label}
        </h2>

        {/* Confidence - Only show if Potential Dysgraphia */}
        {isPotentialDysgraphia && confidence !== undefined && (
          <div className="inference-result-confidence">
            <span className="confidence-label">Confidence</span>
            <span className="confidence-value">{Math.round(confidence * 100)}%</span>
          </div>
        )}

        {/* Temuan Analisis Section */}
        <div className="inference-result-findings-section">
          <h3 className="findings-title">Temuan Analisis</h3>
          <p className="findings-text" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#333', marginTop: '10px' }}>
            {findings}
          </p>
        </div>

        {/* Disclaimer - Only show if Potential Dysgraphia */}
        {isPotentialDysgraphia && disclaimer && (
          <div className="inference-result-disclaimer">
            <div className="disclaimer-icon">
              <IonIcon icon={warning} />
            </div>
            <p className="disclaimer-text">{disclaimer}</p>
          </div>
        )}

        {/* Action Buttons - Only show if both callbacks are provided */}
        {(onDelete || changeImages) && (
          <div className="inference-result-actions">
            {changeImages && (
              <button className="inference-result-button-change" onClick={changeImages}>
                <IonIcon icon={arrowUndo} /> Ganti Gambar
              </button>
            )}
            {onDelete && (
              <button className="inference-result-button-delete" onClick={onDelete}>
                <IonIcon icon={close} /> Hapus Gambar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfferenceResult;