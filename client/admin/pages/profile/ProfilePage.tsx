import { Typography } from 'antd';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getApiError } from '../../../shared/utils/getApiError';
import { profileApi } from '../../api/profileApi';
import { useAuth } from '../../auth/useAuth';
import { ProfileForm } from '../../components/profile/ProfileForm';
import { ProfileSummary } from '../../components/profile/ProfileSummary';
import type { Admin } from '../../types/auth';
import type { ProfileUpdateValues } from '../../types/profile.types';

export function ProfilePage() {
  const { admin, refreshAdmin } = useAuth();
  const [saving, setSaving] = useState(false);

  if (!admin) {
    return null;
  }

  const handleSubmit = async (values: ProfileUpdateValues): Promise<Admin> => {
    setSaving(true);

    const passwordChanged = Boolean(values.password);

    const toastId = toast.loading(
      passwordChanged
        ? 'Profil va parol yangilanmoqda...'
        : 'Profil yangilanmoqda...',
    );

    try {
      const response = await profileApi.update(values);

      await refreshAdmin();

      toast.success(
        passwordChanged
          ? 'Profil va parol muvaffaqiyatli yangilandi.'
          : 'Profil ma’lumotlari yangilandi.',
        {
          id: toastId,
        },
      );

      return response.data;
    } catch (error) {
      toast.error(
        getApiError(error, 'Profil ma’lumotlarini yangilab bo‘lmadi.'),
        {
          id: toastId,
        },
      );

      throw error;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="page-heading profile-page-heading">
        <div>
          <Typography.Title level={2}>Profil</Typography.Title>

          <Typography.Text type="secondary">
            Shaxsiy admin hisobingiz va xavfsizlik ma’lumotlarini boshqaring.
          </Typography.Text>
        </div>
      </div>

      <div className="profile-layout">
        <ProfileSummary admin={admin} />

        <ProfileForm
          key={`${admin.username}-${admin.email}`}
          admin={admin}
          saving={saving}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
