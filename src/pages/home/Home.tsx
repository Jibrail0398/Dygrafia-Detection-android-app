import { IonContent, IonPage } from '@ionic/react';
import { pencil, grid, text, layers, volumeMute, bookmarks } from 'ionicons/icons';
// BottomNavbar is rendered globally in the router
import DysgrafiaTypes from '../../components/DysgrafiaTypes';
import BottomNavbar from '../../components/BottomNavbar';
import './Home.css';

const Home: React.FC = () => {
  const dysgrafiaTypes = [
    {
      icon: pencil,
      type: 'Disgrafia Motorik',
      details: 'Disgrafia motorik, ditandai dengan kualitas tulisan yang buruk dan tidak terbaca baik saat menyalin maupun menulis spontan. Kondisi ini disebabkan oleh defisit kontrol motorik halus, penurunan ketangkasan, dan tonus otot rendah, meskipun kemampuan mengeja pada kelompok ini biasanya tetap terjaga. Jenis disgrafia ini ditandai dengan tulisan tangan yang tampak tipis.',
      typeColor: '#d32f2f',
      iconColor: '#d32f2f',
    },
    {
      icon: grid,
      type: 'Disgrafia Spasial',
      details: 'Disgrafia spasial, berakar pada masalah kesadaran ruang, yang mengakibatkan tulisan melayang tidak pada garisnya dan pengaturan spasi antarhuruf yang buruk.',
      typeColor: '#00bcd4',
      iconColor: '#00bcd4',
    },
    {
      icon: text,
      type: 'Disgrafia Disleksik',
      details: 'Disgrafia disleksik, ditandai oleh kemampuan menyalin teks yang baik karena motorik halus yang utuh, namun kesulitan menulis spontan akibat lemahnya penguasaan ejaan. Disgrafia jenis ini ditandai dengan seringnya ditemukan kesalahan ejaan.',
      typeColor: '#1976d2',
      iconColor: '#1976d2',
    },
    {
      icon: volumeMute,
      type: 'Disgrafia Fonologis',
      details: 'Disgrafia fonologis, bermanifestasi sebagai kesulitan dalam mengingat dan menggabungkan bunyi fonem, sehingga penderita sulit menulis kata-kata asing atau kata dengan pola fonetik tidak teratur.',
      typeColor: '#7c3aed',
      iconColor: '#7c3aed',
    },
    {
      icon: bookmarks,
      type: 'Disgrafia Leksikal',
      details: 'Disgrafia leksikal, ditandai dengan ketergantungan yang kuat pada konversi bunyi-ke-huruf saat menulis. Hal ini menyebabkan seringnya terjadi kesalahan ejaan pada kata-kata tidak beraturan, sebuah fenomena yang lebih umum ditemukan pada bahasa dengan aturan ejaan yang tidak konsisten seperti bahasa Inggris atau Prancis',
      typeColor: '#10b981',
      iconColor: '#10b981',
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
