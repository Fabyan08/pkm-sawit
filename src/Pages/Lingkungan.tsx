import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import type { LucideIcon } from "lucide-react";

type LayerOption = {
  id: LayerType;
  label: string;
  icon: LucideIcon;
};
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

import { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  Wind,
  Map,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
  Layers,
  Radar,
  TreePine,
  Factory,
  ShieldCheck,
  ThermometerSun,
  MousePointer2,
} from "lucide-react";

// Mencegah ReferenceError: tailwind is not defined
if (typeof window !== "undefined") {
  window.tailwind = window.tailwind || {};
  window.tailwind.config = window.tailwind.config || {};
}

// --- DATA MOCKUP (COMMAND CENTER DATA) ---
const KPI_DATA = {
  deforestation: { val: "+0.8", unit: "%", status: "naik", level: "warning" },
  conversion: { val: "1.2", unit: "Jt ha", status: "naik", level: "danger" },
  emission: { val: "320", unit: "MtCO₂", status: "naik", level: "warning" },
  sustainability: {
    val: "68",
    unit: "/100",
    status: "turun",
    level: "warning",
  },
};

type Region = {
  id: string;
  name: string;
  coords: [number, number];
  deforest: number;
  emission: number;
  prod: number;
  konsv: number;
  status: "danger" | "warning" | "safe";
};

const REGIONS: Region[] = [
  {
    id: "kalbar",
    name: "Kalimantan",
    coords: [-0.2787, 111.4753],
    deforest: 3.2,
    emission: 85,
    prod: 45,
    konsv: 20,
    status: "danger",
  },
  {
    id: "sumatra",
    name: "Sumatera",
    coords: [0.5897, 101.3431],
    deforest: 0.8,
    emission: 60,
    prod: 65,
    konsv: 35,
    status: "warning",
  },
  {
    id: "papua",
    name: "Papua",
    coords: [-4.2699, 138.0803],
    deforest: 1.5,
    emission: 20,
    prod: 15,
    konsv: 80,
    status: "warning",
  },
  {
    id: "sulawesi",
    name: "Sulawesi",
    coords: [-2.0833, 120.3166],
    deforest: 0.4,
    emission: 15,
    prod: 10,
    konsv: 40,
    status: "safe",
  },
];

const SPARKLINE_YEARS = [2021, 2022, 2023, 2024, 2025];
const SPARKLINE_DATA = {
  deforest: [60, 65, 68, 70, 72],
  landuse: [90, 100, 110, 115, 120],
  carbon: [280, 295, 305, 315, 320],
  biodiversity: [40, 45, 55, 65, 80],
};

const DEFORESTATION_HISTORY = [
  { yr: 2020, kal: 45, sum: 30, pap: 10, total: 85 },
  { yr: 2021, kal: 50, sum: 30, pap: 12, total: 92 },
  { yr: 2022, kal: 58, sum: 29, pap: 15, total: 102 },
  { yr: 2023, kal: 65, sum: 28, pap: 18, total: 111 },
  { yr: 2024, kal: 72, sum: 28, pap: 22, total: 122 },
  { yr: 2025, kal: 80, sum: 27, pap: 28, total: 135 },
];

const EMISSION_PROJECTION = [
  { yr: 2025, base: 320, policy: 320 },
  { yr: 2030, base: 360, policy: 290 },
  { yr: 2035, base: 410, policy: 240 },
  { yr: 2040, base: 470, policy: 180 },
  { yr: 2045, base: 530, policy: 120 },
];

// --- HELPER COMPONENTS: INTERACTIVE SPARKLINE ---
type SparklineProps = {
  data: number[];
  color: "red" | "emerald" | "amber";
  unit: string;
};

