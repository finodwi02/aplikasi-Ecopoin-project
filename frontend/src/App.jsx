import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Activity from "./pages/Activity";
import Rewards from "./pages/Rewards";

// Komponen Pengecek Login
function AuthCheck({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Cek apakah ada data login (di LocalStorage ATAU SessionStorage)
    const userId =
      localStorage.getItem("user_id") || sessionStorage.getItem("user_id");

    // Daftar halaman yang TIDAK boleh dibuka jika sudah login
    const publicPages = ["/", "/login", "/register"];

    if (userId) {
      // Jika SUDAH login, tapi buka halaman login/home -> Lempar ke Dashboard
      if (publicPages.includes(location.pathname)) {
        navigate("/dashboard");
      }
    } else {
      // Jika BELUM login, tapi coba buka dashboard/activity -> Lempar ke Login
      if (!publicPages.includes(location.pathname)) {
        navigate("/login");
      }
    }
  }, [navigate, location]);

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthCheck>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/rewards" element={<Rewards />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthCheck>
    </BrowserRouter>
  );
}
