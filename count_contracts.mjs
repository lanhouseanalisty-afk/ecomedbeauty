import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { count, error } = await supabase
        .from('legal_contracts')
        .select('*', { count: 'exact', head: true });

    const { data: samples, error: err2 } = await supabase
        .from('legal_contracts')
        .select('id, title, status, created_at')
        .limit(5);

    const result = {
        total_count: count,
        count_error: error,
        samples: samples,
        samples_error: err2
    };
    fs.writeFileSync('contract_counts.json', JSON.stringify(result, null, 2));
}
check();
