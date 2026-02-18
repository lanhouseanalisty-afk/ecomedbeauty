import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRevisions() {
    console.log('Testing revisions table...');

    // 1. Get a legal contract
    const { data: contracts, error: cError } = await supabase
        .from('legal_contracts')
        .select('id')
        .limit(1);

    if (cError) {
        console.error('Error fetching contracts:', cError);
        return;
    }

    if (!contracts || contracts.length === 0) {
        console.log('No legal contracts found to test.');
        return;
    }

    const contractId = contracts[0].id;
    console.log('Found contract:', contractId);

    // 2. Try to insert a revision
    const { data: revision, error: rError } = await supabase
        .from('contract_revisions')
        .insert({
            contract_id: contractId,
            version_number: 1,
            content: 'Test Revision Content',
            comments: 'System Test'
        })
        .select()
        .single();

    if (rError) {
        console.error('Error inserting revision:', rError);
    } else {
        console.log('Revision inserted successfully:', revision);

        // Cleanup
        await supabase.from('contract_revisions').delete().eq('id', revision.id);
        console.log('Cleanup done.');
    }
}

checkRevisions();
