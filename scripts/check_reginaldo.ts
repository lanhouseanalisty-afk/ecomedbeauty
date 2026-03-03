import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Use SERVICE_ROLE_KEY to bypass RLS!
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

async function checkReginaldo() {
    const { data: emps } = await supabase.from('employees').select('id, user_id, full_name, email').ilike('email', '%reginaldo%');
    let result: any = { employees: emps, roles: {} };

    for (const emp of emps || []) {
        if (emp.user_id) {
            const { data: roles } = await supabase.from('user_roles').select('*').eq('user_id', emp.user_id);
            result.roles[emp.user_id] = roles;
        }
    }

    fs.writeFileSync('reginaldo_debug.json', JSON.stringify(result, null, 2));
}

checkReginaldo();
