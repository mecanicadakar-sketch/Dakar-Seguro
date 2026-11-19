export type PlanId = 'basico' | 'platino' | 'oro';

export interface MembershipPlan {
  id: PlanId;
  planLetter: 'A' | 'B' | 'C';
  indexLabel: string;
  name: string;
  tier: string;
  monthlyPriceGs: number;
  formattedPrice: string;
  annualFreeMonths: number;
  annualPromoText: string;
  inheritsFrom?: string;
  summary: string;
  benefits: string[];
  laborDiscountPct: number;
  injectorDiscountPct: number;
  hasFreeOilChangeLabor: boolean;
  hasFreeTow: boolean;
}

export interface ComparisonRow {
  id: string;
  category: 'diagnostico' | 'mantenimiento' | 'descuentos' | 'prioridad';
  feature: string;
  detail: string;
  basico: string;
  platino: string;
  oro: string;
}

export interface GeneralCondition {
  concept: string;
  condition: string;
}

export interface ImportantClause {
  number: string;
  category: 'alcance' | 'vigencia' | 'grua';
  title: string;
  body: string;
}

export const WORKSHOP_IMAGES = {
  hero: '/src/assets/images/hero_dakar_workshop_1795086235058.jpg',
  diagnostic: '/src/assets/images/diagnostic_scan_detail_1795086235355.jpg',
  inspection: '/src/assets/images/preventive_brake_inspection_1795086235435.jpg',
};

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'basico',
    planLetter: 'A',
    indexLabel: '01',
    name: 'Plan Básico',
    tier: 'Inicial',
    monthlyPriceGs: 100000,
    formattedPrice: '100.000 Gs.',
    annualFreeMonths: 1,
    annualPromoText: '1 mes gratis pagando el año completo anticipado',
    summary:
      'Control preventivo mensual y diagnóstico electrónico para mantener el vehículo monitoreado sin sorpresas.',
    benefits: [
      'Escaneo computarizado gratuito: 1 por mes.',
      'Revisión mecánica general gratuita: 1 por mes.',
      'Mano de obra gratuita para cambio de focos.',
      '5% de descuento en mano de obra mecánica.',
      'Revisión de batería y alternador.',
      'Control de niveles de fluidos.',
      'Atención prioritaria en el taller.',
    ],
    laborDiscountPct: 5,
    injectorDiscountPct: 0,
    hasFreeOilChangeLabor: false,
    hasFreeTow: false,
  },
  {
    id: 'platino',
    planLetter: 'B',
    indexLabel: '02',
    name: 'Plan Platino',
    tier: 'Intermedio',
    monthlyPriceGs: 150000,
    formattedPrice: '150.000 Gs.',
    annualFreeMonths: 2,
    annualPromoText: '2 meses gratis pagando el año completo anticipado',
    inheritsFrom: 'Incluye todos los beneficios del Básico, más:',
    summary:
      'Pensado para quienes realizan sus servicios de mantenimiento periódico y buscan ahorro en mano de obra e inyección.',
    benefits: [
      '10% de descuento en mano de obra mecánica.',
      '20% de descuento en limpieza de inyectores.',
      'Mano de obra gratuita para cambio de aceite.',
      'Revisión de frenos gratuita.',
      'Revisión de tren delantero y suspensión.',
      'Prioridad de turnos.',
    ],
    laborDiscountPct: 10,
    injectorDiscountPct: 20,
    hasFreeOilChangeLabor: true,
    hasFreeTow: false,
  },
  {
    id: 'oro',
    planLetter: 'C',
    indexLabel: '03',
    name: 'Plan Oro',
    tier: 'Premium',
    monthlyPriceGs: 200000,
    formattedPrice: '200.000 Gs.',
    annualFreeMonths: 3,
    annualPromoText: '3 meses gratis pagando el año completo anticipado',
    inheritsFrom: 'Incluye todos los beneficios del Platino, más:',
    summary:
      'Cobertura integral en taller con revisión preventiva mensual, máximo descuento en mano de obra y traslado mensual con grúa.',
    benefits: [
      '15% de descuento en mano de obra mecánica.',
      '20% de descuento en limpieza de inyectores.',
      'Una revisión preventiva mensual.',
      'Un traslado gratuito con grúa por mes, hasta 3 km, desde el lugar de avería hasta Mecánica Dakar.',
      'Atención preferencial.',
      'Prioridad en coordinación del servicio de grúa.',
    ],
    laborDiscountPct: 15,
    injectorDiscountPct: 20,
    hasFreeOilChangeLabor: true,
    hasFreeTow: true,
  },
];

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    id: 'scan',
    category: 'diagnostico',
    feature: 'Escaneo computarizado gratuito',
    detail: 'Lectura de códigos y diagnóstico electrónico básico (1 vez por mes)',
    basico: '1 por mes',
    platino: '1 por mes',
    oro: '1 por mes',
  },
  {
    id: 'general-check',
    category: 'diagnostico',
    feature: 'Revisión mecánica general / preventiva',
    detail: 'Inspección visual y preventiva sin desmontaje de componentes',
    basico: '1 por mes',
    platino: '1 por mes',
    oro: '1 por mes',
  },
  {
    id: 'battery',
    category: 'diagnostico',
    feature: 'Revisión de batería y alternador',
    detail: 'Control de carga, arranque y estado de bornes en taller',
    basico: 'Incluido',
    platino: 'Incluido',
    oro: 'Incluido',
  },
  {
    id: 'fluids',
    category: 'mantenimiento',
    feature: 'Control de niveles de fluidos',
    detail: 'Verificación visual de aceite, refrigerante, frenos y dirección',
    basico: 'Incluido',
    platino: 'Incluido',
    oro: 'Incluido',
  },
  {
    id: 'bulbs',
    category: 'mantenimiento',
    feature: 'Mano de obra para cambio de focos',
    detail: 'Instalación sin costo de mano de obra (foco a cargo del cliente)',
    basico: 'Gratuita',
    platino: 'Gratuita',
    oro: 'Gratuita',
  },
  {
    id: 'oil-labor',
    category: 'mantenimiento',
    feature: 'Mano de obra para cambio de aceite',
    detail: 'Lubricante y filtros a cargo del cliente en el taller',
    basico: 'No incluido',
    platino: 'Gratuita',
    oro: 'Gratuita',
  },
  {
    id: 'brakes-suspension',
    category: 'diagnostico',
    feature: 'Revisión de frenos, tren delantero y suspensión',
    detail: 'Control preventivo de pastillas, discos, bujes y amortiguación',
    basico: 'No incluido',
    platino: 'Gratuita',
    oro: 'Gratuita',
  },
  {
    id: 'labor-discount',
    category: 'descuentos',
    feature: 'Descuento en mano de obra mecánica',
    detail: 'Aplicable a trabajos mecánicos dentro de Mecánica Dakar (no acumulable)',
    basico: '5%',
    platino: '10%',
    oro: '15%',
  },
  {
    id: 'injector-discount',
    category: 'descuentos',
    feature: 'Descuento en limpieza de inyectores',
    detail: 'Requiere turno previo programado',
    basico: 'No incluido',
    platino: '20%',
    oro: '20%',
  },
  {
    id: 'priority',
    category: 'prioridad',
    feature: 'Nivel de atención y turnos en taller',
    detail: 'Gestión preferencial de ingreso y asignación de bahía',
    basico: 'Atención prioritaria',
    platino: 'Prioridad de turnos',
    oro: 'Atención preferencial',
  },
  {
    id: 'tow',
    category: 'prioridad',
    feature: 'Traslado gratuito con grúa hasta el taller',
    detail: '1 uso por mes hasta 3 km · Espera inicial de 30 días',
    basico: 'No incluido',
    platino: 'No incluido',
    oro: '1 mensual (hasta 3 km)',
  },
  {
    id: 'annual-bonus',
    category: 'descuentos',
    feature: 'Beneficio por pago del año completo anticipado',
    detail: 'Meses sin costo adicional al abonar el año completo por adelantado',
    basico: '1 mes gratis (Plan A)',
    platino: '2 meses gratis (Plan B)',
    oro: '3 meses gratis (Plan C)',
  },
];

