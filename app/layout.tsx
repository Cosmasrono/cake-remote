import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
export const metadata: Metadata = { title: "Japhe's | Cakes & Baking School", description: "Discover celebration cakes, request a custom creation, or explore baking courses at Japhe's School of Cakes." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><Providers>{children}</Providers></body></html>; }

