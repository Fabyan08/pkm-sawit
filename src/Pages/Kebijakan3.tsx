// Komponen mock pengganti agar tidak error di environment single-file
const Sidebar = () => null;
const Header = () => null;

import type * as Leaflet from "leaflet";

import type { LeafletMouseEvent } from "leaflet";

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

import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  Droplets,
  MapPin,
  Maximize,
  Camera,
  Sprout,
  Trees,
  Cpu,
  X,
} from "lucide-react";
// Mencegah ReferenceError: tailwind is not defined
if (typeof window !== "undefined") {
  window.tailwind = window.tailwind || {};
  window.tailwind.config = window.tailwind.config || {};
}

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

// --- DATA SPASIAL MAKRO ---
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
import type { Map as LeafletMap, LayerGroup } from "leaflet";
// --- DATA DIGITAL TWIN PETAK KEBUN MIKRO (SATELLITE ZOOM) ---
const PLOTS_DATA = [
  {
    id: "PTK-01-SUMATERA",
    region: "Riau, Sumatera",
    owner: "KUD Makmur Jaya (Plasma)",
    coords: [0.5897, 101.3431] as [number, number],
    image:
      "https://images.unsplash.com/photo-1590082871874-03f16bc920e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ndvi: 0.82,
    soilMoisture: "45%",
    treeAge: 12,
    estYield: 4.2,
    status: "Optimal",
    diseaseRisk: "Rendah",
    recommendation:
      "Kondisi vegetasi sangat sehat. Lanjutkan jadwal pemupukan reguler sesuai SOP.",
  },
  {
    id: "PTK-02-KALIMANTAN",
    region: "Sanggau, Kalimantan Barat",
    owner: "PT. Global Sawit Utama",
    coords: [-0.2787, 111.4753] as [number, number],
    image:
      "https://images.unsplash.com/photo-1620023668846-95f79590837d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ndvi: 0.65,
    soilMoisture: "28%",
    treeAge: 22,
    estYield: 2.5,
    status: "Perlu Replanting",
    diseaseRisk: "Sedang (Ganoderma)",
    recommendation:
      "Pohon memasuki masa non-produktif dengan indikasi stres air. Diperlukan replanting bertahap pada blok ini.",
  },
  {
    id: "PTK-03-KALIMANTAN",
    region: "Ketapang, Kalimantan Tengah",
    owner: "Koperasi Sawit Mandiri",
    coords: [-0.35, 111.55] as [number, number],
    image:
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ndvi: 0.76,
    soilMoisture: "40%",
    treeAge: 8,
    estYield: 3.8,
    status: "Masa Pertumbuhan",
    diseaseRisk: "Rendah",
    recommendation:
      "Tanaman memasuki masa pertumbuhan eksponensial. Tingkatkan dosis pupuk NPK untuk optimalisasi buah.",
  },
];

// --- COMPONENT: MAP TOGGLE ---
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

