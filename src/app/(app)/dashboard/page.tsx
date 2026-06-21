import { DashboardView } from '@/features/dashboard/components/DashboardView';
import { getLatestInsightAction } from '@/features/insights/api/generateInsights';
import { InsightsPanel } from '@/features/insights/components/InsightsPanel';
import { getDashboardData } from '@/features/tracking/api/carbonSummaryRepository';
import { requireUserId } from '@/lib/session';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const userId = await requireUserId();
  const [data, latestInsight] = await Promise.all([
    getDashboardData(userId),
    getLatestInsightAction(),
  ]);

  return (
    <div className="space-y-8">
      <DashboardView data={data} />
      <InsightsPanel
        initialContent={latestInsight?.content ?? null}
        initialGeneratedAt={latestInsight?.generatedAt ?? null}
      />
    </div>
  );
}
