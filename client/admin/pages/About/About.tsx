import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import Loading from '../../../Loading/Loading';
import type { AboutData } from '@admin/interfaces/about.interface';
import AboutForm from '@admin/components/AboutForm/AboutForm';

const AboutPage = () => {
  const [data, setData] = useState<AboutData | null>(null);

  useEffect(() => {
    api.get('/about').then((res) => setData(res.data.data));
  }, []);

  const handleUpdate = async (updatedData: Partial<AboutData>) => {
    try {
      await api.put('/about', updatedData);
      alert('Muvaffaqiyatli yangilandi!');
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) return <Loading />;

  return (
    <div className="about-page">
      <h1>About tahrirlash</h1>
      <AboutForm initialData={data} onSubmit={handleUpdate} />
    </div>
  );
};

export default AboutPage;
