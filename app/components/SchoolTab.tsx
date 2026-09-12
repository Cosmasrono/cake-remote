'use client';
import Image from 'next/image';
import useSWR from 'swr';
import { formatToKsh } from '@/app/lib/currency';
interface Course { id: string; title: string; description: string; level: string; price: number; image?: string }
export default function SchoolTab({ handleEnrollCourse, isSubmitting }: { handleEnrollCourse: (id: string) => void; isSubmitting: boolean }) {
  const { data, error, isLoading, mutate } = useSWR<Course[]>('/api/courses', async (url: string) => { const res = await fetch(url); if (!res.ok) throw new Error('Unable to load courses'); return res.json(); });
  return <section className="bakery-container bakery-section">
    <div className="catalog-heading"><p className="eyebrow">JAPHE&apos;S SCHOOL OF CAKES</p><h1>A skill worth making time for.</h1><p>Explore baking and decorating courses. Find your level and take the next step.</p></div>
    {error ? <div className="empty-state" role="alert"><h2>We could not load the courses.</h2><p>Please try again in a moment.</p><button className="bakery-button" onClick={() => mutate()}>Try again</button></div> : isLoading ? <p role="status" className="text-center py-12">Loading courses…</p> : !data?.length ? <div className="empty-state"><h2>Our next chapter is coming.</h2><p>Check back for upcoming courses and enrolment details.</p></div> : <div className="product-grid">{data.map(course => <article className="product-card" key={course.id}><div className="product-photo"><Image src={course.image || '/images/cake2.jpg'} alt={course.title} fill sizes="(max-width:760px) 50vw,33vw" className="object-cover" unoptimized={course.image?.startsWith('/uploads/')} /></div><h2>{course.title}</h2><p className="eyebrow mt-3">{course.level}</p><p className="product-type">{course.description}</p><div className="product-bottom"><p>{formatToKsh(course.price)}</p><button className="bakery-button" disabled={isSubmitting} onClick={() => handleEnrollCourse(course.id)}>View enrolment</button></div></article>)}</div>}
  </section>;
}

