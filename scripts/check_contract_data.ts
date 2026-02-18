import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

async function checkContract() {
    console.log("Searching for contract...");

    const { data, error } = await supabase
        .from('legal_contracts')
        .select('id, title, sap_request_id, description, status')
        .ilike('title', '%Notebooks%')
        .limit(1);

    if (error) {
        console.error("Error fetching:", error);
    } else {
        console.log("Contract Found:", data);
    }
}

checkContract();
