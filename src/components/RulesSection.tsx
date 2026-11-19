import { useState } from 'react';
import {
  GENERAL_CONDITIONS,
  IMPORTANT_CLAUSES,
  ImportantClause,
} from '../data/membershipData';

type ClauseFilter = 'all' | ImportantClause['category'];

const CLAUSE_FILTERS: { id: ClauseFilter; label: string }[] = [
  { id: 'all', label: 'Todas (8)' },
  { id: 'alcance', label: 'Mano de obra y alcance' },
  { id: 'vigencia', label: 'Vigencia y turnos' },
  { id: 'grua', label: 'Servicio de grúa' },
];

const TIMELINE_STEPS = [
  {
    day: 'Día 0',
    title: 'Inspección y pago anticipado',
    description:
      'El vehículo ingresa a Mecánica Dakar para inspección previa, registro de chapa y abono del primer mes por adelantado.',
  },
  {
    day: 'Días 1 a 29',
    title: 'Período de carencia inicial',
    description:
      'La membresía queda registrada pero aún rige la carencia de 30 días antes de utilizar los beneficios gratuitos y descuentos.',
  },
  {
    day: 'Día 30',
    title: 'Beneficios en taller habilitados',
    description:
      'Se activan el escaneo mensual, las revisiones preventivas, cambios de focos o aceite y los descuentos en mano de obra según plan.',
  },
  {
    day: 'Día 30',
    title: 'Grúa Plan Oro habilitada',
    description:
      'Para afiliados al Plan Oro, se cumple la espera de 30 días y queda disponible 1 traslado mensual hasta 3 km hasta el taller.',
  },
];

export function RulesSection() {
  const [clauseFilter, setClauseFilter] = useState<ClauseFilter>('all');

  const filteredClauses =
    clauseFilter === 'all'
      ? IMPORTANT_CLAUSES
      : IMPORTANT_CLAUSES.filter((item) => item.category === clauseFilter);

  return (
    <section id="reglamento" className="py-16 lg:py-20 bg-white border-t border-[#E2E2DC]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[#8A6200] mb-2">
            04. Reglamento de funcionamiento
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0B0D] text-balance">
            Reglas claras para proteger al socio y cuidar la operación del taller
          </h2>
          <p className="mt-3 text-base text-[#4A4E55] leading-relaxed">
            La transparencia evita malentendidos en mostrador. Cada afiliado conoce desde el primer día los plazos de carencia, el alcance de la mano de obra y las exclusiones vigentes.
          </p>
        </div>

        {/* 4-Step Activation & Waiting Period Timeline */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIMELINE_STEPS.map((step) => (
            <div
              key={`${step.day}-${step.title}`}
              className="bg-[#0A0B0D] text-white border border-[#24272D] rounded-lg p-5"
            >
              <p className="font-mono-tabular text-xs font-semibold text-[#F5B700]">
                {step.day}
              </p>
              <h3 className="font-display text-xl font-bold text-white mt-1">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-[#C7CBD1] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Two-column layout: General Conditions Table + 8 Important Clauses */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 border border-[#E2E2DC] rounded-lg overflow-hidden bg-white">
            <div className="px-5 py-4 bg-[#0A0B0D] text-white border-b-2 border-[#F5B700]">
              <h3 className="font-display text-xl font-bold">
                Condiciones generales de la membresía
              </h3>
              <p className="text-xs text-[#F5B700] mt-0.5">
                Aplicables a Plan Básico, Platino y Oro
              </p>
            </div>
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-[#EAEAE4]">
                {GENERAL_CONDITIONS.map((row) => (
                  <tr key={row.concept} className="hover:bg-[#FAF9F5]">
                    <th
                      scope="row"
                      className="py-3.5 px-5 text-sm font-semibold text-[#0A0B0D] w-[42%]"
                    >
                      {row.concept}
                    </th>
                    <td className="py-3.5 px-5 text-sm text-[#4A4E55] tabular-nums">
                      {row.condition}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:col-span-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E2E2DC]">
              <div>
                <h3 className="font-display text-2xl font-bold text-[#0A0B0D]">
                  Otras condiciones importantes
                </h3>
                <p className="text-xs text-[#6A6E75] mt-0.5">
                  Cláusulas operativas dentro de Mecánica Dakar
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F2F2EE] rounded-lg border border-[#E5E5DF]">
                {CLAUSE_FILTERS.map((tab) => {
                  const active = clauseFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setClauseFilter(tab.id)}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredClauses.map((clause) => (
                <article
                  key={clause.number}
                  className="p-5 rounded-lg border border-[#E2E2DC] bg-[#FAF9F5]"
                >
                  <p className="font-mono-tabular text-xs font-semibold text-[#8A6200]">
                    Cláusula {clause.number}
                  </p>
                  <h4 className="text-base font-semibold text-[#0A0B0D] mt-1">
                    {clause.title}
                  </h4>
                  <p className="mt-2 text-sm text-[#4A4E55] leading-relaxed">
                    {clause.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
