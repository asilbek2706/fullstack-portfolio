import {
  CalendarOutlined,
  IdcardOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Empty, Tag } from 'antd';
import dayjs from 'dayjs';
import type { About } from '../../types/about.types';

interface AboutPreviewProps {
  about: About | null;
}

export function AboutPreview({ about }: AboutPreviewProps) {
  return (
    <aside className="about-module about-preview">
      <div className="about-module-body">
        {!about ? (
          <Empty description="About hali yaratilmagan." />
        ) : (
          <>
            <Avatar
              size={120}
              src={about.avatar}
              icon={<UserOutlined />}
              className="about-preview-avatar"
            />

            <h3>{about.fullName}</h3>
            <p className="about-preview-title">{about.title}</p>

            <Tag icon={<IdcardOutlined />} color="blue">
              {about.experienceYears}
            </Tag>

            <p className="about-preview-bio">{about.bio}</p>

            {about.updatedAt && (
              <div className="about-updated-at">
                <CalendarOutlined />
                Yangilangan: {dayjs(about.updatedAt).format('DD.MM.YYYY HH:mm')}
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
