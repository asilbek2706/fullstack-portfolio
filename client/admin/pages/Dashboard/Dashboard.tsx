import { useEffect, useState } from 'react';
import AboutCard from '@admin/components/Dashboard-Components/AboutCard';
import api from '../../../api/axios';
import { uploadService } from '@admin/services/uploadService';
import type { AboutData } from '@admin/interfaces/about.interface';
import type { ProjectData } from '@admin/interfaces/project.interface'; // Interfeysni import qil
import Loading from '../../../Loading/Loading';
import './Dashboard.scss';
import ProjectCard from '@admin/components/Dashboard-Components/ProjectCard';

const Dashboard = () => {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]); // 1. Projects state qo'shildi

  useEffect(() => {
    Promise.all([
      api.get<{ data: AboutData }>('/about'),
      uploadService.getLatestImage(),
      api.get<{ data: ProjectData[] }>('/projects'),
    ]).then(([aboutRes, imgUrl, projectRes]) => {
      setAboutData(aboutRes.data.data);
      setImageUrl(imgUrl);
      setProjects(projectRes.data.data); // 3. State ga yozamiz
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

        <ProjectCard projects={projects} />
</section>
    </div>
  );
};

export default Dashboard;
