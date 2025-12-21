import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gift, Wallet, Trees, Ticket, Loader2 } from "lucide-react";

export default function Rewards() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ total_points: 0 });
  const [loading, setLoading] = useState(null);
  const userID = localStorage.getItem("user_id") || "1";

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = () => {
    axios
      .get(`https://aplikasi-ecopoin-project.onrender.com/api/leaderboard`)
      .then((res) => {
        const me = res.data.data.find((u) => u.id == userID);
        if (me) setUser(me);
      });
  };

  const items = [
    {
      id: 1,
      name: "Voucher GoPay 10rb",
      cost: 100,
      icon: <Wallet className="text-blue-500" />,
      color: "bg-blue-50",
    },
    {
      id: 2,
      name: "Sertifikat Pohon",
      cost: 250,
      icon: <Trees className="text-green-600" />,
      color: "bg-green-50",
    },
    {
      id: 3,
      name: "Diskon Listrik 20%",
      cost: 150,
      icon: <Ticket className="text-yellow-500" />,
      color: "bg-yellow-50",
    },
    {
      id: 4,
      name: "Donasi Hutan Lindung",
      cost: 500,
      icon: <Gift className="text-pink-500" />,
      color: "bg-pink-50",
    },
  ];

  const handleRedeem = async (item) => {
    if (user.total_points < item.cost) {
      alert("Maaf, poin kamu belum cukup. Yuk lapor aktivitas lagi!");
      return;
    }

    if (!window.confirm(`Tukar ${item.cost} poin untuk "${item.name}"?`))
      return;

    setLoading(item.id);
    try {
      await axios.post(
        "https://aplikasi-ecopoin-project.onrender.com/api/redeem",
        {
          user_id: parseInt(userID),
          cost: item.cost,
        }
      );
      alert(`✅ Berhasil menukar: ${item.name}`);
      fetchUserData();
    } catch (err) {
      alert("Gagal menukar poin.");
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center items-start">
      <div className="w-full max-w-2xl">
        <div className="bg-emerald-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-200 mb-8 relative overflow-hidden">
          <button
            onClick={() => navigate("/dashboard")}
            className="absolute top-6 left-6 hover:bg-white/20 p-2 rounded-full transition"
          >
            <ArrowLeft />
          </button>
          <div className="text-center mt-4">
            <p className="text-emerald-100 font-medium mb-1">Saldo Poin Kamu</p>
            <h1 className="text-5xl font-extrabold">{user.total_points}</h1>
            <div className="mt-6 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">
              <Gift size={16} /> Tukarkan dengan hadiah menarik
            </div>
          </div>
        </div>

        <h2 className="font-bold text-xl text-gray-800 mb-6 px-2">
          Katalog Hadiah
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center`}
                >
                  {React.cloneElement(item.icon, { size: 28 })}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{item.name}</h3>
                  <p className="text-emerald-600 font-bold text-sm">
                    {item.cost} Poin
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRedeem(item)}
                disabled={loading === item.id || user.total_points < item.cost}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                  user.total_points < item.cost
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200"
                }`}
              >
                {loading === item.id ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Tukar"
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
