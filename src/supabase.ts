import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://joooqmrftwentdkdmhib.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvb29xbXJmdHdlbnRka2RtaGliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE4MDgwMjksImV4cCI6MjAxNzM4NDAyOX0.fXPNplm2Qt_V3iGROo52SL_FEgo89tF1nVa36IU3ouM";
const supabase = createClient(supabaseUrl, supabaseKey);

const user = await supabase.auth.getUser();
const userData = await supabase
  .from("users")
  .select(
    `
  cod,
  email,
  role,
  equipe:id_equipe (id, empresas: id_empresa)
  `
  )
  .eq("email", user.data.user?.email);

export { supabase, user, userData };
