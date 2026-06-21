'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteEntryAction } from '../api/entryActions';
import { Button } from '@/components/ui/Button';
import { formatDate, formatKgCO2e } from '@/lib/utils';

type Entry = {
  id: string;
  category: string;
  subcategory: string;
  value: number;
  unit: string;
  kgCO2e: number;
  date: Date;
  note?: string | null;
};

type EntryListProps = {
  entries: Entry[];
  weekTotal: number;
};

/** Displays recent carbon entries with delete support. */
export function EntryList({ entries, weekTotal }: EntryListProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    setError(null);
    startTransition(async () => {
      const result = await deleteEntryAction(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <section aria-labelledby="entry-list-heading" className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-950">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="entry-list-heading" className="text-xl font-semibold text-gray-900 dark:text-white">
          Entry history
        </h2>
        <p className="font-mono text-sm text-brand-700 dark:text-brand-300">
          This week: {formatKgCO2e(weekTotal)}
        </p>
      </div>

      {error && (
        <p role="alert" className="mb-4 text-sm text-carbon-high">
          ⚠ {error}
        </p>
      )}

      {entries.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No entries yet. Log your first activity above.</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-800" aria-busy={isPending}>
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {entry.subcategory.replace(/_/g, ' ')}
                </p>
                <p className="text-sm text-gray-500">
                  {entry.value} {entry.unit} · {formatDate(new Date(entry.date))}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold text-brand-700">
                  {formatKgCO2e(entry.kgCO2e)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(entry.id)}
                  disabled={isPending}
                  aria-label={`Delete entry ${entry.subcategory}`}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
