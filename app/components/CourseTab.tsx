'use client';
import useSWR from 'swr';
import Link from 'next/link';
interface Enrollment { id: string; status: string; course: { title: string; level: string }; enrolledAt: string; classGroupLink: string | null }
const STATUS: Record<string, string> = {
  APPROVED: 'Enrolled',
  PENDING: 'Awaiting payment or confirmation',
  REJECTED: 'Not approved',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};
export default function CourseTab() {
  const { data, error, isLoading, mutate } = useSWR<Enrollment[]>('/api/enrollments', async (url: string) => { const res = await fetch(url); if (!res.ok) throw new Error('Unable to load enrolments'); return res.json(); });
  return <section className="bakery-container bakery-section"><div className="catalog-heading"><p className="eyebrow">YOUR NEXT CHAPTER</p><h1>My courses</h1></div>{error ? <div className="empty-state"><p>We could not load your enrolments.</p><button className="bakery-button" onClick={() => mutate()}>Try again</button></div> : isLoading ? <p role="status">Loading your courses…</p> : !data?.length ? <div className="empty-state"><h2>Start something new.</h2><p>Explore our baking courses to find your next skill.</p><Link href="/#school" className="bakery-button">Explore classes</Link></div> : <div className="space-y-5">{data.map(enrolment => <article className="checkout-panel" key={enrolment.id}><h2>{enrolment.course.title}</h2><div className="flex justify-between text-sm text-stone-600"><span>{enrolment.course.level}</span><span className={enrolment.status === 'APPROVED' ? 'text-emerald-800' : undefined}>{STATUS[enrolment.status] || enrolment.status.toLowerCase()}</span></div>{enrolment.classGroupLink ? <a href={enrolment.classGroupLink} target="_blank" rel="noopener noreferrer" className="bakery-button mt-5">Join your class group</a> : enrolment.status === 'PENDING' && <p className="text-xs text-stone-500 mt-4">If you have just paid, this updates shortly — refresh the page. Otherwise our team will contact you about next steps.</p>}</article>)}</div>}</section>;
}
