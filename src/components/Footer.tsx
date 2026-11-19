interface FooterProps {
  onOpenAdmin: () => void;
  onNavigatePublic: (sectionId: string) => void;
}

export function Footer({ onOpenAdmin, onNavigatePublic }: FooterProps) {
  return (
    <footer className="bg-[#0A0B0D] text-[#C7CBD1]">
      <div aria-hidden="true" className="h-6 w-full checkered-flag-strip" />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src="/assets/aistudio/Logo-Mecanica-Dakar_fcd6213a.png"
            alt="Logo Mecánica Dakar"
            className="h-20 w-20 object-contain rounded-md bg-black shrink-0"
          />
          <div>
            <p className="font-display text-3xl font-bold text-white leading-none">
              MECANICA <span className="text-[#F5B700]">DAKAR</span>
            </p>
            <p className="text-xs text-[#F5B700] font-medium mt-1.5">
              Club de Asistencia Mecánica · Pagos y WhatsApp: +595 975 635 770
            </p>
            <p className="text-xs text-[#9AA0A9] mt-1.5">
              Servicios y beneficios válidos exclusivamente dentro del taller Mecánica Dakar. No incluye asistencia mecánica en ruta.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-[#D0D4DC]">
          <button
            type="button"
            onClick={() => onNavigatePublic('planes')}
            className="hover:text-[#F5B700] transition-colors cursor-pointer"
          >
            Planes
          </button>
          <button
            type="button"
            onClick={() => onNavigatePublic('comparador')}
            className="hover:text-[#F5B700] transition-colors cursor-pointer"
          >
            Comparador
          </button>
          <button
            type="button"
            onClick={() => onNavigatePublic('simulador')}
            className="hover:text-[#F5B700] transition-colors cursor-pointer"
          >
            Simulador
          </button>
          <button
            type="button"
            onClick={() => onNavigatePublic('reglamento')}
            className="hover:text-[#F5B700] transition-colors cursor-pointer"
          >
            Reglamento
          </button>
          <button
            type="button"
            onClick={() => onNavigatePublic('preguntas')}
            className="hover:text-[#F5B700] transition-colors cursor-pointer"
          >
            Preguntas
          </button>
          <button
            type="button"
            onClick={() => onNavigatePublic('pagos')}
            className="hover:text-[#F5B700] transition-colors cursor-pointer"
          >
            Pagos
          </button>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="hover:text-[#F5B700] transition-colors font-semibold cursor-pointer"
          >
            Panel Admin
          </button>
          <a
            href="mailto:mecanicadakar@gmail.com"
            className="font-mono-tabular text-[#F5B700] hover:underline"
          >
            mecanicadakar@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
