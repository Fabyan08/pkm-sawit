import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Map,
  Activity,
  PieChart,
  Award,
  Target,
  Lightbulb,
  Download,
  Leaf,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

type MenuItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
};

const menuItems: MenuItem[] = [
  { id: "overview", label: "Overview Nasional", icon: BarChart3, path: "/" },
  { id: "map", label: "Peta Perilaku Karbon", icon: Map, path: "/map" },
  {
    id: "cbi",
    label: "Climate Behavioral Index",
    icon: Activity,
    path: "/cbi",
  },
  {
    id: "analysis",
    label: "Analisis Aktivitas",
    icon: PieChart,
    path: "/analysis",
  },
  {
    id: "leaderboard",
    label: "Leaderboard Komunitas",
    icon: Award,
    path: "/leaderboard",
  },
  {
    id: "challenge",
    label: "Monitoring Challenge",
    icon: Target,
    path: "/challenge",
  },
  {
    id: "insight",
    label: "Insight & Rekomendasi AI",
    icon: Lightbulb,
    path: "/insight",
  },
  {
    id: "export",
    label: "Data Export & Laporan",
    icon: Download,
    path: "/export",
  },
];

type SidebarProps = {
  isOpen: boolean;
};

export default function Sidebar({ isOpen }: SidebarProps) {
  return (
    <aside
      className={`bg-white border-r text-nowrap border-slate-200 transition-all duration-300 flex flex-col ${
        isOpen ? "w-64" : "w-20"
      } flex md:flex`}
    >
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="bg-emerald-500 p-2 rounded-lg">
          <Leaf className="w-6 h-6 text-white" />
        </div>
        {isOpen && (
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
            GreenSpark
          </span>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.id} className="text-nowrap">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-3 text-nowrap py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 font-semibold"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {isOpen && <span className="text-nowrap">{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
