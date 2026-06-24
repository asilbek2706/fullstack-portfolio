import type { AboutData } from '@admin/interfaces/about.interface';
import { uploadService } from '@admin/services/uploadService';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import './Card-styles/AboutCard.scss';

interface AboutProps {
  data: AboutData;
  imageUrl: string;
}

const AboutCard = ({ data, imageUrl }: AboutProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    uploadService.getLatestImage().then((url) => setPreviewUrl(url));
  }, []);

  return (
    <div className="widget">
      <div className="widget-header">
        <h3>About Page</h3>
        <span>Ma'lumotlarni tahrirlash</span>
      </div>

      <div className="avatar-wrapper">
        <img
          src={previewUrl || imageUrl || '/default-avatar.png'}
          alt="Profile"
          className="avatar-img"
        />
      </div>

      <h4>{data.fullName}</h4>
      <p>{data.title}</p>

      <Link to="/auth/about" className="action-link">
        Tahrirlash →
      </Link>
    </div>
  );
};

export default AboutCard;
