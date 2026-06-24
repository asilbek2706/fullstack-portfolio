import { useEffect, useState } from 'react';
import AboutCard from '@admin/components/Dashboard-Components/AboutCard';
import api from '../../../api/axios';
import { uploadService } from '@admin/services/uploadService';
import type { AboutData } from '@admin/interfaces/about.interface';
import './Dashboard.scss';
import Loading from '../../../Loading/Loading';

const Dashboard = () => {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // Ikkala ma'lumotni parallel olamiz
    Promise.all([
      api.get<{ data: AboutData }>('/about'),
      uploadService.getLatestImage(),
    ]).then(([aboutRes, imgUrl]) => {
      setAboutData(aboutRes.data.data);
      setImageUrl(imgUrl);
    });
  }, []);

  if (!aboutData) return <Loading />;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
      </header>

      <section className="widgets-grid">
        <AboutCard
          data={aboutData}
          imageUrl={imageUrl || '/default-avatar.png'}
        />
      </section>
    </div>
  );
};

export default Dashboard;
