
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

async function checkLatestContracts() {
    console.log('Fetching latest contracts...');

    const { data, error } = await supabase
        .from('legal_contracts')
        .select('id, title, party_name, party_document') // Removed contractor_name as it might not exist
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching:', JSON.stringify(error, null, 2));
        return;
    }

    console.log('Found', data?.length, 'contracts');
    data?.forEach(c => {
        console.log(`ID: ${c.id}`);
        console.log(`Title: ${c.title}`);
        console.log(`Party Name: ${c.party_name}`);
        console.log(`Party Doc: ${c.party_document}`);
        console.log('---');
    });
}

checkLatestContracts();
