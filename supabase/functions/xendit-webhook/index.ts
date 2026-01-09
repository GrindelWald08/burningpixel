import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-callback-token",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    console.log("Xendit webhook received:", JSON.stringify(payload));

    const { 
      id: invoiceId,
      external_id: orderId,
      status,
      payment_method,
      paid_at,
    } = payload;

    if (!orderId) {
      console.error("Missing order ID in webhook payload");
      return new Response(
        JSON.stringify({ error: "Missing order ID" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Map Xendit status to our status
    let orderStatus: string;
    switch (status) {
      case "PAID":
      case "SETTLED":
        orderStatus = "paid";
        break;
      case "EXPIRED":
        orderStatus = "expired";
        break;
      case "PENDING":
        orderStatus = "pending";
        break;
      default:
        orderStatus = status.toLowerCase();
    }

    // Update order in database
    const updateData: Record<string, any> = {
      status: orderStatus,
      payment_method: payment_method || null,
    };

    if (paid_at) {
      updateData.paid_at = paid_at;
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    if (updateError) {
      console.error("Order update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update order" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Order ${orderId} updated to status: ${orderStatus}`);

    // Log activity for paid orders
    if (orderStatus === "paid") {
      const { data: order } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (order) {
        await supabase.from("activity_logs").insert({
          action: "payment_received",
          description: `Payment received for ${order.package_name}`,
          user_email: order.customer_email,
          metadata: {
            order_id: orderId,
            amount: order.amount,
            payment_method: payment_method,
          },
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in xendit-webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
