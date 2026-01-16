import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SAP B1 Service Layer credentials
const SAP_URL = Deno.env.get("SAP_B1_SERVICE_LAYER_URL");
const SAP_COMPANY = Deno.env.get("SAP_B1_COMPANY_DB");
const SAP_USER = Deno.env.get("SAP_B1_USERNAME");
const SAP_PASSWORD = Deno.env.get("SAP_B1_PASSWORD");

let sapSessionId: string | null = null;

// Login to SAP B1 Service Layer
async function loginToSAP(): Promise<string> {
  console.log("[stripe-webhook] Logging in to SAP B1 Service Layer...");
  
  const loginUrl = `${SAP_URL}/b1s/v1/Login`;
  const loginBody = {
    CompanyDB: SAP_COMPANY,
    UserName: SAP_USER,
    Password: SAP_PASSWORD,
  };

  const response = await fetch(loginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[stripe-webhook] SAP Login failed:", errorText);
    throw new Error(`SAP Login failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log("[stripe-webhook] SAP Login successful");
  
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    const match = setCookie.match(/B1SESSION=([^;]+)/);
    if (match && match[1]) {
      sapSessionId = match[1];
      return sapSessionId;
    }
  }
  
  if (data.SessionId) {
    sapSessionId = data.SessionId;
    return data.SessionId;
  }

  throw new Error("Could not get SAP session ID");
}

// Find or create customer in SAP B1
async function findOrCreateSAPCustomer(email: string, name?: string): Promise<string> {
  if (!sapSessionId) {
    await loginToSAP();
  }

  // Try to find existing customer by email
  const searchUrl = `${SAP_URL}/b1s/v1/BusinessPartners?$filter=contains(EmailAddress,'${email}') and CardType eq 'cCustomer'&$select=CardCode,CardName,EmailAddress`;
  
  console.log(`[stripe-webhook] Searching for customer with email: ${email}`);
  
  const searchResponse = await fetch(searchUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `B1SESSION=${sapSessionId}`,
    },
  });

  if (searchResponse.status === 401) {
    await loginToSAP();
    return findOrCreateSAPCustomer(email, name);
  }

  if (searchResponse.ok) {
    const searchResult = await searchResponse.json();
    if (searchResult.value && searchResult.value.length > 0) {
      console.log(`[stripe-webhook] Found existing customer: ${searchResult.value[0].CardCode}`);
      return searchResult.value[0].CardCode;
    }
  }

  // Customer not found, create new one
  console.log(`[stripe-webhook] Customer not found, creating new customer for: ${email}`);
  
  const newCardCode = `C${Date.now()}`.substring(0, 15);
  const createUrl = `${SAP_URL}/b1s/v1/BusinessPartners`;
  
  const customerPayload = {
    CardCode: newCardCode,
    CardName: name || email.split("@")[0],
    CardType: "cCustomer",
    EmailAddress: email,
    Series: 1,
  };

  const createResponse = await fetch(createUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `B1SESSION=${sapSessionId}`,
    },
    body: JSON.stringify(customerPayload),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    console.error("[stripe-webhook] Failed to create customer:", errorText);
    return "C0001"; // Fallback to default customer
  }

  const newCustomer = await createResponse.json();
  console.log(`[stripe-webhook] Created new customer: ${newCustomer.CardCode}`);
  return newCustomer.CardCode;
}

// Create Sales Order in SAP B1
async function createSAPOrder(
  cardCode: string,
  items: Array<{ itemCode: string; quantity: number; price: number }>,
  comments: string,
  shippingAddress?: any
): Promise<{ docNum: number; docEntry: number }> {
  if (!sapSessionId) {
    await loginToSAP();
  }

  const documentLines = items.map((item, index) => ({
    LineNum: index,
    ItemCode: item.itemCode,
    Quantity: item.quantity,
    UnitPrice: item.price,
    WarehouseCode: "01",
  }));

  const orderPayload: any = {
    CardCode: cardCode,
    DocDate: new Date().toISOString().split("T")[0],
    DocDueDate: new Date().toISOString().split("T")[0],
    Comments: comments,
    DocumentLines: documentLines,
  };

  if (shippingAddress) {
    orderPayload.AddressExtension = {
      ShipToStreet: shippingAddress.street || "",
      ShipToCity: shippingAddress.city || "",
      ShipToState: shippingAddress.state || "",
      ShipToZipCode: shippingAddress.zip_code || "",
      ShipToCountry: shippingAddress.country || "BR",
    };
  }

  console.log("[stripe-webhook] Creating Sales Order in SAP B1:", JSON.stringify(orderPayload, null, 2));

  const url = `${SAP_URL}/b1s/v1/Orders`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `B1SESSION=${sapSessionId}`,
    },
    body: JSON.stringify(orderPayload),
  });

  if (response.status === 401) {
    await loginToSAP();
    return createSAPOrder(cardCode, items, comments, shippingAddress);
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[stripe-webhook] Failed to create order:", errorText);
    throw new Error(`Failed to create SAP order: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log("[stripe-webhook] Order created successfully. DocNum:", result.DocNum, "DocEntry:", result.DocEntry);
  
  return {
    docNum: result.DocNum,
    docEntry: result.DocEntry,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature || !webhookSecret) {
      console.error("[stripe-webhook] Missing signature or webhook secret");
      return new Response(JSON.stringify({ error: "Missing signature or webhook secret" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("[stripe-webhook] Webhook signature verification failed:", err);
      return new Response(JSON.stringify({ error: "Webhook signature verification failed" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`[stripe-webhook] Received event: ${event.type}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log("[stripe-webhook] Processing checkout.session.completed:", {
        sessionId: session.id,
        paymentStatus: session.payment_status,
        customerEmail: session.customer_details?.email,
        orderId: session.metadata?.order_id,
      });

      if (session.payment_status === "paid") {
        const orderId = session.metadata?.order_id;
        const customerEmail = session.customer_details?.email;
        const customerName = session.customer_details?.name;
        const shippingAddress = session.shipping_details?.address;

        if (orderId) {
          // Update local order status
          const { data: order, error: orderError } = await supabaseClient
            .from("orders")
            .update({
              payment_status: "paid",
              status: "processing",
              payment_intent_id: session.payment_intent as string,
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId)
            .select()
            .single();

          if (orderError) {
            console.error("[stripe-webhook] Failed to update order:", orderError);
          } else {
            console.log("[stripe-webhook] Order updated:", orderId);

            // Create order in SAP B1
            try {
              if (customerEmail && order.items) {
                const cardCode = await findOrCreateSAPCustomer(customerEmail, customerName || undefined);
                
                // Transform items to SAP format
                const items = order.items as any[];
                const sapItems = items.map((item: any) => ({
                  itemCode: item.sku || item.id,
                  quantity: item.quantity,
                  price: item.price,
                }));

                const sapShippingAddress = shippingAddress ? {
                  street: `${shippingAddress.line1}${shippingAddress.line2 ? ` ${shippingAddress.line2}` : ""}`,
                  city: shippingAddress.city,
                  state: shippingAddress.state,
                  zip_code: shippingAddress.postal_code,
                  country: shippingAddress.country,
                } : undefined;

                const sapOrder = await createSAPOrder(
                  cardCode,
                  sapItems,
                  `Pedido eCommerce #${orderId.slice(0, 8)} - Stripe Session: ${session.id}`,
                  sapShippingAddress
                );

                // Update order with SAP reference
                await supabaseClient
                  .from("orders")
                  .update({
                    tracking_code: `SAP-${sapOrder.docNum}`,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", orderId);

                console.log("[stripe-webhook] SAP order created:", sapOrder);
              }
            } catch (sapError) {
              console.error("[stripe-webhook] Failed to create SAP order:", sapError);
              // Don't fail the webhook - order is still paid
            }
          }
        }
      }
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log("[stripe-webhook] Payment succeeded:", paymentIntent.id);
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log("[stripe-webhook] Payment failed:", paymentIntent.id, paymentIntent.last_payment_error?.message);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[stripe-webhook] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
