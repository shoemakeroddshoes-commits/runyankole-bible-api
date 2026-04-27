import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { book } = req.query

  let countQuery = supabase.from('verses').select('*', { count: 'exact', head: true })
  if (book) countQuery = countQuery.eq('book_number', parseInt(book))

  const { count, error: countError } = await countQuery
  if (countError || !count) return res.status(500).json({ error: 'Could not fetch verse count' })

  const randomOffset = Math.floor(Math.random() * count)

  let dataQuery = supabase
    .from('verses')
    .select('book_number, chapter, verse, text')
    .range(randomOffset, randomOffset)
  if (book) dataQuery = dataQuery.eq('book_number', parseInt(book))

  const { data, error } = await dataQuery

  if (error || !data || data.length === 0) {
    return res.status(500).json({ error: 'Could not fetch random verse' })
  }

  const v = data[0]

  const { data: book_data } = await supabase
    .from('books')
    .select('short_name, long_name')
    .eq('book_number', v.book_number)
    .single()

  return res.status(200).json({
    book_id: v.book_number,
    book_short: book_data?.short_name || null,
    book_name: book_data?.long_name || null,
    chapter: v.chapter,
    verse: v.verse,
    text: v.text
  })
}
