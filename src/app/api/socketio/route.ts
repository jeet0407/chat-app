import { NextResponse } from 'next/server';

// This is a dummy route that will be overridden by the Socket.IO server
export async function GET() {
  return NextResponse.json({ message: 'Socket.IO server running' });
}