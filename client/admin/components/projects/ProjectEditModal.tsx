import {
  PictureOutlined,
  PlusOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Button, Form, Input, Modal, Select, Upload } from 'antd';
import { useEffect, useState } from 'react';
import type { Project, ProjectFormValues } from '../../types/project.types';
import { ImageCropModal } from '../image/ImageCropModal';

const { TextArea } = Input;

interface ProjectEditModalProps {
  mode: 'create' | 'edit';
  project?: Project;
  saving: boolean;
  onCancel: () => void;
  onSave: (values: ProjectFormValues, image?: File) => Promise<void>;
}

const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

const maximumImageSize = 5 * 1024 * 1024;

export function ProjectEditModal({
  mode,
  project,
  saving,
  onCancel,
  onSave,
}: ProjectEditModalProps) {
  const [form] = Form.useForm<ProjectFormValues>();
  const [image, setImage] = useState<File>();
  const [imagePreview, setImagePreview] = useState<string>();
  const [cropSource, setCropSource] = useState<string>();
  const [cropFile, setCropFile] = useState<File>();
  const [imageError, setImageError] = useState('');

  const isCreate = mode === 'create';
  const previewUrl = imagePreview || project?.image;

  useEffect(
    () => () => {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    },
    [imagePreview],
  );

  useEffect(
    () => () => {
      if (cropSource?.startsWith('blob:')) {
        URL.revokeObjectURL(cropSource);
      }
    },
    [cropSource],
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

    setCropFile(selectedFile);
    setCropSource(URL.createObjectURL(selectedFile));

    return false;
  };

  const closeCropper = () => {
    setCropSource(undefined);
    setCropFile(undefined);
  };

  const applyCroppedImage = (croppedFile: File) => {
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(croppedFile);
    setImagePreview(URL.createObjectURL(croppedFile));
    setImageError('');
    closeCropper();
  };

  const handleFinish = async (values: ProjectFormValues) => {
    if (isCreate && !image) {
      setImageError('Yangi project uchun rasm yuklash majburiy.');
      return;
    }

    await onSave(values, image);
  };

  return (
    <>
      <Modal
        open
        centered
        width={760}
        title={isCreate ? 'Yangi project yaratish' : 'Projectni tahrirlash'}
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
            icon={isCreate ? <PlusOutlined /> : <SaveOutlined />}
            loading={saving}
            onClick={() => form.submit()}
          >
            {isCreate ? 'Project yaratish' : 'O‘zgarishlarni saqlash'}
          </Button>,
        ]}
      >
        <Form<ProjectFormValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{
            title: project?.title || '',
            description: project?.description || '',
            technologies: project?.technologies || [],
            githubLink: project?.githubLink || '',
            demoLink: project?.demoLink || '',
          }}
          onFinish={handleFinish}
        >
          <div className="project-edit-image">
            {previewUrl ? (
              <img src={previewUrl} alt={project?.title || 'Project preview'} />
            ) : (
              <div className="project-image-placeholder">
                <PictureOutlined />
                <span>Project rasmi</span>
              </div>
            )}

            <div>
              <Upload
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                maxCount={1}
                showUploadList={false}
                beforeUpload={selectImage}
              >
                <Button icon={<UploadOutlined />}>
                  {previewUrl ? 'Rasmni almashtirish' : 'Rasm yuklash'}
                </Button>
              </Upload>

              <span>
                JPG, PNG yoki WEBP. Maksimal hajm 5 MB.
                {isCreate && ' Rasm majburiy.'}
              </span>

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

      {cropSource && cropFile && (
        <ImageCropModal
          imageSource={cropSource}
          originalFile={cropFile}
          title="Project rasmini moslashtirish"
          description="Rasmni suring va zoom orqali kerakli qismini tanlang. Yakuniy rasm 1280 × 720 px, ya’ni 16:9 formatda bo‘ladi."
          aspect={16 / 9}
          outputWidth={1280}
          outputHeight={720}
          cropShape="rect"
          showGrid
          onCancel={closeCropper}
          onConfirm={applyCroppedImage}
        />
      )}
    </>
  );
}
