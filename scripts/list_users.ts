
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    fs.writeFileSync('list_users.txt', "Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    let output = "Listing users...\n";

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .limit(10);

    if (error) output += `Error: ${JSON.stringify(error)}\n`;
    else output += `Profiles: ${JSON.stringify(profiles, null, 2)}\n`;

    fs.writeFileSync('list_users.txt', output);
}

main();
