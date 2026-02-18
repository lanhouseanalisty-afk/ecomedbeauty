import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.rpc('get_table_constraints', { t_name: 'legal_contracts' });
    // Since I don't have this RPC, I'll try to insert a dummy row with 'requested' and see it fail

    const { error: err } = await supabase
        .from('legal_contracts')
        .insert({
            title: 'Test Status',
            status: 'requested',
            contract_number: 'TEMP-STATUS-CHECK-' + Date.now()
        });

    if (err) {
        console.log("FAILED to insert 'requested':", err.message);
    } else {
        console.log("SUCCESS: 'requested' is allowed.");
        // Clean up
        await supabase.from('legal_contracts')
            .delete()
            .eq('title', 'Test Status');
    }
}
check();