const InteractiveSparkline = ({ data, color, unit }: SparklineProps) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const max = Math.max(...data) * 1.1;
  const min = Math.min(...data) * 0.9;

  const points = data.map((val: number, i: number) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 30 - ((val - min) / (max - min)) * 30;
    return { x, y, val, year: SPARKLINE_YEARS[i] };
  });

  const pathString = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const strokeColor =
    color === "red" ? "#EF4444" : color === "emerald" ? "#10B981" : "#F59E0B";
  const bgColor =
    color === "red" ? "#FEF2F2" : color === "emerald" ? "#ECFDF5" : "#FFFBEB";

  return (
    <div
      className="w-full h-10 relative mt-2 rounded overflow-visible group"
      style={{ backgroundColor: bgColor }}
    >
      <svg
        viewBox="0 0 100 30"
        className="absolute inset-0 w-full h-full preserve-aspect-ratio-none overflow-visible"
      >
        <path
          d={pathString}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Draw interactive points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hoverIdx === i ? "4" : "2"}
            fill={hoverIdx === i ? strokeColor : "white"}
            stroke={strokeColor}
            strokeWidth="1.5"
            className="transition-all duration-200"
          />
        ))}
      </svg>

      {/* Invisible Hover Zones */}
      <div className="absolute inset-0 flex z-10">
        {points.map((_p, i) => (
          <div
            key={i}
            className="flex-1 cursor-pointer"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          ></div>
        ))}
      </div>

      {/* Tooltip */}
      {hoverIdx !== null && (
        <div
          className="absolute -top-8 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none z-20 whitespace-nowrap transform -translate-x-1/2"
          style={{ left: `${points[hoverIdx].x}%` }}
        >
          {points[hoverIdx].year}:{" "}
          <span style={{ color: strokeColor }}>
            {points[hoverIdx].val} {unit}
          </span>
        </div>
      )}
    </div>
  );
};

// --- LEAFLET MAP COMPONENT ---
type LayerType = "deforest" | "emission" | "konservasi" | "produksi";
import type { Map as LeafletMap, LayerGroup } from "leaflet";

