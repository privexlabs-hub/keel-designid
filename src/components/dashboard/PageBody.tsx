import type { ReactNode } from 'react';

/** Page padding: 24px 28px 44px at desktop, tightened on small screens. */
export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-4 pt-4 pb-10 md:px-5 md:pt-5 lg:px-7 lg:pt-6 lg:pb-11 ${className ?? ''}`}>
      {children}
    </div>
  );
}

/** The standard bordered card used across every view. */
export function Panel({
  children,
  className,
  radius = 8,
}: {
  children: ReactNode;
  className?: string;
  radius?: number;
}) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        borderRadius: radius,
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

/** Panel header: display title on the left, a quiet count on the right. */
export function PanelHead({ title, meta }: { title: string; meta?: ReactNode }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', gap: 12 }}
    >
      <h2 className="font-display text-fg-1" style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
        {title}
      </h2>
      {meta ? (
        <span className="flex-none text-fg-3" style={{ fontSize: 11.5 }}>
          {meta}
        </span>
      ) : null}
    </div>
  );
}
