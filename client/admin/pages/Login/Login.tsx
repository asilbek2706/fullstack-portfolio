import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import './Login.scss';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { username, password },
        { withCredentials: true } 
      );

      if (response.status === 200) {
        onLoginSuccess();
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      
      setError(
        axiosError.response?.data?.message || 'Server bilan aloqa uzildi!'
      );
    }
  };

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

        <button type="submit">Tizimga kirish</button>
      </form>
    </div>
  );
};

export default Login;