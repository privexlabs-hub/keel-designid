/**
 * Module-level cache for template definitions.
 *
 * The library rail can show every template in the catalogue at once. Without a
 * cache, each scroll into view re-runs the dynamic `import()` for that id —
 * cheap after the first (the module graph is already resolved) but it still
 * churns promises and re-enters React state on every intersection.
 *
 * A `TemplateDef` is a closure plus literals, so entries are never evicted;
 * holding the whole catalogue costs far less than one mounted stage.
 */
import { loadTemplate } from '../registry';
import type { TemplateDef } from '../types';

const cache = new Map<string, Promise<TemplateDef>>();

/** `loadTemplate`, deduplicated per id. Rejections are not cached. */
export function loadTemplateCached(id: string): Promise<TemplateDef> {
  const hit = cache.get(id);
  if (hit) return hit;

  const promise = loadTemplate(id).catch((err: unknown) => {
    // A failed import must not poison the cache — a retry should be able to
    // succeed (a transient chunk-load failure is the realistic case).
    cache.delete(id);
    throw err;
  });

  cache.set(id, promise);
  return promise;
}

/** Already-resolved definitions, for callers that can render synchronously. */
export function peekTemplate(id: string): Promise<TemplateDef> | undefined {
  return cache.get(id);
}
