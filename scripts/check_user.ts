import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL') || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = Deno.env.get('VITE_SUPABASE_ANON_KEY') || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser(email: string) {
    console.log(`\n--- Checking User: ${email} ---`);

    // Check Employees table
    const { data: emp, error: empErr } = await supabase.from('employees').select('*').eq('email', email);
    if (empErr) console.error("Employee fetch error:", empErr);
    else {
        console.log("Employees Data:", emp);
        if (emp && emp.length > 0) {
            const userId = emp[0].user_id;
            console.log(`Found user_id: ${userId}`);

            if (userId) {
                // Check user_roles table
                const { data: roles, error: rolesErr } = await supabase.from('user_roles').select('*').eq('user_id', userId);
                if (rolesErr) console.error("Roles fetch error:", rolesErr);
                else console.log("User Roles:", roles);

                // Check Department module linked
                if (emp[0].department_id) {
                    const { data: dept, error: deptErr } = await supabase.from('departments').select('*').eq('id', emp[0].department_id);
                    if (deptErr) console.error("Department fetch error:", deptErr);
                    else console.log("Department:", dept);
                } else {
                    console.log("No department_id set for employee.");
                }
            }
        } else {
            console.log("No employee record found for this email.");
        }
    }
}

async function main() {
    await checkUser('reginaldo.mazaro@ext.medbeauty.com.br');
    await checkUser('gleice@medbeauty.com.br'); // Replace with Gleice's exact email if different, assuming gleice
}

main().catch(console.error);
