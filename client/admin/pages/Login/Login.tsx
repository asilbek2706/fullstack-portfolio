import React, { useState } from 'react';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.scss';
import api from '../../../api/axios';
import Loading from '../../../Loading/Loading';

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/login', { username, password });
      navigate('/dashboard');
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(
        axiosError.response?.data?.message || 'Server bilan aloqa uzildi!',
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }
  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>🛡️ Admin Panel</h2>
        {error && <p className="error-msg">{error}</p>}

        <div className="input-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Admin loginini kiriting..."
            required
          />
        </div>

        <div className="input-group">
          <label>Parol</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="******"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? <Loading /> : 'Tizimga kirish'}
        </button>
      </form>
    </div>
  );
};

export default Login;
