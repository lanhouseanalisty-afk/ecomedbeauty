async function triggerFix() {
    const url = 'https://hxdfbwptgtthaqddneyr.supabase.co/functions/v1/update-user-password'

    const payload = {
        email: 'celina.ribeiro@medbeauty.com.br',
        employeeName: 'Celina Ribeiro',
        role: 'admin', // Or 'admin' if that was the intent
        employeeCode: 'CEL-001',
        cpf: '123.456.789-00'
    }

    console.log('Triggering fix for Celina via Edge Function...')

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-diagnostic-secret': 'medbeauty-debug-2026'
        },
        body: JSON.stringify(payload)
    })

    const result = await response.json()
    console.log('Result:', result)
}

triggerFix()
