import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: cols, error } = await supabase.from('legal_contracts').select('*').limit(1);
    if (cols && cols.length > 0) {
        fs.writeFileSync('real_columns.json', JSON.stringify(Object.keys(cols[0]), null, 2));
    } else {
        fs.writeFileSync('real_columns.json', JSON.stringify({ error: "No data found or table empty", details: error }, null, 2));
    }
}
check();
