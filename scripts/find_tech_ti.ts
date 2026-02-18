
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    fs.writeFileSync('find_output.txt', "Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    let output = "Starting search...\n";

    // 1. Search PROFILES
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .or('full_name.ilike.%Tech%,email.ilike.%tech%,full_name.ilike.%Marcelo%'); // Combined search

    if (profileError) output += `Profile Error: ${JSON.stringify(profileError)}\n`;
    else output += `Profiles found: ${JSON.stringify(profiles, null, 2)}\n`;

    // 2. Search CONTRACTS
    const { data: contracts, error: contractError } = await supabase
        .from('legal_contracts')
        .select('id, title, description, requester_id')
        .or('title.ilike.%impressora%,description.ilike.%impressora%');

    if (contractError) output += `Contract Error: ${JSON.stringify(contractError)}\n`;
    else output += `Contracts found: ${JSON.stringify(contracts, null, 2)}\n`;

    fs.writeFileSync('find_output.txt', output);
}

main();
