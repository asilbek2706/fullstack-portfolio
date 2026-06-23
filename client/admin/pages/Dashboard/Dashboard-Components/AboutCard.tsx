import type { AboutData } from '@admin/interfaces/about.interface';
import { Link } from 'react-router-dom';

interface AboutProps {
  data: AboutData;
}

const AboutCard = ({ data }: AboutProps) => {
  if (!data) return <div>Data yo'q</div>;

  return (
    <div className="widget">
      <div className="widget-content">
        {/* Rasm qismi */}
        <div className="avatar-wrapper">
          <img
            src={data.avatar}
            alt={data.fullName}
            className="avatar-img"
            onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
          />
        </div>

        {/* Matn qismi */}
        <div className="info-wrapper">
          <h4>{data.fullName}</h4>
          <p className="title-text">{data.title}</p>
        </div>
      </div>

      <Link to="/auth/about" className="action-link">
        Tahrirlash →
      </Link>
    </div>
  );
};

export default AboutCard;
