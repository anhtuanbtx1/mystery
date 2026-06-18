import { NextResponse } from 'next/server';
import tarotData from '@/data/tarotData.json';

export async function GET() {
  return NextResponse.json(tarotData);
}
