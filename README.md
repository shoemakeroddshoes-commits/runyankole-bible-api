# Runyankole Bible API

A free, public REST API for the Runyankole Bible (Baibuli Erikwera 1964) — 66 books, 31,106 verses.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/books` | List all 66 books |
| GET | `/api/verse?book=10&chapter=1&verse=1` | Fetch a single verse |
| GET | `/api/chapter?book=10&chapter=1` | Fetch all verses in a chapter |
| GET | `/api/search?q=Ruhanga` | Search verses by keyword |
| GET | `/api/random` | Get a random verse |

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Set environment variables

In Vercel dashboard → your project → Settings → Environment Variables, add:

```
SUPABASE_URL=https://grevgwvluswghvqcexrh.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Deploy

Push to GitHub, connect repo to Vercel — it auto-deploys.

## Tech stack

- **Vercel** — serverless API hosting
- **Supabase** — PostgreSQL database
- **Data** — Baibuli Erikwera 1964 © The Bible Society of Uganda
