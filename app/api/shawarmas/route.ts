import { NextResponse } from 'next/server';
import { menu } from '@/app/lib/catalog';
export async function GET() { return NextResponse.json(menu.shawarmas); }

