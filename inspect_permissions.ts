
import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

// Replace with values from .env
const SUPABASE_URL = "https://hxdfbwptgtthaqddneyr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZGZid3B0Z3R0aGFxZGRuZXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTk5ODksImV4cCI6MjA4NDc3NTk4OX0.rXq8BNh1vARTYhD8VZLF4yWrFkE4XW2r5gRrr8Jnc6c";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectPermissions() {
    console.log("Connecting to Supabase...");

    // Try to select generic permissions
    // Note: RLS might block this for anon user. 
    // But let's see if we get an empty array or an error.
    const { data, error } = await supabase
        .from("permissions")
        .select("*");

    if (error) {
        console.error("Error fetching permissions:", error);
    } else {
        console.log("Permissions Data:", data);
        console.log("Count:", data?.length);
    }

    // Also check if table exists by trying to select 1 row
    // If error is 404/relation does not exist, table is missing.
}

inspectPermissions();