const LeafletEnvMap = ({ activeLayer }: { activeLayer: LayerType }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const mapInstance = useRef<LeafletMap | null>(null);
  const layerGroup = useRef<LayerGroup | null>(null);

  useEffect(() => {
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

      mapInstance.current = window.L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([-2.0, 118], 5);

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

  useEffect(() => {
    if (!window.L || !layerGroup.current) return;
    layerGroup.current.clearLayers();

    REGIONS.forEach((reg) => {
      let radius,
        color,
        fillColor,
        valueLabel,
        pulse = false;

      if (activeLayer === "deforest") {
        radius = reg.deforest * 8;
        color =
          reg.deforest > 2
            ? "#EF4444"
            : reg.deforest > 1
              ? "#F59E0B"
              : "#10B981";
        fillColor = color;
        valueLabel = `Deforestasi: +${reg.deforest}%`;
        pulse = reg.deforest > 2;
      } else if (activeLayer === "emission") {
        radius = reg.emission * 0.4;
        color =
          reg.emission > 70
            ? "#9333EA"
            : reg.emission > 40
              ? "#F59E0B"
              : "#3B82F6";
        fillColor = color;
        valueLabel = `Emisi: ${reg.emission} MtCO₂`;
        pulse = reg.emission > 70;
      } else if (activeLayer === "konservasi") {
        radius = reg.konsv * 0.5;
        color = "#10B981";
        fillColor = "#34D399";
        valueLabel = `Kawasan Lindung: ${reg.konsv}%`;
      } else {
        radius = reg.prod * 0.5;
        color = "#059669";
        fillColor = "#10B981";
        valueLabel = `Produksi: ${reg.prod} Jt Ton`;
      }

      const htmlIcon = `
        <div class="relative flex items-center justify-center" style="width:${radius * 2}px; height:${radius * 2}px;">
          ${pulse ? `<div class="absolute inset-0 rounded-full animate-ping opacity-50" style="background-color:${color};"></div>` : ""}
          <div class="rounded-full border-2 border-white shadow-md opacity-70" style="width:100%; height:100%; background-color:${fillColor};"></div>
        </div>
      `;

      const icon = window.L.divIcon({
        html: htmlIcon,
        className: "",
        iconSize: [radius * 2, radius * 2],
      });

      const marker = window.L.marker(reg.coords, { icon }).addTo(
        layerGroup.current!,
      );
      marker.bindTooltip(
        `
        <div class="font-sans">
          <b class="text-emerald-900 text-xs uppercase">${reg.name}</b><br/>
          <span class="text-[10px] font-bold" style="color:${color}">${valueLabel}</span><br/>
          <span class="text-[9px] text-slate-500">Status Lingkungan: ${reg.status === "danger" ? "Risiko Tinggi" : reg.status === "warning" ? "Waspada" : "Aman"}</span>
        </div>
      `,
        {
          direction: "top",
          className: "bg-white/95 border-none shadow-lg rounded-lg p-1",
        },
      );
    });
  }, [activeLayer]);

  return <div ref={mapRef} className="absolute inset-0 z-0"></div>;
};
// type Emission = {
//   yr: number;
//   base: number;
//   policy: number;
// };

export default function Lingkungan() {
  // Inject Tailwind CDN safely
  // Inject Tailwind CDN safely
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

  type LayerType = "deforest" | "emission" | "konservasi" | "produksi";

  const [activeLayer, setActiveLayer] = useState<LayerType>("deforest");
  const [filterYear, setFilterYear] = useState("2025");
  const [hoveredEmissionIdx, setHoveredEmissionIdx] = useState<number | null>(
    null,
  );

  // Chart Generators untuk Line Chart (MtCO2)
  const maxEmissionY = 600;
  type EmissionKey = "base" | "policy";

  const generateEmissionPoints = (key: EmissionKey) => {
    return EMISSION_PROJECTION.map((d, i) => {
      const x = i * (100 / (EMISSION_PROJECTION.length - 1));
      const y = 100 - (d[key] / maxEmissionY) * 100;
      return { x, y, val: d[key], yr: d.yr };
    });
  };

  const basePoints = generateEmissionPoints("base");
  const policyPoints = generateEmissionPoints("policy");
  const basePath = basePoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const policyPath = policyPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

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
        <div className="min-h-screen bg-slate-50 text-slate-800 p-4 font-sans flex flex-col gap-5">
          {/* ========================================================= */}
          {/* HEADER & GLOBAL STATUS */}
          {/* ========================================================= */}
          <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-700/20">
                <TreePine size={20} className="text-emerald-50" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-emerald-950 tracking-tight">
                  PALMSPHERE
                </h1>
                <p className="text-emerald-600 text-xs font-bold tracking-widest uppercase">
                  Environmental Monitoring & Sustainability
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full xl:w-auto">
              {/* Status Global */}
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-amber-700 uppercase tracking-wider">
                    Status Ekologi Nasional
                  </p>
                  <p className="text-sm font-black text-amber-900 leading-tight">
                    ⚠️ Waspada (Deforestasi Naik)
                  </p>
                </div>
              </div>

              {/* Filter Tahun */}
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="bg-slate-100 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer hover:bg-slate-200"
              >
                <option value="2020">Data Historis 2020</option>
                <option value="2025">Live Status 2025</option>
                <option value="2045">Proyeksi 2045</option>
              </select>
            </div>
          </header>

          {/* ========================================================= */}
          {/* SECTION 1: ENVIRONMENTAL STATUS SUMMARY (KPI) */}
          {/* ========================================================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100 flex justify-between items-center relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                <AlertTriangle size={80} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Deforestation Rate
                </p>
                <p className="text-2xl font-black text-red-600 mt-1">
                  {KPI_DATA.deforestation.val}
                  <span className="text-sm font-bold text-red-400">
                    {KPI_DATA.deforestation.unit}
                  </span>
                </p>
              </div>
              <div className="bg-red-50 p-2 rounded-lg text-red-500">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 flex justify-between items-center relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                <Map size={80} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Land Conversion
                </p>
                <p className="text-2xl font-black text-amber-600 mt-1">
                  {KPI_DATA.conversion.val}{" "}
                  <span className="text-sm font-bold text-amber-400">
                    {KPI_DATA.conversion.unit}
                  </span>
                </p>
              </div>
              <div className="bg-amber-50 p-2 rounded-lg text-amber-500">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 flex justify-between items-center relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                <Factory size={80} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Carbon Emission
                </p>
                <p className="text-2xl font-black text-purple-600 mt-1">
                  {KPI_DATA.emission.val}{" "}
                  <span className="text-sm font-bold text-purple-400">
                    {KPI_DATA.emission.unit}
                  </span>
                </p>
              </div>
              <div className="bg-purple-50 p-2 rounded-lg text-purple-500">
                <Wind size={20} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 flex justify-between items-center relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                <ShieldCheck size={80} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Sustainability Index
                </p>
                <p className="text-2xl font-black text-emerald-600 mt-1">
                  {KPI_DATA.sustainability.val}
                  <span className="text-sm font-bold text-emerald-400">
                    {KPI_DATA.sustainability.unit}
                  </span>
                </p>
              </div>
              <div className="bg-emerald-50 p-2 rounded-lg text-emerald-500">
                <TrendingDown size={20} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
            {/* ========================================================= */}
            {/* LEFT COLUMN: MAP & INDICATORS */}
            {/* ========================================================= */}
            <div className="xl:col-span-2 flex flex-col gap-4">
              {/* SECTION 2: GEOSPATIAL RISK MAP */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1 min-h-[400px]">
                {/* Map Header & Toggles */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 z-10 bg-white">
                  <h2 className="text-sm font-black text-emerald-950 flex items-center gap-2 uppercase tracking-wider">
                    <Radar size={18} className="text-emerald-600" /> Geospatial
                    Risk Map
                  </h2>
                  <div className="flex flex-wrap bg-slate-100 p-1 rounded-lg">
                    {(
                      [
                        {
                          id: "deforest",
                          label: "Deforestasi",
                          icon: AlertTriangle,
                        },
                        { id: "emission", label: "Emisi", icon: Wind },
                        {
                          id: "konservasi",
                          label: "Area Konservasi",
                          icon: ShieldCheck,
                        },
                        {
                          id: "produksi",
                          label: "Zonasi Produksi",
                          icon: Factory,
                        },
                      ] as LayerOption[]
                    ).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setActiveLayer(t.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                          activeLayer === t.id
                            ? "bg-white text-emerald-700 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        <t.icon size={12} /> {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Leaflet Container */}
                <div className="flex-1 relative w-full h-full bg-slate-100 min-h-[350px]">
                  <LeafletEnvMap activeLayer={activeLayer} />

                  {/* Map Legend Floating */}
                  <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur p-3 rounded-xl shadow-lg border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                      <MousePointer2 size={10} /> Klik Area untuk Detail
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>{" "}
                        <span className="text-[10px] font-bold text-slate-700">
                          Tinggi / Kritis
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>{" "}
                        <span className="text-[10px] font-bold text-slate-700">
                          Sedang / Waspada
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>{" "}
                        <span className="text-[10px] font-bold text-slate-700">
                          Aman / Stabil
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: ENVIRONMENTAL INDICATORS (INTERACTIVE) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">
                      Deforestation Index
                    </span>
                    <span className="text-[10px] font-black text-red-600">
                      72/100
                    </span>
                  </div>
                  <InteractiveSparkline
                    data={SPARKLINE_DATA.deforest}
                    color="red"
                    unit="Idx"
                  />
                  <p className="text-[9px] text-red-500 font-bold mt-2 text-right">
                    &uarr; Meningkat
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">
                      Land Use Change
                    </span>
                    <span className="text-[10px] font-black text-amber-600">
                      +120k ha
                    </span>
                  </div>
                  <InteractiveSparkline
                    data={SPARKLINE_DATA.landuse}
                    color="amber"
                    unit="k Ha"
                  />
                  <p className="text-[9px] text-amber-500 font-bold mt-2 text-right">
                    &uarr; Ekspansi
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">
                      Carbon Emission
                    </span>
                    <span className="text-[10px] font-black text-purple-600">
                      320 Mt
                    </span>
                  </div>
                  <InteractiveSparkline
                    data={SPARKLINE_DATA.carbon}
                    color="amber"
                    unit="Mt"
                  />
                  <p className="text-[9px] text-purple-500 font-bold mt-2 text-right">
                    &uarr; Naik
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">
                      Biodiversity Risk
                    </span>
                    <span className="text-[10px] font-black text-red-600">
                      TINGGI
                    </span>
                  </div>
                  <InteractiveSparkline
                    data={SPARKLINE_DATA.biodiversity}
                    color="red"
                    unit="Risiko"
                  />
                  <p className="text-[9px] text-red-500 font-bold mt-2 text-right">
                    Habitat Terancam
                  </p>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* RIGHT COLUMN: REAL DATA CHARTS, COMPLIANCE, & ALERTS */}
            {/* ========================================================= */}
            <div className="flex flex-col gap-4">
              {/* SECTION 4: REAL DEFORESTATION ANALYSIS (INTERACTIVE BAR CHART) */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xs font-black text-emerald-950 uppercase tracking-widest flex items-center gap-2">
                    <Layers size={14} className="text-amber-500" /> Land Use &
                    Deforestasi
                  </h2>
                  <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                    <MousePointer2 size={10} /> Arahkan kursor
                  </span>
                </div>

                <div className="flex h-48 w-full items-end gap-3 relative mt-4">
                  {/* Y Axis Guide (Samping Kiri) */}
                  <div className="absolute -left-2 top-0 bottom-6 flex flex-col justify-between text-[9px] font-bold text-slate-400 py-1 opacity-70">
                    <span>150k</span>
                    <span>100k</span>
                    <span>50k</span>
                    <span>0</span>
                  </div>

                  {/* Grid Horizontal */}
                  <div className="absolute inset-0 left-6 right-2 bottom-6 flex flex-col justify-between pointer-events-none z-0">
                    <div className="border-t border-slate-100 border-dashed w-full"></div>
                    <div className="border-t border-slate-100 border-dashed w-full"></div>
                    <div className="border-t border-slate-100 border-dashed w-full"></div>
                    <div className="border-t border-slate-300 w-full"></div>
                  </div>

                  {/* Data Bars */}
                  <div className="flex w-full h-full pb-6 pl-8 z-10">
                    {DEFORESTATION_HISTORY.map((d) => {
                      const maxVal = 150;
                      const hTotal = (d.total / maxVal) * 100;
                      const pPap = (d.pap / d.total) * 100;
                      const pSum = (d.sum / d.total) * 100;
                      const pKal = (d.kal / d.total) * 100;

                      return (
                        <div
                          key={d.yr}
                          className="flex-1 flex flex-col justify-end items-center group relative px-1 h-full cursor-pointer"
                        >
                          {/* Interactive Tooltip (Pop out nicely) */}
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-slate-800 text-white text-[10px] p-2.5 rounded-lg shadow-xl z-50 min-w-[110px] pointer-events-none transition-all transform scale-95 group-hover:scale-100">
                            <div className="font-black border-b border-slate-600 pb-1 mb-1 text-center">
                              Tahun {d.yr}
                            </div>
                            <div className="flex justify-between">
                              <span className="text-red-400">Kalimantan:</span>{" "}
                              <b>{d.kal}k ha</b>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-amber-400">Sumatera:</span>{" "}
                              <b>{d.sum}k ha</b>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-red-300">Papua:</span>{" "}
                              <b>{d.pap}k ha</b>
                            </div>
                            <div className="flex justify-between mt-1 pt-1 border-t border-slate-600">
                              <span className="text-emerald-400">Total:</span>{" "}
                              <b>{d.total}k ha</b>
                            </div>
                            {/* Tooltip Arrow */}
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                          </div>

                          {/* Label Total Di Atas Bar */}
                          <span className="text-[10px] font-black text-slate-700 mb-1 group-hover:text-emerald-600 transition-colors">
                            {d.total}k
                          </span>

                          {/* The Stacked Bar */}
                          <div
                            className="w-full flex flex-col shadow-sm rounded-t-md overflow-hidden group-hover:ring-2 ring-emerald-400 transition-all"
                            style={{ height: `${hTotal}%` }}
                          >
                            <div
                              className="w-full bg-red-400 group-hover:brightness-110"
                              style={{ height: `${pPap}%` }}
                            ></div>
                            <div
                              className="w-full bg-amber-400 group-hover:brightness-110"
                              style={{ height: `${pSum}%` }}
                            ></div>
                            <div
                              className="w-full bg-red-600 group-hover:brightness-110"
                              style={{ height: `${pKal}%` }}
                            ></div>
                          </div>

                          {/* Label X-Axis */}
                          <span className="text-[10px] font-bold text-slate-500 mt-2 absolute -bottom-6 group-hover:text-slate-800">
                            {d.yr}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend Sektor Deforestasi */}
                <div className="flex gap-4 text-[10px] font-bold justify-center mt-3 pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <div className="w-2.5 h-2.5 bg-red-600 rounded-[2px]"></div>{" "}
                    Kalimantan
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <div className="w-2.5 h-2.5 bg-amber-400 rounded-[2px]"></div>{" "}
                    Sumatera
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <div className="w-2.5 h-2.5 bg-red-400 rounded-[2px]"></div>{" "}
                    Papua
                  </span>
                </div>
              </div>

              {/* SECTION 5: REAL EMISSION IMPACT (INTERACTIVE LINE CHART) */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xs font-black text-emerald-950 uppercase tracking-widest flex items-center gap-2">
                    <ThermometerSun size={14} className="text-purple-500" />{" "}
                    Proyeksi Emisi Karbon
                  </h2>
                  <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                    <MousePointer2 size={10} /> Sentuh Data
                  </span>
                </div>

                {/* Wrapper Chart */}
                <div className="h-48 w-full relative mt-4 mb-2">
                  {/* Y Axis & Grid */}
                  <div className="absolute inset-0 flex flex-col justify-between text-[9px] font-bold text-slate-400 pb-6">
                    <div className="flex items-center w-full">
                      <span className="w-8 mr-2">600</span>{" "}
                      <div className="border-t border-slate-200 border-dashed flex-1"></div>
                    </div>
                    <div className="flex items-center w-full">
                      <span className="w-8 mr-2">400</span>{" "}
                      <div className="border-t border-slate-200 border-dashed flex-1"></div>
                    </div>
                    <div className="flex items-center w-full">
                      <span className="w-8 mr-2">200</span>{" "}
                      <div className="border-t border-slate-200 border-dashed flex-1"></div>
                    </div>
                    <div className="flex items-center w-full">
                      <span className="w-8 mr-2">0</span>{" "}
                      <div className="border-t border-slate-300 flex-1"></div>
                    </div>
                  </div>

                  {/* Data SVG Line */}
                  <div className="absolute inset-0 left-10 bottom-6 right-2 top-2 overflow-visible">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full overflow-visible preserve-aspect-ratio-none"
                    >
                      <path
                        d={basePath}
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                        className="opacity-60"
                      />
                      <path
                        d={policyPath}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2.5"
                        className="drop-shadow-sm"
                      />

                      {/* Interactive Nodes */}
                      {EMISSION_PROJECTION.map((d, i) => {
                        const pBase = basePoints[i];
                        const pPol = policyPoints[i];
                        const isHovered = hoveredEmissionIdx === i;

                        return (
                          <g
                            key={d.yr}
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredEmissionIdx(i)}
                            onMouseLeave={() => setHoveredEmissionIdx(null)}
                          >
                            {/* Hover Catchment Area (Invisible) */}
                            <rect
                              x={pPol.x - 10}
                              y="0"
                              width="20"
                              height="100"
                              fill="transparent"
                            />

                            {/* Vertical Indicator Line on Hover */}
                            {isHovered && (
                              <line
                                x1={pPol.x}
                                y1="0"
                                x2={pPol.x}
                                y2="100"
                                stroke="#CBD5E1"
                                strokeWidth="0.5"
                                strokeDasharray="1 1"
                              />
                            )}

                            {/* Point Base */}
                            <circle
                              cx={pBase.x}
                              cy={pBase.y}
                              r={isHovered ? "2.5" : "1.5"}
                              fill="#EF4444"
                              className="transition-all"
                            />
                            {/* Point Policy */}
                            <circle
                              cx={pPol.x}
                              cy={pPol.y}
                              r={isHovered ? "3" : "2"}
                              fill="#10B981"
                              stroke="white"
                              strokeWidth="0.5"
                              className="transition-all"
                            />

                            {/* X-Axis Labels */}
                            <text
                              x={pPol.x}
                              y="112"
                              fontSize="6"
                              fill={isHovered ? "#0F172A" : "#64748B"}
                              fontWeight={isHovered ? "bold" : "normal"}
                              textAnchor="middle"
                              className="transition-all"
                            >
                              {d.yr}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {/* HTML Tooltip Overlay (Absolute Positioned based on state) */}
                    {hoveredEmissionIdx !== null && (
                      <div
                        className="absolute bg-slate-800 text-white text-[10px] p-2.5 rounded-lg shadow-xl z-50 min-w-[120px] pointer-events-none transition-transform transform -translate-x-1/2 -translate-y-full mt-[-10px]"
                        style={{
                          left: `${policyPoints[hoveredEmissionIdx].x}%`,
                          top: `${Math.min(basePoints[hoveredEmissionIdx].y, policyPoints[hoveredEmissionIdx].y)}%`,
                        }}
                      >
                        <div className="font-black border-b border-slate-600 pb-1 mb-1 text-center">
                          Tahun {EMISSION_PROJECTION[hoveredEmissionIdx].yr}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-red-400">Baseline:</span>{" "}
                          <b>
                            {EMISSION_PROJECTION[hoveredEmissionIdx].base} MtCO₂
                          </b>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-emerald-400">Policy:</span>{" "}
                          <b>
                            {EMISSION_PROJECTION[hoveredEmissionIdx].policy}{" "}
                            MtCO₂
                          </b>
                        </div>
                        {/* Tooltip Arrow */}
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold mt-4 border-t border-slate-100 pt-3">
                  <span className="flex items-center gap-1.5 text-red-600">
                    <div className="w-4 h-0.5 bg-red-500 border-dashed"></div>{" "}
                    Baseline (Tanpa Intervensi)
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <div className="w-4 h-1.5 bg-emerald-500"></div> Replanting
                    Policy
                  </span>
                </div>
              </div>

              {/* SECTION 6: SUSTAINABILITY COMPLIANCE */}
              <div className="bg-emerald-900 p-5 rounded-2xl shadow-sm border border-emerald-800 text-white">
                <h2 className="text-xs font-black text-emerald-300 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <ShieldCheck size={14} /> Sustainability Compliance
                </h2>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span>ISPO Compliance</span>
                      <span className="text-emerald-400">78%</span>
                    </div>
                    <div className="w-full bg-emerald-950 rounded-full h-2">
                      <div
                        className="bg-emerald-400 h-2 rounded-full"
                        style={{ width: "78%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span>RSPO Compliance</span>
                      <span className="text-amber-400">62%</span>
                    </div>
                    <div className="w-full bg-emerald-950 rounded-full h-2">
                      <div
                        className="bg-amber-400 h-2 rounded-full"
                        style={{ width: "62%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span>Traceability (Lacak Balak)</span>
                      <span className="text-red-400">55%</span>
                    </div>
                    <div className="w-full bg-emerald-950 rounded-full h-2">
                      <div
                        className="bg-red-400 h-2 rounded-full"
                        style={{ width: "55%" }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-start gap-2">
                  <AlertTriangle
                    size={16}
                    className="text-amber-400 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-[10px] text-amber-200 leading-tight">
                    <b>Global Warning:</b> 45% produksi belum terverifikasi
                    asal-usulnya. Berisiko terkena sanksi blokir regulasi
                    deforestasi Eropa (EUDR).
                  </p>
                </div>
              </div>

              {/* SECTION 7: POLICY ALERT & RECOMMENDATION */}
              <div className="bg-white p-5 rounded-2xl shadow-lg border border-red-100 flex-1 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>

                <div>
                  <h2 className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-2 mb-3">
                    <ShieldAlert size={14} className="animate-pulse" /> Command
                    Center Alert
                  </h2>

                  <div className="bg-red-50 p-3 rounded-xl border border-red-100 mb-4">
                    <p className="text-[10px] font-black text-red-800 mb-1">
                      🚨 INSIDEN TERDETEKSI
                    </p>
                    <ul className="text-[10px] text-red-700 space-y-1 list-disc pl-3">
                      <li>
                        Deforestasi tajam di region <b>Kalimantan Barat</b>{" "}
                        (+3.2%)
                      </li>
                      <li>
                        Risiko lonjakan emisi akibat ekspansi lahan gambut.
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      AI Recommendation:
                    </p>
                    <div className="flex items-start gap-2">
                      <CheckCircle2
                        size={12}
                        className="text-emerald-500 flex-shrink-0 mt-0.5"
                      />
                      <p className="text-[10px] text-slate-600 font-bold">
                        Percepat program replanting pada perkebunan tua untuk
                        cegah ekspansi.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2
                        size={12}
                        className="text-emerald-500 flex-shrink-0 mt-0.5"
                      />
                      <p className="text-[10px] text-slate-600 font-bold">
                        Bekukan izin baru di area rawan deforestasi Kalimantan.
                      </p>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black rounded-xl transition-all flex justify-center items-center gap-2 uppercase tracking-widest shadow-md group">
                  Simulasikan Kebijakan{" "}
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
