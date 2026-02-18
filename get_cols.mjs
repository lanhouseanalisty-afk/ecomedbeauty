import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.rpc('inspect_table', { table_name: 'legal_contracts' });

    // If RPC is missing, use information_schema (might fail due to permissions)
    if (error) {
        const { data: cols, error: err2 } = await supabase
            .from('information_schema.columns' as any)
            .select('column_name')
            .eq('table_name', 'legal_contracts');

        fs.writeFileSync('table_cols.json', JSON.stringify({ columns: cols, error: err2 }, null, 2));
    } else {
        fs.writeFileSync('table_cols.json', JSON.stringify(data, null, 2));
    }
}

check();
