import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderEmailRequest {
  email: string;
  customerName: string;
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-order-email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured");
    return new Response(
      JSON.stringify({ success: false, error: "Email service not configured" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const {
      email,
      customerName,
      orderId,
      items,
      subtotal,
      shipping,
      discount,
      total,
    }: OrderEmailRequest = await req.json();

    console.log("Processing order email for:", email, "Order ID:", orderId);

    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.price)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
        </tr>
      `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmação de Pedido - MedBeauty</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #b87333 0%, #8b5a2b 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">MedBeauty</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Estética Médica Premium</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin: 0 0 20px 0;">Pedido Confirmado! 🎉</h2>
          
          <p style="color: #4b5563; margin-bottom: 20px;">
            Olá <strong>${customerName || "Cliente"}</strong>,<br><br>
            Obrigado por sua compra! Seu pedido foi recebido e está sendo processado.
          </p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Número do Pedido</p>
            <p style="margin: 5px 0 0 0; color: #1f2937; font-weight: 600; font-size: 16px;">#${orderId.slice(0, 8).toUpperCase()}</p>
          </div>
          
          <h3 style="color: #1f2937; margin: 25px 0 15px 0; font-size: 18px;">Itens do Pedido</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-weight: 600;">Produto</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-weight: 600;">Qtd</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-weight: 600;">Preço</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-weight: 600;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Subtotal:</span>
              <span style="color: #1f2937;">${formatCurrency(subtotal)}</span>
            </div>
            ${discount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #059669;">Desconto:</span>
              <span style="color: #059669;">-${formatCurrency(discount)}</span>
            </div>
            ` : ""}
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span style="color: #6b7280;">Frete:</span>
              <span style="color: #1f2937;">${shipping === 0 ? "Grátis" : formatCurrency(shipping)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 12px; border-top: 2px solid #e5e7eb;">
              <span style="color: #1f2937; font-weight: 700; font-size: 18px;">Total:</span>
              <span style="color: #b87333; font-weight: 700; font-size: 18px;">${formatCurrency(total)}</span>
            </div>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h4 style="margin: 0 0 10px 0; color: #92400e;">Próximos Passos</h4>
            <ul style="margin: 0; padding-left: 20px; color: #78350f;">
              <li>Seu pedido será preparado em até 2 dias úteis</li>
              <li>Você receberá o código de rastreamento por e-mail</li>
              <li>Entrega estimada: 5-10 dias úteis</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; margin-top: 30px; font-size: 14px; text-align: center;">
            Dúvidas? Entre em contato conosco pelo<br>
            <a href="mailto:contato@medbeauty.com.br" style="color: #b87333;">contato@medbeauty.com.br</a>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">© 2024 MedBeauty. Todos os direitos reservados.</p>
          <p style="margin: 10px 0 0 0;">São Paulo, SP - Brasil</p>
        </div>
      </body>
      </html>
    `;

    // Send email using Resend API directly
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "MedBeauty <onboarding@resend.dev>",
        to: [email],
        subject: `Pedido Confirmado #${orderId.slice(0, 8).toUpperCase()} - MedBeauty`,
        html: emailHtml,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
