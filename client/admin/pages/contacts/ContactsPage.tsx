import {
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Pagination,
  Segmented,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getApiError } from '../../../shared/utils/getApiError';
import { contactApi } from '../../api/contactApi';
import { useAuth } from '../../auth/useAuth';
import { ClearContactsModal } from '../../components/contacts/ClearContactsModal';
import {
  CreateContactModal,
  type CreateContactValues,
} from '../../components/contacts/CreateContactModal';
import { ContactDetailsDrawer } from '../../components/contacts/ContactDetailsDrawer';
import type { Contact } from '../../types/contact.types';
import { getContactRecaptchaToken } from '../../utils/recaptcha';

type ContactFilter = 'all' | 'waiting' | 'answered' | 'public';

export function ContactsPage() {
  const { admin } = useAuth();
  const [modal, modalContext] = Modal.useModal();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [filter, setFilter] = useState<ContactFilter>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [clearLoading, setClearLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [mutatingIds, setMutatingIds] = useState<Set<string>>(new Set());

  const isSuperAdmin = admin?.role === 'superadmin';

  const loadContacts = useCallback(async () => {
    setLoading(true);

    try {
      const response = await contactApi.getAll({
        page,
        limit: pageSize,
      });

      setContacts(response.data);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      toast.error(getApiError(error, 'Murojaatlarni yuklab bo‘lmadi.'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    let active = true;

    contactApi
      .getAll({
        page,
        limit: pageSize,
      })
      .then((response) => {
        if (!active) return;

        setContacts(response.data);
        setTotal(response.pagination.total);
        setTotalPages(response.pagination.totalPages);
      })
      .catch((error: unknown) => {
        if (!active) return;

        toast.error(getApiError(error, 'Murojaatlarni yuklab bo‘lmadi.'));
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [page, pageSize]);

  const visibleContacts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    return contacts.filter((contact) => {
      const matchesSearch =
        !normalizedSearch ||
        contact.name.toLocaleLowerCase().includes(normalizedSearch) ||
        contact.phone.includes(normalizedSearch) ||
        contact.message.toLocaleLowerCase().includes(normalizedSearch) ||
        contact.answer.toLocaleLowerCase().includes(normalizedSearch);

      if (!matchesSearch) return false;

      if (filter === 'waiting') return !contact.isAnswered;
      if (filter === 'answered') return contact.isAnswered;
      if (filter === 'public') return contact.isPublic;

      return true;
    });
  }, [contacts, filter, search]);

  const pageStats = useMemo(
    () => ({
      waiting: contacts.filter((contact) => !contact.isAnswered).length,
      answered: contacts.filter((contact) => contact.isAnswered).length,
      public: contacts.filter((contact) => contact.isPublic).length,
    }),
    [contacts],
  );

  const openDetails = (contact: Contact) => {
    setSelectedContact(contact);
    setDrawerOpen(true);
  };

  const setMutating = (id: string, value: boolean) => {
    setMutatingIds((current) => {
      const next = new Set(current);

      if (value) {
        next.add(id);
      } else {
        next.delete(id);
      }

      return next;
    });
  };

  const handlePublication = async (contact: Contact, isPublic: boolean) => {
    if (!isSuperAdmin) return;

    setMutating(contact._id, true);

    try {
      const response = await contactApi.setPublication(contact._id, isPublic);

      setContacts((current) =>
        current.map((item) =>
          item._id === contact._id
            ? {
                ...item,
                isPublic: response.data.isPublic,
              }
            : item,
        ),
      );

      setSelectedContact((current) =>
        current?._id === contact._id
          ? {
              ...current,
              isPublic: response.data.isPublic,
            }
          : current,
      );

      toast.success(
        isPublic
          ? 'Javob public qilindi.'
          : 'Javob public ro‘yxatdan yashirildi.',
      );
    } catch (error) {
      toast.error(
        getApiError(error, 'Publication holatini o‘zgartirib bo‘lmadi.'),
      );
    } finally {
      setMutating(contact._id, false);
    }
  };

  const handleDelete = (contact: Contact) => {
    if (!isSuperAdmin) return;

    modal.confirm({
      title: 'Murojaat o‘chirilsinmi?',
      content: (
        <span>
          <strong>{contact.name}</strong> yuborgan murojaat va uning javobi
          butunlay o‘chiriladi.
        </span>
      ),
      okText: 'O‘chirish',
      cancelText: 'Bekor qilish',
      okButtonProps: {
        danger: true,
      },
      async onOk() {
        const toastId = toast.loading('Murojaat o‘chirilmoqda...');

        try {
          await contactApi.remove(contact._id);

          toast.success('Murojaat o‘chirildi.', {
            id: toastId,
          });

          if (contacts.length === 1 && page > 1) {
            setPage((current) => current - 1);
          } else {
            await loadContacts();
          }
        } catch (error) {
          toast.error(getApiError(error, 'Murojaatni o‘chirib bo‘lmadi.'), {
            id: toastId,
          });

          throw error;
        }
      },
    });
  };

  const handleCreate = async (values: CreateContactValues): Promise<void> => {
    setCreateLoading(true);
    const toastId = toast.loading(
      'reCAPTCHA tekshirilmoqda va murojaat yuborilmoqda...',
    );

    try {
      const recaptchaToken = await getContactRecaptchaToken();

      await contactApi.create({
        ...values,
        recaptchaToken,
      });

      setCreateModalOpen(false);

      toast.success('Murojaat muvaffaqiyatli yuborildi.', {
        id: toastId,
      });

      if (page !== 1) {
        setLoading(true);
        setPage(1);
      } else {
        await loadContacts();
      }
    } catch (error) {
      toast.error(getApiError(error, 'Murojaatni yuborib bo‘lmadi.'), {
        id: toastId,
      });

      throw error;
    } finally {
      setCreateLoading(false);
    }
  };

  const handleClearAll = async (password: string) => {
    setClearLoading(true);
    const toastId = toast.loading('Murojaatlar tozalanmoqda...');

    try {
      const response = await contactApi.clearAll({
        confirmation: 'DELETE_ALL_CONTACTS',
        password,
      });

      setClearModalOpen(false);
      setPage(1);
      setContacts([]);
      setTotal(0);
      setTotalPages(0);

      toast.success(`${response.deletedCount} ta murojaat o‘chirildi.`, {
        id: toastId,
      });

      await loadContacts();
    } catch (error) {
      toast.error(getApiError(error, 'Murojaatlarni tozalab bo‘lmadi.'), {
        id: toastId,
      });

      throw error;
    } finally {
      setClearLoading(false);
    }
  };

  const columns: ColumnsType<Contact> = [
    {
      title: 'Foydalanuvchi',
      key: 'user',
      width: 210,
      render: (_, contact) => (
        <div className="contact-user-cell">
          <div className="contact-table-avatar">
            {contact.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{contact.name}</strong>
            <a href={`tel:${contact.phone}`}>{contact.phone}</a>
          </div>
        </div>
      ),
    },
    {
      title: 'Xabar',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (message: string) => (
        <Typography.Text
          className="contact-message-preview"
          ellipsis={{
            tooltip: message,
          }}
        >
          {message}
        </Typography.Text>
      ),
    },
    {
      title: 'Javob holati',
      key: 'answerStatus',
      width: 150,
      render: (_, contact) => (
        <Tag color={contact.isAnswered ? 'success' : 'warning'}>
          {contact.isAnswered ? 'Javob berilgan' : 'Kutilmoqda'}
        </Tag>
      ),
    },
    {
      title: 'Public',
      key: 'publication',
      width: 105,
      align: 'center',
      render: (_, contact) =>
        isSuperAdmin ? (
          <Tooltip
            title={
              !contact.isAnswered
                ? 'Faqat javob berilgan murojaat public qilinadi.'
                : contact.isPublic
                  ? 'Public ro‘yxatdan yashirish'
                  : 'Public qilish'
            }
          >
            <Switch
              size="small"
              checked={contact.isPublic}
              disabled={
                mutatingIds.has(contact._id) ||
                (!contact.isAnswered && !contact.isPublic)
              }
              loading={mutatingIds.has(contact._id)}
              onChange={(checked) => void handlePublication(contact, checked)}
            />
          </Tooltip>
        ) : (
          <Tag color={contact.isPublic ? 'processing' : 'default'}>
            {contact.isPublic ? 'Public' : 'Yashirin'}
          </Tag>
        ),
    },
    {
      title: 'Sana',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 145,
      render: (createdAt: string) => (
        <time dateTime={createdAt}>
          {dayjs(createdAt).format('DD.MM.YYYY HH:mm')}
        </time>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: isSuperAdmin ? 100 : 56,
      align: 'right',
      render: (_, contact) => (
        <Space size={4}>
          <Tooltip title="Batafsil ko‘rish">
            <Button
              type="text"
              icon={<EyeOutlined />}
              aria-label={`${contact.name} murojaatini ko‘rish`}
              onClick={() => openDetails(contact)}
            />
          </Tooltip>

          {isSuperAdmin && (
            <Tooltip title="O‘chirish">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                aria-label={`${contact.name} murojaatini o‘chirish`}
                onClick={() => handleDelete(contact)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="contacts-page">
      {modalContext}

      <div className="page-heading contacts-page-heading">
        <div>
          <Typography.Title level={2}>Murojaatlar</Typography.Title>
          <Typography.Text type="secondary">
            Saytdan kelgan xabarlar va Telegram javoblarini boshqarish.
          </Typography.Text>
        </div>

        <Space wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            Murojaat yaratish
          </Button>

          <Button
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={() => void loadContacts()}
          >
            Yangilash
          </Button>

          {isSuperAdmin && (
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={total === 0}
              onClick={() => setClearModalOpen(true)}
            >
              Barchasini tozalash
            </Button>
          )}
        </Space>
      </div>

      <div className="contact-stat-grid">
        <Card size="small">
          <span>Jami murojaatlar</span>
          <strong>{total}</strong>
        </Card>

        <Card size="small">
          <span>Joriy sahifada kutilmoqda</span>
          <strong className="contact-stat-warning">{pageStats.waiting}</strong>
        </Card>

        <Card size="small">
          <span>Joriy sahifada javob berilgan</span>
          <strong className="contact-stat-success">{pageStats.answered}</strong>
        </Card>

        <Card size="small">
          <span>Joriy sahifada public</span>
          <strong className="contact-stat-info">{pageStats.public}</strong>
        </Card>
      </div>

      <Card bordered={false} className="contacts-table-card">
        <div className="contacts-toolbar">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Ism, telefon, xabar yoki javob bo‘yicha qidirish"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <Segmented<ContactFilter>
            value={filter}
            onChange={setFilter}
            options={[
              {
                label: 'Barchasi',
                value: 'all',
              },
              {
                label: 'Kutilmoqda',
                value: 'waiting',
              },
              {
                label: 'Javob berilgan',
                value: 'answered',
              },
              {
                label: 'Public',
                value: 'public',
              },
            ]}
          />
        </div>

        <div className="contacts-filter-note">
          Qidiruv va status filtri joriy yuklangan sahifaga qo‘llanadi.
        </div>

        <Spin spinning={loading}>
          <Table<Contact>
            rowKey="_id"
            columns={columns}
            dataSource={visibleContacts}
            pagination={false}
            scroll={{
              x: 940,
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Mos murojaatlar topilmadi"
                />
              ),
            }}
          />
        </Spin>

        {total > 0 && (
          <div className="contacts-pagination">
            <span>
              {total} ta yozuv · {page}/{Math.max(totalPages, 1)} sahifa
            </span>

            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              showSizeChanger
              pageSizeOptions={[10, 20, 50, 100]}
              onChange={(nextPage, nextPageSize) => {
                if (nextPageSize !== pageSize) {
                  setPageSize(nextPageSize);
                  setPage(1);
                  return;
                }

                setPage(nextPage);
              }}
            />
          </div>
        )}
      </Card>

      <CreateContactModal
        open={createModalOpen}
        loading={createLoading}
        onCancel={() => setCreateModalOpen(false)}
        onSubmit={handleCreate}
      />

      <ContactDetailsDrawer
        contact={selectedContact}
        open={drawerOpen}
        canDelete={isSuperAdmin}
        onClose={() => setDrawerOpen(false)}
        onDelete={handleDelete}
      />

      {isSuperAdmin && (
        <ClearContactsModal
          open={clearModalOpen}
          loading={clearLoading}
          onCancel={() => setClearModalOpen(false)}
          onConfirm={handleClearAll}
        />
      )}
    </div>
  );
}
