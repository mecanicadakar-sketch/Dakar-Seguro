import { ChevronDown, MessageCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { MembershipPlan } from '../data/membershipData';

type FaqCategory = 'todas' | 'membresia' | 'cobertura' | 'pagos';

interface FaqItem {
  id: string;
  category: Exclude<FaqCategory, 'todas'>;
  categoryLabel: string;
  question: string;
  answer: string;
}

const FAQ_CATEGORIES: { id: FaqCategory; label: string }[] = [
  { id: 'todas', label: 'Todas (9)' },
  { id: 'membresia', label: 'Membresía y bajas' },
  { id: 'cobertura', label: 'Cobertura y plazos' },
  { id: 'pagos', label: 'Pagos y beneficios' },
];

interface FaqSectionProps {
  plans: MembershipPlan[];
  onGoToPayments: () => void;
}

export function FaqSection({ plans, onGoToPayments }: FaqSectionProps) {
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('todas');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    cancelacion: true,
    'fecha-pago': true,
    transferencia: true,
  });

  const faqItems: FaqItem[] = useMemo(() => {
    const annualText = plans
      .map(
        (p) =>
          `${p.annualFreeMonths} ${
            p.annualFreeMonths === 1 ? 'mes gratis' : 'meses gratis'
          } en el Plan ${p.planLetter} (${p.name.replace('Plan ', '')})`
      )
      .join(', ');

    const towPlans = plans.filter((p) => p.hasFreeTow);
    const towLabel =
      towPlans.length > 0
        ? `Los planes ${towPlans
            .map((p) => p.name.replace('Plan ', ''))
            .join(' y ')} incluyen 1 acarreo mensual gratuito con grúa de hasta 3 km desde el punto de avería hasta el taller, sujeto a coordinación previa.`
        : 'Actualmente el servicio de grúa requiere coordinación directa en taller.';

    return [
      {
        id: 'cancelacion',
        category: 'membresia',
        categoryLabel: 'Membresía y bajas',
        question: '¿Cómo cancelo o doy de baja mi membresía?',
        answer:
          'La membresía es mensual y los pagos deben realizarse del 1 al 5 de cada mes de manera anticipada, sin contratos de permanencia ni penalidades. Para cancelar, simplemente no renovás el próximo período o avisás por WhatsApp al +595 975 635 770 antes del vencimiento para registrar la baja. Los beneficios del mes ya abonado continúan activos hasta completar los 30 días vigentes.',
      },
      {
        id: 'fecha-pago',
        category: 'membresia',
        categoryLabel: 'Membresía y bajas',
        question: '¿En qué días del mes deben realizarse los pagos?',
        answer:
          'Los pagos mensuales de la membresía deben realizarse del 1 al 5 de cada mes al +595 975 635 770. Abonando dentro de esa fecha mantenés tu cobertura y beneficios en taller activos sin interrupciones.',
      },
      {
        id: 'transferencia',
        category: 'membresia',
        categoryLabel: 'Membresía y bajas',
        question: '¿Puedo transferir mi membresía a otro vehículo o a otra persona?',
        answer:
          'No. Cada membresía es personal e intransferible y cubre únicamente un vehículo específico, identificado por su número de chapa y datos registrados en el taller al momento del alta. Si vendés o cambiás de vehículo, debés registrar una nueva afiliación para la nueva unidad con sus datos y chapa correspondientes.',
      },
      {
        id: 'carencias',
        category: 'cobertura',
        categoryLabel: 'Cobertura y plazos',
        question: '¿Cuándo quedan habilitados los beneficios y la grúa después de pagar?',
        answer:
          'El Día 0 se cargan los datos del cliente y del vehículo junto con el primer pago anticipado. Rige una carencia inicial de 30 días; desde el Día 30 en adelante quedan habilitados el escaneo mensual, las revisiones preventivas, cambios de focos o aceite y descuentos en mano de obra según el plan. Para los planes con grúa incluida, el acarreo mensual gratuito (hasta 3 km hasta el taller) se habilita desde el Día 60 en adelante.',
      },
      {
        id: 'adelantado',
        category: 'pagos',
        categoryLabel: 'Pagos y beneficios',
        question: '¿Qué beneficios tengo si pago 3 meses, 6 meses o el año completo anticipado?',
        answer: `Abonando 3 meses por adelantado accedés a un bono de descuento de 50.000 Gs. en mano de obra en mecánica; abonando 6 meses por adelantado, a un bono de 100.000 Gs. en mano de obra. Además, pagando el año completo anticipado recibís ${annualText}.`,
      },
      {
        id: 'repuestos',
        category: 'cobertura',
        categoryLabel: 'Cobertura y plazos',
        question: '¿Los planes incluyen repuestos, focos, filtros o lubricantes?',
        answer:
          'No. Todos los servicios gratuitos incluidos en las membresías (escaneo computarizado, revisiones preventivas, cambio de focos y mano de obra de cambio de aceite en Platino y Oro) cubren exclusivamente la mano de obra dentro de Mecánica Dakar. Repuestos, filtros, focos y lubricantes corren por cuenta del socio.',
      },
      {
        id: 'ruta',
        category: 'cobertura',
        categoryLabel: 'Cobertura y plazos',
        question: '¿Incluye auxilio mecánico en ruta o reparaciones a domicilio?',
        answer: `No. La cobertura de los tres planes aplica exclusivamente dentro de las instalaciones del taller Mecánica Dakar y no contempla asistencia mecánica en ruta ni trabajos a domicilio. ${towLabel}`,
      },
      {
        id: 'acumulacion',
        category: 'pagos',
        categoryLabel: 'Pagos y beneficios',
        question: '¿Se acumulan los escaneos o revisiones si no los utilizo en el mes?',
        answer:
          'No. Los beneficios mensuales (como el escaneo computarizado y la revisión general o preventiva) corresponden a cada ciclo de 30 días abonado y no se acumulan para meses siguientes. Tampoco son acumulables con otras promociones vigentes del taller.',
      },
      {
        id: 'vencimiento-fallas',
        category: 'membresia',
        categoryLabel: 'Membresía y bajas',
        question: '¿Qué pasa si se vence mi pago o si el vehículo ya tenía una falla previa?',
        answer:
          'Los pagos deben realizarse del 1 al 5 de cada mes. Si el pago mensual no se regulariza en ese plazo o al vencer el período, los beneficios quedan pausados hasta confirmar el abono de renovación al +595 975 635 770. Además, las averías o fallas mecánicas existentes con anterioridad a la fecha de afiliación no quedan cubiertas por la membresía.',
      },
    ];
  }, [plans]);

  const filteredFaqs =
    activeCategory === 'todas'
      ? faqItems
      : faqItems.filter((item) => item.category === activeCategory);

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section id="preguntas" className="py-16 lg:py-20 bg-white border-t border-[#E2E2DC]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Header, Category Filters & Direct Help Card */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <p className="text-sm font-semibold text-[#8A6200] mb-2">
                05. Preguntas frecuentes
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0B0D] text-balance">
                Dudas comunes sobre tu membresía
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#4A4E55] leading-relaxed">
                Resolvé rápidamente cómo funciona la cancelación, la transferencia de unidad, los plazos de carencia y los bonos por pago adelantado.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#F2F2EE] rounded-lg border border-[#E5E5DF]">
              {FAQ_CATEGORIES.map((cat) => {
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#0A0B0D] text-[#F5B700]'
                        : 'text-[#52565E] hover:text-[#0A0B0D]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <div className="rounded-lg bg-[#0A0B0D] text-white p-5 border border-[#24272D] space-y-3">
              <p className="text-xs font-semibold text-[#F5B700]">
                Atención directa del taller
              </p>
              <p className="text-sm text-[#D0D4DC] leading-relaxed">
                ¿Tenés una consulta puntual sobre tu vehículo antes de abonar? Escribinos al{' '}
                <span className="font-mono-tabular font-semibold text-white">
                  +595 975 635 770
                </span>{' '}
                o pasá por el sector de pagos.
              </p>
              <button
                type="button"
                onClick={onGoToPayments}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-[#0A0B0D] bg-[#F5B700] hover:bg-[#FFD028] rounded-md transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                Ir a pagos y consultas
              </button>
            </div>
          </div>

          {/* Right Column: Accessible Accordion List */}
          <div className="lg:col-span-8 space-y-3">
            {filteredFaqs.map((item) => {
              const isOpen = Boolean(openIds[item.id]);
              const panelId = `faq-panel-${item.id}`;
              const buttonId = `faq-btn-${item.id}`;

              return (
                <article
                  key={item.id}
                  className={`rounded-lg border transition-colors ${
                    isOpen
                      ? 'bg-[#FAF9F5] border-[#0A0B0D]/25'
                      : 'bg-white border-[#E2E2DC] hover:border-[#C9C9C0]'
                  }`}
                >
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggleItem(item.id)}
                      className="w-full px-5 py-4 text-left flex items-start justify-between gap-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5B700] rounded-lg"
                    >
                      <div>
                        <span className="block text-[11px] font-semibold text-[#8A6200] mb-0.5">
                          {item.categoryLabel}
                        </span>
                        <span className="text-base font-semibold text-[#0A0B0D] leading-snug">
                          {item.question}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-[#0A0B0D] shrink-0 mt-1 transition-transform duration-150 ${
                          isOpen ? 'rotate-180 text-[#8A6200]' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </h3>

                  {isOpen && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="px-5 pb-5 pt-1 text-sm text-[#4A4E55] leading-relaxed border-t border-[#EAEAE4]"
                    >
                      {item.answer}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
