import { listCarbonEntries } from '@/features/tracking/api/carbonEntryRepository';
import { getWeekTotal } from '@/features/tracking/api/carbonSummaryRepository';
import { EntryList } from '@/features/tracking/components/EntryList';
import { TrackingForm } from '@/features/tracking/components/TrackingForm';
import { requireUserId } from '@/lib/session';

export const metadata = { title: 'Track' };

export default async function TrackPage() {
  const userId = await requireUserId();
  const [{ entries }, weekTotal] = await Promise.all([
    listCarbonEntries(userId, { take: 20 }),
    getWeekTotal(userId),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Track your footprint</h1>
        <p className="text-gray-500">Log daily activities to build an accurate picture</p>
      </header>
      <TrackingForm />
      <EntryList entries={entries} weekTotal={weekTotal} />
    </div>
  );
}
