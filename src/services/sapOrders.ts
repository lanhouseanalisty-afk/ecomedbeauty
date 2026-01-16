import { supabase } from "@/integrations/supabase/client";

interface OrderItem {
  itemCode: string;
  quantity: number;
  price: number;
  warehouse?: string;
}

interface CreateSapOrderParams {
  email: string;
  name?: string;
  items: OrderItem[];
  comments?: string;
  shippingAddress?: {
    addressName?: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  udf?: Record<string, any>;
}

interface SapOrderResponse {
  success: boolean;
  docNum?: number;
  docEntry?: number;
  cardCode?: string;
  docTotal?: number;
  error?: string;
  outOfStockItems?: { itemCode: string; requested: number; available: number }[];
}

interface StockValidationResult {
  valid: boolean;
  items: {
    itemCode: string;
    requested: number;
    available: number;
    valid: boolean;
  }[];
}

interface OrderStatusResult {
  docNum: number;
  docEntry: number;
  status: string;
  documentStatus: string;
  cardCode: string;
  docTotal: number;
  itemCount: number;
}

const SAP_ORDERS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sap-b1-orders`;

// Create a sales order in SAP B1
export async function createSapOrder(params: CreateSapOrderParams): Promise<SapOrderResponse> {
  const response = await fetch(`${SAP_ORDERS_URL}?action=create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: data.error || "Failed to create order in SAP",
      outOfStockItems: data.outOfStockItems,
    };
  }

  return data;
}

// Validate stock availability in SAP B1
export async function validateSapStock(
  items: { itemCode: string; quantity: number }[]
): Promise<StockValidationResult> {
  const response = await fetch(`${SAP_ORDERS_URL}?action=validate-stock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to validate stock");
  }

  return response.json();
}

// Get order status from SAP B1
export async function getSapOrderStatus(docNum: number): Promise<OrderStatusResult> {
  const response = await fetch(`${SAP_ORDERS_URL}?action=status&docNum=${docNum}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to get order status");
  }

  return response.json();
}

// Check if single item has enough stock
export async function checkItemStock(
  itemCode: string,
  quantity: number
): Promise<{ available: boolean; stock: number }> {
  try {
    const result = await validateSapStock([{ itemCode, quantity }]);
    const item = result.items[0];
    return {
      available: item?.valid ?? false,
      stock: item?.available ?? 0,
    };
  } catch (error) {
    console.warn("Failed to check stock, assuming available:", error);
    return { available: true, stock: 999 };
  }
}
