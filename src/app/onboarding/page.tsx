import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OnboardingWizard } from '@/features/auth/components/OnboardingWizard';

export const metadata = { title: 'Onboarding' };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const progress = await prisma.onboardingProgress.findUnique({
    where: { userId: session.user.id },
  });

  if (progress?.completed) redirect('/dashboard');

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen px-4 py-12">
      <OnboardingWizard initialStep={progress?.step ?? 1} />
    </main>
  );
}
