import { ArrowRightOutlined, RocketOutlined } from '@ant-design/icons';
import { Card, Empty, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectApi } from '../../api/projectApi';
import type { Project } from '../../types/project.types';

export function ProjectsSummaryCard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    projectApi
      .getAll({
        page: 1,
        limit: 3,
      })
      .then((response) => {
        if (!active) return;

        setProjects(response.data);
        setTotal(response.pagination.total);
      })
      .catch(() => {
        if (active) {
          setProjects([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Link
      to="/admin/projects"
      className="dashboard-content-link"
      aria-label="Projects bo‘limiga o‘tish"
    >
      <Card
        hoverable
        bordered={false}
        className="dashboard-content-card dashboard-projects-card"
      >
        <div className="dashboard-section-heading">
          <div>
            <Typography.Title level={4}>Projects</Typography.Title>

            <Typography.Text type="secondary">
              {total} ta loyiha mavjud
            </Typography.Text>
          </div>

          <ArrowRightOutlined />
        </div>

        {loading && (
          <div className="dashboard-projects-loading">
            <Spin />
          </div>
        )}

        {!loading && projects.length === 0 && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Loyihalar mavjud emas"
          />
        )}

        {!loading && projects.length > 0 && (
          <div className="dashboard-project-list">
            {projects.map((project) => (
              <div className="dashboard-project-item" key={project._id}>
                <img src={project.image} alt="" aria-hidden="true" />

                <div>
                  <strong>{project.title}</strong>
                  <span>{project.technologies.join(' · ')}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <span className="dashboard-projects-action">
          <RocketOutlined />
          Barcha loyihalarni boshqarish
        </span>
      </Card>
    </Link>
  );
}
