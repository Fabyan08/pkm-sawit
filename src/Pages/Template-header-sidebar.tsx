import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

// --- KONFIGURASI WARNA ---
const COLORS = {
  primary: "#1F7A63", // Hijau Produksi
  energy: "#F59E0B", // Oranye Energi
  food: "#FBBF24", // Kuning Pangan
  env: "#2563EB", // Biru Infrastruktur/Ekspor
  baseline: "#94A3B8", // Abu-abu Baseline
  bg: "#F8FAFC",
  text: "#0F172A",
  danger: "#EF4444", // Merah Risiko
};

export default function App() {
  return (
    <div
      className="flex h-screen overflow-hidden font-sans"
      style={{ backgroundColor: COLORS.bg, color: COLORS.text }}
    >
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50 relative">
        {/* HEADER */}
        <Header />
      </main>
    </div>
  );
}
