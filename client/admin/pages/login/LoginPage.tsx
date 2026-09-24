import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input, Typography } from 'antd';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getApiError } from '../../../shared/utils/getApiError';
import { useAuth } from '../../auth/useAuth';
import { BrandLogo } from '../../components/brand/BrandLogo';
import { ThemeSwitcher } from '../../components/header/ThemeSwitcher';
import type { LoginCredentials } from '../../types/auth';

type LocationState = {
  from?: string;
};

export function LoginPage() {
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (credentials: LoginCredentials) => {
    setErrorMessage('');

    try {
      await login(credentials);

      const state = location.state as LocationState | null;

      navigate(state?.from || '/admin/dashboard', {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(getApiError(error, 'Username yoki parol noto‘g‘ri.'));
    }
  };

  return (
    <main className="login-page">
      <div className="login-theme-control">
        <ThemeSwitcher />
      </div>

      <section className="portfolio-login">
        <header className="portfolio-login-header">
          <BrandLogo size={42} />

          <div>
            <Typography.Title level={1}>
              Portfolio administration
            </Typography.Title>

            <Typography.Text>Boshqaruv paneli</Typography.Text>
          </div>
        </header>

        <div className="portfolio-login-body">
          <Typography.Title level={2}>Tizimga kirish</Typography.Title>

          <Typography.Paragraph type="secondary">
            Administrator hisobingizdan foydalaning.
          </Typography.Paragraph>

          {errorMessage && (
            <Alert
              type="error"
              showIcon
              message={errorMessage}
              className="login-alert"
            />
          )}

          <Form<LoginCredentials>
            layout="vertical"
            requiredMark={false}
            onFinish={handleSubmit}
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[
                {
                  required: true,
                  message: 'Username kiriting.',
                },
              ]}
            >
              <Input
                size="large"
                prefix={<UserOutlined />}
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              label="Parol"
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Parolni kiriting.',
                },
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined />}
                autoComplete="current-password"
              />
            </Form.Item>

            <Button type="primary" htmlType="submit" size="large" block>
              Kirish
            </Button>
          </Form>
        </div>
      </section>
    </main>
  );
}
