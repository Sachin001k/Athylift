import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Provide a safe fallback so the UI doesn't crash when env vars are missing.
// Every query chain (e.g. .select().eq().order()) resolves to { data: null, error }.
const createStubClient = () => {
  const error = new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  const result = { data: null, error, count: null };

  const builder: any = new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === 'then') {
          return (resolve: (value: typeof result) => unknown) => Promise.resolve(result).then(resolve);
        }
        return () => builder;
      },
    }
  );

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error }),
      getSession: async () => ({ data: { session: null }, error }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error }),
      signUp: async () => ({ data: { user: null, session: null }, error }),
      signOut: async () => ({ error }),
      resetPasswordForEmail: async () => ({ data: {}, error }),
      updateUser: async () => ({ data: { user: null }, error }),
    },
    from: () => builder,
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error }),
        remove: async () => ({ data: null, error }),
        download: async () => ({ data: null, error }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
    rpc: () => builder,
  } as any;
};

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : createStubClient();
