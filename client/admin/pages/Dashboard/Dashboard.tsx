import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import Loading from '../../../Loading/Loading';
import type { AboutData } from '../../interfaces/about.interface';
import './Dashboard.scss';
import AboutCard from './Dashboard-Components/AboutCard';

const Dashboard = () => {
  const [about, setAbout] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: AboutData }>('/about')
      .then((res) => setAbout(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>
          Xush kelibsiz, Admin! Bu yerda loyihangizni boshqarishingiz mumkin.
        </p>
      </header>

      <section className="widgets-grid">
        {about ? <AboutCard data={about} /> : <p>Ma'lumot topilmadi</p>}
      </section>
    </div>
  );
};

export default Dashboard;
