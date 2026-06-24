import type { IImageUploadResponse } from '@admin/interfaces/image-upload.interface';
import api from '../../api/axios';

export const uploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file); // Backend 'image' kutyapti
    const res = await api.post<IImageUploadResponse>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url;
  },

  getLatestImage: async (): Promise<string | null> => {
    try {
      const res = await api.get<IImageUploadResponse>('/upload');
      return res.data.url;
    } catch {
      return null;
    }
  },
};
