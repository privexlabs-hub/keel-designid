'use client';

/**
 * Shared modal plumbing for the mobile nav drawer and the detail drawer:
 * Escape to close, a focus trap, focus restore, and a body scroll lock.
 *
 * Written once because two surfaces need identical behaviour and getting the
 * trap subtly different between them is exactly how keyboard users get stuck.
 */
import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function useDialogBehaviour(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onClose: () => void,
  { lockScroll = true }: { lockScroll?: boolean } = {},
) {
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    restoreTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusables = () => Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first = focusables()[0];
    (first ?? node).focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      const activeEl = document.activeElement;
      if (e.shiftKey && (activeEl === firstEl || !node.contains(activeEl))) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && activeEl === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);

    let previousOverflow = '';
    if (lockScroll) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      if (lockScroll) document.body.style.overflow = previousOverflow;
      restoreTo.current?.focus({ preventScroll: true });
    };
  }, [active, ref, onClose, lockScroll]);
}
