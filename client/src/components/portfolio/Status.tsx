import { LoaderCircle } from 'lucide-react';
import { Button } from '../ui/button';
export function Status({
  loading,
  error,
  retry,
}: {
  loading: boolean;
  error: string;
  retry: () => void;
}) {
  if (loading)
    return (
      <div className="sp-status" role="status">
        <LoaderCircle className="sp-spin" /> Ma’lumotlar yuklanmoqda…
      </div>
    );
  if (error)
    return (
      <div className="sp-status" role="alert">
        <p>{error}</p>
        <Button variant="outline" onClick={retry}>
          Qayta urinish
        </Button>
      </div>
    );
  return null;
}
