import { Badge } from '@/components/ui/Badge';
import { getDashboardData } from '@/features/tracking/api/carbonSummaryRepository';
import { getEmissionFactor } from '@/features/tracking/utils/emissionFactors';
import {
  kgToCarKmEquivalent,
  PROFILE_HISTORY_WEEKS,
  weeklyKgToAnnualTonnes,
} from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/session';
import { formatKgCO2e } from '@/lib/utils';

export const metadata = { title: 'Profile' };

const ACHIEVEMENTS = [
  { id: 'first-entry', label: 'First entry', check: (entries: number) => entries >= 1 },
  { id: 'week-streak', label: '7-day streak', check: (entries: number, streak: number) => streak >= 7 },
  {
    id: 'beat-target',
    label: 'Beat daily target',
    check: (_: number, __: number, today: number, target: number) => today <= target && today > 0,
  },
];

const CAR_PETROL_FACTOR = getEmissionFactor('transport', 'car_petrol')?.factor ?? 0.172;

export default async function ProfilePage() {
  const userId = await requireUserId();

  const [user, data, entryCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    getDashboardData(userId),
    prisma.carbonEntry.count({ where: { userId } }),
  ]);

  const earnedBadges = ACHIEVEMENTS.filter((achievement) =>
    achievement.check(entryCount, data.streak, data.todayTotal, data.dailyTarget),
  );

  const kmEquivalent = kgToCarKmEquivalent(data.weekTotal, CAR_PETROL_FACTOR);
  const annualProjection = weeklyKgToAnnualTonnes(data.weekTotal);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-500">{user?.email}</p>
      </header>

      <section aria-labelledby="achievements-heading">
        <h2 id="achievements-heading" className="mb-4 text-lg font-semibold">
          Achievements
        </h2>
        <div className="flex flex-wrap gap-2">
          {earnedBadges.length === 0 ? (
            <p className="text-gray-500">Start logging to earn badges</p>
          ) : (
            earnedBadges.map((badge) => (
              <Badge key={badge.id} variant="success">
                {badge.label}
              </Badge>
            ))
          )}
        </div>
      </section>

      <section aria-labelledby="stats-heading" className="grid gap-4 sm:grid-cols-2">
        <h2 id="stats-heading" className="sr-only">
          Statistics
        </h2>
        <article className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-950">
          <h3 className="text-sm text-gray-500">This week</h3>
          <p className="font-mono text-2xl font-bold">{formatKgCO2e(data.weekTotal)}</p>
          <p className="mt-1 text-sm text-gray-500">
            Equivalent to {kmEquivalent} km not driven by car
          </p>
        </article>
        <article className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-950">
          <h3 className="text-sm text-gray-500">Annual projection</h3>
          <p className="font-mono text-2xl font-bold">{annualProjection.toFixed(1)} tCO₂e</p>
          <p className="mt-1 text-sm text-gray-500">Based on current weekly trend</p>
        </article>
      </section>

      <section aria-labelledby="history-heading">
        <h2 id="history-heading" className="mb-4 text-lg font-semibold">
          Footprint history
        </h2>
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-950">
          <ul className="space-y-2">
            {data.weeklyRollup.slice(-PROFILE_HISTORY_WEEKS).map((week: { weekStart: string; total: number }) => (
              <li key={week.weekStart} className="flex justify-between text-sm">
                <span>Week of {week.weekStart}</span>
                <span className="font-mono">{formatKgCO2e(week.total)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
