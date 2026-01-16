import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, location, radius = 5000, type } = await req.json();
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');

    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY not configured');
      throw new Error('Google Maps API key not configured');
    }

    console.log('Searching Google Maps for:', { query, location, radius, type });

    // Build the search URL
    let searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?key=${apiKey}`;
    
    if (query) {
      searchUrl += `&query=${encodeURIComponent(query)}`;
    }
    
    if (location) {
      searchUrl += `&location=${encodeURIComponent(location)}&radius=${radius}`;
    }

    if (type) {
      searchUrl += `&type=${encodeURIComponent(type)}`;
    }

    console.log('Fetching from Google Places API...');
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Maps API error:', data.status, data.error_message);
      throw new Error(`Google Maps API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    // Transform results to lead format
    const leads = await Promise.all(
      (data.results || []).slice(0, 20).map(async (place: any) => {
        // Get place details for phone and website
        let phone = null;
        let website = null;

        try {
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?key=${apiKey}&place_id=${place.place_id}&fields=formatted_phone_number,website,opening_hours`;
          const detailsResponse = await fetch(detailsUrl);
          const detailsData = await detailsResponse.json();
          
          if (detailsData.result) {
            phone = detailsData.result.formatted_phone_number;
            website = detailsData.result.website;
          }
        } catch (detailError) {
          console.error('Error fetching place details:', detailError);
        }

        return {
          name: place.name,
          address: place.formatted_address,
          phone,
          website,
          rating: place.rating,
          user_ratings_total: place.user_ratings_total,
          types: place.types,
          place_id: place.place_id,
          location: place.geometry?.location,
        };
      })
    );

    console.log(`Found ${leads.length} leads from Google Maps`);

    return new Response(JSON.stringify({ leads, total: leads.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in search-leads-google-maps function:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
