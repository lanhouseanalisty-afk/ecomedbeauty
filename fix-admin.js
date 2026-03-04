import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixUser() {
    console.log("Conectando ao Supabase para verificar o email reginaldo...");

    // We can't easily update without the user token if RLS is strict, but let's see.
    // Try to login if we can, or just query.
    const { data: emp, error } = await supabase
        .from('employees')
        .select('*')
        .ilike('email', '%reginaldo.mazaro%')
        .single();

    if (error) {
        console.error("Erro ao buscar employee:", error.message);
        return;
    }

    console.log("🚨 CONTA ENCONTRADA COM SEU EMAIL 🚨");
    console.log(JSON.stringify(emp, null, 2));
}

fixUser();
