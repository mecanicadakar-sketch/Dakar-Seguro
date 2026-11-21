import { PlanId } from '../data/membershipData';

export interface PrintableCardData {
  ownerName: string;
  plate: string;
  vehicleInfo: string;
  planId: PlanId;
  memberNumber: string;
  expirationDateIso: string;
}

function formatDateParts(isoDate: string): { d: string; m: string; y: string } {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return { d: '--', m: '--', y: '----' };
  return { d: parts[2], m: parts[1], y: parts[0] };
}

export async function downloadClubCardPng(data: PrintableCardData): Promise<void> {
  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('No se pudo cargar la imagen base de la tarjeta.'));
    img.src = '/assets/aistudio/mecanica_dakar_tarjeta_qr_56bdacf3.png';
  });

  const width = img.naturalWidth || 1672;
  const height = img.naturalHeight || 941;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('El navegador no soporta renderizado de tarjeta.');
  }

  ctx.drawImage(img, 0, 0, width, height);

  ctx.fillStyle = '#0A0B0D';
  ctx.textBaseline = 'middle';

  // Nombre del Titular
  ctx.font = '700 30px "DM Sans", Arial, sans-serif';
  ctx.fillText(data.ownerName.trim(), width * 0.356, height * 0.429, width * 0.380);

  // Chapa del Vehículo
  ctx.font = '700 30px "IBM Plex Mono", monospace';
  ctx.fillText(
    data.plate.trim().toUpperCase(),
    width * 0.356,
    height * 0.505,
    width * 0.380
  );

  // Vehículo (Tipo + Marca/modelo + Año)
  ctx.font = '700 27px "DM Sans", Arial, sans-serif';
  ctx.fillText(
    data.vehicleInfo.trim(),
    width * 0.356,
    height * 0.578,
    width * 0.380
  );

  // Plan Checkmark (A = Basico, B = Platino, C = Oro)
  ctx.font = '700 38px Arial, sans-serif';
  ctx.textAlign = 'center';
  if (data.planId === 'basico') {
    ctx.fillText('✓', width * 0.362, height * 0.650);
  } else if (data.planId === 'platino') {
    ctx.fillText('✓', width * 0.488, height * 0.650);
  } else if (data.planId === 'oro') {
    ctx.fillText('✓', width * 0.613, height * 0.650);
  }

  // N° de Afiliado
  ctx.textAlign = 'left';
  ctx.font = '700 30px "IBM Plex Mono", monospace';
  ctx.fillText(
    data.memberNumber.trim().toUpperCase(),
    width * 0.356,
    height * 0.720,
    width * 0.380
  );

  // Vencimiento white cover & date
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(width * 0.352, height * 0.766, width * 0.322, height * 0.054);
  ctx.fillStyle = '#0A0B0D';
  ctx.textAlign = 'center';
  ctx.font = '700 28px "IBM Plex Mono", monospace';
  const parts = formatDateParts(data.expirationDateIso);
  ctx.fillText(`${parts.d} / ${parts.m} / ${parts.y}`, width * 0.513, height * 0.794);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png')
  );
  if (!blob) {
    throw new Error('No se pudo generar el archivo PNG.');
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeCode = (data.memberNumber.trim() || 'afiliado').replace(/[^a-zA-Z0-9_-]/g, '');
  link.href = url;
  link.download = `Tarjeta-Mecanica-Dakar-${safeCode}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
