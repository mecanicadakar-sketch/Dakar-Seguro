import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Plus,
  RotateCcw,
  Save,
  Sliders,
  Trash2,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import {
  formatGuaranies,
  MEMBERSHIP_PLANS,
  MembershipPlan,
  PlanId,
} from '../data/membershipData';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface PlanConfigEditorProps {
  plans: MembershipPlan[];
  customizedPlanIds: Record<PlanId, boolean>;
  userUid: string;
}

export function PlanConfigEditor({
  plans,
  customizedPlanIds,
  userUid,
}: PlanConfigEditorProps) {
  const [selectedEditPlanId, setSelectedEditPlanId] = useState<PlanId>('platino');

  const activeLivePlan =
    plans.find((p) => p.id === selectedEditPlanId) ?? plans[0];

  const [priceInput, setPriceInput] = useState<string>(
    String(activeLivePlan.monthlyPriceGs)
  );
  const [annualFreeInput, setAnnualFreeInput] = useState<string>(
    String(activeLivePlan.annualFreeMonths)
  );
  const [laborPctInput, setLaborPctInput] = useState<string>(
    String(activeLivePlan.laborDiscountPct)
  );
  const [injectorPctInput, setInjectorPctInput] = useState<string>(
    String(activeLivePlan.injectorDiscountPct)
  );
  const [freeOilInput, setFreeOilInput] = useState<boolean>(
    activeLivePlan.hasFreeOilChangeLabor
  );
  const [freeTowInput, setFreeTowInput] = useState<boolean>(
    activeLivePlan.hasFreeTow
  );
  const [summaryInput, setSummaryInput] = useState<string>(
    activeLivePlan.summary
  );
  const [benefitsInput, setBenefitsInput] = useState<string[]>(
    activeLivePlan.benefits
  );
  const [newBenefitText, setNewBenefitText] = useState<string>('');

  const [saving, setSaving] = useState<boolean>(false);
  const [restoring, setRestoring] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const loadPlanIntoDraft = (plan: MembershipPlan) => {
    setPriceInput(String(plan.monthlyPriceGs));
    setAnnualFreeInput(String(plan.annualFreeMonths));
    setLaborPctInput(String(plan.laborDiscountPct));
    setInjectorPctInput(String(plan.injectorDiscountPct));
    setFreeOilInput(plan.hasFreeOilChangeLabor);
    setFreeTowInput(plan.hasFreeTow);
    setSummaryInput(plan.summary);
    setBenefitsInput([...plan.benefits]);
    setNewBenefitText('');
  };

  useEffect(() => {
    const plan = plans.find((p) => p.id === selectedEditPlanId) ?? plans[0];
    loadPlanIntoDraft(plan);
    setFeedback(null);
  }, [selectedEditPlanId, plans]);

  const handleBenefitChange = (idx: number, value: string) => {
    setBenefitsInput((prev) => prev.map((b, i) => (i === idx ? value : b)));
  };

  const handleMoveBenefit = (idx: number, direction: -1 | 1) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= benefitsInput.length) return;
    setBenefitsInput((prev) => {
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  const handleRemoveBenefit = (idx: number) => {
    if (benefitsInput.length <= 1) return;
    setBenefitsInput((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddBenefit = () => {
    const clean = newBenefitText.trim().slice(0, 200);
    if (clean.length < 2) {
      setFeedback({
        type: 'error',
        text: 'El nuevo beneficio debe tener al menos 2 caracteres.',
      });
      return;
    }
    if (benefitsInput.length >= 15) {
      setFeedback({
        type: 'error',
        text: 'Se admite un máximo de 15 beneficios por plan.',
      });
      return;
    }
    setBenefitsInput((prev) => [...prev, clean]);
    setNewBenefitText('');
    setFeedback(null);
  };

  const handleSaveConfig = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const parsedPrice = Math.round(Number(priceInput.replace(/\D/g, '')));
    const parsedAnnualFree = Math.round(Number(annualFreeInput));
    const parsedLaborPct = Math.round(Number(laborPctInput));
    const parsedInjectorPct = Math.round(Number(injectorPctInput));
    const cleanSummary = summaryInput.trim().slice(0, 300);
    const cleanBenefits = benefitsInput
      .map((item) => item.trim().slice(0, 200))
      .filter((item) => item.length >= 2)
      .slice(0, 15);

    if (
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 10000 ||
      parsedPrice > 5000000
    ) {
      setFeedback({
        type: 'error',
        text: 'El precio mensual debe estar entre 10.000 Gs. y 5.000.000 Gs.',
      });
      return;
    }
    if (
      !Number.isFinite(parsedAnnualFree) ||
      parsedAnnualFree < 0 ||
      parsedAnnualFree > 11
    ) {
      setFeedback({
        type: 'error',
        text: 'Los meses gratis por pago anual deben estar entre 0 y 11.',
      });
      return;
    }
    if (
      !Number.isFinite(parsedLaborPct) ||
      parsedLaborPct < 0 ||
      parsedLaborPct > 100
    ) {
      setFeedback({
        type: 'error',
        text: 'El porcentaje de descuento en mano de obra debe estar entre 0% y 100%.',
      });
      return;
    }
    if (
      !Number.isFinite(parsedInjectorPct) ||
      parsedInjectorPct < 0 ||
      parsedInjectorPct > 100
    ) {
      setFeedback({
        type: 'error',
        text: 'El porcentaje de descuento en limpieza de picos debe estar entre 0% y 100%.',
      });
      return;
    }
    if (cleanSummary.length < 10) {
      setFeedback({
        type: 'error',
        text: 'El resumen del plan debe tener entre 10 y 300 caracteres.',
      });
      return;
    }
    if (cleanBenefits.length < 1) {
      setFeedback({
        type: 'error',
        text: 'Agregá al menos 1 beneficio válido (mínimo 2 caracteres).',
      });
      return;
    }

    setSaving(true);
    try {
      await setDoc(doc(db, 'planConfigs', selectedEditPlanId), {
        planId: selectedEditPlanId,
        monthlyPriceGs: parsedPrice,
        annualFreeMonths: parsedAnnualFree,
        laborDiscountPct: parsedLaborPct,
        injectorDiscountPct: parsedInjectorPct,
        hasFreeOilChangeLabor: freeOilInput,
        hasFreeTow: freeTowInput,
        summary: cleanSummary,
        benefits: cleanBenefits,
        updatedByUid: userUid,
        updatedAt: serverTimestamp(),
      });

      setBenefitsInput(cleanBenefits);
      setFeedback({
        type: 'success',
        text: `Configuración de ${activeLivePlan.name} guardada y publicada en todo el sitio (${formatGuaranies(parsedPrice)}/mes).`,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: 'No se pudo guardar la configuración en Firestore.',
      });
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `planConfigs/${selectedEditPlanId}`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefaults = async () => {
    const defaultPlan =
      MEMBERSHIP_PLANS.find((p) => p.id === selectedEditPlanId) ??
      MEMBERSHIP_PLANS[0];

    setFeedback(null);
    setRestoring(true);
    try {
      if (customizedPlanIds[selectedEditPlanId]) {
        await deleteDoc(doc(db, 'planConfigs', selectedEditPlanId));
      }
      loadPlanIntoDraft(defaultPlan);
      setFeedback({
        type: 'success',
        text: `${defaultPlan.name} restaurado a sus valores base originales (${defaultPlan.formattedPrice}/mes).`,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: 'No se pudo restaurar la configuración base.',
      });
      handleFirestoreError(
        error,
        OperationType.DELETE,
        `planConfigs/${selectedEditPlanId}`
      );
    } finally {
      setRestoring(false);
    }
  };

  const previewPriceNumeric = Math.round(Number(priceInput.replace(/\D/g, '')));

  return (
    <div className="space-y-8">
      {/* Header Explanation + 3-Plan Quick Selector Cards */}
      <div className="bg-white border border-[#E2E2DC] rounded-lg p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAEAE4]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-md bg-[#0A0B0D] text-[#F5B700] flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-[#0A0B0D]">
                Configurar precios, descuentos y beneficios de los planes
              </h2>
              <p className="text-xs text-[#52565E] mt-0.5 leading-relaxed">
                Cualquier ajuste que guardes acá actualiza en tiempo real las tarjetas de planes, el comparador, el simulador de ahorro, las condiciones generales y el sector de pagos por WhatsApp.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => {
            const isActive = p.id === selectedEditPlanId;
            const isCustom = customizedPlanIds[p.id];
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedEditPlanId(p.id)}
                className={`text-left rounded-lg p-5 border-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#0A0B0D] text-white border-[#F5B700]'
                    : 'bg-[#FAF9F5] text-[#0A0B0D] border-[#E2E2DC] hover:border-[#0A0B0D]/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-bold uppercase ${
                      isActive ? 'text-[#F5B700]' : 'text-[#8A6200]'
                    }`}
                  >
                    Plan {p.planLetter} · {p.tier}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isCustom
                        ? 'bg-[#15803D] text-white'
                        : isActive
                          ? 'bg-white/10 text-[#D0D4DC]'
                          : 'bg-[#EAEAE4] text-[#52565E]'
                    }`}
                  >
                    {isCustom ? 'Personalizado' : 'Base'}
                  </span>
                </div>

                <h3 className="font-display text-2xl font-bold mt-1">
                  {p.name}
                </h3>
                <p
                  className={`font-mono-tabular text-xl font-bold mt-1 ${
                    isActive ? 'text-[#F5B700]' : 'text-[#0A0B0D]'
                  }`}
                >
                  {p.formattedPrice}
                  <span className="text-xs font-sans font-normal opacity-80">
                    {' '}
                    / mes
                  </span>
                </p>

                <div
                  className={`mt-3 pt-3 border-t text-[11px] space-y-1 ${
                    isActive
                      ? 'border-white/10 text-[#C7CBD1]'
                      : 'border-[#E5E5DF] text-[#52565E]'
                  }`}
                >
                  <p>
                    Mano de obra: <strong>{p.laborDiscountPct}%</strong> · Picos:{' '}
                    <strong>{p.injectorDiscountPct}%</strong>
                  </p>
                  <p>
                    Anual:{' '}
                    <strong>
                      {p.annualFreeMonths}{' '}
                      {p.annualFreeMonths === 1 ? 'mes gratis' : 'meses gratis'}
                    </strong>{' '}
                    · Grúa: <strong>{p.hasFreeTow ? 'Sí' : 'No'}</strong>
                  </p>
                  <p>{p.benefits.length} beneficios listados</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Plan Form */}
      <form
        onSubmit={handleSaveConfig}
        noValidate
        className="bg-white border border-[#E2E2DC] rounded-lg p-6 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAEAE4]">
          <div>
            <p className="text-xs font-semibold text-[#8A6200]">
              Editando Plan {activeLivePlan.planLetter}
            </p>
            <h3 className="font-display text-2xl font-bold text-[#0A0B0D]">
              {activeLivePlan.name} ({activeLivePlan.tier})
            </h3>
          </div>

          <button
            type="button"
            disabled={restoring}
            onClick={handleRestoreDefaults}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#4A4E55] bg-[#FAF9F5] border border-[#DCDCD5] hover:bg-[#F2F2EE] disabled:opacity-60 rounded-md transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {restoring ? 'Restaurando...' : 'Restaurar valores base'}
          </button>
        </div>

        {/* Numeric pricing and discount percentages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="cfg-price"
              className="block text-xs font-semibold text-[#0A0B0D] mb-1"
            >
              Precio mensual (Gs.)
            </label>
            <input
              id="cfg-price"
              type="number"
              min={10000}
              max={5000000}
              step={5000}
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono-tabular font-bold bg-[#FAF9F7] border border-[#DCDCD5] rounded-md focus:outline-none focus:border-[#F5B700]"
            />
            <p className="mt-1 text-[11px] font-mono-tabular text-[#8A6200]">
              Vista:{' '}
              {Number.isFinite(previewPriceNumeric) && previewPriceNumeric > 0
                ? formatGuaranies(previewPriceNumeric)
                : '---'}
            </p>
          </div>

          <div>
            <label
              htmlFor="cfg-labor-pct"
              className="block text-xs font-semibold text-[#0A0B0D] mb-1"
            >
              Descuento mano de obra (%)
            </label>
            <input
              id="cfg-labor-pct"
              type="number"
              min={0}
              max={100}
              value={laborPctInput}
              onChange={(e) => setLaborPctInput(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono-tabular font-bold bg-[#FAF9F7] border border-[#DCDCD5] rounded-md focus:outline-none focus:border-[#F5B700]"
            />
            <p className="mt-1 text-[11px] text-[#6A6E75]">
              0% a 100% en trabajos mecánicos
            </p>
          </div>

          <div>
            <label
              htmlFor="cfg-injector-pct"
              className="block text-xs font-semibold text-[#0A0B0D] mb-1"
            >
              Descuento limpieza de picos (%)
            </label>
            <input
              id="cfg-injector-pct"
              type="number"
              min={0}
              max={100}
              value={injectorPctInput}
              onChange={(e) => setInjectorPctInput(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono-tabular font-bold bg-[#FAF9F7] border border-[#DCDCD5] rounded-md focus:outline-none focus:border-[#F5B700]"
            />
            <p className="mt-1 text-[11px] text-[#6A6E75]">
              0% = No incluido en comparativa
            </p>
          </div>

          <div>
            <label
              htmlFor="cfg-annual-free"
              className="block text-xs font-semibold text-[#0A0B0D] mb-1"
            >
              Meses gratis (pago anual)
            </label>
            <input
              id="cfg-annual-free"
              type="number"
              min={0}
              max={11}
              value={annualFreeInput}
              onChange={(e) => setAnnualFreeInput(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono-tabular font-bold bg-[#FAF9F7] border border-[#DCDCD5] rounded-md focus:outline-none focus:border-[#F5B700]"
            />
            <p className="mt-1 text-[11px] text-[#6A6E75]">
              Bonificación por año anticipado
            </p>
          </div>
        </div>

        {/* Service inclusion flags */}
        <div className="p-4 rounded-md bg-[#FAF9F5] border border-[#E5E5DF] flex flex-wrap gap-6">
          <label className="inline-flex items-center gap-2.5 text-xs font-semibold text-[#0A0B0D] cursor-pointer">
            <input
              type="checkbox"
              checked={freeOilInput}
              onChange={(e) => setFreeOilInput(e.target.checked)}
              className="w-4 h-4 accent-[#0A0B0D]"
            />
            <span>Mano de obra gratuita para cambio de aceite</span>
          </label>

          <label className="inline-flex items-center gap-2.5 text-xs font-semibold text-[#0A0B0D] cursor-pointer">
            <input
              type="checkbox"
              checked={freeTowInput}
              onChange={(e) => setFreeTowInput(e.target.checked)}
              className="w-4 h-4 accent-[#0A0B0D]"
            />
            <span>Incluye 1 acarreo gratuito con grúa por mes (hasta 3 km)</span>
          </label>
        </div>

        {/* Summary */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="cfg-summary"
              className="block text-xs font-semibold text-[#0A0B0D]"
            >
              Descripción / resumen del plan
            </label>
            <span className="text-[11px] font-mono-tabular text-[#6A6E75]">
              {summaryInput.length} / 300
            </span>
          </div>
          <textarea
            id="cfg-summary"
            rows={2}
            maxLength={300}
            value={summaryInput}
            onChange={(e) => setSummaryInput(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-[#FAF9F7] border border-[#DCDCD5] rounded-md focus:outline-none focus:border-[#F5B700]"
          />
        </div>

        {/* Benefits Editable List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#0A0B0D]">
                Lista de beneficios visibles en la tarjeta del plan (
                {benefitsInput.length} / 15)
              </p>
              <p className="text-[11px] text-[#6A6E75]">
                Recordá actualizar también el texto del ítem si cambiás un porcentaje o beneficio para que coincida con la tarjeta.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {benefitsInput.map((benefit, idx) => (
              <div key={`ben-${idx}`} className="flex items-center gap-2">
                <span className="font-mono-tabular text-xs font-semibold text-[#8A6200] w-6 text-right shrink-0">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  maxLength={200}
                  value={benefit}
                  onChange={(e) => handleBenefitChange(idx, e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-[#FAF9F7] border border-[#DCDCD5] rounded-md focus:outline-none focus:border-[#F5B700]"
                />
                <button
                  type="button"
                  onClick={() => handleMoveBenefit(idx, -1)}
                  disabled={idx === 0}
                  aria-label="Subir beneficio"
                  className="w-8 h-9 inline-flex items-center justify-center rounded border border-[#DCDCD5] bg-white text-[#4A4E55] hover:bg-[#F2F2EE] disabled:opacity-35 cursor-pointer shrink-0"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveBenefit(idx, 1)}
                  disabled={idx === benefitsInput.length - 1}
                  aria-label="Bajar beneficio"
                  className="w-8 h-9 inline-flex items-center justify-center rounded border border-[#DCDCD5] bg-white text-[#4A4E55] hover:bg-[#F2F2EE] disabled:opacity-35 cursor-pointer shrink-0"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveBenefit(idx)}
                  disabled={benefitsInput.length <= 1}
                  aria-label="Eliminar beneficio"
                  className="w-8 h-9 inline-flex items-center justify-center rounded border border-[#DCDCD5] bg-white text-[#6A6E75] hover:text-[#B91C1C] hover:bg-[#FEF2F2] disabled:opacity-35 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {benefitsInput.length < 15 && (
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <input
                type="text"
                maxLength={200}
                value={newBenefitText}
                onChange={(e) => setNewBenefitText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddBenefit();
                  }
                }}
                placeholder="Escribir nuevo beneficio para agregar al plan..."
                className="flex-1 px-3 py-2 text-sm bg-white border border-[#DCDCD5] rounded-md focus:outline-none focus:border-[#F5B700]"
              />
              <button
                type="button"
                onClick={handleAddBenefit}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#0A0B0D] text-[#F5B700] hover:bg-[#1E2025] rounded-md transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar beneficio
              </button>
            </div>
          )}
        </div>

        {feedback && (
          <div
            role={feedback.type === 'error' ? 'alert' : 'status'}
            className={`p-3.5 rounded-md text-xs font-medium flex items-start gap-2 ${
              feedback.type === 'error'
                ? 'bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B]'
                : 'bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]'
            }`}
          >
            {feedback.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <div className="pt-2 border-t border-[#EAEAE4] flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-[#6A6E75]">
            Los cambios quedan guardados de forma permanente en la base de datos del club.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#F5B700] hover:bg-[#FFD028] disabled:opacity-60 text-[#0A0B0D] font-bold text-sm transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving
              ? 'Guardando y publicando...'
              : `Guardar cambios de ${activeLivePlan.name}`}
          </button>
        </div>
      </form>
    </div>
  );
}
