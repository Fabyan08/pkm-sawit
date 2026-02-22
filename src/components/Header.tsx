import { Menu, Bell, Search } from "lucide-react";

type HeaderProps = {
  toggleSidebar: () => void;
  title: string;
};

export default function Header({ toggleSidebar, title }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 hidden sm:block">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari data, wilayah, aktivitas..."
            className="pl-9 pr-4 py-2 bg-slate-100 rounded-full text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-64 focus:bg-white"
          />
        </div>

        <button className="relative p-2 hover:bg-slate-100 rounded-full text-slate-500">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
      </div>
    </header>
  );
}
