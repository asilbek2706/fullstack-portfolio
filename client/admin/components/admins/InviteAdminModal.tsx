import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  MailOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Form, Input, Modal } from 'antd';
import type { InviteAdminValues } from '../../types/adminManagement.types';

interface InviteFormValues extends InviteAdminValues {
  confirmPassword: string;
}

interface InviteAdminModalProps {
  open: boolean;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (values: InviteAdminValues) => Promise<void>;
}

export function InviteAdminModal({
  open,
  loading,
  onCancel,
  onSubmit,
}: InviteAdminModalProps) {
  const [form] = Form.useForm<InviteFormValues>();

  const handleCancel = () => {
    if (loading) return;

    form.resetFields();
    onCancel();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();

    await onSubmit({
      username: values.username.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
    });

    form.resetFields();
  };

  return (
    <Modal
      open={open}
      title={
        <span className="admin-modal-title">
          <SafetyCertificateOutlined />
          Yangi admin taklif qilish
        </span>
      }
      okText="Admin yaratish"
      cancelText="Bekor qilish"
      confirmLoading={loading}
      closable={!loading}
      maskClosable={!loading}
      onCancel={handleCancel}
      onOk={() => void handleSubmit()}
    >
      <div className="admin-invite-notice">
        Yangi hisob oddiy <strong>admin</strong> roli bilan yaratiladi.
      </div>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        className="admin-form"
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[
            {
              required: true,
              whitespace: true,
              message: 'Username kiriting.',
            },
            {
              min: 3,
              message: 'Username kamida 3 ta belgidan iborat bo‘lsin.',
            },
            {
              max: 32,
              message: 'Username 32 ta belgidan oshmasin.',
            },
            {
              pattern: /^[A-Za-z0-9._-]+$/,
              message:
                'Faqat harf, raqam, nuqta, pastki chiziq va defis mumkin.',
            },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="yangi.admin"
            autoComplete="off"
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              required: true,
              whitespace: true,
              message: 'Email manzilini kiriting.',
            },
            {
              type: 'email',
              message: 'To‘g‘ri email manzilini kiriting.',
            },
            {
              max: 254,
              message: 'Email 254 ta belgidan oshmasin.',
            },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="admin@example.com"
            autoComplete="off"
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Vaqtinchalik parol"
          rules={[
            {
              required: true,
              message: 'Vaqtinchalik parol kiriting.',
            },
            {
              min: 8,
              message: 'Parol kamida 8 ta belgidan iborat bo‘lsin.',
            },
            {
              max: 128,
              message: 'Parol 128 ta belgidan oshmasin.',
            },
          ]}
        >
          <Input.Password
            placeholder="Kamida 8 ta belgi"
            autoComplete="new-password"
            disabled={loading}
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Parolni tasdiqlash"
          dependencies={['password']}
          rules={[
            {
              required: true,
              message: 'Parolni qayta kiriting.',
            },
            ({ getFieldValue }) => ({
              validator(_, value: string) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }

                return Promise.reject(
                  new Error('Kiritilgan parollar bir xil emas.'),
                );
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="Parolni qayta kiriting"
            autoComplete="new-password"
            disabled={loading}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
