// Supabase Edge Function para buscar leads no Google Maps
// Deploy: supabase functions deploy search-leads-google-maps

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface GoogleMapsPlace {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query, location } = await req.json();

    if (!query && !location) {
      return new Response(
        JSON.stringify({ error: "Query ou location são obrigatórios" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Get Google Maps API key from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch API key from system_settings table
    const { data: settingData, error: settingError } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "google_maps_api_key")
      .single();

    if (settingError || !settingData?.value) {
      console.error("Google Maps API key not found in database:", settingError);
      return new Response(
        JSON.stringify({
          error: "Chave da API do Google Maps não configurada. Acesse Configurações do Sistema para configurar."
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const apiKey = settingData.value;
    const searchQuery = `${query} ${location}`.trim();

    // Google Places API (New) - Text Search
    // Doc: https://developers.google.com/maps/documentation/places/web-service/text-search
    const url = "https://places.googleapis.com/v1/places:searchText";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        // FieldMask reduz o custo e latência, retornando apenas o necessário
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount"
      },
      body: JSON.stringify({
        textQuery: searchQuery
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Google Maps API error:", data);
      return new Response(
        JSON.stringify({
          error: `Erro na API do Google Maps: ${data.error?.message || response.statusText}`,
          details: data.error?.details || JSON.stringify(data)
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const places = data.places || [];

    const leads = places.map((place: any) => ({
      place_id: place.id,
      name: place.displayName?.text,
      address: place.formattedAddress,
      phone: place.nationalPhoneNumber,
      website: place.websiteUri,
      rating: place.rating,
      total_ratings: place.userRatingCount,
    }));

    return new Response(
      JSON.stringify({
        leads: leads,
        total: leads.length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in search-leads-google-maps:", error);
    return new Response(
      JSON.stringify({
        error: "Erro na Edge Function",
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
