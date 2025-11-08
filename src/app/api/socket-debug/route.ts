import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: "Socket.IO API route is accessible",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}