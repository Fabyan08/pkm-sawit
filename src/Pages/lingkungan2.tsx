import React, { useState, useEffect, useRef } from "react";
import {
  Leaf,
  AlertTriangle,
  Wind,
  Droplets,
  Map,
  MapPin,
  Activity,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  ArrowRight,
  Layers,
  Radar,
  TreePine,
  Factory,
  ShieldCheck,
  ThermometerSun,
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

const REGIONS = [
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

const SPARKLINE_DATA = {
  deforest: [60, 65, 68, 70, 72],
  landuse: [90, 100, 110, 115, 120],
  carbon: [280, 295, 305, 315, 320],
  biodiversity: [40, 45, 55, 65, 80],
};

// Data Dummy Lengkap Untuk Chart Deforestasi (Ribu Hektar)
const DEFORESTATION_HISTORY = [
  { yr: 2020, kal: 45, sum: 30, pap: 10, total: 85 },
  { yr: 2021, kal: 50, sum: 30, pap: 12, total: 92 },
  { yr: 2022, kal: 58, sum: 29, pap: 15, total: 102 },
  { yr: 2023, kal: 65, sum: 28, pap: 18, total: 111 },
  { yr: 2024, kal: 72, sum: 28, pap: 22, total: 122 },
  { yr: 2025, kal: 80, sum: 27, pap: 28, total: 135 },
];

// Data Dummy Lengkap Untuk Chart Emisi (MtCO2)
const EMISSION_PROJECTION = [
  { yr: 2025, base: 320, policy: 320 },
  { yr: 2030, base: 360, policy: 290 },
  { yr: 2035, base: 410, policy: 240 },
  { yr: 2040, base: 470, policy: 180 },
  { yr: 2045, base: 530, policy: 120 },
];

// --- HELPER COMPONENTS ---
const Sparkline = ({ data, color }) => {
  const max = Math.max(...data) * 1.1;
  const min = Math.min(...data) * 0.9;
  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 30 - ((val - min) / (max - min)) * 30;
      return `${x},${y}`;
    })
    .join(" ");

  const strokeColor =
    color === "red" ? "#EF4444" : color === "emerald" ? "#10B981" : "#F59E0B";
  const bgColor =
    color === "red" ? "#FEF2F2" : color === "emerald" ? "#ECFDF5" : "#FFFBEB";

  return (
    <div
      className="w-full h-8 relative mt-1 rounded overflow-hidden"
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

// --- LEAFLET MAP COMPONENT ---
const LeafletEnvMap = ({ activeLayer }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layerGroup = useRef(null);

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
        layerGroup.current,
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

// --- MAIN DASHBOARD ---
export default function PalmsphereEnvironmentEngine() {
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

  const [activeLayer, setActiveLayer] = useState("deforest");
  const [filterYear, setFilterYear] = useState("2025");

  // Chart Generators untuk Line Chart (MtCO2)
  const maxEmissionY = 600;
  const generateEmissionPath = (key) => {
    return EMISSION_PROJECTION.map((d, i) => {
      const x = i * (500 / (EMISSION_PROJECTION.length - 1));
      const y = 200 - (d[key] / maxEmissionY) * 200;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  };

  return (
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
            <option value="2030">Proyeksi 2030</option>
          </select>
        </div>
      </header>

      {/* ========================================================= */}
      {/* SECTION 1: ENVIRONMENTAL STATUS SUMMARY (KPI) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100 flex justify-between items-center relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5">
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

        <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 flex justify-between items-center relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5">
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

        <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 flex justify-between items-center relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5">
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

        <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 flex justify-between items-center relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5">
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
                <Radar size={18} className="text-emerald-600" /> Geospatial Risk
                Map
              </h2>
              <div className="flex flex-wrap bg-slate-100 p-1 rounded-lg">
                {[
                  { id: "deforest", label: "Deforestasi", icon: AlertTriangle },
                  { id: "emission", label: "Emisi", icon: Wind },
                  {
                    id: "konservasi",
                    label: "Area Konservasi",
                    icon: ShieldCheck,
                  },
                  { id: "produksi", label: "Zonasi Produksi", icon: Factory },
                ].map((t) => (
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
                <p className="text-[9px] font-bold text-slate-500 uppercase mb-2">
                  Tingkat Risiko
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

          {/* SECTION 3: ENVIRONMENTAL INDICATORS */}
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
              <Sparkline data={SPARKLINE_DATA.deforest} color="red" />
              <p className="text-[9px] text-red-500 font-bold mt-1 text-right">
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
              <Sparkline data={SPARKLINE_DATA.landuse} color="amber" />
              <p className="text-[9px] text-amber-500 font-bold mt-1 text-right">
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
              <Sparkline data={SPARKLINE_DATA.carbon} color="amber" />
              <p className="text-[9px] text-purple-500 font-bold mt-1 text-right">
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
              <Sparkline data={SPARKLINE_DATA.biodiversity} color="red" />
              <p className="text-[9px] text-red-500 font-bold mt-1 text-right">
                Habitat Terancam
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: REAL DATA CHARTS, COMPLIANCE, & ALERTS */}
        {/* ========================================================= */}
        <div className="flex flex-col gap-4">
          {/* SECTION 4: REAL DEFORESTATION ANALYSIS (FIXED BAR CHART) */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <h2 className="text-xs font-black text-emerald-950 uppercase tracking-widest flex items-center gap-2 mb-2">
              <Layers size={14} className="text-amber-500" /> Analisis Land Use
              & Deforestasi
            </h2>

            {/* The Bar Chart Container - Height diatur jelas (h-48) */}
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
                  const maxVal = 150; // Skala maksimal tinggi chart
                  const hTotal = (d.total / maxVal) * 100; // Total tinggi colom dalam %
                  const pPap = (d.pap / d.total) * 100; // Tinggi porsi dalam %
                  const pSum = (d.sum / d.total) * 100;
                  const pKal = (d.kal / d.total) * 100;

                  return (
                    <div
                      key={d.yr}
                      className="flex-1 flex flex-col justify-end items-center group relative px-1 h-full"
                    >
                      {/* Tooltip Hover */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-12 bg-slate-800 text-white text-[9px] p-2 rounded shadow-lg z-20 whitespace-nowrap pointer-events-none transition-opacity">
                        <b>Tahun {d.yr}</b>
                        <br />
                        Kal: {d.kal}k | Sum: {d.sum}k | Pap: {d.pap}k
                      </div>

                      {/* Label Total Di Atas Bar */}
                      <span className="text-[10px] font-black text-slate-700 mb-1">
                        {d.total}k
                      </span>

                      {/* The Stacked Bar */}
                      <div
                        className="w-full flex flex-col shadow-sm rounded-t-md overflow-hidden cursor-pointer"
                        style={{ height: `${hTotal}%` }}
                      >
                        {/* Note: Karena flex-col, urutan elemen dari atas ke bawah */}
                        <div
                          className="w-full bg-red-400 transition-all group-hover:opacity-80"
                          style={{ height: `${pPap}%` }}
                        ></div>
                        <div
                          className="w-full bg-amber-400 transition-all group-hover:opacity-80"
                          style={{ height: `${pSum}%` }}
                        ></div>
                        <div
                          className="w-full bg-red-600 transition-all group-hover:opacity-80"
                          style={{ height: `${pKal}%` }}
                        ></div>
                      </div>

                      {/* Label X-Axis */}
                      <span className="text-[10px] font-bold text-slate-500 mt-2 absolute -bottom-6">
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

          {/* SECTION 5: REAL EMISSION IMPACT (FIXED LINE CHART) */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xs font-black text-emerald-950 uppercase tracking-widest flex items-center gap-2 mb-4">
              <ThermometerSun size={14} className="text-purple-500" /> Proyeksi
              Emisi Karbon (MtCO₂)
            </h2>

            {/* Wrapper Chart - Diperbesar dengan tinggi eksplisit h-48 */}
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

              {/* Data SVG Line (Menggunakan viewBox besar agar tidak tergencet padding) */}
              <div className="absolute inset-0 left-10 bottom-6 right-2 top-2">
                <svg
                  viewBox="0 0 500 230"
                  className="w-full h-full overflow-visible preserve-aspect-ratio-none"
                >
                  {/* Baseline: Emisi Naik */}
                  <path
                    d={generateEmissionPath("base")}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="3"
                    strokeDasharray="6 6"
                    className="opacity-60"
                  />

                  {/* Policy (Replanting): Emisi Turun */}
                  <path
                    d={generateEmissionPath("policy")}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="4"
                    className="drop-shadow-sm"
                  />

                  {/* Nodes & Data Labels */}
                  {EMISSION_PROJECTION.map((d, i) => {
                    const x = i * (500 / (EMISSION_PROJECTION.length - 1));
                    const yBase = 200 - (d.base / maxEmissionY) * 200;
                    const yPol = 200 - (d.policy / maxEmissionY) * 200;

                    return (
                      <g key={d.yr}>
                        {/* Titik Base & Label */}
                        <circle cx={x} cy={yBase} r="4" fill="#EF4444" />
                        {i === EMISSION_PROJECTION.length - 1 && (
                          <text
                            x={x}
                            y={yBase - 8}
                            fontSize="14"
                            fill="#EF4444"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {d.base}
                          </text>
                        )}

                        {/* Titik Policy & Label */}
                        <circle
                          cx={x}
                          cy={yPol}
                          r="5"
                          fill="#10B981"
                          stroke="white"
                          strokeWidth="1.5"
                        />
                        <text
                          x={x}
                          y={yPol + (d.policy > d.base ? 18 : -10)}
                          fontSize="14"
                          fill="#059669"
                          fontWeight="900"
                          textAnchor={
                            i === 0
                              ? "start"
                              : i === EMISSION_PROJECTION.length - 1
                                ? "end"
                                : "middle"
                          }
                        >
                          {d.policy}
                        </text>

                        {/* X-Axis Labels Terintegrasi di dalam SVG untuk Posisi Akurat */}
                        <text
                          x={x}
                          y="225"
                          fontSize="12"
                          fill="#64748B"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {d.yr}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold mt-4 border-t border-slate-100 pt-3">
              <span className="flex items-center gap-1.5 text-red-600">
                <div className="w-4 h-1 bg-red-500 border-dashed"></div>{" "}
                Baseline (Naik)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <div className="w-4 h-1.5 bg-emerald-500"></div> Replanting
                Policy (Turun)
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
                    Deforestasi tajam di region <b>Kalimantan Barat</b> (+3.2%)
                  </li>
                  <li>Risiko lonjakan emisi akibat ekspansi lahan gambut.</li>
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
                    Percepat program replanting pada perkebunan tua untuk cegah
                    ekspansi.
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

            <button className="w-full mt-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black rounded-xl transition-all flex justify-center items-center gap-2 uppercase tracking-widest shadow-md">
              Simulasikan Kebijakan Lingkungan <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
