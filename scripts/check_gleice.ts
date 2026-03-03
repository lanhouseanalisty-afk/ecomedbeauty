import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

import * as fs from 'fs';

async function checkGleice() {
    const { data: emps, error: err } = await supabase
        .from('employees')
        .select('*')
        .ilike('full_name', '%gleice%');

    if (err) {
        fs.writeFileSync('gleice_debug.json', JSON.stringify({ error: err }));
        return;
    }

    let result: any = { employees: emps, roles: {} };

    for (const emp of emps || []) {
        if (emp.user_id) {
            const { data: roles } = await supabase.from('user_roles').select('*').eq('user_id', emp.user_id);
            result.roles[emp.user_id] = roles;
        }
    }

    fs.writeFileSync('gleice_debug.json', JSON.stringify(result, null, 2));
}

checkGleice();
