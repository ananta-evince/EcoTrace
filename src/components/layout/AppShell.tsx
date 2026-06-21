import { Sidebar, MobileNav } from './Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-1 flex-col pb-16 md:pb-0">
        <main id="main-content" tabIndex={-1} className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
