import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  MailOutlined,
  SaveOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Card, Form, Input } from 'antd';
import type { Admin } from '../../types/auth';
import type { ProfileUpdateValues } from '../../types/profile.types';

interface ProfileFormValues {
  username: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

interface ProfileFormProps {
  admin: Admin;
  saving: boolean;
  onSubmit: (values: ProfileUpdateValues) => Promise<Admin>;
}

export function ProfileForm({ admin, saving, onSubmit }: ProfileFormProps) {
  const [form] = Form.useForm<ProfileFormValues>();

  const handleSubmit = async () => {
    const values = await form.validateFields();

    const updatedAdmin = await onSubmit({
      username: values.username.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password || undefined,
    });

    form.setFieldsValue({
      username: updatedAdmin.username,
      email: updatedAdmin.email,
      password: undefined,
      confirmPassword: undefined,
    });
  };

  return (
    <Card bordered={false} className="profile-form-card">
      <div className="profile-form-heading">
        <div>
          <h2>Shaxsiy ma’lumotlar</h2>
          <p>Username, email va kirish parolini boshqaring.</p>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{
          username: admin.username,
          email: admin.email,
          password: '',
          confirmPassword: '',
        }}
        className="profile-form"
      >
        <div className="profile-form-grid">
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
                message:
                  'Faqat harf, raqam, nuqta, pastki chiziq va defis mumkin.',
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              autoComplete="username"
              disabled={saving}
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
              autoComplete="email"
              disabled={saving}
            />
          </Form.Item>
        </div>

        <div className="profile-security-section">
          <div className="profile-security-heading">
            <LockOutlined />

            <div>
              <h3>Parolni o‘zgartirish</h3>
              <p>
                Parolni o‘zgartirmoqchi bo‘lmasangiz, maydonlarni bo‘sh
                qoldiring.
              </p>
            </div>
          </div>

          <div className="profile-form-grid">
            <Form.Item
              name="password"
              label="Yangi parol"
              rules={[
                {
                  validator(_, value: string | undefined) {
                    if (!value || value.length >= 8) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error(
                        'Yangi parol kamida 8 ta belgidan iborat bo‘lsin.',
                      ),
                    );
                  },
                },
                {
                  max: 128,
                  message: 'Parol 128 ta belgidan oshmasin.',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Yangi parol"
                autoComplete="new-password"
                disabled={saving}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Yangi parolni tasdiqlash"
              dependencies={['password']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value: string | undefined) {
                    const password = getFieldValue('password');

                    if (!password && !value) {
                      return Promise.resolve();
                    }

                    if (password === value) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error('Yangi parollar bir xil emas.'),
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Yangi parolni qayta kiriting"
                autoComplete="new-password"
                disabled={saving}
              />
            </Form.Item>
          </div>
        </div>

        <div className="profile-form-actions">
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={() => void handleSubmit()}
          >
            O‘zgarishlarni saqlash
          </Button>
        </div>
      </Form>
    </Card>
  );
}
