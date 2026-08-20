/**
 * Template engine contracts.
 *
 * Everything in this file is either serialisable data or a pure function over
 * serialisable data. The editor phase persists `FieldValues` + `Overrides` per
 * saved design and re-derives the layer tree by calling `compose()` again, so
 * nothing here may capture React nodes, closures over live state, or time.
 */
import type { ColorwayId, FontRole, SlotId } from '@/brand/tokens';
import { ICON_SHAPES, type IconName } from '@/brand/icons';
import type { BlockPropsMap } from './blocks/props';
import type { LayoutId, LayoutOptions, SlotName } from './layouts/kinds';

export type { ColorwayId, SlotId, FontRole } from '@/brand/tokens';
export type { IconName } from '@/brand/icons';
export type { LayoutId, LayoutOptions, SlotName } from './layouts/kinds';
export type { BlockPropsMap } from './blocks/props';
export type {
  Align,
  AvatarRowItem,
  ChecklistItem,
  ComparisonRow,
  StatRowItem,
  TextSlot,
} from './blocks/props';

/* ------------------------------------------------------------------ canvas */

/** Masks applied to the whole stage. Avatars crop to a circle. */
export type CanvasMask = 'circle' | 'rounded';

/** Insets (design px) that platform chrome covers. Content must clear them. */
export interface SafeArea {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface CanvasSpec {
  id: CanvasId;
  /** Human label for the gallery and the export filename. */
  label: string;
  /** Exact export width in design px. */
  w: number;
  /** Exact export height in design px. */
  h: number;
  /**
   * Type-ramp multiplier. NOT a resolution factor — a viewing-distance factor.
   * A 1280x720 thumbnail is read at ~360px wide, so its type must be far larger
   * relative to the canvas than a square post that is read at ~500px. A
   * 1128x191 LinkedIn cover is wide but shallow, so it needs a much smaller one.
   */
  ramp: number;
  /** Default outer padding in design px. Layouts consume it. */
  pad: number;
  /** Platform chrome insets, added on top of `pad` by layouts. */
  safe?: SafeArea;
  mask?: CanvasMask;
  /** Where this canvas is published; shown in the gallery. */
  note?: string;
}

export type CanvasId =
  | 'square1080'
  | 'portrait1350'
  | 'story1920'
  | 'carousel1080'
  | 'landscape1920'
  | 'thumb1280'
  | 'og1200'
  | 'emailHeader1200'
  | 'xheader1500'
  | 'linkedinCover1128'
  | 'fbCover1640'
  | 'ytBanner2560'
  | 'podcast3000'
  | 'avatar400';

/* -------------------------------------------------------------------- ramp */

/**
 * One type ramp in design px, already multiplied by `canvas.ramp`.
 * Blocks read these values; there are deliberately no per-canvas block
 * variants, because 130 templates x 14 canvases of variants is unmaintainable.
 */
export interface TypeRamp {
  display: number;
  h1: number;
  h2: number;
  h3: number;
  subhead: number;
  lead: number;
  body: number;
  small: number;
  micro: number;
  eyebrow: number;
  stat: number;
  statSmall: number;
  quote: number;
  /** Base spacing unit, scaled with the ramp so gaps track type size. */
  unit: number;
}

/* ------------------------------------------------------------------ fields */

interface FieldBase {
  /** Key into `FieldValues`. Stable — renaming one orphans saved designs. */
  key: string;
  label: string;
  /** Inspector help text. */
  hint?: string;
  /** Inspector grouping, e.g. 'Content' / 'Style'. */
  group?: string;
  /** Only editable on this slide (carousels). */
  slide?: number;
}

export interface TextField extends FieldBase {
  kind: 'text';
  max?: number;
  placeholder?: string;
}
export interface LongTextField extends FieldBase {
  kind: 'longtext';
  max?: number;
  rows?: number;
  placeholder?: string;
}
export interface NumberField extends FieldBase {
  kind: 'number';
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}
export interface SelectField extends FieldBase {
  kind: 'select';
  options: { value: string; label: string }[];
}
export interface BooleanField extends FieldBase {
  kind: 'boolean';
}
/** A colour the author may pick — constrained to colorway slot ids, never hex. */
export interface ColorField extends FieldBase {
  kind: 'color';
  slots: SlotId[];
}
export interface IconField extends FieldBase {
  kind: 'icon';
  /** Subset of the 17; omit to allow all. */
  options?: IconName[];
}
export interface ImageField extends FieldBase {
  kind: 'image';
  /** Advisory aspect ratio for the cropper, w/h. */
  aspect?: number;
}
export interface ListField extends FieldBase {
  kind: 'list';
  /** Nested field defs, applied per item. */
  fields: FieldDef[];
  min: number;
  max: number;
  /**
   * Which nested field supplies the stable item key when a new row is created.
   * The engine also stamps an opaque `_k` on every item; see `itemKey()`.
   */
  labelKey?: string;
}

export type FieldDef =
  | TextField
  | LongTextField
  | NumberField
  | SelectField
  | BooleanField
  | ColorField
  | IconField
  | ImageField
  | ListField;

export type FieldKind = FieldDef['kind'];

/** A list row. `_k` is the engine-owned stable key (see `itemKey`). */
export interface ListItemValue {
  _k: string;
  [key: string]: FieldValue;
}

export type FieldValue = string | number | boolean | ListItemValue[];

export type FieldValues = Record<string, FieldValue>;

/* ------------------------------------------------------------------ layers */

export type BlockId = keyof BlockPropsMap;

/**
 * One node of the render tree.
 *
 * `id` MUST be deterministic and position-independent: derive it from the
 * layer's role, plus the slide, plus the repeat item's stable key. Never from
 * an array index — an index-keyed id silently transfers one layer's saved
 * override onto a different layer the moment a list is reordered, and the user
 * sees a nudge they made to row 3 jump to row 1.
 */
export interface LayerNode<K extends BlockId = BlockId> {
  id: string;
  block: K;
  props: BlockPropsMap[K];
  children?: LayerNode[];
  /** Which layout slot this node is placed into. Defaults to 'body'. */
  slot?: SlotName;
  /** Locked layers refuse drag/hide in the editor (e.g. legal footers). */
  locked?: boolean;
}

/** Per-layer user adjustments, applied by an outer wrapper, never by blocks. */
export interface LayerOverride {
  /** Translation in design px. */
  dx?: number;
  dy?: number;
  scale?: number;
  hidden?: boolean;
  /** Absolute font size in design px, overriding the ramp for this layer. */
  fontSize?: number;
  colorSlot?: SlotId;
  align?: 'left' | 'center' | 'right';
  z?: number;
}

export type Overrides = Record<string, LayerOverride>;

/** A free-form text layer the user added, positioned in design px. */
export interface ExtraTextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  w?: number;
  size: number;
  slot?: SlotId;
  weight?: number;
  font?: FontRole;
  align?: 'left' | 'center' | 'right';
  tracking?: number;
}

