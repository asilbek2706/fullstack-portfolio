import { useEffect, useState } from 'react';
import { projectService } from '@admin/services/projectService';
import type { ProjectData } from '@admin/interfaces/project.interface';
import { IoAddCircleOutline } from 'react-icons/io5';
import './ProjectPage.scss';
import ProjectItem from '@admin/components/Dashboard-Components/ProjectsPage-components/ProjectItem';
import ProjectModal from '@admin/components/Dashboard-Components/ProjectsPage-components/ProjectModal';

const ProjectPage = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
    null,
  );

  useEffect(() => {
    projectService.getAll().then((res) => setProjects(res.data.data));
  }, []);

  const handleEdit = (project: ProjectData) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedProject(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    projectService
      .delete(id)
      .then(() => setProjects(projects.filter((proj) => proj._id !== id)));
  };

  return (
    <div className="project-page">
      <header className="page-header">
        <h1>Loyihalar Boshqaruvi</h1>

        <button onClick={handleAdd} className="add-btn">
          <IoAddCircleOutline size={20} />
          <span>Yangi loyiha</span>
        </button>
        <ProjectModal
          key={selectedProject?._id ?? 'new'}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          project={selectedProject}
          onSave={(data) => {
            console.log("Saqlanayotgan ma'lumot:", data);
            setIsModalOpen(false);
          }}
        />
      </header>

      <div className="project-list">
        {projects.map((proj) => (
          <ProjectItem
            key={proj._id}
            project={proj}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectPage;
