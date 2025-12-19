import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios"; // JANGAN LUPA IMPORT AXIOS
import { Leaf, CheckSquare, Square } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (location.pathname === "/register") {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!formData.email) {
      alert("Silakan isi email Anda terlebih dahulu.");
    } else {
      alert(`Link reset password dikirim ke ${formData.email}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      // --- LOGIKA LOGIN (NYATA) ---
      try {
        const res = await axios.post("http://localhost:8080/api/login", {
          email: formData.email,
          password: formData.password,
        });

        // Jika sukses
        const { user_id, name } = res.data;

        if (rememberMe) {
          localStorage.setItem("user_id", user_id);
          localStorage.setItem("user_name", name);
        } else {
          sessionStorage.setItem("user_id", user_id);
          sessionStorage.setItem("user_name", name);
        }

        alert("✅ Login Berhasil!");
        navigate("/dashboard");
      } catch (err) {
        console.error(err);
        alert("❌ Login Gagal! Periksa email dan password.");
      }
    } else {
      // --- LOGIKA REGISTER (NYATA - SIMPAN KE DB) ---
      if (formData.password !== formData.confirmPassword) {
        alert("Konfirmasi password tidak cocok!");
        return;
      }
      if (!formData.name || !formData.email || !formData.password) {
        alert("Harap lengkapi data!");
        return;
      }

      try {
        // Panggil API Backend untuk Register
        await axios.post("http://localhost:8080/api/register", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        });

        alert("🎉 Pendaftaran Berhasil! Akun sudah disimpan. Silakan Login.");

        // Reset Form & Pindah ke Login
        setFormData({
          name: "",
          email: formData.email,
          phone: "",
          password: "",
          confirmPassword: "",
        });
        setIsLogin(true);
        navigate("/login");
      } catch (err) {
        console.error(err);
        alert("❌ Pendaftaran Gagal! Mungkin email sudah dipakai.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 md:p-6 font-sans">
      <Link
        to="/"
        className="mb-6 md:mb-8 flex items-center gap-3 hover:opacity-80 transition group"
      >
        <div className="bg-emerald-500 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-emerald-200 shadow-md group-hover:scale-105 transition">
          <Leaf className="text-white" size={24} strokeWidth={2.5} />
        </div>
        <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-emerald-600">
          EcoPoint
        </span>
      </Link>

      <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            {isLogin ? "Selamat Datang Kembali 👋" : "Buat Akun Baru 🚀"}
          </h2>
          <p className="text-sm md:text-base text-gray-500 mt-2 font-medium">
            {isLogin
              ? "Masuk untuk melanjutkan perjalanan hijaumu."
              : "Lengkapi data diri untuk mulai berkontribusi."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full p-3 md:p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition text-sm md:text-base"
                  placeholder="Nama Anda"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1">
                  Nomor HP
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full p-3 md:p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition text-sm md:text-base"
                  placeholder="0812xxxx"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1">
              Email
            </label>
            <input
              type="text"
              name="email"
              className="w-full p-3 md:p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition text-sm md:text-base"
              placeholder="user@ecopoint.id"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="w-full p-3 md:p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition text-sm md:text-base"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1">
                Konfirmasi Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                className="w-full p-3 md:p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition text-sm md:text-base"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          )}

          {isLogin && (
            <div className="flex items-center justify-between text-xs md:text-sm">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition"
              >
                {rememberMe ? (
                  <CheckSquare size={16} className="text-emerald-500" />
                ) : (
                  <Square size={16} />
                )}{" "}
                Remember Me
              </button>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="font-bold text-emerald-600 hover:underline"
              >
                Lupa Password?
              </button>
            </div>
          )}

          <button className="w-full bg-emerald-500 text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-emerald-600 transition shadow-lg shadow-emerald-200 mt-4 md:mt-6">
            {isLogin ? "Masuk" : "Daftar Sekarang"}
          </button>
        </form>

        <div className="mt-6 md:mt-8 text-center text-xs md:text-sm font-medium text-gray-500">
          {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
          <Link
            to={isLogin ? "/register" : "/login"}
            className="text-emerald-600 font-bold cursor-pointer hover:underline ml-1"
          >
            {isLogin ? "Daftar" : "Masuk"}
          </Link>
        </div>
      </div>
    </div>
  );
}
