
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    fs.writeFileSync('find_user_output.txt', "Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    let output = "Starting search for Reginaldo...\n";

    // Search PROFILES
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .ilike('full_name', '%Reginaldo%');

    if (profileError) output += `Profile Error: ${JSON.stringify(profileError)}\n`;
    else output += `Profiles found: ${JSON.stringify(profiles, null, 2)}\n`;

    // Search DEPARTMENTS
    const { data: depts, error: deptError } = await supabase
        .from('departments')
        .select('id, name')
        .ilike('name', '%Tech%');

    if (deptError) output += `Dept Error: ${JSON.stringify(deptError)}\n`;
    else output += `Departments found: ${JSON.stringify(depts, null, 2)}\n`;

    fs.writeFileSync('find_user_output.txt', output);
}

main();
