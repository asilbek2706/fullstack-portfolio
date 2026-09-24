import { SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Select, Upload } from 'antd';
import { useEffect, useState } from 'react';
import type { Project, ProjectFormValues } from '../../types/project.types';

const { TextArea } = Input;

interface ProjectEditModalProps {
  project: Project;
  saving: boolean;
  onCancel: () => void;
  onSave: (
    project: Project,
    values: ProjectFormValues,
    image?: File,
  ) => Promise<void>;
}

const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

const maximumImageSize = 5 * 1024 * 1024;

export function ProjectEditModal({
  project,
  saving,
  onCancel,
  onSave,
}: ProjectEditModalProps) {
  const [form] = Form.useForm<ProjectFormValues>();
  const [image, setImage] = useState<File>();
  const [imagePreview, setImagePreview] = useState<string>();
  const [imageError, setImageError] = useState('');

  useEffect(
    () => () => {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    },
    [imagePreview],
  );

  const selectImage = (selectedFile: File) => {
    setImageError('');

    if (!allowedImageTypes.includes(selectedFile.type)) {
      setImageError('Faqat JPG, PNG yoki WEBP rasm yuklash mumkin.');
      return Upload.LIST_IGNORE;
    }

    if (selectedFile.size > maximumImageSize) {
      setImageError('Rasm hajmi 5 MB dan oshmasligi kerak.');
      return Upload.LIST_IGNORE;
    }

    setImage(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile));

    return false;
  };

  const handleFinish = async (values: ProjectFormValues) => {
    await onSave(project, values, image);
  };

  return (
    <Modal
      open
      centered
      width={760}
      title="Loyihani tahrirlash"
      className="project-edit-modal"
      maskClosable={!saving}
      keyboard={!saving}
      closable={!saving}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" disabled={saving} onClick={onCancel}>
          Bekor qilish
        </Button>,
        <Button
          key="save"
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={() => form.submit()}
        >
          O‘zgarishlarni saqlash
        </Button>,
      ]}
    >
      <Form<ProjectFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{
          title: project.title,
          description: project.description,
          technologies: project.technologies,
          githubLink: project.githubLink,
          demoLink: project.demoLink || '',
        }}
        onFinish={handleFinish}
      >
        <div className="project-edit-image">
          <img src={imagePreview || project.image} alt={project.title} />

          <div>
            <Upload
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              maxCount={1}
              showUploadList={false}
              beforeUpload={selectImage}
            >
              <Button icon={<UploadOutlined />}>Rasmni almashtirish</Button>
            </Upload>

            <span>JPG, PNG yoki WEBP. Maksimal hajm 5 MB.</span>

            {imageError && (
              <div className="project-field-error">{imageError}</div>
            )}
          </div>
        </div>

        <Form.Item
          label="Loyiha nomi"
          name="title"
          rules={[
            {
              required: true,
              message: 'Loyiha nomini kiriting.',
            },
            {
              min: 3,
              max: 120,
              message: '3–120 ta belgi bo‘lishi kerak.',
            },
          ]}
        >
          <Input maxLength={120} />
        </Form.Item>

        <Form.Item
          label="Tavsif"
          name="description"
          rules={[
            {
              required: true,
              message: 'Loyiha tavsifini kiriting.',
            },
            {
              min: 10,
              max: 3000,
              message: '10–3000 ta belgi bo‘lishi kerak.',
            },
          ]}
        >
          <TextArea rows={6} maxLength={3000} showCount />
        </Form.Item>

        <Form.Item
          label="Texnologiyalar"
          name="technologies"
          rules={[
            {
              required: true,
              message: 'Kamida bitta texnologiya kiriting.',
            },
            {
              validator: async (_, values: string[]) => {
                if (!values || values.length < 1) {
                  throw new Error('Kamida bitta texnologiya kiriting.');
                }

                if (values.length > 4) {
                  throw new Error('Maksimal 4 ta texnologiya mumkin.');
                }

                const normalized = values.map((value) =>
                  value.trim().toLowerCase(),
                );

                if (new Set(normalized).size !== normalized.length) {
                  throw new Error('Texnologiyalar takrorlanmasligi kerak.');
                }
              },
            },
          ]}
        >
          <Select
            mode="tags"
            maxCount={4}
            tokenSeparators={[',']}
            placeholder="React, TypeScript..."
          />
        </Form.Item>

        <Form.Item
          label="GitHub havolasi"
          name="githubLink"
          rules={[
            {
              required: true,
              message: 'GitHub havolasini kiriting.',
            },
            {
              validator: async (_, value: string) => {
                try {
                  const url = new URL(value);

                  if (
                    !['github.com', 'www.github.com'].includes(
                      url.hostname.toLowerCase(),
                    )
                  ) {
                    throw new Error();
                  }
                } catch {
                  throw new Error('To‘g‘ri github.com havolasini kiriting.');
                }
              },
            },
          ]}
        >
          <Input placeholder="https://github.com/..." />
        </Form.Item>

        <Form.Item
          label="Demo havolasi"
          name="demoLink"
          rules={[
            {
              type: 'url',
              message: 'To‘g‘ri URL kiriting.',
            },
          ]}
        >
          <Input placeholder="https://example.com" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
