import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react';
import { FiArrowUpRight, FiGithub } from 'react-icons/fi';
import type { MouseEvent } from 'react';
import type { Project } from '../../types/portfolio';
import { safeUrl } from '../../utils/safeUrl';

export function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 140, damping: 22 });
  const rotateY = useSpring(y, { stiffness: 140, damping: 22 });
  const move = (event: MouseEvent<HTMLElement>) => {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return;
    const box = event.currentTarget.getBoundingClientRect();
    x.set(((event.clientY - box.top) / box.height - 0.5) * -5);
    y.set(((event.clientX - box.left) / box.width - 0.5) * 5);
  };
  const github = safeUrl(project.githubLink);
  const demo = safeUrl(project.demoLink);
  return (
    <motion.article
      className="pf-project-card"
      onMouseMove={move}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
    >
      <div className="pf-project-image">
        <img src={safeUrl(project.image)} alt={project.title} loading="lazy" />
        <span className="pf-project-number">
          {String(index + 1).padStart(2, '0')} / PROJECT
        </span>
      </div>
      <div className="pf-project-body">
        <div className="pf-project-heading">
          <h3>{project.title}</h3>
          <FiArrowUpRight aria-hidden="true" />
        </div>
        <p>{project.description}</p>
        <ul className="pf-tags">
          {project.technologies.map((tech, i) => (
            <li key={`${tech}-${i}`}>{tech}</li>
          ))}
        </ul>
        <div className="pf-project-links">
          {demo && (
            <a href={demo} target="_blank" rel="noopener noreferrer">
              Loyihani ochish <FiArrowUpRight />
            </a>
          )}
          {github && (
            <a href={github} target="_blank" rel="noopener noreferrer">
              <FiGithub /> Kodni ko‘rish
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
