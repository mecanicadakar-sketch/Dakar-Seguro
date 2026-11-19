import { Check, Wrench } from 'lucide-react';
import { useState } from 'react';
import { MEMBERSHIP_PLANS, PlanId, WORKSHOP_IMAGES } from '../data/membershipData';

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
            const isGold = plan.id === 'oro';
            const isSelected = selectedPlan === plan.id;

            return (
              <article
                key={plan.id}
                className={`relative overflow-hidden flex flex-col justify-between rounded-lg p-6 sm:p-7 transition-colors duration-150 ${
                  isGold
                    ? 'bg-[#0A0B0D] text-[#F5F5F2] border border-[#F5B700]/40'
                    : 'bg-white text-[#0A0B0D] border border-[#E2E2DC]'
                }`}
              >
                {isGold && (
                  <div
                    aria-hidden="true"
                    className="absolute top-0 right-0 w-32 h-16 overflow-hidden pointer-events-none"
                  >
                    <div className="w-36 h-14 checkered-flag-pattern rotate-[18deg] translate-x-5 -translate-y-4 opacity-90 border-b-2 border-[#F5B700]" />
                  </div>
                )}

                <div>
                  <div
                    className={`flex items-baseline justify-between gap-4 pb-4 border-b ${
                      isGold ? 'border-white/10' : 'border-[#EAEAE4]'
                    }`}
                  >
                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          isGold ? 'text-[#F5B700]' : 'text-[#8A6200]'
                        }`}
                      >
                        {plan.indexLabel} · {plan.tier}
                      </p>
                      <h3 className="font-display text-3xl font-bold tracking-tight mt-1">
                        {plan.name}
                      </h3>
                    </div>

                    {isSelected && (
                      <span
                        className={`text-xs font-semibold ${
                          isGold ? 'text-[#F5B700]' : 'text-[#0A0B0D] underline decoration-[#F5B700] decoration-2 underline-offset-4'
                        }`}
                      >
                        Seleccionado
                      </span>
                    )}
                  </div>

                  <div className="mt-5">
                    <p
                      className={`font-mono-tabular text-3xl sm:text-[2rem] font-semibold tracking-tight ${
                        isGold ? 'text-[#F5B700]' : 'text-[#0A0B0D]'
                      }`}
                    >
                      {plan.formattedPrice}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        isGold ? 'text-[#A6ACB5]' : 'text-[#6A6E75]'
                      }`}
                    >
                      Por mes · Por vehículo
                    </p>
                  </div>

                  <p
                    className={`mt-4 text-sm leading-relaxed ${
                      isGold ? 'text-[#C7CBD1]' : 'text-[#4A4E55]'
                    }`}
                  >
                    {plan.summary}
                  </p>

                  {plan.inheritsFrom && (
                    <p
                      className={`mt-5 text-xs font-semibold ${
                        isGold ? 'text-[#F5B700]' : 'text-[#0A0B0D]'
                      }`}
                    >
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
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isGold ? 'text-[#F5B700]' : 'text-[#B37E00]'
                          }`}
                          aria-hidden="true"
                        />
                        <span className={isGold ? 'text-[#E8EAEF]' : 'text-[#2C2F35]'}>
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-5 border-t border-current/10">
                  <button
                    type="button"
                    onClick={() => onChoosePlan(plan.id)}
                    className={`w-full py-3 px-4 rounded-md text-sm font-bold transition-colors duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5B700] ${
                      isGold
                        ? 'bg-[#F5B700] text-[#0A0B0D] hover:bg-[#FFD028]'
                        : isSelected
                          ? 'bg-[#0A0B0D] text-[#F5B700] hover:bg-[#1E2025]'
                          : 'bg-[#F0EFEA] text-[#0A0B0D] hover:bg-[#F5B700]'
                    }`}
                  >
                    Elegir {plan.name}
                  </button>
                </div>
              </article>
            );
          })}
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