/* ----------------------------------------------------------------- compose */

export interface ComposeCtx {
  canvas: CanvasSpec;
  colorway: ColorwayId;
  /** 1-based slide number for multi-slide templates; undefined otherwise. */
  slide?: number;
  t: TypeRamp;
}

export interface LayoutSpec {
  id: LayoutId;
  options?: LayoutOptions;
}

export type TemplateCategory =
  | 'square'
  | 'engagement'
  | 'carousel'
  | 'story'
  | 'portrait'
  | 'thumbnail'
  | 'cover'
  | 'avatar'
  | 'ad'
  | 'email'
  | 'web';

/**
 * Optional SVG hints. The SVG exporter measures the live DOM for geometry; a
 * template only supplies things the DOM cannot express as plain boxes and text
 * (gradient defs, clip paths). Returned markup is inserted into <defs>.
 */
export interface SvgHints {
  defs?: string;
  /** Ids in `defs` referenced by the stage background, in paint order. */
  backgroundFill?: string;
}

export interface TemplateDef {
  id: string;
  name: string;
  /** One line for the gallery card. */
  description: string;
  category: TemplateCategory;
  canvas: CanvasSpec;
  layout: LayoutSpec;
  /** Allowed colorways; the first is the default. */
  colorways: ColorwayId[];
  fields: FieldDef[];
  defaults: FieldValues;
  /** Slide count for carousels. Undefined means a single-frame template. */
  slides?: number;
  /** Bump when `fields` change shape so saved designs can be migrated. */
  schemaVersion: number;
  /**
   * PURE. Same (fields, ctx) must always yield the same tree — no Math.random,
   * no Date.now, no reads of module-level mutable state. The editor calls this
   * on every keystroke and the exporter calls it again in a fresh context; a
   * non-deterministic compose means the preview and the export disagree.
   */
  compose(fields: FieldValues, ctx: ComposeCtx): LayerNode[];
  svg?(fields: FieldValues, ctx: ComposeCtx): SvgHints;
}

/* ------------------------------------------------------- authoring helpers */

/**
 * Deterministic, position-independent layer id.
 *   layerId('headline')                       -> 'headline'
 *   layerId('headline', { slide: 3 })         -> 's3.headline'
 *   layerId('bullet', { slide: 3, key: 'a7' })-> 's3.bullet@a7'
 */
export function layerId(role: string, opts?: { slide?: number; key?: string }): string {
  const slide = opts?.slide === undefined ? '' : `s${opts.slide}.`;
  const key = opts?.key === undefined ? '' : `@${opts.key}`;
  return `${slide}${role}${key}`;
}

/**
 * The stable key of a list row. Uses the engine-owned `_k` when present and
 * falls back to a content hash — never the array index.
 */
export function itemKey(item: ListItemValue, fallbackField = 'text'): string {
  if (typeof item._k === 'string' && item._k.length > 0) return item._k;
  const seed = item[fallbackField];
  return typeof seed === 'string' ? hashKey(seed) : hashKey(JSON.stringify(item));
}

/** Small stable string hash. Deterministic across processes — no randomness. */
export function hashKey(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

/** Typed layer constructor — keeps `block` and `props` correlated. */
export function layer<K extends BlockId>(
  id: string,
  block: K,
  props: BlockPropsMap[K],
  extra?: { slot?: SlotName; children?: LayerNode[]; locked?: boolean },
): LayerNode<K> {
  return { id, block, props, ...extra };
}

/* ------------------------------------------------- field-value accessors */

export function str(f: FieldValues, key: string, fallback = ''): string {
  const v = f[key];
  return typeof v === 'string' ? v : fallback;
}
export function num(f: FieldValues, key: string, fallback = 0): number {
  const v = f[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}
export function bool(f: FieldValues, key: string, fallback = false): boolean {
  const v = f[key];
  return typeof v === 'boolean' ? v : fallback;
}
export function list(f: FieldValues, key: string): ListItemValue[] {
  const v = f[key];
  return Array.isArray(v) ? v : [];
}
export function icon(f: FieldValues, key: string, fallback: IconName): IconName {
  const v = f[key];
  return typeof v === 'string' && Object.hasOwn(ICON_SHAPES, v) ? (v as IconName) : fallback;
}
