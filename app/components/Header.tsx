'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, X, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import useSWR from 'swr';
import type { AppSession } from '@/app/lib/auth-options';

interface Props { activeTab: string; setActiveTab: (tab: string) => void; onCartClick: () => void }
export default function Header({ activeTab, setActiveTab, onCartClick }: Props) {
  const { data: session } = useSession() as { data: AppSession | null };
  const [open, setOpen] = useState(false);
  const { data, mutate } = useSWR<{ quantity: number }[]>(session?.user ? '/api/cart' : null, async (url: string) => {
    const res = await fetch(url); if (!res.ok) throw new Error('Unable to load bag'); return res.json();
  });
  useEffect(() => { const refresh = () => { void mutate(); }; window.addEventListener('cartUpdated', refresh); return () => window.removeEventListener('cartUpdated', refresh); }, [mutate]);
  useEffect(() => { const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, []);
  const count = data?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const nav = [{ id: 'home', label: 'Home' }, { id: 'cakes', label: 'Our cakes' }, { id: 'shawarma', label: 'Savoury menu' }, { id: 'school', label: 'Baking school' }];
  const navigate = (id: string) => { setActiveTab(id); setOpen(false); };
  return <header className="bakery-header">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <div className="bakery-container header-inner">
      <button className="wordmark" onClick={() => navigate('home')} aria-label="Japhe's home">Japhe&apos;s<span>CAKES & BAKING SCHOOL</span></button>
      <nav className="desktop-nav" aria-label="Main navigation">{nav.map(item => <button key={item.id} onClick={() => navigate(item.id)} aria-current={(item.id === activeTab || item.id === 'shawarma' && ['pizza', 'burger'].includes(activeTab)) ? 'page' : undefined}>{item.label}</button>)}</nav>
      <div className="header-actions">
        {session?.user ? <><Link className="account-link" href="/orders">My orders</Link>{['ADMIN', 'SUPER_ADMIN'].includes(session.user.role) && <Link className="account-link" href="/admin/dashboard">Admin</Link>}<button className="icon-button" aria-label="Sign out" onClick={() => signOut({ callbackUrl: '/' })}><LogOut size={18} /></button></> : <Link className="account-link" href="/login">Sign in</Link>}
        <button className="bag-button" onClick={onCartClick} aria-label={`Shopping bag, ${count} items`}><ShoppingBag size={19} /><span>{count}</span></button>
        <button className="icon-button mobile-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
      </div>
    </div>
    {open && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">{nav.map(item => <button key={item.id} onClick={() => navigate(item.id)} aria-current={activeTab === item.id ? 'page' : undefined}>{item.label}</button>)}{session?.user && <button onClick={() => navigate('courses')}>My courses</button>}</nav>}
  </header>;
}

