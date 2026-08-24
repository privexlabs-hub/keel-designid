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
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
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

/**
 * One parked design. The template you are *looking at* lives in the flat
 * fields below; every other template you have touched is parked here, so
 * browsing the library rail and coming back does not cost you your work.
 */
export interface DocEntry {
  schemaVersion: number;
  colorway: ColorwayId;
  values: FieldValues;
  slideValues: Record<number, FieldValues>;
  overrides: Overrides;
  extraLayers: ExtraTextLayer[];
  /** Last edit, used to decide what to evict when storage fills. */
  updatedAt: number;
}

export interface DocState {
  templateId: string;
  schemaVersion: number;
  colorway: ColorwayId;
  values: FieldValues;
  /** Per-slide overrides of `values` for carousels; index-aligned to slides. */
  slideValues: Record<number, FieldValues>;
  overrides: Overrides;
  extraLayers: ExtraTextLayer[];

  /**
   * Parked templates, keyed by id — never the active one. Kept beside the flat
   * fields rather than replacing them so that every existing consumer
   * (`LayerPanel` destructures the whole store; `ExportPanel` selects
   * `s.colorway`) keeps working untouched.
   *
   * This is in `persist.partialize` but MUST NOT be in `temporal.partialize`:
   * snapshotting the whole map on every keystroke, then JSON-comparing it 100
   * times over, is how undo gets slow.
   */
  docs: Record<string, DocEntry>;

