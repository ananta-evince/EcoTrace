import { auth } from '@/lib/auth';
import { listCarbonEntries } from '@/features/tracking/api/carbonEntryRepository';
import { getDashboardData } from '@/features/tracking/api/carbonSummaryRepository';
import { TrackingForm } from '@/features/tracking/components/TrackingForm';
import { EntryList } from '@/features/tracking/components/EntryList';
import type { UserId } from '@/features/tracking/types';

export const metadata = { title: 'Track' };

export default async function TrackPage() {
  const session = await auth();
  const userId = session!.user!.id as UserId;
  const [{ entries }, dashboard] = await Promise.all([
    listCarbonEntries(userId, { take: 20 }),
    getDashboardData(userId),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Track your footprint</h1>
        <p className="text-gray-500">Log daily activities to build an accurate picture</p>
      </header>
      <TrackingForm />
      <EntryList entries={entries} weekTotal={dashboard.weekTotal} />
    </div>
  );
}
