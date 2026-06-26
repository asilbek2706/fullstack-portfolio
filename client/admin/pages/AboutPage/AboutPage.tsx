import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import Loading from '../../../Loading/Loading';
import type { AboutData } from '@admin/interfaces/about.interface';
import AboutForm from '@admin/components/Dashboard-Components/AboutForm/AboutForm';
import toast from 'react-hot-toast';

import './About.scss';

const AboutPage = () => {
  const [data, setData] = useState<AboutData | null>(null);

  useEffect(() => {
    api
      .get<{ data: AboutData }>('/about')
      .then((res) => setData(res.data.data));
  }, []);

  const handleUpdate = async (updatedData: Partial<AboutData>) => {
    try {
      const res = await api.put<{ data: AboutData }>('/about', updatedData);

      if (res.data && res.data.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Yangilashda xatolik yuz berdi.');
    }
  };

  if (!data) return <Loading />;

  return (
    <div className="about-page">
      <h1>About sahifasini tahrirlash</h1>
      <AboutForm initialData={data} onSubmit={handleUpdate} />
    </div>
  );
};

export default AboutPage;
