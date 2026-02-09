
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Paths to projects
const CHECKLIST_PATH = 'c:\\Users\\reginaldo.mazaro\\OneDrive - Skinstore S.A\\Documentos\\GitHub\\CheckList';
const ECOMED_PATH = 'c:\\Users\\reginaldo.mazaro\\OneDrive - Skinstore S.A\\Documentos\\GitHub\\ecomedbeauty-main';

function getEnvValue(dir: string, key: string): string | undefined {
    const envPath = path.join(dir, '.env');
    if (!fs.existsSync(envPath)) return undefined;
    const content = fs.readFileSync(envPath, 'utf-8');
    const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].trim().replace(/^["']|["']$/g, '') : undefined;
}

async function migrate() {
    console.log("🚀 Starting migration (Robust Mode)...");

    const sourceUrl = getEnvValue(CHECKLIST_PATH, 'VITE_SUPABASE_URL');
    const sourceKey = getEnvValue(CHECKLIST_PATH, 'VITE_SUPABASE_ANON_KEY');
    const targetUrl = getEnvValue(ECOMED_PATH, 'VITE_SUPABASE_URL');
    const targetKey = getEnvValue(ECOMED_PATH, 'VITE_SUPABASE_PUBLISHABLE_KEY') || getEnvValue(ECOMED_PATH, 'VITE_SUPABASE_ANON_KEY');

    if (!sourceUrl || !sourceKey || !targetUrl || !targetKey) {
        console.error("❌ Credentials missing.");
        process.exit(1);
    }

    const source = createClient(sourceUrl, sourceKey);
    const target = createClient(targetUrl, targetKey);

    // 1. Vehicles
    console.log("--------------------------------");
    console.log("🚙 Processing Vehicles...");
    const { data: vehicles, error: vError } = await source.from('vehicles').select('*');

    if (vError) {
        console.error("❌ Source Read Error (Vehicles):", vError.message);
    } else if (vehicles && vehicles.length > 0) {
        console.log(`📥 Read ${vehicles.length} vehicles from Source.`);
        let successCount = 0;
        for (const v of vehicles) {
            const { error } = await target.from('vehicles').upsert(v, { onConflict: 'id' });
            if (error) {
                console.error(`  ❌ Failed to insert vehicle ${v.plate || v.id}: ${error.message}`);
            } else {
                successCount++;
            }
        }
        console.log(`📤 Successfully migrated ${successCount} vehicles.`);
    } else {
        console.log("⚠️ No vehicles found in Source.");
    }

    // 2. Assets
    console.log("--------------------------------");
    console.log("💻 Processing Tech Assets...");
    const { data: assets, error: aError } = await source.from('tech_assets').select('*');

    if (aError) {
        console.error("❌ Source Read Error (Assets):", aError.message);
    } else if (assets && assets.length > 0) {
        console.log(`📥 Read ${assets.length} assets from Source.`);

        let successCount = 0;
        const chunkSize = 20; // Smaller chunk for safety

        for (let i = 0; i < assets.length; i += chunkSize) {
            const chunk = assets.slice(i, i + chunkSize);
            const { error } = await target.from('tech_assets').upsert(chunk, { onConflict: 'id' });

            if (error) {
                console.error(`  ❌ Batch error (indices ${i}-${i + chunkSize}): ${error.message}`);
                // Retry individually
                for (const a of chunk) {
                    const { error: indError } = await target.from('tech_assets').upsert(a, { onConflict: 'id' });
                    if (!indError) successCount++;
                    else console.error(`    -> Item error (${a.asset_tag}): ${indError.message}`);
                }
            } else {
                successCount += chunk.length;
                process.stdout.write(".");
            }
        }
        console.log(`\n📤 Successfully migrated ${successCount} assets.`);
    } else {
        console.log("⚠️ No assets found in Source.");
    }
}

migrate();
