import { IoPencilOutline, IoTrashOutline } from 'react-icons/io5';
import '../Card-styles/ProjectItem.scss';
import type { ProjectData } from '@admin/interfaces/project.interface';

interface Props {
  project: ProjectData;
  onDelete: (id: string) => void;
  onEdit: (project: ProjectData) => void;
}

const ProjectItem = ({ project, onDelete, onEdit }: Props) => {
  return (
    <div className="project-item">
      <span className="project-title">{project.title}</span>
      <div className="project-actions">
        <button className="edit-btn" onClick={() => onEdit(project)}>
          <IoPencilOutline size={18} />
        </button>
        <button className="delete-btn" onClick={() => onDelete(project._id)}>
          <IoTrashOutline size={18} />
        </button>
      </div>
    </div>
  );
};

export default ProjectItem;
