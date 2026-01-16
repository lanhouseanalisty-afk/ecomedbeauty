import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SAP B1 Service Layer credentials
const SAP_URL = Deno.env.get("SAP_B1_SERVICE_LAYER_URL");
const SAP_COMPANY = Deno.env.get("SAP_B1_COMPANY_DB");
const SAP_USER = Deno.env.get("SAP_B1_USERNAME");
const SAP_PASSWORD = Deno.env.get("SAP_B1_PASSWORD");

let sessionId: string | null = null;

// Login to SAP B1 Service Layer
async function loginToSAP(): Promise<string> {
  console.log("Logging in to SAP B1 Service Layer...");
  
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
    console.error("SAP Login failed:", errorText);
    throw new Error(`SAP Login failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log("SAP Login successful");
  
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    const match = setCookie.match(/B1SESSION=([^;]+)/);
    if (match && match[1]) {
      sessionId = match[1];
      return sessionId;
    }
  }
  
  if (data.SessionId) {
    sessionId = data.SessionId;
    return data.SessionId;
  }

  throw new Error("Could not get SAP session ID");
}

// Ensure session is valid
async function ensureSession(): Promise<void> {
  if (!sessionId) {
    await loginToSAP();
  }
}

// Create Sales Order in SAP B1
interface OrderItem {
  itemCode: string;
  quantity: number;
  price: number;
  warehouse?: string;
}

interface CreateOrderParams {
  cardCode: string; // Customer code in SAP
  items: OrderItem[];
  docDate?: string;
  docDueDate?: string;
  comments?: string;
  paymentMethod?: string;
  shippingAddress?: {
    addressName?: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  udf?: Record<string, any>; // User-defined fields
}

async function createSalesOrder(params: CreateOrderParams): Promise<any> {
  await ensureSession();

  const { cardCode, items, docDate, docDueDate, comments, shippingAddress, udf } = params;

  // Build document lines
  const documentLines = items.map((item, index) => ({
    LineNum: index,
    ItemCode: item.itemCode,
    Quantity: item.quantity,
    UnitPrice: item.price,
    WarehouseCode: item.warehouse || "01", // Default warehouse
  }));

  // Build order payload
  const orderPayload: any = {
    CardCode: cardCode,
    DocDate: docDate || new Date().toISOString().split("T")[0],
    DocDueDate: docDueDate || new Date().toISOString().split("T")[0],
    Comments: comments || "",
    DocumentLines: documentLines,
  };

  // Add shipping address if provided
  if (shippingAddress) {
    orderPayload.AddressExtension = {
      ShipToStreet: shippingAddress.street || "",
      ShipToCity: shippingAddress.city || "",
      ShipToState: shippingAddress.state || "",
      ShipToZipCode: shippingAddress.zipCode || "",
      ShipToCountry: shippingAddress.country || "BR",
    };
  }

  // Add user-defined fields if provided
  if (udf) {
    Object.keys(udf).forEach((key) => {
      orderPayload[key] = udf[key];
    });
  }

  console.log("Creating Sales Order in SAP B1:", JSON.stringify(orderPayload, null, 2));

  const url = `${SAP_URL}/b1s/v1/Orders`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `B1SESSION=${sessionId}`,
    },
    body: JSON.stringify(orderPayload),
  });

  if (response.status === 401) {
    await loginToSAP();
    return createSalesOrder(params);
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to create order:", errorText);
    throw new Error(`Failed to create order: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log("Order created successfully. DocNum:", result.DocNum, "DocEntry:", result.DocEntry);
  
  return {
    success: true,
    docNum: result.DocNum,
    docEntry: result.DocEntry,
    cardCode: result.CardCode,
    docTotal: result.DocTotal,
  };
}

// Get order status from SAP B1
async function getOrderStatus(docNum: number): Promise<any> {
  await ensureSession();

  const url = `${SAP_URL}/b1s/v1/Orders?$filter=DocNum eq ${docNum}&$select=DocNum,DocEntry,DocStatus,DocumentStatus,CardCode,DocTotal,DocumentLines`;
  console.log(`Fetching order status for DocNum: ${docNum}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `B1SESSION=${sessionId}`,
    },
  });

  if (response.status === 401) {
    await loginToSAP();
    return getOrderStatus(docNum);
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to get order status:", errorText);
    throw new Error(`Failed to get order status: ${response.status}`);
  }

  const result = await response.json();
  
  if (!result.value || result.value.length === 0) {
    throw new Error(`Order ${docNum} not found`);
  }

  const order = result.value[0];
  return {
    docNum: order.DocNum,
    docEntry: order.DocEntry,
    status: order.DocStatus,
    documentStatus: order.DocumentStatus,
    cardCode: order.CardCode,
    docTotal: order.DocTotal,
    itemCount: order.DocumentLines?.length || 0,
  };
}

// Validate stock for items before creating order
async function validateStock(items: { itemCode: string; quantity: number }[]): Promise<{
  valid: boolean;
  items: { itemCode: string; requested: number; available: number; valid: boolean }[];
}> {
  await ensureSession();

  const results = await Promise.all(
    items.map(async (item) => {
      try {
        const url = `${SAP_URL}/b1s/v1/Items('${encodeURIComponent(item.itemCode)}')?$select=ItemCode,ItemName,QuantityOnStock`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Cookie: `B1SESSION=${sessionId}`,
          },
        });

        if (!response.ok) {
          return {
            itemCode: item.itemCode,
            requested: item.quantity,
            available: 0,
            valid: false,
          };
        }

        const sapItem = await response.json();
        const available = sapItem.QuantityOnStock || 0;
        
        return {
          itemCode: item.itemCode,
          requested: item.quantity,
          available,
          valid: available >= item.quantity,
        };
      } catch (error) {
        console.error(`Error validating stock for ${item.itemCode}:`, error);
        return {
          itemCode: item.itemCode,
          requested: item.quantity,
          available: 0,
          valid: false,
        };
      }
    })
  );

  return {
    valid: results.every((r) => r.valid),
    items: results,
  };
}

// Find or create customer by email
async function findOrCreateCustomer(email: string, name?: string): Promise<string> {
  await ensureSession();

  // Try to find existing customer by email
  const searchUrl = `${SAP_URL}/b1s/v1/BusinessPartners?$filter=contains(EmailAddress,'${email}') and CardType eq 'cCustomer'&$select=CardCode,CardName,EmailAddress`;
  
  console.log(`Searching for customer with email: ${email}`);
  
  const searchResponse = await fetch(searchUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `B1SESSION=${sessionId}`,
    },
  });

  if (searchResponse.ok) {
    const searchResult = await searchResponse.json();
    if (searchResult.value && searchResult.value.length > 0) {
      console.log(`Found existing customer: ${searchResult.value[0].CardCode}`);
      return searchResult.value[0].CardCode;
    }
  }

  // Customer not found, create new one
  console.log(`Customer not found, creating new customer for: ${email}`);
  
  const newCardCode = `C${Date.now()}`.substring(0, 15); // Generate unique code
  const createUrl = `${SAP_URL}/b1s/v1/BusinessPartners`;
  
  const customerPayload = {
    CardCode: newCardCode,
    CardName: name || email.split("@")[0],
    CardType: "cCustomer",
    EmailAddress: email,
    Series: 1, // Default series for customers
  };

  const createResponse = await fetch(createUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `B1SESSION=${sessionId}`,
    },
    body: JSON.stringify(customerPayload),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    console.error("Failed to create customer:", errorText);
    // Use a default customer if creation fails
    return "C0001"; // Fallback to default customer
  }

  const newCustomer = await createResponse.json();
  console.log(`Created new customer: ${newCustomer.CardCode}`);
  return newCustomer.CardCode;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "create";

    console.log(`SAP B1 Orders API - Action: ${action}`);

    let result;

    switch (action) {
      case "create": {
        const body = await req.json();
        const { email, name, items, comments, shippingAddress, udf } = body;

        if (!items || items.length === 0) {
          throw new Error("Items are required");
        }

        // Find or create customer
        const cardCode = await findOrCreateCustomer(email, name);

        // Validate stock before creating order
        const stockValidation = await validateStock(
          items.map((i: any) => ({ itemCode: i.itemCode, quantity: i.quantity }))
        );

        if (!stockValidation.valid) {
          const outOfStock = stockValidation.items.filter((i) => !i.valid);
          return new Response(
            JSON.stringify({
              success: false,
              error: "Insufficient stock",
              outOfStockItems: outOfStock,
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }

        // Create the order
        result = await createSalesOrder({
          cardCode,
          items,
          comments,
          shippingAddress,
          udf,
        });
        break;
      }

      case "status": {
        const docNum = parseInt(url.searchParams.get("docNum") || "0");
        if (!docNum) {
          throw new Error("docNum is required for 'status' action");
        }
        result = await getOrderStatus(docNum);
        break;
      }

      case "validate-stock": {
        const body = await req.json();
        const { items } = body;

        if (!items || items.length === 0) {
          throw new Error("Items are required");
        }

        result = await validateStock(items);
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("SAP B1 Orders API Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
