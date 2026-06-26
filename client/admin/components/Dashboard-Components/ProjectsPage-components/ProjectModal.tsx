import { useState } from 'react';
import type { ProjectData } from '@admin/interfaces/project.interface';
import '../Card-styles/ProjectModal.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: ProjectData | null;
  onSave: (data: { title: string; description: string }) => void;
}

const ProjectModal = ({ isOpen, onClose, project, onSave }: ModalProps) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (!formData.title.trim()) return;

    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{project ? 'Loyihani tahrirlash' : "Yangi loyiha qo'shish"}</h2>

          <button className="close-btn" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className="form-group">
          <label>Loyiha nomi</label>

          <input
            type="text"
            placeholder="Masalan: Portfolio Website"
            value={formData.title}
            onChange={(e) =>
              setFormData({
                ...formData,
                title: e.target.value,
              })
            }
          />
        </div>

        <div className="form-group">
          <label>Tavsif</label>

          <textarea
            placeholder="Loyiha haqida qisqacha ma'lumot..."
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value,
              })
            }
          />
        </div>

        <div className="modal-actions">
          <button className="save-btn" onClick={handleSave} type="button">
            {project ? 'Saqlash' : "Qo'shish"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
