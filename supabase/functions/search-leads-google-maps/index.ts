import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, location } = await req.json()

    if (!query && !location) {
      return new Response(
        JSON.stringify({ error: 'Query ou location são obrigatórios' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // Google Places API configuration
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')

    if (!GOOGLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API Key do Google não configurada' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    // Build search query
    const searchQuery = `${query} ${location}`.trim()

    // Call Google Places API (Text Search)
    const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_API_KEY}&language=pt-BR`

    const placesResponse = await fetch(placesUrl)
    const placesData = await placesResponse.json()

    if (placesData.status !== 'OK' && placesData.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${placesData.status}`)
    }

    // Format results
    const leads = await Promise.all(
      (placesData.results || []).slice(0, 20).map(async (place: any) => {
        // Get place details for phone number
        let phone = null
        let website = null

        if (place.place_id) {
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,website&key=${GOOGLE_API_KEY}`
          const detailsResponse = await fetch(detailsUrl)
          const detailsData = await detailsResponse.json()

          if (detailsData.status === 'OK') {
            phone = detailsData.result?.formatted_phone_number
            website = detailsData.result?.website
          }
        }

        return {
          place_id: place.place_id,
          name: place.name,
          address: place.formatted_address,
          rating: place.rating,
          phone: phone,
          website: website,
          location: place.geometry?.location,
        }
      })
    )

    return new Response(
      JSON.stringify({ leads }),
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
