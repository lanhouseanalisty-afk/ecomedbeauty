import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: contracts, error } = await supabase
        .from('legal_contracts')
        .select('id, title, status, responsible_id, department_id, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

    const { data: depts } = await supabase.from('departments').select('id, name, code');

    const results = {
        contracts,
        error,
        departments: depts
    };
    fs.writeFileSync('debug_check_results.json', JSON.stringify(results, null, 2));
}

check();
