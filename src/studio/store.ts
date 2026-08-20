'use client';

/**
 * Editor state.
 *
 * Three stores, deliberately separate:
 *  - `useDoc`    the design itself. Undoable.
 *  - `useUI`     selection, slide, panel state. NOT undoable — undo must not
 *                move the user's cursor around.
 *  - `useAssets` uploaded image blobs. NOT undoable — undo must never destroy
 *                a file someone just picked, and Blobs have no business in a
 *                history snapshot.
 */

import { create } from 'zustand';
import { temporal } from 'zundo';
import { nanoid } from 'nanoid';
import type { ColorwayId, SlotId } from '@/brand/tokens';
import type {
  ExtraTextLayer,
  FieldValue,
  FieldValues,
  LayerOverride,
  Overrides,
} from '@/templates/types';

/* -------------------------------------------------------------------- doc */

export interface DocState {
  templateId: string;
  schemaVersion: number;
  colorway: ColorwayId;
  values: FieldValues;
  /** Per-slide overrides of `values` for carousels; index-aligned to slides. */
  slideValues: Record<number, FieldValues>;
  overrides: Overrides;
  extraLayers: ExtraTextLayer[];

  load(init: {
    templateId: string;
    schemaVersion: number;
    colorway: ColorwayId;
    values: FieldValues;
  }): void;
  setField(key: string, value: FieldValue): void;
  setSlideField(slide: number, key: string, value: FieldValue): void;
  setColorway(c: ColorwayId): void;
  patchOverride(layerId: string, patch: Partial<LayerOverride>): void;
  clearOverride(layerId: string): void;
  clearAllOverrides(): void;
  addTextLayer(partial?: Partial<ExtraTextLayer>): string;
  updateTextLayer(id: string, patch: Partial<ExtraTextLayer>): void;
  removeTextLayer(id: string): void;
  reset(values: FieldValues, colorway: ColorwayId): void;
  /** Drop overrides whose layer no longer exists in a fresh compose. */
  pruneOverrides(liveIds: Set<string>): void;
}

const EMPTY_DOC = {
  templateId: '',
  schemaVersion: 1,
  colorway: 'cream' as ColorwayId,
  values: {} as FieldValues,
  slideValues: {} as Record<number, FieldValues>,
  overrides: {} as Overrides,
  extraLayers: [] as ExtraTextLayer[],
};

export const useDoc = create<DocState>()(
  temporal(
    (set) => ({
      ...EMPTY_DOC,

      load: (init) =>
        set({
          ...EMPTY_DOC,
          templateId: init.templateId,
          schemaVersion: init.schemaVersion,
          colorway: init.colorway,
          values: init.values,
        }),

      setField: (key, value) => set((s) => ({ values: { ...s.values, [key]: value } })),

      setSlideField: (slide, key, value) =>
        set((s) => ({
          slideValues: {
            ...s.slideValues,
            [slide]: { ...(s.slideValues[slide] ?? {}), [key]: value },
          },
        })),

      setColorway: (colorway) => set({ colorway }),

      patchOverride: (layerId, patch) =>
        set((s) => ({
          overrides: { ...s.overrides, [layerId]: { ...(s.overrides[layerId] ?? {}), ...patch } },
        })),

      clearOverride: (layerId) =>
        set((s) => {
          const next = { ...s.overrides };
          delete next[layerId];
          return { overrides: next };
        }),

      clearAllOverrides: () => set({ overrides: {} }),

      addTextLayer: (partial) => {
        const id = `free-${nanoid(6)}`;
        set((s) => ({
          extraLayers: [
            ...s.extraLayers,
            {
              id,
              text: 'New text',
              x: 120,
              y: 120,
              w: 600,
              size: 48,
              font: 'ui',
              weight: 600,
              align: 'left',
              slot: 'fg' as SlotId,
              ...partial,
            },
          ],
        }));
        return id;
      },

      updateTextLayer: (id, patch) =>
        set((s) => ({
          extraLayers: s.extraLayers.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        })),

      removeTextLayer: (id) =>
        set((s) => ({ extraLayers: s.extraLayers.filter((l) => l.id !== id) })),

      reset: (values, colorway) =>
        set({ values, colorway, overrides: {}, extraLayers: [], slideValues: {} }),

      // Overrides survive a layer disappearing (toggle a section off and back
      // on and the nudge is still there), but they must not accumulate for
      // ever. Pruning happens on save/export, against a fresh compose.
      pruneOverrides: (liveIds) =>
        set((s) => {
          const next: Overrides = {};
          for (const [id, o] of Object.entries(s.overrides)) if (liveIds.has(id)) next[id] = o;
          return { overrides: next };
        }),
    }),
    {
      limit: 100,
      // Only the design is undoable. Actions and transient state are excluded
      // so a snapshot compares cheaply and restores predictably.
      partialize: (s) => ({
        templateId: s.templateId,
        schemaVersion: s.schemaVersion,
        colorway: s.colorway,
        values: s.values,
        slideValues: s.slideValues,
        overrides: s.overrides,
        extraLayers: s.extraLayers,
      }),
      equality: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    },
  ),
);

