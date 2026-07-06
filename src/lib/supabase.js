import { createClient } from '@supabase/supabase-js'

const url = process.env.REACT_APP_SUPABASE_URL
const key = process.env.REACT_APP_SUPABASE_ANON_KEY

// Validate presence — createClient(undefined, undefined) throws a cryptic
// internal error; this replaces it with something actionable.
const missing = [
  !url && 'REACT_APP_SUPABASE_URL',
  !key && 'REACT_APP_SUPABASE_ANON_KEY',
].filter(Boolean)

if (missing.length) { 
  throw new Error(
    `Supabase is not configured. Missing variable${missing.length > 1 ? 's' : ''}:\n` +
    missing.map(v => `  • ${v}`).join('\n') +
    '\n\nAdd them to .env (local) or your deployment environment (Netlify / Vercel).'
  )
}

// Validate URL shape — catches copy-paste errors such as trailing slashes,
// wrong domain, or accidentally using the service-role key URL.
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)) {
  throw new Error(
    `REACT_APP_SUPABASE_URL is invalid: "${url}"\n` +
    'Expected format: https://<project-ref>.supabase.co'
  )
}

// Anon key is a JWT — all JWTs start with "eyJ". Catches service-role key
// being used by mistake (same shape, wrong permissions footprint).
if (!key.startsWith('eyJ')) {
  throw new Error(
    'REACT_APP_SUPABASE_ANON_KEY does not look like a valid JWT.\n' +
    'Find it at: Supabase Dashboard → Project Settings → API → anon public'
  )
}

export const supabase = createClient(url, key)
