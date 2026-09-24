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

interface ImageCropModalProps {
  imageSource: string;
  originalFile: File;
  title: string;
  description: string;
  aspect: number;
  outputWidth: number;
  outputHeight: number;
  cropShape?: 'rect' | 'round';
  showGrid?: boolean;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

export function ImageCropModal({
  imageSource,
  originalFile,
  title,
  description,
  aspect,
  outputWidth,
  outputHeight,
  cropShape = 'rect',
  showGrid = true,
  onCancel,
  onConfirm,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Point>({
    x: 0,
    y: 0,
  });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area>();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCropComplete = useCallback((_area: Area, croppedPixels: Area) => {
    setCroppedArea(croppedPixels);
  }, []);

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
        {
          width: outputWidth,
          height: outputHeight,
        },
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
      title={title}
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
      <p className="avatar-cropper-description">{description}</p>

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
          aspect={aspect}
          cropShape={cropShape}
          showGrid={showGrid}
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
