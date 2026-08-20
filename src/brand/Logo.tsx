/**
 * The Keel mark and its lockups.
 *
 * Geometry is verbatim from the imported source: a stroked chevron with a
 * horizontal crossbar — a hull cutting a waterline.
 *   hull:      M5 5 L12 19 L19 5
 *   waterline: M3.5 8.5 H20.5
 * stroke-width 1.9, round caps/joins, on a 24x24 viewBox.
 *
 * Rendered inline rather than as an <img> so it inherits currentColor and
 * rasterises during export without a network fetch. The files under
 * public/assets/logo/ exist as downloadable deliverables, not runtime deps.
 */
import type { SVGProps } from 'react';

export const MARK_VIEWBOX = '0 0 24 24';
export const MARK_HULL_PATH = 'M5 5 L12 19 L19 5';
export const MARK_WATERLINE_PATH = 'M3.5 8.5 H20.5';
export const MARK_STROKE_WIDTH = 1.9;

export interface MarkProps extends Omit<SVGProps<SVGSVGElement>, 'stroke'> {
  size?: number;
  /** Stroke width in viewBox units. */
  stroke?: number;
}

/** The bare mark. Colour comes from currentColor unless overridden. */
export function KeelMark({ size = 24, stroke = MARK_STROKE_WIDTH, ...rest }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={MARK_VIEWBOX}
      fill="none"
      aria-hidden={rest['aria-label'] ? undefined : true}
      focusable="false"
      {...rest}
    >
      <path
        d={MARK_HULL_PATH}
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d={MARK_WATERLINE_PATH} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
    </svg>
  );
}

export type LockupVariant = 'horizontal' | 'stacked' | 'mark';

export interface LockupProps {
  variant?: LockupVariant;
  /** Mark size in px; the wordmark scales from it. */
  size?: number;
  /** The uppercase descriptor under the wordmark. Pass null to omit. */
  subtitle?: string | null;
  className?: string;
}

/**
 * Mark + "Keel" wordmark. Proportions follow the source sidebar lockup:
 * 24px mark, 11px gap, Newsreader 21px/600 at 0.005em, with a 10px
 * uppercase subtitle tracked at 0.09em.
 */
export function KeelLockup({
  variant = 'horizontal',
  size = 24,
  subtitle = 'Management system',
  className,
}: LockupProps) {
  if (variant === 'mark') return <KeelMark size={size} className={className} />;

  const k = size / 24;
  const stacked = variant === 'stacked';

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: stacked ? 'center' : 'center',
        flexDirection: stacked ? 'column' : 'row',
        gap: stacked ? 8 * k : 11 * k,
        lineHeight: 1.15,
      }}
    >
      <KeelMark size={size} />
      <span
        style={{
          display: 'flex',
          flexDirection: 'column',
          lineHeight: 1.15,
          alignItems: stacked ? 'center' : 'flex-start',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 21 * k,
            letterSpacing: '0.005em',
          }}
        >
          Keel
        </span>
        {subtitle ? (
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 10 * k,
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              opacity: 0.66,
            }}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}
