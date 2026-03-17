import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useState } from "react";

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
import {
  FileText,
  ShieldCheck,
  Activity,
  Globe,
  Zap,
  PackageOpen,
  AlertTriangle,
  Leaf,
  Truck,
  Download,
  Share2,
  FileSignature,
  ChevronDown,
  ChevronUp,
  Landmark,
  Info,
  CheckCircle2,
} from "lucide-react";

// Mencegah ReferenceError: tailwind is not defined
if (typeof window !== "undefined") {
  window.tailwind = window.tailwind || {};
  window.tailwind.config = window.tailwind.config || {};
}
type MetricKey = keyof typeof METRICS;
type ColorKey = "emerald" | "yellow" | "orange" | "blue";

type Metric = {
  val: number;
  label: string;
  color: ColorKey;
};

const METRICS: Record<string, Metric> = {
  produksi: { val: 47.8, label: "Produksi Nasional", color: "emerald" },
  pangan: { val: 16.3, label: "Pangan Domestik", color: "yellow" },
  energi: { val: 10.5, label: "Energi Biodiesel", color: "orange" },
  ekspor: { val: 21.0, label: "Volume Ekspor", color: "blue" },
};
export default function Laporan() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div
      className="flex h-screen overflow-hidden font-sans"
      style={{ backgroundColor: COLORS.bg, color: COLORS.text }}
    >
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto flex flex-col h-screen overflow-hidden bg-slate-50/50 relative">
        {/* HEADER */}
        <Header />
        <div className="mbg-[#F8FAFC] text-slate-800 p-4 md:p-8 font-sans flex justify-center">
          {/* Container Laporan Resmi (Maksimal Lebar Dokumen A4) */}
          <div className="w-full  flex flex-col gap-6">
            {/* ========================================================= */}
            {/* KOP LAPORAN (HEADER) */}
            {/* ========================================================= */}
            <header className="flex flex-col items-center text-center pb-6 border-b-2 border-slate-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center shadow-md">
                  <Landmark size={24} className="text-white" />
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-blue-950 tracking-tight uppercase">
                Laporan Kebijakan Kelapa Sawit Nasional
              </h1>
              <p className="text-blue-700 text-sm font-bold tracking-widest uppercase mt-2">
                Sistem Digital Twin PALMSPHERE &bull; Dokumen Strategis
              </p>
              <p className="text-slate-500 text-xs mt-2 font-medium">
                Dihasilkan secara otomatis oleh Engine Analitik Nasional |
                Tanggal Rilis:{" "}
                {new Date().toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </header>

            {/* ========================================================= */}
            {/* 1. EXECUTIVE SUMMARY */}
            {/* ========================================================= */}
            <section className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
              <div className="bg-blue-900 px-6 py-4 flex justify-between items-center">
                <h2 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                  <FileText size={18} /> Ringkasan Eksekutif
                </h2>
                <div className="bg-emerald-500/20 border border-emerald-400 text-emerald-300 px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1.5 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Status: Stabil dengan Catatan
                </div>
              </div>
              <div className="p-6 md:p-8">
                <p className="text-slate-700 leading-relaxed text-sm md:text-base font-medium text-justify mb-6">
                  Rantai pasok kelapa sawit nasional saat ini berada dalam
                  kondisi{" "}
                  <strong className="text-emerald-700">
                    stabil dan terkendali
                  </strong>
                  . Kapasitas produksi hulu terindikasi cukup untuk memenuhi
                  kebutuhan esensial negara. Namun demikian, tekanan ganda dari
                  permintaan mandatori energi dan optimalisasi nilai ekspor
                  memerlukan kalibrasi kebijakan yang presisi guna memastikan
                  stabilitas jangka panjang.
                </p>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                  <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider mb-3">
                    Temuan Utama (Key Findings):
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2
                        size={16}
                        className="text-emerald-600 flex-shrink-0 mt-0.5"
                      />
                      <span>
                        <b className="text-emerald-800">Kapasitas Produksi:</b>{" "}
                        Berjalan optimal tanpa gangguan iklim signifikan.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2
                        size={16}
                        className="text-yellow-600 flex-shrink-0 mt-0.5"
                      />
                      <span>
                        <b className="text-yellow-800">Pasokan Domestik:</b>{" "}
                        Ketersediaan aman, namun rentan terhadap fluktuasi harga
                        global.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2
                        size={16}
                        className="text-orange-600 flex-shrink-0 mt-0.5"
                      />
                      <span>
                        <b className="text-orange-800">Alokasi Energi:</b>{" "}
                        Penyerapan tinggi; realisasi program mandatori berjalan
                        sesuai target.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2
                        size={16}
                        className="text-blue-600 flex-shrink-0 mt-0.5"
                      />
                      <span>
                        <b className="text-blue-800">Status Lingkungan:</b>{" "}
                        Terkendali, dengan tingkat deforestasi yang terpantau
                        terus menurun.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ========================================================= */}
            {/* 2. NATIONAL CONDITION OVERVIEW */}
            {/* ========================================================= */}
            <section>
              <h2 className="text-sm font-black text-blue-950 uppercase tracking-widest mb-4 px-2 border-l-4 border-blue-600">
                Tinjauan Kondisi Nasional
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {(Object.keys(METRICS) as MetricKey[]).map((key) => {
                  const m = METRICS[key];
                  const Icon =
                    key === "produksi"
                      ? Leaf
                      : key === "pangan"
                        ? PackageOpen
                        : key === "energi"
                          ? Zap
                          : Globe;
                  const colorClasses = {
                    emerald:
                      "bg-emerald-50 border-emerald-200 text-emerald-900 icon-emerald",
                    yellow:
                      "bg-yellow-50 border-yellow-200 text-yellow-900 icon-yellow",
                    orange:
                      "bg-orange-50 border-orange-200 text-orange-900 icon-orange",
                    blue: "bg-blue-50 border-blue-200 text-blue-900 icon-blue",
                  };

                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-xl border shadow-sm transition-transform hover:-translate-y-1 ${colorClasses[m.color]}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase opacity-70 tracking-wider">
                          {m.label}
                        </span>
                        <Icon size={16} className="opacity-80" />
                      </div>
                      <p className="text-2xl font-black">
                        {m.val}{" "}
                        <span className="text-xs font-medium opacity-80">
                          Jt Ton
                        </span>
                      </p>
                    </div>
                  );
                })}
              </div>
              <p className="text-sm font-medium text-slate-600 px-2 italic text-justify leading-relaxed">
                * "Pasokan nasional tercukupi untuk saat ini. Akan tetapi,
                tekanan bertahap dari pemenuhan target energi (biodiesel) dan
                kuota ekspor membutuhkan penyeimbangan rasio secara cermat agar
                tidak memicu kelangkaan pada sektor pangan strategis di masa
                mendatang."
              </p>
            </section>

            {/* ========================================================= */}
            {/* 3, 4, 5. IMPACT, FUTURE OUTLOOK, ENVIRONMENT GRID */}
            {/* ========================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Policy Impact Summary */}
              <section className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-sm font-black text-blue-950 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity size={16} className="text-blue-600" /> Ringkasan
                  Dampak Kebijakan (Simulasi)
                </h2>

                <div className="space-y-4">
                  <div
                    className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:bg-white transition-colors cursor-pointer group"
                    onClick={() => toggleSection("impact1")}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xs font-black text-slate-800 uppercase">
                        Skenario Biodiesel (B40 / B50)
                      </h3>
                      {expandedSection === "impact1" ? (
                        <ChevronUp size={16} className="text-slate-400" />
                      ) : (
                        <ChevronDown
                          size={16}
                          className="text-slate-400 group-hover:text-blue-600"
                        />
                      )}
                    </div>
                    <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-4 marker:text-orange-400">
                      <li>
                        <span className="font-bold text-orange-700">
                          Positif:
                        </span>{" "}
                        Kemandirian energi meningkat drastis; penghematan devisa
                        impor migas.
                      </li>
                      <li>
                        <span className="font-bold text-slate-700">
                          Trade-off:
                        </span>{" "}
                        Alokasi CPO untuk pangan domestik akan terkoreksi minor.
                      </li>
                      {expandedSection === "impact1" && (
                        <li className="font-medium text-red-600 mt-2 animate-fadeIn">
                          Risiko Lanjutan: Volatilitas harga minyak goreng
                          berpotensi naik jika DMO tidak dikalibrasi ulang.
                        </li>
                      )}
                    </ul>
                  </div>

                  <div
                    className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:bg-white transition-colors cursor-pointer group"
                    onClick={() => toggleSection("impact2")}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xs font-black text-slate-800 uppercase">
                        Skenario Optimalisasi Ekspor
                      </h3>
                      {expandedSection === "impact2" ? (
                        <ChevronUp size={16} className="text-slate-400" />
                      ) : (
                        <ChevronDown
                          size={16}
                          className="text-slate-400 group-hover:text-blue-600"
                        />
                      )}
                    </div>
                    <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-4 marker:text-blue-400">
                      <li>
                        <span className="font-bold text-blue-700">
                          Positif:
                        </span>{" "}
                        Penerimaan devisa negara dan dana pungutan ekspor
                        maksimal.
                      </li>
                      <li>
                        <span className="font-bold text-slate-700">
                          Trade-off:
                        </span>{" "}
                        Mengurangi penyangga (buffer) pasokan CPO domestik saat
                        krisis.
                      </li>
                      {expandedSection === "impact2" && (
                        <li className="font-medium text-amber-600 mt-2 animate-fadeIn">
                          Peringatan: Kepatuhan keberlanjutan (ISPO/RSPO) wajib
                          ditingkatkan untuk menembus regulasi EUDR.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Future Outlook & Environment */}
              <div className="flex flex-col gap-6">
                {/* Future Projection Insight */}
                <section className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 p-6 text-white">
                  <h2 className="text-xs font-black text-blue-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Globe size={14} /> Proyeksi Masa Depan
                  </h2>
                  <p className="text-xs text-slate-300 mb-3 font-medium">
                    Jika trajektori kebijakan saat ini diteruskan tanpa
                    intervensi:
                  </p>
                  <ul className="text-xs space-y-2.5">
                    <li className="flex gap-2 items-start">
                      <AlertTriangle
                        size={14}
                        className="text-amber-400 flex-shrink-0 mt-0.5"
                      />{" "}
                      <span className="leading-tight">
                        Defisit pasokan domestik riil diproyeksikan mulai
                        sekitar tahun <b className="text-white">2035</b>.
                      </span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <AlertTriangle
                        size={14}
                        className="text-amber-400 flex-shrink-0 mt-0.5"
                      />{" "}
                      <span className="leading-tight">
                        Kapasitas infrastruktur logistik hub utama akan mencapai{" "}
                        <i>overload</i> pada <b className="text-white">2032</b>.
                      </span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <AlertTriangle
                        size={14}
                        className="text-amber-400 flex-shrink-0 mt-0.5"
                      />{" "}
                      <span className="leading-tight">
                        Tekanan pembukaan lahan (
                        <i className="text-slate-400">land use change</i>) akan
                        kembali meningkat signifikan.
                      </span>
                    </li>
                  </ul>
                </section>

                {/* Environmental Status */}
                <section className="bg-emerald-900 rounded-2xl shadow-sm border border-emerald-800 p-6 text-white">
                  <h2 className="text-xs font-black text-emerald-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Leaf size={14} /> Status Lingkungan
                  </h2>
                  <p className="text-xs text-emerald-100 leading-relaxed font-medium text-justify">
                    Kondisi bio-ekologis saat ini tetap terkendali. Namun,
                    pelacakan spasial menunjukkan peningkatan risiko lokal di
                    wilayah <b className="text-white">Kalimantan Barat</b> dan{" "}
                    <b className="text-white">Papua</b>. Akselerasi program{" "}
                    <i>replanting</i> (peremajaan) pada perkebunan rakyat
                    menjadi instrumen paling krusial untuk mendongkrak
                    produktivitas tanpa perlu mengorbankan luasan tutupan hutan
                    primer.
                  </p>
                </section>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 6. POLICY RECOMMENDATIONS (CORE) */}
            {/* ========================================================= */}
            <section>
              <h2 className="text-sm font-black text-blue-950 uppercase tracking-widest mb-4 px-2 border-l-4 border-blue-600">
                Rekomendasi Kebijakan Strategis
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Food Security */}
                <div className="bg-white p-5 rounded-xl border border-yellow-200 shadow-sm border-l-4 border-l-yellow-400">
                  <h3 className="text-xs font-black text-yellow-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <PackageOpen size={16} /> Ketahanan Pangan
                  </h3>
                  <ul className="text-sm text-slate-700 space-y-1.5 list-disc pl-4 marker:text-yellow-400">
                    <li>
                      Naikkan rasio DMO (Domestic Market Obligation) sebesar
                      5–10% secara berkala.
                    </li>
                    <li>
                      Terapkan intervensi stabilisasi Harga Eceran Tertinggi
                      (HET) minyak goreng secara ketat.
                    </li>
                    <li>
                      Amankan buffer stock nasional melalui penugasan BUMN
                      pangan.
                    </li>
                  </ul>
                </div>

                {/* Energy */}
                <div className="bg-white p-5 rounded-xl border border-orange-200 shadow-sm border-l-4 border-l-orange-400">
                  <h3 className="text-xs font-black text-orange-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Zap size={16} /> Transisi Energi
                  </h3>
                  <ul className="text-sm text-slate-700 space-y-1.5 list-disc pl-4 marker:text-orange-400">
                    <li>
                      Implementasikan ekspansi program biodiesel (B40/B50)
                      secara bertahap dan terukur.
                    </li>
                    <li>
                      Evaluasi ulang target akselerasi mandatori untuk
                      menghindari kanibalisasi sektor pangan.
                    </li>
                    <li>
                      Dorong riset pemanfaatan limbah POME sebagai alternatif
                      sumber energi.
                    </li>
                  </ul>
                </div>

                {/* Logistics */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-slate-400">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Truck size={16} /> Infrastruktur Logistik
                  </h3>
                  <ul className="text-sm text-slate-700 space-y-1.5 list-disc pl-4 marker:text-slate-400">
                    <li>
                      Tingkatkan kapasitas penampungan tangki timbun di
                      pelabuhan hub utama (Dumai/Belawan).
                    </li>
                    <li>
                      Optimalkan distribusi antarpulau menggunakan tol laut
                      untuk memangkas disparitas harga.
                    </li>
                    <li>
                      Lakukan digitalisasi dan pemantauan <i>bottleneck</i>{" "}
                      distribusi secara <i>real-time</i>.
                    </li>
                  </ul>
                </div>

                {/* Environment */}
                <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm border-l-4 border-l-emerald-400">
                  <h3 className="text-xs font-black text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Leaf size={16} /> Ekologi & Keberlanjutan
                  </h3>
                  <ul className="text-sm text-slate-700 space-y-1.5 list-disc pl-4 marker:text-emerald-400">
                    <li>
                      Percepat pencairan dana PSR (Peremajaan Sawit Rakyat)
                      dengan memangkas birokrasi.
                    </li>
                    <li>
                      Moratorium pembukaan lahan baru pada area konservasi dan
                      berisiko deforestasi tinggi.
                    </li>
                    <li>
                      Perkuat kewajiban sertifikasi ISPO dan pemetaan
                      ketertelusuran (<i>Traceability</i>).
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ========================================================= */}
            {/* 7. PUBLIC ASSURANCE MESSAGE (IMPORTANT) */}
            {/* ========================================================= */}
            <section className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl shadow-md p-6 md:p-8 text-white relative overflow-hidden mt-2">
              <div className="absolute right-[-20px] top-[-20px] opacity-10">
                <ShieldCheck size={150} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="text-blue-300" size={24} />
                  <h2 className="text-lg font-black uppercase tracking-widest text-blue-100">
                    Penjaminan Publik & Stabilitas
                  </h2>
                </div>

                <div className="space-y-4 text-sm md:text-base text-blue-50 leading-relaxed font-medium text-justify">
                  <p>
                    Berdasarkan hasil analisis komprehensif{" "}
                    <strong>Sistem PALMSPHERE</strong>, Pemerintah Republik
                    Indonesia menegaskan bahwa kapasitas nasional saat ini tetap{" "}
                    <strong>sangat mumpuni</strong> untuk menjaga ekuilibrium
                    antara ketersediaan pangan rakyat, ketahanan energi, dan
                    pergerakan roda ekonomi.
                  </p>
                  <p>
                    Setiap dinamika yang muncul, termasuk fluktuasi harga global
                    maupun tantangan rantai pasok lokal, dapat dimitigasi secara
                    presisi. Pemerintah telah menetapkan skenario tindakan
                    preventif yang terukur untuk melindungi daya beli
                    masyarakat.
                  </p>
                  <p>
                    Sistem peringatan dini ini menjamin bahwa seluruh keputusan
                    strategis pemerintah dilandasi oleh analisis prediktif
                    lintas-sektor dan pemantauan <i>real-time</i>. Hal ini
                    didedikasikan untuk menjamin stabilitas pasokan harian serta
                    memastikan keberlanjutan ekosistem di masa depan.
                  </p>
                </div>
              </div>
            </section>

            {/* ========================================================= */}
            {/* 8. REPORT OUTPUT ACTIONS */}
            {/* ========================================================= */}
            <section className="flex flex-col sm:flex-row gap-4 justify-end mt-4 mb-8">
              <button className="bg-white border border-slate-300 text-slate-700 font-bold text-sm px-6 py-3 rounded-xl shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                <Share2 size={16} /> Distribusikan Laporan
              </button>
              <button className="bg-blue-100 border border-blue-200 text-blue-800 font-bold text-sm px-6 py-3 rounded-xl shadow-sm hover:bg-blue-200 transition-colors flex items-center justify-center gap-2">
                <FileSignature size={16} /> Ekspor Data RPJPN
              </button>
              <button className="bg-blue-900 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md hover:bg-blue-800 transition-colors flex items-center justify-center gap-2">
                <Download size={16} /> Unduh Dokumen Resmi (PDF)
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
