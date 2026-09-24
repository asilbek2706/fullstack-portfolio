import { SaveOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import { useEffect, useState } from 'react';
import type { About, AboutFormValues } from '../../types/about.types';
import { AvatarUploader } from './AvatarUploader';

const { TextArea } = Input;

interface AboutEditorProps {
  about: About | null;
  saving: boolean;
  onSubmit: (values: AboutFormValues, avatar?: File) => Promise<void>;
}

export function AboutEditor({ about, saving, onSubmit }: AboutEditorProps) {
  const [form] = Form.useForm<AboutFormValues>();
  const [avatar, setAvatar] = useState<File>();
  const [avatarError, setAvatarError] = useState('');

  useEffect(() => {
    if (about) {
      form.setFieldsValue({
        fullName: about.fullName,
        title: about.title,
        bio: about.bio,
        experienceYears: about.experienceYears,
      });
    } else {
      form.resetFields();
    }
  }, [about, form]);

  const handleSubmit = async (values: AboutFormValues) => {
    if (!about && !avatar) {
      setAvatarError('Birinchi yaratishda profil rasmi majburiy.');
      return;
    }

    setAvatarError('');
    await onSubmit(values, avatar);
    setAvatar(undefined);
  };

  return (
    <section className="about-module">
      <header className="about-module-header">
        <h2>About ma’lumotlarini tahrirlash</h2>
      </header>

      <div className="about-module-body">
        <Form<AboutFormValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
        >
          <Form.Item label="Profil rasmi">
            <AvatarUploader
              currentAvatar={about?.avatar}
              file={avatar}
              required={!about}
              onChange={(nextFile) => {
                setAvatar(nextFile);

                if (nextFile) {
                  setAvatarError('');
                }
              }}
            />

            {avatarError && (
              <div className="about-field-error">{avatarError}</div>
            )}
          </Form.Item>

          <div className="about-form-grid">
            <Form.Item
              label="Ism va familiya"
              name="fullName"
              rules={[
                {
                  required: true,
                  message: 'Ism va familiyani kiriting.',
                },
                {
                  min: 2,
                  max: 120,
                  message: '2–120 ta belgi oralig‘ida bo‘lishi kerak.',
                },
              ]}
            >
              <Input maxLength={120} placeholder="Asilbek Karomatov" />
            </Form.Item>

            <Form.Item
              label="Kasbiy unvon"
              name="title"
              rules={[
                {
                  required: true,
                  message: 'Kasbiy unvonni kiriting.',
                },
                {
                  min: 2,
                  max: 120,
                  message: '2–120 ta belgi oralig‘ida bo‘lishi kerak.',
                },
              ]}
            >
              <Input maxLength={120} placeholder="Full-stack developer" />
            </Form.Item>
          </div>

          <Form.Item
            label="Tajriba"
            name="experienceYears"
            rules={[
              {
                required: true,
                message: 'Tajriba qiymatini kiriting.',
              },
              {
                max: 50,
                message: '50 ta belgidan oshmasligi kerak.',
              },
            ]}
          >
            <Input maxLength={50} placeholder="3+ yil" />
          </Form.Item>

          <Form.Item
            label="Biografiya"
            name="bio"
            rules={[
              {
                required: true,
                message: 'Biografiyani kiriting.',
              },
              {
                min: 10,
                max: 3000,
                message: '10–3000 ta belgi oralig‘ida bo‘lishi kerak.',
              },
            ]}
          >
            <TextArea
              rows={8}
              maxLength={3000}
              showCount
              placeholder="O‘zingiz haqingizda yozing..."
            />
          </Form.Item>

          <div className="about-form-actions">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={saving}
            >
              Ma’lumotlarni saqlash
            </Button>
          </div>
        </Form>
      </div>
    </section>
  );
}
