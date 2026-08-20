/** Corrective-action board model — a port of `buildActions`. */
import { ACTIONS, type ActionStatus } from '@/data/demo';
import { dueColorOf, priBadge, toneColor, type BadgeSpec } from './tone';

export interface ActionCard {
  id: string;
  code: string;
  title: string;
  owner: string;
  dueText: string;
  dueColor: string;
  priority: BadgeSpec;
}

export interface ActionGroup {
  key: ActionStatus;
  label: string;
  dotColor: string;
  count: number;
  items: ActionCard[];
}

const mk = (a: (typeof ACTIONS)[number]): ActionCard => ({
  id: a.id,
  code: a.code,
  title: a.name,
  owner: a.owner,
  dueText: a.due,
  dueColor: dueColorOf(a.dueTone),
  priority: priBadge(a.priority),
});

const GROUPS = [
  ['open', 'Open', 'warn'],
  ['in-progress', 'In progress', 'info'],
  ['closed', 'Closed', 'good'],
] as const;

export const ACTION_BOARD: ActionGroup[] = GROUPS.map(([key, label, tone]) => {
  const items = ACTIONS.filter((a) => a.status === key).map(mk);
  return { key, label, dotColor: toneColor(tone), count: items.length, items };
});
