import React from "react";
import { Link } from "react-router-dom";
import {
  Leaf,
  Zap,
  Car,
  Recycle,
  Trophy,
  Users,
  Activity
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* --- NAVBAR --- */}
      <nav className="w-full bg-white/95 backdrop-blur-sm border-b border-gray-50 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex justify-between items-center">
          {/* LOGO */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-emerald-500 w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shadow-emerald-200 shadow-md">
              <Leaf className="text-white" size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl md:text-2xl font-bold tracking-tight text-emerald-600">
              EcoPoint
            </span>
          </div>

          {/* Tombol Masuk / Daftar */}
          <Link
            to="/register"
            className="bg-emerald-500 text-white px-4 py-2 md:px-6 md:py-2.5 rounded-full font-bold text-xs md:text-sm hover:bg-emerald-600 transition shadow-lg shadow-emerald-200 hover:-translate-y-0.5"
          >
            Masuk / Daftar
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="pt-16 pb-12 md:pt-24 md:pb-16 px-4 text-center max-w-5xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4 md:mb-6">
          Wujudkan Gaya Hidup <br className="hidden md:block" />
          <span className="text-emerald-500">Ramah Lingkungan</span>
        </h1>
        <p className="text-base md:text-xl text-gray-500 mb-8 md:mb-10 max-w-2xl mx-auto font-medium leading-relaxed px-2">
          Platform gamifikasi yang mengubah aksi lingkungan menjadi poin, badge,
          dan dampak nyata untuk bumi kita.
        </p>
        
        {/* Tombol Utama */}
        <div className="flex justify-center items-center">
          <Link
            to="/register"
            className="w-full sm:w-auto bg-emerald-500 text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl shadow-emerald-200 hover:transform hover:-translate-y-1 transition duration-300"
          >
            Mulai Sekarang
          </Link>
        </div>
      </header>

      {/* --- KATEGORI AKTIVITAS --- */}
      <section className="py-12 md:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-gray-900">
            Kategori Aktivitas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <FeatureCard
              icon={<Recycle className="text-emerald-500" size={32} />}
              title="Daur Ulang"
              desc="Laporkan aktivitas daur ulang."
            />
            <FeatureCard
              icon={<Leaf className="text-emerald-500" size={32} />}
              title="Menanam Pohon"
              desc="Kontribusi nyata untuk lingkungan."
            />
            <FeatureCard
              icon={<Zap className="text-emerald-500" size={32} />}
              title="Hemat Energi"
              desc="Kurangi konsumsi energi harian."
            />
            <FeatureCard
              icon={<Car className="text-emerald-500" size={32} />}
              title="Transportasi Hijau"
              desc="Gunakan transportasi umum/sepeda."
            />
          </div>
        </div>
      </section>

      {/* --- STATISTIK --- */}
      <section className="py-16 md:py-24 bg-emerald-600 text-white mt-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-10 md:mb-16">
            Kenapa EcoPoint?
          </h2>
          <div className="flex flex-col md:flex-row justify-center gap-12 md:gap-20">
            <StatItem
              icon={<Trophy size={48} strokeWidth={1.5} />}
              number="500+"
              label="Badge Tersedia"
            />
            <StatItem
              icon={<Users size={48} strokeWidth={1.5} />}
              number="10K+"
              label="Pengguna Aktif"
            />
            <StatItem
              icon={<Activity size={48} strokeWidth={1.5} />}
              number="1M+"
              label="Aktivitas Tercatat"
            />
          </div>
        </div>
      </section>

      {/* --- FOOTER (Versi Pendek & Ringkas) --- */}
      <footer className="bg-gray-900 text-gray-400 py-6 text-center px-4">
        <div className="flex items-center justify-center gap-2 mb-2 opacity-80">
          <Leaf size={18} className="text-emerald-500" />
          <span className="font-bold text-white text-base">EcoPoint</span>
        </div>
        <p className="text-xs">
          Platform gamifikasi untuk gaya hidup berkelanjutan
        </p>
        <p className="text-[10px] mt-4 opacity-40">© 2025 EcoPoint Indonesia</p>
      </footer>
    </div>
  );
}

// --- SUB-KOMPONEN ---

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:border-emerald-200 transition duration-300 hover:shadow-lg">
    <div className="bg-emerald-50 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
      {icon}
    </div>
    <h3 className="text-lg font-bold mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

const StatItem = ({ icon, number, label }) => (
  <div className="flex flex-col items-center">
    <div className="mb-2 md:mb-4 opacity-90 scale-90 md:scale-100">{icon}</div>
    <div className="text-4xl md:text-5xl font-extrabold mb-2">{number}</div>
    <div className="text-emerald-100 font-semibold text-sm md:text-base">
      {label}
    </div>
  </div>
);