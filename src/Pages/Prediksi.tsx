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

import { useState, useEffect, useMemo } from "react";
import {
  Activity,
  Globe,
  Zap,
  PackageOpen,
  AlertTriangle,
  TrendingUp,
  Cpu,
  ShieldCheck,
  LineChart,
  Factory,
  CalendarDays,
  Truck,
  Lock,
  Flame,
  AlertCircle,
} from "lucide-react";

// Mencegah ReferenceError: tailwind is not defined
if (typeof window !== "undefined") {
  window.tailwind = window.tailwind || {};
  window.tailwind.config = window.tailwind.config || {};
}

// --- CONSTANTS & PRESETS ---
const YEARS = [2025, 2030, 2035, 2040, 2045];

const BASELINE_2025 = {
  produksi: 47.8,
  pangan: 16.3,
  energi: 10.5,
  ekspor: 21.0,
};

// Preset Skenario (Growth Rate % per tahun, dan target Biodiesel)
const PRESETS = {
  baseline: {
    prodGrowth: 0.5,
    domGrowth: 3.5,
    biodiesel: 40,
    label: "Krisis Pasokan",
  }, // Diubah sesuai instruksi (0.5% prod, 3.5% cons, B40)
  pangan: {
    prodGrowth: 2.5,
    domGrowth: 1.5,
    biodiesel: 30,
    label: "Ketahanan Pangan",
  },
  energi: {
    prodGrowth: 2.0,
    domGrowth: 2.5,
    biodiesel: 50,
    label: "Ketahanan Energi",
  },
  ekspor: {
    prodGrowth: 3.5,
    domGrowth: 1.5,
    biodiesel: 30,
    label: "Ekspor Maksimum",
  },
};

const formatNum = (num: number): string => Number(num).toFixed(1);

// --- COMPONENT: MINI SPARKLINE ---
type SparklineProps = {
  data: number[];
  color?: "red" | "emerald" | "amber" | "blue";
  reverse?: boolean;
};

// type SparklineProps = {
//   data: number[];
//   color?: "red" | "emerald" | "amber" | "blue";
// };

