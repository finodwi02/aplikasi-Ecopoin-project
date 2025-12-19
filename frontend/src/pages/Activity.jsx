import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MapPin, Camera, Loader2, Target } from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function Activity() {
  const navigate = useNavigate();
  const location = useLocation();

  // Tangkap data Misi dari Dashboard (jika ada)
  const taskFromDashboard = location.state?.task || null;

  // Set default category. Jika ada tugas, pakai judul tugasnya.
  const [category, setCategory] = useState(
    taskFromDashboard ? taskFromDashboard.title : "Menanam Pohon"
  );

  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState([-6.175392, 106.827153]);
  const [locationText, setLocationText] = useState("");

  // Efek: Jika ada taskFromDashboard, pastikan category ter-set otomatis
  useEffect(() => {
    if (taskFromDashboard) {
      setCategory(taskFromDashboard.title);
    }
  }, [taskFromDashboard]);

  function LocationMarker() {
    const map = useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        setLocationText(
          `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`
        );
        map.flyTo(e.latlng, map.getZoom());
      },
    });
    return position === null ? null : <Marker position={position}></Marker>;
  }

  function ChangeView({ center }) {
    const map = useMap();
    map.flyTo(center, 15);
    return null;
  }

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          setLocationText(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        },
        () => alert("Gagal mengambil lokasi. Pastikan GPS aktif.")
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("user_id", localStorage.getItem("user_id") || "1");

    // Pastikan kategori yang dikirim adalah yang benar (Judul Misi atau Pilihan Dropdown)
    formData.append("category", category);

    formData.append(
      "description",
      `${desc} [Lokasi: ${locationText || "Tidak ada lokasi"}]`
    );
    if (file) formData.append("photo", file);

    // KIRIM ID MISI JIKA ADA
    if (taskFromDashboard) {
      formData.append("task_id", taskFromDashboard.id);
    }

    try {
      const res = await axios.post(
        `http://localhost:8080/api/activity`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert(`✅ ${res.data.message}`);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal mengirim laporan.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center items-start">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-emerald-500 p-6 flex items-center gap-4 text-white shadow-md">
          <button
            onClick={() => navigate(-1)}
            className="hover:bg-white/20 p-2 rounded-full transition"
          >
            <ArrowLeft />
          </button>
          <h1 className="text-xl font-bold">Lapor Aktivitas Baru</h1>
        </div>

        {/* BANNER MISI */}
        {taskFromDashboard && (
          <div className="bg-blue-50 p-4 flex items-center gap-3 border-b border-blue-100">
            <Target className="text-blue-500" size={24} />
            <div>
              <p className="text-xs text-blue-600 font-bold uppercase">
                Mengerjakan Misi:
              </p>
              <p className="text-sm font-bold text-gray-800">
                {taskFromDashboard.title} (+{taskFromDashboard.points} Poin)
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* LOGIKA TAMPILAN KATEGORI */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Jenis Aktivitas
            </label>

            {/* Jika Mengerjakan Misi -> Tampilkan Teks ReadOnly */}
            {taskFromDashboard ? (
              <div className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-600">
                {taskFromDashboard.title}
              </div>
            ) : (
              /* Jika Lapor Biasa -> Tampilkan Dropdown */
              <select
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Menanam Pohon (50 Poin)</option>
                <option>Daur Ulang Sampah (20 Poin)</option>
                <option>Hemat Energi (15 Poin)</option>
                <option>Transportasi Hijau (30 Poin)</option>
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Bukti Foto
            </label>
            <div
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition relative ${
                file
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => setFile(e.target.files[0])}
                accept="image/*"
                required
              />
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white p-3 rounded-full shadow-sm">
                  <Camera
                    className={file ? "text-emerald-500" : "text-gray-400"}
                    size={24}
                  />
                </div>
                <p className="text-sm font-medium text-gray-500">
                  {file ? file.name : "Ketuk untuk ambil foto"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Deskripsi Singkat
            </label>
            <textarea
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none font-medium"
              rows="2"
              placeholder="Ceritakan detail aktivitasmu..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-700">
                Lokasi Aktivitas
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold hover:bg-blue-100 flex items-center gap-1"
              >
                <MapPin size={12} /> Cari Lokasi Saya
              </button>
            </div>
            <div className="h-48 w-full rounded-xl overflow-hidden border border-gray-300 z-0 relative">
              <MapContainer
                center={position}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker />
                <ChangeView center={position} />
              </MapContainer>
            </div>
            <p className="text-xs text-gray-400 mt-1 text-center">
              {locationText
                ? `Koordinat: ${locationText}`
                : "Klik peta atau tombol untuk set lokasi"}
            </p>
          </div>

          <button
            disabled={loading}
            className="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-600 shadow-md transition disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              "Kirim Laporan"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
