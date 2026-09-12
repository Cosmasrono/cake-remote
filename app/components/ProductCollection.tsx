'use client';
import { useState } from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import { MessageCircle, Plus } from 'lucide-react';
import CustomOrderModal from './CustomOrderModal';
import { formatToKsh } from '@/app/lib/currency';
import { WHATSAPP_NUMBER, customCakeMessage, whatsappLink } from '@/app/lib/whatsapp';

export interface Product { id: string; name: string; type?: string; description?: string; price?: number; image: string }
export type AddToCart = (name: string, type: string, price: number, image: string) => void | Promise<void>;
export default function ProductCollection({ endpoint, title, description, handleAddToCart, custom = false }: { endpoint: string; title: string; description: string; handleAddToCart: AddToCart; custom?: boolean }) {
  const { data, error, isLoading, mutate } = useSWR<Product[]>(endpoint, async (url: string) => {
    const response = await fetch(url); if (!response.ok) throw new Error('Unable to load the collection'); return response.json();
  });
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [busy, setBusy] = useState<string | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const products = (data || []).filter(p => `${p.name} ${p.type || p.description || ''}`.toLowerCase().includes(query.toLowerCase())).slice().sort((a, b) => sort === 'low' ? (a.price ?? Infinity) - (b.price ?? Infinity) : sort === 'high' ? (b.price ?? -Infinity) - (a.price ?? -Infinity) : 0);
  const add = async (p: Product) => { if (!p.price) return; setBusy(p.id); try { await handleAddToCart(p.name, p.type || p.description || '', p.price, p.image); } finally { setBusy(null); } };
  return <section className="bakery-container">
    <div className="catalog-heading"><p className="eyebrow">FROM THE JAPHEE KITCHEN</p><h1>{title}</h1><p>{description}</p></div>
    <div className="catalog-tools"><input aria-label="Search products" type="search" placeholder="Find your favourite…" value={query} onChange={e => setQuery(e.target.value)} /><select aria-label="Sort products" value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Latest additions</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>
    {error ? <div className="empty-state" role="alert"><h2>Our menu is taking a moment.</h2><p>Please try again to see the latest selection.</p><button className="bakery-button" onClick={() => mutate()}>Try again</button></div> :
      isLoading ? <div className="product-grid" aria-label="Loading products">{[0,1,2].map(i => <div key={i} className="product-photo animate-pulse" />)}</div> :
      products.length ? <div className="product-grid">{products.map(p => <article key={p.id} className="product-card">
        <div className="product-photo"><Image src={p.image || '/images/13.jpg'} alt={p.name} fill sizes="(max-width: 760px) 50vw, 33vw" className="object-cover" unoptimized={p.image?.startsWith('/uploads/')} /></div>
        <h2>{p.name}</h2><p className="product-type">{p.type || p.description}</p>
        <div className="product-bottom"><p>{p.price && Number.isFinite(p.price) ? formatToKsh(p.price) : 'Price to be confirmed'}</p><button className="bakery-button secondary" disabled={!p.price || busy !== null} onClick={() => add(p)} aria-label={`Add ${p.name} to bag`}>{busy === p.id ? 'Adding…' : p.price ? <><Plus size={15} /> Add to bag</> : 'Unavailable online'}</button></div>
      </article>)}</div> : <div className="empty-state"><h2>{query ? 'No matches just yet.' : 'A fresh selection is on its way.'}</h2><p>{query ? 'Try a different name or flavour.' : 'Please check back for our latest additions.'}</p>{query && <button className="bakery-button secondary" onClick={() => setQuery('')}>Clear search</button>}</div>}
    {custom && <div className="custom-callout"><div><h2>Something uniquely yours.</h2><p>Tell us about your occasion, your favourite flavours, and the cake you have in mind. Send us a note through the form, or message us on WhatsApp at {WHATSAPP_NUMBER}.</p></div><div className="callout-actions"><button className="bakery-button" onClick={() => setCustomOpen(true)}>Request a custom cake</button><a className="whatsapp-button" href={whatsappLink(customCakeMessage())} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Enquire on WhatsApp</a></div></div>}
    {custom && <CustomOrderModal isOpen={customOpen} onClose={() => setCustomOpen(false)} />}
  </section>;
}

