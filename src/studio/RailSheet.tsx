'use client';

/**
 * The library rail as a sheet, for widths that cannot spare a permanent column.
 *
 * It mounts the SAME `LibraryRail` the desktop layout uses rather than a
 * reduced mobile variant — one component, one behaviour, no second thing to
 * keep in step.
 *
 * Focus trapping, Escape, focus restore and the scroll lock come from
 * `useDialogBehaviour`, already carrying the dashboard's nav drawer and detail
 * drawer.
 */
import { useRef } from 'react';
import { Icon } from '@/brand/icons';
import { useDialogBehaviour } from '@/components/dashboard/useDialogBehaviour';
import { LibraryRail } from './LibraryRail';

export interface RailSheetProps {
  open: boolean;
  onClose: () => void;
  activeId: string;
  onPick: (id: string) => void;
}

export function RailSheet({ open, onClose, activeId, onPick }: RailSheetProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  useDialogBehaviour(panelRef, open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 xl:hidden">
      <button
        type="button"
        aria-label="Close the template library"
        onClick={onClose}
        className="absolute inset-0 border-none"
        style={{ background: 'var(--scrim)', animation: 'kf-scrim 160ms var(--ease-out)' }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Template library"
        tabIndex={-1}
        className="absolute top-0 left-0 flex h-full flex-col bg-surface-1 outline-none"
        style={{
          // Never wider than the viewport allows — a fixed 288px panel on a
          // 320px screen leaves nothing to close it with.
          width: 'min(288px, 88vw)',
          borderRight: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          animation: 'kf-drawer 200ms var(--ease-out)',
        }}
      >
        <div
          className="flex items-center justify-between border-b px-4 py-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2
            className="uppercase text-fg-3"
            style={{ fontSize: 10, letterSpacing: '0.1em', fontWeight: 600 }}
          >
            Templates
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center rounded-md border"
            style={{
              width: 34,
              height: 34,
              borderColor: 'var(--border)',
              color: 'var(--fg-2)',
            }}
          >
            <Icon name="x" size={15} />
          </button>
        </div>

        <LibraryRail
          activeId={activeId}
          onPick={(id) => {
            onPick(id);
            onClose();
          }}
          hideHeading
          className="flex-1"
        />
      </div>
    </div>
  );
}
