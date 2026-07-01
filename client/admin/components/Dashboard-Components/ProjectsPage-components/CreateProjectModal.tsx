import { useState } from 'react';
import type { ProjectFormData } from '@admin/interfaces/project.interface';
import '../Card-styles/CreateProjectModal.scss';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProjectFormData) => void;
}

const CreateProjectModal = ({ isOpen, onClose, onSave }: Props) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    technologies: [],
    githubLink: '',
    demoLink: '',
    image: null,
  });

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === 'technologies') {
      setFormData({
        ...formData,
        technologies: value
          .split(',')
          .map((tech) => tech.trim())
          .filter(Boolean),
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      image: e.target.files?.[0] || null,
    });
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    onSave(formData);

    setFormData({
      title: '',
      description: '',
      technologies: [],
      githubLink: '',
      demoLink: '',
      image: null,
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Yangi loyiha</h2>

          <button type="button" className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <input
          type="text"
          name="title"
          placeholder="Loyiha nomi"
          value={formData.title}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Loyiha tavsifi"
          value={formData.description}
          onChange={handleChange}
        />

        <input type="file" accept="image/*" onChange={handleFileChange} />

        <input
          placeholder="Texnologiyalar (vergul bilan ajratib yozing)"
          onChange={(e) =>
            setFormData({
              ...formData,
              technologies: e.target.value.split(','),
            })
          }
        />

        <input
          type="url"
          name="githubLink"
          placeholder="GitHub havolasi"
          value={formData.githubLink}
          onChange={handleChange}
        />

        <input
          type="url"
          name="demoLink"
          placeholder="Demo havolasi"
          value={formData.demoLink}
          onChange={handleChange}
        />

        <div className="modal-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Bekor qilish
          </button>

          <button type="button" className="save-btn" onClick={handleSubmit}>
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
