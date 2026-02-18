import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}

// NOTE: This usually requires a service role key for some operations, 
// but if RLS allows authenticated users to update (unlikely), it might fail.
// However, I'll try with the anon key or check if I can just inform the user.
// Wait, the user might have provided a service key if I'm lucky? No, only anon in .env.
// I'll try to use the anon key. If it fails due to RLS, I'll know.
const supabase = createClient(supabaseUrl, supabaseKey);

async function sync() {
    const updates = [
        { old: 'ADMIN', new: 'admin' },
        { old: 'FIN', new: 'financeiro' },
        { old: 'MKT', new: 'marketing' },
        { old: 'COM', new: 'comercial' },
        { old: 'LOG', new: 'logistica' },
        { old: 'JUR', new: 'juridico' },
        { old: 'TECH', new: 'tech' },
        { old: 'ECOM', new: 'ecommerce' },
        { old: 'COMPRAS', new: 'compras' },
        { old: 'RH', new: 'rh' }
    ];

    for (const update of updates) {
        const { error } = await supabase
            .from('departments')
            .update({ code: update.new })
            .eq('code', update.old);

        if (error) console.error(`Error updating ${update.old}:`, error.message);
        else console.log(`Updated ${update.old} -> ${update.new}`);
    }

    // Also fix com_inside
    await supabase.from('departments').update({ code: 'com_inside_sales' }).eq('code', 'com_inside');
}

sync();
