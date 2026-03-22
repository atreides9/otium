export type ReadingStatus = 'reading' | 'completed' | 'want-to-read' | 'paused' | 'dropped'

export interface SelectedBook {
  title: string
  author: string
  cover_url: string
  isbn: string
  publisher: string
}

export interface ReadingFormData {
  book: SelectedBook
  status: ReadingStatus
  start_date?: string
  end_date?: string
  progress?: number      // 0-100
  rating?: number        // 0.5-5.0 (반별)
  review?: string
  one_line?: string
  expectation?: number   // want-to-read용
  reason?: string        // dropped용
}