/**
 * Bound a continuous gesture (a drag, a slider) into ONE history entry.
 * Without this the throttle alone chunks a drag arbitrarily and undo feels
 * random.
 */
export function withHistoryTransaction<T>(fn: () => T): T {
  const t = useDoc.temporal.getState();
  t.pause();
  try {
    return fn();
  } finally {
    t.resume();
  }
}

/** Commit a single history entry now (call on pointerup / field commit). */
export function commitHistory(): void {
  // zundo records on state change while unpaused; resuming then touching
  // state is what lands the entry. Callers pause, mutate, resume, then commit.
  const t = useDoc.temporal.getState();
  t.resume();
}

/* --------------------------------------------------------------------- ui */

export type InspectorTab = 'content' | 'style' | 'layers' | 'export';

export interface UIState {
  selectedLayerId: string | null;
  slide: number;
  tab: InspectorTab;
  zoom: 'fit' | 'actual';
  exporting: boolean;
  select(id: string | null): void;
  setSlide(n: number): void;
  setTab(t: InspectorTab): void;
  setZoom(z: 'fit' | 'actual'): void;
  setExporting(b: boolean): void;
}

export const useUI = create<UIState>((set) => ({
  selectedLayerId: null,
  slide: 0,
  tab: 'content',
  zoom: 'fit',
  exporting: false,
  select: (selectedLayerId) => set({ selectedLayerId }),
  setSlide: (slide) => set({ slide }),
  setTab: (tab) => set({ tab }),
  setZoom: (zoom) => set({ zoom }),
  setExporting: (exporting) => set({ exporting }),
}));

/* ----------------------------------------------------------------- assets */

export interface StoredAsset {
  id: string;
  name: string;
  mime: string;
  blob: Blob;
  /** Object URL for display. Never revoked while a doc references it. */
  url: string;
  width: number;
  height: number;
}

export interface AssetState {
  assets: Record<string, StoredAsset>;
  add(file: File): Promise<StoredAsset>;
  remove(id: string): void;
  get(id: string): StoredAsset | undefined;
  clear(): void;
}

export const useAssets = create<AssetState>((set, get) => ({
  assets: {},

  add: async (file) => {
    const url = URL.createObjectURL(file);
    const { width, height } = await imageSize(url);
    const asset: StoredAsset = {
      id: `asset-${nanoid(8)}`,
      name: file.name,
      mime: file.type,
      blob: file,
      url,
      width,
      height,
    };
    set((s) => ({ assets: { ...s.assets, [asset.id]: asset } }));
    return asset;
  },

  remove: (id) =>
    set((s) => {
      const a = s.assets[id];
      if (a) URL.revokeObjectURL(a.url);
      const next = { ...s.assets };
      delete next[id];
      return { assets: next };
    }),

  get: (id) => get().assets[id],

  clear: () =>
    set((s) => {
      for (const a of Object.values(s.assets)) URL.revokeObjectURL(a.url);
      return { assets: {} };
    }),
}));

function imageSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = url;
  });
}
