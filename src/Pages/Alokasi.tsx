import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import * as L from "leaflet";

import { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  TrendingUp,
  Activity,
  AlertTriangle,
  Cpu,
  BarChart3,
  ArrowRightLeft,
  MapPin,
} from "lucide-react";

// --- THEME & COLORS ---
const COLORS = {
  green: "#1F7A63",
  yellow: "#FBBF24",
  orange: "#F59E0B",
  blue: "#2563EB",
  bg: "#F8FAFC",
  text: "#0F172A",
  red: "#EF4444",
  flow: {
    lancar: "#10B981", // Emerald 500
    padat: "#F59E0B", // Amber 500
    kritis: "#EF4444", // Red 500
  },
  slate: {
    100: "#F1F5F9",
    400: "#94A3B8",
    500: "#64748B",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A",
  },
};

// --- DATA SCENARIOS (PIMNAS-LEVEL DYNAMIC MODEL) ---
type ScenarioKey = "baseline" | "b50" | "exportFocus";
type Scenario = {
  id: ScenarioKey;
  name: string;
  mode: string;
  cpoTotal: number;
  allocations: { food: number; energy: number; export: number };
  subFlows: { food: string; energy: string; export: string };
  impacts: {
    pangan: string;
    energi: string;
    ekspor: string;
    harga: string;
    delay: string;
  };
  performance: {
    costIndex: number;
    delayAvg: number;
    efficiency: number;
    onTime: number;
  };
  mapFlows: MapFlow[];
  bottlenecks: Bottleneck[];
  aiRecs: { type: string; text: string }[];
  timelineState: string;
};
const SCENARIOS: Record<ScenarioKey, Scenario> = {
  baseline: {
    id: "baseline",
    name: "Baseline (B35)",
    mode: "Baseline (Stabil)",
    cpoTotal: 47.8,
    allocations: { food: 16.3, energy: 10.5, export: 21.0 },
    subFlows: {
      food: "Minyak Goreng (60%), Industri (40%)",
      energy: "Mandatori B35 (Aktif)",
      export: "China, India, EU",
    },
    impacts: {
      pangan: "0.0%",
      energi: "0.0%",
      ekspor: "0.0%",
      harga: "0.0%",
      delay: "0.0 hari",
    },
    performance: { costIndex: 100, delayAvg: 2.1, efficiency: 92, onTime: 88 },
    mapFlows: [
      {
        id: "kalbar-dumai",
        source: "Kalimantan",
        target: "Dumai",
        volume: 21.0,
        status: "lancar",
        desc: "Rute Ekspor Normal",
      },
      {
        id: "kalbar-jawa",
        source: "Kalimantan",
        target: "Jawa",
        volume: 10.5,
        status: "lancar",
        desc: "Distribusi Biodiesel/Pangan",
      },
      {
        id: "sumatra-dumai",
        source: "Sumatera Sel.",
        target: "Dumai",
        volume: 16.3,
        status: "padat",
        desc: "Padat Merayap",
      },
    ],
    bottlenecks: [
      {
        region: "Kalimantan Barat",
        issue: "Port congestion (Antrean Kapal)",
        severity: "medium",
        sysImpact: { distribusi: "+5%", harga: "+1%", delay: "+0.5 hari" },
      },
    ],
    aiRecs: [
      {
        type: "PRODUKSI",
        text: "Pertahankan ritme hulu. Panen sesuai jadwal.",
      },
      {
        type: "LOGISTIK",
        text: "Maintenance terjadwal armada rute Kalbar bulan depan.",
      },
    ],
    timelineState: "stable",
  },
  b50: {
    id: "b50",
    name: "Policy: Mandatori B50",
    mode: "Stress Test (Krisis)",
    cpoTotal: 47.8,
    allocations: { food: 16.3, energy: 15.5, export: 16.0 },
    subFlows: {
      food: "Minyak Goreng (Prioritas)",
      energy: "Mandatori B50 (Simulasi)",
      export: "Restriksi Kuota EU/China",
    },
    impacts: {
      pangan: "-3.1%",
      energi: "+8.5%",
      ekspor: "-2.0%",
      harga: "+4.2%",
      delay: "+0.5 hari",
    },
    performance: { costIndex: 118, delayAvg: 3.8, efficiency: 74, onTime: 62 },
    mapFlows: [
      {
        id: "kalbar-dumai",
        source: "Kalimantan",
        target: "Dumai",
        volume: 16.0,
        status: "kritis",
        desc: "Antrean Kapal Ekspor",
      },
      {
        id: "kalbar-jawa",
        source: "Kalimantan",
        target: "Jawa",
        volume: 15.5,
        status: "kritis",
        desc: "Overload Biodiesel B50",
      },
      {
        id: "sumatra-dumai",
        source: "Sumatera Sel.",
        target: "Dumai",
        volume: 16.3,
        status: "kritis",
        desc: "Kapasitas Tangki Penuh",
      },
    ],
    bottlenecks: [
      {
        region: "Jalur Kalbar - Jawa",
        issue: "Kritis: Kapal Domestik B50 Kurang",
        severity: "high",
        sysImpact: { distribusi: "+18%", harga: "+4.5%", delay: "+2.3 hari" },
      },
      {
        region: "Dumai Hub",
        issue: "Defisit Tangki Timbun Biodiesel",
        severity: "high",
        sysImpact: {
          distribusi: "Stagnan",
          harga: "+2.1%",
          delay: "+1.5 hari",
        },
      },
    ],
    aiRecs: [
      {
        type: "LOGISTIK",
        text: "Segera alihkan 15% beban Pelabuhan Dumai ke Belawan.",
      },
      {
        type: "KEBIJAKAN",
        text: "Tunda ekspor CPO mentah 5% untuk amankan pasokan domestik.",
      },
      {
        type: "PRODUKSI",
        text: "Akselerasi DMO (Domestic Market Obligation) untuk B50.",
      },
    ],
    timelineState: "critical",
  },
  exportFocus: {
    id: "exportFocus",
    name: "Policy: Export Optimization",
    mode: "Optimization Mode",
    cpoTotal: 47.8,
    allocations: { food: 16.0, energy: 9.0, export: 22.8 },
    subFlows: {
      food: "Minyak Goreng (Batas Aman)",
      energy: "Relaksasi ke B30",
      export: "Fokus Pasar China & India",
    },
    impacts: {
      pangan: "-1.8%",
      energi: "-4.5%",
      ekspor: "+8.5%",
      harga: "-2.0%",
      delay: "-0.2 hari",
    },
    performance: { costIndex: 94, delayAvg: 1.8, efficiency: 95, onTime: 92 },
    mapFlows: [
      {
        id: "kalbar-dumai",
        source: "Kalimantan",
        target: "Dumai",
        volume: 22.8,
        status: "padat",
        desc: "Volume Maksimal Ekspor",
      },
      {
        id: "kalbar-jawa",
        source: "Kalimantan",
        target: "Jawa",
        volume: 9.0,
        status: "lancar",
        desc: "Relaksasi Logistik",
      },
      {
        id: "sumatra-dumai",
        source: "Sumatera Sel.",
        target: "Dumai",
        volume: 16.0,
        status: "lancar",
        desc: "Lancar",
      },
    ],
    bottlenecks: [
      {
        region: "Belawan/Dumai",
        issue: "Kapasitas Sandar Maksimal",
        severity: "medium",
        sysImpact: { distribusi: "+3%", harga: "Stabil", delay: "+0.2 hari" },
      },
    ],
    aiRecs: [
      {
        type: "KEBIJAKAN",
        text: "Buka insentif pajak ekspor untuk produk turunan CPO.",
      },
      {
        type: "LOGISTIK",
        text: "Optimalkan jam sandar 24/7 di hub utama Sumatera.",
      },
    ],
    timelineState: "optimal",
  },
};

