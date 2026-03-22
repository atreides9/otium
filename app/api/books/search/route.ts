import { NextRequest, NextResponse } from 'next/server'
import { searchBooks } from '@/lib/kakao'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  if (!q.trim()) return NextResponse.json({ books: [] })
  try {
    const books = await searchBooks(q)
    return NextResponse.json({ books })
  } catch {
    return NextResponse.json({ books: [] }, { status: 500 })
  }
}
