import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { book, chapter, verse } = req.query

  if (!book || !chapter || !verse) {
    return res.status(400).json({
      error: 'Missing required parameters',
      usage: '/api/verse?book=10&chapter=1&verse=1'
    })
  }

  const bookNum = parseInt(book)
  const chapterNum = parseInt(chapter)
  const verseNum = parseInt(verse)

  if (isNaN(bookNum) || isNaN(chapterNum) || isNaN(verseNum)) {
    return res.status(400).json({ error: 'book, chapter and verse must be numbers' })
  }

  const { data, error } = await supabase
    .from('verses')
    .select('book_number, chapter, verse, text')
    .eq('book_number', bookNum)
    .eq('chapter', chapterNum)
    .eq('verse', verseNum)
    .single()

  if (error || !data) {
    return res.status(404).json({ error: 'Verse not found' })
  }

  const { data: book_data } = await supabase
    .from('books')
    .select('short_name, long_name')
    .eq('book_number', bookNum)
    .single()

  return res.status(200).json({
    book_id: data.book_number,
    book_short: book_data?.short_name || null,
    book_name: book_data?.long_name || null,
    chapter: data.chapter,
    verse: data.verse,
    text: data.text
  })
}
