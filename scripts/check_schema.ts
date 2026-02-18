
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env file
const envPath = path.resolve(__dirname, '../.env');
console.log("Loading env from:", envPath);
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.error(".env file not found at:", envPath);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials!");
    console.log("URL:", supabaseUrl);
    console.log("Key:", supabaseKey ? "Defined" : "Undefined");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("Testing comment usage...");

    // 1. Get a legal contract
    const { data: contract, error: contractError } = await supabase
        .from('legal_contracts')
        .select('id')
        .limit(1)
        .single();

    if (contractError || !contract) {
        console.error("Could not fetch a legal_contract:", contractError);
        return;
    }
    console.log("Found legal contract:", contract.id);

    // 2. Insert comment
    const { data: comment, error: commentError } = await supabase
        .from('contract_comments')
        .insert({
            contract_id: contract.id,
            content: "Test comment " + new Date().toISOString()
        })
        .select()
        .single();

    if (commentError) {
        console.error("Insert Error:", commentError);
    } else {
        console.log("Insert Success:", comment);
    }
}

checkSchema();
