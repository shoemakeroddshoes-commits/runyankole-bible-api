import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { book, chapter } = req.query

  if (!book || !chapter) {
    return res.status(400).json({
      error: 'Missing required parameters',
      usage: '/api/chapter?book=10&chapter=1'
    })
  }

  const bookNum = parseInt(book)
  const chapterNum = parseInt(chapter)

  if (isNaN(bookNum) || isNaN(chapterNum)) {
    return res.status(400).json({ error: 'book and chapter must be numbers' })
  }

  const { data, error } = await supabase
    .from('verses')
    .select('verse, text')
    .eq('book_number', bookNum)
    .eq('chapter', chapterNum)
    .order('verse')

  if (error) return res.status(500).json({ error: error.message })
  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'Chapter not found' })
  }

  const { data: book_data } = await supabase
    .from('books')
    .select('short_name, long_name')
    .eq('book_number', bookNum)
    .single()

  return res.status(200).json({
    book_id: bookNum,
    book_short: book_data?.short_name || null,
    book_name: book_data?.long_name || null,
    chapter: chapterNum,
    verse_count: data.length,
    verses: data.map(v => ({ verse: v.verse, text: v.text }))
  })
}
