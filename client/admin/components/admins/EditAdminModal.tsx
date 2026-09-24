import {
  EditOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Form, Input, Modal, Select } from 'antd';
import type {
  ManagedAdmin,
  UpdateAdminValues,
} from '../../types/adminManagement.types';

interface EditAdminModalProps {
  open: boolean;
  loading: boolean;
  admin: ManagedAdmin | null;
  onCancel: () => void;
  onSubmit: (values: UpdateAdminValues) => Promise<void>;
}

export function EditAdminModal({
  open,
  loading,
  admin,
  onCancel,
  onSubmit,
}: EditAdminModalProps) {
  const [form] = Form.useForm<UpdateAdminValues>();
  const protectedSuperadmin = admin?.role === 'superadmin';

  const handleSubmit = async () => {
    const values = await form.validateFields();

    await onSubmit({
      username: values.username.trim(),
      email: values.email.trim().toLowerCase(),
      role: values.role,
    });
  };

  return (
    <Modal
      open={open}
      title={
        <span className="admin-modal-title">
          <EditOutlined />
          Administratorni tahrirlash
        </span>
      }
      okText="O‘zgarishlarni saqlash"
      cancelText="Bekor qilish"
      confirmLoading={loading}
      closable={!loading}
      maskClosable={!loading}
      onCancel={onCancel}
      onOk={() => void handleSubmit()}
    >
      {protectedSuperadmin && (
        <div className="admin-protected-notice">
          <SafetyCertificateOutlined />
          Superadmin rolini pasaytirish mumkin emas.
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        className="admin-form"
        initialValues={{
          username: admin?.username ?? '',
          email: admin?.email ?? '',
          role: admin?.role ?? 'admin',
        }}
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
              max: 32,
              message: 'Username 3–32 ta belgidan iborat bo‘lsin.',
            },
            {
              pattern: /^[A-Za-z0-9._-]+$/,
              message: 'Username formati noto‘g‘ri.',
            },
          ]}
        >
          <Input prefix={<UserOutlined />} disabled={loading} />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              required: true,
              whitespace: true,
              message: 'Email kiriting.',
            },
            {
              type: 'email',
              message: 'To‘g‘ri email kiriting.',
            },
            {
              max: 254,
              message: 'Email 254 ta belgidan oshmasin.',
            },
          ]}
        >
          <Input prefix={<MailOutlined />} disabled={loading} />
        </Form.Item>

        <Form.Item
          name="role"
          label="Tizimdagi roli"
          rules={[
            {
              required: true,
              message: 'Admin rolini tanlang.',
            },
          ]}
        >
          <Select
            disabled={loading || protectedSuperadmin}
            options={[
              {
                value: 'admin',
                label: 'Admin',
              },
              {
                value: 'superadmin',
                label: 'Superadmin',
              },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
