import { useNavigate } from 'react-router-dom';
import './Status.css';

interface Props {
  status: number;
  title: string;
  message: string;
}

const StatusPage = ({ status, title, message }: Props) => {
  const navigate = useNavigate();
  return (
    <div className="error-container">
      <h1>{status}</h1>
      <h2>{title}</h2>
      <p>{message}</p>
      <button onClick={() => navigate('/')}>Bosh sahifaga qaytish</button>
    </div>
  );
};

export default StatusPage;
