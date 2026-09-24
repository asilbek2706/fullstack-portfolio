import { PhoneOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { Form, Input, Modal } from 'antd';

export interface CreateContactValues {
  name: string;
  phone: string;
  message: string;
}

interface CreateContactModalProps {
  open: boolean;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateContactValues) => Promise<void>;
}

export function CreateContactModal({
  open,
  loading,
  onCancel,
  onSubmit,
}: CreateContactModalProps) {
  const [form] = Form.useForm<CreateContactValues>();

  const handleCancel = () => {
    if (loading) return;

    form.resetFields();
    onCancel();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();

    await onSubmit({
      name: values.name.trim(),
      phone: values.phone.trim(),
      message: values.message.trim(),
    });

    form.resetFields();
  };

  return (
    <Modal
      open={open}
      title={
        <span className="create-contact-title">
          <SendOutlined />
          Yangi murojaat yaratish
        </span>
      }
      okText="Murojaat yuborish"
      cancelText="Bekor qilish"
      confirmLoading={loading}
      closable={!loading}
      maskClosable={!loading}
      okButtonProps={{
        icon: <SendOutlined />,
      }}
      onCancel={handleCancel}
      onOk={() => void handleSubmit()}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        className="create-contact-form"
      >
        <Form.Item
          name="name"
          label="Ism"
          rules={[
            {
              required: true,
              whitespace: true,
              message: 'Ismni kiriting.',
            },
            {
              min: 2,
              message: 'Ism kamida 2 ta belgidan iborat bo‘lishi kerak.',
            },
            {
              max: 50,
              message: 'Ism 50 ta belgidan oshmasligi kerak.',
            },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Ali Valiyev"
            autoComplete="name"
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Telefon raqami"
          rules={[
            {
              required: true,
              message: 'Telefon raqamini kiriting.',
            },
            {
              pattern: /^\+998\d{9}$/,
              message: 'Telefon +998XXXXXXXXX formatida bo‘lishi kerak.',
            },
          ]}
        >
          <Input
            prefix={<PhoneOutlined />}
            placeholder="+998901234567"
            autoComplete="tel"
            maxLength={13}
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          name="message"
          label="Xabar"
          rules={[
            {
              required: true,
              whitespace: true,
              message: 'Xabarni kiriting.',
            },
            {
              min: 5,
              message: 'Xabar kamida 5 ta belgidan iborat bo‘lishi kerak.',
            },
            {
              max: 1000,
              message: 'Xabar 1000 ta belgidan oshmasligi kerak.',
            },
          ]}
        >
          <Input.TextArea
            rows={6}
            showCount
            maxLength={1000}
            placeholder="Murojaat matnini yozing..."
            disabled={loading}
          />
        </Form.Item>

        <div className="recaptcha-disclosure">
          This site is protected by reCAPTCHA and the Google{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noreferrer"
          >
            Privacy Policy
          </a>{' '}
          and{' '}
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noreferrer"
          >
            Terms of Service
          </a>{' '}
          apply.
        </div>

        <div className="create-contact-hint">
          Murojaat Telegram botga yuboriladi va ro‘yxatda avtomatik paydo
          bo‘ladi.
        </div>
      </Form>
    </Modal>
  );
}