const Sparkline = ({ data, color = "blue" }: SparklineProps) => {
  const max = Math.max(...data) * 1.1;
  const min = 0;
  const points = data
    .map((val: number, i: number) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 30 - ((val - min) / (max - min)) * 30;
      return `${x},${y}`;
    })
    .join(" ");

  const strokeColor =
    color === "red"
      ? "#EF4444"
      : color === "emerald"
        ? "#10B981"
        : color === "amber"
          ? "#F59E0B"
          : "#3B82F6";
  const bgColor =
    color === "red"
      ? "#FEF2F2"
      : color === "emerald"
        ? "#ECFDF5"
        : color === "amber"
          ? "#FFFBEB"
          : "#EFF6FF";

  return (
    <div
      className="w-full h-8 relative mt-2 rounded overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <svg
        viewBox="0 0 100 30"
        className="absolute inset-0 w-full h-full preserve-aspect-ratio-none"
      >
        <polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default function Prediksi() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !document.getElementById("tailwind-cdn")
    ) {
      const script = document.createElement("script");
      script.id = "tailwind-cdn";
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  type Mode = keyof typeof PRESETS;
  const [mode, setMode] = useState<Mode>("baseline");
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const controls = PRESETS[mode];

  // --- FORECAST ENGINE (MATH MODEL 2025 - 2045) ---
  type Projection = {
    year: number;
    produksi: number;
    pangan: number;
    energi: number;
    ekspor: number;
    totalDemand: number;
    gap: number;
  };
  const projections: Projection[] = useMemo(() => {
    return YEARS.map((year) => {
      const t = year - 2025;

      const produksi =
        BASELINE_2025.produksi * Math.pow(1 + controls.prodGrowth / 100, t);
      const pangan =
        BASELINE_2025.pangan * Math.pow(1 + controls.domGrowth / 100, t);

      const energiMultiplier = controls.biodiesel / 35;
      const energi =
        BASELINE_2025.energi * energiMultiplier * Math.pow(1 + 0.02, t);

      const ekspor = BASELINE_2025.ekspor * Math.pow(1 + 0.01, t);
      const totalDemand = pangan + energi + ekspor;
      const gap = produksi - totalDemand;

      let eksporAktual = ekspor;
      if (gap < 0) {
        eksporAktual = Math.max(0, ekspor + gap);
      }

      return {
        year,
        produksi,
        pangan,
        energi,
        ekspor: eksporAktual,
        totalDemand,
        gap,
      };
    });
  }, [controls]);

  const data2045 = projections[projections.length - 1];
  const isDeficit2045 = data2045.gap < 0;

  // Trend Data untuk Sparkline Pangan & Energi (Di-hardcode secara matematis berdasarkan gap)
  const panganTrend = projections.map((p) =>
    Math.max(
      10,
      78 - (p.gap < 0 ? Math.abs(p.gap) * 2.5 : 0) - (p.year - 2025) * 0.5,
    ),
  );
  const energiTrend = projections.map((p) =>
    Math.min(100, 60 + (controls.biodiesel - 35) * 1.5 + (p.year - 2025) * 0.8),
  );
  const gapTrend = projections.map((p) => p.gap);

  type ProjectionKey = "produksi" | "pangan" | "energi" | "ekspor";

  const generatePath = (dataKey: ProjectionKey, maxValue: number): string => {
    const width = 800;
    const height = 240;
    const xStep = width / (YEARS.length - 1);

    return projections
      .map((d, i) => {
        const x = i * xStep;
        const y = height - (d[dataKey] / maxValue) * height;
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  return (
    <div
      className="flex h-screen overflow-hidden font-sans"
      style={{ backgroundColor: COLORS.bg, color: COLORS.text }}
    >
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex overflow-y-auto flex-col h-screen overflow-hidden bg-slate-50/50 relative">
        {/* HEADER */}
        <Header />
        <div className="min-h-screen bg-slate-50 text-blue-950 p-4 font-sans flex flex-col gap-6">
          {/* ========================================================= */}
          {/* HEADER & SCENARIO SELECTOR */}
          {/* ========================================================= */}
          <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-blue-100">
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-blue-50/50 p-2 rounded-xl border border-blue-100 w-full ">
              <div className="flex p-1 bg-white rounded-lg shadow-sm border border-blue-100 w-full overflow-x-auto scrollbar-hide">
                {(Object.keys(PRESETS) as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`py-2 px-4 rounded-md text-xs font-bold uppercase transition-all whitespace-nowrap ${
                      mode === m
                        ? "bg-blue-900 text-white shadow-md"
                        : "text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {m === "baseline"
                      ? "Baseline (Trend Saat Ini)"
                      : PRESETS[m].label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 px-4 w-full sm:w-auto">
                <div className="flex items-center ">
                  <span className="text-[10px] text-blue-500 font-bold uppercase">
                    Target Waktu
                  </span>
                  <span className="text-sm font-black text-blue-900 flex flex-row text-nowrap items-center gap-1">
                    <CalendarDays size={14} /> 2025 &rarr; 2045
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* ========================================================= */}
            {/* LEFT PANEL: STATIC ASSUMPTIONS & SECTOR CARDS */}
            {/* ========================================================= */}
            <div className="xl:col-span-1 flex flex-col gap-4">
              {/* SCENARIO BASIS (READ ONLY) */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-900"></div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xs font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                    <Lock size={14} className="text-blue-500" /> Asumsi Proyeksi
                  </h2>
                  <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">
                    Scenario Basis
                  </span>
                </div>

                <ul className="space-y-4">
                  <li className="flex flex-col border-b border-slate-50 pb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      Pertumbuhan Produksi
                    </span>
                    <span className="text-sm font-black text-blue-900">
                      +{formatNum(controls.prodGrowth)}% / tahun
                    </span>
                  </li>
                  <li className="flex flex-col border-b border-slate-50 pb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      Pertumbuhan Konsumsi
                    </span>
                    <span className="text-sm font-black text-blue-900">
                      +{formatNum(controls.domGrowth)}% / tahun
                    </span>
                  </li>
                  <li className="flex flex-col border-b border-slate-50 pb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      Mandatori Biodiesel
                    </span>
                    <span className="text-sm font-black text-blue-900">
                      B{controls.biodiesel} (Tetap)
                    </span>
                  </li>
                  <li className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      Tren Ekspor Global
                    </span>
                    <span className="text-sm font-black text-blue-900">
                      Stabil Meningkat
                    </span>
                  </li>
                </ul>
              </div>

              {/* SECTOR PROJECTION PANELS */}
              <div className="grid grid-cols-2 gap-3 flex-1">
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                    <Factory size={60} />
                  </div>
                  <p className="text-[10px] font-bold text-emerald-800 uppercase">
                    Produksi Sawit
                  </p>
                  <p className="text-xl font-black text-emerald-900 mt-1">
                    {formatNum(data2045.produksi)}{" "}
                    <span className="text-[10px] font-normal">Jt Ton</span>
                  </p>
                  <p className="text-[10px] font-bold text-emerald-600 mt-1">
                    2025: {BASELINE_2025.produksi}
                  </p>
                </div>
                <div
                  className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden ${isDeficit2045 ? "bg-red-50 border-red-100" : "bg-yellow-50 border-yellow-100"}`}
                >
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                    <PackageOpen size={60} />
                  </div>
                  <p
                    className={`text-[10px] font-bold uppercase ${isDeficit2045 ? "text-red-800" : "text-yellow-800"}`}
                  >
                    Pangan Domestik
                  </p>
                  <p
                    className={`text-xl font-black mt-1 ${isDeficit2045 ? "text-red-900" : "text-yellow-900"}`}
                  >
                    {formatNum(data2045.pangan)}{" "}
                    <span className="text-[10px] font-normal">Jt Ton</span>
                  </p>
                  <p
                    className={`text-[10px] font-bold mt-1 ${isDeficit2045 ? "text-red-600" : "text-yellow-600"}`}
                  >
                    Status: {isDeficit2045 ? "Defisit" : "Aman"}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                    <Zap size={60} />
                  </div>
                  <p className="text-[10px] font-bold text-orange-800 uppercase">
                    Energi Biodiesel
                  </p>
                  <p className="text-xl font-black text-orange-900 mt-1">
                    {formatNum(data2045.energi)}{" "}
                    <span className="text-[10px] font-normal">Jt Ton</span>
                  </p>
                  <p className="text-[10px] font-bold text-orange-600 mt-1">
                    Kebijakan B{controls.biodiesel}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                    <Globe size={60} />
                  </div>
                  <p className="text-[10px] font-bold text-blue-800 uppercase">
                    Vol. Ekspor
                  </p>
                  <p className="text-xl font-black text-blue-900 mt-1">
                    {formatNum(data2045.ekspor)}{" "}
                    <span className="text-[10px] font-normal">Jt Ton</span>
                  </p>
                  <p className="text-[10px] font-bold text-blue-600 mt-1">
                    2025: {BASELINE_2025.ekspor}
                  </p>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* CENTER PANEL: NATIONAL FORECAST CHART & TIMELINE */}
            {/* ========================================================= */}
            <div className="xl:col-span-2 flex flex-col gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 flex-1 flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-base font-black text-blue-950 flex items-center gap-2 uppercase tracking-wider">
                      <LineChart size={18} className="text-blue-600" /> Outlook
                      Produksi & Konsumsi Sawit Nasional
                    </h2>
                    <p className="text-xs text-blue-500 mt-1 font-bold bg-blue-50 inline-block px-2 py-0.5 rounded">
                      Baseline 2025–2045 (Tanpa intervensi kebijakan tambahan)
                    </p>
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-3 max-w-[200px] justify-end">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                      <div className="w-3 h-1 bg-emerald-500 rounded-full"></div>{" "}
                      Produksi
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-600">
                      <div className="w-3 h-1 bg-yellow-400 rounded-full"></div>{" "}
                      Pangan
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600">
                      <div className="w-3 h-1 bg-orange-500 rounded-full"></div>{" "}
                      Energi
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
                      <div className="w-3 h-1 bg-blue-500 rounded-full"></div>{" "}
                      Ekspor
                    </span>
                  </div>
                </div>

                {/* CORE CHART AREA (SVG) */}
                <div
                  className="flex-1 w-full relative min-h-[200px] group"
                  onMouseLeave={() => setHoveredYear(null)}
                >
                  {/* Y-Axis Labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] font-bold text-blue-400 pb-6">
                    <span>120 Jt</span>
                    <span>90 Jt</span>
                    <span>60 Jt</span>
                    <span>30 Jt</span>
                    <span>0</span>
                  </div>

                  {/* SVG Canvas */}
                  <svg
                    viewBox="0 0 800 240"
                    className="absolute inset-0 w-full h-full pl-10 pb-6 preserve-aspect-ratio-none"
                  >
                    {/* Grid Lines */}
                    {[0, 60, 120, 180, 240].map((y, i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={y}
                        x2="800"
                        y2={y}
                        stroke="#F1F5F9"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                    ))}

                    {/* Data Lines (Max Y = 120 for scaling) */}
                    <path
                      d={generatePath("ekspor", 120)}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      className="transition-all duration-700 drop-shadow-sm"
                    />
                    <path
                      d={generatePath("energi", 120)}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="3"
                      className="transition-all duration-700 drop-shadow-sm"
                    />
                    <path
                      d={generatePath("pangan", 120)}
                      fill="none"
                      stroke="#FACC15"
                      strokeWidth="3"
                      className="transition-all duration-700 drop-shadow-sm"
                    />
                    <path
                      d={generatePath("produksi", 120)}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="4"
                      className="transition-all duration-700 drop-shadow-md"
                    />

                    {/* Fill Area for Deficit Warning (between Production and Total Demand if Demand > Prod) */}
                    {isDeficit2045 && mode === "baseline" && (
                      <path
                        d={`${generatePath("produksi", 120)} L 800 240 L 0 240 Z`}
                        fill="url(#deficitGrad)"
                        opacity="0.1"
                      />
                    )}
                    <defs>
                      <linearGradient
                        id="deficitGrad"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="50%" stopColor="transparent" />
                        <stop offset="100%" stopColor="#EF4444" />
                      </linearGradient>
                    </defs>

                    {/* Interactive Hover Zones */}
                    {YEARS.map((year, i) => {
                      const x = i * (800 / 4);
                      return (
                        <g key={year}>
                          {hoveredYear === year && (
                            <line
                              x1={x}
                              y1="0"
                              x2={x}
                              y2="240"
                              stroke="#94A3B8"
                              strokeWidth="1"
                              strokeDasharray="4 4"
                            />
                          )}
                          <rect
                            x={x - 40}
                            y="0"
                            width="80"
                            height="240"
                            fill="transparent"
                            className="cursor-crosshair"
                            onMouseEnter={() => setHoveredYear(year)}
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* X-Axis Labels */}
                  <div className="absolute bottom-0 left-10 right-0 flex justify-between text-[10px] font-black text-blue-800">
                    {YEARS.map((yr) => (
                      <span
                        key={yr}
                        className={
                          hoveredYear === yr
                            ? "text-blue-600 scale-110 transition-transform"
                            : ""
                        }
                      >
                        {yr}
                      </span>
                    ))}
                  </div>

                  {/* DYNAMIC TOOLTIP */}
                  {hoveredYear && (
                    <div
                      className="absolute top-2 bg-white/95 backdrop-blur-sm border border-blue-100 p-3 rounded-xl shadow-xl pointer-events-none transition-all z-10 min-w-[140px]"
                      style={{
                        left: `calc(30px + ${YEARS.indexOf(hoveredYear) * 22}%)`,
                      }}
                    >
                      <p className="text-xs font-black text-blue-950 border-b border-blue-50 pb-1 mb-2">
                        Tahun {hoveredYear}
                      </p>
                      {(() => {
                        const d = projections.find(
                          (p) => p.year === hoveredYear,
                        )!;
                        return (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-emerald-600">
                                Produksi:
                              </span>{" "}
                              <span>{formatNum(d.produksi)}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-yellow-600">Pangan:</span>{" "}
                              <span>{formatNum(d.pangan)}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-orange-600">Energi:</span>{" "}
                              <span>{formatNum(d.energi)}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-blue-600">Ekspor:</span>{" "}
                              <span>{formatNum(d.ekspor)}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* 🔥 CRITICAL TIMELINE INSIGHT (GAME CHANGER) 🔥 */}
                <div className="mt-6 border-t border-red-100 pt-4 bg-red-50/30 -mx-5 px-5 -mb-5 pb-5 rounded-b-2xl">
                  <h3 className="text-xs font-black text-red-600 flex items-center gap-2 uppercase tracking-widest mb-3">
                    <Flame size={14} className="animate-pulse" /> Timeline
                    Insight & Titik Kritis
                  </h3>
                  <div className="grid grid-cols-5 gap-2 relative">
                    {/* Timeline Line */}
                    <div className="absolute top-2 left-4 right-4 h-0.5 bg-red-200 z-0"></div>

                    {[
                      {
                        yr: 2028,
                        desc: "Mulai tekanan logistik di Kalimantan",
                      },
                      {
                        yr: 2032,
                        desc: "Overcapacity pelabuhan utama (Dumai)",
                      },
                      {
                        yr: 2035,
                        desc: "Defisit pasokan domestik (-6 Jt Ton)",
                      },
                      { yr: 2040, desc: "Ketergantungan impor meningkat" },
                      { yr: 2045, desc: "Ketahanan pangan sawit kritis" },
                    ].map((item) => (
                      <div
                        key={item.yr}
                        className="relative z-10 flex flex-col items-center text-center group"
                      >
                        <div className="w-4 h-4 rounded-full bg-white border-4 border-red-400 shadow-sm group-hover:border-red-600 transition-colors"></div>
                        <span className="text-[10px] font-black text-red-800 mt-1">
                          {item.yr}
                        </span>
                        <span className="text-[9px] text-red-600 font-medium leading-tight mt-1">
                          {item.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* GAP ANALYSIS & INDICES (TREND BASED) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Supply vs Demand Gap Trend */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 flex flex-col justify-center relative overflow-hidden">
                  <h3 className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">
                    Gap Trend (2025–2045)
                  </h3>
                  <p className="text-[10px] font-bold text-red-500 mb-3">
                    Defisit terjadi mulai 2033 dan meningkat hingga 2045
                  </p>

                  <div className="flex items-end justify-between mb-2 relative z-10">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">
                        2045 Defisit
                      </p>
                      <p className="text-xl font-black text-red-600">
                        {formatNum(data2045.gap)}{" "}
                        <span className="text-xs">Jt Ton</span>
                      </p>
                    </div>
                  </div>

                  {/* Mini Chart Gap */}
                  <Sparkline
                    data={gapTrend}
                    color={isDeficit2045 ? "red" : "emerald"}
                  />

                  {/* Latar merah transparan jika defisit */}
                  {isDeficit2045 && (
                    <div className="absolute inset-0 bg-red-50/50 pointer-events-none"></div>
                  )}
                </div>

                {/* Food & Energy Trend Lines */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 flex flex-col justify-between">
                  {/* Ketahanan Pangan */}
                  <div className="mb-3">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] font-bold text-blue-900 uppercase">
                        Ketahanan Pangan
                      </span>
                      <span className="text-[10px] font-black text-slate-500">
                        78 &rarr; 65 &rarr;{" "}
                        <span className="text-red-600">
                          {Math.round(panganTrend[4])} (2045)
                        </span>
                      </span>
                    </div>
                    <Sparkline data={panganTrend} color="red" />
                  </div>

                  {/* Ketahanan Energi */}
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] font-bold text-blue-900 uppercase">
                        Ketahanan Energi
                      </span>
                      <span className="text-[10px] font-black text-slate-500">
                        60 &rarr; 72 &rarr;{" "}
                        <span className="text-emerald-600">
                          {Math.round(energiTrend[4])} (2045)
                        </span>
                      </span>
                    </div>
                    <Sparkline
                      data={energiTrend}
                      color="emerald"
                      reverse={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* RIGHT PANEL: RISK & INSIGHT */}
            {/* ========================================================= */}
            <div className="xl:col-span-1 flex flex-col gap-4">
              {/* RISK PROJECTION (NATIONAL IMPACT LEVEL UP) */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-100 flex-1">
                <h2 className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <AlertTriangle size={14} /> Proyeksi Risiko Nasional
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-3 items-start border-b border-slate-50 pb-3">
                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-red-500">
                      <TrendingUp size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-900">
                        Risiko Deforestasi
                      </p>
                      <p className="text-[10px] text-blue-600 leading-relaxed mt-0.5">
                        Laju deforestasi{" "}
                        <span className="font-bold text-red-600">
                          +{formatNum(controls.prodGrowth * 1.6)}%
                        </span>
                        . Potensi kehilangan{" "}
                        <span className="font-black text-red-600">
                          1.2 juta hektar
                        </span>{" "}
                        hutan primer.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start border-b border-slate-50 pb-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 text-amber-500">
                      <Activity size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-900">
                        Ketidakseimbangan Pangan
                      </p>
                      <p className="text-[10px] text-blue-600 leading-relaxed mt-0.5">
                        Defisit pasokan{" "}
                        <span className="font-bold text-amber-600">
                          {Math.abs(data2045.gap).toFixed(1)} Jt Ton
                        </span>
                        . Risiko krisis harga minyak goreng dan inflasi tinggi.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 text-orange-500">
                      <Truck size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-900">
                        Risiko Logistik
                      </p>
                      <p className="text-[10px] text-blue-600 leading-relaxed mt-0.5">
                        Delay distribusi nasional{" "}
                        <span className="font-bold text-orange-600">
                          +2.3 Hari
                        </span>{" "}
                        memicu pembengkakan ongkos angkut.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* LONG TERM POLICY INSIGHT (STRUKTUR BARU) */}
              <div className="bg-blue-950 p-5 rounded-2xl shadow-lg border border-blue-900 text-white relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-10">
                  <Cpu size={120} />
                </div>
                <h2 className="text-xs font-black text-blue-300 uppercase tracking-widest flex items-center gap-2 mb-4 relative z-10">
                  <ShieldCheck size={14} /> Long-Term Policy Insight
                </h2>

                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-blue-200 mb-2 uppercase">
                    Jika tidak ada intervensi:
                  </p>
                  <ol className="text-[10px] text-blue-50 space-y-2 mb-4 list-decimal pl-4 font-medium leading-relaxed">
                    <li>
                      Indonesia akan mengalami defisit sawit domestik mulai{" "}
                      <span className="text-red-300 font-bold">2035</span>.
                    </li>
                    <li>
                      Ekspor akan tetap tinggi namun mengorbankan porsi
                      ketahanan pangan.
                    </li>
                    <li>
                      Biodiesel B{controls.biodiesel} akan mendominasi alokasi
                      CPO nasional.
                    </li>
                  </ol>

                  <div className="bg-blue-900/50 p-3 rounded-xl border border-red-500/30 mt-4">
                    <p className="text-[10px] font-black text-red-400 mb-2 flex items-center gap-1 uppercase">
                      <AlertCircle size={12} /> Konsekuensi Sistemik:
                    </p>
                    <ul className="space-y-1 text-[10px] text-blue-100 list-disc pl-3">
                      <li>Kenaikan ekstrem harga minyak goreng</li>
                      <li>Ketergantungan impor produk turunan</li>
                      <li>Tekanan deforestasi tak terkendali</li>
                    </ul>
                  </div>

                  {/* TRANSITION TO SIMULATION BUTTON */}
                  {/* <button className="w-full mt-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-[11px] font-black rounded-xl transition-all flex justify-center items-center gap-2 uppercase tracking-widest shadow-lg shadow-emerald-500/30 active:scale-95 group">
                    <PlayCircle
                      size={16}
                      className="group-hover:animate-pulse"
                    />
                    Uji Skenario Kebijakan
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
