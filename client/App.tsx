import { Routes, Route } from 'react-router-dom';
import Login from '@admin/pages/Login/Login';
import Dashboard from '@admin/pages/Dashboard/Dashboard';
import Home from '@src/pages/Home';
import AdminRoot from '@admin/pages/AdminRoot';
import StatusPage from './StatusPages/Status';
import Contact from '@admin/pages/Contact/Contact';
import About from '@admin/pages/About/About';
import Settings from '@admin/pages/Settings/Settings';
import Projects from '@admin/pages/Projects/Projects';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<Login />} />
      <Route element={<AdminRoot />}>
        <Route path="/auth/dashboard" element={<Dashboard />} />
        <Route path="/auth/about" element={<About />} />
        <Route path="/auth/projects" element={<Projects />} />
        <Route path="/auth/contact" element={<Contact />} />
        <Route path="/auth/settings" element={<Settings />} />
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
