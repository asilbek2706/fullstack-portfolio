import { useState } from 'react';
import type { AboutData } from '@admin/interfaces/about.interface';
import api from '../../../api/axios'; // API ni import qilamiz

interface Props {
  initialData: AboutData;
  onSubmit: (data: Partial<AboutData>) => void;
}

const AboutForm = ({ initialData, onSubmit }: Props) => {
  const [formData, setFormData] = useState<AboutData>(initialData);

  // 1. Fayl tanlanganda ishlaydigan funksiya
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('avatar', file); // Backendda 'image' nomli field kutyapti deb faraz qilamiz

    try {
      // Backenddagi rasm yuklash endpointi (o'zingizniki bilan almashtiring)
      const res = await api.post('/upload', data);
      setFormData({ ...formData, avatar: res.data.url }); // Serverdan kelgan URL ni yozamiz
    } catch (err) {
      console.error('Rasm yuklashda xato:', err);
      alert("Rasm yuklashda muammo bo'ldi!");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      {/* Profil rasmi uchun file input */}
      <div className="form-group">
        <label>Profil rasmini tanlang:</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {formData.avatar && (
          <div className="avatar-preview">
            <img
              src={formData.avatar}
              alt="Preview"
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'cover',
                marginTop: '10px',
                borderRadius: '50%',
              }}
            />
          </div>
        )}
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