// --- COMPONENT: LEAFLET SPATIAL IMPACT MAP ---
type Plot = (typeof PLOTS_DATA)[number];
const LeafletImpactMap = ({
  mapLayer,
  setHoveredZone,
  onPlotClick,
}: {
  mapLayer: string;

  setHoveredZone: React.Dispatch<React.SetStateAction<HoveredZone>>;
  onPlotClick: (plot: Plot) => void;
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const layerGroup = useRef<LayerGroup | null>(null);
  const plotLayerGroup = useRef<LayerGroup | null>(null);
  const baseLayer = useRef<Leaflet.TileLayer | null>(null);
  const satLayer = useRef<Leaflet.TileLayer | null>(null);
  const [isSatellite, setIsSatellite] = useState(false);

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

      const indonesiaBounds: [number, number][] = [
        [-11.0, 94.0],
        [6.0, 141.0],
      ];

      mapInstance.current = window.L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: false,
        maxBounds: indonesiaBounds,
        maxBoundsViscosity: 1.0,
        minZoom: 4,
        maxZoom: 18,
      }).setView([-2.5, 118.0], 5);

      // Define Layers
      baseLayer.current = window.L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        { maxZoom: 19 },
      );
      satLayer.current = window.L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19 },
      );

      baseLayer.current.addTo(mapInstance.current);

      layerGroup.current = window.L.layerGroup().addTo(mapInstance.current);
      plotLayerGroup.current = window.L.layerGroup();

      // Zoom listener for "Zoom to Reality"
      mapInstance.current.on("zoomend", () => {
        const map = mapInstance.current;
        if (!map) return;

        const zoom = map.getZoom();

        if (zoom >= 8) {
          setIsSatellite(true);

          if (satLayer.current && !map.hasLayer(satLayer.current)) {
            map.addLayer(satLayer.current);
            if (baseLayer.current) map.removeLayer(baseLayer.current);
          }

          if (plotLayerGroup.current && !map.hasLayer(plotLayerGroup.current)) {
            map.addLayer(plotLayerGroup.current);
            if (layerGroup.current) map.removeLayer(layerGroup.current);
          }
        } else {
          setIsSatellite(false);

          if (baseLayer.current && !map.hasLayer(baseLayer.current)) {
            map.addLayer(baseLayer.current);
            if (satLayer.current) map.removeLayer(satLayer.current);
          }

          if (layerGroup.current && !map.hasLayer(layerGroup.current)) {
            map.addLayer(layerGroup.current);
            if (plotLayerGroup.current) map.removeLayer(plotLayerGroup.current);
          }
        }
      });
    };

    const checkL = setInterval(() => {
      if (window.L) {
        initMap();
        clearInterval(checkL);
      }
    }, 200);

    return () => clearInterval(checkL);
  }, []);

  // Update Macro Layers
  useEffect(() => {
    const L = window.L;
    if (!L) return;
    if (!L || !layerGroup.current || !plotLayerGroup.current) return;

    // Clear and redraw Macro Region Bubbles
    layerGroup.current?.clearLayers();
    plotLayerGroup.current?.clearLayers();
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

      marker.on("mousemove", (e: LeafletMouseEvent) => {
        setHoveredZone({
          ...node,
          x: e.containerPoint.x,
          y: e.containerPoint.y,
        });
      });

      marker.on("mouseout", () => {
        setHoveredZone(null);
      });

      if (layerGroup.current) {
        marker.addTo(layerGroup.current);
      }
      // Radar ping animation
      if (layerGroup.current) {
        L.circleMarker([node.lat, node.lng], {
          radius: 30,
          fillColor: fill,
          color: "transparent",
          fillOpacity: 0.3,
          className: "map-radar-ping",
        }).addTo(layerGroup.current);
      }
    });

    // Generate Petak Kebun Markers (Micro View)
    plotLayerGroup.current?.clearLayers();
    PLOTS_DATA.forEach((plot) => {
      const plotHtml = `
        <div class="w-10 h-10 bg-emerald-500/80 border-2 border-white flex flex-col items-center justify-center rounded-lg shadow-2xl backdrop-blur-sm hover:scale-110 transition-transform cursor-pointer relative group">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c4-4 8-10 8-14a8 8 0 1 0-16 0c0 4 4 10 8 14z"/><circle cx="12" cy="10" r="3"/></svg>
           <div class="opacity-0 group-hover:opacity-100 absolute top-12 bg-white text-emerald-900 text-[10px] font-black px-2 py-1 rounded shadow pointer-events-none whitespace-nowrap">Lihat Petak Digital</div>
        </div>
      `;
      const plotIcon = L.divIcon({
        html: plotHtml,
        className: "",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
      if (!plotLayerGroup.current) return;

      const plotMarker = L.marker(plot.coords, { icon: plotIcon }).addTo(
        plotLayerGroup.current,
      );

      plotMarker.on("click", () => {
        onPlotClick(plot);
      });
    });
  }, [mapLayer, setHoveredZone, onPlotClick]);

  return (
    <div className="w-full h-full relative z-0 group">
      <div ref={mapRef} className="absolute inset-0 z-0"></div>

      {/* Zoom Instruction */}
      <div className="absolute top-2 left-2 z-[400] flex flex-col gap-2 pointer-events-none">
        <div className="bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-sm border border-blue-100 flex items-center gap-2">
          <Maximize size={14} className="text-emerald-600 animate-pulse" />
          <span className="text-[10px] text-blue-900 font-bold">
            Scroll untuk <b>Zoom-to-Reality</b> (Mode Petak Satelit)
          </span>
        </div>
      </div>

      {/* Satellite Indicator */}
      {isSatellite && (
        <div className="absolute bottom-6 right-2 z-[400] bg-black/60 backdrop-blur px-3 py-1.5 rounded text-white flex items-center gap-2 pointer-events-none border border-white/20">
          <Camera size={14} className="text-emerald-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">
            Live Satellite View
          </span>
        </div>
      )}

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
};

