import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateInvoiceRequest {
  packageId: string;
  packageName: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const xenditSecretKey = Deno.env.get("XENDIT_SECRET_KEY");
    if (!xenditSecretKey) {
      throw new Error("XENDIT_SECRET_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { packageId, packageName, amount, customerName, customerEmail, customerPhone }: CreateInvoiceRequest = await req.json();

    // Validate required fields
    if (!packageName || !amount || !customerName || !customerEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user ID from auth header if available
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Create order in database first
    const externalId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        package_id: packageId || null,
        package_name: packageName,
        amount: amount,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      throw new Error("Failed to create order");
    }

    // Create Xendit invoice
    const invoicePayload = {
      external_id: order.id,
      amount: amount,
      payer_email: customerEmail,
      description: `Pembayaran untuk ${packageName}`,
      invoice_duration: 86400, // 24 hours
      customer: {
        given_names: customerName,
        email: customerEmail,
        mobile_number: customerPhone || undefined,
      },
      success_redirect_url: `${req.headers.get("origin")}/payment/success?order_id=${order.id}`,
      failure_redirect_url: `${req.headers.get("origin")}/payment/failed?order_id=${order.id}`,
      currency: "IDR",
      items: [
        {
          name: packageName,
          quantity: 1,
          price: amount,
        },
      ],
    };

    const xenditResponse = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(xenditSecretKey + ":")}`,
      },
      body: JSON.stringify(invoicePayload),
    });

    if (!xenditResponse.ok) {
      const errorData = await xenditResponse.text();
      console.error("Xendit API error:", errorData);
      
      // Update order status to failed
      await supabase
        .from("orders")
        .update({ status: "failed" })
        .eq("id", order.id);

      throw new Error("Failed to create Xendit invoice");
    }

    const xenditInvoice = await xenditResponse.json();

    // Update order with Xendit invoice details
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        xendit_invoice_id: xenditInvoice.id,
        xendit_invoice_url: xenditInvoice.invoice_url,
        expired_at: xenditInvoice.expiry_date,
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Order update error:", updateError);
    }

    return new Response(
      JSON.stringify({
        orderId: order.id,
        invoiceId: xenditInvoice.id,
        invoiceUrl: xenditInvoice.invoice_url,
        expiryDate: xenditInvoice.expiry_date,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in create-xendit-invoice:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
