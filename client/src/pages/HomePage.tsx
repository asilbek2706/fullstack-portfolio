import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="public-placeholder">
      <Result
        status="info"
        title="Portfolio frontend tayyorlanmoqda"
        subTitle="Hozir admin panel ustida ishlayapmiz."
        extra={
          <Button type="primary" onClick={() => navigate('/admin')}>
            Admin panel
          </Button>
        }
      />
    </main>
  );
}
