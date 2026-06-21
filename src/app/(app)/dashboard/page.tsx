import { auth } from '@/lib/auth';
import { getDashboardData } from '@/features/tracking/api/carbonSummaryRepository';
import { DashboardView } from '@/features/dashboard/components/DashboardView';
import { InsightsPanel } from '@/features/insights/components/InsightsPanel';
import type { UserId } from '@/features/tracking/types';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const session = await auth();
  const data = await getDashboardData(session!.user!.id as UserId);

  return (
    <div className="space-y-8">
      <DashboardView data={data} />
      <InsightsPanel />
    </div>
  );
}
