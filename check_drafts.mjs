import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase
        .from('legal_contracts')
        .select('id, title, status, responsible_id, responsible_legal_id')
        .eq('status', 'draft')
        .limit(10);

    fs.writeFileSync('draft_check.json', JSON.stringify({ data, error }, null, 2));
}
check();
