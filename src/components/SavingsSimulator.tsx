import { useMemo, useState } from 'react';
import { formatGuaranies, MEMBERSHIP_PLANS, PlanId } from '../data/membershipData';

interface SavingsSimulatorProps {
  onSelectPlanFromSimulator: (planId: PlanId) => void;
}

const REFERENCE_PRICES = {
  scan: 120000,
  oilChangeLabor: 85000,
  injectorClean: 280000,
  brakeInspection: 80000,
  towService: 220000,
};

export function SavingsSimulator({ onSelectPlanFromSimulator }: SavingsSimulatorProps) {
  const [vehicleClass, setVehicleClass] = useState<'auto' | 'camioneta'>('auto');
  const [scansPerYear, setScansPerYear] = useState(4);
  const [oilChangesPerYear, setOilChangesPerYear] = useState(2);
  const [injectorServicesPerYear, setInjectorServicesPerYear] = useState(1);
  const [annualLaborSpend, setAnnualLaborSpend] = useState(1200000);
  const [needsTowOnce, setNeedsTowOnce] = useState(true);

  const factor = vehicleClass === 'camioneta' ? 1.2 : 1;

  const simulation = useMemo(() => {
    const scanValue = Math.round(REFERENCE_PRICES.scan * factor);
    const oilLaborValue = Math.round(REFERENCE_PRICES.oilChangeLabor * factor);
    const injectorValue = Math.round(REFERENCE_PRICES.injectorClean * factor);
    const brakeCheckValue = Math.round(REFERENCE_PRICES.brakeInspection * factor);
    const towValue = Math.round(
      REFERENCE_PRICES.towService * (vehicleClass === 'camioneta' ? 1.15 : 1)
    );

    const results = MEMBERSHIP_PLANS.map((plan) => {
      const annualFee = plan.monthlyPriceGs * 12;

      const coveredScans = scansPerYear * scanValue;
      const coveredOilLabor = plan.hasFreeOilChangeLabor
        ? oilChangesPerYear * oilLaborValue
        : 0;
      const coveredBrakeChecks = plan.id === 'basico' ? 0 : brakeCheckValue * 2;
      const injectorSavings =
        injectorServicesPerYear * injectorValue * (plan.injectorDiscountPct / 100);
      const laborSavings = annualLaborSpend * (plan.laborDiscountPct / 100);
      const towSavings = plan.hasFreeTow && needsTowOnce ? towValue : 0;

      const totalBenefitValue = Math.round(
        coveredScans +
          coveredOilLabor +
          coveredBrakeChecks +
          injectorSavings +
          laborSavings +
          towSavings
      );

      const netDifference = totalBenefitValue - annualFee;

      return {
        plan,
        annualFee,
        totalBenefitValue,
        netDifference,
      };
    });

    const bestOption = [...results].sort(
      (a, b) => b.netDifference - a.netDifference
    )[0];
    return { results, bestOption };
  }, [
    factor,
    vehicleClass,
    scansPerYear,
    oilChangesPerYear,
    injectorServicesPerYear,
    annualLaborSpend,
    needsTowOnce,
  ]);

  return (
    <section id="simulador" className="py-16 lg:py-20 bg-[#F6F6F4]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[#8A6200] mb-2">
            03. Simulador de uso anual
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0B0D] text-balance">
            Calculá el retorno real para el socio y la sostenibilidad del taller
          </h2>
          <p className="mt-3 text-base text-[#4A4E55] leading-relaxed">
            Estimá el valor anual en mano de obra y diagnósticos preventivos según el uso habitual del vehículo. Los repuestos y lubricantes se facturan aparte a precio normal de taller.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Panel */}
          <div className="lg:col-span-5 bg-white border border-[#E2E2DC] rounded-lg p-6 space-y-6">
            <div>
              <span className="block text-xs font-semibold text-[#52565E] mb-2">
                Tipo de vehículo
              </span>
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#F2F2EE] rounded-md border border-[#E5E5DF]">
                <button
                  type="button"
                  onClick={() => setVehicleClass('auto')}
                  className={`py-2 px-3 text-xs font-semibold rounded transition-colors cursor-pointer ${
                    vehicleClass === 'auto'
                      ? 'bg-[#0A0B0D] text-[#F5B700]'
                      : 'text-[#52565E] hover:text-[#0A0B0D]'
                  }`}
                >
                  Automóvil
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleClass('camioneta')}
                  className={`py-2 px-3 text-xs font-semibold rounded transition-colors cursor-pointer ${
                    vehicleClass === 'camioneta'
                      ? 'bg-[#0A0B0D] text-[#F5B700]'
                      : 'text-[#52565E] hover:text-[#0A0B0D]'
                  }`}
                >
                  Camioneta / SUV
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <label htmlFor="scans-range" className="font-medium text-[#0A0B0D]">
                  Escaneos computarizados al año
                </label>
                <span className="font-mono-tabular font-semibold text-[#8A6200]">
                  {scansPerYear} veces
                </span>
              </div>
              <input
                id="scans-range"
                type="range"
                min={1}
                max={12}
                value={scansPerYear}
                onChange={(e) => setScansPerYear(Number(e.target.value))}
                className="w-full accent-[#E0A300] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#6A6E75] mt-1 tabular-nums">
                <span>1 al año</span>
                <span>Hasta 12 (1 por mes)</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <label htmlFor="oil-range" className="font-medium text-[#0A0B0D]">
                  Cambios de aceite al año (solo mano de obra)
                </label>
                <span className="font-mono-tabular font-semibold text-[#8A6200]">
                  {oilChangesPerYear} veces
                </span>
              </div>
              <input
                id="oil-range"
                type="range"
                min={0}
                max={4}
                value={oilChangesPerYear}
                onChange={(e) => setOilChangesPerYear(Number(e.target.value))}
                className="w-full accent-[#E0A300] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <label htmlFor="injector-range" className="font-medium text-[#0A0B0D]">
                  Limpiezas de inyectores al año
                </label>
                <span className="font-mono-tabular font-semibold text-[#8A6200]">
                  {injectorServicesPerYear} vez
                </span>
              </div>
              <input
                id="injector-range"
                type="range"
                min={0}
                max={2}
                value={injectorServicesPerYear}
                onChange={(e) => setInjectorServicesPerYear(Number(e.target.value))}
                className="w-full accent-[#E0A300] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <label htmlFor="labor-range" className="font-medium text-[#0A0B0D]">
                  Gasto anual estimado en mano de obra mecánica
                </label>
                <span className="font-mono-tabular font-semibold text-[#0A0B0D]">
                  {formatGuaranies(annualLaborSpend)}
                </span>
              </div>
              <input
                id="labor-range"
                type="range"
                min={0}
                max={4000000}
                step={200000}
                value={annualLaborSpend}
                onChange={(e) => setAnnualLaborSpend(Number(e.target.value))}
                className="w-full accent-[#E0A300] cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-[#EAEAE4]">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={needsTowOnce}
                  onChange={(e) => setNeedsTowOnce(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#0A0B0D] rounded cursor-pointer"
                />
                <span className="text-sm text-[#2C2F35]">
                  Contemplar 1 traslado urbano con grúa (hasta 3 km hacia Mecánica Dakar)
                </span>
              </label>
            </div>
          </div>

          {/* Comparison Results */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {simulation.results.map(({ plan, annualFee, totalBenefitValue, netDifference }) => {
                const isBest = simulation.bestOption.plan.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    className={`rounded-lg p-5 flex flex-col justify-between border ${
                      isBest
                        ? 'bg-[#0A0B0D] text-white border-[#F5B700]/45'
                        : 'bg-white text-[#0A0B0D] border-[#E2E2DC]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
                        {isBest && (
                          <span className="text-xs font-semibold text-[#F5B700]">
                            Mayor retorno
                          </span>
                        )}
                      </div>

                      <dl className="mt-4 space-y-3 text-xs">
                        <div className="flex items-baseline justify-between gap-2">
                          <dt className={isBest ? 'text-[#A6ACB5]' : 'text-[#6A6E75]'}>
                            Membresía 12 meses
                          </dt>
                          <dd className="font-mono-tabular font-medium">
                            {formatGuaranies(annualFee)}
                          </dd>
                        </div>
                        <div className="flex items-baseline justify-between gap-2">
                          <dt className={isBest ? 'text-[#A6ACB5]' : 'text-[#6A6E75]'}>
                            Valor en beneficios
                          </dt>
                          <dd className="font-mono-tabular font-semibold">
                            {formatGuaranies(totalBenefitValue)}
                          </dd>
                        </div>
                        <div
                          className={`pt-2.5 border-t flex items-baseline justify-between gap-2 ${
                            isBest ? 'border-white/10' : 'border-[#EAEAE4]'
                          }`}
                        >
                          <dt className={isBest ? 'text-[#E4E6EB]' : 'text-[#0A0B0D] font-medium'}>
                            Balance estimado
                          </dt>
                          <dd
                            className={`font-mono-tabular text-sm font-semibold ${
                              netDifference >= 0
                                ? isBest
                                  ? 'text-[#F5B700]'
                                  : 'text-[#15803D]'
                                : isBest
                                  ? 'text-[#FCA5A5]'
                                  : 'text-[#B91C1C]'
                            }`}
                          >
                            {netDifference >= 0 ? '+' : ''}
                            {formatGuaranies(netDifference)}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectPlanFromSimulator(plan.id)}
                      className={`mt-5 w-full py-2.5 px-3 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                        isBest
                          ? 'bg-[#F5B700] text-[#0A0B0D] hover:bg-[#FFD028]'
                          : 'bg-[#F0EFEA] text-[#0A0B0D] hover:bg-[#F5B700]'
                      }`}
                    >
                      Afiliar con {plan.name}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Workshop Margin & Value Explanation */}
            <div className="bg-white border border-[#E2E2DC] rounded-lg p-6">
              <h4 className="font-display text-xl font-bold text-[#0A0B0D]">
                Por qué este esquema protege la rentabilidad de Mecánica Dakar
              </h4>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-[#4A4E55] leading-relaxed">
                <div>
                  <p className="font-semibold text-[#0A0B0D]">
                    01. Beneficios en mano de obra controlada
                  </p>
                  <p className="mt-1">
                    Los escaneos y revisiones visuales consumen tiempo técnico acotado y generan órdenes de trabajo reales cuando detectan pastillas gastadas, baterías bajas o pérdidas de fluidos.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-[#0A0B0D]">
                    02. Repuestos, lubricantes y filtros aparte
                  </p>
                  <p className="mt-1">
                    Al bonificar la mano de obra del cambio de aceite en Platino y Oro, el cliente vuelve al taller cada servicio y compra los insumos y repuestos directamente en Mecánica Dakar.
                  </p>
                </div>
              </div>
              <p className="mt-4 pt-4 border-t border-[#EAEAE4] text-xs text-[#6A6E75]">
                Valores referenciales de cálculo estimados en Guaraníes para fines ilustrativos. El uso mensual de escaneo o revisión no es acumulable de un mes a otro.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
