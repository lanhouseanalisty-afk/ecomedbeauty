import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: contracts, error: err1 } = await supabase.from('contracts').select('id, title').limit(5);
    const { data: legal_contracts, error: err2 } = await supabase.from('legal_contracts').select('id, title').limit(5);

    console.log("Contracts table:", contracts || err1);
    console.log("Legal Contracts table:", legal_contracts || err2);
}

check();
