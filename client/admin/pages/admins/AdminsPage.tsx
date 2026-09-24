import {
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  Button,
  Empty,
  Input,
  Modal,
  Pagination,
  Spin,
  Typography,
} from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getApiError } from '../../../shared/utils/getApiError';
import { adminApi } from '../../api/adminApi';
import { AdminAccountCard } from '../../components/admins/AdminAccountCard';
import { EditAdminModal } from '../../components/admins/EditAdminModal';
import { InviteAdminModal } from '../../components/admins/InviteAdminModal';
import type {
  AdminPagination,
  InviteAdminValues,
  ManagedAdmin,
  UpdateAdminValues,
} from '../../types/adminManagement.types';

const initialPagination: AdminPagination = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
};

export function AdminsPage() {
  const [modal, modalContext] = Modal.useModal();

  const [admins, setAdmins] = useState<ManagedAdmin[]>([]);
  const [pagination, setPagination] =
    useState<AdminPagination>(initialPagination);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<ManagedAdmin | null>(null);

  const loadAdmins = useCallback(
    async (page = pagination.page, limit = pagination.limit): Promise<void> => {
      setLoading(true);

      try {
        const response = await adminApi.getAll({
          page,
          limit,
        });

        setAdmins(response.data);
        setPagination(response.pagination);
      } catch (error) {
        toast.error(getApiError(error, 'Administratorlarni yuklab bo‘lmadi.'));
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit, pagination.page],
  );

  useEffect(() => {
    let active = true;

    adminApi
      .getAll({
        page: pagination.page,
        limit: pagination.limit,
      })
      .then((response) => {
        if (!active) return;

        setAdmins(response.data);
        setPagination(response.pagination);
      })
      .catch((error: unknown) => {
        if (!active) return;

        toast.error(getApiError(error, 'Administratorlarni yuklab bo‘lmadi.'));
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [pagination.limit, pagination.page]);

  const visibleAdmins = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    if (!query) return admins;

    return admins.filter(
      (admin) =>
        admin.username.toLocaleLowerCase().includes(query) ||
        admin.email.toLocaleLowerCase().includes(query) ||
        admin.role.toLocaleLowerCase().includes(query),
    );
  }, [admins, search]);

  const ordinaryAdmins = admins.filter(
    (admin) => admin.role === 'admin',
  ).length;

  const superadmins = admins.filter(
    (admin) => admin.role === 'superadmin',
  ).length;

  const closeInvite = () => {
    if (!saving) {
      setInviteOpen(false);
    }
  };

  const closeEdit = () => {
    if (!saving) {
      setEditingAdmin(null);
    }
  };

  const handleInvite = async (values: InviteAdminValues): Promise<void> => {
    setSaving(true);

    const toastId = toast.loading('Yangi admin yaratilmoqda...');

    try {
      await adminApi.invite(values);

      toast.success('Yangi oddiy admin yaratildi.', {
        id: toastId,
      });

      setInviteOpen(false);

      if (pagination.page === 1) {
        await loadAdmins(1, pagination.limit);
      } else {
        setPagination((current) => ({
          ...current,
          page: 1,
        }));
      }
    } catch (error) {
      toast.error(getApiError(error, 'Yangi adminni yaratib bo‘lmadi.'), {
        id: toastId,
      });

      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (values: UpdateAdminValues): Promise<void> => {
    if (!editingAdmin) return;

    setSaving(true);

    const toastId = toast.loading('Admin yangilanmoqda...');

    try {
      const updatedAdmin = await adminApi.update(editingAdmin._id, values);

      setAdmins((current) =>
        current.map((admin) =>
          admin._id === updatedAdmin._id ? updatedAdmin : admin,
        ),
      );

      setEditingAdmin(null);

      toast.success('Admin ma’lumotlari yangilandi.', {
        id: toastId,
      });
    } catch (error) {
      toast.error(
        getApiError(error, 'Admin ma’lumotlarini yangilab bo‘lmadi.'),
        {
          id: toastId,
        },
      );

      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (admin: ManagedAdmin) => {
    if (admin.role === 'superadmin') return;

    modal.confirm({
      title: 'Admin hisobi o‘chirilsinmi?',
      icon: <DeleteOutlined />,
      content: (
        <div className="admin-delete-content">
          <p>
            <strong>{admin.username}</strong> hisobini butunlay o‘chirmoqchisiz.
          </p>

          <span>{admin.email}</span>
        </div>
      ),
      okText: 'Adminni o‘chirish',
      cancelText: 'Bekor qilish',
      okButtonProps: {
        danger: true,
      },
      async onOk() {
        const toastId = toast.loading('Admin o‘chirilmoqda...');

        try {
          await adminApi.remove(admin._id);

          toast.success('Admin hisobi o‘chirildi.', {
            id: toastId,
          });

          if (admins.length === 1 && pagination.page > 1) {
            setPagination((current) => ({
              ...current,
              page: current.page - 1,
            }));
          } else {
            await loadAdmins();
          }
        } catch (error) {
          toast.error(getApiError(error, 'Admin hisobini o‘chirib bo‘lmadi.'), {
            id: toastId,
          });

          throw error;
        }
      },
    });
  };

  return (
    <div className="admins-page">
      {modalContext}

      <div className="page-heading admins-page-heading">
        <div>
          <Typography.Title level={2}>Administratorlar</Typography.Title>

          <Typography.Text type="secondary">
            Admin hisoblarini yaratish, tahrirlash va xavfsiz boshqarish.
          </Typography.Text>
        </div>

        <div className="admins-heading-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setInviteOpen(true)}
          >
            Admin taklif qilish
          </Button>

          <Button
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={() => void loadAdmins()}
          >
            Yangilash
          </Button>
        </div>
      </div>

      <div className="admins-stats">
        <div>
          <span>Jami hisoblar</span>
          <strong>{pagination.total}</strong>
        </div>

        <div>
          <span>Joriy sahifadagi adminlar</span>
          <strong>{ordinaryAdmins}</strong>
        </div>

        <div>
          <span>Joriy sahifadagi superadminlar</span>
          <strong>{superadmins}</strong>
        </div>
      </div>

      <div className="admins-toolbar">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          value={search}
          placeholder="Username, email yoki rol bo‘yicha qidirish"
          onChange={(event) => setSearch(event.target.value)}
        />

        <span>
          <TeamOutlined />
          Qidiruv joriy yuklangan sahifaga qo‘llanadi
        </span>
      </div>

      <Spin spinning={loading}>
        {!loading && visibleAdmins.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              search
                ? 'Qidiruv bo‘yicha administrator topilmadi'
                : 'Administratorlar mavjud emas'
            }
          />
        ) : (
          <div className="admins-grid">
            {visibleAdmins.map((admin) => (
              <AdminAccountCard
                key={admin._id}
                admin={admin}
                onEdit={setEditingAdmin}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </Spin>

      {pagination.totalPages > 1 && (
        <div className="admins-pagination">
          <Pagination
            current={pagination.page}
            pageSize={pagination.limit}
            total={pagination.total}
            showSizeChanger
            pageSizeOptions={[6, 12, 20, 50]}
            showTotal={(total) => `${total} ta administrator`}
            onChange={(page, limit) => {
              setPagination((current) => ({
                ...current,
                page,
                limit,
              }));
            }}
          />
        </div>
      )}

      <InviteAdminModal
        open={inviteOpen}
        loading={saving}
        onCancel={closeInvite}
        onSubmit={handleInvite}
      />

      <EditAdminModal
        key={editingAdmin?._id ?? 'closed'}
        open={editingAdmin !== null}
        loading={saving}
        admin={editingAdmin}
        onCancel={closeEdit}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
