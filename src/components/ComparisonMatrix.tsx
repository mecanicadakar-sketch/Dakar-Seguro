import { useState } from 'react';
import { COMPARISON_ROWS, ComparisonRow, PlanId } from '../data/membershipData';

type CategoryFilter = 'all' | ComparisonRow['category'];

interface ComparisonMatrixProps {
  selectedPlan: PlanId;
  onChoosePlan: (planId: PlanId) => void;
}

const CATEGORY_TABS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'Todos los beneficios' },
  { id: 'diagnostico', label: 'Diagnóstico' },
  { id: 'mantenimiento', label: 'Mantenimiento' },
  { id: 'descuentos', label: 'Descuentos' },
  { id: 'prioridad', label: 'Traslado y prioridad' },
];

export function ComparisonMatrix({ selectedPlan, onChoosePlan }: ComparisonMatrixProps) {
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const visibleRows =
    filter === 'all'
      ? COMPARISON_ROWS
      : COMPARISON_ROWS.filter((row) => row.category === filter);

  const renderCellValue = (value: string, isHighlightedCol: boolean) => {
    const isExcluded = value === 'No incluido';
    return (
      <span
        className={`text-sm tabular-nums ${
          isExcluded
            ? 'text-[#8C919A]'
            : isHighlightedCol
              ? 'font-bold text-[#0A0B0D]'
              : 'font-medium text-[#24272D]'
        }`}
      >
        {value}
      </span>
    );
  };

  return (
    <section id="comparador" className="py-16 lg:py-20 bg-white border-y border-[#E2E2DC]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-[#8A6200] mb-2">
              02. Comparativa detallada
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0B0D] text-balance">
              Alcance exacto de cada membresía dentro del taller
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Filtrar beneficios por categoría"
            className="flex flex-wrap items-center gap-1 p-1 bg-[#F2F2EE] rounded-lg border border-[#E5E5DF]"
          >
            {CATEGORY_TABS.map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#0A0B0D] text-[#F5B700]'
                      : 'text-[#52565E] hover:text-[#0A0B0D]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 overflow-x-auto border border-[#E2E2DC] rounded-lg">
          <table className="w-full min-w-[760px] text-left border-collapse">
            <thead>
              <tr className="bg-[#0A0B0D] text-white border-b border-[#25282E]">
                <th className="py-4 px-5 text-xs font-semibold text-[#C7CBD1] w-[40%]">
                  Servicio o beneficio
                </th>
                <th
                  className={`py-4 px-4 text-left w-[20%] ${
                    selectedPlan === 'basico' ? 'bg-[#1A1D22]' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onChoosePlan('basico')}
                    className="text-left group cursor-pointer"
                  >
                    <span className="block font-display text-xl font-bold text-white group-hover:text-[#F5B700] transition-colors">
                      Plan Básico
                    </span>
                    <span className="block font-mono-tabular text-xs text-[#F5B700]">
                      100.000 Gs. / mes
                    </span>
                  </button>
                </th>
                <th
                  className={`py-4 px-4 text-left w-[20%] ${
                    selectedPlan === 'platino' ? 'bg-[#1A1D22]' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onChoosePlan('platino')}
                    className="text-left group cursor-pointer"
                  >
                    <span className="block font-display text-xl font-bold text-white group-hover:text-[#F5B700] transition-colors">
                      Plan Platino
                    </span>
                    <span className="block font-mono-tabular text-xs text-[#F5B700]">
                      150.000 Gs. / mes
                    </span>
                  </button>
                </th>
                <th
                  className={`py-4 px-4 text-left w-[20%] ${
                    selectedPlan === 'oro' ? 'bg-[#1A1D22]' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onChoosePlan('oro')}
                    className="text-left group cursor-pointer"
                  >
                    <span className="block font-display text-xl font-bold text-[#F5B700] group-hover:text-[#FFD028] transition-colors">
                      Plan Oro
                    </span>
                    <span className="block font-mono-tabular text-xs text-[#F5B700] font-medium">
                      200.000 Gs. / mes
                    </span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAE4]">
              {visibleRows.map((row) => (
                <tr key={row.id} className="hover:bg-[#FAF9F5] transition-colors">
                  <td className="py-4 px-5 align-top">
                    <p className="text-sm font-semibold text-[#0A0B0D]">{row.feature}</p>
                    <p className="text-xs text-[#6A6E75] mt-0.5">{row.detail}</p>
                  </td>
                  <td
                    className={`py-4 px-4 align-top ${
                      selectedPlan === 'basico' ? 'bg-[#FFF9E6]' : ''
                    }`}
                  >
                    {renderCellValue(row.basico, selectedPlan === 'basico')}
                  </td>
                  <td
                    className={`py-4 px-4 align-top ${
                      selectedPlan === 'platino' ? 'bg-[#FFF9E6]' : ''
                    }`}
                  >
                    {renderCellValue(row.platino, selectedPlan === 'platino')}
                  </td>
                  <td
                    className={`py-4 px-4 align-top ${
                      selectedPlan === 'oro' ? 'bg-[#FFF9E6]' : ''
                    }`}
                  >
                    {renderCellValue(row.oro, selectedPlan === 'oro')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#52565E]">
          <p>
            Nota operativa: Repuestos, filtros, lubricantes y trabajos fuera del taller (auxilio en ruta) no están incluidos en ningún plan.
          </p>
          <p className="font-mono-tabular font-semibold text-[#0A0B0D] shrink-0">
            Carencia inicial: 30 días · Grúa Oro: 30 días
          </p>
        </div>
      </div>
    </section>
  );
}
