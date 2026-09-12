'use client';
import Image from 'next/image';
import { ArrowRight, CakeSlice, ChefHat, Gift } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/app/lib/whatsapp';

export default function HomeTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  return <>
    <section className="bakery-container hero-grid">
      <div className="hero-copy">
        <p className="eyebrow">JAPHEE · CAKES & BAKING SCHOOL</p>
        <h1>A little cake.<br />A lovely <em>occasion.</em></h1>
        <p className="hero-description">From a birthday wish to an everyday treat, find something worth sharing. Explore our cakes, create something personal, or learn to bake with us.</p>
        <div className="flex flex-wrap gap-3">
          <button className="bakery-button" onClick={() => setActiveTab('cakes')}>Explore our cakes <ArrowRight size={17} /></button>
          <button className="bakery-button secondary" onClick={() => setActiveTab('school')}>Discover the school</button>
        </div>
        <p className="hero-footnote">Celebration cakes · Custom creations · Baking classes</p>
      </div>
      <div className="hero-photo">
        <Image src="/images/celebration-hero.jpg" alt="Chocolate celebration cake finished with fresh berries" fill priority sizes="(max-width: 760px) 100vw, 52vw" className="object-cover" />
        <div className="photo-caption"><span>FOR THE MOMENTS THAT MATTER</span><span>Make it a cake occasion.</span></div>
      </div>
    </section>
    <div className="service-strip">
      <div><CakeSlice size={20} /><span>Cakes for your celebrations</span></div>
      <div><Gift size={20} /><span>Made personal with custom designs</span></div>
      <div><ChefHat size={20} /><span>Learn at Japhee School of Cakes</span></div>
    </div>
    <section className="bakery-container bakery-section">
      <div className="section-heading"><div><p className="eyebrow">SOMETHING FOR EVERY OCCASION</p><h2>What brings you in?</h2></div><p>A celebration, a craving, or a new passion.<br />There is a place for it here.</p></div>
      <div className="collection-grid">
        {[
          { title: 'Celebration cakes', text: 'Find the centrepiece for your next occasion.', image: '/images/13.jpg', tab: 'cakes', action: 'Browse cakes' },
          { title: 'Something savoury', text: 'Explore our shawarma, burgers, and pizza.', image: '/images/11.jpg', tab: 'shawarma', action: 'Explore the menu' },
          { title: 'The baking school', text: 'Turn your love of cake into a new skill.', image: '/images/cake2.jpg', tab: 'school', action: 'Explore classes' },
        ].map(item => <button className="collection-card" key={item.tab} onClick={() => setActiveTab(item.tab)}>
          <div className="collection-photo"><Image src={item.image} alt={item.title} fill sizes="(max-width: 760px) 100vw, 33vw" className="object-cover" /></div>
          <h3>{item.title}</h3><p>{item.text}</p><span className="text-link">{item.action} <ArrowRight size={16} /></span>
        </button>)}
      </div>
    </section>
    <section className="school-feature bakery-container">
      <div className="school-photo"><Image src="/images/cake2.jpg" alt="Japhee baking school students celebrating with their certificates" fill sizes="(max-width: 760px) 100vw, 50vw" className="object-cover" /></div>
      <div className="school-copy"><p className="eyebrow">MORE THAN A BAKERY</p><h2>Your next chapter<br />starts in the kitchen.</h2><p>Meet a community that shares your love for baking. Explore our courses and take the next step with Japhee School of Cakes.</p><button className="bakery-button" onClick={() => setActiveTab('school')}>Find your course <ArrowRight size={17} /></button></div>
    </section>
    <section className="bakery-container bakery-section faq-section"><p className="eyebrow">A FEW HELPFUL DETAILS</p><h2>Before you order</h2>
      <details><summary>Can I request a custom cake?</summary><p>Yes. Open our cake collection and select “Request a custom cake”. Share your occasion, preferred date, flavour, and a reference image. If you would rather talk it through, message us on WhatsApp at {WHATSAPP_NUMBER}. Our team will follow up to confirm availability and a quote.</p></details>
      <details><summary>How do I pay for my order?</summary><p>Sign in, add your items to the bag, and continue to checkout. Pay with M-Pesa using the prompt sent to your phone. Your payment status is available in My orders.</p></details>
      <details><summary>How do I join a baking class?</summary><p>Visit the baking school, choose a course, and sign in to enrol. You can pay online or submit an enquiry for the team to follow up.</p></details>
    </section>
  </>;
}

