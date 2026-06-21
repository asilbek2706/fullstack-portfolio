export default function Dashboard() {
  return (
    <div style={{ padding: '2rem', backgroundColor: '#f4f6f9', color: '#333', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#2c3e50' }}> SuperAdmin Dashboard</h1>
      <p>Bu sening dinamik admin paneling (admin papkasi ichidan).</p>
      <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3>Statistika (Example)</h3>
        <ul>
          <li>Loyihalar soni: 12 ta</li>
          <li>Xabarlar: 4 ta</li>
        </ul>
      </div>
      <hr style={{ borderColor: '#ddd', margin: '2rem 0' }} />
     
    </div>
  );
}