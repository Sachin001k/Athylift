import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Provide a safe fallback so the UI doesn't crash when env vars are missing.
const createStubClient = () => {
  const error = new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  const builder: any = {
    select: async () => ({ data: null, error }),
    insert: async () => ({ data: null, error }),
    update: async () => ({ data: null, error }),
    delete: async () => ({ data: null, error }),
    upsert: async () => ({ data: null, error }),
    eq: () => builder,
    in: () => builder,
    order: () => builder,
    limit: () => builder,
    single: async () => ({ data: null, error }),
  };

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error }),
      signInWithPassword: async () => ({ data: null, error }),
      signUp: async () => ({ data: null, error }),
      signOut: async () => ({ error }),
    },
    from: () => builder,
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error }),
        remove: async () => ({ data: null, error }),
        download: async () => ({ data: null, error }),
      }),
    },
    rpc: async () => ({ data: null, error }),
  } as any;
};

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : createStubClient();
