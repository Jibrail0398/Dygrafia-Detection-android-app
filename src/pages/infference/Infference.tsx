import { IonContent, IonPage } from '@ionic/react';
import { useState } from 'react';
import SegmentButton from '../../components/SegmentButton';
import BottomNavbar from '../../components/BottomNavbar';
import Upload from '../../components/Upload';
import Camera from '../../components/Camera';
const Infference: React.FC = () => {

  const [infferenceMode,setInfferenceMode] = useState<string>("Upload");

  return (
    <IonPage>
      <IonContent fullscreen className="home-page">
        <div className="home-content">
          <SegmentButton 
            value={infferenceMode} 
            onSegmentChange={(value) => {
              setInfferenceMode(value);
            }} 
          />
          {infferenceMode === "Upload" &&(
            <Upload/>
          ) }
          {
            infferenceMode === "Camera" &&(
              <Camera/>
            )
          }

        </div>

        <BottomNavbar activeTab="prediksi" />
      </IonContent>
    </IonPage>
  );
};

export default Infference;