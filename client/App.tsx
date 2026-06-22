import { Routes, Route } from 'react-router-dom';
import Login from '@admin/pages/Login/Login';
import Dashboard from '@admin/pages/Dashboard/Dashboard';
import Home from '@src/pages/Home';
import AdminRoot from '@admin/pages/AdminRoot';
import StatusPage from './StatusPages/Status';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Login faqat /admin da ochiladi */}
      <Route path="/admin" element={<Login />} />
      {/* Dashboard va boshqalar himoyalangan (AdminRoot orqali) */}
      <Route element={<AdminRoot />}>
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Keyinchalik boshqa sahifalarni ham shu yerga qo'shasan */}
      </Route>
      <Route
        path="*"
        element={
          <StatusPage
            status={404}
            title="Page Not Found"
            message="The page you are looking for does not exist."
          />
        }
      />
    </Routes>
  );
};

export default App;
