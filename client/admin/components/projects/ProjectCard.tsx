import {
  CalendarOutlined,
  CodeOutlined,
  DeleteOutlined,
  EditOutlined,
  GithubOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { Button, Tag, Tooltip } from 'antd';
import type { Project } from '../../types/project.types';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const formatProjectDate = (project: Project) => {
  const value = project.updatedAt || project.createdAt;

  if (!value) return 'Sana mavjud emas';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Sana mavjud emas';
  }

  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <article className="project-admin-card">
      <div className="project-admin-image">
        <img src={project.image} alt={project.title} loading="lazy" />

        <div className="project-image-shade" />

        <div className="project-card-external-actions">
          <Tooltip title="GitHub repository">
            <a
              href={project.githubLink}
              target="_blank"
              rel="noreferrer"
              aria-label={`${project.title} GitHub repository`}
            >
              <GithubOutlined />
            </a>
          </Tooltip>

          {project.demoLink && (
            <Tooltip title="Live demo">
              <a
                href={project.demoLink}
                target="_blank"
                rel="noreferrer"
                aria-label={`${project.title} live demo`}
              >
                <LinkOutlined />
              </a>
            </Tooltip>
          )}
        </div>

        <span className="project-image-label">
          <CodeOutlined />
          Portfolio project
        </span>
      </div>

      <div className="project-admin-content">
        <div className="project-card-title-row">
          <h2>{project.title}</h2>
        </div>

        <p>{project.description}</p>

        <div className="project-admin-technologies">
          {project.technologies.map((technology) => (
            <Tag key={technology}>{technology}</Tag>
          ))}
        </div>
      </div>

      <footer className="project-card-footer">
        <span className="project-card-date">
          <CalendarOutlined />
          {formatProjectDate(project)}
        </span>

        <div className="project-card-buttons">
          <Button
            className="project-card-edit-button"
            icon={<EditOutlined />}
            onClick={() => onEdit(project)}
          >
            Tahrirlash
          </Button>

          <Tooltip title="Projectni o‘chirish">
            <Button
              danger
              className="project-card-delete-button"
              icon={<DeleteOutlined />}
              aria-label={`${project.title} projectini o‘chirish`}
              onClick={() => onDelete(project)}
            />
          </Tooltip>
        </div>
      </footer>
    </article>
  );
}
