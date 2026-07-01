import {
  IoPencilOutline,
  IoTrashOutline,
  IoLogoGithub,
  IoGlobeOutline,
} from 'react-icons/io5';
import type { Project } from '@admin/interfaces/project.interface';
import '../Card-styles/ProjectItem.scss';

interface Props {
  project: Project;
  onDelete: (id: string) => void;
  onEdit?: (project: Project) => void;
}

const ProjectItem = ({ project, onDelete, onEdit }: Props) => {
  return (
    <div className="project-item">
      <div className="project-image">
        <img src={`${project.image}`} alt={project.title} />
      </div>

      <div className="project-info">
        <h3>{project.title}</h3>

        <p>{project.description || 'Loyiha tavsifi mavjud emas.'}</p>

        <div className="project-tech">
          {project.technologies.map((tech, index) => (
            <span key={index}>{tech}</span>
          ))}
        </div>

        <div className="project-links">
          {project.githubLink && (
            <a href={project.githubLink} target="_blank" rel="noreferrer">
              <IoLogoGithub />
              GitHub
            </a>
          )}

          {project.demoLink && (
            <a href={project.demoLink} target="_blank" rel="noreferrer">
              <IoGlobeOutline />
              Demo
            </a>
          )}
        </div>
      </div>

      <div className="project-actions">
        <button onClick={() => onEdit?.(project)}>
          <IoPencilOutline />
        </button>

        <button className="delete" onClick={() => onDelete(project._id)}>
          <IoTrashOutline />
        </button>
      </div>
    </div>
  );
};

export default ProjectItem;
