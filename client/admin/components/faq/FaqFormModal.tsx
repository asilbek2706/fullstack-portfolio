import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Input, Modal } from 'antd';
import type { Faq, FaqFormValues } from '../../types/faq.types';

interface FaqFormModalProps {
  open: boolean;
  loading: boolean;
  faq: Faq | null;
  onCancel: () => void;
  onSubmit: (values: FaqFormValues) => Promise<void>;
}

export function FaqFormModal({
  open,
  loading,
  faq,
  onCancel,
  onSubmit,
}: FaqFormModalProps) {
  const [form] = Form.useForm<FaqFormValues>();
  const editing = faq !== null;

  const handleCancel = () => {
    if (loading) return;

    form.resetFields();
    onCancel();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();

    await onSubmit({
      question: values.question.trim(),
      answer: values.answer.trim(),
    });

    form.resetFields();
  };

  return (
    <Modal
      open={open}
      title={
        <span className="faq-modal-title">
          {editing ? <EditOutlined /> : <PlusOutlined />}
          {editing ? 'FAQni tahrirlash' : 'Yangi FAQ yaratish'}
        </span>
      }
      okText={editing ? 'O‘zgarishlarni saqlash' : 'FAQ yaratish'}
      cancelText="Bekor qilish"
      confirmLoading={loading}
      closable={!loading}
      maskClosable={!loading}
      onCancel={handleCancel}
      onOk={() => void handleSubmit()}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{
          question: faq?.question ?? '',
          answer: faq?.answer ?? '',
        }}
        className="faq-form"
      >
        <Form.Item
          name="question"
          label="Savol"
          rules={[
            {
              required: true,
              whitespace: true,
              message: 'Savolni kiriting.',
            },
            {
              min: 3,
              message: 'Savol kamida 3 ta belgidan iborat bo‘lishi kerak.',
            },
            {
              max: 300,
              message: 'Savol 300 ta belgidan oshmasligi kerak.',
            },
          ]}
        >
          <Input.TextArea
            autoSize={{
              minRows: 2,
              maxRows: 5,
            }}
            showCount
            maxLength={300}
            placeholder="Foydalanuvchilar ko‘p so‘raydigan savol"
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          name="answer"
          label="Javob"
          rules={[
            {
              required: true,
              whitespace: true,
              message: 'Javobni kiriting.',
            },
            {
              min: 2,
              message: 'Javob kamida 2 ta belgidan iborat bo‘lishi kerak.',
            },
            {
              max: 3000,
              message: 'Javob 3000 ta belgidan oshmasligi kerak.',
            },
          ]}
        >
          <Input.TextArea
            rows={8}
            showCount
            maxLength={3000}
            placeholder="Savolga aniq va tushunarli javob yozing..."
            disabled={loading}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
