import type { Odds } from '@/lib/odds';

export function formatKickoff(isoLike: string) {
  const date = new Date(isoLike);
  if (Number.isNaN(date.getTime())) return isoLike;
  // Use a fixed locale to avoid server/client locale differences
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(date);
}

export function bestThreeWayPrices(odds: Odds | null) {
  const market = odds?.bookmakers?.[0]?.markets?.find((m) => m.key === 'h2h');
  const outcomes = market?.outcomes ?? [];
  const byName = new Map(outcomes.map((o) => [o.name.toLowerCase(), o.price]));

  const home = byName.get(odds?.home_team.toLowerCase() ?? '');
  const away = byName.get(odds?.away_team.toLowerCase() ?? '');
  const draw = byName.get('draw');

  if (home == null && away == null && draw == null) return null;
  return { home, draw, away };
}
