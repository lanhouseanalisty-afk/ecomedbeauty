
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    fs.writeFileSync('find_user_output_email.txt', "Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    let output = "Starting search for Reginaldo by email...\n";

    // Search AUTH USERS (via RPC if possible, or profiles)
    // trying profiles first with email
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .ilike('email', '%reginaldo.mazaro%');

    if (profileError) output += `Profile Error: ${JSON.stringify(profileError)}\n`;
    else output += `Profiles found: ${JSON.stringify(profiles, null, 2)}\n`;

    fs.writeFileSync('find_user_output_email.txt', output);
}

main();
