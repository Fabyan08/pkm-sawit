import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

declare global {
  interface Window {
    tailwind?: {
      config?: Record<string, unknown>;
    };
  }
}

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

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Settings,
  Activity,
  Globe,
  Zap,
  PackageOpen,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Cpu,
  ShieldCheck,
  Leaf,
  Truck,
  ArrowRight,
  Play,
  LineChart,
  Factory,
  Map,
  Sprout,
  Trees,
  Droplets,
  Thermometer,
} from "lucide-react";

// Mencegah ReferenceError: tailwind is not defined
if (typeof window !== "undefined") {
  window.tailwind = window.tailwind || {};
  window.tailwind.config = window.tailwind.config || {};
}

// --- ENGINE LOGIC & CONSTANTS ---
const BASELINE = {
  produksi: 47.8,
  pangan: 16.3,
  energi: 10.5,
  ekspor: 21.0,
  idxPangan: 78,
  idxEnergi: 65,
  volatilitas: 2.5, // %
  deforestasi: 1.2, // %
  delay: 2.1, // hari
};

const PRESETS = {
  baseline: {
    biodiesel: 35,
    ekspor: 100,
    domestik: 20,
    replanting: 5,
    subsidi: false,
  },
  pangan: {
    biodiesel: 30,
    ekspor: 80,
    domestik: 40,
    replanting: 10,
    subsidi: true,
  },
  energi: {
    biodiesel: 50,
    ekspor: 60,
    domestik: 20,
    replanting: 5,
    subsidi: true,
  },
  ekspor: {
    biodiesel: 30,
    ekspor: 100,
    domestik: 15,
    replanting: 15,
    subsidi: false,
  },
  krisis: {
    biodiesel: 40,
    ekspor: 50,
    domestik: 30,
    replanting: 0,
    subsidi: true,
  },
};

// Helper Format
const num = (n: number) => Number(n).toFixed(1);
const delta = (curr: number, base: number) => {
  const diff = curr - base;
  if (diff === 0) return { val: "0.0", type: "netral" };
  return {
    val: (diff > 0 ? "+" : "") + diff.toFixed(1),
    type: diff > 0 ? "naik" : "turun",
  };
};

// --- COMPONENT: GAUGE BAR ---
type MetricBarProps = {
  label: string;
  value: number;
  prevValue: number;
  unit: string;
  isGoodWhenHigh: boolean;
  icon: React.ElementType;
};

const MetricBar = ({
  label,
  value,
  prevValue,
  unit,
  isGoodWhenHigh,
  icon: Icon,
}: MetricBarProps) => {
  const diff = value - prevValue;
  const isUp = diff > 0;
  const color = isGoodWhenHigh
    ? value > prevValue
      ? "text-emerald-500"
      : "text-red-500"
    : value < prevValue
      ? "text-emerald-500"
      : "text-red-500";
  const barColor = isGoodWhenHigh
    ? value > 80
      ? "bg-emerald-500"
      : value > 50
        ? "bg-amber-500"
        : "bg-red-500"
    : value < 3
      ? "bg-emerald-500"
      : value < 5
        ? "bg-amber-500"
        : "bg-red-500";

  // Normalize bar width (0-100)
  let width = value;
  if (unit === "%") width = value * 10;
  if (unit === "hr") width = value * 20;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-blue-50 ${color}`}>
            <Icon size={16} />
          </div>
          <span className="font-bold text-blue-900 text-sm">{label}</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-black text-blue-950">
            {num(value)}
            <span className="text-xs font-normal text-blue-700">{unit}</span>
          </span>
          <div
            className={`text-[10px] font-bold flex items-center justify-end ${color}`}
          >
            {isUp ? (
              <TrendingUp size={10} className="mr-0.5" />
            ) : (
              <TrendingDown size={10} className="mr-0.5" />
            )}
            {Math.abs(diff).toFixed(1)}
            {unit}
          </div>
        </div>
      </div>
      <div className="w-full h-2 bg-blue-50 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, width))}%` }}
        ></div>
      </div>
    </div>
  );
};

