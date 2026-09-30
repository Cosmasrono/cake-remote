import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
export const metadata: Metadata = { title: "Nimu's Bakery and Restaurant", description: "Discover celebration cakes, enjoy our restaurant menu, request a custom creation, or explore baking courses at Nimu's Bakery and Restaurant." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><Providers>{children}</Providers></body></html>; }

