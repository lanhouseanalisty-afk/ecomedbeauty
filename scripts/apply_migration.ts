import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbUrl = process.env.VITE_DATABASE_URL || process.env.DATABASE_URL;

if (!dbUrl) {
    console.error('Missing DATABASE_URL or VITE_DATABASE_URL');
    process.exit(1);
}

const pool = new pg.Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false } // Required for Supabase usually
});

async function applyMigration() {
    const migrationPath = path.resolve(__dirname, '../supabase/migrations/20260217014500_fix_revisions_fk.sql');
    console.log(`Reading migration from: ${migrationPath}`);

    try {
        const sql = fs.readFileSync(migrationPath, 'utf8');
        console.log('Executing SQL...');

        await pool.query(sql);
        console.log('Migration applied successfully!');
    } catch (error) {
        console.error('Error applying migration:', error);
    } finally {
        await pool.end();
    }
}

applyMigration();
