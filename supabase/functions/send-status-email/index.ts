import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusEmailRequest {
  email: string;
  orderId: string;
  customerName: string;
  status: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  trackingCode?: string;
  trackingUrl?: string;
  carrier?: string;
}

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  processing: "Em Processamento",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const statusMessages: Record<string, string> = {
  pending: "Seu pedido foi recebido e está aguardando processamento.",
  processing: "Seu pedido está sendo preparado para envio.",
  shipped: "Seu pedido foi enviado e está a caminho!",
  delivered: "Seu pedido foi entregue com sucesso!",
  cancelled: "Seu pedido foi cancelado.",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-status-email function called");

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
    const { email, orderId, customerName, status, items, total, trackingCode, trackingUrl, carrier }: StatusEmailRequest = await req.json();

    console.log("Processing status email for:", email, "Order ID:", orderId, "Status:", status);

    const statusLabel = statusLabels[status] || status;
    const statusMessage = statusMessages[status] || "O status do seu pedido foi atualizado.";

    const statusColor = status === 'delivered' ? '#10b981' : status === 'shipped' ? '#8b5cf6' : status === 'cancelled' ? '#ef4444' : '#f59e0b';

    // Tracking section HTML
    const trackingHtml = trackingCode ? `
      <tr>
        <td style="padding: 20px 40px;">
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px;">
            <p style="color: #0369a1; font-weight: 600; margin: 0 0 10px; font-size: 14px;">📦 Informações de Rastreio</p>
            ${carrier ? `<p style="color: #333; font-size: 14px; margin: 0 0 5px;"><strong>Transportadora:</strong> ${carrier}</p>` : ''}
            <p style="color: #333; font-size: 14px; margin: 0 0 10px;"><strong>Código:</strong> ${trackingCode}</p>
            ${trackingUrl ? `<a href="${trackingUrl}" style="display: inline-block; background: #0369a1; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px;">Rastrear Pedido</a>` : ''}
          </div>
        </td>
      </tr>
    ` : '';

    const itemsHtml = items
      .map(
        (item) =>
          `<tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">R$ ${(item.price * item.quantity).toFixed(2)}</td>
          </tr>`
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #c5a47e 0%, #d4b896 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">MedBeauty</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Atualização do Pedido</p>
                  </td>
                </tr>
                
                <!-- Status Badge -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <span style="background: ${statusColor}; color: white; display: inline-block; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                      ${statusLabel}
                    </span>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 30px 40px;">
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      Olá${customerName ? `, ${customerName}` : ''}!
                    </p>
                    <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      ${statusMessage}
                    </p>
                    <p style="color: #999; font-size: 14px; margin: 0;">
                      <strong>Pedido:</strong> #${orderId.slice(0, 8).toUpperCase()}
                    </p>
                  </td>
                </tr>
                
                <!-- Tracking Info -->
                ${trackingHtml}

                <!-- Items -->
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <thead>
                        <tr style="background: #f8f8f8;">
                          <th style="padding: 12px; text-align: left; font-size: 14px; color: #666;">Produto</th>
                          <th style="padding: 12px; text-align: center; font-size: 14px; color: #666;">Qtd</th>
                          <th style="padding: 12px; text-align: right; font-size: 14px; color: #666;">Preço</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colspan="2" style="padding: 16px 12px; font-weight: 600; font-size: 16px;">Total</td>
                          <td style="padding: 16px 12px; text-align: right; font-weight: 600; font-size: 16px; color: #c5a47e;">R$ ${total.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background: #f8f8f8; padding: 30px 40px; text-align: center;">
                    <p style="color: #999; font-size: 14px; margin: 0;">
                      Em caso de dúvidas, entre em contato conosco.
                    </p>
                    <p style="color: #c5a47e; font-size: 14px; margin: 10px 0 0;">
                      MedBeauty - Beleza e Saúde
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "MedBeauty <onboarding@resend.dev>",
        to: [email],
        subject: `Pedido #${orderId.slice(0, 8).toUpperCase()} - ${statusLabel}`,
        html: emailHtml,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Status email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-status-email function:", error);
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
