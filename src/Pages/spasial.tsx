import React, { useState, useEffect, useRef, useMemo } from "react";
import type * as L from "leaflet";
import {
  Map as MapIcon,
  GitMerge,
  ShieldAlert,
  Leaf,
  Anchor,
  Factory,
  Clock,
  Filter,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
declare global {
  interface Window {
    L: typeof import("leaflet");
  }
}
// --- KONFIGURASI WARNA ---
const COLORS = {
  primary: "#1F7A63", // Palm Green
  energy: "#F59E0B", // Energy Orange
  food: "#FBBF24", // Food Yellow
  logistics: "#2563EB", // Logistics Blue
  risk: "#EF4444", // Risk Red
  bg: "#F8FAFC",
  text: "#0F172A",
  slate: "#64748B",
};

// --- DATA MOCKUP GEOSPATIAL & REGIONAL ---
const geoNodesData = [
  {
    id: "Riau",
    name: "Riau",
    lat: 0.5,
    lng: 101.5,
    prod: 8.5,
    area: 2.2,
    yield: 3.9,
    riskIndex: 45,
    riskTrend: "+1.2%",
    private: 1.2,
    smallholder: 0.8,
    state: 0.2,
    facility: "Dumai Export Port",
    cap: "8M Tons/Yr",
    type: "intensive",
    replanting: 50000,
    recommendation:
      "Tingkatkan produktivitas petani swadaya dan optimalkan kapasitas pelabuhan Dumai. Risiko deforestasi terkendali.",
  },
  {
    id: "Sumut",
    name: "Sumatera Utara",
    lat: 2.5,
    lng: 99.0,
    prod: 5.3,
    area: 1.8,
    yield: 3.6,
    riskIndex: 38,
    riskTrend: "-0.5%",
    private: 1.0,
    smallholder: 0.6,
    state: 0.2,
    facility: "Belawan Port",
    cap: "5M Tons/Yr",
    type: "intensive",
    replanting: 30000,
    recommendation:
      "Fokus pada program replanting perkebunan tua milik negara dan swasta.",
  },
  {
    id: "Kalbar",
    name: "Kalimantan Barat",
    lat: -0.5,
    lng: 111.0,
    prod: 4.8,
    area: 1.5,
    yield: 3.4,
    riskIndex: 65,
    riskTrend: "+2.1%",
    private: 0.9,
    smallholder: 0.5,
    state: 0.1,
    facility: "Kijing Port (New)",
    cap: "3M Tons/Yr",
    type: "risk",
    replanting: 20000,
    recommendation:
      "Perketat izin ekspansi lahan baru. Tingkatkan pengawasan titik api (hotspot) di area konsesi.",
  },
  {
    id: "Kalteng",
    name: "Kalimantan Tengah",
    lat: -1.8,
    lng: 113.5,
    prod: 6.3,
    area: 1.7,
    yield: 3.8,
    riskIndex: 58,
    riskTrend: "+1.5%",
    private: 1.1,
    smallholder: 0.5,
    state: 0.1,
    facility: "Sampit Mill Cluster",
    cap: "4.5M Tons/Yr",
    type: "intensive",
    replanting: 45000,
    recommendation:
      "Tingkatkan konektivitas infrastruktur logistik dari pabrik CPO ke pelabuhan utama.",
  },
  {
    id: "Kaltim",
    name: "Kalimantan Timur",
    lat: 1.0,
    lng: 116.5,
    prod: 5.2,
    area: 1.4,
    yield: 3.7,
    riskIndex: 42,
    riskTrend: "-1.1%",
    private: 0.8,
    smallholder: 0.4,
    state: 0.2,
    facility: "Balikpapan Hub",
    cap: "4M Tons/Yr",
    type: "replanting",
    replanting: 80000,
    recommendation:
      "Percepat distribusi bibit unggul untuk program replanting massal petani rakyat.",
  },
  {
    id: "Jambi",
    name: "Jambi",
    lat: -1.5,
    lng: 103.5,
    prod: 3.2,
    area: 1.1,
    yield: 3.5,
    riskIndex: 50,
    riskTrend: "+0.8%",
    private: 0.6,
    smallholder: 0.4,
    state: 0.1,
    facility: "Talang Duku Port",
    cap: "2M Tons/Yr",
    type: "replanting",
    replanting: 35000,
    recommendation:
      "Integrasikan sistem rantai pasok untuk mengurangi biaya logistik angkutan darat.",
  },
  {
    id: "Sulbar",
    name: "Sulawesi Barat",
    lat: -2.5,
    lng: 119.0,
    prod: 1.2,
    area: 0.4,
    yield: 3.0,
    riskIndex: 25,
    riskTrend: "-0.2%",
    private: 0.2,
    smallholder: 0.2,
    state: 0.0,
    facility: "Pasangkayu Mill",
    cap: "0.8M Tons/Yr",
    type: "replanting",
    replanting: 15000,
    recommendation:
      "Intensifikasi lahan yang ada, fokus pada sertifikasi ISPO untuk akses pasar.",
  },
  {
    id: "Papua",
    name: "Papua",
    lat: -4.0,
    lng: 138.0,
    prod: 1.5,
    area: 0.6,
    yield: 2.5,
    riskIndex: 72,
    riskTrend: "+3.4%",
    private: 0.5,
    smallholder: 0.1,
    state: 0.0,
    facility: "Merauke Mill (Planned)",
    cap: "1M Tons/Yr",
    type: "risk",
    replanting: 0,
    recommendation:
      "HENTIKAN ekspansi. Moratorium pembukaan lahan hutan primer. Risiko deforestasi sangat kritis.",
  },
];

type GeoNode = (typeof geoNodesData)[0];

type HoveredZone =
  | (GeoNode & {
      x: number;
      y: number;
    })
  | null;

type LayerType = "production" | "risk" | "replanting" | "infra";
type RealLeafletMapProps = {
  activeLayers: {
    production: boolean;
    risk: boolean;
    replanting: boolean;
    infra: boolean;
  };
  geoData: GeoNode[];
  setHoveredZone: React.Dispatch<React.SetStateAction<HoveredZone>>;
  selectedRegion: GeoNode;
  onSelectRegion: (node: GeoNode) => void;
};
export default function Spasial() {
  // Layer Toggles (Bisa aktif bersamaan)
  const [layers, setLayers] = useState({
    production: true,
    risk: false,
    replanting: false,
    infra: true,
  });
  const toggleLayer = (layerName: LayerType) => {
    setLayers((prev) => ({ ...prev, [layerName]: !prev[layerName] }));
  };
  // --- STATE MANAGEMENT ---
  const [selectedRegion, setSelectedRegion] = useState<GeoNode>(
    geoNodesData[0],
  );
  const [selectedYear, setSelectedYear] = useState("2026");
  const [hoveredZone, setHoveredZone] = useState<HoveredZone>(null);

  // --- DATA DERIVED UNTUK CHART ---
  const productionTrend = useMemo(() => {
    const base = selectedRegion.prod;
    return [
      { year: "2020", val: base * 0.85 },
      { year: "2021", val: base * 0.88 },
      { year: "2022", val: base * 0.92 },
      { year: "2023", val: base * 0.98 },
      { year: "2024", val: base },
    ];
  }, [selectedRegion]);

  const areaBreakdown = useMemo(
    () => [
      { name: "Swasta (PBS)", value: selectedRegion.private, color: "#1F7A63" },
      {
        name: "Rakyat (PR)",
        value: selectedRegion.smallholder,
        color: "#FBBF24",
      },
      { name: "Negara (PBN)", value: selectedRegion.state, color: "#2563EB" },
    ],
    [selectedRegion],
  );

  const productivityCompare = [
    { name: "Riau", yield: 3.9 },
    { name: "Kalteng", yield: 3.8 },
    { name: "Kaltim", yield: 3.7 },
    { name: "Sumut", yield: 3.6 },
    { name: "Kalbar", yield: 3.4 },
    { name: "Sulbar", yield: 3.0 },
  ];

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-slate-50">
      {/* SIDEBAR */}

      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header />

        {/* SECTION 1: SPATIAL FILTER PANEL (Row 1) */}
        <div className="bg-white px-8 py-3 border-b border-slate-200 shadow-sm flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                onChange={(e) =>
                  setSelectedRegion(
                    geoNodesData.find((n) => n.name === e.target.value) ||
                      geoNodesData[0],
                  )
                }
                value={selectedRegion.name}
              >
                <option value="Nasional">Nasional (All)</option>
                {geoNodesData.map((node) => (
                  <option key={node.id} value={node.name}>
                    {node.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <Clock className="w-4 h-4 text-slate-500" />
              <select
                className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="2023">2023</option>
                <option value="2024">2024 (Current)</option>
                <option value="2025">2025 (Projection)</option>
                <option value="2026">2026 (Projection)</option>
                <option value="2027">2027 (Projection)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-slate-400 mr-2" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-2">
              Map Layers:
            </span>
            <LayerToggle
              active={layers.production}
              onClick={() => toggleLayer("production")}
              label="Produksi"
              color="bg-emerald-500"
            />
            <LayerToggle
              active={layers.risk}
              onClick={() => toggleLayer("risk")}
              label="Risiko Deforestasi"
              color="bg-red-500"
            />
            <LayerToggle
              active={layers.replanting}
              onClick={() => toggleLayer("replanting")}
              label="Replanting"
              color="bg-yellow-500"
            />
            <LayerToggle
              active={layers.infra}
              onClick={() => toggleLayer("infra")}
              label="Infrastruktur"
              color="bg-blue-600"
            />
          </div>
        </div>

        {/* SCROLLABLE DASHBOARD CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 2: LARGE GEOSPATIAL MAP (Row 2) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 relative">
            <div className="w-full h-[450px] bg-slate-100 rounded-xl overflow-hidden relative shadow-inner">
              <RealLeafletMap
                activeLayers={layers}
                geoData={geoNodesData}
                setHoveredZone={setHoveredZone}
                selectedRegion={selectedRegion}
                onSelectRegion={setSelectedRegion}
              />

              {/* FLOATING TOOLTIP UNTUK MAP */}
              {hoveredZone && (
                <div
                  className="absolute bg-white/95 backdrop-blur shadow-2xl rounded-xl border border-slate-200 w-72 z-[100] pointer-events-none transition-opacity duration-200 overflow-hidden"
                  style={{
                    left: `${hoveredZone.x + 20}px`,
                    top: `${hoveredZone.y}px`,
                    transform: "translateY(-50%)",
                  }}
                >
                  <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-between">
                    <span className="font-bold">{hoveredZone.name}</span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">
                      Zona Data
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    {layers.production && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">
                            Produksi Sawit:
                          </span>{" "}
                          <strong className="text-emerald-700">
                            {hoveredZone.prod} Juta Ton
                          </strong>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Luas Lahan:</span>{" "}
                          <strong className="text-slate-800">
                            {hoveredZone.area} Juta Ha
                          </strong>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">
                            Yield (Produktivitas):
                          </span>{" "}
                          <strong className="text-slate-800">
                            {hoveredZone.yield} Ton/Ha
                          </strong>
                        </div>
                      </div>
                    )}

                    {layers.risk && (
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        <div className="flex justify-between text-xs items-center">
                          <span className="text-slate-500">
                            Indeks Risiko Deforestasi:
                          </span>
                          <strong
                            className={
                              hoveredZone.riskIndex > 60
                                ? "text-red-600"
                                : "text-amber-500"
                            }
                          >
                            {hoveredZone.riskIndex}/100
                          </strong>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">
                            Tren Susut Hutan:
                          </span>
                          <strong
                            className={
                              hoveredZone.riskTrend.includes("+")
                                ? "text-red-600"
                                : "text-emerald-600"
                            }
                          >
                            {hoveredZone.riskTrend}
                          </strong>
                        </div>
                      </div>
                    )}

                    {layers.replanting && (
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">
                            Target Replanting:
                          </span>{" "}
                          <strong className="text-amber-600">
                            {hoveredZone.replanting.toLocaleString()} Ha
                          </strong>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Prioritas:</span>{" "}
                          <strong className="text-slate-800">
                            {hoveredZone.replanting > 40000
                              ? "Tinggi"
                              : "Sedang"}
                          </strong>
                        </div>
                      </div>
                    )}

                    {layers.infra && (
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">
                            Fasilitas Utama:
                          </span>{" "}
                          <strong className="text-blue-700">
                            {hoveredZone.facility}
                          </strong>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Kapasitas:</span>{" "}
                          <strong className="text-slate-800">
                            {hoveredZone.cap}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: REGIONAL PRODUCTION ANALYTICS (Row 3) */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
              <h3 className="text-lg font-bold text-slate-800 flex items-center mb-4">
                <MapIcon className="w-5 h-5 mr-2 text-emerald-600" />
                Analitik Regional:{" "}
                <span className="text-emerald-600 ml-2">
                  {selectedRegion.name}
                </span>
              </h3>
            </div>

            {/* Kapasitas Produksi */}
            <div className="col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Kapasitas Produksi
                </p>
                <div className="flex items-end space-x-2">
                  <h4 className="text-4xl font-mono font-bold text-slate-800">
                    {selectedRegion.prod}
                  </h4>
                  <span className="text-sm font-bold text-slate-400 mb-1">
                    Juta Ton
                  </span>
                </div>
              </div>
              <div className="h-24 mt-4 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={productionTrend}>
                    <Line
                      type="monotone"
                      dataKey="val"
                      stroke={COLORS.primary}
                      strokeWidth={3}
                      dot={{ r: 4, fill: COLORS.primary }}
                    />
                    <RechartsTooltip
                      cursor={false}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        fontSize: "12px",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Area Perkebunan Breakdown */}
            <div className="col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center">
              <div className="w-1/2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Total Luas Lahan
                </p>
                <div className="flex items-end space-x-2 mb-4">
                  <h4 className="text-3xl font-mono font-bold text-slate-800">
                    {selectedRegion.area}
                  </h4>
                  <span className="text-sm font-bold text-slate-400 mb-1">
                    Juta Ha
                  </span>
                </div>
                <div className="space-y-2">
                  {areaBreakdown.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center">
                        <span
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: item.color }}
                        ></span>
                        {item.name}
                      </div>
                      <span className="font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-1/2 h-32 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={areaBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {areaBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Produktivitas */}
            <div className="col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Indikator Produktivitas
                </p>
                <p className="text-sm text-slate-400 mb-4">
                  Rata-rata Yield Area
                </p>
                <div className="flex items-baseline space-x-1">
                  <h4 className="text-4xl font-mono font-bold text-emerald-600">
                    {selectedRegion.yield}
                  </h4>
                  <span className="text-sm font-bold text-slate-500">
                    Ton / Ha
                  </span>
                </div>
                <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Di atas rata-rata
                  nasional
                </p>
              </div>
              <div className="w-28 h-28 relative">
                {/* Custom Radial implementation for visually appealing gauge */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full transform -rotate-90"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="12"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={COLORS.primary}
                    strokeWidth="12"
                    strokeDasharray={`${(selectedRegion.yield / 6) * 251} 251`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Leaf className="w-8 h-8 text-emerald-600 opacity-20" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4 & 5 & 6: DEEP DIVE PANELS (Row 4) */}
          <div className="grid grid-cols-12 gap-6 pb-8">
            {/* Productivity Comparison */}
            <div className="col-span-12 xl:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">
                Perbandingan Produktivitas
              </h3>
              <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={productivityCompare}
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                      stroke="#F1F5F9"
                    />
                    <XAxis type="number" domain={[0, 5]} hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 11,
                        fill: "#64748B",
                        fontWeight: "bold",
                      }}
                      width={60}
                    />
                    <RechartsTooltip
                      cursor={{ fill: "#F8FAFC" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #E2E8F0",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [`${value} Ton/Ha`, "Yield"]}
                    />
                    <Bar dataKey="yield" radius={[0, 4, 4, 0]} barSize={20}>
                      {productivityCompare.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.name === selectedRegion.name
                              ? COLORS.energy
                              : COLORS.primary
                          }
                          opacity={entry.name === selectedRegion.name ? 1 : 0.7}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Environmental Risk & Logistics Network (Stacked horizontally in large screens) */}
            <div className="col-span-12 xl:col-span-8 grid grid-cols-2 gap-6">
              {/* Environmental Risk */}
              <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 rounded-full blur-[80px] opacity-20"></div>
                <div>
                  <h3 className="text-sm font-bold text-slate-300 mb-1 uppercase tracking-wider flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-red-400" />{" "}
                    Monitor Lingkungan
                  </h3>
                  <p className="text-[10px] text-slate-400 mb-6">
                    Indikator risiko kerusakan ekologis wilayah
                  </p>
                </div>

                <div className="space-y-5 z-10">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">
                        Indeks Deforestasi
                      </p>
                      <p className="text-2xl font-mono font-bold mt-1 text-white">
                        {selectedRegion.riskIndex}{" "}
                        <span className="text-xs text-slate-500 font-sans">
                          / 100
                        </span>
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedRegion.riskIndex > 60 ? "bg-red-900/50 border-red-500 text-red-400" : "bg-amber-900/50 border-amber-500 text-amber-400"}`}
                    >
                      {selectedRegion.riskIndex > 60 ? "CRITICAL" : "WARNING"}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">
                        Perubahan Tutupan Lahan
                      </span>
                      <span className="font-bold text-red-400">
                        {selectedRegion.riskTrend}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div
                        className="bg-red-500 h-1.5 rounded-full"
                        style={{ width: `${selectedRegion.riskIndex}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Emisi Karbon Kebun</span>
                      <span className="font-bold text-amber-400">
                        Medium-High
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full"
                        style={{ width: "65%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Policy Recommendation Panel */}
              <div className="bg-emerald-50 rounded-2xl shadow-sm border border-emerald-200 p-6 flex flex-col">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-emerald-700" />
                  </div>
                  <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wider">
                    Rekomendasi Kebijakan Spasial
                  </h3>
                </div>

                <div className="flex-1 bg-white rounded-xl border border-emerald-100 p-4 shadow-sm overflow-y-auto">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Wilayah: {selectedRegion.name}
                  </p>
                  <p className="text-sm text-slate-800 leading-relaxed font-medium">
                    {selectedRegion.recommendation}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-lg border border-slate-100 text-center">
                      <Leaf className="w-4 h-4 text-emerald-600 mb-1" />
                      <span className="text-[10px] font-bold text-slate-600">
                        Fokus
                        <br />
                        Produktivitas
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-lg border border-slate-100 text-center">
                      <Anchor className="w-4 h-4 text-blue-600 mb-1" />
                      <span className="text-[10px] font-bold text-slate-600">
                        Optimalisasi
                        <br />
                        Infrastruktur
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-lg border border-slate-100 text-center">
                      <ShieldAlert className="w-4 h-4 text-red-500 mb-1" />
                      <span className="text-[10px] font-bold text-slate-600">
                        Perlindungan
                        <br />
                        Hutan
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: LOGISTICS INFRASTRUCTURE NETWORK */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
            <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider flex items-center">
              <GitMerge className="w-4 h-4 mr-2 text-blue-600" /> Visualisasi
              Jaringan Logistik Wilayah
            </h3>

            <div className="relative h-40 w-full flex items-center justify-center px-4 md:px-20">
              {/* SVG Connecting Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <path
                  d="M 25% 50% L 50% 50%"
                  stroke={COLORS.primary}
                  strokeWidth="4"
                  opacity="0.3"
                />
                <path
                  d="M 25% 50% L 50% 50%"
                  stroke={COLORS.primary}
                  strokeWidth="2"
                  strokeDasharray="5 5"
                  className="animate-[dash_1.5s_linear_infinite]"
                />

                <path
                  d="M 50% 50% L 75% 50%"
                  stroke={COLORS.logistics}
                  strokeWidth="4"
                  opacity="0.3"
                />
                <path
                  d="M 50% 50% L 75% 50%"
                  stroke={COLORS.logistics}
                  strokeWidth="2"
                  strokeDasharray="5 5"
                  className="animate-[dash_1.5s_linear_infinite]"
                />
              </svg>

              <div className="w-full flex justify-between items-center relative z-10">
                {/* Node 1: Plantation */}
                <div className="flex flex-col items-center w-32">
                  <div className="w-16 h-16 bg-emerald-50 border-4 border-emerald-500 rounded-full flex items-center justify-center shadow-lg mb-2">
                    <Leaf className="w-7 h-7 text-emerald-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 text-center">
                    Area Perkebunan
                  </p>
                  <p className="text-[10px] text-slate-500 text-center">
                    Sumber Hulu
                  </p>
                </div>

                {/* Node 2: CPO Mill */}
                <div className="flex flex-col items-center w-32">
                  <div className="w-16 h-16 bg-slate-800 border-4 border-slate-600 rounded-xl flex items-center justify-center shadow-lg mb-2">
                    <Factory className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 text-center">
                    Pabrik CPO Terdekat
                  </p>
                  <p className="text-[10px] text-slate-500 text-center">
                    Pemrosesan
                  </p>
                </div>

                {/* Node 3: Port/Hub */}
                <div className="flex flex-col items-center w-32">
                  <div className="w-16 h-16 bg-blue-50 border-4 border-blue-500 rounded-full flex items-center justify-center shadow-lg mb-2">
                    <Anchor className="w-7 h-7 text-blue-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 text-center">
                    {selectedRegion.facility}
                  </p>
                  <p className="text-[10px] text-slate-500 text-center">
                    Ekspor / Distribusi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- SUBKOMPONEN UI ---

type LayerToggleProps = {
  active: boolean;
  onClick: () => void;
  label: string;
  color: string;
};

function LayerToggle({ active, onClick, label, color }: LayerToggleProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded flex items-center transition-all mr-2 shadow-sm border ${active ? "bg-white border-slate-200 text-slate-800" : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"}`}
    >
      <div
        className={`w-3 h-3 rounded flex items-center justify-center mr-2 border border-slate-300 ${active ? color : "bg-transparent"}`}
      >
        {active && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
      </div>
      {label}
    </button>
  );
}

// --- KOMPONEN PETA LEAFLET (GEOSPATIAL) ---
function RealLeafletMap({
  activeLayers,
  geoData,
  setHoveredZone,
  selectedRegion,
  onSelectRegion,
}: RealLeafletMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else {
      if (window.L) initMap();
    }

    function initMap() {
      if (mapInstance.current) return;
      const L = window.L;

      const indonesiaBounds: [[number, number], [number, number]] = [
        [-11.0, 94.0],
        [6.0, 141.0],
      ];

      mapInstance.current = L.map(mapRef.current!, {
        zoomControl: true,
        attributionControl: false,
        maxBounds: indonesiaBounds,
        maxBoundsViscosity: 1.0,
        minZoom: 4,
      }).setView([-2.5, 118.0], 5);

      // Light/Terrain style map suitable for data overlay
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 12,
          subdomains: "abcd",
        },
      ).addTo(mapInstance.current!);

      markersLayer.current = L.layerGroup().addTo(mapInstance.current);
      renderMarkers();
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Effect to re-render markers when layers or selection changes
  useEffect(() => {
    if (window.L && mapInstance.current) {
      renderMarkers();
    }
  }, [activeLayers, selectedRegion]);

  // Effect to fly to selected region
  useEffect(() => {
    if (window.L && mapInstance.current && selectedRegion) {
      if (selectedRegion.name !== "Nasional") {
        mapInstance.current.flyTo([selectedRegion.lat, selectedRegion.lng], 6, {
          duration: 1.5,
        });
      } else {
        mapInstance.current.flyTo([-2.5, 118.0], 5, { duration: 1.5 });
      }
    }
  }, [selectedRegion]);

  const renderMarkers = React.useCallback(() => {
    if (!markersLayer.current) return;
    const L = window.L;
    markersLayer.current.clearLayers();

    geoData.forEach((node) => {
      const isSelected =
        selectedRegion.name === node.name || selectedRegion.name === "Nasional";
      const opacityMultiplier = isSelected ? 1 : 0.3; // Meredupkan wilayah yang tidak dipilih

      // 1. Layer Produksi (Gelembung Hijau)
      if (activeLayers.production) {
        const radius = Math.max(10, node.prod * 3); // Ukuran berdasarkan produksi
        const prodMarker = L.circleMarker([node.lat, node.lng], {
          radius: radius,
          fillColor: COLORS.primary,
          color: "#ffffff",
          weight: 1.5,
          opacity: opacityMultiplier,
          fillOpacity: 0.6 * opacityMultiplier,
          className: "cursor-pointer",
        });
        bindInteraction(prodMarker, node, onSelectRegion);
        prodMarker.addTo(markersLayer.current!);
      }

      // 2. Layer Risiko Deforestasi (Heatmap blob Merah)
      if (activeLayers.risk && node.riskIndex > 40) {
        const riskMarker = L.circleMarker([node.lat, node.lng], {
          radius: node.riskIndex * 0.6, // Ukuran/Sebaran berdasarkan indeks
          fillColor: COLORS.risk,
          color: "transparent",
          fillOpacity: 0.3 * opacityMultiplier,
          className: "pointer-events-none", // Agar tidak mengganggu klik layer atasnya
        });
        riskMarker.addTo(markersLayer.current!);
      }

      // 3. Layer Program Replanting (Marker Kuning)
      if (activeLayers.replanting && node.replanting > 0) {
        const repMarker = L.circleMarker([node.lat + 0.5, node.lng - 0.5], {
          // Sedikit offset
          radius: 6,
          fillColor: COLORS.food,
          color: "#ffffff",
          weight: 2,
          opacity: opacityMultiplier,
          fillOpacity: 1 * opacityMultiplier,
          className: "cursor-pointer",
        });
        bindInteraction(repMarker, node, onSelectRegion);
        repMarker.addTo(markersLayer.current!);
      }

      // 4. Layer Infrastruktur Logistik (Ikon Biru)
      if (activeLayers.infra) {
        // Render sebagai kotak (Rectangle proxy using custom icon or square path, using circle with sharp dash for simplicity or just distinct style)
        const infraMarker = L.circleMarker([node.lat - 0.5, node.lng + 0.5], {
          // Sedikit offset
          radius: 7,
          fillColor: COLORS.logistics,
          color: "#ffffff",
          weight: 2,
          opacity: opacityMultiplier,
          fillOpacity: 1 * opacityMultiplier,
          className: "cursor-pointer",
        });
        bindInteraction(infraMarker, node, onSelectRegion);
        infraMarker.addTo(markersLayer.current!);
      }
    });
  }, [geoData, activeLayers, selectedRegion]);

  // Fungsi helper untuk binding event hover & click secara seragam
  function bindInteraction(
    marker: L.CircleMarker,
    node: GeoNode,
    selectFn: (node: GeoNode) => void,
  ) {
    marker.on("mousemove", (e: L.LeafletMouseEvent) => {
      setHoveredZone({ ...node, x: e.containerPoint.x, y: e.containerPoint.y });
    });
    marker.on("mouseout", () => setHoveredZone(null));
    marker.on("click", () => selectFn(node));
  }

  return (
    <div className="w-full h-full relative z-[1]">
      <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
      <style>{`
        .leaflet-control-container .leaflet-routing-container { display: none; }
        .leaflet-top, .leaflet-bottom { z-index: 10 !important; }
        /* Animasi garis putus-putus untuk Flow Diagram */
        @keyframes dash {
          to { stroke-dashoffset: -20; }
        }
      `}</style>
    </div>
  );
}
