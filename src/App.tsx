import React, { useState } from "react";
import {
  BarChart3,
  Users,
  Leaf,
  TrendingDown,
  Map,
  Activity,
  PieChart,
  Award,
  Target,
  Lightbulb,
  Download,
  Bell,
  Search,
  Menu,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

// --- MOCK DATA ---
const trendDataHarian = [
  { name: "Sen", emisi: 4000, target: 4500 },
  { name: "Sel", emisi: 3000, target: 4400 },
  { name: "Rab", emisi: 2000, target: 4300 },
  { name: "Kam", emisi: 2780, target: 4200 },
  { name: "Jum", emisi: 1890, target: 4100 },
  { name: "Sab", emisi: 2390, target: 4000 },
  { name: "Min", emisi: 3490, target: 3900 },
];

const trendDataMingguan = [
  { name: "Minggu 1", emisi: 24000, target: 28000 },
  { name: "Minggu 2", emisi: 22100, target: 27000 },
  { name: "Minggu 3", emisi: 22900, target: 26000 },
  { name: "Minggu 4", emisi: 20000, target: 25000 },
];

const trendDataBulanan = [
  { name: "Jan", emisi: 120000, target: 130000 },
  { name: "Feb", emisi: 115000, target: 125000 },
  { name: "Mar", emisi: 108000, target: 120000 },
  { name: "Apr", emisi: 102000, target: 115000 },
  { name: "Mei", emisi: 98000, target: 110000 },
  { name: "Jun", emisi: 95000, target: 105000 },
];

const menuItems = [
  { id: "overview", label: "Overview Nasional", icon: BarChart3, active: true },
  { id: "map", label: "Peta Perilaku Karbon", icon: Map, active: false },
  {
    id: "cbi",
    label: "Climate Behavioral Index",
    icon: Activity,
    active: false,
  },
  {
    id: "analysis",
    label: "Analisis Aktivitas",
    icon: PieChart,
    active: false,
  },
  {
    id: "leaderboard",
    label: "Leaderboard Komunitas",
    icon: Award,
    active: false,
  },
  {
    id: "challenge",
    label: "Monitoring Challenge",
    icon: Target,
    active: false,
  },
  {
    id: "insight",
    label: "Insight & Rekomendasi AI",
    icon: Lightbulb,
    active: false,
  },
  {
    id: "export",
    label: "Data Export & Laporan",
    icon: Download,
    active: false,
  },
];

function App() {
  const [timeFilter, setTimeFilter] = useState("harian");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Determine which data to show based on filter
  let chartData = trendDataHarian;
  if (timeFilter === "mingguan") chartData = trendDataMingguan;
  if (timeFilter === "bulanan") chartData = trendDataBulanan;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} />

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          title="Overview Nasional"
        />
        {/* SCROLLABLE DASHBOARD AREA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* KPI CARDS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Total Emisi */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">
                    Total Emisi Karbon (Pemuda)
                  </p>
                  <h3 className="text-3xl font-bold text-slate-800">
                    2.45M{" "}
                    <span className="text-sm font-normal text-slate-500">
                      Ton CO₂e
                    </span>
                  </h3>
                </div>
                <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center text-sm">
                <span className="flex items-center text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  12.5%
                </span>
                <span className="text-slate-400 ml-2">dari bulan lalu</span>
              </div>
            </div>

            {/* Card 2: Pengguna Aktif */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">
                    Total Pengguna Aktif
                  </p>
                  <h3 className="text-3xl font-bold text-slate-800">
                    1.2M{" "}
                    <span className="text-sm font-normal text-slate-500">
                      Pemuda
                    </span>
                  </h3>
                </div>
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center text-sm">
                <span className="flex items-center text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                  <TrendingDown className="w-4 h-4 mr-1 rotate-180" />
                  8.2%
                </span>
                <span className="text-slate-400 ml-2">pengguna baru</span>
              </div>
            </div>

            {/* Card 3: Aksi Hijau */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">
                    Total Aksi Hijau Tercatat
                  </p>
                  <h3 className="text-3xl font-bold text-slate-800">
                    8.5M{" "}
                    <span className="text-sm font-normal text-slate-500">
                      Aksi
                    </span>
                  </h3>
                </div>
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                  <Leaf className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-full bg-slate-100 rounded-full h-2 mr-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
                <span className="text-slate-500 font-medium">75% Target</span>
              </div>
            </div>

            {/* Card 4: Progress */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-sm text-white relative overflow-hidden group">
              {/* Decorative background pattern */}
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full border-4 border-white/20"></div>
              <div className="absolute right-12 bottom-0 w-16 h-16 rounded-full border-4 border-white/10"></div>

              <div className="relative z-10">
                <p className="text-emerald-50 text-sm font-medium mb-1">
                  Progress Penurunan Nasional
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <h3 className="text-4xl font-bold">18.4%</h3>
                  <span className="text-emerald-100 text-sm">Target 20%</span>
                </div>
                <p className="text-sm text-emerald-50 leading-relaxed">
                  Tingkat emisi karbon pemuda berhasil ditekan secara signifikan
                  bulan ini melalui kampanye transportasi publik.
                </p>
              </div>
            </div>
          </div>

          {/* MAIN CHART AREA */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Grafik Tren Emisi Karbon
                </h2>
                <p className="text-sm text-slate-500">
                  Perbandingan volume emisi dengan target nasional
                </p>
              </div>

              {/* Filter Buttons */}
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setTimeFilter("harian")}
                  className={`px-4 py-1.5 text-sm rounded-md transition-all ${timeFilter === "harian" ? "bg-white text-emerald-600 shadow-sm font-medium" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Harian
                </button>
                <button
                  onClick={() => setTimeFilter("mingguan")}
                  className={`px-4 py-1.5 text-sm rounded-md transition-all ${timeFilter === "mingguan" ? "bg-white text-emerald-600 shadow-sm font-medium" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Mingguan
                </button>
                <button
                  onClick={() => setTimeFilter("bulanan")}
                  className={`px-4 py-1.5 text-sm rounded-md transition-all ${timeFilter === "bulanan" ? "bg-white text-emerald-600 shadow-sm font-medium" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Bulanan
                </button>
              </div>
            </div>

            {/* Recharts Area */}
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorEmisi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value, name) => [
                      `${value} Ton`,
                      name === "emisi" ? "Aktual" : "Batas Target",
                    ]}
                  />

                  {/* Target Line (Optional contextual data) */}
                  <Area
                    type="monotone"
                    dataKey="target"
                    stroke="#cbd5e1"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="none"
                  />
                  {/* Main Data Line */}
                  <Area
                    type="monotone"
                    dataKey="emisi"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorEmisi)"
                    activeDot={{
                      r: 6,
                      fill: "#059669",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
