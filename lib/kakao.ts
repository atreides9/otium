export interface KakaoBook {
  title: string
  authors: string[]
  publisher: string
  thumbnail: string
  isbn: string
}

export async function searchBooks(query: string): Promise<KakaoBook[]> {
  if (!query.trim()) return []
  const res = await fetch(
    `https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query)}&size=20`,
    { headers: { Authorization: `KakaoAK ${process.env.KAKAO_API_KEY}` } }
  )
  if (!res.ok) return []
  const json = await res.json()
  return json.documents ?? []
}
