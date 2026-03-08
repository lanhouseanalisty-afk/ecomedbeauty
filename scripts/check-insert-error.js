import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkInsertError() {
    console.log("Checking insert error on bonus_inventory_items...");

    const { error } = await supabase.from('bonus_inventory_items').insert({
        name: 'Test Item',
        description: 'Test Desc',
        current_stock: 10,
        image_url: 'https://test.com/image.jpg',
        active: true
    });

    if (error) {
        console.error("Insert error details:", error);
    } else {
        console.log("Insert succeeded. The error must be related to storage bucket permissions.");
    }

    console.log("Testing storage upload...");
    // Test storage
    const { error: storageError } = await supabase.storage.from('images').upload('test.txt', 'test');
    if (storageError) {
        console.error("Storage error details:", storageError);
    } else {
        console.log("Storage upload succeeded.");
    }
}

checkInsertError();
