
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const CHECKLIST_PATH = 'c:\\Users\\reginaldo.mazaro\\OneDrive - Skinstore S.A\\Documentos\\GitHub\\CheckList';

function getEnvValue(dir: string, key: string): string | undefined {
    const envPath = path.join(dir, '.env');
    if (!fs.existsSync(envPath)) return undefined;
    const content = fs.readFileSync(envPath, 'utf-8');
    const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
    // Check for privileged keys
    const serviceKey = getEnvValue(ECOMED_PATH, 'SUPABASE_SERVICE_ROLE_KEY') || getEnvValue(ECOMED_PATH, 'VITE_SUPABASE_SERVICE_ROLE_KEY');
    const dbUrl = getEnvValue(ECOMED_PATH, 'DATABASE_URL');

    console.log(`🔑 Service Key Present: ${!!serviceKey}`);
    console.log(`🔑 DB URL Present: ${!!dbUrl}`);

    if (serviceKey) console.log("   -> Can use Service Key to bypass RLS!");
    if (dbUrl) console.log("   -> Can use Direct DB Connection!");

    // Try to count vehicles w/ explicit error logging
    const { count: vCount, error: vError } = await source
        .from('vehicles')
        .select('*', { count: 'exact', head: true });

    if (vError) {
        console.error("❌ Error reading Vehicles:", vError.message);
        console.error("   Hint: This usually means RLS is blocking anonymous access.");
    } else {
        console.log(`✅ Vehicles Record Count: ${vCount}`);
    }

    // Try to count assets
    const { count: aCount, error: aError } = await source
        .from('tech_assets')
        .select('*', { count: 'exact', head: true });

    if (aError) {
        console.error("❌ Error reading Tech Assets:", aError.message);
    } else {
        console.log(`✅ Tech Assets Record Count: ${aCount}`);
    }
}

diagnose();
