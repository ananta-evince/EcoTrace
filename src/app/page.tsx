import Link from 'next/link';
import { Leaf, ArrowRight, BarChart3, Brain, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white dark:from-gray-950 dark:to-gray-900">
      <header className="border-b border-brand-100 dark:border-gray-800">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4" aria-label="Main">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-brand-600" aria-hidden="true" />
            <span className="text-2xl font-bold text-brand-800 dark:text-brand-300">EcoTrace</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get started</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className="mx-auto max-w-6xl px-4 py-20 text-center" aria-labelledby="hero-heading">
          <h1 id="hero-heading" className="text-4xl font-bold tracking-tight text-gray-900 md:text-6xl dark:text-white">
            Understand, track, and{' '}
            <span className="text-brand-600">reduce</span> your carbon footprint
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            EcoTrace helps you log daily activities, visualise your emissions, get AI-powered insights,
            and take meaningful action toward a 1.5°C-compatible lifestyle.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/signup">
              <Button size="lg">
                Start free <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16" aria-labelledby="features-heading">
          <h2 id="features-heading" className="sr-only">
            Features
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <article className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-950">
              <BarChart3 className="h-10 w-10 text-brand-600" aria-hidden="true" />
              <h3 className="mt-4 text-xl font-semibold">Track everything</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Log transport, food, energy, shopping, and services with DEFRA 2024 emission factors.
              </p>
            </article>
            <article className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-950">
              <Brain className="h-10 w-10 text-brand-600" aria-hidden="true" />
              <h3 className="mt-4 text-xl font-semibold">AI insights</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Personalised coaching based on your actual data — not generic advice.
              </p>
            </article>
            <article className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-950">
              <Target className="h-10 w-10 text-brand-600" aria-hidden="true" />
              <h3 className="mt-4 text-xl font-semibold">Take action</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                40+ curated reduction actions with estimated CO₂ savings.
              </p>
            </article>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500 dark:border-gray-800">
        <p>© {new Date().getFullYear()} EcoTrace. Built for a sustainable future.</p>
      </footer>
    </div>
  );
}
