import React from 'react';
import { IonIcon, IonRouterLink } from '@ionic/react';
import { home, sparkles } from 'ionicons/icons';
import { useLocation } from 'react-router-dom';

interface BottomNavbarProps {
  activeTab?: string;
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({ activeTab }) => {
  const location = useLocation();
  
  // Determine active tab based on current location
  const currentTab = activeTab || (location.pathname === '/infference' ? 'prediksi' : 'home');

  return (
    <div className="bottom-navbar">
      <IonRouterLink
        routerLink="/"
        routerDirection="forward"
        className={`navbar-item ${currentTab === 'home' ? 'active' : ''}`}
      >
        <IonIcon aria-hidden="true" icon={home} />
        <span className="navbar-label">Home</span>
      </IonRouterLink>

      <IonRouterLink
        routerLink="/infference"
        routerDirection="forward"
        className={`navbar-item ${currentTab === 'prediksi' ? 'active' : ''}`}
      >
        <IonIcon aria-hidden="true" icon={sparkles} />
        <span className="navbar-label">Prediksi</span>
      </IonRouterLink>
    </div>
  );
};

export default BottomNavbar;