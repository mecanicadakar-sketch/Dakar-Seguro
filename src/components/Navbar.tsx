import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  viewMode: 'public' | 'admin';
  onSelectEnroll: () => void;
  onOpenAdmin: () => void;
  onNavigatePublic: (sectionId: string) => void;
}

export function Navbar({
  viewMode,
  onSelectEnroll,
  onOpenAdmin,
  onNavigatePublic,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Planes', id: 'planes' },
    { label: 'Comparador', id: 'comparador' },
    { label: 'Simulador', id: 'simulador' },
    { label: 'Reglamento', id: 'reglamento' },
    { label: 'Preguntas frecuentes', id: 'preguntas' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0A0B0D]/95 backdrop-blur-sm border-b border-white/10 text-[#F5F5F2]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 min-h-24 lg:min-h-[108px] py-2 flex items-center justify-between gap-3 lg:gap-6">
        <button
          type="button"
          onClick={() => onNavigatePublic('inicio')}
          className="flex items-center gap-3.5 sm:gap-4 whitespace-nowrap shrink-0 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5B700]"
        >
          <img
            src="/assets/aistudio/Logo-Mecanica-Dakar_fcd6213a.png"
            alt="Logo Mecánica Dakar"
            className="h-16 w-16 sm:h-[76px] sm:w-[76px] lg:h-[88px] lg:w-[88px] object-contain bg-black rounded-md shrink-0"
          />
          <span className="flex flex-col leading-none">
            <span className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-white uppercase leading-none">
              Club <span className="text-[#F5B700]">Dakar</span>
            </span>
            <span className="text-xs sm:text-sm font-semibold tracking-wider text-[#C7CBD1] uppercase mt-1">
              Membresías
            </span>
          </span>
        </button>

        <nav
          aria-label="Navegación principal"
          className="hidden lg:flex items-center gap-4 xl:gap-6 text-xs xl:text-sm font-medium text-[#D6D9DF]"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigatePublic(item.id)}
              className="whitespace-nowrap shrink-0 py-1 hover:text-[#F5B700] hover:underline hover:underline-offset-4 decoration-[#F5B700] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5B700]"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onOpenAdmin}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5B700] ${
              viewMode === 'admin'
                ? 'text-[#F5B700] underline underline-offset-4 decoration-[#F5B700]'
                : 'hover:text-[#F5B700] hover:underline hover:underline-offset-4 decoration-[#F5B700]'
            }`}
          >
            Admin
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onSelectEnroll}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold text-[#0A0B0D] bg-[#F5B700] hover:bg-[#FFD028] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5B700]"
          >
            Abonar plan
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-md border border-white/15 text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div aria-hidden="true" className="h-5 w-full checkered-flag-strip opacity-90" />

      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0A0B0D] px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onNavigatePublic(item.id);
              }}
              className="block w-full text-left py-2.5 px-2 text-base font-medium text-[#E4E6EB] hover:text-[#F5B700] transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onOpenAdmin();
            }}
            className="block w-full text-left py-2.5 px-2 text-base font-medium text-[#F5B700] hover:underline transition-colors cursor-pointer"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onSelectEnroll();
            }}
            className="w-full mt-2 px-4 py-3 text-sm font-bold text-[#0A0B0D] bg-[#F5B700] hover:bg-[#FFD028] rounded-md transition-colors cursor-pointer"
          >
            Abonar plan
          </button>
        </div>
      )}
    </header>
  );
}
