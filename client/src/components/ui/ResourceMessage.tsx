export function ResourceMessage({
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
      <div className="pf-resource" role="status">
        <span className="pf-spinner" /> Ma’lumotlar yuklanmoqda…
      </div>
    );
  if (error)
    return (
      <div className="pf-resource" role="status">
        <p>{error}</p>
        <button className="pf-button pf-button--quiet" onClick={retry}>
          Qayta urinish ↗
        </button>
      </div>
    );
  return null;
}