export const GENERAL_CONDITIONS: GeneralCondition[] = [
  { concept: 'Pago', condition: 'Mensual anticipado o año completo anticipado' },
  {
    concept: 'Pago anual anticipado',
    condition: 'Plan A: 1 mes gratis · Plan B: 2 meses gratis · Plan C: 3 meses gratis',
  },
  { concept: 'Afiliación', condition: 'Un vehículo por membresía' },
  { concept: 'Identificación', condition: 'Chapa y datos del vehículo' },
  { concept: 'Vigencia', condition: '30 días por período abonado' },
  { concept: 'Carencia inicial', condition: '30 días para utilizar beneficios' },
  { concept: 'Grúa Oro', condition: 'Una utilización por mes' },
  { concept: 'Espera para grúa', condition: '30 días desde la afiliación' },
  { concept: 'Repuestos', condition: 'No incluidos' },
  { concept: 'Lubricantes', condition: 'No incluidos' },
  { concept: 'Descuentos', condition: 'No acumulables con otras promociones' },
];

export const IMPORTANT_CLAUSES: ImportantClause[] = [
  {
    number: '01',
    category: 'alcance',
    title: 'Servicios gratuitos exclusivos de mano de obra',
    body: 'Los servicios gratuitos son exclusivamente de mano de obra, salvo que se indique expresamente lo contrario.',
  },
  {
    number: '02',
    category: 'alcance',
    title: 'Alcance del escaneo computarizado',
    body: 'El escaneo gratuito comprende lectura de códigos y diagnóstico electrónico básico, no reparaciones ni programación de módulos.',
  },
  {
    number: '03',
    category: 'alcance',
    title: 'Alcance de la revisión mecánica gratuita',
    body: 'La revisión mecánica gratuita es visual y preventiva, sin desmontaje de componentes.',
  },
  {
    number: '04',
    category: 'alcance',
    title: 'Condiciones del cambio de aceite gratuito',
    body: 'El cambio de aceite gratuito corresponde a la mano de obra, con lubricante y filtros a cargo del cliente.',
  },
  {
    number: '05',
    category: 'vigencia',
    title: 'Limpieza de inyectores con turno previo',
    body: 'La limpieza de inyectores con descuento se realiza mediante turno previo.',
  },
  {
    number: '06',
    category: 'vigencia',
    title: 'No acumulación de beneficios mensuales',
    body: 'Los beneficios no utilizados durante el mes no se acumulan.',
  },
  {
    number: '07',
    category: 'vigencia',
    title: 'Exclusión de averías preexistentes',
    body: 'Las averías o problemas existentes antes de la afiliación no quedan cubiertos por la asistencia.',
  },
  {
    number: '08',
    category: 'grua',
    title: 'Coordinación y radio del servicio de grúa',
    body: 'El servicio de grúa requiere coordinación previa y disponibilidad del proveedor. El traslado es desde el lugar de avería hasta Mecánica Dakar, con un máximo de 3 km de recorrido.',
  },
];

export function formatGuaranies(value: number): string {
  return `${new Intl.NumberFormat('es-PY').format(Math.round(value))} Gs.`;
}