  load(init: {
    templateId: string;
    schemaVersion: number;
    colorway: ColorwayId;
    values: FieldValues;
  }): void;
  /**
   * Park the current design and open another. Call through
   * `switchTemplateWithHistory` so the switch itself is not an undo step.
   */
  switchTemplate(init: {
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

export const DOC_STORAGE_KEY = 'keel-studio-doc-v1';

/** Raised when local storage is full, so the UI can offer a project file. */
export type QuotaListener = (info: { evicted: number; recovered: boolean }) => void;
let quotaListener: QuotaListener | null = null;
export function onStorageQuota(fn: QuotaListener | null): void {
  quotaListener = fn;
}

/**
 * localStorage, written on a trailing timer.
 *
 * Serialising the whole document map on every keystroke is the obvious way to
 * make typing feel heavy; a 500ms trailing flush costs nothing and is well
 * inside the window where a reload would lose anything.
 *
 * Quota is handled here rather than at the call site: a full disk must never
 * throw into a keystroke. We evict the least recently touched parked designs,
 * retry once, and tell the UI so it can suggest exporting a project file.
 */
function throttledLocalStorage(): StateStorage {
  const pending = new Map<string, string>();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const write = (key: string, value: string): boolean => {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  };

  const flush = () => {
    timer = null;
    for (const [key, value] of pending) {
      if (write(key, value)) continue;

      // Full. Drop the oldest parked designs and try once more.
      let evicted = 0;
      try {
        const parsed = JSON.parse(value) as {
          state?: { docs?: Record<string, DocEntry> };
        };
        const docs = parsed.state?.docs;
        if (docs) {
          const oldest = Object.entries(docs)
            .sort((a, b) => (a[1].updatedAt ?? 0) - (b[1].updatedAt ?? 0))
            .slice(0, Math.max(1, Math.ceil(Object.keys(docs).length / 2)));
          for (const [id] of oldest) {
            delete docs[id];
            evicted++;
          }
          const recovered = write(key, JSON.stringify(parsed));
          quotaListener?.({ evicted, recovered });
          if (recovered) continue;
        }
      } catch {
        /* fall through to the notice below */
      }
      quotaListener?.({ evicted, recovered: false });
    }
    pending.clear();
  };

  return {
    getItem: (key) => {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: (key, value) => {
      pending.set(key, value);
      if (timer === null) timer = setTimeout(flush, 500);
    },
    removeItem: (key) => {
      pending.delete(key);
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* private mode; nothing to clean up */
      }
    },
  };
}

/**
 * The undoable slice of a document.
 *
 * Shared between zundo's `partialize` and the gesture helpers below, so a
 * hand-pushed history entry has exactly the shape zundo would have recorded.
 */
export interface DocSnapshot {
  templateId: string;
  schemaVersion: number;
  colorway: ColorwayId;
  values: FieldValues;
  slideValues: Record<number, FieldValues>;
  overrides: Overrides;
  extraLayers: ExtraTextLayer[];
}

function snapshot(s: DocState): DocSnapshot {
  return {
    templateId: s.templateId,
    schemaVersion: s.schemaVersion,
    colorway: s.colorway,
    values: s.values,
    slideValues: s.slideValues,
    overrides: s.overrides,
    extraLayers: s.extraLayers,
  };
}

/** Snapshot the live fields of a doc state into a parkable entry. */
function park(s: DocState): DocEntry {
  return {
    schemaVersion: s.schemaVersion,
    colorway: s.colorway,
    values: s.values,
    slideValues: s.slideValues,
    overrides: s.overrides,
    extraLayers: s.extraLayers,
    updatedAt: Date.now(),
  };
}

export const useDoc = create<DocState>()(
  persist(
    temporal(
      (set) => ({
        ...EMPTY_DOC,

        docs: {},

        load: (init) =>
          set({
            ...EMPTY_DOC,
            templateId: init.templateId,
            schemaVersion: init.schemaVersion,
            colorway: init.colorway,
            values: init.values,
          }),

        // Park the outgoing design and unpark the incoming one, in a single set()
        // so the two can never be observed half-applied.
        switchTemplate: (init) =>
          set((s) => {
            if (s.templateId === init.templateId) return {};

            const docs = { ...s.docs };
            if (s.templateId) docs[s.templateId] = park(s);

            const saved = docs[init.templateId];
            delete docs[init.templateId];

            if (saved) {
              return {
                docs,
                templateId: init.templateId,
                schemaVersion: saved.schemaVersion,
                colorway: saved.colorway,
                values: saved.values,
                slideValues: saved.slideValues,
                overrides: saved.overrides,
                extraLayers: saved.extraLayers,
              };
            }

            return {
              ...EMPTY_DOC,
              docs,
              templateId: init.templateId,
              schemaVersion: init.schemaVersion,
              colorway: init.colorway,
              values: init.values,
            };
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
            overrides: {
              ...s.overrides,
              [layerId]: { ...(s.overrides[layerId] ?? {}), ...patch },
            },
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
          set((s) => ({
            extraLayers: s.extraLayers.filter((l) => l.id !== id),
          })),

        reset: (values, colorway) =>
          set({
            values,
            colorway,
            overrides: {},
            extraLayers: [],
            slideValues: {},
          }),

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
        // Only the ACTIVE design is undoable. `docs` is deliberately absent:
        // snapshotting every parked template on each keystroke, then
        // JSON-comparing the lot 100 times, is how undo gets slow.
        partialize: snapshot,
        equality: (a, b) => JSON.stringify(a) === JSON.stringify(b),
      },
    ),
    {
      name: DOC_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(throttledLocalStorage),
      // Persistence DOES carry `docs` — the whole point is that every design
      // you have touched survives a reload. Note this is a different list from
      // the temporal partialize above; the two solve different problems.
      partialize: (s) => ({
        templateId: s.templateId,
        schemaVersion: s.schemaVersion,
        colorway: s.colorway,
        values: s.values,
        slideValues: s.slideValues,
        overrides: s.overrides,
        extraLayers: s.extraLayers,
        docs: s.docs,
      }),
      // Rehydration is itself a set(), which zundo would record. Without this
      // the app boots holding one phantom entry whose first undo throws away
      // the session it just restored.
      onRehydrateStorage: () => () => {
        useDoc.temporal.getState().clear();
      },
    },
  ),
);

/**
 * Bracket a continuous gesture — a drag, a slider — so it lands as ONE undo
 * entry instead of one per pointermove.
 *
 * `withHistoryTransaction` is synchronous and cannot span a pointer gesture,
 * so drags use the explicit pair. Call `endGesture()` on pointerup and then
 * apply the final value: that single change is what gets recorded.
 */
const HISTORY_LIMIT = 100;

let gestureFrom: DocSnapshot | null = null;

/**
 * Start a gesture. History stops recording, so the hundreds of intermediate
 * values a drag produces never reach the undo stack.
 */
export function beginGesture(): void {
  if (gestureFrom) return; // already inside one; keep the original start point
  gestureFrom = snapshot(useDoc.getState());
  useDoc.temporal.getState().pause();
}

/**
 * End a gesture and record it as ONE entry.
 *
 * Pausing alone is not enough: zundo records nothing while paused, so a slider
 * drag would end up with no history at all and could not be undone. We
 * therefore push the pre-gesture snapshot ourselves, which is exactly the
 * entry zundo would have written had the whole drag been a single change.
 */
export function endGesture(): void {
  const from = gestureFrom;
  gestureFrom = null;

  const temporal = useDoc.temporal.getState();
  temporal.resume();
  if (!from) return;

  const to = snapshot(useDoc.getState());
  if (JSON.stringify(from) === JSON.stringify(to)) return; // nothing moved

  useDoc.temporal.setState((prev) => ({
    ...prev,
    pastStates: [...prev.pastStates, from].slice(-HISTORY_LIMIT),
    futureStates: [],
  }));
}

/** Bound a synchronous burst of changes into one history entry. */
export function withHistoryTransaction<T>(fn: () => T): T {
  beginGesture();
  try {
    return fn();
  } finally {
    endGesture();
  }
}

/**
 * Undo stacks, kept per template.
 *
 * `templateId` is inside the undoable snapshot, so a single shared stack would
 * let undo restore another template's values while the rail still shows this
 * one. Parking the stacks alongside the parked documents keeps undo meaning
 * "the last thing I did to THIS design".
 */
const HISTORY = new Map<string, { pastStates: unknown[]; futureStates: unknown[] }>();


/**
 * Switch templates without the switch itself becoming an undo step, carrying
 * each template's history with it.
 */
export function switchTemplateWithHistory(init: {
  templateId: string;
  schemaVersion: number;
  colorway: ColorwayId;
  values: FieldValues;
}): void {
  const previousId = useDoc.getState().templateId;
  if (previousId === init.templateId) return;

  const temporal = useDoc.temporal.getState();
  if (previousId) {
    HISTORY.set(previousId, {
      pastStates: [...temporal.pastStates],
      futureStates: [...temporal.futureStates],
    });
  }

  withHistoryTransaction(() => useDoc.getState().switchTemplate(init));

  const restored = HISTORY.get(init.templateId);
  HISTORY.delete(init.templateId);
  useDoc.temporal.setState((prev) => ({
    ...prev,
    pastStates: (restored?.pastStates ?? []) as typeof prev.pastStates,
    futureStates: (restored?.futureStates ?? []) as typeof prev.futureStates,
  }));
}

/** Drop every stored history stack. Used when a project file is imported. */
export function clearAllHistory(): void {
  HISTORY.clear();
  useDoc.temporal.getState().clear();
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
  /** Draw the canvas safe-area margins. Default on where a canvas declares them. */
  guides: boolean;
  exporting: boolean;
  select(id: string | null): void;
  setSlide(n: number): void;
  setTab(t: InspectorTab): void;
  setZoom(z: 'fit' | 'actual'): void;
  setGuides(b: boolean): void;
  setExporting(b: boolean): void;
}

export const useUI = create<UIState>((set) => ({
  selectedLayerId: null,
  slide: 0,
  tab: 'content',
  zoom: 'fit',
  guides: true,
  exporting: false,
  select: (selectedLayerId) => set({ selectedLayerId }),
  setSlide: (slide) => set({ slide }),
  setTab: (tab) => set({ tab }),
  setZoom: (zoom) => set({ zoom }),
  setGuides: (guides) => set({ guides }),
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
