// Supabase client — same project, same credentials as the previous app.
// The anon key is safe to ship in the frontend: Row Level Security means
// it grants zero data access without a valid login.
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://xvvfjrrzjhklnydeujhd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2dmZqcnJ6amhrbG55ZGV1amhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzYyODIsImV4cCI6MjA5NjY1MjI4Mn0.4cLeVgREmQlZ8po9ItABlAR5mXnItM34WxXceUBGrho'
)