// --- HELPER: SVG SANKEY FLOW ---
type SankeyProps = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  width: number;
  color: string;
  opacity?: number;
  isHovered?: boolean;
};

const SankeyPath: React.FC<SankeyProps> = ({
  startX,
  startY,
  endX,
  endY,
  width,
  color,
  opacity = 0.6,
  isHovered,
}) => {
  const c1X = startX + (endX - startX) * 0.5;
  const c1Y = startY;
  const c2X = startX + (endX - startX) * 0.5;
  const c2Y = endY;
  return (
    <path
      d={`M ${startX} ${startY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${endX} ${endY}`}
      stroke={color}
      strokeWidth={width}
      fill="none"
      strokeOpacity={isHovered ? 0.9 : opacity}
      className="transition-all duration-500 ease-in-out"
      style={{
        filter: isHovered ? "drop-shadow(0px 0px 6px rgba(0,0,0,0.3))" : "none",
      }}
    />
  );
};

// --- REAL LEAFLET MAP COMPONENT ---
type MapFlow = {
  id: string;
  source: string;
  target: string;
  volume: number;
  status: "lancar" | "padat" | "kritis";
  desc: string;
};

type Bottleneck = {
  region: string;
  issue: string;
  severity: "low" | "medium" | "high";
  sysImpact: {
    distribusi: string;
    harga: string;
    delay: string;
  };
};

