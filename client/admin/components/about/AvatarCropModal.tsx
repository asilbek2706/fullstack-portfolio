import {
  CheckOutlined,
  CloseOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import { Button, Modal, Slider } from 'antd';
import { useCallback, useState } from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import { createCroppedImageFile } from '../../utils/cropImage';

interface AvatarCropModalProps {
  imageSource: string;
  originalFile: File;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

export function AvatarCropModal({
  imageSource,
  originalFile,
  onCancel,
  onConfirm,
}: AvatarCropModalProps) {
  const [crop, setCrop] = useState<Point>({
    x: 0,
    y: 0,
  });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area>();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedPixels: Area) => {
      setCroppedArea(croppedPixels);
    },
    [],
  );

  const handleConfirm = async () => {
    if (!croppedArea) {
      setErrorMessage('Rasm maydonini aniqlab bo‘lmadi.');
      return;
    }

    setProcessing(true);
    setErrorMessage('');

    try {
      const croppedFile = await createCroppedImageFile(
        imageSource,
        croppedArea,
        originalFile,
      );

      onConfirm(croppedFile);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Rasmni kesishda xatolik yuz berdi.',
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal
      open
      centered
      width={680}
      title="Profil rasmini moslashtirish"
      className="avatar-cropper-modal"
      maskClosable={!processing}
      keyboard={!processing}
      closable={!processing}
      onCancel={onCancel}
      footer={[
        <Button
          key="cancel"
          icon={<CloseOutlined />}
          disabled={processing}
          onClick={onCancel}
        >
          Bekor qilish
        </Button>,
        <Button
          key="confirm"
          type="primary"
          icon={<CheckOutlined />}
          loading={processing}
          onClick={() => void handleConfirm()}
        >
          Rasmni qo‘llash
        </Button>,
      ]}
    >
      <p className="avatar-cropper-description">
        Rasmni suring va kerakli o‘lchamni zoom orqali tanlang. Yakuniy rasm 512
        × 512 px bo‘ladi.
      </p>

      {errorMessage && (
        <div
          className="avatar-cropper-inline-error"
          role="status"
          aria-live="polite"
        >
          {errorMessage}
        </div>
      )}

      <div className="avatar-cropper-stage">
        <Cropper
          image={imageSource}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          objectFit="contain"
          minZoom={1}
          maxZoom={3}
          zoomSpeed={0.15}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
        />
      </div>

      <div className="avatar-cropper-zoom">
        <ZoomOutOutlined />

        <Slider
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          tooltip={{
            formatter: (value) => (value ? `${Math.round(value * 100)}%` : ''),
          }}
          onChange={setZoom}
        />

        <ZoomInOutlined />
      </div>
    </Modal>
  );
}
