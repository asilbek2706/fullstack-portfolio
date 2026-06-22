import { useAdmin } from "../../../context/AdminContext";

const Dashboard = () => {
 const { admin } = useAdmin(); 

  if (!admin) return <h1>Yuklanmoqda...</h1>; 

  return <h1>Xush kelibsiz, {admin.username}!</h1>;
}

export default Dashboard;