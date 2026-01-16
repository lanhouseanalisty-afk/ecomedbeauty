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
  
  // Get session cookie from response
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    const match = setCookie.match(/B1SESSION=([^;]+)/);
    if (match && match[1]) {
      sessionId = match[1];
      return sessionId;
    }
  }
  
  // Fallback to SessionId from body
  if (data.SessionId) {
    sessionId = data.SessionId;
    return data.SessionId;
  }

  throw new Error("Could not get SAP session ID");
}

// Get single item by ItemCode
async function getItem(itemCode: string): Promise<any> {
  if (!sessionId) {
    await loginToSAP();
  }

  const url = `${SAP_URL}/b1s/v1/Items('${encodeURIComponent(itemCode)}')`;
  console.log(`Fetching item: ${itemCode}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `B1SESSION=${sessionId}`,
    },
  });

  if (response.status === 401) {
    // Session expired, re-login
    await loginToSAP();
    return getItem(itemCode);
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to get item ${itemCode}:`, errorText);
    throw new Error(`Failed to get item: ${response.status}`);
  }

  return response.json();
}

// Search items with optional filters
async function searchItems(params: {
  query?: string;
  category?: string;
  skip?: number;
  top?: number;
}): Promise<any> {
  if (!sessionId) {
    await loginToSAP();
  }

  const { query, category, skip = 0, top = 50 } = params;
  
  let filter = "ItemType eq 'itItems' and SalesItem eq 'tYES' and Valid eq 'tYES'";
  
  if (query) {
    filter += ` and (contains(ItemCode, '${query}') or contains(ItemName, '${query}'))`;
  }
  
  if (category) {
    filter += ` and ItemsGroupCode eq ${category}`;
  }

  const url = `${SAP_URL}/b1s/v1/Items?$filter=${encodeURIComponent(filter)}&$skip=${skip}&$top=${top}&$select=ItemCode,ItemName,ItemsGroupCode,QuantityOnStock,DefaultSalesUoMEntry,ItemPrices,User_Text,Picture,AttachmentEntry`;
  
  console.log(`Searching items with filter: ${filter}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `B1SESSION=${sessionId}`,
    },
  });

  if (response.status === 401) {
    await loginToSAP();
    return searchItems(params);
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to search items:", errorText);
    throw new Error(`Failed to search items: ${response.status}`);
  }

  return response.json();
}

// Get item groups (categories)
async function getItemGroups(): Promise<any> {
  if (!sessionId) {
    await loginToSAP();
  }

  const url = `${SAP_URL}/b1s/v1/ItemGroups`;
  console.log("Fetching item groups...");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `B1SESSION=${sessionId}`,
    },
  });

  if (response.status === 401) {
    await loginToSAP();
    return getItemGroups();
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to get item groups:", errorText);
    throw new Error(`Failed to get item groups: ${response.status}`);
  }

  return response.json();
}

// Get item attachment (image) from SAP B1
async function getItemAttachment(itemCode: string): Promise<string | null> {
  if (!sessionId) {
    await loginToSAP();
  }

  try {
    // First check if item has attachments
    const attachUrl = `${SAP_URL}/b1s/v1/Items('${encodeURIComponent(itemCode)}')?$select=ItemCode,AttachmentEntry`;
    const attachResponse = await fetch(attachUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `B1SESSION=${sessionId}`,
      },
    });

    if (!attachResponse.ok) {
      return null;
    }

    const attachData = await attachResponse.json();
    const attachmentEntry = attachData.AttachmentEntry;

    if (!attachmentEntry) {
      return null;
    }

    // Get attachment details
    const entryUrl = `${SAP_URL}/b1s/v1/Attachments2(${attachmentEntry})`;
    const entryResponse = await fetch(entryUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `B1SESSION=${sessionId}`,
      },
    });

    if (!entryResponse.ok) {
      return null;
    }

    const entryData = await entryResponse.json();
    const attachments = entryData.Attachments2_Lines || [];

    if (attachments.length === 0) {
      return null;
    }

    // Get the first image attachment
    const imageAttachment = attachments.find((a: any) => 
      /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(a.FileName || "")
    ) || attachments[0];

    if (imageAttachment) {
      // Build download URL - the actual format may vary based on SAP B1 configuration
      const downloadUrl = `${SAP_URL}/b1s/v1/Attachments2(${attachmentEntry})/$value?filename=${encodeURIComponent(imageAttachment.FileName)}`;
      console.log(`Found attachment for ${itemCode}: ${imageAttachment.FileName}`);
      return downloadUrl;
    }

    return null;
  } catch (error) {
    console.error(`Error getting attachment for ${itemCode}:`, error);
    return null;
  }
}

// Transform SAP B1 item to our Product format
function transformItem(sapItem: any, imageUrl?: string | null): any {
  // Get default price (usually PriceList 1 is the sales price)
  const prices = sapItem.ItemPrices || [];
  const defaultPrice = prices.find((p: any) => p.PriceList === 1);
  const price = defaultPrice?.Price || 0;

  // Use provided image URL, Picture field, or fallback
  const image = imageUrl || sapItem.Picture || "/placeholder.svg";

  return {
    id: sapItem.ItemCode,
    name: sapItem.ItemName,
    description: sapItem.User_Text || sapItem.ItemName,
    price: price,
    image: image,
    category: String(sapItem.ItemsGroupCode || ""),
    inStock: (sapItem.QuantityOnStock || 0) > 0,
    stock: sapItem.QuantityOnStock || 0,
    sku: sapItem.ItemCode,
    hasAttachment: !!sapItem.AttachmentEntry,
    attachmentEntry: sapItem.AttachmentEntry || null,
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "search";

    console.log(`SAP B1 Items API - Action: ${action}`);

    let result;

    switch (action) {
      case "get": {
        const itemCode = url.searchParams.get("itemCode");
        if (!itemCode) {
          throw new Error("itemCode is required for 'get' action");
        }
        const item = await getItem(itemCode);
        const imageUrl = await getItemAttachment(itemCode);
        result = transformItem(item, imageUrl);
        break;
      }

      case "search": {
        const query = url.searchParams.get("query") || undefined;
        const category = url.searchParams.get("category") || undefined;
        const skip = parseInt(url.searchParams.get("skip") || "0");
        const top = parseInt(url.searchParams.get("top") || "50");
        const includeImages = url.searchParams.get("includeImages") === "true";

        const searchResult = await searchItems({ query, category, skip, top });
        const items = searchResult.value || [];
        
        // If includeImages is true, fetch attachments for items that have them
        let transformedItems;
        if (includeImages) {
          transformedItems = await Promise.all(
            items.map(async (item: any) => {
              if (item.AttachmentEntry) {
                const imageUrl = await getItemAttachment(item.ItemCode);
                return transformItem(item, imageUrl);
              }
              return transformItem(item);
            })
          );
        } else {
          transformedItems = items.map((item: any) => transformItem(item));
        }
        
        result = {
          items: transformedItems,
          total: searchResult["odata.count"] || items.length || 0,
        };
        break;
      }

      case "categories": {
        const groups = await getItemGroups();
        result = (groups.value || []).map((g: any) => ({
          id: String(g.Number),
          name: g.GroupName,
        }));
        break;
      }

      case "image": {
        const itemCode = url.searchParams.get("itemCode");
        if (!itemCode) {
          throw new Error("itemCode is required for 'image' action");
        }
        const imageUrl = await getItemAttachment(itemCode);
        result = { itemCode, imageUrl };
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
    console.error("SAP B1 Items API Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
