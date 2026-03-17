import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import {
  Map as MapIcon,
  GitMerge,
  Sliders,
  Wheat,
  TrendingUp,
  TrendingDown,
  Activity,
  Leaf,
  Droplets,
  Anchor,
  Factory,
  LineChart as ChartIcon,
  DollarSign,
} from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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
import type * as LeafletType from "leaflet";


type HoveredZone = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  prod: string;
  area: string;
  yield: string;
  risk: string;
  type: string;
  x: number;
  y: number;
} | null;
export default function App() {
  // --- STATE MANAGEMENT SIMULASI ---
  const [mandate, setMandate] = useState(40); // B40, B50, dll
  const [exportLimit, setExportLimit] = useState(60);
  const [replanting, setReplanting] = useState(5);
  const [cpoPrice, setCpoPrice] = useState(950); // Harga CPO Global (USD/MT)

  const [mapLayer, setMapLayer] = useState("production");

  const [hoveredZone, setHoveredZone] = useState<HoveredZone>(null);
  // --- KALKULASI DIGITAL TWIN ---
  const baseProduction = 48.2;
  const yieldImpact = (replanting / 25) * 2.5;
  const currentProd = Number((baseProduction - yieldImpact).toFixed(1));

  const domesticFood = 16.3;

  const biodieselVol = Number(((mandate / 40) * 10.5).toFixed(1));
  const maxExport = currentProd - domesticFood - biodieselVol;
  const actualExport = Number((maxExport * (exportLimit / 100)).toFixed(1));
  const foodIndex = Math.max(
    0,
    100 - (mandate > 40 ? (mandate - 40) * 2 : 0) + (exportLimit < 50 ? 5 : 0),
  );
  const energyShare = (mandate / 50) * 100;
  const priceVolatility =
    20 +
    (mandate > 40 ? (mandate - 40) * 1.5 : 0) +
    (exportLimit > 80 ? 10 : 0);

  // Kalkulasi Dampak Preview Simulasi
  const impactPricePercent = (
    (mandate - 40) * 0.4 +
    (80 - exportLimit) * 0.1 +
    (cpoPrice - 950) * 0.05
  ).toFixed(1);
  const impactDeforest = ((mandate - 40) * 0.2 - replanting * 0.3).toFixed(1);
  const impactProd = (replanting * 0.4 - 2).toFixed(1);

  // Harga Minyak Goreng Domestik (Base: Rp 14.500)
  const baseOilPrice = 14500;
  const currentOilPrice =
    baseOilPrice * (1 + parseFloat(impactPricePercent) / 100);

  // --- DATA FORECAST 2026-2030 (Policy vs Baseline) ---
  const forecastData = [
    { year: "2025", baselineProd: 47.0, prod: 47.0, cons: 16.0, bio: 10.0 },
    {
      year: "2026",
      baselineProd: 48.2,
      prod: currentProd,
      cons: 16.3,
      bio: biodieselVol,
    },
    {
      year: "2027",
      baselineProd: 49.0,
      prod: currentProd + 1.2,
      cons: 16.5,
      bio: biodieselVol + (mandate > 40 ? 1 : 0.5),
    },
    {
      year: "2028",
      baselineProd: 50.1,
      prod: currentProd + 2.5,
      cons: 16.8,
      bio: biodieselVol + (mandate > 40 ? 2 : 1),
    },
    {
      year: "2029",
      baselineProd: 51.0,
      prod: currentProd + 3.8,
      cons: 17.1,
      bio: biodieselVol + (mandate > 40 ? 3 : 1.5),
    },
    {
      year: "2030",
      baselineProd: 52.0,
      prod: currentProd + 5.0 + replanting * 0.5,
      cons: 17.5,
      bio: biodieselVol + (mandate > 40 ? 4 : 2),
    },
  ];

  return (
    <div
      className="flex h-screen overflow-hidden font-sans"
      style={{ backgroundColor: COLORS.bg, color: COLORS.text }}
    >
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50 relative">
        {/* HEADER */}
        <Header />

        {/* SCROLLABLE DASHBOARD */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ROW 1: KPI NASIONAL (5 Kolom) */}
          <div className="grid grid-cols-5 gap-4">
            <KPICard
              title="Produksi Nasional"
              value={currentProd}
              unit="Juta Ton"
              trend="+2.4%"
              color={COLORS.primary}
              icon={<Leaf className="w-5 h-5" />}
            />
            <KPICard
              title="Harga Minyak Goreng"
              value={`Rp ${(currentOilPrice / 1000).toFixed(1)}k`}
              unit="/ Liter"
              trend={
                parseFloat(impactPricePercent) > 0
                  ? `+${impactPricePercent}%`
                  : `${impactPricePercent}%`
              }
              color={
                parseFloat(impactPricePercent) > 0
                  ? COLORS.danger
                  : COLORS.primary
              }
              icon={<DollarSign className="w-5 h-5" />}
              isDown={parseFloat(impactPricePercent) > 0}
            />
            <KPICard
              title="Konsumsi Pangan"
              value={domesticFood}
              unit="Juta Ton"
              trend="+1.1%"
              color={COLORS.food}
              icon={<Wheat className="w-5 h-5" />}
            />
            <KPICard
              title="Serapan Biodiesel"
              value={biodieselVol}
              unit={`Jt Ton (B${mandate})`}
              trend={mandate > 35 ? "+12%" : "-2%"}
              color={COLORS.energy}
              icon={<Droplets className="w-5 h-5" />}
            />
            <KPICard
              title="Kuota Ekspor"
              value={actualExport}
              unit="Juta Ton"
              trend={exportLimit < 70 ? "-5.4%" : "+1.2%"}
              color={COLORS.env}
              icon={<GitMerge className="w-5 h-5" />}
              isDown={exportLimit < 70}
            />
          </div>

          {/* ROW 2: PETA SPASIAL (GOOGLE MAPS) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-4 z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                  <MapIcon className="w-5 h-5 mr-2 text-emerald-600" /> Peta
                  Geospatial & Inteligensi Spasial
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Pemantauan klaster produksi riil, titik HGU, dan sebaran
                  risiko deforestasi seluruh Indonesia.
                </p>
              </div>
              <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-inner z-10">
                <MapToggle
                  active={mapLayer === "production"}
                  onClick={() => setMapLayer("production")}
                  label="Cluster Produksi"
                  color="bg-emerald-500"
                />
                <MapToggle
                  active={mapLayer === "risk"}
                  onClick={() => setMapLayer("risk")}
                  label="Risiko Deforestasi"
                  color="bg-red-500"
                />
                <MapToggle
                  active={mapLayer === "replanting"}
                  onClick={() => setMapLayer("replanting")}
                  label="Program Replanting"
                  color="bg-yellow-500"
                />
              </div>
            </div>

            {/* Container Peta Integrasi Leaflet */}
            <div className="w-full h-[400px] bg-slate-100 rounded-xl border border-slate-200 relative overflow-hidden flex shadow-inner">
              <RealLeafletMap
                mapLayer={mapLayer}
                setHoveredZone={setHoveredZone}
              />

              {/* Legend Peta statis di pojok kiri bawah */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur border border-slate-200 p-3 rounded-lg z-[20] shadow-lg pointer-events-none">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">
                  Legend Peta
                </p>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2 shadow-sm"></span>{" "}
                    Produksi Tinggi / Intensif
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2 shadow-sm"></span>{" "}
                    Fokus Replanting
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-red-500 mr-2 shadow-sm"></span>{" "}
                    Risiko Deforestasi / Kritis
                  </div>
                </div>
              </div>

              {/* REACT FLOATING TOOLTIP (Bebas Bug Bergeser) */}
              {hoveredZone && (
                <div
                  className="absolute bg-white/95 backdrop-blur shadow-2xl rounded-xl p-4 border border-slate-200 w-64 z-[100] pointer-events-none"
                  style={{
                    left: `${hoveredZone.x + 15}px`,
                    top: `${hoveredZone.y - 15}px`,
                    transform: "translateY(-50%)", // Menengah-tengahkan tooltip ke sumbu Y kursor
                  }}
                >
                  <div className="flex items-center space-x-2 mb-3 border-b border-slate-200 pb-2">
                    <MapIcon className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-slate-800">
                      Provinsi: {hoveredZone.name}
                    </h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Produksi:</span>{" "}
                      <strong className="text-slate-800">
                        {hoveredZone.prod} juta ton
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Luas Sawit:</span>{" "}
                      <strong className="text-slate-800">
                        {hoveredZone.area} juta ha
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Produktivitas:</span>{" "}
                      <strong className="text-slate-800">
                        {hoveredZone.yield} ton/ha
                      </strong>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
                      <span className="text-slate-500">
                        Status Deforestasi:
                      </span>
                      <strong
                        className={
                          hoveredZone.risk.includes("Tinggi") ||
                          hoveredZone.risk.includes("Kritis")
                            ? "text-red-500"
                            : "text-emerald-500"
                        }
                      >
                        {hoveredZone.risk}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ROW 3: ALOKASI SANKEY FLOW (Dengan Panah & Flow yang Jelas) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center">
              <GitMerge className="w-5 h-5 mr-2 text-blue-600" /> Visualisasi
              Alur Sistem (Sankey Flow)
            </h3>
            <p className="text-xs text-slate-500 mb-8">
              Pemetaan distribusi rantai pasok dari hulu (Tandan Buah Segar)
              diolah menjadi CPO, lalu dialokasikan ke sektor hilir.
            </p>

            <div className="relative h-64 w-full flex items-center justify-between px-2 lg:px-8">
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
                preserveAspectRatio="none"
              >
                {/* Definisi Panah Penghubung */}
                <defs>
                  <marker
                    id="arrowFood"
                    viewBox="0 0 10 10"
                    refX="7"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.food} />
                  </marker>
                  <marker
                    id="arrowEnergy"
                    viewBox="0 0 10 10"
                    refX="7"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.energy} />
                  </marker>
                  <marker
                    id="arrowEnv"
                    viewBox="0 0 10 10"
                    refX="7"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.env} />
                  </marker>
                  <marker
                    id="arrowCPO"
                    viewBox="0 0 10 10"
                    refX="7"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
                  </marker>
                </defs>

                {/* Hulu ke Pusat (Produksi -> CPO) */}
                <SankeyPath
                  startX="22%"
                  startY="50%"
                  endX="38%"
                  endY="50%"
                  weight={45}
                  color={COLORS.primary}
                  isInput
                  markerId="arrowCPO"
                />

                {/* Pusat ke Hilir (CPO -> Sektor) */}
                <SankeyPath
                  startX="48%"
                  startY="50%"
                  endX="72%"
                  endY="20%"
                  weight={20}
                  color={COLORS.food}
                  markerId="arrowFood"
                />
                <SankeyPath
                  startX="48%"
                  startY="50%"
                  endX="72%"
                  endY="50%"
                  weight={(mandate / 50) * 35}
                  color={COLORS.energy}
                  markerId="arrowEnergy"
                />
                <SankeyPath
                  startX="48%"
                  startY="50%"
                  endX="72%"
                  endY="80%"
                  weight={(exportLimit / 100) * 35}
                  color={COLORS.env}
                  markerId="arrowEnv"
                />
              </svg>

              {/* Node Kiri: Hulu */}
              <div className="z-10 w-40 bg-emerald-50 border-2 border-emerald-500 p-4 rounded-xl shadow-md text-center transform -translate-x-4">
                <Leaf className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
                <p className="text-[10px] text-emerald-800 uppercase font-bold">
                  Produksi Tandan
                </p>
                <p className="text-xl font-mono font-bold text-slate-800">
                  {currentProd} <span className="text-xs">MT</span>
                </p>
              </div>

              {/* Node Tengah: CPO */}
              <div className="z-10 w-32 bg-slate-800 text-white p-4 rounded-xl shadow-xl border-4 border-slate-600 text-center flex flex-col items-center justify-center relative">
                <Factory className="w-6 h-6 mb-1 text-slate-300" />
                <p className="text-xs text-white uppercase tracking-wider font-bold">
                  CPO Inti
                </p>
                <div className="absolute -bottom-6 bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded font-bold border border-slate-200">
                  100% Proses
                </div>
              </div>

              {/* Node Kanan: Sektor Hilir */}
              <div className="z-10 flex flex-col justify-between h-full space-y-4 py-2 w-64 transform translate-x-4">
                <SankeyNode
                  icon={<Wheat />}
                  color="bg-yellow-50 border-yellow-400 text-yellow-800"
                  label="Pangan (Minyak Goreng)"
                  value={domesticFood}
                  percentage={Number(
                    ((domesticFood / currentProd) * 100).toFixed(0),
                  )}
                />
                <SankeyNode
                  icon={<Droplets />}
                  color="bg-orange-50 border-orange-400 text-orange-800"
                  label={`Energi (Biodiesel B${mandate})`}
                  value={biodieselVol}
                  percentage={Number(
                    ((biodieselVol / currentProd) * 100).toFixed(0),
                  )}
                />
                <SankeyNode
                  icon={<Anchor />}
                  color="bg-blue-50 border-blue-400 text-blue-800"
                  label="Pasar Ekspor"
                  value={actualExport}
                  percentage={Number(
                    ((actualExport / currentProd) * 100).toFixed(0),
                  )}
                />
              </div>
            </div>
          </div>

          {/* ROW 4 & 5: SIMULASI, PREDIKSI, INDIKATOR */}
          <div className="grid grid-cols-12 gap-6">
            {/* Panel Simulasi Kebijakan */}
            <div className="col-span-12 lg:col-span-4 bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6 text-white flex flex-col">
              <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-slate-600">
                <Sliders className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold">Simulasi Kebijakan</h3>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Ubah variabel makro untuk melihat trade-off pada sistem secara
                langsung.
              </p>

              <div className="space-y-6 flex-1">
                <SimulationSlider
                  label="Mandat Biodiesel"
                  value={mandate}
                  min={30}
                  max={50}
                  step={5}
                  unit="%"
                  prefix="B"
                  onChange={setMandate}
                  color="accent-orange-500"
                />
                <SimulationSlider
                  label="Batas Kuota Ekspor"
                  value={exportLimit}
                  min={20}
                  max={100}
                  step={10}
                  unit="%"
                  onChange={setExportLimit}
                  color="accent-blue-500"
                />
                <SimulationSlider
                  label="Target Replanting"
                  value={replanting}
                  min={0}
                  max={25}
                  step={1}
                  unit="%"
                  onChange={setReplanting}
                  color="accent-yellow-500"
                />
                <SimulationSlider
                  label="Harga CPO Global"
                  value={cpoPrice}
                  min={700}
                  max={1300}
                  step={50}
                  unit="/MT"
                  prefix="$"
                  onChange={setCpoPrice}
                  color="accent-emerald-500"
                />
              </div>

              <div className="mt-6 bg-slate-900/80 rounded-xl p-4 border border-slate-700 shadow-inner">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-3 font-bold flex items-center">
                  <Activity className="w-3 h-3 mr-1" /> Dampak Skenario (Live)
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <ImpactRow
                    label="Produksi"
                    val={impactProd}
                    unit="%"
                    inverse
                  />
                  <ImpactRow
                    label="Harga Minyak"
                    val={impactPricePercent}
                    unit="%"
                    inverse
                  />
                  <ImpactRow
                    label="Energi Tersedia"
                    val={mandate > 40 ? "+12.0" : "-4.0"}
                    unit="%"
                  />
                  <ImpactRow
                    label="Deforestasi"
                    val={impactDeforest}
                    unit="%"
                    inverse
                  />
                </div>
              </div>
            </div>

            {/* Panel Forecast Chart (Dengan Legend Baseline & Policy) */}
            <div className="col-span-12 lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <div className="flex items-center space-x-2 mb-2">
                <ChartIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-800">
                  Forecast Digital Twin 2030
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Perbandingan antara skenario tanpa intervensi (Baseline) dan
                hasil Simulasi Kebijakan.
              </p>

              <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={forecastData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E2E8F0"
                    />
                    <XAxis
                      dataKey="year"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#64748B" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#64748B" }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      labelStyle={{ fontWeight: "bold", color: "#0F172A" }}
                    />
                    <Legend
                      iconType="plainline"
                      wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                    />

                    {/* Baseline (Garis Putus-putus tebal) */}
                    <Line
                      type="monotone"
                      name="Baseline Scenario"
                      dataKey="baselineProd"
                      stroke={COLORS.baseline}
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={false}
                    />

                    {/* Policy Simulated Values */}
                    <Line
                      type="monotone"
                      name="Policy: Produksi Nasional"
                      dataKey="prod"
                      stroke={COLORS.primary}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      name="Konsumsi Domestik"
                      dataKey="cons"
                      stroke={COLORS.food}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      name="Permintaan Biodiesel"
                      dataKey="bio"
                      stroke={COLORS.energy}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Panel Indikator Stabilitas (Menunjukkan Trade-off) */}
            <div className="col-span-12 lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  Indikator Stabilitas
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Trade-off kebijakan termonitor secara real-time berdasarkan
                  skor komposit (0-100).
                </p>
              </div>
              <div className="space-y-6 flex-1 flex flex-col justify-center">
                <GaugeChart
                  value={foodIndex}
                  title="Ketahanan Pangan"
                  color={COLORS.food}
                />
                <div className="h-px bg-slate-100 w-full"></div>
                <GaugeChart
                  value={energyShare}
                  title="Ketahanan Energi"
                  color={COLORS.energy}
                />
                <div className="h-px bg-slate-100 w-full"></div>
                <GaugeChart
                  value={priceVolatility}
                  title="Risiko Volatilitas Harga"
                  color={
                    priceVolatility > 40 || parseFloat(impactPricePercent) > 5
                      ? COLORS.danger
                      : COLORS.primary
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- SUBKOMPONEN PETA GOOGLE MAPS + LEAFLET ---

// Data Klaster Produksi Representatif Nasional
const geoNodesData = [
  {
    id: "Sumut",
    name: "Sumatera Utara",
    lat: 2.5,
    lng: 99.0,
    prod: "5.3",
    area: "1.8",
    yield: "3.6",
    risk: "Sedang",
    type: "intensive",
  },
  {
    id: "Riau",
    name: "Riau",
    lat: 0.5,
    lng: 101.5,
    prod: "8.5",
    area: "2.2",
    yield: "3.8",
    risk: "Tinggi",
    type: "intensive",
  },
  {
    id: "Jambi",
    name: "Jambi",
    lat: -1.5,
    lng: 103.5,
    prod: "3.2",
    area: "1.1",
    yield: "3.5",
    risk: "Sedang",
    type: "replanting",
  },
  {
    id: "Kalbar",
    name: "Kalimantan Barat",
    lat: -0.5,
    lng: 111.0,
    prod: "4.8",
    area: "1.5",
    yield: "3.4",
    risk: "Tinggi",
    type: "risk",
  },
  {
    id: "Kalteng",
    name: "Kalimantan Tengah",
    lat: -1.8,
    lng: 113.5,
    prod: "6.3",
    area: "1.7",
    yield: "3.7",
    risk: "Tinggi",
    type: "intensive",
  },
  {
    id: "Kaltim",
    name: "Kalimantan Timur",
    lat: 1.0,
    lng: 116.5,
    prod: "5.2",
    area: "1.4",
    yield: "3.7",
    risk: "Sedang",
    type: "replanting",
  },
  {
    id: "Sulbar",
    name: "Sulawesi Barat",
    lat: -2.5,
    lng: 119.0,
    prod: "1.2",
    area: "0.4",
    yield: "3.0",
    risk: "Rendah",
    type: "replanting",
  },
  {
    id: "Papua",
    name: "Papua",
    lat: -4.0,
    lng: 138.0,
    prod: "1.5",
    area: "0.6",
    yield: "2.5",
    risk: "Sangat Tinggi (Kritis)",
    type: "risk",
  },
];

type RealLeafletMapProps = {
  mapLayer: string;
  setHoveredZone: React.Dispatch<React.SetStateAction<HoveredZone>>;
};

function RealLeafletMap({ mapLayer, setHoveredZone }: RealLeafletMapProps) {
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Inject Leaflet Assets
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

      const indonesiaBounds: [number, number][] = [
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

      L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        maxZoom: 12,
      }).addTo(mapInstance.current);

      markersLayer.current = L.layerGroup().addTo(mapInstance.current!);
      renderMarkers();
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (window.L && mapInstance.current) {
      renderMarkers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLayer]);

  function renderMarkers() {
    if (!markersLayer.current) return;
    const L = window.L;
    markersLayer.current.clearLayers();

    geoNodesData.forEach((node) => {
      let fill = "#10B981";
      let show = true;

      if (mapLayer === "risk") {
        fill =
          node.risk.includes("Tinggi") || node.risk.includes("Kritis")
            ? "#EF4444"
            : "#F59E0B";
      } else if (mapLayer === "replanting") {
        fill = node.type === "replanting" ? "#F59E0B" : "#64748B";
        if (node.type !== "replanting") show = false;
      } else {
        fill = node.type === "risk" ? "#F59E0B" : "#10B981";
      }

      if (!show) return;

      const marker = L.circleMarker([node.lat, node.lng], {
        radius: 12,
        fillColor: fill,
        color: "#ffffff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      });

      // PENTING: Mencegah bug bergeser (Leaflet Auto-pan issue)
      // Kita mem-bypass bindTooltip/bindPopup bawaan Leaflet dan mengirimkan koordinat X,Y ke React State
      marker.on("mousemove", (e: LeafletType.LeafletMouseEvent) => {
        setHoveredZone({
          ...node,
          x: e.containerPoint.x,
          y: e.containerPoint.y,
        });
      });

      marker.on("mouseout", () => {
        setHoveredZone(null);
      });

      marker.addTo(markersLayer.current!);
      // Animasi Radar
      L.circleMarker([node.lat, node.lng], {
        radius: 30,
        fillColor: fill,
        color: "transparent",
        fillOpacity: 0.3,
        className: "map-radar-ping",
      }).addTo(markersLayer.current!);
    });
  }

  return (
    <div className="w-full h-full relative z-[1]">
      <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
      <style>{`
        .map-radar-ping {
          animation: map-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          transform-origin: center;
        }
        @keyframes map-ping {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .leaflet-control-container .leaflet-routing-container { display: none; }
        .leaflet-top, .leaflet-bottom { z-index: 10 !important; }
      `}</style>
    </div>
  );
}

type KPICardProps = {
  title: string;
  value: string | number;
  unit: string;
  trend: string;
  color: string;
  icon: React.ReactElement;
  isDown?: boolean;
};

function KPICard({
  title,
  value,
  unit,
  trend,
  color,
  icon,
  isDown,
}: KPICardProps) {
  // Parsing trend untuk logic warna jika tidak ada properti isDown eksplisit
  const isNegativeTrend = trend.toString().startsWith("-");
  const dangerColor = isDown || isNegativeTrend;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center space-x-2">
          <div
            className="p-1.5 rounded-lg"
            style={{ backgroundColor: `${color}15`, color: color }}
          >
            {React.cloneElement(icon, { className: "w-4 h-4" })}
          </div>
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {title}
          </h3>
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-2xl font-mono font-bold text-slate-800">{value}</p>
          <p className="text-[10px] font-medium text-slate-400 mt-0.5">
            {unit}
          </p>
        </div>
        <span
          className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${dangerColor ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}
        >
          {dangerColor ? (
            <TrendingDown className="w-3 h-3 mr-0.5" />
          ) : (
            <TrendingUp className="w-3 h-3 mr-0.5" />
          )}
          {trend}
        </span>
      </div>
    </div>
  );
}

type MapToggleProps = {
  active: boolean;
  onClick: () => void;
  label: string;
  color: string;
};

function MapToggle({ active, onClick, label, color }: MapToggleProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded flex items-center transition-all ${active ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
    >
      <span className={`w-2 h-2 rounded-full mr-2 ${color}`}></span> {label}
    </button>
  );
}

type SankeyPathProps = {
  startX: string;
  startY: string;
  endX: string;
  endY: string;
  weight: number;
  color: string;
  isInput?: boolean;
  markerId?: string;
};

function SankeyPath({
  startX,
  startY,
  endX,
  endY,
  weight,
  color,
  isInput,
  markerId,
}: SankeyPathProps) {
  const pathData = isInput
    ? `M ${startX} ${startY} L ${endX} ${endY}`
    : `M ${startX} ${startY} C 55% ${startY}, 55% ${endY}, ${endX} ${endY}`;
  return (
    <g>
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={Math.max(4, weight)}
        opacity="0.15"
        strokeLinecap="round"
      />
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={Math.max(2, weight * 0.4)}
        opacity="0.9"
        strokeLinecap="round"
        strokeDasharray="6 8"
        className="animate-[dash_1s_linear_infinite]"
        markerEnd={markerId ? `url(#${markerId})` : ""}
      />
    </g>
  );
}

type SankeyNodeProps = {
  icon: React.ReactElement;
  color: string;
  label: string;
  value: string | number;
  percentage: string | number;
};

function SankeyNode({
  icon,
  color,
  label,
  value,
  percentage,
}: SankeyNodeProps) {
  return (
    <div
      className={`p-3 rounded-lg border-l-4 bg-white shadow-sm flex flex-col justify-center relative overflow-hidden ${color.replace("bg-", "border-")}`}
    >
      <div
        className={`absolute top-0 right-0 bottom-0 w-16 opacity-10 rounded-r-lg ${color.split(" ")[0]}`}
      ></div>
      <div className="flex items-center space-x-2 mb-1 z-10">
        <div
          className={`p-1 rounded bg-white shadow-sm border border-white/50 ${color.split(" ")[2]}`}
        >
          {React.cloneElement(icon, { className: "w-3 h-3" })}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
          {label}
        </span>
      </div>
      <div className="flex justify-between items-end z-10">
        <span className="font-mono font-bold text-lg text-slate-800">
          {value}{" "}
          <span className="text-[10px] font-sans font-normal text-slate-500">
            MT
          </span>
        </span>
        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">
          {percentage}%
        </span>
      </div>
    </div>
  );
}

type SimulationSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  prefix?: string;
  onChange: (value: number) => void;
  color: string;
};

function SimulationSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  prefix = "",
  onChange,
  color,
}: SimulationSliderProps) {
  return (
    <div>
      <div className="flex justify-between items-end mb-1">
        <label className="text-xs font-bold text-slate-300">{label}</label>
        <span className="text-lg font-mono font-bold text-emerald-300">
          {prefix}
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer ${color}`}
        style={{
          accentColor: color.includes("orange")
            ? "#F59E0B"
            : color.includes("blue")
              ? "#3B82F6"
              : color.includes("emerald")
                ? "#10B981"
                : "#FBBF24",
        }}
      />
    </div>
  );
}

type ImpactRowProps = {
  label: string;
  val: string | number;
  unit: string;
  inverse?: boolean;
};

function ImpactRow({ label, val, unit, inverse = false }: ImpactRowProps) {
  const numVal = typeof val === "number" ? val : parseFloat(val);
  const isPositive = numVal > 0;
  let colorClass = isPositive ? "text-emerald-400" : "text-red-400";
  if (inverse) colorClass = isPositive ? "text-red-400" : "text-emerald-400";
  if (numVal === 0) colorClass = "text-slate-400";

  return (
    <div className="flex justify-between items-center border-b border-slate-700/50 pb-1">
      <span className="text-slate-300">{label}</span>
      <span className={`font-mono font-bold ${colorClass}`}>
        {isPositive ? "+" : ""}
        {val}
        {unit}
      </span>
    </div>
  );
}

type GaugeChartProps = {
  value: number;
  title: string;
  color: string;
};

function GaugeChart({ value, title, color }: GaugeChartProps) {
  const data = [
    { name: "Value", value: value },
    { name: "Remain", value: 100 - value },
  ];
  return (
    <div className="flex items-center justify-between group">
      <div className="w-1/2">
        <p className="text-xs font-bold text-slate-700 mb-0.5">{title}</p>
        <p className="text-[10px] text-slate-400">Score: 0-100</p>
      </div>
      <div className="w-20 h-10 relative">
        <ResponsiveContainer width="100%" height="180%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="60%"
              startAngle={180}
              endAngle={0}
              innerRadius={18}
              outerRadius={28}
              dataKey="value"
              stroke="none"
              cornerRadius={2}
            >
              <Cell fill={color} />
              <Cell fill="#E2E8F0" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-end justify-center">
          <span className="text-sm font-mono font-bold text-slate-800 leading-none">
            {value.toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
}
