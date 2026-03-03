const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const email = process.argv[2] || 'gleice.rodrigues@ext.medbeauty.com.br';
    console.log(`Checking email: ${email}`);

    // Test the exact query from AuthContext
    const { data, error } = await supabase
        .from("employees")
        .select(`
      id,
      department_id,
      departments (
        module_slug
      )
    `)
        .eq('email', email)
        .maybeSingle();

    if (error) {
        console.error("Query error:", error);
    } else {
        console.dir("Query data:", { depth: null });
        console.log(JSON.stringify(data, null, 2));
    }
}

main().catch(console.error);
