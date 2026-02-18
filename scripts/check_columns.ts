
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    fs.writeFileSync('columns_output.txt', "Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    let output = "Checking columns...\n";

    // We can't query information_schema directly via supabase-js client if RLS is on or permissions are tight.
    // Instead, let's fetch one row and see keys.
    const { data: contracts, error } = await supabase
        .from('legal_contracts')
        .select('*')
        .limit(1);

    if (error) {
        output += `Error fetching contracts: ${JSON.stringify(error)}\n`;
    } else if (contracts && contracts.length > 0) {
        const keys = Object.keys(contracts[0]);
        output += `Columns found via Select *: ${keys.join(', ')}\n`;
    } else {
        output += `No contracts found to inspect columns.\n`;
    }

    fs.writeFileSync('columns_output.txt', output);
}

main();
