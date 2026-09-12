'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
export default function LoginPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setBusy(true); setError('');
    const form = new FormData(e.currentTarget);
    try {
      const result = await signIn('credentials', { redirect: false, email: String(form.get('email') || '').trim(), password: form.get('password') });
      if (!result?.ok || result.error) { setError('The email or password was not recognised. Please try again.'); setBusy(false); return; }
      const requested = new URLSearchParams(window.location.search).get('callbackUrl');
      const session = await fetch('/api/auth/session').then(res => res.json());
      router.push(requested && ['/payment','/orders'].includes(requested) ? requested : ['ADMIN','SUPER_ADMIN'].includes(session?.user?.role) ? '/admin/dashboard' : '/');
      router.refresh();
    } catch { setError('We could not sign you in. Please try again.'); setBusy(false); }
  };
  return <main className="min-h-screen flex flex-col items-center justify-center px-5 py-12"><Link className="wordmark mb-9" href="/">Japhe&apos;s<span>CAKES & BAKING SCHOOL</span></Link><section className="checkout-panel w-full max-w-md"><p className="eyebrow">A LITTLE SOMETHING FOR YOU</p><h1 className="font-serif text-4xl mb-3">Welcome back.</h1><p className="text-sm text-stone-500 leading-7 mb-7">Sign in to save your favourites, place an order, and explore your next baking course.</p>{error && <p className="notice" role="alert">{error}</p>}<form onSubmit={submit}><label>Email address<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label><button className="bakery-button" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form><p className="text-sm mt-7 text-center">New to Japhe&apos;s? <Link href="/signup" className="text-[#713c46] underline underline-offset-4">Create an account</Link></p></section><Link className="text-link" href="/">← Back to the bakery</Link></main>;
}

