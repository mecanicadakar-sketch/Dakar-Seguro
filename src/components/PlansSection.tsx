import { Check, Wrench } from 'lucide-react';
import { useState } from 'react';
import { MEMBERSHIP_PLANS, PlanId, WORKSHOP_IMAGES } from '../data/membershipData';
import { WavyCheckeredFlag } from './WavyCheckeredFlag';

interface PlansSectionProps {
  selectedPlan: PlanId;
  onChoosePlan: (planId: PlanId) => void;
}

export function PlansSection({ selectedPlan, onChoosePlan }: PlansSectionProps) {
  const [diagImgError, setDiagImgError] = useState(false);
  const [inspImgError, setInspImgError] = useState(false);

  return (
    <section id="planes" className="py-16 lg:py-20 bg-[#F6F6F4]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[#8A6200] mb-2">
            01. Los tres planes definitivos
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0B0D] text-balance">
            Tres niveles de protección mensual para tu vehículo
          </h2>
          <p className="mt-3 text-base text-[#4A4E55] leading-relaxed">
            Cada membresía cubre un vehículo identificado por chapa y ofrece control preventivo mensual, mano de obra bonificada y prioridad de atención en Mecánica Dakar.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {MEMBERSHIP_PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;

            return (
              <article
                key={plan.id}
                className={`relative overflow-hidden flex flex-col justify-between rounded-lg p-6 sm:p-7 bg-[#0A0B0D] text-[#F5F5F2] border transition-colors duration-150 ${
                  isSelected
                    ? 'border-[#F5B700] shadow-[0_0_0_1px_rgba(245,183,0,0.4)]'
                    : 'border-[#F5B700]/35'
                }`}
              >
                <div
                  aria-hidden="true"
                  className="absolute top-0 right-0 w-36 h-20 overflow-hidden pointer-events-none"
                >
                  <WavyCheckeredFlag className="w-full h-full" />
                </div>

                <div className="relative z-10">
                  <div className="pb-4 border-b border-white/10 pr-24">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold text-[#F5B700]">
                        {plan.indexLabel} · Plan {plan.planLetter} · {plan.tier}
                      </p>
                      {isSelected && (
                        <span className="text-[11px] font-semibold text-[#F5B700] underline decoration-[#F5B700] decoration-2 underline-offset-4">
                          · Seleccionado
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-3xl font-bold tracking-tight mt-1 text-white">
                      {plan.name}
                    </h3>
                  </div>

                  <div className="mt-5">
                    <p className="font-mono-tabular text-3xl sm:text-[2rem] font-semibold tracking-tight text-[#F5B700]">
                      {plan.formattedPrice}
                    </p>
                    <p className="text-xs mt-1 text-[#A6ACB5]">
                      Por mes · Por vehículo
                    </p>
                    <div className="mt-3 px-3 py-2 rounded-md bg-[#16191F] border border-[#F5B700]/45">
                      <p className="text-xs font-bold text-[#F5B700]">
                        Año completo anticipado: {plan.annualFreeMonths}{' '}
                        {plan.annualFreeMonths === 1 ? 'mes gratis' : 'meses gratis'}
                      </p>
                      <p className="text-[11px] text-[#D0D4DC] mt-0.5">
                        {plan.annualPromoText}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-[#C7CBD1]">
                    {plan.summary}
                  </p>

                  {plan.inheritsFrom && (
                    <p className="mt-5 text-xs font-semibold text-[#F5B700]">
                      {plan.inheritsFrom}
                    </p>
                  )}

                  <ul className="mt-4 space-y-2.5">
                    {plan.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="flex items-start gap-2.5 text-sm leading-snug"
                      >
                        <Check
                          className="w-4 h-4 shrink-0 mt-0.5 text-[#F5B700]"
                          aria-hidden="true"
                        />
                        <span className="text-[#E8EAEF]">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative z-10 mt-8 pt-5 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => onChoosePlan(plan.id)}
                    className="w-full py-3 px-4 rounded-md text-sm font-bold bg-[#F5B700] text-[#0A0B0D] hover:bg-[#FFD028] transition-colors duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5B700]"
                  >
                    Elegir {plan.name}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Fidelity Reward Banner matching reference box */}
        <div className="relative overflow-hidden mt-10 bg-[#0A0B0D] text-white rounded-xl border border-[#F5B700]/35 p-6 sm:p-8 text-center">
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 w-28 h-16 sm:w-44 sm:h-24 overflow-hidden pointer-events-none"
          >
            <WavyCheckeredFlag className="w-full h-full" />
          </div>

          <div className="relative z-10">
            <p className="font-display text-2xl sm:text-3xl font-bold tracking-wide text-[#F5B700] uppercase">
              ¡PREMIAMOS TU FIDELIDAD!
            </p>
            <p className="font-display text-lg sm:text-xl font-bold tracking-wider text-white uppercase mt-1">
              CLUB MECÁNICA DAKAR
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-[#23272E] border border-white/10 px-6 py-6 flex flex-col items-center justify-center">
                <p className="font-display text-3xl sm:text-4xl font-bold text-[#F5B700] leading-none">
                  3 MESES
                </p>
                <p className="text-base sm:text-lg font-bold text-white mt-2">
                  Beneficios extra
                </p>
                <p className="text-sm font-semibold text-[#F5B700] mt-2 max-w-sm leading-snug">
                  Bono de descuento de 50.000 Gs en descuento en mano de obra en mecánica.
                </p>
                <p className="text-xs sm:text-sm text-[#C7CBD1] mt-2">
                  Más ahorro y mantenimiento preventivo
                </p>
              </div>

              <div className="rounded-lg bg-gradient-to-br from-[#C8961E] to-[#9E7210] border border-[#F5B700]/50 px-6 py-6 flex flex-col items-center justify-center">
                <p className="font-display text-3xl sm:text-4xl font-bold text-white leading-none">
                  6 MESES
                </p>
                <p className="text-base sm:text-lg font-bold text-white mt-2">
                  Más beneficios
                </p>
                <p className="text-sm font-bold text-[#0A0B0D] mt-2 max-w-sm leading-snug">
                  Bono de 100.000 Gs. en descuento en mano de obra en mecánica.
                </p>
                <p className="text-xs sm:text-sm text-white/95 mt-2">
                  Mayor fidelidad, mayor recompensa
                </p>
              </div>
            </div>

            <p className="mt-6 text-base sm:text-lg font-bold text-[#F5B700]">
              ¡Cuidá tu vehículo y ahorrá con nosotros!
            </p>
            <p className="mt-1 font-display text-sm sm:text-base font-bold tracking-wider text-white uppercase">
              MECÁNICA DAKAR · TU VEHÍCULO PROTEGIDO
            </p>
          </div>
        </div>

        {/* Visual Editorial Proof Strip */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[#E2E2DC] rounded-lg overflow-hidden grid grid-cols-1 sm:grid-cols-12 items-stretch">
            <div className="sm:col-span-5 min-h-[200px] bg-[#0A0B0D]">
              {!diagImgError ? (
                <img
                  src={WORKSHOP_IMAGES.diagnostic}
                  alt="Técnico realizando escaneo computarizado OBD2 en cabina del vehículo"
                  referrerPolicy="no-referrer"
                  onError={() => setDiagImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#E4E6EB]">
                  <Wrench className="w-7 h-7 text-[#F5B700] mb-2" />
                  <span className="text-xs font-medium">Diagnóstico Electrónico</span>
                </div>
              )}
            </div>
            <div className="sm:col-span-7 p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-[#8A6200]">
                  Frecuencia mensual · Diagnóstico preventivo
                </p>
                <h3 className="font-display text-2xl font-bold text-[#0A0B0D] mt-1">
                  Detección temprana con escaneo OBD2
                </h3>
                <p className="mt-2 text-sm text-[#4A4E55] leading-relaxed">
                  El escaneo computarizado incluido lee códigos de falla y evita averías mayores. Si se detecta un componente dañado, el socio accede a su descuento exclusivo en mano de obra dentro del taller.
                </p>
              </div>
              <p className="mt-4 text-xs text-[#6A6E75] tabular-nums">
                Lectura de códigos · Sin costo en los 3 planes
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#E2E2DC] rounded-lg overflow-hidden grid grid-cols-1 sm:grid-cols-12 items-stretch">
            <div className="sm:col-span-5 min-h-[200px] bg-[#0A0B0D]">
              {!inspImgError ? (
                <img
                  src={WORKSHOP_IMAGES.inspection}
                  alt="Revisión preventiva de disco de freno, mordaza y suspensión delantera en elevador"
                  referrerPolicy="no-referrer"
                  onError={() => setInspImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#E4E6EB]">
                  <Wrench className="w-7 h-7 text-[#F5B700] mb-2" />
                  <span className="text-xs font-medium">Frenos y Suspensión</span>
                </div>
              )}
            </div>
            <div className="sm:col-span-7 p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-[#8A6200]">
                  Planes Platino y Oro · Seguridad activa
                </p>
                <h3 className="font-display text-2xl font-bold text-[#0A0B0D] mt-1">
                  Control de frenos, tren delantero y aceite
                </h3>
                <p className="mt-2 text-sm text-[#4A4E55] leading-relaxed">
                  Al bonificar la mano de obra de cambio de aceite y revisión de frenos, el cliente realiza todo su mantenimiento periódico en Mecánica Dakar mientras adquiere sus lubricantes, filtros y repuestos en el taller.
                </p>
              </div>
              <p className="mt-4 text-xs text-[#6A6E75] tabular-nums">
                Repuestos y lubricantes a cargo del socio
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
