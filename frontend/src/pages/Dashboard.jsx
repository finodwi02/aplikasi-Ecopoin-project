import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Leaf,
  LogOut,
  Plus,
  Trophy,
  Wind,
  Medal,
  Calendar,
  ArrowUpRight,
  Star,
  CheckCircle2,
  Gift,
  X,
  Target,
  ChevronRight,
  Trash2,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "User", total_points: 0 });
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const userID =
    localStorage.getItem("user_id") || sessionStorage.getItem("user_id");
  const userName =
    localStorage.getItem("user_name") ||
    sessionStorage.getItem("user_name") ||
    "Guest";

  useEffect(() => {
    if (!userID) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [userID]);

  const fetchData = () => {
    // 1. Profil
    axios
      .get(
        `https://aplikasi-ecopoin-project.onrender.com/api/user?user_id=${userID}`
      )
      .then((res) => {
        if (res.data.data) setUser(res.data.data);
      })
      .catch(() => setUser((prev) => ({ ...prev, name: userName })));

    // 2. Leaderboard
    axios
      .get(`https://aplikasi-ecopoin-project.onrender.com/api/leaderboard`)
      .then((res) => setUsers(res.data.data || []));

    // 3. Riwayat
    axios
      .get(
        `https://aplikasi-ecopoin-project.onrender.com/api/user-activities?user_id=${userID}`
      )
      .then((res) => setActivities(res.data.data || []))
      .catch(() => setActivities([]));

    // 4. Tugas Mingguan
    axios
      .get(
        `https://aplikasi-ecopoin-project.onrender.com/api/weekly-tasks?user_id=${userID}`
      )
      .then((res) => setTasks(res.data.data || []))
      .catch(() => setTasks([]));
  };

  const handleDoTask = (task) => {
    navigate("/activity", { state: { task: task } });
  };

  // FITUR BARU: DELETE ACTIVITY
  const handleDeleteActivity = async (id) => {
    if (
      window.confirm(
        "Yakin ingin menghapus aktivitas ini? Poin akan dikurangi."
      )
    ) {
      try {
        await axios.delete(
          `https://aplikasi-ecopoin-project.onrender.com/api/activity/${id}`
        );
        fetchData(); // Refresh data biar hilang dari list dan poin berkurang
      } catch (err) {
        alert("Gagal menghapus aktivitas.");
      }
    }
  };

  const confirmLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  const currentPoints = user.total_points || 0;
  const level = Math.floor(currentPoints / 100) + 1;
  const nextLevelPoints = level * 100;
  const progress = Math.min(
    100,
    Math.max(0, ((currentPoints % 100) / 100) * 100)
  );

  const getLevelName = (lvl) => {
    if (lvl === 1) return "Bibit Pemula";
    if (lvl === 2) return "Penjaga Taman";
    if (lvl === 3) return "Pahlawan Hutan";
    return "Legendari Bumi";
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20 relative">
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          ></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative z-10 animate-[bounceIn_0.3s_ease-out]">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                <LogOut size={32} className="text-emerald-500 ml-1" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Ingin Keluar?
              </h3>
              <div className="flex gap-3 w-full mt-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600"
                >
                  Ya, Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-white border-b border-gray-100 px-4 md:px-6 h-16 md:h-20 flex justify-between items-center sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2 md:gap-3">
          <div className="bg-emerald-500 w-8 h-8 rounded-lg flex items-center justify-center text-white">
            <Leaf size={18} />
          </div>
          <span className="text-lg md:text-xl font-bold text-emerald-600">
            EcoPoint
          </span>
        </Link>
        <button
          onClick={() => setShowLogoutModal(true)}
          className="p-2 text-gray-400 hover:text-emerald-500"
        >
          <LogOut size={20} />
        </button>
      </nav>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 text-white shadow-xl mb-8 relative flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="w-full">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                Level {level}
              </span>
              <span className="text-emerald-100 text-xs">
                Menuju Level {level + 1}
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold mb-2">
              {getLevelName(level)}
            </h1>
            <p className="text-emerald-50 mb-4 md:mb-6 opacity-90 text-sm md:text-base">
              Butuh <b>{nextLevelPoints - currentPoints} poin</b> lagi naik
              level!
            </p>
            <div className="w-full max-w-lg h-3 bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Link
              to="/rewards"
              className="bg-emerald-800 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 text-sm"
            >
              <Gift size={18} /> Tukar Poin
            </Link>
            <Link
              to="/activity"
              className="bg-white text-emerald-700 px-5 py-3 rounded-xl font-bold flex items-center gap-2 text-sm"
            >
              <Plus size={18} /> Lapor Aksi
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
                <Target className="text-blue-500" size={20} />
                <h3 className="font-bold text-gray-800 text-sm md:text-base">
                  Misi Mingguan
                </h3>
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded ml-auto">
                  Reset 7 Hari
                </span>
              </div>
              <div className="space-y-3">
                {tasks && tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        task.is_done
                          ? "bg-emerald-50 border-emerald-100"
                          : "bg-white border-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div
                          className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border ${
                            task.is_done
                              ? "bg-emerald-500 border-emerald-500"
                              : "border-gray-300"
                          }`}
                        >
                          {task.is_done && (
                            <CheckCircle2 size={14} className="text-white" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-xs md:text-sm font-bold truncate ${
                              task.is_done
                                ? "text-gray-500 line-through"
                                : "text-gray-800"
                            }`}
                          >
                            {task.title}
                          </p>
                          <p className="text-[10px] text-emerald-600 font-bold">
                            +{task.points} Poin
                          </p>
                        </div>
                      </div>
                      {!task.is_done && (
                        <button
                          onClick={() => handleDoTask(task)}
                          className="text-[10px] bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 flex items-center gap-1 shadow-sm transition flex-shrink-0"
                        >
                          Kerjakan <ChevronRight size={12} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-2">
                    Memuat tugas...
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                <div className="text-gray-500 text-[10px] font-bold uppercase">
                  Total Poin
                </div>
                <div className="text-xl font-extrabold text-emerald-600">
                  {currentPoints}
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                <div className="text-gray-500 text-[10px] font-bold uppercase">
                  CO2 Hemat
                </div>
                <div className="text-xl font-extrabold text-blue-500">
                  {(currentPoints * 0.25).toFixed(1)}kg
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 md:p-6 border-b border-gray-50 flex items-center gap-2">
                <Calendar className="text-emerald-500" size={20} />
                <h3 className="font-bold text-gray-800 text-sm md:text-base">
                  Riwayat Aktivitas
                </h3>
              </div>
              <div>
                {activities && activities.length > 0 ? (
                  activities.map((act, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 md:gap-4 p-4 md:p-5 hover:bg-gray-50 border-b border-gray-50 last:border-0 group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        <img
                          src={act.photo_url}
                          alt="bukti"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm md:text-base text-gray-800 truncate">
                          {act.category}
                        </h4>
                        <p className="text-xs md:text-sm text-gray-500 truncate">
                          {act.description}
                        </p>
                        <span className="text-[10px] md:text-xs text-gray-400 mt-1 inline-block">
                          {new Date(act.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-bold text-emerald-600 text-sm md:text-base flex-shrink-0">
                          +{act.points_earned}
                        </span>
                        {/* TOMBOL HAPUS */}
                        <button
                          onClick={() => handleDeleteActivity(act.id)}
                          className="text-gray-300 hover:text-red-500 transition"
                          title="Hapus Aktivitas"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    Belum ada aktivitas.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 md:p-6 border-b border-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Trophy className="text-yellow-500" size={20} />
                  <h3 className="font-bold text-gray-800 text-sm md:text-base">
                    Top Peringkat
                  </h3>
                </div>
                <Link
                  to="/"
                  className="text-xs font-bold text-gray-400 hover:text-emerald-500 flex items-center gap-1"
                >
                  Lihat Semua <ArrowUpRight size={14} />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm md:text-base min-w-[300px]">
                  <tbody>
                    {users &&
                      users.length > 0 &&
                      users.slice(0, 3).map((u, i) => (
                        <tr
                          key={i}
                          className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition"
                        >
                          <td className="px-4 md:px-6 py-4 w-10 text-center font-bold text-gray-500">
                            #{i + 1}
                          </td>
                          <td className="px-4 md:px-6 py-4 font-semibold text-gray-700 flex items-center gap-3">
                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                              {u.name.charAt(0)}
                            </div>
                            <span className="truncate max-w-[120px] md:max-w-none">
                              {u.name}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4 text-right font-bold text-emerald-600 whitespace-nowrap">
                            {u.total_points}{" "}
                            <span className="text-xs font-normal text-gray-400">
                              pts
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
