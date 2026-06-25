import { Link } from 'react-router-dom';
import { FaFolderOpen } from 'react-icons/fa';

import './Card-styles/ProjectCard.scss';
import type { ProjectData } from '@admin/interfaces/project.interface';

interface ProjectsProps {
  projects: ProjectData[];
}

const ProjectCard = ({ projects }: ProjectsProps) => {
  return (
    <div className="widget project-widget">
      <div className="project-header">
        <h3>Projects Management</h3>
        <span>Loyihalarni boshqarish</span>
      </div>
      <div className="project-banner">
        <FaFolderOpen size={80} />
      </div>

      <div className="project-content">
        <h2>Jami: {projects.length} ta loyiha</h2>

        <p>
          Portfolio va mijozlar uchun yaratilgan loyihalarni ko'rish,
          tahrirlash, o'chirish va yangilarini qo'shish.
        </p>
      </div>

      <Link to="/auth/projects" className="action-link">
        Loyihalarni tahrirlash →
      </Link>
    </div>
  );
};

export default ProjectCard;
