import React from 'react';
import { IonIcon } from '@ionic/react';
import { home, sparkles } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

interface BottomNavbarProps {
  activeTab?: string;
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({ activeTab = 'home' }) => {
  const history = useHistory();

  const handleNavigation = (path: string) => {
    history.push(path);
  };

  return (
    <div className="bottom-navbar">
      <button
        className={`navbar-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => handleNavigation('/home')}
      >
        <IonIcon aria-hidden="true" icon={home} />
        <span className="navbar-label">Home</span>
      </button>
      <button
        className={`navbar-item ${activeTab === 'prediksi' ? 'active' : ''}`}
        onClick={() => handleNavigation('/infference')}
      >
        <IonIcon aria-hidden="true" icon={sparkles} />
        <span className="navbar-label">Prediksi</span>
      </button>
    </div>
  );
};

export default BottomNavbar;
