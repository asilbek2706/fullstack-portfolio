import { useEffect, useState } from 'react';
import {
  getProjects,
  createProject,
  deleteProject,
} from '@admin/services/projectService';

import { useNavigate } from 'react-router-dom';

import type {
  Project,
  ProjectFormData,
} from '@admin/interfaces/project.interface';

import CreateProjectModal from '@admin/components/Dashboard-Components/ProjectsPage-components/CreateProjectModal';
import ProjectItem from '@admin/components/Dashboard-Components/ProjectsPage-components/ProjectItem';

import './ProjectPage.scss';
import { IoArrowBackOutline } from 'react-icons/io5';

const ProjectPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    getProjects().then(setProjects);
  }, []);

  const handleSave = async (data: ProjectFormData) => {
    const newProject = await createProject(data);
    setProjects((prev) => [...prev, newProject]);
  };

  const handleDelete = async (id: string) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((item) => item._id !== id));
  };

  return (
    <div className="project-page">
      <div className="project-page__header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <IoArrowBackOutline />
          </button>

          <div>
            <h1>Loyihalar</h1>
            <p>Barcha loyihalarni boshqaring</p>
          </div>
        </div>

        <button
          className="add-project-btn"
          onClick={() => setIsModalOpen(true)}
        >
          <span>+</span>
          Yangi loyiha
        </button>
      </div>

      <div className="project-list">
        {projects.map((project) => (
          <ProjectItem
            key={project._id}
            project={project}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default ProjectPage;
