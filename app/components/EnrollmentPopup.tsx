'use client';
import { useEffect, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { X } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { formatToKsh } from '@/app/lib/currency';
interface Course { id: string; title: string; description: string; price: number; level: string }
interface Props { isOpen: boolean; onClose: () => void; onEnroll: (phone: string) => void; courseId: string | null; userEmail: string; userName: string; isSubmitting: boolean }
export default function EnrollmentPopup(props: Props) {
  return <Dialog open={props.isOpen} onClose={props.onClose} className="relative z-50"><div className="fixed inset-0 bg-black/35" aria-hidden="true" /><div className="fixed inset-0 overflow-y-auto p-4 flex items-center justify-center"><DialogPanel className="checkout-panel w-full max-w-lg max-h-[90vh] overflow-y-auto"><EnrollmentForm key={props.courseId + String(props.isOpen)} {...props} /></DialogPanel></div></Dialog>;
}
function EnrollmentForm({ isOpen, onClose, onEnroll, courseId, userName, isSubmitting }: Props) {
  const { data: courses, error: loadError } = useSWR<Course[]>(isOpen ? '/api/courses' : null, async (url: string) => { const res = await fetch(url); if (!res.ok) throw new Error('Unable to load course'); return res.json(); });
  const course = courses?.find(c => c.id === courseId);
  const [mode, setMode] = useState('pay');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [paid, setPaid] = useState(false);
  const [group, setGroup] = useState('');
  useEffect(() => {
    if (!paymentId || !isOpen) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;
    const poll = async () => {
      try {
        const res = await fetch('/api/check-payment?paymentId=' + paymentId);
        const data = await res.json();
        if (stopped) return;
        if (res.ok && data.status === 'completed') { setPaid(true); setBusy(false); const url = data.courseInfo?.whatsappLink; if (typeof url === 'string' && url.startsWith('https://chat.whatsapp.com/')) setGroup(url); return; }
        if (res.ok && ['failed','cancelled'].includes(data.status)) { setError('Payment was not completed. Please try again.'); setPaymentId(''); setBusy(false); return; }
      } catch { /* Retry transient network failures. */ }
      if (stopped) return;
      if (++attempts >= 40) { setError('Confirmation is taking longer than expected. Check My orders before paying again.'); setBusy(false); return; }
      timer = setTimeout(poll, 3000);
    };
    timer = setTimeout(poll, 2000);
    return () => { stopped = true; clearTimeout(timer); };
  }, [paymentId, isOpen]);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const form = new FormData(e.currentTarget); const phone = String(form.get('phone') || '');
    if (mode === 'enquiry') { onEnroll(phone); return; }
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/enrollments/pay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId, phoneNumber: phone, customerName: userName }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to start payment.');
      setPaymentId(data.paymentId);
    } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); setBusy(false); }
  };
  return <><div className="flex justify-between items-start gap-4"><div><p className="eyebrow">YOUR NEXT CHAPTER</p><DialogTitle className="font-serif text-3xl">{paid ? 'Welcome to the school.' : course?.title || 'Course enrolment'}</DialogTitle></div><button className="icon-button" aria-label="Close enrolment" onClick={onClose}><X size={20} /></button></div>
    {paid ? <div className="mt-6"><p className="text-sm leading-7">Your payment has been confirmed. Your enrolment details are saved in your account.</p>{group && <a href={group} target="_blank" rel="noopener noreferrer" className="bakery-button mt-6">Join your class group</a>}<Link href="/orders" className="text-link">View payment details →</Link></div> :
    <>{error && <p className="notice mt-5" role="alert">{error}</p>}{paymentId ? <div className="mt-6"><p className="text-sm leading-7" role="status">Check your phone for the M-Pesa prompt. Enter your PIN on your phone to complete payment.</p><Link className="text-link" href="/orders">Check My orders →</Link></div> : !course ? <p className="py-6" role="status">{loadError ? 'We could not load this course. Please close and try again.' : 'Loading course details…'}</p> : <form onSubmit={submit} className="mt-6"><p className="text-sm text-stone-600 mb-5 leading-7">{course.description}</p><div className="checkout-total mb-6"><span>{course.level}</span><strong>{formatToKsh(course.price)}</strong></div><label>How would you like to enrol?<select value={mode} onChange={e => setMode(e.target.value)}><option value="pay">Pay with M-Pesa</option><option value="enquiry">Enquire before paying</option></select></label><label>Phone number<input name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="0712 345 678" /></label><button className="bakery-button" disabled={busy || isSubmitting}>{busy || isSubmitting ? 'Please wait…' : mode === 'pay' ? 'Pay ' + formatToKsh(course.price) : 'Send enrolment enquiry'}</button><p className="text-xs text-stone-500 mt-4 leading-6">{mode === 'pay' ? 'Payment is confirmed with M-Pesa before your enrolment is approved.' : 'Our team will follow up to discuss the course and next steps.'}</p></form>}</>}
  </>;
}

