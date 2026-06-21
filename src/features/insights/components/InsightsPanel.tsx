'use client';

import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/Button';

import { generateInsightsAction } from '../api/generateInsights';

import { StreamingText } from './StreamingText';

type InsightsPanelProps = {
  initialContent?: string | null;
  initialGeneratedAt?: Date | null;
};

/** AI insights panel with cached content and on-demand generation. */
export function InsightsPanel({
  initialContent = null,
  initialGeneratedAt = null,
}: InsightsPanelProps) {
  const [content, setContent] = useState<string | null>(initialContent);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(initialGeneratedAt);
  const [cached, setCached] = useState(Boolean(initialContent));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await generateInsightsAction();
        setContent(result.content);
        setGeneratedAt(result.generatedAt);
        setCached(result.cached);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to generate insights');
      }
    });
  };

  const hoursAgo = generatedAt
    ? Math.round((Date.now() - generatedAt.getTime()) / (1000 * 60 * 60))
    : null;

  return (
    <section
      aria-labelledby="insights-heading"
      className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-950"
      aria-busy={isPending}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 id="insights-heading" className="text-xl font-semibold text-gray-900 dark:text-white">
          Your Insights
        </h2>
        <Button onClick={handleGenerate} loading={isPending} disabled={isPending}>
          Generate insights
        </Button>
      </div>

      {cached && hoursAgo !== null && (
        <p className="mb-2 text-sm text-gray-500">Updated {hoursAgo} hours ago (cached)</p>
      )}

      {error && (
        <p role="alert" className="text-sm text-carbon-high">
          ⚠ {error}
        </p>
      )}

      {isPending && !content && (
        <div className="space-y-2" aria-busy="true">
          <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      )}

      {content && <StreamingText content={content} />}
    </section>
  );
}
