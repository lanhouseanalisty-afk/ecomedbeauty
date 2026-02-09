
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const ECOMED_PATH = 'c:\\Users\\reginaldo.mazaro\\OneDrive - Skinstore S.A\\Documentos\\GitHub\\ecomedbeauty-main';

function getEnvValue(dir: string, key: string): string | undefined {
    const envPath = path.join(dir, '.env');
    if (!fs.existsSync(envPath)) return undefined;
    const content = fs.readFileSync(envPath, 'utf-8');
    const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].trim().replace(/^["']|["']$/g, '') : undefined;
}

async function verify() {
    const targetUrl = getEnvValue(ECOMED_PATH, 'VITE_SUPABASE_URL');
    const targetKey = getEnvValue(ECOMED_PATH, 'VITE_SUPABASE_PUBLISHABLE_KEY') || getEnvValue(ECOMED_PATH, 'VITE_SUPABASE_ANON_KEY');

    if (!targetUrl || !targetKey) {
        console.error("❌ Credentials missing.");
        process.exit(1);
    }

    const target = createClient(targetUrl, targetKey);

    const { count: vCount, error: vError } = await target.from('vehicles').select('*', { count: 'exact', head: true });
    const { count: aCount, error: aError } = await target.from('tech_assets').select('*', { count: 'exact', head: true });

    if (vError) console.error("Vehicle Error:", vError.message);
    else console.log(`🚗 Vehicles in Target: ${vCount}`);

    if (aError) console.error("Asset Error:", aError.message);
    else console.log(`💻 Assets in Target: ${aCount}`);
}

verify();
