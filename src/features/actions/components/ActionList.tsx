'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import * as Icons from 'lucide-react';
import { REDUCTION_ACTIONS, type ReductionAction } from '../data/reductionActions';
import { adoptActionAction, completeActionAction } from '../api/actionActions';
import { EMISSION_CATEGORIES } from '@/features/tracking/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type UserAction = {
  actionId: string;
  status: string;
};

type ActionListProps = {
  userActions: UserAction[];
};

const effortLabels = { quick: 'Quick Win', medium: 'This Month', lifestyle: 'Lifestyle Change' };

const categoryLabels: Record<(typeof EMISSION_CATEGORIES)[number], string> = {
  transport: 'Transport',
  food: 'Food',
  home_energy: 'Home energy',
  shopping: 'Shopping',
  services: 'Services',
};

const ACTION_ICONS: Record<string, React.ElementType> = {
  Zap: Icons.Zap,
  Beef: Icons.Beef,
  Home: Icons.Home,
  Thermometer: Icons.Thermometer,
  Train: Icons.Train,
  Lightbulb: Icons.Lightbulb,
  Bike: Icons.Bike,
  Trash2: Icons.Trash2,
  ThermometerSnowflake: Icons.ThermometerSnowflake,
  Shirt: Icons.Shirt,
  Droplets: Icons.Droplets,
  Leaf: Icons.Leaf,
  Plug: Icons.Plug,
  Bus: Icons.Bus,
};

function getActionIcon(iconName: string): React.ElementType {
  return ACTION_ICONS[iconName] ?? Icons.Leaf;
}

/** Displays filterable reduction actions with adopt and complete flows. */
export function ActionList({ userActions }: ActionListProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'quick' | 'medium' | 'lifestyle'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const adoptedIds = new Set(userActions.map((a) => a.actionId));
  const completedIds = new Set(
    userActions.filter((a) => a.status === 'completed').map((a) => a.actionId),
  );

  const filtered = REDUCTION_ACTIONS.filter((action) => {
    if (filter !== 'all' && action.effort !== filter) return false;
    if (categoryFilter !== 'all' && action.category !== categoryFilter) return false;
    return true;
  });

  const runAction = (action: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? 'Something went wrong');
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Action Library</h1>
        <p className="text-gray-500">{REDUCTION_ACTIONS.length}+ ways to reduce your footprint</p>
      </header>

      <div className="flex flex-wrap gap-3">
        {(['all', 'quick', 'medium', 'lifestyle'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 ${
              filter === f ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            {f === 'all' ? 'All' : effortLabels[f]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoryFilter('all')}
          className={`rounded-full px-3 py-1 text-sm ${
            categoryFilter === 'all' ? 'bg-brand-100 text-brand-800' : 'bg-gray-100 dark:bg-gray-800'
          }`}
        >
          All categories
        </button>
        {EMISSION_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setCategoryFilter(category)}
            className={`rounded-full px-3 py-1 text-sm ${
              categoryFilter === category
                ? 'bg-brand-100 text-brand-800'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            {categoryLabels[category]}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-sm text-carbon-high">
          ⚠ {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((action) => (
          <ActionCard
            key={action.id}
            action={action}
            adopted={adoptedIds.has(action.id)}
            completed={completedIds.has(action.id)}
            onAdopt={() => runAction(() => adoptActionAction(action.id))}
            onComplete={() => runAction(() => completeActionAction(action.id))}
            pending={isPending}
          />
        ))}
      </div>
    </div>
  );
}

function ActionCard({
  action,
  adopted,
  completed,
  onAdopt,
  onComplete,
  pending,
}: {
  action: ReductionAction;
  adopted: boolean;
  completed: boolean;
  onAdopt: () => void;
  onComplete: () => void;
  pending: boolean;
}) {
  const IconComponent = getActionIcon(action.icon);

  return (
    <article className="rounded-xl bg-white p-4 shadow-sm transition-all duration-200 hover:scale-[1.02] dark:bg-gray-950">
      <div className="mb-2 flex items-start justify-between">
        <IconComponent className="h-6 w-6 text-brand-600" aria-hidden={true} />
        {completed && <Badge variant="success">Saved {action.estimatedSavingKgPerYear} kg/yr</Badge>}
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white">{action.title}</h3>
      <p className="mt-1 text-sm text-gray-500">{action.description}</p>
      <p className="mt-2 font-mono text-sm text-brand-700">
        ~{action.estimatedSavingKgPerYear} kg CO₂e/year
      </p>
      <details className="mt-2">
        <summary className="cursor-pointer text-sm text-brand-600">How to do it</summary>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-gray-600 dark:text-gray-400">
          {action.howTo.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </details>
      <div className="mt-3">
        {!adopted && !completed && (
          <Button size="sm" onClick={onAdopt} disabled={pending}>
            I&apos;ll do this
          </Button>
        )}
        {adopted && !completed && (
          <Button size="sm" variant="secondary" onClick={onComplete} disabled={pending}>
            Mark complete
          </Button>
        )}
      </div>
    </article>
  );
}
