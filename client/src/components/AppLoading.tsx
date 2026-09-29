import '../styles/app-loading.css';

export function AppLoading() {
  return (
    <div
      className="app-loading"
      role="status"
      aria-live="polite"
      aria-label="Portfolio yuklanmoqda"
    >
      <div className="app-loading__halo" aria-hidden="true" />
      <div className="app-loading__mark" aria-hidden="true">
        <img src="/favicon.svg" alt="" />
      </div>
      <div className="app-loading__copy">
        <strong>Asilbek Karomatov</strong>
        <span>Portfolio tayyorlanmoqda</span>
      </div>
      <div className="app-loading__progress" aria-hidden="true">
        <i />
      </div>
    </div>
  );
}
