# .env.local
# ─────────────────────────────────────────────────────────────
# VEROCENT ERP — ENVIRONMENT VARIABLES
# ─────────────────────────────────────────────────────────────
# HOW TO FILL THIS IN:
# 1. Go to supabase.com → your project → Settings → API
# 2. Copy "Project URL" → paste after NEXT_PUBLIC_SUPABASE_URL=
# 3. Copy "anon public" key → paste after NEXT_PUBLIC_SUPABASE_ANON_KEY=
# ─────────────────────────────────────────────────────────────

NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE

# ─────────────────────────────────────────────────────────────
# IMPORTANT:
# - Never share this file with anyone
# - Never push this file to GitHub (it is already in .gitignore)
# - When deploying to Vercel, add these same values in:
#   Vercel Dashboard → Your Project → Settings → Environment Variables
# ─────────────────────────────────────────────────────────────
