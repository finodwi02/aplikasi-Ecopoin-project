import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h3 className="text-2xl font-bold mb-4 flex justify-center items-center gap-2">
          🌿 EcoPoint
        </h3>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
          Platform gamifikasi untuk mewujudkan masa depan bumi yang lebih hijau
          dan berkelanjutan.
        </p>
        <div className="border-t border-gray-800 pt-8 text-sm text-gray-500">
          &copy; 2025 EcoPoint Indonesia. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