// --- COMPONENT: LEAFLET SPATIAL IMPACT MAP ---
type SimResult = {
  produksi: number;
  pangan: number;
  energi: number;
  ekspor: number;
  idxPangan: number;
  idxEnergi: number;
  volatilitas: number;
  deforestasi: number;
  delay: number;
};

const LeafletImpactMap = ({ sim }: { sim: SimResult }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layerGroup = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    // Inject Leaflet CSS & JS Dynamically
    if (
      typeof window !== "undefined" &&
      !document.getElementById("leaflet-css")
    ) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      document.head.appendChild(script);
    }

    const initMap = () => {
      if (!window.L || mapInstance.current || !mapRef.current) return;

      // Initialize Leaflet Map centered on Indonesia
      mapInstance.current = window.L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([-1.5, 115], 4); // Skala menyorot Indonesia

      // Menggunakan base map yang bersih/terang
      window.L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
        },
      ).addTo(mapInstance.current);

      layerGroup.current = window.L.layerGroup().addTo(mapInstance.current);
    };

    const checkL = setInterval(() => {
      if (window.L) {
        initMap();
        clearInterval(checkL);
      }
    }, 200);

    return () => clearInterval(checkL);
  }, []);

  // Update Map Layers when Simulation Data changes
  useEffect(() => {
    const L = (window as unknown as { L?: typeof import("leaflet") }).L;

    if (!L || !layerGroup.current) return;
    layerGroup.current?.clearLayers();
    // Logic Warna Berdasarkan Dampak
    const sumatraColor =
      sim.delay > 3 ? "#EF4444" : sim.delay > 2.5 ? "#F59E0B" : "#10B981";
    const sumatraStatus =
      sim.delay > 3 ? "Kritis" : sim.delay > 2.5 ? "Padat" : "Aman";

    const kalbarColor =
      sim.deforestasi > 1.5
        ? "#EF4444"
        : sim.deforestasi > 1.2
          ? "#F59E0B"
          : "#10B981";
    const kalbarStatus =
      sim.deforestasi > 1.5
        ? "Tinggi"
        : sim.deforestasi > 1.2
          ? "Waspada"
          : "Aman";

    // Data Region Spasial
    const regions = [
      {
        name: "Sumatera",
        coords: [0.5897, 101.3431] as [number, number],
        radius: 12 + sim.produksi * 0.1,
        color: sumatraColor,
        tooltip: `<div class="text-xs font-sans"><b class="text-blue-900">Sumatera Hub</b><br/>Logistik: <span style="color:${sumatraColor}">${sumatraStatus}</span><br/>Delay: +${num(sim.delay)} hr</div>`,
      },
      {
        name: "Kalimantan",
        coords: [-0.2787, 111.4753] as [number, number],
        radius: 15 + sim.produksi * 0.15,
        color: kalbarColor,
        tooltip: `<div class="text-xs font-sans"><b class="text-blue-900">Kalimantan Cluster</b><br/>Deforestasi: <span style="color:${kalbarColor}">${num(sim.deforestasi)}% (${kalbarStatus})</span><br/>Produksi: ${num(sim.produksi * 0.4)} Jt Ton</div>`,
      },
      {
        name: "Jawa",
        coords: [-7.6145, 110.7122] as [number, number],
        radius: 10 + sim.energi * 0.5,
        color: "#3B82F6", // Blue (Konsumsi)
        tooltip: `<div class="text-xs font-sans"><b class="text-blue-900">Jawa</b><br/>Serapan Biodiesel: ${num(sim.energi)} Jt Ton<br/>Status: Pusat Konsumsi</div>`,
      },
    ];

    regions.forEach((reg) => {
      // Buat Circle animatif
      if (!layerGroup.current) return;

      const circle = L.circleMarker(reg.coords, {
        radius: reg.radius,
        color: reg.color,
        fillColor: reg.color,
        fillOpacity: 0.5,
        weight: 2,
      }).addTo(layerGroup.current);

      circle.bindTooltip(reg.tooltip, {
        direction: "top",
        className:
          "bg-white/95 text-blue-900 border border-blue-100 shadow-md rounded p-1",
      });
    });
  }, [sim]);

  return (
    <div className="w-full h-full relative z-0">
      <div ref={mapRef} className="absolute inset-0 z-0"></div>
      {/* Legend Map (Floating) */}
      <div className="absolute top-2 left-2 z-[400] bg-white/90 backdrop-blur px-2 py-1 rounded shadow-sm border border-blue-100 flex gap-2">
        <span className="flex items-center gap-1 text-[10px] text-blue-800 font-bold">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Aman
        </span>
        <span className="flex items-center gap-1 text-[10px] text-blue-800 font-bold">
          <div className="w-2 h-2 bg-amber-500 rounded-full"></div> Waspada
        </span>
        <span className="flex items-center gap-1 text-[10px] text-blue-800 font-bold">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div> Risiko
        </span>
      </div>
    </div>
  );
};

