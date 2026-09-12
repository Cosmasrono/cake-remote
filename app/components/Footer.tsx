'use client';
import Link from 'next/link';
import { WHATSAPP_NUMBER, customCakeMessage, whatsappLink } from '@/app/lib/whatsapp';
export default function Footer({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  return <footer className="bakery-footer"><div className="bakery-container footer-grid">
    <div><button className="wordmark" onClick={() => setActiveTab('home')}>japhee<span>CAKES & BAKING SCHOOL</span></button><p>Cakes to celebrate.<br />Skills to carry with you.</p></div>
    <div><h2>Explore</h2><button onClick={() => setActiveTab('cakes')}>Our cakes</button><button onClick={() => setActiveTab('shawarma')}>Savoury menu</button><button onClick={() => setActiveTab('school')}>Baking school</button></div>
    <div><h2>Your visit</h2><Link href="/orders">My orders</Link><Link href="/login">Your account</Link><button onClick={() => setActiveTab('cakes')}>Custom cake enquiries</button><a href={whatsappLink(customCakeMessage())} target="_blank" rel="noopener noreferrer">WhatsApp {WHATSAPP_NUMBER}</a></div>
    <div><h2>Made for your occasion</h2><p>Share your ideas through our custom cake enquiry form, or send them straight to us on WhatsApp at {WHATSAPP_NUMBER}. We will follow up to discuss the details.</p><button className="text-link" onClick={() => setActiveTab('cakes')}>Find your cake →</button></div>
  </div><div className="bakery-container footer-bottom"><span>© {new Date().getFullYear()} Japhee School of Cakes.</span><span>A little sweetness, shared.</span></div></footer>;
}

