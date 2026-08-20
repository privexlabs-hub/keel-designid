/**
 * The Keel icon set — 17 icons, path data lifted verbatim from the imported
 * design source (Keel.dc.html `ICONS`).
 *
 * Icons are React components, not files: they inherit currentColor and
 * rasterise during export with no network fetch.
 *
 * NOTE: the bundled font subsets do NOT include U+2192 (→), U+2190 (←) or
 * U+2713 (✓). Use ChevronRight / ArrowUp / Check icons instead of those
 * characters anywhere text is rendered. `npm run lint:glyphs` enforces this.
 */
import type { SVGProps } from 'react';

type Shape =
  | ['path', { d: string }]
  | ['circle', { cx: number; cy: number; r: number }]
  | ['line', { x1: number; x2: number; y1: number; y2: number }]
  | ['rect', { width: number; height: number; x: number; y: number; rx: number; ry: number }]
  | ['polyline', { points: string }];

export const ICON_SHAPES = {
  gauge: [['path', { d: 'm12 14 4-4' }], ['path', { d: 'M3.34 19a10 10 0 1 1 17.32 0' }]],
  share2: [
    ['circle', { cx: 18, cy: 5, r: 3 }],
    ['circle', { cx: 6, cy: 12, r: 3 }],
    ['circle', { cx: 18, cy: 19, r: 3 }],
    ['line', { x1: 8.59, x2: 15.42, y1: 13.51, y2: 17.49 }],
    ['line', { x1: 15.41, x2: 8.59, y1: 6.51, y2: 10.49 }],
  ],
  gitBranch: [
    ['line', { x1: 6, x2: 6, y1: 3, y2: 15 }],
    ['circle', { cx: 18, cy: 6, r: 3 }],
    ['circle', { cx: 6, cy: 18, r: 3 }],
    ['path', { d: 'M18 9a9 9 0 0 1-9 9' }],
  ],
  alert: [
    ['path', { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' }],
    ['path', { d: 'M12 9v4' }],
    ['path', { d: 'M12 17h.01' }],
  ],
  shield: [
    ['path', { d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z' }],
    ['path', { d: 'm9 12 2 2 4-4' }],
  ],
  file: [
    ['path', { d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' }],
    ['path', { d: 'M14 2v4a2 2 0 0 0 2 2h4' }],
    ['path', { d: 'M16 13H8' }],
    ['path', { d: 'M16 17H8' }],
    ['path', { d: 'M10 9H8' }],
  ],
  clipCheck: [
    ['rect', { width: 8, height: 4, x: 8, y: 2, rx: 1, ry: 1 }],
    ['path', { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' }],
    ['path', { d: 'm9 14 2 2 4-4' }],
  ],
  trending: [
    ['polyline', { points: '22 7 13.5 15.5 8.5 10.5 2 17' }],
    ['polyline', { points: '16 7 22 7 22 13' }],
  ],
  clipList: [
    ['rect', { width: 8, height: 4, x: 8, y: 2, rx: 1, ry: 1 }],
    ['path', { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' }],
    ['path', { d: 'M12 11h4' }],
    ['path', { d: 'M12 16h4' }],
    ['path', { d: 'M8 11h.01' }],
    ['path', { d: 'M8 16h.01' }],
  ],
  wrench: [
    ['path', { d: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' }],
  ],
  layers: [
    ['path', { d: 'm12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z' }],
    ['path', { d: 'm22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65' }],
    ['path', { d: 'm22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65' }],
  ],
  chevronRight: [['path', { d: 'm9 18 6-6-6-6' }]],
  search: [['circle', { cx: 11, cy: 11, r: 8 }], ['path', { d: 'm21 21-4.3-4.3' }]],
  arrowUp: [['path', { d: 'm5 12 7-7 7 7' }], ['path', { d: 'M12 19V5' }]],
  arrowDown: [['path', { d: 'M12 5v14' }], ['path', { d: 'm19 12-7 7-7-7' }]],
  minus: [['path', { d: 'M5 12h14' }]],
  x: [['path', { d: 'M18 6 6 18' }], ['path', { d: 'm6 6 12 12' }]],
} satisfies Record<string, Shape[]>;

export type IconName = keyof typeof ICON_SHAPES;

export const ICON_NAMES = Object.keys(ICON_SHAPES) as IconName[];

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'stroke'> {
  name: IconName;
  /** Rendered square size in px. Source default is 18. */
  size?: number;
  /** Stroke width. Source default is 1.75. */
  stroke?: number;
}

export function Icon({ name, size = 18, stroke = 1.75, ...rest }: IconProps) {
  const shapes = ICON_SHAPES[name] as Shape[];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={rest['aria-label'] ? undefined : true}
      focusable="false"
      {...rest}
    >
      {shapes.map(([tag, attrs], i) => {
        switch (tag) {
          case 'path':
            return <path key={i} {...attrs} />;
          case 'circle':
            return <circle key={i} {...attrs} />;
          case 'line':
            return <line key={i} {...attrs} />;
          case 'rect':
            return <rect key={i} {...attrs} />;
          case 'polyline':
            return <polyline key={i} {...attrs} />;
        }
      })}
    </svg>
  );
}
