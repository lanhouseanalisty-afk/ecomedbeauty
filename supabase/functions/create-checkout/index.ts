import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    console.log("[create-checkout] request received", { method: req.method });

    const { items, orderId, email: guestEmail } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("No items provided");
    }

    // Get user if authenticated (optional)
    let userEmail = guestEmail;
    const authHeader = req.headers.get("Authorization");

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data, error } = await supabaseClient.auth.getUser(token);
      if (error) {
        console.log("[create-checkout] auth token invalid, continuing as guest", { message: error.message });
      } else if (data.user?.email) {
        userEmail = data.user.email;
      }
    }

    if (!userEmail) {
      throw new Error("Email is required");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create line items for Stripe
    const origin = req.headers.get("origin") ?? "";

    const toAbsoluteImageUrl = (value: unknown) => {
      if (!value || typeof value !== "string" || !origin) return undefined;
      try {
        const url = new URL(value, origin);
        // Stripe requires absolute URLs for product images
        if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
        return url.toString();
      } catch {
        return undefined;
      }
    };

    const lineItems = items.map((item: any) => {
      const imageUrl = toAbsoluteImageUrl(item.image);
      return {
        price_data: {
          currency: "brl",
          product_data: {
            name: item.name,
            images: imageUrl ? [imageUrl] : undefined,
          },
          unit_amount: Math.round(item.price * 100), // Convert to centavos
        },
        quantity: item.quantity,
      };
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/carrinho`,
      metadata: {
        order_id: orderId || "",
      },
      shipping_address_collection: {
        allowed_countries: ["BR"],
      },
      phone_number_collection: {
        enabled: true,
      },
    });

    console.log("Checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Create checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
