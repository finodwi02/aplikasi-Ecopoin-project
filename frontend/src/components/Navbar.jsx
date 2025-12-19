import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";

export default function Navbar({ isLoggedIn = false, user = null }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to={isLoggedIn ? "/dashboard" : "/"}
            className="flex items-center gap-2 group"
          >
            <div className="bg-green-600 p-2 rounded-lg group-hover:bg-green-700 transition">
              <Leaf className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-gray-800 tracking-tight">
              EcoPoint
            </span>
          </Link>

          {/* Menu Kanan */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-sm font-bold text-gray-700">
                    {user?.name}
                  </span>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                    {user?.total_points} Poin
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 font-medium text-sm transition"
                >
                  Keluar
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-green-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-green-700 transition shadow-lg shadow-green-200"
              >
                Masuk / Daftar
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
