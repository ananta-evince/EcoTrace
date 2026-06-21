import { requireUserId } from '@/lib/session';
import { getDashboardData } from '@/features/tracking/api/carbonSummaryRepository';
import { DashboardView } from '@/features/dashboard/components/DashboardView';
import { InsightsPanel } from '@/features/insights/components/InsightsPanel';
import { getLatestInsightAction } from '@/features/insights/api/generateInsights';

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
