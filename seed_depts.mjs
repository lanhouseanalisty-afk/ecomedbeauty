import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    const comercial = await supabase.from('departments').select('id').eq('code', 'COM').single();
    const parentId = comercial.data?.id;

    if (!parentId) {
        console.error("Comercial department (COM) not found. Check codes.");
        // Try lowercase
        const comercial2 = await supabase.from('departments').select('id').eq('code', 'comercial').single();
        if (comercial2.data) {
            await seedWithParent(comercial2.data.id);
        }
    } else {
        await seedWithParent(parentId);
    }
}

async function seedWithParent(parentId) {
    const { data, error } = await supabase.from('departments').upsert({
        id: '10000000-0000-0000-0000-000000000010',
        name: 'Franquias',
        code: 'com_franchises',
        parent_id: parentId
    }, { onConflict: 'code' });

    if (error) console.error("Error seeding Franquias:", error);
    else console.log("Franquias seeded successfully");
}

seed();
