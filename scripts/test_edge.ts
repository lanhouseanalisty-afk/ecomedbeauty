import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function runTest() {
    const edgeUrl = `${process.env.VITE_SUPABASE_URL}/functions/v1/update-user-password`;
    console.log("Calling", edgeUrl);

    const body = {
        email: 'reginaldo.mazaro@ext.medbeauty.com.br',
        employeeName: 'Reginaldo Mazaro',
        newPassword: 'MedBeauty@123',
        employeeId: '66fcc73d-67bc-4650-a2ca-c5aa8d45e85a',
        role: 'admin'
    };

    try {
        const res = await fetch(edgeUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
                'x-diagnostic-secret': 'medbeauty-debug-2026'
            },
            body: JSON.stringify(body)
        });

        const status = res.status;
        const text = await res.text();
        fs.writeFileSync('edge_test_result.json', JSON.stringify({ status, text }, null, 2));
        console.log(`Status: ${status} - Response written to edge_test_result.json`);
    } catch (e: any) {
        console.error("Fetch failed:", e.message);
    }
}

runTest();
