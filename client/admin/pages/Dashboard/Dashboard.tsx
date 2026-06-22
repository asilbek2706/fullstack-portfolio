import { useAdmin } from '../../../context/useAdmin';
import Loading from '../../../Loading/Loading';

const Dashboard = () => {
  const { admin } = useAdmin();

  if (!admin) return <Loading />;

  return <h1>Xush kelibsiz, {admin.username}!</h1>;
};

export default Dashboard;
