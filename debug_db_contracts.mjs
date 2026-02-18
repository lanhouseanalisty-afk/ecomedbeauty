import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const depts = await supabase.from('departments').select('id, name, code');
    const contracts = await supabase.from('legal_contracts').select('id, title, status, department_id, created_at').order('created_at', { ascending: false }).limit(5);

    const results = {
        departments: depts.data,
        latest_contracts: contracts.data,
        error_depts: depts.error,
        error_contracts: contracts.error
    };
    fs.writeFileSync('debug_missing_contracts.json', JSON.stringify(results, null, 2));
}

check();
