
const fs = require('fs');
const path = require('path');

const INPUT_CSV = path.join(__dirname, 'migracao_inventario.csv');
const OUTPUT_SQL = path.join(__dirname, 'RESTORE_FROM_CSV.sql');

function normalizeStatus(rawStatus, assignedName) {
    const s = (rawStatus || '').toString().toLowerCase();
    if (s.includes('uso') || s.includes('use') || s.includes('atribuido')) return 'in_use';
    if (s.includes('manutencao') || s.includes('conserto')) return 'maintenance';
    if (s.includes('quebrado') || s.includes('defeito')) return 'broken';
    if (s.includes('perda') || s.includes('extravio')) return 'lost';
    if (s.includes('devolvido')) return 'available';

    if (assignedName && !['Disponível', '*', '**', ''].includes(assignedName)) {
        return 'in_use';
    }
    return 'available';
}

function normalizeType(rawType, hostname) {
    const t = (rawType || '').toString().toLowerCase();
    const h = (hostname || '').toString().toLowerCase();

    if (h.includes('lap')) return 'notebook';
    if (t.includes('celular') || t.includes('phone') || t.includes('mobile')) return 'smartphone';
    if (t.includes('tablet') || t.includes('ipad')) return 'tablet';
    if (t.includes('chip') || t.includes('sim')) return 'chip';
    if (t.includes('monitor')) return 'monitor';
    if (t.includes('note') || t.includes('computador')) return 'notebook';

    return 'other';
}

function escapeSql(val) {
    if (val === undefined || val === null || val === '') return 'NULL';
    return `'${String(val).replace(/'/g, "''")}'`;
}

try {
    const content = fs.readFileSync(INPUT_CSV, 'utf-8');
    const lines = content.split(/\r?\n/);

    // Header check
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    // Expected: Patrimônio,Modelo,Marca,Hostname,Responsável,Série,Status,Tipo,Local,Empresa,Observações

    const sqlLines = [];
    sqlLines.push("-- AUTOMATICALLY GENERATED RESTORE SCRIPT (via Node.js)");
    sqlLines.push("-- Source: migracao_inventario.csv");
    sqlLines.push("");
    sqlLines.push("BEGIN;");
    sqlLines.push("");
    sqlLines.push("-- 1. Clean up test data");
    sqlLines.push("DELETE FROM tech_assets WHERE asset_tag LIKE 'TEST-%';");
    sqlLines.push("");
    sqlLines.push("-- 2. Insert Data");

    // Helper to parse CSV line respecting quotes (simple implementation)
    // Actually the file seems simple enough, but let's handle quotes just in case.
    // Given the view_file output: "27488","Laptop"... 
    // It uses double quotes.

    let successCount = 0;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        let cols = [];

        // Simple manual parsing for "val","val" format
        // Logic: remove leading " and trailing ", then split by ","
        if (line.startsWith('"') && line.endsWith('"')) {
            // Remove first and last quote
            const content = line.substring(1, line.length - 1);
            // Split by separator
            cols = content.split('","');
        } else {
            // Fallback for non-quoted or mixed?
            // Just split by comma
            cols = line.split(',');
        }

        if (cols.length < 1) continue;

        // Clean up any remaining quotes if split wasn't perfect or if fields had no quotes?
        // The split '","' logic assumes all fields are quoted.
        // Looking at the CSV file content provided earlier:
        // "27488","Laptop","Genérico","BackupRenan","suporte","PE06LWP8","in_use","notebook","","",""
        // Yes, all fields seem quoted.

        // Mapping by index based on header line 1
        // Patrimônio,Modelo,Marca,Hostname,Responsável,Série,Status,Tipo,Local,Empresa,Observações
        // 0,1,2,3,4,5,6,7,8,9,10

        const patrimonio = cols[0];
        // If patrimonio is empty/invalid, skip
        if (!patrimonio || patrimonio.trim() === '') continue;

        const model = cols[1];
        const brand = cols[2];
        const hostname = cols[3];
        const assigned = cols[4];
        const serial = cols[5];
        const statusRaw = cols[6];
        const typeRaw = cols[7];
        const location = cols[8];
        const company = cols[9];
        const notes = cols[10];

        const finalStatus = normalizeStatus(statusRaw, assigned);
        const finalType = normalizeType(typeRaw, hostname);

        const valStr = [
            escapeSql(patrimonio),
            escapeSql(model),
            escapeSql(brand),
            escapeSql(hostname),
            escapeSql(assigned),
            escapeSql(serial),
            escapeSql(finalStatus),
            escapeSql(finalType),
            escapeSql(location),
            escapeSql(company),
            escapeSql(notes)
        ].join(', ');

        const sql = `INSERT INTO tech_assets (asset_tag, model, brand, hostname, assigned_to_name, serial_number, status, device_type, location, company, notes) VALUES (${valStr}) ON CONFLICT (asset_tag) DO UPDATE SET assigned_to_name = EXCLUDED.assigned_to_name, status = EXCLUDED.status;`;
        sqlLines.push(sql);
        successCount++;
    }

    sqlLines.push("");
    sqlLines.push("COMMIT;");
    sqlLines.push(`-- Total records: ${successCount}`);

    fs.writeFileSync(OUTPUT_SQL, sqlLines.join('\n'));
    console.log(`Generated ${OUTPUT_SQL} with ${successCount} records.`);

} catch (err) {
    console.error("Error:", err);
    process.exit(1);
}
