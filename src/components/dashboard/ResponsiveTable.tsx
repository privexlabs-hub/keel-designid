'use client';

/**
 * One table implementation for every tabular surface in the dashboard.
 *
 * Three presentations, driven by the same `columns` config:
 *   >= 1024px  native table, exactly as the source draws it
 *   768-1023   the same table in a horizontal scroller, first column pinned
 *   < 768      a card list: `primary` as the title, `secondary` beneath it,
 *              and the remaining columns as label/value pairs
 *
 * Rows are real `<button>`s in card mode and keyboard-activatable `<tr>`s in
 * table mode, so a register row is reachable without a pointer either way.
 */
import type { ReactNode } from 'react';

export interface TableColumn<T> {
  key: string;
  label: string;
  align?: 'left' | 'right';
  cell: (row: T) => ReactNode;
  /** Suppress in the < 768px card body — already shown as primary/secondary. */
  omitInCard?: boolean;
}

export interface ResponsiveTableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Card-mode title. */
  primary: (row: T) => ReactNode;
  /** Card-mode supporting line. */
  secondary?: (row: T) => ReactNode;
  /** Card-mode trailing element, e.g. a status badge. */
  trailing?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  /** Accessible name for the table. */
  label: string;
  /** Horizontal padding on the first/last columns. */
  edgeX?: number;
  /** Horizontal padding on interior columns. */
  innerX?: number;
  headerY?: number;
  cellY?: number;
}

export function ResponsiveTable<T>({
  columns,
  rows,
  rowKey,
  primary,
  secondary,
  trailing,
  onRowClick,
  label,
  edgeX = 18,
  innerX = 18,
  headerY = 11,
  cellY = 13,
}: ResponsiveTableProps<T>) {
  const padX = (i: number) => (i === 0 || i === columns.length - 1 ? edgeX : innerX);
  const clickable = Boolean(onRowClick);

  return (
    <>
      {/* --- < 768px: card list ------------------------------------------ */}
      <ul className="flex list-none flex-col md:hidden" style={{ margin: 0, padding: 0 }}>
        {rows.map((row) => {
          const body = columns.filter((c) => !c.omitInCard);
          const inner = (
            <>
              <span className="flex items-start justify-between" style={{ gap: 12 }}>
                <span className="min-w-0 flex-1">
                  <span className="block text-fg-1" style={{ fontSize: 13.5, lineHeight: 1.35 }}>
                    {primary(row)}
                  </span>
                  {secondary ? (
                    <span className="mt-1 block text-fg-3" style={{ fontSize: 11.5 }}>
                      {secondary(row)}
                    </span>
                  ) : null}
                </span>
                {trailing ? <span className="flex-none">{trailing(row)}</span> : null}
              </span>
              {body.length > 0 ? (
                <span className="mt-3 grid grid-cols-2" style={{ gap: '8px 12px' }}>
                  {body.map((c) => (
                    <span key={c.key} className="flex min-w-0 flex-col" style={{ gap: 3 }}>
                      <span
                        className="uppercase text-fg-3"
                        style={{ fontSize: 10, letterSpacing: '0.07em', fontWeight: 600 }}
                      >
                        {c.label}
                      </span>
                      <span className="min-w-0 truncate text-fg-2" style={{ fontSize: 12.5 }}>
                        {c.cell(row)}
                      </span>
                    </span>
                  ))}
                </span>
              ) : null}
            </>
          );

          return (
            <li key={rowKey(row)} style={{ borderBottom: '1px solid var(--border-faint)' }}>
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onRowClick?.(row)}
                  className="block w-full cursor-pointer border-none bg-transparent text-left font-ui"
                  style={{ padding: '14px 16px', minHeight: 44 }}
                >
                  {inner}
                </button>
              ) : (
                <div style={{ padding: '14px 16px' }}>{inner}</div>
              )}
            </li>
          );
        })}
      </ul>

      {/* --- >= 768px: table --------------------------------------------- */}
      <div className="hidden md:block md:overflow-x-auto lg:overflow-x-visible">
        <table className="w-full" style={{ minWidth: 640 }}>
          <caption className="sr-only">{label}</caption>
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th
                  key={c.key}
                  scope="col"
                  className={
                    i === 0
                      ? 'md:sticky md:left-0 md:z-1 lg:static bg-surface-1 uppercase text-fg-3'
                      : 'uppercase text-fg-3'
                  }
                  style={{
                    textAlign: c.align === 'right' ? 'right' : 'left',
                    padding: `${headerY}px ${padX(i)}px`,
                    fontSize: 10,
                    letterSpacing: '0.07em',
                    fontWeight: 600,
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={clickable ? () => onRowClick?.(row) : undefined}
                onKeyDown={
                  clickable
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick?.(row);
                        }
                      }
                    : undefined
                }
                tabIndex={clickable ? 0 : undefined}
                role={clickable ? 'button' : undefined}
                className={clickable ? 'group cursor-pointer hover:bg-surface-2' : undefined}
              >
                {columns.map((c, i) => (
                  <td
                    key={c.key}
                    className={
                      i === 0 ? 'md:sticky md:left-0 lg:static bg-surface-1 group-hover:bg-surface-2' : undefined
                    }
                    style={{
                      padding: `${cellY}px ${padX(i)}px`,
                      borderBottom: '1px solid var(--border-faint)',
                      textAlign: c.align === 'right' ? 'right' : 'left',
                      verticalAlign: 'middle',
                    }}
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
