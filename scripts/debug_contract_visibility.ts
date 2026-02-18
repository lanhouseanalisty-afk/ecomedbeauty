
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    fs.writeFileSync('debug_visibility.txt', "Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    let output = "Starting debug...\n";

    // 1. Get User ID (Assuming unique email match found previously or hardcoded if needed)
    // We'll search by email again to be sure
    const { data: users } = await supabase
        .from('profiles')
        .select('id, email')
        .ilike('email', '%reginaldo.mazaro%')
        .limit(1);

    const userId = users?.[0]?.id;
    output += `User ID: ${userId}\n`;

    if (userId) {
        // 2. Check User Departments
        const { data: deptMembers } = await supabase
            .from('department_members')
            .select('department_id, departments(name)')
            .eq('user_id', userId);

        output += `User Departments: ${JSON.stringify(deptMembers, null, 2)}\n`;

        // 3. Check Latest Contract by User
        const { data: contracts } = await supabase
            .from('legal_contracts')
            .select('id, title, department_id, status, created_at')
            .eq('requester_id', userId)
            .order('created_at', { ascending: false })
            .limit(1);

        output += `Latest Contract: ${JSON.stringify(contracts, null, 2)}\n`;

        // 4. Verify Match
        if (contracts?.[0] && deptMembers) {
            const contractDept = contracts[0].department_id;
            const hasAccess = deptMembers.some(dm => dm.department_id === contractDept);
            output += `\nHas Access (Department Match): ${hasAccess}\n`;
            if (!hasAccess) {
                output += `MISMATCH: Contract is in dept ${contractDept}, but user is in ${JSON.stringify(deptMembers.map(d => d.department_id))}\n`;
            }
        }
    }

    fs.writeFileSync('debug_visibility.txt', output);
}

main();