type Controls = {
  biodiesel: number;
  ekspor: number;
  domestik: number;
  replanting: number;
  subsidi: boolean;
};

export default function Kebijakan() {
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

  // --- STATE MANAGEMENT ---
  type Mode = keyof typeof PRESETS;

  const [mode, setMode] = useState<Mode>("baseline");
  const [controls, setControls] = useState<Controls>(PRESETS.baseline);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setControls(PRESETS[newMode]);
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 600);
  };

  // --- SIMULATION ENGINE (CORE MATH) ---
  const sim = useMemo(() => {
    // 1. Hitung Produksi
    const produksi = BASELINE.produksi + (controls.replanting - 5) * 0.15;

    // 2. Alokasi (Zero-sum game calculation)
    const reqEnergi = produksi * (controls.biodiesel / 100) * 0.627;
    const reqPangan = produksi * (controls.domestik / 100) * 1.7;

    let energi = reqEnergi;
    let pangan = reqPangan;
    let ekspor = produksi - energi - pangan;

    // Jika ekspor dibatasi kuota
    const maxEkspor = BASELINE.ekspor * (controls.ekspor / 100);
    if (ekspor > maxEkspor) {
      const surplus = ekspor - maxEkspor;
      ekspor = maxEkspor;
      pangan += surplus * 0.7; // Luber ke domestik
      energi += surplus * 0.3;
    }

    // Jika defisit (ekspor negatif)
    if (ekspor < 0) {
      pangan += ekspor * 0.4;
      energi += ekspor * 0.6;
      ekspor = 0;
    }

    // 3. Kalkulasi Indeks Dampak
    const idxPangan = Math.min(
      100,
      Math.max(0, BASELINE.idxPangan * (pangan / BASELINE.pangan)),
    );
    const idxEnergi = Math.min(
      100,
      Math.max(0, BASELINE.idxEnergi * (energi / BASELINE.energi)),
    );
    const volatilitas =
      BASELINE.volatilitas +
      (BASELINE.ekspor - ekspor) * 0.2 -
      (controls.subsidi ? 1.5 : 0);
    const deforestasi = Math.max(
      0,
      BASELINE.deforestasi +
        (controls.ekspor - 80) * 0.02 -
        controls.replanting * 0.05,
    );
    const delay =
      BASELINE.delay +
      (controls.biodiesel - 35) * 0.08 +
      (produksi - BASELINE.produksi) * 0.1;

    return {
      produksi,
      pangan,
      energi,
      ekspor,
      idxPangan,
      idxEnergi,
      volatilitas,
      deforestasi,
      delay,
    };
  }, [controls]);

  // --- MODEL FISIOLOGIS TANAMAN ---
  const fisiologis = useMemo(() => {
    const nutrisi = controls.subsidi ? 88 : 62;
    const stressLingkungan = Math.max(12, 45 - controls.replanting * 1.5);
    const potensiYield =
      3.2 + (controls.subsidi ? 0.6 : 0) + controls.replanting * 0.04;
    const umurRataRata = Math.max(8, 16 - controls.replanting * 0.3);

    return { nutrisi, stressLingkungan, potensiYield, umurRataRata };
  }, [controls]);
  return (
    <div
      className="flex h-screen overflow-hidden font-sans"
      style={{ backgroundColor: COLORS.bg, color: COLORS.text }}
    >
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto h-screen overflow-hidden bg-slate-50/50 relative">
        {/* HEADER */}
        <Header />
        <div className=" bg-slate-100 text-blue-950 p-2 md:p-4 font-sans flex flex-col xl:flex-row gap-4">
          {/* ========================================================= */}
          {/* PANEL KIRI: SCENARIO CONTROL PANEL (COMMAND BLUE THEME) */}
          {/* ========================================================= */}
          <div className="w-full xl:w-[350px] realtive flex-shrink-0 bg-blue-900 rounded-2xl shadow-xl border border-blue-800 flex flex-col overflow-hidden  z-10">
            {/* Header Control */}
            <div className="p-5 border-b border-blue-800 bg-blue-900/90 backdrop-blur z-10">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Cpu size={18} className="text-white" />
                </div>
                <h1 className="text-xl font-black text-white tracking-tight">
                  PALMSPHERE
                </h1>
              </div>
              <p className="text-emerald-300 text-xs font-bold tracking-widest uppercase mb-4">
                Policy Simulation Engine
              </p>

              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(PRESETS) as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => handleModeChange(m)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold uppercase transition-all border ${
                      mode === m
                        ? "bg-emerald-500 border-emerald-400 text-white shadow-md"
                        : "bg-blue-800 border-blue-700 text-blue-200 hover:bg-blue-700"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders Area */}
            <div className="p-5 flex-1 overflow-y-auto space-y-6 scrollbar-hide">
              <div className="flex items-center justify-between text-xs font-bold text-blue-300 uppercase tracking-widest border-b border-blue-800 pb-2">
                <span>Parameter Kebijakan</span>
                <Settings size={14} />
              </div>

              {/* Slider 1 */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap size={14} className="text-amber-400" /> Mandatori
                    Biodiesel
                  </label>
                  <span className="text-lg font-black text-amber-300 bg-amber-400/20 px-2 rounded">
                    B{controls.biodiesel}
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="50"
                  step="5"
                  value={controls.biodiesel}
                  onChange={(e) =>
                    setControls({
                      ...controls,
                      biodiesel: Number(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-blue-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-blue-300 font-bold">
                  <span>B30</span>
                  <span>B40</span>
                  <span>B50</span>
                </div>
              </div>

              {/* Slider 2 */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe size={14} className="text-sky-400" /> Kuota Ekspor
                  </label>
                  <span className="text-lg font-black text-sky-300 bg-sky-400/20 px-2 rounded">
                    {controls.ekspor}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={controls.ekspor}
                  onChange={(e) =>
                    setControls({ ...controls, ekspor: Number(e.target.value) })
                  }
                  className="w-full h-2 bg-blue-950 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
                <div className="flex justify-between text-[10px] text-blue-300 font-bold">
                  <span>0% (Stop)</span>
                  <span>100% (Bebas)</span>
                </div>
              </div>

              {/* Slider 3 */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-bold text-white flex items-center gap-2">
                    <PackageOpen size={14} className="text-emerald-400" />{" "}
                    Alokasi Domestik (DMO)
                  </label>
                  <span className="text-lg font-black text-emerald-300 bg-emerald-400/20 px-2 rounded">
                    {controls.domestik}%
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={controls.domestik}
                  onChange={(e) =>
                    setControls({
                      ...controls,
                      domestik: Number(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-blue-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-blue-300 font-bold">
                  <span>Min (15%)</span>
                  <span>Max (60%)</span>
                </div>
              </div>

              {/* Slider 4 */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-bold text-white flex items-center gap-2">
                    <Leaf size={14} className="text-green-400" /> Target
                    Replanting
                  </label>
                  <span className="text-lg font-black text-green-300 bg-green-500/20 px-2 rounded">
                    {controls.replanting}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="5"
                  value={controls.replanting}
                  onChange={(e) =>
                    setControls({
                      ...controls,
                      replanting: Number(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-blue-950 rounded-lg appearance-none cursor-pointer accent-green-400"
                />
              </div>

              {/* Toggle 5 */}
              <div className="flex items-center justify-between p-3 bg-blue-800 rounded-xl border border-blue-700">
                <div>
                  <p className="text-sm font-bold text-white">
                    Intervensi Harga
                  </p>
                  <p className="text-[10px] text-blue-200">Subsidi BPDPKS</p>
                </div>
                <button
                  onClick={() =>
                    setControls({ ...controls, subsidi: !controls.subsidi })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative ${controls.subsidi ? "bg-emerald-500" : "bg-blue-950"}`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${controls.subsidi ? "translate-x-7" : "translate-x-1"}`}
                  ></div>
                </button>
              </div>
            </div>

            {/* Footer Button */}
            <div className="p-5 border-t border-blue-800 bg-blue-900">
              <button
                onClick={() => handleModeChange(mode)}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {isSimulating ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <Play size={18} fill="currentColor" />
                )}
                JALANKAN SIMULASI
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* PANEL KANAN: LIVE RESPONSES & ANALYSIS */}
          {/* ========================================================= */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden relative">
            {/* Efek Loading Simulasi */}
            {isSimulating && (
              <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                <div className="bg-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-blue-100">
                  <RefreshCw
                    className="animate-spin text-emerald-500"
                    size={24}
                  />
                  <div className="text-blue-900 font-black">
                    Mengkalibrasi Model Sistem...
                  </div>
                </div>
              </div>
            )}

            {/* --- SECTION 2: LIVE SYSTEM RESPONSE --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  label: "Produksi Nasional",
                  val: sim.produksi,
                  base: BASELINE.produksi,
                  icon: Factory,
                  color: "text-blue-900",
                  bg: "bg-white border-blue-100",
                },
                {
                  label: "Pangan Domestik",
                  val: sim.pangan,
                  base: BASELINE.pangan,
                  icon: PackageOpen,
                  color: "text-emerald-700",
                  bg: "bg-emerald-50 border-emerald-100",
                },
                {
                  label: "Energi Biodiesel",
                  val: sim.energi,
                  base: BASELINE.energi,
                  icon: Zap,
                  color: "text-amber-700",
                  bg: "bg-amber-50 border-amber-100",
                },
                {
                  label: "Pasar Ekspor",
                  val: sim.ekspor,
                  base: BASELINE.ekspor,
                  icon: Globe,
                  color: "text-sky-700",
                  bg: "bg-sky-50 border-sky-100",
                },
              ].map((item, i) => {
                const d = delta(item.val, item.base);
                return (
                  <div
                    key={i}
                    className={`p-4 rounded-2xl shadow-sm border ${item.bg} flex flex-col justify-between transition-all duration-500`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-blue-800 uppercase">
                        {item.label}
                      </span>
                      <item.icon size={16} className="text-blue-400" />
                    </div>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <span
                          className={`text-2xl md:text-3xl font-black ${item.color}`}
                        >
                          {num(item.val)}
                        </span>
                        <span className="text-xs font-bold text-blue-500 ml-1">
                          Jt Ton
                        </span>
                      </div>
                      <div
                        className={`text-xs font-black px-1.5 py-0.5 rounded ${d.type === "naik" ? "bg-emerald-100 text-emerald-700" : d.type === "turun" ? "bg-red-100 text-red-700" : "bg-slate-200 text-slate-600"}`}
                      >
                        {d.val}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* --- KONDISI FISIOLOGIS SAWIT (DIPINDAHKAN KE ATAS AGAR LANGSUNG TERLIHAT) --- */}
            <div className="bg-white rounded-2xl shadow-md border border-emerald-300 flex flex-col  relative">
              <div className="p-5 border-b border-emerald-100 bg-emerald-50/80 ml-2">
                <h2 className="text-base font-black text-emerald-950 flex items-center gap-2 uppercase tracking-wider">
                  <Sprout size={20} className="text-emerald-600" /> Kondisi
                  Fisiologis Tanaman Sawit
                </h2>
                <p className="text-xs text-emerald-700 font-medium mt-1">
                  Status riil kesehatan tanaman berdasarkan tingkat subsidi
                  pupuk dan laju replanting.
                </p>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 ml-2">
                {/* Metrik 1: Potensi Yield */}
                <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                      <Trees size={16} />
                    </div>
                    <span className="text-xs font-bold text-emerald-800 uppercase">
                      Potensi Yield
                    </span>
                  </div>
                  <p className="text-3xl font-black text-emerald-900">
                    {fisiologis.potensiYield.toFixed(1)}{" "}
                    <span className="text-[11px] font-bold text-emerald-600">
                      Ton/Ha
                    </span>
                  </p>
                  <div className="w-full bg-emerald-100 h-2 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-700"
                      style={{
                        width: `${(fisiologis.potensiYield / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Metrik 2: Nutrisi N-P-K */}
                <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <Droplets size={16} />
                    </div>
                    <span className="text-xs font-bold text-blue-800 uppercase">
                      Status Nutrisi N-P-K
                    </span>
                  </div>
                  <p className="text-3xl font-black text-blue-900">
                    {fisiologis.nutrisi}%
                  </p>
                  <div className="w-full bg-blue-100 h-2 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all duration-700"
                      style={{ width: `${fisiologis.nutrisi}%` }}
                    ></div>
                  </div>
                </div>

                {/* Metrik 3: Stres Lingkungan */}
                <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-100 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                      <Thermometer size={16} />
                    </div>
                    <span className="text-xs font-bold text-amber-800 uppercase">
                      Tingkat Stres (Cuaca)
                    </span>
                  </div>
                  <p className="text-3xl font-black text-amber-900">
                    {fisiologis.stressLingkungan.toFixed(1)}%
                  </p>
                  <div className="w-full bg-amber-100 h-2 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full transition-all duration-700"
                      style={{ width: `${fisiologis.stressLingkungan}%` }}
                    ></div>
                  </div>
                </div>

                {/* Metrik 4: Umur Rata-rata */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-slate-200 rounded-lg text-slate-600">
                      <Activity size={16} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 uppercase">
                      Rata-Rata Umur
                    </span>
                  </div>
                  <p className="text-3xl font-black text-slate-900">
                    {fisiologis.umurRataRata.toFixed(1)}{" "}
                    <span className="text-[11px] font-bold text-slate-500">
                      Tahun
                    </span>
                  </p>
                  <p className="text-xs text-slate-600 font-bold mt-3 bg-white px-2 py-1 rounded border border-slate-200 inline-block text-center">
                    {fisiologis.umurRataRata < 10
                      ? "Profil: Tanaman Muda (TM1)"
                      : "Profil: Tanaman Tua"}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
              {/* KOLOM TENGAH: IMPACT & MAP */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                {/* --- SECTION 3: MULTI-SECTOR IMPACT ANALYSIS --- */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100">
                  <h2 className="text-sm font-black text-blue-950 flex items-center gap-2 mb-4 uppercase tracking-wider">
                    <Activity size={18} className="text-sky-500" /> Multi-Sector
                    Impact Analysis
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <MetricBar
                      label="Ketahanan Pangan"
                      value={sim.idxPangan}
                      prevValue={BASELINE.idxPangan}
                      unit=" Idx"
                      isGoodWhenHigh={true}
                      icon={ShieldCheck}
                    />
                    <MetricBar
                      label="Ketahanan Energi"
                      value={sim.idxEnergi}
                      prevValue={BASELINE.idxEnergi}
                      unit=" Idx"
                      isGoodWhenHigh={true}
                      icon={Zap}
                    />
                    <MetricBar
                      label="Volatilitas Harga"
                      value={sim.volatilitas}
                      prevValue={BASELINE.volatilitas}
                      unit="%"
                      isGoodWhenHigh={false}
                      icon={TrendingUp}
                    />
                    <MetricBar
                      label="Risiko Deforestasi"
                      value={sim.deforestasi}
                      prevValue={BASELINE.deforestasi}
                      unit="%"
                      isGoodWhenHigh={false}
                      icon={AlertTriangle}
                    />
                    <MetricBar
                      label="Kinerja Logistik"
                      value={sim.delay}
                      prevValue={BASELINE.delay}
                      unit="hr"
                      isGoodWhenHigh={false}
                      icon={Truck}
                    />
                  </div>
                </div>

                {/* --- SECTION 4 & 6: MAP & TRADE-OFF (SIDE BY SIDE) --- */}
                <div className="grid  gap-4 flex-1">
                  {/* SPATIAL MAP (Real Leaflet Integration) */}
                  <div className="bg-white rounded-2xl shadow-sm border border-blue-100 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-blue-50 bg-blue-50/50">
                      <h2 className="text-sm font-black text-blue-950 flex items-center gap-2 uppercase tracking-wider">
                        <Map size={16} className="text-emerald-600" /> Spatial
                        Impact Map
                      </h2>
                    </div>
                    <LeafletImpactMap sim={sim} />
                  </div>

                  {/* TRADE-OFF PANEL */}
                </div>
              </div>

              {/* KOLOM KANAN: FORECAST & AI REC */}
              <div className="flex flex-col gap-4">
                {/* --- SECTION 5: FORECAST ENGINE --- */}
                <div className="bg-sky-900 rounded-2xl shadow-sm border border-sky-800 p-5 text-white">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-black flex items-center gap-2 uppercase tracking-wider text-sky-300">
                      <LineChart size={16} /> Forecast Engine (2045)
                    </h2>
                  </div>

                  <div className="h-32 w-full flex items-end justify-between relative pt-4 pb-2 border-b border-sky-800/50">
                    {/* Y Axis Labels */}
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[8px] text-sky-200">
                      <span>60 Jt</span>
                      <span>50 Jt</span>
                      <span>40 Jt</span>
                    </div>
                    {/* SVG Line Chart */}
                    <svg
                      className="absolute inset-0 w-full h-full"
                      preserveAspectRatio="none"
                    >
                      {/* Baseline (Dashed) */}
                      <polyline
                        points="30,80 100,75 180,70 250,68 320,65"
                        fill="none"
                        stroke="#7DD3FC"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                      {/* Policy Simulation Line (Solid & Animated) */}
                      <polyline
                        points={`30,80 100,75 180,${80 - (sim.produksi - 47.8) * 5} 250,${70 - (sim.produksi - 47.8) * 8} 320,${60 - (sim.produksi - 47.8) * 12}`}
                        fill="none"
                        stroke="#34D399"
                        strokeWidth="3"
                        className="transition-all duration-700 ease-in-out drop-shadow-md"
                      />
                    </svg>
                    {/* X Axis Labels */}
                    {[
                      "2025",
                      "2026",
                      "2028",
                      "2029",
                      "2030",
                      "2031",
                      "2032",
                      "2033",
                      "2034",
                      "2035",
                      "2036",
                      "2037",
                      "2038",
                      "2039",
                      "2040",
                      "2041",
                      "2042",
                      "2043",
                      "2044",
                      "2045",
                    ].map((yr, idx) => (
                      <div
                        key={idx}
                        className="text-[10px] text-sky-200 z-10 w-8 text-center ml-4"
                      >
                        {yr}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-3 text-[10px] font-bold justify-center">
                    <span className="flex items-center gap-1 text-sky-200">
                      <div className="w-3 h-0.5 bg-sky-300"></div> Baseline
                    </span>
                    <span className="flex items-center gap-1 text-emerald-300">
                      <div className="w-3 h-1 bg-emerald-400"></div> Policy
                      Target
                    </span>
                  </div>
                </div>

                {/* --- SECTION 7: AI POLICY RECOMMENDATION --- */}
                <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 flex-1 flex flex-col">
                  <h2 className="text-sm font-black text-blue-950 flex items-center gap-2 mb-4 uppercase tracking-wider">
                    <Cpu size={18} className="text-purple-600" /> System Output
                  </h2>

                  <div className="flex-1 space-y-3">
                    {/* Dinamis berdasarkan Simulasi */}
                    {sim.pangan < BASELINE.pangan && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded bg-red-100 text-red-700 mb-1 inline-block">
                          [ KEBIJAKAN ]
                        </span>
                        <p className="text-xs font-semibold text-red-900">
                          Turunkan kuota ekspor min. 5% untuk menstabilkan
                          pasokan pangan dan harga domestik.
                        </p>
                      </div>
                    )}

                    {sim.delay > 2.5 && (
                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-700 mb-1 inline-block">
                          [ LOGISTIK ]
                        </span>
                        <p className="text-xs font-semibold text-amber-900">
                          Alihkan distribusi B50 Jawa ke jalur laut sekunder
                          untuk mengurangi delay {num(sim.delay)} hari.
                        </p>
                      </div>
                    )}

                    {sim.deforestasi > 1.5 && (
                      <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded bg-orange-100 text-orange-700 mb-1 inline-block">
                          [ LINGKUNGAN ]
                        </span>
                        <p className="text-xs font-semibold text-orange-900">
                          Tingkatkan target replanting 10% untuk mencegah risiko
                          deforestasi berlebih di Kalimantan.
                        </p>
                      </div>
                    )}

                    {sim.pangan >= BASELINE.pangan &&
                      sim.delay <= 2.5 &&
                      sim.deforestasi <= 1.5 && (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 mb-1 inline-block">
                            [ PRODUKSI ]
                          </span>
                          <p className="text-xs font-semibold text-emerald-900">
                            Sistem stabil. Pertahankan kuota replanting saat ini
                            dan lanjutkan eksekusi baseline.
                          </p>
                        </div>
                      )}
                  </div>

                  <button className="w-full mt-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-black rounded-lg transition-colors flex justify-center items-center gap-2 uppercase tracking-wider">
                    Cetak Laporan Eksekutif <ArrowRight size={14} />
                  </button>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-blue-100 flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-blue-50 bg-blue-50/50">
                    <h2 className="text-sm font-black text-blue-950 flex items-center gap-2 uppercase tracking-wider">
                      <RefreshCw size={16} className="text-purple-600" /> Policy
                      Trade-Off
                    </h2>
                  </div>
                  <div className="p-5 flex-1 flex flex-col items-center justify-center bg-slate-50">
                    {/* Visual Flow Mini */}
                    <div className="flex flex-col items-center w-full max-w-xs relative">
                      {/* Tengah: Kebijakan */}
                      <div className="bg-blue-900 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-md z-10 w-full text-center border border-blue-800">
                        Mode: {mode.toUpperCase()}
                      </div>

                      {/* Arrows */}
                      <div className="flex justify-between w-full px-6 -mt-2 mb-2">
                        <div className="w-px h-8 bg-blue-200 transform -rotate-45"></div>
                        <div className="w-px h-8 bg-blue-200"></div>
                        <div className="w-px h-8 bg-blue-200 transform rotate-45"></div>
                      </div>

                      {/* Nodes Output */}
                      <div className="flex justify-between w-full gap-2">
                        <div
                          className={`flex-1 p-2 rounded-lg border text-center ${sim.pangan < BASELINE.pangan ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}
                        >
                          <p className="text-[9px] font-bold uppercase text-blue-800">
                            Pangan
                          </p>
                          <p
                            className={`text-xs font-black ${sim.pangan < BASELINE.pangan ? "text-red-600" : "text-emerald-600"}`}
                          >
                            {sim.pangan < BASELINE.pangan ? "TURUN" : "STABIL"}
                          </p>
                        </div>
                        <div
                          className={`flex-1 p-2 rounded-lg border text-center ${sim.energi > BASELINE.energi ? "bg-emerald-50 border-emerald-200" : "bg-white border-blue-100"}`}
                        >
                          <p className="text-[9px] font-bold uppercase text-blue-800">
                            Energi
                          </p>
                          <p
                            className={`text-xs font-black ${sim.energi > BASELINE.energi ? "text-emerald-600" : "text-blue-500"}`}
                          >
                            {sim.energi > BASELINE.energi ? "NAIK" : "TETAP"}
                          </p>
                        </div>
                        <div
                          className={`flex-1 p-2 rounded-lg border text-center ${sim.ekspor > BASELINE.ekspor ? "bg-emerald-50 border-emerald-200" : sim.ekspor < BASELINE.ekspor ? "bg-red-50 border-red-200" : "bg-white border-blue-100"}`}
                        >
                          <p className="text-[9px] font-bold uppercase text-blue-800">
                            Ekspor
                          </p>
                          <p
                            className={`text-xs font-black ${sim.ekspor > BASELINE.ekspor ? "text-emerald-600" : sim.ekspor < BASELINE.ekspor ? "text-red-600" : "text-blue-500"}`}
                          >
                            {sim.ekspor > BASELINE.ekspor
                              ? "NAIK"
                              : sim.ekspor < BASELINE.ekspor
                                ? "TURUN"
                                : "TETAP"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
