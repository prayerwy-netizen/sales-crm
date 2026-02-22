import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// 服务端用，每次调用时读取 env var，绕过 RLS
export function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (supabaseUrl && serviceKey) {
    return createClient(supabaseUrl, serviceKey);
  }
  return supabase;
}

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}
