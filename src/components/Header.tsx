import React from "react";
import { Search, Bell, User } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between z-10 shrink-0 shadow-sm">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-bold text-slate-800">
          Command Center Kelapa Sawit Nasional
        </h2>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari wilayah, HGU, indikator..."
            className="pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-emerald-500 w-64"
          />
        </div>

        <div className="flex items-center space-x-4 border-l border-slate-200 pl-6 cursor-pointer">
          <Bell className="w-5 h-5 text-slate-500 hover:text-emerald-700" />

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white">
              <User className="w-4 h-4" />
            </div>

            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-800">
                Deputi Perekonomian
              </p>
              <p className="text-[10px] text-slate-500">Bappenas RI</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