// --- DATA CARD UNTUK OVERLAY FISIOLOGIS ---
type DataCardProps = {
  icon: React.ReactElement;
  label: string;
  value: string | number;
  status: string;
  color: "emerald" | "red" | "blue" | "amber";
};

const DataCard = ({ icon, label, value, status, color }: DataCardProps) => (
  <div
    className={`p-4 rounded-xl border flex flex-col bg-${color}-50 border-${color}-200`}
  >
    <div className={`flex items-center gap-2 text-${color}-600 mb-2`}>
      {React.cloneElement(icon, { size: 16 })}
      <span className={`text-[10px] font-bold uppercase text-${color}-800`}>
        {label}
      </span>
    </div>
    <span className={`text-xl font-black text-${color}-950`}>{value}</span>
    <span className={`text-[10px] font-bold text-${color}-600 mt-1`}>
      {status}
    </span>
  </div>
);

export default function Kebijakan3() {
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

  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [mapLayer, setMapLayer] = useState("production");
  const [hoveredZone, setHoveredZone] = useState<HoveredZone>(null);

  return (
    <div
      className="flex h-screen overflow-hidden font-sans"
      style={{ backgroundColor: COLORS.bg, color: COLORS.text }}
    >
      {typeof Sidebar !== "undefined" ? <Sidebar /> : null}

      <main className="flex-1 flex flex-col overflow-y-auto h-screen bg-slate-50/50 relative">
        {typeof Header !== "undefined" ? <Header /> : null}

        <div className="min-h-screen bg-slate-100 text-blue-950 p-4 md:p-6 font-sans flex flex-col xl:flex-row gap-6 relative">
          {/* ========================================================= */}
          {/* OVERLAY MODAL (PETAK KEBUN DIGITAL TWIN) */}
          {selectedPlot && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row transform scale-100 animate-in zoom-in-95 duration-300">
                {/* Left: Image & Geo Info */}
                <div className="md:w-[45%] relative h-64 md:h-auto border-r border-slate-200">
                  <img
                    src={selectedPlot.image}
                    alt="Plot"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold border border-white/20 flex items-center gap-2">
                    <MapPin size={12} className="text-emerald-400" />{" "}
                    {selectedPlot.coords[0].toFixed(4)},{" "}
                    {selectedPlot.coords[1].toFixed(4)}
                  </div>

                  {/* Satellite Overlay Box */}
                  <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-white shadow-xl">
                    <p className="text-[10px] text-emerald-300 uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
                      <Camera size={12} /> Live Satellite Scan
                    </p>
                    <p className="text-2xl font-black tracking-tight">
                      {selectedPlot.id}
                    </p>
                    <p className="text-xs mt-1 text-slate-200">
                      {selectedPlot.owner}
                    </p>
                  </div>
                </div>

                {/* Right: Data Fisiologis */}
                <div className="md:w-[55%] p-8 flex flex-col bg-slate-50">
                  <div className="flex justify-between items-start mb-6 border-b border-slate-200 pb-4">
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <Activity className="text-emerald-500" /> Analisis
                        Fisiologis
                      </h3>
                      <p className="text-sm text-slate-500 font-bold mt-1">
                        Region:{" "}
                        <span className="text-emerald-600">
                          {selectedPlot.region}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedPlot(null)}
                      className="p-2 bg-slate-200 hover:bg-slate-300 hover:text-red-500 rounded-full text-slate-500 transition-colors shadow-inner"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Grid Data Fisiologis Petak */}
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <DataCard
                      icon={<Sprout />}
                      label="Umur Pohon"
                      value={`${selectedPlot.treeAge} Tahun`}
                      status={
                        selectedPlot.treeAge > 20
                          ? "Perlu Replanting"
                          : "Kondisi Produktif"
                      }
                      color={selectedPlot.treeAge > 20 ? "amber" : "emerald"}
                    />
                    <DataCard
                      icon={<Trees />}
                      label="Estimasi Yield"
                      value={`${selectedPlot.estYield} T/Ha`}
                      status="Kalkulasi Sensor NDVI"
                      color="blue"
                    />
                    <DataCard
                      icon={<Activity />}
                      label="Skor NDVI"
                      value={selectedPlot.ndvi}
                      status={
                        selectedPlot.ndvi < 0.7
                          ? "Vegetasi Stres"
                          : "Vegetasi Sangat Sehat"
                      }
                      color={selectedPlot.ndvi < 0.7 ? "red" : "emerald"}
                    />
                    <DataCard
                      icon={<Droplets />}
                      label="Kelembapan Tanah"
                      value={selectedPlot.soilMoisture}
                      status="Sensor IoT Aktif"
                      color="blue"
                    />
                  </div>

                  <div className="mt-6 p-5 bg-emerald-900 rounded-xl border border-emerald-700 shadow-inner text-white">
                    <p className="text-[10px] font-bold text-emerald-300 uppercase mb-2 tracking-widest flex items-center gap-1">
                      <Cpu size={14} /> Rekomendasi AI Digital Twin
                    </p>
                    <p className="text-sm text-emerald-50 font-medium leading-relaxed">
                      {selectedPlot.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col relative overflow-hidden col-span-1 md:col-span-2">
            <div className="flex justify-between items-center mb-4 z-10 flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-emerald-600" /> Peta
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

            <div className="w-full h-[400px] bg-slate-100 rounded-xl border border-slate-200 relative overflow-hidden flex shadow-inner">
              <LeafletImpactMap
                mapLayer={mapLayer}
                setHoveredZone={setHoveredZone}
                onPlotClick={setSelectedPlot}
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

              {/* REACT FLOATING TOOLTIP */}
              {hoveredZone && (
                <div
                  className="absolute bg-white/95 backdrop-blur shadow-2xl rounded-xl p-4 border border-slate-200 w-64 z-[100] pointer-events-none transition-all duration-75"
                  style={{
                    left: `${hoveredZone.x + 15}px`,
                    top: `${hoveredZone.y - 15}px`,
                    transform: "translateY(-50%)",
                  }}
                >
                  <div className="flex items-center space-x-2 mb-3 border-b border-slate-200 pb-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-slate-800">
                      Provinsi: {hoveredZone.name}
                    </h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Produksi:</span>
                      <strong className="text-slate-800">
                        {hoveredZone.prod} juta ton
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Luas Sawit:</span>
                      <strong className="text-slate-800">
                        {hoveredZone.area} juta ha
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Produktivitas:</span>
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
          </div>{" "}
          {/* ========================================================= */}
        </div>
      </main>
    </div>
  );
}
