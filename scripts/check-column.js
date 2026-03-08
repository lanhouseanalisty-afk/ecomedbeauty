import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndAddColumn() {
    console.log("Checking for image_url column in bonus_inventory_items...");

    // We can't easily do DDL through the standard js client without an RPC or the service role key.
    // Let's first just try a select to see if it throws an error about the column.
    const { error } = await supabase.from('bonus_inventory_items').select('image_url').limit(1);

    if (error && error.code === '42703') {
        console.log("Column image_url doesn't exist. We need to add it via migration or SQL runner in the Supabase Dashboard as DDL via anon client is blocked.");
    } else if (error) {
        console.error("Other error checking column:", error);
    } else {
        console.log("Column image_url EXISTS. The error must be something else.");
    }
}

checkAndAddColumn();
