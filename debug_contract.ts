
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkContract() {
    const id = '9fba1852-6cb1-4d81-93b6-24636db1744a';
    console.log(`Checking contract: ${id}`);

    const { data, error } = await supabase
        .from('contracts')
        .select(`
            *,
            revisions:contract_revisions(*),
            comments:contract_comments(*),
            requester:profiles(full_name)
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error("Error fetching contract:", error);
        // Check columns
        const { error: colError } = await supabase.from('contracts').select('contractor_name').limit(1);
        if (colError) {
            console.error("Checking 'contractor_name' column:", colError);
        } else {
            console.log("'contractor_name' column exists.");
        }
    } else {
        console.log("Contract found:", data);
    }
}

checkContract();
