import {
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Empty, Input, Modal, Spin, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getApiError } from '../../../shared/utils/getApiError';
import { faqApi } from '../../api/faqApi';
import { FaqFormModal } from '../../components/faq/FaqFormModal';
import { FaqItemCard } from '../../components/faq/FaqItemCard';
import type { Faq, FaqFormValues } from '../../types/faq.types';

export function FaqPage() {
  const [modal, modalContext] = Modal.useModal();

  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadFaqs = useCallback(async () => {
    setLoading(true);

    try {
      const response = await faqApi.getAll();
      setFaqs(response.data);
    } catch (error) {
      toast.error(getApiError(error, 'FAQ ro‘yxatini yuklab bo‘lmadi.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    faqApi
      .getAll()
      .then((response) => {
        if (active) {
          setFaqs(response.data);
        }
      })
      .catch((error: unknown) => {
        if (!active) return;

        toast.error(getApiError(error, 'FAQ ro‘yxatini yuklab bo‘lmadi.'));
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

  const visibleFaqs = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    if (!query) {
      return faqs;
    }

    return faqs.filter(
      (faq) =>
        faq.question.toLocaleLowerCase().includes(query) ||
        faq.answer.toLocaleLowerCase().includes(query),
    );
  }, [faqs, search]);

  const openCreate = () => {
    setEditingFaq(null);
    setFormOpen(true);
  };

  const openEdit = (faq: Faq) => {
    setEditingFaq(faq);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingFaq(null);
  };

  const handleSubmit = async (values: FaqFormValues): Promise<void> => {
    setSaving(true);

    const toastId = toast.loading(
      editingFaq ? 'FAQ yangilanmoqda...' : 'FAQ yaratilmoqda...',
    );

    try {
      if (editingFaq) {
        await faqApi.update(editingFaq._id, values);

        toast.success('FAQ muvaffaqiyatli yangilandi.', {
          id: toastId,
        });
      } else {
        await faqApi.create(values);

        toast.success('Yangi FAQ yaratildi.', {
          id: toastId,
        });
      }

      closeForm();
      await loadFaqs();
    } catch (error) {
      toast.error(
        getApiError(
          error,
          editingFaq ? 'FAQni yangilab bo‘lmadi.' : 'FAQni yaratib bo‘lmadi.',
        ),
        {
          id: toastId,
        },
      );

      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (faq: Faq) => {
    modal.confirm({
      title: 'FAQ o‘chirilsinmi?',
      content: (
        <span>
          <strong>{faq.question}</strong> savoli va uning javobi butunlay
          o‘chiriladi.
        </span>
      ),
      icon: <DeleteOutlined />,
      okText: 'O‘chirish',
      cancelText: 'Bekor qilish',
      okButtonProps: {
        danger: true,
      },
      async onOk() {
        const toastId = toast.loading('FAQ o‘chirilmoqda...');

        try {
          await faqApi.remove(faq._id);

          setFaqs((current) => current.filter((item) => item._id !== faq._id));

          toast.success('FAQ o‘chirildi.', {
            id: toastId,
          });
        } catch (error) {
          toast.error(getApiError(error, 'FAQni o‘chirib bo‘lmadi.'), {
            id: toastId,
          });

          throw error;
        }
      },
    });
  };

  return (
    <div className="faq-page">
      {modalContext}

      <div className="page-heading faq-page-heading">
        <div>
          <Typography.Title level={2}>FAQ boshqaruvi</Typography.Title>

          <Typography.Text type="secondary">
            Public saytdagi tez-tez so‘raladigan savollarni boshqarish.
          </Typography.Text>
        </div>

        <div className="faq-heading-actions">
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            FAQ yaratish
          </Button>

          <Button
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={() => void loadFaqs()}
          >
            Yangilash
          </Button>
        </div>
      </div>

      <div className="faq-stats">
        <div>
          <span>Jami FAQ</span>
          <strong>{faqs.length}</strong>
        </div>

        <div>
          <span>Ko‘rsatilmoqda</span>
          <strong>{visibleFaqs.length}</strong>
        </div>
      </div>

      <div className="faq-toolbar">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          value={search}
          placeholder="Savol yoki javob bo‘yicha qidirish"
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <Spin spinning={loading}>
        {!loading && visibleFaqs.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              search
                ? 'Qidiruv bo‘yicha FAQ topilmadi'
                : 'FAQ hali yaratilmagan'
            }
          >
            {!search && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                Birinchi FAQni yaratish
              </Button>
            )}
          </Empty>
        ) : (
          <div className="faq-grid">
            {visibleFaqs.map((faq) => (
              <FaqItemCard
                key={faq._id}
                faq={faq}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </Spin>

      <FaqFormModal
        key={editingFaq?._id ?? 'create'}
        open={formOpen}
        loading={saving}
        faq={editingFaq}
        onCancel={closeForm}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
