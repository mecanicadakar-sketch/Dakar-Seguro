import { PlanId } from '../data/membershipData';

export interface PrintableCardData {
  ownerName: string;
  plate: string;
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
    img.src = '/assets/aistudio/Tarjeta_Club_Mec_nica_Dakar_310c2d09.png';
  });

  const width = img.naturalWidth || 1672;
  const height = img.naturalHeight || 940;

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
  ctx.font = '700 32px "DM Sans", Arial, sans-serif';
  ctx.fillText(data.ownerName.trim(), width * 0.356, height * 0.483, width * 0.375);

  // Chapa del Vehículo
  ctx.font = '700 32px "IBM Plex Mono", monospace';
  ctx.fillText(
    data.plate.trim().toUpperCase(),
    width * 0.356,
    height * 0.571,
    width * 0.375
  );

  // Plan Checkmark (A = Basico, B = Platino, C = Oro)
  ctx.font = '700 42px Arial, sans-serif';
  ctx.textAlign = 'center';
  if (data.planId === 'basico') {
    ctx.fillText('✓', width * 0.361, height * 0.657);
  } else if (data.planId === 'platino') {
    ctx.fillText('✓', width * 0.488, height * 0.657);
  } else if (data.planId === 'oro') {
    ctx.fillText('✓', width * 0.610, height * 0.657);
  }

  // N° de Afiliado
  ctx.textAlign = 'left';
  ctx.font = '700 32px "IBM Plex Mono", monospace';
  ctx.fillText(
    data.memberNumber.trim().toUpperCase(),
    width * 0.356,
    height * 0.738,
    width * 0.375
  );

  // Vencimiento white cover & date
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(width * 0.355, height * 0.793, width * 0.320, height * 0.059);
  ctx.fillStyle = '#0A0B0D';
  ctx.textAlign = 'center';
  ctx.font = '700 30px "IBM Plex Mono", monospace';
  const parts = formatDateParts(data.expirationDateIso);
  ctx.fillText(`${parts.d} / ${parts.m} / ${parts.y}`, width * 0.515, height * 0.823);

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
