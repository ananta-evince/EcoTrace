'use server';

import { hash } from 'bcryptjs';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { signIn } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/request';
import type { Result } from '@/lib/result';

const signupSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number'),
  name: z.string().min(1).max(100),
});

/** Registers a new user and signs them in. */
export async function signupAction(formData: FormData): Promise<Result<void, string>> {
  const ip = await getClientIp();
  const rateCheck = checkRateLimit(`auth:${ip}`);
  if (!rateCheck.allowed) return { ok: false, error: 'Too many attempts. Try again later.' };

  const parsed = signupSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { ok: false, error: 'Email already registered' };

  const passwordHash = await hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
      onboarding: { create: { step: 1 } },
    },
  });

  await signIn('credentials', {
    email: parsed.data.email,
    password: parsed.data.password,
    redirect: false,
  });

  redirect('/onboarding');
}

/** Signs in with credentials. */
export async function loginAction(formData: FormData): Promise<Result<void, string>> {
  const parsed = signupSchema.pick({ email: true, password: true }).safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) return { ok: false, error: 'Invalid credentials' };

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    redirect('/dashboard');
  } catch {
    return { ok: false, error: 'Invalid email or password' };
  }
}
