import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { getAppSession } from '@/app/lib/auth-options';
const validId = (id: string) => /^[a-f\d]{24}$/i.test(id);
const admin = async () => { const session = await getAppSession(); return session?.user && ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role); };
function failure(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return NextResponse.json({ error: 'Cake not found' }, { status: 404 });
  return NextResponse.json({ error: 'Unable to save the cake. Please try again.' }, { status: 500 });
}
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await admin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  if (!validId(id)) return NextResponse.json({ error: 'Invalid cake ID' }, { status: 400 });
  try { await prisma.cake.delete({ where: { id } }); return NextResponse.json({ message: 'Cake deleted successfully' }); }
  catch (error) { return failure(error); }
}
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await admin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  if (!validId(id)) return NextResponse.json({ error: 'Invalid cake ID' }, { status: 400 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!body || typeof body.name !== 'string' || !body.name.trim() || body.name.length > 150 || typeof body.type !== 'string' || !body.type.trim() || body.type.length > 150 || typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price <= 0 || !Number.isInteger(body.rating) || body.rating < 0 || body.rating > 5) return NextResponse.json({ error: 'Provide a name, type, positive price, and a rating from 0 to 5.' }, { status: 400 });
  try { return NextResponse.json(await prisma.cake.update({ where: { id }, data: { name: body.name.trim(), type: body.type.trim(), price: body.price, rating: body.rating } })); }
  catch (error) { return failure(error); }
}

