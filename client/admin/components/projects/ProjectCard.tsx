import { EditOutlined, GithubOutlined, LinkOutlined } from '@ant-design/icons';
import { Button, Tag, Tooltip } from 'antd';
import type { KeyboardEvent, MouseEvent } from 'react';
import type { Project } from '../../types/project.types';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const stopPropagation = (event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onEdit(project);
    }
  };

  return (
    <article
      className="project-admin-card"
      role="button"
      tabIndex={0}
      aria-label={`${project.title} loyihasini tahrirlash`}
      onClick={() => onEdit(project)}
      onKeyDown={handleKeyDown}
    >
      <div className="project-admin-image">
        <img src={project.image} alt={project.title} />

        <span className="project-admin-edit-hint">
          <EditOutlined />
          Tahrirlash
        </span>
      </div>

      <div className="project-admin-content">
        <h2>{project.title}</h2>

        <p>{project.description}</p>

        <div className="project-admin-technologies">
          {project.technologies.map((technology) => (
            <Tag key={technology}>{technology}</Tag>
          ))}
        </div>

        <div className="project-admin-links">
          <Tooltip title="GitHub repository">
            <a
              href={project.githubLink}
              target="_blank"
              rel="noreferrer"
              onClick={stopPropagation}
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
                onClick={stopPropagation}
              >
                <LinkOutlined />
              </a>
            </Tooltip>
          )}

          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={(event) => {
              event.stopPropagation();
              onEdit(project);
            }}
          >
            Tahrirlash
          </Button>
        </div>
      </div>
    </article>
  );
}
