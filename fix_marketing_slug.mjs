import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function fixMarketingSlug() {
    const marketingId = '3b1395df-21a7-42ed-b735-665ef393dd2b'
    console.log(`Updating module_slug for Marketing (ID: ${marketingId}) to "marketing"...`)

    const { data, error } = await supabase
        .from('departments')
        .update({ module_slug: 'marketing' })
        .eq('id', marketingId)
        .select()

    if (error) {
        console.error('Error:', error.message)
    } else {
        console.log('Update successful:', JSON.stringify(data, null, 2))
    }
}

fixMarketingSlug()
