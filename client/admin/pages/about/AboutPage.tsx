import { Button, Empty, Result, Spin } from 'antd';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getApiError } from '../../../shared/utils/getApiError';
import { AboutEditor } from '../../components/about/AboutEditor';
import { useAbout } from '../../context/about/useAbout';
import type { AboutFormValues } from '../../types/about.types';

export function AboutPage() {
  const { about, status, errorMessage, saving, refreshAbout, saveAbout } =
    useAbout();

  const navigate = useNavigate();

  const handleSave = async (values: AboutFormValues, avatar?: File) => {
    const loadingToast = toast.loading(
      avatar
        ? 'Ma’lumotlar va rasm saqlanmoqda...'
        : 'About ma’lumotlari saqlanmoqda...',
    );

    try {
      await saveAbout({
        values,
        avatar,
      });

      toast.success('About ma’lumotlari muvaffaqiyatli saqlandi.', {
        id: loadingToast,
      });

      navigate('/admin/dashboard', {
        replace: true,
      });
    } catch (error) {
      toast.error(getApiError(error, 'About ma’lumotlarini saqlab bo‘lmadi.'), {
        id: loadingToast,
      });
    }
  };

  if (status === 'loading') {
    return (
      <div className="about-loading">
        <Spin size="large" />
        <span>About yuklanmoqda...</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <Result
        status="error"
        title="About ma’lumotlarini yuklab bo‘lmadi"
        subTitle={errorMessage}
        extra={
          <Button type="primary" onClick={() => void refreshAbout()}>
            Qayta urinish
          </Button>
        }
      />
    );
  }

  return (
    <div className="about-page">
      <div className="page-heading">
        <div>
          <h1>About boshqaruvi</h1>
          <p>Public portfolio profilini yaratish yoki yangilash.</p>
        </div>
      </div>

      {status === 'empty' && (
        <div className="about-empty-state">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <strong>About hali yaratilmagan</strong>
                <p>
                  Birinchi saqlashda barcha maydonlar va profil rasmi majburiy.
                </p>
              </div>
            }
          />
        </div>
      )}

      <div className="about-layout about-layout--editor">
        <AboutEditor about={about} saving={saving} onSubmit={handleSave} />
      </div>
    </div>
  );
}
