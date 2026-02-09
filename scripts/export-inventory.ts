
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const CHECKLIST_PATH = 'c:\\Users\\reginaldo.mazaro\\OneDrive - Skinstore S.A\\Documentos\\GitHub\\CheckList';
const OUTPUT_FILE = 'migracao_inventario.csv';

function getEnvValue(dir: string, key: string): string | undefined {
    const envPath = path.join(dir, '.env');
    if (!fs.existsSync(envPath)) return undefined;
    const content = fs.readFileSync(envPath, 'utf-8');
    const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].trim().replace(/^["']|["']$/g, '') : undefined;
}

async function exportToCSV() {
    console.log("🚀 Exporting Source Data to CSV...");

    const sourceUrl = getEnvValue(CHECKLIST_PATH, 'VITE_SUPABASE_URL');
    const sourceKey = getEnvValue(CHECKLIST_PATH, 'VITE_SUPABASE_ANON_KEY');

    if (!sourceUrl || !sourceKey) {
        console.error("❌ Credentials missing.");
        return;
    }

    const source = createClient(sourceUrl, sourceKey);
    const { data: assets, error } = await source.from('tech_assets').select('*');

    if (error) {
        console.error("❌ Error fetching:", error.message);
        return;
    }

    if (!assets || assets.length === 0) {
        console.warn("⚠️ No assets found.");
        return;
    }

    console.log(`📥 Found ${assets.length} assets.`);

    // Map to CSV headers expected by InventoryPage.tsx
    // Headers: Patrimônio, Modelo, Marca, Hostname, Responsável, Série, Status, Tipo, Local, Empresa, Observações
    const headers = [
        'Patrimônio', 'Modelo', 'Marca', 'Hostname', 'Responsável',
        'Série', 'Status', 'Tipo', 'Local', 'Empresa', 'Observações'
    ];

    const csvRows = [headers.join(',')];

    for (const a of assets) {
        const row = [
            a.asset_tag || '',
            a.model || '',
            a.brand || '',
            a.hostname || '',
            a.assigned_to_name || '',
            a.serial_number || '',
            a.status || '',
            a.device_type || '', // Important: logic maps 'notebook' correctly
            a.location || '',
            a.company || '',
            (a.notes || '').replace(/,/g, ';') // Simple escape for CSV
        ].map(val => `"${String(val).replace(/"/g, '""')}"`); // Quote all fields

        csvRows.push(row.join(','));
    }

    fs.writeFileSync(OUTPUT_FILE, csvRows.join('\n'));
    console.log(`✅ CSV saved to: ${path.resolve(OUTPUT_FILE)}`);
}

exportToCSV();
