import fs from 'fs';

const content = fs.readFileSync('c:/Users/reginaldo.mazaro/OneDrive - Skinstore S.A/Documentos/GitHub/ecomedbeauty-main/src/integrations/supabase/types.ts', 'utf8');

// Simple regex to find table names: "table_name: {" inside Tables: {
const tablesMatch = content.match(/Tables: \{([\s\S]+?)\n      \}/);
if (tablesMatch) {
    const tablesBlock = tablesMatch[1];
    const tableNames = [...tablesBlock.matchAll(/^\s{6}(\w+): \{/gm)].map(m => m[1]);
    fs.writeFileSync('all_tables.txt', tableNames.join('\n'));
} else {
    fs.writeFileSync('all_tables.txt', "Tables block not found");
}
