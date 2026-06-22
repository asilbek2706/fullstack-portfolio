import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@admin/components/Sidebar/Sidebar";
import Header from "@admin/components/Header";
import { AdminProvider } from "../../context/AdminContext";
import type { AdminUser } from "@admin/interfaces/admin.interface";
import api from "../../api/axios";

const AdminRoot = () => {
 const [admin, setAdmin] = useState<AdminUser | null>(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await api.get<AdminUser>("/auth/me");
        setAdmin(response.data); 
      } catch (error) {
        console.error("Adminni yuklab bo'lmadi:", error);
      }
    };
    fetchAdmin();
  }, []);

  return (
    <AdminProvider admin={admin}> 
      <div className="admin-layout" style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ flex: 1 }}>
          <Header />
          <Outlet />
        </main>
      </div>
    </AdminProvider>
  );
};
export default AdminRoot;