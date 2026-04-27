import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { q, limit = '20', offset = '0' } = req.query

  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      error: 'Query too short',
      usage: '/api/search?q=Ruhanga&limit=20&offset=0'
    })
  }

  const limitNum = Math.min(parseInt(limit) || 20, 100)
  const offsetNum = parseInt(offset) || 0
  const searchTerm = q.trim()

  const { data, error, count } = await supabase
    .from('verses')
    .select('book_number, chapter, verse, text', { count: 'exact' })
    .textSearch('text', searchTerm, { type: 'plain', config: 'simple' })
    .order('book_number')
    .order('chapter')
    .order('verse')
    .range(offsetNum, offsetNum + limitNum - 1)

  if (error) return res.status(500).json({ error: error.message })

  const bookIds = [...new Set(data.map(v => v.book_number))]
  const { data: books } = await supabase
    .from('books')
    .select('book_number, short_name, long_name')
    .in('book_number', bookIds)

  const bookMap = {}
  if (books) books.forEach(b => { bookMap[b.book_number] = b })

  return res.status(200).json({
    query: searchTerm,
    total: count,
    limit: limitNum,
    offset: offsetNum,
    results: data.map(v => ({
      book_id: v.book_number,
      book_short: bookMap[v.book_number]?.short_name || null,
      book_name: bookMap[v.book_number]?.long_name || null,
      chapter: v.chapter,
      verse: v.verse,
      text: v.text
    }))
  })
}
