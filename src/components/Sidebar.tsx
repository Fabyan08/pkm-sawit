import React from "react";
import {
  LayoutDashboard,
  Map as MapIcon,
  GitMerge,
  Sliders,
  ShieldAlert,
  FileText,
  Activity,
  Leaf,
  Clock,
  Database,
  LineChart as ChartIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";
type NavItemProps = {
  icon: React.ReactElement;
  label: string;
  to: string;
};

function NavItem({ icon, label, to }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
          isActive
            ? "bg-white/10 text-white font-semibold shadow-inner"
            : "text-emerald-100 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      {React.cloneElement(icon, { className: "w-5 h-5" })}
      <span className="text-sm">{label}</span>
    </NavLink>
  );
}
export default function Sidebar() {
  return (
    <aside
      className="w-64 flex flex-col shadow-2xl z-20"
      style={{ backgroundColor: "#1F7A63" }}
    >
      <div className="p-6 flex items-center space-x-3 text-white">
        <Leaf className="w-8 h-8 text-yellow-400" />
        <div>
          <h1 className="text-xl font-bold tracking-wider leading-tight">
            PALMSPHERE
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        <NavItem to="/" icon={<LayoutDashboard />} label="Ringkasan Nasional" />
        <NavItem to="/spasial" icon={<MapIcon />} label="Analisis Spasial" />
        <NavItem to="/alokasi" icon={<GitMerge />} label="Alokasi & Logistik" />
        <NavItem to="/kebijakan" icon={<Sliders />} label="Simulasi Kebijakan" />
        <NavItem
          to="/prediksi"
          icon={<ChartIcon />}
          label="Prediksi & Proyeksi"
        />
        <NavItem
          to="/lingkungan"
          icon={<ShieldAlert />}
          label="Pemantauan Lingkungan"
        />
        <NavItem to="/laporan" icon={<FileText />} label="Laporan Kebijakan" />
      </nav>

      <div className="p-4 border-t border-white/10 space-y-3 bg-black/10">
        <div className="flex items-start space-x-3 text-white">
          <Activity className="w-4 h-4 text-emerald-300 mt-0.5" />
          <div>
            <p className="text-[10px] text-emerald-200 uppercase tracking-wider">
              Status Sinkronisasi
            </p>
            <p className="text-xs font-semibold flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
              Real-time Active
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 text-white/80">
          <Clock className="w-4 h-4 mt-0.5 opacity-70" />
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-wider">
              Update Terakhir
            </p>
            <p className="text-xs">15 menit yang lalu</p>
          </div>
        </div>

        <div className="flex items-start space-x-3 text-white/80 pb-2">
          <Database className="w-4 h-4 mt-0.5 opacity-70" />
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-wider">
              Sumber Data Inti
            </p>
            <p className="text-[10px] leading-tight mt-0.5">
              Kementan, KLHK, ESDM, Kemendag, BIG
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
