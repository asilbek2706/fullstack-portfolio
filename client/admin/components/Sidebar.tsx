// src/components/admin/Sidebar.tsx
import { NavLink } from "react-router-dom";

const navLinks = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Projects", path: "/projects" },
  { name: "Users", path: "/users" },
  { name: "Settings", path: "/settings" },
];

const Sidebar = () => {
  return (
    <aside style={{ width: "250px", height: "100vh", borderRight: "1px solid #ccc", padding: "20px" }}>
      <h2>Admin Panel</h2>
      <ul style={{ listStyle: "none", padding: 0, marginTop: "20px" }}>
        {navLinks.map((link) => (
          <li key={link.path} style={{ marginBottom: "10px" }}>
            <NavLink 
              to={link.path} 
              style={({ isActive }) => ({
                color: isActive ? "blue" : "black",
                textDecoration: "none",
                fontWeight: isActive ? "bold" : "normal"
              })}
            >
              {link.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;