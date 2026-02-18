
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatestContract() {
    console.log('Fetching latest contract...');

    // Use correct column names based on my understanding
    const { data, error } = await supabase
        .from('legal_contracts')
        .select('id, title, party_name, party_document')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error('Error fetching:', error);
        return;
    }

    console.log('Latest Contract Data:', data);
}

checkLatestContract();
