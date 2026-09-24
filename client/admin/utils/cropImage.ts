import type { Area } from 'react-easy-crop';

const outputSize = 512;

const loadImage = (source: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Tanlangan rasmni o‘qib bo‘lmadi.'));
    image.src = source;
  });

const getOutputName = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf('.');
  const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  const extension = dotIndex > 0 ? fileName.slice(dotIndex) : '.jpg';

  return `${baseName}-cropped${extension}`;
};

export const createCroppedImageFile = async (
  imageSource: string,
  crop: Area,
  originalFile: File,
): Promise<File> => {
  const image = await loadImage(imageSource);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Rasmni qayta ishlash imkoniyati mavjud emas.');
  }

  canvas.width = outputSize;
  canvas.height = outputSize;

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  const outputType = ['image/jpeg', 'image/png', 'image/webp'].includes(
    originalFile.type,
  )
    ? originalFile.type
    : 'image/jpeg';

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
          return;
        }

        reject(new Error('Kesilgan rasmni yaratib bo‘lmadi.'));
      },
      outputType,
      0.9,
    );
  });

  return new File([blob], getOutputName(originalFile.name), {
    type: outputType,
    lastModified: Date.now(),
  });
};
