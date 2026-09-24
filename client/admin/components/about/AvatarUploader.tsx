import {
  DeleteOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Upload } from 'antd';
import { useEffect, useState } from 'react';
import { ImageCropModal } from '../image/ImageCropModal';

interface AvatarUploaderProps {
  currentAvatar?: string;
  file?: File;
  required?: boolean;
  onChange: (file?: File) => void;
}

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

const maximumSize = 5 * 1024 * 1024;

export function AvatarUploader({
  currentAvatar,
  file,
  required = false,
  onChange,
}: AvatarUploaderProps) {
  const [selectedPreview, setSelectedPreview] = useState<string>();
  const [cropSource, setCropSource] = useState<string>();
  const [cropFile, setCropFile] = useState<File>();
  const [errorMessage, setErrorMessage] = useState('');

  const previewUrl = file ? selectedPreview : currentAvatar;

  useEffect(
    () => () => {
      if (selectedPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(selectedPreview);
      }
    },
    [selectedPreview],
  );

  useEffect(
    () => () => {
      if (cropSource?.startsWith('blob:')) {
        URL.revokeObjectURL(cropSource);
      }
    },
    [cropSource],
  );

  const selectFile = (selectedFile: File) => {
    setErrorMessage('');

    if (!allowedTypes.includes(selectedFile.type)) {
      setErrorMessage('Faqat JPG, PNG yoki WEBP rasm yuklash mumkin.');
      return Upload.LIST_IGNORE;
    }

    if (selectedFile.size > maximumSize) {
      setErrorMessage('Rasm hajmi 5 MB dan oshmasligi kerak.');
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

  const applyCroppedFile = (croppedFile: File) => {
    setSelectedPreview(URL.createObjectURL(croppedFile));
    onChange(croppedFile);
    closeCropper();
  };

  const cancelNewFile = () => {
    setSelectedPreview(undefined);
    setErrorMessage('');
    onChange(undefined);
  };

  return (
    <>
      <div className="about-avatar-uploader">
        <Avatar
          size={112}
          src={previewUrl}
          icon={!previewUrl ? <UserOutlined /> : undefined}
        />

        <div className="about-avatar-actions">
          <Upload
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            maxCount={1}
            showUploadList={false}
            beforeUpload={selectFile}
          >
            <Button icon={<UploadOutlined />}>
              {previewUrl ? 'Rasmni almashtirish' : 'Rasm tanlash'}
            </Button>
          </Upload>

          {file && (
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              onClick={cancelNewFile}
            >
              Bekor qilish
            </Button>
          )}
        </div>

        <div className="about-avatar-help">
          JPG, PNG yoki WEBP. Maksimal hajm 5 MB. Kesilgandan keyingi o‘lcham
          512 × 512 px.
          {required && ' Profil rasmi majburiy.'}
        </div>

        {errorMessage && (
          <div className="about-field-error">{errorMessage}</div>
        )}
      </div>

      {cropSource && cropFile && (
        <ImageCropModal
          imageSource={cropSource}
          originalFile={cropFile}
          title="Profil rasmini moslashtirish"
          description="Rasmni suring va zoom orqali kerakli qismini tanlang. Yakuniy rasm 512 × 512 px bo‘ladi."
          aspect={1}
          outputWidth={512}
          outputHeight={512}
          cropShape="round"
          showGrid={false}
          onCancel={closeCropper}
          onConfirm={applyCroppedFile}
        />
      )}
    </>
  );
}
