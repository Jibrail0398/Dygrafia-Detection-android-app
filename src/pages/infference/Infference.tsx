import { IonContent, IonPage } from '@ionic/react';
import { useState } from 'react';
import SegmentButton from '../../components/SegmentButton';
import Upload from '../../components/Upload';
import Camera from '../../components/Camera';
import { useInference } from '../../hooks/useInference';

const Infference: React.FC = () => {

  const [infferenceMode, setInfferenceMode] = useState<string>("Upload");
  const modelPath = "/models/mobilevit_s_fold1_fp16_standalone.onnx";
  const { modelLoading } = useInference(modelPath);

  return (
    <IonPage>
      <IonContent fullscreen className="home-page">
        <div className="home-content">
          {modelLoading ? (
            <div className="loading-container" style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px'
            }}>
              <div className="spinner" style={{
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3498db',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                animation: 'spin 1s linear infinite'
              }} />
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : (
            <>
              <SegmentButton 
                value={infferenceMode} 
                onSegmentChange={(value) => {
                  setInfferenceMode(value);
                }} 
              />
              {infferenceMode === "Upload" && (
                <Upload/>
              )}
              {infferenceMode === "Camera" && (
                <Camera/>
              )}
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Infference;