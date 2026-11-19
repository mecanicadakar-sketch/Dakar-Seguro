import { ArrowRight, Check, Copy, Lock, MessageCircle, Phone } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  formatGuaranies,
  MEMBERSHIP_PLANS,
  PlanId,
} from '../data/membershipData';

interface PaymentSectionProps {
  selectedPlan: PlanId;
  onSelectPlan: (planId: PlanId) => void;
  onOpenAdmin: () => void;
}

const WHATSAPP_NUMBER_DISPLAY = '+595 975 635 770';
const WHATSAPP_NUMBER_RAW = '595975635770';

export function PaymentSection({
  selectedPlan,
  onSelectPlan,
  onOpenAdmin,
}: PaymentSectionProps) {
  const [paymentModality, setPaymentModality] = useState<'mensual' | 'anual'>('mensual');
  const [clientHint, setClientHint] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [vehicleHint, setVehicleHint] = useState('');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const activePlan = useMemo(
    () => MEMBERSHIP_PLANS.find((p) => p.id === selectedPlan) ?? MEMBERSHIP_PLANS[0],
    [selectedPlan]
  );

  const planCode = activePlan.planLetter;

  const whatsappMessage = useMemo(() => {
    const modalityLabel =
      paymentModality === 'anual'
        ? `Año completo anticipado (incluye ${activePlan.annualFreeMonths} ${
            activePlan.annualFreeMonths === 1 ? 'mes gratis' : 'meses gratis'
          })`
        : `Mensual anticipado (${activePlan.formattedPrice}/mes)`;

    const lines = [
      `Hola Mecánica Dakar, quiero abonar la membresía del Club de Asistencia Mecánica:`,
      `Plan elegido: ${activePlan.name} (Plan ${planCode})`,
      `Modalidad de pago: ${modalityLabel}`,
      clientHint.trim() ? `Titular: ${clientHint.trim()}` : null,
      clientPhone.trim() ? `Teléfono: ${clientPhone.trim()}` : null,
      vehicleHint.trim() ? `Vehículo / Chapa: ${vehicleHint.trim()}` : null,
      `Envío mis datos para realizar el pago y solicitar el registro del vehículo y emisión del N° de afiliado.`,
    ].filter(Boolean);
    return lines.join('\n');
  }, [activePlan, planCode, paymentModality, clientHint, clientPhone, vehicleHint]);

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER_RAW}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(`+${WHATSAPP_NUMBER_RAW}`);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch {
      // Clipboard blocked
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(whatsappMessage);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    } catch {
      // Clipboard blocked
    }
  };

  return (
    <section id="pagos" className="py-16 lg:py-20 bg-[#F6F6F4] border-t border-[#E2E2DC]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[#8A6200] mb-2">
            05. Sector de pagos y activación
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0B0D] text-balance">
            Aboná tu plan elegido y enviá el comprobante al taller
          </h2>
          <p className="mt-3 text-base text-[#4A4E55] leading-relaxed">
            Una vez realizado el pago y recibido el comprobante en el número{' '}
            <span className="font-mono-tabular font-semibold text-[#0A0B0D]">
              {WHATSAPP_NUMBER_DISPLAY}
            </span>
            , el personal autorizado de Mecánica Dakar registra tus datos y vehículo en el panel administrador para emitir tu N° de afiliado oficial.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Plan Selection + Payment Instructions & Proof Delivery */}
          <div className="lg:col-span-7 min-w-0 bg-white border border-[#E2E2DC] rounded-lg p-4 sm:p-7 space-y-6">
            <div>
              <span className="block text-xs font-semibold text-[#52565E] mb-2">
                1. Plan seleccionado para abonar
              </span>
              <div className="grid grid-cols-1 min-[380px]:grid-cols-3 gap-2 p-1 bg-[#F2F2EE] rounded-md border border-[#E5E5DF]">
                {MEMBERSHIP_PLANS.map((plan) => {
                  const active = selectedPlan === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => onSelectPlan(plan.id)}
                      className={`py-2.5 px-2 text-center rounded transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#0A0B0D] text-[#F5B700]'
                          : 'text-[#4A4E55] hover:text-[#0A0B0D]'
                      }`}
                    >
                      <span className="block text-xs font-semibold">
                        {plan.name} (Plan {plan.planLetter})
                      </span>
                      <span className="block font-mono-tabular text-[11px] opacity-90">
                        {formatGuaranies(plan.monthlyPriceGs)}/mes
                      </span>
                      <span className="block text-[10px] opacity-80 mt-0.5">
                        Anual: {plan.annualFreeMonths}{' '}
                        {plan.annualFreeMonths === 1 ? 'mes gratis' : 'meses gratis'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-[#52565E] mb-2">
                Modalidad de abono
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 bg-[#F2F2EE] rounded-md border border-[#E5E5DF]">
                <button
                  type="button"
                  onClick={() => setPaymentModality('mensual')}
                  className={`py-2.5 px-3 text-left rounded transition-colors cursor-pointer ${
                    paymentModality === 'mensual'
                      ? 'bg-[#0A0B0D] text-[#F5B700]'
                      : 'text-[#4A4E55] hover:text-[#0A0B0D]'
                  }`}
                >
                  <span className="block text-xs font-semibold">Pago mensual anticipado</span>
                  <span className="block font-mono-tabular text-[11px] opacity-90">
                    {activePlan.formattedPrice} · 30 días de vigencia
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentModality('anual')}
                  className={`py-2.5 px-3 text-left rounded transition-colors cursor-pointer ${
                    paymentModality === 'anual'
                      ? 'bg-[#0A0B0D] text-[#F5B700]'
                      : 'text-[#4A4E55] hover:text-[#0A0B0D]'
                  }`}
                >
                  <span className="block text-xs font-semibold">
                    Año completo anticipado · {activePlan.annualFreeMonths}{' '}
                    {activePlan.annualFreeMonths === 1 ? 'mes gratis' : 'meses gratis'}
                  </span>
                  <span className="block text-[11px] opacity-90">
                    Plan {planCode}: bonificación por pago anual completo
                  </span>
                </button>
              </div>
            </div>

            {/* Payment Box */}
            <div className="bg-[#0A0B0D] text-white rounded-lg p-4 sm:p-6 border border-[#262930] space-y-4 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-white/10">
                <div>
                  <p className="text-xs font-medium text-[#F5B700]">
                    {paymentModality === 'anual'
                      ? `Año completo anticipado · ${activePlan.name} (Plan ${planCode})`
                      : `Total mensual anticipado · ${activePlan.name} (Plan ${planCode})`}
                  </p>
                  <p className="font-mono-tabular text-2xl sm:text-3xl font-bold text-white mt-1">
                    {paymentModality === 'anual'
                      ? `${activePlan.annualFreeMonths} ${
                          activePlan.annualFreeMonths === 1 ? 'mes gratis' : 'meses gratis'
                        } incluidos`
                      : activePlan.formattedPrice}
                  </p>
                </div>
                <p className="text-xs text-[#C7CBD1]">
                  {paymentModality === 'anual'
                    ? `Cuota base: ${activePlan.formattedPrice}/mes · 1 vehículo`
                    : 'Vigencia: 30 días · 1 vehículo'}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#F5B700]">
                  2. Recepción de pagos y comprobantes
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#14161A] border border-white/10 rounded-md px-3 sm:px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Phone className="w-4 h-4 text-[#F5B700] shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-[#9AA0A9]">
                        Número oficial del administrador
                      </p>
                      <p className="font-mono-tabular text-sm sm:text-base font-bold text-white break-all">
                        {WHATSAPP_NUMBER_DISPLAY}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0A0B0D] bg-[#F5B700] hover:bg-[#FFD028] rounded transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 shrink-0" />
                    {copiedPhone ? 'Número copiado' : 'Copiar número'}
                  </button>
                </div>
              </div>

              {/* Client reference fields for the WhatsApp payment message */}
              <div className="pt-2 space-y-3">
                <p className="text-xs text-[#C7CBD1]">
                  Cargá tus datos de referencia para enviarlos por WhatsApp y coordinar el pago:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label
                      htmlFor="pay-client-hint"
                      className="block text-[11px] font-medium text-[#A6ACB5] mb-1"
                    >
                      Nombre del titular
                    </label>
                    <input
                      id="pay-client-hint"
                      type="text"
                      value={clientHint}
                      onChange={(e) => setClientHint(e.target.value)}
                      placeholder="Ej: Carlos Benítez"
                      className="w-full px-3 py-2 text-xs bg-[#14161A] text-white border border-white/15 rounded-md focus:outline-none focus:border-[#F5B700]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="pay-client-phone"
                      className="block text-[11px] font-medium text-[#A6ACB5] mb-1"
                    >
                      Número de teléfono del cliente
                    </label>
                    <input
                      id="pay-client-phone"
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="Ej: 0981 000 000"
                      className="w-full px-3 py-2 text-xs font-mono-tabular bg-[#14161A] text-white border border-white/15 rounded-md focus:outline-none focus:border-[#F5B700]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="pay-vehicle-hint"
                      className="block text-[11px] font-medium text-[#A6ACB5] mb-1"
                    >
                      Vehículo y chapa
                    </label>
                    <input
                      id="pay-vehicle-hint"
                      type="text"
                      value={vehicleHint}
                      onChange={(e) => setVehicleHint(e.target.value)}
                      placeholder="Ej: Toyota Hilux · AAXX 482"
                      className="w-full px-3 py-2 text-xs bg-[#14161A] text-white border border-white/15 rounded-md focus:outline-none focus:border-[#F5B700]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto max-w-full inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 text-sm font-bold text-[#0A0B0D] bg-[#F5B700] hover:bg-[#FFD028] rounded-md transition-colors text-center leading-snug break-words"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>Enviar datos para el pago al {WHATSAPP_NUMBER_DISPLAY}</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold text-white border border-white/20 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 shrink-0" />
                  <span>{copiedMessage ? 'Mensaje copiado' : 'Copiar texto'}</span>
                </button>
              </div>
            </div>

            {/* Important Operational Notice: Admin-only Registration */}
            <div className="p-5 rounded-lg bg-[#FAF9F5] border border-[#E2E2DC] space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-xl font-bold text-[#0A0B0D]">
                  ¿Cómo continúa después de abonar?
                </h3>
                <Lock className="w-4 h-4 text-[#8A6200] shrink-0 mt-1" aria-hidden="true" />
              </div>

              <ul className="space-y-2 text-sm text-[#4A4E55]">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#8A6200] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong className="text-[#0A0B0D]">Verificación del pago:</strong> el administrador confirma la recepción del abono en el número {WHATSAPP_NUMBER_DISPLAY}.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#8A6200] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong className="text-[#0A0B0D]">Registro exclusivo en taller:</strong> el alta del cliente, los datos del vehículo (chapa) y la emisión del N° de afiliado se cargan únicamente desde el Panel de Administrador por personal autorizado.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#8A6200] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong className="text-[#0A0B0D]">Inspección previa:</strong> todo vehículo queda habilitado tras su revisión física de ingreso en Mecánica Dakar.
                  </span>
                </li>
              </ul>

              <div className="pt-3 border-t border-[#E5E5DF] flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[#6A6E75]">
                  ¿Sos personal autorizado de Mecánica Dakar?
                </span>
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A0B0D] underline decoration-[#F5B700] decoration-2 underline-offset-4 hover:text-[#8A6200] cursor-pointer"
                >
                  Ir al Panel de Administrador
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Official Card Visual Reference */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-[#E2E2DC] rounded-lg p-5 space-y-4">
              <div>
                <p className="text-xs font-semibold text-[#8A6200]">
                  Credencial oficial · {activePlan.name} (Opción {planCode})
                </p>
                <h3 className="font-display text-2xl font-bold text-[#0A0B0D] mt-0.5">
                  Tarjeta emitida tras validar el pago
                </h3>
                <p className="text-xs text-[#4A4E55] mt-1 leading-relaxed">
                  Una vez que el administrador reciba tu pago en {WHATSAPP_NUMBER_DISPLAY}, cargará tus datos y generará tu número oficial de afiliado en esta tarjeta.
                </p>
              </div>

              <div className="relative w-full aspect-[1672/940] rounded-lg overflow-hidden border border-[#262930] bg-[#0A0B0D] select-none">
                <img
                  src="/assets/aistudio/Tarjeta_Club_Mec_nica_Dakar_ee8c3949.png"
                  alt="Modelo de tarjeta oficial Club de Asistencia Mecánica Mecánica Dakar"
                  className="w-full h-full object-cover"
                />
                {selectedPlan === 'basico' && (
                  <div
                    style={{ left: '34.3%', top: '62.7%', width: '3.6%', height: '5.8%' }}
                    className="absolute flex items-center justify-center text-[#0A0B0D] font-bold text-xs sm:text-sm"
                  >
                    ✓
                  </div>
                )}
                {selectedPlan === 'platino' && (
                  <div
                    style={{ left: '47.0%', top: '62.7%', width: '3.5%', height: '5.8%' }}
                    className="absolute flex items-center justify-center text-[#0A0B0D] font-bold text-xs sm:text-sm"
                  >
                    ✓
                  </div>
                )}
                {selectedPlan === 'oro' && (
                  <div
                    style={{ left: '59.3%', top: '62.7%', width: '3.4%', height: '5.8%' }}
                    className="absolute flex items-center justify-center text-[#0A0B0D] font-bold text-xs sm:text-sm"
                  >
                    ✓
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#EAEAE4] text-xs text-[#52565E] space-y-1.5">
                <p>
                  <strong className="text-[#0A0B0D]">Equivalencia de planes:</strong> A = Plan Básico · B = Plan Platino · C = Plan Oro.
                </p>
                <p>
                  <strong className="text-[#0A0B0D]">Cobertura:</strong> Servicios exclusivamente dentro de Mecánica Dakar. No incluye asistencia en ruta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
