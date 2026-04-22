import { IonContent, IonPage } from '@ionic/react';
import { pencil, grid, text, layers, volumeMute } from 'ionicons/icons';
// BottomNavbar is rendered globally in the router
import DysgrafiaTypes from '../../components/DysgrafiaTypes';
import BottomNavbar from '../../components/BottomNavbar';
import './Home.css';

const Home: React.FC = () => {
  const dysgrafiaTypes = [
    {
      icon: pencil,
      type: 'Disgrafia Motorik',
      details: 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore',
      typeColor: '#d32f2f',
      iconColor: '#d32f2f',
    },
    {
      icon: grid,
      type: 'Disgrafia Spasial',
      details: 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore',
      typeColor: '#00bcd4',
      iconColor: '#00bcd4',
    },
    {
      icon: text,
      type: 'Disgrafia Disleksia',
      details: 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore',
      typeColor: '#1976d2',
      iconColor: '#1976d2',
    },
  ];

  return (
    <IonPage>
      <IonContent fullscreen className="home-page">
        <div className="home-content">
          {/* Title */}
          <h1 className="home-title">
            Apa itu <span className="home-title-highlight">Disgrafia</span>?
          </h1>

          {/* General Explanation Card */}
          <div className="dysgraphia-explanation-card">
            <p className="dysgraphia-explanation-text">
              <span className="font-bold">Disgrafia</span> adalah gangguan belajar spesifik yang mempengaruhi kemampuan seseorang dalam menulis, ditandai dengan tulisan tangan tidak rapi, lambat, kesulitan menuangkan pikiran ke dalam bentuk tulisan.
            </p>
          </div>

          {/* Dysgraphia Types */}
          <div className="dysgraphia-types-container">
            {dysgrafiaTypes.map((item, index) => (
              <DysgrafiaTypes
                key={index}
                icon={item.icon}
                type={item.type}
                details={item.details}
                typeColor={item.typeColor}
                iconColor={item.iconColor}
              />
            ))}
          </div>
        </div>
        
      </IonContent>
    </IonPage>
  );
};

export default Home;
