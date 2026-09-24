import {
  PlusOutlined,
  ReloadOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import {
  Button,
  Empty,
  Modal,
  Pagination,
  Result,
  Spin,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { projectApi } from '../../api/projectApi';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { ProjectEditModal } from '../../components/projects/ProjectEditModal';
import type { Project, ProjectFormValues } from '../../types/project.types';
import { getApiError } from '../../../shared/utils/getApiError';

const pageSize = 12;
const projectsPath = '/admin/projects';

export function ProjectsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project>();
  const [deleteTarget, setDeleteTarget] = useState<Project>();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isCreateRoute = location.pathname === `${projectsPath}/create`;

  const isEditRoute =
    location.pathname.startsWith(`${projectsPath}/edit/`) && Boolean(projectId);

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

  useEffect(() => {
    if (!isEditRoute || !projectId) return;

    let active = true;

    projectApi
      .getById(projectId)
      .then((project) => {
        if (active) {
          setEditingProject(project);
        }
      })
      .catch((error) => {
        if (!active) return;

        toast.error(getApiError(error, 'Project ma’lumotini yuklab bo‘lmadi.'));

        navigate(projectsPath, {
          replace: true,
        });
      });

    return () => {
      active = false;
    };
  }, [isEditRoute, navigate, projectId]);

  const closeProjectModal = () => {
    if (saving) return;

    setEditingProject(undefined);
    navigate(projectsPath);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    navigate(`${projectsPath}/edit/${project._id}`);
  };

  const handleSave = async (values: ProjectFormValues, image?: File) => {
    setSaving(true);

    const loadingToast = toast.loading(
      isCreateRoute ? 'Project yaratilmoqda...' : 'Project yangilanmoqda...',
    );

    try {
      if (isCreateRoute) {
        await projectApi.create({
          values,
          image,
        });

        toast.success('Project muvaffaqiyatli yaratildi.', {
          id: loadingToast,
        });

        navigate(projectsPath, {
          replace: true,
        });

        if (page === 1) {
          loadProjects(1);
        } else {
          setPage(1);
        }

        return;
      }

      if (!editingProject) {
        throw new Error('Tahrirlanayotgan project topilmadi.');
      }

      const updatedProject = await projectApi.update({
        id: editingProject._id,
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

      setEditingProject(undefined);

      navigate(projectsPath, {
        replace: true,
      });

      toast.success('Project muvaffaqiyatli yangilandi.', {
        id: loadingToast,
      });
    } catch (error) {
      toast.error(
        getApiError(
          error,
          isCreateRoute
            ? 'Projectni yaratib bo‘lmadi.'
            : 'Projectni yangilab bo‘lmadi.',
        ),
        {
          id: loadingToast,
        },
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    const loadingToast = toast.loading('Project o‘chirilmoqda...');

    try {
      await projectApi.remove(deleteTarget._id);

      toast.success('Project muvaffaqiyatli o‘chirildi.', {
        id: loadingToast,
      });

      setDeleteTarget(undefined);

      if (projects.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        loadProjects(page);
      }
    } catch (error) {
      toast.error(getApiError(error, 'Projectni o‘chirib bo‘lmadi.'), {
        id: loadingToast,
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="projects-page">
      <div className="page-heading">
        <div>
          <Typography.Title level={2}>Loyihalar</Typography.Title>

          <Typography.Text type="secondary">
            Portfolio loyihalarini yaratish, tahrirlash va o‘chirish.
          </Typography.Text>
        </div>

        <div className="projects-heading-actions">
          <Button
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={() => loadProjects(page)}
          >
            Yangilash
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(`${projectsPath}/create`)}
          >
            Project yaratish
          </Button>
        </div>
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
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(`${projectsPath}/create`)}
          >
            Birinchi projectni yaratish
          </Button>
        </Empty>
      )}

      {!loading && !errorMessage && projects.length > 0 && (
        <>
          <div className="projects-admin-grid">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onEdit={openEditModal}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>

          {total > pageSize && (
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              showSizeChanger={false}
              onChange={(nextPage) => {
                setLoading(true);
                setPage(nextPage);
              }}
            />
          )}
        </>
      )}

      {isCreateRoute && (
        <ProjectEditModal
          key="create-project"
          mode="create"
          saving={saving}
          onCancel={closeProjectModal}
          onSave={handleSave}
        />
      )}

      {isEditRoute && editingProject && (
        <ProjectEditModal
          key={editingProject._id}
          mode="edit"
          project={editingProject}
          saving={saving}
          onCancel={closeProjectModal}
          onSave={handleSave}
        />
      )}

      <Modal
        open={Boolean(deleteTarget)}
        centered
        title="Projectni o‘chirish"
        okText="Ha, o‘chirish"
        cancelText="Bekor qilish"
        confirmLoading={deleting}
        closable={!deleting}
        maskClosable={!deleting}
        keyboard={!deleting}
        okButtonProps={{
          danger: true,
        }}
        onCancel={() => {
          if (!deleting) {
            setDeleteTarget(undefined);
          }
        }}
        onOk={() => void handleDelete()}
      >
        <p>
          <strong>{deleteTarget?.title}</strong> projectini butunlay
          o‘chirmoqchimisiz?
        </p>

        <Typography.Text type="secondary">
          Project va unga tegishli rasm ham o‘chiriladi. Bu amalni ortga
          qaytarib bo‘lmaydi.
        </Typography.Text>
      </Modal>
    </div>
  );
}
