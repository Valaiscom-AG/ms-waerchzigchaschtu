export async function getSupabaseClient() {
    const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js');

    const supabaseUrl = "https://ilmufbxfsvyhpaqwdyxg.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsbXVmYnhmc3Z5aHBhcXdkeXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxODI1OTc3NywiZXhwIjoyMDMzODM1Nzc3fQ.wdL26ds_JBVuEl_6e8TBQxRxa1Pqz2JmLQOlARKHJdE";


    const supabase = createClient(supabaseUrl, supabaseKey);
    return supabase;
}
