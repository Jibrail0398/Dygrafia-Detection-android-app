import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronDown, chevronUp } from 'ionicons/icons';

interface DysgrafiaTypesProps {
  icon: string;
  type: string;
  details: string;
  typeColor?: string;
  iconColor?: string;
}

const DysgrafiaTypes: React.FC<DysgrafiaTypesProps> = ({
  icon,
  type,
  details,
  typeColor = '#1976d2',
  iconColor = '#1976d2',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const characterLimit = 80;
  const isTextTruncated = details.length > characterLimit;
  const displayText = isExpanded ? details : details.substring(0, characterLimit);

  return (
    <div className="dysgraphia-type-card">
      <div className="dysgraphia-type-header">
        <div className="dysgraphia-type-icon" style={{ color: iconColor }}>
          <IonIcon icon={icon} size="large" />
        </div>
        <h3 className="dysgraphia-type-title" style={{ color: typeColor }}>
          {type}
        </h3>
      </div>

      <div className="dysgraphia-type-content">
        <p className="dysgraphia-type-details">
          {displayText}
          {isTextTruncated && !isExpanded && '...'}
        </p>

        {isTextTruncated && (
          <button
            className="dysgraphia-type-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ color: typeColor }}
          >
            {isExpanded ? (
              <>
                <span>Tutup</span>
                <IonIcon icon={chevronUp} />
              </>
            ) : (
              <>
                <span>Baca Selengkapnya</span>
                <IonIcon icon={chevronDown} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default DysgrafiaTypes;
