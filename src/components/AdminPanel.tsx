import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  CreditCard,
  Download,
  Lock,
  LogOut,
  Printer,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  formatGuaranies,
  MEMBERSHIP_PLANS,
  PlanId,
} from '../data/membershipData';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  isAuthorizedAdminUser,
  OperationType,
} from '../firebase';
import { downloadClubCardPng, PrintableCardData } from '../utils/cardPrinter';

interface AdminMembership {
  id: string;
  memberNumber: string;
  planId: PlanId;
  monthlyAmountGs: number;
  paymentStatus: 'abonado' | 'pendiente';
  paymentDate: string;
  ownerName: string;
  phone: string;
  vehicleType: 'Automóvil' | 'Camioneta' | 'Utilitario';
  vehicleModel: string;
  plate: string;
  joinedDate: string;
  inspectionApproved: boolean;
  monthlyScanUsed: boolean;
  monthlyCheckUsed: boolean;
  annualTowUsed: boolean;
  notes: string;
  createdByUid: string;
}

interface AdminPanelProps {
  onBackToSite: () => void;
}

const TODAY_ISO = new Date().toISOString().slice(0, 10);

function addDays(isoDate: string, days: number): string {
  const base = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(base.getTime())) return isoDate;
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

function formatDateEs(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateParts(isoDate: string): { d: string; m: string; y: string } {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return { d: '--', m: '--', y: '----' };
  return { d: parts[2], m: parts[1], y: parts[0] };
}

function computeNextMemberNumber(existing: AdminMembership[]): string {
  let maxSeq = 0;
  for (const item of existing) {
    const match = item.memberNumber.match(/(\d+)$/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (!Number.isNaN(n) && n > maxSeq) maxSeq = n;
    }
  }
  return `MD-${String(maxSeq + 1).padStart(4, '0')}`;
}

export function AdminPanel({ onBackToSite }: AdminPanelProps) {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [blockedEmailMessage, setBlockedEmailMessage] = useState<string | null>(null);

  const [memberships, setMemberships] = useState<AdminMembership[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Create Affiliate Form State
  const [planId, setPlanId] = useState<PlanId>('platino');
  const [paymentConfirmed, setPaymentConfirmed] = useState(true);
  const [memberNumber, setMemberNumber] = useState('MD-0001');
  const [paymentDate, setPaymentDate] = useState(TODAY_ISO);
  const [joinedDate, setJoinedDate] = useState(TODAY_ISO);
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState<'Automóvil' | 'Camioneta' | 'Utilitario'>('Automóvil');
  const [vehicleModel, setVehicleModel] = useState('');
  const [plate, setPlate] = useState('');
  const [inspectionApproved, setInspectionApproved] = useState(true);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [firestoreErrorMsg, setFirestoreErrorMsg] = useState<string | null>(null);

  // List filters & active card preview
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'abonado' | 'pendiente' | PlanId>('all');
  const [selectedCardMember, setSelectedCardMember] = useState<AdminMembership | null>(null);
  const [modalCardMember, setModalCardMember] = useState<AdminMembership | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [printNotice, setPrintNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!modalCardMember) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalCardMember(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalCardMember]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        if (isAuthorizedAdminUser(currentUser)) {
          setUser(currentUser);
          setBlockedEmailMessage(null);
        } else {
          const attemptedEmail = currentUser.email || 'cuenta sin correo verificado';
          await signOut(auth);
          setUser(null);
          setBlockedEmailMessage(
            `Acceso bloqueado para "${attemptedEmail}". Esta cuenta no está autorizada para ingresar al Panel de Administrador.`
          );
        }
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady || !user || !isAuthorizedAdminUser(user)) {
      setMemberships([]);
      return;
    }

    setDataLoading(true);
    const q = query(collection(db, 'memberships'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const rows: AdminMembership[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            memberNumber: String(data.memberNumber ?? ''),
            planId: (data.planId as PlanId) ?? 'basico',
            monthlyAmountGs: Number(data.monthlyAmountGs ?? 100000),
            paymentStatus: data.paymentStatus === 'pendiente' ? 'pendiente' : 'abonado',
            paymentDate: String(data.paymentDate ?? TODAY_ISO),
            ownerName: String(data.ownerName ?? ''),
            phone: String(data.phone ?? ''),
            vehicleType:
              (data.vehicleType as AdminMembership['vehicleType']) ?? 'Automóvil',
            vehicleModel: String(data.vehicleModel ?? ''),
            plate: String(data.plate ?? ''),
            joinedDate: String(data.joinedDate ?? TODAY_ISO),
            inspectionApproved: Boolean(data.inspectionApproved),
            monthlyScanUsed: Boolean(data.monthlyScanUsed),
            monthlyCheckUsed: Boolean(data.monthlyCheckUsed),
            annualTowUsed: Boolean(data.annualTowUsed),
            notes: String(data.notes ?? ''),
            createdByUid: String(data.createdByUid ?? ''),
          };
        });
        setMemberships(rows);
        setMemberNumber((current) => {
          if (!current || current === 'MD-0001' || rows.some((r) => r.memberNumber === current)) {
            return computeNextMemberNumber(rows);
          }
          return current;
        });
        setDataLoading(false);
      },
      (error) => {
        setDataLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'memberships');
      }
    );

    return () => unsub();
  }, [authReady, user]);

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setBlockedEmailMessage(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (!isAuthorizedAdminUser(result.user)) {
        const attemptedEmail = result.user.email || 'cuenta no verificada';
        await signOut(auth);
        setBlockedEmailMessage(
          `Acceso bloqueado para "${attemptedEmail}". Esta cuenta no está autorizada para ingresar al Panel de Administrador.`
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo iniciar sesión con Google.';
      if (!msg.includes('popup-closed-by-user')) {
        setBlockedEmailMessage(`Error al autenticar con Google: ${msg}`);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setSelectedCardMember(null);
  };

  const selectedPlanObj = useMemo(
    () => MEMBERSHIP_PLANS.find((p) => p.id === planId) ?? MEMBERSHIP_PLANS[0],
    [planId]
  );

  const stats = useMemo(() => {
    const paid = memberships.filter((m) => m.paymentStatus === 'abonado');
    const monthlyRevenue = paid.reduce((acc, m) => acc + m.monthlyAmountGs, 0);
    return {
      total: memberships.length,
      paidCount: paid.length,
      monthlyRevenue,
    };
  }, [memberships]);

  const handleCreateMembership = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !isAuthorizedAdminUser(user)) return;

    setFormError(null);
    setFormSuccess(null);
    setFirestoreErrorMsg(null);

    if (!paymentConfirmed) {
      setFormError(
        'Para emitir un número de afiliado oficial, primero confirmá que el cliente abonó el plan elegido.'
      );
      return;
    }

    const cleanMemberNum = memberNumber.trim().toUpperCase();
    const cleanOwner = ownerName.trim();
    const cleanPhone = phone.trim();
    const cleanModel = vehicleModel.trim();
    const cleanPlate = plate.trim().toUpperCase();
    const cleanNotes = notes.trim().slice(0, 300);

    if (!/^[A-Z0-9-]{4,24}$/.test(cleanMemberNum)) {
      setFormError(
        'El número de afiliado debe tener entre 4 y 24 caracteres (solo letras mayúsculas, números y guiones, ej: MD-0001).'
      );
      return;
    }
    if (memberships.some((m) => m.memberNumber === cleanMemberNum)) {
      setFormError(
        `El número de afiliado ${cleanMemberNum} ya fue asignado a otro socio.`
      );
      return;
    }
    if (cleanOwner.length < 3 || cleanOwner.length > 120) {
      setFormError('Ingresá el nombre completo del titular (3 a 120 caracteres).');
      return;
    }
    if (cleanPhone.length < 6 || cleanPhone.length > 40) {
      setFormError('Ingresá un teléfono de contacto válido.');
      return;
    }
    if (cleanModel.length < 2 || cleanModel.length > 100) {
      setFormError('Indicá la marca, modelo y año del vehículo.');
      return;
    }
    if (!/^[A-Z0-9 -]{4,20}$/.test(cleanPlate)) {
      setFormError('Ingresá una chapa válida (4 a 20 caracteres alfanuméricos).');
      return;
    }
    if (memberships.some((m) => m.plate === cleanPlate)) {
      setFormError(`La chapa ${cleanPlate} ya tiene una membresía registrada.`);
      return;
    }

    const docId = `${cleanMemberNum}-${Date.now().toString(36).toUpperCase()}`.replace(
      /[^a-zA-Z0-9_-]/g,
      ''
    );

    setSubmitting(true);
    try {
      const payload = {
        memberNumber: cleanMemberNum,
        planId,
        monthlyAmountGs: selectedPlanObj.monthlyPriceGs,
        paymentStatus: 'abonado' as const,
        paymentDate,
        ownerName: cleanOwner,
        phone: cleanPhone,
        vehicleType,
        vehicleModel: cleanModel,
        plate: cleanPlate,
        joinedDate,
        inspectionApproved,
        monthlyScanUsed: false,
        monthlyCheckUsed: false,
        annualTowUsed: false,
        notes: cleanNotes,
        createdByUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'memberships', docId), payload);

      const createdPreview: AdminMembership = {
        id: docId,
        memberNumber: cleanMemberNum,
        planId,
        monthlyAmountGs: selectedPlanObj.monthlyPriceGs,
        paymentStatus: 'abonado',
        paymentDate,
        ownerName: cleanOwner,
        phone: cleanPhone,
        vehicleType,
        vehicleModel: cleanModel,
        plate: cleanPlate,
        joinedDate,
        inspectionApproved,
        monthlyScanUsed: false,
        monthlyCheckUsed: false,
        annualTowUsed: false,
        notes: cleanNotes,
        createdByUid: user.uid,
      };
      setSelectedCardMember(createdPreview);

      setFormSuccess(
        `Afiliado Nº ${cleanMemberNum} emitido correctamente para ${cleanOwner} (${cleanPlate}) · ${selectedPlanObj.name} abonado.`
      );

      setOwnerName('');
      setPhone('');
      setVehicleModel('');
      setPlate('');
      setNotes('');
    } catch (error) {
      setFirestoreErrorMsg('No se pudo guardar la afiliación en Firestore.');
      handleFirestoreError(error, OperationType.CREATE, `memberships/${docId}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleBoolean = async (
    record: AdminMembership,
    field: 'inspectionApproved' | 'monthlyScanUsed' | 'monthlyCheckUsed' | 'annualTowUsed'
  ) => {
    try {
      await updateDoc(doc(db, 'memberships', record.id), {
        [field]: !record[field],
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `memberships/${record.id}`);
    }
  };

  const handleTogglePayment = async (record: AdminMembership) => {
    const nextStatus = record.paymentStatus === 'abonado' ? 'pendiente' : 'abonado';
    try {
      await updateDoc(doc(db, 'memberships', record.id), {
        paymentStatus: nextStatus,
        paymentDate: nextStatus === 'abonado' ? TODAY_ISO : record.paymentDate,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `memberships/${record.id}`);
    }
  };

  const handleDelete = async (record: AdminMembership) => {
    try {
      await deleteDoc(doc(db, 'memberships', record.id));
      if (selectedCardMember?.id === record.id) {
        setSelectedCardMember(null);
      }
      if (modalCardMember?.id === record.id) {
        setModalCardMember(null);
      }
      setConfirmDeleteId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `memberships/${record.id}`);
    }
  };

  const copyCardText = async (record: AdminMembership) => {
    const plan =
      MEMBERSHIP_PLANS.find((p) => p.id === record.planId) ?? MEMBERSHIP_PLANS[0];
    const renewal = addDays(record.joinedDate, 30);
    const carenciaEnd = addDays(record.joinedDate, 30);
    const towReady = addDays(record.joinedDate, 30);
    const letter =
      record.planId === 'basico' ? 'A' : record.planId === 'platino' ? 'B' : 'C';

    const text = [
      `MECÁNICA DAKAR — CLUB DE ASISTENCIA MECÁNICA`,
      `N° de Afiliado: ${record.memberNumber}`,
      `Estado de pago: ${record.paymentStatus === 'abonado' ? 'ABONADO' : 'PENDIENTE'} (${formatDateEs(record.paymentDate)})`,
      `Plan: ${plan.name} (Opción ${letter}) · ${plan.formattedPrice}/mes`,
      `Titular: ${record.ownerName} · Tel: ${record.phone}`,
      `Vehículo: ${record.vehicleType} ${record.vehicleModel} · Chapa: ${record.plate}`,
      `Vencimiento período: ${formatDateEs(renewal)}`,
      `Carencia inicial (30 días): ${formatDateEs(carenciaEnd)}`,
      plan.hasFreeTow ? `Grúa Oro (30 días): ${formatDateEs(towReady)}` : '',
      `Cobertura exclusiva dentro de Mecánica Dakar. Sin asistencia en ruta.`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(record.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard blocked
    }
  };

  const handleDownloadCard = async (cardData: PrintableCardData) => {
    setPrintNotice(null);
    try {
      await downloadClubCardPng(cardData);
      setPrintNotice(`Tarjeta ${cardData.memberNumber || 'oficial'} descargada en PNG lista para imprimir.`);
      setTimeout(() => setPrintNotice(null), 5000);
    } catch (err) {
      setPrintNotice(
        err instanceof Error ? err.message : 'No se pudo generar la tarjeta descargable.'
      );
    }
  };

  const handlePrintCard = async (cardData: PrintableCardData) => {
    setPrintNotice(null);
    const inIframe = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();

    try {
      window.print();
    } catch {
      // Blocked in restricted iframe
    }

    if (inIframe) {
      await handleDownloadCard(cardData);
      setPrintNotice(
        'La vista previa embebida bloquea la ventana de impresión directa; se descargó la tarjeta en PNG lista para imprimir.'
      );
    }
  };

  const filteredMembers = useMemo(() => {
    return memberships.filter((m) => {
      if (filterTab === 'abonado' && m.paymentStatus !== 'abonado') return false;
      if (filterTab === 'pendiente' && m.paymentStatus !== 'pendiente') return false;
      if (
        (filterTab === 'basico' || filterTab === 'platino' || filterTab === 'oro') &&
        m.planId !== filterTab
      ) {
        return false;
      }
      if (!searchTerm.trim()) return true;
      const q = searchTerm.trim().toLowerCase();
      return (
        m.memberNumber.toLowerCase().includes(q) ||
        m.plate.toLowerCase().includes(q) ||
        m.ownerName.toLowerCase().includes(q) ||
        m.vehicleModel.toLowerCase().includes(q)
      );
    });
  }, [memberships, filterTab, searchTerm]);

  if (!authReady) {
    return (
      <div className="min-h-[70vh] bg-[#0A0B0D] text-white flex items-center justify-center p-6">
        <p className="text-sm text-[#C7CBD1]">Verificando sesión de administrador...</p>
      </div>
    );
  }

  // Strictly blocked unless signed in via Google with mecanicadakar@gmail.com
  if (!user || !isAuthorizedAdminUser(user)) {
    return (
      <section className="min-h-[82vh] bg-[#0A0B0D] text-white py-16 px-4 sm:px-6 flex items-center">
        <div className="max-w-lg mx-auto w-full bg-[#121418] border border-white/15 rounded-xl overflow-hidden">
          <div aria-hidden="true" className="h-6 w-full checkered-flag-strip" />
          <div className="p-7 sm:p-8 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/aistudio/Logo-Mecanica-Dakar_fcd6213a.png"
                  alt="Logo Mecánica Dakar"
                  className="h-14 w-14 object-contain bg-black rounded shrink-0"
                />
                <div>
                  <p className="text-xs font-semibold text-[#F5B700]">
                    Acceso restringido
                  </p>
                  <h1 className="font-display text-3xl font-bold leading-none mt-0.5">
                    Panel de Administrador
                  </h1>
                </div>
              </div>

              <Lock className="w-6 h-6 text-[#F5B700] shrink-0" aria-hidden="true" />
            </div>

            <p className="text-sm text-[#C7CBD1] leading-relaxed">
              Este módulo permite confirmar pagos, emitir números de afiliado oficiales y administrar el registro del Club de Asistencia Mecánica. Por seguridad, solo la cuenta Google autorizada del taller puede ingresar.
            </p>

            {blockedEmailMessage && (
              <div
                role="alert"
                className="p-4 rounded-md bg-[#450A0A] border border-[#EF4444] text-xs text-[#FECACA] flex items-start gap-3 leading-relaxed"
              >
                <ShieldAlert className="w-5 h-5 text-[#F87171] shrink-0 mt-0.5" />
                <span>{blockedEmailMessage}</span>
              </div>
            )}

            <div className="space-y-3 pt-1">
              <button
                type="button"
                disabled={authLoading}
                onClick={handleGoogleLogin}
                className="w-full py-3.5 px-4 rounded-md bg-[#F5B700] hover:bg-[#FFD028] disabled:opacity-60 text-[#0A0B0D] font-bold text-sm transition-colors cursor-pointer"
              >
                {authLoading ? 'Abriendo acceso Google...' : 'Ingresar con Google'}
              </button>

              <button
                type="button"
                onClick={onBackToSite}
                className="w-full py-2.5 px-4 rounded-md border border-white/15 text-xs font-medium text-[#D0D4DC] hover:text-white hover:bg-white/5 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Volver al sitio público
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[85vh] bg-[#F6F6F4] pb-16">
      {/* Admin Top Status Header */}
      <div className="bg-[#0A0B0D] text-white border-b border-white/10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F5B700] hover:underline mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver al sitio público
            </button>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Panel de Administrador · Emisión de N° de Afiliado
            </h1>
            <p className="text-xs text-[#C7CBD1] mt-1">
              Sesión verificada · <span className="text-[#F5B700] font-medium">Administrador autorizado</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-[11px] text-[#9AA0A9]">Socios abonados</p>
              <p className="font-display text-2xl font-bold text-[#F5B700] tabular-nums">
                {stats.paidCount} / {stats.total}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-[#9AA0A9]">Ingreso mensual recurrente</p>
              <p className="font-mono-tabular text-xl font-bold text-white">
                {formatGuaranies(stats.monthlyRevenue)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white border border-white/20 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar sesión
            </button>
          </div>
        </div>
        <div aria-hidden="true" className="h-6 w-full checkered-flag-strip" />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-10 space-y-10">
        {/* Top Split: Create Official Affiliate Number + Card Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleCreateMembership}
            noValidate
            className="lg:col-span-6 bg-white border border-[#E2E2DC] rounded-lg p-6 space-y-5"
          >
            <div className="pb-4 border-b border-[#EAEAE4]">
              <h2 className="font-display text-2xl font-bold text-[#0A0B0D]">
                Crear número de afiliado por plan abonado
              </h2>
              <p className="text-xs text-[#52565E] mt-1">
                Confirmá el pago del cliente, generá el N° de afiliado correlativo y guardalo en la base de datos del taller.
              </p>
            </div>

            <div>
              <span className="block text-xs font-semibold text-[#52565E] mb-2">
                1. Plan abonado
              </span>
              <div className="grid grid-cols-3 gap-2 p-1 bg-[#F2F2EE] rounded-md border border-[#E5E5DF]">
                {MEMBERSHIP_PLANS.map((plan) => {
                  const active = planId === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setPlanId(plan.id)}
                      className={`py-2.5 px-2 text-center rounded transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#0A0B0D] text-[#F5B700]'
                          : 'text-[#4A4E55] hover:text-[#0A0B0D]'
                      }`}
                    >
                      <span className="block text-xs font-semibold">{plan.name}</span>
                      <span className="block font-mono-tabular text-[11px] opacity-90">
                        {formatGuaranies(plan.monthlyPriceGs)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-md bg-[#FAF9F5] border border-[#E5E5DF] space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentConfirmed}
                  onChange={(e) => setPaymentConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#0A0B0D] cursor-pointer"
                />
                <span className="text-xs text-[#0A0B0D] leading-relaxed">
                  <strong>Pago confirmado al +595 975 635 770 ({selectedPlanObj.formattedPrice}):</strong> el cliente abonó el período mensual por adelantado y queda habilitado para registrar su vehículo y emitir su N° de afiliado.
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="admin-member-num"
                    className="block text-xs font-semibold text-[#0A0B0D] mb-1"
                  >
                    N° de Afiliado
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="admin-member-num"
                      type="text"
                      value={memberNumber}
                      onChange={(e) => setMemberNumber(e.target.value.toUpperCase())}
                      placeholder="MD-0001"
                      className="w-full px-3 py-2 text-sm font-mono-tabular font-bold uppercase bg-white border border-[#DCDCD5] rounded-md focus:outline-none focus:border-[#F5B700]"
                    />
                    <button
                      type="button"
                      onClick={() => setMemberNumber(computeNextMemberNumber(memberships))}
                      className="px-2.5 py-2 text-xs font-semibold bg-[#0A0B0D] text-[#F5B700] rounded-md whitespace-nowrap shrink-0 hover:bg-[#1E2025] cursor-pointer"
                    >
                      Auto
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="admin-pay-date"
                    className="block text-xs font-semibold text-[#0A0B0D] mb-1"
                  >
                    Fecha de pago
                  </label>
                  <input
                    id="admin-pay-date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => {
                      setPaymentDate(e.target.value);
                      setJoinedDate(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-sm font-mono-tabular bg-white border border-[#DCDCD5] rounded-md focus:outline-none focus:border-[#F5B700]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="admin-owner"
                  className="block text-xs font-semibold text-[#0A0B0D] mb-1"
                >
                  Titular
                </label>
                <input
                  id="admin-owner"
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Nombre y apellido"
                  className="w-full px-3 py-2 text-sm bg-[#FAF9F7] border border-[#DCDCD5] rounded-md focus:outline-none focus:border-[#F5B700]"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-phone"
                  className="block text-xs font-semibold text-[#0A0B0D] mb-1"
                >
                  Teléfono / WhatsApp
                </label>
                <input
                  id="admin-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0975 000 000"
                  className="w-full px-3 py-2 text-sm bg-[#FAF9F7] border border-[#DCDCD5] rounded-md focus:outline-none focus:border-[#F5B700]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="admin-vtype"
                  className="block text-xs font-semibold text-[#0A0B0D] mb-1"
                >
                  Vehículo
                </label>
                <select
                  id="admin-vtype"
                  value={vehicleType}
                  onChange={(e) =>
                    setVehicleType(e.target.value as AdminMembership['vehicleType'])
                  }
                  className="w-full px-3 py-2 text-sm bg-[#FAF9F7] border border-[#DCDCD5] rounded-md focus:outline-none focus:border-[#F5B700]"
                >
                  <option value="Automóvil">Automóvil</option>
                  <option value="Camioneta">Camioneta</option>
                  <option value="Utilitario">Utilitario</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="admin-vmodel"
                  className="block text-xs font-semibold text-[#0A0B0D] mb-1"
                >
                  Marca y modelo
                </label>
                <input
                  id="admin-vmodel"
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="Ej: Toyota Hilux 2022"
                  className="w-full px-3 py-2 text-sm bg-[#FAF9F7] border border-[#DCDCD5] rounded-md focus:outline-none focus:border-[#F5B700]"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-plate"
                  className="block text-xs font-semibold text-[#0A0B0D] mb-1"
                >
                  Chapa
                </label>
                <input
                  id="admin-plate"
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="Ej: AABB 123"
                  className="w-full px-3 py-2 text-sm font-mono-tabular uppercase bg-[#FAF9F7] border border-[#DCDCD5] rounded-md focus:outline-none focus:border-[#F5B700]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label
                  htmlFor="admin-notes"
                  className="block text-xs font-semibold text-[#0A0B0D] mb-1"
                >
                  Observación de inspección (opcional)
                </label>
                <input
                  id="admin-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Kilometraje 82.400 km · Sin fallas previas"
                  maxLength={300}
                  className="w-full px-3 py-2 text-sm bg-[#FAF9F7] border border-[#DCDCD5] rounded-md focus:outline-none focus:border-[#F5B700]"
                />
              </div>

              <label className="flex items-center gap-2.5 text-xs font-medium text-[#0A0B0D] pt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inspectionApproved}
                  onChange={(e) => setInspectionApproved(e.target.checked)}
                  className="w-4 h-4 accent-[#0A0B0D]"
                />
                <span>Inspección previa aprobada</span>
              </label>
            </div>

            {formError && (
              <div
                role="alert"
                className="p-3 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-xs font-medium text-[#991B1B]"
              >
                {formError}
              </div>
            )}

            {firestoreErrorMsg && (
              <div
                role="alert"
                className="p-3 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-xs font-medium text-[#991B1B]"
              >
                {firestoreErrorMsg}
              </div>
            )}

            {formSuccess && (
              <div
                role="status"
                className="p-3 rounded-md bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-medium text-[#065F46] flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-5 rounded-md bg-[#F5B700] hover:bg-[#FFD028] disabled:opacity-60 text-[#0A0B0D] font-bold text-sm transition-colors cursor-pointer"
            >
              {submitting
                ? 'Emitiendo N° de afiliado...'
                : 'Emitir N° de afiliado y guardar pago'}
            </button>
          </form>

          {/* Right Column: Selected Member or Live Draft Official Card */}
          <div className="lg:col-span-6 space-y-4">
            {(() => {
              const cardOwner = selectedCardMember
                ? selectedCardMember.ownerName
                : ownerName.trim();
              const cardPlate = selectedCardMember
                ? selectedCardMember.plate
                : plate.trim().toUpperCase();
              const cardPlan = selectedCardMember ? selectedCardMember.planId : planId;
              const cardNum = selectedCardMember
                ? selectedCardMember.memberNumber
                : memberNumber.trim().toUpperCase();
              const cardJoined = selectedCardMember
                ? selectedCardMember.joinedDate
                : joinedDate;
              const cardRenewal = addDays(cardJoined, 30);
              const cardParts = formatDateParts(cardRenewal);

              return (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-[#8A6200]">
                        {selectedCardMember
                          ? `Tarjeta del afiliado ${selectedCardMember.memberNumber}`
                          : 'Vista previa de tarjeta a emitir'}
                      </p>
                      <h3 className="font-display text-2xl font-bold text-[#0A0B0D]">
                        Credencial Oficial del Club
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {selectedCardMember && (
                        <button
                          type="button"
                          onClick={() => setSelectedCardMember(null)}
                          className="px-3 py-1.5 text-xs font-medium text-[#4A4E55] bg-white border border-[#DCDCD5] rounded hover:bg-[#F2F2EE] cursor-pointer"
                        >
                          Limpiar vista
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadCard({
                            ownerName: cardOwner,
                            plate: cardPlate,
                            planId: cardPlan,
                            memberNumber: cardNum,
                            expirationDateIso: cardRenewal,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0A0B0D] bg-white border border-[#DCDCD5] hover:bg-[#F2F2EE] rounded cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Descargar PNG
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handlePrintCard({
                            ownerName: cardOwner,
                            plate: cardPlate,
                            planId: cardPlan,
                            memberNumber: cardNum,
                            expirationDateIso: cardRenewal,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0A0B0D] bg-[#F5B700] hover:bg-[#FFD028] rounded cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Imprimir
                      </button>
                    </div>
                  </div>

                  {printNotice && !modalCardMember && (
                    <div
                      role="status"
                      className="p-3 rounded-md bg-[#FFF9E6] border border-[#F5B700] text-xs font-medium text-[#0A0B0D]"
                    >
                      {printNotice}
                    </div>
                  )}

                  <div
                    className={`relative w-full aspect-[1672/940] rounded-xl overflow-hidden border border-[#262930] bg-[#0A0B0D] shadow-sm select-none ${
                      modalCardMember ? '' : 'print-card-target'
                    }`}
                  >
                    <img
                      src="/assets/aistudio/Tarjeta_Club_Mec_nica_Dakar_ee8c3949.png"
                      alt="Tarjeta oficial Club de Asistencia Mecánica Mecánica Dakar"
                      className="w-full h-full object-cover"
                    />
                    <div
                      style={{ left: '35%', top: '44.8%', width: '39.2%', height: '7%' }}
                      className="absolute flex items-center px-2 text-[#0A0B0D] font-bold text-[11px] sm:text-sm truncate"
                    >
                      {cardOwner}
                    </div>
                    <div
                      style={{ left: '35%', top: '53.7%', width: '39.2%', height: '6.8%' }}
                      className="absolute flex items-center px-2 text-[#0A0B0D] font-mono-tabular font-bold uppercase text-[11px] sm:text-sm truncate"
                    >
                      {cardPlate}
                    </div>
                    {cardPlan === 'basico' && (
                      <div
                        style={{ left: '34.3%', top: '62.7%', width: '3.6%', height: '5.8%' }}
                        className="absolute flex items-center justify-center text-[#0A0B0D] font-bold text-xs sm:text-base"
                      >
                        ✓
                      </div>
                    )}
                    {cardPlan === 'platino' && (
                      <div
                        style={{ left: '47.0%', top: '62.7%', width: '3.5%', height: '5.8%' }}
                        className="absolute flex items-center justify-center text-[#0A0B0D] font-bold text-xs sm:text-base"
                      >
                        ✓
                      </div>
                    )}
                    {cardPlan === 'oro' && (
                      <div
                        style={{ left: '59.3%', top: '62.7%', width: '3.4%', height: '5.8%' }}
                        className="absolute flex items-center justify-center text-[#0A0B0D] font-bold text-xs sm:text-base"
                      >
                        ✓
                      </div>
                    )}
                    <div
                      style={{ left: '35%', top: '70.4%', width: '39.2%', height: '6.8%' }}
                      className="absolute flex items-center px-2 text-[#0A0B0D] font-mono-tabular font-bold text-[11px] sm:text-sm truncate"
                    >
                      {cardNum}
                    </div>
                    <div
                      style={{ left: '35.5%', top: '79.3%', width: '32%', height: '5.9%' }}
                      className="absolute bg-white rounded flex items-center justify-center text-[#0A0B0D] font-mono-tabular font-bold text-[11px] sm:text-sm"
                    >
                      {`${cardParts.d} / ${cardParts.m} / ${cardParts.y}`}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Registered Affiliates Management Table */}
        <div className="bg-white border border-[#E2E2DC] rounded-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#EAEAE4]">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#0A0B0D]">
                Nómina oficial de afiliados
              </h2>
              <p className="text-xs text-[#6A6E75] mt-0.5">
                Hacé clic en cualquier afiliado para visualizar su tarjeta oficial o actualizar pagos, inspecciones y consumos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#6A6E75] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar N° afiliado, chapa o titular..."
                  className="pl-9 pr-3 py-2 text-xs bg-[#FAF9F7] border border-[#DCDCD5] rounded-md focus:outline-none focus:border-[#F5B700]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F2F2EE] rounded-md border border-[#E5E5DF]">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'abonado', label: 'Abonados' },
                  { id: 'pendiente', label: 'Pendientes' },
                  { id: 'oro', label: 'Oro' },
                  { id: 'platino', label: 'Platino' },
                  { id: 'basico', label: 'Básico' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterTab(tab.id as typeof filterTab)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                      filterTab === tab.id
                        ? 'bg-[#0A0B0D] text-[#F5B700]'
                        : 'text-[#52565E] hover:text-[#0A0B0D]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {dataLoading ? (
            <div className="py-12 text-center text-sm text-[#52565E]">
              Cargando registros de afiliados...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-[#0A0B0D]">
                {memberships.length === 0
                  ? 'Aún no emitiste ningún número de afiliado.'
                  : 'No hay afiliados que coincidan con el filtro aplicado.'}
              </p>
              <p className="text-xs text-[#6A6E75] mt-1">
                Completá el formulario superior una vez confirmado el pago para generar la primera credencial.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {filteredMembers.map((record) => {
                const plan =
                  MEMBERSHIP_PLANS.find((p) => p.id === record.planId) ??
                  MEMBERSHIP_PLANS[0];
                const renewal = addDays(record.joinedDate, 30);

                return (
                  <div
                    key={record.id}
                    className="border border-[#E2E2DC] rounded-lg p-5 bg-[#FAF9F5]"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E5E5DF]">
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <span className="font-mono-tabular text-base font-bold text-[#0A0B0D] bg-[#F5B700] px-2.5 py-0.5 rounded">
                          {record.memberNumber}
                        </span>
                        <span className="font-mono-tabular text-sm font-bold text-[#0A0B0D]">
                          {record.plate}
                        </span>
                        <span className="text-sm font-semibold text-[#0A0B0D]">
                          {record.ownerName}
                        </span>
                        <span className="text-xs text-[#52565E]">
                          {record.vehicleType} {record.vehicleModel} · Tel: {record.phone}
                        </span>
                        <span className="text-xs font-semibold text-[#8A6200]">
                          {plan.name} ({formatGuaranies(record.monthlyAmountGs)})
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCardMember(record);
                            setModalCardMember(record);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0A0B0D] bg-[#F5B700] hover:bg-[#FFD028] rounded transition-colors cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Ver tarjeta
                        </button>

                        <button
                          type="button"
                          onClick={() => copyCardText(record)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0A0B0D] bg-white border border-[#DCDCD5] rounded hover:bg-[#F2F2EE] transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copiedId === record.id ? 'Copiado' : 'Copiar'}
                        </button>

                        {confirmDeleteId === record.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDelete(record)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-white bg-[#B91C1C] rounded cursor-pointer"
                            >
                              Confirmar baja
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1.5 text-xs text-[#52565E] bg-white border border-[#DCDCD5] rounded cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(record.id)}
                            aria-label={`Eliminar afiliado ${record.memberNumber}`}
                            className="inline-flex items-center justify-center w-8 h-8 text-[#6A6E75] hover:text-[#B91C1C] bg-white border border-[#DCDCD5] rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="bg-white border border-[#E5E5DF] rounded p-3.5">
                        <p className="text-[#6A6E75]">Pago y vencimiento</p>
                        <p
                          className={`mt-1 font-semibold ${
                            record.paymentStatus === 'abonado'
                              ? 'text-[#15803D]'
                              : 'text-[#B91C1C]'
                          }`}
                        >
                          {record.paymentStatus === 'abonado'
                            ? `Abonado el ${formatDateEs(record.paymentDate)}`
                            : 'Pendiente de pago'}
                        </p>
                        <p className="mt-1 text-[11px] text-[#52565E] font-mono-tabular">
                          Vence: {formatDateEs(renewal)}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleTogglePayment(record)}
                          className="mt-2 text-xs font-semibold text-[#0A0B0D] underline decoration-[#F5B700] decoration-2 underline-offset-4 cursor-pointer"
                        >
                          {record.paymentStatus === 'abonado'
                            ? 'Marcar como pendiente'
                            : 'Registrar pago abonado'}
                        </button>
                      </div>

                      <div className="bg-white border border-[#E5E5DF] rounded p-3.5">
                        <p className="text-[#6A6E75]">Inspección y carencias</p>
                        <p
                          className={`mt-1 font-semibold ${
                            record.inspectionApproved
                              ? 'text-[#15803D]'
                              : 'text-[#B45309]'
                          }`}
                        >
                          {record.inspectionApproved
                            ? 'Inspección aprobada'
                            : 'Pendiente de inspección'}
                        </p>
                        <p className="mt-1 text-[11px] text-[#52565E] font-mono-tabular">
                          Carencia 30d: {formatDateEs(addDays(record.joinedDate, 30))}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleBoolean(record, 'inspectionApproved')
                          }
                          className="mt-2 text-xs font-semibold text-[#0A0B0D] underline decoration-[#F5B700] decoration-2 underline-offset-4 cursor-pointer"
                        >
                          {record.inspectionApproved
                            ? 'Revocar aprobación'
                            : 'Aprobar inspección'}
                        </button>
                      </div>

                      <div className="bg-white border border-[#E5E5DF] rounded p-3.5 space-y-2">
                        <p className="text-[#6A6E75]">Uso de beneficios</p>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={record.monthlyScanUsed}
                            onChange={() =>
                              handleToggleBoolean(record, 'monthlyScanUsed')
                            }
                            className="accent-[#0A0B0D]"
                          />
                          <span>Escaneo mensual utilizado (1/1)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={record.monthlyCheckUsed}
                            onChange={() =>
                              handleToggleBoolean(record, 'monthlyCheckUsed')
                            }
                            className="accent-[#0A0B0D]"
                          />
                          <span>Revisión mensual utilizada (1/1)</span>
                        </label>
                        {plan.hasFreeTow && (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={record.annualTowUsed}
                              onChange={() =>
                                handleToggleBoolean(record, 'annualTowUsed')
                              }
                              className="accent-[#0A0B0D]"
                            />
                            <span>Grúa mensual utilizada (1/1)</span>
                          </label>
                        )}
                      </div>
                    </div>

                    {record.notes && (
                      <p className="mt-3 text-xs text-[#52565E]">
                        Observación: {record.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Tarjeta Oficial al hacer clic en Ver tarjeta */}
      {modalCardMember && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-card-title"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setModalCardMember(null)}
        >
          <div
            className="w-full max-w-2xl bg-[#0A0B0D] text-white border border-[#F5B700]/40 rounded-xl overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#F5B700]">
                  Afiliado Nº {modalCardMember.memberNumber} ·{' '}
                  {modalCardMember.paymentStatus === 'abonado' ? 'Abonado' : 'Pendiente'}
                </p>
                <h3 id="modal-card-title" className="font-display text-2xl font-bold">
                  {modalCardMember.ownerName} · {modalCardMember.plate}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setModalCardMember(null)}
                aria-label="Cerrar tarjeta"
                className="w-9 h-9 rounded-md border border-white/15 flex items-center justify-center text-[#D0D4DC] hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="print-card-target relative w-full aspect-[1672/940] rounded-xl overflow-hidden border border-[#262930] bg-[#0A0B0D] select-none">
                <img
                  src="/assets/aistudio/Tarjeta_Club_Mec_nica_Dakar_ee8c3949.png"
                  alt={`Tarjeta oficial de ${modalCardMember.ownerName}`}
                  className="w-full h-full object-cover"
                />
                <div
                  style={{ left: '35%', top: '44.8%', width: '39.2%', height: '7%' }}
                  className="absolute flex items-center px-2 text-[#0A0B0D] font-bold text-xs sm:text-base truncate"
                >
                  {modalCardMember.ownerName}
                </div>
                <div
                  style={{ left: '35%', top: '53.7%', width: '39.2%', height: '6.8%' }}
                  className="absolute flex items-center px-2 text-[#0A0B0D] font-mono-tabular font-bold uppercase text-xs sm:text-base truncate"
                >
                  {modalCardMember.plate}
                </div>
                {modalCardMember.planId === 'basico' && (
                  <div
                    style={{ left: '34.3%', top: '62.7%', width: '3.6%', height: '5.8%' }}
                    className="absolute flex items-center justify-center text-[#0A0B0D] font-bold text-sm sm:text-lg"
                  >
                    ✓
                  </div>
                )}
                {modalCardMember.planId === 'platino' && (
                  <div
                    style={{ left: '47.0%', top: '62.7%', width: '3.5%', height: '5.8%' }}
                    className="absolute flex items-center justify-center text-[#0A0B0D] font-bold text-sm sm:text-lg"
                  >
                    ✓
                  </div>
                )}
                {modalCardMember.planId === 'oro' && (
                  <div
                    style={{ left: '59.3%', top: '62.7%', width: '3.4%', height: '5.8%' }}
                    className="absolute flex items-center justify-center text-[#0A0B0D] font-bold text-sm sm:text-lg"
                  >
                    ✓
                  </div>
                )}
                <div
                  style={{ left: '35%', top: '70.4%', width: '39.2%', height: '6.8%' }}
                  className="absolute flex items-center px-2 text-[#0A0B0D] font-mono-tabular font-bold text-xs sm:text-base truncate"
                >
                  {modalCardMember.memberNumber}
                </div>
                <div
                  style={{ left: '35.5%', top: '79.3%', width: '32%', height: '5.9%' }}
                  className="absolute bg-white rounded flex items-center justify-center text-[#0A0B0D] font-mono-tabular font-bold text-xs sm:text-base"
                >
                  {(() => {
                    const p = formatDateParts(addDays(modalCardMember.joinedDate, 30));
                    return `${p.d} / ${p.m} / ${p.y}`;
                  })()}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#121418]">
              <p className="text-xs text-[#C7CBD1] font-mono-tabular">
                Carencia 30d: {formatDateEs(addDays(modalCardMember.joinedDate, 30))}
                {modalCardMember.planId === 'oro'
                  ? ` · Grúa 30d: ${formatDateEs(addDays(modalCardMember.joinedDate, 30))}`
                  : ''}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyCardText(modalCardMember)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white border border-white/20 rounded-md hover:bg-white/10 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedId === modalCardMember.id ? 'Copiado' : 'Copiar datos'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadCard({
                      ownerName: modalCardMember.ownerName,
                      plate: modalCardMember.plate,
                      planId: modalCardMember.planId,
                      memberNumber: modalCardMember.memberNumber,
                      expirationDateIso: addDays(modalCardMember.joinedDate, 30),
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white border border-white/20 rounded-md hover:bg-white/10 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar PNG
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handlePrintCard({
                      ownerName: modalCardMember.ownerName,
                      plate: modalCardMember.plate,
                      planId: modalCardMember.planId,
                      memberNumber: modalCardMember.memberNumber,
                      expirationDateIso: addDays(modalCardMember.joinedDate, 30),
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#0A0B0D] bg-[#F5B700] hover:bg-[#FFD028] rounded-md cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir tarjeta
                </button>
              </div>
            </div>
            {printNotice && (
              <div
                role="status"
                className="px-5 py-3 bg-[#1A1D22] border-t border-white/10 text-xs text-[#F5B700]"
              >
                {printNotice}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