type ScenarioType = {
  mapFlows: MapFlow[];
  bottlenecks: Bottleneck[];
};

const LeafletMapIntegration = ({ data }: { data: ScenarioType }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layerGroup = useRef<L.LayerGroup | null>(null);
  useEffect(() => {
    // Inject Leaflet CSS & JS Dynamically to bypass environment issues
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
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([-1.8, 115], 5);

      window.L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
        },
      ).addTo(mapInstance.current as L.Map);

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

  // Update Map Layers when Scenario Data changes
  useEffect(() => {
    if (!window.L || !layerGroup.current) return;

    (layerGroup.current as L.LayerGroup).clearLayers();
    const COORDS: Record<string, [number, number]> = {
      Dumai: [1.6671, 101.4475],
      Kalimantan: [-0.0227, 110.3421], // Pontianak/Sanggau area
      Jawa: [-7.2504, 112.7688], // Surabaya
      "Sumatera Sel.": [-2.9909, 104.7566], // Palembang
    };

    // 1. Draw Real Polyline Flows
    data.mapFlows.forEach((flow) => {
      const start = COORDS[flow.source] as [number, number];
      const end = COORDS[flow.target] as [number, number];

      if (start && end) {
        const weight = Math.max(3, (flow.volume / 25) * 8); // Ketebalan = Volume
        const color =
          flow.status === "lancar"
            ? COLORS.flow.lancar
            : flow.status === "padat"
              ? COLORS.flow.padat
              : COLORS.flow.kritis;

        // Create SVG Animated Flow Line
        const line = L.polyline([start, end], {
          color: color,
          weight: weight,
          opacity: 0.9,
          className: `flow-line-leaflet ${flow.status}`,
        }).addTo(layerGroup.current as L.LayerGroup);

        // Center Label Toolkit
        line.bindTooltip(`${flow.volume} Jt Ton`, {
          permanent: true,
          direction: "center",
          className:
            "bg-white/95 text-[#0F172A] text-xs font-black px-2 py-1 rounded shadow-sm border-none",
        });
      }
    });

    // 2. Draw Real Nodes (Markers)
    Object.entries(COORDS).forEach(([name, coords]) => {
      const isDumai = name === "Dumai";
      const hasBottleneck = data.bottlenecks.some(
        (b) =>
          b.region.includes(name) ||
          (name === "Kalimantan" && b.region.includes("Kalbar")),
      );

      // Custom Node Styles
      const bgColor = hasBottleneck
        ? COLORS.red
        : isDumai
          ? COLORS.blue
          : COLORS.green;
      const animation = hasBottleneck
        ? "animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"
        : "";

      const htmlIcon = `
         <div class="relative w-full h-full flex items-center justify-center">
           ${hasBottleneck ? `<div style="position:absolute; inset:-8px; background:${COLORS.red}; opacity:0.3; border-radius:50%; ${animation}"></div>` : ""}
           <div style="width:16px;height:16px;background:${bgColor};border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(0,0,0,0.5);position:relative;z-index:10;"></div>
         </div>
       `;

      const icon = window.L.divIcon({
        html: htmlIcon,
        className: "",
        iconSize: [16, 16],
      });

      L.marker(coords, { icon })
        .bindPopup(
          `<b style="font-size:12px;">${name}</b><br/><span style="font-size:10px;color:gray;">Node Geospasial</span>`,
        )
        .addTo(layerGroup.current as L.LayerGroup);
    });
  }, [data]);

  return <div ref={mapRef} className="w-full h-full z-0 bg-slate-100"></div>;
};

