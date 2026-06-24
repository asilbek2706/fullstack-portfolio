import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AboutData } from '@admin/interfaces/about.interface';
import { uploadService } from '@admin/services/uploadService';
import { toast } from 'react-hot-toast'; // 'headless' o'rniga oddiy toast ishlatish tavsiya etiladi
import './AboutForm.scss';

interface Props {
  initialData: AboutData;
  onSubmit: (data: Partial<AboutData>) => void;
}

const AboutForm = ({ initialData, onSubmit }: Props) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AboutData>(initialData);
  const [previewUrl, setPreviewUrl] = useState<string>(
    initialData.avatar || '',
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const loadingToast = toast.loading('Rasm yuklanmoqda...');
    try {
      const url = await uploadService.uploadImage(file);
      setPreviewUrl(url);
      setFormData({ ...formData, avatar: url });
      toast.success('Rasm muvaffaqiyatli yuklandi!', { id: loadingToast });
    } catch (error: unknown) {
      toast.error('Rasm yuklashda xatolik yuz berdi!', { id: loadingToast });
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      toast.success("Ma'lumotlar muvaffaqiyatli saqlandi!");
      navigate('/auth/dashboard');
    } catch (error: unknown) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      {/* Profil rasmi uchun file input */}
      <div className="form-group">
        <div className="avatar-upload">
          <div className="file-input-wrapper">
            <label>Profil rasmini tanlang:</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>
          {previewUrl && (
            <div
              className="avatar-preview"
              style={{
                marginTop: '10px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  width: '500px',
                  height: '250px',
                  objectFit: 'contain',
                  border: '2px solid #374151',
                  backgroundColor: '#1f2937',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Ism-familiya */}
      <div className="form-group">
        <label>Ism-familiya:</label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
        />
      </div>

      {/* Lavozim */}
      <div className="form-group">
        <label>Lavozim (Title):</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      {/* Tajriba yili */}
      <div className="form-group">
        <label>Tajriba (yillar):</label>
        <input
          type="text"
          value={formData.experienceYears}
          onChange={(e) =>
            setFormData({ ...formData, experienceYears: e.target.value })
          }
        />
      </div>

      {/* Bio */}
      <div className="form-group">
        <label>Bio (O'zingiz haqingizda):</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={5}
        />
      </div>

      <button type="submit" className="save-btn">
        Ma'lumotlarni saqlash
      </button>
    </form>
  );
};

export default AboutForm;
