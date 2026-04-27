import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { data, error } = await supabase
    .from('books')
    .select('book_number, short_name, long_name, sorting_order')
    .order('sorting_order')

  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json({
    count: data.length,
    books: data.map(b => ({
      id: b.book_number,
      short_name: b.short_name,
      long_name: b.long_name
    }))
  })
}
