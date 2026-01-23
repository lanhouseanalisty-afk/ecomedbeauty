import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { keywords, company, location, title } = await req.json()

    if (!keywords && !company && !location && !title) {
      return new Response(
        JSON.stringify({ error: 'Pelo menos um campo de busca é obrigatório' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // LinkedIn API configuration
    const LINKEDIN_ACCESS_TOKEN = Deno.env.get('LINKEDIN_ACCESS_TOKEN')

    if (!LINKEDIN_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({
          error: 'LinkedIn API não configurada',
          message: 'Para usar a busca do LinkedIn, configure o LINKEDIN_ACCESS_TOKEN nas variáveis de ambiente do Supabase.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    // Note: LinkedIn API requires OAuth 2.0 and has specific permissions
    // This is a simplified implementation
    const leads: any[] = []

    // LinkedIn People Search API
    const searchUrl = `https://api.linkedin.com/v2/people`

    try {
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        }
      })

      const searchData = await searchResponse.json()

      if (searchData.elements) {
        searchData.elements.forEach((person: any) => {
          leads.push({
            first_name: person.firstName?.localized?.pt_BR || person.firstName?.localized?.en_US,
            last_name: person.lastName?.localized?.pt_BR || person.lastName?.localized?.en_US,
            headline: person.headline?.localized?.pt_BR || person.headline?.localized?.en_US,
            company: company,
          })
        })
      }
    } catch (error) {
      console.error('LinkedIn API error:', error)
    }

    return new Response(
      JSON.stringify({
        leads,
        message: leads.length === 0
          ? 'Nenhum resultado encontrado. A busca no LinkedIn requer configuração adicional da API e permissões OAuth.'
          : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
