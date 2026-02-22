import React, { useState } from "react";
import {
  BarChart3,
  Users,
  Leaf,
  TrendingDown,
  TrendingUp,
  Map,
  Activity,
  PieChart as PieChartIcon,
  Award,
  Target,
  Lightbulb,
  Download,
  Bell,
  Search,
  Menu,
  Filter,
  MapPin,
  Zap,
  AlertTriangle,
  CheckCircle2,
  X,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

// --- MOCK DATA ---
const mapRegions = [
  {
    id: "jkt",
    name: "DKI Jakarta",
    type: "Provinsi",
    x: "25%",
    y: "65%",
    status: "red",
    emisi: 125,
    cbi: 42,
    users: "120k",
    dom: "Transportasi (65%)",
  },
  {
    id: "bdg",
    name: "Bandung (ITB & Unpad)",
    type: "Kampus",
    x: "28%",
    y: "68%",
    status: "yellow",
    emisi: 85,
    cbi: 65,
    users: "45k",
    dom: "Konsumsi (40%)",
  },
  {
    id: "sBY",
    name: "Surabaya (ITS & Unair)",
    type: "Kampus",
    x: "35%",
    y: "70%",
    status: "yellow",
    emisi: 90,
    cbi: 62,
    users: "50k",
    dom: "Energi (45%)",
  },
  {
    id: "mlg",
    name: "Malang (UB)",
    type: "Kampus",
    x: "35%",
    y: "73%",
    status: "green",
    emisi: 45,
    cbi: 88,
    users: "35k",
    dom: "Sampah (30%)",
  },
  {
    id: "ygy",
    name: "DI Yogyakarta (UGM)",
    type: "Kampus",
    x: "31%",
    y: "71%",
    status: "green",
    emisi: 40,
    cbi: 92,
    users: "60k",
    dom: "Transportasi (35%)",
  },
  {
    id: "mdn",
    name: "Medan (USU)",
    type: "Kampus",
    x: "12%",
    y: "35%",
    status: "red",
    emisi: 110,
    cbi: 48,
    users: "40k",
    dom: "Energi (50%)",
  },
  {
    id: "mks",
    name: "Makassar (Unhas)",
    type: "Kampus",
    x: "55%",
    y: "60%",
    status: "yellow",
    emisi: 75,
    cbi: 68,
    users: "30k",
    dom: "Transportasi (45%)",
  },
  {
    id: "bl",
    name: "Bali (Unud)",
    type: "Kampus",
    x: "42%",
    y: "72%",
    status: "green",
    emisi: 35,
    cbi: 90,
    users: "25k",
    dom: "Konsumsi (30%)",
  },
  {
    id: "pku",
    name: "Pekanbaru (Unri)",
    type: "Kampus",
    x: "15%",
    y: "45%",
    status: "red",
    emisi: 105,
    cbi: 50,
    users: "20k",
    dom: "Energi (55%)",
  },
];

const topGreen = [
  { name: "DI Yogyakarta (UGM)", emisi: "40 kg", cbi: 92, trend: "down" },
  { name: "Bali (Unud)", emisi: "35 kg", cbi: 90, trend: "down" },
  { name: "Malang (UB)", emisi: "45 kg", cbi: 88, trend: "down" },
  { name: "Bogor (IPB)", emisi: "48 kg", cbi: 85, trend: "up" },
  { name: "Purwokerto (Unsoed)", emisi: "50 kg", cbi: 82, trend: "down" },
];

const topRed = [
  {
    name: "DKI Jakarta",
    emisi: "125 kg",
    dom: "Transportasi",
    rec: "Transjakarta Gratis Mahasiswa",
  },
  {
    name: "Medan (USU)",
    emisi: "110 kg",
    dom: "Energi",
    rec: "Audit Energi Gedung Kampus",
  },
  {
    name: "Pekanbaru (Unri)",
    emisi: "105 kg",
    dom: "Energi",
    rec: "Transisi Solar Panel",
  },
  {
    name: "Surabaya (ITS & Unair)",
    emisi: "90 kg",
    dom: "Energi",
    rec: "Pembatasan Kendaraan Pribadi",
  },
  {
    name: "Bandung (ITB & Unpad)",
    emisi: "85 kg",
    dom: "Konsumsi",
    rec: "Kampanye Zero Waste Food",
  },
];

const compareData = [
  { name: "JKT", emisi: 125, rataNasional: 75 },
  { name: "MDN", emisi: 110, rataNasional: 75 },
  { name: "PKU", emisi: 105, rataNasional: 75 },
  { name: "SBY", emisi: 90, rataNasional: 75 },
  { name: "BDG", emisi: 85, rataNasional: 75 },
  { name: "MKS", emisi: 75, rataNasional: 75 },
  { name: "MLG", emisi: 45, rataNasional: 75 },
  { name: "YGY", emisi: 40, rataNasional: 75 },
  { name: "BALI", emisi: 35, rataNasional: 75 },
];

const trendData = [
  { month: "Jan", emisi: 85 },
  { month: "Feb", emisi: 82 },
  { month: "Mar", emisi: 86 },
  { month: "Apr", emisi: 78 },
  { month: "Mei", emisi: 75 },
  { month: "Jun", emisi: 70 },
];

// --- MOCK DATA CBI ---
const cbiTrendData = [
  { month: "Jan", cbi: 62 },
  { month: "Feb", cbi: 64 },
  { month: "Mar", cbi: 63 },
  { month: "Apr", cbi: 67 },
  { month: "Mei", cbi: 70 },
  { month: "Jun", cbi: 72 },
];
const cbiBreakdownData = [
  { name: "Transportasi", value: 35, fill: "#3b82f6" },
  { name: "Energi (Listrik)", value: 25, fill: "#f59e0b" },
  { name: "Konsumsi Makanan", value: 25, fill: "#10b981" },
  { name: "Pengelolaan Sampah", value: 15, fill: "#8b5cf6" },
];
const cbiRankingData = [
  { name: "YGY", cbi: 92, users: 60000 },
  { name: "BALI", cbi: 90, users: 25000 },
  { name: "MLG", cbi: 88, users: 35000 },
  { name: "BDG", cbi: 65, users: 45000 },
  { name: "SBY", cbi: 62, users: 50000 },
  { name: "PKU", cbi: 50, users: 20000 },
  { name: "MDN", cbi: 48, users: 40000 },
  { name: "JKT", cbi: 42, users: 120000 },
];
const cbiUserSegments = [
  {
    id: "leader",
    name: "Eco Leader",
    range: "> 80",
    count: "350k",
    pct: 28,
    color: "bg-emerald-500",
    colorLight: "bg-emerald-100",
    text: "text-emerald-700",
    icon: Crown,
  },
  {
    id: "active",
    name: "Eco Active",
    range: "60-79",
    count: "550k",
    pct: 45,
    color: "bg-teal-500",
    colorLight: "bg-teal-100",
    text: "text-teal-700",
    icon: Zap,
  },
  {
    id: "beginner",
    name: "Eco Beginner",
    range: "40-59",
    count: "200k",
    pct: 16,
    color: "bg-amber-400",
    colorLight: "bg-amber-100",
    text: "text-amber-700",
    icon: Leaf,
  },
  {
    id: "risk",
    name: "Eco At Risk",
    range: "< 40",
    count: "100k",
    pct: 11,
    color: "bg-rose-500",
    colorLight: "bg-rose-100",
    text: "text-rose-700",
    icon: AlertTriangle,
  },
];

export default function Cbi() {
  const [activeMenu, setActiveMenu] = useState("cbi"); // Default diset ke halaman CBI
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  const menuItems = [
    { id: "overview", label: "Overview Nasional", icon: BarChart3 },
    { id: "map", label: "Peta Perilaku Karbon", icon: Map },
    { id: "cbi", label: "Climate Behavioral Index", icon: Activity },
    { id: "analysis", label: "Analisis Aktivitas", icon: PieChartIcon },
    { id: "leaderboard", label: "Leaderboard Komunitas", icon: Award },
    { id: "challenge", label: "Monitoring Challenge", icon: Target },
    { id: "insight", label: "Insight & Rekomendasi AI", icon: Lightbulb },
    { id: "export", label: "Data Export & Laporan", icon: Download },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* --- SIDEBAR --- */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER */}
        <Header
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          title="Overview Nasional"
        />

        {/* SCROLLABLE DASHBOARD AREA */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {/* HALAMAN MAP (Disembunyikan jika menu lain aktif) */}
          <div className={activeMenu === "map" ? "block" : "hidden"}>
            {/* STATISTIK RINGKAS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Rata-rata Emisi Nasional
                  </p>
                  <h3 className="text-xl font-bold text-slate-800">
                    75{" "}
                    <span className="text-sm font-normal text-slate-500">
                      kg CO₂/user
                    </span>
                  </h3>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Wilayah Emisi Tertinggi
                  </p>
                  <h3 className="text-xl font-bold text-slate-800">
                    DKI Jakarta
                  </h3>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Wilayah Paling Hijau
                  </p>
                  <h3 className="text-xl font-bold text-slate-800">
                    Bali (Unud)
                  </h3>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-teal-100 text-teal-600 rounded-xl">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Perubahan Nasional
                  </p>
                  <h3 className="text-xl font-bold text-slate-800">
                    -8.4%{" "}
                    <span className="text-sm font-normal text-slate-500">
                      bln lalu
                    </span>
                  </h3>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 mb-6">
              {/* KIRI: PETA INTERAKTIF */}
              <div className="lg:w-2/3 flex flex-col gap-4">
                {/* FILTER PANEL */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-3 items-center">
                  <Filter className="w-5 h-5 text-slate-400 mr-2" />
                  <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-600">
                    <option>Bulan Ini</option>
                    <option>Minggu Ini</option>
                    <option>Hari Ini</option>
                  </select>
                  <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-600">
                    <option>Semua Kategori</option>
                    <option>Transportasi</option>
                    <option>Energi</option>
                    <option>Konsumsi</option>
                  </select>
                  <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-600">
                    <option>Level: Kampus</option>
                    <option>Level: Kota</option>
                    <option>Level: Provinsi</option>
                  </select>
                </div>

                {/* MAP CANVAS */}
                <div className="bg-slate-800 rounded-2xl h-[450px] relative overflow-hidden shadow-inner border border-slate-200 flex items-center justify-center">
                  {/* Simulated Map Background (Dots pattern) */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        "radial-gradient(#ffffff 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  ></div>
                  <div className="absolute top-4 left-4 text-slate-400 text-xs font-medium tracking-widest flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> PETA PERSEBARAN INDONESIA
                  </div>

                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur px-4 py-3 rounded-xl border border-slate-700 flex flex-col gap-2">
                    <p className="text-xs text-slate-300 font-semibold mb-1">
                      Indikator Emisi
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>{" "}
                      Tinggi (Red Zone)
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"></span>{" "}
                      Sedang (Yellow Zone)
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>{" "}
                      Rendah (Green Zone)
                    </div>
                  </div>

                  {/* Map Markers */}
                  {mapRegions.map((region) => (
                    <div
                      key={region.id}
                      className="absolute group cursor-pointer"
                      style={{ left: region.x, top: region.y }}
                      onMouseEnter={() => setHoveredRegion(region)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      onClick={() => setSelectedRegion(region)}
                    >
                      {/* Pin Dot */}
                      <div
                        className={`w-4 h-4 rounded-full border-2 border-slate-800 transition-transform duration-300 ${
                          region.status === "red"
                            ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)] group-hover:scale-150"
                            : region.status === "yellow"
                              ? "bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)] group-hover:scale-150"
                              : "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] group-hover:scale-150"
                        }`}
                      ></div>

                      {/* Hover Tooltip */}
                      {hoveredRegion?.id === region.id && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white text-slate-800 px-4 py-3 rounded-xl shadow-xl w-56 z-20 pointer-events-none animate-in fade-in slide-in-from-bottom-2">
                          <div className="font-bold border-b border-slate-100 pb-2 mb-2">
                            {region.name}
                          </div>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-500">
                                Emisi rata-rata:
                              </span>
                              <span className="font-semibold">
                                {region.emisi} kg
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Skor CBI:</span>
                              <span className="font-semibold text-emerald-600">
                                {region.cbi}/100
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">
                                Penyumbang:
                              </span>
                              <span className="font-semibold text-rose-600">
                                {region.dom}
                              </span>
                            </div>
                          </div>
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45"></div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* AI INSIGHT PANEL (Muncul saat klik marker) */}
                  {selectedRegion && (
                    <div className="absolute right-4 top-4 bottom-4 w-72 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-5 border border-slate-100 z-30 flex flex-col animate-in slide-in-from-right-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold tracking-wide mb-1">
                            <Zap className="w-3 h-3" /> AI INSIGHT
                          </div>
                          <h3 className="font-bold text-slate-800">
                            {selectedRegion.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => setSelectedRegion(null)}
                          className="p-1 hover:bg-slate-100 rounded-md text-slate-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <p className="text-xs text-slate-500 mb-1">
                            Status Saat Ini
                          </p>
                          <p className="text-sm font-medium">
                            Emisi rata-rata {selectedRegion.emisi} kg/user,
                            didominasi oleh {selectedRegion.dom}.
                          </p>
                        </div>

                        <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                          <p className="text-xs text-rose-600 font-semibold mb-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Prediksi 3 Bulan
                          </p>
                          <p className="text-sm text-rose-800">
                            Cenderung naik +4.5% jika tidak ada intervensi
                            program baru.
                          </p>
                        </div>

                        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                          <p className="text-xs text-emerald-600 font-semibold mb-1 flex items-center gap-1">
                            <Target className="w-3 h-3" /> Rekomendasi Program
                          </p>
                          <p className="text-sm text-emerald-800 mb-2">
                            {selectedRegion.status === "red"
                              ? 'Implementasi "Car-Free Campus Day" setiap Jumat.'
                              : selectedRegion.status === "yellow"
                                ? "Kampanye hemat listrik di fasilitas asrama & perpus."
                                : "Pertahankan dengan Reward Point ganda untuk Bike-to-Campus."}
                          </p>
                          <div className="inline-block bg-white text-emerald-600 text-xs font-bold px-2 py-1 rounded shadow-sm">
                            Potensi Penurunan: -12%
                          </div>
                        </div>
                      </div>

                      <button className="w-full mt-4 bg-slate-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                        Buat Program Sekarang
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* KANAN: TOP 5 WILAYAH */}
              <div className="lg:w-1/3 flex flex-col gap-6">
                {/* Green Zone */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <h3 className="font-bold text-slate-800">
                      Top 5 Wilayah Paling Hijau
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {topGreen.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-100"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span>{item.emisi}</span>
                            <span className="flex items-center gap-1 text-emerald-600 font-medium">
                              <Activity className="w-3 h-3" /> CBI: {item.cbi}
                            </span>
                          </div>
                        </div>
                        {item.trend === "down" ? (
                          <TrendingDown className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-rose-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Red Zone */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <h3 className="font-bold text-slate-800">
                      Top 5 Emisi Tertinggi
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {topRed.map((item, i) => (
                      <div
                        key={i}
                        className="flex flex-col p-3 rounded-xl hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-slate-800">
                            {item.name}
                          </p>
                          <span className="text-xs font-bold text-rose-600">
                            {item.emisi}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">
                          Dominan:{" "}
                          <span className="font-medium text-slate-700">
                            {item.dom}
                          </span>
                        </p>
                        <div className="text-xs bg-white text-rose-700 px-2 py-1.5 rounded-lg border border-rose-100 flex items-start gap-1">
                          <Lightbulb className="w-3 h-3 mt-0.5 shrink-0" />{" "}
                          {item.rec}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* GRAFIK PENDUKUNG */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart - Perbandingan Wilayah */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-1">
                  Perbandingan Emisi Antar Wilayah
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Emisi aktual (kg/user) dibandingkan dengan rata-rata nasional.
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={compareData}
                      margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#64748b" }}
                      />
                      <RechartsTooltip
                        cursor={{ fill: "#f8fafc" }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                      />
                      <Bar
                        dataKey="emisi"
                        name="Emisi Aktual"
                        fill="#0f172a"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                      <Bar
                        dataKey="rataNasional"
                        name="Rata-rata Nasional"
                        fill="#cbd5e1"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Line Chart - Tren Perubahan */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-1">
                  Tren Emisi Regional (Nasional)
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Pergerakan rata-rata volume emisi per user dalam 6 bulan
                  terakhir.
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trendData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        domain={["dataMin - 5", "dataMax + 5"]}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="emisi"
                        name="Rata-rata Emisi (kg)"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          fill: "#10b981",
                          strokeWidth: 2,
                          stroke: "#fff",
                        }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          {/* AKHIR HALAMAN MAP */}

          {/* HALAMAN CLIMATE BEHAVIORAL INDEX */}
          <div
            className={
              activeMenu === "cbi"
                ? "block space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                : "hidden"
            }
          >
            {/* ROW 1: SCORE CARD & SEGMENTASI */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Score Card (Gauge Chart Style) */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10"></div>
                <h3 className="text-sm font-bold text-slate-500 mb-4 self-start w-full text-center">
                  CBI Nasional
                </h3>

                {/* Custom Half-Doughnut as Gauge */}
                <div className="relative w-full h-32 flex justify-center">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={[
                          { value: 72, fill: "#10b981" },
                          { value: 28, fill: "#f1f5f9" },
                        ]}
                        cx="50%"
                        cy="100%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={80}
                        outerRadius={110}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={5}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute bottom-0 flex flex-col items-center">
                    <span className="text-5xl font-extrabold text-slate-800 tracking-tight">
                      72
                      <span className="text-lg text-slate-400 font-medium">
                        /100
                      </span>
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full mt-2 flex items-center gap-1 shadow-sm border border-emerald-200">
                      TINGGI <CheckCircle2 className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between w-full px-4 border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-500">
                    Perubahan bulan ini
                  </span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center bg-emerald-50 px-2 py-0.5 rounded-md">
                    <ArrowUpRight className="w-3 h-3 mr-0.5" /> 4.5 Poin
                  </span>
                </div>
              </div>

              {/* User Segments Cards */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                {cbiUserSegments.map((seg) => (
                  <div
                    key={seg.id}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div
                        className={`p-2 rounded-xl ${seg.colorLight} ${seg.text} transition-transform group-hover:scale-110`}
                      >
                        <seg.icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                        Skor {seg.range}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {seg.name}
                      </h4>
                      <div className="flex items-end justify-between mt-1">
                        <span className="text-2xl font-extrabold text-slate-800">
                          {seg.pct}%
                        </span>
                        <span className="text-xs font-medium text-slate-500 mb-1">
                          {seg.count} user
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                        <div
                          className={`h-full ${seg.color} rounded-full`}
                          style={{ width: `${seg.pct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Insight Panel */}
              <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden flex flex-col">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-wider mb-4 relative z-10">
                  <Zap className="w-4 h-4" /> AI INSIGHT: NASIONAL
                </div>

                <div className="space-y-4 flex-1 relative z-10">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">
                      Faktor Utama Penghambat
                    </p>
                    <p className="text-sm font-medium leading-relaxed">
                      Tingginya penggunaan transportasi pribadi berbasis BBM
                      (65%) di area metropolitan.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">
                      Prediksi 3 Bulan
                    </p>
                    <p className="text-sm font-medium text-emerald-300 leading-relaxed flex items-start gap-1">
                      <TrendingUp className="w-4 h-4 shrink-0 mt-0.5" /> Skor
                      berpotensi naik ke angka 75 jika tren "Green Challenge"
                      stabil.
                    </p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10 mt-auto">
                    <p className="text-xs text-emerald-400 font-bold mb-1">
                      Rekomendasi Prioritas
                    </p>
                    <p className="text-xs leading-relaxed text-slate-200">
                      Gencarkan kampanye{" "}
                      <span className="font-semibold text-white">
                        #BikeToCampus
                      </span>{" "}
                      dan berikan *Reward Points* ganda untuk *carpooling*
                      komunitas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: TREN & KOMPONEN PEMBENTUK */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tren Perilaku Line Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-slate-800">
                      Tren Indeks Perilaku Iklim
                    </h3>
                    <p className="text-xs text-slate-500">
                      Pergerakan CBI dalam 6 bulan terakhir
                    </p>
                  </div>
                  <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-600">
                    <option>Skala Nasional</option>
                    <option>DI Yogyakarta</option>
                    <option>DKI Jakarta</option>
                  </select>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={cbiTrendData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        domain={[40, 100]}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(value) => [`${value} Poin`, "Skor CBI"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="cbi"
                        name="Skor CBI"
                        stroke="#0ea5e9"
                        strokeWidth={4}
                        dot={{
                          r: 5,
                          fill: "#0ea5e9",
                          strokeWidth: 2,
                          stroke: "#fff",
                        }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Komponen CBI Pie Chart */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
                <div>
                  <h3 className="font-bold text-slate-800">
                    Pembentuk Skor CBI
                  </h3>
                  <p className="text-xs text-slate-500 mb-2">
                    Bobot sektor pembentuk kebiasaan
                  </p>
                </div>
                <div className="flex-1 relative h-48 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={cbiBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {cbiBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 10px -1px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(value) => [`${value}%`, "Bobot Kontribusi"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Icon */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Activity className="w-8 h-8 text-slate-300" />
                  </div>
                </div>

                {/* Custom Legend */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {cbiBreakdownData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.fill }}
                      ></span>
                      <span className="text-xs text-slate-600 font-medium truncate">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ROW 3: RANKING WILAYAH */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-slate-800">
                    Ranking Perilaku Hijau (CBI) per Wilayah
                  </h3>
                  <p className="text-xs text-slate-500">
                    Perbandingan skor iklim antar kampus/kota berdasarkan data
                    terkini
                  </p>
                </div>
                <button className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
                  Unduh Laporan CSV
                </button>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={cbiRankingData}
                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      domain={[0, 100]}
                    />
                    <RechartsTooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value, name) => [
                        value,
                        name === "cbi" ? "Skor CBI" : name,
                      ]}
                    />
                    <Bar
                      dataKey="cbi"
                      name="Skor CBI"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={45}
                    >
                      {cbiRankingData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.cbi > 70
                              ? "#10b981"
                              : entry.cbi >= 40
                                ? "#f59e0b"
                                : "#ef4444"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          {/* AKHIR HALAMAN CBI */}
        </div>
      </main>
    </div>
  );
}
