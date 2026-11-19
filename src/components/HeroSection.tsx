import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { WORKSHOP_IMAGES } from '../data/membershipData';
import { WavyCheckeredFlag } from './WavyCheckeredFlag';

interface HeroSectionProps {
  onExplorePlans: () => void;
  onViewRules: () => void;
}

export function HeroSection({ onExplorePlans, onViewRules }: HeroSectionProps) {
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const summaryMetrics = [
    {
      label: 'Modalidad',
      value: 'Membresía mensual',
      detail: 'Pago anticipado · 30 días de vigencia',
    },
    {
      label: 'Vehículos habilitados',
      value: 'Autos y camionetas',
      detail: 'Previa inspección y aceptación en taller',
    },
    {
      label: 'Cobertura territorial',
      value: 'Exclusiva en taller',
      detail: 'No incluye asistencia mecánica en ruta',
    },
    {
      label: 'Inversión inicial',
      value: 'Desde 100.000 Gs.',
      detail: 'Por mes · Por vehículo identificado',
    },
  ];

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-[#0A0B0D] text-[#F5F5F2] border-b border-white/10"
    >
      {/* Top-right wavy checkered racing flag & gold sweep matching club card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 w-[340px] sm:w-[460px] lg:w-[560px] h-[200px] sm:h-[260px] lg:h-[310px] overflow-hidden"
      >
        <WavyCheckeredFlag className="w-full h-full" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div>
              <div className="flex items-center gap-5 mb-6">
                <img
                  src="/assets/aistudio/Logo-Mecanica-Dakar_fcd6213a.png"
                  alt="Logo oficial Mecánica Dakar"
                  className="h-28 w-28 sm:h-36 sm:w-36 object-contain bg-black rounded-lg shrink-0"
                />
                <div>
                  <p className="font-display text-4xl sm:text-5xl lg:text-[3.35rem] font-bold tracking-tight text-white leading-none">
                    MECANICA <span className="text-[#F5B700]">DAKAR</span>
                  </p>
                  <p className="mt-2 text-base sm:text-lg font-semibold text-[#F5B700] tracking-wide">
                    Club de Asistencia Mecánica
                  </p>
                </div>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.06] tracking-tight text-white text-balance">
                Tu vehículo protegido. Tu tranquilidad asegurada.
              </h1>

              <p className="mt-5 text-base sm:text-lg text-[#C7CBD1] leading-relaxed max-w-xl">
                Un programa de membresía mensual diseñado para mantener tu automóvil o camioneta bajo control preventivo permanente dentro de Mecánica Dakar, con beneficios reales en escaneo, revisiones y mano de obra.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onExplorePlans}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-[#0A0B0D] bg-[#F5B700] hover:bg-[#FFD028] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5B700]"
                >
                  Ver planes de membresía
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onViewRules}
                  className="inline-flex items-center px-4 py-3 text-sm font-medium text-[#E4E6EB] hover:text-[#F5B700] underline underline-offset-4 decoration-white/30 hover:decoration-[#F5B700] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Consultar reglamento
                </button>
              </div>

              <p className="mt-4 text-xs text-[#9AA0A9] leading-relaxed">
                Afiliación por unidad mediante chapa y datos del vehículo. Todos los servicios aplican exclusivamente dentro del taller Mecánica Dakar.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 min-h-[280px] sm:min-h-[360px] lg:min-h-[430px] rounded-lg overflow-hidden border border-[#F5B700]/30 bg-[#14161A] relative">
            {!heroImgFailed ? (
              <img
                src={WORKSHOP_IMAGES.hero}
                alt="Taller Mecánica Dakar con camioneta y vehículo en diagnóstico electrónico computarizado"
                referrerPolicy="no-referrer"
                onError={() => setHeroImgFailed(true)}
                className="w-full h-full lg:h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#1C1F24] to-[#0A0B0D]">
                <ShieldCheck className="w-10 h-10 text-[#F5B700] mb-3" />
                <p className="font-display text-2xl font-bold text-white">
                  Mecánica Dakar · Taller Autorizado
                </p>
                <p className="text-sm text-[#9AA0A9] mt-1 max-w-sm">
                  Diagnóstico computarizado, mantenimiento preventivo y atención preferencial para socios del club.
                </p>
              </div>
            )}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0B0D]/85 via-[#0A0B0D]/15 to-transparent"
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4 text-xs text-[#E4E6EB]">
              <span>Taller Mecánica Dakar · Servicio en bahía</span>
              <span className="font-mono-tabular font-medium text-[#F5B700]">
                Cobertura 100% en taller
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {summaryMetrics.map((item) => (
            <div key={item.label} className="space-y-1">
              <p className="text-xs font-medium text-[#F5B700]">{item.label}</p>
              <p className="font-display text-2xl font-bold text-white tracking-tight tabular-nums">
                {item.value}
              </p>
              <p className="text-xs text-[#C7CBD1]">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom checkered racing finish border */}
      <div aria-hidden="true" className="h-6 w-full checkered-flag-strip" />
    </section>
  );
}
