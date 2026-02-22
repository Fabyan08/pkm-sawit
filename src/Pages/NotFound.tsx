import React, { useEffect, useRef, useState } from "react";

// Tipe data untuk partikel molekul karbon
interface CarbonAtom {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let atoms: CarbonAtom[] = [];
    const ATOM_COUNT = 70; // Jumlah atom karbon
    const CONNECTION_DISTANCE = 150; // Jarak maksimal untuk membentuk ikatan molekul
    const MOUSE_REPULSE_RADIUS = 200; // Radius interaksi mouse

    // Fungsi untuk menyesuaikan ukuran canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Inisialisasi atom-atom karbon
    const initAtoms = () => {
      atoms = [];
      for (let i = 0; i < ATOM_COUNT; i++) {
        atoms.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          radius: Math.random() * 2 + 1.5,
          baseRadius: Math.random() * 2 + 1.5,
        });
      }
    };

    // Loop Animasi
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#05120a"; // Background hijau sangat gelap (nyaris hitam)
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update & Gambar Ikatan (Garis)
      for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
          const dx = atoms[i].x - atoms[j].x;
          const dy = atoms[i].y - atoms[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONNECTION_DISTANCE) {
            // Opacity berdasar jarak (makin dekat makin terang)
            const opacity = 1 - distance / CONNECTION_DISTANCE;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(34, 197, 94, ${opacity * 0.5})`; // Tailwind green-500
            ctx.lineWidth = 1;
            ctx.moveTo(atoms[i].x, atoms[i].y);
            ctx.lineTo(atoms[j].x, atoms[j].y);
            ctx.stroke();
          }
        }
      }

      // Update & Gambar Atom (Titik)
      atoms.forEach((atom) => {
        // Pergerakan alami
        atom.x += atom.vx;
        atom.y += atom.vy;

        // Pantulan di dinding layar
        if (atom.x <= 0 || atom.x >= canvas.width) atom.vx *= -1;
        if (atom.y <= 0 || atom.y >= canvas.height) atom.vy *= -1;

        // Interaksi Repulsi dengan Mouse
        const dxMouse = mousePos.x - atom.x;
        const dyMouse = mousePos.y - atom.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < MOUSE_REPULSE_RADIUS) {
          const force =
            (MOUSE_REPULSE_RADIUS - distMouse) / MOUSE_REPULSE_RADIUS;
          const pushX = (dxMouse / distMouse) * force * 2;
          const pushY = (dyMouse / distMouse) * force * 2;

          atom.x -= pushX;
          atom.y -= pushY;
          atom.radius = atom.baseRadius * 2; // Atom membesar saat bereaksi
        } else {
          atom.radius = atom.baseRadius; // Kembali ke ukuran normal
        }

        // Menggambar Atom
        ctx.beginPath();
        ctx.arc(atom.x, atom.y, atom.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#4ade80"; // Tailwind green-400
        ctx.fill();

        // Efek Glow/Shadow pada atom
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#22c55e";
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    // Setup awal
    resizeCanvas();
    initAtoms();
    animate();

    // Event Listeners
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos]);

  // Melacak pergerakan kursor
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: -1000, y: -1000 }); // Sembunyikan efek jika kursor keluar
  };

  return (
    <div
      className="relative min-h-screen w-full bg-[#05120a] text-green-400 overflow-hidden font-mono selection:bg-green-500/30"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Interaktif (Molekul Karbon) */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
      />

      {/* Konten Utama */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
        {/* Lencana Indikator Karbon */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/30 bg-green-950/50 text-xs text-green-300 uppercase tracking-widest backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Isotop C-14 Tidak Stabil
        </div>

        {/* Teks 404 Glow Effect */}
        <h1 className="text-[8rem] md:text-[12rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-green-300 via-green-500 to-green-900 drop-shadow-[0_0_30px_rgba(34,197,94,0.4)] select-none">
          404
        </h1>

        <h2 className="mt-4 text-2xl md:text-4xl font-semibold text-green-100 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">
          Jejak Karbon Terputus
        </h2>

        <p className="mt-4 max-w-lg text-sm md:text-base text-green-400/80 font-light leading-relaxed">
          Struktur molekul dari halaman yang Anda cari telah menguap menjadi gas
          rumah kaca atau memang tidak pernah disintesis dalam ekosistem ini.
        </p>

        {/* Tombol Interaktif */}
        <button
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={() => (window.location.href = "/")}
          className="mt-10 group relative px-8 py-3 bg-transparent overflow-hidden rounded-lg border border-green-500 text-green-400 transition-all duration-300 hover:text-[#05120a] hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-[#05120a]"
        >
          {/* Efek fill background saat hover */}
          <div
            className={`absolute inset-0 bg-green-400 transition-transform duration-300 ease-in-out origin-left ${
              isHovering ? "scale-x-100" : "scale-x-0"
            }`}
          />

          <span className="relative z-10 flex items-center gap-2 font-medium tracking-wide">
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${isHovering ? "-translate-x-1" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Kembali ke Biosfer Utama
          </span>
        </button>

        {/* Dekorasi HUD (Heads Up Display) Kiri Bawah & Kanan Bawah */}
        <div className="absolute bottom-6 left-6 text-left hidden md:block text-green-500/40 text-xs">
          <p>SYS.STAT: CRITICAL_MISS</p>
          <p>BOND_ENERGY: 0.00 kJ/mol</p>
        </div>
        <div className="absolute bottom-6 right-6 text-right hidden md:block text-green-500/40 text-xs">
          <p>LAT: --.-- / LNG: --.--</p>
          <p>TARGET_MOL: NULL</p>
        </div>
      </div>

      {/* Ambient Glow di belakang konten */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-green-500/5 rounded-full blur-[100px] pointer-events-none z-0" />
    </div>
  );
}
