import { ReloadOutlined, RocketOutlined } from '@ant-design/icons';
import { Button, Empty, Pagination, Result, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { projectApi } from '../../api/projectApi';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { ProjectEditModal } from '../../components/projects/ProjectEditModal';
import type { Project, ProjectFormValues } from '../../types/project.types';
import { getApiError } from '../../../shared/utils/getApiError';

const pageSize = 12;

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project>();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadProjects = (requestedPage: number) => {
    setLoading(true);
    setErrorMessage('');

    void projectApi
      .getAll({
        page: requestedPage,
        limit: pageSize,
      })
      .then((response) => {
        setProjects(response.data);
        setTotal(response.pagination.total);
      })
      .catch((error) => {
        setErrorMessage(getApiError(error, 'Loyihalarni yuklab bo‘lmadi.'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    let active = true;

    projectApi
      .getAll({
        page,
        limit: pageSize,
      })
      .then((response) => {
        if (!active) return;

        setProjects(response.data);
        setTotal(response.pagination.total);
      })
      .catch((error) => {
        if (!active) return;

        setErrorMessage(getApiError(error, 'Loyihalarni yuklab bo‘lmadi.'));
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [page]);

  const handleSave = async (
    project: Project,
    values: ProjectFormValues,
    image?: File,
  ) => {
    setSaving(true);

    const loadingToast = toast.loading('Loyiha yangilanmoqda...');

    try {
      const updatedProject = await projectApi.update({
        id: project._id,
        values,
        image,
      });

      setProjects((currentProjects) =>
        currentProjects.map((currentProject) =>
          currentProject._id === updatedProject._id
            ? updatedProject
            : currentProject,
        ),
      );

      setSelectedProject(undefined);

      toast.success('Loyiha muvaffaqiyatli yangilandi.', {
        id: loadingToast,
      });
    } catch (error) {
      toast.error(getApiError(error, 'Loyihani yangilab bo‘lmadi.'), {
        id: loadingToast,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="projects-page">
      <div className="page-heading">
        <div>
          <Typography.Title level={2}>Loyihalar</Typography.Title>

          <Typography.Text type="secondary">
            Portfolio loyihalarini ko‘rish va tahrirlash.
          </Typography.Text>
        </div>

        <Button
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={() => loadProjects(page)}
        >
          Yangilash
        </Button>
      </div>

      {loading && (
        <div className="projects-loading">
          <Spin size="large" />
          <span>Loyihalar yuklanmoqda...</span>
        </div>
      )}

      {!loading && errorMessage && (
        <Result
          status="error"
          title="Loyihalarni yuklab bo‘lmadi"
          subTitle={errorMessage}
          extra={
            <Button type="primary" onClick={() => loadProjects(page)}>
              Qayta urinish
            </Button>
          }
        />
      )}

      {!loading && !errorMessage && projects.length === 0 && (
        <Empty
          image={<RocketOutlined />}
          description="Hozircha loyihalar mavjud emas"
        />
      )}

      {!loading && !errorMessage && projects.length > 0 && (
        <>
          <div className="projects-admin-grid">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onEdit={setSelectedProject}
              />
            ))}
          </div>

          {total > pageSize && (
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              showSizeChanger={false}
              onChange={setPage}
            />
          )}
        </>
      )}

      {selectedProject && (
        <ProjectEditModal
          key={selectedProject._id}
          project={selectedProject}
          saving={saving}
          onCancel={() => {
            if (!saving) {
              setSelectedProject(undefined);
            }
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
