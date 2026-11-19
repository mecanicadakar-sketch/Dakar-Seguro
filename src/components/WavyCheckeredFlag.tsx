import { useId } from 'react';

interface WavyCheckeredFlagProps {
  className?: string;
}

function getFlagPoint(u: number, v: number): [number, number] {
  const xTop = 120 + 460 * u;
  const yTop = -125 + 95 * u;

  const xBot = 45 + 480 * u;
  const yBot = -10 + 230 * Math.pow(u, 1.15);

  const waveX = Math.sin(u * Math.PI * 2.2 + v * 1.3) * 14 * (0.25 + 0.75 * v);
  const waveY = Math.sin(u * Math.PI * 2.6 - v * 0.85) * 16 * (0.25 + 0.75 * v);

  const x = xTop * (1 - v) + xBot * v + waveX;
  const y = yTop * (1 - v) + yBot * v + waveY;

  return [x, y];
}

function buildCurvedCellPath(
  u0: number,
  u1: number,
  v0: number,
  v1: number
): string {
  const steps = 4;
  const points: [number, number][] = [];

  for (let i = 0; i <= steps; i++) {
    points.push(getFlagPoint(u0 + ((u1 - u0) * i) / steps, v0));
  }
  for (let i = 1; i <= steps; i++) {
    points.push(getFlagPoint(u1, v0 + ((v1 - v0) * i) / steps));
  }
  for (let i = 1; i <= steps; i++) {
    points.push(getFlagPoint(u1 - ((u1 - u0) * i) / steps, v1));
  }
  for (let i = 1; i < steps; i++) {
    points.push(getFlagPoint(u0, v1 - ((v1 - v0) * i) / steps));
  }

  return (
    points
      .map(
        ([px, py], idx) =>
          `${idx === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`
      )
      .join(' ') + ' Z'
  );
}

export function WavyCheckeredFlag({ className = '' }: WavyCheckeredFlagProps) {
  const rawId = useId().replace(/:/g, '');
  const clipId = `flag-clip-${rawId}`;
  const goldGradId = `flag-gold-${rawId}`;
  const sheenGradId = `flag-sheen-${rawId}`;

  const cols = 7;
  const rows = 5;

  // Build smooth bottom edge of the checkered cloth
  const waveSamples = 24;
  const bottomPts: [number, number][] = [];
  for (let i = 0; i <= waveSamples; i++) {
    bottomPts.push(getFlagPoint(i / waveSamples, 1));
  }

  const clipPathD = [
    `M${bottomPts[0][0].toFixed(1)},${bottomPts[0][1].toFixed(1)}`,
    ...bottomPts
      .slice(1)
      .map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`),
    'L580,-35',
    'L110,-135',
    'Z',
  ].join(' ');

  // Sweeping gold racing stripe hugging the wavy lower border, widening gracefully toward right
  const ribbonBottomPts = bottomPts.map(([x, y], idx) => {
    const t = idx / waveSamples;
    const thickness = 4 + 26 * Math.pow(t, 1.35);
    return [x - thickness * 0.2, y + thickness] as [number, number];
  });

  const goldRibbonD = [
    `M${bottomPts[0][0].toFixed(1)},${bottomPts[0][1].toFixed(1)}`,
    ...bottomPts
      .slice(1)
      .map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`),
    ...[...ribbonBottomPts]
      .reverse()
      .map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`),
    'Z',
  ].join(' ');

  // Secondary thin dark & metallic trim below the gold curve
  const outerTrimPts = bottomPts.map(([x, y], idx) => {
    const t = idx / waveSamples;
    const thickness = 8 + 38 * Math.pow(t, 1.35);
    return [x - thickness * 0.25, y + thickness] as [number, number];
  });

  const darkTrimD = [
    `M${ribbonBottomPts[0][0].toFixed(1)},${ribbonBottomPts[0][1].toFixed(1)}`,
    ...ribbonBottomPts
      .slice(1)
      .map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`),
    ...[...outerTrimPts]
      .reverse()
      .map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`),
    'Z',
  ].join(' ');

  const cells: { d: string; isDark: boolean; key: string }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const u0 = c / cols;
      const u1 = (c + 1) / cols;
      const v0 = r / rows;
      const v1 = (r + 1) / rows;
      cells.push({
        key: `${r}-${c}`,
        d: buildCurvedCellPath(u0, u1, v0, v1),
        isDark: (r + c) % 2 === 1,
      });
    }
  }

  return (
    <svg
      viewBox="0 0 500 280"
      preserveAspectRatio="xMaxYMin slice"
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={clipPathD} />
        </clipPath>

        <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE15A" />
          <stop offset="50%" stopColor="#F5B700" />
          <stop offset="100%" stopColor="#C98900" />
        </linearGradient>

        {/* Satin wave shading across folds */}
        <linearGradient id={sheenGradId} x1="0%" y1="0%" x2="95%" y2="85%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
          <stop offset="28%" stopColor="#000000" stopOpacity="0.22" />
          <stop offset="54%" stopColor="#FFFFFF" stopOpacity="0.26" />
          <stop offset="78%" stopColor="#000000" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.14" />
        </linearGradient>
      </defs>

      {/* Dark shadow/backing sweep underneath */}
      <path d={darkTrimD} fill="#0A0B0D" opacity="0.92" />

      {/* Wavy checkered flag fabric */}
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="-140" width="600" height="440" fill="#F5F5F3" />
        {cells.map((cell) => (
          <path
            key={cell.key}
            d={cell.d}
            fill={cell.isDark ? '#0B0C0F' : '#FFFFFF'}
            stroke={cell.isDark ? '#0B0C0F' : '#FFFFFF'}
            strokeWidth="0.6"
          />
        ))}
        <path d={clipPathD} fill={`url(#${sheenGradId})`} />
      </g>

      {/* Signature curved gold/yellow racing ribbon along the bottom wave */}
      <path d={goldRibbonD} fill={`url(#${goldGradId})`} />

      {/* Crisp thin highlight edge */}
      <path
        d={`M${bottomPts[0][0].toFixed(1)},${bottomPts[0][1].toFixed(1)} ` +
          bottomPts
            .slice(1)
            .map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`)
            .join(' ')}
        fill="none"
        stroke="#FFF3B0"
        strokeWidth="1.2"
        opacity="0.7"
      />
    </svg>
  );
}