export default function Alokasi() {
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

  const [activeScenario, setActiveScenario] = useState<ScenarioKey>("baseline");

  const data = SCENARIOS[activeScenario];
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const total = data.cpoTotal;
  const foodPct = (data.allocations.food / total) * 100;
  const energyPct = (data.allocations.energy / total) * 100;
  const exportPct = (data.allocations.export / total) * 100;

  const renderImpact = (val: string) => {
    const isNeg = val.startsWith("-");
    const isPos = val.startsWith("+");
    let color = "text-slate-700";
    if (isNeg) color = "text-red-600";
    if (isPos) color = "text-emerald-600";
    return <span className={`font-bold ${color}`}>{val}</span>;
  };

  return (
    <div
      className="flex h-screen  overflow-hidden font-sans"
      style={{ backgroundColor: COLORS.bg, color: COLORS.text }}
    >
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1  overflow-y-auto  flex flex-col h-screen overflow-hidden bg-slate-50/50 relative">
        {/* HEADER */}
        <Header />
        <div className="min-h-screen pb-10 bg-[#F8FAFC] text-[#0F172A] p-4 md:p-6 font-sans">
          {/* CSS Animasi Logistik untuk Leaflet */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
        @keyframes dashMoveLeaflet { to { stroke-dashoffset: -20; } }
        .flow-line-leaflet {
          stroke-dasharray: 10 15;
          animation: dashMoveLeaflet 1s linear infinite;
        }
        .flow-line-leaflet.kritis { animation-duration: 0.3s; }
        .flow-line-leaflet.lancar { animation-duration: 1.5s; }
        .flow-line-leaflet.padat { animation-duration: 0.8s; }
        .leaflet-tooltip { background: transparent; border: none; box-shadow: none; }
      `,
            }}
          />

          {/* HEADER & SCENARIO CONTROL */}
          <header className="mb-4">
            <div className="bg-slate-900 rounded-2xl p-1.5 flex flex-col md:flex-row justify-between items-center shadow-lg border border-slate-700">
              <div className="flex p-1 bg-slate-800 rounded-xl space-x-1 w-full md:w-auto">
                {Object.values(SCENARIOS).map((scen) => (
                  <button
                    key={scen.id}
                    onClick={() => setActiveScenario(scen.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeScenario === scen.id ? "bg-emerald-500 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-slate-700"}`}
                  >
                    {scen.name}
                  </button>
                ))}
              </div>
              <div className="px-5 py-2 flex items-center gap-3 w-full md:w-auto">
                <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">
                  System Mode:
                </span>
                <div
                  className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-2 ${
                    data.mode.includes("Krisis")
                      ? "bg-red-500/20 text-red-400 border border-red-500/50"
                      : data.mode.includes("Optimization")
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                  }`}
                >
                  {data.mode.includes("Krisis") ? (
                    <AlertTriangle size={14} />
                  ) : (
                    <Activity size={14} />
                  )}
                  {data.mode}
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* LEFT/CENTER COLUMN: Flows & Maps */}
            <div className="xl:col-span-2 space-y-6">
              {/* 1. SANKEY DIAGRAM (INDUSTRIAL SYSTEM LAYER) */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <ArrowRightLeft size={18} className="text-emerald-600" />{" "}
                      Aliran Industri & Distribusi CPO
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Rantai Pasok Industri Nasional (Juta Ton/Tahun)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-800">
                      {data.cpoTotal}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">Jt Ton</span>
                  </div>
                </div>

                {/* SVG Flow */}
                <div className="w-full h-[300px] relative">
                  <svg viewBox="0 0 1000 320" className="w-full h-full">
                    {/* Jalur: Hulu -> PKS */}
                    <SankeyPath
                      startX={120}
                      startY={160}
                      endX={230}
                      endY={160}
                      width={90}
                      color={COLORS.green}
                      opacity={0.3}
                      isHovered={
                        hoveredNode === "pks" || hoveredNode === "plantation"
                      }
                    />

                    {/* Jalur: PKS -> CPO */}
                    <SankeyPath
                      startX={360}
                      startY={160}
                      endX={470}
                      endY={160}
                      width={100}
                      color={COLORS.slate[400]}
                      opacity={0.4}
                      isHovered={hoveredNode === "cpo" || hoveredNode === "pks"}
                    />

                    {/* Jalur: CPO -> Sektor */}
                    <SankeyPath
                      startX={570}
                      startY={160}
                      endX={730}
                      endY={60}
                      width={(foodPct / 100) * 160}
                      color={COLORS.yellow}
                      opacity={0.4}
                      isHovered={
                        hoveredNode === "food" || hoveredNode === "cpo"
                      }
                    />
                    <SankeyPath
                      startX={570}
                      startY={160}
                      endX={730}
                      endY={160}
                      width={(energyPct / 100) * 160}
                      color={COLORS.orange}
                      opacity={0.4}
                      isHovered={
                        hoveredNode === "energy" || hoveredNode === "cpo"
                      }
                    />
                    <SankeyPath
                      startX={570}
                      startY={160}
                      endX={730}
                      endY={260}
                      width={(exportPct / 100) * 160}
                      color={COLORS.blue}
                      opacity={0.4}
                      isHovered={
                        hoveredNode === "export" || hoveredNode === "cpo"
                      }
                    />

                    {/* Node: Hulu */}
                    <g
                      onMouseEnter={() => setHoveredNode("plantation")}
                      onMouseLeave={() => setHoveredNode(null)}
                      className="cursor-pointer"
                    >
                      <rect
                        x="20"
                        y={110}
                        width="100"
                        height="100"
                        rx="8"
                        fill={COLORS.green}
                        opacity={
                          hoveredNode && hoveredNode !== "plantation" ? 0.5 : 1
                        }
                        className="transition-all"
                      />
                      <text
                        x="70"
                        y="155"
                        textAnchor="middle"
                        fill="white"
                        className="font-bold text-sm"
                      >
                        Hulu (TBS)
                      </text>
                      <text
                        x="70"
                        y="175"
                        textAnchor="middle"
                        fill="white"
                        className="text-[10px] opacity-80"
                      >
                        Perkebunan
                      </text>
                    </g>

                    {/* Node Baru: PKS / Refinery */}
                    <g
                      onMouseEnter={() => setHoveredNode("pks")}
                      onMouseLeave={() => setHoveredNode(null)}
                      className="cursor-pointer"
                    >
                      <rect
                        x="230"
                        y={110}
                        width="130"
                        height="100"
                        rx="8"
                        fill={COLORS.slate[700]}
                        opacity={hoveredNode && hoveredNode !== "pks" ? 0.5 : 1}
                        className="transition-all"
                      />
                      <text
                        x="295"
                        y="145"
                        textAnchor="middle"
                        fill="white"
                        className="font-bold text-sm"
                      >
                        PKS / Refinery
                      </text>
                      <text
                        x="295"
                        y="165"
                        textAnchor="middle"
                        fill="#94A3B8"
                        className="text-xs font-bold"
                      >
                        1,248 unit aktif
                      </text>
                      <text
                        x="295"
                        y="185"
                        textAnchor="middle"
                        fill="#94A3B8"
                        className="text-xs"
                      >
                        Utilisasi: 82%
                      </text>
                    </g>

                    {/* Node: CPO Output */}
                    <g
                      onMouseEnter={() => setHoveredNode("cpo")}
                      onMouseLeave={() => setHoveredNode(null)}
                      className="cursor-pointer"
                    >
                      <rect
                        x="470"
                        y="110"
                        width="100"
                        height="100"
                        rx="8"
                        fill={COLORS.slate[900]}
                        opacity={hoveredNode && hoveredNode !== "cpo" ? 0.5 : 1}
                        className="transition-all"
                      />
                      <text
                        x="520"
                        y="150"
                        textAnchor="middle"
                        fill="white"
                        className="font-bold text-sm"
                      >
                        CPO Output
                      </text>
                      <text
                        x="520"
                        y="175"
                        textAnchor="middle"
                        fill="white"
                        className="text-lg font-black"
                      >
                        {data.cpoTotal}
                      </text>
                    </g>

                    {/* Nodes: Destinasi Sektor */}
                    <g
                      onMouseEnter={() => setHoveredNode("food")}
                      onMouseLeave={() => setHoveredNode(null)}
                      className="cursor-pointer"
                    >
                      <rect
                        x="730"
                        y="20"
                        width="250"
                        height="80"
                        rx="8"
                        fill={COLORS.yellow}
                        opacity={
                          hoveredNode && hoveredNode !== "food" ? 0.5 : 1
                        }
                        className="transition-all"
                      />
                      <text
                        x="750"
                        y="45"
                        fill={COLORS.slate[800]}
                        className="font-bold text-sm"
                      >
                        Pangan Domestik
                      </text>
                      <text
                        x="960"
                        y="45"
                        textAnchor="end"
                        fill={COLORS.slate[800]}
                        className="font-black text-sm"
                      >
                        {data.allocations.food} ({foodPct.toFixed(0)}%)
                      </text>
                      <text
                        x="750"
                        y="65"
                        fill={COLORS.slate[800]}
                        className="text-[11px] opacity-75"
                      >
                        ↳ {data.subFlows.food}
                      </text>
                    </g>

                    <g
                      onMouseEnter={() => setHoveredNode("energy")}
                      onMouseLeave={() => setHoveredNode(null)}
                      className="cursor-pointer"
                    >
                      <rect
                        x="730"
                        y="120"
                        width="250"
                        height="80"
                        rx="8"
                        fill={COLORS.orange}
                        opacity={
                          hoveredNode && hoveredNode !== "energy" ? 0.5 : 1
                        }
                        className="transition-all"
                      />
                      <text
                        x="750"
                        y="145"
                        fill="white"
                        className="font-bold text-sm"
                      >
                        Energi (Biodiesel)
                      </text>
                      <text
                        x="960"
                        y="145"
                        textAnchor="end"
                        fill="white"
                        className="font-black text-sm"
                      >
                        {data.allocations.energy} ({energyPct.toFixed(0)}%)
                      </text>
                      <text
                        x="750"
                        y="165"
                        fill="white"
                        className="text-[11px] opacity-80"
                      >
                        ↳ {data.subFlows.energy}
                      </text>
                    </g>

                    <g
                      onMouseEnter={() => setHoveredNode("export")}
                      onMouseLeave={() => setHoveredNode(null)}
                      className="cursor-pointer"
                    >
                      <rect
                        x="730"
                        y="220"
                        width="250"
                        height="80"
                        rx="8"
                        fill={COLORS.blue}
                        opacity={
                          hoveredNode && hoveredNode !== "export" ? 0.5 : 1
                        }
                        className="transition-all"
                      />
                      <text
                        x="750"
                        y="245"
                        fill="white"
                        className="font-bold text-sm"
                      >
                        Pasar Ekspor
                      </text>
                      <text
                        x="960"
                        y="245"
                        textAnchor="end"
                        fill="white"
                        className="font-black text-sm"
                      >
                        {data.allocations.export} ({exportPct.toFixed(0)}%)
                      </text>
                      <text
                        x="750"
                        y="265"
                        fill="white"
                        className="text-[11px] opacity-80"
                      >
                        ↳ {data.subFlows.export}
                      </text>
                    </g>
                  </svg>
                </div>

                {/* DYNAMIC IMPACT PANEL (NASIONAL GOAL) */}
                <div className="bg-slate-900 px-6 py-4 flex flex-wrap justify-between items-center text-xs border-t border-slate-800">
                  <div className="text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                    <Activity size={16} className="text-emerald-400" /> Dampak
                    Skenario (Live):
                  </div>
                  <div className="flex gap-6">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">
                        Ketersediaan Pangan
                      </span>{" "}
                      <span className="text-sm">
                        {renderImpact(data.impacts.pangan)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">
                        Energi Biodiesel
                      </span>{" "}
                      <span className="text-sm">
                        {renderImpact(data.impacts.energi)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">
                        Ekspor
                      </span>{" "}
                      <span className="text-sm">
                        {renderImpact(data.impacts.ekspor)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">
                        Harga Minyak
                      </span>{" "}
                      <span className="text-sm">
                        {renderImpact(data.impacts.harga)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">
                        Delay Logistik
                      </span>{" "}
                      <span className="text-sm">
                        {renderImpact(data.impacts.delay)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. REAL FLOW MAP LOGISTIK (LEAFLET INTEGRATION) */}
              <div className="bg-white rounded-2xl p-0 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col">
                {/* Header Map & Legend */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 z-10 relative shadow-sm">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <MapPin size={18} className="text-blue-600" /> Flow Map
                    Distribusi Nasional
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Status Rute:
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>{" "}
                        Lancar
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>{" "}
                        Padat
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-red-600">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>{" "}
                        Kritis
                      </span>
                    </div>
                  </div>
                </div>

                {/* LEAFLET CONTAINER */}
                <div className="w-full h-[400px] relative">
                  <LeafletMapIntegration data={data} />
                </div>

                {/* Panel Rangkuman Rute di Bawah Map */}
                <div className="bg-slate-50 p-4 border-t border-slate-200 grid grid-cols-3 gap-4 relative z-10">
                  {data.mapFlows.map((flow: MapFlow) => (
                    <div
                      key={flow.id}
                      className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">
                          {flow.source} → {flow.target}
                        </p>
                        <p className="text-sm font-black text-slate-800">
                          {flow.volume}{" "}
                          <span className="text-[10px] text-slate-500 font-normal">
                            Jt Ton
                          </span>
                        </p>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          flow.status === "kritis"
                            ? "bg-red-100 text-red-700"
                            : flow.status === "padat"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {flow.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. TIMELINE STRESS TEST */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
                <div className="w-1/4">
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Proyeksi Kapasitas
                  </p>
                  <p className="text-sm font-black text-slate-800">
                    2026 - 2030
                  </p>
                </div>
                <div className="w-3/4 flex items-center justify-between relative">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 rounded-full"></div>
                  <div
                    className={`absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full transition-all duration-700 ${data.timelineState === "critical" ? "bg-red-500 w-[50%]" : "bg-emerald-500 w-full"}`}
                  ></div>
                  {["2026", "2027", "2028", "2029", "2030"].map((year, idx) => (
                    <div
                      key={year}
                      className="relative z-10 flex flex-col items-center"
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-4 border-white shadow-sm ${
                          data.timelineState === "critical" && idx >= 2
                            ? "bg-red-500"
                            : "bg-emerald-500"
                        }`}
                      ></div>
                      <span
                        className={`text-[10px] mt-1 font-bold ${data.timelineState === "critical" && idx === 2 ? "text-red-600" : "text-slate-500"}`}
                      >
                        {year}
                        {data.timelineState === "critical" && idx === 2 && (
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 text-[9px] px-2 py-0.5 rounded shadow">
                            Overload
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Insight, Performance, AI */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <ShieldAlert
                    className={
                      data.bottlenecks.some(
                        (b: Bottleneck) => b.severity === "high",
                      )
                        ? "text-red-500"
                        : "text-amber-500"
                    }
                    size={20}
                  />
                  System Insight & Bottleneck
                </h2>
                <div className="space-y-4">
                  {data.bottlenecks.map((warn: Bottleneck, idx: number) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border ${warn.severity === "high" ? "bg-red-50/50 border-red-200" : "bg-amber-50/50 border-amber-200"}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                          {warn.region}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${warn.severity === "high" ? "bg-red-500 text-white" : "bg-amber-500 text-white"}`}
                        >
                          {warn.severity === "high" ? "Kritis" : "Waspada"}
                        </span>
                      </div>
                      <p
                        className={`text-sm font-bold mb-3 ${warn.severity === "high" ? "text-red-900" : "text-amber-900"}`}
                      >
                        {warn.issue}
                      </p>
                      <div className="grid grid-cols-3 gap-2 border-t border-slate-200/50 pt-2">
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-bold">
                            Distribusi
                          </p>
                          <p
                            className={`text-xs font-black ${warn.sysImpact.distribusi.includes("+") ? "text-red-600" : "text-slate-700"}`}
                          >
                            {warn.sysImpact.distribusi}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-bold">
                            Harga
                          </p>
                          <p
                            className={`text-xs font-black ${warn.sysImpact.harga.includes("+") ? "text-amber-600" : "text-slate-700"}`}
                          >
                            {warn.sysImpact.harga}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-bold">
                            Delay
                          </p>
                          <p
                            className={`text-xs font-black ${warn.sysImpact.delay.includes("+") ? "text-red-600" : "text-slate-700"}`}
                          >
                            {warn.sysImpact.delay}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <BarChart3 className="text-blue-600" size={20} />
                  Performa Logistik Nasional
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">
                      Supply Chain Efficiency
                    </p>
                    <p
                      className={`text-2xl font-black mt-1 ${data.performance.efficiency < 80 ? "text-red-600" : "text-emerald-600"}`}
                    >
                      {data.performance.efficiency}{" "}
                      <span className="text-sm text-slate-400">Idx</span>
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">
                      On-Time Delivery
                    </p>
                    <p
                      className={`text-2xl font-black mt-1 ${data.performance.onTime < 80 ? "text-red-600" : "text-blue-600"}`}
                    >
                      {data.performance.onTime}%
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-600">
                        Beban Infrastruktur
                      </span>
                      <span className="text-slate-800">
                        {data.timelineState === "critical"
                          ? "98% (Overload)"
                          : "72% (Aman)"}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${data.timelineState === "critical" ? "bg-red-500" : "bg-emerald-500"} transition-all duration-500`}
                        style={{
                          width:
                            data.timelineState === "critical" ? "98%" : "72%",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden border border-slate-700">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Cpu size={120} />
                </div>
                <h2 className="text-base font-bold flex items-center gap-2 mb-4 relative z-10 text-emerald-400 uppercase tracking-widest">
                  <TrendingUp size={18} /> Engine Keputusan AI
                </h2>
                <div className="relative z-10 space-y-3">
                  {data.aiRecs.map(
                    (rec: { type: string; text: string }, idx: number) => (
                      <div
                        key={idx}
                        className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-sm"
                      >
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded shadow-sm mb-2 inline-block ${
                            rec.type === "PRODUKSI"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : rec.type === "LOGISTIK"
                                ? "bg-blue-500/20 text-blue-300"
                                : "bg-purple-500/20 text-purple-300"
                          }`}
                        >
                          [ {rec.type} ]
                        </span>
                        <p className="text-sm text-slate-200 leading-snug">
                          {rec.text}
                        </p>
                      </div>
                    ),
                  )}
                  <button className="w-full mt-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-lg text-sm transition-colors shadow-lg shadow-emerald-500/20">
                    EKSEKUSI SKENARIO REKOMENDASI
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
