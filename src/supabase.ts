import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://joooqmrftwentdkdmhib.supabase.co";
const supabaseKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, String(supabaseKey));

export { supabase };
