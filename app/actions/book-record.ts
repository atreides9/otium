'use server'

import { createClient } from '@/lib/supabase/server'
import type { ReadingFormData } from '@/types/book'

export async function saveBookRecord(data: ReadingFormData): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: '로그인 필요' }

  const { error } = await supabase.from('book_records').upsert({
    user_id: user.id,
    title: data.book.title,
    author: data.book.author,
    cover_url: data.book.cover_url,
    isbn: data.book.isbn,
    status: data.status,
    progress: data.progress ?? 0,
    rating: data.rating ?? null,
    review: data.review ?? null,
    one_line: data.one_line ?? null,
    genre: null,
    start_date: data.start_date ?? null,
    end_date: data.end_date ?? null,
  })

  if (error) return { error: error.message }
  return {}
}
