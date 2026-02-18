import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDepts() {
    const { data, error } = await supabase
        .from('departments')
        .select('id, code, name');

    if (error) {
        console.error("Error:", error);
    } else {
        fs.writeFileSync('dept_list.json', JSON.stringify(data, null, 2));
        console.log("Dept list saved to dept_list.json");
        console.log(data);
    }
}

checkDepts();
