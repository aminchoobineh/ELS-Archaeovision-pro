const { createClient } = require('@supabase/supabase-js');

// ============================================
// ماژول اتصال به Supabase
// توسط تیم بک‌اند
// ============================================

let supabaseInstance = null;

exports.getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not set');
  }
  
  supabaseInstance = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    db: { schema: 'public' }
  });
  
  return supabaseInstance;
};