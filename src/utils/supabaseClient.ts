import { createClient } from '@supabase/supabase-js';
import Config from 'react-native-config';

const SUPABASE_URL = Config.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = Config.SUPABASE_ANON_KEY || '';

const missingCredentialsMessage =
  'Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(missingCredentialsMessage);
}

const unconfiguredSupabaseProxy = new Proxy(
  {},
  {
    get() {
      throw new Error(missingCredentialsMessage);
    },
  },
);

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : (unconfiguredSupabaseProxy as any);

export default supabase;
